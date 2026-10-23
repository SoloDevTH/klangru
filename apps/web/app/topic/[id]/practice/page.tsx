import Link from "next/link";
import type { Metadata } from "next";
import { PracticeSession } from "@/components/PracticeSession";
import { getIndex, getTopicPack } from "@/lib/content";

export const dynamicParams = false;
export const generateStaticParams = () => getIndex().topics.map((t) => ({ id: t.id }));

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return { title: `ฝึก: ${getTopicPack((await params).id).topic.title.th}` };
}

export default async function PracticePage({ params }: Props) {
  const { topic, problems } = getTopicPack((await params).id);
  return (
    <div className="practice stack-lg">
      <header className="stack">
        <p className="eyebrow">
          <Link href={`/topic/${topic.id}/`}>← กลับไปบทเรียน</Link>
        </p>
        <h1>ฝึก: {topic.title.th}</h1>
      </header>
      <PracticeSession topicId={topic.id} topicTitle={topic.title.th} problems={problems} mode="practice" />
    </div>
  );
}
