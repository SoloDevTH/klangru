import type { Attempt, Progress } from "./progress-model.ts";

/**
 * ส่งออกประวัติการเรียนเป็น xAPI statements (มาตรฐาน ADL) เพื่อนำไปใช้กับ LMS หรือ LRS อื่น
 * actor ใช้รหัสบัญชีแบบไม่ระบุตัวตน ไม่ใส่อีเมล
 */
export const XAPI_BASE = "https://klangru.app/xapi";

const VERB = {
  answered: { id: "http://adlnet.gov/expapi/verbs/answered", display: { "th-TH": "ตอบ", "en-US": "answered" } },
  mastered: { id: "http://adlnet.gov/expapi/verbs/mastered", display: { "th-TH": "เชี่ยวชาญ", "en-US": "mastered" } },
  progressed: { id: "http://adlnet.gov/expapi/verbs/progressed", display: { "th-TH": "ก้าวหน้า", "en-US": "progressed" } },
};

export interface XapiStatement {
  id: string;
  actor: { objectType: "Agent"; account: { homePage: string; name: string } };
  verb: { id: string; display: Record<string, string> };
  object: { objectType: "Activity"; id: string; definition: { type: string } };
  result?: { success?: boolean; duration?: string; score?: { scaled: number }; extensions?: Record<string, unknown> };
  context?: { contextActivities?: { parent: { id: string }[] }; extensions?: Record<string, unknown> };
  timestamp: string;
}

const isoDuration = (ms: number) => `PT${(ms / 1000).toFixed(1)}S`;

/** UUID รูปแบบ v4 ที่ได้จากข้อความเดิมเสมอ (statement เดิมส่งซ้ำได้โดยไม่เกิดรายการซ้ำใน LRS) */
export function stableUuid(text: string): string {
  let hex = "";
  for (let seed = 0; hex.length < 32; seed++) {
    let h = 2166136261 ^ seed;
    for (const ch of text) h = Math.imul(h ^ ch.charCodeAt(0), 16777619);
    hex += (h >>> 0).toString(16).padStart(8, "0");
  }
  const v = hex.slice(0, 32).split("");
  v[12] = "4";
  v[16] = ((parseInt(v[16], 16) & 3) | 8).toString(16);
  const s = v.join("");
  return `${s.slice(0, 8)}-${s.slice(8, 12)}-${s.slice(12, 16)}-${s.slice(16, 20)}-${s.slice(20)}`;
}

function attemptStatement(a: Attempt, actor: XapiStatement["actor"]): XapiStatement {
  return {
    id: a.id,
    actor,
    verb: VERB.answered,
    object: { objectType: "Activity", id: `${XAPI_BASE}/problems/${a.problemId}`, definition: { type: "http://adlnet.gov/expapi/activities/cmi.interaction" } },
    result: {
      success: a.correct,
      ...(a.ms !== undefined ? { duration: isoDuration(a.ms) } : {}),
      extensions: { [`${XAPI_BASE}/ext/hints`]: a.hints, [`${XAPI_BASE}/ext/mode`]: a.mode },
    },
    context: { contextActivities: { parent: [{ id: `${XAPI_BASE}/topics/${a.topicId}` }] }, extensions: { [`${XAPI_BASE}/ext/variant`]: a.variant } },
    timestamp: a.at,
  };
}

export function toXapi(p: Progress, accountName: string): XapiStatement[] {
  const actor = { objectType: "Agent" as const, account: { homePage: "https://klangru.app", name: accountName } };
  const statements = p.attempts.map((a) => attemptStatement(a, actor));
  for (const [topicId, t] of Object.entries(p.topics)) {
    if (t.level === 0) continue;
    statements.push({
      id: stableUuid(`${topicId}:${t.level}:${t.updatedAt}`),
      actor,
      verb: t.level >= 3 ? VERB.mastered : VERB.progressed,
      object: { objectType: "Activity", id: `${XAPI_BASE}/topics/${topicId}`, definition: { type: "http://adlnet.gov/expapi/activities/lesson" } },
      result: { score: { scaled: t.level / 3 } },
      timestamp: t.updatedAt,
    });
  }
  return statements.sort((a, b) => a.timestamp.localeCompare(b.timestamp));
}
