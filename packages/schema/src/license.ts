/**
 * ใบอนุญาตเนื้อหาที่ยอมรับ (ดู docs/decisions/0001-non-commercial-and-licensing.md)
 * ไม่รับ ND เพราะห้ามดัดแปลง และไม่รับเนื้อหาสงวนลิขสิทธิ์
 */
export const LICENSES = ["CC0-1.0", "CC-BY-4.0", "CC-BY-SA-4.0", "CC-BY-NC-4.0", "CC-BY-NC-SA-4.0"] as const;
export type License = (typeof LICENSES)[number];

/** ใบอนุญาตเริ่มต้นของเนื้อหาที่ทีมเขียนเอง */
export const DEFAULT_LICENSE: License = "CC-BY-SA-4.0";

/**
 * งานที่ดัดแปลงจากต้นฉบับใบอนุญาต `source` ใช้ใบอนุญาตใดได้บ้าง
 * อิงตารางความเข้ากันได้ของ Creative Commons สำหรับงานดัดแปลง
 */
const ADAPTATION: Record<License, readonly License[]> = {
  "CC0-1.0": LICENSES,
  "CC-BY-4.0": LICENSES,
  "CC-BY-SA-4.0": ["CC-BY-SA-4.0"],
  "CC-BY-NC-4.0": ["CC-BY-NC-4.0", "CC-BY-NC-SA-4.0"],
  "CC-BY-NC-SA-4.0": ["CC-BY-NC-SA-4.0"],
};

export function canAdapt(source: License, target: License): boolean {
  return ADAPTATION[source].includes(target);
}

/** ใบอนุญาตที่ใช้ได้เมื่อดัดแปลงจากต้นฉบับหลายแหล่งพร้อมกัน (อาจว่าง = รวมกันไม่ได้) */
export function compatibleTargets(sources: readonly License[]): License[] {
  return LICENSES.filter((t) => sources.every((s) => canAdapt(s, t)));
}
