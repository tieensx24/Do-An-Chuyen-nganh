import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';

const mockDb = [
  { id: 1, name: "Xi măng Hà Tiên 1", price: 85000, unit: "Bao", stock_quantity: 200, brand: "Hà Tiên", category: "Xi măng", description: "Xi măng đa dụng chất lượng cao, chuyên dùng cho xây tô, đổ bê tông móng, sàn, cột. Chống thấm tốt, độ bền cao với thời gian.", image: "/ximang.jpg" },
  { id: 2, name: "Sắt cuộn Phi 6 Hòa Phát", price: 15800, unit: "Kg", stock_quantity: 1000, brand: "Hòa Phát", category: "Sắt thép", description: "Thép cuộn trơn tròn, dẻo dai, dễ uốn. Phù hợp làm cốt thép đai cho các công trình xây dựng dân dụng và công nghiệp.", image: "/sat-thep.jpg" },
  { id: 3, name: "Gạch ống Tuynel 4 lỗ", price: 1250, unit: "Viên", stock_quantity: 50000, brand: "Tuynel Đồng Nai", category: "Gạch xây", description: "Gạch đất sét nung công nghệ cao, màu đỏ tươi, kích thước chuẩn. Cách âm, cách nhiệt cực tốt cho tường nhà.", image: "/gach.jpg" },
  { id: 4, name: "Cát vàng xây tô", price: 450000, unit: "Khối", stock_quantity: 50, brand: "Khai thác tự nhiên", category: "Cát đá", description: "Cát vàng hạt trung, đã qua sàng lọc sạch tạp chất. Đảm bảo lớp vữa xây tô bám dính tốt, không nứt nẻ bề mặt.", image: "/cat-vang.jpg" },
  { id: 5, name: "Đá 1x2 xanh", price: 320000, unit: "Khối", stock_quantity: 30, brand: "Khai thác tự nhiên", category: "Cát đá", description: "Đá xanh biên hòa cường độ nén cao, chuyên dụng đổ bê tông tươi, sàn, móng chịu lực lớn cho các công trình cao tầng.", image: "/da-1x2.jpg" },
];

export default function ProductDetail() {
  const { id } = useParams();
  const { addToCart } = useCart();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    const found = mockDb.find(item => item.id === parseInt(id));
    setProduct(found || null);
    setQuantity(1);
    setAdded(false);
  }, [id]);

  if (!product) return (
    <div style={s.loading}>
      <div style={s.loadingSpinner} />
      <p style={{ color: "#aaa", marginTop: "16px", fontSize: "0.9rem" }}>Đang tải sản phẩm...</p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  const inStock = product.stock_quantity > 0;

  const handleQty = (type) => {
    if (type === 'minus' && quantity > 1) setQuantity(q => q - 1);
    if (type === 'plus' && quantity < product.stock_quantity) setQuantity(q => q + 1);
  };

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) addToCart(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  // Related products
  const related = mockDb.filter(p => p.category === product.category && p.id !== product.id);

  return (
    <div style={s.page}>
      {/* Breadcrumb */}
      <div style={s.breadcrumb}>
        <Link to="/" style={s.crumbLink}>Trang chủ</Link>
        <span style={s.crumbSep}>›</span>
        <Link to="/products" style={s.crumbLink}>Sản phẩm</Link>
        <span style={s.crumbSep}>›</span>
        <span style={s.crumbCurrent}>{product.name}</span>
      </div>

      {/* Main card */}
      <div style={s.card}>
        {/* Image */}
        <div style={s.imageCol}>
          <div style={s.imageWrap}>
            <img
              src={product.image}
              alt={product.name}
              style={s.img}
              onError={(e) => { e.target.src = "https://via.placeholder.com/600x600?text=Chua+co+anh"; }}
            />
            <div style={s.categoryBadge}>{product.category}</div>
          </div>
        </div>

        {/* Info */}
        <div style={s.infoCol}>
          {/* Brand + stock */}
          <div style={s.metaRow}>
            <span style={s.brand}>{product.brand}</span>
            <span style={{
              ...s.stockBadge,
              background: inStock ? "#eaf3de" : "#fcebeb",
              color: inStock ? "#3b6d11" : "#a32d2d",
            }}>
              {inStock ? `● Còn hàng` : "● Hết hàng"}
            </span>
          </div>

          <h1 style={s.title}>{product.name}</h1>

          {/* Price box */}
          <div style={s.priceBox}>
            <div style={s.priceMain}>
              {product.price.toLocaleString("vi-VN")}
              <span style={s.priceCurrency}> ₫</span>
            </div>
            <div style={s.priceUnit}>/ {product.unit}</div>
          </div>

          {/* Description */}
          <div style={s.descBox}>
            <div style={s.descTitle}>Mô tả sản phẩm</div>
            <p style={s.desc}>{product.description}</p>
          </div>

          {/* Specs */}
          <div style={s.specGrid}>
            {[
              { label: "Thương hiệu", value: product.brand },
              { label: "Đơn vị tính", value: product.unit },
              { label: "Danh mục", value: product.category },
              { label: "Tồn kho", value: `${product.stock_quantity.toLocaleString()} ${product.unit}` },
            ].map(({ label, value }) => (
              <div key={label} style={s.specItem}>
                <div style={s.specLabel}>{label}</div>
                <div style={s.specVal}>{value}</div>
              </div>
            ))}
          </div>

          {/* Quantity + CTA */}
          <div style={s.actionRow}>
            <div style={s.qtyWrap}>
              <button
                style={s.qtyBtn}
                onClick={() => handleQty('minus')}
                onMouseOver={(e) => e.currentTarget.style.background = "#e8e6e1"}
                onMouseOut={(e) => e.currentTarget.style.background = "#f5f4f0"}
              >−</button>
              <span style={s.qtyNum}>{quantity}</span>
              <button
                style={s.qtyBtn}
                onClick={() => handleQty('plus')}
                onMouseOver={(e) => e.currentTarget.style.background = "#e8e6e1"}
                onMouseOut={(e) => e.currentTarget.style.background = "#f5f4f0"}
              >+</button>
            </div>

            <button
              style={{
                ...s.cartBtn,
                background: added ? "#2d6e4e" : "#1a3c2e",
                flex: 1,
              }}
              onClick={handleAddToCart}
              disabled={!inStock}
              onMouseOver={(e) => { if (inStock && !added) e.currentTarget.style.background = "#2d6e4e"; }}
              onMouseOut={(e) => { if (!added) e.currentTarget.style.background = "#1a3c2e"; }}
            >
              {added ? "✓  Đã thêm vào giỏ" : "Thêm vào giỏ hàng"}
            </button>

            <button
              style={s.checkoutBtn}
              onClick={() => { handleAddToCart(); navigate("/checkout"); }}
              onMouseOver={(e) => e.currentTarget.style.background = "#d85a30"}
              onMouseOut={(e) => e.currentTarget.style.background = "#c94a1a"}
            >
              Đặt ngay
            </button>
          </div>

          {/* Total preview */}
          {quantity > 1 && (
            <div style={s.totalPreview}>
              Tổng tạm tính: <strong style={{ color: "#c94a1a" }}>
                {(product.price * quantity).toLocaleString("vi-VN")} ₫
              </strong>
            </div>
          )}
        </div>
      </div>

      {/* Related products */}
      {related.length > 0 && (
        <div style={s.related}>
          <div style={s.relatedTitle}>Sản phẩm cùng loại</div>
          <div style={s.relatedGrid}>
            {related.map(item => (
              <div
                key={item.id}
                style={s.relatedCard}
                onClick={() => navigate(`/product/${item.id}`)}
                onMouseOver={(e) => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "0 12px 32px rgba(0,0,0,0.09)"; }}
                onMouseOut={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.04)"; }}
              >
                <div style={s.relatedImg}>
                  <img src={item.image} alt={item.name} style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    onError={(e) => { e.target.src = "https://via.placeholder.com/200x150?text=No+image"; }} />
                </div>
                <div style={{ padding: "14px" }}>
                  <div style={s.relatedName}>{item.name}</div>
                  <div style={s.relatedPrice}>{item.price.toLocaleString("vi-VN")} ₫ <span style={s.relatedUnit}>/ {item.unit}</span></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

const s = {
  page: {
    minHeight: "100vh",
    background: "#f5f4f0",
    padding: "40px 24px 80px",
    fontFamily: "'Be Vietnam Pro', 'Segoe UI', sans-serif",
    maxWidth: "1200px",
    margin: "0 auto",
  },
  loading: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "60vh",
  },
  loadingSpinner: {
    width: "36px", height: "36px",
    border: "3px solid #e0ddd8",
    borderTopColor: "#1a3c2e",
    borderRadius: "50%",
    animation: "spin 0.8s linear infinite",
  },
  breadcrumb: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    marginBottom: "28px",
    fontSize: "0.83rem",
  },
  crumbLink: {
    color: "#888",
    textDecoration: "none",
    fontWeight: "500",
    transition: "color 0.2s",
  },
  crumbSep: { color: "#ccc" },
  crumbCurrent: { color: "#1a1a1a", fontWeight: "600" },
  card: {
    background: "#fff",
    borderRadius: "20px",
    border: "1px solid #ebebeb",
    display: "flex",
    flexWrap: "wrap",
    gap: "0",
    overflow: "hidden",
    marginBottom: "48px",
  },
  imageCol: {
    flex: "1 1 420px",
    background: "#f9f8f5",
    position: "relative",
  },
  imageWrap: {
    position: "relative",
    height: "100%",
    minHeight: "440px",
  },
  img: {
    width: "100%",
    height: "100%",
    minHeight: "440px",
    objectFit: "cover",
    display: "block",
  },
  categoryBadge: {
    position: "absolute",
    top: "20px",
    left: "20px",
    background: "rgba(26,60,46,0.88)",
    color: "#d4f0df",
    fontSize: "0.7rem",
    fontWeight: "700",
    letterSpacing: "0.1em",
    textTransform: "uppercase",
    padding: "5px 12px",
    borderRadius: "6px",
  },
  infoCol: {
    flex: "1 1 440px",
    padding: "40px",
    display: "flex",
    flexDirection: "column",
    gap: "0",
  },
  metaRow: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    marginBottom: "12px",
  },
  brand: {
    fontSize: "0.8rem",
    fontWeight: "700",
    color: "#2d6e4e",
    letterSpacing: "0.06em",
    textTransform: "uppercase",
  },
  stockBadge: {
    fontSize: "0.75rem",
    fontWeight: "700",
    padding: "4px 10px",
    borderRadius: "999px",
  },
  title: {
    fontSize: "clamp(1.5rem, 3vw, 2rem)",
    fontWeight: "900",
    color: "#1a1a1a",
    margin: "0 0 24px",
    lineHeight: "1.25",
    letterSpacing: "-0.02em",
  },
  priceBox: {
    display: "flex",
    alignItems: "baseline",
    gap: "8px",
    background: "#faf9f7",
    border: "1px solid #f0eeea",
    borderRadius: "12px",
    padding: "18px 22px",
    marginBottom: "24px",
  },
  priceMain: {
    fontSize: "2.2rem",
    fontWeight: "900",
    color: "#c94a1a",
    letterSpacing: "-0.03em",
    lineHeight: 1,
  },
  priceCurrency: { fontSize: "1.2rem" },
  priceUnit: {
    fontSize: "0.9rem",
    color: "#aaa",
    fontWeight: "500",
  },
  descBox: { marginBottom: "24px" },
  descTitle: {
    fontSize: "0.8rem",
    fontWeight: "700",
    color: "#333",
    letterSpacing: "0.06em",
    textTransform: "uppercase",
    marginBottom: "8px",
  },
  desc: {
    fontSize: "0.9rem",
    color: "#666",
    lineHeight: "1.8",
    margin: 0,
  },
  specGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "10px",
    marginBottom: "28px",
  },
  specItem: {
    background: "#faf9f7",
    borderRadius: "8px",
    padding: "10px 14px",
  },
  specLabel: { fontSize: "0.72rem", color: "#aaa", fontWeight: "600", marginBottom: "3px", textTransform: "uppercase", letterSpacing: "0.05em" },
  specVal: { fontSize: "0.88rem", fontWeight: "700", color: "#1a1a1a" },
  actionRow: {
    display: "flex",
    gap: "10px",
    alignItems: "center",
    flexWrap: "wrap",
    marginBottom: "12px",
  },
  qtyWrap: {
    display: "flex",
    alignItems: "center",
    border: "1.5px solid #e0ddd8",
    borderRadius: "10px",
    overflow: "hidden",
    background: "#fff",
    flexShrink: 0,
  },
  qtyBtn: {
    width: "38px",
    height: "44px",
    background: "#f5f4f0",
    border: "none",
    cursor: "pointer",
    fontSize: "1.1rem",
    color: "#444",
    transition: "background 0.15s",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  qtyNum: {
    minWidth: "44px",
    textAlign: "center",
    fontSize: "1rem",
    fontWeight: "800",
    color: "#1a1a1a",
    borderLeft: "1px solid #e0ddd8",
    borderRight: "1px solid #e0ddd8",
    lineHeight: "44px",
  },
  cartBtn: {
    padding: "13px 20px",
    color: "white",
    border: "none",
    borderRadius: "10px",
    fontSize: "0.9rem",
    fontWeight: "700",
    cursor: "pointer",
    transition: "all 0.2s",
    letterSpacing: "0.01em",
  },
  checkoutBtn: {
    padding: "13px 20px",
    background: "#c94a1a",
    color: "white",
    border: "none",
    borderRadius: "10px",
    fontSize: "0.9rem",
    fontWeight: "700",
    cursor: "pointer",
    transition: "background 0.2s",
    flexShrink: 0,
  },
  totalPreview: {
    fontSize: "0.85rem",
    color: "#888",
    background: "#faf9f7",
    padding: "10px 14px",
    borderRadius: "8px",
  },
  related: { marginTop: "8px" },
  relatedTitle: {
    fontSize: "1.1rem",
    fontWeight: "800",
    color: "#1a1a1a",
    marginBottom: "20px",
    letterSpacing: "-0.01em",
  },
  relatedGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
    gap: "16px",
  },
  relatedCard: {
    background: "#fff",
    borderRadius: "14px",
    border: "1px solid #ebebeb",
    overflow: "hidden",
    cursor: "pointer",
    transition: "transform 0.2s, box-shadow 0.2s",
  },
  relatedImg: { height: "140px", overflow: "hidden", background: "#f5f4f0" },
  relatedName: { fontSize: "0.88rem", fontWeight: "700", color: "#1a1a1a", marginBottom: "6px", lineHeight: "1.35" },
  relatedPrice: { fontSize: "0.95rem", fontWeight: "800", color: "#c94a1a" },
  relatedUnit: { fontSize: "0.75rem", color: "#aaa", fontWeight: "400" },
};
