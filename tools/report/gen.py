# สร้างหน้ารายงานจากข้อมูลจริงในคลัง: npm run report [-- <โฟลเดอร์รีโพ> <ไฟล์ออก>]
# ค่าเริ่มต้น: รีโพนี้ → dist/report.html  ใช้ข้อมูลที่ commit แล้วเท่านั้นเมื่อส่งโฟลเดอร์ที่ได้จาก git archive HEAD
# ข้อเท็จจริงของเฟสเก่า (ฐานจำนวนหัวข้อ แผนเฟส 6/10) อยู่ในค่าคงที่ PHASE ด้านล่าง ตัวเลขอื่นคำนวณจากข้อมูล
import sys, glob, os, html, yaml
repo = sys.argv[1] if len(sys.argv) > 1 else os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
out = sys.argv[2] if len(sys.argv) > 2 else os.path.join(repo, "dist", "report.html")
os.makedirs(os.path.dirname(out), exist_ok=True)
E = html.escape
GH = "https://github.com/SoloDevTH/klangru/blob/main/"

fws = {}
for f in sorted(glob.glob(f"{repo}/curriculum/frameworks/*.yaml")):
    d = yaml.safe_load(open(f))
    inds = [i["id"] for s in d["strands"] for st in s["standards"] for i in st["indicators"]]
    fws[d["id"]] = dict(d=d, inds=inds)
full, part = {}, {}
for f in glob.glob(f"{repo}/curriculum/mappings/*.yaml"):
    m = yaml.safe_load(open(f))
    for r in m["mappings"]:
        for i in r["indicators"]:
            k = (m["framework"], i)
            (full if r["coverage"] == "full" else part)[k] = True
planned, plan_topics = set(), []
for f in sorted(glob.glob(f"{repo}/docs/phase6/proposals-*.yaml")):
    p = yaml.safe_load(open(f))
    for t in p.get("topics") or []:
        plan_topics.append(t)
        planned.update(tuple(x.split(":", 1)) for x in t.get("indicators", []))
    for e in p.get("extend") or []:
        planned.update(tuple(x.split(":", 1)) for x in e["indicators"])

def cov(fid):
    ids = fws[fid]["inds"]
    f_ = sum(1 for i in ids if (fid, i) in full)
    p_ = sum(1 for i in ids if (fid, i) in part and (fid, i) not in full)
    pl = sum(1 for i in ids if (fid, i) not in full and (fid, i) not in part and (fid, i) in planned)
    return len(ids), f_, p_, pl, len(ids) - f_ - p_ - pl

GROUPS = [
    ("หลักสูตรแกนกลางการศึกษาขั้นพื้นฐาน", [
        ("th-core-2560-math", "คณิตศาสตร์ (ฉบับปรับปรุง 2560)", "ป.1–ม.6"),
        ("th-core-2560-science", "วิทยาศาสตร์และเทคโนโลยี (ฉบับปรับปรุง 2560)", "ป.1–ม.6"),
        ("th-core-2551-thai", "ภาษาไทย (2551)", "ป.1–ม.6"),
        ("th-core-2551-foreign-languages", "ภาษาต่างประเทศ (2551)", "ป.1–ม.6"),
        ("th-core-2551-health-pe", "สุขศึกษาและพลศึกษา (2551)", "ป.1–ม.6"),
        ("th-core-2551-social-economics", "สังคมศึกษา สาระเศรษฐศาสตร์ (2551)", "ป.1–ม.6"),
        ("th-core-2560-career", "การงานอาชีพ (คำสั่ง สพฐ. 921/2561)", "ป.1–ม.6")]),
    ("รายวิชาเพิ่มเติม ม.4–6 (ฉบับปรับปรุง 2560)", [
        ("th-core-2560-math-additional", "คณิตศาสตร์เพิ่มเติม", "ม.4–6"),
        ("th-core-2560-physics-additional", "ฟิสิกส์", "ม.4–6"),
        ("th-core-2560-chemistry-additional", "เคมี", "ม.4–6"),
        ("th-core-2560-biology-additional", "ชีววิทยา", "ม.4–6"),
        ("th-core-2560-earthscience-additional", "โลก ดาราศาสตร์ และอวกาศ", "ม.4–6")]),
    ("Australian Curriculum V9.0 (CC BY 4.0)", [
        ("au-ac9-mathematics", "Mathematics", "F–10"),
        ("au-ac9-science", "Science", "F–10"),
        ("au-ac9-digital-technologies", "Digital Technologies", "F–10"),
        ("au-ac9-hpe", "Health and Physical Education", "F–10"),
        ("au-ac9-economics-business", "Economics and Business", "5–10")]),
    ("England National Curriculum (OGL v3)", [
        ("uk-nc-mathematics", "Mathematics", "KS1–KS4"),
        ("uk-nc-science", "Science", "KS1–KS4"),
        ("uk-nc-computing", "Computing", "KS1–KS4")]),
    ("สหรัฐอเมริกา", [
        ("us-ccss-math", "Common Core State Standards for Mathematics", "K–12"),
        ("us-ngss", "Next Generation Science Standards", "K–12"),
        ("csta-k12-cs", "CSTA K–12 Computer Science Standards (2017)", "K–12"),
        ("csta-k12-cs-2026", "CSTA PK–12 Computer Science Standards (2026)", "PK–12")]),
    ("กรอบระดับความสามารถทางภาษา", [
        ("cefr", "CEFR (Council of Europe, 2020)", "A1–C2"),
        ("hsk-3-0", "HSK 3.0 มาตรฐาน GF 0025—2021", "ระดับ 1–9")]),
    ("ระดับมหาวิทยาลัยและวิชาชีพ", [
        ("th-coe-engineering-basics", "องค์ความรู้ที่สภาวิศวกรรับรอง (ฉบับที่ 2 พ.ศ. 2567)", "7 สาขาควบคุม"),
        ("abet-eac", "ABET Engineering Accreditation Criteria 2026–2027", "ปริญญาตรี"),
        ("university-foundations", "วิชาพื้นฐานมหาวิทยาลัย (OpenStax, MIT OCW)", "14 วิชา"),
        ("acm-cs2023", "ACM/IEEE-CS/AAAI CS2023", "ปริญญาตรี"),
        ("th-tqf-accounting", "มคอ.1 สาขาวิชาการบัญชี", "ปริญญาตรี"),
        ("th-tqf-logistics", "มคอ.1 สาขาโลจิสติกส์", "ปริญญาตรี"),
        ("th-tqf-public-administration", "มคอ.1 สาขารัฐประศาสนศาสตร์", "ปริญญาตรี")]),
    ("การจัดการและการจัดการคุณภาพ", [
        ("tqa-2567-2568", "เกณฑ์รางวัลคุณภาพแห่งชาติ (TQA) 2567–2568", "องค์กร"),
        ("th-pmqa-4-0-2568", "PMQA 4.0 ปี 2568", "หน่วยงานรัฐ"),
        ("baldrige-award-2026", "Baldrige Excellence Framework 2026", "องค์กร"),
        ("iso-9001-2015", "ISO 9001:2015", "ระบบบริหารคุณภาพ"),
        ("asq-quality-bok", "ASQ CQE / CSSGB / CMQ-OE Body of Knowledge", "วิชาชีพ"),
        ("pmi-pmbok-8", "PMBOK Guide ฉบับที่ 8", "วิชาชีพ")]),
]
assert sum(len(g[1]) for g in GROUPS) == len(fws), set(fws) - {x[0] for g in GROUPS for x in g[1]}

total_inds = sum(len(v["inds"]) for v in fws.values())
refs = [r for f in glob.glob(f"{repo}/content/*/*/topic.yaml") for r in (yaml.safe_load(open(f)).get("references") or [])]
srcs = yaml.safe_load(open(f"{repo}/curriculum/sources.yaml"))["sources"]
subj_names = {"math": "คณิตศาสตร์", "physics": "ฟิสิกส์", "chemistry": "เคมี", "biology": "ชีววิทยา", "earthscience": "โลกและอวกาศ",
              "technology": "เทคโนโลยี", "engineering": "วิศวกรรม", "thai": "ภาษาไทย", "english": "ภาษาอังกฤษ", "chinese": "ภาษาจีน",
              "computer": "คอมพิวเตอร์", "health": "สุขศึกษาและพลศึกษา", "business": "บริหารธุรกิจ", "management": "การจัดการ", "science": "ทักษะวิทยาศาสตร์"}
plan_by = {}
for t in plan_topics: plan_by[t["id"].split(".")[0]] = plan_by.get(t["id"].split(".")[0], 0) + 1

def bar(t, f_, p_, pl, no):
    segs = [("full", f_, "สอนครบ"), ("part", p_, "สอนบางส่วน"), ("plan", pl, "อยู่ในแผนเฟส 6"), ("none", no, "ยังไม่มีแผน")]
    inner = "".join(f'<span class="seg {c}" style="width:{n / t * 100:.2f}%" title="{lab} {n}"></span>' for c, n, lab in segs if n)
    return f'<div class="bar" role="img" aria-label="สอนครบ {f_} บางส่วน {p_} อยู่ในแผน {pl} ยังไม่มีแผน {no} จาก {t}">{inner}</div>'

rows = []
for gname, items in GROUPS:
    rows.append(f'<tr class="group"><th colspan="6" scope="colgroup">{E(gname)}</th></tr>')
    for fid, name, level in items:
        d = fws[fid]["d"]; t, f_, p_, pl, no = cov(fid)
        how = "ข้อความเต็ม" if d["completeness"] == "full-text" else "โครง + สรุป"
        src = d["sources"][0]
        rows.append(
            f'<tr><td><a href="{GH}curriculum/frameworks/{fid}.yaml">{E(name)}</a><div class="sub mono">{fid}</div></td>'
            f'<td>{E(level)}</td><td class="num">{t:,}</td><td><span class="chip {"ok" if how == "ข้อความเต็ม" else "sum"}">{how}</span></td>'
            f'<td class="cov">{bar(t, f_, p_, pl, no)}<div class="sub tabular">ครบ {f_} · บางส่วน {p_} · ยังไม่มีหัวข้อ {no}</div></td>'
            f'<td><a class="sub" href="{E(src["url"])}">{E(src["publisher"])}</a></td></tr>')

src_rows = "".join(
    f'<tr><td><a href="{E(s["url"])}">{E(s["name"])}</a></td><td class="mono sub">{E(s["license"])}</td>'
    f'<td><span class="chip {"ok" if s["reuse"] == "adapt" else "link"}">{"ดัดแปลงได้" if s["reuse"] == "adapt" else "ลิงก์เท่านั้น"}</span></td>'
    f'<td><a class="sub" href="{E(s["evidence_url"])}">หลักฐาน</a></td></tr>' for s in srcs)
adapt_n = sum(1 for s in srcs if s["reuse"] == "adapt")
ref_by = {}
for r in refs: ref_by[r["source"]] = ref_by.get(r["source"], 0) + 1
plan_rows = "".join(f'<li><span>{subj_names.get(k, k)}</span><b class="tabular">{v}</b></li>' for k, v in sorted(plan_by.items(), key=lambda x: -x[1]))

thai_ids = [x[0] for g in GROUPS[:2] for x in g[1]]
thai_total = sum(cov(i)[0] for i in thai_ids)
thai_after = sum(cov(i)[4] for i in thai_ids)
thai_pe, thai_career, thai_chem = cov("th-core-2551-health-pe")[4], cov("th-core-2560-career")[4], cov("th-core-2560-chemistry-additional")[4]
assert thai_pe + thai_career + thai_chem == thai_after, (thai_pe, thai_career, thai_chem, thai_after)

import base64, re, io
topics = sorted(glob.glob(f"{repo}/content/*/*/topic.yaml"))
n_prob = n_fig = n_worked = n_check = n_pfig = 0
by_subj = {}
for f in topics:
    d = os.path.dirname(f); sj = d.split("/")[-2]; tp = yaml.safe_load(open(f))
    ps = yaml.safe_load(open(f"{d}/problems.yaml")); ps = ps["problems"] if isinstance(ps, dict) else ps
    n_prob += len(ps); n_pfig += sum(1 for x in ps if x.get("figure"))
    by_subj.setdefault(sj, [0, 0]); by_subj[sj][0] += 1; by_subj[sj][1] += len(ps)
    if os.path.isdir(f"{d}/figures"): n_fig += len(os.listdir(f"{d}/figures"))
    for b in tp.get("lessons", []):
        n_worked += b.get("type") == "worked-example"; n_check += b.get("type") == "check"
n_widget = n_sim = n_mol = n_flash = n_gloss = 0
ptypes = {}
for f in topics:
    d = os.path.dirname(f); tp = yaml.safe_load(open(f))
    for b in tp.get("lessons", []):
        n_widget += b.get("type") == "interactive"; n_sim += b.get("type") == "simulation"; n_mol += b.get("type") == "molecule"
    n_flash += len(tp.get("flashcards") or []); n_gloss += len(tp.get("glossary") or [])
    ps = yaml.safe_load(open(f"{d}/problems.yaml")); ps = ps["problems"] if isinstance(ps, dict) else ps
    for x in ps: ptypes[x["type"]] = ptypes.get(x["type"], 0) + 1
PT = {"code": "เขียนโค้ด Python ที่รันได้จริง", "mcq": "เลือกตอบ", "numeric": "ตอบเป็นตัวเลขพร้อมหน่วย", "text": "พิมพ์คำตอบ", "order": "เรียงลำดับ", "match": "จับคู่", "expression": "ตอบเป็นนิพจน์คณิตศาสตร์", "hanzi": "เขียนอักษรจีนตามลำดับขีด"}
ptype_rows = "".join(f'<li><span>{PT.get(k, k)}</span><b class="tabular">{v:,}</b></li>' for k, v in sorted(ptypes.items(), key=lambda x: -x[1]))
SHOTS = [("map", "แผนที่ความรู้", "หัวข้อถัดไปที่พร้อมเรียน เลือกให้จากสิ่งที่ผ่านแล้ว"),
         ("graph", "กราฟความรู้", "ลูกศรจากพื้นฐานไปหาหัวข้อที่ต่อยอด"),
         ("lesson", "บทเรียน", "คำอธิบาย สมการ และภาพประกอบที่วาดจากการคำนวณ"),
         ("worked", "ตัวอย่างแสดงวิธีทำ", "เปิดทีละขั้น กด \"ทำไมทำแบบนี้\" ได้ทุกขั้น"),
         ("widget", "สื่อโต้ตอบ", "เลื่อนค่าแล้วกราฟเปลี่ยนตามทันที"),
         ("molecule", "โมเลกุล 3 มิติ", "หมุนและซูมได้ ข้อมูลจาก PubChem"),
         ("practice", "ทำโจทย์", "ตอบผิดได้คำใบ้ทีละขั้น ไม่เฉลยทันที"),
         ("code", "เขียนโค้ด Python", "รันได้จริงในแอป ตรวจด้วยชุดทดสอบ"),
         ("hanzi", "อักษรจีน", "ขีดพื้นฐานและลำดับการเขียน"),
         ("search", "ค้นหา", "ค้นด้วยรหัสตัวชี้วัด คำไทย หรือคำอังกฤษ"),
         ("review", "ทบทวนก่อนลืม", "นัดทบทวนรายหัวข้อและบัตรคำด้วย FSRS"),
         ("profile", "ความคืบหน้า", "เป้าหมายรายวัน วันต่อเนื่อง และบัญชี"),
         ("quality", "หน้าคุณภาพ", "สำหรับครูและผู้ตรวจเนื้อหา"),
         ("placement", "วัดระดับ", "ข้ามเรื่องที่รู้แล้วด้วยคำถามไม่เกิน 8 ข้อต่อวิชา")]
from PIL import Image
import io
shots = []
for name, label, cap_ in SHOTS:
    im = Image.open(os.path.join(os.path.dirname(__file__), "app", name + ".png")).convert("RGB").resize((520, 1040), Image.LANCZOS)
    buf = io.BytesIO(); im.save(buf, "JPEG", quality=80, optimize=True)
    shots.append(f'<figure class="shot"><img src="data:image/jpeg;base64,{base64.b64encode(buf.getvalue()).decode()}" alt="หน้าจอ{E(label)}ในแอปคลังรู้ บนมือถือ" width="260" height="520" loading="lazy"><figcaption><b>{E(label)}</b>{E(cap_)}</figcaption></figure>')
PHASE = {"before_p8": 104, "p8_planned": 521, "after_p9": 637, "p10_plan": 238}  # ข้อเท็จจริงตามเอกสาร docs/status.md
P8_START_TOPICS = PHASE["before_p8"]
plan_total = 521
n_p8 = len(topics) - P8_START_TOPICS
p8_pct = round(n_p8 / (n_p8 + len(plan_topics)) * 100)
subj_rows = "".join(f'<tr><td>{subj_names.get(k, k)}</td><td class="num">{v[0]}</td><td class="num">{v[1]:,}</td></tr>' for k, v in sorted(by_subj.items(), key=lambda x: -x[1][1]))
SHOW = [("physics/light-refraction", "snell", "การหักเหของแสง"), ("math/pythagoras", "", "ทฤษฎีบทพีทาโกรัส"), ("thai/tone-rules", "", "เสียงวรรณยุกต์"), ("management/qc-tools", "", "เครื่องมือ QC")]
def cap(c): return "" if "\\" in c else c.replace("$", "")
gallery = []
for path, want, label in SHOW:
    tp = yaml.safe_load(open(f"{repo}/content/{path}/topic.yaml"))
    figs = [b for b in tp.get("lessons", []) if b.get("type") == "figure" and b["src"].endswith(".svg")]
    fig = next((b for b in figs if want and want in b["src"]), figs[0] if figs else None)
    if not fig: continue
    data = base64.b64encode(open(f"{repo}/content/{path}/figures/{fig['src']}", "rb").read()).decode()
    gallery.append(f'<figure class="g"><img src="data:image/svg+xml;base64,{data}" alt="{E(fig["alt"])}"><figcaption><b>{E(label)}</b> {E(cap(fig.get("caption") or ""))}</figcaption></figure>')
full_before = {"us-ccss-math": 2, "uk-nc-mathematics": 2, "uk-nc-science": 2, "au-ac9-mathematics": 1}
lift_rows = "".join(f'<li><span>{E(n)}</span><b class="tabular">{full_before[k]}% → {round(cov(k)[1] / cov(k)[0] * 100)}%</b></li>'
                    for k, n in [("us-ccss-math", "Common Core คณิต"), ("au-ac9-mathematics", "AC9 คณิต"), ("uk-nc-mathematics", "England NC คณิต"), ("uk-nc-science", "England NC วิทย์")])

sample = fws["th-core-2560-math"]["d"]["strands"][0]["standards"][0]["indicators"][0]

page = open(os.path.join(os.path.dirname(__file__), "template.html")).read()
for k, v in {
    "{{ROWS}}": "\n".join(rows), "{{SRC_ROWS}}": src_rows, "{{PLAN_ROWS}}": plan_rows,
    "{{N_FW}}": str(len(fws)), "{{N_IND}}": f"{total_inds:,}", "{{N_REFS}}": f"{len(refs):,}", "{{N_SRC}}": str(len(srcs)),
    "{{N_ADAPT}}": str(adapt_n), "{{N_LINK}}": str(len(srcs) - adapt_n), "{{N_PLAN}}": str(len(plan_topics)),
    "{{THAI_TOTAL}}": f"{thai_total:,}", "{{THAI_AFTER}}": str(thai_after),
    "{{REF_WTH}}": str(ref_by.get("wikipedia-th", 0)), "{{REF_WEN}}": str(ref_by.get("wikipedia-en", 0)), "{{REF_OS}}": str(ref_by.get("openstax", 0)),
    "{{REF_OTHER}}": str(len(refs) - ref_by.get("wikipedia-th", 0) - ref_by.get("wikipedia-en", 0) - ref_by.get("openstax", 0)),
    "{{N_TOPICS}}": str(len(topics)), "{{N_PROB}}": f"{n_prob:,}", "{{N_FIG}}": f"{n_fig:,}", "{{N_PFIG}}": str(n_pfig),
    "{{N_WORKED}}": str(n_worked), "{{N_CHECK}}": str(n_check), "{{SUBJ_ROWS}}": subj_rows, "{{GALLERY}}": "\n".join(gallery),
    "{{LIFT_ROWS}}": lift_rows, "{{SHOTS}}": "\n".join(shots), "{{PTYPE_ROWS}}": ptype_rows,
    "{{N_WIDGET}}": str(n_widget), "{{N_SIM}}": str(n_sim), "{{N_MOL}}": str(n_mol), "{{N_FLASH}}": f"{n_flash:,}", "{{N_GLOSS}}": f"{n_gloss:,}",
    "{{N_P8}}": str(PHASE["p8_planned"]), "{{N_CODE}}": str(ptypes.get("code", 0)), "{{N_FULL}}": f"{sum(cov(i)[1] for i in fws):,}", "{{N_PART}}": f"{sum(cov(i)[2] for i in fws):,}", "{{N_NONE}}": f"{sum(cov(i)[4] for i in fws):,}", "{{FULL_PCT}}": f"{sum(cov(i)[1] for i in fws)/total_inds*100:.1f}", "{{P8_PCT}}": str(p8_pct), "{{P8_LEFT}}": str(len(plan_topics)), "{{N_EXPR}}": str(ptypes.get("expression", 0)), "{{N_SUBJ}}": str(len(by_subj)),
    "{{SAMPLE_ID}}": E(sample["id"]), "{{SAMPLE_TEXT}}": E(sample["text"]), "{{GH}}": GH,
}.items():
    page = page.replace(k, v)
import json
prio = json.load(open(f"{repo}/docs/phase10/priority.json"))  # รหัสหัวข้อ → ลำดับความสำคัญ 1–3 ตามแผนเฟส 10
topic_ids = {yaml.safe_load(open(f))["id"] for f in topics}
p10_done = len(topics) - PHASE["after_p9"]
PD = {k: sum(1 for i, v in prio.items() if v == k and i in topic_ids) for k in (1, 2, 3)}
PT = {k: sum(1 for v in prio.values() if v == k) for k in (1, 2, 3)}
for k, v in {"{{THAI_PE}}": str(thai_pe), "{{THAI_CAREER}}": str(thai_career), "{{THAI_CHEM}}": str(thai_chem),
             "{{N_P10_DONE}}": str(p10_done), "{{N_P10_PLAN}}": str(PHASE["p10_plan"]), "{{N_P10_LEFT}}": str(PHASE["p10_plan"] - p10_done),
             "{{P1_DONE}}": str(PD[1]), "{{P1_ALL}}": str(PT[1]), "{{P2_DONE}}": str(PD[2]), "{{P2_ALL}}": str(PT[2]), "{{P3_DONE}}": str(PD[3]), "{{P3_ALL}}": str(PT[3])}.items():
    page = page.replace(k, v)
assert "{{" not in page
open(out, "w").write(page)
print("ok", len(fws), total_inds, len(refs), len(plan_topics), thai_total, thai_after)
