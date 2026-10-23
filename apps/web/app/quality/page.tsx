import type { Metadata } from "next";
import { QualityLive } from "@/components/QualityLive";
import { getIndex, getTopicPack } from "@/lib/content";

export const metadata: Metadata = { title: "คุณภาพเนื้อหา", robots: { index: false } };

/**
 * แดชบอร์ดคุณภาพเนื้อหาสำหรับผู้เขียนและผู้ตรวจ
 * ส่วนบน: ตรวจจากไฟล์เนื้อหาตอน build · ส่วนล่าง: สถิติการตอบจริงจากเซิร์ฟเวอร์ (ถ้าตั้งค่าไว้)
 */
export default function QualityPage() {
  const index = getIndex();
  const rows = index.topics.map((t) => {
    const { topic, problems } = getTopicPack(t.id);
    const levels = new Set(problems.map((p) => p.difficulty)).size;
    const types = new Set(problems.map((p) => p.type)).size;
    const withMisconceptions = problems.filter((p) => ("misconceptions" in p && p.misconceptions.length > 0) || (p.type === "mcq" && p.choices.some((c) => !c.correct && c.feedback))).length;
    const media = topic.lessons.filter((b) => b.type !== "explanation").length;
    return { t, topic, problems: problems.length, levels, types, withMisconceptions, media };
  });
  const subjectName = Object.fromEntries(index.subjects.map((s) => [s.id, s.title.th]));
  const total = rows.reduce((n, r) => n + r.problems, 0);
  const published = rows.filter((r) => r.topic.status === "published").length;
  const ai = rows.filter((r) => r.topic.ai_assisted).length;
  const flag = (ok: boolean) => (ok ? "ok" : "warn");

  return (
    <div className="stack-lg quality">
      <div className="intro">
        <h1>คุณภาพเนื้อหา</h1>
        <p className="muted">สำหรับผู้เขียนและผู้ตรวจ ตัวเลขด้านล่างคำนวณจากไฟล์เนื้อหาตอน build</p>
      </div>
      <dl className="stats">
        <div>
          <dt>หัวข้อ</dt>
          <dd>{rows.length}</dd>
        </div>
        <div>
          <dt>โจทย์</dt>
          <dd>{total}</dd>
        </div>
        <div>
          <dt>ผ่านผู้ตรวจแล้ว</dt>
          <dd>
            {published} <small>/ {rows.length}</small>
          </dd>
        </div>
        <div>
          <dt>มี AI ช่วยร่าง</dt>
          <dd>
            {ai} <small>/ {rows.length}</small>
          </dd>
        </div>
      </dl>
      <div className="table-scroll">
        <table className="data">
          <thead>
            <tr>
              <th>หัวข้อ</th>
              <th>วิชา</th>
              <th>สถานะ</th>
              <th className="num">โจทย์</th>
              <th className="num">ระดับความยาก</th>
              <th className="num">ชนิดโจทย์</th>
              <th className="num">มี feedback ข้อผิด</th>
              <th className="num">สื่อ</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.t.id}>
                <td>
                  <a href={`/topic/${r.t.id}/`}>{r.t.title.th}</a>
                  <div className="small muted mono">{r.t.id}</div>
                </td>
                <td>{subjectName[r.t.subject]}</td>
                <td>
                  <span className={`status status-${r.topic.status === "published" ? "l2" : "draft"}`}>{r.topic.status === "published" ? "เผยแพร่" : r.topic.status === "review" ? "รอตรวจ" : "ร่าง"}</span>
                </td>
                <td className={`num ${flag(r.problems >= 10)}`}>{r.problems}</td>
                <td className={`num ${flag(r.levels >= 3)}`}>{r.levels}</td>
                <td className={`num ${flag(r.types >= 3)}`}>{r.types}</td>
                <td className={`num ${flag(r.withMisconceptions >= r.problems / 2)}`}>
                  {r.withMisconceptions}/{r.problems}
                </td>
                <td className={`num ${flag(r.media > 0)}`}>{r.media}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <QualityLive titles={Object.fromEntries(index.topics.map((t) => [t.id, t.title.th]))} />
    </div>
  );
}
