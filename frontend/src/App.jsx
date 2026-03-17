import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Link, useLocation } from "react-router-dom";
import { CartProvider, useCart } from "./context/CartContext";
import Home from "./pages/Home";
import Products from "./pages/Products";
import Login from "./pages/Login";
import Checkout from "./pages/Checkout";
import Register from "./pages/Register";
import ProductDetail from "./pages/ProductDetail";
import ShippingAddress from "./pages/ShippingAddress";

function Navigation() {
  const { cartItems } = useCart();
  const location = useLocation();
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const isHome = location.pathname === "/";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Trên trang chủ: trong suốt khi chưa scroll, đổi sang tối khi scroll
  const transparent = isHome && !scrolled;

  const navBg = transparent
    ? "transparent"
    : "rgba(12, 25, 18, 0.97)";

  const navBorder = transparent
    ? "1px solid transparent"
    : "1px solid rgba(255,255,255,0.07)";

  return (
    <nav style={{
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      zIndex: 1000,
      background: navBg,
      borderBottom: navBorder,
      backdropFilter: transparent ? "none" : "blur(16px)",
      transition: "background 0.4s, border 0.4s, backdrop-filter 0.4s",
      fontFamily: "'Be Vietnam Pro', 'Segoe UI', sans-serif",
    }}>
      <div style={{
        maxWidth: "1280px",
        margin: "0 auto",
        padding: "0 32px",
        height: "68px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}>
        {/* Logo */}
        <Link to="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{
            width: "36px", height: "36px",
            background: "linear-gradient(135deg, #2d6e4e, #1a3c2e)",
            borderRadius: "9px",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "1.1rem",
            flexShrink: 0,
          }}>🏗️</div>
          <div>
            <div style={{ fontWeight: "800", fontSize: "1rem", color: "#ffffff", letterSpacing: "0.02em", lineHeight: 1 }}>
              KIẾN TẠO
            </div>
            <div style={{ fontSize: "0.62rem", color: "rgba(255,255,255,0.5)", letterSpacing: "0.12em", textTransform: "uppercase", lineHeight: 1, marginTop: "2px" }}>
              Vật liệu xây dựng
            </div>
          </div>
        </Link>

        {/* Desktop Links */}
        <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
          {[
            { to: "/", label: "Trang chủ" },
            { to: "/products", label: "Sản phẩm" },
            { to: "/login", label: "Đăng nhập" },
          ].map(({ to, label }) => {
            const active = location.pathname === to;
            return (
              <Link
                key={to}
                to={to}
                style={{
                  color: active ? "#a8d5b5" : "rgba(255,255,255,0.75)",
                  textDecoration: "none",
                  fontSize: "0.88rem",
                  fontWeight: active ? "700" : "500",
                  padding: "8px 16px",
                  borderRadius: "8px",
                  background: active ? "rgba(168,213,181,0.1)" : "transparent",
                  transition: "all 0.2s",
                }}
                onMouseOver={(e) => { if (!active) { e.currentTarget.style.color = "#fff"; e.currentTarget.style.background = "rgba(255,255,255,0.07)"; }}}
                onMouseOut={(e) => { if (!active) { e.currentTarget.style.color = "rgba(255,255,255,0.75)"; e.currentTarget.style.background = "transparent"; }}}
              >
                {label}
              </Link>
            );
          })}

          {/* Cart button */}
          <Link
            to="/checkout"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              marginLeft: "8px",
              padding: "9px 18px",
              background: "#1a3c2e",
              border: "1px solid rgba(168,213,181,0.25)",
              borderRadius: "10px",
              color: "#ffffff",
              textDecoration: "none",
              fontSize: "0.88rem",
              fontWeight: "700",
              transition: "all 0.2s",
              position: "relative",
            }}
            onMouseOver={(e) => { e.currentTarget.style.background = "#2d6e4e"; e.currentTarget.style.transform = "translateY(-1px)"; }}
            onMouseOut={(e) => { e.currentTarget.style.background = "#1a3c2e"; e.currentTarget.style.transform = "translateY(0)"; }}
          >
            <span style={{ fontSize: "1rem" }}>🛒</span>
            Giỏ hàng
            {totalItems > 0 && (
              <span style={{
                background: "#d85a30",
                color: "white",
                fontSize: "0.68rem",
                fontWeight: "800",
                minWidth: "18px",
                height: "18px",
                borderRadius: "999px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "0 4px",
              }}>
                {totalItems}
              </span>
            )}
          </Link>
        </div>
      </div>
    </nav>
  );
}

function AnnouncementBar() {
  return (
    <div style={{
      background: "#0c1912",
      borderBottom: "1px solid rgba(168,213,181,0.15)",
      padding: "8px 0",
      overflow: "hidden",
      fontFamily: "'Be Vietnam Pro', 'Segoe UI', sans-serif",
    }}>
      <div style={{
        display: "inline-flex",
        gap: "64px",
        whiteSpace: "nowrap",
        animation: "marquee 32s linear infinite",
        fontSize: "0.78rem",
        color: "rgba(255,255,255,0.65)",
        fontWeight: "500",
        letterSpacing: "0.02em",
      }}>
        {[
          "🔥 Giảm 10% Xi măng & Sắt thép mùa xây dựng",
          "🚚 Miễn phí giao hàng đơn từ 50 triệu VNĐ",
          "📞 Hotline: 0909.123.456 — Báo giá trong 30 phút",
          "✅ Hàng chính hãng, kiểm định chất lượng 100%",
          "🔥 Giảm 10% Xi măng & Sắt thép mùa xây dựng",
          "🚚 Miễn phí giao hàng đơn từ 50 triệu VNĐ",
          "📞 Hotline: 0909.123.456 — Báo giá trong 30 phút",
          "✅ Hàng chính hãng, kiểm định chất lượng 100%",
        ].map((text, i) => (
          <span key={i}>
            {text}
            <span style={{ marginLeft: "64px", color: "rgba(168,213,181,0.3)" }}>|</span>
          </span>
        ))}
      </div>
      <style>{`
        @keyframes marquee {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}

function Layout() {
  const location = useLocation();
  const isHome = location.pathname === "/";

  return (
    <div style={{ minHeight: "100vh", background: "#f5f4f0", fontFamily: "'Be Vietnam Pro', 'Segoe UI', sans-serif" }}>
      <AnnouncementBar />
      <Navigation />

      {/* Push content below fixed nav — except on Home (hero handles it) */}
      <div style={{ paddingTop: isHome ? "0" : "68px" }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<Products />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/shipping" element={<ShippingAddress />} />
        </Routes>
      </div>

      {/* Footer */}
      <footer style={{
        background: "#0c1912",
        borderTop: "1px solid rgba(168,213,181,0.1)",
        padding: "48px 32px 28px",
        fontFamily: "'Be Vietnam Pro', 'Segoe UI', sans-serif",
      }}>
        <div style={{
          maxWidth: "1280px",
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "40px",
          marginBottom: "40px",
        }}>
          {/* Brand */}
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "14px" }}>
              <div style={{
                width: "36px", height: "36px",
                background: "linear-gradient(135deg, #2d6e4e, #1a3c2e)",
                borderRadius: "9px",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "1.1rem",
              }}>🏗️</div>
              <span style={{ fontWeight: "800", color: "#fff", fontSize: "1rem" }}>KIẾN TẠO</span>
            </div>
            <p style={{ color: "rgba(255,255,255,0.45)", fontSize: "0.85rem", lineHeight: "1.7", margin: 0 }}>
              Đối tác tin cậy cung cấp vật liệu xây dựng chất lượng cao cho mọi công trình.
            </p>
          </div>

          {/* Links */}
          <div>
            <div style={{ color: "#a8d5b5", fontWeight: "700", fontSize: "0.8rem", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "14px" }}>Danh mục</div>
            {["Xi măng", "Sắt thép", "Gạch xây", "Cát & Đá"].map(item => (
              <div key={item} style={{ marginBottom: "8px" }}>
                <Link to="/products" style={{ color: "rgba(255,255,255,0.5)", textDecoration: "none", fontSize: "0.88rem", transition: "color 0.2s" }}
                  onMouseOver={(e) => e.currentTarget.style.color = "#fff"}
                  onMouseOut={(e) => e.currentTarget.style.color = "rgba(255,255,255,0.5)"}
                >{item}</Link>
              </div>
            ))}
          </div>

          {/* Contact */}
          <div>
            <div style={{ color: "#a8d5b5", fontWeight: "700", fontSize: "0.8rem", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "14px" }}>Liên hệ</div>
            {[
              { icon: "📞", text: "0909.123.456" },
              { icon: "✉️", text: "kientao@vlxd.vn" },
              { icon: "📍", text: "Đà Nẵng, Việt Nam" },
            ].map(({ icon, text }) => (
              <div key={text} style={{ display: "flex", gap: "8px", marginBottom: "10px", alignItems: "flex-start" }}>
                <span style={{ fontSize: "0.9rem" }}>{icon}</span>
                <span style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.88rem" }}>{text}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{
          borderTop: "1px solid rgba(255,255,255,0.07)",
          paddingTop: "20px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "8px",
        }}>
          <p style={{ color: "rgba(255,255,255,0.3)", fontSize: "0.8rem", margin: 0 }}>
            © 2026 Hệ thống VLXD Kiến Tạo — Đồ án chuyên ngành
          </p>
          <p style={{ color: "rgba(255,255,255,0.2)", fontSize: "0.75rem", margin: 0 }}>
            
          </p>
        </div>
      </footer>
    </div>
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
