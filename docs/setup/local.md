# ทำงานบนเครื่องตัวเอง (ไม่ต้องใช้ GitHub)

คลังรู้ทั้งระบบรันบนเครื่องได้ครบ ทั้งตัวตรวจเนื้อหา เว็บ การทดสอบ และแอป Android GitHub ใช้แค่เก็บสำรองและรัน CI ถ้าไม่ใช้ ให้รัน `npm run check` บนเครื่องแทน CI

## สิ่งที่ต้องติดตั้ง

| โปรแกรม | รุ่น | ใช้ทำอะไร |
|---|---|---|
| [Node.js](https://nodejs.org/) | 20 ขึ้นไป (แนะนำ 22 LTS) | ทุกอย่าง |
| [Git](https://git-scm.com/) | รุ่นใดก็ได้ | เก็บประวัติงาน (บน Windows ได้ Git Bash มาด้วย) |
| [Python](https://www.python.org/) | 3.10 ขึ้นไป | ตัวตรวจรันเฉลยของโจทย์เขียนโค้ด |
| Android Studio | ไม่บังคับ | build แอป Android (ดู [android.md](android.md)) |

ตัวตรวจหา Python จากคำสั่ง `python3` แล้ว `python` แล้ว `py -3` ตามลำดับ ถ้าเครื่องใช้ชื่ออื่นให้ตั้ง `KLANGRU_PYTHON` เช่น `set KLANGRU_PYTHON=py -3` (Windows) หรือ `export KLANGRU_PYTHON=python3.12`

## ย้ายรีโพลงเครื่องจากไฟล์ bundle

ไฟล์ `klangru.bundle` เก็บประวัติ git ทุก commit และทุก branch ไว้ในไฟล์เดียว

```bash
git clone klangru.bundle klangru
cd klangru
git remote remove origin          # ตัดการเชื่อมกับ bundle (หรือเก็บไว้ก็ได้)
npm install                       # ราว 1–2 GB ใน node_modules สร้างใหม่ได้เสมอ ไม่ต้องสำรอง
```

ถ้าภายหลังอยากเก็บสำรองที่อื่น (GitLab, Gitea, ไดรฟ์ภายนอก) ใช้ `git remote add backup <url>` แล้ว `git push backup --all`
หรือสร้าง bundle ใหม่เก็บไว้: `git bundle create ../klangru-YYYYMMDD.bundle --all`

## ใช้งานประจำวัน

```bash
npm run dev                       # เปิดเว็บที่ http://localhost:3000
npm run validate -- --strict      # ตรวจเนื้อหาทั้งคลัง
npm run validate -- --only=math/fractions   # ตรวจบางหัวข้อ
```

## ตรวจแทน CI ก่อน commit

```bash
npm run check         # ตัวตรวจเนื้อหา type เทสต์ทั้งหมด และ build (ราว 5–10 นาที)
npm run check:full    # เพิ่มตรวจ edge functions และทดสอบในเบราว์เซอร์จริง
```

`check:full` ต้องมี Playwright ก่อน (ครั้งเดียว):

```bash
npm install --no-save playwright@1
npx playwright install chromium
```

## หมายเหตุสำหรับ Windows

- ใช้ Git Bash หรือ PowerShell ก็ได้ ยกเว้น `npm run android:apk` ซึ่งใช้ `rm -rf` และ `./gradlew` ให้รันใน Git Bash
- ถ้า `npm install` ช้าหรือติด antivirus ให้ยกเว้นโฟลเดอร์ `node_modules`
- ชื่อโฟลเดอร์ทางควรเป็นภาษาอังกฤษ ไม่มีช่องว่าง เช่น `C:\dev\klangru`
