# บันทึกชุด p1-computer-b (เฟส 10 กลุ่มคอมพิวเตอร์)

ไฟล์จับคู่ตัวชี้วัดอยู่ที่ `docs/phase8/mappings/<รหัสหัวข้อ>.yaml`

## computer.data.data-preparation (content/computer/data-preparation)
- โจทย์ 18 ข้อ (ความยาก 1–5 ทุกระดับ, ชนิด numeric 7 mcq 5 code 3 order match text อย่างละ 1), โจทย์เขียนโค้ด 3 ข้อ (`parse_scores`, `clean_rows`, `merge_tables`), ภาพ 1 ภาพ (SVG), บทเรียน 2 ตัวอย่างแสดงวิธีทำ 2 `check`
- prerequisite `computer.programming.files-exceptions` มีในคลังแล้วหลังรวม main (`validate --strict` ไม่มี error)
- ตัวเลขสมมติทั้งหมดติดป้ายในบทเรียน ไม่มีค่าที่ต้องตรวจกับแหล่งภายนอก

## computer.data.exploratory-analysis (content/computer/exploratory-analysis)
- โจทย์ 18 ข้อ (numeric 7 mcq 5 code 3 order match text อย่างละ 1), โจทย์เขียนโค้ด 3 ข้อ (`group_means`, `iqr_outliers`, `sum_by_class`), ภาพ 2 ภาพ (แผนภาพกล่อง และกราฟกระจาย), `check` 2 ข้อ
- NumPy และ Pandas (PY 15.2 และ 15.3) สอนแบบอ่านและไล่โค้ดตัวอย่างเท่านั้น จับคู่แบบ partial
- ข้อควรรู้: ค่าควอร์ไทล์ขึ้นกับวิธีคำนวณ บทเรียนและโจทย์ระบุ `statistics.quantiles(n=4)` (วิธีค่าเริ่มต้น) ไว้แล้ว โจทย์ `statistics.correlation` ต้องใช้ Python 3.10 ขึ้นไป แอปใช้ Pyodide 0.29.5 (Python 3.13) จึงมีฟังก์ชันนี้

## computer.ai.supervised-learning (content/computer/supervised-learning)
- โจทย์ 18 ข้อ (numeric 7 mcq 5 code 3 order match text อย่างละ 1), โจทย์เขียนโค้ด 3 ข้อ (`fit_line`, `best_threshold`, `knn_predict`), ภาพ 2 ภาพ, สื่อโต้ตอบ 1 ชิ้น (function-plot ปรับ a และ b)
- prerequisite `computer.programming.collections` มีในคลังแล้วหลังรวม main ส่วน S2-AIN-DD-03 ไม่ได้สอนในหัวข้อนี้ จึงบันทึกเป็น not_taught
- ข้อมูลทุกชุดเป็นข้อมูลสมมติ บทเรียนระบุไว้ ไม่มีตัวเลขผลวิจัย

## computer.ai.model-evaluation (content/computer/model-evaluation)
- โจทย์ 18 ข้อ (numeric 7 mcq 5 code 3 order match text อย่างละ 1), โจทย์เขียนโค้ด 3 ข้อ (`confusion_matrix`, `mae`, `precision_recall_f1`), ภาพ 2 ภาพ (เมทริกซ์ความสับสนและกราฟความลึก), `check` 2 ข้อ
- ตัวชี้วัดที่ตัดสินเป็น partial เกือบทั้งหมดอยู่ในกลุ่มเรื่องความเป็นธรรม ข้อมูลฝึก ขนาดข้อมูล และการเพิ่มตัวแปร เพราะบทเรียนอธิบายแต่ยังไม่มีโจทย์ฝึก
- ตัวเลขทั้งหมดในภาพเป็นข้อมูลสมมติ ระบุในคำบรรยายภาพแล้ว

## computer.ai.search-planning (content/computer/search-planning)
- โจทย์ 18 ข้อ (numeric 7 mcq 5 code 3 order match text อย่างละ 1), โจทย์เขียนโค้ด 3 ข้อ (`bfs_steps`, `neighbors`, `astar_steps`), ภาพ 2 ภาพ (วงจรเอเจนต์ และเขาวงกต), `check` 3 ข้อ
- การตัดกิ่งอัลฟา–เบตาและ STRIPS อธิบายแนวคิดแต่ไม่มีโจทย์ จับคู่เป็น partial
- คำตอบโจทย์ p010 p013 และผลของ BFS กับ A* บนกริดตัวอย่างตรวจด้วย python3 แล้ว ค่า f ในตัวอย่างวิธีทำคำนวณด้วยมือและตรวจซ้ำแล้ว

## หมายเหตุทั่วไป
- ภาพ PNG ที่เรนเดอร์ด้วย Chromium เปิดตรวจแล้วทุกภาพ แต่ไม่ได้เก็บไว้ในโฟลเดอร์ `figures/` เพราะ `validate` เตือนไฟล์ภาพที่ไม่ได้ถูกอ้างถึง และคลังทั้งหมดเก็บเฉพาะ SVG
- ลิงก์อ้างอิงทั้ง 16 ลิงก์ตอบ HTTP 200 ตรวจด้วย User-Agent KlangruBot/0.1
- โจทย์ทุกข้อมี `ai_assisted: true`, `status: draft` และทุกเฉลยคำนวณด้วย python3

## ผลตรวจของผู้ตรวจ
- `validate --strict` และ `--lint` ไม่มี error หรือคำเตือนจาก 5 หัวข้อ โจทย์โค้ด 15 ข้อ reference ผ่าน starter ไม่ผ่าน ใช้เฉพาะไลบรารีมาตรฐาน เฉลยตัวเลขทุกข้อคำนวณซ้ำด้วย python3 แล้ว
- exploratory-analysis: p010 เดิมใช้ข้อมูลชุดเดียวกับแผนภาพกล่อง (ภาพบอก Q1 และ Q3 ไว้แล้ว) จึงเปลี่ยนข้อมูล คำตอบใหม่ 15.5 ส่วน p013 เดิมใช้ข้อมูลชุดเดียวกับกราฟกระจาย จึงเปลี่ยนข้อมูล คำตอบใหม่ 0.98 แก้คำตอบของตัวอย่างแสดงวิธีทำที่หนึ่งให้ชัดว่า 90 ไม่ถูกจัดเป็นค่าผิดปกติ
- model-evaluation: test ของ p015 ใช้ข้อมูลและคำตอบเดียวกับ p009 จึงเปลี่ยนข้อมูล และเปลี่ยนตัวเลข 90/60 ในบทเรียนที่ซ้ำกับ p017
- search-planning: p005 เป็นกราฟเดียวกับตัวอย่างแสดงวิธีทำ BFS จึงเปลี่ยนกราฟ (คำตอบใหม่ 4) p013 ให้ต้นทุนจริง 7 ของกริดเดียวกับ p010 (เฉลย p010) จึงเปลี่ยนกริด ตัดตัวอย่างที่ซ้ำกับตัวอย่างแสดงวิธีทำออกจากบทเรียนให้ยาวไม่เกินเกณฑ์ และแก้ข้อผิดพลาดที่พบบ่อยเรื่องฮิวริสติกกับกำแพง
- supervised-learning: แก้คำอธิบายความเข้าใจผิดของ p009 (0.333 ไม่ได้มาจากการลืมยกกำลังสอง)
- data-preparation: ติดป้ายข้อมูลสมมติในตัวอย่างแสดงวิธีทำที่สองและ p018
