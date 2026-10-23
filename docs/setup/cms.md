# ระบบแก้ไขเนื้อหาสำหรับครู (Decap CMS)

หน้าแก้ไขอยู่ที่ `/admin/` แก้ไฟล์ใน `content/` โดยตรงและส่งเป็น Pull Request (ดู ADR 0005)

## ใช้ในเครื่อง (ไม่ต้องมีบัญชี GitHub)

```bash
npm run dev                        # เปิดเว็บที่ http://localhost:3000
npm run cms -w @klangru/web        # อีกหน้าต่าง: รัน decap-server ที่รากโปรเจกต์
```

เปิด http://localhost:3000/admin/ แล้วกด "Login" การแก้ไขจะเขียนลงไฟล์ในเครื่องทันที จากนั้นรัน `npm run validate` แล้ว commit ตามปกติ

## ใช้ออนไลน์

1. แก้ `backend.repo` ใน `apps/web/scripts/cms-config.mjs` เป็นรีโพจริง (เช่น `klangru/klangru`)
2. สร้าง GitHub OAuth App และ OAuth proxy (เช่น Cloudflare Worker ตามเอกสาร Decap หรือ Netlify) แล้วใส่ `base_url` ใน `backend`
3. ให้สิทธิ์ครูเป็น collaborator ของรีโพ ครูจะเห็นการแก้ไขของตัวเองเป็นการ์ดใน Workflow (ร่าง → รอตรวจ → พร้อมเผยแพร่) แต่ละการ์ดคือ PR หนึ่งอัน
4. CI ตรวจเนื้อหาทุก PR ผู้ตรวจอีกคนต้องอนุมัติก่อน merge (ตั้ง branch protection ให้ต้องมี review 1 คน)

## ข้อจำกัด

- สร้างหรือลบหัวข้อผ่าน CMS ไม่ได้ (รหัสหัวข้อผูกกับความคืบหน้าของผู้เรียน) ให้สร้างโฟลเดอร์ใหม่ตาม `docs/authoring-guide.md`
- สื่อโต้ตอบ (`widget`) แก้ใน YAML โดยตรง
- Decap อาจจัดรูปแบบ YAML ใหม่ (ลำดับฟิลด์ เครื่องหมายคำพูด) แต่ข้อมูลเหมือนเดิม
