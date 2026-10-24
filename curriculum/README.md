# หลักสูตรและแหล่งอ้างอิง

โฟลเดอร์นี้เก็บหลักสูตรที่ใช้เทียบกับคลังเนื้อหา คลังยังเรียงตามกราฟความรู้ ไม่แบ่งระดับชั้น (ADR 0002) หลักสูตรใช้เพื่อ

1. ตรวจว่าคลังครอบคลุมเนื้อหาครบหรือยัง (`npm run curriculum -- --missing`)
2. แสดงในหน้าบทเรียนว่าหัวข้อนี้ตรงกับตัวชี้วัดใด และให้ครูค้นหัวข้อจากรหัสตัวชี้วัดได้
3. วางแผนหัวข้อใหม่จากตัวชี้วัดที่ยังไม่มีหัวข้อสอน

```
curriculum/
  frameworks/<id>.yaml   หลักสูตรหนึ่งฉบับต่อไฟล์ (สาระ → มาตรฐาน → ตัวชี้วัด)
  mappings/<id>.yaml     หัวข้อในคลังตรงกับตัวชี้วัดใดของหลักสูตรนั้น
  sources.yaml           สารานุกรมและตำราเปิด พร้อมสัญญาอนุญาตและเงื่อนไขการนำมาใช้
```

schema อยู่ใน `packages/schema/src/curriculum.ts` ตรวจด้วย `npm run validate`

## frameworks/<id>.yaml

```yaml
id: th-core-2560-math                # ตรงกับชื่อไฟล์
title: หลักสูตรแกนกลางการศึกษาขั้นพื้นฐาน พ.ศ. 2551 (ฉบับปรับปรุง พ.ศ. 2560) กลุ่มสาระการเรียนรู้คณิตศาสตร์
short: หลักสูตรแกนกลาง 2560          # แสดงในแอป
kind: national-curriculum             # national-curriculum | international-standard | proficiency-framework | body-of-knowledge
subjects: [math]
language: th
sources:
  - { title: "ชื่อเอกสาร", url: "https://...", publisher: "สพฐ.", retrieved: "2026-10-24", pages: "1-40" }
copyright: "ประกาศของหน่วยงานรัฐ ไม่เป็นงานอันมีลิขสิทธิ์ตาม พ.ร.บ.ลิขสิทธิ์ พ.ศ. 2537 มาตรา 7"
completeness: full-text               # full-text | structure-and-summary
strands:
  - id: ค1
    title: จำนวนและพีชคณิต
    standards:
      - id: ค 1.1
        text: "ข้อความมาตรฐานตามต้นฉบับ"
        indicators:
          - { id: "ค 1.1 ป.1/1", level: ป.1, text: "ข้อความตัวชี้วัดตามต้นฉบับทุกตัวอักษร" }
```

กติกา

- รหัสและข้อความต้องตรงกับเอกสารต้นฉบับ ห้ามเรียบเรียงใหม่ ห้ามเดา ถ้าอ่านจากต้นฉบับไม่ได้ให้ใส่ `note` ว่าคัดจากแหล่งใด
- `level` ใช้รูปเดียวกันทั้งไฟล์ เช่น `ป.1`–`ป.6`, `ม.1`–`ม.6`, `ม.4-6`
- มาตรฐานหรือกรอบที่มีลิขสิทธิ์และไม่อนุญาตให้คัดลอก (เช่น CEFR descriptor ฉบับเต็ม) ให้เก็บแค่โครงและสรุปด้วยคำของเราเอง พร้อมตั้ง `completeness: structure-and-summary`

## mappings/<id>.yaml

```yaml
framework: th-core-2560-math
mappings:
  - topic: math.number.fractions
    indicators: ["ค 1.1 ป.4/3", "ค 1.1 ป.5/1"]
    coverage: partial          # full = บทเรียนและโจทย์สอนครบตามตัวชี้วัด, partial = บางส่วน
    note: "ยังไม่มีการหารเศษส่วน"
```

จับคู่เฉพาะเมื่อบทเรียนและโจทย์ของหัวข้อสอนเนื้อหาของตัวชี้วัดนั้นจริง ไม่ใช่แค่ชื่อคล้ายกัน

## แหล่งอ้างอิงของหัวข้อ (references ใน topic.yaml)

```yaml
references:
  - { title: "เศษส่วน", url: "https://th.wikipedia.org/wiki/เศษส่วน", source: wikipedia-th, lang: th, license: CC-BY-SA-4.0 }
```

ใส่เฉพาะลิงก์ที่เปิดได้จริงและตรงเรื่อง แอปแสดงเป็น "อ่านเพิ่มเติม" การดัดแปลงเนื้อหาจากแหล่งใดมาใส่บทเรียนต้องเข้ากับสัญญาอนุญาต (ดู `sources.yaml` และ ADR 0001)
