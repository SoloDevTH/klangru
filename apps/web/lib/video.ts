/** ตรรกะคำถามระหว่างวิดีโอ (ฟังก์ชันบริสุทธิ์ ทดสอบได้) */
export interface VideoQuestion {
  at: number;
  problem: string;
}

/** คำถามที่ควรหยุดถาม ณ เวลาปัจจุบัน: ถึงเวลาแล้วและยังไม่ได้ตอบ (เลือกข้อแรกสุด) */
export function dueQuestion(questions: VideoQuestion[], time: number, answered: Set<string>): VideoQuestion | null {
  return [...questions].sort((a, b) => a.at - b.at).find((q) => time >= q.at && !answered.has(q.problem)) ?? null;
}

/** รหัสวิดีโอ YouTube จาก URL หรือ null ถ้าไม่ใช่ YouTube */
export function youtubeId(url: string): string | null {
  const m = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/);
  return m ? m[1] : null;
}

export const formatTime = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
