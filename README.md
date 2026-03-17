# 🏗️ VLXD Kiến Tạo — Hệ thống bán vật liệu xây dựng trực tuyến

> Đồ án chuyên ngành — Ứng dụng web bán vật liệu xây dựng được xây dựng bằng React.js

---

## 📖 Giới thiệu

**VLXD Kiến Tạo** là một ứng dụng web thương mại điện tử chuyên cung cấp vật liệu xây dựng như xi măng, sắt thép, gạch xây, cát đá. Người dùng có thể duyệt sản phẩm, thêm vào giỏ hàng, nhập địa chỉ giao hàng và đặt hàng trực tuyến.

---

## ⚙️ Công nghệ sử dụng

| Công nghệ | Mô tả |
|-----------|-------|
| [React.js](https://reactjs.org/) | Thư viện xây dựng giao diện người dùng |
| [React Router DOM](https://reactrouter.com/) | Điều hướng giữa các trang |
| [Context API](https://react.dev/reference/react/createContext) | Quản lý state giỏ hàng toàn cục |
| CSS-in-JS (inline styles) | Tạo kiểu giao diện trực tiếp trong component |

---

## 🚀 Hướng dẫn cài đặt & chạy

### Yêu cầu
- [Node.js](https://nodejs.org/) >= 16
- npm hoặc yarn

### Các bước thực hiện

```bash
# 1. Clone repository
git clone https://github.com/tieensx24/DoAnChuyenNganh.git

# 2. Di chuyển vào thư mục project
cd DoAnChuyenNganh

# 3. Cài đặt các thư viện cần thiết
npm install

# 4. Chạy ứng dụng ở môi trường phát triển
npm run dev
```

Mở trình duyệt và truy cập: `http://localhost:5173`

---

## 📁 Cấu trúc thư mục

```
DoAnChuyenNganh/
├── public/
│   └── home/
│       └── image/          # Ảnh slider trang chủ
├── src/
│   ├── context/
│   │   └── CartContext.jsx  # Quản lý giỏ hàng (Context API)
│   ├── pages/
│   │   ├── Home.jsx         # Trang chủ — hero slider
│   │   ├── Products.jsx     # Danh mục sản phẩm + lọc theo loại
│   │   ├── ProductDetail.jsx# Chi tiết sản phẩm
│   │   ├── Checkout.jsx     # Giỏ hàng & tóm tắt đơn hàng
│   │   ├── ShippingAddress.jsx # Nhập địa chỉ & phương thức thanh toán
│   │   ├── Login.jsx        # Đăng nhập
│   │   └── Register.jsx     # Đăng ký tài khoản
│   └── App.jsx              # Cấu hình routing & layout chính
├── package.json
└── README.md
```

---

## 🛍️ Tính năng chính

- **Trang chủ** — Slider ảnh tự động, hỗ trợ kéo tay, thống kê nổi bật
- **Danh mục sản phẩm** — Lọc theo loại vật liệu, hiệu ứng hover card
- **Chi tiết sản phẩm** — Ảnh, mô tả, chọn số lượng, sản phẩm liên quan
- **Giỏ hàng** — Thêm/xóa/cập nhật số lượng, tính tổng tiền tự động
- **Đặt hàng** — Nhập địa chỉ giao hàng, chọn khung giờ nhận, thanh toán COD hoặc chuyển khoản
- **Xác thực** — Giao diện đăng nhập & đăng ký (sẵn sàng kết nối backend)

---

## 📌 Lưu ý

- Dữ liệu sản phẩm hiện dùng **mock data** tĩnh — sẽ kết nối API C# + MySQL ở giai đoạn tiếp theo.
- Chức năng xác thực chưa kết nối backend thực tế.

---


