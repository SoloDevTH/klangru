# กติกาสำหรับผู้เขียนชุดหัวข้อเฟส 10 (อ่านให้ครบก่อนเริ่ม)

repo: /home/user/klangru

## อ่านก่อนเขียนอะไร
1. docs/phase8/agent-instructions.md (กติกาการทำงาน)
2. docs/phase8/new-topics-brief.md (โครงสร้างหัวข้อ โจทย์ 15 ข้อขึ้นไป ภาพ การจับคู่หลักสูตร หมวดเรื่องอ่อนไหว)
3. docs/phase10/planning-brief.md และ docs/phase10/README.md (บริบทเฟส 10)
4. ตัวอย่างที่ทำครบแล้ว: content/math/pythagoras/ และหัวข้อที่มีอยู่แล้วในวิชาเดียวกันใน content/<วิชา>/

## ที่มาของแผนของแต่ละหัวข้อ
รหัสทุกตัวอยู่ในแผนไฟล์เดียวใน docs/phase6/ หาด้วย `grep -n "<รหัส>" docs/phase6/proposals-phase10-*.yaml` แถวอยู่บรรทัดเดียว ใช้ id, title, difficulty, prereq, indicators และ scope ตามแถวนั้น อ่านข้อความตัวชี้วัดใน curriculum/frameworks/ ให้ครบ สอนให้ตรงตามตัวชี้วัด

## โฟลเดอร์
content/<วิชา>/<ส่วนท้ายของรหัส> เช่น computer.programming.control-flow → content/computer/control-flow
ข้อยกเว้น: math.de.linear-systems → content/math/de-linear-systems (เพราะ content/math/linear-systems มีอยู่แล้ว)
ถ้าโฟลเดอร์มีอยู่แล้วให้หยุดและรายงาน ห้ามทับ

## สิ่งที่ต้องส่ง
- topic.yaml, lesson.md, problems.yaml, ภาพ SVG (และ PNG ที่เรนเดอร์แล้ว), flashcards, glossary, references ตามคู่มือ
- โจทย์อย่างน้อย 15 ข้อ ความยาก 1–5 ครบ หลายชนิด คำนวณทุกเฉลยด้วย python3 ไม่มีคำตอบซ่อนในโจทย์หรือภาพ
- บทเรียน 500–1,000 คำ ภาษาไทยเป็นธรรมชาติ
- status: draft, ai_assisted: true, license: CC-BY-SA-4.0, authors: [ทีมคลังรู้]
- ไฟล์จับคู่ docs/phase8/mappings/<รหัสหัวข้อ>.yaml: ทุกตัวชี้วัดของแถวในแผน (indicators และ extend ถ้ามี) ต้องอยู่ใน rows หรือ not_taught ตัดสิน full/partial จากเนื้อหาที่สอนจริง
- บันทึก: docs/phase8/notes-phase10-<ชื่อชุด>.md (ต่อหัวข้อ 2–4 บรรทัด: จำนวนโจทย์ ภาพ ข้อเสนอแก้แผน สิ่งที่ไม่แน่ใจ)
- ไฟล์ชั่วคราวและสคริปต์: โฟลเดอร์ชั่วคราวนอก repo

## ข้อกำหนดของโจทย์เขียนโค้ด
ตัวรันโค้ดในแอปใช้ได้เฉพาะไลบรารีมาตรฐานของ Python (ไม่มี numpy pandas matplotlib sqlite3 threading) reference ต้องผ่าน tests และ starter ต้องไม่ผ่าน

## กติกาที่ห้ามละเมิด
- ห้าม commit ห้าม push
- ห้ามแก้ docs/phase6/, curriculum/, content/subjects.yaml หรือโฟลเดอร์ของหัวข้ออื่นนอกชุดของตัวเอง
- ห้ามใส่อีเมลหรือข้อมูลส่วนตัวในคำขอเว็บ ใช้ User-Agent: KlangruBot/0.1 (+https://github.com/SoloDevTH/klangru)
- ค่าที่ยืนยันจากแหล่งไม่ได้ ห้ามปล่อยเป็นข้อเท็จจริง ให้ติดป้าย "ต้องตรวจก่อนเผยแพร่" ในบทเรียนและ notes
- เรื่องอ่อนไหว (สุขภาพ เพศศึกษา ความรุนแรง ฯลฯ) ตามหมวดในคู่มือ

## ตรวจก่อนรายงาน
- `npm run validate -- --strict` ต้องไม่มี error หรือ warning จากโฟลเดอร์ของตัวเอง (error ของชุดอื่นไม่ต้องแก้)
- `npm test -w @klangru/content-tools` ต้องผ่าน
- เรนเดอร์ภาพทุกภาพเป็น PNG แล้วเปิดดู

## รายงานกลับ (ไม่เกิน 200 คำ)
ต่อหัวข้อ จำนวนโจทย์และภาพ, error ที่เหลือ (เฉพาะของตัวเอง), เรื่องที่ไม่แน่ใจ, ข้อเสนอแก้แผน
