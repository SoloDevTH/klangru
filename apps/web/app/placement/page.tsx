import type { Metadata } from "next";
import { PlacementTest } from "@/components/PlacementTest";
import { getIndex } from "@/lib/content";

export const metadata: Metadata = { title: "วัดระดับ" };

export default function PlacementPage() {
  const index = getIndex();
  return (
    <div className="stack-lg">
      <div className="intro">
        <h1>เริ่มจากตรงที่เหมาะกับคุณ</h1>
        <p className="muted">
          ตอบคำถามสั้น ๆ ไม่เกิน 8 ข้อต่อวิชา ระบบจะข้ามหัวข้อที่คุณรู้แล้วให้ ไม่มีคำใบ้และไม่มีเฉลยระหว่างทำ ตอบไม่ได้ให้เลือกข้ามได้เลย
        </p>
      </div>
      <PlacementTest subjects={index.subjects} topics={index.topics} />
    </div>
  );
}
