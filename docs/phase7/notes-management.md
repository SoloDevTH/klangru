# บันทึกชุดงานวิชาการจัดการ (3 หัวข้อเริ่มต้น)

หัวข้อทั้งสามเขียนใหม่ในเฟส 6–7 จึงทำถึงเกณฑ์ของ `docs/phase7/enrichment-brief.md` ตั้งแต่ร่างแรก

- ภาพทั้งหมดวาดเองเป็น SVG ด้วยสคริปต์ Python ที่คำนวณพิกัดจากข้อมูลจริง (ความสูงแท่ง ร้อยละสะสม เส้นควบคุม รอบเวลา) เรนเดอร์เป็น PNG ด้วย Chromium และเปิดดูทุกภาพ แก้จนป้ายไม่ทับกัน ไม่มีภาพจาก Commons
- ตัวเลขทุกตัว (คำตอบ ค่า misconception ตัวเลขในตัวอย่างและภาพ) คำนวณด้วย python3
- หลักสูตรที่ใช้เทียบ: กรอบที่เพิ่มในชุดนี้ (`iso-9001-2015`, `asq-quality-bok`, `tqa-2567-2568`, `th-pmqa-4-0-2568`, `baldrige-award-2026`, `th-tqf-logistics`, `th-tqf-public-administration`, `pmi-pmbok-8`) และ `au-ac9-economics-business`, `th-coe-engineering-basics` (ไม่ได้แก้ไฟล์สองฉบับหลัง)
- ไฟล์จับคู่ของกรอบที่เพิ่มในชุดนี้อยู่ใน `curriculum/mappings/` แล้ว ทุกแถวเป็น partial

## management.quality.concepts (`quality-concepts`)

- โจทย์ 0 → 22 (p001–p022) ความยาก 1–5 เท่ากับ 3/6/5/5/3 ข้อ ชนิด mcq numeric order match text
- ภาพวาดเอง 2: `pdca.svg` (บทเรียน วงจร PDCA กับโครงข้อ 4–10 ของ ISO 9001), `coq-bars.svg` (ในตัวอย่างที่ 2 แท่งซ้อนต้นทุนคุณภาพก่อนและหลัง)
- ตัวอย่างแสดงวิธีทำ: ต้นทุนคุณภาพโรงงานขนมปัง (3.5% ของยอดขาย), ลงทุนป้องกันแล้วคุ้มหรือไม่ (ลด 110,000 บาท) · คำถามชวนคิด: p001, p003
- prerequisite: `management.principles.functions` (หัวข้อของชุดบริหารธุรกิจ) และ `math.number.ratio-percent`
- ตอนนี้สอนบางส่วน (ดูเหตุผลในไฟล์จับคู่): iso-9001-2015:QMP1–QMP7, 10.3 · asq-quality-bok:CQE I.A, CQE II.C, CQE II.E, CQE V.C · th-tqf-public-administration:8.1
- ใกล้ full: asq-quality-bok:CQE II.E (ต้นทุนคุณภาพ) ขาดเพียงการเก็บข้อมูลและรายงานต้นทุนคุณภาพ

## management.quality.qc-tools (`qc-tools`)

- โจทย์ 0 → 24 (p001–p024) ความยาก 3/6/7/5/3 ข้อ ชนิด mcq numeric match order expression
- ภาพวาดเอง 4: บทเรียน `pareto.svg`, `fishbone.svg`, `control-chart.svg` · โจทย์ `rice-chart.svg` (p010 ไม่มีป้ายบอกจุดที่หลุด)
- ตัวอย่างแสดงวิธีทำ: ตารางพาเรโตข้อร้องเรียนร้านอาหาร, แผนภูมิ p ของใบสั่งยา · คำถามชวนคิด: p006, p009
- ตอนนี้สอนบางส่วน: iso-9001-2015:9.1 · asq-quality-bok:CQE V.A (ยังไม่มีผังงาน), CQE VI.F, CSSGB VI.A, CMQOE IV.A · tqa-2567-2568:4.1 · th-pmqa-4-0-2568:4.1 · baldrige-award-2026:4.P1
- ควรเป็นหัวข้อใหม่ (อยู่ใน `docs/phase6/proposals-management.yaml` แล้ว): SPC ขั้นลึก (x-bar–R, I-MR, c, u, กฎ Western Electric), ความสามารถของกระบวนการ (Cp, Cpk), การชักตัวอย่างเพื่อการยอมรับ

## management.operations.lean (`lean-kaizen`)

- โจทย์ 0 → 23 (p001–p023) ความยาก 4/5/7/4/3 ข้อ ชนิด match mcq order numeric expression
- ภาพวาดเอง 2: `vsm.svg` (บทเรียน แผนผังสายธารคุณค่าโรงงานตัดเย็บ), `line-balance.svg` (ในตัวอย่างที่ 2 กราฟสมดุลสายเทียบเวลาแท็กต์)
- ตัวอย่างแสดงวิธีทำ: เวลาแท็กต์โรงงานขนมเปี๊ยะ, จัดสมดุลสายประกอบพัดลม · คำถามชวนคิด: p022, p004
- ตอนนี้สอนบางส่วน: asq-quality-bok:CQE V.D, CSSGB I.B, CSSGB V.C · th-tqf-logistics:8.2.7 · iso-9001-2015:10.3 · tqa-2567-2568:6.1, 6.2 · th-pmqa-4-0-2568:6.1, 6.2 · baldrige-award-2026:6.P3
- หลักสูตรต่างประเทศที่ควรจับคู่เพิ่ม (ไม่ได้แก้ไฟล์ของชุดอื่น): au-ac9-economics-business:AC9HE10K05 (การจัดการกำลังคนและการเพิ่มผลิตภาพ) → partial ผ่านเรื่องผลิตภาพแรงงาน ผลิตภาพหลายปัจจัย และไคเซ็น · th-coe-engineering-basics:IE-3.2 (การปรับปรุงผลิตภาพ) → partial และ IE-3.3 (ระบบคุณภาพ) → partial สำหรับ quality-concepts และ qc-tools
- ควรเป็นหัวข้อใหม่: คัมบังและระบบดึง, SMED, งานมาตรฐาน, OEE/TPM (เสนอไว้เป็น `management.operations.maintenance-reliability`)
