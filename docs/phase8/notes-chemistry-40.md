# บันทึกชุดงาน chemistry-40 (เฟส 8)

เคมี 8 หัวข้อจาก `proposals-science-core.yaml` (ป.6–ม.2), `proposals-science-additional.yaml` (ม.4–ม.5) และแถว `extend:` ใน `proposals-international.yaml` กับ `proposals-science-core.yaml` ไฟล์จับคู่อยู่ใน `docs/phase8/mappings/` ครบทุกตัวชี้วัดที่แผนผูกไว้ (ตรวจด้วยสคริปต์ว่าไม่ขาดและไม่เกิน)

ภาพทุกภาพวาดเองจากสคริปต์ Python ที่คำนวณพิกัด (scratchpad `phase8-chemistry-40/fig_*.py`) เรนเดอร์เป็น PNG ด้วย Chromium และเปิดตรวจทุกภาพ ภาพในโจทย์ไม่มีป้ายเฉลย ทุกคำตอบและค่า misconception คำนวณด้วย python3 มวลอะตอมใช้ค่าย่อของ IUPAC แบบเดียวกับชุด chemistry-34 ลิงก์อ้างอิงทุกลิงก์ได้ HTTP 200 และหน้าวิกิพีเดียไทยตรวจผ่าน API แล้วว่าไม่ได้ redirect ไปหน้าอื่น (เปลี่ยน "การแยกสาร" และ "สภาพละลายได้" ซึ่งไม่มีหน้า เป็น "การกลั่น" "โครมาโทกราฟี" และ "สารละลาย") PhET ที่ใช้เป็น HTML5 ทั้งหมด (diffusion, states-of-matter, concentration, molarity, molecule-polarity, gas-properties, density) ลิงก์ภายในบทเรียนใช้รูป `/topic/<id>/`

ไฟล์โมเลกุลใหม่ (`content/_assets/molecules/`): 702 เอทานอล และ 8254 ไดเมทิลอีเทอร์ (ตรวจแล้วว่ายังไม่มีในคลัง ดึงด้วย `npm run fetch-assets` ซึ่งส่ง User-Agent ของคลังรู้ ได้โครงสร้าง 3 มิติทั้งคู่)

## chemistry/separating-mixtures (`chemistry.mixtures.separating-mixtures`)

- โจทย์ 16 ข้อ (1:2 2:4 3:5 4:3 5:2; mcq match text numeric order; บริบทไทย 7 ข้อ) ภาพ 2 ภาพ (`distillation-setup.svg`, `p-chromatogram.svg` ใช้ใน p008)
- ครอบคลุมวิธีระดับ ป.6 และ ม.2 ทั้งหมด เพิ่มการกลั่นลำดับส่วน (UK KS4) การกลั่นด้วยไอน้ำ และค่า Rf ส่วนการออกแบบแก้ปัญหา (ม.2/3) ใช้โจทย์น้ำท่วมและเครื่องกลั่นพลังแสงอาทิตย์
- ไม่แน่ใจ: บทเรียนจัดนาเกลือเป็นตัวอย่างของการตกผลึก (คราดเกลือก่อนแห้ง) ตำราบางเล่มจัดเป็นการระเหยแห้ง จึงไม่ได้ถามเรื่องนี้ในโจทย์ บทเรียนนับได้ 988 คำ (รวมตาราง)

## chemistry/particle-model (`chemistry.matter.particle-model`)

- โจทย์ 16 ข้อ (1:2 2:3 3:5 4:4 5:2; mcq match text order numeric; บริบทไทย 4 ข้อ) ภาพ 2 ภาพ (`heating-curve-particles.svg` แกนเวลาไม่ตามมาตราส่วน, `p-diffusion-beakers.svg` ใช้ใน p006)
- ไม่ซ้ำ `chemistry.matter.states-changes` และ `physics.thermal.phase-change`: เน้นการจัดเรียง แรงยึดเหนี่ยว การเคลื่อนที่ ความดันแก๊ส การแพร่ การเคลื่อนที่แบบบราวน์ และน้ำแข็งลอยน้ำ ไม่คำนวณความร้อนแฝง (ลิงก์ไปหัวข้อฟิสิกส์แทน)
- ค่าที่ใช้: น้ำแข็ง 0.917 g/cm³ น้ำที่ 100 °C 0.958 และไอน้ำ 0.000598 g/cm³

## chemistry/solubility-percent (`chemistry.solutions.solubility-percent`)

- โจทย์ 17 ข้อ (1:2 2:3 3:5 4:4 5:3; mcq numeric match order; บริบทไทย 6 ข้อ) ภาพ 1 ภาพ (`solubility-curve.svg` ใช้ในบทเรียนและ p006)
- ความปลอดภัย: ห้ามผสมน้ำยาฟอกขาวกับน้ำยาล้างห้องน้ำชนิดกรด แอลกอฮอล์ราว 70% ฆ่าเชื้อได้ดีกว่า 95% เจือจางตามฉลาก สายด่วน 1669
- ค่าที่ควรตรวจ: สภาพละลายได้ของ KNO₃ และ NaCl เป็นค่าตารางทั่วไป (KNO₃ 31.6 g ที่ 20 °C, 110 g ที่ 60 °C · NaCl 35.9 g ที่ 20 °C) หนังสือ สสวท. อาจใช้ค่าต่างเล็กน้อย ทองรูปพรรณ 1 บาท = 15.16 g

## chemistry/ionic (`chemistry.bonding.ionic`)

- โจทย์ 17 ข้อ (1:1 2:3 3:6 4:4 5:3; mcq match text numeric; บริบทไทย 3 ข้อ) ภาพ 3 ภาพ (`lewis-ion-formation.svg`, `born-haber-nacl.svg` ระดับพลังงานตามมาตราส่วน, `p-lattice-shift.svg` ใช้ใน p013)
- รวมตัวชี้วัดแกนกลาง ว 2.1 ม.5/1 (อ่านสูตรว่าเป็นอะตอม โมเลกุล หรือไอออน) และ ม.5/13 (การละลายแบบแตกตัว อิเล็กโทรไลต์) ไว้ในบทเรียนและโจทย์
- ไม่แน่ใจ: การสะกดชื่อโลหะแทรนซิชันใช้ "ไอร์ออน(II)/(III)" และ "คอปเปอร์(II)" ตามแนวหนังสือ สสวท. (ผู้ตรวจควรเทียบฉบับปัจจุบัน) ค่าวัฏจักรบอร์น–ฮาเบอร์ปัดเป็นจำนวนเต็มและให้ในโจทย์ทุกข้อ บทเรียนบอกว่าบางตำรากำหนดพลังงานโครงผลึกเป็นค่าบวก

## chemistry/concentration (`chemistry.solutions.concentration`)

- โจทย์ 17 ข้อ (1:1 2:4 3:5 4:4 5:3; mcq numeric order; บริบทไทย 4 ข้อ) ภาพ 1 ภาพ (`volumetric-prep.svg`)
- prerequisite: ตามคำสั่งผู้ประสานงาน เพิ่ม `chemistry.solutions.solubility-percent` ต่อจาก `chemistry.stoichiometry.mole` (แผนมีเฉพาะ mole) บทเรียนอ้างหน่วยร้อยละจาก solubility-percent แล้วต่อด้วย ppm g/dm³ โมลาริตี โมแลลิตี เศษส่วนโมล การเจือจาง และ ΔTb ΔTf
- การคำนวณจุดเดือดจุดเยือกแข็งใช้เฉพาะตัวละลายที่ไม่แตกตัว ($K_b$ 0.51, $K_f$ 1.86) ส่วนอิเล็กโทรไลต์มีเพียงโจทย์เชิงคุณภาพ (p015) เพราะไม่แน่ใจว่าหลักสูตร ม.4 ให้คำนวณด้วยแฟกเตอร์ของแวนต์ฮอฟฟ์หรือไม่

## chemistry/polarity-intermolecular (`chemistry.bonding.polarity-intermolecular`)

- โจทย์ 18 ข้อ (1:1 2:4 3:6 4:5 5:2; mcq match text order numeric; บริบทไทย 3 ข้อ) ภาพ 2 ภาพ (`hydride-boiling-points.svg` ค่าจุดเดือดจริงของหมู่ 14–17, `p-h-bond-structures.svg` ใช้ใน p005) โมเลกุล 3 มิติ เอทานอลและไดเมทิลอีเทอร์
- ไม่ซ้ำ `chemistry.bonding.covalent`: ทบทวนสภาพขั้วสั้น ๆ แล้วขยาย VSEPR ถึง 5–6 กลุ่มอิเล็กตรอน เน้นแรงลอนดอน แรงระหว่างขั้ว พันธะไฮโดรเจน ผลต่อจุดเดือดและการละลาย และตารางสมบัติสารโครงร่างตาข่าย (รวม SiC)
- ค่าที่ควรตรวจ: การละลายของบิวทานอล (ราว 8 g ต่อน้ำ 100 g) และเฮกซานอล (ต่ำกว่า 1 g) เขียนเป็นค่าประมาณ จุดหลอมเหลว SiO₂ ราว 1,700 °C

## chemistry/gas-laws (`chemistry.gases.gas-laws`)

- โจทย์ 19 ข้อ (1:1 2:5 3:6 4:5 5:3; mcq numeric order match; บริบทไทย 4 ข้อ) ภาพ 2 ภาพ (`dalton-partial-pressure.svg`, `p-graham-tube.svg` ใช้ใน p010) สื่อโต้ตอบกราฟ P–V ตาม PV = nRT และ PhET Gas Properties
- ไม่ซ้ำ `physics.thermal.kinetic-theory`: กฎของบอยล์ ชาร์ล เกย์-ลูสแซกเป็นตารางทบทวนพร้อมลิงก์ไปหัวข้อฟิสิกส์ เนื้อหาหลักคือหน่วย atm/mmHg/L, R = 0.0821, มวลต่อโมลและความหนาแน่นของแก๊ส กฎของอาโวกาโดร ดอลตัน (เก็บแก๊สเหนือน้ำ ดำน้ำ) เกรแฮม (หลอด NH₃/HCl) และปริมาณสัมพันธ์ของแก๊ส (ถุงลมนิรภัย Mg + HCl การเผาหินปูน)
- ใช้ $T = t + 273$ ตามหนังสือ สสวท. ทุกคำตอบที่เกี่ยวกับอุณหภูมิมี tolerance ครอบคลุมค่าที่คิดด้วย 273.15 ด้วย
- ข้อเสนอแผน: ฟิสิกส์ 4 ม.6/7 จับคู่ full ที่หัวข้อนี้ แต่ `physics.thermal.kinetic-theory` สอนกฎแก๊สอุดมคติครบเช่นกัน ควรผูกที่หัวข้อฟิสิกส์ด้วย สมการเคมีในโจทย์ให้ดุลมาแล้ว เพราะ `chemistry.stoichiometry.reactions` ยังไม่มีและแผนวางให้มาหลัง concentration

## chemistry/pure-substances (`chemistry.matter.pure-substances`)

- โจทย์ 17 ข้อ (1:2 2:4 3:4 4:4 5:3; mcq match numeric order; บริบทไทย 4 ข้อ) ภาพ 2 ภาพ (`boiling-pure-vs-salt.svg` เป็นลักษณะของกราฟ ไม่ใช่ค่าวัดจริง, `p-displacement-density.svg` ใช้ใน p006)
- ข้อเสนอแผน: AC9S7U06 จับคู่ partial เพราะส่วน "ใช้สมบัติแยกสารผสม" อยู่ใน separating-mixtures ซึ่งไม่ใช่ prerequisite ควรผูก AC9S7U06 กับ separating-mixtures ด้วย หรือให้ separating-mixtures มี pure-substances เป็น prerequisite (ระดับ ม.2 ใช้แนวคิดสารบริสุทธิ์)
- ค่าที่ควรตรวจ: ความหนาแน่นของน้ำผึ้ง (ประมาณ 1.4 g/cm³) แนฟทาลีนหลอมเหลวที่ประมาณ 80 °C

## ข้อสังเกตอื่น

- `npm run validate -- --strict` ไม่มี error หรือ warning จากโฟลเดอร์ของชุดนี้ มี error "ไม่พบไฟล์ topic.yaml" จากโฟลเดอร์ของชุดอื่นที่กำลังทำอยู่ (ครั้งล่าสุด: biology/biomes-succession, ecosystems, environmental-issues, hormones, populations, earthscience/water-cycle และ science/investigation-design) `npm test -w @klangru/content-tools` ผ่าน 35/35
- ตัวชี้วัดที่จับคู่ partial ส่วนใหญ่เป็นงานปฏิบัติจริง (แยกสาร เตรียมสารละลาย วัดอุณหภูมิ ใช้เครื่องมือ สืบค้นและนำเสนอ) ซึ่งแอปสอนวิธีและมีโจทย์เรียงขั้นตอนแทน
