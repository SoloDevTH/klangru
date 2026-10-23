# ตั้งค่า Supabase (บัญชี ซิงก์ ผู้ช่วย AI หน้าคุณภาพ)

แอปทำงานได้โดยไม่มี Supabase (เก็บในเครื่องอย่างเดียว) ทำตามนี้เมื่อต้องการบัญชีผู้ใช้

## 1. สร้างโปรเจกต์

1. สร้างโปรเจกต์ที่ [supabase.com](https://supabase.com) เลือกภูมิภาค Singapore (ใกล้ไทยที่สุด)
2. ติดตั้ง CLI แล้วเชื่อมโปรเจกต์
   ```bash
   npx supabase login
   npx supabase link --project-ref <project-ref>
   npx supabase db push            # สร้างตาราง นโยบาย RLS และฟังก์ชันจาก supabase/migrations
   ```

## 2. อีเมลรหัส 6 หลัก

Authentication → Email Templates → **Magic Link** และ **Confirm signup** ให้แสดงรหัสแทนลิงก์ เช่น

```html
<h2>รหัสเข้าสู่ระบบคลังรู้</h2>
<p>รหัสของคุณคือ <strong style="font-size:24px">{{ .Token }}</strong></p>
<p>รหัสใช้ได้ 15 นาที ถ้าไม่ได้ขอรหัสนี้ ไม่ต้องทำอะไร</p>
```

ตั้ง SMTP ของโครงการเอง (Authentication → SMTP) เพราะ SMTP ในตัวของ Supabase ส่งได้จำนวนน้อยมาก

## 3. Edge functions

```bash
npx supabase secrets set ANTHROPIC_API_KEY=<คีย์จาก console.anthropic.com>
npx supabase secrets set CONTENT_BASE_URL=https://<โดเมนเว็บที่ deploy>
npx supabase functions deploy tutor
npx supabase functions deploy delete-account
```

`SUPABASE_URL` และ `SUPABASE_SERVICE_ROLE_KEY` มีให้ในทุก function อยู่แล้ว ไม่ต้องตั้งเอง ถ้าไม่ต้องการผู้ช่วย AI ไม่ต้อง deploy `tutor` (ปุ่มจะแสดงข้อความว่าใช้ไม่ได้)

## 4. ตั้งค่าเว็บและแอป

ตอน build ให้ตั้งตัวแปรต่อไปนี้ (Settings → API)

```bash
NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon key>
```

anon key เปิดเผยได้ ความปลอดภัยมาจาก RLS ห้ามใส่ service role key ในเว็บหรือแอปเด็ดขาด

## 5. เพิ่มครูผู้ดูแล

ครูที่ดูหน้า `/quality/` และตรวจรายงานโจทย์ได้ต้องอยู่ในตาราง `staff` ให้ครูเข้าสู่ระบบในแอปหนึ่งครั้งก่อน แล้วรันใน SQL editor

```sql
insert into public.staff (user_id, role)
select id, 'reviewer' from auth.users where email = '<อีเมลครู>';
```

## 6. ปรับความยากจากข้อมูลจริง

```bash
# ใน SQL editor ในฐานะ staff: select * from problem_stats();  แล้ว export เป็น JSON
npm run calibrate -- --stats=stats.json            # ดูข้อเสนอ
npm run calibrate -- --stats=stats.json --write    # เขียนลงไฟล์ แล้วเปิด PR
```

## ทดสอบในเครื่อง

`npm run test:db` รัน migration บน PGlite (Postgres ใน Node) แล้วทดสอบ RLS ฟังก์ชัน และตรรกะผู้ช่วย AI โดยไม่ต้องมี Docker
`npm run check:functions` ตรวจ type ของ edge functions ด้วย Deno
