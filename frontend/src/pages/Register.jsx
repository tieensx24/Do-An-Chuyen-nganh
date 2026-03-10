import { useState } from 'react';
import { Link } from 'react-router-dom';

export default function Register() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleRegister = (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert("❌ Mật khẩu xác nhận không khớp! Vui lòng nhập lại.");
      return;
    }
    console.log("Thử đăng ký với:", fullName, email, password);
    alert("Giao diện Đăng ký đã sẵn sàng gửi dữ liệu xuống Backend!");
  };

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'flex-end', // ĐẨY FORM SANG PHẢI
      alignItems: 'center',
      minHeight: '85vh',
      paddingRight: '10%', // Cách lề phải 10%
      
      // Bạn có thể dùng ảnh khác cho trang đăng ký, ví dụ home3.jpg
      backgroundImage: `url('/home/image/home3.jpg')`, 
      backgroundSize: 'cover',
      backgroundPosition: 'center',
    }}>
      <div style={{
        background: 'rgba(255, 255, 255, 0.95)', // Nền trắng mờ
        padding: '40px',
        borderRadius: '12px',
        boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
        width: '100%',
        maxWidth: '450px',
        textAlign: 'center',
        backdropFilter: 'blur(10px)'
      }}>
        <h2 style={{ marginBottom: '25px', color: '#333' }}>📝 Tạo Tài Khoản</h2>
        
        <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <input 
            type="text" placeholder="Họ và tên của bạn" value={fullName} onChange={(e) => setFullName(e.target.value)} required
            style={{ padding: '12px', borderRadius: '5px', border: '1px solid #ddd', fontSize: '1rem', outline: 'none' }}
          />
          <input 
            type="email" placeholder="Email đăng nhập" value={email} onChange={(e) => setEmail(e.target.value)} required
            style={{ padding: '12px', borderRadius: '5px', border: '1px solid #ddd', fontSize: '1rem', outline: 'none' }}
          />
          <input 
            type="password" placeholder="Mật khẩu" value={password} onChange={(e) => setPassword(e.target.value)} required
            style={{ padding: '12px', borderRadius: '5px', border: '1px solid #ddd', fontSize: '1rem', outline: 'none' }}
          />
          <input 
            type="password" placeholder="Xác nhận lại mật khẩu" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required
            style={{ padding: '12px', borderRadius: '5px', border: '1px solid #ddd', fontSize: '1rem', outline: 'none' }}
          />
          
          <button type="submit" style={{
            padding: '12px', background: '#2e7d32', color: 'white', border: 'none', borderRadius: '5px', fontSize: '1.1rem', fontWeight: 'bold', cursor: 'pointer', transition: 'background 0.3s', marginTop: '10px'
          }}
          onMouseOver={(e) => e.target.style.background = '#1b5e20'}
          onMouseOut={(e) => e.target.style.background = '#2e7d32'}
          >
            Đăng ký ngay
          </button>
        </form>

        <div style={{ marginTop: '25px', paddingTop: '20px', borderTop: '1px solid #ddd' }}>
          <p style={{ color: '#666', marginBottom: '15px' }}>Bạn đã có tài khoản rồi?</p>
          <Link to="/login" style={{
            display: 'inline-block', padding: '10px 20px', color: '#1976d2', textDecoration: 'none', fontWeight: 'bold', border: '1px solid #1976d2', borderRadius: '5px', transition: 'all 0.3s'
          }}
          onMouseOver={(e) => { e.target.style.background = '#1976d2'; e.target.style.color = 'white'; }}
          onMouseOut={(e) => { e.target.style.background = 'transparent'; e.target.style.color = '#1976d2'; }}
          >
            Quay lại Đăng nhập
          </Link>
        </div>
      </div>
    </div>
  );
}