import type { Figure } from "@klangru/schema";
import { Markdown } from "./Markdown";

const LICENSE_LABEL: Record<string, string> = { PD: "สาธารณสมบัติ" };

/**
 * ภาพประกอบ (src เป็น path ในแอปแล้ว เช่น /content/figures/<หัวข้อ>/<ไฟล์>)
 * พื้นภาพเป็นสีขาวเสมอ เพราะแผนภาพส่วนใหญ่วาดเส้นสีเข้มบนพื้นโปร่งใส ซึ่งจะมองไม่เห็นในโหมดมืด
 */
export function FigureView({ figure, compact = false }: { figure: Figure; compact?: boolean }) {
  return (
    <figure className={compact ? "figure compact" : "figure"}>
      {/* eslint-disable-next-line @next/next/no-img-element -- static export ไม่มีตัวปรับขนาดภาพ */}
      <img src={figure.src} alt={figure.alt} loading="lazy" decoding="async" />
      {(figure.caption || figure.credit) && (
        <figcaption>
          {figure.caption && <Markdown inline>{figure.caption}</Markdown>}
          {figure.credit && (
            <span className="credit">
              ภาพ: {figure.source ? <a href={figure.source} target="_blank" rel="noopener noreferrer">{figure.credit}</a> : figure.credit}
              {figure.license && ` · ${LICENSE_LABEL[figure.license] ?? figure.license}`}
            </span>
          )}
        </figcaption>
      )}
    </figure>
  );
}
