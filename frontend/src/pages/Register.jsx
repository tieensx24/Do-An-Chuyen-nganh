import { useState } from 'react';
import { Link } from 'react-router-dom';

export default function Register() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const passwordStrength = () => {
    if (!password) return 0;
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    return score;
  };

  const strengthLabel = ['', 'Yếu', 'Trung bình', 'Khá mạnh', 'Mạnh'];
  const strengthColor = ['', '#e24b4a', '#ef9f27', '#639922', '#1d9e75'];
  const strength = passwordStrength();

  const handleRegister = (e) => {
    e.preventDefault();
    setError('');
    if (password !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp. Vui lòng thử lại.');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      alert("Giao diện Đăng ký đã sẵn sàng gửi dữ liệu xuống Backend!");
    }, 900);
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
            <h2 style={s.leftTitle}>Tham gia<br />cùng chúng tôi</h2>
            <p style={s.leftDesc}>
              Tạo tài khoản để đặt hàng nhanh chóng, theo dõi đơn hàng và nhận ưu đãi đặc biệt dành cho thành viên.
            </p>

            <div style={s.benefitList}>
              {[
                { icon: "✓", text: "Đặt hàng và thanh toán trực tuyến" },
                { icon: "✓", text: "Theo dõi tiến độ giao hàng" },
                { icon: "✓", text: "Nhận báo giá ưu tiên cho thành viên" },
                { icon: "✓", text: "Lịch sử mua hàng, tái đặt hàng nhanh" },
              ].map(({ icon, text }) => (
                <div key={text} style={s.benefit}>
                  <span style={s.benefitIcon}>{icon}</span>
                  <span style={s.benefitText}>{text}</span>
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
            <div style={s.formTag}>Tài khoản mới</div>
            <h1 style={s.formTitle}>Đăng ký</h1>
            <p style={s.formSub}>Điền thông tin để tạo tài khoản</p>
          </div>

          {error && (
            <div style={s.errorBox}>
              <span style={{ fontSize: "0.9rem" }}>⚠</span> {error}
            </div>
          )}

          <form onSubmit={handleRegister} style={s.form}>
            {/* Full name */}
            <div style={s.field}>
              <label style={s.label}>Họ và tên</label>
              <div style={s.inputWrap}>
                <span style={s.inputIcon}>👤</span>
                <input
                  type="text"
                  placeholder="Nguyễn Văn A"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  style={s.input}
                  onFocus={(e) => e.currentTarget.parentElement.style.borderColor = "#2d6e4e"}
                  onBlur={(e) => e.currentTarget.parentElement.style.borderColor = "#e0ddd8"}
                />
              </div>
            </div>

            {/* 2-col: email + phone */}
            <div style={s.row2}>
              <div style={s.field}>
                <label style={s.label}>Email</label>
                <div style={s.inputWrap}>
                  <span style={s.inputIcon}>✉</span>
                  <input
                    type="email"
                    placeholder="ten@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    style={s.input}
                    onFocus={(e) => e.currentTarget.parentElement.style.borderColor = "#2d6e4e"}
                    onBlur={(e) => e.currentTarget.parentElement.style.borderColor = "#e0ddd8"}
                  />
                </div>
              </div>
              <div style={s.field}>
                <label style={s.label}>Số điện thoại</label>
                <div style={s.inputWrap}>
                  <span style={s.inputIcon}>📞</span>
                  <input
                    type="tel"
                    placeholder="0909 123 456"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    style={s.input}
                    onFocus={(e) => e.currentTarget.parentElement.style.borderColor = "#2d6e4e"}
                    onBlur={(e) => e.currentTarget.parentElement.style.borderColor = "#e0ddd8"}
                  />
                </div>
              </div>
            </div>

            {/* Password */}
            <div style={s.field}>
              <label style={s.label}>Mật khẩu</label>
              <div style={s.inputWrap}>
                <span style={s.inputIcon}>🔒</span>
                <input
                  type={showPass ? "text" : "password"}
                  placeholder="Tối thiểu 8 ký tự"
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
              {/* Strength bar */}
              {password && (
                <div style={s.strengthWrap}>
                  <div style={s.strengthBar}>
                    {[1, 2, 3, 4].map(i => (
                      <div key={i} style={{
                        ...s.strengthSegment,
                        background: i <= strength ? strengthColor[strength] : "#e0ddd8",
                      }} />
                    ))}
                  </div>
                  <span style={{ ...s.strengthLabel, color: strengthColor[strength] }}>
                    {strengthLabel[strength]}
                  </span>
                </div>
              )}
            </div>

            {/* Confirm password */}
            <div style={s.field}>
              <label style={s.label}>Xác nhận mật khẩu</label>
              <div style={{
                ...s.inputWrap,
                borderColor: confirmPassword && confirmPassword !== password ? "#e24b4a" : "#e0ddd8",
              }}>
                <span style={s.inputIcon}>🔒</span>
                <input
                  type={showConfirm ? "text" : "password"}
                  placeholder="Nhập lại mật khẩu"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  style={{ ...s.input, paddingRight: "44px" }}
                  onFocus={(e) => e.currentTarget.parentElement.style.borderColor = "#2d6e4e"}
                  onBlur={(e) => {
                    e.currentTarget.parentElement.style.borderColor =
                      confirmPassword && confirmPassword !== password ? "#e24b4a" : "#e0ddd8";
                  }}
                />
                <button type="button" onClick={() => setShowConfirm(!showConfirm)} style={s.eyeBtn}>
                  {showConfirm ? "🙈" : "👁"}
                </button>
              </div>
              {confirmPassword && confirmPassword !== password && (
                <span style={s.matchError}>Mật khẩu chưa khớp</span>
              )}
              {confirmPassword && confirmPassword === password && (
                <span style={s.matchOk}>✓ Mật khẩu khớp</span>
              )}
            </div>

            {/* Terms */}
            <label style={s.checkLabel}>
              <input type="checkbox" required style={{ accentColor: "#1a3c2e", width: "15px", height: "15px", flexShrink: 0 }} />
              <span style={{ fontSize: "0.82rem", color: "#777", lineHeight: "1.5" }}>
                Tôi đồng ý với{" "}
                <a href="#" style={{ color: "#2d6e4e", fontWeight: "600", textDecoration: "none" }}>Điều khoản sử dụng</a>
                {" "}và{" "}
                <a href="#" style={{ color: "#2d6e4e", fontWeight: "600", textDecoration: "none" }}>Chính sách bảo mật</a>
              </span>
            </label>

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
                  <span style={s.spinner} /> Đang tạo tài khoản...
                </span>
              ) : "Tạo tài khoản"}
            </button>
          </form>

          <div style={s.dividerWrap}>
            <div style={s.dividerLine} />
            <span style={s.dividerText}>đã có tài khoản?</span>
            <div style={s.dividerLine} />
          </div>

          <Link to="/login" style={s.loginLink}
            onMouseOver={(e) => e.currentTarget.style.background = "#eaf3de"}
            onMouseOut={(e) => e.currentTarget.style.background = "transparent"}
          >
            Quay lại đăng nhập →
          </Link>
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
  page: {
    display: "flex",
    minHeight: "100vh",
    fontFamily: "'Be Vietnam Pro', 'Segoe UI', sans-serif",
    background: "#f5f4f0",
  },
  left: {
    flex: 1,
    position: "relative",
    backgroundImage: "url('/home/image/home3.jpg')",
    backgroundSize: "cover",
    backgroundPosition: "center",
    display: "flex",
    flexDirection: "column",
    minHeight: "100vh",
  },
  leftOverlay: {
    position: "absolute",
    inset: 0,
    background: "linear-gradient(160deg, rgba(10,22,15,0.9) 0%, rgba(10,22,15,0.6) 100%)",
  },
  leftContent: {
    position: "relative",
    zIndex: 1,
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    height: "100%",
    padding: "48px",
    minHeight: "100vh",
  },
  leftLogo: { display: "flex", alignItems: "center", gap: "12px" },
  logoIcon: {
    width: "42px", height: "42px",
    background: "linear-gradient(135deg, #2d6e4e, #1a3c2e)",
    borderRadius: "10px",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: "1.2rem",
    border: "1px solid rgba(168,213,181,0.3)",
  },
  logoName: { fontWeight: "800", fontSize: "1rem", color: "#fff", letterSpacing: "0.04em", lineHeight: 1 },
  logoSub: { fontSize: "0.65rem", color: "rgba(255,255,255,0.45)", letterSpacing: "0.1em", textTransform: "uppercase", marginTop: "2px" },
  leftBody: { paddingBottom: "8px" },
  leftTitle: {
    fontSize: "clamp(2rem, 3.5vw, 3rem)",
    fontWeight: "900",
    color: "#fff",
    margin: "0 0 18px",
    lineHeight: "1.15",
    letterSpacing: "-0.03em",
  },
  leftDesc: {
    fontSize: "0.93rem",
    color: "rgba(255,255,255,0.6)",
    lineHeight: "1.75",
    maxWidth: "380px",
    margin: "0 0 36px",
  },
  benefitList: { display: "flex", flexDirection: "column", gap: "12px" },
  benefit: { display: "flex", alignItems: "flex-start", gap: "10px" },
  benefitIcon: {
    width: "20px", height: "20px",
    background: "rgba(168,213,181,0.2)",
    border: "1px solid rgba(168,213,181,0.4)",
    borderRadius: "50%",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: "0.65rem",
    color: "#a8d5b5",
    fontWeight: "800",
    flexShrink: 0,
    lineHeight: "20px",
    textAlign: "center",
  },
  benefitText: { fontSize: "0.85rem", color: "rgba(255,255,255,0.65)", lineHeight: "1.5" },
  right: {
    width: "500px",
    flexShrink: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "40px 32px",
    background: "#f5f4f0",
    overflowY: "auto",
  },
  formBox: { width: "100%", maxWidth: "400px" },
  formHeader: { marginBottom: "28px" },
  formTag: {
    display: "inline-block",
    background: "#1a3c2e",
    color: "#a8d5b5",
    fontSize: "0.68rem",
    fontWeight: "700",
    letterSpacing: "0.12em",
    textTransform: "uppercase",
    padding: "4px 12px",
    borderRadius: "999px",
    marginBottom: "12px",
  },
  formTitle: {
    fontSize: "2rem", fontWeight: "900", color: "#1a1a1a",
    margin: "0 0 5px", letterSpacing: "-0.03em",
  },
  formSub: { fontSize: "0.88rem", color: "#999", margin: 0 },
  errorBox: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    background: "#fcebeb",
    border: "1px solid #f09595",
    color: "#a32d2d",
    fontSize: "0.83rem",
    fontWeight: "600",
    padding: "10px 14px",
    borderRadius: "8px",
    marginBottom: "16px",
  },
  form: { display: "flex", flexDirection: "column", gap: "16px" },
  row2: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" },
  field: { display: "flex", flexDirection: "column", gap: "6px" },
  label: { fontSize: "0.82rem", fontWeight: "700", color: "#333", letterSpacing: "0.02em" },
  inputWrap: {
    display: "flex",
    alignItems: "center",
    background: "#fff",
    border: "1.5px solid #e0ddd8",
    borderRadius: "10px",
    transition: "border-color 0.2s",
    position: "relative",
  },
  inputIcon: { padding: "0 10px 0 12px", fontSize: "0.85rem", color: "#bbb", flexShrink: 0 },
  input: {
    flex: 1,
    border: "none",
    background: "transparent",
    padding: "12px 12px 12px 0",
    fontSize: "0.88rem",
    color: "#1a1a1a",
    width: "100%",
    fontFamily: "inherit",
  },
  eyeBtn: {
    position: "absolute", right: "10px",
    background: "none", border: "none",
    cursor: "pointer", fontSize: "0.9rem",
    padding: "4px", color: "#bbb", lineHeight: 1,
  },
  strengthWrap: { display: "flex", alignItems: "center", gap: "10px", marginTop: "4px" },
  strengthBar: { display: "flex", gap: "4px", flex: 1 },
  strengthSegment: { height: "4px", flex: 1, borderRadius: "2px", transition: "background 0.3s" },
  strengthLabel: { fontSize: "0.72rem", fontWeight: "700", minWidth: "60px", textAlign: "right" },
  matchError: { fontSize: "0.75rem", color: "#e24b4a", fontWeight: "600" },
  matchOk: { fontSize: "0.75rem", color: "#1d9e75", fontWeight: "600" },
  checkLabel: { display: "flex", alignItems: "flex-start", gap: "8px", cursor: "pointer" },
  submitBtn: {
    padding: "14px",
    background: "#1a3c2e",
    color: "white",
    border: "none",
    borderRadius: "10px",
    fontSize: "0.95rem",
    fontWeight: "700",
    transition: "all 0.2s",
    letterSpacing: "0.02em",
    marginTop: "4px",
  },
  spinner: {
    width: "16px", height: "16px",
    border: "2px solid rgba(255,255,255,0.3)",
    borderTopColor: "#fff",
    borderRadius: "50%",
    display: "inline-block",
    animation: "spin 0.7s linear infinite",
  },
  dividerWrap: { display: "flex", alignItems: "center", gap: "12px", margin: "20px 0 16px" },
  dividerLine: { flex: 1, height: "1px", background: "#e0ddd8" },
  dividerText: { fontSize: "0.75rem", color: "#bbb", fontWeight: "500", whiteSpace: "nowrap" },
  loginLink: {
    display: "block",
    textAlign: "center",
    padding: "12px",
    color: "#1a3c2e",
    fontWeight: "700",
    fontSize: "0.88rem",
    textDecoration: "none",
    border: "1.5px solid #d5d3cd",
    borderRadius: "10px",
    transition: "background 0.2s",
  },
};
