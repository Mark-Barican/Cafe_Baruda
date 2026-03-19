import fs from "node:fs/promises";
import path from "node:path";

const publicDir = path.join(process.cwd(), "public");

try {
  await fs.access(publicDir);
  await fs.rm(publicDir, { recursive: true, force: true });
  console.log("Removed previous generated public/ directory.");
} catch {
  // No existing public directory, nothing to clean.
}
