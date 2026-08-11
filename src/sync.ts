import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import AdmZip from 'adm-zip';
import { fileURLToPath } from 'url';
import { Request, Response } from 'express';
import db from './db.js';

const _dirname = typeof __dirname !== 'undefined' ? __dirname : process.cwd();

export async function triggerSync(type: string, overrideUrl?: string) {
  const targetUrl = overrideUrl || process.env.SYNC_TARGET_URL;
  if (!targetUrl) {
    throw new Error('Chưa cấu hình URL đích. Vui lòng nhập link ngrok vào ô URL!');
  }

  const results = { code: false, db: false };

  const cleanTargetUrl = targetUrl.replace(/\/$/, '');

  if (type === 'db' || type === 'both') {
    console.log('[Sync] Bắt đầu đồng bộ Database...');
    const dbPath = path.resolve(_dirname, '../nutritrack.db');
    if (!fs.existsSync(dbPath)) {
      throw new Error('Không tìm thấy file database nutritrack.db để đồng bộ');
    }

    const dbBuffer = fs.readFileSync(dbPath);
    console.log(`[Sync] Đang gửi database (${dbBuffer.length} bytes) tới PC (${cleanTargetUrl})...`);

    try {
      const response = await fetch(`${cleanTargetUrl}/api/sync/receive-db`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/octet-stream',
          'ngrok-skip-browser-warning': 'true',
          'User-Agent': 'NutriTrackSyncClient/1.0',
        },
        body: dbBuffer
      });

      if (!response.ok) {
        const errMsg = await response.text();
        throw new Error(`Máy PC phản hồi lỗi (${response.status}): ${errMsg}`);
      }
      console.log('[Sync] Đồng bộ Database thành công!');
      results.db = true;
    } catch (err: any) {
      const cause = err.cause ? ` [${err.cause.code || err.cause.message || err.cause}]` : '';
      throw new Error(`Không thể kết nối đến Ngrok máy PC (${cleanTargetUrl}): ${err.message}${cause}. Vui lòng kiểm tra xem máy PC đã mở Ngrok và PM2 chưa.`);
    }
  }

  if (type === 'code' || type === 'both') {
    // 500ms delay to let server finish saving DB cleanly before sending Zip
    await new Promise(r => setTimeout(r, 500));

    console.log('[Sync] Bắt đầu nén mã nguồn...');
    const projectDir = path.resolve(_dirname, '..');
    const zip = new AdmZip();

    const IGNORE_DIRS = ['node_modules', '.git', 'dist', '.tempmediaStorage', 'artifacts', 'scratch', '.gemini', '.vscode'];

    const files = fs.readdirSync(projectDir);
    files.forEach(file => {
      const fullPath = path.join(projectDir, file);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory()) {
        if (!IGNORE_DIRS.includes(file)) {
          zip.addLocalFolder(fullPath, file);
        }
      } else {
        if (file !== 'nutritrack.db' && file !== 'nutritrack.db-journal' && file !== '.env' && !file.endsWith('.zip')) {
          zip.addLocalFile(fullPath);
        }
      }
    });

    const zipBuffer = zip.toBuffer();
    console.log(`[Sync] Nén code thành công (${zipBuffer.length} bytes). Đang gửi tới PC...`);

    try {
      const response = await fetch(`${cleanTargetUrl}/api/sync/receive-code`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/octet-stream',
          'Content-Length': String(zipBuffer.length),
          'ngrok-skip-browser-warning': 'true',
          'User-Agent': 'NutriTrackSyncClient/1.0',
        },
        body: zipBuffer
      });

      if (!response.ok) {
        const errMsg = await response.text();
        throw new Error(`Máy PC phản hồi lỗi code (${response.status}): ${errMsg}`);
      }
      console.log('[Sync] Đồng bộ Code thành công!');
      results.code = true;
    } catch (err: any) {
      const cause = err.cause ? ` [${err.cause.code || err.cause.message || err.cause}]` : '';
      throw new Error(`Không thể truyền mã nguồn đến Ngrok máy PC (${cleanTargetUrl}): ${err.message}${cause}`);
    }
  }

  return results;
}

export function receiveDb(req: Request, res: Response) {
  console.log('[Sync] Nhận yêu cầu đồng bộ Database từ Laptop...');
  const dbPath = path.resolve(_dirname, '../nutritrack.db');
  const dbBakPath = path.resolve(_dirname, '../nutritrack.db.bak');

  try {
    const dataBuffer = Buffer.isBuffer(req.body) ? req.body : Buffer.from(req.body || '');
    if (!dataBuffer || dataBuffer.length === 0) {
      return res.status(400).send('Dữ liệu database gửi lên bị rỗng');
    }

    if (fs.existsSync(dbPath)) {
      fs.copyFileSync(dbPath, dbBakPath);
      console.log('[Sync] Đã sao lưu database cũ thành nutritrack.db.bak');
    }

    fs.writeFileSync(dbPath, dataBuffer);
    console.log(`[Sync] Đã cập nhật xong file nutritrack.db (${dataBuffer.length} bytes).`);
    res.send('Database synchronized successfully.');
  } catch (writeErr: any) {
    console.error('[Sync] Lỗi ghi file database:', writeErr.message);
    res.status(500).send(`Lỗi ghi database: ${writeErr.message}`);
  }
}

export function receiveCode(req: Request, res: Response) {
  console.log('[Sync] Nhận yêu cầu đồng bộ Code từ Laptop...');
  const zipPath = path.resolve(_dirname, '../update.zip');
  const projectDir = path.resolve(_dirname, '..');

  try {
    const dataBuffer = Buffer.isBuffer(req.body) ? req.body : Buffer.from(req.body || '');
    if (!dataBuffer || dataBuffer.length < 100) {
      return res.status(400).send(`File zip nhận được bị rỗng hoặc lỗi (${dataBuffer?.length || 0} bytes)`);
    }

    fs.writeFileSync(zipPath, dataBuffer);
    console.log(`[Sync] Tải file code update.zip thành công (${dataBuffer.length} bytes). Phản hồi OK & giải nén...`);

    // Gửi phản hồi HTTP 200 thành công ngay lập tức để tránh Ngrok timeout (ERR_NGROK_3004)
    res.send('Code received successfully. Extracting & restarting server...');

    // Tiến hành giải nén và khởi động lại sau 200ms
    setTimeout(() => {
      try {
        const zip = new AdmZip(zipPath);
        zip.extractAllTo(projectDir, true);
        if (fs.existsSync(zipPath)) {
          fs.unlinkSync(zipPath);
        }
        console.log('[Sync] Giải nén thành công! Đang build lại và khởi động lại server...');
        exec('npm run build', { cwd: projectDir }, (buildErr) => {
          if (buildErr) {
            console.error('[Sync] Lỗi npm run build trên PC:', buildErr.message);
          }
          console.log('[Sync] Build hoàn tất. Restarting PM2...');
          process.exit(0);
        });
      } catch (extractErr: any) {
        console.error('[Sync] Lỗi giải nén update.zip:', extractErr.message);
      }
    }, 200);
  } catch (err: any) {
    console.error('[Sync] Lỗi ghi file update.zip:', err.message);
    if (!res.headersSent) {
      res.status(500).send(`Lỗi nhận file zip: ${err.message}`);
    }
  }
}
