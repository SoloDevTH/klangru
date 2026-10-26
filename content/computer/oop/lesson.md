## โปรแกรมสหกรณ์ที่ยาวขึ้นทุกเทอม

ชุมนุมคอมพิวเตอร์เขียนโปรแกรมให้สหกรณ์โรงเรียน เทอมแรกมีแค่คิดเงิน เทอมต่อมาเพิ่มภาษีมูลค่าเพิ่ม ส่วนลด สมาชิก และบัญชีเงินฝาก จนไฟล์เดียวยาวหลายร้อยบรรทัด หาอะไรก็ยาก แก้ตรงหนึ่งแล้วพังอีกตรงหนึ่ง บทนี้สอนสองวิธีจัดโปรแกรมใหญ่ให้เป็นระเบียบ คือ **แบ่งเป็นโมดูล** และ **เขียนโปรแกรมเชิงวัตถุ** ต่อจากบท [ฟังก์ชัน](/topic/computer.programming.functions/) และ [ลิสต์ ดิกชันนารี และข้อความ](/topic/computer.programming.lists-strings/)

## โมดูล: แยกไฟล์ตามหน้าที่

**โมดูล (module)** คือไฟล์ `.py` ที่รวมฟังก์ชัน ค่าคงที่ และคลาสที่เกี่ยวข้องกัน ไฟล์อื่นนำไปใช้ด้วย `import` (ดูภาพ)

```python
# ไฟล์ shop_utils.py
VAT_RATE = 0.07

def add_vat(price):
    return round(price * (1 + VAT_RATE), 2)

def discount(price, percent):
    return price * (100 - percent) / 100

if __name__ == "__main__":      # ทดสอบเมื่อรันไฟล์นี้โดยตรงเท่านั้น
    print(add_vat(100))         # 107.0
```

```python
# ไฟล์ main.py อยู่ในโฟลเดอร์เดียวกัน
import shop_utils
from shop_utils import discount

print(shop_utils.add_vat(200))   # 214.0
print(discount(200, 10))         # 180.0
```

`import shop_utils` ต้องเรียกผ่านชื่อโมดูล ส่วน `from shop_utils import discount` เรียกชื่อฟังก์ชันได้ตรง ๆ บรรทัด `if __name__ == "__main__":` ทำให้โค้ดทดสอบไม่ทำงานตอนไฟล์อื่น import เข้าไป ถ้าวันหนึ่งอัตราภาษีเปลี่ยน แก้ที่ `VAT_RATE` จุดเดียว ทุกไฟล์ที่ใช้ก็ถูกตาม

## ไลบรารีและ API: ใช้ของที่คนอื่นทำไว้

**ไลบรารี (library)** คือชุดโมดูลที่มีคนเขียนและทดสอบไว้แล้ว Python มี **ไลบรารีมาตรฐาน** มาให้ เช่น `math` `random` `statistics` `json` `datetime` และยังมีไลบรารีจากผู้พัฒนาอื่นอีกมาก

```python
import statistics
import json

scores = [72, 85, 64, 90, 85]
print(statistics.mean(scores))     # 79.2
print(statistics.median(scores))   # 85

reply = '{"province": "เชียงใหม่", "temp_c": [24, 31]}'
data = json.loads(reply)           # แปลงข้อความ JSON เป็นดิกชันนารี
print(data["temp_c"][1])           # 31
```

**API (Application Programming Interface)** คือข้อตกลงว่าส่วนประกอบหนึ่งให้เรียกอะไรได้ ต้องส่งอะไรไป และจะได้อะไรกลับ เช่น API ของ `statistics.median` บอกว่ารับข้อมูลเป็นลำดับของตัวเลข คืนค่ามัธยฐาน เราอ่านเอกสาร API แล้วใช้ได้เลยโดยไม่ต้องรู้โค้ดข้างใน บริการบนเว็บก็มี API เช่น บริการพยากรณ์อากาศส่งข้อมูลกลับมาเป็นข้อความ JSON ที่แปลงเป็นดิกชันนารีได้แบบตัวอย่างข้างบน การใช้ไลบรารีต้องดูสัญญาอนุญาตและให้เครดิตตามที่กำหนดด้วย

## คลาสและวัตถุ

บางครั้งข้อมูลกับการกระทำผูกกันแน่น เช่น บัญชีเงินฝากของธนาคารโรงเรียนมีชื่อเจ้าของและยอดเงิน และทำได้แค่ฝากกับถอน **การเขียนโปรแกรมเชิงวัตถุ (object-oriented programming)** รวมสองอย่างนี้ไว้ด้วยกัน

- **คลาส (class)** คือแม่แบบ บอกว่าวัตถุชนิดนี้มีข้อมูลอะไรและทำอะไรได้
- **วัตถุ (object)** คือสิ่งที่สร้างจากคลาส แต่ละตัวมีค่าของตัวเอง
- **แอตทริบิวต์ (attribute)** คือข้อมูลในวัตถุ เช่น `self.balance`
- **เมทอด (method)** คือฟังก์ชันในคลาส พารามิเตอร์แรกคือ `self` หมายถึงวัตถุตัวที่ถูกเรียก

```python
class Account:
    def __init__(self, owner, balance=0):
        self.owner = owner          # แอตทริบิวต์
        self.balance = balance

    def deposit(self, amount):      # เมทอด
        if amount <= 0:
            raise ValueError("จำนวนเงินต้องมากกว่า 0")
        self.balance = self.balance + amount

    def withdraw(self, amount):
        if amount > self.balance:
            return False            # เงินไม่พอ ไม่ถอน
        self.balance = self.balance - amount
        return True

a = Account("มานี", 100)
b = Account("ปิติ")
a.deposit(50)
print(a.withdraw(500))   # False
print(a.balance, b.balance)   # 150 0
```

`Account("มานี", 100)` สร้างวัตถุใหม่และเรียก `__init__` ให้อัตโนมัติ `a.deposit(50)` ส่ง `a` ไปเป็น `self` ฝากเข้า `a` จึงไม่กระทบ `b` (ดูภาพ) เมทอดตรวจเงื่อนไขก่อนเปลี่ยนข้อมูล เช่น ไม่ยอมฝากเงินติดลบ ยอดเงินจึงถูกต้องเสมอ ถ้าทุกส่วนของโปรแกรมเปลี่ยนยอดเงินผ่านเมทอดเท่านั้น การซ่อนรายละเอียดไว้ในวัตถุแบบนี้เรียกว่า **การห่อหุ้ม (encapsulation)**

## นำส่วนประกอบมาใช้ซ้ำ

วัตถุประกอบจากวัตถุอื่นได้ เช่น ตะกร้าสินค้า `Cart` มีลิสต์ของ `Item` แล้วเมทอด `total()` เรียก `subtotal()` ของทุกชิ้นมารวม (ดูภาพ) ส่วน **การสืบทอด (inheritance)** สร้างคลาสใหม่จากคลาสเดิมแล้วเปลี่ยนเฉพาะส่วนที่ต่าง

```python
class StudentAccount(Account):        # สืบทอดจาก Account
    def withdraw(self, amount):
        if amount > 100:              # นักเรียนถอนได้ครั้งละไม่เกิน 100 บาท
            return False
        return super().withdraw(amount)

c = StudentAccount("ชูใจ", 300)
c.deposit(20)
print(c.withdraw(150), c.withdraw(80), c.balance)   # False True 240
```

`StudentAccount` ได้ `__init__` และ `deposit` มาจาก `Account` โดยไม่ต้องเขียนใหม่ และ `super().withdraw` เรียกเมทอดเดิมของคลาสแม่หลังตรวจเงื่อนไขเพิ่ม

## ข้อผิดพลาดที่พบบ่อย

- **ลืม `self` ในพารามิเตอร์** เรียก `x.switch()` แล้วได้ `TypeError ... takes 0 positional arguments but 1 was given`
- **เขียน `balance` แทน `self.balance`** ได้ตัวแปรเฉพาะที่ ค่าในวัตถุไม่เปลี่ยน หรือเกิด `NameError`
- **คิดว่า `b = a` สร้างวัตถุใหม่** ที่จริงทั้งสองชื่อชี้วัตถุเดียวกัน ต้องเรียกคลาสใหม่จึงได้วัตถุใหม่
- **ประกาศลิสต์เป็นตัวแปรของคลาส** (เขียนไว้ใต้ `class` นอก `__init__`) ทุกวัตถุจะใช้ลิสต์เดียวกัน
- **ตั้งชื่อไฟล์ซ้ำกับโมดูลมาตรฐาน** เช่น ตั้งชื่อไฟล์ว่า `statistics.py` แล้ว `import statistics` จะได้ไฟล์ของตัวเองแทน
