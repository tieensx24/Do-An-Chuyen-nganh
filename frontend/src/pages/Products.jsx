import { useState } from "react";
import { useCart } from "../context/CartContext";
import { useNavigate } from "react-router-dom";

const styles = {
  page: {
    minHeight: "100vh",
    background: "#f5f4f0",
    padding: "40px 24px 60px",
    fontFamily: "'Be Vietnam Pro', 'Segoe UI', sans-serif",
  },
  header: {
    textAlign: "center",
    marginBottom: "48px",
  },
  headerTag: {
    display: "inline-block",
    background: "#1a3c2e",
    color: "#a8d5b5",
    fontSize: "0.72rem",
    fontWeight: "700",
    letterSpacing: "0.12em",
    textTransform: "uppercase",
    padding: "5px 14px",
    borderRadius: "20px",
    marginBottom: "14px",
  },
  headerTitle: {
    fontSize: "2.4rem",
    fontWeight: "800",
    color: "#1a1a1a",
    margin: "0 0 8px 0",
    letterSpacing: "-0.02em",
  },
  headerSub: {
    color: "#7a7a7a",
    fontSize: "1rem",
    margin: 0,
  },
  filterBar: {
    display: "flex",
    justifyContent: "center",
    flexWrap: "wrap",
    gap: "10px",
    marginBottom: "40px",
  },
  filterBtn: (active) => ({
    padding: "9px 22px",
    borderRadius: "999px",
    border: active ? "none" : "1.5px solid #d5d3cd",
    background: active ? "#1a3c2e" : "#ffffff",
    color: active ? "#ffffff" : "#444",
    fontSize: "0.88rem",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.2s",
    letterSpacing: "0.01em",
  }),
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
    gap: "28px",
    maxWidth: "1200px",
    margin: "0 auto",
  },
  card: {
    background: "#ffffff",
    borderRadius: "16px",
    overflow: "hidden",
    border: "1px solid #ebebeb",
    display: "flex",
    flexDirection: "column",
    transition: "transform 0.25s, box-shadow 0.25s",
    cursor: "default",
  },
  imageWrap: {
    height: "210px",
    overflow: "hidden",
    position: "relative",
    background: "#f0ede8",
    cursor: "pointer",
  },
  img: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    transition: "transform 0.5s ease",
    display: "block",
  },
  categoryBadge: {
    position: "absolute",
    top: "14px",
    left: "14px",
    background: "rgba(26, 60, 46, 0.88)",
    color: "#d4f0df",
    fontSize: "0.7rem",
    fontWeight: "700",
    letterSpacing: "0.1em",
    textTransform: "uppercase",
    padding: "4px 10px",
    borderRadius: "6px",
    backdropFilter: "blur(4px)",
  },
  cardBody: {
    padding: "20px 22px 22px",
    display: "flex",
    flexDirection: "column",
    flexGrow: 1,
  },
  productName: {
    fontSize: "1.05rem",
    fontWeight: "700",
    color: "#1a1a1a",
    margin: "0 0 12px 0",
    lineHeight: "1.4",
    minHeight: "44px",
    cursor: "pointer",
  },
  divider: {
    border: "none",
    borderTop: "1px solid #f0eeea",
    margin: "0 0 14px 0",
  },
  priceRow: {
    display: "flex",
    alignItems: "baseline",
    gap: "6px",
    marginBottom: "20px",
  },
  price: {
    fontSize: "1.3rem",
    fontWeight: "800",
    color: "#c94a1a",
    letterSpacing: "-0.01em",
  },
  unit: {
    fontSize: "0.82rem",
    color: "#aaa",
    fontWeight: "400",
  },
  btnRow: {
    display: "flex",
    gap: "10px",
    marginTop: "auto",
  },
  btnDetail: {
    flex: 1,
    padding: "11px 0",
    background: "transparent",
    color: "#444",
    border: "1.5px solid #d5d3cd",
    borderRadius: "10px",
    cursor: "pointer",
    fontWeight: "600",
    fontSize: "0.88rem",
    transition: "all 0.2s",
  },
  btnCart: {
    flex: 1,
    padding: "11px 0",
    background: "#1a3c2e",
    color: "#ffffff",
    border: "none",
    borderRadius: "10px",
    cursor: "pointer",
    fontWeight: "700",
    fontSize: "0.88rem",
    transition: "background 0.2s",
  },
  empty: {
    textAlign: "center",
    padding: "80px 0",
    color: "#aaa",
    fontSize: "1rem",
  },
  resultCount: {
    textAlign: "center",
    color: "#999",
    fontSize: "0.85rem",
    marginBottom: "28px",
    marginTop: "-16px",
  },
};

export default function Products() {
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState("Tất cả");
  const [hoveredId, setHoveredId] = useState(null);
  const [addedId, setAddedId] = useState(null);

  const items = [
    { id: 1, name: "Xi măng Hà Tiên 1", price: 85000, unit: "Bao", image: "/ximang.jpg", category: "Xi măng" },
    { id: 2, name: "Sắt cuộn Phi 6 Hòa Phát", price: 15800, unit: "Kg", image: "/sat-thep.jpg", category: "Sắt thép" },
    { id: 3, name: "Gạch ống Tuynel 4 lỗ", price: 1250, unit: "Viên", image: "/gach.jpg", category: "Gạch xây" },
    { id: 4, name: "Cát vàng xây tô", price: 450000, unit: "Khối", image: "/cat-vang.jpg", category: "Cát đá" },
    { id: 5, name: "Đá 1x2 xanh", price: 320000, unit: "Khối", image: "/da-1x2.jpg", category: "Cát đá" },
  ];

  const categories = ["Tất cả", "Xi măng", "Sắt thép", "Gạch xây", "Cát đá"];

  const filteredItems = selectedCategory === "Tất cả"
    ? items
    : items.filter(item => item.category === selectedCategory);

  const handleAddToCart = (item) => {
    addToCart(item);
    setAddedId(item.id);
    setTimeout(() => setAddedId(null), 1200);
  };

  return (
    <div style={styles.page}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerTag}>Vật liệu xây dựng</div>
        <h1 style={styles.headerTitle}>Danh Mục Sản Phẩm</h1>
        <p style={styles.headerSub}>Vật liệu chất lượng cao, giá cạnh tranh — giao tận công trình</p>
      </div>

      {/* Filter Tabs */}
      <div style={styles.filterBar}>
        {categories.map(cat => (
          <button
            key={cat}
            style={styles.filterBtn(selectedCategory === cat)}
            onClick={() => setSelectedCategory(cat)}
            onMouseOver={(e) => {
              if (selectedCategory !== cat) {
                e.currentTarget.style.background = "#f5f4f0";
                e.currentTarget.style.borderColor = "#aaa";
              }
            }}
            onMouseOut={(e) => {
              if (selectedCategory !== cat) {
                e.currentTarget.style.background = "#ffffff";
                e.currentTarget.style.borderColor = "#d5d3cd";
              }
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Result count */}
      <p style={styles.resultCount}>
        {filteredItems.length} sản phẩm
      </p>

      {/* Grid */}
      <div style={styles.grid}>
        {filteredItems.map(item => (
          <div
            key={item.id}
            style={{
              ...styles.card,
              transform: hoveredId === item.id ? "translateY(-6px)" : "translateY(0)",
              boxShadow: hoveredId === item.id
                ? "0 16px 40px rgba(0,0,0,0.10)"
                : "0 2px 8px rgba(0,0,0,0.04)",
            }}
            onMouseEnter={() => setHoveredId(item.id)}
            onMouseLeave={() => setHoveredId(null)}
          >
            {/* Image */}
            <div style={styles.imageWrap} onClick={() => navigate(`/product/${item.id}`)}>
              <img
                src={item.image}
                alt={item.name}
                style={{
                  ...styles.img,
                  transform: hoveredId === item.id ? "scale(1.07)" : "scale(1)",
                }}
                onError={(e) => {
                  e.target.src = "https://images2.thanhnien.vn/528068263637045248/2024/3/4/doi-cat-17095366808631661694876.jpg";
                }}
              />
              <div style={styles.categoryBadge}>{item.category}</div>
            </div>

            {/* Body */}
            <div style={styles.cardBody}>
              <h3
                style={styles.productName}
                onClick={() => navigate(`/product/${item.id}`)}
              >
                {item.name}
              </h3>
              <hr style={styles.divider} />
              <div style={styles.priceRow}>
                <span style={styles.price}>{item.price.toLocaleString("vi-VN")} ₫</span>
                <span style={styles.unit}>/ {item.unit}</span>
              </div>

              <div style={styles.btnRow}>
                <button
                  style={styles.btnDetail}
                  onClick={() => navigate(`/product/${item.id}`)}
                  onMouseOver={(e) => {
                    e.currentTarget.style.background = "#f5f4f0";
                    e.currentTarget.style.borderColor = "#aaa";
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.background = "transparent";
                    e.currentTarget.style.borderColor = "#d5d3cd";
                  }}
                >
                  Chi tiết
                </button>
                <button
                  style={{
                    ...styles.btnCart,
                    background: addedId === item.id ? "#2d6e4e" : "#1a3c2e",
                  }}
                  onClick={() => handleAddToCart(item)}
                  onMouseOver={(e) => {
                    e.currentTarget.style.background = "#2d6e4e";
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.background = addedId === item.id ? "#2d6e4e" : "#1a3c2e";
                  }}
                >
                  {addedId === item.id ? "✓ Đã thêm" : "+ Giỏ hàng"}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredItems.length === 0 && (
        <div style={styles.empty}>
          <p>Hiện chưa có sản phẩm nào thuộc loại này.</p>
        </div>
      )}
    </div>
  );
}
