import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const [platform, setPlatform] = useState('RETAIL'); // RETAIL or B2B
  const [cart, setCart] = useState({ items: [], subtotal: 0 });
  const [loading, setLoading] = useState(false);

  // Generate or retrieve guest session ID
  let sessionId = localStorage.getItem('cart_session_id');
  if (!sessionId) {
    sessionId = `sess_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    localStorage.setItem('cart_session_id', sessionId);
  }

  useEffect(() => {
    fetchCart();
  }, [user, platform]);

  const fetchCart = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/cart', {
        params: { sessionId, platform },
      });
      if (res.data.success) {
        setCart(res.data.cart);
      }
    } catch (err) {
      console.error('Cart fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (productId, variantId = null, quantity = 1) => {
    try {
      const res = await axios.post('/api/cart/add', {
        productId,
        variantId,
        quantity,
        sessionId,
        platform,
      });
      if (res.data.success) {
        await fetchCart();
        return { success: true, message: res.data.message };
      }
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || 'Failed to add item to cart',
      };
    }
  };

  const updateQuantity = async (itemId, quantity) => {
    try {
      const res = await axios.put(`/api/cart/items/${itemId}`, { quantity });
      if (res.data.success) {
        await fetchCart();
      }
    } catch (err) {
      console.error('Update quantity error:', err);
    }
  };

  const removeItem = async (itemId) => {
    try {
      const res = await axios.delete(`/api/cart/items/${itemId}`);
      if (res.data.success) {
        await fetchCart();
      }
    } catch (err) {
      console.error('Remove item error:', err);
    }
  };

  const totalItems = cart.items ? cart.items.reduce((sum, item) => sum + item.quantity, 0) : 0;

  return (
    <CartContext.Provider
      value={{
        cart,
        platform,
        setPlatform,
        totalItems,
        loading,
        fetchCart,
        addToCart,
        updateQuantity,
        removeItem,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
