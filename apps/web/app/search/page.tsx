import type { Metadata } from "next";
import { SearchBox } from "@/components/SearchBox";
import { getIndex } from "@/lib/content";

export const metadata: Metadata = { title: "ค้นหา" };

export default function SearchPage() {
  const index = getIndex();
  return (
    <div className="stack-lg">
      <div className="intro">
        <h1>ค้นหาบทเรียนและโจทย์</h1>
        <p className="muted">ค้นได้ทั้งภาษาไทยและอังกฤษ ระบบตัดคำภาษาไทยให้อัตโนมัติ ใช้ได้แม้ไม่มีอินเทอร์เน็ต</p>
      </div>
      <SearchBox subjects={index.subjects} titles={Object.fromEntries(index.topics.map((t) => [t.id, t.title.th]))} />
    </div>
  );
}
