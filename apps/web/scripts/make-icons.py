"""สร้างไอคอนของคลังรู้จากรูปทรงชุดเดียว: กราฟความรู้ (จุดเชื่อมกัน) เหนือหนังสือที่เปิดอยู่

ใช้: python3 scripts/make-icons.py   (ต้องมี Pillow)
ผลลัพธ์: ไอคอนแอป Android (ทุกความละเอียด), ไอคอนแจ้งเตือน, หน้าจอเปิดแอป และไอคอน PWA ใน public/icons
"""
from pathlib import Path

from PIL import Image, ImageDraw

HERE = Path(__file__).resolve().parent.parent
RES = HERE / "android/app/src/main/res"
TEAL = (10, 107, 96, 255)
PAPER = (245, 247, 246, 255)
WHITE = (255, 255, 255, 255)

# รูปทรงบนตาราง 108 หน่วย (ขนาดมาตรฐานของ adaptive icon โดยพื้นที่ปลอดภัยคือ 21–87)
NODES = [(38, 42), (54, 30), (70, 42)]
EDGES = [((38, 42), (54, 30)), ((54, 30), (70, 42)), ((38, 42), (54, 60)), ((70, 42), (54, 60))]
LEFT_PAGE = [(28, 62), (52, 66), (52, 82), (28, 78)]
RIGHT_PAGE = [(56, 66), (80, 62), (80, 78), (56, 82)]


def draw_glyph(img: Image.Image, color, box=(0, 0, 108, 108)) -> None:
    """วาดรูปทรงลงในภาพ โดยแมปพื้นที่ box (หน่วย 108) ให้เต็มภาพ"""
    d = ImageDraw.Draw(img)
    x0, y0, x1, y1 = box
    sx = img.width / (x1 - x0)
    sy = img.height / (y1 - y0)
    tx = lambda p: ((p[0] - x0) * sx, (p[1] - y0) * sy)
    w = max(1, round(3.2 * sx))
    for a, b in EDGES:
        d.line([tx(a), tx(b)], fill=color, width=w)
    r = 5.5 * sx
    for n in NODES:
        cx, cy = tx(n)
        d.ellipse([cx - r, cy - r, cx + r, cy + r], fill=color)
    d.polygon([tx(p) for p in LEFT_PAGE], fill=color)
    d.polygon([tx(p) for p in RIGHT_PAGE], fill=color)


def render(size: int, *, background=TEAL, shape="square", glyph=WHITE, box=(0, 0, 108, 108), supersample=4) -> Image.Image:
    big = size * supersample
    img = Image.new("RGBA", (big, big), (0, 0, 0, 0))
    if background:
        d = ImageDraw.Draw(img)
        if shape == "circle":
            d.ellipse([0, 0, big - 1, big - 1], fill=background)
        elif shape == "rounded":
            d.rounded_rectangle([0, 0, big - 1, big - 1], radius=big * 0.22, fill=background)
        else:
            d.rectangle([0, 0, big, big], fill=background)
    draw_glyph(img, glyph, box)
    return img.resize((size, size), Image.LANCZOS)


DENSITIES = {"mdpi": 1, "hdpi": 1.5, "xhdpi": 2, "xxhdpi": 3, "xxxhdpi": 4}


def android() -> None:
    for name, k in DENSITIES.items():
        folder = RES / f"mipmap-{name}"
        folder.mkdir(parents=True, exist_ok=True)
        # ไอคอนเดิมก่อน Android 8: ตัดขอบให้รูปทรงใหญ่ขึ้น
        legacy = (14, 14, 94, 94)
        render(round(48 * k), shape="rounded", box=legacy).save(folder / "ic_launcher.png")
        render(round(48 * k), shape="circle", box=legacy).save(folder / "ic_launcher_round.png")
        render(round(108 * k), background=None).save(folder / "ic_launcher_foreground.png")
        # ไอคอนแจ้งเตือน: สีขาวบนพื้นโปร่งใส ตามข้อกำหนดของ Android
        dfolder = RES / f"drawable-{name}"
        dfolder.mkdir(parents=True, exist_ok=True)
        render(round(24 * k), background=None, box=(20, 20, 88, 88)).save(dfolder / "ic_stat_klangru.png")
    (RES / "values/ic_launcher_background.xml").write_text(
        '<?xml version="1.0" encoding="utf-8"?>\n<resources>\n    <color name="ic_launcher_background">#0A6B60</color>\n</resources>\n',
        encoding="utf-8",
    )
    # หน้าจอเปิดแอป: พื้นสีกระดาษ ไอคอนตรงกลาง
    for splash in RES.glob("drawable*/splash.png"):
        w, h = Image.open(splash).size
        img = Image.new("RGBA", (w, h), PAPER)
        icon = render(round(min(w, h) * 0.32), shape="rounded", box=(14, 14, 94, 94))
        img.alpha_composite(icon, ((w - icon.width) // 2, (h - icon.height) // 2))
        img.convert("RGB").save(splash)


def pwa() -> None:
    out = HERE / "public/icons"
    out.mkdir(parents=True, exist_ok=True)
    for size in (192, 512):
        render(size, shape="rounded", box=(14, 14, 94, 94)).save(out / f"icon-{size}.png")
        # maskable: เต็มกรอบ รูปทรงอยู่ในพื้นที่ปลอดภัย
        render(size).save(out / f"maskable-{size}.png")
    render(180, shape="square", box=(14, 14, 94, 94)).save(out / "apple-touch-icon.png")
    render(32, shape="rounded", box=(14, 14, 94, 94)).save(out / "favicon-32.png")


if __name__ == "__main__":
    if RES.exists():
        android()
    pwa()
    print("สร้างไอคอนแล้ว")
