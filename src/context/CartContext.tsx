import { createContext, useState, useContext, ReactNode, useMemo } from 'react';
import { CartItem } from '@/types/order';
import { Product } from '@/types/product';

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (product: Product, quantity: number) => void;
  clearCart: () => void;
  getCartItem: (productId: string) => CartItem | undefined;
  itemCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cart, setCart] = useState<CartItem[]>([]);

  const addToCart = (product: Product, quantity: number = 1) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.product.id === product.id);
      if (existingItem) {
        return prevCart.map(item =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + quantity } : item
        );
      }
      return [...prevCart, { product, quantity }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart(prevCart => prevCart.filter(item => item.product.id !== productId));
  };

  const updateQuantity = (product: Product, quantity: number) => {
      if (quantity <= 0) {
        removeFromCart(product.id);
      } else {
        setCart(prevCart => {
          const existingItem = prevCart.find(item => item.product.id === product.id);
          if (existingItem) {
            return prevCart.map(item =>
              item.product.id === product.id ? { ...item, quantity } : item
            );
          } else {
            return [...prevCart, { product, quantity }];
          }
        });
      }
    };

  const clearCart = () => {
    setCart([]);
  };

  const getCartItem = (productId: string) => {
    return cart.find(item => item.product.id === productId);
  };

  const itemCount = useMemo(() => cart.reduce((sum, item) => sum + item.quantity, 0), [cart]);

  const value = {
    cart,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    itemCount,
    getCartItem,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
