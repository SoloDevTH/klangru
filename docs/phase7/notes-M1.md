# บันทึกชุดงาน M1 (คณิตศาสตร์ 14 หัวข้อ)

ชุดนี้เติมโจทย์ ตัวอย่างแสดงวิธีทำ คำถามชวนคิด ภาพประกอบ และเนื้อหาที่หลักสูตรต่างประเทศสอน ตาม `docs/phase7/enrichment-brief.md`

- หลักสูตรที่ใช้เทียบ: `us-ccss-math` (มีไฟล์จับคู่แล้ว), `au-ac9-mathematics` และ `uk-nc-mathematics` (มีกรอบหลักสูตรระหว่างทำงาน แต่ยังไม่มีไฟล์จับคู่)
- ภาพทั้งหมดวาดเองเป็น SVG ด้วยสคริปต์ Python ที่คำนวณพิกัดตามสัดส่วนจริง เรนเดอร์เป็น PNG ด้วย Chromium และเปิดดูทุกภาพ ไม่มีภาพจาก Commons
- ตัวเลขทุกตัว (คำตอบและค่า misconception) คำนวณด้วย python3 ก่อนใส่
- ตัวชี้วัดที่เขียนว่า `→ full` คือหลังเติมแล้ว บทเรียนและโจทย์สอนครบตามข้อความตัวชี้วัด ยังไม่ได้แก้ไฟล์ใน `curriculum/` (ตามกติกา) ผู้ดูแลหลักสูตรควรนำไปปรับไฟล์จับคู่

## math.algebra.expressions (`algebraic-expressions`)

- โจทย์ 10 → 22 (เพิ่ม p011–p022)
- ภาพวาดเอง 2: `area-model-distributive.svg` (บทเรียน), `area-split-rectangle.svg` (โจทย์ p020) · Commons 0
- ตัวอย่างแสดงวิธีทำ: ดึงตัวร่วม $12a + 8b$, กระจายวงเล็บที่มีสัมประสิทธิ์เศษส่วน · คำถามชวนคิด: p012, p015
- เนื้อหาที่เพิ่ม: ส่วนต่าง ๆ ของนิพจน์ (ผลบวก ผลคูณ ตัวประกอบ ผลหาร) สูตรเป็นนิพจน์ ($V = s^3$, $A = 6s^2$) นิพจน์ที่เท่ากัน นิพจน์/สมการ/อสมการ/เอกลักษณ์ การดึงตัวร่วม สัมประสิทธิ์เศษส่วนและทศนิยม ($a + 0.07a = 1.07a$) การตีความ $P(1 + r)^n$
- ตอนนี้สอนครบ:
  - us-ccss-math:6.EE.2 → full, 6.EE.3 → full, 6.EE.4 → full, 6.EE.6 → full, 7.EE.1 → full, A-SSE.1 → full
  - us-ccss-math:7.EE.2 → full (ยังไม่ได้จับคู่ เสนอเพิ่มในแถวนี้)
  - au-ac9-mathematics:AC9M7A01 → full, AC9M7A02 → full
  - uk-nc-mathematics:UKNC-MA-KS3-A-01 → full, UKNC-MA-KS3-A-02 → full, UKNC-MA-KS3-A-03 → full
- ยังเป็นบางส่วน:
  - au-ac9-mathematics:AC9M8A01 (การจัดรูปสูตร "rearrange" อยู่ในหัวข้อ rearranging-formulas)
  - uk-nc-mathematics:UKNC-MA-KS3-A-04 (การกระจายผลคูณของทวินามอยู่ในหัวข้อ polynomials), UKNC-MA-KS4-A-02 (มีนิยามเอกลักษณ์ ยังไม่มีการพิสูจน์)
  - us-ccss-math:3.MD.7 (แบบจำลองพื้นที่ของสมบัติการแจกแจงสอนที่นี่และในหัวข้อพื้นที่)

## math.geometry.angles (`angles`)

- โจทย์ 13 → 23 (เพิ่ม p014–p023 และใส่ภาพให้ p013 เดิม)
- ภาพวาดเอง 6: บทเรียน `protractor-50.svg`, `transversal-angles.svg`, `triangle-angle-sum.svg` · โจทย์ `protractor-reading.svg` (p014), `exterior-angle.svg` (p017), `parallel-zigzag.svg` (p013) · Commons 0
- ตัวอย่างแสดงวิธีทำ: มุมบนเส้นตรง $48 + x + 2x = 180$, มุมภายนอกของสามเหลี่ยมกับสมการ · คำถามชวนคิด: p014, p017
- เนื้อหาที่เพิ่ม: จุด เส้นตรง ส่วนของเส้นตรง รังสี สัญลักษณ์ตั้งฉากและขนาน องศาเป็นเศษส่วนของการหมุน มุมบวกกันได้ การวัดและวาดมุมด้วยโพรแทรกเตอร์ (สองสเกล) มุมรอบจุด รูปหลายเหลี่ยมปกติ เหตุผลว่าทำไมมุมภายในสามเหลี่ยมรวม $180^\circ$ มุมภายนอกของสามเหลี่ยม มุมภายนอกของรูปหลายเหลี่ยมรวม $360^\circ$
- ตอนนี้สอนครบ:
  - us-ccss-math:4.MD.5 → full, 4.MD.7 → full, 7.G.5 → full
  - us-ccss-math:4.MD.6 (ยังไม่ได้จับคู่) → partial ดูด้านล่าง
  - au-ac9-mathematics:AC9M3M05 → full, AC9M4M04 → full, AC9M6M04 → full, AC9M7M04 → full, AC9M7M05 → full
  - uk-nc-mathematics:UKNC-MA-Y3-GPS-02 → full, UKNC-MA-Y3-GPS-03 → full, UKNC-MA-Y4-GPS-02 → full, UKNC-MA-Y5-GPS-02 → full, UKNC-MA-Y6-GPS-05 → full, UKNC-MA-KS3-G-10 → full, UKNC-MA-KS3-G-11 → full, UKNC-MA-KS3-G-12 → full
- ยังเป็นบางส่วน:
  - us-ccss-math:4.MD.6, au-ac9-mathematics:AC9M5M04, uk-nc-mathematics:UKNC-MA-Y5-GPS-03 (อ่านโพรแทรกเตอร์จากภาพได้ แต่แอปให้ผู้เรียนวาดหรือวัดมุมจริงไม่ได้)
  - us-ccss-math:4.G.1, uk-nc-mathematics:UKNC-MA-KS3-G-05 (ระบุและใช้สัญลักษณ์ได้ แต่ไม่มีการวาด)
  - us-ccss-math:8.G.5 (มุมในสามเหลี่ยม มุมภายนอก เส้นขนานครบ ส่วนเกณฑ์มุม-มุมของความคล้ายอยู่ในหัวข้อ similarity)
  - uk-nc-mathematics:UKNC-MA-Y5-GPS-04 (มุมรอบจุด มุมบนเส้นตรง รูปหลายเหลี่ยมปกติครบ ส่วนสมบัติของสี่เหลี่ยมผืนผ้ายังไม่มี)
  - uk-nc-mathematics:UKNC-MA-Y6-GPS-03 (มุมในสามเหลี่ยมและรูปหลายเหลี่ยมปกติครบ ส่วนการจำแนกรูปสี่เหลี่ยมตามสมบัติยังไม่มี)

## math.geometry.area-perimeter (`area-perimeter`)

- โจทย์ 14 → 24 (เพิ่ม p015–p024 และใส่ภาพให้ p009, p010 เดิม)
- ภาพวาดเอง 8: บทเรียน `same-area-different-perimeter.svg`, `circle-rearranged.svg` · โจทย์ `grid-shape.svg` (p015), `l-shaped-room.svg` (p009, p010), `house-wall.svg` (p018), `garden-path.svg` (p022), `pond-grid.svg` (p023) · Commons 0
- ตัวอย่างแสดงวิธีทำ: หาด้านที่ไม่รู้จากพื้นที่แล้วหาเส้นรอบรูป, พื้นที่ทางเดินรอบสนามวงกลม · คำถามชวนคิด: p015, p017
- เนื้อหาที่เพิ่ม: พื้นที่คือการนับตารางหน่วย แบบจำลองพื้นที่ของสมบัติการแจกแจง พื้นที่บวกกันได้ ประมาณพื้นที่รูปโค้งด้วยตาราง หาด้านที่ไม่รู้จากพื้นที่หรือเส้นรอบรูป พื้นที่เท่ากันแต่เส้นรอบรูปต่างกัน (และกลับกัน) เหตุผลของสูตร $\pi r^2$ จากการตัดวงกลมมาเรียง คำตอบที่แม่นยำในรูป $\pi$
- ตอนนี้สอนครบ:
  - us-ccss-math:3.MD.7 → full, 3.MD.8 → full, 4.MD.3 → full, 6.G.1 → full, 7.G.4 → full
  - us-ccss-math:3.MD.5 → full, 3.MD.6 → full (ยังไม่ได้จับคู่ เสนอเพิ่ม)
  - au-ac9-mathematics:AC9M4M02 → full, AC9M5M02 → full, AC9M6M02 → full, AC9M7M01 → full, AC9M7M03 → full, AC9M8M01 → full, AC9M8M03 → full
  - uk-nc-mathematics:UKNC-MA-Y4-M-02 → full, UKNC-MA-Y4-M-03 → full, UKNC-MA-Y5-M-03 → full, UKNC-MA-Y5-M-04 → full, UKNC-MA-Y6-M-04 → full, UKNC-MA-Y6-M-06 → full, UKNC-MA-KS3-G-02 → full
- ยังเป็นบางส่วน:
  - us-ccss-math:7.G.6, uk-nc-mathematics:UKNC-MA-KS3-G-01 (ส่วนพื้นที่ครบ ปริมาตรและพื้นที่ผิวอยู่ในหัวข้อ volume-surface)
  - uk-nc-mathematics:UKNC-MA-KS4-N-04 (คำนวณแม่นยำด้วย $\pi$ ครบ ส่วนเศษส่วนและกรณฑ์อยู่หัวข้ออื่น)

## math.stats.central-tendency (`central-tendency`)

- โจทย์ 13 → 23 (เพิ่ม p014–p023)
- ภาพวาดเอง 3: บทเรียน `mean-balance-point.svg`, `distribution-shapes.svg` · โจทย์ `dotplot-books.svg` (p015) · Commons 0
- ตัวอย่างแสดงวิธีทำ: ตรวจค่าเฉลี่ยด้วยจุดสมดุล, เลือกค่ากลางให้เหมาะกับรูปร่างของข้อมูล · คำถามชวนคิด: p016, p017
- เนื้อหาที่เพิ่ม: คำถามทางสถิติ การแจกแจง (ศูนย์กลาง การกระจาย รูปร่าง) ค่าเฉลี่ยเป็นจุดสมดุล รูปร่างสมมาตร เบ้ขวา เบ้ซ้ายกับตำแหน่งค่าเฉลี่ยและมัธยฐาน ผลของการบวกหรือคูณข้อมูลทุกตัว การรายงานค่ากลางพร้อมบริบท ค่าเฉลี่ยรวมของสองกลุ่ม ประมาณค่าเฉลี่ยจากข้อมูลที่จัดเป็นช่วงและชั้นที่เป็นฐานนิยม
- ตอนนี้สอนครบ:
  - us-ccss-math:6.SP.2 → full, 6.SP.3 → full, 6.SP.1 → full (ยังไม่ได้จับคู่ เสนอเพิ่ม)
  - au-ac9-mathematics:AC9M5ST01 → full (ส่วนฐานนิยมและรูปร่าง), AC9M7ST01 → full
  - uk-nc-mathematics:UKNC-MA-Y6-S-02 → full
- ยังเป็นบางส่วน:
  - us-ccss-math:6.SP.5, S-ID.2, S-ID.3, uk-nc-mathematics:UKNC-MA-KS3-S-01, UKNC-MA-KS4-S-04, au-ac9-mathematics:AC9M9ST03 (ส่วนค่ากลางครบ ส่วนการกระจาย IQR MAD ส่วนเบี่ยงเบนมาตรฐานอยู่ในหัวข้อ dispersion)
  - au-ac9-mathematics:AC9M7ST02 (แผนภาพต้นใบอยู่ในหัวข้อ data-display)

## math.geometry.circles (`circles`)

- โจทย์ 13 → 22 (เพิ่ม p014–p022)
- ภาพวาดเอง 6: บทเรียน `circle-parts.svg`, `central-inscribed-angle.svg` · โจทย์ `cyclic-quadrilateral.svg` (p015), `chord-distance.svg` (p017), `tangents-external-point.svg` (p018), `arch.svg` (p022) · Commons 0
- ตัวอย่างแสดงวิธีทำ: เส้นรอบรูปของเซกเตอร์, พิสูจน์ว่ามุมในส่วนโค้งเป็นครึ่งหนึ่งของมุมที่จุดศูนย์กลาง · คำถามชวนคิด: p014, p015
- เนื้อหาที่เพิ่ม: วงกลมทุกวงคล้ายกัน ส่วนโค้งแปรผันตรงกับรัศมี เรเดียนเป็นอัตราส่วน $s/r$ และความยาวส่วนโค้งบนวงกลมหนึ่งหน่วย เส้นตั้งฉากจากจุดศูนย์กลางแบ่งครึ่งคอร์ด เส้นสัมผัสตั้งฉากรัศมี เส้นสัมผัสสองเส้นจากจุดภายนอกยาวเท่ากัน มุมที่ล้อมวงกลม รูปสี่เหลี่ยมแนบในวงกลม คำตอบแม่นยำในรูป $\pi$
- ตอนนี้สอนครบ:
  - us-ccss-math:G-C.2 → full, G-C.5 → full, F-TF.1 → full
  - au-ac9-mathematics:AU-M10A-SP-01 → full
  - uk-nc-mathematics:UKNC-MA-Y6-GPS-04 → full, UKNC-MA-KS4-G-03 → full, UKNC-MA-KS4-G-07 → full
- ยังเป็นบางส่วน:
  - us-ccss-math:G-C.1 (บอกเหตุผลแบบไม่เป็นทางการว่าวงกลมทุกวงคล้ายกัน ยังไม่มีการพิสูจน์ด้วยการแปลง), G-C.3 (มีสมบัติมุมของรูปสี่เหลี่ยมแนบในวงกลม ยังไม่มีการสร้างวงกลมแนบในและล้อมรอบสามเหลี่ยม) ทั้งสองข้อยังไม่ได้จับคู่
  - uk-nc-mathematics:UKNC-MA-KS4-G-04 (ทฤษฎีบทวงกลมส่วนใหญ่ครบ ยังไม่มีทฤษฎีบทมุมในส่วนโค้งแย้ง (alternate segment))
- เรื่องที่ควรเป็นหัวข้อใหม่: **สมการวงกลม** $(x - h)^2 + (y - k)^2 = r^2$ และเส้นสัมผัสวงกลมบนระนาบพิกัด (us-ccss-math:G-GPE.1, uk-nc-mathematics:UKNC-MA-KS4-A-10) ต่อจาก coordinate-plane และ pythagoras

## math.functions.coordinate-plane (`coordinate-plane`)

- โจทย์ 14 → 23 (เพิ่ม p015–p023)
- ภาพวาดเอง 4: บทเรียน `quadrants.svg`, `transformations.svg` · โจทย์ `points-abcd.svg` (p015), `garden-plot.svg` (p019) · Commons 0
- ตัวอย่างแสดงวิธีทำ: เส้นรอบรูปและพื้นที่จากพิกัด, หมุนสามเหลี่ยม $90^\circ$ รอบจุดกำเนิด · คำถามชวนคิด: p015, p017
- เนื้อหาที่เพิ่ม: พิกัดที่เป็นทศนิยมและเศษส่วน สะท้อนในแกนทั้งสองและจำนวนตรงข้ามของจำนวนตรงข้าม การหมุน $90^\circ$ และ $180^\circ$ รอบจุดกำเนิด การขยายจากจุดกำเนิด สิ่งที่คงเดิมและเปลี่ยนไปเมื่อแปลงรูป จุดกึ่งกลาง รูปหลายเหลี่ยมบนระนาบพิกัด (เส้นรอบรูป พื้นที่ หาจุดยอดที่สี่ของสี่เหลี่ยมด้านขนาน)
- ตอนนี้สอนครบ:
  - us-ccss-math:5.G.1 → full, 5.G.2 → full, 6.NS.6 → full, 6.NS.8 → full, 6.G.3 → full, 8.G.3 → full
  - au-ac9-mathematics:AC9M5SP02 → full, AC9M6N01 → full (ส่วนพิกัด), AC9M6SP02 → full, AC9M7SP03 → full
  - uk-nc-mathematics:UKNC-MA-Y4-GPD-01 → full, UKNC-MA-Y4-GPD-02 → full, UKNC-MA-Y5-GPD-01 → full, UKNC-MA-Y6-GPD-01 → full, UKNC-MA-KS3-A-08 → full, UKNC-MA-KS3-G-08 → full
- ยังเป็นบางส่วน:
  - au-ac9-mathematics:AC9M9A03 (จุดกึ่งกลางครบ ระยะทางอยู่ในหัวข้อ pythagoras ความชันอยู่ในหัวข้อ linear-graphs)
  - us-ccss-math:G-GPE.6 (มีเฉพาะจุดกึ่งกลาง ยังไม่แบ่งส่วนของเส้นตรงตามอัตราส่วนอื่น), G-GPE.7 (มีเส้นรอบรูปและพื้นที่ของรูปที่ด้านขนานแกน ด้านเอียงอยู่ในหัวข้อ pythagoras) ทั้งสองข้อยังไม่ได้จับคู่
  - uk-nc-mathematics:UKNC-MA-Y6-GPD-02, au-ac9-mathematics:AC9M5SP03 (บรรยายและคำนวณการแปลงได้ แต่แอปให้วาดรูปเองไม่ได้), UKNC-MA-KS3-G-09, UKNC-MA-KS4-G-01 (ขยายด้วยตัวประกอบบวกจากจุดกำเนิด ยังไม่มีตัวประกอบเศษส่วนและลบ ซึ่งเหมาะกับหัวข้อ similarity)
- เรื่องที่ควรเป็นหัวข้อใหม่: **การแปลงทางเรขาคณิตและความเท่ากันทุกประการ** (us-ccss-math:8.G.1, 8.G.2, G-CO.2–G-CO.6, uk-nc-mathematics:UKNC-MA-KS4-G-02, au-ac9-mathematics:AC9M6SP03) รวมการหมุนรอบจุดใด ๆ การสะท้อนในเส้นใด ๆ การแปลงต่อเนื่อง และสมมาตร

## math.prob.counting (`counting`)

- โจทย์ 14 → 23 (เพิ่ม p015–p023)
- ภาพวาดเอง 4: บทเรียน `tree-diagram.svg`, `two-dice-table.svg` · โจทย์ `venn-sports.svg` (p018), `street-grid.svg` (p023) · Commons 0
- ตัวอย่างแสดงวิธีทำ: นับด้วยตารางผลลัพธ์ลูกเต๋าสองลูก, นับกรณีตรงข้าม (ไม่นั่งติดกัน) · คำถามชวนคิด: p015, p017
- เนื้อหาที่เพิ่ม: ปริภูมิตัวอย่างด้วยรายการที่เป็นระบบ แผนภาพต้นไม้ และตาราง ใส่คืนกับไม่ใส่คืน หลักการบวกเมื่อสองกลุ่มซ้อนกัน (แผนภาพเวนน์) นับส่วนเติมเต็ม ("อย่างน้อยหนึ่ง") การเรียงของที่มีบางชิ้นเหมือนกัน เส้นทางบนตาราง
- ตอนนี้สอนครบ:
  - us-ccss-math:7.SP.8 → partial (ข้อย่อย b ครบ ส่วน a และ c เป็นความน่าจะเป็นและการจำลอง อยู่ในหัวข้อ probability)
  - au-ac9-mathematics:AC9M5P01 → full (ส่วนการแจกแจงผลลัพธ์), AC9M7P01 → full (ส่วนปริภูมิตัวอย่าง)
  - uk-nc-mathematics:UKNC-MA-Y6-A-05 → full, UKNC-MA-KS3-P-03 → full, UKNC-MA-KS4-N-01 → full
- ยังเป็นบางส่วน:
  - us-ccss-math:S-CP.9, au-ac9-mathematics:AC9M8P02, AC9M9P01, uk-nc-mathematics:UKNC-MA-KS3-P-04 (ส่วนการแจกแจงผลลัพธ์ครบ ส่วนการกำหนดความน่าจะเป็นอยู่ในหัวข้อ probability)
- เรื่องที่ควรเป็นหัวข้อใหม่: **เซตและแผนภาพเวนน์** (สัญลักษณ์เซต ยูเนียน อินเตอร์เซกชัน คอมพลีเมนต์ สามเซต) ซึ่งหลักสูตรไทย ม.4 และ uk-nc-mathematics:UKNC-MA-KS3-P-03 สอนเป็นเรื่องแยก หัวข้อนี้ใช้เพียงหลักการบวกสองกลุ่ม

## math.stats.data-display (`data-display`)

- โจทย์ 12 → 22 (เพิ่ม p013–p022)
- ภาพวาดเอง 6: บทเรียน `stem-leaf-example.svg`, `line-graph-icecream.svg` · โจทย์ `pictogram-transport.svg` (p013), `bar-chart-bread.svg` (p014), `stem-leaf-runners.svg` (p016), `line-graph-temperature.svg` (p018) · Commons 0 (ข้อมูลในกราฟเป็นข้อมูลสมมติและเขียนกำกับไว้)
- ตัวอย่างแสดงวิธีทำ: อ่านแผนภาพต้นใบ (พิสัย มัธยฐาน ฐานนิยม), ความถี่สัมพัทธ์แบบมีเงื่อนไขในตารางสองทาง · คำถามชวนคิด: p014, p016
- เนื้อหาที่เพิ่ม: แผนภูมิรูปภาพและสเกลของแผนภูมิแท่ง ("มากกว่ากี่") แผนภาพจุดรวมค่าที่เป็นเศษส่วน แผนภาพต้นใบ กราฟเส้นตามเวลา ตารางสองทางกับความถี่สัมพัทธ์ร่วม ขอบ และแบบมีเงื่อนไข ความสัมพันธ์ไม่ใช่สาเหตุ วงจรการสำรวจทางสถิติและการเลือกแผนภูมิ
- ตอนนี้สอนครบ:
  - us-ccss-math:3.MD.3 → full (อ่านและตีความ), S-ID.5 → full
  - us-ccss-math:3.MD.4, 4.MD.4, 5.MD.2 → full ด้านการอ่านแผนภาพจุดและแก้โจทย์จากแผนภาพ (ยังไม่ได้จับคู่)
  - us-ccss-math:8.SP.4 → full (ยังไม่ได้จับคู่)
  - au-ac9-mathematics:AC9M3ST02 → full, AC9M4ST01 → full, AC9M5ST02 → full, AC9M7ST02 → full, AC9M9ST04 → full, AC9M10ST04 → full
  - uk-nc-mathematics:UKNC-MA-Y2-S-01 → full, UKNC-MA-Y3-S-01 → full, UKNC-MA-Y3-S-02 → full, UKNC-MA-Y4-S-01 → full, UKNC-MA-Y4-S-02 → full, UKNC-MA-Y5-S-01 → full, UKNC-MA-Y6-S-01 → full, UKNC-MA-KS3-S-02 → full, UKNC-MA-KS4-S-02 → full
- ยังเป็นบางส่วน:
  - us-ccss-math:6.SP.4, S-ID.1 (แผนภาพจุดและฮิสโทแกรมครบ แผนภาพกล่องอยู่ในหัวข้อ dispersion)
  - uk-nc-mathematics:UKNC-MA-KS4-S-03 (ยังไม่มีฮิสโทแกรมที่อันตรภาคชั้นกว้างไม่เท่ากันและกราฟความถี่สะสม)
  - การ "วาด" แผนภูมิ (3.MD.3, 4.MD.4, AC9M4ST01) แอปให้วาดเองไม่ได้ มีเพียงขั้นตอนและการอ่าน
- เรื่องที่ควรเป็นหัวข้อใหม่: **ข้อมูลสองตัวแปรและแผนภาพการกระจาย** (us-ccss-math:8.SP.1–8.SP.3, S-ID.6–S-ID.9, au-ac9-mathematics:AC9M10ST03, uk-nc-mathematics:UKNC-MA-KS3-S-03, UKNC-MA-KS4-S-06) และ **การสุ่มตัวอย่างและการอนุมานจากตัวอย่าง** (us-ccss-math:7.SP.1–7.SP.3, au-ac9-mathematics:AC9M8ST01–AC9M8ST03, uk-nc-mathematics:UKNC-MA-KS4-S-01)

## math.number.decimals (`decimals`)

- โจทย์ 12 → 22 (เพิ่ม p013–p022)
- ภาพวาดเอง 4: บทเรียน `hundredths-grid.svg`, `area-model-decimal.svg` · โจทย์ `hundredths-grid-problem.svg` (p013), `number-line-hundredths.svg` (p014) · Commons 0
- ตัวอย่างแสดงวิธีทำ: แปลง $\tfrac38$ เป็นทศนิยมด้วยการหาร, แปลง $0.1\dot{6}$ เป็นเศษส่วน · คำถามชวนคิด: p013, p016
- เนื้อหาที่เพิ่ม: ส่วนสิบ ส่วนร้อยด้วยตารางร้อยช่อง รูปกระจายของทศนิยม แบบจำลองพื้นที่ของการคูณทศนิยม ทศนิยมรู้จบกับตัวประกอบ 2 และ 5 ของตัวส่วน แปลงทศนิยมรู้จบและทศนิยมซ้ำเป็นเศษส่วน ปัดเศษเป็นทศนิยมและเลขนัยสำคัญ ประมาณคำตอบเพื่อตรวจตำแหน่งจุด เทียบราคาต่อหน่วย
- ตอนนี้สอนครบ:
  - us-ccss-math:4.NF.7 → full, 5.NBT.2 → full, 5.NBT.7 → full, 6.NS.3 → full, 8.NS.1 → full
  - us-ccss-math:4.NF.6 → full (ยังไม่ได้จับคู่ เสนอเพิ่ม)
  - au-ac9-mathematics:AC9M4N01 → full, AC9M5N01 → full, AC9M6N04 → full, AC9M6N06 → full, AC9M7N05 → full, AC9M8N03 → full
  - uk-nc-mathematics:UKNC-MA-Y4-NF-05 → full, UKNC-MA-Y4-NF-09 → full, UKNC-MA-Y5-NF-06 → full, UKNC-MA-Y5-NF-07 → full, UKNC-MA-Y5-NF-09 → full, UKNC-MA-Y5-NMD-07 → full, UKNC-MA-Y6-NF-06 → full, UKNC-MA-Y6-NF-07 → full, UKNC-MA-Y6-NF-10 → full, UKNC-MA-KS3-N-09 → full, UKNC-MA-KS4-N-06 → full
- ยังเป็นบางส่วน:
  - us-ccss-math:7.NS.2 (แปลงจำนวนตรรกยะเป็นทศนิยมและคูณหารทศนิยมที่เป็นลบได้ แต่กฎเครื่องหมายของการคูณหารจำนวนตรรกยะอยู่ในหัวข้อ integers)
  - uk-nc-mathematics:UKNC-MA-KS3-N-13 (ทศนิยมและเลขนัยสำคัญครบ แต่การปัดเศษจำนวนนับอยู่ในหัวข้อ place-value), UKNC-MA-KS3-N-14 และ UKNC-MA-KS4-N-08 (มีการประมาณ ยังไม่มีขอบเขตบนล่างของความคลาดเคลื่อน $a < x \le b$)
- เรื่องที่ควรเป็นหัวข้อใหม่: **ขอบเขตของความคลาดเคลื่อนจากการปัดเศษ** (upper and lower bounds) ตาม uk-nc-mathematics:UKNC-MA-KS3-N-14, UKNC-MA-KS4-N-08 และ us-ccss-math:N-Q.3
