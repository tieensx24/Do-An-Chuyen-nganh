import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("http://localhost:5261/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        setError(data.message || "Đăng nhập thất bại!");
        setLoading(false);
        return;
      }

      // 1. Lưu thông tin người dùng vào localStorage
      localStorage.setItem("user", JSON.stringify(data));
      // Lưu thêm token riêng lẻ nếu cần cho các request sau
      if (data.token) localStorage.setItem("adminToken", data.token);

      alert(`Chào mừng ${data.fullName}!`);

      // 2. LOGIC ĐIỀU HƯỚNG DỰA TRÊN ROLE
      // Backend của bạn trả về data.role (admin hoặc user)
      if (data.role === "admin") {
        navigate("/admin"); // Chuyển hướng đến trang quản trị
      } else {
        navigate("/");      // Chuyển hướng về trang chủ khách hàng
      }

    } catch (err) {
      setError("Không thể kết nối server! Vui lòng kiểm tra Docker.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={s.page}>
      {/* Left panel */}
      <div style={s.left}>
        <div style={s.leftOverlay} />
        <div style={s.leftContent}>
          <div style={s.leftLogo}>
            <div style={s.logoIcon}>🏗️</div>
            <div>
              <div style={s.logoName}>KIẾN TẠO</div>
              <div style={s.logoSub}>Vật liệu xây dựng</div>
            </div>
          </div>
          <div style={s.leftBody}>
            <h2 style={s.leftTitle}>Chào mừng<br />trở lại!</h2>
            <p style={s.leftDesc}>
              Đăng nhập để theo dõi đơn hàng, xem lịch sử mua hàng và nhận ưu đãi dành riêng cho bạn.
            </p>
            <div style={s.statRow}>
              {[
                { val: "500+", label: "Sản phẩm" },
                { val: "5K+", label: "Khách hàng" },
                { val: "10+", label: "Năm KN" },
              ].map(({ val, label }) => (
                <div key={label} style={s.stat}>
                  <div style={s.statVal}>{val}</div>
                  <div style={s.statLabel}>{label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div style={s.right}>
        <div style={s.formBox}>
          <div style={s.formHeader}>
            <div style={s.formTag}>Tài khoản</div>
            <h1 style={s.formTitle}>Đăng nhập</h1>
            <p style={s.formSub}>Nhập thông tin để tiếp tục</p>
          </div>

          <form onSubmit={handleLogin} style={s.form}>
            {/* Email */}
            <div style={s.field}>
              <label style={s.label}>Email</label>
              <div style={s.inputWrap}>
                <span style={s.inputIcon}>✉</span>
                <input
                  type="email"
                  placeholder="admin@kientao.vn"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  style={s.input}
                  onFocus={(e) => e.currentTarget.parentElement.style.borderColor = "#2d6e4e"}
                  onBlur={(e) => e.currentTarget.parentElement.style.borderColor = "#e0ddd8"}
                />
              </div>
            </div>

            {/* Password */}
            <div style={s.field}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <label style={s.label}>Mật khẩu</label>
                <a href="#" style={s.forgot}>Quên mật khẩu?</a>
              </div>
              <div style={s.inputWrap}>
                <span style={s.inputIcon}>🔒</span>
                <input
                  type={showPass ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  style={{ ...s.input, paddingRight: "44px" }}
                  onFocus={(e) => e.currentTarget.parentElement.style.borderColor = "#2d6e4e"}
                  onBlur={(e) => e.currentTarget.parentElement.style.borderColor = "#e0ddd8"}
                />
                <button type="button" onClick={() => setShowPass(!showPass)} style={s.eyeBtn}>
                  {showPass ? "🙈" : "👁"}
                </button>
              </div>
            </div>

            {/* Remember me */}
            <div style={s.rememberRow}>
              <label style={s.checkLabel}>
                <input type="checkbox" style={{ accentColor: "#1a3c2e", width: "15px", height: "15px" }} />
                <span style={{ color: "#666", fontSize: "0.85rem" }}>Ghi nhớ đăng nhập</span>
              </label>
            </div>

            {/* Error box */}
            {error && (
              <div style={s.errorBox}>
                ⚠ {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              style={{
                ...s.submitBtn,
                opacity: loading ? 0.8 : 1,
                cursor: loading ? "not-allowed" : "pointer",
              }}
              onMouseOver={(e) => { if (!loading) e.currentTarget.style.background = "#2d6e4e"; }}
              onMouseOut={(e) => { if (!loading) e.currentTarget.style.background = "#1a3c2e"; }}
            >
              {loading ? (
                <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                  <span style={s.spinner} />
                  Đang xử lý...
                </span>
              ) : "Đăng nhập"}
            </button>
          </form>

          {/* Divider */}
          <div style={s.dividerWrap}>
            <div style={s.dividerLine} />
            <span style={s.dividerText}>hoặc</span>
            <div style={s.dividerLine} />
          </div>

          {/* Register */}
          <p style={s.registerText}>
            Chưa có tài khoản?{" "}
            <Link to="/register" style={s.registerLink}>
              Tạo tài khoản mới →
            </Link>
          </p>
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        input::placeholder { color: #bbb; }
        input:focus { outline: none; }
      `}</style>
    </div>
  );
}

const s = {
  page: { display: "flex", minHeight: "100vh", fontFamily: "'Be Vietnam Pro', 'Segoe UI', sans-serif", background: "#f5f4f0" },
  left: { flex: 1, position: "relative", backgroundImage: "url('/home/image/home2.jpg')", backgroundSize: "cover", backgroundPosition: "center", display: "flex", flexDirection: "column", minHeight: "100vh" },
  leftOverlay: { position: "absolute", inset: 0, background: "linear-gradient(160deg, rgba(10,22,15,0.88) 0%, rgba(10,22,15,0.65) 100%)" },
  leftContent: { position: "relative", zIndex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between", height: "100%", padding: "48px", minHeight: "100vh" },
  leftLogo: { display: "flex", alignItems: "center", gap: "12px" },
  logoIcon: { width: "42px", height: "42px", background: "linear-gradient(135deg, #2d6e4e, #1a3c2e)", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.2rem", border: "1px solid rgba(168,213,181,0.3)" },
  logoName: { fontWeight: "800", fontSize: "1rem", color: "#fff", letterSpacing: "0.04em", lineHeight: 1 },
  logoSub: { fontSize: "0.65rem", color: "rgba(255,255,255,0.45)", letterSpacing: "0.1em", textTransform: "uppercase", marginTop: "2px" },
  leftBody: { paddingBottom: "8px" },
  leftTitle: { fontSize: "clamp(2.2rem, 4vw, 3.2rem)", fontWeight: "900", color: "#fff", margin: "0 0 20px", lineHeight: "1.15", letterSpacing: "-0.03em" },
  leftDesc: { fontSize: "0.95rem", color: "rgba(255,255,255,0.6)", lineHeight: "1.75", maxWidth: "380px", margin: "0 0 40px" },
  statRow: { display: "flex", gap: "32px" },
  stat: { textAlign: "left" },
  statVal: { fontSize: "1.6rem", fontWeight: "900", color: "#a8d5b5", lineHeight: 1 },
  statLabel: { fontSize: "0.72rem", color: "rgba(255,255,255,0.4)", marginTop: "4px", letterSpacing: "0.08em", textTransform: "uppercase" },
  right: { width: "480px", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 32px", background: "#f5f4f0" },
  formBox: { width: "100%", maxWidth: "380px" },
  formHeader: { marginBottom: "36px" },
  formTag: { display: "inline-block", background: "#1a3c2e", color: "#a8d5b5", fontSize: "0.68rem", fontWeight: "700", letterSpacing: "0.12em", textTransform: "uppercase", padding: "4px 12px", borderRadius: "999px", marginBottom: "14px" },
  formTitle: { fontSize: "2rem", fontWeight: "900", color: "#1a1a1a", margin: "0 0 6px", letterSpacing: "-0.03em" },
  formSub: { fontSize: "0.88rem", color: "#999", margin: 0 },
  form: { display: "flex", flexDirection: "column", gap: "20px" },
  field: { display: "flex", flexDirection: "column", gap: "7px" },
  label: { fontSize: "0.82rem", fontWeight: "700", color: "#333", letterSpacing: "0.02em" },
  inputWrap: { display: "flex", alignItems: "center", background: "#fff", border: "1.5px solid #e0ddd8", borderRadius: "10px", transition: "border-color 0.2s", position: "relative" },
  inputIcon: { padding: "0 12px 0 14px", fontSize: "0.9rem", color: "#bbb", flexShrink: 0 },
  input: { flex: 1, border: "none", background: "transparent", padding: "13px 14px 13px 0", fontSize: "0.92rem", color: "#1a1a1a", width: "100%", fontFamily: "inherit" },
  eyeBtn: { position: "absolute", right: "12px", background: "none", border: "none", cursor: "pointer", fontSize: "0.95rem", padding: "4px", color: "#bbb", lineHeight: 1 },
  forgot: { fontSize: "0.78rem", color: "#2d6e4e", textDecoration: "none", fontWeight: "600" },
  rememberRow: { marginTop: "-4px" },
  checkLabel: { display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" },
  errorBox: { background: "#fcebeb", border: "1px solid #f09595", color: "#a32d2d", fontSize: "0.83rem", fontWeight: "600", padding: "10px 14px", borderRadius: "8px" },
  submitBtn: { padding: "14px", background: "#1a3c2e", color: "white", border: "none", borderRadius: "10px", fontSize: "0.95rem", fontWeight: "700", transition: "all 0.2s", letterSpacing: "0.02em", marginTop: "4px" },
  spinner: { width: "16px", height: "16px", border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", borderRadius: "50%", display: "inline-block", animation: "spin 0.7s linear infinite" },
  dividerWrap: { display: "flex", alignItems: "center", gap: "12px", margin: "24px 0 20px" },
  dividerLine: { flex: 1, height: "1px", background: "#e0ddd8" },
  dividerText: { fontSize: "0.78rem", color: "#bbb", fontWeight: "500" },
  registerText: { textAlign: "center", fontSize: "0.88rem", color: "#888", margin: 0 },
  registerLink: { color: "#1a3c2e", fontWeight: "700", textDecoration: "none" },
};