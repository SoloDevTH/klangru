# ใช้ Claude ร่างโจทย์และเป็นผู้ช่วยผู้เรียน

ทั้งสองส่วนต้องมีคีย์ API จาก [console.anthropic.com](https://console.anthropic.com) ค่าใช้จ่ายคิดตามจำนวน token ที่ใช้

## ร่างโจทย์ (สำหรับผู้เขียน)

```bash
export ANTHROPIC_API_KEY=...
npm run draft -- math/fractions --count=5     # ร่าง 5 ข้อ ความยากไล่ 1–5
# แก้และตรวจไฟล์ content/_drafts/math/fractions/problems.yaml
npm run approve -- math/fractions             # ย้ายทุกข้อเข้าคลัง
npm run approve -- math/fractions --ids=math.frac.p013,math.frac.p015   # หรือเลือกบางข้อ
npm run validate
```

ข้อควรจำ

- **คำนวณตัวเลขทุกข้อใหม่เอง** เฉลยผิดเป็นความผิดพลาดที่ร้ายแรงที่สุดในแอปการเรียน
- ตรวจว่า misconception แต่ละค่ามาจากความผิดพลาดจริง และไม่ตรงกับคำตอบที่ถูก (ตัวตรวจจับกรณีหลังให้)
- คงค่า `ai_assisted: true` ไว้ และใส่ชื่อผู้ตรวจใน `reviewed_by` ของหัวข้อ

## ผู้ช่วยผู้เรียน

ตั้งค่าตาม `docs/setup/supabase.md` ข้อ 3 นโยบายและข้อจำกัดอยู่ใน ADR 0006 ครูตรวจบทสนทนาได้ในตาราง `tutor_messages` (ตั้ง `review_status` เป็น `ok`, `gave-answer`, `wrong`, `off-topic` หรือ `unsafe`)
