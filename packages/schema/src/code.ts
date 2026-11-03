/**
 * ตัวรันโจทย์เขียนโค้ด Python (type: code)
 * ใช้ร่วมกันสองที่ให้ผลตรงกัน: แอปรันด้วย Pyodide ใน Web Worker และตัวตรวจเนื้อหารันด้วย python3 ในเครื่อง
 * โมดูลนี้ไม่ import อะไรเลย แอปจึงโหลดได้โดยไม่ดึง zod หรือตัวคำนวณสัญลักษณ์มาด้วย
 */

/** ผลการรันหนึ่งครั้ง (JSON ที่ _klangru_run คืนมา) */
export interface CodeRunResult {
  ok: boolean;
  /** ขั้นที่ล้ม: code = โค้ดของผู้เรียน, output = ข้อความที่พิมพ์ไม่ตรง, tests = ชุดทดสอบไม่ผ่าน */
  stage: "code" | "output" | "tests" | null;
  /** ชื่อ exception เช่น AssertionError, NameError */
  error: string | null;
  message: string | null;
  /** บรรทัดในโค้ดของผู้เรียนที่เกิดข้อผิดพลาด (ถ้ามี) */
  line: number | null;
  /** ข้อความที่ print ออกมา (รวม stderr) ตัดเมื่อยาวเกิน OUTPUT_LIMIT */
  stdout: string;
  truncated: boolean;
}

export const OUTPUT_LIMIT = 20000;
/** เวลาสูงสุดที่ให้โค้ดของผู้เรียนรันในแอป (ไม่นับเวลาโหลด Python ครั้งแรก) */
export const CODE_TIMEOUT_MS = 5000;

/**
 * โค้ด Python ที่นิยามฟังก์ชัน _klangru_run(code, tests, expected) -> str (JSON ของ CodeRunResult)
 * - รันโค้ดของผู้เรียนในเนมสเปซใหม่ แล้วรัน tests ต่อในเนมสเปซเดียวกัน
 * - เก็บ stdout/stderr ไว้เอง (จำกัดขนาด กันโปรแกรมพิมพ์ไม่รู้จบจนหน่วยความจำเต็ม)
 * - input() ได้ EOFError ทุกครั้ง เพราะไม่มีช่องให้พิมพ์ข้อมูลเข้า
 */
export const PYTHON_HARNESS = String.raw`
import io as _io, json as _json, sys as _sys, traceback as _tb

class _KlangruOut(_io.TextIOBase):
    def __init__(self):
        self.parts = []
        self.n = 0
        self.cut = False
    def writable(self):
        return True
    def write(self, s):
        s = str(s)
        room = ${OUTPUT_LIMIT} - self.n
        if room > 0:
            take = s[:room]
            self.parts.append(take)
            self.n += len(take)
        if len(s) > max(room, 0):
            self.cut = True
        return len(s)
    def value(self):
        return "".join(self.parts)

def _klangru_norm(s):
    return "\n".join(line.rstrip() for line in s.strip().splitlines())

def _klangru_run(code, tests="", expected=None):
    ns = {"__name__": "__main__"}
    out = _KlangruOut()
    res = {"ok": True, "stage": None, "error": None, "message": None, "line": None}

    def fail(stage, e):
        line = None
        if isinstance(e, SyntaxError) and e.filename == "<code>":
            line = e.lineno
        for f in _tb.extract_tb(e.__traceback__):
            if f.filename == "<code>":
                line = f.lineno
        msg = e.msg if isinstance(e, SyntaxError) else str(e)
        res.update(ok=False, stage=stage, error=type(e).__name__, message=msg, line=line)

    def run(src, name, stage):
        try:
            exec(compile(src, name, "exec"), ns)
        except SystemExit as e:
            if e.code not in (None, 0):
                fail(stage, e)
        except BaseException as e:
            fail(stage, e)

    saved = (_sys.stdout, _sys.stderr, _sys.stdin)
    _sys.stdout = _sys.stderr = out
    _sys.stdin = _io.StringIO("")
    try:
        run(code, "<code>", "code")
        if res["ok"] and expected is not None and _klangru_norm(out.value()) != _klangru_norm(expected):
            res.update(ok=False, stage="output")
        if res["ok"] and tests.strip():
            run(tests, "<tests>", "tests")
    finally:
        _sys.stdout, _sys.stderr, _sys.stdin = saved
    res["stdout"] = out.value()
    res["truncated"] = out.cut
    return _json.dumps(res, ensure_ascii=False)
`;

/** สคริปต์สำหรับ python3 ในเครื่อง: อ่าน {code, tests, expected} จาก stdin แล้วพิมพ์ผลเป็น JSON */
export const PYTHON_CLI = `${PYTHON_HARNESS}
_d = _json.load(_sys.stdin)
print(_klangru_run(_d["code"], _d.get("tests") or "", _d.get("expected")))
`;
