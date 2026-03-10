import { useState, useEffect } from 'react';

export default function Home() {
  const images = [
    '/home/image/home.jpg',
    '/home/image/home2.jpg',
    '/home/image/home3.jpg'
  ];

  const [currentIndex, setCurrentIndex] = useState(0);
  
  // Biến lưu tọa độ X khi bắt đầu click/chạm
  const [startX, setStartX] = useState(0);

  // Vẫn giữ tính năng tự động chuyển ảnh sau 4 giây
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  // 1. Khi người dùng bấm chuột (hoặc chạm tay vào màn hình)
  const handleDragStart = (e) => {
    // Lấy tọa độ trục X (nếu là cảm ứng thì lấy touches, nếu là chuột thì lấy clientX)
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    setStartX(clientX);
  };

  // 2. Khi người dùng nhả chuột (hoặc nhấc ngón tay lên)
  const handleDragEnd = (e) => {
    if (!startX) return; // Nếu chưa bấm thì không làm gì cả

    const clientX = e.changedTouches ? e.changedTouches[0].clientX : e.clientX;
    const diff = startX - clientX; // Tính khoảng cách kéo

    // Kéo sang TRÁI (Next ảnh)
    if (diff > 50) {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    } 
    // Kéo sang PHẢI (Back ảnh trước)
    else if (diff < -50) {
      setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
    }
    
    setStartX(0); // Reset lại tọa độ
  };

  return (
    <div 
      // Kích hoạt các sự kiện lắng nghe thao tác Kéo/Thả
      onMouseDown={handleDragStart}
      onMouseUp={handleDragEnd}
      onTouchStart={handleDragStart}
      onTouchEnd={handleDragEnd}

      style={{ 
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url('${images[currentIndex]}')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        
        // Giảm thời gian chuyển ảnh xuống 0.5s để cảm giác kéo tay nhạy hơn
        transition: 'background-image 0.5s ease-in-out', 
        
        width: '100vw', 
        minHeight: '100vh', 
        marginLeft: 'calc(-50vw + 50%)', 

        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        color: 'white',
        textAlign: 'center',
        padding: '20px',
        boxSizing: 'border-box',
        
        // Đổi con trỏ chuột thành hình "bàn tay mở" để báo hiệu cho người dùng biết có thể kéo được
        cursor: 'grab' 
      }}
    >
      
      <h1 style={{ 
        fontSize: '3.5rem', 
        marginBottom: '20px', 
        textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
        pointerEvents: 'none' // Tránh việc vô tình bôi đen chữ khi đang kéo ảnh
      }}>
        Chào mừng đến với Cửa hàng VLXD - Nơi xây dựng niềm tin và chất lượng!
      </h1>
      
      <p style={{ 
        fontSize: '1.2rem', 
        marginBottom: '40px', 
        maxWidth: '700px', 
        lineHeight: '1.6',
        color: '#e0e0e0',
        pointerEvents: 'none'
      }}>
        Đối tác tin cậy cung cấp giải pháp vật liệu toàn diện, chất lượng cao và giá cả cạnh tranh nhất cho mọi công trình của bạn.
      </p>
      
      <button style={{ 
        padding: '15px 35px', 
        fontSize: '1.2rem',
        fontWeight: 'bold',
        background: '#d32f2f', 
        color: 'white', 
        border: 'none', 
        borderRadius: '8px',
        cursor: 'pointer',
        boxShadow: '0 4px 10px rgba(211, 47, 47, 0.4)', 
        transition: 'transform 0.2s',
        zIndex: 10 // Đảm bảo nút vẫn bấm được bình thường
      }}
      onMouseOver={(e) => e.target.style.transform = 'scale(1.05)'} 
      onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
      // Dừng việc đổi ảnh khi người dùng bấm vào nút
      onMouseDown={(e) => e.stopPropagation()} 
      >
        🔥 Xem khuyến mãi ngay
      </button>

    </div>
  );
}