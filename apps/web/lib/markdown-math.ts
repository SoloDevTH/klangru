/**
 * remark-math ถือว่า `$$...$$` ที่อยู่บรรทัดเดียวเป็นสมการในบรรทัด (inline) สมการยาวจึงดันหน้ากว้างเกินจอมือถือ
 * แปลงบรรทัดที่มีแต่ `$$...$$` ให้เป็นบล็อกหลายบรรทัด เพื่อให้แสดงเป็นสมการแยกบรรทัดที่เลื่อนในแนวนอนได้
 */
export function blockMath(md: string): string {
  return md.replace(/^([ \t]*(?:[-*+] |\d+\. )?)\$\$(.+?)\$\$[ \t]*$/gm, (_m, lead: string, tex: string) => {
    const pad = " ".repeat(lead.length);
    return `${lead}\n${pad}$$\n${pad}${tex.trim()}\n${pad}$$`;
  });
}
