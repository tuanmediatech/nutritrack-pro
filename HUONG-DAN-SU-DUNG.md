# 🥗 NutriTrack Pro — Hướng Dẫn Sử Dụng

> **Công cụ quản lý dinh dưỡng cá nhân**  
> Dành riêng cho: Tuấn Nguyễn | Mục tiêu: 71kg → 78kg  
> Phiên bản: 1.0 | Cập nhật: 07/06/2026

---

## 📋 Mục lục

1. [Giới thiệu](#1-giới-thiệu)
2. [Cài đặt & Khởi chạy](#2-cài-đặt--khởi-chạy)
3. [Chạy trên điện thoại (offline)](#3-chạy-trên-điện-thoại-offline)
4. [Các tính năng chính](#4-các-tính-năng-chính)
5. [Hướng dẫn từng tab](#5-hướng-dẫn-từng-tab)
6. [Quy trình sử dụng 1 ngày](#6-quy-trình-sử-dụng-1-ngày)
7. [Dữ liệu & Backup](#7-dữ-liệu--backup)
8. [Phím tắt](#8-phím-tắt)
9. [Khắc phục sự cố](#9-khắc-phục-sự-cố)

---

## 1. Giới thiệu

**NutriTrack Pro** là công cụ web quản lý dinh dưỡng cá nhân được xây dựng dựa trên lịch dinh dưỡng tăng cân sạch dành cho người vận động nhiều. Tool giúp bạn:

- ⏰ **Nhắc nhở** đúng giờ từng bữa ăn trong ngày
- 📝 **Ghi lại** nhật ký ăn uống hằng ngày
- ⚖️ **Theo dõi** tiến trình cân nặng với biểu đồ trực quan
- ✅ **Kiểm tra** 12 việc cần làm mỗi ngày
- 🍽️ **Gợi ý** thực đơn xoay vòng theo từng khung giờ
- 📋 **Nhắc nhớ** nguyên tắc dinh dưỡng cốt lõi

---

## 2. Cài đặt & Khởi chạy

### Yêu cầu hệ thống

- Windows 10/11
- Trình duyệt Chrome, Edge, hoặc Firefox (phiên bản mới nhất)
- Node.js (đã cài sẵn)

### Vị trí file

```
d:\AI Automation\tool dinh dưỡng\
├── index.html              ← File chính (máy tính)
├── style.css               ← Giao diện
├── app.js                  ← Logic ứng dụng
├── sw.js                   ← Hỗ trợ offline (PWA)
├── manifest.json           ← Cài như app
├── nutritrack-mobile.html  ← File dùng trên điện thoại (offline)
└── HUONG-DAN-SU-DUNG.md   ← File này
```

### Khởi chạy trên máy tính

**Cách 1 — Dùng lệnh (khuyến nghị):**

Mở PowerShell và chạy:
```powershell
npx serve "d:\AI Automation\tool dinh dưỡng" --listen 3456
```

Sau đó mở trình duyệt và truy cập:
```
http://localhost:3456
```

**Cách 2 — Mở trực tiếp:**

Double-click vào file `index.html` để mở trong trình duyệt. Lưu ý: một số tính năng (thông báo, service worker) sẽ không hoạt động khi mở bằng `file://`.

> **💡 Mẹo:** Bookmark `http://localhost:3456` để mở nhanh mỗi ngày.

### Giữ server chạy nền

Server sẽ chạy cho đến khi bạn đóng cửa sổ PowerShell. Nếu muốn server tự chạy khi khởi động Windows, hãy tạo shortcut đến file batch hoặc dùng Task Scheduler.

---

## 3. Chạy trên điện thoại (offline)

File dành cho điện thoại là **`nutritrack-mobile.html`** — một file HTML duy nhất, tự chứa tất cả, **không cần mạng internet, không cần server**.

### Cách 1: Gửi qua Zalo/Telegram

1. Mở Zalo → "Tôi" → **Gửi file cho chính mình**
2. Đính kèm file `nutritrack-mobile.html`
3. Trên điện thoại → mở Zalo → tải file về
4. Mở file bằng **Chrome**

### Cách 2: Google Drive

1. Upload `nutritrack-mobile.html` lên Google Drive
2. Trên điện thoại → tải về → mở bằng Chrome

### Cách 3: Cáp USB

1. Kết nối điện thoại với máy tính
2. Copy file vào thư mục bất kỳ trên điện thoại
3. Mở File Manager → tìm file → mở bằng Chrome

### Cài như app (Android)

Sau khi mở file trong Chrome:

1. Nhấn menu **⋮** (góc trên phải)
2. Chọn **"Thêm vào màn hình chính"**
3. Nhấn **"Thêm"**
4. App sẽ xuất hiện trên màn hình chính như ứng dụng thật

### Cài như app (iPhone / Safari)

1. Mở file trong Safari
2. Nhấn nút **Share** (biểu tượng hộp có mũi tên lên)
3. Chọn **"Thêm vào Màn hình chính"**
4. Nhấn **"Thêm"**

> ✅ Sau khi cài, app hoạt động **100% offline**, dữ liệu lưu vĩnh viễn trong bộ nhớ máy.

---

## 4. Các tính năng chính

| Tính năng | Mô tả |
|---|---|
| **Dashboard** | Bảng tổng quan: cân nặng, nước, bảng kiểm, cơm. Timeline lịch ăn theo giờ thực |
| **Ghi nhanh** | Ghi bữa ăn chỉ trong 10 giây |
| **Lịch hôm nay** | Xem toàn bộ 16 mốc từ 4h30 đến 23h với gợi ý món ăn |
| **Nhật ký** | Lịch sử bữa ăn, lọc theo ngày, xuất file .txt |
| **Cân nặng** | Ghi và theo dõi cân nặng với biểu đồ, lộ trình 6 tháng |
| **Bảng kiểm** | 12 mục cần hoàn thành mỗi ngày, vòng tròn tiến độ |
| **Thực đơn** | Gợi ý món xoay vòng, lọc theo buổi sáng/trưa/chiều/tối |
| **Nguyên tắc** | 8 quy tắc cốt lõi, bảng điều chỉnh sau 2 tuần |
| **Nhắc nhở** | Thông báo hệ thống đúng giờ ăn, nhắc uống nước |
| **Offline** | Toàn bộ dữ liệu lưu trong máy, không cần internet |

---

## 5. Hướng dẫn từng tab

### 📊 Dashboard

Màn hình chính, mở đầu tiên mỗi ngày.

**Chọn loại ngày (góc trên phải):**
- `⚡ Vận động nhiều` — Dạy sáng + dạy trưa + chơi thể thao chiều/tối → Mục tiêu nước: 2.500ml, cơm: 4 chén
- `🌤 Vận động nhẹ` — Không chơi thể thao chiều/tối → Mục tiêu nước: 2.000ml, cơm: 3.5 chén

**4 thẻ thống kê:**

| Thẻ | Ý nghĩa | Cách cập nhật |
|---|---|---|
| ⚖️ Cân nặng | Cân nặng mới nhất, % tiến trình đến 78kg | Ghi ở tab Cân nặng |
| 💧 Nước uống | Tổng nước đã uống, so với mục tiêu | Nhấn nút +200/+300/+500ml |
| ✅ Bảng kiểm | Số mục đã hoàn thành / 12 | Tick ở tab Bảng kiểm |
| 🍚 Cơm | Tổng chén cơm đã ăn hôm nay | Ghi khi dùng Ghi nhanh |

**Timeline lịch ăn:**
- ✓ Xanh = đã qua giờ
- ⦿ Xanh dương = **đang là giờ này** (nhắc nhở)
- Xám = sắp tới

**Ghi nhanh bữa ăn:**
1. Chọn bữa ăn từ dropdown
2. Gõ những gì đã ăn vào ô văn bản
3. Điền số chén cơm và ml nước (nếu có)
4. Chọn cảm giác 😊/😐/😴
5. Nhấn **💾 Lưu bữa ăn**

---

### ⏰ Lịch hôm nay

Xem toàn bộ lịch 16 mốc trong ngày với gợi ý món ăn chi tiết cho từng bữa.

- Khung giờ đang hoạt động sẽ được **tô sáng viền xanh**
- Mỗi card hiển thị: giờ, hoạt động, mục tiêu dinh dưỡng, danh sách lựa chọn món

---

### 📝 Nhật ký ăn uống

**Xem lịch sử:** Tất cả bữa ăn đã ghi, mới nhất hiển thị trước.

**Lọc theo ngày:**
1. Chọn ngày trong ô ngày
2. Nhấn **Lọc**
3. Nhấn **Tất cả** để xem lại toàn bộ

**Xuất dữ liệu:**
- Nhấn **📥 Xuất** → tải về file `.txt`
- Mở bằng Excel hoặc Notepad để xem

**Xóa bữa ăn:** Nhấn nút 🗑️ ở mỗi dòng

---

### ⚖️ Cân nặng

**Ghi cân nặng mới:**
1. Chọn ngày (mặc định là hôm nay)
2. Nhập cân nặng (kg, ví dụ: 71.5)
3. Ghi chú tùy chọn (VD: "Sáng sau vệ sinh")
4. Nhấn **💾 Lưu cân nặng**

> 📌 **Lưu ý:** Nên cân **mỗi sáng sau khi đi vệ sinh**, trước khi ăn uống, 2–3 lần/tuần.

**Biểu đồ:** Tự động vẽ khi có ≥ 2 điểm dữ liệu. Đường đứt màu xanh là mục tiêu 78kg.

**Lộ trình 6 tháng:** Hiển thị các mốc tăng cân từ 2 tuần → 6 tháng.

---

### ✅ Bảng kiểm hằng ngày

12 việc cần hoàn thành mỗi ngày:

| # | Việc cần làm | Giờ |
|---|---|---|
| 1 | Ăn nhẹ trước dạy sáng | 4h30 |
| 2 | Ăn sáng có tinh bột + đạm | 6h15 |
| 3 | Uống ≥ 2 bịch sữa/sữa chua KĐ | Cả ngày |
| 4 | Ăn bữa phụ 9h30 | 9h30 |
| 5 | Ăn nhẹ trước dạy trưa | 10h45 |
| 6 | Ăn trưa đủ 2 chén + đạm + rau + canh | 12h45 |
| 7 | Nghỉ trưa 15–20 phút | 13h20 |
| 8 | Ăn bữa phụ chiều | 15h30 |
| 9 | Nếu chơi đến 20h: ăn thêm lúc 16h30 | 16h30 |
| 10 | Ăn tối đủ đạm, không bỏ cơm | 20h15 |
| 11 | Uống đủ nước (2–3 lít) | Cả ngày |
| 12 | Không sữa đặc / nước ngọt / trà sữa | Cả ngày |

**Cách dùng:** Nhấn vào từng mục để tick ✓. Nhấn lại để bỏ tick.

**Reset:** Nhấn **🔄 Reset** nếu muốn làm mới (bảng kiểm tự reset mỗi ngày mới).

---

### 🍽️ Thực đơn gợi ý

Xem gợi ý món ăn cho từng khung giờ.

**Lọc theo buổi:**
- `Tất cả` — Xem toàn bộ 16 khung giờ
- `☀️ Sáng` — 4h30 → 9h30
- `🌤 Trưa` — 10h45 → 13h40
- `🌅 Chiều` — 15h30 → 20h
- `🌙 Tối` — 20h15 → 22h30

**Gợi ý xoay vòng buổi sáng theo tuần:**

| Thứ | Món gợi ý |
|---|---|
| Thứ 2 | Phở / bún bò / bún chả cá + sữa KĐ |
| Thứ 3 | Mì quảng có thịt/trứng + sữa KĐ |
| Thứ 4 | Cơm + cá/thịt/trứng + canh |
| Thứ 5 | Bánh mì thịt/trứng + sữa KĐ |
| Thứ 6 | Bún thịt nướng/bún gà + sữa KĐ |
| Thứ 7 | Cháo thịt/cháo cá + sữa KĐ |
| CN | Ăn theo gia đình, đảm bảo tinh bột + đạm |

---

### 📋 Nguyên tắc dinh dưỡng

8 quy tắc cốt lõi cần ghi nhớ, bảng điều chỉnh sau 2 tuần, danh sách nên ăn và nên tránh.

**Bảng điều chỉnh sau 2 tuần (quan trọng):**

| Tình trạng | Điều chỉnh |
|---|---|
| Cân không tăng | Thêm ½ chén cơm tối hoặc 1 trứng/ngày |
| Chiều vẫn hụt sức | Thêm bữa 16h30: sữa + chuối + bánh mì |
| Tăng 0.3–0.7kg/2 tuần | Giữ nguyên lịch ✅ |
| Bụng to nhanh | Giảm ½ chén cơm tối |
| Glucose tăng | Bỏ hoàn toàn đồ ngọt |
| Mặt vẫn hốc | Tăng bữa phụ chiều + sữa/trứng trước ngủ |
| Ngủ kém | Không cà phê sau chiều |
| Hay chuột rút | Tăng nước + điện giải loãng |

---

### 🔔 Nhắc nhở

**Bật thông báo hệ thống:**
1. Mở tab **Nhắc nhở**
2. Nhấn nút **"Bật thông báo"**
3. Chọn **"Cho phép"** khi trình duyệt hỏi
4. Từ đó sẽ nhận thông báo đúng giờ ăn

**Cài đặt:**
- **Bật/tắt nhắc nhở:** Toggle on/off toàn bộ
- **Nhắc trước (phút):** Chọn nhắc trước 0/5/10/15 phút
- **Nhắc uống nước:** Tự động nhắc mỗi 90 phút nếu chưa đủ nước

> ⚠️ Thông báo chỉ hoạt động khi trình duyệt đang mở. Trên điện thoại, cài như app PWA để nhận thông báo tốt hơn.

---

## 6. Quy trình sử dụng 1 ngày

```
04:30  Thức dậy
       → Mở app → Dashboard
       → Chọn "Vận động nhiều" hoặc "Nhẹ"
       
04:35  Ăn nhẹ xong
       → Ghi nhanh: "4h30 - Chuối 1 quả + nước 300ml"
       → Rice: 0, Water: 300ml
       
06:45  Ăn sáng xong
       → Ghi nhanh: "6h15 - Phở bò tô vừa + sữa tươi KĐ"
       → Rice: 0, Water: 200ml
       
09:30  Bữa phụ sáng
       → Ghi nhanh: "9h30 - Sữa chua + chuối"
       
10:50  Trước dạy trưa
       → Ghi nhanh: "10h45 - Chuối 1 quả"
       
13:00  Ăn trưa xong
       → Ghi nhanh: "12h45 - 2 chén cơm, cá kho, rau luộc, canh xương"
       → Rice: 2, Water: 300ml
       
15:30  Bữa phụ chiều
       → Ghi nhanh: "15h30 - Sữa tươi KĐ + bắp luộc"
       
20:30  Ăn tối xong
       → Ghi nhanh: "20h15 - 2 chén cơm, gà xào, canh rau"
       → Rice: 2
       
22:00  Trước ngủ
       → Tab Bảng kiểm → Tick tất cả việc đã làm
       → Kiểm tra nước (mục tiêu 2500ml)
       → Ghi nhanh bữa trước ngủ nếu có
       
Sáng hôm sau (sau vệ sinh)
       → Tab Cân nặng → Ghi cân nặng mới
```

---

## 7. Dữ liệu & Backup

### Dữ liệu được lưu ở đâu?

Tất cả dữ liệu lưu trong **localStorage** của trình duyệt — không gửi lên server, không cần internet.

| Dữ liệu | Thời gian lưu |
|---|---|
| Bảng kiểm hằng ngày | Tự reset lúc 0h mỗi ngày mới |
| Nước uống hằng ngày | Tự reset lúc 0h mỗi ngày mới |
| Nhật ký bữa ăn | Lưu vĩnh viễn |
| Lịch sử cân nặng | Lưu vĩnh viễn |
| Cài đặt nhắc nhở | Lưu vĩnh viễn |

### Backup dữ liệu

**Xuất nhật ký bữa ăn:**
1. Tab **📝 Nhật ký** → Nút **📥 Xuất**
2. File `.txt` sẽ được tải về máy

**Lưu ý quan trọng:**
- Nếu **xóa lịch sử trình duyệt** hoặc **xóa cache** → dữ liệu sẽ mất
- Nên xuất file backup mỗi tuần hoặc mỗi tháng
- Trên điện thoại: mỗi thiết bị có dữ liệu riêng, không đồng bộ tự động

---

## 8. Phím tắt

*(Chỉ hoạt động trên máy tính)*

| Phím tắt | Tab chuyển đến |
|---|---|
| `Alt + 1` | 📊 Dashboard |
| `Alt + 2` | ⏰ Lịch hôm nay |
| `Alt + 3` | 📝 Nhật ký |
| `Alt + 4` | ⚖️ Cân nặng |
| `Alt + 5` | ✅ Bảng kiểm |
| `Alt + 6` | 🍽️ Thực đơn |
| `Alt + 7` | 📋 Nguyên tắc |
| `Alt + 8` | 🔔 Nhắc nhở |

---

## 9. Khắc phục sự cố

### Server không chạy / không vào được localhost:3456

```powershell
# Chạy lại lệnh này trong PowerShell:
npx serve "d:\AI Automation\tool dinh dưỡng" --listen 3456
```

Nếu báo lỗi port đã dùng:
```powershell
# Dùng port khác:
npx serve "d:\AI Automation\tool dinh dưỡng" --listen 3457
# Sau đó vào: http://localhost:3457
```

### Thông báo không hiển thị

1. Kiểm tra Chrome → Cài đặt → Quyền riêng tư → Thông báo → Cho phép `localhost`
2. Kiểm tra Windows → Cài đặt → Hệ thống → Thông báo → Bật cho Chrome

### Dữ liệu bị mất sau khi xóa cache

- Luôn xuất backup file trước khi xóa cache
- Hoặc dùng chế độ **Không ẩn danh** của trình duyệt để tránh tự xóa

### Biểu đồ cân nặng không hiển thị

- Cần nhập **ít nhất 2 lần cân** khác ngày nhau
- Sau đó biểu đồ sẽ tự động vẽ

### App chạy chậm trên điện thoại cũ

- Dùng Chrome thay vì trình duyệt mặc định
- Đóng các tab khác trước khi mở app

---

## 📞 Thông tin kỹ thuật

| Mục | Thông tin |
|---|---|
| File máy tính | `d:\AI Automation\tool dinh dưỡng\index.html` |
| File điện thoại | `d:\AI Automation\tool dinh dưỡng\nutritrack-mobile.html` |
| URL trên máy tính | `http://localhost:3456` |
| Dữ liệu lưu tại | Bộ nhớ trình duyệt (localStorage) |
| Hoạt động offline | ✅ (file nutritrack-mobile.html) |
| Cần internet | ❌ (ngoại trừ load font lần đầu trên máy tính) |
| Tương thích | Chrome, Edge, Firefox, Safari |

---

*Hướng dẫn được tạo ngày 07/06/2026 | NutriTrack Pro v1.0*
