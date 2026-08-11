# 📘 TÀI LIỆU KỸ THUẬT & HƯỚNG DẪN TRIỂN KHAI NUTRITRACK PRO

---

## 📌 1. TỔNG QUAN DỰ ÁN & BÀI TOÁN TRIỂN KHAI

### 🎯 1.1. Mục Tiêu Hệ Thống
**NutriTrack Pro** là ứng dụng trợ lý dinh dưỡng và sức khỏe cá nhân hóa, thiết kế cho chế độ **Tăng cân sạch & Thể thao (Bóng bàn / Pickleball)**. Hệ thống giúp người dùng duy trì kỷ luật bản thân thông qua quy trình **Nhắc nhở qua Email ➔ Tích chọn 1-chạm ➔ Báo cáo cải thiện theo tuần**.

### 🔄 1.2. Quy Trình Vận Hành Tự Động (Routine Workflow)
1. **16 Mốc Nhắc Nhở Hằng Ngày (Email Notifications)**:
   * **7 Mốc Bữa Ăn & Sữa Vinamilk**: 06:30, 09:30, 11:45, 15:30, 16:30, 19:30, 22:00. *(Đặc biệt tích hợp thói quen uống 1 bịch Sữa tươi Vinamilk Nguyên chất 220ml vào Bữa sáng, Bữa phụ chiều & Trước khi ngủ)*.
   * **6 Mốc Uống Nước**: 06:00 (300ml nước ấm), 08:30 (250ml), 10:30 (250ml), 14:30 (250ml), 16:00 (250ml), 21:00 (250ml).
   * **3 Mốc Tập Luyện & Phục Hồi**: 12:30 (Chợp mắt nghỉ trưa), 17:00 (Tập Pickleball/Bóng bàn 17h–19h), 22:30 (Đi ngủ trước 23h).
2. **Bảng Kiểm 1-Chạm Khớp 1-đến-1**: Ngay khi nhận Email, người dùng mở app và tích ô tương ứng tại **Bảng kiểm hằng ngày**.
3. **Báo Cáo Tổng Kết Tuần (Weekly Summary Email)**: Tự động gửi vào **Tối Chủ Nhật lúc 20:00**, phân tích 2 hạng mục:
   * 🌟 **Việc đã hoàn thành tốt** (Độ kỷ luật ăn uống, tập luyện, lượng nước).
   * 💡 **Việc cần cải thiện** (Nhắc nhở bổ sung calo/nước nếu bỏ sót trong tuần).

---

## 🛠️ 2. CÔNG NGHỆ & KIẾN TRÚC HỆ THỐNG (TECH STACK)

| Thành phần | Công nghệ / Thư viện | Mô tả |
| :--- | :--- | :--- |
| **Frontend Framework** | React 18 + TypeScript + Vite | Giao diện React SPA hiệu năng cao, type-safe |
| **Styling & UI** | Tailwind CSS + Modern Glassmorphism | Giao diện tối (Dark Mode), hiệu ứng kính mờ chuẩn v3.0 |
| **Icon System** | Lucide React | Hệ thống biểu tượng trực quan, chuẩn y tế & thể thao |
| **Backend & Server** | Node.js (CommonJS) + Express | Server tích hợp chạy API & phục vụ trang tĩnh Web |
| **Bundler Server** | Esbuild | Bundle `server.ts` thành `dist/server.cjs` cực nhanh |
| **Cron & Email** | Node-cron + Nodemailer | Lập lịch gửi 16 mail nhắc nhở & Mail tổng kết tuần qua Gmail SMTP |
| **Database & Storage** | SQLite / Local Storage | Lưu trữ nhật ký ăn uống, cân nặng, trạng thái tích bảng kiểm |
| **Process Manager** | PM2 | Quản lý daemon chạy ngầm ứng dụng & ngrok trên Windows |
| **Tunneling** | Ngrok Static Domain | Xuất bản app ra Internet qua Domain cố định |

---

## ⚙️ 3. CẤU HÌNH VẬN HÀNH PM2 (PROCESS MANAGER)

Ứng dụng chạy dưới dạng Daemon ngầm quản lý bởi **PM2** với mã tiến trình `nutri-track`.

### 3.1. Các Lệnh Quản Lý App PM2
* **Khởi chạy ứng dụng**:
  ```powershell
  pm2 start nutri-track
  ```
* **Tắt ứng dụng**:
  ```powershell
  pm2 stop nutri-track
  ```
* **Khởi động lại (Khi cập nhật code / build mới)**:
  ```powershell
  pm2 restart nutri-track
  ```
* **Xem Log ứng dụng (60 dòng mới nhất)**:
  ```powershell
  pm2 logs nutri-track --lines 60 --nostream
  ```

### 🛑 3.2. Lệnh Khai Tử Port 3456 (Kill Port khi bị chiếm)
Khi gặp lỗi Port `3456` bị tiến trình khác chiếm dụng trên Windows, chạy lệnh sau trong PowerShell / CMD:
```powershell
for /f "tokens=5" %a in ('netstat -aon ^| findstr :3456') do taskkill /F /PID %a
```

---

## 🌐 4. CẤU HÌNH NGROK STATIC DOMAIN

Hệ thống sử dụng **Ngrok Cố Định (Static Domain)** để truy cập app từ bất kỳ đâu qua điện thoại/laptop khác mà không lo đổi IP.

### 📋 4.1. Thông Tin Kỹ Thuật Ngrok
* **Địa chỉ Ngrok Static Domain**: `reveler-leverage-backlight.ngrok-free.dev`
* **Email Ngrok Account**: `tuannguyengraphics@gmail.com`
* **Ngrok Auth Token**: `3Hg4T1fQLPnYqCO088vxFaNkRuP_6VeKdR546DWD2NpEL5WsY`
* **Port Đích Local**: `localhost:3456`
* **Thư mục dự án**:
  * Laptop: `D:\aiagent\nutritrack`
  * PC: `D:\aiagent\nutritrack`

### 🔄 4.2. Quản Lý Tiến Trình Ngrok Qua PM2 (`nutritrack-ngrok`)
* **Khởi động lại Tunnel Ngrok**:
  ```powershell
  pm2 restart nutritrack-ngrok
  ```
* **Xem Log Tunnel Ngrok**:
  ```powershell
  pm2 logs nutritrack-ngrok --lines 30 --nostream
  ```

---

## 🔴 5. CẨM NANG XỦ LÝ LỖI (TROUBLESHOOTING GUIDE)

### 🚨 Lỗi 1: Localhost bị OFF / Không vào được `localhost:3456`
1. **Bước 1**: Kiểm tra log để xác định nguyên nhân:
   ```powershell
   pm2 logs nutri-track --lines 60 --nostream
   ```
2. **Bước 2**: Nếu port bị trùng/chiếm dụng, chạy lệnh Kill Port:
   ```powershell
   for /f "tokens=5" %a in ('netstat -aon ^| findstr :3456') do taskkill /F /PID %a
   ```
3. **Bước 3**: Build lại code và khởi động lại PM2:
   ```powershell
   npm run build
   pm2 restart nutri-track
   ```

---

### 🚨 Lỗi 2: Ngrok bị OFF / Không truy cập được qua Domain Ngrok
1. **Bước 1**: Xem log của tiến trình Ngrok:
   ```powershell
   pm2 logs nutritrack-ngrok --lines 30 --nostream
   ```
2. **Bước 2**: Khởi động lại dịch vụ Ngrok:
   ```powershell
   pm2 restart nutritrack-ngrok
   ```
3. **Bước 3 (Nếu vẫn lỗi)**:
   * Truy cập [dashboard.ngrok.com](https://dashboard.ngrok.com) ➔ Đăng nhập bằng Gmail: `tuannguyengraphics@gmail.com`.
   * Vào mục **Tunnels** / **Endpoints** để kiểm tra trạng thái Authtoken hoặc Domain `reveler-leverage-backlight.ngrok-free.dev`.
   * Thêm lại Authtoken nếu cần:
     ```powershell
     ngrok config add-authtoken 3Hg4T1fQLPnYqCO088vxFaNkRuP_6VeKdR546DWD2NpEL5WsY
     ```

---

## 🏆 TỔNG KẾT QUY TRÌNH DEPLOY & UPDATE CODE

Khi cần chỉnh sửa tính năng hoặc cập nhật ứng dụng:
```powershell
# 1. Đi đến thư mục dự án
cd D:\aiagent\nutritrack

# 2. Biên dịch Frontend & Server
npm run build

# 3. Restart lại tiến trình PM2
pm2 restart nutri-track

# 4. Kiểm tra trạng thái dịch vụ
pm2 status
```
