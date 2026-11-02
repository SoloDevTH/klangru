import { KnowledgeMap } from "@/components/KnowledgeMap";
import { getIndex } from "@/lib/content";

export default function HomePage() {
  const index = getIndex();
  return (
    <>
      <div className="intro">
        <h1>เรียนตามลำดับความรู้ ไม่ใช่ตามชั้นปี</h1>
        <p className="muted">
          {index.topics.length.toLocaleString("th-TH")} หัวข้อ {index.subjects.length} วิชา ได้แก่ {thaiList(index.subjects.map((s) => s.title.th))} เรียงจากพื้นฐานไปหาหัวข้อที่ต้องใช้พื้นฐานนั้น
          ทำโจทย์ผ่านแล้วหัวข้อถัดไปจะพร้อมเรียน
        </p>
      </div>
      <KnowledgeMap subjects={index.subjects} topics={index.topics} />
    </>
  );
}

// รวมชื่อเป็นรายการภาษาไทย: "ก ข และ ค"
function thaiList(xs: string[]): string {
  return xs.length < 2 ? xs.join("") : `${xs.slice(0, -1).join(" ")} และ${xs[xs.length - 1]}`;
}
