"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { isDue } from "@/lib/mastery";
import { answeredToday, useProgress } from "@/lib/progress";

const LINKS = [
  { href: "/", label: "แผนที่", icon: "M3 6l6-3 6 3 6-3v15l-6 3-6-3-6 3z M9 3v15 M15 6v15" },
  { href: "/search/", label: "ค้นหา", icon: "M11 4a7 7 0 1 0 0 14a7 7 0 0 0 0-14z M20 20l-4-4" },
  { href: "/review/", label: "ทบทวน", icon: "M4 12a8 8 0 1 0 2.3-5.6 M4 4v4h4" },
  { href: "/profile/", label: "ของฉัน", icon: "M12 12a4 4 0 1 0 0-8a4 4 0 0 0 0 8z M4 21c1-4 4.5-6 8-6s7 2 8 6" },
];

/** วงแหวนเป้าหมายรายวัน (จำนวนข้อที่ทำวันนี้ / เป้า) */
function GoalRing({ done, goal }: { done: number; goal: number }) {
  const r = 15;
  const c = 2 * Math.PI * r;
  const frac = Math.min(1, done / Math.max(1, goal));
  return (
    <Link href="/profile/#goal" className="goal" aria-label={`วันนี้ทำแล้ว ${done} จากเป้า ${goal} ข้อ`}>
      <svg viewBox="0 0 36 36" width="36" height="36" aria-hidden="true">
        <circle cx="18" cy="18" r={r} className="goal-track" />
        <circle cx="18" cy="18" r={r} className="goal-fill" strokeDasharray={`${frac * c} ${c}`} transform="rotate(-90 18 18)" />
      </svg>
      <span className="goal-text tabular">
        {done}/{goal}
      </span>
    </Link>
  );
}

export function NavBar() {
  const path = usePathname();
  const progress = useProgress();
  const due = progress ? Object.values(progress.topics).filter((t) => isDue(t.card)).length : 0;
  const active = (href: string) => (href === "/" ? path === "/" || path.startsWith("/topic") : path.startsWith(href));

  const links = LINKS.map((l) => (
    <Link key={l.href} href={l.href} className={active(l.href) ? "nav-link active" : "nav-link"} aria-current={active(l.href) ? "page" : undefined}>
      <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" className="nav-icon">
        <path d={l.icon} />
      </svg>
      <span>{l.label}</span>
      {l.href === "/review/" && due > 0 && <span className="badge" aria-label={`ถึงกำหนด ${due} หัวข้อ`}>{due}</span>}
    </Link>
  ));

  return (
    <>
      <header className="nav">
        <div className="nav-inner">
          <Link href="/" className="brand">
            คลังรู้
          </Link>
          <nav aria-label="เมนูหลัก" className="nav-top">
            {links}
          </nav>
          {progress && <GoalRing done={answeredToday(progress)} goal={progress.settings.dailyGoal} />}
        </div>
      </header>
      <nav aria-label="เมนูหลัก (มือถือ)" className="tabbar">
        {links}
      </nav>
    </>
  );
}
