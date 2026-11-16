# พิมพ์ไฟล์ที่ยังไม่ commit (untracked) ของชุดงาน: โฟลเดอร์หัวข้อ ไฟล์จับคู่ และบันทึก
import sys, subprocess, os
repo, ids, batch = sys.argv[1], sys.argv[2].split(","), sys.argv[3]
out = subprocess.run(["git", "-C", repo, "ls-files", "--others", "--exclude-standard"], capture_output=True, text=True).stdout.split("\n")
want = set()
for i in ids:
    s, last = i.split(".")[0], i.split(".")[-1]
    want.add(f"content/{s}/{last}/"); want.add(f"docs/phase8/mappings/{i}.yaml")
want.add(f"docs/phase8/notes-phase10-{batch}.md")
# ข้อยกเว้นชื่อโฟลเดอร์
if "math.de.linear-systems" in ids: want.add("content/math/de-linear-systems/")
found = set()
for f in out:
    for w in want:
        if f == w or (w.endswith("/") and f.startswith(w)):
            found.add(w.rstrip("/") if w.endswith("/") else w)
for w in sorted(found): print(w)
