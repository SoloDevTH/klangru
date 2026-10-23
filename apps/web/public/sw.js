/* Service worker ของคลังรู้ (เวอร์ชันเว็บ): ใช้งานออฟไลน์ได้
 * - ติดตั้ง: แคชหน้าหลักและดัชนีเนื้อหา (shell)
 * - หน้าเว็บ: ลองเน็ตก่อน ถ้าไม่ได้ใช้ของในแคช
 * - โค้ด ฟอนต์ เนื้อหา: ใช้ของในแคชก่อน แล้วอัปเดตเบื้องหลัง
 * - ข้อความ {type:"download", urls}: ดาวน์โหลดเนื้อหาทั้งวิชาไว้ล่วงหน้า
 */
const PREFIX = "klangru-";
let VERSION = "v0";

async function manifest() {
  const res = await fetch("/offline-manifest.json", { cache: "no-store" });
  return res.json();
}

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const m = await manifest();
      VERSION = m.version;
      const cache = await caches.open(PREFIX + m.version);
      await cache.addAll(m.shell);
      await self.skipWaiting();
    })(),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const m = await manifest().catch(() => null);
      if (m) VERSION = m.version;
      const names = await caches.keys();
      // เก็บเนื้อหาที่ดาวน์โหลดไว้ (ไม่ขึ้นกับเวอร์ชัน) ลบเฉพาะ shell เวอร์ชันเก่า
      await Promise.all(names.filter((n) => n.startsWith(PREFIX) && n !== PREFIX + VERSION && n !== PREFIX + "content").map((n) => caches.delete(n)));
      await self.clients.claim();
    })(),
  );
});

const isRsc = (url) => url.searchParams.has("_rsc") || url.pathname.endsWith(".txt");
const stripQuery = (req) => new Request(new URL(req.url).pathname, { headers: req.headers });

self.addEventListener("fetch", (event) => {
  const req = event.request;
  const url = new URL(req.url);
  if (req.method !== "GET" || url.origin !== self.location.origin) return;

  // ข้อมูลนำทางของ Next: ถ้าออฟไลน์และไม่มีในแคช ตอบ 404 ให้ Next โหลดหน้า HTML (ซึ่งแคชไว้) แทน
  if (isRsc(url)) {
    event.respondWith(
      (async () => {
        try {
          const res = await fetch(req);
          if (res.ok) (await caches.open(PREFIX + "content")).put(stripQuery(req), res.clone());
          return res;
        } catch {
          return (await caches.match(stripQuery(req))) ?? new Response("offline", { status: 404 });
        }
      })(),
    );
    return;
  }

  if (req.mode === "navigate") {
    event.respondWith(
      (async () => {
        try {
          const res = await fetch(req);
          if (res.ok) (await caches.open(PREFIX + "content")).put(url.pathname, res.clone());
          return res;
        } catch {
          return (await caches.match(url.pathname)) ?? (await caches.match("/")) ?? new Response("ออฟไลน์", { status: 503, headers: { "Content-Type": "text/plain; charset=utf-8" } });
        }
      })(),
    );
    return;
  }

  // โค้ด ฟอนต์ เนื้อหา: แคชก่อน อัปเดตเบื้องหลัง
  event.respondWith(
    (async () => {
      const cached = await caches.match(req);
      const network = fetch(req)
        .then(async (res) => {
          if (res.ok) (await caches.open(url.pathname.startsWith("/_next/static/") ? PREFIX + VERSION : PREFIX + "content")).put(req, res.clone());
          return res;
        })
        .catch(() => cached);
      return cached ?? network;
    })(),
  );
});

self.addEventListener("message", (event) => {
  const { type, urls, id } = event.data ?? {};
  if (type !== "download") return;
  event.waitUntil(
    (async () => {
      const cache = await caches.open(PREFIX + "content");
      let done = 0;
      const report = (msg) => event.source?.postMessage({ type: "download-progress", id, done, total: urls.length, ...msg });
      for (let i = 0; i < urls.length; i += 6) {
        await Promise.all(
          urls.slice(i, i + 6).map(async (u) => {
            try {
              if (!(await cache.match(u))) await cache.add(u);
            } catch {
              // ข้ามไฟล์ที่โหลดไม่ได้ แล้วรายงานจำนวนที่สำเร็จ
            }
            done++;
          }),
        );
        report({});
      }
      report({ finished: true });
    })(),
  );
});
