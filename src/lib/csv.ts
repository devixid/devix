const FORMULA_PREFIX_CHARS = new Set(["=", "+", "-", "@", "\t", "\r"]);

function sanitizeCsvField(value: unknown): string {
  if (value === null || value === undefined) return "";

  let str = String(value);
  if (str.length > 0 && FORMULA_PREFIX_CHARS.has(str[0])) {
    str = `'${str}`;
  }

  if (/[",\n\r]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }

  return str;
}

export function toCsvRow(values: unknown[]): string {
  return values.map(sanitizeCsvField).join(",");
}

export function toCsvContent(headers: string[], rows: unknown[][]): string {
  const lines = [toCsvRow(headers), ...rows.map((row) => toCsvRow(row))];
  return `\uFEFF${lines.join("\r\n")}`;
}
