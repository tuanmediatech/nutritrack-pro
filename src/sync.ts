import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import AdmZip from 'adm-zip';
import { fileURLToPath } from 'url';
import { Request, Response } from 'express';
import db from './db.js';

const getProjectDir = () => {
  if (typeof __dirname !== 'undefined') {
    if (__dirname.endsWith('dist') || __dirname.endsWith('src')) {
      return path.resolve(__dirname, '..');
    }
    return __dirname;
  }
  return process.cwd();
};

export async function triggerSync(type: string, overrideUrl?: string, mode: string = 'push') {
  const targetUrl = overrideUrl || process.env.SYNC_TARGET_URL;
  if (!targetUrl) {
    throw new Error('Chưa cấu hình URL đích. Vui lòng nhập link ngrok vào ô URL!');
  }

  const results = { code: false, db: false };
  const cleanTargetUrl = targetUrl.replace(/\/$/, '');
  const projectDir = getProjectDir();
  const dbPath = path.join(projectDir, 'nutritrack.db');

  if (type === 'db' || type === 'both') {
    console.log(`[Sync] Bắt đầu đồng bộ Database (Hướng/Chế độ: ${mode.toUpperCase()})...`);
    if (!fs.existsSync(dbPath)) {
      throw new Error('Không tìm thấy file database nutritrack.db để đồng bộ');
    }

    if (mode === 'pull') {
      console.log(`[Sync] Đang tải database từ PC (${cleanTargetUrl})...`);
      const response = await fetch(`${cleanTargetUrl}/api/sync/export-db`, {
        method: 'GET',
        headers: {
          'ngrok-skip-browser-warning': 'true',
          'User-Agent': 'NutriTrackSyncClient/1.0',
        }
      });

      if (!response.ok) {
        const errMsg = await response.text();
        throw new Error(`Lỗi tải DB từ PC (${response.status}): ${errMsg}`);
      }

      const arrayBuf = await response.arrayBuffer();
      const pcDbBuf = Buffer.from(arrayBuf);
      if (!pcDbBuf || pcDbBuf.length === 0) {
        throw new Error('Database nhận từ PC bị rỗng');
      }

      fs.writeFileSync(dbPath, pcDbBuf);
      console.log(`[Sync] Đã tải và ghi đè database từ PC về Laptop thành công (${pcDbBuf.length} bytes)!`);
      results.db = true;
    } else {
      const dbBuffer = fs.readFileSync(dbPath);
      console.log(`[Sync] Đang gửi database (${dbBuffer.length} bytes) tới PC (${cleanTargetUrl}) - Mode: ${mode}...`);

      const response = await fetch(`${cleanTargetUrl}/api/sync/receive-db`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/octet-stream',
          'x-sync-mode': mode,
          'ngrok-skip-browser-warning': 'true',
          'User-Agent': 'NutriTrackSyncClient/1.0',
        },
        body: dbBuffer
      });

      if (!response.ok) {
        const errMsg = await response.text();
        throw new Error(`Máy PC phản hồi lỗi (${response.status}): ${errMsg}`);
      }

      if (mode === 'merge') {
        const contentType = response.headers.get('content-type') || '';
        if (contentType.includes('application/octet-stream')) {
          const arrayBuf = await response.arrayBuffer();
          const mergedBuf = Buffer.from(arrayBuf);
          if (mergedBuf.length > 0) {
            fs.writeFileSync(dbPath, mergedBuf);
            console.log(`[Sync] Đã cập nhật DB hợp nhất 2 chiều từ PC về Laptop (${mergedBuf.length} bytes)!`);
          }
        }
      }

      console.log(`[Sync] Đồng bộ Database (${mode}) thành công!`);
      results.db = true;
    }
  }

  if (type === 'code' || type === 'both') {
    // 2000ms delay to let server finish saving DB cleanly before sending Zip
    await new Promise(r => setTimeout(r, 2000));

    console.log('[Sync] Bắt đầu nén mã nguồn...');
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

    let attempts = 0;
    const maxAttempts = 3;
    let lastError: any = null;

    while (attempts < maxAttempts) {
      attempts++;
      try {
        if (attempts > 1) {
          console.log(`[Sync] Thử lại gửi mã nguồn lần ${attempts}/${maxAttempts} sau khi chờ Ngrok sẵng sàng...`);
          await new Promise(r => setTimeout(r, 2000));
        }

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
          if (response.status === 503 && attempts < maxAttempts) {
            console.warn(`[Sync] Máy PC phản hồi 503 (Ngrok chưa sẵn sàng), đang thử lại...`);
            continue;
          }
          throw new Error(`Máy PC phản hồi lỗi code (${response.status}): ${errMsg}`);
        }

        console.log('[Sync] Đồng bộ Code thành công!');
        results.code = true;
        break;
      } catch (err: any) {
        lastError = err;
        if (attempts >= maxAttempts) {
          const cause = err.cause ? ` [${err.cause.code || err.cause.message || err.cause}]` : '';
          throw new Error(`Không thể truyền mã nguồn đến Ngrok máy PC (${cleanTargetUrl}): ${err.message}${cause}`);
        }
      }
    }
  }

  return results;
}

export function receiveDb(req: Request, res: Response) {
  console.log('[Sync] Nhận yêu cầu đồng bộ Database từ Laptop...');
  const projectDir = getProjectDir();
  const dbPath = path.join(projectDir, 'nutritrack.db');
  const tempIncomingPath = path.join(projectDir, 'temp_incoming.db');
  const dbBakPath = path.join(projectDir, 'nutritrack.db.bak');

  const mode = (req.headers['x-sync-mode'] as string) || 'push';

  try {
    const dataBuffer = Buffer.isBuffer(req.body) ? req.body : Buffer.from(req.body || '');
    if (!dataBuffer || dataBuffer.length === 0) {
      return res.status(400).send('Dữ liệu database gửi lên bị rỗng');
    }

    if (fs.existsSync(dbPath)) {
      fs.copyFileSync(dbPath, dbBakPath);
    }

    if (mode === 'push') {
      fs.writeFileSync(dbPath, dataBuffer);
      console.log(`[Sync] Đã cập nhật xong (Ghi đè Laptop -> PC) nutritrack.db (${dataBuffer.length} bytes).`);
      return res.send('Database synchronized (push mode) successfully.');
    }

    // mode === 'merge'
    fs.writeFileSync(tempIncomingPath, dataBuffer);

    db.serialize(() => {
      db.run(`ATTACH DATABASE ? AS temp_incoming`, [tempIncomingPath], (attachErr) => {
        if (attachErr) {
          console.log('[Sync] Lỗi ATTACH DB, ghi đè trực tiếp:', attachErr.message);
          fs.writeFileSync(dbPath, dataBuffer);
          if (fs.existsSync(tempIncomingPath)) {
            try { fs.unlinkSync(tempIncomingPath); } catch (e) {}
          }
          const mergedBuffer = fs.readFileSync(dbPath);
          res.setHeader('Content-Type', 'application/octet-stream');
          return res.send(mergedBuffer);
        }

        const tables = ['health_records', 'logs', 'weight_logs', 'checklist_logs', 'notes', 'ai_schedules'];
        tables.forEach((tbl) => {
          db.run(`INSERT OR IGNORE INTO ${tbl} SELECT * FROM temp_incoming.${tbl}`, () => {});
        });

        db.run(`DETACH DATABASE temp_incoming`, () => {
          if (fs.existsSync(tempIncomingPath)) {
            try { fs.unlinkSync(tempIncomingPath); } catch (e) {}
          }
          console.log('[Sync] Đã gộp 2 chiều (Merge 2-Way) thành công!');
          const mergedBuffer = fs.readFileSync(dbPath);
          res.setHeader('Content-Type', 'application/octet-stream');
          res.send(mergedBuffer);
        });
      });
    });
  } catch (writeErr: any) {
    console.error('[Sync] Lỗi ghi file database:', writeErr.message);
    res.status(500).send(`Lỗi ghi database: ${writeErr.message}`);
  }
}

export function exportDb(_req: Request, res: Response) {
  console.log('[Sync] Máy Laptop yêu cầu xuất database từ PC (export-db)...');
  const projectDir = getProjectDir();
  const dbPath = path.join(projectDir, 'nutritrack.db');
  if (!fs.existsSync(dbPath)) {
    return res.status(404).send('Không tìm thấy file nutritrack.db trên PC');
  }
  const dbBuffer = fs.readFileSync(dbPath);
  res.setHeader('Content-Type', 'application/octet-stream');
  res.send(dbBuffer);
}

export function receiveCode(req: Request, res: Response) {
  console.log('[Sync] Nhận yêu cầu đồng bộ Code từ Laptop...');
  const projectDir = getProjectDir();
  const zipPath = path.join(projectDir, 'update.zip');

  try {
    const dataBuffer = Buffer.isBuffer(req.body) ? req.body : Buffer.from(req.body || '');
    if (!dataBuffer || dataBuffer.length < 100) {
      return res.status(400).send(`File zip nhận được bị rỗng hoặc lỗi (${dataBuffer?.length || 0} bytes)`);
    }

    fs.writeFileSync(zipPath, dataBuffer);
    console.log(`[Sync] Tải file code update.zip thành công (${dataBuffer.length} bytes). Phản hồi OK & giải nén...`);

    // Gửi phản hồi HTTP 200 thành công ngay lập tức và flush socket để tránh Ngrok ERR_NGROK_3004
    res.status(200).send('Code received successfully. Extracting & restarting server...');

    // Tiến hành giải nén và khởi động lại sau 1500ms để đảm bảo socket HTTP kết thúc hoàn toàn
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
    }, 1500);
  } catch (err: any) {
    console.error('[Sync] Lỗi ghi file update.zip:', err.message);
    if (!res.headersSent) {
      res.status(500).send(`Lỗi nhận file zip: ${err.message}`);
    }
  }
}
