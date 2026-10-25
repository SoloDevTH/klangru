# บันทึกชุดงาน physics-2 (เฟส 8)

ฟิสิกส์ 8 หัวข้อจาก `docs/phase6/proposals-science-core.yaml`, `proposals-science-additional.yaml` และ `proposals-international.yaml` (รวมแถว `extend:` ทุกแถว) ภาพทุกภาพวาดเองเป็น SVG ด้วยสคริปต์ Python ที่คำนวณพิกัด (scratchpad `phase8-physics-2/fig_*.py`) เรนเดอร์เป็น PNG ด้วย Chromium และเปิดตรวจทุกภาพแล้ว ไม่มีภาพจาก Commons คำตอบและค่า misconception ทุกตัวคำนวณด้วย python3 จำนวนคำของบทเรียนนับด้วย `Intl.Segmenter` อยู่ที่ 690–980 คำ ลิงก์อ้างอิงและ PhET ทุกลิงก์ตรวจแล้วได้ HTTP 200 ไฟล์จับคู่หลักสูตรอยู่ใน `docs/phase8/mappings/` ครบ 59 ตัวชี้วัด

หัวข้อระดับ 1.5–1.8 เขียนด้วยประโยคสั้นสำหรับประถม และไม่คำนวณเชิงปริมาณที่หัวข้อเดิมสอนอยู่แล้ว (`physics.waves.sound`, `physics.dynamics.forces`, `physics.energy.kinetic-potential`, `physics.electricity.electric-power`)

## physics/forces-intro (`physics.dynamics.forces-intro`)

- โจทย์ 18 ข้อ (1:3 2:4 3:4 4:4 5:3; mcq numeric match order text) ภาพ 3 ภาพ (`force-effects.svg`, `spring-scale.svg`, `spring-scale-reading.svg` ใช้ในโจทย์ p005) ซิมูเลชัน PhET Forces and Motion Basics
- ข้อเสนอแก้แผน: ควรเพิ่มหัวข้อนี้เป็น prerequisite ของ `physics.dynamics.forces`
- ค่าที่ปัดให้เด็ก: มวล 1 kg หนัก "ประมาณ 10 N" (บอกในแฟลชการ์ดว่าค่าละเอียดคือ 9.8 N) และแรงโน้มถ่วงบนดวงจันทร์ราว 1/6 ของโลก

## physics/light-shadows (`physics.light.light-shadows`)

- โจทย์ 17 ข้อ (1:3 2:4 3:4 4:4 5:2; mcq match order text numeric) ภาพ 3 ภาพ (`seeing.svg`, `umbra-penumbra.svg`, `shadow-setup.svg` ใช้ในโจทย์ p015 โดยไม่วาดเงา)
- `ว 2.3 ป.6/8` (เขียนแผนภาพรังสี) เป็น partial เพราะแอปให้วาดเองไม่ได้ ใช้การอ่านแผนภาพแทน
- ข้อเสนอแก้แผน: ควรเป็น prerequisite ของ `physics.light.reflection`
- คำแนะนำเรื่องดูสุริยุปราคา (ห้ามใช้ฟิล์มเอกซเรย์ ใช้แว่นสำหรับดูดวงอาทิตย์) ตามแนวทางทั่วไปของสมาคมดาราศาสตร์ ผู้ตรวจควรเทียบกับคำแนะนำของ สดร. อีกครั้ง

## physics/energy-electricity-intro (`physics.energy.energy-electricity-intro`)

- โจทย์ 17 ข้อ (1:3 2:4 3:4 4:4 5:2; mcq match numeric order text) ภาพ 2 ภาพ (`power-station.svg`, `ke-bars.svg` ใช้ในโจทย์ p012 p013) ซิมูเลชัน PhET Energy Forms and Changes
- `us-ngss:MS-PS3-1` และ `MS-PS3-5` เป็น partial (อ่านกราฟแท่งและให้เหตุผลเชิงคุณภาพ ส่วนสูตร ½mv² อยู่ใน `physics.energy.kinetic-potential`)
- ค่าจากโลกจริงที่ควรตรวจ: "ไทยผลิตไฟฟ้าจากก๊าซธรรมชาติมากที่สุด" (เขียนเชิงคุณภาพ ไม่ใส่ร้อยละ), คำแนะนำตั้งเครื่องปรับอากาศ 25–26 °C, ค่าไฟหน่วยละ 4 บาทในโจทย์เป็นค่าประมาณ

## physics/sound-intro (`physics.waves.sound-intro`)

- โจทย์ 18 ข้อ (1:3 2:4 3:4 4:4 5:3; mcq numeric match text) ภาพ 4 ภาพ (`sound-wave-model.svg`, `decibel-scale.svg`, `ruler-overhang.svg` ใช้ในโจทย์ p004, `waves-abc.svg` ใช้ในโจทย์ p012 p013) ซิมูเลชัน PhET Sound Waves
- `ว 2.3 ป.5/4` (วัดระดับเสียงด้วยเครื่องมือ) เป็น partial เพราะแอปไม่ได้วัดเสียงจริง
- ข้อเสนอแก้แผน (ตามหมายเหตุในแผน): เพิ่มหัวข้อนี้เป็น prerequisite ของ `physics.waves.sound`
- ค่าที่ควรตรวจ: เกณฑ์ 85 dB ต่อการฟังนานหลายชั่วโมง (เกณฑ์ 8 ชั่วโมงของงานอาชีวอนามัย), 120 dB เจ็บหู, ค่าระดับเสียงเฉลี่ย 24 ชั่วโมงไม่เกิน 70 dB ของกรมควบคุมมลพิษ (ประกาศคณะกรรมการสิ่งแวดล้อมแห่งชาติ ฉบับที่ 15 พ.ศ. 2540) และค่าเดซิเบลตัวอย่างในภาพ (เป็นค่าโดยประมาณ) โจทย์ p017 ใช้ "ห่าง 10 เท่า ลด 20 dB" ซึ่งถือว่าเสียงกระจายในที่โล่ง

## physics/experiments-graphs (`physics.units.experiments-graphs`)

- โจทย์ 18 ข้อ (1:2 2:4 3:5 4:4 5:3; numeric mcq order match expression) ภาพ 3 ภาพ (`spring-graph.svg`, `pendulum-linearize.svg`, `heating-graph.svg` ใช้ในโจทย์ p006 p007) ซิมูเลชัน PhET Curve Fitting
- ไม่ซ้ำกับ `physics.units.measurement` (ซึ่งมีส่วนกราฟเส้นตรงสั้น ๆ) หัวข้อนี้เน้นประวัติแนวคิด การรายงานความไม่แน่นอน แถบความคลาดเคลื่อน ความชันและจุดตัดแกนพร้อมหน่วย การทำข้อมูลให้เป็นเส้นตรง และการต่อเส้นนอกช่วงข้อมูล
- ปี ค.ศ. ของการค้นพบในบทเรียน (กาลิเลโอ "ราว ค.ศ. 1600", นิวตัน 1687, ฟาราเดย์ 1831, แมกซ์เวลล์ 1865, เฮิรตซ์ 1887, ไอน์สไตน์ 1905/1915, ทรานซิสเตอร์ 1947) ตรวจจากความรู้ทั่วไป ค่าโดยสารแท็กซี่ในโจทย์ p017 เป็นค่าสมมติ

## physics/digital-signals (`physics.waves.digital-signals`)

- โจทย์ 17 ข้อ (1:2 2:3 3:4 4:5 5:3; numeric mcq text match) ภาพ 3 ภาพ (`analog-to-digital.svg`, `noise-regeneration.svg`, `morse-table.svg` ใช้ในโจทย์ p002 p014) สื่อโต้ตอบ function-plot แสดงผลของอัตราสุ่มวัด (ใช้ `\operatorname{floor}` ตรวจแล้วว่า `compileLatex` ของแอปคำนวณได้)
- บางส่วนซ้อนกับ `computer.data.binary` (อัตราสุ่มวัดของเพลงซีดี) หัวข้อนี้จึงเน้นสัญญาณรบกวน การสร้างสัญญาณใหม่ บิตภาวะคู่ อัตราบิต และการประเมินข้อดีข้อจำกัด
- ค่าที่ควรตรวจ: ไทยเปลี่ยนเป็นทีวีดิจิทัลภาคพื้นดินในช่วง พ.ศ. 2557–2563

## physics/em-spectrum-intro (`physics.waves.em-spectrum-intro`)

- โจทย์ 17 ข้อ (1:2 2:3 3:5 4:4 5:3; numeric mcq order match) ภาพ 2 ภาพ (`em-wave.svg`, `em-spectrum.svg`) สื่อโต้ตอบ function-plot ความยาวคลื่นกับความถี่ (ไม่มี PhET HTML5 ที่ตรงเรื่อง หน้า radio-waves ไม่มีรุ่น HTML5)
- หน้า th.wikipedia "คลื่นแม่เหล็กไฟฟ้า" เปลี่ยนทางไปที่ "รังสีแม่เหล็กไฟฟ้า" จึงอ้างหน้าหลักแทน
- ค่าที่ควรตรวจ: ขอบเขตความยาวคลื่นของแต่ละช่วงในตาราง (ไม่มีเส้นแบ่งตายตัว), ดาวเทียมค้างฟ้า "ประมาณ 36,000 km" (ค่าจริง 35,786 km), ข้อความเรื่องคลื่นโทรศัพท์มือถือเขียนว่า "ยังไม่มีหลักฐานชัดเจนว่าเป็นอันตรายที่ระดับที่ใช้ทั่วไป" (IARC จัดเป็นกลุ่ม 2B)

## physics/colour-atmospheric-optics (`physics.light.colour-atmospheric-optics`)

- โจทย์ 18 ข้อ (1:1 2:4 3:6 4:4 5:3; mcq numeric match text) ภาพ 4 ภาพ (`colour-mixing.svg` ใช้ `mix-blend-mode` screen/multiply ซึ่งต้องแสดงในเบราว์เซอร์ที่รองรับ CSS blend, `sky-colour.svg`, `raindrop.svg` วาดตามการไล่รังสีจริงด้วย n = 1.331/1.343, `mirage.svg`) ซิมูเลชัน PhET Color Vision
- `us-ngss:MS-PS4-2` เป็น partial (ใช้กับแสงเท่านั้น คลื่นกลอยู่ใน `physics.waves.wave-behaviour`)
- ค่าที่ควรตรวจ: ความชุกของตาบอดสี "ราวร้อยละ 4–8 ของผู้ชาย น้อยกว่าร้อยละ 1 ของผู้หญิง" (ต่างตามประชากร ไม่พบตัวเลขของไทยที่ตรวจได้), ดรรชนีหักเหของน้ำแข็ง 1.31 สำหรับมุมทรงกลด 21.8°, การทดสอบตาบอดสีในการทำใบขับขี่
- บทเรียน 977 คำ ใกล้เพดาน 1,000 คำ เพราะตัวชี้วัดสี่ข้อครอบคลุมหกปรากฏการณ์

## การตรวจ

- `npm run validate -- --strict --only=<8 โฟลเดอร์>`: 0 error 0 warning
- `npm run validate -- --strict` ทั้งคลัง: error 1 รายการจากโฟลเดอร์ของชุดอื่น (`health/recreation/topic.yaml` ไม่พบไฟล์ ซึ่งกำลังเขียนอยู่) ไม่ใช่ของชุดนี้
- `npm test -w @klangru/content-tools`: ผ่าน 33/33
