# คลังรู้

คลังเนื้อหาและโจทย์ทุกวิชา ตั้งแต่พื้นฐานไปจนถึงวิชาเฉพาะ **ไม่แบ่งระดับชั้น** แต่เรียงตามกราฟความรู้ว่าเรื่องไหนต้องรู้ก่อน เนื้อหากับโจทย์เก็บแยกกัน โจทย์ทุกข้อมีคำใบ้ทีละขั้น วิธีทำ และคำอธิบายเฉพาะสำหรับคำตอบผิดที่พบบ่อย ระบบเลือกโจทย์ตามระดับผู้เรียนและนัดทบทวนให้อัตโนมัติ ใช้ได้ทั้งเว็บและแอป Android แบบออฟไลน์

โครงการไม่หารายได้ โค้ดใช้ MIT เนื้อหาใช้ Creative Commons เป็นรายชิ้น (ดู `content/LICENSE.md`)

> สถานะ: โค้ดเฟส 1–5 เสร็จ · 6 วิชา 92 หัวข้อ 1,153 โจทย์ (ฉบับร่าง รอผู้เชี่ยวชาญตรวจ) · รายละเอียดและงานที่ต้องใช้คนใน [docs/status.md](docs/status.md)

## เริ่มใช้งาน

ต้องมี Node.js 20 ขึ้นไป

```bash
npm install
npm run validate          # ตรวจเนื้อหาทั้งคลัง (--strict ถือ warning เป็น error)
npm run dev               # build เนื้อหาแล้วเปิดเว็บที่ http://localhost:3000
npm run build             # สร้างเว็บ static ใน apps/web/out
```

ทดสอบ

```bash
npm test                          # เครื่องมือเนื้อหา
npm test -w @klangru/web          # ตรรกะตรวจคำตอบ BKT FSRS ซิงก์
npm run test:db                   # ฐานข้อมูล RLS และผู้ช่วย AI (PGlite ไม่ต้องมี Docker)
npm run check:functions           # type ของ edge functions (Deno)
npm run e2e -w @klangru/web       # เบราว์เซอร์จริง (ต้อง build ก่อน)
```

เครื่องมือผู้เขียน

```bash
npm run validate -- --only=math/fractions      # ตรวจเฉพาะบางหัวข้อ
npm run fetch-assets                           # ดึงโมเลกุล 3 มิติจาก PubChem
npm run draft -- math/fractions --count=5      # ให้ Claude ร่างโจทย์ (ต้องมี ANTHROPIC_API_KEY)
npm run approve -- math/fractions              # ย้ายโจทย์ที่ตรวจแล้วเข้าคลัง
npm run calibrate -- --stats=stats.json        # ปรับความยากจากข้อมูลการตอบจริง
npm run cms -w @klangru/web                    # หน้าแก้ไขสำหรับครูที่ /admin/ (Decap CMS)
npm run android:apk -w @klangru/web            # build แอป Android
```

## โครงสร้าง

```
content/                 เนื้อหา (YAML + Markdown) แยกโฟลเดอร์ตามวิชาและหัวข้อ
  _assets/               ไฟล์ประกอบ (โมเลกุล SDF)
  _drafts/               โจทย์ที่ AI ร่าง รอตรวจ (แอปไม่โหลด)
packages/schema/         schema เนื้อหา (zod) + ตัวตรวจนิพจน์ + กฎใบอนุญาต
packages/content-tools/  validate, build, fetch-assets, draft, approve, calibrate
apps/web/                เว็บ Next.js (static export) + แอป Android (Capacitor) + Decap CMS
supabase/                migration, edge functions (tutor, delete-account), เทสต์
docs/                    ADR, คู่มือติดตั้ง, คู่มือผู้เขียน, สถานะ
```

## หน้าจอ

| หน้า | path | ทำอะไร |
|---|---|---|
| แผนที่ความรู้ | `/` | กราฟหัวข้อทุกวิชา สถานะ ปุ่ม "เรียนต่อ" และลำดับที่แนะนำ |
| บทเรียน | `/topic/<id>/` | คำอธิบาย สมการ สื่อโต้ตอบ ซิมูเลชัน วิดีโอ โมเลกุล คำสำคัญ บัตรคำ โน้ต |
| ทำโจทย์ | `/topic/<id>/practice/` | เลือกข้อตามระดับ (BKT) คำใบ้ เฉลย ผู้ช่วย AI รายงานโจทย์ผิด |
| ทบทวน | `/review/` | หัวข้อที่ถึงกำหนด (FSRS) และบัตรคำรายใบ |
| วัดระดับ | `/placement/` | ข้ามเรื่องที่รู้แล้ว |
| ค้นหา | `/search/` | ค้นหัวข้อ คำสำคัญ และโจทย์ภาษาไทย |
| ความคืบหน้า | `/profile/` | สถิติ เป้าหมายรายวัน การแจ้งเตือน บัญชี ดาวน์โหลดออฟไลน์ ส่งออก JSON/xAPI |
| คุณภาพ | `/quality/` | ความครอบคลุมของเนื้อหา และสถิติการตอบจริง (ครู) |
| แก้ไขเนื้อหา | `/admin/` | Decap CMS (เว็บเท่านั้น) |

ความคืบหน้าเก็บในเครื่องก่อนเสมอ ถ้าตั้งค่า Supabase (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`) ผู้เรียนสร้างบัญชีด้วยรหัสทางอีเมลเพื่อซิงก์ข้ามเครื่องได้

## เอกสาร

- รายงานค้นคว้าและแผนงาน: [แผนคลังความรู้ทุกวิชา](https://claude.ai/artifact/YS2tqgpFFgSgaA3619MAry)
- [สถานะและเกณฑ์ผ่านแต่ละเฟส](docs/status.md)
- [คู่มือผู้เขียนเนื้อหา](docs/authoring-guide.md)
- ติดตั้ง: [Supabase](docs/setup/supabase.md) · [Android](docs/setup/android.md) · [CMS](docs/setup/cms.md) · [Claude API](docs/setup/ai.md)
- ADR: [0001 ไม่หารายได้และใบอนุญาต](docs/decisions/0001-non-commercial-and-licensing.md) · [0002 ขอบเขตนำร่อง](docs/decisions/0002-pilot-scope.md) · [0003 เทคโนโลยีหลัก](docs/decisions/0003-tech-stack.md) · [0004 โครงข้อมูลและระดับความชำนาญ](docs/decisions/0004-content-model.md) · [0005 CMS และคิวร่างด้วย AI](docs/decisions/0005-cms-and-ai-drafting.md) · [0006 ผู้ช่วย AI](docs/decisions/0006-ai-tutor.md) · [0007 การซิงก์และ PDPA](docs/decisions/0007-sync-privacy-pdpa.md)
