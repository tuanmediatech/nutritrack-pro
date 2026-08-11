// server.cjs - CommonJS entry point for PM2 & Node
const path = require('path');
const fs = require('fs');

const distServer = path.join(__dirname, 'dist', 'server.cjs');

if (fs.existsSync(distServer)) {
  require(distServer);
} else {
  console.error('❌ Lỗi: Không tìm thấy dist/server.cjs. Vui lòng chạy "npm run build" trước.');
  process.exit(1);
}
