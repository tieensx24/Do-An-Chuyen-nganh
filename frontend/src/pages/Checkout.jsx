import { useCart } from "../context/CartContext";

export default function Checkout() {
  const { cartItems } = useCart();

  // Tính tổng tiền
  const totalPrice = cartItems.reduce((total, item) => total + item.price * item.quantity, 0);

  return (
    <div style={{ padding: '20px' }}>
      <h2>🛒 Chi tiết đơn hàng (PO)</h2>
      {cartItems.length === 0 ? (
        <p>Giỏ hàng của bạn đang trống. Vui lòng chọn sản phẩm!</p>
      ) : (
        <div>
          <table border="1" width="100%" style={{ borderCollapse: 'collapse', marginTop: '20px' }}>
            <thead>
              <tr style={{ background: '#eee' }}>
                <th style={{ padding: '10px' }}>Vật liệu</th>
                <th>Đơn vị</th>
                <th>Số lượng</th>
                <th>Đơn giá</th>
                <th>Thành tiền</th>
              </tr>
            </thead>
            <tbody>
              {cartItems.map((item) => (
                <tr key={item.id} style={{ textAlign: 'center' }}>
                  <td style={{ padding: '10px' }}>{item.name}</td>
                  <td>{item.unit}</td>
                  <td>{item.quantity}</td>
                  <td>{item.price.toLocaleString()}đ</td>
                  <td>{(item.price * item.quantity).toLocaleString()}đ</td>
                </tr>
              ))}
            </tbody>
          </table>
          
          <div style={{ textAlign: 'right', marginTop: '20px' }}>
            <h3 style={{ color: 'red' }}>Tổng cộng: {totalPrice.toLocaleString()}đ</h3>
            <button style={{ 
              padding: '10px 20px', 
              background: '#2e7d32', 
              color: 'white', 
              border: 'none', 
              cursor: 'pointer',
              fontSize: '1rem' 
            }}>
              XÁC NHẬN ĐẶT HÀNG
            </button>
          </div>
        </div>
      )}
    </div>
  );
}