import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import { CartProvider, useCart } from "./context/CartContext";
import Home from "./pages/Home";
import Products from "./pages/Products";
import Login from "./pages/Login";
import Checkout from "./pages/Checkout";
import Register from "./pages/Register";
import ProductDetail from "./pages/ProductDetail";

// Tạo một component con để hiển thị Menu
function Navigation() {
  const { cartItems } = useCart();
  
  // Tính tổng số lượng món đồ trong giỏ
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <nav style={{ 
      display: 'flex', 
      justifyContent: 'space-between', 
      padding: '15px 5%', 
      background: '#333', 
      color: 'white',
      alignItems: 'center'
    }}>
      <div style={{ fontWeight: 'bold', fontSize: '1.4rem', color: '#ffeb3b' }}>
        🏗️ VLXD KIẾN TẠO
      </div>
      <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
        <Link to="/" style={{ color: 'white', textDecoration: 'none' }}>Trang chủ</Link>
        <Link to="/products" style={{ color: 'white', textDecoration: 'none' }}>Sản phẩm</Link>
        <Link to="/login" style={{ color: 'white', textDecoration: 'none' }}>Đăng nhập</Link>
        {/* //<Link to="/register" style={{ color: 'white', textDecoration: 'none' }}>Đăng ký</Link>? */}
        
        {/* Hiển thị Giỏ hàng với số lượng thực tế */}
        <Link to="/checkout" style={{ 
          color: '#ffeb3b', 
          textDecoration: 'none', 
          fontWeight: 'bold',
          background: '#444',
          padding: '8px 15px',
          borderRadius: '20px'
        }}>
          🛒 Giỏ hàng ({totalItems})
        </Link>
      </div>
    </nav>
  );
}

function App() {
  return (
    // Bao bọc toàn bộ bằng CartProvider
    <CartProvider>
      <BrowserRouter>
        <Navigation /> {/* Thanh Menu */}

        {/* 👇👇👇 THÊM DÒNG CHỮ CHẠY VÀO ĐÂY 👇👇👇 */}
        <div style={{ 
          background: '#ffebee', 
          color: '#c62828',      
          padding: '10px 0', 
          fontWeight: 'bold',
          fontSize: '1.1rem',
          borderBottom: '2px solid #ffcdd2',
          width: '100%'
        }}>
          <marquee behavior="scroll" direction="left" scrollamount="12">
            🔥 KHUYẾN MÃI MÙA XÂY DỰNG: Giảm ngay 10% cho tất cả đơn hàng Xi măng và Sắt thép. 🚚 Miễn phí giao hàng tận công trình cho đơn từ 50 triệu VNĐ! Liên hệ Hotline: 0909.123.456 để nhận báo giá tốt nhất hôm nay! 🏗️
          </marquee>
        </div>
        {/* 👆👆👆 KẾT THÚC DÒNG CHỮ CHẠY 👆👆👆 */}

        <div style={{ padding: '0', minHeight: '80vh' }}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/products" element={<Products />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/product/:id" element={<ProductDetail />} />

          </Routes>
        </div>

        <footer style={{ 
          textAlign: 'center', 
          padding: '20px', 
          background: '#f4f4f4', 
          borderTop: '1px solid #ddd' 
        }}>
          <p>© 2026 Hệ thống VLXD Kiến Tạo - Đồ án chuyên ngành</p>
        </footer>
      </BrowserRouter>
    </CartProvider>
  );
}

export default App;