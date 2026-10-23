# แอป Android (Capacitor)

แอป Android ห่อไฟล์ static ชุดเดียวกับเว็บ (`apps/web/out`) เนื้อหาทั้งหมดอยู่ในแอปจึงใช้ออฟไลน์ได้ตั้งแต่ติดตั้ง

## เครื่องมือ

- JDK 21
- Android SDK: `platforms;android-36`, `build-tools;35.0.0`, `platform-tools`
- ระบุที่อยู่ SDK ใน `apps/web/android/local.properties` (`sdk.dir=/path/to/android-sdk`) หรือตั้ง `ANDROID_HOME`

## Build

```bash
npm run build                                   # เนื้อหา + เว็บ static
npm run android:apk -w @klangru/web             # cap sync แล้ว assembleDebug
# ได้ apps/web/android/app/build/outputs/apk/debug/app-debug.apk
```

ถ้าดาวน์โหลดจาก Maven Central ไม่ได้ (HTTP 429) ให้สร้าง `~/.gradle/init.d/maven-mirror.gradle` ที่ชี้ไป `https://maven-central.storage-download.googleapis.com/maven2/`

## ไอคอน

`npm run icons -w @klangru/web` สร้างไอคอนเว็บจาก `scripts/make-icons.py` (ต้องมี Pillow) ไอคอน Android อยู่ใน `android/app/src/main/res/mipmap-*`

## การแจ้งเตือน

ใช้ `@capacitor/local-notifications` เตือนทบทวนวันละครั้งตามเวลาที่ผู้เรียนเลือกในหน้าโปรไฟล์ Android 13 ขึ้นไปจะขอสิทธิ์ตอนเปิดใช้ ไม่ใช้ push จากเซิร์ฟเวอร์ จึงไม่ต้องตั้ง Firebase

## ปล่อยแอปบน Google Play (ต้องใช้คน)

1. สร้าง keystore สำหรับเซ็นแอป **เก็บไฟล์และรหัสไว้นอก Git**
   ```bash
   keytool -genkey -v -keystore klangru-release.jks -keyalg RSA -keysize 4096 -validity 10000 -alias klangru
   ```
2. เพิ่ม `signingConfigs.release` ใน `android/app/build.gradle` โดยอ่านรหัสจากตัวแปรแวดล้อม แล้ว `./gradlew bundleRelease` ได้ไฟล์ `.aab`
3. สมัคร Google Play Console ในนามโครงการ (ค่าธรรมเนียมครั้งเดียว 25 USD) เปิด Play App Signing
4. กรอก Data safety ให้ตรงกับ ADR 0007: เก็บอีเมล (ถ้าสร้างบัญชี) ช่วงอายุ และความคืบหน้าการเรียน, เข้ารหัสระหว่างส่ง, ผู้ใช้ขอลบได้ในแอป, ไม่มีโฆษณา, ไม่ขายข้อมูล
5. Target audience: ถ้าเลือกกลุ่มอายุต่ำกว่า 13 ปี ต้องทำตามนโยบาย Families ของ Google Play
6. อัปโหลด `.aab` ไปที่ **Internal testing** เพิ่มอีเมลผู้ทดสอบ 20 คนขึ้นไป ทดสอบอย่างน้อย 14 วัน (บัญชีนักพัฒนาส่วนบุคคลที่สร้างใหม่ต้องผ่าน closed testing ก่อนขอ production)
7. เกณฑ์ผ่านก่อนขยาย: ไม่มี crash ใน Play Console vitals, ทำงานออฟไลน์ครบตาม `npm run e2e`, ผู้ทดสอบทำแบบสำรวจตาม `docs/phase0/usability-test.md`
