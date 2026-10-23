import type { Metadata } from "next";
import { ReviewQueue } from "@/components/ReviewQueue";
import { getIndex } from "@/lib/content";

export const metadata: Metadata = { title: "ทบทวน" };

export default function ReviewPage() {
  const index = getIndex();
  return (
    <div className="stack-lg">
      <div className="intro">
        <h1>ทบทวนก่อนลืม</h1>
        <p className="muted">ระบบนัดวันทบทวนแต่ละหัวข้อจากผลการฝึก (อัลกอริทึม FSRS) หัวข้อที่ทำได้ดีจะถูกเว้นระยะนานขึ้นเรื่อย ๆ</p>
      </div>
      <ReviewQueue topics={index.topics} subjects={index.subjects} />
    </div>
  );
}
