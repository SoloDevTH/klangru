# บันทึกชุดงาน engineering-71 (เฟส 8)

วิศวกรรม 8 หัวข้อจาก `docs/phase6/proposals-advanced.yaml` (ไม่มีแถว `extend:`) ระดับพื้นฐานมหาวิทยาลัย หน่วย SI ศัพท์ไทยพร้อมศัพท์อังกฤษในวงเล็บครั้งแรก ภาพทุกภาพวาดเองเป็น SVG ด้วยสคริปต์ Python ที่คำนวณพิกัด (scratchpad `phase8-engineering-71/fig_*.py` ใช้ตัวช่วย `svg.py` `mech.py` `graph.py` `circ2.py` จากชุด 61 และ `truss.py` `beam.py` ที่เขียนเพิ่ม) เรนเดอร์เป็น PNG ด้วย Chromium และเปิดดูทุกภาพ ภาพในโจทย์ไม่มีคำตอบ ตัวเลขทุกตัวคำนวณด้วย python3 (`calc_*.py`) และตรวจด้วยวิธีที่สอง: วิธีจุดต่อแบบเมทริกซ์เทียบวิธีตัดหน้าตัด การอินทิเกรตเชิงตัวเลขเทียบทฤษฎีบทแกนขนาน การอินทิเกรต V เทียบสมการ M (และ dM/dx = V) RK4 และ sympy `dsolve` เทียบสูตรวงจรอันดับสอง สมการคอลบรูกเทียบสวามี–เชน วิธี IC เทียบการหาอนุพันธ์ตำแหน่ง สมการนิวตัน–ออยเลอร์รอบ G เทียบโมเมนต์รอบจุดสัมผัส โจทย์ expression ตรวจด้วย `evaluateLatex` เทียบค่าจาก python ที่จุดสองชุด และสูตรสื่อโต้ตอบผ่าน `compileLatex` จำนวนคำของบทเรียน 601–964 คำ (`Intl.Segmenter`) ไฟล์จับคู่ `docs/phase8/mappings/<id>.yaml` ครบทุกตัวชี้วัดในแผน

## engineering/trusses-friction (`engineering.mechanics.trusses-friction`)

- โจทย์ 16 ข้อ (1:2 2:4 3:5 4:3 5:2; mcq match numeric order) ภาพ 6 ภาพ (`sala-truss` `belt` ในบทเรียน, `p-triangle` p006, `p-pratt` p004 p010, `p-aladder` p011, `p-wedge` p013)
- ครอบคลุมสมมติฐาน m + r = 2j วิธีจุดต่อ ชิ้นส่วนแรงเป็นศูนย์ วิธีตัดหน้าตัด โครงสร้างและเครื่องจักร (คีม บันไดทรง A) แรงเสียดทานแห้ง การล้มกับการไถล ลิ่ม และสายพาน T2 = T1 e^(μβ)
- partial: `MIT2.001 9` (ยังไม่มีการหาการเลื่อนของข้อต่อจากการยืดของชิ้นส่วน) บริบทไทยสมมติ: โครงหลังคาศาลาวัด สะพานคนเดินข้ามคลอง หลักผูกเรือ บันไดช่างไฟ เบรกเครื่องสีข้าว ลิ่มในโรงสี

## engineering/centroids-inertia (`engineering.mechanics.centroids-inertia`)

- โจทย์ 17 ข้อ (1:2 2:4 3:5 4:4 5:2; mcq match numeric expression) ภาพ 5 ภาพ (`parabola-strip` `tee-section` ในบทเรียน, `p-plate` p007, `p-tee` p008 p009, `p-ibeam` p010)
- partial: `CALC1 6.6` (ยังไม่มีระบบมวลจุดและทฤษฎีบทแพปปัส) `CALC3 5.6` (ยังไม่มีวัตถุสามมิติ) ข้อเสนอ: ถ้าต้องการครบสองตัวชี้วัดนี้อาจเพิ่มโจทย์ปริพันธ์สามชั้นในหัวข้อ `math.calculus.multiple-integrals` แทน

## engineering/shear-moment (`engineering.mechanics.shear-moment`)

- โจทย์ 17 ข้อ (1:2 2:4 3:5 4:4 5:2; mcq match numeric expression order) ภาพ 3 ภาพ (`sfd-bmd` ในบทเรียน, `p-twoloads` p006 p007, `p-overhang` p010 p011) สื่อโต้ตอบ function-plot V(x) กับ M(x) ของคานรับแรงกระจาย (คำบรรยายบอกให้ดูเฉพาะ 0 ≤ x ≤ L เพราะวิดเจ็ตวาดเลยช่วงคาน)
- ข้อตกลงเครื่องหมาย: M บวกเมื่อแอ่นแบบหงาย w กดลงเป็นบวก dV/dx = −w, dM/dx = V partial: `CIV-3.1` (ตัวชี้วัดกว้างทั้งกลุ่มโครงสร้าง)

## engineering/stress-strain (`engineering.materials.stress-strain`)

- โจทย์ 18 ข้อ (1:2 2:3 3:6 4:5 5:2; mcq match numeric) ภาพ 3 ภาพ (`offset-yield` `torsion-stress` ในบทเรียน, `p-stepped` p007) เส้นโค้งในภาพออฟเซตสร้างจากแบบจำลองแรมเบิร์ก–ออสกูด (E = 70 GPa, σy = 280 MPa, n = 12) เพื่อให้จุดตัดตรงกับ σy พอดี ไม่ใช่ข้อมูลทดสอบจริง
- partial: `MIT2.001 12` (ยังไม่มีการแปลงความเค้นทั่วไปและวงกลมของมอร์ ควรอยู่ในหัวข้อใหม่หรือใน beam-bending) `ME-2.4` `Mining 1.c`
- ค่าวัสดุที่ใช้เป็นค่าทั่วไปในตำรา: เหล็ก E = 200 GPa ν = 0.3 α = 11.5–12 × 10⁻⁶ /°C, อะลูมิเนียม E = 70 GPa, คอนกรีต E = 25 GPa อุณหภูมิรางรถไฟ 60 °C เป็นค่าสมมติ

## engineering/transients (`engineering.circuits.transients`)

- โจทย์ 18 ข้อ (1:2 2:3 3:6 4:5 5:2; mcq match numeric expression order) ภาพ 3 ภาพ (`rc-switch` `damping-cases` ในบทเรียน, `p-rl` p007) สื่อโต้ตอบ function-plot 2 ชุด (ผลตอบสนองอันดับหนึ่งที่ปรับค่าเริ่มต้น ค่าสุดท้าย τ ได้ และผลตอบสนองขั้นของ RLC ที่ปรับ ζ)
- ไม่ซ้ำ `physics.magnetism.induction` (RL ขณะต่อแบตเตอรี่) และ `math.de.first-order` (RC ประจุจากศูนย์): ที่นี่เน้นความต่อเนื่องขณะสับสวิตช์ วิธีสามค่ากับ R_th แรงดันกระชาก และวงจรอันดับสอง ทุกตัวชี้วัด full

## engineering/engineering-thermodynamics (`engineering.thermo.engineering-thermodynamics`)

- โจทย์ 17 ข้อ (1:2 2:3 3:5 4:5 5:2; mcq match numeric) ภาพ 2 ภาพ (`pv-processes` และ `rankine-ts` ในบทเรียน โดมของ T–s คำนวณจาก CoolProp) ไม่มีภาพในโจทย์ เพราะค่าจากตารางให้ไว้ในโจทย์แล้ว
- **ค่าตารางไอน้ำและ R-134a**: CoolProp 8.0 และ iapws ติดตั้งใน venv ของ scratchpad ได้ จึงใช้คำนวณและตรวจค่า (IAPWS-95/IF97) แล้วปัดเป็นค่าที่ตรงกับตารางในตำราทั่วไป เช่น 8 MPa 500 °C: h = 3399.5, s = 6.7266; 4 MPa 400 °C: h = 3214.5, s = 6.7714; 10 kPa: h_f = 191.81, h_fg = 2392.1, s_f = 0.6492, s_fg = 7.4996; 100 kPa: h_f = 417.5, h_fg = 2257.4 R-134a ใช้สถานะอ้างอิง ASHRAE (ตรงกับตารางในตำราที่ h = s = 0 สำหรับของเหลวอิ่มตัวที่ −40 °C) ทุกค่าที่ใช้ให้ไว้ในโจทย์ ไม่ได้อ้างตารางฉบับใดฉบับหนึ่ง อากาศใช้แบบจำลองแก๊สอุดมคติ c_p = 1.005, k = 1.4 (บอกในบทเรียนและโจทย์)
- โรงไฟฟ้า "แบบแม่เมาะ" และห้องเย็น เครื่องปรับอากาศ รถไถ เป็นค่าสมมติ ไม่ได้อ้างข้อมูลจริงของ กฟผ.
- partial: `UPHYS2 4.5` (คาร์โนต์สอนแล้วใน physics.thermal.second-law) `CHEM 16.2` `CHEM 16.4` `ME-2.3` `CHE-3.2` `Mining 1.c`; full: `UPHYS2 3.4` `IE-2.7`

## engineering/fluid-mechanics (`engineering.fluids.fluid-mechanics`)

- โจทย์ 17 ข้อ (1:2 2:3 3:6 4:4 5:2; mcq match numeric) ภาพ 4 ภาพ (`gate-pressure` `pump-system` ในบทเรียน, `p-gate` p006 p007, `p-hinged` p014) สื่อโต้ตอบ function-plot เส้นโค้งระบบ h = a + cQ²
- ไม่ซ้ำ `physics.fluids.fluid-dynamics` (แบร์นูลลี ปัวเซย์ เรย์โนลด์ส) ที่นี่เน้นแรงบนผิวจมน้ำ สมการโมเมนตัม ดาร์ซี–ไวส์บัคกับสวามี–เชน การสูญเสียรอง และการวิเคราะห์มิติ ν ของน้ำใช้ 1.0 × 10⁻⁶ m²/s (ราว 20 °C ซึ่งต่ำกว่าอุณหภูมิน้ำในคลองไทยเล็กน้อย บอกค่าในโจทย์แล้ว) ความขรุขระเหล็ก 0.045 mm และ PVC 0.0015 mm เป็นค่าทั่วไปของแผนภูมิมูดี
- partial: `ME-2.3` `CIV-3.4` `ENV-2.8` (ยังไม่มีการไหลในทางน้ำเปิดและฝาย อาจเป็นหัวข้อใหม่ "ชลศาสตร์ทางน้ำเปิด") `Environmental 1.a`

## engineering/rigid-body-dynamics (`engineering.mechanics.rigid-body-dynamics`)

- โจทย์ 18 ข้อ (1:2 2:3 3:6 4:5 5:2; mcq match numeric expression) ภาพ 4 ภาพ (`ladder-ic` `barrier-fbd` ในบทเรียน, `p-slider-crank` p006, `p-spool` p014)
- ไม่ซ้ำ `physics.rotation.rotational-dynamics` (τ = Iα รอบแกนคงที่ การกลิ้งเชิงพลังงาน) ที่นี่เน้นความเร็วสัมพัทธ์ IC สมการนิวตัน–ออยเลอร์ จุดที่ใช้ ΣM = Iα ได้ H_O ทั่วไป การดลเชิงมุม จุดศูนย์กลางการกระแทก และมวลหมุนไม่สมดุล
- partial: `MIT2.003SC U5` (การถ่วงสมดุลพลวัตเชิงแนวคิด) `MIT2.003SC U6` (ยังไม่มีเทนเซอร์ความเฉื่อยและการหมุนสามมิติ ควรเป็นหัวข้อใหม่ "พลศาสตร์วัตถุแข็งเกร็งสามมิติ")

## ข้อเสนอให้แก้แผนหรือ prerequisite

- `engineering.mechanics.trusses-friction`: บทเรียนลิงก์ไป `engineering.materials.stress-strain` (การยืดของชิ้นส่วน) ซึ่งอยู่หลังในลำดับ ไม่ได้ใส่เป็น prerequisite
- `engineering.fluids.fluid-mechanics` ใช้ $\bar I_x$ หาศูนย์กลางความดัน ควรเพิ่ม `engineering.mechanics.centroids-inertia` เป็น prerequisite (หรืออย่างน้อย encompasses) ส่วน `math.calculus.integral-applications` ก็สอนแรงดันของของไหลแล้ว
- `engineering.circuits.transients` ควรอยู่ก่อนหรือเป็น prerequisite ของ `engineering.circuits.ac-phasors` ตามที่ชุด 61 เสนอไว้
- `engineering.thermo.engineering-thermodynamics` ใช้ข้อตกลง ΔU = Q − W เดียวกับ `engineering.process.mass-energy-balance`

## การตรวจ

- `npm run validate -- --strict`: 0 error 0 warning ทั้งคลัง (ระหว่างเขียน trusses-friction และ centroids-inertia มี error ลิงก์ไปหัวข้อในชุดที่ยังไม่เขียน ซึ่งหายไปเมื่อเขียนครบ) ไม่พบ error จากชุดอื่นในการตรวจครั้งสุดท้าย
- `npm test -w @klangru/content-tools`: ผ่าน 35/35
- ลิงก์อ้างอิงทั้ง 29 ลิงก์ได้ HTTP 200 ด้วย User-Agent ของโครงการ (ไม่มีลิงก์ที่ยังไม่ได้ตรวจ) ใบอนุญาตใน `references` ตามแนวของชุด 61: University Physics Volume 1, Calculus Volume 1, Chemistry 2e และ MIT OCW เป็น CC-BY-NC-SA-4.0, University Physics Volume 2 ใช้ CC-BY-4.0 (ไม่มีในรายการหนังสือของ `curriculum/sources.yaml`)
