import fs from "node:fs/promises";
import path from "node:path";
import Papa from "papaparse";
import * as XLSX from "xlsx";

type Row = Record<string, string>;

const RAW_DATA_DIR = path.join(process.cwd(), "data", "raw");

async function readCsvFile(filePath: string): Promise<Row[]> {
  const raw = await fs.readFile(filePath, "utf8");
  const parsed = Papa.parse<Row>(raw, {
    header: true,
    skipEmptyLines: true
  });

  if (parsed.errors.length > 0) {
    throw new Error(`Failed parsing CSV ${path.basename(filePath)}: ${parsed.errors[0]?.message}`);
  }

  return parsed.data;
}

async function readXlsxFile(filePath: string): Promise<Row[]> {
  const raw = await fs.readFile(filePath);
  const workbook = XLSX.read(raw, { type: "buffer" });
  const firstSheet = workbook.SheetNames[0];
  if (!firstSheet) {
    return [];
  }

  const worksheet = workbook.Sheets[firstSheet];
  return XLSX.utils.sheet_to_json<Row>(worksheet, {
    raw: false,
    defval: ""
  });
}

async function fileExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

export async function loadTabular(baseName: string): Promise<Row[]> {
  const csvPath = path.join(RAW_DATA_DIR, `${baseName}.csv`);
  const xlsxPath = path.join(RAW_DATA_DIR, `${baseName}.xlsx`);
  const xlsPath = path.join(RAW_DATA_DIR, `${baseName}.xls`);

  if (await fileExists(csvPath)) {
    return readCsvFile(csvPath);
  }
  if (await fileExists(xlsxPath)) {
    return readXlsxFile(xlsxPath);
  }
  if (await fileExists(xlsPath)) {
    return readXlsxFile(xlsPath);
  }

  throw new Error(`Missing data source for "${baseName}" in data/raw`);
}
