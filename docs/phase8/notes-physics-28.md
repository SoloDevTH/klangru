# บันทึกชุดงาน physics-28 (เฟส 8)

ฟิสิกส์ 8 หัวข้อจาก `docs/phase6/proposals-science-additional.yaml`, `proposals-advanced.yaml`, `proposals-science-core.yaml` และ `proposals-international.yaml` (รวมแถว `extend:` ทุกแถว) ภาพทุกภาพวาดเองเป็น SVG ด้วยสคริปต์ Python ที่คำนวณพิกัด (scratchpad `phase8-physics-28/fig_*.py` ตัวช่วย `svg.py` `graph.py` `circ.py`) เรนเดอร์เป็น PNG ด้วย Chromium และเปิดตรวจทุกภาพ ไม่มีภาพจาก Commons คำตอบและค่า misconception ทุกตัวคำนวณด้วย python3 สูตรในสื่อโต้ตอบผ่าน `compileLatex` และตรวจค่าตัวอย่างแล้ว จำนวนคำของบทเรียนนับด้วย `Intl.Segmenter` อยู่ที่ 714–996 คำ ลิงก์อ้างอิงและ PhET ทุกลิงก์ได้ HTTP 200 (หน้าวิกิพีเดียไทย "คลื่นแม่เหล็กไฟฟ้า" เป็นหน้าเปลี่ยนทาง จึงใช้ "รังสีแม่เหล็กไฟฟ้า") PhET ที่ใช้เป็น HTML5 ทั้งหมด ไฟล์จับคู่หลักสูตรอยู่ใน `docs/phase8/mappings/` ครบ 44 ตัวชี้วัด

สัญลักษณ์: หัวข้อระดับ ม.5–6 ตามหนังสือ สสวท. คือ $Q = CV$, $U = \tfrac12 QV$ อีเอ็มเอฟเหนี่ยวนำ $\varepsilon = -N\Delta\Phi_B/\Delta t$ ค่า $V_{\text{rms}}$ $I_{\text{rms}}$ หม้อแปลง $V_s/V_p = N_s/N_p$ พลังงานยึดเหนี่ยว $\Delta m\,c^2$ กับ $1\ \mathrm{u} \to 931.5\ \mathrm{MeV}$ ฟังก์ชันงาน $W$ ความต่างศักย์หยุดยั้ง $V_s$ ระดับพลังงาน $E_n = -13.6/n^2\ \mathrm{eV}$ หัวข้อระดับมหาวิทยาลัย (first-law, second-law, potential-capacitance) ใช้สัญกรณ์ของ University Physics และเขียนบอกไว้ในบทเรียน กฎข้อที่หนึ่งใช้ $\Delta U = Q - W$ ($W$ คืองานที่ระบบทำ) ซึ่งตรงกับ $Q = \Delta U + W$ ของ สสวท. และบอกว่าตำราเคมี/วิศวกรรมบางเล่มใช้ $\Delta U = Q + W$ ค่าคงตัว $h = 6.63 \times 10^{-34}$, $c = 3.0 \times 10^8$, $e = 1.6 \times 10^{-19}$, $m_e = 9.1 \times 10^{-31}$, $\varepsilon_0 = 8.85 \times 10^{-12}$, $R = 8.31$ เหมือนชุดก่อน

## physics/capacitors (`physics.electricity.capacitors`)

- โจทย์ 18 ข้อ (1:2 2:5 3:5 4:4 5:2; mcq match numeric order) ภาพ 4 ภาพ (`capacitor-parts.svg` ทิศการไหลของอิเล็กตรอนตรงกับขั้วแบตเตอรี่, `qv-graph.svg`, `series-parallel.svg`, `p-network.svg` ใช้ใน p014) สื่อโต้ตอบ function-plot $U = \tfrac12 CV^2$ และ PhET Capacitor Lab: Basics
- ความจุของแผ่นขนานสอนเชิงสัดส่วน (พื้นที่ ระยะห่าง ไดอิเล็กทริก) ไม่ใช้ $\varepsilon_0A/d$ เพื่อแบ่งกับ potential-capacitance บริบทไทย: AED ในสถานีรถไฟฟ้า (ค่าสมมติ 200 J, 2000 V) เครื่องถ่ายเอกสารในโรงเรียน การต่อสายดินรถบรรทุกน้ำมัน
- หมายเหตุ: งานมอบหมายเรียกว่าระดับ ม.6 แต่ตัวชี้วัด `ฟิสิกส์ 3 ม.5/5` `ม.5/6` เป็นระดับ ม.5

## physics/nuclear-energy-particles (`physics.nuclear.nuclear-energy-particles`)

- โจทย์ 18 ข้อ (1:2 2:6 3:4 4:4 5:2; mcq match numeric text) ภาพ 3 ภาพ (`binding-curve.svg` จากค่าพลังงานยึดเหนี่ยวของนิวไคลด์ที่พบในธรรมชาติใน IAEA LiveChart API ดึง 26 ต.ค. 2569, `chain-reaction.svg`, `standard-model.svg`) ไม่มีสื่อโต้ตอบหรือ PhET (Nuclear Fission เป็น Java ไม่มีรุ่น HTML5 และ function-plot ไม่ช่วยในเรื่องนี้)
- มวลอะตอมจาก IAEA (AME): H-1 1.007825, n 1.008665, He-4 4.002603, C-12 12, U-235 235.043928, Ba-141 140.914404, Kr-92 91.926173 u ได้ Q ฟิชชัน 173 MeV, D–T 17.6 MeV, He-4 7.07 MeV ต่อนิวคลีออน
- บริบทไทย (เขียนเป็นข้อเท็จจริง ไม่เข้าข้างฝ่ายใด): เครื่องปฏิกรณ์ ปปว-1/1 ที่บางเขน วิกฤตครั้งแรก พ.ศ. 2505 (27 ต.ค. 1962 ตามรายงาน IAEA) ดูแลโดย สทน. ใช้ผลิตไอโซโทปและงานวิจัย ไม่ผลิตไฟฟ้า ไม่ได้ระบุกำลังเพราะแหล่งต่างกัน (1.2–2 MW) แผนโรงไฟฟ้านิวเคลียร์ชะลอหลังฟูกูชิมะ และร่าง PDP ช่วงหลังเสนอ SMR อีกครั้ง (ข่าว Bangkok Post/NEI ระบุ 600 MW ราว พ.ศ. 2580 ในร่าง PDP 2024 และร่างใหม่ขยายเป้า ยังไม่ได้รับอนุมัติ จึงไม่ใส่ตัวเลข) ข้อโต้แย้งทั้งสองฝ่ายสรุปสั้น ๆ และโจทย์ p018 ให้แยกข้อเท็จจริงกับคำกล่าวเกินจริงของทั้งสองทาง ข้าว กข6 กข15 จากการฉายรังสีขาวดอกมะลิ 105 ศูนย์โปรตอนแห่งแรกที่ รพ.จุฬาลงกรณ์ (เริ่มรักษา ส.ค. 2564) นักวิจัยไทยใน CMS/ALICE ที่เซิร์น
- ค่าที่ควรตรวจ: ผู้ตรวจควรยืนยันสถานะล่าสุดของร่าง PDP ก่อนเผยแพร่ บทเรียนยาวเกือบ 1,000 คำเพราะตัวชี้วัด 7 ตัวกว้างมาก
- ข้อเสนอ: `us-ngss:HS-PS1-8` ที่ radioactivity ระบุว่าส่วนฟิชชัน/ฟิวชันอยู่ในหัวข้อนี้ ผู้ประสานงานอาจผูก HS-PS1-8 กับหัวข้อนี้เพิ่ม (ไม่ได้ใส่ในไฟล์จับคู่เพราะไม่อยู่ในแผน)

## physics/first-law (`physics.thermal.first-law`)

- โจทย์ 17 ข้อ (1:2 2:4 3:6 4:3 5:2; mcq match numeric expression) ภาพ 3 ภาพ (`pv-processes.svg` สี่กระบวนการจากจุดเดียวกัน อะเดียบาติก γ = 5/3 คำนวณจริง, `work-area.svg`, `p-cycle.svg` ใช้ใน p009) สื่อโต้ตอบ function-plot เส้นอุณหภูมิคงตัวกับอะเดียบาติก และ PhET Gas Properties
- เป็นระดับมหาวิทยาลัยตามงานมอบหมาย: งานเป็นปริพันธ์ $\int P\,dV$ ไอโซเทอร์มอล $nRT\ln(V_2/V_1)$ อะเดียบาติก $PV^\gamma$ $C_V$ $C_P$ γ วัฏจักร และกฎข้อที่หนึ่งกับการเปลี่ยนสถานะ (ไม่ซ้ำทฤษฎีจลน์และ $U = \tfrac32 nRT$ ใน kinetic-theory ซึ่งใช้ต่อ)
- ความสัมพันธ์กับแผน: `physics.thermal.kinetic-theory-thermodynamics` (ม.6 ฟิสิกส์ 4 ม.6/8–9) จะสอนทฤษฎีจลน์และกฎข้อที่หนึ่งพื้นฐาน ($W = P\Delta V$, $Q = \Delta U + W$, เครื่องใช้ในชีวิตประจำวัน) หัวข้อนี้ไม่ได้ใช้หัวข้อนั้นเป็น prerequisite (เพราะยังไม่มีและสอนจากทฤษฎีจลน์ได้ตรง) แต่ถ้าหัวข้อนั้นเขียนเสร็จ ควรพิจารณาเพิ่มเป็น prerequisite ของ first-law ให้ลำดับเป็น ม.6 → มหาวิทยาลัย และหัวข้อนั้นไม่ต้องสอนปริพันธ์ กระบวนการอะเดียบาติก หรือวัฏจักร
- ข้อเสนอ prerequisite: หัวข้อนี้ใช้ปริพันธ์จำกัดเขต (อธิบายเป็นพื้นที่ใต้กราฟ) ควรเพิ่ม `math.calculus.definite-integral` เมื่อมีในคลัง และอาจเพิ่ม `physics.energy.variable-force-work` (งานเป็นพื้นที่ใต้กราฟ) กับ `math.functions.logarithms`
- `us-ngss:HS-PS3-1` partial (ไม่ได้สร้างแบบจำลองเชิงคำนวณเอง)

## physics/induction-ac (`physics.magnetism.induction-ac`)

- โจทย์ 18 ข้อ (1:2 2:4 3:6 4:4 5:2; mcq match numeric order) ภาพ 4 ภาพ (`ac-voltage.svg`, `three-phase.svg`, `transformer.svg`, `p-rod-rails.svg` ใช้ใน p006) สื่อโต้ตอบ function-plot ค่าสูงสุดกับค่าอาร์เอ็มเอส และ PhET Faraday's Law
- บริบทไทย: เขื่อนภูมิพล ไฟบ้าน 220 V 50 Hz ระดับแรงดันสายส่ง กฟผ. 115/230/500 kV (ตรวจกับหน้า EGAT at a Glance) กาต้มน้ำ เตาแม่เหล็กไฟฟ้า หม้อแปลงบนเสา 22 kV
- ค่าที่ควรตรวจ: ใช้ไฟบ้าน 220 V และระหว่างเฟส 380 V ตามหนังสือ สสวท. ค่าระบุตามมาตรฐานปัจจุบันอาจเป็น 230/400 V (ยืนยันจากแหล่งทางการของ กฟน./กฟภ. ไม่ได้) สายส่งในโจทย์ p010 เป็นค่าสมมติ
- ข้อเสนอ prerequisite: ใช้ $P = I^2R$ และ $P = VI$ ควรเพิ่ม `physics.electricity.electric-power`

## physics/potential-capacitance (`physics.electricity.potential-capacitance`)

- โจทย์ 18 ข้อ (1:2 2:3 3:5 4:5 5:3; mcq match numeric text) ภาพ 4 ภาพ (`field-area.svg`, `coax.svg`, `dielectric.svg`, `p-slab.svg` ใช้ใน p013) สื่อโต้ตอบ function-plot $C = \kappa\varepsilon_0A/d$ ไม่มี PhET (Capacitor Lab ที่มีไดอิเล็กทริกเป็น Java ส่วน Basics ใช้แล้วในหัวข้อ capacitors)
- **prerequisite: เพิ่ม `physics.electricity.capacitors`** ตามงานมอบหมาย (นอกเหนือจาก charge, current-voltage, kinetic-potential ตามแผน) electric-potential ได้มาทางอ้อมผ่าน capacitors ผู้ประสานงานควรแก้แผนให้ตรง
- เป็นระดับมหาวิทยาลัย ไม่ซ้ำ ม.6: $\Delta V = -\int \vec E \cdot d\vec l$ ศักย์ของจุดประจุจากการอินทิเกรต ความจุของแผ่นขนาน ทรงกลม ทรงกระบอก (สายโคแอกเชียล) พลังงานจากการอินทิเกรต ความหนาแน่นพลังงาน $\tfrac12\varepsilon_0E^2$ แรงระหว่างแผ่น ไดอิเล็กทริกและความคงทนไดอิเล็กทริก สูตรอนุกรม/ขนานแสดงที่มาและใช้ในโจทย์ระดับสูงเท่านั้น
- ข้อเสนอ prerequisite: สนามของทรงกลมและทรงกระบอกใช้กฎของเกาส์ (UPHYS2 บทที่ 6) ซึ่งยังไม่มีในคลัง บทเรียนให้สนามในตารางแทน ควรมีหัวข้อกฎของเกาส์ และเพิ่ม `math.calculus.definite-integral` เมื่อมี
- ค่าที่ควรตรวจ: ค่าคงตัวไดอิเล็กทริก (เทฟลอน 2.1 กระดาษ 3.7 น้ำ 80 พอลิเอทิลีน 2.3) และความคงทนของอากาศ 3 × 10⁶ V/m เป็นค่าตาราง OpenStax เซนเซอร์ระดับน้ำใน p018 เป็นค่าสมมติ

## physics/electromagnetic-waves (`physics.waves.electromagnetic-waves`)

- โจทย์ 18 ข้อ (1:2 2:5 3:5 4:4 5:2; mcq match numeric order) ภาพ 3 ภาพ (`em-wave.svg`, `polaroid.svg`, `propagation.svg` ไม่ตามมาตราส่วน ระบุในภาพ) สื่อโต้ตอบ function-plot กฎของมาลุส ไม่มี PhET (Radio Waves เป็น Java)
- ไม่ซ้ำกับ `physics.waves.em-spectrum-intro` (ตารางสเปกตรัม การใช้งาน อันตราย) หัวข้อนี้เน้นการเกิดและการรับคลื่น $c = 1/\sqrt{\mu_0\varepsilon_0}$ $E = cB$ โพลาไรเซชันและแผ่นโพลารอยด์ (รวม $I = I_1\cos^2\theta$) การมอดูเลต AM/FM คลื่นดิน คลื่นฟ้า คลื่นตรง ดาวเทียม เส้นใยนำแสง เรดาร์ และการประเมินข้อกล่าวอ้างเรื่องสุขภาพ (HS-PS4-4) ส่วนแอนะล็อกกับดิจิทัลสรุปสั้นและอ้าง `physics.waves.digital-signals`
- บริบทไทย: FM 88–108 MHz เรดาร์กรมอุตุนิยมวิทยา ดาวเทียมไทยคม 5G ย่าน 700 MHz และ 26 GHz (ประมูล ก.พ. 2563 ย่าน 700 MHz 2600 MHz 26 GHz) ทีวีดิจิทัล
- ข้อเสนอ prerequisite: เพิ่ม `physics.waves.em-spectrum-intro` (บทเรียนอ้างตารางสเปกตรัมจากหัวข้อนั้น) และอาจเพิ่ม `physics.waves.digital-signals`
- partial: `uk-nc-science:UKNC-SC-KS4-P-WM-06` (ส่วนใหญ่อยู่ใน em-spectrum-intro), `us-ngss:HS-PS4-4` และ `HS-PS4-5` (ผู้เรียนไม่ได้ประเมินเอกสารจริงหรือจัดทำการสื่อสารเอง)

## physics/second-law (`physics.thermal.second-law`)

- โจทย์ 18 ข้อ (1:2 2:5 3:5 4:3 5:3; mcq match numeric order) ภาพ 2 ภาพ (`engine-fridge.svg`, `carnot-cycle.svg` แก๊สอะตอมเดี่ยว 1 mol ระหว่าง 600 K กับ 300 K พิกัดคำนวณจริง) สื่อโต้ตอบ function-plot ประสิทธิภาพคาร์โนต์ ไม่มีภาพในโจทย์และไม่มี PhET ที่ตรงเรื่อง
- เนื้อหา: กระบวนการผันกลับได้/ไม่ได้ ข้อความเคลวิน–พลังค์และเคลาซิอุส เครื่องยนต์ ตู้เย็น เครื่องปรับอากาศ ปั๊มความร้อน ($K$ และ $K_P$) วัฏจักรคาร์โนต์ เอนโทรปี ($Q/T$, $mc\ln$, $nR\ln$, การขยายตัวอิสระ) และการผสมร้อนเย็น (HS-PS3-4)
- ค่าที่ควรตรวจ: "ไฟฟ้าส่วนใหญ่ของไทยมาจากโรงไฟฟ้าพลังความร้อนร่วมที่ใช้ก๊าซธรรมชาติ" เขียนเชิงทั่วไป ประสิทธิภาพเครื่องยนต์รถ 0.25–0.35 และ COP เครื่องปรับอากาศจริง 3–4 เป็นค่าประมาณทั่วไป
- `us-ngss:HS-PS3-4` partial (การทดลองจริงอยู่นอกแอป)

## physics/quantum-atom (`physics.modern.quantum-atom`)

- โจทย์ 19 ข้อ (1:2 2:4 3:7 4:4 5:2; mcq match numeric text) ภาพ 2 ภาพ (`hydrogen-levels.svg` ระดับพลังงานตามมาตราส่วน, `photoelectric-graph.svg` เส้นของโลหะสองชนิดขนานกัน) สื่อโต้ตอบ function-plot $E_{k,\max} = hf - W$ และ PhET Models of the Hydrogen Atom (HTML5) ไม่ใช้ PhET Photoelectric Effect เพราะเป็น Java
- ด้วยค่าคงตัวที่ปัดแล้ว เส้น Hα คำนวณได้ 658 nm (จริง 656 nm) ระบุในเฉลยและตั้ง tolerance ให้รับทั้งสองค่า บริบทไทย: ไฟจราจรแอลอีดี เลเซอร์ชี้ในห้องเรียน เซลล์สุริยะบนหลังคาบ้าน
- `us-ngss:HS-PS4-3` partial (ประเมินผ่านโจทย์ ไม่ได้เขียนข้อโต้แย้งเอง)

## การตรวจ

- `npm run validate -- --strict --only=<8 โฟลเดอร์>`: 0 error 0 warning
- `npm run validate -- --strict` ทั้งคลัง: error 8 รายการ ทั้งหมดจากโฟลเดอร์ของชุดอื่นที่กำลังเขียน (ไม่พบ topic.yaml ใน biology/chromosomes-dna, chemistry/everyday-materials, health/consumer-rights, health/drugs-prevention, health/malnutrition-meal-planning, health/risk-behaviour-life-skills, health/tactics และลิงก์ใน health/nervous-endocrine-care/lesson.md ไปยัง health.substances.drugs-prevention ที่ยังไม่มี) ไม่มีจากชุดนี้
- `npm test -w @klangru/content-tools`: ผ่าน 35/35
