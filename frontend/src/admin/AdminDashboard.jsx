import { useState, useEffect } from "react";

// ================== API CONFIG ==================
const API_BASE = "http://localhost:5000/api"; // Thay bằng URL backend thật

async function apiFetch(endpoint, options = {}) {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    headers: { "Content-Type": "application/json", ...options.headers },
    ...options,
  });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

// ================== MOCK FALLBACK (xóa khi có backend) ==================
const MOCK = {
  stats: { revenue: 128500000, orders: 47, products: 5, users: 38 },
  revenueChart: [
    { month: "T1", value: 12 }, { month: "T2", value: 18 }, { month: "T3", value: 9 },
    { month: "T4", value: 24 }, { month: "T5", value: 31 }, { month: "T6", value: 28 },
    { month: "T7", value: 19 }, { month: "T8", value: 35 }, { month: "T9", value: 42 },
    { month: "T10", value: 38 }, { month: "T11", value: 51 }, { month: "T12", value: 47 },
  ],
  products: [
    { id: 1, name: "Xi măng Hà Tiên 1", category: "Xi măng", price: 85000, unit: "Bao", stock: 200, status: "active" },
    { id: 2, name: "Sắt cuộn Phi 6 Hòa Phát", category: "Sắt thép", price: 15800, unit: "Kg", stock: 1000, status: "active" },
    { id: 3, name: "Gạch ống Tuynel 4 lỗ", category: "Gạch xây", price: 1250, unit: "Viên", stock: 50000, status: "active" },
    { id: 4, name: "Cát vàng xây tô", category: "Cát đá", price: 450000, unit: "Khối", stock: 50, status: "low" },
    { id: 5, name: "Đá 1x2 xanh", category: "Cát đá", price: 320000, unit: "Khối", stock: 30, status: "low" },
  ],
  orders: [
    { id: "#KT001", customer: "Nguyễn Văn A", phone: "0909123456", total: 850000, status: "pending", date: "17/03/2026", payment: "COD" },
    { id: "#KT002", customer: "Trần Thị B", phone: "0912345678", total: 3200000, status: "shipping", date: "16/03/2026", payment: "Chuyển khoản" },
    { id: "#KT003", customer: "Lê Văn C", phone: "0987654321", total: 15800000, status: "done", date: "15/03/2026", payment: "COD" },
    { id: "#KT004", customer: "Phạm Thị D", phone: "0934567890", total: 2560000, status: "cancelled", date: "14/03/2026", payment: "COD" },
    { id: "#KT005", customer: "Hoàng Văn E", phone: "0978123456", total: 9450000, status: "done", date: "13/03/2026", payment: "Chuyển khoản" },
  ],
  users: [
    { id: 1, name: "Nguyễn Văn A", email: "a@gmail.com", phone: "0909123456", role: "customer", orders: 3, joined: "10/01/2026" },
    { id: 2, name: "Trần Thị B", email: "b@gmail.com", phone: "0912345678", role: "customer", orders: 7, joined: "15/01/2026" },
    { id: 3, name: "Admin Kiến Tạo", email: "admin@kientao.vn", phone: "0909000001", role: "admin", orders: 0, joined: "01/01/2026" },
    { id: 4, name: "Lê Văn C", email: "c@gmail.com", phone: "0987654321", role: "customer", orders: 1, joined: "20/02/2026" },
  ],
};

// ================== MAIN COMPONENT ==================
export default function AdminDashboard() {
  const [tab, setTab] = useState("dashboard");
  const [stats, setStats] = useState(null);
  const [chart, setChart] = useState([]);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [productModal, setProductModal] = useState(null); // null | "add" | product obj
  const [search, setSearch] = useState("");
  const [orderFilter, setOrderFilter] = useState("all");

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [s, r, p, o, u] = await Promise.all([
        apiFetch("/admin/stats"),
        apiFetch("/admin/revenue-chart"),
        apiFetch("/admin/products"),
        apiFetch("/admin/orders"),
        apiFetch("/admin/users"),
      ]);
      setStats(s); setChart(r); setProducts(p); setOrders(o); setUsers(u);
    } catch {
      // Fallback mock
      setStats(MOCK.stats); setChart(MOCK.revenueChart);
      setProducts(MOCK.products); setOrders(MOCK.orders); setUsers(MOCK.users);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (id, status) => {
    try {
      await apiFetch(`/admin/orders/${id}`, { method: "PATCH", body: JSON.stringify({ status }) });
    } catch {}
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o));
  };

  const deleteProduct = async (id) => {
    if (!confirm("Xóa sản phẩm này?")) return;
    try { await apiFetch(`/admin/products/${id}`, { method: "DELETE" }); } catch {}
    setProducts(prev => prev.filter(p => p.id !== id));
  };

  const saveProduct = async (data) => {
    try {
      if (data.id) {
        await apiFetch(`/admin/products/${data.id}`, { method: "PUT", body: JSON.stringify(data) });
        setProducts(prev => prev.map(p => p.id === data.id ? data : p));
      } else {
        const created = await apiFetch("/admin/products", { method: "POST", body: JSON.stringify(data) });
        setProducts(prev => [...prev, { ...data, id: created?.id || Date.now() }]);
      }
    } catch {
      if (data.id) setProducts(prev => prev.map(p => p.id === data.id ? data : p));
      else setProducts(prev => [...prev, { ...data, id: Date.now() }]);
    }
    setProductModal(null);
  };

  const navItems = [
    { id: "dashboard", icon: "▦", label: "Tổng quan" },
    { id: "products", icon: "📦", label: "Sản phẩm" },
    { id: "orders", icon: "🧾", label: "Đơn hàng" },
    { id: "users", icon: "👥", label: "Người dùng" },
  ];

  return (
    <div style={s.shell}>
      {/* SIDEBAR */}
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
            <div style={s.adminAvatar}>A</div>
            <div>
              <div style={{ fontSize: "0.82rem", fontWeight: "700", color: "#fff" }}>Admin</div>
              <div style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.4)" }}>admin@kientao.vn</div>
            </div>
          </div>
        </div>
      </aside>

      {/* MAIN */}
      <main style={s.main}>
        {/* Topbar */}
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
            {tab === "users" && <TabUsers users={users} />}
          </div>
        )}
      </main>

      {/* PRODUCT MODAL */}
      {productModal && (
        <ProductModal
          product={productModal === "add" ? null : productModal}
          onSave={saveProduct}
          onClose={() => setProductModal(null)}
        />
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        * { box-sizing: border-box; }
        input::placeholder { color: #c0bdb8; }
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
    { label: "Doanh thu tháng", value: (stats?.revenue || 0).toLocaleString("vi-VN") + " ₫", icon: "💰", color: "#c94a1a" },
    { label: "Đơn hàng", value: stats?.orders || 0, icon: "🧾", color: "#1a3c2e" },
    { label: "Sản phẩm", value: stats?.products || 0, icon: "📦", color: "#185fa5" },
    { label: "Khách hàng", value: stats?.users || 0, icon: "👥", color: "#854f0b" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Stat cards */}
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
        {/* Bar chart */}
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

        {/* Recent orders */}
        <div style={s.card}>
          <div style={s.cardHead}>Đơn hàng gần đây</div>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {orders.slice(0, 4).map(o => (
              <div key={o.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontSize: "0.82rem", fontWeight: "700", color: "#1a1a1a" }}>{o.customer}</div>
                  <div style={{ fontSize: "0.72rem", color: "#aaa" }}>{o.id} · {o.date}</div>
                </div>
                <StatusBadge status={o.status} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ================== TAB: PRODUCTS ==================
function TabProducts({ products, search, setSearch, onDelete, onEdit, onAdd }) {
  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.category.toLowerCase().includes(search.toLowerCase())
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
              {["Tên sản phẩm", "Danh mục", "Đơn giá", "Tồn kho", "Trạng thái", ""].map(h => (
                <th key={h} style={s.th}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((p, idx) => (
              <tr key={p.id} style={{ background: idx % 2 === 0 ? "#fff" : "#faf9f7" }}>
                <td style={s.td}><span style={{ fontWeight: "700", color: "#1a1a1a" }}>{p.name}</span></td>
                <td style={s.td}><span style={s.categoryPill}>{p.category}</span></td>
                <td style={s.td}>{p.price.toLocaleString("vi-VN")} ₫ / {p.unit}</td>
                <td style={s.td}>
                  <span style={{ color: p.stock < 100 ? "#c94a1a" : "#2d6e4e", fontWeight: "700" }}>
                    {p.stock.toLocaleString()}
                  </span>
                </td>
                <td style={s.td}>
                  <span style={{
                    fontSize: "0.72rem", fontWeight: "700", padding: "3px 10px", borderRadius: "999px",
                    background: p.status === "active" ? "#eaf3de" : "#faeeda",
                    color: p.status === "active" ? "#3b6d11" : "#854f0b",
                  }}>
                    {p.status === "active" ? "Còn hàng" : "Sắp hết"}
                  </span>
                </td>
                <td style={{ ...s.td, textAlign: "right" }}>
                  <button style={s.editBtn} onClick={() => onEdit(p)}>Sửa</button>
                  <button style={s.delBtn} onClick={() => onDelete(p.id)}>Xóa</button>
                </td>
              </tr>
            ))}
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
            border: "1.5px solid",
            borderColor: filter === f.id ? "#1a3c2e" : "#e0ddd8",
            background: filter === f.id ? "#1a3c2e" : "#fff",
            color: filter === f.id ? "#fff" : "#555",
            cursor: "pointer", transition: "all 0.2s",
          }} onClick={() => setFilter(f.id)}>{f.label}</button>
        ))}
      </div>

      <div style={s.card}>
        <table style={s.table}>
          <thead>
            <tr>
              {["Mã đơn", "Khách hàng", "Điện thoại", "Tổng tiền", "Thanh toán", "Ngày đặt", "Trạng thái", "Cập nhật"].map(h => (
                <th key={h} style={s.th}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((o, idx) => (
              <tr key={o.id} style={{ background: idx % 2 === 0 ? "#fff" : "#faf9f7" }}>
                <td style={s.td}><span style={{ fontWeight: "700", color: "#1a3c2e" }}>{o.id}</span></td>
                <td style={s.td}><span style={{ fontWeight: "600" }}>{o.customer}</span></td>
                <td style={s.td}>{o.phone}</td>
                <td style={s.td}><span style={{ fontWeight: "700", color: "#c94a1a" }}>{o.total.toLocaleString("vi-VN")} ₫</span></td>
                <td style={s.td}>{o.payment}</td>
                <td style={s.td}>{o.date}</td>
                <td style={s.td}><StatusBadge status={o.status} /></td>
                <td style={{ ...s.td }}>
                  <select
                    value={o.status}
                    onChange={e => onStatusChange(o.id, e.target.value)}
                    style={s.statusSelect}
                  >
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

// ================== TAB: USERS ==================
function TabUsers({ users }) {
  return (
    <div style={s.card}>
      <table style={s.table}>
        <thead>
          <tr>
            {["Tên", "Email", "Điện thoại", "Vai trò", "Đơn hàng", "Ngày tham gia"].map(h => (
              <th key={h} style={s.th}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {users.map((u, idx) => (
            <tr key={u.id} style={{ background: idx % 2 === 0 ? "#fff" : "#faf9f7" }}>
              <td style={s.td}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <div style={{
                    width: "32px", height: "32px", borderRadius: "50%",
                    background: u.role === "admin" ? "#1a3c2e" : "#e6f1fb",
                    color: u.role === "admin" ? "#a8d5b5" : "#185fa5",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "0.78rem", fontWeight: "800", flexShrink: 0,
                  }}>
                    {u.name.charAt(0)}
                  </div>
                  <span style={{ fontWeight: "700", color: "#1a1a1a" }}>{u.name}</span>
                </div>
              </td>
              <td style={s.td}>{u.email}</td>
              <td style={s.td}>{u.phone}</td>
              <td style={s.td}>
                <span style={{
                  fontSize: "0.72rem", fontWeight: "700", padding: "3px 10px", borderRadius: "999px",
                  background: u.role === "admin" ? "#1a3c2e" : "#f5f4f0",
                  color: u.role === "admin" ? "#a8d5b5" : "#555",
                }}>
                  {u.role === "admin" ? "Admin" : "Khách hàng"}
                </span>
              </td>
              <td style={s.td}><span style={{ fontWeight: "700" }}>{u.orders}</span></td>
              <td style={s.td}>{u.joined}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ================== PRODUCT MODAL ==================
function ProductModal({ product, onSave, onClose }) {
  const [form, setForm] = useState(product || { name: "", category: "Xi măng", price: "", unit: "Bao", stock: "", status: "active" });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  return (
    <div style={s.modalOverlay} onClick={onClose}>
      <div style={s.modal} onClick={e => e.stopPropagation()}>
        <div style={s.modalHead}>
          <span style={s.modalTitle}>{product ? "Chỉnh sửa sản phẩm" : "Thêm sản phẩm mới"}</span>
          <button style={s.modalClose} onClick={onClose}>✕</button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "14px", padding: "24px" }}>
          <ModalField label="Tên sản phẩm">
            <input style={s.modalInput} value={form.name} onChange={e => set("name", e.target.value)} placeholder="Xi măng Hà Tiên 1" />
          </ModalField>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <ModalField label="Danh mục">
              <select style={s.modalInput} value={form.category} onChange={e => set("category", e.target.value)}>
                {["Xi măng", "Sắt thép", "Gạch xây", "Cát đá"].map(c => <option key={c}>{c}</option>)}
              </select>
            </ModalField>
            <ModalField label="Đơn vị">
              <select style={s.modalInput} value={form.unit} onChange={e => set("unit", e.target.value)}>
                {["Bao", "Kg", "Viên", "Khối", "Tấn"].map(u => <option key={u}>{u}</option>)}
              </select>
            </ModalField>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <ModalField label="Đơn giá (₫)">
              <input style={s.modalInput} type="number" value={form.price} onChange={e => set("price", e.target.value)} placeholder="85000" />
            </ModalField>
            <ModalField label="Tồn kho">
              <input style={s.modalInput} type="number" value={form.stock} onChange={e => set("stock", e.target.value)} placeholder="200" />
            </ModalField>
          </div>

          <ModalField label="Trạng thái">
            <select style={s.modalInput} value={form.status} onChange={e => set("status", e.target.value)}>
              <option value="active">Còn hàng</option>
              <option value="low">Sắp hết</option>
              <option value="out">Hết hàng</option>
            </select>
          </ModalField>
        </div>

        <div style={{ padding: "0 24px 24px", display: "flex", gap: "10px" }}>
          <button style={s.modalSaveBtn}
            onMouseOver={e => e.currentTarget.style.background = "#2d6e4e"}
            onMouseOut={e => e.currentTarget.style.background = "#1a3c2e"}
            onClick={() => onSave({ ...form, price: Number(form.price), stock: Number(form.stock) })}
          >
            {product ? "Lưu thay đổi" : "Thêm sản phẩm"}
          </button>
          <button style={s.modalCancelBtn}
            onMouseOver={e => e.currentTarget.style.background = "#f0eeea"}
            onMouseOut={e => e.currentTarget.style.background = "transparent"}
            onClick={onClose}
          >Hủy</button>
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

// ================== STATUS BADGE ==================
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
  shell: {
    display: "flex",
    minHeight: "100vh",
    fontFamily: "'Be Vietnam Pro', 'Segoe UI', sans-serif",
    background: "#f5f4f0",
  },
  sidebar: {
    width: "220px",
    flexShrink: 0,
    background: "#0c1912",
    borderRight: "1px solid rgba(168,213,181,0.08)",
    display: "flex",
    flexDirection: "column",
    position: "fixed",
    top: 0, left: 0, bottom: 0,
    zIndex: 100,
  },
  sidebarLogo: {
    display: "flex", alignItems: "center", gap: "10px",
    padding: "24px 20px 20px",
    borderBottom: "1px solid rgba(255,255,255,0.06)",
  },
  logoBox: {
    width: "36px", height: "36px",
    background: "linear-gradient(135deg, #2d6e4e, #1a3c2e)",
    borderRadius: "9px", display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: "1.1rem", border: "1px solid rgba(168,213,181,0.2)",
    flexShrink: 0,
  },
  logoName: { fontWeight: "800", fontSize: "0.9rem", color: "#fff", letterSpacing: "0.04em" },
  logoRole: { fontSize: "0.62rem", color: "rgba(255,255,255,0.35)", letterSpacing: "0.1em", textTransform: "uppercase" },
  nav: { flex: 1, padding: "16px 0" },
  navBtn: {
    display: "flex", alignItems: "center", gap: "10px",
    width: "100%", padding: "11px 20px",
    border: "none", cursor: "pointer",
    fontSize: "0.85rem", fontWeight: "600",
    transition: "all 0.2s", textAlign: "left",
    letterSpacing: "0.01em",
  },
  sidebarFooter: { padding: "16px 20px", borderTop: "1px solid rgba(255,255,255,0.06)" },
  adminBadge: { display: "flex", alignItems: "center", gap: "10px" },
  adminAvatar: {
    width: "32px", height: "32px", borderRadius: "50%",
    background: "#1a3c2e", color: "#a8d5b5",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: "0.8rem", fontWeight: "800", flexShrink: 0,
  },
  main: { marginLeft: "220px", flex: 1, display: "flex", flexDirection: "column", minHeight: "100vh" },
  topbar: {
    display: "flex", justifyContent: "space-between", alignItems: "center",
    padding: "20px 24px", background: "#fff",
    borderBottom: "1px solid #ebebeb",
  },
  pageTitle: { fontSize: "1.2rem", fontWeight: "800", color: "#1a1a1a" },
  pageSub: { fontSize: "0.78rem", color: "#aaa", marginTop: "2px" },
  refreshBtn: {
    padding: "8px 16px", background: "#f5f4f0",
    border: "1.5px solid #e0ddd8", borderRadius: "8px",
    fontSize: "0.82rem", fontWeight: "600", color: "#555",
    cursor: "pointer",
  },
  loadingWrap: { flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "60vh" },
  spinner: { width: "32px", height: "32px", border: "3px solid #e0ddd8", borderTopColor: "#1a3c2e", borderRadius: "50%", animation: "spin 0.8s linear infinite" },
  statCard: {
    background: "#fff", borderRadius: "14px",
    border: "1px solid #ebebeb", padding: "22px 20px",
  },
  card: {
    background: "#fff", borderRadius: "14px",
    border: "1px solid #ebebeb", padding: "20px",
    overflow: "hidden",
  },
  cardHead: {
    fontSize: "0.88rem", fontWeight: "700", color: "#1a1a1a",
    marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px",
  },
  cardBadge: {
    fontSize: "0.68rem", fontWeight: "700",
    background: "#eaf3de", color: "#3b6d11",
    padding: "2px 8px", borderRadius: "999px",
  },
  searchWrap: {
    display: "flex", alignItems: "center", gap: "8px",
    background: "#fff", border: "1.5px solid #e0ddd8",
    borderRadius: "10px", padding: "0 14px", flex: 1, maxWidth: "320px",
  },
  searchInput: { border: "none", background: "transparent", padding: "10px 0", fontSize: "0.88rem", color: "#1a1a1a", flex: 1 },
  addBtn: {
    padding: "10px 20px", background: "#1a3c2e", color: "#fff",
    border: "none", borderRadius: "10px",
    fontSize: "0.88rem", fontWeight: "700", cursor: "pointer", transition: "background 0.2s",
    whiteSpace: "nowrap",
  },
  table: { width: "100%", borderCollapse: "collapse", fontSize: "0.85rem" },
  th: { padding: "10px 14px", textAlign: "left", fontSize: "0.72rem", fontWeight: "700", color: "#aaa", letterSpacing: "0.06em", textTransform: "uppercase", borderBottom: "1px solid #f0eeea" },
  td: { padding: "12px 14px", color: "#444", verticalAlign: "middle" },
  categoryPill: { fontSize: "0.72rem", fontWeight: "700", background: "#e6f1fb", color: "#185fa5", padding: "3px 10px", borderRadius: "999px" },
  editBtn: { padding: "5px 12px", background: "#e6f1fb", color: "#185fa5", border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "0.78rem", fontWeight: "700", marginRight: "6px" },
  delBtn: { padding: "5px 12px", background: "#fcebeb", color: "#a32d2d", border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "0.78rem", fontWeight: "700" },
  statusSelect: {
    padding: "5px 10px", border: "1.5px solid #e0ddd8", borderRadius: "7px",
    fontSize: "0.78rem", color: "#444", background: "#fff", cursor: "pointer",
    fontFamily: "inherit",
  },
  modalOverlay: {
    position: "fixed", inset: 0,
    background: "rgba(0,0,0,0.45)",
    display: "flex", alignItems: "center", justifyContent: "center",
    zIndex: 1000,
  },
  modal: {
    background: "#fff", borderRadius: "18px",
    width: "100%", maxWidth: "480px",
    boxShadow: "0 24px 60px rgba(0,0,0,0.15)",
  },
  modalHead: {
    display: "flex", justifyContent: "space-between", alignItems: "center",
    padding: "20px 24px", borderBottom: "1px solid #f0eeea",
  },
  modalTitle: { fontSize: "0.95rem", fontWeight: "800", color: "#1a1a1a" },
  modalClose: { background: "none", border: "none", cursor: "pointer", fontSize: "1rem", color: "#aaa" },
  modalInput: {
    width: "100%", padding: "10px 14px",
    border: "1.5px solid #e0ddd8", borderRadius: "9px",
    fontSize: "0.88rem", color: "#1a1a1a",
    fontFamily: "inherit",
  },
  modalSaveBtn: {
    flex: 1, padding: "12px", background: "#1a3c2e", color: "#fff",
    border: "none", borderRadius: "10px", fontSize: "0.9rem",
    fontWeight: "700", cursor: "pointer", transition: "background 0.2s",
  },
  modalCancelBtn: {
    padding: "12px 20px", background: "transparent", color: "#666",
    border: "1.5px solid #d5d3cd", borderRadius: "10px",
    fontSize: "0.88rem", fontWeight: "600", cursor: "pointer", transition: "background 0.2s",
  },
};
