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

## Dữ liệu được lưu ở đâu

Trong `localStorage` của trình duyệt, dưới khoá `clb-cau-long:v1`.
Hệ quả cần biết trước khi đưa cho cả CLB dùng:

- Dữ liệu nằm trên **từng máy, từng trình duyệt**. Bạn nhập trên laptop thì
  điện thoại của thành viên khác không thấy gì.
- Xoá dữ liệu trình duyệt hoặc dùng chế độ ẩn danh là mất sổ. Nên chốt quỹ
  xong thì chụp màn hình hoặc ghi lại đâu đó.
- **Mã quản lý chỉ là khoá nhẹ** chống sửa nhầm, không phải bảo mật. Nó nằm
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
```

Trong `src/App.jsx`, mỗi trang là một component riêng: `Home`, `Sessions`,
`Members`, `MemberSheet`, `Fund`, `Courts`. Toàn bộ CSS nằm trong hằng `CSS`
ở đầu file, đổi màu thì sửa các biến `--court`, `--smash`, `--paper`.
