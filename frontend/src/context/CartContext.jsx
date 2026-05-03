import { createContext, useContext, useEffect, useState } from "react";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [appliedCoupon, setAppliedCoupon] = useState(null);

  const addToCart = (product) => {
    setCartItems((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const updateQuantity = (id, newQty) => {
    if (newQty <= 0) {
      removeFromCart(id);
      return;
    }

    setCartItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, quantity: newQty } : item
      )
    );
  };

  const removeFromCart = (id) => {
    setCartItems((prev) => prev.filter((item) => item.id !== id));
  };

  const clearCart = () => {
    setCartItems([]);
    setAppliedCoupon(null);
  };

  const getTotalPrice = () =>
    cartItems.reduce((total, item) => total + item.price * item.quantity, 0);

  const calculateCouponDiscount = (subtotal = getTotalPrice()) => {
    if (!appliedCoupon || subtotal <= 0) return 0;
    if (subtotal < Number(appliedCoupon.minOrder || 0)) return 0;

    let discount =
      appliedCoupon.type === "percent"
        ? (subtotal * Number(appliedCoupon.value || 0)) / 100
        : Number(appliedCoupon.value || 0);

    if (appliedCoupon.maxDiscount != null) {
      discount = Math.min(discount, Number(appliedCoupon.maxDiscount));
    }

    return Math.min(discount, subtotal);
  };

  const getDiscountAmount = () => calculateCouponDiscount(getTotalPrice());

  const getFinalTotal = () => Math.max(getTotalPrice() - getDiscountAmount(), 0);

  const applyCoupon = (coupon) => {
    setAppliedCoupon(coupon);
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
  };

  useEffect(() => {
    if (cartItems.length === 0 && appliedCoupon) {
      setAppliedCoupon(null);
    }
  }, [cartItems, appliedCoupon]);

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

export const useCart = () => useContext(CartContext);
