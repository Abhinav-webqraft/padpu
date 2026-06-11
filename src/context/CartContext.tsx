import React, { createContext, useContext, useReducer, useEffect, useState } from 'react';
import { CartItem, Product, WeightOption } from '../types';

interface CartState {
  items: CartItem[];
  isOpen: boolean;
}

interface CartContextType {
  items: CartItem[];
  isOpen: boolean;
  addItem: (product: Product, weight: WeightOption, quantity?: number) => void;
  removeItem: (productId: string, weightLabel: string) => void;
  updateQuantity: (productId: string, weightLabel: string, quantity: number) => void;
  clearCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  itemCount: number;
  subtotal: number;
}

type CartAction =
  | { type: 'ADD_ITEM'; payload: { product: Product; weight: WeightOption; quantity: number } }
  | { type: 'REMOVE_ITEM'; payload: { productId: string; weightLabel: string } }
  | { type: 'UPDATE_QUANTITY'; payload: { productId: string; weightLabel: string; quantity: number } }
  | { type: 'CLEAR_CART' }
  | { type: 'LOAD_CART'; payload: CartItem[] };

function cartReducer(state: CartItem[], action: CartAction): CartItem[] {
  switch (action.type) {
    case 'ADD_ITEM': {
      const { product, weight, quantity } = action.payload;
      const existingIndex = state.findIndex(
        item => item.productId === product.id && item.selectedWeight.label === weight.label
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
        item => !(item.productId === action.payload.productId && item.selectedWeight.label === action.payload.weightLabel)
      );
    case 'UPDATE_QUANTITY': {
      if (action.payload.quantity <= 0) {
        return state.filter(
          item => !(item.productId === action.payload.productId && item.selectedWeight.label === action.payload.weightLabel)
        );
      }
      return state.map(item =>
        item.productId === action.payload.productId && item.selectedWeight.label === action.payload.weightLabel
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
  const [items, dispatch] = useReducer(cartReducer, [], () => {
    try {
      const saved = localStorage.getItem('padpu-cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('padpu-cart', JSON.stringify(items));
  }, [items]);

  const addItem = (product: Product, weight: WeightOption, quantity = 1) => {
    dispatch({ type: 'ADD_ITEM', payload: { product, weight, quantity } });
    setIsOpen(true);
  };

  const removeItem = (productId: string, weightLabel: string) => {
    dispatch({ type: 'REMOVE_ITEM', payload: { productId, weightLabel } });
  };

  const updateQuantity = (productId: string, weightLabel: string, quantity: number) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { productId, weightLabel, quantity } });
  };

  const clearCart = () => dispatch({ type: 'CLEAR_CART' });
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
