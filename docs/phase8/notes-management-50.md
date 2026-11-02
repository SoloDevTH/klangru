# บันทึกชุดงาน management-50 (เฟส 8)

แปดหัวข้อวิชาการจัดการจาก `docs/phase6/proposals-management.yaml` (ไม่มีแถว `extend:` ที่ผูกกับหัวข้อชุดนี้) โฟลเดอร์ใช้ส่วนท้ายของรหัส (`organizing`, `planning-decision`, `quality-planning`, `iso-management-systems`, `maintenance-reliability`, `acceptance-sampling`, `spc`, `leadership-motivation`) id ความยาก และ prerequisite ตามแผนทุกหัวข้อ `math.stats.normal-distribution` มี topic.yaml แล้วตอนเขียน spc จึงเขียนตามลำดับเดิม

- ภาพทุกภาพวาดเป็น SVG ด้วยสคริปต์ Python จากพิกัดที่คำนวณ (เส้นโค้ง OC จากทวินาม แผนภูมิควบคุมจากข้อมูลจำลองที่บันทึก seed ไว้ ต้นไม้การตัดสินใจ บ้านแห่งคุณภาพ ฯลฯ) เรนเดอร์เป็น PNG ด้วย Chromium และเปิดดูทุกภาพ แก้จนป้ายไม่ทับกัน ภาพในโจทย์ (`p-*.svg`, `hoq.svg`, `rbd.svg`, `risk-matrix.svg`) ไม่มีคำตอบ
- ตัวเลขทุกตัวคำนวณด้วย python3 และตรวจด้วยสคริปต์ว่าค่า misconception ห่างจากคำตอบเกินช่วงที่แอปจับคู่ (max(tolerance, 0.01))
- **ลิขสิทธิ์มาตรฐาน**: ISO 9001, ASQ BoK และ PMBOK ไม่ได้ยกข้อความ บทเรียน ISO สรุปข้อ 4–10 ด้วยคำของคลังรู้ และระบุให้ผู้ใช้อ่านมาตรฐานฉบับจริงและตรวจฉบับปรับปรุงใหม่ บทชักตัวอย่างอธิบาย Z1.4/ISO 2859-1 เป็นหลักการโดยไม่คัดลอกตาราง
- **ค่าคงที่ SPC**: คำนวณ $d_2$ (อินทิเกรตค่าคาดหมายของพิสัย) $d_3$ (จากการแจกแจงของพิสัย) และ $c_4$ (ฟังก์ชันแกมมา) ด้วย python3 แล้วได้ $A_2, D_3, D_4, A_3, B_3, B_4$ ตรงกับตารางในภาคผนวกของ Montgomery *Introduction to Statistical Quality Control* และ NIST/SEMATECH e-Handbook 6.3.2.1 (อ้างในบทเรียนและ references) ARL ของกฎ Western Electric ครบสี่ข้อจำลองด้วย python3 (20,000 รัน) ได้ 91.9 ใกล้ค่า 91.75 ที่ Champ และ Woodall (1987) รายงาน เส้นโค้ง OC AOQ ATI คำนวณจากทวินามด้วยโค้ดเอง (เครื่องไม่มี scipy)
- ตัวอย่างทุกตัวเป็นองค์กรไทยสมมติ (โรงงาน โรงพยาบาล สำนักงานเขต เทศบาล สหกรณ์ วิสาหกิจชุมชน)
- ไฟล์จับคู่ `docs/phase8/mappings/<รหัส>.yaml` ครบทุกตัวชี้วัดในแผน (ตรวจด้วยสคริปต์ว่าไม่ขาดไม่เกินและรหัสมีอยู่ในกรอบ) ไม่มี `not_taught`
- ความยาวบทเรียน (Intl.Segmenter รวมตาราง): organizing 1,070 iso 1,092 leadership 1,005 ที่เหลือ 910–995 คำ สองหัวข้อแรกเกินเล็กน้อยเพราะมีตาราง ถ้าต้องตัด ตัดคอลัมน์ "ตัวอย่างหลักฐาน" ในตาราง ISO ได้

## management.principles.organizing (`organizing`)
โจทย์ 18 (mcq match numeric order; ยาก 3/4/5/4/2) ภาพ 2: `structures.svg` (สี่โครงสร้าง) `p-orgchart.svg` (ใช้ใน p004–p006) CMQOE I.A → full; มคอ.1 รัฐประศาสนศาสตร์ 8.1 และบัญชี 8.2.3 → partial (กลุ่มความรู้กว้าง) ข้อมูลส่วนราชการ (กระทรวง กรม กอง/สำนัก กลุ่มงาน/ฝ่าย จังหวัด อำเภอ) เป็นโครงสร้างทั่วไป ไม่ได้อ้างกฎหมายฉบับใด

## management.principles.planning-decision (`planning-decision`)
โจทย์ 18 (ยาก 3/5/5/3/2 numeric 7 ข้อ) ภาพ 2: `tree.svg` (บทเรียน มี EMV) `p-booth-tree.svg` (p012 p013 ไม่มี EMV) ตัวชี้วัดสองตัวเป็น partial เพราะกว้างกว่าหัวข้อ **ข้อเสนอ**: maximax/maximin/EMV ใช้ค่าคาดหมายซึ่งสอนใน `math.stats.random-variables` (6.5) มากกว่า `math.prob.probability` (4) บทเรียนอธิบาย EMV เองจึงใช้ได้ แต่ถ้าต้องการให้ผู้เรียนเห็นค่าคาดหมายมาก่อน อาจเพิ่ม random-variables เป็น prerequisite แบบไม่บังคับหรือคงไว้ตามแผน

## management.quality.quality-planning (`quality-planning`)
โจทย์ 18 (numeric 8 ข้อ: NPS ร้อยละพึงพอใจ QFD พิกัดสะสมแบบแย่ที่สุดและ RSS) ภาพ 2: `kano.svg` `hoq.svg` (ใช้ใน p007 p008) full 10 จาก 18 ตัวชี้วัด partial: CQE III.A (ไม่ได้สอนการจัดระดับ critical/major/minor) CMQOE V.B TQA 3.1 3.2 PMQA 3.1 3.3 Baldrige 3.P2 3.P3 เกณฑ์ NPS (9–10 / 0–6) ตามนิยามทั่วไป

## management.quality.iso-management-systems (`iso-management-systems`)
โจทย์ 18 (match mcq numeric order; ยาก 3/3/5/4/3) ภาพ 2: `risk-matrix.svg` (บทเรียนและ p005 p006) `audit-flow.svg` iso-9001-2015 ข้อ 6.1 7.1 7.5 8.4 9.2 9.3 10.2 → full ข้ออื่นสรุปในตารางจึง partial **ไม่แน่ใจ**: สถานะการปรับปรุง ISO 9001 ฉบับใหม่ (คาดว่าออกช่วง 2026) ไม่ได้ตรวจ บทเรียนจึงอ้างฉบับ 2015 และบอกให้ตรวจฉบับล่าสุด เกณฑ์แบ่งระดับในเมทริกซ์ความเสี่ยง (1–4, 5–9, 10–14, 15–25) เป็นตัวอย่างที่ระบุว่าองค์กรกำหนดเอง **ข้อเสนอ**: หัวข้อนี้ผูกตัวชี้วัด 36 ตัว อาจแยก "การตรวจติดตามภายใน" เป็นหัวข้อย่อยในอนาคตเพื่อให้ข้อ 4–8 ได้ full

## management.operations.maintenance-reliability (`maintenance-reliability`)
โจทย์ 18 (numeric 10 ข้อ) ภาพ 2: `bathtub.svg` `rbd.svg` (p008) CQE III.E → full อีกสามตัว partial **ข้อเสนอ**: $R(t) = e^{-\lambda t}$ ใช้การแจกแจงเอกซ์โพเนนเชียลซึ่งสอนใน `math.stats.normal-distribution` ไม่ใช่ใน `math.prob.probability` บทเรียนอธิบายสูตรเองและโจทย์ใช้แค่การแทนค่า แต่อาจเพิ่ม prerequisite หรือ encompasses ภายหลัง

## management.quality.acceptance-sampling (`acceptance-sampling`)
โจทย์ 18 (numeric 9 ข้อ: Pa ทวินาม ปัวซง ไฮเพอร์จีโอเมตริก α β AOQ ATI ขนาดตัวอย่างต่ำสุด) ภาพ 2: `oc-curve.svg` `p-oc.svg` (p010 p011) CQE IV.C → full อีกสามตัว partial อ้าง NIST e-Handbook 6.2 (สาธารณสมบัติ ใส่ `source: nist`, `license: public-domain`)

## management.quality.spc (`spc`)
โจทย์ 19 (numeric 11 ข้อ) ภาพ 3: `xbar-r.svg` (ข้อมูลจำลอง seed 7 กลุ่มที่ 16 เลื่อน +4 mL) `we-zones.svg` `p-run.svg` (p010 ตรวจด้วยโค้ดว่าสัญญาณแรกคือวันที่ 17 ตามกฎข้อ 4) CQE VI.F CSSGB VI.A VI.B → full ไม่ซ้ำแผนภูมิ p ที่สอนแล้วใน qc-tools (ใช้ np แทน) ความสามารถของกระบวนการ (Cp Cpk) เว้นไว้ให้ `management.quality.process-capability`

## management.org.leadership-motivation (`leadership-motivation`)
โจทย์ 18 (mcq 10 match 3 numeric 4 order 1) ภาพ 2: `maslow.svg` `situational.svg` CMQOE I.C CQE I.D CQE I.E → full อีกสี่ตัว partial ป้าย R1–R4 ใช้ "ทำได้/ทำไม่ได้ + มั่นใจ/ไม่มั่นใจ" ตามแบบที่ตำราไทยนิยม ต้นฉบับของเฮอร์ซีย์และบลานชาร์ดใช้ทั้ง unwilling และ insecure ในแต่ละระดับ

## หมายเหตุอื่น

- `npm run validate -- --strict`: ไม่มี error/warning จากโฟลเดอร์ของชุดนี้ error 2 และ warning 2 มาจาก `engineering/digital-logic` (ชุดอื่นที่ยังเขียนไม่เสร็จ: ยังไม่มี problems.yaml)
- `npm test -w @klangru/content-tools`: ผ่าน 35/35
- ลิงก์อ้างอิงทุกลิงก์ตรวจด้วย curl ได้ HTTP 200 และตรวจ `<title>` ของหน้า OpenStax และ NIST ว่าตรงเรื่อง (ลบ Operating_characteristic และ X-bar_and_R_chart ที่ได้ 404)
