import { KnowledgeMap } from "@/components/KnowledgeMap";
import { getIndex } from "@/lib/content";

export default function HomePage() {
  const index = getIndex();
  return (
    <>
      <div className="intro">
        <h1>เรียนตามลำดับความรู้ ไม่ใช่ตามชั้นปี</h1>
        <p className="muted">
          {index.topics.length} หัวข้อ จาก {index.subjects.map((s) => s.title.th).join(" และ ")} เรียงจากพื้นฐานไปหาหัวข้อที่ต้องใช้พื้นฐานนั้น
          ทำโจทย์ผ่านแล้วหัวข้อถัดไปจะพร้อมเรียน
        </p>
      </div>
      <KnowledgeMap subjects={index.subjects} topics={index.topics} />
    </>
  );
}
