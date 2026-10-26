import fs from "node:fs";
import YAML from "yaml";
import { evaluateLatex, equivalentLatex } from "@klangru/schema";
for (const f of process.argv.slice(2)) {
  const d = YAML.parse(fs.readFileSync(f, "utf8"));
  for (const p of d.problems) {
    if (p.type !== "expression") continue;
    const vars = Object.fromEntries((p.answer.variables ?? []).map((v: string, k: number) => [v, 1.7 + k]));
    const val = evaluateLatex(p.answer.latex, vars);
    const mis = (p.misconceptions ?? []).map((m: any) => `${m.match}=${evaluateLatex(m.match, vars)?.toFixed(5)}${equivalentLatex(m.match, p.answer.latex, p.answer.variables ?? []) ? " EQUIV!" : ""}`);
    console.log(p.id, p.answer.latex, JSON.stringify(vars), val?.toFixed(6), "|", mis.join("  "));
  }
}
