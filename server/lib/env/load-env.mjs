import fs from "node:fs";
import path from "node:path";

const originalEnvKeys = new Set(Object.keys(process.env));
const envFiles = [".env", ".env.local"];

for (const fileName of envFiles) {
  const filePath = path.join(process.cwd(), fileName);

  if (!fs.existsSync(filePath)) {
    continue;
  }

  const entries = parseEnvFile(fs.readFileSync(filePath, "utf8"));

  for (const [key, value] of entries) {
    if (!originalEnvKeys.has(key)) {
      process.env[key] = value;
    }
  }
}

function parseEnvFile(raw) {
  const entries = [];

  for (const line of raw.replace(/^\uFEFF/, "").split(/\r?\n/)) {
    const trimmed = line.trim();

    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }

    const normalized = trimmed.startsWith("export ") ? trimmed.slice("export ".length).trim() : trimmed;
    const separatorIndex = normalized.indexOf("=");

    if (separatorIndex <= 0) {
      continue;
    }

    const key = normalized.slice(0, separatorIndex).trim();
    const value = parseEnvValue(normalized.slice(separatorIndex + 1).trim());

    if (/^[A-Za-z_][A-Za-z0-9_]*$/.test(key)) {
      entries.push([key, value]);
    }
  }

  return entries;
}

function parseEnvValue(value) {
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    return value.slice(1, -1);
  }

  const commentIndex = value.indexOf(" #");
  return commentIndex === -1 ? value : value.slice(0, commentIndex).trimEnd();
}
