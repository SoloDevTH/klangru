"use client";

import { useEffect, useRef, useState } from "react";
import type { Problem } from "@klangru/schema";
import { ProblemCard } from "./ProblemCard";
import { dueQuestion, formatTime, youtubeId, type VideoQuestion } from "@/lib/video";

type YTPlayer = { getCurrentTime: () => number; pauseVideo: () => void; playVideo: () => void; destroy: () => void };
declare global {
  interface Window {
    YT?: { Player: new (el: HTMLElement, opts: object) => YTPlayer };
    onYouTubeIframeAPIReady?: () => void;
  }
}

function loadYouTubeApi(): Promise<void> {
  if (window.YT?.Player) return Promise.resolve();
  return new Promise((resolve) => {
    const prev = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      prev?.();
      resolve();
    };
    if (!document.querySelector('script[src="https://www.youtube.com/iframe_api"]')) {
      const s = document.createElement("script");
      s.src = "https://www.youtube.com/iframe_api";
      document.head.appendChild(s);
    }
  });
}

/**
 * วิดีโอที่หยุดถามคำถามตามเวลาที่กำหนด (แนวเดียวกับ H5P Interactive Video)
 * รองรับ YouTube (ต้องต่อเน็ต) และไฟล์ .mp4/.webm (ใส่ในแอปได้ ใช้ออฟไลน์)
 */
export function VideoBlock({ title, url, minutes, source, license, questions, problems }: { title: string; url: string; minutes: number; source?: string; license?: string; questions: VideoQuestion[]; problems: Problem[] }) {
  const [started, setStarted] = useState(false);
  const [answered, setAnswered] = useState<Set<string>>(new Set());
  const [asking, setAsking] = useState<VideoQuestion | null>(null);
  const box = useRef<HTMLDivElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const yt = useRef<YTPlayer | null>(null);
  const answeredRef = useRef(answered);
  answeredRef.current = answered;
  const ytId = youtubeId(url);

  const check = (time: number, pause: () => void) => {
    const q = dueQuestion(questions, time, answeredRef.current);
    if (q) {
      pause();
      setAsking(q);
    }
  };

  useEffect(() => {
    if (!started || !ytId || !box.current) return;
    let timer: ReturnType<typeof setInterval>;
    let alive = true;
    loadYouTubeApi().then(() => {
      if (!alive || !box.current) return;
      yt.current = new window.YT!.Player(box.current, { videoId: ytId, playerVars: { rel: 0, playsinline: 1, hl: "th" } });
      timer = setInterval(() => {
        const p = yt.current;
        if (p?.getCurrentTime) check(p.getCurrentTime(), () => p.pauseVideo());
      }, 500);
    });
    return () => {
      alive = false;
      clearInterval(timer);
      yt.current?.destroy();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [started, ytId]);

  const problem = asking ? problems.find((p) => p.id === asking.problem) : undefined;

  return (
    <aside className="media-card video">
      <p className="eyebrow">
        วิดีโอ · {minutes} นาที{questions.length ? ` · มีคำถามระหว่างดู ${questions.length} ข้อ` : ""}
      </p>
      <h3>{title}</h3>
      <div className="video-frame">
        {!started ? (
          <button type="button" className="btn primary" onClick={() => setStarted(true)}>
            เล่นวิดีโอ{ytId ? " (ต้องต่ออินเทอร์เน็ต)" : ""}
          </button>
        ) : ytId ? (
          <div ref={box} />
        ) : (
          <video ref={video} src={url} controls playsInline onTimeUpdate={(e) => check(e.currentTarget.currentTime, () => e.currentTarget.pause())} />
        )}
      </div>
      {asking && problem && (
        <div className="video-question">
          <p className="eyebrow">คำถามที่นาที {formatTime(asking.at)}</p>
          <ProblemCard
            problem={problem}
            doneLabel="ดูวิดีโอต่อ"
            onDone={() => {
              setAnswered((s) => new Set([...s, asking.problem]));
              setAsking(null);
              if (ytId) yt.current?.playVideo();
              else void video.current?.play();
            }}
          />
        </div>
      )}
      {(source || license) && <p className="small muted">{[source && `ที่มา: ${source}`, license && `ใบอนุญาต: ${license}`].filter(Boolean).join(" · ")}</p>}
    </aside>
  );
}
