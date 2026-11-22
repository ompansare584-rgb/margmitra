import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
export const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
export const data = JSON.parse(fs.readFileSync(path.join(root, "frontend/src/data/data.json"), "utf8"));
