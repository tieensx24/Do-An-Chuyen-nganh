import { useState } from 'react';
import { Link } from 'react-router-dom';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    console.log("Thử đăng nhập với:", email, password);
    alert("Giao diện Đăng nhập đã sẵn sàng kết nối Backend!");
  };

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'flex-end', // ĐẨY FORM SANG PHẢI
      alignItems: 'center',
      minHeight: '85vh',
      paddingRight: '10%', // Cách lề phải 10% cho không bị sát mép
      
      // Thêm ảnh nền làm nền tảng, phần bên trái sẽ hiện ảnh
      backgroundImage: `url('/home/image/home2.jpg')`, 
      backgroundSize: 'cover',
      backgroundPosition: 'center',
    }}>
      <div style={{
        background: 'rgba(255, 255, 255, 0.95)', // Màu trắng hơi trong suốt (95%)
        padding: '40px',
        borderRadius: '12px',
        boxShadow: '0 10px 30px rgba(0,0,0,0.2)', // Tăng độ đổ bóng cho nổi bật trên nền ảnh
        width: '100%',
        maxWidth: '400px',
        textAlign: 'center',
        backdropFilter: 'blur(10px)' // Hiệu ứng làm mờ kính chuẩn Apple
      }}>
        <h2 style={{ marginBottom: '25px', color: '#333' }}>👋 Đăng Nhập</h2>
        
        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <input 
            type="email" 
            placeholder="Email của bạn" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ padding: '12px', borderRadius: '5px', border: '1px solid #ddd', fontSize: '1rem', outline: 'none' }}
          />
          <input 
            type="password" 
            placeholder="Mật khẩu" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{ padding: '12px', borderRadius: '5px', border: '1px solid #ddd', fontSize: '1rem', outline: 'none' }}
          />
          
          <button type="submit" style={{
            padding: '12px',
            background: '#1976d2',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            fontSize: '1.1rem',
            fontWeight: 'bold',
            cursor: 'pointer',
            transition: 'background 0.3s'
          }}
          onMouseOver={(e) => e.target.style.background = '#1565c0'}
          onMouseOut={(e) => e.target.style.background = '#1976d2'}
          >
            Đăng nhập
          </button>
        </form>

        <div style={{ marginTop: '25px', paddingTop: '20px', borderTop: '1px solid #ddd' }}>
          <p style={{ color: '#666', marginBottom: '15px' }}>Bạn chưa có tài khoản?</p>
          <Link to="/register" style={{
            display: 'inline-block',
            padding: '10px 20px',
            color: '#d32f2f',
            textDecoration: 'none',
            fontWeight: 'bold',
            border: '1px solid #d32f2f',
            borderRadius: '5px',
            transition: 'all 0.3s'
          }}
          onMouseOver={(e) => { e.target.style.background = '#d32f2f'; e.target.style.color = 'white'; }}
          onMouseOut={(e) => { e.target.style.background = 'transparent'; e.target.style.color = '#d32f2f'; }}
          >
            Tạo tài khoản mới
          </Link>
        </div>
      </div>
    </div>
  );
}