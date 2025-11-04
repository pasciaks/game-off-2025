// loadTXTSync.js
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function loadTXTSync(filePath, baseDir = __dirname) {
  const resolvedPath = path.isAbsolute(filePath)
    ? filePath
    : path.join(baseDir, filePath);

  const data = fs.readFileSync(resolvedPath, 'utf8');

  console.log("loading...");

  console.log(data);

  // Split on newlines, trim whitespace, and remove empty lines
  const lines = data
    .split(/\r?\n/)
    .map(line => line.trim())
    .filter(line => line.length > 0);

  return lines;
}
