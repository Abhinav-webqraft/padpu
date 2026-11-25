import React, { createContext, useContext, useReducer, useEffect, useState, useRef } from 'react';
import { CartItem, Product, WeightOption } from '../types';
import { useAuth } from './AuthContext';

const GUEST_CART_KEY = 'padpu-guest-cart';

function readGuestCart(): CartItem[] {
  try {
    const raw = localStorage.getItem(GUEST_CART_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeGuestCart(items: CartItem[]) {
  try {
    localStorage.setItem(GUEST_CART_KEY, JSON.stringify(items));
  } catch {
    // ignore storage quota errors
  }
}

interface CartContextType {
  items: CartItem[];
  isOpen: boolean;
  addItem: (product: Product, weight: WeightOption, quantity?: number) => void;
  removeItem: (productId: string, weightLabel: string, weightGrams: number) => void;
  updateQuantity: (productId: string, weightLabel: string, weightGrams: number, quantity: number) => void;
  clearCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  itemCount: number;
  subtotal: number;
}

type CartAction =
  | { type: 'ADD_ITEM'; payload: { product: Product; weight: WeightOption; quantity: number } }
  | { type: 'REMOVE_ITEM'; payload: { productId: string; weightLabel: string; weightGrams: number } }
  | { type: 'UPDATE_QUANTITY'; payload: { productId: string; weightLabel: string; weightGrams: number; quantity: number } }
  | { type: 'CLEAR_CART' }
  | { type: 'LOAD_CART'; payload: CartItem[] };

function cartReducer(state: CartItem[], action: CartAction): CartItem[] {
  switch (action.type) {
    case 'ADD_ITEM': {
      const { product, weight, quantity } = action.payload;
      const existingIndex = state.findIndex(
        item => item.productId === product.id && item.selectedWeight.label === weight.label && item.selectedWeight.grams === weight.grams
      );
      if (existingIndex >= 0) {
        const updated = [...state];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + quantity,
        };
        return updated;
      }
      return [...state, { productId: product.id, product, quantity, selectedWeight: weight }];
    }
    case 'REMOVE_ITEM':
      return state.filter(
        item => !(item.productId === action.payload.productId && item.selectedWeight.label === action.payload.weightLabel && item.selectedWeight.grams === action.payload.weightGrams)
      );
    case 'UPDATE_QUANTITY': {
      if (action.payload.quantity <= 0) {
        return state.filter(
          item => !(item.productId === action.payload.productId && item.selectedWeight.label === action.payload.weightLabel && item.selectedWeight.grams === action.payload.weightGrams)
        );
      }
      return state.map(item =>
        item.productId === action.payload.productId && item.selectedWeight.label === action.payload.weightLabel && item.selectedWeight.grams === action.payload.weightGrams
          ? { ...item, quantity: action.payload.quantity }
          : item
      );
    }
    case 'CLEAR_CART':
      return [];
    case 'LOAD_CART':
      return action.payload;
    default:
      return state;
  }
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { token } = useAuth();
  const [items, dispatch] = useReducer(cartReducer, [], () => (token ? [] : readGuestCart()));
  const [isOpen, setIsOpen] = useState(false);
  const prevTokenRef = useRef<string | null>(token);

  // Sync guest cart to server upon login, or load/persist guest cart when logged out
  useEffect(() => {
    const prevToken = prevTokenRef.current;
    prevTokenRef.current = token;

    if (token) {
      const syncAndLoad = async () => {
        try {
          const guestItems = readGuestCart();
          if (guestItems.length > 0) {
            await Promise.all(
              guestItems.map(item =>
                fetch('http://localhost:5000/api/cart', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                  },
                  body: JSON.stringify({
                    productId: item.productId,
                    weightLabel: item.selectedWeight.label,
                    weightGrams: item.selectedWeight.grams,
                    quantity: item.quantity,
                  }),
                }).catch(() => {})
              )
            );
            localStorage.removeItem(GUEST_CART_KEY);
          }

          const res = await fetch('http://localhost:5000/api/cart', {
            headers: { 'Authorization': `Bearer ${token}` },
          });
          if (!res.ok) throw new Error('Failed to fetch cart');
          const data = await res.json();
          dispatch({ type: 'LOAD_CART', payload: Array.isArray(data) ? data : [] });
        } catch (err) {
          console.error(err);
        }
      };

      syncAndLoad();
    } else if (prevToken) {
      // User explicitly logged out -> clear cart state
      localStorage.removeItem(GUEST_CART_KEY);
      dispatch({ type: 'CLEAR_CART' });
    } else {
      // Guest browsing -> load saved local cart
      dispatch({ type: 'LOAD_CART', payload: readGuestCart() });
    }
  }, [token]);

  // Persist guest cart changes to localStorage when not logged in
  useEffect(() => {
    if (!token) {
      writeGuestCart(items);
    }
  }, [items, token]);

  const addItem = async (product: Product, weight: WeightOption, quantity = 1) => {
    if (!token) {
      dispatch({ type: 'ADD_ITEM', payload: { product, weight, quantity } });
      setIsOpen(true);
      return;
    }
    try {
      const res = await fetch('http://localhost:5000/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ productId: product.id, weightLabel: weight.label, weightGrams: weight.grams, quantity })
      });
      if (res.ok) {
        dispatch({ type: 'ADD_ITEM', payload: { product, weight, quantity } });
        setIsOpen(true);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const removeItem = async (productId: string, weightLabel: string, weightGrams: number) => {
    if (!token) {
      dispatch({ type: 'REMOVE_ITEM', payload: { productId, weightLabel, weightGrams } });
      return;
    }
    try {
      const res = await fetch('http://localhost:5000/api/cart/item', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ productId, weightLabel, weightGrams })
      });
      if (res.ok) {
        dispatch({ type: 'REMOVE_ITEM', payload: { productId, weightLabel, weightGrams } });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const updateQuantity = async (productId: string, weightLabel: string, weightGrams: number, quantity: number) => {
    if (!token) {
      dispatch({ type: 'UPDATE_QUANTITY', payload: { productId, weightLabel, weightGrams, quantity } });
      return;
    }
    try {
      const res = await fetch('http://localhost:5000/api/cart', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ productId, weightLabel, weightGrams, quantity })
      });
      if (res.ok) {
        dispatch({ type: 'UPDATE_QUANTITY', payload: { productId, weightLabel, weightGrams, quantity } });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const clearCart = async () => {
    if (!token) {
      localStorage.removeItem(GUEST_CART_KEY);
      dispatch({ type: 'CLEAR_CART' });
      return;
    }
    try {
      const res = await fetch('http://localhost:5000/api/cart', {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        dispatch({ type: 'CLEAR_CART' });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const openCart = () => setIsOpen(true);
  const closeCart = () => setIsOpen(false);
  const toggleCart = () => setIsOpen(prev => !prev);

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => sum + item.selectedWeight.price * item.quantity, 0);

  return (
    <CartContext.Provider value={{
      items, isOpen, addItem, removeItem, updateQuantity, clearCart,
      openCart, closeCart, toggleCart, itemCount, subtotal,
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
}
