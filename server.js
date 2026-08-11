// server.js - ESM compatible entry point for PM2 & Node
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const require = createRequire(import.meta.url);

const distServer = path.join(__dirname, 'dist', 'server.cjs');

if (fs.existsSync(distServer)) {
  require(distServer);
} else {
  console.error('❌ Lỗi: Không tìm thấy dist/server.cjs. Vui lòng chạy "npm run build" trước.');
  process.exit(1);
}
