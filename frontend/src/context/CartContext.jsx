import { createContext, useContext, useEffect, useState } from "react";

// Tạo Context để quản lý giỏ hàng toàn app
const CartContext = createContext();

// Provider bọc toàn bộ app để dùng giỏ hàng
export const CartProvider = ({ children }) => {
  // State lưu danh sách sản phẩm trong giỏ
  const [cartItems, setCartItems] = useState([]);

  // State lưu mã giảm giá đang áp dụng
  const [appliedCoupon, setAppliedCoupon] = useState(null);

  // Thêm sản phẩm vào giỏ
  const addToCart = (product) => {
    setCartItems((prev) => {
      // Kiểm tra sản phẩm đã tồn tại chưa
      const existing = prev.find((item) => item.id === product.id);

      if (existing) {
        // Nếu có rồi thì tăng số lượng
        return prev.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }

      // Nếu chưa có thì thêm mới với quantity = 1
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  // Cập nhật số lượng sản phẩm
  const updateQuantity = (id, newQty) => {
    // Nếu số lượng <= 0 thì xoá luôn
    if (newQty <= 0) {
      removeFromCart(id);
      return;
    }

    // Cập nhật quantity cho item
    setCartItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, quantity: newQty } : item
      )
    );
  };

  // Xoá sản phẩm khỏi giỏ
  const removeFromCart = (id) => {
    setCartItems((prev) => prev.filter((item) => item.id !== id));
  };

  // Xoá toàn bộ giỏ hàng + reset coupon
  const clearCart = () => {
    setCartItems([]);
    setAppliedCoupon(null);
  };

  // Tính tổng tiền chưa áp dụng giảm giá
  const getTotalPrice = () =>
    cartItems.reduce((total, item) => total + item.price * item.quantity, 0);

  // Tính số tiền được giảm từ coupon
  const calculateCouponDiscount = (subtotal = getTotalPrice()) => {
    // Nếu không có coupon hoặc subtotal <= 0 thì không giảm
    if (!appliedCoupon || subtotal <= 0) return 0;

    // Nếu chưa đạt giá trị tối thiểu để áp dụng coupon
    if (subtotal < Number(appliedCoupon.minOrder || 0)) return 0;

    // Tính giảm giá theo loại coupon
    let discount =
      appliedCoupon.type === "percent"
        ? (subtotal * Number(appliedCoupon.value || 0)) / 100 // giảm theo %
        : Number(appliedCoupon.value || 0); // giảm số tiền cố định

    // Nếu có maxDiscount thì giới hạn lại
    if (appliedCoupon.maxDiscount != null) {
      discount = Math.min(discount, Number(appliedCoupon.maxDiscount));
    }

    // Đảm bảo không giảm quá subtotal
    return Math.min(discount, subtotal);
  };

  // Lấy số tiền giảm thực tế
  const getDiscountAmount = () => calculateCouponDiscount(getTotalPrice());

  // Tổng tiền cuối cùng sau khi giảm
  const getFinalTotal = () => Math.max(getTotalPrice() - getDiscountAmount(), 0);

  // Áp dụng mã giảm giá
  const applyCoupon = (coupon) => {
    setAppliedCoupon(coupon);
  };

  // Gỡ mã giảm giá
  const removeCoupon = () => {
    setAppliedCoupon(null);
  };

  // Tự động xoá coupon nếu giỏ hàng trống
  useEffect(() => {
    if (cartItems.length === 0 && appliedCoupon) {
      setAppliedCoupon(null);
    }
  }, [cartItems, appliedCoupon]);

  // Truyền toàn bộ state + function xuống component con
  return (
    <CartContext.Provider
      value={{
        cartItems,
        appliedCoupon,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        getTotalPrice,
        getDiscountAmount,
        getFinalTotal,
        applyCoupon,
        removeCoupon,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

// Custom hook để dùng giỏ hàng dễ hơn
export const useCart = () => useContext(CartContext);