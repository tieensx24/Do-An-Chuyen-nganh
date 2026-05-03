import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";

const API_BASE = "http://localhost:5261/api";

export default function Checkout() {
  const {
    cartItems,
    appliedCoupon,
    removeFromCart,
    updateQuantity,
    getTotalPrice,
    getDiscountAmount,
    getFinalTotal,
    applyCoupon,
    removeCoupon,
  } = useCart();

  const navigate = useNavigate();
  const [couponCode, setCouponCode] = useState(appliedCoupon?.code || "");
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState("");
  const [couponSuccess, setCouponSuccess] = useState("");

  const subtotal = getTotalPrice();
  const discountAmount = getDiscountAmount();
  const finalTotal = getFinalTotal();
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const couponEligible = !appliedCoupon || subtotal >= Number(appliedCoupon.minOrder || 0);

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      setCouponError("Vui lòng nhập mã giảm giá.");
      setCouponSuccess("");
      return;
    }

    setCouponLoading(true);
    setCouponError("");
    setCouponSuccess("");

    try {
      const res = await fetch(`${API_BASE}/coupon/validate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: couponCode.trim(),
          subtotal,
        }),
      });

      const text = await res.text();
      const data = text ? JSON.parse(text) : {};

      if (!res.ok) {
        setCouponError(data.message || "Không thể áp mã giảm giá.");
        return;
      }

      applyCoupon(data.coupon);
      setCouponCode(data.coupon.code);
      setCouponSuccess(data.message || "Áp mã thành công.");
    } catch {
      setCouponError("Không thể kết nối server để kiểm tra mã.");
    } finally {
      setCouponLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    removeCoupon();
    setCouponCode("");
    setCouponError("");
    setCouponSuccess("");
  };

  return (
    <div style={s.page}>
      <div style={s.header}>
        <div style={s.headerTag}>Thanh toán</div>
        <h1 style={s.headerTitle}>Chi Tiết Đơn Hàng</h1>
      </div>

      {cartItems.length === 0 ? (
        <div style={s.emptyWrap}>
          <div style={s.emptyIcon}>🛒</div>
          <p style={s.emptyTitle}>Giỏ hàng đang trống</p>
          <p style={s.emptySub}>Hãy chọn vật liệu bạn cần từ danh mục sản phẩm</p>
          <button style={s.shopBtn} onClick={() => navigate("/products")}>
            Xem sản phẩm
          </button>
        </div>
      ) : (
        <div style={s.layout}>
          <div style={s.left}>
            <div style={s.card}>
              <div style={s.cardHeader}>
                <span style={s.cardTitle}>Sản phẩm</span>
                <span style={s.itemCount}>{totalItems} sản phẩm</span>
              </div>

              <div style={s.itemList}>
                {cartItems.map((item, idx) => (
                  <div
                    key={item.id}
                    style={{
                      ...s.itemRow,
                      borderTop: idx === 0 ? "none" : "1px solid #f0eeea",
                    }}
                  >
                    <div style={s.itemImg}>
                      <img
                        src={item.image}
                        alt={item.name}
                        style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "10px" }}
                        onError={(e) => {
                          e.target.style.display = "none";
                        }}
                      />
                    </div>

                    <div style={s.itemInfo}>
                      <div style={s.itemCategory}>{item.category}</div>
                      <div style={s.itemName}>{item.name}</div>
                      <div style={s.itemUnit}>Đơn vị: {item.unit}</div>
                    </div>

                    <div style={s.itemRight}>
                      <div style={s.qtyRow}>
                        <button
                          style={s.qtyBtn}
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        >
                          −
                        </button>
                        <span style={s.qtyNum}>{item.quantity}</span>
                        <button
                          style={s.qtyBtn}
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        >
                          +
                        </button>
                      </div>

                      <div style={s.itemPrice}>
                        {(item.price * item.quantity).toLocaleString("vi-VN")} ₫
                      </div>

                      <button style={s.removeBtn} onClick={() => removeFromCart(item.id)}>
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div style={s.right}>
            <div style={s.card}>
              <div style={s.cardHeader}>
                <span style={s.cardTitle}>Tóm tắt đơn hàng</span>
              </div>

              <div style={s.summaryList}>
                {cartItems.map((item) => (
                  <div key={item.id} style={s.summaryRow}>
                    <span style={s.summaryLabel}>
                      {item.name}
                      <span style={s.summaryQty}> × {item.quantity}</span>
                    </span>
                    <span style={s.summaryVal}>
                      {(item.price * item.quantity).toLocaleString("vi-VN")} ₫
                    </span>
                  </div>
                ))}
              </div>

              <div style={s.divider} />

              <div style={s.couponBox}>
                <div style={s.couponTitle}>Mã giảm giá</div>
                <div style={s.couponRow}>
                  <input
                    style={s.couponInput}
                    placeholder="Nhập mã coupon"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  />
                  <button
                    style={s.couponBtn}
                    onClick={handleApplyCoupon}
                    disabled={couponLoading}
                  >
                    {couponLoading ? "Đang kiểm tra..." : "Áp dụng"}
                  </button>
                </div>

                {couponError && <div style={s.couponError}>{couponError}</div>}
                {couponSuccess && <div style={s.couponSuccess}>{couponSuccess}</div>}

                {appliedCoupon && (
                  <div style={s.appliedCoupon}>
                    <div>
                      <div style={s.appliedCode}>{appliedCoupon.code}</div>
                      <div style={s.appliedMeta}>
                        {appliedCoupon.type === "percent"
                          ? `Giảm ${Number(appliedCoupon.value)}%`
                          : `Giảm ${Number(appliedCoupon.value).toLocaleString("vi-VN")} ₫`}
                      </div>
                    </div>
                    <button style={s.removeCouponBtn} onClick={handleRemoveCoupon}>
                      Bỏ mã
                    </button>
                  </div>
                )}

                {!couponEligible && appliedCoupon && (
                  <div style={s.couponWarning}>
                    Mã hiện không còn đủ điều kiện vì đơn hàng dưới mức tối thiểu.
                  </div>
                )}
              </div>

              <div style={s.shippingRow}>
                <span style={s.summaryLabel}>Vận chuyển</span>
                <span style={{ ...s.summaryVal, color: "#2d6e4e", fontWeight: "700" }}>
                  {subtotal >= 50000000 ? "Miễn phí" : "Liên hệ báo giá"}
                </span>
              </div>

              {subtotal >= 50000000 && (
                <div style={s.discountBadge}>🚚 Đơn hàng đủ điều kiện miễn phí giao hàng</div>
              )}

              <div style={s.totalBreakdown}>
                <div style={s.breakdownRow}>
                  <span style={s.summaryLabel}>Tạm tính</span>
                  <span style={s.summaryVal}>{subtotal.toLocaleString("vi-VN")} ₫</span>
                </div>
                <div style={s.breakdownRow}>
                  <span style={s.summaryLabel}>Giảm giá</span>
                  <span style={{ ...s.summaryVal, color: discountAmount > 0 ? "#3b6d11" : "#999" }}>
                    -{discountAmount.toLocaleString("vi-VN")} ₫
                  </span>
                </div>
              </div>

              <div style={s.totalRow}>
                <span style={s.totalLabel}>Tổng cộng</span>
                <span style={s.totalVal}>{finalTotal.toLocaleString("vi-VN")} ₫</span>
              </div>

              <button
                style={s.confirmBtn}
                onClick={() => navigate("/shipping")}
              >
                Xác nhận đặt hàng →
              </button>

              <button style={s.continueBtn} onClick={() => navigate("/products")}>
                ← Tiếp tục mua sắm
              </button>

              <p style={s.note}>
                Bước tiếp theo: nhập địa chỉ giao hàng đến công trình của bạn.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const s = {
  page: { minHeight: "100vh", background: "#f5f4f0", padding: "48px 24px 80px", fontFamily: "'Be Vietnam Pro', 'Segoe UI', sans-serif" },
  header: { textAlign: "center", marginBottom: "40px" },
  headerTag: { display: "inline-block", background: "#1a3c2e", color: "#a8d5b5", fontSize: "0.72rem", fontWeight: "700", letterSpacing: "0.12em", textTransform: "uppercase", padding: "5px 14px", borderRadius: "20px", marginBottom: "12px" },
  headerTitle: { fontSize: "2rem", fontWeight: "800", color: "#1a1a1a", margin: 0, letterSpacing: "-0.02em" },
  layout: { maxWidth: "1100px", margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 360px", gap: "28px", alignItems: "start" },
  left: {},
  right: {},
  card: { background: "#ffffff", borderRadius: "16px", border: "1px solid #ebebeb", overflow: "hidden" },
  cardHeader: { padding: "20px 24px", borderBottom: "1px solid #f0eeea", display: "flex", justifyContent: "space-between", alignItems: "center" },
  cardTitle: { fontWeight: "700", fontSize: "0.95rem", color: "#1a1a1a" },
  itemCount: { fontSize: "0.8rem", color: "#999", fontWeight: "500" },
  itemList: { padding: "0 24px" },
  itemRow: { display: "flex", alignItems: "center", gap: "16px", padding: "20px 0" },
  itemImg: { width: "72px", height: "72px", borderRadius: "10px", background: "#f5f4f0", flexShrink: 0, overflow: "hidden" },
  itemInfo: { flex: 1, minWidth: 0 },
  itemCategory: { fontSize: "0.68rem", fontWeight: "700", color: "#2d6e4e", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "3px" },
  itemName: { fontSize: "0.92rem", fontWeight: "700", color: "#1a1a1a", marginBottom: "3px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" },
  itemUnit: { fontSize: "0.78rem", color: "#aaa" },
  itemRight: { display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "8px", flexShrink: 0 },
  qtyRow: { display: "flex", alignItems: "center", border: "1px solid #ebebeb", borderRadius: "8px", overflow: "hidden" },
  qtyBtn: { width: "30px", height: "30px", background: "#faf9f7", border: "none", cursor: "pointer", fontSize: "1rem", color: "#555", display: "flex", alignItems: "center", justifyContent: "center" },
  qtyNum: { minWidth: "32px", textAlign: "center", fontSize: "0.88rem", fontWeight: "700", color: "#1a1a1a", borderLeft: "1px solid #ebebeb", borderRight: "1px solid #ebebeb", padding: "0 4px", lineHeight: "30px" },
  itemPrice: { fontSize: "0.95rem", fontWeight: "800", color: "#c94a1a" },
  removeBtn: { background: "none", border: "none", cursor: "pointer", fontSize: "0.8rem", color: "#ccc", padding: "2px", lineHeight: 1 },
  summaryList: { padding: "16px 24px 0" },
  summaryRow: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "12px", marginBottom: "10px" },
  summaryLabel: { fontSize: "0.85rem", color: "#555", flex: 1 },
  summaryQty: { color: "#aaa" },
  summaryVal: { fontSize: "0.85rem", color: "#1a1a1a", fontWeight: "600", flexShrink: 0 },
  divider: { borderTop: "1px solid #f0eeea", margin: "16px 24px" },
  couponBox: { padding: "0 24px 16px" },
  couponTitle: { fontSize: "0.82rem", fontWeight: "700", color: "#333", marginBottom: "10px" },
  couponRow: { display: "grid", gridTemplateColumns: "1fr 110px", gap: "10px" },
  couponInput: { width: "100%", padding: "12px 14px", border: "1.5px solid #e0ddd8", borderRadius: "10px", fontSize: "0.86rem", fontFamily: "inherit" },
  couponBtn: { border: "none", borderRadius: "10px", background: "#1a3c2e", color: "#fff", fontSize: "0.82rem", fontWeight: "700", cursor: "pointer" },
  couponError: { marginTop: "10px", background: "#fcebeb", color: "#a32d2d", border: "1px solid #f0b6b6", borderRadius: "8px", padding: "9px 12px", fontSize: "0.78rem", fontWeight: "600" },
  couponSuccess: { marginTop: "10px", background: "#eaf3de", color: "#3b6d11", border: "1px solid #b7d48f", borderRadius: "8px", padding: "9px 12px", fontSize: "0.78rem", fontWeight: "600" },
  couponWarning: { marginTop: "10px", background: "#fdf8ee", color: "#854f0b", border: "1px solid #fac775", borderRadius: "8px", padding: "9px 12px", fontSize: "0.78rem", fontWeight: "600" },
  appliedCoupon: { marginTop: "12px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", background: "#faf9f7", border: "1px solid #ebebeb", borderRadius: "10px", padding: "10px 12px" },
  appliedCode: { fontSize: "0.8rem", fontWeight: "800", color: "#1a3c2e", letterSpacing: "0.08em" },
  appliedMeta: { fontSize: "0.76rem", color: "#888", marginTop: "4px" },
  removeCouponBtn: { border: "none", background: "transparent", color: "#a32d2d", fontSize: "0.78rem", fontWeight: "700", cursor: "pointer" },
  shippingRow: { display: "flex", justifyContent: "space-between", padding: "0 24px", marginBottom: "12px" },
  discountBadge: { margin: "0 24px 12px", background: "#eaf3de", color: "#3b6d11", fontSize: "0.75rem", fontWeight: "600", padding: "8px 12px", borderRadius: "8px" },
  totalBreakdown: { display: "flex", flexDirection: "column", gap: "10px", padding: "0 24px 16px" },
  breakdownRow: { display: "flex", justifyContent: "space-between", alignItems: "center" },
  totalRow: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 24px", background: "#faf9f7", borderTop: "1px solid #f0eeea" },
  totalLabel: { fontSize: "0.95rem", fontWeight: "700", color: "#1a1a1a" },
  totalVal: { fontSize: "1.4rem", fontWeight: "900", color: "#c94a1a", letterSpacing: "-0.02em" },
  confirmBtn: { display: "block", width: "calc(100% - 48px)", margin: "20px 24px 10px", padding: "15px", background: "#1a3c2e", color: "white", border: "none", borderRadius: "12px", fontSize: "0.95rem", fontWeight: "700", cursor: "pointer", letterSpacing: "0.02em" },
  continueBtn: { display: "block", width: "calc(100% - 48px)", margin: "0 24px 16px", padding: "12px", background: "transparent", color: "#555", border: "1.5px solid #d5d3cd", borderRadius: "12px", fontSize: "0.88rem", fontWeight: "600", cursor: "pointer" },
  note: { fontSize: "0.75rem", color: "#bbb", textAlign: "center", padding: "0 24px 20px", lineHeight: "1.6", margin: 0 },
  emptyWrap: { maxWidth: "400px", margin: "60px auto", textAlign: "center", padding: "60px 32px", background: "#fff", borderRadius: "20px", border: "1px solid #ebebeb" },
  emptyIcon: { fontSize: "3rem", marginBottom: "16px" },
  emptyTitle: { fontSize: "1.2rem", fontWeight: "700", color: "#1a1a1a", margin: "0 0 8px" },
  emptySub: { fontSize: "0.88rem", color: "#aaa", margin: "0 0 28px" },
  shopBtn: { padding: "12px 28px", background: "#1a3c2e", color: "white", border: "none", borderRadius: "10px", fontSize: "0.9rem", fontWeight: "700", cursor: "pointer" },
};
