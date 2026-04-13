import { useState, useEffect } from "react";
import { useCart } from "../context/CartContext";
import { useNavigate } from "react-router-dom";

// ================== API CONFIG ==================
const PRODUCT_API_URL = "http://localhost:5261/api/product";
const CATEGORY_API_URL = "http://localhost:5261/api/category";
const SERVER_URL = "http://localhost:5261";

const getImageUrl = (imagePath) => {
  if (!imagePath) return "https://via.placeholder.com/300x200?text=Chua+co+anh";
  if (imagePath.startsWith('/')) return `${SERVER_URL}${imagePath}`;
  return imagePath;
};

// Loại bỏ hàm hard-code CATEGORY_MAP. Thay vào đó, ta sẽ truyền map động vào normalizeProduct
function normalizeProduct(p, categoryMap) {
  return {
    id: p.id,
    name: p.name,
    price: Number(p.price),
    unit: p.unit || "Cái",
    image: p.image || "",
    // Dùng map động để lấy tên danh mục, mặc định là "Khác" nếu không tìm thấy
    category: categoryMap[p.categoryId] || categoryMap[p.category_id] || "Khác",
    brand: p.brand || "",
    stockQuantity: p.stockQuantity ?? p.stock_quantity ?? 0,
    description: p.description || "",
  };
}

export default function Products() {
  const { addToCart } = useCart();
  const navigate = useNavigate();

  const [items, setItems] = useState([]);
  // State mới để lưu trữ bản đồ danh mục { id: "Tên danh mục" }
  const [categoryMap, setCategoryMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Tất cả");
  const [searchTerm, setSearchTerm] = useState(""); 
  const [hoveredId, setHoveredId] = useState(null);
  const [addedId, setAddedId] = useState(null);

  useEffect(() => {
    // Hàm tải Dữ liệu Danh mục VÀ Sản phẩm song song
    const fetchData = async () => {
      setLoading(true);
      setError("");
      try {
        // 1. Tải Danh mục trước
        const catRes = await fetch(CATEGORY_API_URL);
        if (!catRes.ok) throw new Error(`Lỗi tải danh mục: ${catRes.status}`);
        const catData = await catRes.json();
        
        // Chuyển mảng danh mục thành object { 1: "Xi Măng", 2: "Sắt" } để tra cứu nhanh
        const catMap = {};
        catData.forEach(c => {
            catMap[c.id] = c.name;
        });
        setCategoryMap(catMap);

        // 2. Tải Sản phẩm
        const prodRes = await fetch(PRODUCT_API_URL);
        if (!prodRes.ok) throw new Error(`Lỗi tải sản phẩm: ${prodRes.status}`);
        const prodData = await prodRes.json();
        
        // Dùng catMap vừa tạo để map tên danh mục cho từng sản phẩm
        setItems(prodData.map(p => normalizeProduct(p, catMap)));

      } catch (err) {
        console.warn("Lỗi tải dữ liệu:", err.message);
        setError("Không thể kết nối đến máy chủ.");
        setItems([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const categories = ["Tất cả", ...new Set(items.map(i => i.category).filter(Boolean))];

  // LOGIC LỌC KÉP: Theo danh mục VÀ Theo từ khóa tìm kiếm
  const filteredItems = items.filter(item => {
    const matchCategory = selectedCategory === "Tất cả" || item.category === selectedCategory;
    const matchSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchCategory && matchSearch;
  });

  const handleAddToCart = (item) => {
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

      {/* SEARCH BAR SECTION */}
      <div style={styles.searchSection}>
        <div style={styles.searchBox}>
          <span style={styles.searchIcon}>🔍</span>
          <input
            type="text"
            placeholder="Tìm kiếm tên sản phẩm (ví dụ: Xi măng, Sắt phi 6...)"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={styles.searchInput}
          />
          {searchTerm && (
            <button onClick={() => setSearchTerm("")} style={styles.clearBtn}>✕</button>
          )}
        </div>
      </div>

      {error && <div style={styles.errorBanner}>⚠ {error}</div>}

      <div style={styles.filterBar}>
        {categories.map(cat => (
          <button
            key={cat}
            style={styles.filterBtn(selectedCategory === cat)}
            onClick={() => {
              setSelectedCategory(cat);
              // Tùy chọn: Xóa tìm kiếm khi đổi danh mục
              // setSearchTerm(""); 
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {!loading && (
        <p style={styles.resultCount}>Tìm thấy {filteredItems.length} sản phẩm</p>
      )}

      {loading ? (
        <div style={styles.grid}>
          {[1,2,3,4,5,6].map(i => (
            <div key={i} style={styles.skeletonCard} />
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
                  opacity: inStock ? 1 : 0.7,
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
                  {!inStock && <div style={styles.stockBadge}>Hết hàng</div>}
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
                    <button style={styles.btnDetail} onClick={() => navigate(`/product/${item.id}`)}>
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
          <div style={{fontSize: "3rem", marginBottom: "10px"}}>🔍</div>
          <p>Không tìm thấy sản phẩm nào khớp với từ khóa "<strong>{searchTerm}</strong>".</p>
          <button onClick={() => {setSearchTerm(""); setSelectedCategory("Tất cả")}} style={styles.resetBtn}>Xem tất cả sản phẩm</button>
        </div>
      )}
    </div>
  );
}

const styles = {
  page: { minHeight: "100vh", background: "#f5f4f0", padding: "40px 24px 60px", fontFamily: "'Be Vietnam Pro', 'Segoe UI', sans-serif" },
  header: { textAlign: "center", marginBottom: "32px" },
  headerTag: { display: "inline-block", background: "#1a3c2e", color: "#a8d5b5", fontSize: "0.72rem", fontWeight: "700", letterSpacing: "0.12em", textTransform: "uppercase", padding: "5px 14px", borderRadius: "20px", marginBottom: "14px" },
  headerTitle: { fontSize: "2.4rem", fontWeight: "800", color: "#1a1a1a", margin: "0 0 8px 0", letterSpacing: "-0.02em" },
  headerSub: { color: "#7a7a7a", fontSize: "1rem", margin: 0 },
  
  searchSection: { display: "flex", justifyContent: "center", marginBottom: "24px" },
  searchBox: { 
    display: "flex", alignItems: "center", background: "#fff", width: "100%", maxWidth: "600px", 
    padding: "0 18px", borderRadius: "12px", border: "1.5px solid #e0ddd8", transition: "all 0.3s",
    boxShadow: "0 2px 10px rgba(0,0,0,0.03)"
  },
  searchIcon: { fontSize: "1.1rem", color: "#aaa", marginRight: "12px" },
  searchInput: { flex: 1, border: "none", padding: "14px 0", fontSize: "0.95rem", outline: "none", color: "#333" },
  clearBtn: { background: "none", border: "none", cursor: "pointer", color: "#ccc", fontSize: "1rem" },

  filterBar: { display: "flex", justifyContent: "center", flexWrap: "wrap", gap: "10px", marginBottom: "40px" },
  filterBtn: (active) => ({ padding: "9px 22px", borderRadius: "999px", border: active ? "none" : "1.5px solid #d5d3cd", background: active ? "#1a3c2e" : "#ffffff", color: active ? "#ffffff" : "#444", fontSize: "0.88rem", fontWeight: "600", cursor: "pointer", transition: "all 0.2s" }),
  
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "28px", maxWidth: "1200px", margin: "0 auto" },
  card: { background: "#ffffff", borderRadius: "16px", overflow: "hidden", border: "1px solid #ebebeb", display: "flex", flexDirection: "column", transition: "transform 0.25s, box-shadow 0.25s", cursor: "default" },
  imageWrap: { height: "210px", overflow: "hidden", position: "relative", background: "#f0ede8", cursor: "pointer" },
  img: { width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.5s ease", display: "block" },
  categoryBadge: { position: "absolute", top: "14px", left: "14px", background: "rgba(26,60,46,0.88)", color: "#d4f0df", fontSize: "0.7rem", fontWeight: "700", letterSpacing: "0.1em", textTransform: "uppercase", padding: "4px 10px", borderRadius: "6px", backdropFilter: "blur(4px)" },
  stockBadge: { position: "absolute", top: "14px", right: "14px", background: "#fcebeb", color: "#a32d2d", fontSize: "0.7rem", fontWeight: "700", padding: "4px 10px", borderRadius: "6px" },
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
  empty: { textAlign: "center", padding: "80px 0", color: "#666", fontSize: "1rem" },
  resetBtn: { marginTop: "15px", padding: "10px 20px", background: "#1a3c2e", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "600" },
  skeletonCard: { background: "#fff", borderRadius: "16px", border: "1px solid #ebebeb", overflow: "hidden", height: "380px", animation: "shimmer 1.4s infinite" },
  errorBanner: { background: "#faeeda", border: "1px solid #fac775", borderRadius: "10px", padding: "10px 16px", fontSize: "0.82rem", color: "#854f0b", textAlign: "center", maxWidth: "500px", margin: "0 auto 24px" },
};