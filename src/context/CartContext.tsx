import React, { createContext, useContext, useState, useEffect } from 'react';
import { CartItem, Product, SizeOption } from '../types';
import { dataRepo } from '../lib/storage';

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: Product, size: SizeOption, quantity?: number) => void;
  removeFromCart: (itemId: string) => void;
  updateQuantity: (itemId: string, delta: number) => void;
  clearCart: () => void;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  isCheckoutOpen: boolean;
  setIsCheckoutOpen: (open: boolean) => void;
  subtotal: number;
  freeDeliveryThreshold: number;
  deliveryFee: number;
  deliveryMethod: 'pickup' | 'local_delivery' | 'shipping';
  setDeliveryMethod: (method: 'pickup' | 'local_delivery' | 'shipping') => void;
  total: number;
  totalCount: number;
  toastMessage: string | null;
  showToast: (msg: string) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'delightful_juice_cart_v1';

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const stored = localStorage.getItem(CART_STORAGE_KEY);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.warn(e);
    }
    return [];
  });

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [deliveryMethod, setDeliveryMethod] = useState<'pickup' | 'local_delivery' | 'shipping'>('local_delivery');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const siteContent = dataRepo.getContent();
  const freeDeliveryThreshold = siteContent.freeDeliveryThreshold || 40.0;
  const standardDeliveryFee = siteContent.standardDeliveryFee || 4.99;

  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    } catch (e) {
      console.warn(e);
    }
  }, [cart]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((current) => (current === msg ? null : current));
    }, 3200);
  };

  const addToCart = (product: Product, size: SizeOption, quantity = 1) => {
    const itemId = `${product.id}-${size.size}`;
    setCart((prev) => {
      const existing = prev.find((item) => item.id === itemId);
      if (existing) {
        return prev.map((item) =>
          item.id === itemId ? { ...item, quantity: item.quantity + quantity } : item
        );
      }
      return [...prev, { id: itemId, product, selectedSize: size, quantity }];
    });
    showToast(`Added ${quantity}x ${product.name} (${size.size}) to your cart`);
  };

  const removeFromCart = (itemId: string) => {
    setCart((prev) => prev.filter((item) => item.id !== itemId));
  };

  const updateQuantity = (itemId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.id === itemId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const subtotal = cart.reduce((sum, item) => sum + item.selectedSize.price * item.quantity, 0);
  const totalCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  let deliveryFee = 0;
  if (deliveryMethod === 'pickup') {
    deliveryFee = 0;
  } else if (subtotal >= freeDeliveryThreshold) {
    deliveryFee = 0;
  } else {
    deliveryFee = standardDeliveryFee;
  }

  const total = subtotal + deliveryFee;

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        isCartOpen,
        setIsCartOpen,
        isCheckoutOpen,
        setIsCheckoutOpen,
        subtotal,
        freeDeliveryThreshold,
        deliveryFee,
        deliveryMethod,
        setDeliveryMethod,
        total,
        totalCount,
        toastMessage,
        showToast,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
};
