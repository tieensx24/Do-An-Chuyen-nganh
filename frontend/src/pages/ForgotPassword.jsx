import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (newPassword.length < 8) {
      setError("Mật khẩu mới phải có ít nhất 8 ký tự.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Mật khẩu xác nhận không khớp.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("http://localhost:5261/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          phone,
          newPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Không thể đặt lại mật khẩu.");
        return;
      }

      alert(data.message || "Đặt lại mật khẩu thành công.");
      navigate("/login");
    } catch {
      setError("Không thể kết nối server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={s.page}>
      <div style={s.hero}>
        <div style={s.overlay} />
        <div style={s.heroContent}>
          <div style={s.brandRow}>
            <div style={s.brandIcon}>🏗️</div>
            <div>
              <div style={s.brandName}>KIẾN TẠO</div>
              <div style={s.brandSub}>Vật liệu xây dựng</div>
            </div>
          </div>

          <div>
            <div style={s.badge}>Hỗ trợ tài khoản</div>
            <h1 style={s.title}>Đặt lại mật khẩu</h1>
            <p style={s.desc}>
              Nhập đúng email và số điện thoại đã đăng ký để tạo mật khẩu mới cho tài khoản.
            </p>

            <div style={s.tipBox}>
              <div style={s.tipTitle}>Thông tin cần xác thực</div>
              <div style={s.tipText}>Email đăng ký tài khoản</div>
              <div style={s.tipText}>Số điện thoại đã lưu trong hồ sơ</div>
              <div style={s.tipText}>Mật khẩu mới từ 8 ký tự trở lên</div>
            </div>
          </div>
        </div>
      </div>

      <div style={s.panel}>
        <div style={s.card}>
          <div style={s.header}>
            <div style={s.smallTag}>Bảo mật</div>
            <h2 style={s.cardTitle}>Quên mật khẩu</h2>
            <p style={s.cardSub}>Cập nhật mật khẩu mới để đăng nhập lại</p>
          </div>

          {error && <div style={s.errorBox}>⚠ {error}</div>}

          <form onSubmit={handleSubmit} style={s.form}>
            <div style={s.field}>
              <label style={s.label}>Email</label>
              <div style={s.inputWrap}>
                <span style={s.inputIcon}>✉</span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@email.com"
                  required
                  style={s.input}
                />
              </div>
            </div>

            <div style={s.field}>
              <label style={s.label}>Số điện thoại</label>
              <div style={s.inputWrap}>
                <span style={s.inputIcon}>📞</span>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="0909 123 456"
                  required
                  style={s.input}
                />
              </div>
            </div>

            <div style={s.field}>
              <label style={s.label}>Mật khẩu mới</label>
              <div style={s.inputWrap}>
                <span style={s.inputIcon}>🔒</span>
                <input
                  type={showPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Tối thiểu 8 ký tự"
                  required
                  style={{ ...s.input, paddingRight: "44px" }}
                />
                <button type="button" onClick={() => setShowPassword((v) => !v)} style={s.eyeBtn}>
                  {showPassword ? "🙈" : "👁"}
                </button>
              </div>
            </div>

            <div style={s.field}>
              <label style={s.label}>Xác nhận mật khẩu mới</label>
              <div style={s.inputWrap}>
                <span style={s.inputIcon}>🔒</span>
                <input
                  type={showConfirm ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Nhập lại mật khẩu mới"
                  required
                  style={{ ...s.input, paddingRight: "44px" }}
                />
                <button type="button" onClick={() => setShowConfirm((v) => !v)} style={s.eyeBtn}>
                  {showConfirm ? "🙈" : "👁"}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} style={s.submitBtn}>
              {loading ? "Đang cập nhật..." : "Đặt lại mật khẩu"}
            </button>
          </form>

          <div style={s.footer}>
            <Link to="/login" style={s.link}>
              ← Quay lại đăng nhập
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

const s = {
  page: {
    minHeight: "100vh",
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
    background: "#f5f4f0",
    fontFamily: "'Be Vietnam Pro', 'Segoe UI', sans-serif",
  },
  hero: {
    position: "relative",
    backgroundImage: "url('/home/image/home2.jpg')",
    backgroundSize: "cover",
    backgroundPosition: "center",
    minHeight: "100vh",
  },
  overlay: {
    position: "absolute",
    inset: 0,
    background: "linear-gradient(170deg, rgba(10,22,15,0.9) 0%, rgba(16,46,31,0.74) 100%)",
  },
  heroContent: {
    position: "relative",
    zIndex: 1,
    height: "100%",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    padding: "48px",
    color: "#fff",
  },
  brandRow: { display: "flex", alignItems: "center", gap: "12px" },
  brandIcon: {
    width: "42px",
    height: "42px",
    borderRadius: "10px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "linear-gradient(135deg, #2d6e4e, #1a3c2e)",
    border: "1px solid rgba(168,213,181,0.3)",
  },
  brandName: { fontWeight: 800, letterSpacing: "0.06em" },
  brandSub: { fontSize: "0.72rem", color: "rgba(255,255,255,0.55)", textTransform: "uppercase", letterSpacing: "0.12em" },
  badge: {
    display: "inline-block",
    padding: "6px 12px",
    borderRadius: "999px",
    background: "rgba(168,213,181,0.14)",
    border: "1px solid rgba(168,213,181,0.25)",
    color: "#a8d5b5",
    fontSize: "0.72rem",
    fontWeight: 700,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    marginBottom: "18px",
  },
  title: {
    margin: "0 0 14px",
    fontSize: "clamp(2.2rem, 4vw, 3.4rem)",
    lineHeight: 1.08,
    letterSpacing: "-0.04em",
  },
  desc: {
    margin: 0,
    maxWidth: "440px",
    fontSize: "0.98rem",
    lineHeight: 1.8,
    color: "rgba(255,255,255,0.68)",
  },
  tipBox: {
    marginTop: "28px",
    maxWidth: "420px",
    padding: "22px",
    borderRadius: "18px",
    background: "rgba(255,255,255,0.08)",
    border: "1px solid rgba(255,255,255,0.1)",
    backdropFilter: "blur(10px)",
  },
  tipTitle: { fontWeight: 700, marginBottom: "12px", color: "#a8d5b5" },
  tipText: { fontSize: "0.88rem", color: "rgba(255,255,255,0.72)", marginBottom: "8px" },
  panel: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "40px 28px",
  },
  card: {
    width: "100%",
    maxWidth: "420px",
    background: "#fbfaf7",
    border: "1px solid #e7e2da",
    borderRadius: "24px",
    padding: "36px",
    boxShadow: "0 24px 60px rgba(24, 33, 27, 0.08)",
  },
  header: { marginBottom: "24px" },
  smallTag: {
    display: "inline-block",
    background: "#1a3c2e",
    color: "#a8d5b5",
    padding: "4px 10px",
    borderRadius: "999px",
    fontSize: "0.68rem",
    fontWeight: 700,
    letterSpacing: "0.12em",
    textTransform: "uppercase",
    marginBottom: "14px",
  },
  cardTitle: { margin: "0 0 8px", fontSize: "2rem", letterSpacing: "-0.03em", color: "#161616" },
  cardSub: { margin: 0, color: "#7d7d7d", fontSize: "0.9rem" },
  errorBox: {
    marginBottom: "18px",
    background: "#fcebeb",
    border: "1px solid #f0b6b6",
    color: "#a32d2d",
    borderRadius: "10px",
    padding: "11px 14px",
    fontWeight: 600,
    fontSize: "0.85rem",
  },
  form: { display: "flex", flexDirection: "column", gap: "16px" },
  field: { display: "flex", flexDirection: "column", gap: "7px" },
  label: { fontSize: "0.82rem", fontWeight: 700, color: "#333" },
  inputWrap: {
    position: "relative",
    display: "flex",
    alignItems: "center",
    background: "#fff",
    border: "1.5px solid #e0ddd8",
    borderRadius: "12px",
  },
  inputIcon: { padding: "0 12px 0 14px", color: "#9c9c9c", fontSize: "0.9rem" },
  input: {
    flex: 1,
    border: "none",
    background: "transparent",
    padding: "14px 14px 14px 0",
    fontSize: "0.92rem",
    fontFamily: "inherit",
    color: "#1a1a1a",
  },
  eyeBtn: {
    position: "absolute",
    right: "12px",
    border: "none",
    background: "transparent",
    cursor: "pointer",
    fontSize: "0.95rem",
  },
  submitBtn: {
    marginTop: "6px",
    border: "none",
    borderRadius: "12px",
    background: "#1a3c2e",
    color: "#fff",
    padding: "14px",
    fontSize: "0.95rem",
    fontWeight: 700,
    cursor: "pointer",
  },
  footer: {
    marginTop: "20px",
    paddingTop: "18px",
    borderTop: "1px solid #e7e2da",
  },
  link: {
    color: "#1a3c2e",
    fontWeight: 700,
    textDecoration: "none",
    fontSize: "0.9rem",
  },
};
