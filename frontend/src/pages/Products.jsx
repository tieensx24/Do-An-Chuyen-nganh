import { useState, useEffect } from "react";
import { useCart } from "../context/CartContext";
import { useNavigate } from "react-router-dom";

// ================== API CONFIG ==================
const API_URL = "http://localhost:5261/api/product";
const SERVER_URL = "http://localhost:5261";

// Hàm phụ: Xử lý link ảnh tĩnh từ Backend
const getImageUrl = (imagePath) => {
  if (!imagePath) return "https://via.placeholder.com/300x200?text=Chua+co+anh";
  if (imagePath.startsWith('/')) return `${SERVER_URL}${imagePath}`;
  return imagePath;
};

// Map category_id từ backend → tên hiển thị
const CATEGORY_MAP = {
  1: "Xi măng",
  2: "Sắt thép",
  3: "Gạch xây",
  4: "Cát đá",
};

// Chuẩn hóa sản phẩm từ API backend → format dùng trong UI
function normalizeProduct(p) {
  return {
    id: p.id,
    name: p.name,
    price: Number(p.price),
    unit: p.unit || "Cái",
    image: p.image || "",
    category: CATEGORY_MAP[p.categoryId] || CATEGORY_MAP[p.category_id] || "Khác",
    brand: p.brand || "",
    stockQuantity: p.stockQuantity ?? p.stock_quantity ?? 0,
    description: p.description || "",
  };
}

const styles = {
  page: { minHeight: "100vh", background: "#f5f4f0", padding: "40px 24px 60px", fontFamily: "'Be Vietnam Pro', 'Segoe UI', sans-serif" },
  header: { textAlign: "center", marginBottom: "48px" },
  headerTag: { display: "inline-block", background: "#1a3c2e", color: "#a8d5b5", fontSize: "0.72rem", fontWeight: "700", letterSpacing: "0.12em", textTransform: "uppercase", padding: "5px 14px", borderRadius: "20px", marginBottom: "14px" },
  headerTitle: { fontSize: "2.4rem", fontWeight: "800", color: "#1a1a1a", margin: "0 0 8px 0", letterSpacing: "-0.02em" },
  headerSub: { color: "#7a7a7a", fontSize: "1rem", margin: 0 },
  filterBar: { display: "flex", justifyContent: "center", flexWrap: "wrap", gap: "10px", marginBottom: "40px" },
  filterBtn: (active) => ({ padding: "9px 22px", borderRadius: "999px", border: active ? "none" : "1.5px solid #d5d3cd", background: active ? "#1a3c2e" : "#ffffff", color: active ? "#ffffff" : "#444", fontSize: "0.88rem", fontWeight: "600", cursor: "pointer", transition: "all 0.2s" }),
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "28px", maxWidth: "1200px", margin: "0 auto" },
  card: { background: "#ffffff", borderRadius: "16px", overflow: "hidden", border: "1px solid #ebebeb", display: "flex", flexDirection: "column", transition: "transform 0.25s, box-shadow 0.25s", cursor: "default" },
  imageWrap: { height: "210px", overflow: "hidden", position: "relative", background: "#f0ede8", cursor: "pointer" },
  img: { width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.5s ease", display: "block" },
  categoryBadge: { position: "absolute", top: "14px", left: "14px", background: "rgba(26,60,46,0.88)", color: "#d4f0df", fontSize: "0.7rem", fontWeight: "700", letterSpacing: "0.1em", textTransform: "uppercase", padding: "4px 10px", borderRadius: "6px", backdropFilter: "blur(4px)" },
  stockBadge: { position: "absolute", top: "14px", right: "14px", fontSize: "0.7rem", fontWeight: "700", padding: "4px 10px", borderRadius: "6px" },
  cardBody: { padding: "20px 22px 22px", display: "flex", flexDirection: "column", flexGrow: 1 },
  productName: { fontSize: "1.05rem", fontWeight: "700", color: "#1a1a1a", margin: "0 0 12px 0", lineHeight: "1.4", minHeight: "44px", cursor: "pointer" },
  divider: { border: "none", borderTop: "1px solid #f0eeea", margin: "0 0 14px 0" },
  priceRow: { display: "flex", alignItems: "baseline", gap: "6px", marginBottom: "20px" },
  price: { fontSize: "1.3rem", fontWeight: "800", color: "#c94a1a", letterSpacing: "-0.01em" },
  unit: { fontSize: "0.82rem", color: "#aaa", fontWeight: "400" },
  btnRow: { display: "flex", gap: "10px", marginTop: "auto" },
  btnDetail: { flex: 1, padding: "11px 0", background: "transparent", color: "#444", border: "1.5px solid #d5d3cd", borderRadius: "10px", cursor: "pointer", fontWeight: "600", fontSize: "0.88rem", transition: "all 0.2s" },
  btnCart: { flex: 1, padding: "11px 0", borderRadius: "10px", fontWeight: "700", fontSize: "0.88rem", transition: "background 0.2s", border: "none" },
  resultCount: { textAlign: "center", color: "#999", fontSize: "0.85rem", marginBottom: "28px", marginTop: "-16px" },
  empty: { textAlign: "center", padding: "80px 0", color: "#aaa", fontSize: "1rem" },
  skeletonCard: { background: "#fff", borderRadius: "16px", border: "1px solid #ebebeb", overflow: "hidden", height: "380px" },
  skeletonImg: { height: "210px", background: "linear-gradient(90deg, #f0eeea 25%, #e8e6e2 50%, #f0eeea 75%)", backgroundSize: "200% 100%", animation: "shimmer 1.4s infinite" },
  skeletonLine: (w) => ({ height: "14px", borderRadius: "6px", background: "linear-gradient(90deg, #f0eeea 25%, #e8e6e2 50%, #f0eeea 75%)", backgroundSize: "200% 100%", animation: "shimmer 1.4s infinite", width: w, margin: "0 22px 10px" }),
  errorBanner: { background: "#faeeda", border: "1px solid #fac775", borderRadius: "10px", padding: "10px 16px", fontSize: "0.82rem", color: "#854f0b", textAlign: "center", maxWidth: "500px", margin: "0 auto 24px" },
};

export default function Products() {
  const { addToCart } = useCart();
  const navigate = useNavigate();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Tất cả");
  const [hoveredId, setHoveredId] = useState(null);
  const [addedId, setAddedId] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await fetch(API_URL);
        if (!res.ok) throw new Error(`Server lỗi: ${res.status}`);
        const data = await res.json();
        setItems(data.map(normalizeProduct));
      } catch (err) {
        console.warn("Lỗi tải sản phẩm:", err.message);
        setError("Không thể tải dữ liệu từ máy chủ.");
        setItems([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const categories = ["Tất cả", ...new Set(items.map(i => i.category).filter(Boolean))];

  const filteredItems = selectedCategory === "Tất cả"
    ? items
    : items.filter(item => item.category === selectedCategory);

  const handleAddToCart = (item) => {
    // Đảm bảo lưu đúng định dạng ảnh vào giỏ hàng
    const cartItem = { ...item, image: getImageUrl(item.image) };
    addToCart(cartItem);
    setAddedId(item.id);
    setTimeout(() => setAddedId(null), 1200);
  };

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div style={styles.headerTag}>Vật liệu xây dựng</div>
        <h1 style={styles.headerTitle}>Danh Mục Sản Phẩm</h1>
        <p style={styles.headerSub}>Vật liệu chất lượng cao, giá cạnh tranh — giao tận công trình</p>
      </div>

      {error && <div style={styles.errorBanner}>⚠ {error}</div>}

      <div style={styles.filterBar}>
        {categories.map(cat => (
          <button
            key={cat}
            style={styles.filterBtn(selectedCategory === cat)}
            onClick={() => setSelectedCategory(cat)}
            onMouseOver={(e) => { if (selectedCategory !== cat) { e.currentTarget.style.background = "#f5f4f0"; e.currentTarget.style.borderColor = "#aaa"; }}}
            onMouseOut={(e) => { if (selectedCategory !== cat) { e.currentTarget.style.background = "#ffffff"; e.currentTarget.style.borderColor = "#d5d3cd"; }}}
          >
            {cat}
          </button>
        ))}
      </div>

      {!loading && (
        <p style={styles.resultCount}>{filteredItems.length} sản phẩm</p>
      )}

      {loading ? (
        <div style={styles.grid}>
          {[1,2,3,4,5,6].map(i => (
            <div key={i} style={styles.skeletonCard}>
              <div style={styles.skeletonImg} />
              <div style={{ padding: "20px 0 0" }}>
                <div style={styles.skeletonLine("60%")} />
                <div style={styles.skeletonLine("80%")} />
                <div style={styles.skeletonLine("40%")} />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={styles.grid}>
          {filteredItems.map(item => {
            const inStock = item.stockQuantity > 0;
            return (
              <div
                key={item.id}
                style={{
                  ...styles.card,
                  opacity: inStock ? 1 : 0.7, // Làm mờ thẻ nếu hết hàng
                  transform: hoveredId === item.id ? "translateY(-6px)" : "translateY(0)",
                  boxShadow: hoveredId === item.id ? "0 16px 40px rgba(0,0,0,0.10)" : "0 2px 8px rgba(0,0,0,0.04)",
                }}
                onMouseEnter={() => setHoveredId(item.id)}
                onMouseLeave={() => setHoveredId(null)}
              >
                <div style={styles.imageWrap} onClick={() => navigate(`/product/${item.id}`)}>
                  <img
                    src={getImageUrl(item.image)}
                    alt={item.name}
                    style={{ ...styles.img, transform: hoveredId === item.id ? "scale(1.07)" : "scale(1)" }}
                    onError={(e) => { e.target.src = "https://via.placeholder.com/300x200?text=Loi+anh"; }}
                  />
                  <div style={styles.categoryBadge}>{item.category}</div>
                  {!inStock && (
                    <div style={{...styles.stockBadge, background: "#fcebeb", color: "#a32d2d"}}>
                      Hết hàng
                    </div>
                  )}
                </div>

                <div style={styles.cardBody}>
                  <h3 style={styles.productName} onClick={() => navigate(`/product/${item.id}`)}>
                    {item.name}
                  </h3>
                  <hr style={styles.divider} />
                  <div style={styles.priceRow}>
                    <span style={{...styles.price, color: inStock ? "#c94a1a" : "#aaa"}}>{item.price.toLocaleString("vi-VN")} ₫</span>
                    <span style={styles.unit}>/ {item.unit}</span>
                  </div>
                  
                  <div style={styles.btnRow}>
                    <button
                      style={styles.btnDetail}
                      onClick={() => navigate(`/product/${item.id}`)}
                      onMouseOver={(e) => { e.currentTarget.style.background = "#f5f4f0"; e.currentTarget.style.borderColor = "#aaa"; }}
                      onMouseOut={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.borderColor = "#d5d3cd"; }}
                    >
                      Chi tiết
                    </button>
                    <button
                      style={{ 
                        ...styles.btnCart, 
                        background: !inStock ? "#e0ddd8" : (addedId === item.id ? "#2d6e4e" : "#1a3c2e"),
                        color: !inStock ? "#999" : "#ffffff",
                        cursor: !inStock ? "not-allowed" : "pointer",
                      }}
                      disabled={!inStock}
                      onClick={() => handleAddToCart(item)}
                      onMouseOver={(e) => { if (inStock) e.currentTarget.style.background = "#2d6e4e"; }}
                      onMouseOut={(e) => { if (inStock) e.currentTarget.style.background = addedId === item.id ? "#2d6e4e" : "#1a3c2e"; }}
                    >
                      {!inStock ? "Hết hàng" : (addedId === item.id ? "✓ Đã thêm" : "+ Giỏ hàng")}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {!loading && filteredItems.length === 0 && (
        <div style={styles.empty}>
          <p>Hiện chưa có sản phẩm nào thuộc loại này.</p>
        </div>
      )}

      <style>{`
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </div>
  );
}