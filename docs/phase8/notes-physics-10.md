# บันทึกชุดงาน physics-10 (เฟส 8)

ฟิสิกส์ 8 หัวข้อจาก `docs/phase6/proposals-science-core.yaml`, `proposals-science-additional.yaml` และ `proposals-international.yaml` (รวมแถว `extend:` ทุกแถว) ภาพทุกภาพวาดเองเป็น SVG ด้วยสคริปต์ Python ที่คำนวณพิกัด (scratchpad `phase8-physics-10/fig_*.py`, ตัวช่วย `svg.py`, `circ.py` สัญลักษณ์วงจร, `rays.py` แผนภาพรังสี, `graph.py` แกนกราฟ) เรนเดอร์เป็น PNG ด้วย Chromium และเปิดตรวจทุกภาพ ไม่มีภาพจาก Commons คำตอบและค่า misconception ทุกตัวคำนวณด้วย python3 จำนวนคำของบทเรียนนับด้วย `Intl.Segmenter` อยู่ที่ 668–939 คำ ลิงก์อ้างอิงและ PhET ทุกลิงก์ตรวจแล้วได้ HTTP 200 (หน้าวิกิพีเดียไทยที่เป็นหน้าเปลี่ยนทางใช้ชื่อหน้าปลายทางแทน) ไฟล์จับคู่หลักสูตรอยู่ใน `docs/phase8/mappings/` ครบ 31 ตัวชี้วัด

ภาพแผนภาพรังสีและแผนภาพแรงคำนวณเชิงเรขาคณิตจริง: รังสีหลักลากจากปลายวัตถุตามกฎ (ให้สะท้อนหรือหักเหที่เส้นตั้งฉากผ่านขั้วกระจกหรือกลางเลนส์ตามแบบแผนภาพในบทเรียนเดิม) และตรวจว่ารังสีทั้งสามตัดกันที่ตำแหน่งที่สูตร 1/f = 1/s + 1/s′ ให้ ภาพความลึกปรากฏไล่รังสีด้วยกฎของสเนลล์ (n = 1.33) แล้วหาจุดตัดของแนวต่อ ลูกศรในแผนภาพแรงยาวเป็นสัดส่วนกับขนาดแรงในแต่ละภาพ ขั้วแบตเตอรี่ในแผนภาพวงจร (เส้นยาว = ขั้วบวก) ตรวจให้ตรงกับทิศของไดโอดและแอลอีดีทุกภาพ

## physics/magnets (`physics.magnetism.magnets`)

- โจทย์ 18 ข้อ (1:3 2:4 3:5 4:4 5:2; mcq text match numeric order) ภาพ 4 ภาพ (`clips.svg`, `poles.svg`, `ring-magnets.svg` ใช้ใน p013, `three-magnets.svg` ใช้ใน p014) ซิมูเลชัน PhET Magnets and Electromagnets
- `us-ngss:3-PS2-3` เป็น partial (สอนเฉพาะแรงแม่เหล็ก แรงไฟฟ้าอยู่ใน `physics.electricity.charge`)
- เลี่ยงตัวอย่างเหรียญบาท (วัสดุต่างตามรุ่น) และเพิ่มคำเตือนเรื่องกลืนแม่เหล็กชิ้นเล็ก

## physics/simple-circuits (`physics.electricity.simple-circuits`)

- โจทย์ 18 ข้อ (1:3 2:4 3:4 4:4 5:3; mcq match numeric order text) ภาพ 5 ภาพ (`picture-diagram.svg`, `series-parallel.svg`, `cells-series.svg`, `p-broken-series.svg` ใช้ใน p009, `p-switch-branch.svg` ใช้ใน p011 p012) ซิมูเลชัน PhET Circuit Construction Kit: DC
- `ว 2.3 ป.6/2`, `ป.6/3`, `ป.6/5` เป็น partial เพราะการวาดแผนภาพเองและการทดลองต่อวงจรจริงทำนอกแอป
- ไม่คำนวณกฎของโอห์ม (อยู่ใน `physics.electricity.circuits`) ใช้เฉพาะการรวมความต่างศักย์ของเซลล์อนุกรม

## physics/variable-force-work (`physics.energy.variable-force-work`)

- โจทย์ 18 ข้อ (1:2 2:3 3:4 4:6 5:3; numeric mcq text match expression) ภาพ 5 ภาพ (`fx-area.svg`, `hooke.svg`, `p-trapezoid.svg` p007, `p-net-force.svg` p014, `p-curve.svg` p018) สื่อโต้ตอบ function-plot ของ kx กับ ½kx² และซิมูเลชัน PhET Hooke's Law
- ไม่ซ้ำกับ `physics.energy.work` และ `physics.energy.kinetic-potential` (ซึ่งมี ½kx² และทฤษฎีบทงาน–พลังงานแบบพื้นฐาน) หัวข้อนี้เน้นกราฟหลายช่วง พื้นที่ใต้แกน การนับช่อง ระยะยืดเทียบความยาว งานช่วง x₁ ถึง x₂ และงานของแรงลัพธ์ที่ไม่คงตัว
- `ฟิสิกส์ 1 ม.4/11` เป็น partial (การคำนวณ Ek และ mgh พื้นฐานอยู่ในหัวข้อ kinetic-potential)
- p018 จำนวนช่อง 48 มาจากพื้นที่จริงของเส้นโค้งในภาพ (4.83 J) ยอมรับ 4.7–4.9 J

## physics/ray-diagrams (`physics.light.ray-diagrams`)

- โจทย์ 19 ข้อ (1:2 2:3 3:5 4:5 5:4; mcq text match numeric order) ภาพ 6 ภาพ (`lens-converging.svg`, `mirror-concave.svg`, `virtual-images.svg`, `plane-mirror.svg`, `apparent-depth.svg`, `p-which-ray.svg` ใช้ใน p006 ซึ่งตั้งใจวาดรังสีเส้นที่ 3 ผิดให้ผู้เรียนหา) ซิมูเลชัน PhET Geometric Optics
- ใช้ระบบเครื่องหมายเดียวกับ `physics.light.reflection` (f ของกระจกนูนและเลนส์เว้าเป็นลบ, m = |s′|/s)
- `ฟิสิกส์ 2 ม.5/10` เป็น partial (กฎของสเนลล์ มุมวิกฤต การสะท้อนกลับหมดอยู่ใน `physics.light.refraction`)
- ภาพความลึกปรากฏมองเฉียงราว 16–24° ภาพเหรียญจึงอยู่ที่ 1.38 m ไม่ใช่ 1.50 m ตามสูตรมองตั้งฉาก บอกไว้ในบทเรียนและคำบรรยายภาพ
- ข้อเสนอแก้แผน: หัวข้อนี้ทับกับส่วน "เขียนรังสีหาภาพ" ของหัวข้อ reflection/refraction อยู่บ้าง ควรให้หัวข้อเดิมอ้างหัวข้อนี้เป็นส่วนฝึกต่อ

## physics/free-body-practice (`physics.dynamics.free-body-practice`)

- โจทย์ 19 ข้อ (1:2 2:3 3:5 4:5 5:4; mcq text match numeric order) ภาพ 4 ภาพ (`fbd-cases.svg`, `collision.svg`, `p-which-fbd.svg` p006, `p-fbd-numbers.svg` p007) ซิมูเลชัน PhET Buoyancy: Basics
- `us-ngss:MS-PS2-1` และ `MS-PS2-2` เป็น partial (ออกแบบกันชนเชิงคุณภาพ และวางแผนการทดลองในโจทย์ ไม่ได้ทำจริง)
- ข้อเสนอแก้แผน: เพิ่ม `physics.dynamics.newton-third` เป็น prerequisite เพราะหัวข้อใช้คู่กิริยา–ปฏิกิริยาในการชน (ตอนนี้ใส่ใน encompasses ไม่ได้เพราะไม่ได้เป็น prerequisite)

## physics/electronics-intro (`physics.electricity.electronics-intro`)

- โจทย์ 18 ข้อ (1:2 2:3 3:5 4:4 5:4; mcq text match numeric order) ภาพ 6 ภาพ (`symbols.svg`, `led-circuit.svg`, `night-light.svg`, `p-diode.svg` p007, `p-bands.svg` p006, `p-diagrams.svg` p008) สื่อโต้ตอบ function-plot กระแสแอลอีดีกับความต้านทาน ไม่มีซิมูเลชัน PhET HTML5 ที่มีไดโอด/ทรานซิสเตอร์
- `ว 2.3 ม.3/7` เป็น partial (การต่อชิ้นส่วนจริงทำนอกแอป)
- ค่าที่ควรตรวจ: แอลอีดีแดงราว 2 V และ 20 mA, ไดโอดซิลิคอน 0.7 V, β ราว 100–300 (ค่าทั่วไป) บริบท "ย่านบ้านหม้อ" เป็นตลาดอะไหล่อิเล็กทรอนิกส์ในกรุงเทพฯ

## physics/simple-machines (`physics.energy.simple-machines`)

- โจทย์ 18 ข้อ (1:2 2:3 3:5 4:4 5:4; mcq text match numeric order) ภาพ 3 ภาพ (`pulleys.svg`, `ramp-wheel.svg`, `p-pulley.svg` p009 รอกพวงเชือกรับ 3 เส้น) ซิมูเลชัน PhET Balancing Act
- ไม่ซ้ำกับส่วนคานใน `physics.rotation.torque` (สามอันดับของคาน) และส่วนประสิทธิภาพใน `physics.energy.power` หัวข้อนี้เน้นหกชนิดของเครื่องกล การนับเชือกรอกพวง ล้อกับเพลา ลิ่ม สกรู และวิเคราะห์จากข้อมูล
- ค่าที่ควรตรวจ: เกณฑ์ทางลาด 1:12 ตามกฎกระทรวงกำหนดสิ่งอำนวยความสะดวกในอาคารสำหรับผู้พิการฯ (พ.ศ. 2548), รูปทรงครกกระเดื่องในโจทย์ p017 เป็นค่าสมมติ
- หัวข้อในแผน `physics.rotation.static-equilibrium` (ระดับ 6) ก็มีเครื่องกลอย่างง่ายและประสิทธิภาพ ควรให้หัวข้อนั้นมีหัวข้อนี้เป็น prerequisite

## physics/resistivity-drift (`physics.electricity.resistivity-drift`)

- โจทย์ 18 ข้อ (1:1 2:3 3:5 4:5 5:4; mcq text numeric match expression order) ภาพ 2 ภาพ (`drift.svg`, `geometry.svg`) ไม่มีภาพในโจทย์เพราะโจทย์เป็นการคำนวณจากค่าที่ให้ ซิมูเลชัน PhET Resistance in a Wire
- `ฟิสิกส์ 3 ม.5/8` เป็น partial (กฎของโอห์มและความต้านทานสมมูลอยู่ในหัวข้อ current-voltage และ circuits)
- ค่าที่ควรตรวจ: สภาพต้านทานที่ 20 °C (เงิน 1.6, ทองแดง 1.7, อะลูมิเนียม 2.65–2.7, ทังสเตน 5.6 × 10⁻⁸; นิโครม 1.1 × 10⁻⁶ Ω·m; ซิลิคอนบริสุทธิ์ "ราว 10³" ขึ้นกับความบริสุทธิ์), n ของทองแดง 8.5 × 10²⁸ m⁻³ ความต้านทานไส้หลอดเย็น/ร้อน 40/480 Ω ในโจทย์ p016 เป็นค่าตัวอย่าง

## การตรวจ

- `npm run validate -- --strict --only=<8 โฟลเดอร์>`: 0 error 0 warning
- `npm run validate -- --strict` ทั้งคลัง: error 10 รายการ คำเตือน 1 รายการ ทั้งหมดจากโฟลเดอร์ของชุดอื่นที่กำลังเขียนอยู่ (biology/cellular-respiration, english/describing-self, instructions-directions, needs-help, non-text-information, past-continuous, politeness, health/skill-learning-teamwork, math/patterns) ไม่มีจากชุดนี้
- `npm test -w @klangru/content-tools`: ผ่าน 33/33
