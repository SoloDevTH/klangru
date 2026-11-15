#!/bin/bash
# เครื่องมือจัดชุดงานเขียนหัวข้อ: npm run batch -- <คำสั่ง>
#   status                     ดูสถานะ ไม่เปลี่ยนอะไร
#   next <วิชา> [จำนวน]         จองชุดถัดไป (บันทึกใน docs/batches/state.json)
#   ids <ชุด>                   พิมพ์รหัสหัวข้อของชุด
#   release <ชุด>               ปลดชุดโดยไม่รวมเข้าคลัง
#   integrate <ชุด> "<ข้อความ>"  รวมไฟล์จับคู่ ลบแถวจากแผน ตรวจใน worktree สะอาด commit push แล้วปลดชุด
set -euo pipefail
R="$(cd "$(dirname "$0")/../.." && pwd)"; D="$R/tools/batch"; cd "$R"
cmd="${1:-status}"; shift || true
case "$cmd" in
  status|next|ids|release) python3 "$D/sched.py" "$R" "$cmd" "$@" ;;
  integrate)
    B="$1"; MSG="${2:-ชุด $B: เขียนหัวข้อใหม่ตามแผน พร้อมจับคู่หลักสูตร}"
    IDS=$(python3 "$D/sched.py" "$R" ids "$B")
    [ -n "$(git diff --cached --name-only)" ] && { echo "index ไม่ว่าง ยกเลิก"; exit 1; }
    node "$D/graduate.mjs" "$R" --ids="$IDS" --write
    # หาไฟล์ของชุดจากรหัสหัวข้อ (โฟลเดอร์อาจไม่ตรงกับส่วนท้ายของรหัส)
    mapfile -t PATHS < <(python3 - "$IDS" "$B" <<'PY'
import sys, glob, os, yaml
ids = set(sys.argv[1].split(",")); b = sys.argv[2]; found = set()
for p in glob.glob("content/*/*/topic.yaml"):
    i = yaml.safe_load(open(p))["id"]
    if i in ids: print(os.path.dirname(p)); found.add(i)
for i in sorted(ids):
    m = f"docs/phase8/mappings/{i}.yaml"
    if os.path.exists(m): print(m)
for n in glob.glob(f"docs/phase8/notes-*{b}.md") + glob.glob(f"docs/batches/{b}.*"): print(n)
print("docs/batches/state.json")
missing = ids - found
if missing: sys.exit("ยังไม่มีหัวข้อ: " + ", ".join(sorted(missing)))
PY
)
    mapfile -t CH < <(git diff --name-only -- curriculum/mappings docs/phase6)
    python3 "$D/sched.py" "$R" release "$B" >/dev/null
    git add -- "${PATHS[@]}" "${CH[@]}"
    W=$(mktemp -d); git archive "$(git write-tree)" | tar -x -C "$W"
    ln -s "$R/node_modules" "$W/node_modules"
    for d in packages/content-tools packages/schema apps/web; do [ -d "$R/$d/node_modules" ] && ln -s "$R/$d/node_modules" "$W/$d/node_modules"; done
    OUT=$(cd "$W" && npx tsx packages/content-tools/src/cli.ts validate --strict 2>&1) || true
    rm -rf "$W"
    BAD=$(echo "$OUT" | grep -E "^(✗ ERROR|! WARN) " | head -5 || true)
    if [ -n "$BAD" ]; then echo "ตรวจไม่ผ่าน ไม่ commit:"; echo "$BAD"; git reset -q; exit 1; fi
    git commit -q -m "$MSG [skip ci]" && git log --oneline -1
    for i in 1 2 3 4; do git push -q origin HEAD && { echo pushed; break; }; sleep $((i*5)); done
    echo "$OUT" | grep -E "พบ|วิชา" | head -2 ;;
  *) sed -n 2,8p "$0" ;;
esac
