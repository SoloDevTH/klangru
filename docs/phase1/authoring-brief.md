# คำสั่งงานสำหรับผู้เขียนเนื้อหา (คนหรือ AI) เฟส 1

ไฟล์นี้คือข้อกำหนดร่วมของทุกชุดงานใน `docs/phase1/curriculum.yaml` อ่านให้จบก่อนเริ่ม

## อ่านก่อน

1. `packages/schema/src/index.ts` — schema ของทุกฟิลด์ (แหล่งความจริงเดียว)
2. `docs/decisions/0004-content-model.md` — ความหมายของฟิลด์และกติกา
3. ตัวอย่างอ้างอิง: `content/math/linear-equations/` และ `content/physics/constant-acceleration/`
4. `docs/phase1/curriculum.yaml` — id, โฟลเดอร์, prerequisite, prefix รหัสโจทย์ และขอบเขตของหัวข้อที่ได้รับมอบหมาย **ห้ามเปลี่ยน id, prerequisite หรือ difficulty** ถ้าคิดว่าควรเปลี่ยน ให้เขียนไว้ในรายงาน

## ไฟล์ที่ต้องสร้างต่อหัวข้อ

`content/<วิชา>/<folder>/topic.yaml`, `lesson.md`, `problems.yaml` (ถ้า folder ใน curriculum มีรูป `thai/consonants` แปลว่า `content/thai/consonants/`)

- `problems.yaml` มีคีย์ `problems:` อยู่ที่ราก แล้วตามด้วยรายการโจทย์ (ดูตัวอย่าง)
- แตะเฉพาะโฟลเดอร์ของตัวเอง ห้ามแก้ไฟล์อื่นในโปรเจกต์

## บทเรียน (`lesson.md`)

- ภาษาไทยที่เป็นธรรมชาติ อ่านเข้าใจได้ทุกวัย 550–900 คำ
- ลำดับ: เริ่มจากสถานการณ์จริงหรือภาพในหัว → หลักการ/นิยาม/สูตร (มีหน่วย) → ตัวอย่างพร้อมวิธีทำทีละขั้นอย่างน้อย 2 ข้อ → "ข้อผิดพลาดที่พบบ่อย"
- สมการใช้ KaTeX: `$...$` ในบรรทัด `$$...$$` แยกบรรทัด หน่วยใช้ `\mathrm{m/s}`

## `topic.yaml`

- `summary` 10–200 ตัวอักษร ไม่มีสมการ (แสดงในการ์ดที่ไม่เรนเดอร์ KaTeX)
- `minutes` 15–40, คำสำคัญ 2–4 คำ, แฟลชการ์ด 3–5 ใบ
- `curriculum_tags: []` (ใส่เฉพาะเมื่อมั่นใจรหัสตัวชี้วัด)
- `status: draft`, `license: CC-BY-SA-4.0`, `authors: [ทีมคลังรู้]`, `ai_assisted: true` (ถ้าเป็น AI)
- `encompasses`: ใส่ prerequisite ที่การฝึกหัวข้อนี้ได้ทบทวนไปด้วย พร้อม weight 0.1–0.6
- **สื่อโต้ตอบ (ใส่อย่างน้อย 1 อย่างถ้าเข้ากับหัวข้อ):**
  - `simulation` ของ PhET: ใช้เฉพาะ URL ที่ตรวจแล้วได้ HTTP 200 ด้วย `curl -s -o /dev/null -w '%{http_code}' https://phet.colorado.edu/en/simulations/<ชื่อ>` (ชื่อที่ไม่มีอยู่จริงจะได้ 404 หรือ 503) รูป URL ต้องเป็น `https://phet.colorado.edu/en/simulations/<ชื่อ>`
  - `interactive` (วาดในแอป ใช้ได้ออฟไลน์):
    ```yaml
    - type: interactive
      title: ลองเปลี่ยนค่า a แล้วดูพาราโบลา
      caption: (คำอธิบายสั้น ๆ ว่าให้สังเกตอะไร)
      widget:
        kind: function-plot          # หรือ number-line, vector-add
        functions: ["a x^2 + c"]     # LaTeX ตัวแปร x และชื่อแถบเลื่อนเท่านั้น
        sliders:
          - { name: a, min: -3, max: 3, step: 0.5, value: 1, label: ความกว้าง }
          - { name: c, min: -4, max: 4, step: 1, value: 0 }
        x: [-5, 5]
        y: [-5, 5]
    ```
    `number-line`: `{ kind: number-line, min: -10, max: 10, points: [{ value: -3, label: A }], jumps: [{ from: -3, to: 2, label: "+5" }] }`
    `vector-add`: `{ kind: vector-add, a: [3, 1], b: [1, 2], draggable: true }`
  - `molecule` (เคมี): `{ type: molecule, title: ..., cid: 962, name: water }` แล้วรัน `npm run fetch-assets`
  - ห้ามใส่ `video` ถ้าไม่ได้ตรวจว่าวิดีโอมีอยู่จริงและใบอนุญาตอนุญาตให้ฝัง

## โจทย์ (`problems.yaml`)

- **อย่างน้อย 10 ข้อต่อหัวข้อ** ความยากครอบคลุม 1–5 (อย่างน้อย 4 ระดับ) ใช้ชนิดโจทย์อย่างน้อย 3 แบบ มีโจทย์สถานการณ์จริงในบริบทไทยอย่างน้อย 3 ข้อ
- รหัสโจทย์ `<prefix>.p001` เรียงต่อกัน prefix ตาม curriculum
- ทุกข้อ: คำใบ้ 2–3 ขั้น (ข้อสุดท้ายบอกวิธี ไม่บอกตัวเลขคำตอบ), `solution` วิธีทำเต็มพร้อมหน่วย, `license: CC-BY-SA-4.0`, `ai_assisted: true`
- ชนิดโจทย์:
  - `numeric`: ตอบตัวเลขอย่างเดียว บอกหน่วยที่ต้องการในโจทย์และใส่ `answer.unit`; คำตอบไม่ใช่จำนวนเต็มต้องมี `tolerance` (≈1% ของคำตอบ หรือ 0.01); misconception 1–2 ค่าจากความผิดพลาดจริงพร้อมค่าที่ความผิดพลาดนั้นให้ผลจริง (แอปจับคู่เมื่อ |คำตอบ − match| ≤ max(tolerance, 0.01))
  - `mcq`: ตัวเลือกหลอกทุกตัวมาจากความผิดพลาดจริง และมี `feedback`; ถูกหลายข้อใช้ `multiple: true`
  - `expression` (**ใช้แทน `text` เมื่อคำตอบเป็นนิพจน์/สูตร**):
    ```yaml
    - id: math.rearr.p009
      type: expression
      stem: "จัดสูตร $A = \\tfrac12 bh$ ให้ $h$ อยู่ข้างเดียว"
      prefix: "h ="
      answer: { latex: "\\frac{2A}{b}", variables: [A, b] }
      misconceptions:
        - { match: "\\frac{A}{2b}", feedback: "คูณ 2 ทั้งสองข้างก่อน ไม่ใช่หาร" }
    ```
    แอปตรวจโดยแทนค่าตัวแปรหลายชุด รูปที่เท่ากันทางคณิตศาสตร์จึงถูกทั้งหมด ถ้าโจทย์ให้กระจายวงเล็บใส่ `expanded: true` ถ้าให้แยกตัวประกอบใส่ `factored: true` ถ้าให้ทำจำนวนในรูปกรณฑ์ให้อยู่ในรูปอย่างง่ายใส่ `simplified: true` (ไม่เช่นนั้นตอบ $\sqrt{75}$ แทน $5\sqrt{3}$ ก็ถูก) ห้ามใช้ตัวแปรชื่อ `e` หรือ `i` (เป็นค่าคงที่)
  - `text`: คำตอบเป็นคำ (ภาษาไทย/อังกฤษ/พินอิน) ใส่ทุกรูปแบบที่ยอมรับใน `accepted`
  - `order`, `match`: ดูตัวอย่างในหัวข้ออ้างอิง
  - `hanzi` (ภาษาจีน): `{ type: hanzi, character: 人, pinyin: rén, meaning: คน, max_mistakes: 3 }` ผู้เรียนเขียนตามลำดับขีดบนจอ
- **ตรวจคำตอบทุกข้อด้วยการคำนวณจริง** (`python3 -c ...`) และตรวจว่าค่า misconception เป็นผลของความผิดพลาดนั้นจริงและไม่ใกล้คำตอบที่ถูก คำตอบผิดในแอปเรียนคือ bug ที่ร้ายแรงที่สุด

## ตรวจงาน

```bash
cd /home/user/klangru
npm run validate -- --quiet --allow-planned --only=<วิชา>/<folder>,<วิชา>/<folder2>
```

- `--allow-planned` ไม่นับ prerequisite ที่อยู่ในแผนแต่คนอื่นยังเขียนไม่เสร็จ
- ต้องได้ error 0 และไม่มีคำเตือนในโฟลเดอร์ของตัวเอง (ดูคำเตือนด้วยการเอา `--quiet` ออก)

## รายงานเมื่อเสร็จ

สั้น ๆ: id ของแต่ละหัวข้อ จำนวนโจทย์ ระดับความยากและชนิดที่ใช้ สื่อโต้ตอบที่ใส่ จำนวนคำของบทเรียน และสิ่งที่ไม่แน่ใจ ห้ามแปะเนื้อหาไฟล์ในรายงาน
