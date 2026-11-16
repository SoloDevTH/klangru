# บันทึกชุดงาน phase10 p1-engineering (6 หัวข้อ)

ตรวจด้วย `npm run validate -- --strict --lint --allow-planned --only=engineering/<โฟลเดอร์>` ทุกหัวข้อ ยกเว้น reactor-design (ดูด้านล่าง) ได้ 0 error 0 warning และ `npm test -w @klangru/content-tools` ผ่าน 45/45 ตัวเลขทุกค่าในโจทย์คำนวณด้วย python3 ค่าสมมติติดป้าย "(ค่าสมมติ)" ในโจทย์และ "ค่าสมมติ" ในบทเรียน

## engineering.mechanics.vibration-sdof
- โจทย์ 18 ข้อ ความยาก 1–5 ชนิด numeric/mcq/expression/order/match/text ภาพ 2 ภาพ (msd.svg, magnification.svg)
- ตัวชี้วัด MIT2.003SC U10 เต็ม, U11 บางส่วน (ยังไม่มีระบบหลายองศาอิสระ), ME-3.3 บางส่วน (กลุ่มกว้าง)
- ไม่แน่ใจ: ไม่มีค่าอ้างอิงจากภายนอก ตัวเลขทั้งหมดเป็นสมมติ

## engineering.process.reactor-design
- โจทย์ 19 ข้อ ภาพ 2 ภาพ (reactor-types.svg, conversion-kt.svg)
- **ต้องรอชุดเคมี**: prerequisite `chemistry.kinetics.rate-laws` ยังไม่อยู่ในคลัง (แผนอยู่ใน proposals-phase10-sciences.yaml, งานอยู่ใน branch batch/chemistry-103 ที่ยัง WIP) validate จึงมี error เดียวคือ prerequisite นี้ ไม่แก้ id ตามกติกา
- ข้อเสนอ: ถ้าชุดเคมีเปลี่ยนรหัสหรือเลิกทำหัวข้อนี้ ต้องแก้ prerequisite ด้วย

## engineering.environmental.water-treatment
- โจทย์ 18 ข้อ ภาพ 1 ภาพ (water-train.svg)
- ตัวชี้วัด ENV-3.4 บางส่วน, ENV-3.2 (หน่วยปฏิบัติการ) ไม่สอนในบทนี้ ใส่ใน not_taught
- review_flags 3 รายการ: เกณฑ์คุณภาพน้ำประปาไทย (high), ช่วงอัตรากรองและน้ำล้นผิว, ค่า CT ที่ต้องใช้ (medium) บทเรียนไม่ระบุตัวเลขเกณฑ์เหล่านี้
- ไม่แน่ใจ: ยังไม่ได้ตรวจประกาศกระทรวงสาธารณสุขหรือหน่วยงานประปาที่เป็นทางการ

## engineering.environmental.wastewater-treatment
- โจทย์ 19 ข้อ ภาพ 1 ภาพ (activated-sludge.svg)
- ตัวชี้วัด ENV-3.3, ENV-3.7, CHE-3.12 บางส่วนทั้งหมด, ENV-3.2 ไม่สอน (ปฏิบัติการ)
- review_flags 3 รายการ: เกณฑ์การระบายน้ำทิ้งของไทย (high) ค้นได้แต่ค่า pH/TDS จากผลค้นหาเท่านั้น และเว็บ PCD ดึงเอกสารไม่สำเร็จ จึงไม่ใช้ค่าใด BOD/TSS ของอาคารยังยืนยันไม่ได้ ค่าประมาณ 4.57 gO₂/gN, k = 0.23 d⁻¹ และ 0.35 m³ CH₄/kg COD (medium)
- ข้อเสนอ: เกณฑ์น้ำทิ้งควรให้ชุดที่มีสิทธิ์เข้าถึงราชกิจจานุเบกษาตรวจและเพิ่มเป็นตัวเลขเมื่อยืนยันแล้ว

## engineering.electronics.op-amps
- โจทย์ 19 ข้อ ภาพ 2 ภาพ (inverting.svg, transfer.svg)
- ตัวชี้วัด MIT6.002 L21, R21, L22 เต็ม, R23 บางส่วน (แปลงกระแสเป็นแรงดันและเปรียบเทียบ) L23/R22 เป็นของหัวข้อ active-filters
- ไม่แน่ใจ: แรงดันอิ่มตัว ±10.5 V เป็นค่าสมมติ

## engineering.thermo.heat-transfer
- โจทย์ 19 ข้อ ภาพ 1 ภาพ (composite-wall.svg)
- ตัวชี้วัด ME-3.2 และ CHE-3.3 บางส่วนทั้งคู่ (ไม่ครอบคลุมการทำความเย็นหรือปรับอากาศ)
- review_flags 1 รายการ: ค่าคงที่ของสหสัมพันธ์ Dittus–Boelter (medium) ใช้ในโจทย์ p012
- ข้อเสนอ: ถ้าแผนต้องการครอบคลุม ME-3.2 เต็ม ควรแยกการทำความเย็นเป็นหัวข้อใหม่

## หมายเหตุทั่วไป
- ภาพ PNG ที่เรนเดอร์จาก SVG แล้วเปิดตรวจทุกภาพอยู่ใน scratchpad ของชุดงาน ไม่ได้เก็บใน repo เพราะตัวตรวจเตือนไฟล์ภาพที่ไม่ได้อ้างอิง และหัวข้อเดิมเก็บเฉพาะ SVG
- ลิงก์อ้างอิงทั้งหมดตรวจแล้วเปิดได้ (HTTP 200) ด้วย User-Agent KlangruBot/0.1
- ไฟล์จับคู่ทั้งหกอยู่ใน docs/phase8/mappings/

## ผลตรวจของผู้ตรวจ
- validate `--strict --lint` ทั้ง 6 โฟลเดอร์ 0 error 0 warning prerequisite `chemistry.kinetics.rate-laws` มีในคลังแล้ว (content/chemistry/rate-laws) id ถูกต้อง
- คำนวณเฉลยตัวเลขทุกข้อซ้ำด้วย python3 ตรงทั้งหมด แก้ heat-transfer p006 เป็น 793.8 W ให้ตรงการปัดเศษ
- แก้คำตอบที่ซ่อนในข้ออื่น: vibration p003 (อ้าง "ข้อ 1" และใช้ค่าซ้ำกับคำตอบใน misconception ของ p001) heat-transfer p011 (ให้ LMTD 36.41 ซึ่งเป็นคำตอบ p010) p013 (Nu 120 ใกล้คำตอบ p012)
- แก้คำผิด "ไม่มีหน่วง" เป็น "ไม่มีหน่วย" ทุกที่ แก้ feedback ผิดหน่วยใน water p004 เฉลย reactor p005 ตัวเลือก c ของ p018 ที่ขัดกับโจทย์ wastewater p019 ที่ให้สูตรพร้อมตัวเลขในโจทย์ เพิ่มสูตรอันดับสองในบทเรียน reactor
- ภาพ: msd.svg ตัวหน่วงไม่ได้ต่อกับมวลและมวลวางบนพื้น วาดใหม่ activated-sludge.svg ลูกศรสลัดจ์ส่วนเกินออกจากถังตกตะกอนขั้นต้น แก้ให้ออกจากถังขั้นที่สอง conversion-kt.svg คำอธิบายสัญลักษณ์ทับเส้นกราฟ ย้ายแล้ว ลบภาพซ้ำที่ฝังใน lesson.md ของ vibration และ op-amps (มี figure block อยู่แล้ว)
- Dittus–Boelter ยืนยันกับ Wikipedia "Nusselt number" (0.023, 0.8, n = 0.4 ให้ความร้อน 0.3 ทำให้เย็น, Re ≳ 10,000, 0.6 ≤ Pr ≤ 160, L/D ≳ 10) เพิ่มเงื่อนไขในบทเรียนและอ้างอิง ลบ review_flag
- 4.57 gO₂/gN และ 0.35 m³ CH₄/kg COD (0°C 1 atm) ยืนยันด้วยปริมาณสัมพันธ์ ใส่ที่มาในบทเรียนและเฉลย ลบ review_flag k = 0.23 d⁻¹ เปลี่ยนเป็นค่าสมมติ
- เกณฑ์น้ำประปาและน้ำทิ้งของไทยยังไม่ได้ยืนยันกับประกาศทางการ คง review_flags ไว้ บทเรียนไม่มีตัวเลขเกณฑ์
- ENV-3.2 "หน่วยปฏิบัติการสำหรับวิศวกรรมสิ่งแวดล้อม" หมายถึง unit operations and processes ไม่ใช่งานห้องทดลอง เหตุผลใน not_taught จึงผิด water-treatment สอนหน่วยเหล่านี้จริง (G, SOR, อัตรากรอง, CT) จึงย้ายเป็น rows partial ใน water และ wastewater พร้อมหมายเหตุขอบเขต และตัดแถว ENV-3.3 ที่เกินแผนออกจากไฟล์จับคู่ของ reactor-design
