#!/bin/bash
# เครื่องมือจัดชุดงานเขียนหัวข้อ: npm run batch -- <คำสั่ง>
#   status                     ดูสถานะ ไม่เปลี่ยนอะไร
#   next <วิชา> [จำนวน]         จองชุดถัดไป (บันทึกใน docs/batches/state.json)
#   ids <ชุด>                   พิมพ์รหัสหัวข้อของชุด
#   release <ชุด>               ปลดชุดโดยไม่รวมเข้าคลัง
#   park <ชุด>                  ย้ายไฟล์ที่ยังไม่ผ่านตรวจของชุดไปไว้ branch batch/<ชุด> (commit WIP + push) แล้วลบออกจากโฟลเดอร์งานหลัก
#   work <ชุด>                  สร้าง worktree ที่ ../klangru-work/<ชุด> บน branch ของชุด ให้ผู้เขียนทำงานที่นั่น (ใช้ node_modules ร่วม)
#   integrate <ชุด> "<ข้อความ>"  รวมไฟล์จับคู่ ลบแถวจากแผน ตรวจใน worktree สะอาด commit push แล้วปลดชุด
set -euo pipefail
R="$(cd "$(dirname "$0")/../.." && pwd)"; D="$R/tools/batch"; cd "$R"
cmd="${1:-status}"; shift || true
case "$cmd" in
  status|next|ids|release) python3 "$D/sched.py" "$R" "$cmd" "$@" ;;
  park)
    B="$1"; IDS=$(python3 "$D/sched.py" "$R" ids "$B")
    [ -n "$(git diff --cached --name-only)" ] && { echo "index ไม่ว่าง ยกเลิก"; exit 1; }
    mapfile -t PATHS < <(python3 "$D/paths.py" "$R" "$IDS" "$B")
    [ ${#PATHS[@]} -eq 0 ] && { echo "ไม่มีไฟล์ของชุด $B"; exit 0; }
    CUR=$(git rev-parse --abbrev-ref HEAD)
    git checkout -q -B "batch/$B" && git add -- "${PATHS[@]}" && git commit -q -m "WIP ชุด $B (ยังไม่ผ่านการตรวจ) [skip ci]" && git push -q -f origin "batch/$B"
    git checkout -q "$CUR" && git rm -rq --cached --ignore-unmatch -- "${PATHS[@]}" 2>/dev/null || true
    rm -rf -- "${PATHS[@]}"; echo "parked ${#PATHS[@]} paths → batch/$B" ;;
  work)
    B="$1"; W="$(dirname "$R")/klangru-work/$B"; mkdir -p "$(dirname "$W")"
    git show-ref -q "refs/heads/batch/$B" || git branch "batch/$B" HEAD
    [ -d "$W" ] || git worktree add -q "$W" "batch/$B"
    [ -e "$W/node_modules" ] || ln -s "$R/node_modules" "$W/node_modules"
    for d in packages/content-tools packages/schema apps/web; do [ -d "$R/$d/node_modules" ] && [ ! -e "$W/$d/node_modules" ] && ln -s "$R/$d/node_modules" "$W/$d/node_modules"; done
    echo "$W" ;;
  integrate)
    B="$1"; MSG="${2:-ชุด $B: เขียนหัวข้อใหม่ตามแผน พร้อมจับคู่หลักสูตร}"
    IDS=$(python3 "$D/sched.py" "$R" ids "$B")
    [ -n "$(git diff --cached --name-only)" ] && { echo "index ไม่ว่าง ยกเลิก"; exit 1; }
    W="$(dirname "$R")/klangru-work/$B"
    # ผู้เขียนทำงานใน worktree: commit งานบน branch ของชุดก่อน แล้วดึงเฉพาะไฟล์ที่ branch เปลี่ยนมารวม (ไม่ทับไฟล์อื่นของ main)
    [ -d "$W" ] && { git -C "$W" add -A && git -C "$W" commit -q -m "งานชุด $B" 2>/dev/null || true; }
    if git show-ref -q "refs/heads/batch/$B"; then
      mapfile -t BF < <(git diff --name-only --diff-filter=AM "$(git merge-base HEAD "batch/$B")" "batch/$B")
      [ ${#BF[@]} -gt 0 ] && { git checkout "batch/$B" -- "${BF[@]}" && git reset -q; }
    fi
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
