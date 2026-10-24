# บันทึกชุดงาน M2 (เฟส 7)

หัวข้อ: factoring, factors-multiples, fractions, functions-intro, integers, linear-equations, linear-graphs, linear-inequalities, linear-systems, logarithms, place-value, polynomials, probability

ทุกตัวเลขในโจทย์ใหม่ คำตอบ และค่า misconception คำนวณด้วย python3 (sympy/fractions) ภาพทุกภาพวาดเป็น SVG ด้วยสคริปต์ที่คำนวณพิกัดจริง กราฟใช้หน่วยแกน x และ y เท่ากัน (ยกเว้นที่ระบุ) เรนเดอร์เป็น PNG ด้วย Chromium และเปิดดูทุกภาพ

`au-ac9-mathematics` และ `uk-nc-mathematics` เข้ามาใน `curriculum/frameworks/` ระหว่างทำ (ยังไม่มีไฟล์ mappings) ทุกหัวข้อจึงเทียบกับทั้งสามหลักสูตร ตัวชี้วัด AU/UK ด้านล่างเป็นข้อเสนอสำหรับไฟล์ mappings ที่ยังไม่มี

## factoring (math.algebra.factoring)

- โจทย์ 13 → 21 (p014–p021) ระดับ 1:2, 2:5, 3:5, 4:6, 5:3 · สถานการณ์จริงในไทย 5 ข้อ (p010 p011 p012 p019 p020)
- ภาพวาดเอง 3 ภาพ: `area-model.svg` (บทเรียน), `zeros-graph.svg` (บทเรียน), `tiles.svg` (โจทย์ p015) · Commons 0
- เพิ่มในบทเรียน: จับกลุ่มสี่พจน์, มองโครงสร้าง (แทน $u = x^2$, $x^4 - 81$, คิดเลขในใจ), สมบัติผลคูณเป็นศูนย์และจุดตัดแกน x, ดึง $-1$ เมื่อสัมประสิทธิ์นำเป็นลบ · ตัวอย่างแสดงวิธีทำ 2 (ดึงตัวร่วมแล้วผลต่างกำลังสอง, จรวดขวดน้ำ) · check 2 (p003, p017)
- ตัวชี้วัดที่ตอนนี้สอนครบ: `us-ccss-math:A-SSE.2 → full`
- ยังบางส่วน: `us-ccss-math:A-SSE.3` ข้อย่อย a ครบแล้ว (แยกตัวประกอบเพื่อหาค่าศูนย์) แต่ b (กำลังสองสมบูรณ์หาค่าสูงสุดต่ำสุด) อยู่ในขอบเขต math.functions.quadratic และ c (เลขชี้กำลัง) อยู่ใน math.functions.exponential
- เสนอจับคู่เพิ่ม: `us-ccss-math:A-APR.3` (หาค่าศูนย์จากรูปผลคูณและร่างกราฟ) → partial ร่วมกับหัวข้อนี้ ส่วนพหุนามดีกรีสูงกว่าสองควรอยู่ใน math.algebra.polynomial-equations (หัวข้อที่เสนอในเฟส 6)
- หัวข้อใหม่: ผลบวกและผลต่างกำลังสาม อยู่ในขอบเขตของ math.algebra.polynomial-equations ที่เสนอไว้แล้ว

- AU/UK: `uk-nc-mathematics:UKNC-MA-KS4-A-01 → partial` (แยกตัวประกอบ $x^2 + bx + c$, $ax^2 + bx + c$ และผลต่างกำลังสองครบ ส่วนเลขชี้กำลังและเศษส่วนพีชคณิตอยู่หัวข้ออื่น), `uk-nc-mathematics:UKNC-MA-KS4-A-11 → partial` (แก้สมการด้วยการแยกตัวประกอบ ส่วนกำลังสองสมบูรณ์และสูตรอยู่ใน math.algebra.quadratic-eq), `uk-nc-mathematics:UKNC-MA-KS3-A-04 → partial` (ดึงตัวร่วม), `au-ac9-mathematics:AC9M9A02 → partial` (แยกตัวประกอบกำลังสองแบบ monic ครบ ส่วนการกระจายทวินามอยู่ใน polynomials), `au-ac9-mathematics:AC9M10A01 → partial`

## factors-multiples (math.number.factors-multiples)

- โจทย์ 12 → 20 (p013–p020) ระดับ 1:3, 2:6, 3:4, 4:4, 5:3 · สถานการณ์จริงในไทย 6 ข้อ (p007 p009 p010 p012 p019 p020)
- ภาพวาดเอง 3 ภาพ: `factor-trees.svg` (บทเรียน), `venn-72-120.svg` (ตัวอย่างแสดงวิธีทำ), `venn-60-84.svg` (โจทย์ p018) · Commons 0
- เพิ่มในบทเรียน: ตารางทดสอบการหารลงตัว 2 3 4 5 6 9 10, แผนภาพต้นไม้, นับตัวประกอบจากเลขชี้กำลัง, จำนวนกำลังสองมีตัวประกอบเป็นจำนวนคี่ตัว, วิธีหารสั้น, แผนภาพเวนน์, ดึง ห.ร.ม. ด้วยสมบัติการแจกแจง · ตัวอย่าง 2 (หารสั้น 18 กับ 30, เวนน์ 72 กับ 120) · check 2 (p014, p015)
- ตัวชี้วัดที่ตอนนี้สอนครบ: `us-ccss-math:4.OA.4 → full`, `us-ccss-math:6.NS.4 → full` (เพิ่มการดึง ห.ร.ม. ด้วยสมบัติการแจกแจง เช่น $42 + 56 = 14(3 + 4)$)
- ยังบางส่วน: ไม่มี
- หัวข้อใหม่: ไม่มี (การทดสอบการหารลงตัวด้วย 7, 8, 11 และเลขคณิตมอดุลาร์ ถ้าต้องการควรเป็นหัวข้อทฤษฎีจำนวนแยก)

- AU/UK: `uk-nc-mathematics:UKNC-MA-Y4-NMD-03 → full`, `uk-nc-mathematics:UKNC-MA-Y5-NMD-01 → full`, `uk-nc-mathematics:UKNC-MA-Y5-NMD-02 → full`, `uk-nc-mathematics:UKNC-MA-Y5-NMD-03 → full`, `uk-nc-mathematics:UKNC-MA-Y6-NASMD-05 → full`, `uk-nc-mathematics:UKNC-MA-KS3-N-03 → full`, `uk-nc-mathematics:UKNC-MA-Y5-NMD-08 → partial` (จำนวนกำลังสองครบ จำนวนกำลังสามอยู่ใน math.number.exponents), `au-ac9-mathematics:AC9M5N02 → full`, `au-ac9-mathematics:AC9M6N02 → full`, `au-ac9-mathematics:AC9M7N02 → full`

## fractions (math.number.fractions)

- โจทย์ 10 → 21 (p011–p021) ระดับ 1:2, 2:7, 3:6, 4:4, 5:2 · สถานการณ์จริงในไทย 9 ข้อ (p005 p007 p009 p014 p016 p017 p018 p020 p021)
- ภาพวาดเอง 4 ภาพ: `number-lines.svg` (บทเรียน), `area-3-5x2-3.svg` (ตัวอย่างแสดงวิธีทำ), `bar-3-8.svg` (โจทย์ p011), `numberline-a.svg` (โจทย์ p012) · Commons 0
- เพิ่มในบทเรียน: เศษส่วนเป็นผลรวมของเศษส่วนหนึ่งส่วน, เศษส่วนบนเส้นจำนวนและจำนวนนับในรูปเศษส่วน, เปรียบเทียบ (ตัวส่วนเท่ากัน ตัวเศษเท่ากัน เทียบกับครึ่ง ตัวส่วนร่วม และต้องเป็นของขนาดเดียวกัน), แบบจำลองพื้นที่ของการคูณ, การคูณเป็นการย่อขยาย, หารเศษส่วนหนึ่งส่วนด้วยจำนวนนับและกลับกัน, เศษส่วนคือการหาร · ตัวอย่าง 2 (เทียบ 5/8 กับ 3/5, พื้นที่ 3/5 × 2/3) · check 2 (p011, p013)
- ตัวชี้วัดที่ตอนนี้สอนครบ: `us-ccss-math:3.NF.1 → full`, `us-ccss-math:3.NF.2 → full`, `us-ccss-math:3.NF.3 → full`, `us-ccss-math:4.NF.2 → full`, `us-ccss-math:5.NF.3 → full`, `us-ccss-math:5.NF.4 → full`, `us-ccss-math:5.NF.5 → full`, `us-ccss-math:5.NF.7 → full` (รวมของเดิมที่ครบแล้ว 4.NF.1 4.NF.3 4.NF.4 5.NF.1 5.NF.2 5.NF.6 6.NS.1)
- ยังบางส่วน: 4.NF.5 4.NF.6 (ส่วน 10 และ 100 กับทศนิยม) อยู่ในขอบเขต math.number.decimals
- หัวข้อใหม่: การเปรียบเทียบเชิงลึก (เรียงลำดับหลายจำนวน จำนวนคละ ตัวส่วนเป็นพหุคูณกัน) มีในแผน math.number.fraction-compare แล้ว บทนี้สอนแค่พื้นฐานที่ CCSS วางไว้ในชั้นเดียวกับการบวกลบ

- AU/UK: `uk-nc-mathematics:UKNC-MA-Y2-NF-01 → full`, `UKNC-MA-Y3-NF-02` ถึง `UKNC-MA-Y3-NF-06 → full`, `UKNC-MA-Y4-NF-01 → full`, `UKNC-MA-Y4-NF-03 → full`, `UKNC-MA-Y4-NF-04 → full`, `UKNC-MA-Y5-NF-01` ถึง `UKNC-MA-Y5-NF-05 → full`, `UKNC-MA-Y5-NMD-11 → full`, `UKNC-MA-Y6-NF-01` ถึง `UKNC-MA-Y6-NF-06 → full` (เพิ่ม p021 $\tfrac13 \div 2$ สำหรับ Y6-NF-05), `au-ac9-mathematics:AC9M3N02 → full`, `AC9M4N03 → full`, `AC9M4N04 → full`, `AC9M5N03 → full`, `AC9M5N05 → full`, `AC9M6N03 → full`, `AC9M6N05 → full` · `AC9M7N06 → partial` (ร้อยละอยู่ใน math.number.ratio-percent) · `UKNC-MA-KS3-N-04 → partial` (เศษส่วนลบอยู่ใน math.number.rationals ที่วางแผนไว้)

## functions-intro (math.functions.functions-intro)

- โจทย์ 14 → 21 (p015–p021) ระดับ 1:3, 2:4, 3:6, 4:5, 5:3 · สถานการณ์จริงในไทย 8 ข้อ (p004 p005 p012 p016 p017 p019 p020 p021)
- ภาพวาดเอง 4 ภาพ: `vertical-line-test.svg` (บทเรียน), `temperature.svg` (ตัวอย่างแสดงวิธีทำ), `mapping-ab.svg` (โจทย์ p015), `walk-graph.svg` (โจทย์ p017) · Commons 0
- เพิ่มในบทเรียน: แผนภาพการจับคู่, ตัวแปรต้นและตัวแปรตาม, ฟังก์ชันสี่แบบ (คำพูด ตาราง สูตร กราฟ) และการเปรียบเทียบอัตราการเปลี่ยนแปลงข้ามรูปแบบ, อ่านกราฟเชิงคุณภาพ (เพิ่ม ลด คงที่ ค่าสูงสุด เชิงเส้นหรือไม่) และร่างกราฟจากเรื่องเล่า, โดเมนจากสถานการณ์ · ตัวอย่าง 2 (ตารางค่าส่งพัสดุ, กราฟอุณหภูมิ) · check 2 (p015, p017)
- ตัวชี้วัดที่ตอนนี้สอนครบ: `us-ccss-math:F-IF.5 → full` (โดเมนจากกราฟและจากสถานการณ์ p020), เสนอจับคู่ใหม่ `us-ccss-math:8.F.5 → full` (p017 และตัวอย่างกราฟอุณหภูมิ), `us-ccss-math:8.F.2 → full` (p018), `us-ccss-math:6.EE.9 → full` (p016 และหัวข้อตัวแปรต้นตัวแปรตาม)
- ยังบางส่วน: `us-ccss-math:F-BF.1` ข้อย่อย a (p016) และ c (ฟังก์ชันประกอบ p010–p012 p021) ครบ แต่ b (รวมฟังก์ชันต่างชนิดด้วยการบวกลบ เช่น ค่าคงที่บวกเอกซ์โพเนนเชียล) ไม่อยู่ในขอบเขตบทนำ · `us-ccss-math:F-IF.9` เปรียบเทียบได้เฉพาะฟังก์ชันเชิงเส้น ยังไม่มีพาราโบลาหรือเอกซ์โพเนนเชียล · `us-ccss-math:F-IF.4` (อ่านลักษณะสำคัญของกราฟ) มีช่วงเพิ่ม ลด และค่าสูงสุด แต่ยังไม่มีสมมาตร พฤติกรรมปลาย และความเป็นคาบ
- หัวข้อใหม่: ฟังก์ชันผกผัน (F-BF.4) และการแปลงกราฟ $f(x) + k$, $f(x + k)$, $kf(x)$ (F-BF.3) ยังไม่มีในคลังและไม่มีในแผนเฟส 6 ควรเป็นหัวข้อ "การแปลงกราฟและฟังก์ชันผกผัน"
- AU/UK: `uk-nc-mathematics:UKNC-MA-KS4-A-03 → partial` (ค่าเข้าค่าออกและฟังก์ชันประกอบครบ ยังไม่มีฟังก์ชันผกผัน), `uk-nc-mathematics:UKNC-MA-KS3-A-13 → partial` (อ่านกราฟเส้นหักในสถานการณ์จริง p017 ยังไม่มีกราฟเอกซ์โพเนนเชียลและส่วนกลับ), `uk-nc-mathematics:UKNC-MA-KS3-WR-03 → full`, `au-ac9-mathematics:AC9M7A04 → full` (ความสัมพันธ์จากกราฟข้อมูลจริง), `au-ac9-mathematics:AC9M7A05 → partial` (ตารางค่าจากกฎของฟังก์ชัน ยังไม่มีแบบรูปที่เติบโต)

## integers (math.number.integers)

- โจทย์ 10 → 20 (p011–p020) ระดับ 1:4, 2:6, 3:5, 4:4, 5:1 · สถานการณ์จริงในไทย 7 ข้อ (p005 p008 p009 p012 p013 p016 p019)
- ภาพวาดเอง 3 ภาพ: `subtract-jumps.svg` (ตัวอย่างแสดงวิธีทำ), `lift-floors.svg` (โจทย์ p013 เส้นจำนวนแนวตั้ง), `counters.svg` (โจทย์ p015 ชิปสองสี) · Commons 0
- เพิ่มในบทเรียน: เส้นจำนวนแนวตั้งและความหมายของ 0 ในแต่ละเรื่อง, จำนวนตรงข้ามและ $-(-a) = a$, ค่าสัมบูรณ์กับการเรียงลำดับ (หนี้), คู่ศูนย์ด้วยชิปสองสี, การลบคือการบวกจำนวนตรงข้าม, ระยะห่าง $|p - q|$, แบบรูปที่อธิบายลบคูณลบ, $(-3)^2$ กับ $-3^2$ · ตัวอย่าง 2 (ลบบนเส้นจำนวน, พิสูจน์ลบคูณลบด้วยสมบัติการแจกแจง) · check 2 (p015, p014)
- ตัวชี้วัดที่ตอนนี้สอนครบ: `us-ccss-math:6.NS.5 → full` (เดิมครบแล้ว)
- ยังบางส่วน: `us-ccss-math:6.NS.6` ข้อ a และ c ครบสำหรับจำนวนเต็ม ข้อ b (จตุภาคและการสะท้อนจุด) อยู่ใน math.functions.coordinate-plane · `us-ccss-math:6.NS.7`, `7.NS.1`, `7.NS.2`, `7.NS.3` ครบทุกข้อย่อยสำหรับจำนวนเต็ม (ลำดับ ค่าสัมบูรณ์เทียบกับลำดับ คู่ศูนย์ ระยะ $|p - q|$ เหตุผลของลบคูณลบ) แต่ยังไม่มีเศษส่วนและทศนิยมที่เป็นลบ ซึ่งอยู่ในแผน math.number.rationals
- AU/UK: `uk-nc-mathematics:UKNC-MA-Y4-NPV-03 → full`, `uk-nc-mathematics:UKNC-MA-Y5-NPV-03 → full`, `uk-nc-mathematics:UKNC-MA-Y6-NPV-03 → full`, `au-ac9-mathematics:AC9M7N07 → full` · `uk-nc-mathematics:UKNC-MA-KS3-N-02 → partial` (เรียงลำดับเฉพาะจำนวนเต็ม), `uk-nc-mathematics:UKNC-MA-KS3-N-04 → partial`, `au-ac9-mathematics:AC9M6N01 → partial` (พิกัดอยู่ใน coordinate-plane), `au-ac9-mathematics:AC9M8N04 → partial` (จำนวนตรรกยะ)
- หัวข้อใหม่: ไม่มี (จำนวนตรรกยะลบอยู่ในแผน math.number.rationals แล้ว)

## linear-equations (math.algebra.linear-eq)

- โจทย์ 10 → 20 (p011–p020) ระดับ 1:3, 2:5, 3:6, 4:4, 5:2 · สถานการณ์จริงในไทย 7 ข้อ (p006 p008 p009 p010 p016 p019 p020)
- ภาพวาดเอง 2 ภาพ: `balance-example.svg` (ตัวอย่างแสดงวิธีทำ), `balance-problem.svg` (โจทย์ p013) · Commons 0
- เพิ่มในบทเรียน: สัมประสิทธิ์เศษส่วนและทศนิยม (คูณ ค.ร.น. ทุกพจน์), เหตุผลของแต่ละขั้น, จำนวนคำตอบ (หนึ่งค่า ไม่มี เป็นจริงทุกค่า และ $x = 0$ เป็นคำตอบ), มองคำตอบเป็นจุดตัดของกราฟ · ตัวอย่าง 2 (ตาชั่ง, ไม่มีคำตอบกับเอกลักษณ์) · check 2 (p013, p014)
- ตัวชี้วัดที่ตอนนี้สอนครบ: `us-ccss-math:7.EE.4 → full` ส่วน a (สมการ $px + q = r$ และ $p(x + q) = r$ รวมทศนิยม) ส่วน b (อสมการ) อยู่ใน linear-inequalities จึงเสนอให้ทั้งสองหัวข้อจับคู่ 7.EE.4 แบบ partial แต่รวมกันครบ · `us-ccss-math:8.EE.7 → full` (มีกรณีไม่มีคำตอบ คำตอบมากมาย และสัมประสิทธิ์เศษส่วน) · `us-ccss-math:A-REI.1 → full` (p018 อธิบายเหตุผลทุกขั้น)
- ยังบางส่วน: `us-ccss-math:A-REI.3` ส่วนสมการครบ ส่วนอสมการอยู่ใน linear-inequalities และสมการที่มีตัวอักษรเป็นสัมประสิทธิ์อยู่ใน math.algebra.rearrange-formula · `us-ccss-math:A-CED.1` สร้างสมการเชิงเส้นได้ ยังไม่มีสมการกำลังสองหรือเอกซ์โพเนนเชียล
- AU/UK: `uk-nc-mathematics:UKNC-MA-KS3-A-07 → full`, `uk-nc-mathematics:UKNC-MA-KS4-A-14 → partial` (สมการเดียว ส่วนระบบสมการอยู่ใน linear-systems), `uk-nc-mathematics:UKNC-MA-KS4-A-02 → partial` (สมการกับเอกลักษณ์ ยังไม่มีการพิสูจน์ทางพีชคณิต), `au-ac9-mathematics:AC9M7A03 → full`, `au-ac9-mathematics:AC9M8A02 → partial` (แก้สมการด้วยพีชคณิตและอธิบายด้วยกราฟ ส่วนการวาดกราฟอยู่ใน linear-graphs และอสมการอยู่ใน linear-inequalities)
- หัวข้อใหม่: ไม่มี

## linear-graphs (math.functions.linear-graphs)

- โจทย์ 14 → 21 (p015–p021) ระดับ 1:2, 2:4, 3:6, 4:7, 5:2 · สถานการณ์จริงในไทย 5 ข้อ (p002 p010 p011 p019 p020)
- ภาพวาดเอง 2 ภาพ: `slope-triangles.svg` (ตัวอย่างแสดงวิธีทำ สามเหลี่ยมคล้าย), `read-line.svg` (โจทย์ p015) · Commons 0 · กราฟทั้งสองใช้หน่วยแกนเท่ากัน
- เพิ่มในบทเรียน: กราฟคือเซตของคำตอบ, สามเหลี่ยมคล้ายอธิบายว่าความชันคงที่, ความสัมพันธ์แบบสัดส่วนและอัตราต่อหน่วย, วิธีจุดตัดแกนสำหรับ $ax + by = c$, ความหมายของความชัน ระยะตัดแกน และจุดตัดแกน x ในสถานการณ์จริง, เชิงเส้นกับไม่เชิงเส้น · ตัวอย่าง 2 (สามเหลี่ยมความชัน, เทียนไข) · check 2 (p016, p015)
- ตัวชี้วัดที่ตอนนี้สอนครบ: `us-ccss-math:8.EE.5 → full` (p019), `us-ccss-math:8.EE.6 → full` (สามเหลี่ยมคล้ายและ $y = kx$), `us-ccss-math:8.F.3 → full` (p017), `us-ccss-math:F-LE.2 → partial` คงเดิมเพราะยังไม่มีเอกซ์โพเนนเชียล (ส่วนเชิงเส้นครบ) · เสนอจับคู่ใหม่ `us-ccss-math:A-REI.10 → full` (p016) และ `us-ccss-math:8.F.4 → full` (p020 และตัวอย่างเทียนไข)
- ยังบางส่วน: ไม่มีในส่วนเชิงเส้น
- AU/UK: `uk-nc-mathematics:UKNC-MA-KS3-A-09 → partial` (เส้นตรงครบ พาราโบลาอยู่ใน math.functions.quadratic), `uk-nc-mathematics:UKNC-MA-KS3-A-11 → full`, `uk-nc-mathematics:UKNC-MA-KS4-A-04 → full`, `uk-nc-mathematics:UKNC-MA-KS4-R-04 → partial` (ความชันเป็นอัตราและสัดส่วนตรงครบ สัดส่วนผกผันยังไม่มี), `au-ac9-mathematics:AC9M8A02 → partial` (กราฟเส้นตรงครบ อสมการอยู่ใน linear-inequalities), `au-ac9-mathematics:AC9M8A03 → full`, `au-ac9-mathematics:AC9M9A03 → partial` (ความชันครบ จุดกึ่งกลางยังไม่มี ระยะทางอยู่ใน pythagoras)
- หัวข้อใหม่: จุดกึ่งกลางของส่วนของเส้นตรง (AC9M9A03) ควรเพิ่มใน math.functions.coordinate-plane หรือหัวข้อ "เรขาคณิตวิเคราะห์เบื้องต้น" ไม่ใช่เรื่องของกราฟเส้นตรง

## linear-inequalities (math.algebra.linear-inequalities)

- โจทย์ 12 → 20 (p013–p020) ระดับ 1:3, 2:5, 3:5, 4:5, 5:2 · สถานการณ์จริงในไทย 7 ข้อ (p005 p008 p009 p011 p015 p017 p019)
- ภาพวาดเอง 3 ภาพ: `we-compound.svg` (ตัวอย่างแสดงวิธีทำ), `ray-open.svg` (โจทย์ p013), `segment.svg` (โจทย์ p014) · Commons 0
- เพิ่มในบทเรียน: อสมการสองชั้น (และ) กับคำตอบสองช่วง (หรือ), สัญกรณ์เซต, เลี่ยงการกลับเครื่องหมายด้วยการย้ายพจน์ · ตัวอย่าง 2 ($4 - x \ge 1$, $-3 \le 2x + 1 < 7$) · check 2 (p013, p017)
- ตัวชี้วัดที่ตอนนี้สอนครบ: `us-ccss-math:6.EE.8 → full` (เดิม), `us-ccss-math:A-REI.3 → full` เมื่อรวมกับ linear-equations (สมการและอสมการเชิงเส้นรวมสัมประสิทธิ์เศษส่วน), `us-ccss-math:7.EE.4 → full` เมื่อรวมกับ linear-equations (ข้อย่อย b โจทย์ปัญหาอสมการ $px + q > r$)
- ยังบางส่วน: `us-ccss-math:A-CED.1` และ `A-CED.3` สร้างอสมการตัวแปรเดียวจากเงื่อนไขได้ (p015 p017 p019) แต่ข้อจำกัดหลายตัวแปรต้องใช้อสมการสองตัวแปร
- AU/UK: `uk-nc-mathematics:UKNC-MA-KS4-A-15 → partial` (ตัวแปรเดียวบนเส้นจำนวนและสัญกรณ์เซตครบ ส่วนสองตัวแปรบนกราฟและอสมการกำลังสองยังไม่มี), `au-ac9-mathematics:AC9M8A02 → partial` (อสมการตัวแปรเดียวด้วยพีชคณิตและกราฟครบ ร่วมกับ linear-graphs), `au-ac9-mathematics:AC9M10A02 → partial` (ส่วนอสมการเชิงเส้นตัวแปรเดียว ส่วนระบบสมการอยู่ใน linear-systems)
- หัวข้อใหม่: **อสมการเชิงเส้นสองตัวแปรและบริเวณคำตอบบนระนาบ** (us-ccss-math A-REI.12, UK KS4-A-15 ส่วนสองตัวแปร) ต่อยอดเป็นกำหนดการเชิงเส้น ไม่มีในคลังและแผนเฟส 6

## linear-systems (math.algebra.systems)

- โจทย์ 13 → 20 (p014–p020) ระดับ 1:3, 2:4, 3:5, 4:5, 5:3 · สถานการณ์จริงในไทย 6 ข้อ (p007 p009 p011 p013 p017 p018)
- ภาพวาดเอง 3 ภาพ: `three-cases.svg` (บทเรียน), `we-intersect.svg` (ตัวอย่างแสดงวิธีทำ), `read-intersection.svg` (โจทย์ p014) · Commons 0
- เพิ่มในบทเรียน: เหตุผลที่การแทนสมการด้วยผลบวกกับพหุคูณของอีกสมการได้คำตอบเดิม, ดูจำนวนคำตอบจากสัมประสิทธิ์ก่อนแก้, จุดตัดของ $y = f(x)$ กับ $y = g(x)$ คือคำตอบของ $f(x) = g(x)$ และการประมาณจากกราฟ · ตัวอย่าง 2 (กราฟแล้วตรวจด้วยพีชคณิต, คูณทั้งสองสมการ) · check 2 (p014, p015)
- ตัวชี้วัดที่ตอนนี้สอนครบ: `us-ccss-math:8.EE.8 → full` (เดิม), `us-ccss-math:A-REI.6 → full` (เดิม), `us-ccss-math:A-REI.5 → full` (บทเรียนและ p019)
- ยังบางส่วน: `us-ccss-math:A-CED.3` มีข้อจำกัดเป็นระบบสมการแล้ว แต่ข้อจำกัดแบบระบบอสมการต้องรอหัวข้ออสมการสองตัวแปร · เสนอจับคู่ใหม่ `us-ccss-math:A-REI.11 → partial` (เฉพาะฟังก์ชันเชิงเส้น ยังไม่มีพหุนาม ตรรกยะ หรือเอกซ์โพเนนเชียล)
- AU/UK: `uk-nc-mathematics:UKNC-MA-KS4-A-12 → partial` (เชิงเส้นกับเชิงเส้นครบทั้งพีชคณิตและกราฟ ส่วนเชิงเส้นกับกำลังสองยังไม่มี), `uk-nc-mathematics:UKNC-MA-KS3-A-12 → partial` (ประมาณคำตอบระบบเชิงเส้นจากกราฟครบ ส่วนกราฟกำลังสองอยู่ใน math.functions.quadratic), `uk-nc-mathematics:UKNC-MA-KS4-A-14 → full` เมื่อรวมกับ linear-equations, `au-ac9-mathematics:AC9M10A02 → full` เมื่อรวมกับ linear-inequalities (ระบบสมการและอสมการตัวแปรเดียว ตีความด้วยกราฟ)
- หัวข้อใหม่: ระบบสมการเชิงเส้นกับกำลังสอง (A-REI.7, UK KS4-A-12 ส่วนที่อยู่ใน { }) และระบบสามตัวแปรด้วยเมทริกซ์ (A-REI.8–9) ซึ่งตรงกับแผน math.linalg.matrices-elimination

## logarithms (math.functions.logarithms)

- โจทย์ 13 → 20 (p014–p020) ระดับ 1:3, 2:5, 3:4, 4:5, 5:3 · สถานการณ์จริง 5 ข้อ (p011 แผ่นดินไหวเชียงราย, p012, p013, p018 ยา, p019 เสียงรถตุ๊กตุ๊ก)
- ภาพวาดเอง 2 ภาพ: `exp-log-reflect.svg` (บทเรียน กราฟสะท้อนข้าม y = x หน่วยแกนเท่ากัน), `ph-scale.svg` (บทเรียน มาตราลอการิทึม) · Commons 0
- เพิ่มในบทเรียน: ลอการิทึมเป็นฟังก์ชันผกผันของเอกซ์โพเนนเชียล ($\log_b b^x = x$, $b^{\log_b x} = x$, กราฟสะท้อน, โดเมน), ขั้นตอนแก้ $a \cdot b^{ct} = d$ รวมฐาน e, เดซิเบล, การตรวจโดเมนของคำตอบ · ตัวอย่าง 2 ($\log_8 4$, $1200\mathrm{e}^{0.03t} = 3000$) · check 2 (p016, p017)
- ตัวชี้วัดที่ตอนนี้สอนครบ: `us-ccss-math:F-LE.4 → full` (เดิม เพิ่มฐาน e และ $ct$), `us-ccss-math:F-BF.5 → full` (ความสัมพันธ์ผกผันและใช้แก้ปัญหา p015 p016)
- ยังบางส่วน: `us-ccss-math:F-BF.4` (หาฟังก์ชันผกผันทั่วไป) ยังไม่จับคู่ บทนี้มีเฉพาะคู่ $b^x$ กับ $\log_b x$
- AU/UK: `au-ac9-mathematics:AU-M10A-A-04 → full` (ความสัมพันธ์ผกผันของเอกซ์โพเนนเชียลกับลอการิทึมและการแก้สมการ) · `au-ac9-mathematics:AC9M10A03 → partial` (แก้สมการเอกซ์โพเนนเชียล ส่วนกราฟอยู่ใน math.functions.exponential) · UK national curriculum (KS1–KS4) ไม่มีลอการิทึม
- หัวข้อใหม่: ฟังก์ชันผกผันทั่วไป (F-BF.4) ดูข้อเสนอใน functions-intro

## place-value (math.number.place-value)

- โจทย์ 13 → 20 (p014–p020) ระดับ 1:3, 2:6, 3:6, 4:4, 5:1 · สถานการณ์จริงในไทย 6 ข้อ (p005 p007 p009 p013 p017 p019)
- ภาพวาดเอง 2 ภาพ: `shift-chart.svg` (ตัวอย่างแสดงวิธีทำ ตารางหลักเลื่อนเลขโดด), `blocks-regroup.svg` (โจทย์ p014 บล็อกฐานสิบ) · Commons 0
- เพิ่มในบทเรียน: หลักทางซ้ายมีค่า 10 เท่าและทางขวา $\tfrac{1}{10}$, คูณหารด้วย 10 100 1,000 ด้วยการเลื่อนหลัก, คูณด้วยพหุคูณของ 10, รวมกลุ่มและแตกกลุ่มสิบ, บวกลบ 10 หรือ 100 ในใจ, จำนวนถึงหลักล้าน · ตัวอย่าง 2 (4 ร้อย 23 สิบ 18 หน่วย, $0.25 \times 1000$ และ $3.6 \div 100$) · check 2 (p014, p016)
- ตัวชี้วัดที่ตอนนี้สอนครบ: `us-ccss-math:1.NBT.2 → full`, `us-ccss-math:2.NBT.1 → full`, `us-ccss-math:4.NBT.1 → full`, `us-ccss-math:5.NBT.1 → full` (ส่วนที่เดิมยังขาดคือรวมกลุ่มสิบและความสัมพันธ์สิบเท่า) · เสนอจับคู่ใหม่ `us-ccss-math:1.NBT.5 → full`, `us-ccss-math:2.NBT.8 → full` (p015), `us-ccss-math:3.NBT.3 → full`, `us-ccss-math:5.NBT.2 → partial` (คูณหารด้วยกำลังของ 10 ครบ แต่ยังไม่ใช้สัญกรณ์เลขยกกำลัง ซึ่งอยู่ใน math.number.exponents)
- ยังบางส่วน: `us-ccss-math:K.NBT.1`, `1.NBT.1`, `2.NBT.2` (นับจำนวนและนับข้าม) อยู่ในขอบเขตหัวข้อที่เสนอ math.number.counting-numbers
- AU/UK: `uk-nc-mathematics:UKNC-MA-Y2-NPV-02`, `Y3-NPV-02`, `Y4-NPV-04`, `Y4-NPV-07`, `Y5-NPV-01`, `Y5-NPV-04`, `Y6-NPV-01`, `Y6-NPV-02`, `KS3-N-01 → full` · `uk-nc-mathematics:UKNC-MA-Y3-NPV-01`, `UKNC-MA-Y4-NPV-02`, `UKNC-MA-Y5-NPV-02 → partial` (บวกลบ 10 100 1,000 ในใจมี แต่การนับข้ามเป็นเรื่องของ counting-numbers) · `uk-nc-mathematics:UKNC-MA-Y4-NPV-09`, `Y5-NPV-06` (เลขโรมัน) ไม่ได้สอน ควรอยู่หัวข้อตัวเลขไทยและระบบตัวเลข · `au-ac9-mathematics:AC9M2N02 → full`, `AC9M4N01 → full`, `AC9M4N05 → full`, `AC9M5N01 → full`, `AC9M6N06 → full`, `AC9M7N03 → partial` (รูปกระจายครบ ยังไม่ใช้กำลังของ 10), `AC9M1N02 → full`
- หัวข้อใหม่: ระบบตัวเลขอื่น (เลขโรมัน ตัวเลขไทย ฐานสอง) เหมาะกับหัวข้อที่เสนอ math.number.counting-numbers

## polynomials (math.algebra.polynomials)

- โจทย์ 13 → 21 (p014–p021) ระดับ 1:3, 2:5, 3:7, 4:4, 5:2 · สถานการณ์จริงในไทย 5 ข้อ (p006 p010 p011 p015 p019)
- ภาพวาดเอง 2 ภาพ: `square-of-sum.svg` (บทเรียน), `banner-area.svg` (โจทย์ p015 แบบจำลองพื้นที่ที่ไม่บอกพื้นที่ช่อง) · Commons 0
- เพิ่มในบทเรียน: คูณทวินามสามตัว, สามเหลี่ยมปาสกาลและ $(a + b)^3$, สมบัติปิดของพหุนาม (หารไม่ปิด), เอกลักษณ์และการพิสูจน์ด้วยการกระจาย (รวมเอกลักษณ์สร้างสามสิ่งอันดับพีทาโกรัส) · ตัวอย่าง 2 (ตาราง $(x + 5)(x - 2)$, พิสูจน์ $(n + 1)^2 - n^2 = 2n + 1$) · check 2 (p014, p018)
- ตัวชี้วัดที่ตอนนี้สอนครบ: `us-ccss-math:A-APR.1 → full` (เพิ่มสมบัติปิด p018), เสนอจับคู่ใหม่ `us-ccss-math:A-APR.4 → full` (ตัวอย่างและ p020) · `us-ccss-math:7.EE.1 → full` และ `A-SSE.2` อยู่ใน factoring ด้วย
- ยังบางส่วน: เสนอจับคู่ `us-ccss-math:A-APR.5 → partial` (สามเหลี่ยมปาสกาลถึงกำลังสาม ยังไม่มีทฤษฎีบททวินามทั่วไป) · การหารพหุนามและทฤษฎีบทเศษเหลือ (A-APR.2, A-APR.6) อยู่ในแผน math.algebra.polynomial-equations
- AU/UK: `uk-nc-mathematics:UKNC-MA-KS3-A-04 → full` เมื่อรวมกับ factoring (รวมพจน์คล้าย คูณพจน์เข้าวงเล็บ ดึงตัวร่วม และกระจายผลคูณของทวินามตั้งแต่สองตัว p016), `uk-nc-mathematics:UKNC-MA-KS4-A-02 → partial` (พิสูจน์เอกลักษณ์ทางพีชคณิต ร่วมกับ linear-equations), `au-ac9-mathematics:AC9M9A02 → full` เมื่อรวมกับ factoring, `au-ac9-mathematics:AC9M8A01 → partial` (เชิงเส้นอยู่ใน math.algebra.expressions)
- หัวข้อใหม่: ทฤษฎีบททวินามและการจัดหมู่ (A-APR.5) ควรเชื่อมกับ math.prob.counting มากกว่าบทนี้

## probability (math.prob.probability)

- โจทย์ 13 → 21 (p014–p021) ระดับ 1:4, 2:5, 3:5, 4:5, 5:2 · สถานการณ์จริงในไทย 8 ข้อ (p002 p005 p011 p012 p013 p016 p017 p018)
- ภาพวาดเอง 5 ภาพ: `relative-frequency.svg` (ตัวอย่างแสดงวิธีทำ จำลองการโยนเหรียญ 1,000 ครั้งด้วย random.seed(7) จบที่ 0.537), `tree-we.svg` (ตัวอย่างแสดงวิธีทำ), `two-way-table.svg` (p017), `venn-clubs.svg` (p018), `tree-problem.svg` (p019 กิ่งที่สองเว้นให้เติม) · Commons 0
- เพิ่มในบทเรียน: ความน่าจะเป็นของทุกผลลัพธ์รวมเป็น 1, ความน่าจะเป็นจากการทดลอง ความถี่สัมพัทธ์ และจำนวนที่คาดหมาย, ตรวจความเป็นอิสระด้วยตัวเลขและความต่างของเหตุการณ์ที่เกิดพร้อมกันไม่ได้, แผนภาพต้นไม้แบบใส่คืนและไม่ใส่คืน, ตารางสองทาง แผนภาพเวนน์ กฎการบวก และ "อย่างใดอย่างหนึ่งเท่านั้น" · ตัวอย่าง 2 (ความถี่สัมพัทธ์ 29/50, ต้นไม้ไม่ใส่คืน) · check 2 (p014, p015)
- ตัวชี้วัดที่ตอนนี้สอนครบ: `us-ccss-math:7.SP.5 → full`, `us-ccss-math:7.SP.7 → full` (เทียบแบบจำลองกับผลทดลอง), `us-ccss-math:7.SP.8 → full`, `us-ccss-math:S-CP.1 → full` (และ หรือ ไม่ ด้วยเวนน์และตาราง), `us-ccss-math:S-CP.2 → full` (p020) · เสนอจับคู่ใหม่ `us-ccss-math:7.SP.6 → full` (p015 p016 และตัวอย่าง), `us-ccss-math:S-CP.7 → full` (p017)
- ยังบางส่วน: `us-ccss-math:S-CP.9` (ใช้การเรียงสับเปลี่ยนและจัดหมู่) ร่วมกับ math.prob.counting · เสนอจับคู่ `us-ccss-math:S-CP.4 → partial` (สร้างและอ่านตารางสองทาง แต่ยังไม่ใช้ตัดสินความเป็นอิสระหรือความน่าจะเป็นแบบมีเงื่อนไข)
- AU/UK: `uk-nc-mathematics:UKNC-MA-KS3-P-01`, `KS3-P-02`, `KS3-P-04`, `KS4-P-01`, `KS4-P-02`, `KS4-P-03 → full` · `uk-nc-mathematics:UKNC-MA-KS4-P-04 → partial` (ความน่าจะเป็นแบบมีเงื่อนไขยังไม่มี) · `au-ac9-mathematics:AC9M5P01`, `AC9M6P01`, `AC9M7P01`, `AC9M8P01`, `AC9M8P02`, `AC9M9P01`, `AC9M9P02 → full` · `AC9M5P02`, `AC9M6P02`, `AC9M7P02`, `AC9M8P03`, `AC9M9P03 → partial` (มีการตีความผลทดลองและจำลอง แต่ไม่ได้ให้ผู้เรียนทำการทดลองหรือจำลองด้วยเครื่องมือดิจิทัลเอง) · `AC9M10P01`, `AC9M10P02` ยังไม่มี
- หัวข้อใหม่: **ความน่าจะเป็นแบบมีเงื่อนไข** (us-ccss-math S-CP.3 S-CP.5 S-CP.6 S-CP.8, UK KS4-P-04, AU AC9M10P01–P02) ไม่มีในคลังและแผนเฟส 6 ต่อยอดจากตารางสองทางและแผนภาพต้นไม้ในบทนี้ได้ทันที

## สรุปการตรวจ

- `npm run validate -- --strict --only=<13 โฟลเดอร์ของชุดนี้>`: 0 error 0 warning
- `npm run validate -- --strict` ทั้งคลัง: error 7 และ warning 3 ทั้งหมดมาจากงานของชุดอื่นที่กำลังทำอยู่ (math/derivatives YAML ผิดรูปแบบ, physics/simple-harmonic-motion อ้าง p020 ที่ยังไม่มี, mappings และ proposals ที่อ้าง math.calculus.derivative, ภาพที่ยังไม่ถูกใช้ใน physics/electric-power และ physics/simple-harmonic-motion) ไม่มีจากโฟลเดอร์ของชุด M2
- `npm test`: ผ่าน 30/30
- ตรวจด้วยสคริปต์ว่าไม่มีอักขระควบคุม (เช่น `\t` ที่เกิดจาก backslash เดี่ยวใน YAML แบบ double-quoted) ในทุกสตริงของไฟล์ YAML ของชุดนี้
- factoring p020 เปลี่ยนตัวเลขเป็น $63 \times 57$ เพื่อไม่ซ้ำกับ polynomials p010 ($52 \times 48$)
