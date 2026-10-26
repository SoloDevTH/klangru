# บันทึกชุดงาน physics-21 (เฟส 8)

ฟิสิกส์ 8 หัวข้อจาก `docs/phase6/proposals-science-additional.yaml`, `proposals-advanced.yaml`, `proposals-science-core.yaml` และ `proposals-international.yaml` (รวมแถว `extend:` ของ radioactivity) ภาพทุกภาพวาดเองเป็น SVG ด้วยสคริปต์ Python ที่คำนวณพิกัด (scratchpad `phase8-physics-21/fig_*.py` ตัวช่วย `svg.py` `graph.py`) เรนเดอร์เป็น PNG ด้วย Chromium และเปิดตรวจทุกภาพ ไม่มีภาพจาก Commons คำตอบและค่า misconception ทุกตัวคำนวณด้วย python3 สูตรในสื่อโต้ตอบผ่าน `compileLatex` และตรวจค่าตัวอย่างแล้ว จำนวนคำของบทเรียนนับด้วย `Intl.Segmenter` อยู่ที่ 674–995 คำ ลิงก์อ้างอิงและ PhET ทุกลิงก์ได้ HTTP 200 (ตรวจชื่อหน้า OpenStax และหน้าวิกิพีเดียไทยไม่ใช่หน้าเปลี่ยนทาง) PhET ที่ใช้เป็น HTML5 ทั้งหมด (ตรวจว่ามีไฟล์ `sims/html/<ชื่อ>/latest/`) ไฟล์จับคู่หลักสูตรอยู่ใน `docs/phase8/mappings/` ครบ 28 ตัวชี้วัด

สัญลักษณ์ตามหนังสือ สสวท.: ค่าคงตัวโบลซ์มันน์ $k_B$ อัตราเร็วอาร์เอ็มเอส $v_{\text{rms}}$ สลิตคู่/เกรตติง $d\sin\theta = n\lambda$ และ $d\frac{x}{L} = n\lambda$ งาน $W_{A\to B} = q(V_B - V_A)$ สนามสม่ำเสมอ $E = V/d$ ฟลักซ์ $\Phi_B = BA\cos\theta$ (มุมกับเส้นตั้งฉาก) โมเมนต์บนขดลวด $M = NIAB\cos\theta$ (มุมระหว่างระนาบขดลวดกับสนาม) ความตึงผิว $\gamma = F/l$ ค่าคงตัว $g = 9.8$, $k = 9.0 \times 10^9$, $e = 1.6 \times 10^{-19}$, $R = 8.31$, $\mu_0 = 4\pi \times 10^{-7}$

## physics/radioactivity (`physics.nuclear.radioactivity`)

- โจทย์ 18 ข้อ (1:2 2:4 3:5 4:4 5:3; mcq match numeric text order) ภาพ 3 ภาพ (`penetration.svg`, `decay-curve.svg`, `p-activity-graph.svg` ใช้ใน p011) สื่อโต้ตอบ function-plot $N = 100(\tfrac12)^{x/T}$ และ PhET Build a Nucleus
- ครึ่งชีวิตทุกค่าจาก IAEA LiveChart of Nuclides (API `nds.iaea.org/relnsd/v1/data`, ดึง 25 ต.ค. 2569): F-18 109.77 min, Tc-99m 6.0072 h, Rn-222 3.8222 d, I-131 8.0252 d, Co-60 1925.28 d (5.27 y), Cs-137 30.08 y, C-14 5700 y, U-238 4.468 × 10⁹ y โจทย์ p003 ใช้ "ประมาณ 8 วัน" เพื่อให้นับครึ่งชีวิตเป็นจำนวนเต็ม
- ความปลอดภัย: แยกการได้รับรังสีจากภายนอกกับการเปรอะเปื้อน (ตาม UKNC AS-06) หลักเวลา ระยะทาง เครื่องกำบัง กากกัมมันตรังสี และคำแนะนำเมื่อพบวัตถุมีสัญลักษณ์รังสี (อย่าจับ อย่าเก็บ อย่าแกะ ออกห่าง แจ้งตำรวจ 191 หรือ ปส. ป่วยโทร 1669) เหตุการณ์สมุทรปราการ พ.ศ. 2543 (โคบอลต์-60 ได้รับรังสีสูง 10 คน เสียชีวิต 3 คน) ตรงกับรายงาน IAEA STI/PUB/1124 และวิกิพีเดีย
- ค่าที่ควรตรวจ: ไม่ได้ใส่เลขสายด่วนของ ปส. เพราะค้นแล้วยืนยันจากแหล่งทางการไม่ได้ (เว็บ oap.go.th ตอบ 503 ระหว่างทำ) ผู้ตรวจควรเพิ่มเลขที่ถูกต้องถ้ามี รังสีพื้นหลังเฉลี่ย 2.4 mSv ต่อปีเป็นค่าของ UNSCEAR การใช้ Am-241 ใน "เครื่องตรวจจับควันบางรุ่น" และ Cs-137 ในเครื่องวัดในโรงงานเขียนเชิงทั่วไป
- `ว 2.1 ม.5/25` partial (สืบค้นและนำเสนอนอกแอป) `us-ngss:HS-PS1-8` partial (ฟิชชันฟิวชันอยู่ในหัวข้อพลังงานนิวเคลียร์)

## physics/kinetic-theory (`physics.thermal.kinetic-theory`)

- โจทย์ 18 ข้อ (1:2 2:3 3:5 4:5 5:3; mcq match numeric expression) ภาพ 2 ภาพ (`pv-isotherms.svg`, `molecule-wall.svg`) ไม่มีภาพในโจทย์เพราะโจทย์เป็นการคำนวณจากค่าที่ให้ สื่อโต้ตอบ function-plot $v_{\text{rms}}(T)$ และ PhET Gas Properties
- รวมกฎของบอยล์ ชาร์ล เกย์-ลูสแซก ไว้ในบทเรียนด้วย เพราะ `chemistry.gases.gas-laws` ยังไม่มีในคลัง
- ข้อเสนอแก้แผน: หัวข้อนี้ซ้อนกับ `physics.thermal.kinetic-theory-thermodynamics` ในแผน science-additional (ทฤษฎีจลน์ อัตราเร็ว rms ผูก `ฟิสิกส์ 4 ม.6/8`) ควรรวมกัน หรือให้หัวข้อนั้นใช้หัวข้อนี้เป็น prerequisite แล้วเหลือเฉพาะงานของแก๊สและกฎข้อที่หนึ่ง (`ม.6/9`) และอาจย้าย `ฟิสิกส์ 4 ม.6/8` มาผูกหัวข้อนี้
- `us-ngss:HS-PS3-2` partial (ผู้เรียนไม่ได้สร้างแบบจำลองเอง)

## physics/interference-diffraction (`physics.light.interference-diffraction`)

- โจทย์ 17 ข้อ (1:2 2:3 3:5 4:4 5:3; mcq match numeric text order) ภาพ 3 ภาพ (`double-slit.svg` ไม่ตามมาตราส่วน ระบุในภาพ, `patterns.svg` คำนวณความเข้มจริงของสลิตคู่ สลิตเดี่ยว และเกรตติง 8 ช่อง, `p-fringes.svg` ใช้ใน p005) สื่อโต้ตอบ function-plot ความเข้มสลิตคู่ และ PhET Wave Interference
- ไม่ซ้ำกับ `physics.waves.wave-behaviour` (การแทรกสอดคลื่นน้ำและเสียง) หัวข้อนี้เน้นแสง สูตรตำแหน่งแถบ เกรตติง สลิตเดี่ยว และแถบที่หายไปในสลิตคู่ (p014)
- ไม่แน่ใจ: ใช้ $a$ แทนความกว้างสลิตเดี่ยว (เขียนในบทเรียนว่าบางตำราใช้ $d$) ผู้ตรวจควรเทียบกับสัญลักษณ์ในหนังสือ สสวท. ฉบับปัจจุบัน ระยะร่องแผ่นซีดี 1.6 μm เป็นค่ามาตรฐานที่ใช้ทั่วไป

## physics/electric-potential (`physics.electricity.electric-potential`)

- โจทย์ 17 ข้อ (1:1 2:4 3:5 4:5 5:2; mcq match numeric expression) ภาพ 3 ภาพ (`superposition.svg` ลูกศรยาวตามขนาดสนามจริง 432 และ 518 N/C, `parallel-plates.svg`, `p-two-charges.svg` ใช้ใน p006) สื่อโต้ตอบ function-plot $V = kQ/r$ กับ $E = kQ/r^2$ และ PhET Charges and Fields
- ไม่ซ้ำกับ `physics.electricity.charge` (คูลอมบ์ สนามของจุดประจุเดียว) หัวข้อนี้เน้นรวมสนามแบบเวกเตอร์ สนามสม่ำเสมอ การเคลื่อนที่ของประจุ (มิลลิแกน การเบี่ยงของอิเล็กตรอน) พลังงานศักย์ ศักย์ และผิวสมศักย์

## physics/magnetic-flux-forces (`physics.magnetism.magnetic-flux-forces`)

- โจทย์ 17 ข้อ (1:1 2:4 3:5 4:4 5:3; mcq match numeric) ภาพ 3 ภาพ (`wire-solenoid.svg` ทิศสนามตรวจด้วยกฎมือขวา, `parallel-wires.svg`, `p-mass-spec.svg` รัศมีตามมาตราส่วนจริงของ C-12 กับ C-14 ใช้ใน p011) สื่อโต้ตอบ function-plot $B = \mu_0 I/2\pi r$ และ PhET Faraday's Electromagnetic Lab (หน้า Electromagnet)
- ไม่ซ้ำกับ `physics.magnetism.magnetic-field` ซึ่งมี $F = ILB\sin\theta$, $F = qvB\sin\theta$, $r = mv/qB$ และหลักการมอเตอร์กับแกลแวนอมิเตอร์เชิงคุณภาพ หัวข้อนี้ต่อด้วยฟลักซ์ สนามของลวดตรงและโซเลนอยด์ คาบ เครื่องคัดเลือกความเร็ว แมสสเปกโทรมิเตอร์ ลวดคู่ขนาน $M = NIAB\cos\theta$ และการดัดแปลงแกลแวนอมิเตอร์เป็นโวลต์มิเตอร์
- ค่าที่ควรตรวจ: สนามแม่เหล็กโลกแนวราบในไทย "ประมาณ 40 μT" ในตัวอย่างแสดงวิธีทำ (ค่าโดยประมาณจากสนามรวมราว 41 μT และมุมเอียงไม่มาก)

## physics/fluids-advanced (`physics.matter.fluids-advanced`)

- โจทย์ 18 ข้อ (1:1 2:5 3:6 4:4 5:2; mcq numeric order) ภาพ 4 ภาพ (`manometer-barometer.svg`, `surface-tension.svg`, `continuity-bernoulli.svg`, `p-utube.svg` ใช้ใน p004 สเกล 10 px ต่อ cm) สื่อโต้ตอบ function-plot ความเร็วที่ปลายสายยาง และ PhET Under Pressure
- แบ่งเนื้อหากับ `physics.fluids.fluid-dynamics` ตามงานมอบหมาย: หัวข้อนี้เป็นระดับหลักสูตรไทย มีแมนอมิเตอร์ บารอมิเตอร์ ความตึงผิว (รวม $h = 2\gamma\cos\theta/\rho g r$) ความหนืดเชิงคุณภาพ ของไหลอุดมคติ และบทนำสมการความต่อเนื่องกับแบร์นูลลีในท่อแนวราบ (ปีกเครื่องบิน กระบอกฉีด หลังคาปลิว) ส่วนแบร์นูลลีที่มีความสูง เวนจูรี ทอร์ริเชลลี และความหนืดเชิงปริมาณอยู่ในหัวข้อ fluid-dynamics
- หมายเหตุ: งานมอบหมายเรียกหัวข้อนี้ว่าระดับ ม.5 แต่ตัวชี้วัด `ฟิสิกส์ 4 ม.6/3` `ม.6/5` `ม.6/6` ในกรอบหลักสูตรเป็นระดับ ม.6
- ไม่ซ้ำกับ `physics.matter.pressure-fluids` (บารอมิเตอร์ แมนอมิเตอร์พื้นฐาน พาสคัล อาร์คิมีดีส) ใช้ความรู้นั้นต่อ เครื่องอัดไฮดรอลิกมีเพียงโจทย์ทบทวน p018
- ค่าที่ควรตรวจ: ความหนืดในเฉลย p016 (น้ำ 0.001, น้ำมันพืชราว 0.05, กลีเซอรีนราว 1, น้ำผึ้ง 2–10 Pa s) ความดันแก๊สหุงต้มหลังหัวปรับราว 1.5 kPa ใน p003 เขียนเป็นค่าตัวอย่าง

## physics/fluid-dynamics (`physics.fluids.fluid-dynamics`)

- โจทย์ 18 ข้อ (1:2 2:3 3:5 4:6 5:2; mcq match numeric expression) ภาพ 3 ภาพ (`bernoulli-pipe.svg`, `torricelli.svg` วิถีน้ำคำนวณจริงจากรูลึก 0.25/0.50/0.75 m, `p-venturi.svg` ใช้ใน p006) สื่อโต้ตอบ function-plot ระยะน้ำพุ่ง $2\sqrt{x(H-x)}$ ไม่มีซิมูเลชัน PhET (Fluid Pressure and Flow เป็น Java ไม่มีรุ่น HTML5)
- **prerequisite: เพิ่ม `physics.matter.fluids-advanced`** (นอกเหนือจาก `physics.matter.pressure-fluids` และ `physics.energy.conservation` ตามแผน) ตามงานมอบหมาย เพราะหัวข้อนี้ใช้ของไหลอุดมคติ ความต่อเนื่อง และแบร์นูลลีแนวราบจากหัวข้อนั้นต่อ ผู้ประสานงานควรแก้แผนให้ตรง
- เนื้อหา: อัตราการไหล ที่มาของแบร์นูลลีจากงาน–พลังงาน ทอร์ริเชลลีกับระยะพุ่ง มาตรเวนจูรี ท่อพิโท กำลังปั๊ม กฎของปัวเซย์ เลขเรย์โนลด์ส และกฎของสโตกส์
- ค่าที่ควรตรวจ: ค่าวิกฤตเลขเรย์โนลด์ส "ราว 2000 / 3000" เขียนเป็นค่าประมาณ ตัวอย่างหลอดเลือดตีบใน p009 เป็นการประยุกต์กฎของปัวเซย์เชิงหลักการ (เลือดไม่ใช่ของไหลนิวตันแท้)

## physics/rotational-dynamics (`physics.rotation.rotational-dynamics`)

- โจทย์ 18 ข้อ (1:1 2:4 3:5 4:5 5:3; mcq match numeric order expression) ภาพ 3 ภาพ (`inertia-shapes.svg`, `rolling-race.svg` ตำแหน่งวัตถุคำนวณจากความเร่ง $g\sin\theta/(1+c)$ ณ เวลาเดียวกัน, `p-pulley.svg` ใช้ใน p009) สื่อโต้ตอบ function-plot อัตราเร็วที่ปลายพื้นเอียงกับ $c = I/MR^2$ ไม่มีซิมูเลชัน PhET (Torque เป็น Java)
- ใช้ $\tau$ แทนโมเมนต์ของแรงตามตำราระดับมหาวิทยาลัย และเขียนในบทเรียนว่าเป็นปริมาณเดียวกับ $M$ ใน `physics.rotation.torque`
- ใช้ตาราง $I$ ของทรงมาตรฐาน ไม่หาด้วยการอินทิเกรต (UPHYS1 10.5 ไม่ได้ผูกกับหัวข้อนี้)

## การตรวจ

- `npm run validate -- --strict --only=<8 โฟลเดอร์>`: 0 error 0 warning ทุกโฟลเดอร์
- `npm run validate -- --strict` ทั้งคลัง: error 6 รายการ ทั้งหมดเป็น "ไม่พบไฟล์ topic.yaml" จากโฟลเดอร์ของชุดอื่นที่กำลังเขียน (biology/circulation, english/research-skills, health/emotions-stress, health/media-ads-services, health/thai-growth-references, health/tobacco-alcohol) ไม่มีจากชุดนี้
- `npm test -w @klangru/content-tools`: ผ่าน 34/34
