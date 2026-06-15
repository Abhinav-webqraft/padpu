import React, { createContext, useContext, useReducer, useEffect, useState } from 'react';
import { CartItem, Product, WeightOption } from '../types';
import { useAuth } from './AuthContext';

interface CartState {
  items: CartItem[];
  isOpen: boolean;
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
  const [items, dispatch] = useReducer(cartReducer, []);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (token) {
      fetch('http://localhost:5000/api/cart', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch cart');
        return res.json();
      })
      .then(data => dispatch({ type: 'LOAD_CART', payload: Array.isArray(data) ? data : [] }))
      .catch(console.error);
    } else {
      dispatch({ type: 'CLEAR_CART' });
    }
  }, [token]);

  const addItem = async (product: Product, weight: WeightOption, quantity = 1) => {
    if (!token) return alert('Please login to add items to cart');
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
    if (!token) return;
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
    if (!token) return;
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
    if (!token) return;
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
