export interface GraphNode {
  id: string;
  difficulty: number;
  prerequisites: string[];
}

/** หาวงวนในกราฟ prerequisite คืนเส้นทางของวงแรกที่พบ หรือ null ถ้าไม่มี */
export function findCycle(nodes: GraphNode[]): string[] | null {
  const byId = new Map(nodes.map((n) => [n.id, n]));
  const state = new Map<string, "visiting" | "done">();
  const stack: string[] = [];

  const visit = (id: string): string[] | null => {
    const s = state.get(id);
    if (s === "done") return null;
    if (s === "visiting") return [...stack.slice(stack.indexOf(id)), id];
    state.set(id, "visiting");
    stack.push(id);
    for (const p of byId.get(id)?.prerequisites ?? []) {
      if (!byId.has(p)) continue;
      const cycle = visit(p);
      if (cycle) return cycle;
    }
    stack.pop();
    state.set(id, "done");
    return null;
  };

  for (const n of nodes) {
    const cycle = visit(n.id);
    if (cycle) return cycle;
  }
  return null;
}

/**
 * เรียงหัวข้อแบบ topological: หัวข้อจะมาหลัง prerequisite ทั้งหมดเสมอ
 * ถ้ามีหลายหัวข้อพร้อมกัน เลือกที่ difficulty ต่ำกว่าก่อน แล้วตามด้วย id
 * ต้องเรียกหลัง findCycle คืน null
 */
export function topoOrder(nodes: GraphNode[]): string[] {
  const ids = new Set(nodes.map((n) => n.id));
  const indegree = new Map<string, number>();
  const dependents = new Map<string, string[]>();
  for (const n of nodes) {
    const prereqs = n.prerequisites.filter((p) => ids.has(p));
    indegree.set(n.id, prereqs.length);
    for (const p of prereqs) dependents.set(p, [...(dependents.get(p) ?? []), n.id]);
  }
  const byId = new Map(nodes.map((n) => [n.id, n]));
  const cmp = (a: string, b: string) => byId.get(a)!.difficulty - byId.get(b)!.difficulty || a.localeCompare(b);

  const ready = nodes.filter((n) => indegree.get(n.id) === 0).map((n) => n.id);
  const out: string[] = [];
  while (ready.length) {
    ready.sort(cmp);
    const id = ready.shift()!;
    out.push(id);
    for (const d of dependents.get(id) ?? []) {
      const left = indegree.get(d)! - 1;
      indegree.set(d, left);
      if (left === 0) ready.push(d);
    }
  }
  return out;
}

/** ความลึก = ความยาวเส้นทาง prerequisite ที่ยาวที่สุดจากหัวข้อราก */
export function depths(nodes: GraphNode[]): Map<string, number> {
  const byId = new Map(nodes.map((n) => [n.id, n]));
  const memo = new Map<string, number>();
  const depth = (id: string): number => {
    if (memo.has(id)) return memo.get(id)!;
    const prereqs = (byId.get(id)?.prerequisites ?? []).filter((p) => byId.has(p));
    const d = prereqs.length ? Math.max(...prereqs.map(depth)) + 1 : 0;
    memo.set(id, d);
    return d;
  };
  for (const n of nodes) depth(n.id);
  return memo;
}
