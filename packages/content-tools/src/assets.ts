import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

/**
 * ดึงพิกัด 3 มิติของโมเลกุลจาก PubChem มาเก็บใน content/_assets/molecules/<cid>.sdf
 * เก็บไฟล์ไว้ใน repo เพื่อให้ build และแอปทำงานได้โดยไม่ต้องต่อเน็ต
 * ข้อมูล PubChem เป็นสาธารณสมบัติ (public domain)
 */
export async function fetchMolecules(cids: number[], contentDir: string, fetchImpl: typeof fetch = fetch): Promise<string[]> {
  const dir = join(contentDir, "_assets/molecules");
  mkdirSync(dir, { recursive: true });
  const fetched: string[] = [];
  for (const cid of [...new Set(cids)]) {
    const file = join(dir, `${cid}.sdf`);
    if (existsSync(file)) continue;
    let res = await fetchImpl(`https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/cid/${cid}/SDF?record_type=3d`);
    // บางสาร (เช่น ไอออนหรือโลหะ) ไม่มีโครงสร้าง 3 มิติ ใช้ 2 มิติแทน
    if (res.status === 404) res = await fetchImpl(`https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/cid/${cid}/SDF`);
    if (!res.ok) throw new Error(`PubChem CID ${cid}: HTTP ${res.status}`);
    writeFileSync(file, await res.text());
    fetched.push(`${cid}.sdf`);
  }
  return fetched;
}

/** รายการ CID ทั้งหมดที่บทเรียนอ้างถึง (ใช้ได้แม้ไฟล์ยังไม่มี) */
export function moleculeCids(raw: { topics: { topic: unknown }[] }): number[] {
  const out: number[] = [];
  for (const t of raw.topics) {
    const lessons = (t.topic as { lessons?: { type?: string; cid?: unknown }[] } | undefined)?.lessons ?? [];
    for (const b of lessons) if (b?.type === "molecule" && Number.isInteger(b.cid)) out.push(b.cid as number);
  }
  return out;
}
