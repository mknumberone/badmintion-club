# CLB Cầu lông — sổ tay quản lý

App một trang quản lý thành viên, quỹ, sân và buổi đánh của câu lạc bộ cầu lông.
React + Vite, không cần backend.

## Chạy trên máy

```bash
npm install
npm run dev      # mở http://localhost:5173
npm run build    # xuất ra dist/
```

## Đưa lên GitHub

```bash
git init
git add .
git commit -m "CLB cầu lông: quản lý thành viên, quỹ, sân, buổi đánh"
git branch -M main
git remote add origin git@github.com:<tên-bạn>/clb-cau-long.git
git push -u origin main
```

## Deploy lên Netlify

Cách nhanh nhất là để Netlify tự build từ GitHub:

1. Vào Netlify → **Add new site** → **Import an existing project** → chọn GitHub, cho phép truy cập repo.
2. Chọn repo `clb-cau-long`. Netlify đọc `netlify.toml` nên các trường build đã đúng sẵn:
   - Build command: `npm run build`
   - Publish directory: `dist`
3. Bấm **Deploy**. Mỗi lần `git push` lên `main` là site tự deploy lại.

Không muốn qua GitHub thì chạy `npm run build` rồi kéo thả nguyên thư mục `dist/`
vào ô deploy của Netlify, hoặc dùng CLI:

```bash
npm i -g netlify-cli
netlify deploy --prod --dir=dist
```

## Chia tiền mỗi buổi

Tiền một buổi (sân + cầu + chi khác) chia theo **phần**, không chia đều đầu người.
Mỗi người mặc định một phần; ai đánh nửa buổi thì để `½`, ai dẫn thêm người đánh
ghép thì để `2`. Tiền một phần là `tổng / tổng số phần`, làm tròn lên 1.000₫, nên
tổng thu được thường nhỉnh hơn tổng chi vài nghìn — phần chênh đó vào quỹ chung.

Khách ngoài CLB thêm ở ô "Thêm khách đánh ghép": họ cũng chiếm phần trong mẫu số
nhưng trả tiền mặt thẳng vào quỹ (hạng mục `Khách đánh ghép`) thay vì bị trừ số dư,
nhờ đó phần của thành viên nhẹ đi. Buổi cũ không có hệ số thì mọi người coi như một
phần, tức là y hệt cách chia đều trước đây.

Ba kiểu chốt: trừ vào số dư từng người, thu tiền mặt tại sân, hoặc quỹ chung chịu.
Kiểu nào thì khách cũng vẫn trả tiền mặt.

## Phân quyền

Ba vai, phân theo mã nhập ở góc dưới thanh bên trái:

| | Thủ quỹ | Trực buổi | Chỉ xem |
|---|:---:|:---:|:---:|
| Xem lịch, quỹ, số dư | ✓ | ✓ | ✓ |
| Tạo/sửa buổi, tích tên, đặt hệ số phần | ✓ | ✓ | – |
| Chốt tiền buổi, bỏ chốt | ✓ | ✓ | – |
| Sửa lịch cố định | ✓ | ✓ | – |
| Ghi giao dịch quỹ, nạp quỹ cho thành viên | ✓ | – | – |
| Thêm/sửa/xoá thành viên và sân | ✓ | – | – |
| Đổi mã, xoá toàn bộ dữ liệu | ✓ | – | – |

App tự nhận vai theo mã được nhập, không phải chọn vai. Đặt trùng hai mã thì
vai thủ quỹ thắng. Chỉ **mã thủ quỹ** mới khoá app về chế độ chỉ xem khi mở lại
— đặt mỗi mã trực buổi không tự nhốt mình ra ngoài được. Để trống rồi lưu là bỏ mã.

Sổ cũ chỉ có một mã thì mã đó tự thành mã thủ quỹ khi mở lên.

## Dữ liệu được lưu ở đâu

Trong `localStorage` của trình duyệt, dưới khoá `clb-cau-long:v1`.
Hệ quả cần biết trước khi đưa cho cả CLB dùng:

- Dữ liệu nằm trên **từng máy, từng trình duyệt**. Bạn nhập trên laptop thì
  điện thoại của thành viên khác không thấy gì.
- Xoá dữ liệu trình duyệt hoặc dùng chế độ ẩn danh là mất sổ. Nên chốt quỹ
  xong thì chụp màn hình hoặc ghi lại đâu đó.
- **Mã chỉ là khoá nhẹ** chống sửa nhầm, không phải bảo mật. Cả hai mã nằm
  trong localStorage, ai mở DevTools cũng đọc và đổi được.

Muốn cả CLB cùng xem một sổ và phân quyền thật thì cần một backend. Nhẹ nhất là
Supabase: một bảng `clubs` giữ dữ liệu JSON, bật Row Level Security, đăng nhập
bằng magic link, cột `role` phân biệt thủ quỹ với thành viên. Lúc đó chỉ cần thay
lớp `store` ở đầu `src/App.jsx` — phần còn lại của app không phải sửa, vì mọi chỗ
đọc ghi đều đi qua `store.get` / `store.set` / `store.delete`.

## Cấu trúc

```
index.html          khung trang
netlify.toml        cấu hình build + redirect cho SPA
src/main.jsx        điểm khởi động React
src/App.jsx         toàn bộ app: CSS, lớp store, và các trang
src/data.json       dữ liệu mẫu cho nút "Nạp dữ liệu mẫu"
```

Muốn đổi danh sách thành viên, sân hay lịch cố định của bản mẫu thì sửa
`src/data.json`, không phải sửa `App.jsx`. Trong file đó các mục nối với nhau
bằng khoá `ref` (ví dụ `slots[].court` trỏ tới `courts[].ref`); id thật và ngày
tháng do hàm `seed()` sinh lúc bấm nút.

Trong `src/App.jsx`, mỗi trang là một component riêng: `Home`, `Sessions`,
`Members`, `MemberSheet`, `Fund`, `Courts`. Toàn bộ CSS nằm trong hằng `CSS`
ở đầu file, đổi màu thì sửa các biến `--court`, `--smash`, `--paper`.
