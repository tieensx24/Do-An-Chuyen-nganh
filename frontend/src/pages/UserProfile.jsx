import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

// ================== API CONFIG ==================
const API_BASE = "http://localhost:5261/api"; 
const SERVER_URL = "http://localhost:5261"; // Added to prefix avatar paths

async function apiFetch(endpoint, options = {}) {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    headers: { "Content-Type": "application/json", ...options.headers },
    ...options,
  });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  const text = await res.text();
  return text ? JSON.parse(text) : {};
}

export default function UserProfile() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("info");
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const getAvatarSrc = (path) => {
    if (!path) return null;
    if (path.startsWith("data:") || path.startsWith("http")) return path;
    return `${SERVER_URL}${path}`;
  };

  useEffect(() => {
    // 1. Kiểm tra xem đã đăng nhập chưa
    const savedUser = localStorage.getItem("user");
    if (!savedUser) {
      alert("Vui lòng đăng nhập để xem hồ sơ!");
      navigate("/login");
      return;
    }

    const parsedUser = JSON.parse(savedUser);
    setUser(parsedUser);
    fetchUserOrders(parsedUser.userId || parsedUser.id);
  }, [navigate]);

  const fetchUserOrders = async (userId) => {
    setLoading(true);
    try {
      const allOrders = await apiFetch("/order");
      const myOrders = allOrders.filter(o => o.userId === userId || o.user_id === userId);
      
      const formattedOrders = myOrders.map(order => ({
        id: order.orderCode || `KT-${order.id}`,
        total: order.totalAmount,
        status: order.status,
        date: new Date(order.createdAt).toLocaleDateString("vi-VN"),
        payment: order.paymentMethod === "cod" ? "COD" : "Chuyển khoản"
      })).reverse();

      setOrders(formattedOrders);
    } catch (err) {
      console.error("Lỗi lấy lịch sử đơn hàng:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    if (window.confirm("Bạn có chắc chắn muốn đăng xuất?")) {
      localStorage.removeItem("user");
      navigate("/");
    }
  };

  // --- HÀM XỬ LÝ ĐỔI ẢNH ĐẠI DIỆN THẬT (LƯU VÀO DATABASE) ---
  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Vui lòng chỉ chọn file hình ảnh!");
      return;
    }

    setUploadingAvatar(true);

    // Dùng FormData để gói file ảnh gửi xuống C#
    const formData = new FormData();
    formData.append("file", file);

    const userId = user.userId || user.id;

    try {
      // Gọi API C# vừa viết
      const res = await fetch(`${API_BASE}/user/${userId}/avatar`, {
        method: "POST",
        body: formData, // Không set Content-Type header khi dùng FormData, trình duyệt sẽ tự set
      });

      if (!res.ok) throw new Error("Lỗi khi upload ảnh");

      const data = await res.json();
      
      // Lấy đường dẫn ảnh mới từ C# trả về (ví dụ: /uploads/avatars/abc.jpg)
      // Nối thêm địa chỉ server vào đầu để React hiển thị được
      const avatarPath = data.avatarUrl;

      // Cập nhật ảnh ngay lập tức trên giao diện
      const updatedUser = { ...user, avatar: avatarPath };
      setUser(updatedUser);
      
      // Lưu vào LocalStorage để thanh điều hướng (Navbar) đọc được
      localStorage.setItem("user", JSON.stringify(updatedUser));
      
      alert("Cập nhật ảnh đại diện thành công!");

      // Mẹo nhỏ: Bắt buộc trình duyệt load lại 1 chút để Navbar trên cùng đổi ảnh ngay lập tức
      window.dispatchEvent(new Event("storage")); 
      window.dispatchEvent(new Event("user-updated"));
      // window.location.reload(); // Có thể bỏ dòng này đi nếu Event storage hoạt động tốt

    } catch (err) {
      console.error("Lỗi upload:", err);
      alert("Không thể lưu ảnh vào Database!");
    } finally {
      setUploadingAvatar(false);
    }
  };

  if (!user) return null; 

  return (
    <div style={s.page}>
      <div style={s.layout}>
        {/* SIDEBAR TÀI KHOẢN */}
        <aside style={s.sidebar}>
          <div style={s.profileCard}>
            
            {/* KHU VỰC AVATAR MỚI CÓ THỂ CLICK ĐỂ THAY ĐỔI */}
            <label htmlFor="avatar-upload" className="avatar-wrap" style={s.avatarWrap}>
              {uploadingAvatar ? (
                <div style={s.avatarPlaceholder}>...</div>
              ) : user.avatar ? (
                <img src={getAvatarSrc(user.avatar)} alt="Avatar" style={s.avatarImg} />
              ) : (
                <div style={s.avatarPlaceholder}>
                  {user.fullName ? user.fullName.charAt(0).toUpperCase() : "U"}
                </div>
              )}
              
              {/* Lớp phủ hiệu ứng máy ảnh */}
              <div className="avatar-overlay" style={s.avatarOverlay}>
                <span style={{ fontSize: "1.2rem" }}>📷</span>
              </div>
            </label>
            <input 
              id="avatar-upload" 
              type="file" 
              accept="image/*" 
              style={{ display: "none" }} 
              onChange={handleAvatarChange} 
            />
            {/* =========================================== */}

            <div style={s.profileName}>{user.fullName || "Khách hàng"}</div>
            <div style={s.profileEmail}>{user.email}</div>
          </div>

          <nav style={s.nav}>
            <button 
              style={{ ...s.navBtn, ...(activeTab === "info" ? s.navBtnActive : {}) }}
              onClick={() => setActiveTab("info")}
            >
              <span style={s.navIcon}>👤</span> Thông tin cá nhân
            </button>
            <button 
              style={{ ...s.navBtn, ...(activeTab === "orders" ? s.navBtnActive : {}) }}
              onClick={() => setActiveTab("orders")}
            >
              <span style={s.navIcon}>🧾</span> Lịch sử đơn hàng
            </button>
            <button style={{ ...s.navBtn, color: "#e24b4a" }} onClick={handleLogout}>
              <span style={s.navIcon}>🚪</span> Đăng xuất
            </button>
          </nav>
        </aside>

        {/* NỘI DUNG CHÍNH */}
        <main style={s.content}>
          {activeTab === "info" && (
            <div style={s.card}>
              <h2 style={s.cardTitle}>Hồ sơ của tôi</h2>
              <p style={s.cardSub}>Quản lý thông tin bảo mật để bảo vệ tài khoản</p>
              <hr style={s.divider} />
              
              <div style={s.infoGrid}>
                <div style={s.infoGroup}>
                  <label style={s.infoLabel}>Họ và tên</label>
                  <div style={s.infoValue}>{user.fullName || "Chưa cập nhật"}</div>
                </div>
                <div style={s.infoGroup}>
                  <label style={s.infoLabel}>Email đăng nhập</label>
                  <div style={s.infoValue}>{user.email}</div>
                </div>
                <div style={s.infoGroup}>
                  <label style={s.infoLabel}>Số điện thoại</label>
                  <div style={s.infoValue}>{user.phone || "Chưa cập nhật"}</div>
                </div>
                <div style={s.infoGroup}>
                  <label style={s.infoLabel}>Loại tài khoản</label>
                  <div style={s.infoValue}>
                    {user.role === "admin" ? "👑 Quản trị viên" : "Khách hàng thành viên"}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "orders" && (
            <div style={s.card}>
              <h2 style={s.cardTitle}>Đơn hàng của tôi</h2>
              <p style={s.cardSub}>Theo dõi trạng thái các đơn vật liệu bạn đã đặt</p>
              <hr style={s.divider} />

              {loading ? (
                <div style={s.loadingText}>Đang tải lịch sử đơn hàng...</div>
              ) : orders.length === 0 ? (
                <div style={s.emptyBox}>
                  <div style={s.emptyIcon}>🛒</div>
                  <div style={s.emptyText}>Bạn chưa có đơn hàng nào.</div>
                  <button style={s.shopBtn} onClick={() => navigate("/products")}>Mua sắm ngay</button>
                </div>
              ) : (
                <div style={s.tableWrap}>
                  <table style={s.table}>
                    <thead>
                      <tr>
                        <th style={s.th}>Mã đơn</th>
                        <th style={s.th}>Ngày đặt</th>
                        <th style={s.th}>Tổng tiền</th>
                        <th style={s.th}>Thanh toán</th>
                        <th style={s.th}>Trạng thái</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map((o, idx) => (
                        <tr key={o.id} style={{ background: idx % 2 === 0 ? "#fff" : "#faf9f7" }}>
                          <td style={s.td}><span style={{ fontWeight: "700", color: "#1a3c2e" }}>{o.id}</span></td>
                          <td style={s.td}>{o.date}</td>
                          <td style={s.td}><span style={{ fontWeight: "700", color: "#c94a1a" }}>{o.total.toLocaleString("vi-VN")} ₫</span></td>
                          <td style={s.td}>{o.payment}</td>
                          <td style={s.td}><StatusBadge status={o.status} /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {/* STYLE CSS CHUẨN */}
      <style>{`
        .avatar-wrap { display: block; position: relative; cursor: pointer; border-radius: 50%; overflow: hidden; width: 80px; height: 80px; margin-bottom: 12px; border: 3px solid #f0eeea; transition: border-color 0.2s; }
        .avatar-wrap:hover { border-color: #a8d5b5; }
        .avatar-wrap:hover .avatar-overlay { opacity: 1 !important; }
      `}</style>
    </div>
  );
}

function StatusBadge({ status }) {
  const map = {
    pending:   { label: "Chờ xử lý",   bg: "#faeeda", color: "#854f0b" },
    shipping:  { label: "Đang giao",    bg: "#e6f1fb", color: "#185fa5" },
    done:      { label: "Hoàn thành",   bg: "#eaf3de", color: "#3b6d11" },
    cancelled: { label: "Đã hủy",       bg: "#fcebeb", color: "#a32d2d" },
  };
  const { label, bg, color } = map[status] || { label: status, bg: "#f5f4f0", color: "#555" };
  return (
    <span style={{ fontSize: "0.75rem", fontWeight: "700", padding: "4px 10px", borderRadius: "999px", background: bg, color, whiteSpace: "nowrap" }}>
      {label}
    </span>
  );
}

const s = {
  page: { minHeight: "100vh", background: "#f5f4f0", padding: "40px 24px", fontFamily: "'Be Vietnam Pro', 'Segoe UI', sans-serif" },
  layout: { maxWidth: "1000px", margin: "0 auto", display: "grid", gridTemplateColumns: "260px 1fr", gap: "24px", alignItems: "start" },
  
  sidebar: { display: "flex", flexDirection: "column", gap: "16px" },
  profileCard: { background: "#fff", borderRadius: "16px", padding: "30px 20px 24px", border: "1px solid #ebebeb", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" },
  
  // Style cho Avatar mới
  avatarWrap: {}, // Đã định nghĩa trong thẻ <style> bên trên
  avatarPlaceholder: { width: "100%", height: "100%", background: "#1a3c2e", color: "#a8d5b5", fontSize: "2.2rem", fontWeight: "800", display: "flex", alignItems: "center", justifyContent: "center" },
  avatarImg: { width: "100%", height: "100%", objectFit: "cover" },
  avatarOverlay: { position: "absolute", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", opacity: 0, transition: "opacity 0.2s" },

  profileName: { fontSize: "1.1rem", fontWeight: "800", color: "#1a1a1a", marginBottom: "4px" },
  profileEmail: { fontSize: "0.85rem", color: "#888" },
  nav: { background: "#fff", borderRadius: "16px", border: "1px solid #ebebeb", overflow: "hidden", display: "flex", flexDirection: "column" },
  navBtn: { display: "flex", alignItems: "center", padding: "16px 20px", border: "none", background: "transparent", borderBottom: "1px solid #f0eeea", fontSize: "0.95rem", fontWeight: "600", color: "#555", cursor: "pointer", transition: "all 0.2s", textAlign: "left" },
  navBtnActive: { background: "#f0f7f3", color: "#1a3c2e", borderLeft: "3px solid #1a3c2e" },
  navIcon: { marginRight: "12px", fontSize: "1.1rem" },

  content: { minWidth: 0 },
  card: { background: "#fff", borderRadius: "16px", padding: "32px", border: "1px solid #ebebeb", minHeight: "400px" },
  cardTitle: { fontSize: "1.4rem", fontWeight: "800", color: "#1a1a1a", margin: "0 0 6px 0" },
  cardSub: { fontSize: "0.9rem", color: "#888", margin: 0 },
  divider: { border: "none", borderTop: "1px solid #f0eeea", margin: "20px 0" },
  
  infoGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" },
  infoGroup: { display: "flex", flexDirection: "column", gap: "6px" },
  infoLabel: { fontSize: "0.85rem", fontWeight: "600", color: "#aaa" },
  infoValue: { fontSize: "1rem", fontWeight: "700", color: "#1a1a1a", background: "#faf9f7", padding: "12px 16px", borderRadius: "10px", border: "1px solid #e0ddd8" },

  loadingText: { textAlign: "center", color: "#888", padding: "40px 0" },
  emptyBox: { textAlign: "center", padding: "60px 0" },
  emptyIcon: { fontSize: "3rem", marginBottom: "16px" },
  emptyText: { fontSize: "1rem", color: "#888", marginBottom: "20px" },
  shopBtn: { padding: "12px 28px", background: "#1a3c2e", color: "#fff", border: "none", borderRadius: "10px", fontSize: "0.95rem", fontWeight: "700", cursor: "pointer" },
  tableWrap: { overflowX: "auto" },
  table: { width: "100%", borderCollapse: "collapse", minWidth: "600px" },
  th: { textAlign: "left", padding: "14px", fontSize: "0.85rem", fontWeight: "700", color: "#888", textTransform: "uppercase", borderBottom: "2px solid #f0eeea" },
  td: { padding: "16px 14px", fontSize: "0.95rem", color: "#444", borderBottom: "1px solid #f0eeea" },
};
