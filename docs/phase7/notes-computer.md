# บันทึกเฟส 7: วิชาคอมพิวเตอร์ (ชุด computer)

หัวข้อทั้งสามเขียนใหม่ในเฟสนี้ (ก่อนหน้าไม่มีวิชาคอมพิวเตอร์ในคลัง) จึงเขียนให้ถึงเกณฑ์ของ `enrichment-brief.md` ตั้งแต่แรก

หลักสูตรต่างประเทศที่ใช้เทียบ: `csta-k12-cs` (CSTA K–12 CS Standards, Revised 2017) และ `acm-cs2023` (CS2023 Body of Knowledge) ซึ่งเพิ่มเข้า `curriculum/frameworks/` ในชุดงานนี้ รวมทั้ง `au-ac9-digital-technologies` และ `uk-nc-computing` ที่ agent อื่นเพิ่มเข้ามาระหว่างทำงาน (ยังไม่มีไฟล์ mapping ของสองฉบับนี้ ผลการเทียบจึงบันทึกไว้ที่นี่เท่านั้น ตามกติกาเฟส 7 ที่ห้ามแก้ `curriculum/`)

ทุกคำตอบและ misconception คำนวณด้วย python3 โค้ด Python ทุกชิ้นในโจทย์ ตัวอย่าง และบทเรียนรันจริงและเทียบผลอัตโนมัติ รหัสลำลองแปลงเป็น Python แล้วรันเทียบ ภาพทุกภาพวาดด้วยสคริปต์ เรนเดอร์เป็น PNG ด้วย Chromium แล้วเปิดดู (สคริปต์อยู่ใน scratchpad `phase7-computer/scripts/`)

## computer.data.binary (`content/computer/binary-data/`)

- โจทย์ 0 → 25 ข้อ ระดับ 1:3, 2:6, 3:7, 4:7, 5:2 ชนิด numeric, mcq, text, order, match, expression สถานการณ์ไทย 7 ข้อ (ไฟประดับลอยกระทง ข้อความ "สวัสดี" ภาพจากกล้องโทรศัพท์ เพลงลูกทุ่ง นักเรียน 40 คน ไอคอนนาฬิกา สติกเกอร์)
- บล็อก: figure → explanation → check (p003) → worked-example ×2 (แปลง 45 เป็นฐานสอง, ขนาดภาพ 1280×720) → check (p010) → interactive number-line
- ภาพ (วาดเอง): `place-values.svg` (25 = 00011001 พร้อมค่าประจำหลัก), `pixel-letter.svg` (ภาพ 5×5 ตัว F ใช้ในโจทย์ p017 ไม่มีตัวเลขเฉลย)
- ตัวชี้วัดที่สอนครบ: `csta-k12-cs:2-DA-07 → full`, `csta-k12-cs:3A-DA-09 → full`, `au-ac9-digital-technologies:AC9TDI4K03 → full`, `au-ac9-digital-technologies:AC9TDI6K03 → full`, `au-ac9-digital-technologies:AC9TDI6K04 → full`, `au-ac9-digital-technologies:AC9TDI8K03 → full`, `au-ac9-digital-technologies:AC9TDI8K04 → full`
- เพิ่มเพื่อหลักสูตรต่างประเทศ: ส่วน "บีบอัดข้อมูลอย่างง่าย" (run-length encoding, แบบสูญเสียกับไม่สูญเสีย) และโจทย์ p024–p025 ตาม AC9TDI10K03
- บางส่วน: `th-core-2560-science:ว 4.2 ม.2/3` (มีเพียงการแทนข้อมูล ไม่มีองค์ประกอบของระบบคอมพิวเตอร์และการสื่อสาร), `acm-cs2023:AR-Representation` (ยังไม่มีจำนวนลบแบบส่วนเติมเต็มสอง จุดตรึง จุดลอยตัว), `au-ac9-digital-technologies:AC9TDI10K03` (มีเฉพาะการนับซ้ำ ยังไม่มีวิธีอื่น เช่น พจนานุกรมหรือฮัฟฟ์แมน), `uk-nc-computing:UKNC-CO-KS3-04` (การบวกและแปลงเลขฐานสองครบ แต่ตรรกะบูลีนอยู่ในหัวข้อที่เสนอ computer.systems.logic-gates), `uk-nc-computing:UKNC-CO-KS3-06` (การแทนข้อความ เสียง ภาพครบ แต่การเก็บและทำคำสั่งในเครื่องอยู่ใน computer.systems.computer-systems)
- ควรเป็นหัวข้อใหม่ (เสนอไว้ใน `docs/phase6/proposals-computer.yaml`): `computer.data.number-representation` (ฐานสิบหก ส่วนเติมเต็มสอง การล้น จุดลอยตัว), `computer.systems.logic-gates`, `computer.systems.computer-systems`

## computer.algorithms.intro (`content/computer/algorithms/`)

- โจทย์ 0 → 22 ข้อ ระดับ 1:3, 2:5, 3:7, 4:4, 5:3 ชนิด numeric (ไล่อัลกอริทึม), order, match, mcq สถานการณ์ไทย 6 ข้อ (หุงข้าว ชงชาเย็น พัดลม ร้านข้าวสาร ร้านสะดวกซื้อ กระปุกออมสิน)
- บล็อก: figure → explanation → check (p004) → worked-example ×2 (ส่งฟรีเมื่อซื้อครบ 300 บาท, ไล่วงวน while ออมเงิน) → check (p007)
- ภาพ (วาดเอง): `flowchart-symbols.svg` (สัญลักษณ์ผังงาน 4 แบบ), `flowchart-loop.svg` (ผังงานวนบวกเลขคี่ ใช้ในโจทย์ p015)
- ตัวชี้วัดที่สอนครบ: `th-core-2560-science:ว 4.2 ป.1/1 → full`, `ว 4.2 ป.1/2 → full`, `ว 4.2 ป.2/1 → full`, `ว 4.2 ป.3/1 → full`, `csta-k12-cs:1A-AP-08 → full`, `csta-k12-cs:1A-AP-11 → full`, `csta-k12-cs:1A-AP-14 → full`, `au-ac9-digital-technologies:AC9TDI2P02 → full`, `au-ac9-digital-technologies:AC9TDI4P02 → full`, `au-ac9-digital-technologies:AC9TDI8P06 → full`, `uk-nc-computing:UKNC-CO-KS1-01 → full`, `uk-nc-computing:UKNC-CO-KS1-03 → full`, `uk-nc-computing:UKNC-CO-KS2-03 → full`
- บางส่วน: `acm-cs2023:SDF-Algorithms` (มีแนวคิดอัลกอริทึมและการค้นหาแบบลำดับ ยังไม่มีการเรียงลำดับและการวิเคราะห์ประสิทธิภาพ), `au-ac9-digital-technologies:AC9TDI6P02` และ `AC9TDI8P05` (ผู้เรียนไล่และเรียงอัลกอริทึมที่มีทางเลือกหลายทางและวงวนซ้อนได้ แต่ยังไม่ได้ออกแบบเอง)
- มีเนื้อหาแต่ไม่ได้จับคู่ (เพราะแถวหนึ่งมี coverage เดียว และหัวข้อที่เสนอจะสอนให้ครบ): `ว 4.2 ป.4/1`, `ป.5/1` (คาดการณ์ผลลัพธ์), `csta-k12-cs:1B-AP-08` (เทียบหลายอัลกอริทึม), `csta-k12-cs:2-AP-10` (ผังงานกับปัญหาซับซ้อน)
- ควรเป็นหัวข้อใหม่: `computer.algorithms.logical-reasoning`, `computer.algorithms.computational-thinking`, `computer.algorithms.searching-sorting`

## computer.programming.basics (`content/computer/programming-basics/`)

- โจทย์ 0 → 24 ข้อ ระดับ 1:3, 2:5, 3:7, 4:6, 5:3 ชนิด numeric ("โปรแกรมนี้แสดงอะไร"), text, mcq, order (เรียงบรรทัดโค้ด), match, expression สถานการณ์ไทย 6 ข้อ (ตัดเกรด ร้านเครื่องเขียน ค่าไฟ ค่าขนม อายุ ออมเงิน)
- บล็อก: figure → explanation → check (p001) → worked-example (ตัดเกรดด้วย if/elif/else) → figure → worked-example (ค่าขนมหนึ่งสัปดาห์ด้วย for + if) → check (p006)
- ภาพ (วาดเอง): `variable-boxes.svg` (ตัวแปรเป็นกล่องมีป้ายชื่อ 4 ชนิดข้อมูล), `range-diagram.svg` (`range(1, 5)` ไม่รวม 5)
- ตัวชี้วัดที่สอนครบ: ไม่มี (ทุกข้อยังเป็นบางส่วน)
- บางส่วน: `th-core-2560-science:ว 4.2 ป.4/2`, `ป.5/2`, `ป.6/2`, `csta-k12-cs:1B-AP-09`, `1B-AP-10`, `1B-AP-15`, `2-AP-11`, `2-AP-12`, `acm-cs2023:SDF-Fundamentals`, `au-ac9-digital-technologies:AC9TDI8P09`, `AC9TDI10P05`, `AC9TDI10P06` (เพิ่มเรื่องกรณีทดสอบค่าขอบในบทเรียนและโจทย์ p024 แล้ว), `uk-nc-computing:UKNC-CO-KS2-02`, `UKNC-CO-KS3-03` เหตุผล: แอปตรวจได้เฉพาะการอ่าน ไล่ เรียง และหาข้อผิดพลาดของโปรแกรม ผู้เรียนยังไม่ได้ออกแบบ เขียน และรันโปรแกรมของตัวเอง ไม่มีเหตุการณ์ (events) SDF-Fundamentals และ AC9TDI8P09 ยังขาดฟังก์ชัน ข้อมูลแบบมีโครงสร้าง ไฟล์ การเรียกซ้ำ และ KS3-03 ต้องใช้สองภาษาและโครงสร้างข้อมูล
- ควรเป็นหัวข้อใหม่: `computer.programming.design-debug` (เขียนและทดสอบโปรแกรมเอง), `computer.programming.functions`, `computer.programming.lists-strings`
- ถ้าแอปมีตัวรันโค้ดในเบราว์เซอร์ (เช่น Pyodide) ในอนาคต ชนิดโจทย์ "เขียนโปรแกรมแล้วตรวจด้วยกรณีทดสอบ" จะทำให้ตัวชี้วัด ป.4/2–ป.6/2 และ 1B-AP-09/10 เป็น full ได้

## หมายเหตุ

- แฟ้มใน `curriculum/` ที่ชุดนี้แก้: เพิ่ม `frameworks/csta-k12-cs.yaml`, `frameworks/acm-cs2023.yaml`, `mappings/csta-k12-cs.yaml`, `mappings/acm-cs2023.yaml` และต่อท้ายแถวของหัวข้อคอมพิวเตอร์ใน `mappings/th-core-2560-science.yaml` ตามคำสั่งงานเดิมของชุด (ไม่แตะแถวอื่น)
- CSTA ออกฉบับใหม่ "2026 CSTA PK–12 Computer Science Standards" (ก.ค. 2026) โครงและรหัสเปลี่ยนทั้งหมด ไฟล์นี้ยังใช้ฉบับ 2017 ควรเพิ่มฉบับ 2026 เป็นหลักสูตรแยกภายหลัง
