# บันทึกชุดงาน english-8 (เฟส 8)

หัวข้อภาษาอังกฤษ 8 หัวข้อจาก `docs/phase6/proposals-languages.yaml` ไม่มีแถว `extend:` ที่ผูกกับหัวข้อในชุดนี้ ภาพทุกภาพวาดเป็น SVG ด้วยสคริปต์ (scratchpad `phase8-english-8/fig_t*.py`) เรนเดอร์เป็น PNG ด้วย Chromium และเปิดตรวจทุกภาพแล้ว ไม่มีภาพจาก Commons ภาพในโจทย์ที่ถามสิ่งที่ภาพในบทเรียนเฉลยไว้ใช้ภาพแยกที่ไม่มีป้ายเฉลย (`positions-quiz.svg`, `heights-quiz.svg`) จำนวนคำของบทเรียนนับด้วย `Intl.Segmenter` อยู่ที่ 610–798 คำ ทุกตัวเลข (ราคา ผลต่าง เงินทอน การหารค่าอาหาร) คำนวณด้วย python3 แอปไม่มีเสียง ตัวชี้วัดด้านการฟัง การพูด และการอ่านออกเสียงจึงจับคู่แบบ partial ทุกตัว พร้อมเหตุผลในไฟล์จับคู่ โจทย์ข้อความ (`text`) ใส่รูปย่อ รูปเต็ม และแบบมีและไม่มีเครื่องหมายวรรคตอนท้ายไว้ใน `accepted` ตามแนวของชุด english-4 (ตัวตรวจไม่สนตัวพิมพ์และช่องว่าง แต่สนเครื่องหมายวรรคตอน)

## english/self-family-numbers (`english.vocabulary.self-family-numbers`)

- โจทย์ 19 ข้อ (1:4 2:5 3:4 4:4 5:2; text mcq numeric match order) ภาพ 3 ภาพ (`family-tree.svg` ในบทเรียน, `picture-choice.svg` โจทย์เลือกภาพจากคำ p002, `shapes-colours.svg` p003 p004)
- ค่าจากโลกจริง: สีธนบัตร (100 บาทแดง 20 เขียว 50 น้ำเงิน 500 ม่วง) ตามธนบัตรที่ใช้อยู่ทั่วไป ไม่ได้อ้างประกาศ ธปท. โดยตรง
- ข้อเสนอ: บทเรียนแตะการเติม s ของพหูพจน์เล็กน้อย (two brothers, feet) ซึ่งสอนเต็มใน `english.grammar.nouns-articles` ที่ความยาก 2 ไม่ต้องแก้ prerequisite

## english/pronouns-possessives (`english.grammar.pronouns-possessives`)

- โจทย์ 19 ข้อ (1:3 2:4 3:5 4:4 5:3; text mcq match order) ภาพ 2 ภาพ (`demonstratives.svg` ในบทเรียน, `whose-quiz.svg` ใช้ใน p008)
- `cefr:CEFR-A1-written-production` เป็น full (เขียนประโยคแนะนำตัว ครอบครัว และของของตนด้วยสรรพนาม)
- ไม่มีข้อเสนอแก้แผน

## english/nouns-articles (`english.grammar.nouns-articles`)

- โจทย์ 20 ข้อ (1:3 2:5 3:5 4:5 5:2; text mcq match order) ภาพ 2 ภาพ (`plural-rules.svg` ผังการทำพหูพจน์, `market-stall.svg` ใช้ใน p007)
- `ต 2.2 ป.3/1` เป็น partial: สอนความต่างระดับคำและกลุ่มคำ (ไม่มีคำนำหน้านามและลักษณนาม เสียง s ท้ายคำ /s/ /z/ /ɪz/ เลือก a/an ตามเสียง) แต่ไม่ครอบคลุมเสียงตัวอักษรและประโยค ส่วนนั้นอยู่ใน reading-aloud และ alphabet-sounds
- ไม่ใช้ distractor *a water* เพราะในภาษาพูดใช้กันได้ (สั่งน้ำหนึ่งแก้ว/ขวด) ใช้ *a rice* และ *a bottle of waters* แทน

## english/prepositions (`english.grammar.prepositions`)

- โจทย์ 19 ข้อ (1:3 2:4 3:5 4:4 5:3; text mcq match order) ภาพ 4 ภาพ (`positions.svg`, `time-triangle.svg`, `street-map.svg` ในบทเรียนและโจทย์ p008 p009 p015 p019, `positions-quiz.svg` ใช้ใน p001 p007)
- ค่าจากโลกจริง: วันลอยกระทง "usually in November" (วันเพ็ญเดือนสิบสอง บางปีตรงกับปลายตุลาคม จึงใช้ usually) วันแม่ 12 สิงหาคม และการร้องเพลงชาติตอน 8 โมงเช้าในโรงเรียน
- ข้อเสนอแก้แผน: บทเรียนและโจทย์ใช้ present simple ในบางประโยค (We sing ..., The children play ...) อาจพิจารณาเพิ่ม `english.grammar.present-simple` เป็น prerequisite

## english/reading-aloud (`english.phonics.reading-aloud`)

- โจทย์ 20 ข้อ (1:3 2:4 3:5 4:5 5:3; mcq numeric text match order) ภาพ 2 ภาพ (`stress-intonation.svg`, `chant-beats.svg` ทั้งสองอยู่ในบทเรียน)
- แอปไม่มีเสียง จึงแทนเสียงด้วยตัวพิมพ์ใหญ่ วงกลม ●○ ลูกศร ↗↘ เครื่องหมาย ‿ และคำอ่านไทยโดยประมาณ ผู้ตรวจควรดูว่าการเขียนเสียงแบบไทย (เทิร์-นอฟ, อะ-แนพ-เพิล, เก-ทัพ) เหมาะสมหรือไม่ ตัวชี้วัดการอ่านออกเสียง `ต 1.1 */2` ทั้ง 8 ระดับชั้นจึงเป็น partial ส่วน `ต 2.2 ป.3/1` และ `ป.4/1` (บอกความแตกต่างของเสียง) เป็น full เพราะตัวชี้วัดให้ "บอก" ซึ่งทดสอบได้ในรูปอ่าน
- กลอน *One, Two, Buckle My Shoe* เป็นกลอนเด็กสาธารณสมบัติ กลอน *Rain on the roof* และโฆษณาในตัวอย่างแต่งขึ้นเอง ทำนองเสียงขึ้นท้ายคำถาม Yes/No เป็นหลักที่สอนทั่วไป ในการพูดจริงอาจลงเสียงได้
- ข้อเสนอ: เรื่องทำนองเสียงของคำถามมีสั้น ๆ ใน `english.grammar.questions` แล้ว หัวข้อนี้ขยายเป็นทุกชนิดประโยค ไม่ได้ซ้ำโจทย์ หัวข้อนี้จะได้ประโยชน์มากถ้าแอปรองรับเสียงในอนาคต

## english/adjectives-comparison (`english.grammar.adjectives-comparison`)

- โจทย์ 20 ข้อ (1:3 2:4 3:6 4:4 5:3; text mcq numeric match order) ภาพ 3 ภาพ (`heights.svg` ในบทเรียน, `heights-quiz.svg` ไม่มีป้าย tall/taller/tallest ใช้ใน p005 p020, `fruit-prices.svg` ในบทเรียนและ p008 p009 p017)
- ราคาผลไม้ในกราฟเป็นราคาสมมุติ (เขียนไว้ในภาพ) ข้อเท็จจริงที่ใช้: ดอยอินทนนท์เป็นยอดเขาสูงที่สุดในไทย กรุงเทพฯ ใหญ่กว่าเชียงใหม่
- ข้อเสนอ: `CEFR-A2-written-production` เป็น partial เพราะการเขียนเป็นชุดด้วยคำเชื่อมเป็นแกนของ connectors

## english/future-forms (`english.grammar.future-forms`)

- โจทย์ 20 ข้อ (1:3 2:4 3:5 4:5 5:3; text mcq match order) ภาพ 2 ภาพ (`will-going-to.svg` ในบทเรียน, `weekend-planner.svg` ใช้ใน p005 p019)
- จุดที่ไม่ฟันธง: การคาดเดาจากหลักฐาน (เมฆดำ) และแผนในตาราง ใช้ will ก็ไม่ผิดไวยากรณ์ โจทย์จึงใช้ตัวลวงที่ผิดรูปจริงแทน หรือบอกในโจทย์ให้ใช้ be going to (p019) และ p010 รับทั้ง *will be* และ *is going to be*
- ใส่ present continuous สำหรับนัดหมายไว้สั้น ๆ (ตาม prerequisite) ไม่มีข้อเสนอแก้แผน

## english/everyday-conversations (`english.speaking.everyday-conversations`)

- โจทย์ 20 ข้อ (1:3 2:4 3:6 4:4 5:3; mcq numeric text match order) ภาพ 2 ภาพ (`conversation-steps.svg` ในบทเรียน, `menu.svg` ในบทเรียนและ p004 p008 p016)
- เมนูและราคาร้านป้าน้อยเป็นค่าสมมุติ ตัวอย่างในบทเรียนกับโจทย์ใช้รายการสั่งต่างกันเพื่อไม่ให้เฉลยกัน
- ตัวชี้วัด 16 ตัวเป็น partial ทั้งหมด (โต้ตอบได้ทีละข้อในรูปเขียน ไม่มีเสียงและคู่สนทนาจริง และไม่ครอบคลุมข่าวหรือประเด็นสังคมระดับ ม.3–ม.4-6)
- ข้อเสนอแก้แผน: บทเรียนใช้ *Could you ...?* และ *Can I ...?* ซึ่งสอนเต็มใน `english.grammar.can-modals` (ความยาก 2.5) อาจเพิ่มเป็น prerequisite หรือ encompasses
