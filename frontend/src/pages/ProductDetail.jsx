import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';

export default function ProductDetail() {
  const { id } = useParams(); // Lấy ID sản phẩm từ URL
  const { addToCart } = useCart();
  
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);

  // Tạm thời dùng dữ liệu giả. Sau này chỗ này sẽ là code GỌI API C# hút từ MySQL lên!
  useEffect(() => {
    // Giả lập database
    const mockDb = [
      { id: 1, name: "Xi măng Hà Tiên 1", price: 85000, unit: "Bao", stock_quantity: 200, brand: "Hà Tiên", description: "Xi măng đa dụng chất lượng cao, chuyên dùng cho xây tô, đổ bê tông móng, sàn, cột. Chống thấm tốt, độ bền cao với thời gian.", image: "/ximang.jpg" },
      { id: 2, name: "Sắt cuộn Phi 6 Hòa Phát", price: 15800, unit: "Kg", stock_quantity: 1000, brand: "Hòa Phát", description: "Thép cuộn trơn tròn, dẻo dai, dễ uốn. Phù hợp làm cốt thép đai cho các công trình xây dựng dân dụng và công nghiệp.", image: "/sat-thep.jpg" },
      { id: 3, name: "Gạch ống Tuynel 4 lỗ", price: 1250, unit: "Viên", stock_quantity: 50000, brand: "Tuynel Đồng Nai", description: "Gạch đất sét nung công nghệ cao, màu đỏ tươi, kích thước chuẩn. Cách âm, cách nhiệt cực tốt cho tường nhà.", image: "/gach.jpg" },
      { id: 4, name: "Cát vàng xây tô", price: 450000, unit: "Khối", stock_quantity: 50, brand: "Khai thác tự nhiên", description: "Cát vàng hạt trung, đã qua sàng lọc sạch tạp chất. Đảm bảo lớp vữa xây tô bám dính tốt, không nứt nẻ bề mặt.", image: "/cat-vang.jpg" },
      { id: 5, name: "Đá 1x2 xanh", price: 320000, unit: "Khối", stock_quantity: 30, brand: "Khai thác tự nhiên", description: "Đá xanh biên hòa cường độ nén cao, chuyên dụng đổ bê tông tươi, sàn, móng chịu lực lớn cho các công trình cao tầng.", image: "/da-1x2.jpg" }
    ];

    // Tìm sản phẩm có ID trùng với URL
    const foundProduct = mockDb.find(item => item.id === parseInt(id));
    setProduct(foundProduct);
  }, [id]);

  // Nếu chưa tìm thấy (đang tải) hoặc gõ sai ID
  if (!product) return <div style={{ textAlign: 'center', padding: '50px', fontSize: '1.5rem' }}>⏳ Đang tải thông tin sản phẩm...</div>;

  // Hàm xử lý tăng giảm số lượng
  const handleQuantityChange = (type) => {
    if (type === 'minus' && quantity > 1) setQuantity(quantity - 1);
    if (type === 'plus' && quantity < product.stock_quantity) setQuantity(quantity + 1);
  };

  return (
    <div style={{ padding: '40px 5%', maxWidth: '1200px', margin: '0 auto' }}>
      
      {/* Nút quay lại */}
      <Link to="/products" style={{ textDecoration: 'none', color: '#1976d2', fontWeight: 'bold', display: 'inline-block', marginBottom: '20px' }}>
        ← Quay lại danh sách
      </Link>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '40px', background: 'white', padding: '30px', borderRadius: '12px', boxShadow: '0 5px 25px rgba(0,0,0,0.05)' }}>
        
        {/* Cột Trái: Hình ảnh */}
        <div style={{ flex: '1 1 400px', borderRadius: '10px', overflow: 'hidden', border: '1px solid #eee' }}>
          <img 
            src={product.image} 
            alt={product.name} 
            style={{ width: '100%', height: '100%', minHeight: '400px', objectFit: 'cover' }}
            onError={(e) => { e.target.src = "https://via.placeholder.com/600x600?text=Chua+co+anh" }}
          />
        </div>

        {/* Cột Phải: Thông tin chi tiết */}
        <div style={{ flex: '1 1 500px', display: 'flex', flexDirection: 'column' }}>
          
          <h1 style={{ fontSize: '2rem', color: '#333', marginBottom: '10px' }}>{product.name}</h1>
          
          <div style={{ display: 'flex', gap: '20px', marginBottom: '20px', color: '#666', fontSize: '1rem' }}>
            <span>Thương hiệu: <strong style={{ color: '#1976d2' }}>{product.brand}</strong></span>
            <span>Tình trạng: <strong style={{ color: product.stock_quantity > 0 ? '#2e7d32' : '#d32f2f' }}>
              {product.stock_quantity > 0 ? `Còn hàng (${product.stock_quantity} ${product.unit})` : 'Hết hàng'}
            </strong></span>
          </div>

          <div style={{ background: '#f9f9f9', padding: '20px', borderRadius: '8px', marginBottom: '25px' }}>
            <span style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#d32f2f' }}>
              {product.price.toLocaleString()} đ
            </span>
            <span style={{ fontSize: '1.2rem', color: '#888', marginLeft: '10px' }}>/ {product.unit}</span>
          </div>

          <div style={{ marginBottom: '30px' }}>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '10px', borderBottom: '2px solid #eee', paddingBottom: '10px' }}>Mô tả vật liệu</h3>
            <p style={{ lineHeight: '1.8', color: '#555' }}>{product.description}</p>
          </div>

          {/* Khu vực chọn số lượng và Đặt hàng */}
          <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
            
            <div style={{ display: 'flex', border: '1px solid #ccc', borderRadius: '5px', overflow: 'hidden' }}>
              <button onClick={() => handleQuantityChange('minus')} style={{ width: '40px', height: '40px', background: '#f5f5f5', border: 'none', cursor: 'pointer', fontSize: '1.2rem' }}>-</button>
              <input type="text" value={quantity} readOnly style={{ width: '60px', textAlign: 'center', border: 'none', borderLeft: '1px solid #ccc', borderRight: '1px solid #ccc', fontWeight: 'bold', fontSize: '1.1rem' }} />
              <button onClick={() => handleQuantityChange('plus')} style={{ width: '40px', height: '40px', background: '#f5f5f5', border: 'none', cursor: 'pointer', fontSize: '1.2rem' }}>+</button>
            </div>

            <button 
              onClick={() => {
                // Thêm vào giỏ nhiều món cùng lúc
                for(let i=0; i<quantity; i++) addToCart(product);
                alert(`Đã thêm ${quantity} ${product.unit} ${product.name} vào giỏ!`);
              }}
              style={{ flexGrow: 1, padding: '15px 30px', background: '#d32f2f', color: 'white', border: 'none', borderRadius: '5px', fontSize: '1.2rem', fontWeight: 'bold', cursor: 'pointer', transition: 'background 0.3s' }}
              onMouseOver={(e) => e.target.style.background = '#b71c1c'}
              onMouseOut={(e) => e.target.style.background = '#d32f2f'}
            >
              🛒 Thêm vào giỏ hàng
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}