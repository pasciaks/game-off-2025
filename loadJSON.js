// loadJSON.js
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Loads and parses a local JSON file relative to this module or a given directory.
 * @param {string} filePath - Path to the JSON file (relative or absolute).
 * @param {string} [baseDir=__dirname] - Base directory for relative paths.
 * @returns {Promise<any>} Parsed JSON data.
 */
export async function loadJSON(filePath, baseDir = __dirname) {
  const resolvedPath = path.isAbsolute(filePath)
    ? filePath
    : path.join(baseDir, filePath);

  const data = await fs.promises.readFile(resolvedPath, 'utf8');
  return JSON.parse(data);
}
