# ADR 0003: เทคโนโลยีหลัก

- สถานะ: ยอมรับแล้ว
- วันที่: 23 ต.ค. 2569

## การตัดสินใจ

| ส่วน | เลือก | เหตุผล |
|---|---|---|
| ภาษา | TypeScript ทั้งโปรเจกต์ | ใช้ type ของ schema ร่วมกันระหว่างเครื่องมือเนื้อหาและแอป |
| โครง repo | npm workspaces (`packages/*`, `apps/*`) | ไม่ต้องติดตั้งเครื่องมือเพิ่มนอกจาก Node 20+ |
| Schema เนื้อหา | zod (`packages/schema`) | ตรวจข้อมูลตอนรันได้ และได้ type ไปพร้อมกัน |
| เนื้อหา | YAML + Markdown ใน Git | ตรวจทานผ่าน Pull Request ย้อนเวอร์ชันได้ ไม่ต้องมีหลังบ้านในช่วงแรก |
| สมการ | KaTeX (ตรวจทุกสมการตอน build) | เร็ว เรนเดอร์ได้ทั้งตอน build และในเบราว์เซอร์ |
| เว็บแอป | Next.js (App Router) แบบ `output: "export"` | ได้หน้า HTML static ที่ค้นหาเจอใน search engine และเป็นไฟล์ชุดเดียวกับที่ใส่ในแอป Android |
| แอป Android (เฟส 2) | Capacitor ห่อไฟล์ static ชุดเดียวกัน | ใช้ไลบรารีเว็บ (KaTeX, MathLive, JSXGraph, PhET, Ketcher) ได้เลย และเปิดออฟไลน์ได้เพราะไฟล์อยู่ในเครื่อง |
| ความคืบหน้า | localStorage (เฟส 0) → Supabase (เฟส 1) | prototype ไม่ต้องมีบัญชีผู้ใช้ เฟส 1 ใช้โครงข้อมูลเดิมแล้วเพิ่ม sync |
| ตารางทบทวน | ts-fsrs (FSRS) | อัลกอริทึมเดียวกับ Anki และมี benchmark เปิดเผย |
| ฟอนต์ | IBM Plex Sans Thai + Bai Jamjuree ผ่าน @fontsource | ไฟล์ฟอนต์อยู่ในแอป ใช้ออฟไลน์ได้ ไม่ต้องโหลดจาก Google |
| CI | GitHub Actions | ตรวจเนื้อหา รันเทสต์ และ build ทุก Pull Request |

## ทางเลือกที่ไม่เลือก

- **Flutter / React Native:** ต้องหาของทดแทนหรือฝัง WebView ให้ไลบรารีสมการ ซิมูเลชัน และเคมีทีละตัว
- **Vite SPA:** ทำงานใน Capacitor ได้ง่ายกว่าเล็กน้อย แต่ไม่มีหน้า HTML สำเร็จรูปให้ search engine
- **CMS ตั้งแต่วันแรก (Payload/Directus):** ช่วงแรกผู้เขียนยังน้อย Git ตรวจทานได้ละเอียดกว่า จะเพิ่ม CMS ในเฟส 4 โดย export เป็นรูปแบบไฟล์เดิม

## สิ่งที่ต้องระวัง

- รหัสหัวข้อมีจุด (เช่น `math.algebra.linear-eq`) และใช้เป็น path ของ URL (`/topic/math.algebra.linear-eq/`) จึงต้องคง `trailingSlash: true` ไว้ เพื่อให้โฮสต์ static ทั่วไปไม่ตีความจุดเป็นนามสกุลไฟล์
