# บันทึกชุดงาน physics-62 (เฟส 8)

ฟิสิกส์ 4 หัวข้อจาก `docs/phase6/proposals-science-core.yaml`, `proposals-science-additional.yaml`, `proposals-advanced.yaml` และแถว `extend:` ใน `proposals-international.yaml` ภาพทุกภาพวาดเองเป็น SVG ด้วยสคริปต์ Python ที่คำนวณพิกัด (scratchpad `phase8-physics-62/fig_*.py` เส้นสนามไฟฟ้าอินทิเกรตจากกฎของคูลอมบ์ กราฟ RL และ E(r) จากสูตรจริง) เรนเดอร์เป็น PNG ด้วย Chromium และเปิดดูทุกภาพ ภาพในโจทย์ไม่มีคำตอบ ตัวเลขทุกตัวคำนวณด้วย python3 และตรวจข้อที่ไม่ตรงไปตรงมาด้วยวิธีที่สอง (บวกเชิงตัวเลขของวงแหวนและแท่งประจุ ออยเลอร์ของวงจร RL พลังงานสนามเทียบ $\tfrac12 LI^2$ พลังงานภายในเทียบ $\tfrac12 Mv_{\text{rms}}^2$ ดุลกำลังของแท่งบนราง) โจทย์ expression ตรวจด้วย `evaluateLatex` เทียบ python ที่จุดสุ่มสองชุด (พบว่าตัวแยกวิเคราะห์ไม่รู้จัก `\varepsilon` จึงเลี่ยงไม่ใช้ $\varepsilon_0$ เป็นตัวแปร) จำนวนคำของบทเรียน 723–832 คำ ไฟล์จับคู่ `docs/phase8/mappings/physics.*.yaml` ครบทุกตัวชี้วัด

## physics/expansion-heat-transfer (`physics.thermal.expansion-heat-transfer`)

- โจทย์ 18 ข้อ (1:3 2:4 3:5 4:4 5:2; mcq match numeric order) ภาพ 4 ภาพ (`particles-expansion`, `bridge-joint`, `heat-transfer-modes`, `p-thermometer` ใช้ใน p004) PhET Energy Forms and Changes
- ระดับ ม.1 ประโยคสั้น ไม่ใช้สัมประสิทธิ์ $\alpha$ ในรูปสัญลักษณ์ ใช้ "เหล็กยาว 1 m ยืด 0.012 mm ต่อ 1 °C" (อะลูมิเนียม 0.023) คำนวณแบบสัดส่วน เนื้อหาการนำ การพา การแผ่รังสีซ้อนกับ `physics.thermal.temperature-heat` (ความยาก 4) บางส่วน แต่หัวข้อนั้นสอนสั้นมาก หัวข้อนี้สอนละเอียดกว่าตามตัวชี้วัด ม.1 และเพิ่มการออกแบบอุปกรณ์
- บริบทไทย: รอยต่อสะพานข้ามเจ้าพระยา (ไม่ระบุสะพาน) รางรถไฟ สายไฟ ฝาขวดแยม หาดบางแสน ข้าวต้มเย็นลง กล่องน้ำแข็งงานกีฬาสี
- partial: `ว 2.3 ม.1/2` (ไม่ได้วัดจริง) `ว 2.3 ม.1/7` (ไม่ได้สร้างอุปกรณ์จริง) `K-PS3-1` `MS-PS3-4`
- ข้อเสนอ: `physics.thermal.temperature-heat` (ความยาก 4) ควรใส่หัวข้อนี้เป็น prerequisite เพราะใช้แนวคิดเดียวกันในระดับที่สูงกว่า
- ลิงก์: หน้า th "การขยายตัวเนื่องจากความร้อน" ไม่มี (404) จึงใช้ th "การถ่ายเทความร้อน" แทน

## physics/kinetic-theory-thermodynamics (`physics.thermal.kinetic-theory-thermodynamics`)

- โจทย์ 19 ข้อ (1:2 2:4 3:6 4:4 5:3; mcq match numeric order) ภาพ 3 ภาพ (`piston-work`, `refrigerator`, `p-pv` ใช้ใน p014) PhET Gas Properties
- `physics.thermal.kinetic-theory` สอนกฎแก๊ส แบบจำลอง ความดันจากการชน $\tfrac32 k_BT$ $v_{\text{rms}}$ และ $U = \tfrac32 nRT$ แล้ว หัวข้อนี้จึงทบทวนสั้น ๆ แล้วสอนเรื่องใหม่: ความหนาแน่นกับระยะห่างโมเลกุล (UK KS4 SM-01) พลังงานภายในที่เก็บในวัสดุ (UK KS3 EM-02) $W = P\Delta V$ กฎข้อที่หนึ่ง กระบวนการพิเศษสี่แบบ และเครื่องใช้ (ที่สูบลม สเปรย์ ตู้เย็น/แอร์ หม้อความดัน) โจทย์ $v_{\text{rms}}$ เป็นแบบต่อยอด (อัตราส่วน eV หลังกระบวนการ)
- **ข้อตกลงเครื่องหมาย: $Q = \Delta U + W$** ($Q > 0$ ได้รับความร้อน $W > 0$ ระบบทำงาน) ตามหนังสือเรียนไทย เขียนบอกว่าเท่ากับ $\Delta U = Q - W$ และตำราบางเล่มใช้ $\Delta U = Q + W$
- ไม่สอนปริพันธ์ อะเดียบาติก $PV^\gamma$ หรือวัฏจักร (อยู่ใน `physics.thermal.first-law`)
- ข้อเสนอ prerequisite: เพิ่มหัวข้อนี้เป็น prerequisite ของ `physics.thermal.first-law` (ความยาก 7) ให้ลำดับเป็น ม.6 → มหาวิทยาลัย (ตรงกับที่ชุด physics-28 เสนอไว้)
- ค่าที่ควรตรวจ: ความหนาแน่นไอน้ำที่ 100 °C ใช้ 0.6 kg/m³ (ค่าจริงราว 0.59–0.60)

## physics/electric-field (`physics.electricity.electric-field`)

- โจทย์ 19 ข้อ (1:2 2:4 3:6 4:5 5:2; mcq match numeric order expression) ภาพ 4 ภาพ (`dipole-field` เส้นสนามคำนวณจริง, `gauss-surfaces`, `sphere-field-graph`, `p-ring` ใช้ใน p006) PhET Charges and Fields
- ระดับมหาวิทยาลัย: สนามจากการกระจายประจุต่อเนื่อง (วงแหวน แท่งบนแนวแกน แท่งยาวจำกัดเทียบเส้นอนันต์) ฟลักซ์ กฎของเกาส์ (ทรงกลม ทรงกระบอก ระนาบ ทรงกลมฉนวนภายใน/ภายนอก) ตัวนำในสมดุล กรงฟาราเดย์ สายล่อฟ้า สายโคแอกเชียล ไม่ซ้ำ `electric-potential` (รวมสนามจุดประจุระดับ ม.ปลาย) และไม่สอนศักย์ (อยู่ใน `potential-capacitance`)
- ข้อเสนอแผน: `physics.electricity.potential-capacitance` (ความยาก 7.5) ใช้สนามทรงกลม/ทรงกระบอกจากกฎของเกาส์ในตาราง ควรเพิ่มหัวข้อนี้เป็น prerequisite ของหัวข้อนั้น (และปรับความยากของหัวข้อนี้เป็น ≤ 7.5 หรือของ potential-capacitance เป็น ≥ 8) ตามที่ชุด physics-28 เสนอไว้ ควรพิจารณาเพิ่ม `physics.electricity.electric-potential` เป็น prerequisite ของหัวข้อนี้ด้วย
- ค่าที่ควรตรวจ: ความคงทนของอากาศ $3 \times 10^6\ \mathrm{V/m}$ (ค่าตาราง OpenStax) สายโคแอกเชียลใช้ประจุสมมติ

## physics/induction (`physics.magnetism.induction`)

- โจทย์ 18 ข้อ (1:2 2:3 3:6 4:4 5:3; mcq match numeric order expression) ภาพ 3 ภาพ (`lenz`, `rl-current`, `p-rails` ใช้ใน p012) สื่อโต้ตอบ function-plot กระแส RL และ PhET Faraday's Electromagnetic Lab
- ระดับมหาวิทยาลัย ไม่ซ้ำ `induction-ac` (ม.6 ใช้สูตรผลต่าง หม้อแปลง rms สามเฟส): อีเอ็มเอฟ ณ ขณะหนึ่งจากอนุพันธ์ อีเอ็มเอฟจากการเคลื่อนที่และดุลกำลัง สนามไฟฟ้าเหนี่ยวนำ $\oint\vec E\cdot d\vec l$ กระแสวนและเตาแม่เหล็กไฟฟ้า เครื่องกำเนิดไฟฟ้าและอีเอ็มเอฟย้อนกลับ (UPHYS2 13.6) $L = \mu_0N^2A/\ell$ $\tfrac12 LI^2$ ความเหนี่ยวนำร่วม และวงจร RL เบื้องต้น (ค่าคงตัวเวลา $I(t)$)
- ทับซ้อนกับแผน: วงจร RL อยู่ในขอบเขตของ `engineering.circuits.transients` (UPHYS2 14.4) ด้วย หัวข้อนี้สอนเพียงขาขึ้นและ $\tau$ ไม่ได้สอนขาลง RC หรือ RLC
- ข้อเสนอ prerequisite: ใช้ $B = \mu_0 nI$ ของโซเลนอยด์ซึ่งสอนใน `physics.magnetism.magnetic-flux-forces` และต่อยอดจาก `physics.magnetism.induction-ac` ควรเพิ่มทั้งสองเป็น prerequisite (ตอนนี้ตามแผนมีเพียง magnetic-field และ differentiation-rules) วงจร RL ใช้สมการเชิงอนุพันธ์อันดับหนึ่ง (`math.de.first-order` ถ้ามี)
- partial: `HS-PS2-5` (ไม่ได้ทำการทดลองจริง) `EE-2.5`
- ค่าที่ควรตรวจ: ความถี่เตาแม่เหล็กไฟฟ้า "หลายสิบกิโลเฮิรตซ์" เขียนเชิงทั่วไป

## ลิงก์

- ทุกลิงก์ OpenStax, en.wikipedia, PhET (charges-and-fields, energy-forms-and-changes, faradays-electromagnetic-lab, gas-properties) และ th.wikipedia "กฎของเกาส์" "ทฤษฎีจลน์ของแก๊ส" ได้ HTTP 200 ด้วย User-Agent ของโครงการ
- หน้า th "การขยายตัวเนื่องจากความร้อน" และ "การขยายตัวทางความร้อน" ไม่มีในวิกิพีเดียไทย จึงใช้ "การถ่ายเทความร้อน" (HTTP 200) แทน API วิกิพีเดียตอบ 429 หนึ่งครั้ง รอแล้วตรวจซ้ำสำเร็จ ไม่มีลิงก์ค้างตรวจ

## การตรวจ

- `npm run validate -- --strict --only=<แต่ละโฟลเดอร์>`: 0 error 0 warning
- `npm run validate -- --strict` ทั้งคลัง: ไม่มี error/warning จากชุดนี้ ตรวจครั้งสุดท้ายมี error 1 รายการจากชุดอื่นที่กำลังเขียน (`earthscience/clouds-fronts-forecasting` ไม่พบ topic.yaml)
- `npm test -w @klangru/content-tools`: ผ่าน 35/35
