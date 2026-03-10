import { useState } from "react";
import { useCart } from "../context/CartContext";
import { useNavigate } from "react-router-dom";

export default function Products() {
  const { addToCart } = useCart();
  const navigate = useNavigate();

  // 1. Danh sách sản phẩm đầy đủ (Sau này lấy từ CSDL)
  const items = [
    { id: 1, name: "Xi măng Hà Tiên 1", price: 85000, unit: "Bao", image: "/ximang.jpg", category: "Xi măng" },
    { id: 2, name: "Sắt cuộn Phi 6 Hòa Phát", price: 15800, unit: "Kg", image: "/sat-thep.jpg", category: "Sắt thép" },
    { id: 3, name: "Gạch ống Tuynel 4 lỗ", price: 1250, unit: "Viên", image: "/gach.jpg", category: "Gạch xây" },
    { id: 4, name: "Cát vàng xây tô", price: 450000, unit: "Khối", image: "/cat-vang.jpg", category: "Cát đá" },
    { id: 5, name: "Đá 1x2 xanh", price: 320000, unit: "Khối", image: "/da-1x2.jpg", category: "Cát đá" }
  ];

  // 2. State để lưu loại sản phẩm đang chọn
  const [selectedCategory, setSelectedCategory] = useState("Tất cả");

  // 3. Logic lọc sản phẩm
  const filteredItems = selectedCategory === "Tất cả" 
    ? items 
    : items.filter(item => item.category === selectedCategory);

  return (
    <div style={{ padding: '20px' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '20px', color: '#333', fontSize: '2rem' }}>
        🧱 Danh Mục Vật Liệu Xây Dựng
      </h2>

      {/* 4. KHU VỰC SỔ XUỐNG ĐỂ PHÂN LOẠI */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        gap: '15px', 
        marginBottom: '40px',
        background: '#f8f9fa',
        padding: '15px',
        borderRadius: '8px'
      }}>
        <label style={{ fontWeight: 'bold', color: '#555' }}>🔎 Lọc theo loại:</label>
        <select 
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          style={{ 
            padding: '10px 20px', 
            borderRadius: '5px', 
            border: '1px solid #ccc', 
            fontSize: '1rem',
            outline: 'none',
            cursor: 'pointer',
            minWidth: '200px'
          }}
        >
          <option value="Tất cả">--- Tất cả vật liệu ---</option>
          <option value="Xi măng">Xi măng</option>
          <option value="Sắt thép">Sắt thép</option>
          <option value="Gạch xây">Gạch xây</option>
          <option value="Cát đá">Cát & Đá</option>
        </select>
        
        <span style={{ color: '#888', fontSize: '0.9rem' }}>
          (Tìm thấy {filteredItems.length} sản phẩm)
        </span>
      </div>

      {/* HIỂN THỊ DANH SÁCH ĐÃ LỌC */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '25px' }}>
        {filteredItems.map(item => (
          <div key={item.id} style={{ 
            border: '1px solid #eee', 
            borderRadius: '10px',
            overflow: 'hidden',
            boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
            backgroundColor: 'white',
            display: 'flex',
            flexDirection: 'column',
            transition: 'transform 0.3s'
          }}
          onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
          onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            {/* Hình ảnh */}
            <div style={{ height: '220px', overflow: 'hidden', backgroundColor: '#f9f9f9', cursor: 'pointer' }}
                 onClick={() => navigate(`/product/${item.id}`)}
            >
              <img 
                src={item.image} 
                alt={item.name} 
                style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s' }}
                onMouseOver={(e) => e.target.style.transform = 'scale(1.1)'}
                onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
                onError={(e) => { e.target.src = "https://via.placeholder.com/300x200?text=Chua+co+anh" }}
              />
            </div>

            {/* Thông tin */}
            <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
              <div style={{ fontSize: '0.8rem', color: '#1976d2', fontWeight: 'bold', marginBottom: '5px' }}>
                {item.category.toUpperCase()}
              </div>
              <h3 
                onClick={() => navigate(`/product/${item.id}`)}
                style={{ fontSize: '1.2rem', margin: '0 0 10px 0', color: '#333', minHeight: '45px', cursor: 'pointer' }}
              >
                {item.name}
              </h3>
              
              <p style={{ color: '#d32f2f', fontWeight: 'bold', fontSize: '1.2rem', margin: '0 0 20px 0' }}>
                {item.price.toLocaleString()} đ <span style={{ color: '#888', fontSize: '0.9rem', fontWeight: 'normal' }}>/ {item.unit}</span>
              </p>
              
              {/* Nút bấm */}
              <div style={{ display: 'flex', gap: '10px', marginTop: 'auto' }}>
                <button 
                  onClick={() => navigate(`/product/${item.id}`)}
                  style={{ flex: 1, padding: '12px 0', background: '#f5f5f5', color: '#333', border: '1px solid #ddd', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}
                >
                  👁️ Chi tiết
                </button>
                <button 
                  onClick={() => addToCart(item)}
                  style={{ flex: 1, padding: '12px 0', background: '#1976d2', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}
                >
                  🛒 Thêm
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Thông báo nếu không có sản phẩm nào khớp */}
      {filteredItems.length === 0 && (
        <div style={{ textAlign: 'center', padding: '50px', color: '#888' }}>
          <p fontSize="1.2rem">Hiện chưa có sản phẩm nào thuộc loại này.</p>
        </div>
      )}
    </div>
  );
}