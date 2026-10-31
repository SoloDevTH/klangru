# บันทึกชุดงาน science-44 (เฟส 8)

สามหัวข้อแรกของวิชาใหม่ `science` (ทักษะวิทยาศาสตร์) จาก `docs/phase6/proposals-international.yaml` ไม่มีแถว `extend:` ภาพทุกภาพวาดเป็น SVG จากสคริปต์ เรนเดอร์เป็น PNG ด้วย Chromium และเปิดดูแล้ว ตัวเลขทุกตัวคำนวณด้วย python3 ไฟล์จับคู่ครบทุกตัวชี้วัดในแผน (ตรวจด้วยสคริปต์) ตัวชี้วัดที่ให้ลงมือทดลองหรือเก็บข้อมูลจริง ("plan and conduct", "setting up", "carry out", "gathering") จับคู่เป็น partial และสอนส่วนที่ทดสอบได้ในแอปแทน คือ ระบุตัวแปร เลือกการทดลองที่ยุติธรรม อ่านข้อมูล และหาข้อบกพร่อง ตามงานมอบหมาย

ลิงก์ตัวอย่างไปวิชาอื่น ([ข้อความ](/topic/<id>/)): ฟิสิกส์ physics.dynamics.friction, physics.kinematics.speed, physics.units.experiments-graphs, physics.units.si, physics.waves.shm (เฉลย) เคมี chemistry.materials.material-properties, chemistry.lab.safety-measurement, chemistry.solutions.solubility-percent, chemistry.matter.atomic-structure ชีววิทยา biology.plants.photosynthesis-intro, biology.cells.enzymes, biology.cells.diffusion-osmosis (เฉลย) โลก earthscience.geology.plate-tectonics คณิต math.stats.data-display ไม่สอนซ้ำเรื่องความชันและจุดตัดแกน (physics.units.experiments-graphs) และวิธีการทางวิทยาศาสตร์เฉพาะชีววิทยา (biology.foundations.life-and-science)

## รายหัวข้อ

### science.inquiry.investigation-design (`content/science/investigation-design/`)
โจทย์ 18 ข้อ (mcq/match/text/order/numeric) ภาพ 2 ภาพ (fair-test.svg ในบทเรียนเท่านั้นเพราะกล่องในภาพเฉลยชนิดตัวแปร, quadrat.svg ในบทเรียนและโจทย์ p013) AU I01 ครบทุกชั้น AU I02 บางส่วนทุกชั้น (conduct) UK Y1-2-WS-01 Y3-4-WS-01 Y5-6-WS-01 Y5-6-WS-04 (โจทย์ p018) KS3 ESI-01 ESI-02 ESI-06 KS4 ESS-01 ESS-02 ESS-05 ครบ Y3-4-WS-02 KS3 ESI-03 KS4 ESS-03 บางส่วน บทเรียนเขียนประโยคสั้นตามความยาก 1.5 แต่ตัวชี้วัดครอบคลุมถึง KS4 (สมมติฐานจากทฤษฎี การสุ่มตัวอย่างที่เป็นตัวแทน) โจทย์ระดับ 4–5 จึงยากกว่าบทเรียนส่วนต้น ใช้วัดและแหล่งน้ำในชุมชนแทน "Country/Place" ของ AC9 **ข้อเสนอ**: ความยาก 1.5 เหมาะกับครึ่งแรกของบทเรียน ถ้าต้องการแยก อาจย้ายการสุ่มตัวอย่างภาคสนามและสมมติฐานเชิงทฤษฎี (KS4) ไปหัวข้อระดับ 3

### science.inquiry.data-analysis (`content/science/data-analysis/`)
โจทย์ 17 ข้อ (numeric 8 ข้อ: ค่าเฉลี่ย พิสัย ค่าผิดปกติ อ่านกราฟ อัตราเร็ว อัตราส่วนทำนาย ร้อยละการเปลี่ยนแปลง ความไม่แน่นอน) ภาพ 2 ภาพ (bounce-graph.svg ใช้ใน p013, dissolve.svg ใช้ใน p008 p009) AU I03/I04/I05 ทุกชั้นครบ UK 14 ตัวชี้วัดครบ (รวม KS4-WS-AE-01 ความแม่น ความเที่ยง ความคลาดเคลื่อนสุ่มและเป็นระบบ ความไม่แน่นอน ± ครึ่งพิสัย) Y1-2-WS-06 บางส่วน (gathering) ข้อมูลลูกปิงปองและการละลายของน้ำตาลเป็นข้อมูลสมมติ (ระบุในภาพ) **ข้อเสนอ**: ความแม่น/ความเที่ยงและความคลาดเคลื่อนซ้อนกับหัวข้อในแผน science.inquiry.evaluating-claims (3.5) เล็กน้อย หัวข้อนี้สอนเฉพาะนิยามและการแยกชนิด ส่วนการประเมินวิธีการและเสนอการปรับปรุงเหลือให้ evaluating-claims

### science.nature.nature-of-science (`content/science/nature-of-science/`)
โจทย์ 16 ข้อ ภาพ 2 ภาพ (changes.svg ใช้ใน p007 p008 p015, peer-review.svg ในบทเรียนเท่านั้นเพราะเป็นคำตอบของโจทย์ลำดับ p004) AU H01 ทุกชั้น H02 ปี 9–10 และ UK SA-02 DST-01 DST-02 DST-06 VUSN-02 ครบ AC9S7H02 AC9S8H02 บางส่วน (ใช้ภูมิปัญญาไทยแทนมุมมองชนพื้นเมืองออสเตรเลีย) ข้อเท็จจริงทางประวัติศาสตร์ (หว้ากอ 18 ส.ค. 2411 และคณะฝรั่งเศส, ฌองเซนกับฮีเลียมในวันเดียวกันที่อินเดีย, H. pylori 2525/โนเบล 2548, เวเกเนอร์ 2455, พลูโต 2473/2549, ฟิวชันเย็น 2532, Mars Climate Orbiter 2542 และ 1 ปอนด์-แรง ≈ 4.45 N, กิโลกรัมนิยามใหม่ 2562, ฮุก 2208, กาลิเลโอ 2153, จีโนมมนุษย์ 2546) มาจากความรู้ทั่วไปและวิกิพีเดีย ตรวจเฉพาะหน้า H. pylori และ Mars Climate Orbiter ว่าเปิดได้ ปีของเวเกเนอร์ตรงกับหัวข้อ earthscience.geology.plate-tectonics **ไม่แน่ใจ**: ช่วง "พ.ศ. 2503–2512" ของหลักฐานพื้นสมุทรเป็นการประมาณช่วงทศวรรษ 1960

## หมายเหตุอื่น

- ความยาวบทเรียน (Intl.Segmenter): investigation-design 766 data-analysis 915 nature-of-science 1,178 คำ
- ลิงก์อ้างอิงทุกลิงก์ตรวจด้วย curl ได้ HTTP 200
- วิชา science ยังไม่มีหัวข้ออื่นในคลัง หัวข้อเหล่านี้จึงยังไม่ได้เป็น prerequisite ของหัวข้อฟิสิกส์ เคมี ชีววิทยา **ข้อเสนอ**: เมื่อรวมแผน ควรพิจารณาให้ biology.foundations.life-and-science และ physics.units.experiments-graphs มี science.inquiry.investigation-design หรือ data-analysis เป็น prerequisite หรือ encompasses
