/* Web Worker ที่รันโค้ด Python ของผู้เรียนด้วย Pyodide (โหลดจากไฟล์ในแอป /pyodide/<รุ่น>/ จึงใช้ออฟไลน์ได้)
 * ข้อความเข้า:  {id, type: "init", indexURL, harness}  โหลด Pyodide และนิยาม _klangru_run (จาก PYTHON_HARNESS)
 *               {id, type: "run", code, tests, expected}  รันแล้วตอบ {id, ok: true, result}
 * ถ้าโค้ดวนไม่รู้จบ หน้าเว็บจะ terminate worker นี้ทิ้งแล้วสร้างใหม่ (lib/python.ts)
 */
let pyodide = null;

self.onmessage = async (event) => {
  const { id, type } = event.data ?? {};
  try {
    if (type === "init") {
      if (!pyodide) {
        importScripts(event.data.indexURL + "pyodide.js");
        pyodide = await self.loadPyodide({ indexURL: event.data.indexURL, stdout: () => {}, stderr: () => {} });
        pyodide.runPython(event.data.harness);
      }
      self.postMessage({ id, ok: true });
    } else if (type === "run") {
      const run = pyodide.globals.get("_klangru_run");
      try {
        // undefined แปลงเป็น None ใน Python (null จะกลายเป็น JsNull)
        const json = run(event.data.code, event.data.tests ?? "", event.data.expected ?? undefined);
        self.postMessage({ id, ok: true, result: JSON.parse(json) });
      } finally {
        run.destroy();
      }
    }
  } catch (err) {
    self.postMessage({ id, ok: false, error: String((err && err.message) || err) });
  }
};
