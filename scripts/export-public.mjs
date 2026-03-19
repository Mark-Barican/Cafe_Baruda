import fs from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const outDir = path.join(root, "out");
const publicDir = path.join(root, "public");

async function exists(target) {
  try {
    await fs.access(target);
    return true;
  } catch {
    return false;
  }
}

async function copyRecursive(src, dest) {
  await fs.mkdir(dest, { recursive: true });
  const entries = await fs.readdir(src, { withFileTypes: true });

  for (const entry of entries) {
    const from = path.join(src, entry.name);
    const to = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      await copyRecursive(from, to);
    } else {
      await fs.copyFile(from, to);
    }
  }
}

if (!(await exists(outDir))) {
  throw new Error("Missing 'out' directory after Next.js build.");
}

if (await exists(publicDir)) {
  await fs.rm(publicDir, { recursive: true, force: true });
}

await copyRecursive(outDir, publicDir);
console.log("Static site exported to public/");
