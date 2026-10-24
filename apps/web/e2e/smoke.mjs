// ทดสอบแบบ end-to-end บนเว็บที่ build แล้ว (apps/web/out) ด้วย Playwright
// ใช้: node e2e/smoke.mjs [--shots <dir>]   (ต้องติดตั้ง playwright และ chromium)
import { createServer } from "node:http";
import { existsSync, mkdirSync, readFileSync, statSync } from "node:fs";
import { extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";

const require_ = await import("node:module").then((m) => m.createRequire(import.meta.url));
let chromium;
try {
  ({ chromium } = require_("playwright"));
} catch {
  ({ chromium } = await import(process.env.PLAYWRIGHT_MODULE ?? "/opt/node22/lib/node_modules/playwright/index.mjs"));
}

const root = fileURLToPath(new URL("../out", import.meta.url));
const shotsArg = process.argv.indexOf("--shots");
const shots = shotsArg > 0 ? process.argv[shotsArg + 1] : null;
if (shots) mkdirSync(shots, { recursive: true });

// เซิร์ฟเวอร์ static ขนาดเล็ก (รองรับ path ที่มีจุด เช่น /topic/math.number.integers/)
const TYPES = { ".html": "text/html; charset=utf-8", ".js": "text/javascript", ".css": "text/css", ".json": "application/json", ".woff2": "font/woff2", ".woff": "font/woff", ".svg": "image/svg+xml", ".sdf": "chemical/x-mdl-sdfile", ".txt": "text/plain", ".webmanifest": "application/manifest+json", ".png": "image/png" };
const server = createServer((req, res) => {
  let p = normalize(decodeURIComponent(new URL(req.url, "http://x").pathname)).replace(/^(\.\.[/\\])+/, "");
  let file = join(root, p);
  if (existsSync(file) && statSync(file).isDirectory()) file = join(file, "index.html");
  if (!existsSync(file)) {
    res.writeHead(404);
    return res.end("not found");
  }
  res.writeHead(200, { "Content-Type": TYPES[extname(file)] ?? "application/octet-stream" });
  res.end(readFileSync(file));
});
await new Promise((r) => server.listen(0, "127.0.0.1", r));
const base = `http://127.0.0.1:${server.address().port}`;
const pack = (id) => JSON.parse(readFileSync(join(root, "content/topics", `${id}.json`), "utf8"));
const index = JSON.parse(readFileSync(join(root, "content/index.json"), "utf8"));

const failures = [];
const step = async (name, fn) => {
  try {
    await fn();
    console.log(`✓ ${name}`);
  } catch (e) {
    failures.push(`${name}: ${e.message.split("\n")[0]}`);
    console.log(`✗ ${name}\n    ${e.message.split("\n")[0]}`);
  }
};
const expect = (cond, msg) => {
  if (!cond) throw new Error(msg);
};

const browser = await chromium.launch(existsSync("/opt/pw-browsers/chromium-1243/chrome-linux64/chrome") ? { executablePath: "/opt/pw-browsers/chromium-1243/chrome-linux64/chrome" } : {});
const ctx = await browser.newContext({ viewport: { width: 412, height: 900 }, deviceScaleFactor: 2, locale: "th-TH" });
const page = await ctx.newPage();
const errors = [];
page.on("pageerror", (e) => errors.push(`${page.url()}: ${e.message}`));
page.on("console", (m) => {
  if (m.type() === "error" && !/youtube|phet|Failed to load resource/i.test(m.text())) errors.push(`${page.url()}: ${m.text()}`);
});
const shot = async (name, fullPage = true) => shots && page.screenshot({ path: `${shots}/${name}.png`, fullPage });

/** ตั้งกลุ่มทดลองก่อนเปิดแอป */
const setVariant = (variant) =>
  page.evaluate((v) => {
    const k = "klangru.progress.v1";
    const p = JSON.parse(localStorage.getItem(k) ?? "null");
    if (p) {
      p.settings.variant = v;
      localStorage.setItem(k, JSON.stringify(p));
    }
  }, variant);

/** ตอบโจทย์ที่แสดงอยู่ให้ถูก (order/match ใช้ปุ่มดูเฉลย) */
async function answerCurrent(topicId, { wrongFirst = false } = {}) {
  const { problems } = pack(topicId);
  const card = page.locator(".problem[data-problem-id]").first();
  await card.waitFor();
  const id = await card.getAttribute("data-problem-id");
  const p = problems.find((q) => q.id === id);
  expect(p, `ไม่รู้จักโจทย์ ${id}`);
  const check = () => page.getByRole("button", { name: "ตรวจคำตอบ" }).click();
  if (wrongFirst && p.type === "numeric") {
    await page.locator(".problem input.input").fill(String(p.misconceptions?.[0]?.match ?? p.answer.value + 1));
    await check();
    await page.locator(".feedback.bad").waitFor();
  }
  if (p.type === "numeric") await page.locator(".problem input.input").fill(String(p.answer.value));
  else if (p.type === "text") await page.locator(".problem input.input").fill(p.accepted[0]);
  else if (p.type === "mcq") for (const [i, c] of p.choices.entries()) if (c.correct) await page.locator("label.choice").nth(i).click();
  else if (p.type === "expression") {
    const mf = page.locator("math-field");
    await mf.waitFor();
    await mf.evaluate((el, v) => {
      el.value = v;
      el.dispatchEvent(new Event("input", { bubbles: true }));
    }, p.answer.latex);
  }
  if (["numeric", "text", "mcq", "expression"].includes(p.type)) {
    await check();
    await page.locator(".feedback.ok").waitFor({ timeout: 10000 });
  } else {
    // กดตามจำนวนคำใบ้ที่รู้อยู่แล้ว และรอแต่ละข้อแสดงก่อน (ถ้านับปุ่มทันทีหลังคลิก อาจเจอปุ่มสุดท้ายที่กำลังจะหายแล้วรอกดจนหมดเวลา)
    for (let k = 1; k <= p.hints.length; k++) {
      await page.getByRole("button", { name: `ขอคำใบ้ (${k}/${p.hints.length})` }).click();
      await page.getByText(`คำใบ้ ${k}`, { exact: true }).waitFor();
    }
    await page.getByRole("button", { name: "ดูเฉลย" }).click();
  }
  return p;
}

async function playSession(topicId, opts = {}) {
  for (let n = 0; n < 30; n++) {
    if (await page.getByText(/จบรอบ/).count()) return n;
    await answerCurrent(topicId, n === 0 ? opts : {});
    await page.getByRole("button", { name: /ข้อต่อไป/ }).click();
    await page.waitForFunction(() => document.querySelector(".summary") || document.querySelector(".problem .stem"));
  }
  throw new Error("รอบฝึกไม่จบ");
}

const first = index.topics[0];

await step("หน้าแรก: แผนที่ความรู้ แถบเมนูล่าง วงแหวนเป้าหมาย", async () => {
  await page.goto(base + "/");
  await page.getByText("เรียนต่อ").waitFor();
  expect(await page.locator(".tabbar .nav-link").count() === 4, "ไม่มีแถบเมนูล่าง 4 ปุ่ม");
  expect(await page.locator(".goal").count() === 1, "ไม่มีวงแหวนเป้าหมาย");
  expect(await page.locator(".node").count() === index.topics.length, "จำนวนโหนดไม่ตรงกับจำนวนหัวข้อ");
  await shot("01-home");
});

await step("บทเรียน: เส้นจำนวน (JSXGraph) วาดได้", async () => {
  await page.goto(`${base}/topic/math.number.integers/`);
  await page.locator(".jxgbox svg").first().waitFor({ timeout: 15000 });
  await shot("02-lesson-integers");
});

await step("บทเรียน: กราฟฟังก์ชันขยับตามแถบเลื่อน", async () => {
  await page.goto(`${base}/topic/physics.kinematics.acceleration/`);
  const path = page.locator(".jxgbox svg path").first();
  await page.locator(".jxgbox svg").first().waitFor({ timeout: 15000 });
  const graph = page.locator('.widget path[stroke-width="3px"]').first();
  await graph.waitFor();
  const before = await graph.getAttribute("d");
  const slider = page.locator(".slider input").last();
  await slider.focus();
  for (let i = 0; i < 5; i++) await page.keyboard.press("ArrowRight");
  await page.waitForTimeout(300);
  expect((await graph.getAttribute("d")) !== before, "กราฟไม่เปลี่ยนเมื่อเลื่อนแถบ");
  void path;
  await shot("03-lesson-plot");
});

await step("ฝึกแบบปรับตามผู้เรียน (BKT): จบเมื่อชำนาญ ได้ระดับชำนาญ", async () => {
  await page.goto(`${base}/`);
  await setVariant("adaptive");
  await page.goto(`${base}/topic/${first.id}/practice/`);
  await page.getByText(/ไม่เกิน/).waitFor();
  const n = await playSession(first.id, { wrongFirst: true });
  expect(n <= 10, `ทำไป ${n} ข้อ เกินเพดาน 10`);
  await shot("04-adaptive-summary");
  const level = await page.locator(".summary strong").last().innerText();
  expect(["คุ้นเคย", "ชำนาญ"].includes(level), `ระดับหลังฝึก: ${level}`);
});

await step("ฝึกแบบเรียงตามลำดับ (กลุ่มเปรียบเทียบ) ทำครบทุกข้อ", async () => {
  await setVariant("fixed");
  const t = index.topics.find((x) => x.prerequisites.includes(first.id) && x.subject === first.subject) ?? index.topics[1];
  await page.goto(`${base}/topic/${t.id}/practice/`);
  await page.getByText(/ข้อ 1 จาก/).waitFor();
  const n = await playSession(t.id);
  expect(n === pack(t.id).problems.length, `ทำ ${n} จาก ${pack(t.id).problems.length} ข้อ`);
});

await step("โจทย์นิพจน์ (MathLive): พิมพ์จริงแล้วตรวจรูปที่เท่ากัน", async () => {
  await page.goto(`${base}/`);
  await setVariant("fixed");
  const t = "math.algebra.rearrange-formula";
  const { problems } = pack(t);
  const idx = problems.findIndex((p) => p.type === "expression");
  await page.goto(`${base}/topic/${t}/practice/`);
  for (let i = 0; i < idx; i++) {
    await answerCurrent(t);
    await page.getByRole("button", { name: /ข้อต่อไป/ }).click();
  }
  const mf = page.locator("math-field");
  await mf.waitFor({ timeout: 15000 });
  const p = problems[idx];
  // พิมพ์รูปที่เท่ากันแต่เขียนต่างจากเฉลย: คูณด้วย 1 ไว้ข้างหน้า
  await mf.evaluate((el, v) => {
    el.value = v;
    el.dispatchEvent(new Event("input", { bubbles: true }));
  }, `1\\cdot ${p.answer.latex}`);
  await page.getByRole("button", { name: "ตรวจคำตอบ" }).click();
  await page.locator(".feedback.ok").waitFor({ timeout: 10000 });
  await shot("05-expression", false);
});

await step("เขียนอักษรจีน: โหลดข้อมูลลำดับขีดจากในแอปได้", async () => {
  await page.goto(`${base}/`);
  await setVariant("fixed");
  const t = index.topics.find((x) => pack(x.id).problems.some((p) => p.type === "hanzi"));
  expect(t, "ไม่มีหัวข้อที่มีโจทย์เขียนอักษรจีน");
  const { problems } = pack(t.id);
  const idx = problems.findIndex((p) => p.type === "hanzi");
  await page.goto(`${base}/topic/${t.id}/practice/`);
  for (let i = 0; i < idx; i++) {
    await answerCurrent(t.id);
    await page.getByRole("button", { name: /ข้อต่อไป/ }).click();
  }
  const data = page.waitForResponse((r) => r.url().includes("/content/hanzi/"));
  await page.locator(".hanzi-box svg").first().waitFor({ timeout: 15000 });
  const res = await data;
  expect(res.ok() && /\/content\/hanzi\/[0-9a-f]+\.json$/.test(res.url()), `โหลด ${res.url()} ไม่ได้ (${res.status()})`);
  // ชื่อไฟล์ต้องเป็น ASCII เพื่อให้ build แอป Android ได้
  await page.waitForFunction(() => document.querySelectorAll(".hanzi-box svg path").length > 0, null, { timeout: 15000 });
});

await step("ค้นหาภาษาไทยเจอบทเรียน", async () => {
  await page.goto(`${base}/search/`);
  await page.locator("#search-q").fill("ความเร่ง");
  await page.locator(".search-results li").first().waitFor({ timeout: 10000 });
  expect((await page.locator(".search-results li").count()) > 0, "ไม่พบผลลัพธ์");
  await shot("06-search");
});

await step("หลักสูตรและอ่านเพิ่มเติม: แสดงในบทเรียน และค้นด้วยรหัสตัวชี้วัดได้", async () => {
  const t = index.topics.find((x) => pack(x.id).curriculum.length && pack(x.id).topic.references.length);
  expect(t, "ไม่มีหัวข้อที่มีทั้งตัวชี้วัดและแหล่งอ้างอิง");
  const { curriculum, topic } = pack(t.id);
  await page.goto(`${base}/topic/${t.id}/`);
  await page.getByRole("heading", { name: "อ่านเพิ่มเติม" }).waitFor();
  expect((await page.locator(".references a").count()) === topic.references.length, "จำนวนลิงก์อ่านเพิ่มเติมไม่ตรง");
  await page.locator(".curriculum summary").click();
  await page.getByText(curriculum[0].id, { exact: true }).first().waitFor();
  await page.goto(`${base}/search/`);
  await page.locator("#search-q").fill(curriculum[0].text.slice(0, 30));
  await page.locator(".search-results li", { hasText: "ตัวชี้วัด" }).first().waitFor({ timeout: 10000 });
});

await step("แบบทดสอบวัดระดับจบภายใน 8 ข้อ", async () => {
  await page.goto(`${base}/placement/`);
  await page.getByRole("button", { name: /วัดระดับ/ }).first().click();
  for (let i = 0; i < 9; i++) {
    if (await page.getByText("ผลการวัดระดับ").count()) break;
    await page.getByRole("button", { name: /ข้าม$/ }).click();
  }
  await page.getByText("ผลการวัดระดับ").waitFor();
  await shot("07-placement");
});

await step("ทบทวน: หัวข้อที่ถึงกำหนด และแฟลชการ์ด", async () => {
  await page.evaluate((id) => {
    const k = "klangru.progress.v1";
    const p = JSON.parse(localStorage.getItem(k));
    p.topics[id].card.due = new Date(Date.now() - 3600e3).toISOString();
    localStorage.setItem(k, JSON.stringify(p));
  }, first.id);
  await page.goto(`${base}/review/`);
  await page.getByText(/ถึงกำหนดวันนี้/).waitFor();
  await page.getByRole("tab", { name: /แฟลชการ์ด/ }).click();
  await page.getByRole("button", { name: "แสดงคำตอบ" }).click();
  await page.getByRole("button", { name: "จำได้" }).click();
  await shot("08-review");
});

await step("รายงานปัญหาโจทย์ (ออฟไลน์ → เก็บรอส่ง)", async () => {
  await page.goto(`${base}/topic/${first.id}/practice/`);
  await page.getByRole("button", { name: "รายงานปัญหา" }).click();
  await page.getByRole("button", { name: "ส่งรายงาน" }).click();
  await page.getByText(/บันทึกรายงานไว้|ส่งรายงานแล้ว/).waitFor();
});

await step("โน้ตบันทึกอัตโนมัติ", async () => {
  await page.goto(`${base}/topic/${first.id}/`);
  await page.locator(`#note-${first.id.replace(/\./g, "\\.")}`).fill("จำ: ลบจำนวนลบคือบวก");
  await page.getByText("บันทึกแล้ว").waitFor();
  const saved = await page.evaluate((id) => JSON.parse(localStorage.getItem("klangru.progress.v1")).notes[id].value, first.id);
  expect(saved === "จำ: ลบจำนวนลบคือบวก", "โน้ตไม่ถูกบันทึก");
});

await step("ความคืบหน้า: เปลี่ยนเป้าหมายรายวันแล้ววงแหวนตาม", async () => {
  await page.goto(`${base}/profile/`);
  await page.locator("#daily-goal").selectOption("20");
  await page.locator(".goal-text").getByText(/\/20$/).waitFor();
  expect(await page.getByRole("button", { name: "ส่งออก (xAPI)" }).count() === 1, "ไม่มีปุ่มส่งออก xAPI");
  await shot("09-profile");
});

await step("แดชบอร์ดคุณภาพเนื้อหา", async () => {
  await page.goto(`${base}/quality/`);
  expect((await page.locator("table.data").first().locator("tbody tr").count()) === index.topics.length, "จำนวนแถวไม่ตรงกับจำนวนหัวข้อ");
  // ตารางที่สอง: ความครอบคลุมเทียบกับหลักสูตร หนึ่งแถวต่อหนึ่งฉบับ
  expect((await page.locator("table.data").nth(1).locator("tbody tr").count()) === index.curriculum.length, "จำนวนหลักสูตรในตารางความครอบคลุมไม่ตรง");
});

await step("ทุกหน้าเปิดได้และไม่กว้างเกินจอมือถือ", async () => {
  const paths = ["/", "/search/", "/review/", "/profile/", "/placement/", "/quality/", ...index.topics.flatMap((t) => [`/topic/${t.id}/`, `/topic/${t.id}/practice/`])];
  const bad = [];
  for (const p of paths) {
    const res = await page.goto(base + p);
    if (!res.ok()) bad.push(`HTTP ${res.status()} ${p}`);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    if (overflow > 1 && p !== "/quality/") bad.push(`ล้นจอ ${overflow}px ${p}`);
  }
  expect(!bad.length, bad.slice(0, 5).join(" | "));
});

await step("ไม่มี error ใน console", async () => {
  expect(!errors.length, errors.slice(0, 3).join(" | "));
});

await browser.close();
server.close();
console.log(failures.length ? `\nล้มเหลว ${failures.length} รายการ` : "\nผ่านทั้งหมด");
process.exit(failures.length ? 1 : 0);
