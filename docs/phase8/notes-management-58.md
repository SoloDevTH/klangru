# บันทึกชุดงาน management-58 (เฟส 8)

แปดหัวข้อวิชาการจัดการจาก `docs/phase6/proposals-management.yaml` (ไม่มีแถว `extend:` ที่ผูกกับหัวข้อชุดนี้) โฟลเดอร์ใช้ส่วนท้ายของรหัส id ชื่อ ความยาก และ prerequisite ตามแผนทุกหัวข้อ prerequisite ทุกตัวมีในคลังแล้ว (`management.operations.lean` อยู่ที่ `content/management/lean-kaizen/`)

- ทุกหัวข้อมีโจทย์ 18 ข้อ ความยาก 1–5 ครบ ชนิดโจทย์ 4–5 แบบ บริบทไทยสมมติ (โรงพยาบาลชุมชน เทศบาล อบต. สำนักงานจังหวัด วิสาหกิจชุมชน OTOP โรงสี ขอนแก่น ลำปาง เชียงใหม่ ฯลฯ) ระบุ "สมมติ" ทุกครั้งที่เป็นข้อมูลแต่ง
- ตัวเลขทุกตัวคำนวณด้วย python3 และตรวจด้วยสคริปต์ว่า misconception ห่างจากคำตอบเกิน max(tolerance, 0.01) และเป็นผลของความผิดพลาดนั้นจริง ค่า z ใช้ `statistics.NormalDist` LP แก้ด้วยการไล่จุดยอดทุกคู่ของข้อจำกัดด้วย `fractions.Fraction` ปัญหาการขนส่งตรวจด้วยการไล่ทุกแผนจำนวนเต็ม กฎของจอห์นสันตรวจกับการไล่ทุกลำดับ (permutations)
- ภาพทุกภาพวาดเป็น SVG ด้วย Python จากพิกัดที่คำนวณ เรนเดอร์เป็น PNG ด้วย Chromium และเปิดดูทุกภาพ แก้จนป้ายไม่ทับกัน ภาพในโจทย์ (`p-*.svg`) ไม่มีคำตอบ ฮิสโทแกรมความสามารถใช้ข้อมูลจำลอง (seed 58 และ 7) ที่ปรับให้ค่าเฉลี่ยและ s ตรงกับที่ใช้ในบทเรียนพอดี
- **ลิขสิทธิ์มาตรฐาน**: PMBOK ASQ BoK และ ISO ไม่ได้ยกข้อความหรือคัดลอกตาราง หลักการของ PMBOK สรุปด้วยคำของคลังรู้ เกณฑ์ %GRR (10% / 30%) ndc ≥ 5 และอัตราความแม่นของมาตรฐาน 4 เท่า อธิบายเป็น "แนวทางที่ใช้กันแพร่หลาย" ไม่ได้อ้างตารางของคู่มือใด
- ไฟล์จับคู่ `docs/phase8/mappings/<รหัส>.yaml` ครบทุกตัวชี้วัดในแผน (ตรวจด้วยสคริปต์ว่าไม่ขาด ไม่เกิน ไม่ซ้ำ และรหัสมีอยู่ในกรอบ) ไม่มี `not_taught`
- ความยาวบทเรียน (Intl.Segmenter ไม่นับสมการ): organizational-behavior 1,066 public-administration 1,002 ที่เหลือ 746–874 คำ OB เกินเล็กน้อยเพราะครอบคลุมหกเรื่องตามขอบเขต ถ้าต้องตัด ตัดหัวข้อย่อย "การรับรู้และทัศนคติ" ให้สั้นลงได้

## management.org.organizational-behavior (`organizational-behavior`)
โจทย์ 18 (mcq 8 match 3 numeric 6 order 1) ภาพ 3: `tki-grid.svg` `lewin.svg` `p-forcefield.svg` (p007 p008) CMQOE III.B CQE I.F CQE I.I → full อีกห้าตัว partial ไม่ซ้ำทฤษฎีการจูงใจและภาวะผู้นำ (อ้าง leadership-motivation) ตัวเลขข้อ p015 (ข่าวผ่าน 4 ระดับ ระดับละ 80%) เป็นสมมติเพื่อแสดงหลักการ ไม่ใช่ข้อมูลวิจัย

## management.hr.human-resource-management (`human-resource-management`)
โจทย์ 18 (numeric 9) ภาพ 2: `kirkpatrick.svg` `p-funnel.svg` (p007) CMQOE VII.A VII.B VII.D CQE II.F PMQA 5.3 Baldrige 5.P3 → full อีกหกตัว partial **ไม่แน่ใจ (ตรวจกับแหล่งทางการไม่ได้)**: เว็บกระทรวงแรงงาน (mol.go.th บล็อกด้วย Incapsula) protection.labour.go.th labour.go.th krisdika.go.th ocs.go.th ocsc.go.th และ law.go.th เปิดไม่ได้จากเครื่องนี้ บทเรียนจึงกล่าวถึงกฎหมายคุ้มครองแรงงาน ค่าจ้างขั้นต่ำ ประกันสังคม และ ก.พ. แบบทั่วไป ไม่ใส่ตัวเลขชั่วโมงทำงาน อัตราค่าล่วงเวลา ค่าจ้างขั้นต่ำ หรืออัตราเงินสมทบ และให้ตรวจฉบับล่าสุดจากหน่วยงาน โจทย์ p012 ใช้อัตราค่าล่วงเวลา 1.5 และ 3 เท่าโดยเขียนว่า "สมมติให้" และบอกให้ตรวจอัตราจริงกับกระทรวงแรงงาน ผู้ตรวจควรเทียบกับพระราชบัญญัติคุ้มครองแรงงานฉบับปัจจุบัน

## management.public.public-administration (`public-administration`)
โจทย์ 18 (mcq 8 numeric 7) ภาพ 2: `thai-admin.svg` `p-permit.svg` (p007 p008) 5.2(1) PMQA 1.2 → full อีกสามตัว partial **ไม่แน่ใจ (ตรวจกับแหล่งทางการไม่ได้ เหตุผลเดียวกับข้างบน)**: (1) โครงสร้างสามส่วนและหน่วยในแต่ละส่วน (สำนักนายกรัฐมนตรี กระทรวง ทบวง กรม / จังหวัด อำเภอ / อบจ. เทศบาล อบต. กทม. เมืองพัทยา) และหลักรวม แบ่ง กระจายอำนาจ บทเรียนอ้าง "กฎหมายว่าด้วยระเบียบบริหารราชการแผ่นดิน" โดยไม่ระบุปีหรือมาตรา (2) หกหลักธรรมาภิบาล (นิติธรรม คุณธรรม ความโปร่งใส การมีส่วนร่วม ความรับผิดชอบ ความคุ้มค่า) ที่มาจากระเบียบสำนักนายกรัฐมนตรีปี 2542 บทเรียนไม่ได้อ้างชื่อระเบียบ (3) ก.พ. ดูแลข้าราชการพลเรือน ป.ป.ช. และ ITA กล่าวโดยทั่วไป ไม่มีชื่อบุคคลหรือพรรคการเมือง ไม่มีจำนวนจังหวัดหรืออำเภอ

## management.project.project-fundamentals (`project-fundamentals`)
โจทย์ 18 (mcq 8 numeric 7 match 2 order 1) ภาพ 3: `lifecycle.svg` `wbs.svg` (บทเรียนและ p007) `p-stakeholder.svg` (p006) PMBOK PR2 PR5 PD1 PD2 PD5 FA1 FA5 → full PR1 PR3 PR4 PR6 PD6 FA2 CSSGB II.C CMQOE III.C → partial ไม่สอน CPM (forward/backward pass, float) และมูลค่าที่ได้ เพราะอยู่ในขอบเขตของ `management.project.cpm-pert` ตามแผน บทเรียนบอกว่าจะเรียนต่อในหัวข้อนั้น ตัวเลขเชิงปริมาณใช้ WBS roll-up ช่องทางสื่อสาร n(n−1)/2 ทรัพยากรคน และความเร็วของทีม agile แทน

## management.operations.capacity-scheduling (`capacity-scheduling`)
โจทย์ 18 (numeric 12 order 2 mcq 3 match 1) ภาพ 3: `aggregate.svg` `johnson-gantt.svg` `p-gantt.svg` (p009) ทั้งห้าตัวชี้วัด partial เพราะแต่ละตัวกว้างกว่าหัวข้อ (8.2.7 ยังขาด MRP IE-3.5 แบ่งกับ maintenance-reliability และ linear-programming) แนวคิดคอขวดอ้าง lean-kaizen

## management.operations.inventory (`inventory`)
โจทย์ 18 (numeric 11) ภาพ 3: `eoq-cost.svg` `sawtooth.svg` `p-abc.svg` (p008) และ interactive function-plot ต้นทุนรวมพร้อมแถบเลื่อน S และ H 8.1.2 → full 8.2.6 (ระบบขนถ่ายวัสดุ) และ 5.5 → partial เกณฑ์แบ่ง ABC (80% / 95%) ระบุว่าองค์การกำหนดเอง

## management.operations.linear-programming (`linear-programming`)
โจทย์ 18 (numeric 9 expression 2 mcq 5 match 1 order 1) ภาพ 2: `feasible.svg` `p-feasible.svg` (p007 p008) ทั้งสามตัวชี้วัด partial (8.2.8 การวิจัยดำเนินการกว้างกว่า LP) ราคาเงาคำนวณโดยแก้ใหม่เมื่อทรัพยากรเพิ่ม 1 หน่วย ปัญหาการขนส่งสอนวิธีต้นทุนต่ำสุดและวิธีผลต่างต้นทุนสำหรับสองแหล่ง (ได้คำตอบที่ดีที่สุดจริง ตรวจด้วยการไล่ทุกแผน) ไม่สอน MODI/stepping-stone **ข้อเสนอ**: เพิ่ม `math.algebra.inequality-regions` (มีในคลังแล้ว สอนบริเวณของระบบอสมการและแนะนำกำหนดการเชิงเส้นไว้) เป็น prerequisite แทนหรือเพิ่มจาก `math.algebra.linear-inequalities` บทเรียนลิงก์ไปหัวข้อนี้แล้ว

## management.quality.process-capability (`process-capability`)
โจทย์ 18 (numeric 11) ภาพ 3: `capability.svg` `targets.svg` `p-capability.svg` (p007) CQE VI.G CSSGB III.F CQE IV.F CSSGB III.E → full CQE IV.E (ยังไม่สอนค่าความไม่แน่นอนของการวัด) และ CQE IV.D → partial ระบุว่าการเลื่อน 1.5σ เป็นข้อตกลง ไม่ใช่กฎธรรมชาติ สถาบันมาตรวิทยาแห่งชาติกล่าวเป็นปลายทางของการสอบกลับได้โดยไม่ระบุรายละเอียด **ข้อเสนอ**: ใช้การแจกแจงปกติมาก (ppm ระดับบริการ) ผ่าน spc ซึ่งมี `math.stats.normal-distribution` เป็น prerequisite อยู่แล้ว จึงคงไว้ตามแผน

## หมายเหตุอื่น

- `npm run validate -- --strict`: error 0 คำเตือน 0 ทั้งคลัง (ตอนตรวจไม่มี error จากโฟลเดอร์ของชุดอื่น)
- `npm test -w @klangru/content-tools`: ผ่าน 35/35
- ลิงก์อ้างอิง: OpenStax 5 ลิงก์และ NIST 2 ลิงก์ได้ HTTP 200 และตรวจ `<title>` ตรงเรื่อง (แก้ลิงก์ OpenStax ที่เดาไว้ผิดสองลิงก์ โดยดึงสารบัญจาก OpenStax archive) ลิงก์วิกิพีเดียทั้ง 25 ลิงก์ตรวจทีละหน้าได้ HTTP 200 (API ของวิกิมีเดียตอบ 429 ตลอด จึงตรวจได้แค่ว่าหน้ามีอยู่ ไม่ได้ตรวจ redirect) ชื่อบทความวิกิพีเดียไทยสองชื่อที่ได้ 404 ถูกเปลี่ยนเป็น "Local government in Thailand" (en) และ "กำหนดการเชิงเส้น" (th)
