import { readdir, stat, readFile } from "node:fs/promises";
import { join } from "node:path";
import { gzipSync } from "node:zlib";

const CHUNKS_DIR = ".next/static/chunks";

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await walk(full)));
    } else if (entry.isFile() && entry.name.endsWith(".js")) {
      files.push(full);
    }
  }
  return files;
}

async function main() {
  const files = await walk(CHUNKS_DIR);
  const rows = [];

  for (const file of files) {
    const buf = await readFile(file);
    const gzip = gzipSync(buf).length;
    const { size } = await stat(file);
    rows.push({
      file: file.replace(`${CHUNKS_DIR}/`, ""),
      rawKb: (size / 1024).toFixed(1),
      gzipKb: (gzip / 1024).toFixed(1),
    });
  }

  rows.sort((a, b) => Number(b.gzipKb) - Number(a.gzipKb));

  console.log("Top 15 JS chunks by gzip size:\n");
  for (const row of rows.slice(0, 15)) {
    console.log(`${row.gzipKb} KB gzip\t${row.rawKb} KB raw\t${row.file}`);
  }

  const totalGzip = rows.reduce((sum, r) => sum + Number(r.gzipKb), 0);
  console.log(`\nTotal chunks gzip (approx): ${totalGzip.toFixed(1)} KB`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
