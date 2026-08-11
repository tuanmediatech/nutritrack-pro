# 🥗 NutriTrack Pro — Hướng Dẫn Sử Dụng Hệ Thống v3.0

> **Hệ thống Quản lý Dinh dưỡng & Tập luyện Cá nhân (Backend & SQLite)**  
> Dành riêng cho: Nguyễn Tuân | Phân hệ: Tăng cân & Giảm cân  
> Phiên bản: 3.0 | Cập nhật: 09/08/2026

---

## 📋 Mục lục

1. [Giới thiệu](#1-giới-thiệu)
2. [Cài đặt & Khởi chạy (PM2 & Local Port 3456)](#2-cài-đặt--khởi-chạy-pm2--local-port-3456)
3. [Tài khoản mặc định & Đăng nhập](#3-tài-khoản-mặc-định--đăng-nhập)
4. [Các tính năng chính](#4-các-tính-năng-chính)
5. [Cơ chế Đồng bộ (Laptop <-> PC)](#5-cơ-chế-đồng-bộ-laptop---pc)
6. [Cấu hình Nhắc nhở qua Gmail (SMTP)](#6-cấu-hình-nhắc-nhở-qua-gmail-smtp)
7. [Quản lý Ghi chú (Notebook CRUD)](#7-quản-lý-ghi-chú-notebook-crud)
8. [Khắc phục sự cố](#8-khắc-phục-sự-cố)

---

## 1. Giới thiệu

**NutriTrack Pro v3.0** là giải pháp phần mềm quản lý dinh dưỡng và tập luyện toàn diện, hoạt động dựa trên mô hình **Client-Server (Node.js Express + SQLite)**. Hệ thống được mở rộng với hai phân hệ chính:
- **📈 Phân hệ Tăng Cân:** Dành cho việc tăng cân sạch, tăng cơ, tối ưu hóa các bữa ăn giàu tinh bột và đạm (mục tiêu 3.5 - 4 chén cơm/ngày).
- **📉 Phân hệ Giảm Cân:** Tối ưu hóa việc thâm hụt calo lành mạnh, hạn chế tinh bột nhanh, tập trung protein nạc và rau xanh luộc (mục tiêu 1.5 - 2 chén cơm gạo lứt/ngày, cardio 45 phút).

---

## 2. Cài đặt & Khởi chạy (PM2 & Local Port 3456)

Ứng dụng chạy trên cổng **`3456`** của máy tính cục bộ và được quản lý bằng dịch vụ **PM2** để chạy ngầm ổn định.

### Yêu cầu hệ thống
- **Node.js** (v18 trở lên được khuyến nghị)
- **PM2** cài đặt toàn cục (`npm install -g pm2`)

### Các bước khởi chạy trên Laptop / PC

1. **Cài đặt thư viện phụ thuộc:**
   Mở terminal (CMD hoặc PowerShell) tại thư mục dự án `D:\aiagent\nutritrack` và chạy:
   ```bash
   npm install
   ```

2. **Khởi chạy ứng dụng qua PM2:**
   Để ứng dụng chạy nền và tự động tải lại nếu có lỗi, hãy khởi động qua dịch vụ PM2 của bạn:
   ```bash
   pm2 start server.js --name "nutri-track"
   ```

3. **Quản lý dịch vụ:**
   - **Tắt ứng dụng:** `pm2 stop nutri-track`
   - **Khởi động lại:** `pm2 restart nutri-track`
   - **Xem logs hệ thống:** `pm2 logs nutri-track`

4. **Truy cập ứng dụng:**
   Mở trình duyệt bất kỳ và truy cập địa chỉ:
   ```
   http://localhost:3456
   ```

---

## 3. Tài khoản mặc định & Đăng nhập

Khi truy cập vào ứng dụng lần đầu, giao diện đăng nhập (Login Screen) sẽ xuất hiện. Hệ thống đã khởi tạo sẵn hai tài khoản mẫu tương ứng với hai phân hệ:

| Phân hệ đối tượng | Tên đăng nhập | Mật khẩu | Đặc trưng mục tiêu |
|---|---|---|---|
| **📈 Tăng Cân** | `tangcan` | `123` | Nguyễn Tuân (Tăng Cân) |
| **📉 Giảm Cân** | `giamcan` | `123` | Nguyễn Tuân (Giảm Cân) |

Ngoài ra, bạn có thể tự đăng ký tài khoản mới bằng cách nhấp vào nút **"Đăng ký ngay"** ngay trên biểu mẫu đăng nhập để cấu hình cân nặng và mục tiêu riêng biệt.

---

## 4. Các tính năng chính

- **Dashboard thông minh:** Theo dõi lượng nước uống, chén cơm, lượng protein, calories nạp vào và tiến trình cân nặng dựa trên phân hệ của tài khoản đang đăng nhập.
- **Lịch sinh hoạt:** Tự động điều chỉnh các bữa ăn gợi ý và khung giờ tập luyện dựa theo phân hệ Tăng cân/Giảm cân.
- **Sổ ghi chép (Notebook):** Cho phép bạn ghi lại các thông tin cá nhân, thực đơn tự chế, hoặc nhật ký tập luyện chi tiết.
- **Đồng bộ mã nguồn & database:** Hỗ trợ đẩy code và DB từ Laptop cơ quan sang PC làm việc chỉ với 1 click.

---

## 5. Cơ chế Đồng bộ (Laptop <-> PC)

Hệ thống được thiết kế để giải quyết nhu cầu: **Lập trình và ghi dữ liệu trên Laptop tại nhà, sau đó đồng bộ sang PC ở cơ quan.**

### Cách thiết lập cấu hình file `.env`
Mở file `.env` tại thư mục gốc và điều chỉnh:

- **Trên Laptop (Source):**
  ```env
  IS_LAPTOP=true
  SYNC_TARGET_URL=http://<địa-chỉ-ngrok-của-pc-cơ-quan>
  ```
- **Trên PC cơ quan (Target):**
  ```env
  IS_LAPTOP=false
  # PC sẽ nhận file zip và database từ Laptop truyền qua, sau đó tự restart bằng PM2.
  ```

### Các bước thực hiện Đồng bộ từ giao diện Laptop
1. Chạy ngrok trên PC cơ quan (Ví dụ: `ngrok http 3456`).
2. Copy link ngrok công khai đó và dán vào trường `SYNC_TARGET_URL` trong file `.env` trên Laptop.
3. Trên giao diện Laptop, truy cập tab **Đồng bộ (Sync)**.
4. Chọn chế độ đồng bộ:
   - **Chỉ Database SQLite:** Đồng bộ file dữ liệu nhật ký `nutritrack.db`.
   - **Chỉ Mã nguồn:** Đồng bộ các thay đổi của file JS, HTML, CSS (nén thành file zip và đẩy sang).
   - **Cả hai:** Đồng bộ cả code và database.
5. Nhấp nút **"BẮT ĐẦU ĐỒNG BỘ"**. Quá trình diễn ra tự động và ghi log chi tiết lên bảng điều khiển console. Khi hoàn tất, PC sẽ tự kích hoạt restart PM2 để áp dụng code mới.

---

## 6. Cấu hình Nhắc nhở qua Gmail (SMTP)

Ứng dụng có thể gửi email nhắc nhở lịch ăn uống, lịch tập Pickleball đến email của bạn trước giờ diễn ra thông qua thư viện `node-cron`.

### Cách cấu hình trong file `.env`:
```env
GMAIL_USER=nguyentuanqnpc@gmail.com
GMAIL_PASS=xxxx xxxx xxxx xxxx  # Mật khẩu ứng dụng (App Password) của Google
RECIPIENT_EMAIL=nguyentuanqnpc@gmail.com
```

> **Cách lấy Mật khẩu ứng dụng (App Password):**
> 1. Truy cập trang Quản lý tài khoản Google của bạn.
> 2. Bật xác minh 2 bước (nếu chưa bật).
> 3. Tìm kiếm **"Mật khẩu ứng dụng" (App Passwords)**.
> 4. Tạo một mật khẩu ứng dụng mới với tên "NutriTrack" và copy chuỗi 16 ký tự để dán vào `GMAIL_PASS`.

Hệ thống sẽ chạy ngầm mỗi phút một lần, tự động đối chiếu lịch sinh hoạt và gửi email nhắc nhở đẹp mắt đến bạn.

---

## 7. Quản lý Ghi chú (Notebook CRUD)

Tính năng **Sổ ghi chép (Notebook)** hỗ trợ đầy đủ các thao tác:
- **Tải danh sách:** Tự động hiển thị các ghi chú được lưu trữ trong SQLite.
- **Tìm kiếm nhanh:** Gõ từ khóa tìm kiếm trên thanh search để lọc các note có nội dung liên quan.
- **Thêm ghi chú:** Nhấn nút **"Thêm mới"**, điền tiêu đề, nội dung và nhấn **"Lưu lại"**.
- **Chỉnh sửa / Xóa:** Chọn ghi chú bên cột trái để hiển thị chi tiết, chỉnh sửa nội dung và lưu lại hoặc xóa bỏ.

---

## 8. Khắc phục sự cố

### 1. PM2 báo lỗi hoặc Server không khởi chạy
Hãy kiểm tra xem cổng `3456` có đang bị chiếm dụng bởi ứng dụng khác hay không. Bạn có thể thay đổi cổng trong file `.env`:
```env
PORT=3457
```

### 2. Gửi email nhắc nhở bị lỗi
- Kiểm tra xem file `.env` đã điền chính xác `GMAIL_USER` và `GMAIL_PASS` chưa.
- Đảm bảo mật khẩu ứng dụng là chuỗi 16 ký tự không chứa khoảng trắng.

### 3. Đồng bộ báo lỗi "Không thể kết nối tới PC"
- Hãy kiểm tra xem ngrok trên PC có đang hoạt động hay không.
- Đảm bảo bạn đã điền đúng URL ngrok vào file `.env` trên Laptop và đã khởi động lại Server Laptop sau khi chỉnh sửa file `.env`.

---
*NutriTrack Pro v3.0 | Phát triển bởi Antigravity*
