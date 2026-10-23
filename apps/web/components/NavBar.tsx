"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { isDue } from "@/lib/mastery";
import { useProgress } from "@/lib/progress";

const LINKS = [
  { href: "/", label: "แผนที่ความรู้" },
  { href: "/review/", label: "ทบทวน" },
  { href: "/profile/", label: "ความคืบหน้า" },
];

export function NavBar() {
  const path = usePathname();
  const progress = useProgress();
  const due = progress ? Object.values(progress.topics).filter((t) => isDue(t.card)).length : 0;

  return (
    <header className="nav">
      <div className="nav-inner">
        <Link href="/" className="brand">
          คลังรู้
        </Link>
        <nav aria-label="เมนูหลัก">
          {LINKS.map((l) => {
            const active = l.href === "/" ? path === "/" || path.startsWith("/topic") : path.startsWith(l.href);
            return (
              <Link key={l.href} href={l.href} className={active ? "nav-link active" : "nav-link"} aria-current={active ? "page" : undefined}>
                {l.label}
                {l.href === "/review/" && due > 0 && <span className="badge" aria-label={`ถึงกำหนด ${due} หัวข้อ`}>{due}</span>}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
