import type { Metadata } from "next";
import { ProfileStats } from "@/components/ProfileStats";
import { getIndex } from "@/lib/content";

export const metadata: Metadata = { title: "ความคืบหน้า" };

export default function ProfilePage() {
  const index = getIndex();
  return (
    <div className="stack-lg">
      <div className="intro">
        <h1>ความคืบหน้าของฉัน</h1>
        <p className="muted">ข้อมูลเก็บไว้ในเบราว์เซอร์เครื่องนี้เท่านั้น (เวอร์ชันทดลอง)</p>
      </div>
      <ProfileStats topics={index.topics} subjects={index.subjects} />
    </div>
  );
}
