# python3 sched.py <repo> next <subject> [size]   -> พิมพ์รายการหัวข้อชุดถัดไป และบันทึกว่ากำลังทำ
# python3 sched.py <repo> status
# python3 sched.py <repo> release <batch>        -> ปลดชุดที่จบแล้ว
import sys, json, glob, os, yaml, collections
repo, cmd = sys.argv[1], sys.argv[2]
ST = os.path.join(repo, "docs", "batches", "state.json")
state = json.load(open(ST)) if os.path.exists(ST) else {"batches": {}, "n": 0}
done = set(yaml.safe_load(open(p))["id"] for p in glob.glob(f"{repo}/content/*/*/topic.yaml"))
topics, order = {}, []
for f in sorted(glob.glob(f"{repo}/docs/phase6/proposals-*.yaml")):
    for t in yaml.safe_load(open(f)).get("topics") or []:
        if t["id"] not in done and t["id"] not in topics: topics[t["id"]] = t; order.append(t["id"])
busy = {i for b in state["batches"].values() for i in b["ids"]}
# เรียงตามระดับในกราฟ แล้วตามความยาก
lv = {}
def L(i):
    if i not in lv: ps = [p for p in topics[i].get("prereq", []) if p in topics]; lv[i] = 0 if not ps else 1 + max(L(p) for p in ps)
    return lv[i]
order.sort(key=lambda i: (L(i), topics[i]["difficulty"]))
if cmd == "status":
    left = [i for i in order if i not in busy]
    c = collections.Counter(i.split(".")[0] for i in left)
    ready = collections.Counter(i.split(".")[0] for i in left if all(p in done for p in topics[i].get("prereq", [])))
    print(f"done {len(done)} · in plan {len(topics)} · busy {len(busy)}")
    for s, n in c.most_common(): print(f"  {s}: left {n} ready {ready[s]}")
    for k, b in state["batches"].items(): print(f"  [{k}] {b['subject']} {len(b['ids'])}")
elif cmd == "next":
    subj, size = sys.argv[3], int(sys.argv[4]) if len(sys.argv) > 4 else 8
    pick = []
    for i in order:
        if len(pick) >= size: break
        if not i.startswith(subj + ".") or i in busy: continue
        if all(p in done or p in pick for p in topics[i].get("prereq", [])): pick.append(i)
    if not pick: print("NONE"); sys.exit(0)
    state["n"] += 1; key = f"{subj}-{state['n']}"
    state["batches"][key] = {"subject": subj, "ids": pick}
    json.dump(state, open(ST, "w"), ensure_ascii=False, indent=1)
    print(key)
    for i in pick:
        t = topics[i]; print(f"- {i} | {t['title']} | ยาก {t['difficulty']} | prereq {', '.join(t.get('prereq', [])) or '-'}")
elif cmd == "ids":
    print(",".join(state["batches"][sys.argv[3]]["ids"]))
elif cmd == "release":
    state["batches"].pop(sys.argv[3], None); json.dump(state, open(ST, "w"), ensure_ascii=False, indent=1); print("released")
