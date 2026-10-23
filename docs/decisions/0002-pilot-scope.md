# ADR 0002: ขอบเขตนำร่อง คณิตศาสตร์ + ฟิสิกส์

- สถานะ: ยอมรับแล้ว
- วันที่: 23 ต.ค. 2569

## การตัดสินใจ

นำร่องด้วย 2 วิชา คือ **คณิตศาสตร์** และ **ฟิสิกส์** เพราะ

1. ฟิสิกส์ต้องใช้คณิตศาสตร์ จึงได้ทดสอบกราฟ prerequisite **ข้ามวิชา** ตั้งแต่แรก ซึ่งเป็นจุดต่างหลักจากการแบ่งตามชั้นปี
2. คำตอบส่วนใหญ่เป็นตัวเลขหรือนิพจน์ ตรวจอัตโนมัติได้แม่นยำ
3. มีแหล่งเปิดให้ใช้มาก (OpenStax, PhET, OATutor-Content)

## เป้าหมายตามเฟส

| เฟส | หัวข้อ | โจทย์ต่อหัวข้อ |
|---|---|---|
| 0 (ตอนนี้) | 10 (คณิต 5, ฟิสิกส์ 5) ใช้ทดสอบ schema และ prototype | 7–8 |
| 1 (MVP) | 80 (วิชาละ 40) | ≥ 10 ใน ≥ 3 ระดับความยาก |

## ลำดับนำร่อง 10 หัวข้อ

| หัวข้อ | ต้องรู้ก่อน |
|---|---|
| math.number.integers | — |
| math.number.fractions | math.number.integers |
| math.algebra.expressions | math.number.integers, math.number.fractions |
| math.algebra.linear-eq | math.algebra.expressions |
| math.algebra.rearrange-formula | math.algebra.linear-eq |
| physics.units.si | math.number.integers |
| physics.kinematics.speed | physics.units.si, math.algebra.linear-eq |
| physics.kinematics.velocity | physics.kinematics.speed, math.number.integers |
| physics.kinematics.acceleration | physics.kinematics.velocity |
| physics.kinematics.constant-acceleration | physics.kinematics.acceleration, math.algebra.rearrange-formula |

ลำดับจริงคำนวณจากไฟล์เนื้อหาโดย `npm run build:content` (ดูผลในข้อความที่พิมพ์ออกมา)

## วิชาถัดไป

ภาษาไทย → ภาษาอังกฤษ → เคมี → ชีววิทยา → ภาษาจีน → วิศวกรรมพื้นฐาน แต่ละวิชาเพิ่มเฉพาะชนิดโจทย์ที่จำเป็น เช่น วาดโมเลกุล (Ketcher) หรือฝึกเขียนอักษรจีน (hanzi-writer)
