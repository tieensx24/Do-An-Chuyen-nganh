import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Link, useLocation, useNavigate } from "react-router-dom";
import { CartProvider, useCart } from "./context/CartContext";
import Home from "./pages/Home";
import Products from "./pages/Products";
import Login from "./pages/Login";
import Checkout from "./pages/Checkout";
import Register from "./pages/Register";
import ProductDetail from "./pages/ProductDetail";
import ShippingAddress from "./pages/ShippingAddress";
import AdminDashboard from "./admin/AdminDashboard";

// --- ĐÃ LOẠI BỎ PROTECTED ROUTE ĐỂ VÀO THẲNG ---

function Navigation() {
  const { cartItems } = useCart();
  const location = useLocation();
  const navigate = useNavigate();
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const [scrolled, setScrolled] = useState(false);
  const isHome = location.pathname === "/";

  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("user");
    return saved ? JSON.parse(saved) : null;
  });

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem("user");
    setUser(saved ? JSON.parse(saved) : null);
  }, [location.pathname]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("adminToken");
    setUser(null);
    navigate("/");
  };

  const transparent = isHome && !scrolled;
  const navBg = transparent ? "transparent" : "rgba(12, 25, 18, 0.97)";
  const navBorder = transparent ? "1px solid transparent" : "1px solid rgba(255,255,255,0.07)";

  return (
    <nav style={{
      position: "fixed", top: "32px", left: 0, right: 0, zIndex: 1000,
      background: navBg, borderBottom: navBorder, backdropFilter: transparent ? "none" : "blur(16px)",
      transition: "background 0.4s, border 0.4s, backdrop-filter 0.4s",
      fontFamily: "'Be Vietnam Pro', 'Segoe UI', sans-serif",
    }}>
      <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "0 32px", height: "68px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        {/* Logo */}
        <Link to="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{ width: "36px", height: "36px", background: "linear-gradient(135deg, #2d6e4e, #1a3c2e)", borderRadius: "9px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.1rem", flexShrink: 0 }}>🏗️</div>
          <div>
            <div style={{ fontWeight: "800", fontSize: "1rem", color: "#ffffff", letterSpacing: "0.02em", lineHeight: 1 }}>KIẾN TẠO</div>
            <div style={{ fontSize: "0.62rem", color: "rgba(255,255,255,0.5)", letterSpacing: "0.12em", textTransform: "uppercase", lineHeight: 1, marginTop: "2px" }}>Vật liệu xây dựng</div>
          </div>
        </Link>

        {/* Links */}
        <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
          {[
            { to: "/", label: "Trang chủ" },
            { to: "/products", label: "Sản phẩm" },
            { to: "/admin", label: "Quản trị" }, // Hiện luôn nút Quản trị cho dễ bấm
          ].map(({ to, label }) => {
            const active = location.pathname === to;
            return (
              <Link key={to} to={to} style={{
                color: label === "Quản trị" ? "#ffc107" : (active ? "#a8d5b5" : "rgba(255,255,255,0.75)"),
                textDecoration: "none", fontSize: "0.88rem", fontWeight: "700",
                padding: "8px 16px", borderRadius: "8px", background: active ? "rgba(168,213,181,0.1)" : "transparent",
                transition: "all 0.2s",
              }}
                onMouseOver={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.1)"; }}
                onMouseOut={(e) => { e.currentTarget.style.background = active ? "rgba(168,213,181,0.1)" : "transparent"; }}
              >
                {label}
              </Link>
            );
          })}

          {user ? (
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginLeft: "4px" }}>
              <div style={{
                width: "36px", height: "36px", borderRadius: "50%", background: "linear-gradient(135deg, #2d6e4e, #1a3c2e)",
                border: "2px solid rgba(168,213,181,0.4)", display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "0.85rem", fontWeight: "800", color: "#a8d5b5", flexShrink: 0,
              }}>
                {user.fullName?.charAt(0).toUpperCase() || "U"}
              </div>
              <button onClick={handleLogout} style={{
                padding: "6px 14px", background: "transparent", border: "1px solid rgba(255,255,255,0.2)",
                borderRadius: "8px", color: "rgba(255,255,255,0.6)", fontSize: "0.78rem", fontWeight: "600", cursor: "pointer"
              }}>
                Đăng xuất
              </button>
            </div>
          ) : (
            <Link to="/login" style={{ color: "rgba(255,255,255,0.75)", textDecoration: "none", fontSize: "0.88rem", padding: "8px 16px" }}>Đăng nhập</Link>
          )}

          <Link to="/checkout" style={{
            display: "flex", alignItems: "center", gap: "8px", marginLeft: "8px", padding: "9px 18px",
            background: "#1a3c2e", borderRadius: "10px", color: "#ffffff", textDecoration: "none", fontSize: "0.88rem", fontWeight: "700"
          }}>
            🛒 Giỏ hàng
          </Link>
        </div>
      </div>
    </nav>
  );
}

function AnnouncementBar() {
  return (
    <div style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 1001, background: "#0c1912", borderBottom: "1px solid rgba(168,213,181,0.15)", padding: "8px 0", overflow: "hidden" }}>
      <div style={{ display: "inline-flex", gap: "64px", whiteSpace: "nowrap", animation: "marquee 32s linear infinite", fontSize: "0.78rem", color: "rgba(255,255,255,0.65)" }}>
        <span>🔥 ĐANG TRONG CHẾ ĐỘ CÀI ĐẶT NHANH - QUẢN TRỊ MỞ TỰ DO 🔥</span>
        <span>🔥 ĐANG TRONG CHẾ ĐỘ CÀI ĐẶT NHANH - QUẢN TRỊ MỞ TỰ DO 🔥</span>
      </div>
      <style>{`@keyframes marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }`}</style>
    </div>
  );
}

function Layout() {
  const location = useLocation();
  const isHome = location.pathname === "/";
  const isAdminPage = location.pathname.startsWith("/admin");

  return (
    <div style={{ minHeight: "100vh", background: "#f5f4f0", fontFamily: "'Be Vietnam Pro', 'Segoe UI', sans-serif" }}>
      {!isAdminPage && <AnnouncementBar />}
      {!isAdminPage && <Navigation />}

      <div style={{ paddingTop: (isHome || isAdminPage) ? "0" : "100px" }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<Products />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/shipping" element={<ShippingAddress />} />
          
          {/* VÀO THẲNG KHÔNG CẦN CHECK ROLE */}
          <Route path="/admin" element={<AdminDashboard />} />
        </Routes>
      </div>

      {!isAdminPage && <Footer />}
    </div>
  );
}

function Footer() {
  return (
    <footer style={{ background: "#0c1912", padding: "48px 32px 28px" }}>
      <div style={{ maxWidth: "1280px", margin: "0 auto", textAlign: "center", color: "rgba(255,255,255,0.3)", fontSize: "0.8rem" }}>
        © 2026 Hệ thống VLXD Kiến Tạo — Quick Access Mode
      </div>
    </footer>
  );
}

function App() {
  return (
    <CartProvider>
      <BrowserRouter>
        <Layout />
      </BrowserRouter>
    </CartProvider>
  );
}

export default App;