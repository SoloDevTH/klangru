# บันทึกชุดงาน engineering-61 (เฟส 8)

วิศวกรรม 4 หัวข้อจาก `docs/phase6/proposals-advanced.yaml` (ไม่มีแถว `extend:`) ระดับพื้นฐานมหาวิทยาลัย หน่วย SI ศัพท์ไทยตามตำราวิศวกรรมพร้อมศัพท์อังกฤษในวงเล็บครั้งแรก ภาพทุกภาพวาดเองเป็น SVG ด้วยสคริปต์ Python ที่คำนวณพิกัด (scratchpad `phase8-engineering-61/fig_*.py` ตัวช่วย `svg.py` `mech.py` `circ2.py` `graph.py`) เรนเดอร์เป็น PNG ด้วย Chromium และเปิดดูทุกภาพ ภาพในโจทย์ไม่มีคำตอบ ตัวเลขทุกตัวคำนวณด้วย python3 (`calc_*.py`) และตรวจคำตอบที่ไม่ตรงไปตรงมาด้วยวิธีที่สอง (สมการโมเมนต์รอบอีกจุด numpy ดุลน้ำ/ดุลอะตอม การจำลอง RK4 ตัวแบ่งแรงดันเทียบ KCL KVL แบบเฟสเซอร์ การคำนวณในโดเมนเวลา) โจทย์ expression ตรวจด้วย `evaluateLatex` เทียบ sympy ที่จุดสุ่มสองชุด สูตรสื่อโต้ตอบผ่าน `compileLatex` จำนวนคำของบทเรียน 650–873 คำ (`Intl.Segmenter`) ไฟล์จับคู่ `docs/phase8/mappings/engineering.*.yaml` ครบทุกตัวชี้วัดในแผน

## engineering/rigid-body-equilibrium (`engineering.mechanics.rigid-body-equilibrium`)

- โจทย์ 17 ข้อ (1:2 2:4 3:6 4:3 5:2; mcq match numeric order) ภาพ 5 ภาพ (`supports`, `beam-example`, `p-overhang` ใช้ใน p008, `p-boom` ใช้ใน p010, `p-pole3d` ใช้ใน p014) สื่อโต้ตอบ function-plot แรงปฏิกิริยากับตำแหน่งน้ำหนัก
- ครอบคลุม $\vec r \times \vec F$ หลักวาริยอง คู่ควบ ระบบแรงสมมูล แรงกระจาย ฐานรองรับ (2D/3D) สมการสมดุล อินดีเทอร์มิเนตเชิงสถิต ชิ้นส่วนสองแรง และสมดุลสามมิติ (เสาบนฐานลูกหมากแก้ด้วย numpy ตรวจโมเมนต์รอบ O เป็นศูนย์)
- partial: `MIT2.001 3` (ส่วนโครงข้อหมุนอยู่ใน trusses-friction) `ME-2.1`
- บริบทไทยเป็นค่าสมมติ: สะพานไม้ข้ามคลอง ช่างไฟพาดบันได ระเบียงตึกแถว เสาธงงานวัด ไม้คานหาบ

## engineering/mass-energy-balance (`engineering.process.mass-energy-balance`)

- โจทย์ 18 ข้อ (1:2 2:5 3:6 4:4 5:1; mcq match numeric order) ภาพ 3 ภาพ (`balance-system`, `pfd-evaporator`, `p-burner` ใช้ใน p009 p014) สื่อโต้ตอบ function-plot น้ำที่ต้องระเหยกับความเข้มข้นน้ำเชื่อม
- ข้อตกลงเครื่องหมาย: $\Delta U = Q - W$ ($Q$ ความร้อนเข้า $W$ งานที่ระบบทำ) บอกในบทเรียนว่าตรงกับ $Q = \Delta U + W$ ของตำราฟิสิกส์ไทย และต่างจาก $\Delta U = q + w$ ของตำราเคมีบางเล่ม ใช้ $c_{\text{น้ำ}} = 4.18\ \mathrm{kJ/(kg\cdot K)}$ $h_{fg} = 2257\ \mathrm{kJ/kg}$
- บริบทไทย (ข้อมูลสมมติทั้งหมด): โรงงานน้ำตาล (เครื่องระเหย 15% → 65% บริกซ์ ความร้อน 48.2 MW) อบข้าวเปลือก 25% → 14% ข้าวต้มเย็นลง/อุ่นด้วยไอน้ำ ไบโอแก๊สฟาร์มสุกร แม่น้ำรับน้ำทิ้ง บ่อบำบัดชุมชน
- partial: `ENV-2.4` (ยังไม่มีการถ่ายโอนมวล) `Environmental 1.b` (ยังไม่มีอากาศและดิน)
- ข้อเสนอ: ระดับความยาก 5 มีเพียงข้อเดียว (p014) ถ้าต้องการสมดุลกว่านี้ควรเพิ่มโจทย์ระบบหลายหน่วยที่มีวนกลับ (recycle) ซึ่งยังไม่ได้สอน

## engineering/particle-dynamics (`engineering.mechanics.particle-dynamics`)

- โจทย์ 19 ข้อ (1:2 2:3 3:6 4:6 5:2; mcq match numeric order expression) ภาพ 3 ภาพ (`nt-polar`, `p-collar` ใช้ใน p008, `p-strap` ใช้ใน p009 และในบทเรียน) สื่อโต้ตอบ vector-add ($a_t + a_n$)
- ครอบคลุมจลนศาสตร์เมื่อ $a$ ขึ้นกับ $t$, $v$, $s$ พิกัด n-t (รวม $\rho$ จาก $y(x)$) พิกัดเชิงขั้วและคอริออลิส กฎข้อที่สองและแรงเสมือน (MIT 2.003SC U4) งาน-พลังงานกับสปริงและแรงเสียดทาน กำลังและประสิทธิภาพ การดลของแรงที่แปรตามเวลา ระบบอนุภาคและจุดศูนย์กลางมวล (พลุแตก ตรวจด้วยโมเมนตัม)
- บริบทไทย (สมมติ): รถไฟฟ้าเบรกเข้าสถานีและเข้าโค้ง ห่วงจับเอียง เรือหางยาว ลิฟต์คอนโด ลานสับเปลี่ยนรถไฟ
- partial: `ME-2.1`
- ค่าที่ควรตรวจ: ความหน่วงของรถไฟฟ้า $1.0$–$1.2\ \mathrm{m/s^2}$ เป็นค่าสมมติที่ใกล้ค่าทั่วไปของรถไฟฟ้า ไม่ได้อ้างข้อมูล BTS จริง

## engineering/ac-phasors (`engineering.circuits.ac-phasors`)

- โจทย์ 19 ข้อ (1:2 2:3 3:6 4:5 5:3; mcq match numeric order expression) ภาพ 3 ภาพ (`phasor-rlc`, `rlc-phasor` แผนภาพเฟสเซอร์จากค่าที่คำนวณ, `p-node` ใช้ใน p013) สื่อโต้ตอบ function-plot เส้นโค้งการสั่นพ้อง
- เฟสเซอร์ใช้ขนาดเป็นค่า rms (บอกในบทเรียน) ครอบคลุมรีแอกแตนซ์ อิมพีแดนซ์ วิธีโนดแบบเชิงซ้อน กำลังเชิงซ้อน $\mathbf S = \mathbf V\mathbf I^*$ ตัวประกอบกำลังและการแก้ด้วยตัวเก็บประจุ การสั่นพ้อง $Q$ แบนด์วิดท์ วงกรองผ่านต่ำ $RC$ เป็นเดซิเบล (MIT 6.002 L18–L20)
- **แรงดันไฟบ้าน: ใช้ 230 V 50 Hz** ตามค่าระบุในตาราง Mains electricity by country (วิกิพีเดีย อ้าง TIS 166-2549: 230/400 V) และเขียนในบทเรียนว่าหนังสือเรียนและฉลากหลายชิ้นยังใช้ 220 V หัวข้อ `physics.magnetism.induction-ac` ใช้ 220 V ตาม สสวท. ผู้ประสานงานอาจอยากให้สองหัวข้อสอดคล้องกัน
- บริบทไทย (สมมติ): มอเตอร์พัดลม เตาแม่เหล็กไฟฟ้า (60 μH, 0.33 μF → 35.8 kHz) วิทยุ AM ร้านกลึงและอู่ซ่อมรถแก้ตัวประกอบกำลัง
- partial: `EE-3.1` (เป็นตัวชี้วัดกว้าง ครอบคลุมเฉพาะวงจรกำลังกระแสสลับ)
- ข้อเสนอ prerequisite: `engineering.circuits.transients` (ยังไม่มี) ควรมาก่อนหรือคู่กัน ผู้เรียนใช้ $\varepsilon = -L\,dI/dt$ ได้จาก `physics.magnetism.induction` ซึ่งเขียนในชุด physics-62 อาจเพิ่มเป็น prerequisite หรือ encompasses

## การตรวจ

- `npm run validate -- --strict --only=<แต่ละโฟลเดอร์>`: 0 error 0 warning
- `npm run validate -- --strict` ทั้งคลัง: ไม่มี error/warning จากชุดนี้ ตรวจครั้งสุดท้ายมี error 1 รายการจากชุดอื่นที่กำลังเขียน (`earthscience/clouds-fronts-forecasting` ไม่พบ topic.yaml)
- `npm test -w @klangru/content-tools`: ผ่าน 35/35
- ลิงก์อ้างอิงและ PhET ทุกลิงก์ได้ HTTP 200 ด้วย User-Agent ของโครงการ (ลิงก์ OpenStax 4.4 เดิมได้ 301 จึงแก้เป็น `4-4-uniform-and-nonuniform-circular-motion`)
- ใบอนุญาตใน `references`: ใช้ตาม `curriculum/sources.yaml` (University Physics Volume 1 และ Chemistry 2e เป็น CC-BY-NC-SA-4.0 link-only) ส่วน University Physics Volume 2 ไม่มีในรายการหนังสือของ sources.yaml จึงใช้ CC-BY-4.0 ตามหัวข้อส่วนใหญ่ในคลัง (มีหัวข้อหนึ่งใช้ CC-BY-NC-SA-4.0 ไม่สอดคล้องกัน ผู้ประสานงานอาจตรวจ)
