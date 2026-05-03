import { useState, useEffect, useRef } from "react";

// ================== API CONFIG ==================
const API_BASE = "http://localhost:5261/api"; 
const SERVER_URL = "http://localhost:5261"; 

async function apiFetch(endpoint, options = {}) {
  const headers = { ...options.headers };
  if (!(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  const res = await fetch(`${API_BASE}${endpoint}`, {
    headers,
    ...options,
  });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  
  // Xử lý cẩn thận nếu API không trả về nội dung (VD: lệnh DELETE)
  const text = await res.text();
  if (!text) return {}; 
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

// ================== MOCK CHART ==================
const MOCK_CHART = [
  { month: "T1", value: 12 }, { month: "T2", value: 18 }, { month: "T3", value: 9 },
  { month: "T4", value: 24 }, { month: "T5", value: 31 }, { month: "T6", value: 28 },
  { month: "T7", value: 19 }, { month: "T8", value: 35 }, { month: "T9", value: 42 },
  { month: "T10", value: 38 }, { month: "T11", value: 51 }, { month: "T12", value: 47 },
];

// ================== MAIN COMPONENT ==================
export default function AdminDashboard() {
  const [tab, setTab] = useState("dashboard");
  const [stats, setStats] = useState(null);
  const [chart, setChart] = useState(MOCK_CHART);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [categories, setCategories] = useState([]); 
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [productModal, setProductModal] = useState(null); 
  const [couponModal, setCouponModal] = useState(false);
  const [search, setSearch] = useState("");
  const [orderFilter, setOrderFilter] = useState("all");
  const [adminUser, setAdminUser] = useState(() => {
    const saved = localStorage.getItem("user");
    return saved ? JSON.parse(saved) : null;
  });

  useEffect(() => {
    loadAll();
  }, []);

  useEffect(() => {
    const syncAdminUser = () => {
      const saved = localStorage.getItem("user");
      setAdminUser(saved ? JSON.parse(saved) : null);
    };

    window.addEventListener("storage", syncAdminUser);
    window.addEventListener("user-updated", syncAdminUser);

    return () => {
      window.removeEventListener("storage", syncAdminUser);
      window.removeEventListener("user-updated", syncAdminUser);
    };
  }, []);

  const loadAll = async () => {
    setLoading(true);
    try {
      const p = await apiFetch("/product");
      setProducts(p);

      const u = await apiFetch("/user"); 
      const formattedUsers = u.map(user => ({
        id: user.id,
        name: user.fullName || "Chưa cập nhật",
        email: user.email,
        phone: user.phone || "Chưa cập nhật",
        role: user.role === "admin" ? "admin" : "customer",
        orders: 0, 
        joined: user.createdAt ? new Date(user.createdAt).toLocaleDateString("vi-VN") : "N/A"
      }));
      setUsers(formattedUsers);

      const o = await apiFetch("/order");
      const formattedOrders = o.map(order => ({
        id: order.orderCode || `KT-${order.id}`, 
        dbId: order.id,
        customer: order.customerName,
        phone: order.phone,
        total: order.totalAmount,
        status: order.status,
        date: new Date(order.createdAt).toLocaleDateString("vi-VN"),
        payment: order.paymentMethod === "cod" ? "COD" : "Chuyển khoản"
      })).reverse(); 
      
      setOrders(formattedOrders);

      const c = await apiFetch("/category");
      setCategories(c);

      const cp = await apiFetch("/coupon");
      setCoupons(cp);

      const totalRevenue = formattedOrders
        .filter(ord => ord.status === "done") 
        .reduce((sum, ord) => sum + ord.total, 0);

      setStats({
        revenue: totalRevenue, 
        orders: formattedOrders.length,  
        products: p.length,          
        users: u.length              
      }); 
      
    } catch (err) {
      console.error("Lỗi:", err);
      alert("Lỗi khi kết nối API! Đảm bảo Backend đang chạy.");
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (dbId, newStatus) => {
    try {
      await apiFetch(`/order/${dbId}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newStatus)
      });
      setOrders(prev => prev.map(o => o.dbId === dbId ? { ...o, status: newStatus } : o));
      alert("Cập nhật trạng thái thành công!");
    } catch (err) {
      alert("Lỗi cập nhật trạng thái!");
      console.error(err);
    }
  };

  const deleteProduct = async (id) => {
    if (!window.confirm("Xóa sản phẩm này?")) return;
    try { 
      await apiFetch(`/product/${id}`, { method: "DELETE" }); 
      setProducts(prev => prev.filter(p => p.id !== id));
    } catch {
      alert("Lỗi khi xóa sản phẩm!");
    }
  };

  const saveProduct = async (data) => {
    const formData = new FormData();
    formData.append("Name", data.name);
    formData.append("Description", data.description || "");
    formData.append("Price", Number(data.price));
    formData.append("StockQuantity", Number(data.stockQuantity));
    formData.append("CategoryId", Number(data.categoryId));
    formData.append("Brand", data.brand || "");
    formData.append("Unit", data.unit || "Cái");
    formData.append("Image", data.image || "");

    if (data.rawFile) {
      formData.append("ImageFile", data.rawFile); 
    }

    try {
      const method = data.id ? "PUT" : "POST";
      const endpoint = data.id ? `/product/${data.id}` : "/product";

      const res = await fetch(`${API_BASE}${endpoint}`, {
        method: method,
        body: formData,
      });

      if (!res.ok) {
        const errorText = await res.text();
        alert("LỖI TỪ SERVER C#:\n\n" + errorText);
        return; 
      }

      loadAll(); 
      setProductModal(null);
      alert("Lưu sản phẩm thành công!");
    } catch (err) {
      console.error("Lỗi mạng/React:", err);
      alert("Không thể kết nối đến Server! Lỗi: " + err.message);
    }
  };

/*  const navItems = [
    { id: "dashboard", icon: "▦", label: "Tổng quan" },
    { id: "products", icon: "📦", label: "Sản phẩm" },
    { id: "orders", icon: "🧾", label: "Đơn hàng" },
    { id: "users", icon: "👥", label: "Người dùng" },
  ];

*/
  const saveCoupon = async (data) => {
    try {
      const res = await fetch(`${API_BASE}/coupon`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const text = await res.text();
      const payload = text ? JSON.parse(text) : {};

      if (!res.ok) {
        alert(payload.message || "Lỗi khi tạo mã giảm giá!");
        return;
      }

      await loadAll();
      setCouponModal(false);
      alert("Tạo mã giảm giá thành công!");
    } catch (err) {
      console.error(err);
      alert("Không thể kết nối server khi tạo mã giảm giá!");
    }
  };

  const updateCouponStatus = async (id, isActive) => {
    try {
      await apiFetch(`/coupon/${id}/status`, {
        method: "PUT",
        body: JSON.stringify(isActive),
      });
      setCoupons(prev => prev.map(c => c.id === id ? { ...c, isActive } : c));
    } catch (err) {
      console.error(err);
      alert("Lỗi cập nhật trạng thái mã giảm giá!");
    }
  };

  const navItems = [
    { id: "dashboard", icon: "◦", label: "Tổng quan" },
    { id: "products", icon: "📦", label: "Sản phẩm" },
    { id: "orders", icon: "🧾", label: "Đơn hàng" },
    { id: "coupons", icon: "🏷️", label: "Mã giảm giá" },
    { id: "users", icon: "👥", label: "Người dùng" },
  ];

  const getAvatarSrc = (path) => {
    if (!path) return null;
    if (path.startsWith("data:") || path.startsWith("http")) return path;
    return `${SERVER_URL}${path}`;
  };

  const adminDisplayName = adminUser?.fullName || "Admin";
  const adminDisplayEmail = adminUser?.email || "admin@kientao.vn";
  const adminInitial = adminDisplayName.trim().charAt(0).toUpperCase() || "A";
  const adminAvatarSrc = getAvatarSrc(adminUser?.avatar);

  return (
    <div style={s.shell}>
      <aside style={s.sidebar}>
        <div style={s.sidebarLogo}>
          <div style={s.logoBox}>🏗️</div>
          <div>
            <div style={s.logoName}>KIẾN TẠO</div>
            <div style={s.logoRole}>Admin Panel</div>
          </div>
        </div>

        <nav style={s.nav}>
          {navItems.map(item => (
            <button key={item.id} style={{
              ...s.navBtn,
              background: tab === item.id ? "rgba(168,213,181,0.12)" : "transparent",
              color: tab === item.id ? "#a8d5b5" : "rgba(255,255,255,0.5)",
              borderLeft: tab === item.id ? "3px solid #a8d5b5" : "3px solid transparent",
            }} onClick={() => setTab(item.id)}>
              <span style={{ fontSize: "1rem" }}>{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>

        <div style={s.sidebarFooter}>
          <div style={s.adminBadge}>
            <div style={s.adminAvatar}>
              {adminAvatarSrc ? (
                <img src={adminAvatarSrc} alt={adminDisplayName} style={s.adminAvatarImg} />
              ) : (
                adminInitial
              )}
            </div>
            <div>
              <div style={{ fontSize: "0.82rem", fontWeight: "700", color: "#fff" }}>{adminDisplayName}</div>
              <div style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.4)" }}>{adminDisplayEmail}</div>
            </div>
          </div>
        </div>
      </aside>

      <main style={s.main}>
        <div style={s.topbar}>
          <div>
            <div style={s.pageTitle}>{navItems.find(n => n.id === tab)?.label}</div>
            <div style={s.pageSub}>Hệ thống quản trị VLXD Kiến Tạo</div>
          </div>
          <button style={s.refreshBtn} onClick={loadAll}>↻ Làm mới</button>
        </div>

        {loading ? (
          <div style={s.loadingWrap}>
            <div style={s.spinner} />
            <p style={{ color: "#aaa", marginTop: "12px", fontSize: "0.88rem" }}>Đang tải dữ liệu...</p>
          </div>
        ) : (
          <div style={{ padding: "24px" }}>
            {tab === "dashboard" && <TabDashboard stats={stats} chart={chart} orders={orders} />}
            {tab === "products" && <TabProducts products={products} search={search} setSearch={setSearch} onDelete={deleteProduct} onEdit={p => setProductModal(p)} onAdd={() => setProductModal("add")} />}
            {tab === "orders" && <TabOrders orders={orders} filter={orderFilter} setFilter={setOrderFilter} onStatusChange={updateOrderStatus} />}
            {tab === "coupons" && <TabCoupons coupons={coupons} onAdd={() => setCouponModal(true)} onToggleStatus={updateCouponStatus} />}
            {tab === "users" && <TabUsers users={users} />}
          </div>
        )}
      </main>

      {productModal && (
        <ProductModal
          product={productModal === "add" ? null : productModal}
          categories={categories}
          onSave={saveProduct}
          onClose={() => setProductModal(null)}
        />
      )}

      {couponModal && (
        <CouponModal
          onSave={saveCoupon}
          onClose={() => setCouponModal(false)}
        />
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        * { box-sizing: border-box; }
        input::placeholder, textarea::placeholder { color: #c0bdb8; }
        input:focus, select:focus, textarea:focus { outline: none; }
        button { font-family: inherit; }
      `}</style>
    </div>
  );
}

// ================== TAB: DASHBOARD ==================
function TabDashboard({ stats, chart, orders }) {
  const maxVal = Math.max(...chart.map(c => c.value));
  
  const statCards = [
    { label: "Doanh thu (Thực tế)", value: (stats?.revenue || 0).toLocaleString("vi-VN") + " ₫", icon: "💰", color: "#c94a1a" },
    { label: "Đơn hàng (Thực tế)", value: stats?.orders || 0, icon: "🧾", color: "#1a3c2e" },
    { label: "Sản phẩm (Thực tế)", value: stats?.products || 0, icon: "📦", color: "#185fa5" },
    { label: "Khách hàng (Thực tế)", value: stats?.users || 0, icon: "👥", color: "#854f0b" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px" }}>
        {statCards.map(card => (
          <div key={card.label} style={s.statCard}>
            <div style={{ fontSize: "1.6rem", marginBottom: "10px" }}>{card.icon}</div>
            <div style={{ fontSize: "1.5rem", fontWeight: "900", color: card.color, letterSpacing: "-0.02em" }}>{card.value}</div>
            <div style={{ fontSize: "0.78rem", color: "#999", marginTop: "4px", fontWeight: "600" }}>{card.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: "20px" }}>
        <div style={s.card}>
          <div style={s.cardHead}>Doanh thu 12 tháng <span style={s.cardBadge}>2026</span></div>
          <div style={{ display: "flex", alignItems: "flex-end", gap: "8px", height: "180px", padding: "0 4px" }}>
            {chart.map(d => (
              <div key={d.month} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "6px" }}>
                <div style={{
                  width: "100%", borderRadius: "4px 4px 0 0",
                  background: "linear-gradient(to top, #1a3c2e, #2d6e4e)",
                  height: `${(d.value / maxVal) * 150}px`,
                  minHeight: "4px",
                  transition: "height 0.3s",
                }} />
                <div style={{ fontSize: "0.65rem", color: "#bbb" }}>{d.month}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={s.card}>
          <div style={s.cardHead}>Đơn hàng gần đây</div>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {orders.length === 0 ? (
               <div style={{fontSize:"0.85rem", color:"#aaa", textAlign:"center", padding:"20px"}}>Chưa có đơn hàng nào</div>
            ) : (
               orders.slice(0, 4).map(o => (
                <div key={o.dbId} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <div style={{ fontSize: "0.82rem", fontWeight: "700", color: "#1a1a1a" }}>{o.customer}</div>
                    <div style={{ fontSize: "0.72rem", color: "#aaa" }}>{o.id} · {o.date}</div>
                  </div>
                  <StatusBadge status={o.status} />
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ================== TAB: PRODUCTS ==================
function TabProducts({ products, search, setSearch, onDelete, onEdit, onAdd }) {
  const filtered = products.filter(p =>
    (p.name || "").toLowerCase().includes(search.toLowerCase()) ||
    (p.brand || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "12px" }}>
        <div style={s.searchWrap}>
          <span style={{ color: "#bbb", fontSize: "0.9rem" }}>🔍</span>
          <input style={s.searchInput} placeholder="Tìm sản phẩm..."
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <button style={s.addBtn} onClick={onAdd}
          onMouseOver={e => e.currentTarget.style.background = "#2d6e4e"}
          onMouseOut={e => e.currentTarget.style.background = "#1a3c2e"}
        >+ Thêm sản phẩm</button>
      </div>

      <div style={s.card}>
        <table style={s.table}>
          <thead>
            <tr>
              {["Ảnh", "Tên sản phẩm", "Thương hiệu", "Đơn giá", "Tồn kho", "Trạng thái", ""].map(h => (
                <th key={h} style={s.th}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((p, idx) => {
              const imgUrl = p.image?.startsWith("/") ? `${SERVER_URL}${p.image}` : (p.image || "https://via.placeholder.com/40");
              return (
                <tr key={p.id} style={{ background: idx % 2 === 0 ? "#fff" : "#faf9f7" }}>
                  <td style={s.td}>
                    <img src={imgUrl} alt="" style={{ width: "40px", height: "40px", borderRadius: "6px", objectFit: "cover" }} />
                  </td>
                  <td style={s.td}><span style={{ fontWeight: "700", color: "#1a1a1a" }}>{p.name}</span></td>
                  <td style={s.td}><span style={s.categoryPill}>{p.brand || "Khác"}</span></td>
                  <td style={s.td}>{p.price.toLocaleString("vi-VN")} ₫ / {p.unit}</td>
                  <td style={s.td}>
                    <span style={{ color: p.stockQuantity < 100 ? "#c94a1a" : "#2d6e4e", fontWeight: "700" }}>
                      {p.stockQuantity?.toLocaleString()}
                    </span>
                  </td>
                  <td style={s.td}>
                    <span style={{
                      fontSize: "0.72rem", fontWeight: "700", padding: "3px 10px", borderRadius: "999px",
                      background: p.stockQuantity > 0 ? "#eaf3de" : "#faeeda",
                      color: p.stockQuantity > 0 ? "#3b6d11" : "#854f0b",
                    }}>
                      {p.stockQuantity > 0 ? "Còn hàng" : "Hết hàng"}
                    </span>
                  </td>
                  <td style={{ ...s.td, textAlign: "right" }}>
                    <button style={s.editBtn} onClick={() => onEdit(p)}>Sửa</button>
                    <button style={s.delBtn} onClick={() => onDelete(p.id)}>Xóa</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ================== TAB: ORDERS ==================
function TabOrders({ orders, filter, setFilter, onStatusChange }) {
  const filters = [
    { id: "all", label: "Tất cả" },
    { id: "pending", label: "Chờ xử lý" },
    { id: "shipping", label: "Đang giao" },
    { id: "done", label: "Hoàn thành" },
    { id: "cancelled", label: "Đã hủy" },
  ];
  const filtered = filter === "all" ? orders : orders.filter(o => o.status === filter);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
        {filters.map(f => (
          <button key={f.id} style={{
            padding: "7px 16px", borderRadius: "999px", fontSize: "0.82rem", fontWeight: "600",
            border: "1.5px solid", borderColor: filter === f.id ? "#1a3c2e" : "#e0ddd8",
            background: filter === f.id ? "#1a3c2e" : "#fff", color: filter === f.id ? "#fff" : "#555",
            cursor: "pointer", transition: "all 0.2s",
          }} onClick={() => setFilter(f.id)}>{f.label}</button>
        ))}
      </div>
      <div style={s.card}>
        <table style={s.table}>
          <thead>
            <tr>{["Mã đơn", "Khách", "SĐT", "Tổng", "TT", "Ngày", "Trạng thái", "Cập nhật"].map(h => <th key={h} style={s.th}>{h}</th>)}</tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr><td colSpan="8" style={{textAlign:"center", padding:"30px", color:"#aaa"}}>Chưa có đơn hàng nào</td></tr>
            )}
            {filtered.map((o, idx) => (
              <tr key={o.dbId} style={{ background: idx % 2 === 0 ? "#fff" : "#faf9f7" }}>
                <td style={s.td}><span style={{ fontWeight: "700", color: "#1a3c2e" }}>{o.id}</span></td>
                <td style={s.td}><span style={{ fontWeight: "600" }}>{o.customer}</span></td>
                <td style={s.td}>{o.phone}</td>
                <td style={s.td}><span style={{ fontWeight: "700", color: "#c94a1a" }}>{o.total.toLocaleString("vi-VN")} ₫</span></td>
                <td style={s.td}>{o.payment}</td>
                <td style={s.td}>{o.date}</td>
                <td style={s.td}><StatusBadge status={o.status} /></td>
                <td style={{ ...s.td }}>
                  <select value={o.status} onChange={e => onStatusChange(o.dbId, e.target.value)} style={s.statusSelect}>
                    <option value="pending">Chờ xử lý</option>
                    <option value="shipping">Đang giao</option>
                    <option value="done">Hoàn thành</option>
                    <option value="cancelled">Đã hủy</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function TabUsers({ users }) {
  return (
    <div style={s.card}>
      <table style={s.table}>
        <thead><tr>{["Tên", "Email", "Điện thoại", "Vai trò", "Đơn hàng", "Ngày tham gia"].map(h => <th key={h} style={s.th}>{h}</th>)}</tr></thead>
        <tbody>
          {users.map((u, idx) => (
            <tr key={u.id} style={{ background: idx % 2 === 0 ? "#fff" : "#faf9f7" }}>
              <td style={s.td}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: u.role === "admin" ? "#1a3c2e" : "#e6f1fb", color: u.role === "admin" ? "#a8d5b5" : "#185fa5", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.78rem", fontWeight: "800", flexShrink: 0 }}>
                    {u.name.charAt(0).toUpperCase()}
                  </div>
                  <span style={{ fontWeight: "700", color: "#1a1a1a" }}>{u.name}</span>
                </div>
              </td>
              <td style={s.td}>{u.email}</td>
              <td style={s.td}>{u.phone}</td>
              <td style={s.td}><span style={{ fontSize: "0.72rem", fontWeight: "700", padding: "3px 10px", borderRadius: "999px", background: u.role === "admin" ? "#1a3c2e" : "#f5f4f0", color: u.role === "admin" ? "#a8d5b5" : "#555" }}>{u.role === "admin" ? "Admin" : "Khách"}</span></td>
              <td style={s.td}><span style={{ fontWeight: "700" }}>{u.orders}</span></td>
              <td style={s.td}>{u.joined}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function TabCoupons({ coupons, onAdd, onToggleStatus }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "12px" }}>
        <div>
          <div style={{ fontSize: "0.95rem", fontWeight: "800", color: "#1a1a1a" }}>Quản lý mã giảm giá</div>
          <div style={{ fontSize: "0.8rem", color: "#999", marginTop: "4px" }}>Tạo và bật tắt mã cho từng chiến dịch bán hàng.</div>
        </div>
        <button style={s.addBtn} onClick={onAdd}>+ Tạo mã giảm giá</button>
      </div>

      <div style={s.card}>
        <table style={s.table}>
          <thead>
            <tr>{["Mã", "Loại", "Giá trị", "Đơn tối thiểu", "Giới hạn", "Thời gian", "Đã dùng", "Trạng thái"].map(h => <th key={h} style={s.th}>{h}</th>)}</tr>
          </thead>
          <tbody>
            {coupons.length === 0 && (
              <tr><td colSpan="8" style={{ textAlign: "center", padding: "30px", color: "#aaa" }}>Chưa có mã giảm giá nào</td></tr>
            )}
            {coupons.map((coupon, idx) => (
              <tr key={coupon.id} style={{ background: idx % 2 === 0 ? "#fff" : "#faf9f7" }}>
                <td style={s.td}>
                  <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                    <span style={s.couponCode}>{coupon.code}</span>
                    {coupon.maxDiscount && (
                      <span style={s.couponMeta}>Giảm tối đa: {Number(coupon.maxDiscount).toLocaleString("vi-VN")} ₫</span>
                    )}
                  </div>
                </td>
                <td style={s.td}>
                  <span style={coupon.type === "percent" ? s.percentBadge : s.fixedBadge}>
                    {coupon.type === "percent" ? "Phần trăm" : "Tiền mặt"}
                  </span>
                </td>
                <td style={s.td}>
                  <span style={{ fontWeight: "700", color: "#1a1a1a" }}>
                    {coupon.type === "percent"
                      ? `${Number(coupon.value)}%`
                      : `${Number(coupon.value).toLocaleString("vi-VN")} ₫`}
                  </span>
                </td>
                <td style={s.td}>{Number(coupon.minOrder).toLocaleString("vi-VN")} ₫</td>
                <td style={s.td}>{coupon.usageLimit ?? "Không giới hạn"}</td>
                <td style={s.td}>
                  <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                    <span>{new Date(coupon.startDate).toLocaleDateString("vi-VN")}</span>
                    <span style={s.couponMeta}>đến {new Date(coupon.endDate).toLocaleDateString("vi-VN")}</span>
                  </div>
                </td>
                <td style={s.td}><span style={{ fontWeight: "700" }}>{coupon.usedCount}</span></td>
                <td style={s.td}>
                  <button
                    style={coupon.isActive ? s.activeBtn : s.inactiveBtn}
                    onClick={() => onToggleStatus(coupon.id, !coupon.isActive)}
                  >
                    {coupon.isActive ? "Đang bật" : "Đang tắt"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ================== COMPONENT: DRAG & DROP UPLOAD ==================
function ImageUploadDropzone({ currentImage, onFileSelect }) {
  const [isDragActive, setIsDragActive] = useState(false);
  const [preview, setPreview] = useState(currentImage?.startsWith("/") ? `${SERVER_URL}${currentImage}` : currentImage);
  const inputRef = useRef(null);

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      handleFile(file);
    }
  };

  const handleChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      handleFile(file);
    }
  };

  const handleFile = (file) => {
    if (!file.type.startsWith("image/")) {
      alert("Vui lòng chỉ chọn file hình ảnh!");
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target.result);
    reader.readAsDataURL(file);
    onFileSelect(file);
  };

  return (
    <div
      onClick={() => inputRef.current?.click()}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      style={{
        ...s.dropzone,
        borderColor: isDragActive ? "#2d6e4e" : "#e0ddd8",
        background: isDragActive ? "#f0f7f3" : "#faf9f7",
      }}
    >
      <input 
        type="file" 
        accept="image/*" 
        ref={inputRef} 
        style={{ display: "none" }} 
        onChange={handleChange} 
      />
      
      {preview ? (
        <div style={s.previewWrap}>
          <img src={preview} alt="Preview" style={s.previewImg} />
          <div style={s.changeImgOverlay}>
            <span style={{ fontSize: "1.2rem", marginBottom: "4px" }}>🔄</span>
            <span style={{ fontSize: "0.75rem", fontWeight: "600" }}>Kéo thả hoặc click đổi ảnh</span>
          </div>
        </div>
      ) : (
        <div style={s.dropzoneContent}>
          <span style={s.dropIcon}>🖼️</span>
          <span style={s.dropMainText}>Kéo thả ảnh vào đây</span>
          <span style={s.dropSubText}>hoặc click để tải lên từ máy tính</span>
        </div>
      )}
    </div>
  );
}

// ================== PRODUCT MODAL ==================
function ProductModal({ product, categories, onSave, onClose }) {
  const defaultCatId = categories.length > 0 ? categories[0].id : 1;
  const [form, setForm] = useState(product || { 
    name: "", categoryId: defaultCatId, price: "", unit: "Bao", stockQuantity: "", brand: "", description: "", image: ""
  });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  return (
    <div style={s.modalOverlay} onClick={onClose}>
      <div style={s.modal} onClick={e => e.stopPropagation()}>
        <div style={s.modalHead}>
          <span style={s.modalTitle}>{product ? "Chỉnh sửa sản phẩm" : "Thêm sản phẩm mới"}</span>
          <button style={s.modalClose} onClick={onClose}>✕</button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "14px", padding: "24px", maxHeight: "70vh", overflowY: "auto" }}>
          <ModalField label="Tên sản phẩm *">
            <input style={s.modalInput} value={form.name} onChange={e => set("name", e.target.value)} placeholder="Nhập tên..." />
          </ModalField>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <ModalField label="Danh mục *">
              <select 
                style={s.modalInput} 
                value={form.categoryId} 
                onChange={e => set("categoryId", Number(e.target.value))}
              >
                {categories.length === 0 ? (
                  <option value={form.categoryId}>Đang tải...</option>
                ) : (
                  categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))
                )}
              </select>
            </ModalField>
            <ModalField label="Thương hiệu">
              <input style={s.modalInput} value={form.brand} onChange={e => set("brand", e.target.value)} placeholder="Hòa Phát, Hà Tiên..." />
            </ModalField>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <ModalField label="Đơn giá (₫) *">
              <input style={s.modalInput} type="number" value={form.price} onChange={e => set("price", e.target.value)} placeholder="0" />
            </ModalField>
            <ModalField label="Đơn vị tính">
              <select style={s.modalInput} value={form.unit} onChange={e => set("unit", e.target.value)}>
                {["Bao", "Kg", "Viên", "Khối", "Tấn", "Cái"].map(u => <option key={u}>{u}</option>)}
              </select>
            </ModalField>
          </div>

          <ModalField label="Tồn kho *">
            <input style={s.modalInput} type="number" value={form.stockQuantity} onChange={e => set("stockQuantity", e.target.value)} placeholder="Số lượng hiện có..." />
          </ModalField>

          {/* ĐÃ THAY ĐỔI: Sử dụng Component Drag & Drop Upload ở đây */}
          <ModalField label="Hình ảnh sản phẩm">
            <ImageUploadDropzone 
              currentImage={form.image} 
              onFileSelect={(file) => set("rawFile", file)} 
            />
          </ModalField>
          
          <ModalField label="Mô tả">
            <textarea style={{...s.modalInput, resize: "vertical", minHeight: "80px"}} value={form.description} onChange={e => set("description", e.target.value)} placeholder="Mô tả chi tiết sản phẩm..." />
          </ModalField>
        </div>

        <div style={{ padding: "16px 24px", display: "flex", gap: "10px", borderTop: "1px solid #f0eeea" }}>
          <button style={s.modalSaveBtn} onClick={() => onSave(form)}>
            {product ? "Lưu thay đổi" : "Thêm sản phẩm"}
          </button>
          <button style={s.modalCancelBtn} onClick={onClose}>Hủy</button>
        </div>
      </div>
    </div>
  );
}

function CouponModal({ onSave, onClose }) {
  const now = new Date();
  const nextWeek = new Date(now);
  nextWeek.setDate(nextWeek.getDate() + 7);

  const toLocalDateTime = (date) => {
    const offset = date.getTimezoneOffset();
    const local = new Date(date.getTime() - offset * 60000);
    return local.toISOString().slice(0, 16);
  };

  const [form, setForm] = useState({
    code: "",
    type: "fixed",
    value: "",
    minOrder: "0",
    maxDiscount: "",
    usageLimit: "",
    startDate: toLocalDateTime(now),
    endDate: toLocalDateTime(nextWeek),
    isActive: true,
  });

  const set = (key, value) => setForm(prev => ({ ...prev, [key]: value }));

  const handleSave = () => {
    onSave({
      code: form.code,
      type: form.type,
      value: Number(form.value),
      minOrder: Number(form.minOrder || 0),
      maxDiscount: form.maxDiscount ? Number(form.maxDiscount) : null,
      usageLimit: form.usageLimit ? Number(form.usageLimit) : null,
      startDate: form.startDate,
      endDate: form.endDate,
      isActive: form.isActive,
    });
  };

  return (
    <div style={s.modalOverlay} onClick={onClose}>
      <div style={s.modal} onClick={e => e.stopPropagation()}>
        <div style={s.modalHead}>
          <span style={s.modalTitle}>Tạo mã giảm giá</span>
          <button style={s.modalClose} onClick={onClose}>✕</button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "14px", padding: "24px", maxHeight: "70vh", overflowY: "auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr", gap: "12px" }}>
            <ModalField label="Mã coupon *">
              <input style={s.modalInput} value={form.code} onChange={e => set("code", e.target.value.toUpperCase())} placeholder="VD: GIAM10" />
            </ModalField>
            <ModalField label="Loại mã *">
              <select style={s.modalInput} value={form.type} onChange={e => set("type", e.target.value)}>
                <option value="fixed">Giảm tiền</option>
                <option value="percent">Giảm phần trăm</option>
              </select>
            </ModalField>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <ModalField label={form.type === "percent" ? "Giá trị (%) *" : "Giá trị (₫) *"}>
              <input style={s.modalInput} type="number" min="0" value={form.value} onChange={e => set("value", e.target.value)} placeholder="0" />
            </ModalField>
            <ModalField label="Đơn tối thiểu (₫)">
              <input style={s.modalInput} type="number" min="0" value={form.minOrder} onChange={e => set("minOrder", e.target.value)} placeholder="0" />
            </ModalField>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <ModalField label="Giảm tối đa (₫)">
              <input style={s.modalInput} type="number" min="0" value={form.maxDiscount} onChange={e => set("maxDiscount", e.target.value)} placeholder="Bỏ trống nếu không giới hạn" />
            </ModalField>
            <ModalField label="Giới hạn lượt dùng">
              <input style={s.modalInput} type="number" min="0" value={form.usageLimit} onChange={e => set("usageLimit", e.target.value)} placeholder="Bỏ trống nếu không giới hạn" />
            </ModalField>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <ModalField label="Ngày bắt đầu *">
              <input style={s.modalInput} type="datetime-local" value={form.startDate} onChange={e => set("startDate", e.target.value)} />
            </ModalField>
            <ModalField label="Ngày kết thúc *">
              <input style={s.modalInput} type="datetime-local" value={form.endDate} onChange={e => set("endDate", e.target.value)} />
            </ModalField>
          </div>

          <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
            <input type="checkbox" checked={form.isActive} onChange={e => set("isActive", e.target.checked)} style={{ accentColor: "#1a3c2e", width: "15px", height: "15px" }} />
            <span style={{ fontSize: "0.82rem", color: "#555", fontWeight: "600" }}>Kích hoạt ngay sau khi tạo</span>
          </label>
        </div>

        <div style={{ padding: "16px 24px", display: "flex", gap: "10px", borderTop: "1px solid #f0eeea" }}>
          <button style={s.modalSaveBtn} onClick={handleSave}>Lưu mã giảm giá</button>
          <button style={s.modalCancelBtn} onClick={onClose}>Hủy</button>
        </div>
      </div>
    </div>
  );
}

function ModalField({ label, children }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
      <label style={{ fontSize: "0.78rem", fontWeight: "700", color: "#555", letterSpacing: "0.03em" }}>{label}</label>
      {children}
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
    <span style={{ fontSize: "0.72rem", fontWeight: "700", padding: "3px 10px", borderRadius: "999px", background: bg, color, whiteSpace: "nowrap" }}>
      {label}
    </span>
  );
}

// ================== STYLES ==================
const s = {
  shell: { display: "flex", minHeight: "100vh", fontFamily: "'Be Vietnam Pro', 'Segoe UI', sans-serif", background: "#f5f4f0" },
  sidebar: { width: "220px", flexShrink: 0, background: "#0c1912", borderRight: "1px solid rgba(168,213,181,0.08)", display: "flex", flexDirection: "column", position: "fixed", top: 0, left: 0, bottom: 0, zIndex: 100 },
  sidebarLogo: { display: "flex", alignItems: "center", gap: "10px", padding: "24px 20px 20px", borderBottom: "1px solid rgba(255,255,255,0.06)" },
  logoBox: { width: "36px", height: "36px", background: "linear-gradient(135deg, #2d6e4e, #1a3c2e)", borderRadius: "9px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.1rem", border: "1px solid rgba(168,213,181,0.2)", flexShrink: 0 },
  logoName: { fontWeight: "800", fontSize: "0.9rem", color: "#fff", letterSpacing: "0.04em" },
  logoRole: { fontSize: "0.62rem", color: "rgba(255,255,255,0.35)", letterSpacing: "0.1em", textTransform: "uppercase" },
  nav: { flex: 1, padding: "16px 0" },
  navBtn: { display: "flex", alignItems: "center", gap: "10px", width: "100%", padding: "11px 20px", border: "none", cursor: "pointer", fontSize: "0.85rem", fontWeight: "600", transition: "all 0.2s", textAlign: "left", letterSpacing: "0.01em" },
  sidebarFooter: { padding: "16px 20px", borderTop: "1px solid rgba(255,255,255,0.06)" },
  adminBadge: { display: "flex", alignItems: "center", gap: "10px" },
  adminAvatar: { width: "32px", height: "32px", borderRadius: "50%", background: "#1a3c2e", color: "#a8d5b5", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.8rem", fontWeight: "800", flexShrink: 0, overflow: "hidden", border: "1px solid rgba(168,213,181,0.22)" },
  adminAvatarImg: { width: "100%", height: "100%", objectFit: "cover" },
  main: { marginLeft: "220px", flex: 1, display: "flex", flexDirection: "column", minHeight: "100vh" },
  topbar: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 24px", background: "#fff", borderBottom: "1px solid #ebebeb" },
  pageTitle: { fontSize: "1.2rem", fontWeight: "800", color: "#1a1a1a" },
  pageSub: { fontSize: "0.78rem", color: "#aaa", marginTop: "2px" },
  refreshBtn: { padding: "8px 16px", background: "#f5f4f0", border: "1.5px solid #e0ddd8", borderRadius: "8px", fontSize: "0.82rem", fontWeight: "600", color: "#555", cursor: "pointer" },
  loadingWrap: { flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "60vh" },
  spinner: { width: "32px", height: "32px", border: "3px solid #e0ddd8", borderTopColor: "#1a3c2e", borderRadius: "50%", animation: "spin 0.8s linear infinite" },
  statCard: { background: "#fff", borderRadius: "14px", border: "1px solid #ebebeb", padding: "22px 20px" },
  card: { background: "#fff", borderRadius: "14px", border: "1px solid #ebebeb", padding: "20px", overflow: "hidden" },
  cardHead: { fontSize: "0.88rem", fontWeight: "700", color: "#1a1a1a", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" },
  cardBadge: { fontSize: "0.68rem", fontWeight: "700", background: "#eaf3de", color: "#3b6d11", padding: "2px 8px", borderRadius: "999px" },
  searchWrap: { display: "flex", alignItems: "center", gap: "8px", background: "#fff", border: "1.5px solid #e0ddd8", borderRadius: "10px", padding: "0 14px", flex: 1, maxWidth: "320px" },
  searchInput: { border: "none", background: "transparent", padding: "10px 0", fontSize: "0.88rem", color: "#1a1a1a", flex: 1 },
  addBtn: { padding: "10px 20px", background: "#1a3c2e", color: "#fff", border: "none", borderRadius: "10px", fontSize: "0.88rem", fontWeight: "700", cursor: "pointer", transition: "background 0.2s", whiteSpace: "nowrap" },
  table: { width: "100%", borderCollapse: "collapse", fontSize: "0.85rem" },
  th: { padding: "10px 14px", textAlign: "left", fontSize: "0.72rem", fontWeight: "700", color: "#aaa", letterSpacing: "0.06em", textTransform: "uppercase", borderBottom: "1px solid #f0eeea" },
  td: { padding: "12px 14px", color: "#444", verticalAlign: "middle" },
  categoryPill: { fontSize: "0.72rem", fontWeight: "700", background: "#e6f1fb", color: "#185fa5", padding: "3px 10px", borderRadius: "999px" },
  couponCode: { fontSize: "0.82rem", fontWeight: "800", color: "#1a3c2e", letterSpacing: "0.08em" },
  couponMeta: { fontSize: "0.72rem", color: "#999" },
  percentBadge: { fontSize: "0.72rem", fontWeight: "700", background: "#eaf3de", color: "#3b6d11", padding: "3px 10px", borderRadius: "999px" },
  fixedBadge: { fontSize: "0.72rem", fontWeight: "700", background: "#e6f1fb", color: "#185fa5", padding: "3px 10px", borderRadius: "999px" },
  activeBtn: { padding: "6px 12px", background: "#eaf3de", color: "#3b6d11", border: "none", borderRadius: "8px", cursor: "pointer", fontSize: "0.76rem", fontWeight: "700" },
  inactiveBtn: { padding: "6px 12px", background: "#fcebeb", color: "#a32d2d", border: "none", borderRadius: "8px", cursor: "pointer", fontSize: "0.76rem", fontWeight: "700" },
  editBtn: { padding: "5px 12px", background: "#e6f1fb", color: "#185fa5", border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "0.78rem", fontWeight: "700", marginRight: "6px" },
  delBtn: { padding: "5px 12px", background: "#fcebeb", color: "#a32d2d", border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "0.78rem", fontWeight: "700" },
  statusSelect: { padding: "5px 10px", border: "1.5px solid #e0ddd8", borderRadius: "7px", fontSize: "0.78rem", color: "#444", background: "#fff", cursor: "pointer", fontFamily: "inherit" },
  modalOverlay: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 },
  modal: { background: "#fff", borderRadius: "18px", width: "100%", maxWidth: "480px", boxShadow: "0 24px 60px rgba(0,0,0,0.15)" },
  modalHead: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 24px", borderBottom: "1px solid #f0eeea" },
  modalTitle: { fontSize: "0.95rem", fontWeight: "800", color: "#1a1a1a" },
  modalClose: { background: "none", border: "none", cursor: "pointer", fontSize: "1rem", color: "#aaa" },
  modalInput: { width: "100%", padding: "10px 14px", border: "1.5px solid #e0ddd8", borderRadius: "9px", fontSize: "0.88rem", color: "#1a1a1a", fontFamily: "inherit" },
  modalSaveBtn: { flex: 1, padding: "12px", background: "#1a3c2e", color: "#fff", border: "none", borderRadius: "10px", fontSize: "0.9rem", fontWeight: "700", cursor: "pointer", transition: "background 0.2s" },
  modalCancelBtn: { padding: "12px 20px", background: "transparent", color: "#666", border: "1.5px solid #d5d3cd", borderRadius: "10px", fontSize: "0.88rem", fontWeight: "600", cursor: "pointer", transition: "background 0.2s" },

  // --- STYLES CHO DROPZONE ---
  dropzone: {
    border: "2px dashed #e0ddd8", borderRadius: "10px", padding: "2px", 
    textAlign: "center", cursor: "pointer", transition: "all 0.2s ease",
    background: "#faf9f7", minHeight: "120px", display: "flex", 
    alignItems: "center", justifyContent: "center", overflow: "hidden", position: "relative"
  },
  dropzoneContent: { display: "flex", flexDirection: "column", alignItems: "center", gap: "6px", padding: "20px" },
  dropIcon: { fontSize: "2rem", color: "#bbb", marginBottom: "4px" },
  dropMainText: { fontSize: "0.88rem", fontWeight: "700", color: "#1a1a1a" },
  dropSubText: { fontSize: "0.75rem", color: "#aaa" },
  previewWrap: { width: "100%", height: "140px", position: "relative", borderRadius: "8px", overflow: "hidden" },
  previewImg: { width: "100%", height: "100%", objectFit: "contain", background: "#fff" },
  changeImgOverlay: {
    position: "absolute", inset: 0, background: "rgba(0,0,0,0.6)",
    display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
    color: "#fff", opacity: 0, transition: "opacity 0.2s",
    ":hover": { opacity: 1 } // Note: Inline hover doesn't work directly in standard React styles without a library, but the logic is there. We'll rely on the click behavior.
  }
};
