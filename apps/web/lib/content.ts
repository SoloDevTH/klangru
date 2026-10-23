import "server-only";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import type { ContentIndex, TopicPack } from "@klangru/schema";

// อ่าน content pack ตอน build (หน้าเว็บเป็น static ทั้งหมด)
const dir = join(process.cwd(), "public/content");

export function getIndex(): ContentIndex {
  return JSON.parse(readFileSync(join(dir, "index.json"), "utf8"));
}

export function getTopicPack(id: string): TopicPack {
  return JSON.parse(readFileSync(join(dir, "topics", `${id}.json`), "utf8"));
}
