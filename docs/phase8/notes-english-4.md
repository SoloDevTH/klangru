# บันทึกชุดงาน english-4 (เฟส 8)

หัวข้อภาษาอังกฤษ 8 หัวข้อจาก `docs/phase6/proposals-languages.yaml` ไม่มีแถว `extend:` ที่ผูกกับหัวข้อในชุดนี้ ภาพทุกภาพวาดเป็น SVG ด้วยสคริปต์ (scratchpad `phase8-english-4/fig_*.py`) เรนเดอร์เป็น PNG ด้วย Chromium และเปิดตรวจทุกภาพแล้ว ไม่มีภาพจาก Commons จำนวนคำของบทเรียนนับด้วย `Intl.Segmenter` (ภาษาไทย) อยู่ที่ 500–730 คำ แอปไม่มีเสียง ตัวชี้วัดด้านการฟังและการพูดจึงจับคู่แบบ partial ทุกตัว (สอนและทดสอบส่วนที่เป็นความรู้ในรูปอ่านและเขียน) โจทย์ข้อความ (`text`) ใส่รูปย่อ รูปเต็ม และแบบมีและไม่มีจุดท้ายประโยคไว้ใน `accepted` แล้ว (ตัวตรวจของแอปไม่สนตัวพิมพ์และช่องว่าง แต่สนเครื่องหมายวรรคตอน)

## english/alphabet-sounds (`english.phonics.alphabet-sounds`)

- โจทย์ 17 ข้อ (ความยาก 1:4 2:4 3:4 4:3 5:2; mcq text match numeric order) ภาพ 2 ภาพ (`alphabet-chart.svg`, `magic-e.svg`)
- แอปไม่มีเสียง จึงบอกเสียงด้วยตัวอักษรไทยที่ใกล้เคียง (เช่น a = แอ, o = เอาะ แบบบริติช) ผู้ตรวจควรดูว่าการเทียบเสียงเหมาะกับ ป.1–2 หรือไม่ ข้อเสนอ: หัวข้อนี้ได้ประโยชน์มากถ้าแอปรองรับไฟล์เสียงในอนาคต

## english/classroom-language (`english.vocabulary.classroom-language`)

- โจทย์ 17 ข้อ (1:4 2:4 3:5 4:2 5:2; mcq text match order) ภาพ 2 ภาพ (`classroom-commands.svg` ในบทเรียน, `classroom-actions-quiz.svg` ไม่มีป้ายและสลับลำดับ ใช้ในโจทย์ p002)
- ตัวชี้วัดทุกตัวเป็นการฟังหรือพูด จึงเป็น partial ทั้งหมด

## english/greetings-introductions (`english.speaking.greetings-introductions`)

- โจทย์ 17 ข้อ (1:4 2:5 3:3 4:3 5:2; mcq text match order) ภาพ 3 ภาพ (`greetings-by-time.svg`, `introductions-dialogue.svg`, `reply-quiz.svg` ใช้ในโจทย์ p014)
- ช่วงเวลาของ Good morning/afternoon/evening ในภาพเป็นค่าโดยประมาณ (เที่ยง และราว 18:00) ตามการใช้ทั่วไป ไม่มีเส้นแบ่งตายตัว
- p014 รับ *You too.* และ *Nice to meet you, Ken.* ด้วย ส่วน *Me too.* ตั้งเป็น misconception ตามแนวที่ครูทั่วไปสอน ผู้ตรวจอาจเห็นต่าง

## english/be-have-there (`english.grammar.be-have-there`)

- โจทย์ 18 ข้อ (1:3 2:5 3:5 4:3 5:2; text mcq match order) ภาพ 2 ภาพ (`room.svg`, `fridge-quiz.svg` ใช้ในโจทย์ p012)
- ข้อเสนอแก้แผน: หัวข้อนี้ไม่มี prerequisite แต่ใช้ do/does ในคำถามของ have ซึ่งสอนใน present-simple (ความยาก 1.5 เท่ากัน) บทเรียนอธิบาย does/doesn't ไว้สั้น ๆ แล้ว อาจพิจารณาให้ present-simple เป็น prerequisite หรือย้าย have/has ส่วนคำถามไปไว้หลัง present-simple

## english/questions (`english.grammar.questions`)

- โจทย์ 19 ข้อ (1:3 2:4 3:5 4:4 5:3; mcq text match order) ภาพ 2 ภาพ (`question-flow.svg`, `student-card.svg` ใช้ในตัวอย่างและโจทย์ p003 p011)
- `ต 1.1 ป.3/4` (ฟังหรืออ่าน) และ `ต 1.2 ป.4/4` (พูด/เขียน) จับคู่เป็น full เพราะตัวชี้วัดยอมให้อ่านหรือเขียน มีโจทย์นิทานสั้น (p012) บทสนทนา (p016) และการเขียนคำถามเรื่องตนเอง เพื่อน ครอบครัว
- ข้อเสนอแก้แผน: เพิ่ม `english.grammar.be-have-there` เป็น prerequisite (คำถามด้วย be เป็นครึ่งหนึ่งของหัวข้อ)
- ค่ารถเมล์ไปอนุสาวรีย์ชัยฯ "about 15 baht" ใน p016 เป็นตัวเลขในบทสนทนาสมมุติ ไม่ได้ตรวจกับอัตราจริง (ไม่มีผลต่อคำตอบ)

## english/present-continuous (`english.grammar.present-continuous`)

- โจทย์ 17 ข้อ (1:3 2:4 3:4 4:4 5:2; text mcq match order) ภาพ 2 ภาพ (`continuous-timeline.svg`, `timelines-quiz.svg` ใช้ในโจทย์ p009 ไม่มีป้ายเฉลย)
- `ต 1.1 ม.1/4` (ใจความสำคัญจากการฟังและอ่านบทสนทนา นิทาน เรื่องสั้น) ใส่โจทย์อ่านข้อความแล้วหาใจความสำคัญ 2 ข้อ แต่เป็น partial เนื้อหาเต็มควรอยู่ใน `english.reading.main-idea`
- ข้อเสนอแก้แผน: เพิ่ม `english.grammar.be-have-there` เป็น prerequisite (ใช้ am/is/are เป็นแกน)

## english/can-modals (`english.grammar.can-modals`)

- โจทย์ 17 ข้อ (1:2 2:4 3:4 4:4 5:3; mcq text match order) ภาพ 2 ภาพ (`modal-strength.svg`, `no-food-sign.svg` ใช้ในโจทย์ p006)
- ค่าจากโลกจริง: กฎหมายจราจรไทยบังคับให้ผู้ขับขี่และผู้ซ้อนรถจักรยานยนต์สวมหมวกนิรภัย (p007) และการแต่งกายเข้าวัดพระแก้ว (ปิดไหล่และเข่า ห้ามกางเกงขาสั้น ถอดรองเท้าก่อนเข้าพระอุโบสถ) เป็นข้อปฏิบัติที่รู้กันทั่วไป ไม่ได้อ้างประกาศฉบับใดโดยตรง
- `ต 1.2 ม.4-6/2` (ใช้อย่างคล่องแคล่ว) เป็น partial เพราะหัวข้อนี้เป็นระดับพื้นฐาน (ความยาก 2.5)

## english/connectors (`english.grammar.connectors`)

- โจทย์ 17 ข้อ (1:2 2:5 3:4 4:3 5:3; text mcq match order) ภาพ 2 ภาพ (`connector-meanings.svg`, `sequence-steps.svg`)
- `cefr:CEFR-A2-written-production` จับคู่เป็น full (เขียนประโยคเชื่อมด้วย and, but, because เป็นแกนของหัวข้อ) ส่วน `ต 1.1 ม.1/4` และ `ต 1.1 ม.2/4` เป็น partial (มีการอ่านจับใจความ รายละเอียดสนับสนุน และให้เหตุผลด้วย because แต่ไม่มีการฟังและการแสดงความคิดเห็นอย่างอิสระ)
- โจทย์และบทเรียนใช้เฉพาะ present simple (และ can/want to) ตาม prerequisite ไม่ใช้ past simple
