import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";

const provinces = [
  "An Giang", "Bà Rịa - Vũng Tàu", "Bắc Giang", "Bắc Kạn", "Bạc Liêu",
  "Bắc Ninh", "Bến Tre", "Bình Định", "Bình Dương", "Bình Phước",
  "Bình Thuận", "Cà Mau", "Cần Thơ", "Cao Bằng", "Đà Nẵng",
  "Đắk Lắk", "Đắk Nông", "Điện Biên", "Đồng Nai", "Đồng Tháp",
  "Gia Lai", "Hà Giang", "Hà Nam", "Hà Nội", "Hà Tĩnh",
  "Hải Dương", "Hải Phòng", "Hậu Giang", "Hòa Bình", "Hưng Yên",
  "Khánh Hòa", "Kiên Giang", "Kon Tum", "Lai Châu", "Lâm Đồng",
  "Lạng Sơn", "Lào Cai", "Long An", "Nam Định", "Nghệ An",
  "Ninh Bình", "Ninh Thuận", "Phú Thọ", "Phú Yên", "Quảng Bình",
  "Quảng Nam", "Quảng Ngãi", "Quảng Ninh", "Quảng Trị", "Sóc Trăng",
  "Sơn La", "Tây Ninh", "Thái Bình", "Thái Nguyên", "Thanh Hóa",
  "Thừa Thiên Huế", "Tiền Giang", "TP. Hồ Chí Minh", "Trà Vinh",
  "Tuyên Quang", "Vĩnh Long", "Vĩnh Phúc", "Yên Bái",
];

const timeSlots = [
  { id: "morning", label: "Buổi sáng", sub: "7:00 – 12:00" },
  { id: "afternoon", label: "Buổi chiều", sub: "13:00 – 17:00" },
  { id: "evening", label: "Buổi tối", sub: "18:00 – 21:00" },
];

export default function ShippingAddress() {
  const navigate = useNavigate();
  const { cartItems, clearCart } = useCart();

  const totalPrice = cartItems.reduce(
    (total, item) => total + item.price * item.quantity, 0
  );

  const [form, setForm] = useState({
    fullName: "", phone: "", province: "", district: "",
    ward: "", street: "", note: "", timeSlot: "morning",
    paymentMethod: "cod",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [orderId] = useState("#KT" + Date.now().toString().slice(-6));

  const set = (key, val) => {
    setForm(f => ({ ...f, [key]: val }));
    if (errors[key]) setErrors(e => ({ ...e, [key]: "" }));
  };

  const validate = () => {
    const e = {};
    if (!form.fullName.trim()) e.fullName = "Vui lòng nhập họ tên";
    if (!/^0\d{9}$/.test(form.phone)) e.phone = "Số điện thoại không hợp lệ";
    if (!form.province) e.province = "Vui lòng chọn tỉnh / thành phố";
    if (!form.district.trim()) e.district = "Vui lòng nhập quận / huyện";
    if (!form.ward.trim()) e.ward = "Vui lòng nhập phường / xã";
    if (!form.street.trim()) e.street = "Vui lòng nhập địa chỉ cụ thể";
    return e;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setDone(true);
      if (clearCart) clearCart();
    }, 1000);
  };

  // --- SUCCESS SCREEN ---
  if (done) {
    return (
      <div style={s.page}>
        <div style={s.successWrap}>
          <div style={s.successRing}>
            <div style={s.successCheck}>✓</div>
          </div>
          <div style={s.successTag}>Đơn hàng đã được ghi nhận</div>
          <h1 style={s.successTitle}>Đặt hàng thành công!</h1>
          <p style={s.successSub}>
            Chúng tôi sẽ liên hệ xác nhận và thông báo lịch giao hàng trong vòng 30 phút.
          </p>

          <div style={s.successCard}>
            {[
              { label: "Mã đơn hàng", val: orderId },
              { label: "Người nhận", val: form.fullName },
              { label: "Điện thoại", val: form.phone },
              { label: "Địa chỉ", val: `${form.street}, ${form.ward}, ${form.district}, ${form.province}` },
              { label: "Thời gian nhận", val: timeSlots.find(t => t.id === form.timeSlot)?.label + " (" + timeSlots.find(t => t.id === form.timeSlot)?.sub + ")" },
              { label: "Thanh toán", val: form.paymentMethod === "cod" ? "💵 COD — Trả khi nhận hàng" : "🏦 Chuyển khoản ngân hàng" },
              { label: "Tổng tiền", val: totalPrice.toLocaleString("vi-VN") + " ₫", highlight: true },
            ].map(({ label, val, highlight }) => (
              <div key={label} style={s.successRow}>
                <span style={s.successLabel}>{label}</span>
                <span style={{ ...s.successVal, ...(highlight ? { color: "#c94a1a", fontWeight: "800", fontSize: "1rem" } : {}) }}>
                  {val}
                </span>
              </div>
            ))}
          </div>

          <button style={s.successBtn}
            onClick={() => navigate("/products")}
            onMouseOver={(e) => e.currentTarget.style.background = "#2d6e4e"}
            onMouseOut={(e) => e.currentTarget.style.background = "#1a3c2e"}
          >
            Tiếp tục mua sắm
          </button>
        </div>
        <style>{`@keyframes popIn { from { transform: scale(0.6); opacity: 0; } to { transform: scale(1); opacity: 1; } }`}</style>
      </div>
    );
  }

  // --- FORM SCREEN ---
  return (
    <div style={s.page}>
      {/* Progress bar */}
      <div style={s.progressWrap}>
        {["Giỏ hàng", "Địa chỉ giao hàng", "Xác nhận"].map((step, i) => (
          <div key={step} style={s.progressItem}>
            <div style={{
              ...s.progressDot,
              background: i <= 1 ? "#1a3c2e" : "#e0ddd8",
              border: i === 1 ? "2px solid #1a3c2e" : "2px solid transparent",
              color: i <= 1 ? "#fff" : "#bbb",
            }}>
              {i === 0 ? "✓" : i + 1}
            </div>
            <span style={{ ...s.progressLabel, color: i === 1 ? "#1a1a1a" : i === 0 ? "#2d6e4e" : "#bbb", fontWeight: i === 1 ? "700" : "500" }}>
              {step}
            </span>
            {i < 2 && <div style={{ ...s.progressLine, background: i === 0 ? "#1a3c2e" : "#e0ddd8" }} />}
          </div>
        ))}
      </div>

      <div style={s.layout}>
        {/* LEFT: Form */}
        <div style={s.left}>
          <form onSubmit={handleSubmit} style={s.form}>

            {/* Section: Thông tin người nhận */}
            <div style={s.section}>
              <div style={s.sectionHead}>
                <div style={s.sectionNum}>1</div>
                <div>
                  <div style={s.sectionTitle}>Thông tin người nhận</div>
                  <div style={s.sectionSub}>Người trực tiếp nhận hàng tại công trình</div>
                </div>
              </div>
              <div style={s.row2}>
                <Field label="Họ và tên *" error={errors.fullName}>
                  <InputWrap icon="👤">
                    <input style={s.input} placeholder="Nguyễn Văn A"
                      value={form.fullName} onChange={e => set("fullName", e.target.value)}
                      onFocus={e => e.currentTarget.parentElement.style.borderColor = "#2d6e4e"}
                      onBlur={e => e.currentTarget.parentElement.style.borderColor = errors.fullName ? "#e24b4a" : "#e0ddd8"}
                    />
                  </InputWrap>
                </Field>
                <Field label="Số điện thoại *" error={errors.phone}>
                  <InputWrap icon="📞">
                    <input style={s.input} placeholder="0909 123 456" type="tel"
                      value={form.phone} onChange={e => set("phone", e.target.value)}
                      onFocus={e => e.currentTarget.parentElement.style.borderColor = "#2d6e4e"}
                      onBlur={e => e.currentTarget.parentElement.style.borderColor = errors.phone ? "#e24b4a" : "#e0ddd8"}
                    />
                  </InputWrap>
                </Field>
              </div>
            </div>

            {/* Section: Địa chỉ giao hàng */}
            <div style={s.section}>
              <div style={s.sectionHead}>
                <div style={s.sectionNum}>2</div>
                <div>
                  <div style={s.sectionTitle}>Địa chỉ giao hàng</div>
                  <div style={s.sectionSub}>Địa chỉ công trình hoặc kho nhận hàng</div>
                </div>
              </div>

              <div style={s.row3}>
                <Field label="Tỉnh / Thành phố *" error={errors.province}>
                  <div style={{ ...s.inputWrapBase, borderColor: errors.province ? "#e24b4a" : "#e0ddd8" }}>
                    <span style={s.icon}>📍</span>
                    <select style={{ ...s.input, color: form.province ? "#1a1a1a" : "#bbb" }}
                      value={form.province} onChange={e => set("province", e.target.value)}
                      onFocus={e => e.currentTarget.parentElement.style.borderColor = "#2d6e4e"}
                      onBlur={e => e.currentTarget.parentElement.style.borderColor = errors.province ? "#e24b4a" : "#e0ddd8"}
                    >
                      <option value="" disabled>Chọn tỉnh / thành</option>
                      {provinces.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                  </div>
                </Field>
                <Field label="Quận / Huyện *" error={errors.district}>
                  <InputWrap icon="🏘️" error={errors.district}>
                    <input style={s.input} placeholder="Quận Hải Châu"
                      value={form.district} onChange={e => set("district", e.target.value)}
                      onFocus={e => e.currentTarget.parentElement.style.borderColor = "#2d6e4e"}
                      onBlur={e => e.currentTarget.parentElement.style.borderColor = errors.district ? "#e24b4a" : "#e0ddd8"}
                    />
                  </InputWrap>
                </Field>
                <Field label="Phường / Xã *" error={errors.ward}>
                  <InputWrap icon="🏠" error={errors.ward}>
                    <input style={s.input} placeholder="Phường Thanh Bình"
                      value={form.ward} onChange={e => set("ward", e.target.value)}
                      onFocus={e => e.currentTarget.parentElement.style.borderColor = "#2d6e4e"}
                      onBlur={e => e.currentTarget.parentElement.style.borderColor = errors.ward ? "#e24b4a" : "#e0ddd8"}
                    />
                  </InputWrap>
                </Field>
              </div>

              <Field label="Số nhà, tên đường *" error={errors.street}>
                <InputWrap icon="📌" error={errors.street}>
                  <input style={s.input} placeholder="123 Đường Trần Phú"
                    value={form.street} onChange={e => set("street", e.target.value)}
                    onFocus={e => e.currentTarget.parentElement.style.borderColor = "#2d6e4e"}
                    onBlur={e => e.currentTarget.parentElement.style.borderColor = errors.street ? "#e24b4a" : "#e0ddd8"}
                  />
                </InputWrap>
              </Field>

              <Field label="Ghi chú cho tài xế">
                <div style={{ ...s.inputWrapBase, borderColor: "#e0ddd8", alignItems: "flex-start" }}>
                  <span style={{ ...s.icon, paddingTop: "12px" }}>📝</span>
                  <textarea
                    style={{ ...s.input, resize: "none", minHeight: "80px", paddingTop: "12px", paddingBottom: "12px" }}
                    placeholder="VD: Giao vào cổng phụ, gọi trước 15 phút..."
                    value={form.note} onChange={e => set("note", e.target.value)}
                    onFocus={e => e.currentTarget.parentElement.style.borderColor = "#2d6e4e"}
                    onBlur={e => e.currentTarget.parentElement.style.borderColor = "#e0ddd8"}
                  />
                </div>
              </Field>
            </div>

            {/* Section: Thời gian nhận hàng */}
            <div style={s.section}>
              <div style={s.sectionHead}>
                <div style={s.sectionNum}>3</div>
                <div>
                  <div style={s.sectionTitle}>Thời gian nhận hàng</div>
                  <div style={s.sectionSub}>Chọn khung giờ phù hợp với công trình</div>
                </div>
              </div>
              <div style={s.timeGrid}>
                {timeSlots.map(slot => (
                  <button
                    key={slot.id}
                    type="button"
                    onClick={() => set("timeSlot", slot.id)}
                    style={{
                      ...s.timeBtn,
                      background: form.timeSlot === slot.id ? "#1a3c2e" : "#fff",
                      borderColor: form.timeSlot === slot.id ? "#1a3c2e" : "#e0ddd8",
                      color: form.timeSlot === slot.id ? "#fff" : "#333",
                    }}
                  >
                    <div style={{ fontWeight: "700", fontSize: "0.9rem" }}>{slot.label}</div>
                    <div style={{ fontSize: "0.78rem", marginTop: "3px", opacity: 0.7 }}>{slot.sub}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Section: Phương thức thanh toán */}
            <div style={s.section}>
              <div style={s.sectionHead}>
                <div style={s.sectionNum}>4</div>
                <div>
                  <div style={s.sectionTitle}>Phương thức thanh toán</div>
                  <div style={s.sectionSub}>Chọn cách thanh toán phù hợp</div>
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {[
                  {
                    id: "cod",
                    icon: "💵",
                    title: "COD — Thanh toán khi nhận hàng",
                    sub: "Kiểm tra hàng trước, thanh toán tiền mặt cho tài xế khi nhận",
                    badge: "Phổ biến nhất",
                    badgeColor: "#eaf3de",
                    badgeText: "#3b6d11",
                  },
                  {
                    id: "transfer",
                    icon: "🏦",
                    title: "Chuyển khoản ngân hàng",
                    sub: "Chuyển khoản trước khi giao hàng — nhận thông tin TK sau khi đặt",
                    badge: null,
                  },
                ].map((method) => {
                  const active = form.paymentMethod === method.id;
                  return (
                    <div
                      key={method.id}
                      onClick={() => set("paymentMethod", method.id)}
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: "14px",
                        padding: "16px 18px",
                        borderRadius: "12px",
                        border: `1.5px solid ${active ? "#1a3c2e" : "#e0ddd8"}`,
                        background: active ? "#f0f7f3" : "#fff",
                        cursor: "pointer",
                        transition: "all 0.2s",
                      }}
                    >
                      {/* Radio dot */}
                      <div style={{
                        width: "20px", height: "20px",
                        borderRadius: "50%",
                        border: `2px solid ${active ? "#1a3c2e" : "#d0cdc8"}`,
                        background: active ? "#1a3c2e" : "#fff",
                        flexShrink: 0,
                        marginTop: "2px",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        transition: "all 0.2s",
                      }}>
                        {active && <div style={{ width: "7px", height: "7px", borderRadius: "50%", background: "#fff" }} />}
                      </div>

                      {/* Icon */}
                      <div style={{
                        width: "40px", height: "40px",
                        background: active ? "rgba(26,60,46,0.08)" : "#f5f4f0",
                        borderRadius: "10px",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: "1.1rem", flexShrink: 0,
                      }}>
                        {method.icon}
                      </div>

                      {/* Text */}
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "3px" }}>
                          <span style={{ fontSize: "0.88rem", fontWeight: "700", color: active ? "#1a3c2e" : "#1a1a1a" }}>
                            {method.title}
                          </span>
                          {method.badge && (
                            <span style={{
                              fontSize: "0.65rem", fontWeight: "700",
                              background: method.badgeColor, color: method.badgeText,
                              padding: "2px 8px", borderRadius: "999px",
                            }}>
                              {method.badge}
                            </span>
                          )}
                        </div>
                        <div style={{ fontSize: "0.78rem", color: "#aaa", lineHeight: "1.5" }}>
                          {method.sub}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* COD info box */}
              {form.paymentMethod === "cod" && (
                <div style={{
                  background: "#fdf8ee",
                  border: "1px solid #fac775",
                  borderRadius: "10px",
                  padding: "12px 16px",
                  fontSize: "0.8rem",
                  color: "#854f0b",
                  lineHeight: "1.6",
                }}>
                  💡 Vui lòng chuẩn bị đúng số tiền <strong>{totalPrice.toLocaleString("vi-VN")} ₫</strong> khi nhận hàng. Tài xế không mang tiền thối.
                </div>
              )}

              {/* Transfer info box */}
              {form.paymentMethod === "transfer" && (
                <div style={{
                  background: "#e6f1fb",
                  border: "1px solid #85b7eb",
                  borderRadius: "10px",
                  padding: "12px 16px",
                  fontSize: "0.8rem",
                  color: "#185fa5",
                  lineHeight: "1.6",
                }}>
                  🏦 Thông tin tài khoản ngân hàng sẽ được gửi qua SMS sau khi xác nhận đơn hàng.
                </div>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              style={{ ...s.submitBtn, opacity: loading ? 0.8 : 1, cursor: loading ? "not-allowed" : "pointer" }}
              onMouseOver={e => { if (!loading) e.currentTarget.style.background = "#2d6e4e"; }}
              onMouseOut={e => { if (!loading) e.currentTarget.style.background = "#1a3c2e"; }}
            >
              {loading
                ? <span style={s.loadingRow}><span style={s.spinner} /> Đang xử lý...</span>
                : form.paymentMethod === "cod"
                  ? "Đặt hàng — Thanh toán khi nhận"
                  : "Đặt hàng — Chuyển khoản trước"
              }
            </button>

            <button type="button" style={s.backBtn}
              onClick={() => navigate("/checkout")}
              onMouseOver={e => e.currentTarget.style.background = "#f0eeea"}
              onMouseOut={e => e.currentTarget.style.background = "transparent"}
            >
              ← Quay lại giỏ hàng
            </button>
          </form>
        </div>

        {/* RIGHT: Order summary */}
        <div style={s.right}>
          <div style={s.summaryCard}>
            <div style={s.summaryHead}>
              <span style={s.summaryTitle}>Đơn hàng của bạn</span>
              <span style={s.summaryCount}>{cartItems.length} sản phẩm</span>
            </div>

            <div style={s.summaryItems}>
              {cartItems.map((item, idx) => (
                <div key={item.id} style={{ ...s.summaryRow, borderTop: idx === 0 ? "none" : "1px solid #f0eeea" }}>
                  <div style={s.summaryImg}>
                    <img src={item.image} alt={item.name}
                      style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "8px" }}
                      onError={e => { e.target.style.display = "none"; }}
                    />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={s.summaryName}>{item.name}</div>
                    <div style={s.summaryMeta}>× {item.quantity} {item.unit}</div>
                  </div>
                  <div style={s.summaryPrice}>
                    {(item.price * item.quantity).toLocaleString("vi-VN")} ₫
                  </div>
                </div>
              ))}
            </div>

            <div style={s.totalBox}>
              <div style={s.totalRow2}>
                <span style={s.totalLabel}>Tạm tính</span>
                <span style={s.totalVal2}>{totalPrice.toLocaleString("vi-VN")} ₫</span>
              </div>
              <div style={s.totalRow2}>
                <span style={s.totalLabel}>Vận chuyển</span>
                <span style={{ ...s.totalVal2, color: "#2d6e4e", fontWeight: "700" }}>
                  {totalPrice >= 50000000 ? "Miễn phí" : "Báo giá sau"}
                </span>
              </div>
              <div style={s.grandRow}>
                <span style={s.grandLabel}>Tổng cộng</span>
                <span style={s.grandVal}>{totalPrice.toLocaleString("vi-VN")} ₫</span>
              </div>
            </div>

            {totalPrice >= 50000000 && (
              <div style={s.freeBadge}>
                🚚 Đơn đủ điều kiện miễn phí giao hàng
              </div>
            )}

            <div style={s.guarantee}>
              {["🔒 Thanh toán an toàn", "✅ Hàng chính hãng", "📞 Hỗ trợ 24/7"].map(t => (
                <span key={t} style={s.guaranteeItem}>{t}</span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes popIn { from { transform: scale(0.7); opacity: 0; } to { transform: scale(1); opacity: 1; } }
        input::placeholder, textarea::placeholder { color: #c0bdb8; }
        input:focus, textarea:focus, select:focus { outline: none; }
        select option { color: #1a1a1a; }
      `}</style>
    </div>
  );
}

// Helper components
function Field({ label, error, children }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
      <label style={s.label}>{label}</label>
      {children}
      {error && <span style={s.errorMsg}>{error}</span>}
    </div>
  );
}

function InputWrap({ icon, error, children }) {
  return (
    <div style={{ ...s.inputWrapBase, borderColor: error ? "#e24b4a" : "#e0ddd8" }}>
      <span style={s.icon}>{icon}</span>
      {children}
    </div>
  );
}

const s = {
  page: {
    minHeight: "100vh",
    background: "#f5f4f0",
    padding: "40px 24px 80px",
    fontFamily: "'Be Vietnam Pro', 'Segoe UI', sans-serif",
  },
  progressWrap: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "0",
    marginBottom: "40px",
    maxWidth: "480px",
    margin: "0 auto 40px",
  },
  progressItem: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    position: "relative",
  },
  progressDot: {
    width: "28px", height: "28px",
    borderRadius: "50%",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: "0.72rem", fontWeight: "800",
    flexShrink: 0,
    transition: "all 0.3s",
  },
  progressLabel: {
    fontSize: "0.82rem",
    whiteSpace: "nowrap",
  },
  progressLine: {
    width: "48px", height: "2px",
    borderRadius: "1px",
    margin: "0 8px",
  },
  layout: {
    maxWidth: "1100px",
    margin: "0 auto",
    display: "grid",
    gridTemplateColumns: "1fr 340px",
    gap: "28px",
    alignItems: "start",
  },
  left: {},
  right: {},
  form: { display: "flex", flexDirection: "column", gap: "20px" },
  section: {
    background: "#fff",
    borderRadius: "16px",
    border: "1px solid #ebebeb",
    padding: "28px",
    display: "flex",
    flexDirection: "column",
    gap: "18px",
  },
  sectionHead: {
    display: "flex",
    alignItems: "flex-start",
    gap: "14px",
    marginBottom: "4px",
  },
  sectionNum: {
    width: "28px", height: "28px",
    background: "#1a3c2e",
    color: "#a8d5b5",
    borderRadius: "8px",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: "0.8rem", fontWeight: "800",
    flexShrink: 0,
  },
  sectionTitle: { fontSize: "0.95rem", fontWeight: "800", color: "#1a1a1a", lineHeight: 1.3 },
  sectionSub: { fontSize: "0.78rem", color: "#aaa", marginTop: "3px" },
  row2: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" },
  row3: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "14px" },
  label: { fontSize: "0.8rem", fontWeight: "700", color: "#333", letterSpacing: "0.02em" },
  inputWrapBase: {
    display: "flex", alignItems: "center",
    background: "#fff",
    border: "1.5px solid #e0ddd8",
    borderRadius: "10px",
    transition: "border-color 0.2s",
  },
  icon: { padding: "0 10px 0 12px", fontSize: "0.85rem", color: "#bbb", flexShrink: 0 },
  input: {
    flex: 1, border: "none", background: "transparent",
    padding: "12px 12px 12px 0",
    fontSize: "0.88rem", color: "#1a1a1a",
    width: "100%", fontFamily: "inherit",
  },
  errorMsg: { fontSize: "0.75rem", color: "#e24b4a", fontWeight: "600" },
  timeGrid: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px" },
  timeBtn: {
    padding: "14px 10px",
    border: "1.5px solid",
    borderRadius: "10px",
    cursor: "pointer",
    textAlign: "center",
    transition: "all 0.2s",
    fontFamily: "inherit",
  },
  submitBtn: {
    width: "100%",
    padding: "15px",
    background: "#1a3c2e",
    color: "white",
    border: "none",
    borderRadius: "12px",
    fontSize: "0.95rem",
    fontWeight: "700",
    transition: "all 0.2s",
    letterSpacing: "0.02em",
    fontFamily: "inherit",
  },
  backBtn: {
    width: "100%",
    padding: "12px",
    background: "transparent",
    color: "#666",
    border: "1.5px solid #d5d3cd",
    borderRadius: "12px",
    fontSize: "0.88rem",
    fontWeight: "600",
    cursor: "pointer",
    transition: "background 0.2s",
    fontFamily: "inherit",
  },
  loadingRow: { display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" },
  spinner: {
    width: "16px", height: "16px",
    border: "2px solid rgba(255,255,255,0.3)",
    borderTopColor: "#fff",
    borderRadius: "50%",
    display: "inline-block",
    animation: "spin 0.7s linear infinite",
  },
  // Summary card
  summaryCard: {
    background: "#fff",
    borderRadius: "16px",
    border: "1px solid #ebebeb",
    overflow: "hidden",
  },
  summaryHead: {
    padding: "18px 22px",
    borderBottom: "1px solid #f0eeea",
    display: "flex", justifyContent: "space-between", alignItems: "center",
  },
  summaryTitle: { fontWeight: "700", fontSize: "0.9rem", color: "#1a1a1a" },
  summaryCount: { fontSize: "0.78rem", color: "#aaa" },
  summaryItems: { padding: "0 22px" },
  summaryRow: {
    display: "flex", alignItems: "center", gap: "12px",
    padding: "14px 0",
  },
  summaryImg: {
    width: "52px", height: "52px",
    borderRadius: "8px", background: "#f5f4f0",
    flexShrink: 0, overflow: "hidden",
  },
  summaryName: { fontSize: "0.83rem", fontWeight: "700", color: "#1a1a1a", marginBottom: "2px", lineHeight: "1.3" },
  summaryMeta: { fontSize: "0.75rem", color: "#aaa" },
  summaryPrice: { fontSize: "0.85rem", fontWeight: "700", color: "#c94a1a", flexShrink: 0 },
  totalBox: { borderTop: "1px solid #f0eeea", padding: "14px 22px", display: "flex", flexDirection: "column", gap: "8px" },
  totalRow2: { display: "flex", justifyContent: "space-between", alignItems: "center" },
  totalLabel: { fontSize: "0.83rem", color: "#777" },
  totalVal2: { fontSize: "0.83rem", color: "#1a1a1a", fontWeight: "600" },
  grandRow: {
    display: "flex", justifyContent: "space-between", alignItems: "center",
    paddingTop: "10px", borderTop: "1px solid #f0eeea", marginTop: "4px",
  },
  grandLabel: { fontSize: "0.9rem", fontWeight: "700", color: "#1a1a1a" },
  grandVal: { fontSize: "1.3rem", fontWeight: "900", color: "#c94a1a", letterSpacing: "-0.02em" },
  freeBadge: {
    margin: "0 22px 14px",
    background: "#eaf3de", color: "#3b6d11",
    fontSize: "0.75rem", fontWeight: "600",
    padding: "8px 12px", borderRadius: "8px",
  },
  guarantee: {
    borderTop: "1px solid #f0eeea",
    padding: "14px 22px",
    display: "flex", flexDirection: "column", gap: "6px",
  },
  guaranteeItem: { fontSize: "0.78rem", color: "#888" },
  // Success screen
  successWrap: {
    maxWidth: "520px",
    margin: "60px auto",
    textAlign: "center",
    background: "#fff",
    borderRadius: "24px",
    border: "1px solid #ebebeb",
    padding: "56px 40px",
    animation: "popIn 0.4s ease",
  },
  successRing: {
    width: "72px", height: "72px",
    borderRadius: "50%",
    background: "#eaf3de",
    border: "3px solid #a8d5b5",
    display: "flex", alignItems: "center", justifyContent: "center",
    margin: "0 auto 20px",
  },
  successCheck: { fontSize: "1.8rem", color: "#3b6d11", fontWeight: "900" },
  successTag: {
    display: "inline-block",
    background: "#1a3c2e", color: "#a8d5b5",
    fontSize: "0.68rem", fontWeight: "700",
    letterSpacing: "0.12em", textTransform: "uppercase",
    padding: "4px 12px", borderRadius: "999px",
    marginBottom: "12px",
  },
  successTitle: { fontSize: "1.8rem", fontWeight: "900", color: "#1a1a1a", margin: "0 0 10px", letterSpacing: "-0.02em" },
  successSub: { fontSize: "0.9rem", color: "#888", margin: "0 0 28px", lineHeight: "1.7" },
  successCard: {
    background: "#faf9f7",
    borderRadius: "14px",
    border: "1px solid #ebebeb",
    padding: "20px",
    marginBottom: "28px",
    textAlign: "left",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  successRow: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "12px" },
  successLabel: { fontSize: "0.8rem", color: "#aaa", fontWeight: "600", flexShrink: 0 },
  successVal: { fontSize: "0.85rem", color: "#1a1a1a", fontWeight: "600", textAlign: "right" },
  successBtn: {
    padding: "13px 36px",
    background: "#1a3c2e", color: "white",
    border: "none", borderRadius: "10px",
    fontSize: "0.92rem", fontWeight: "700",
    cursor: "pointer", transition: "background 0.2s",
    fontFamily: "inherit",
  },
};
