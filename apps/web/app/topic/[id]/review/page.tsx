import Link from "next/link";
import type { Metadata } from "next";
import { PracticeSession } from "@/components/PracticeSession";
import { getIndex, getTopicPack } from "@/lib/content";

export const dynamicParams = false;
export const generateStaticParams = () => getIndex().topics.map((t) => ({ id: t.id }));

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return { title: `ทบทวน: ${getTopicPack((await params).id).topic.title.th}` };
}

export default async function ReviewTopicPage({ params }: Props) {
  const { topic, problems } = getTopicPack((await params).id);
  return (
    <div className="practice stack-lg">
      <header className="stack">
        <p className="eyebrow">
          <Link href="/review/">← รายการทบทวน</Link>
        </p>
        <h1>ทบทวน: {topic.title.th}</h1>
        <p className="muted">สุ่ม 3 ข้อจากหัวข้อนี้ ถ้าตอบถูกตั้งแต่ครั้งแรกทั้งหมด ระดับจะขึ้นเป็น “เชี่ยวชาญ” ได้</p>
      </header>
      <PracticeSession topicId={topic.id} topicTitle={topic.title.th} problems={problems} mode="review" />
    </div>
  );
}
