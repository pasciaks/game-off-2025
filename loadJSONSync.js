// loadJSONSync.js
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function loadJSONSync(filePath, baseDir = __dirname) {
  const resolvedPath = path.isAbsolute(filePath)
    ? filePath
    : path.join(baseDir, filePath);
  const data = fs.readFileSync(resolvedPath, 'utf8');
  return JSON.parse(data);
}
