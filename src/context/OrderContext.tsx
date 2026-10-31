import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';

export interface OrderItem {
  product: {
    id: string;
    name: string;
    images: string[];
  };
  selectedWeight: {
    label: string;
    price: number;
  };
  quantity: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: {
    fullName: string;
    phone: string;
    line1: string;
    city: string;
    state: string;
    pincode: string;
  };
  subtotal: number;
  tax: number;
  shippingCharge: number;
  discount: number;
  total: number;
  paymentMethod: string;
  paymentStatus: string;
  orderStatus: string;
  createdAt: string;
  updatedAt: string;
  items: OrderItem[];
}

interface OrderContextType {
  orders: Order[];
  orderCount: number;
  activeOrderCount: number;
  loading: boolean;
  refetchOrders: () => Promise<void>;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export const OrderProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, token } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchOrders = useCallback(async () => {
    if (!user?.id) {
      setOrders([]);
      return;
    }

    setLoading(true);
    try {
      const queryParams = new URLSearchParams({ userId: String(user.id) });
      if (user.email) queryParams.append('email', user.email);
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`http://localhost:5000/api/orders/my-orders?${queryParams.toString()}`, {
        headers
      });
      const data = await res.json();
      if (Array.isArray(data)) {
        setOrders(data);
      } else {
        setOrders([]);
      }
    } catch (err) {
      console.error('Failed to fetch user orders:', err);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, [user?.id, user?.email, token]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const activeOrderCount = orders.filter(
    o => o.orderStatus !== 'delivered' && o.orderStatus !== 'cancelled'
  ).length;

  return (
    <OrderContext.Provider
      value={{
        orders,
        orderCount: orders.length,
        activeOrderCount,
        loading,
        refetchOrders: fetchOrders,
      }}
    >
      {children}
    </OrderContext.Provider>
  );
};

export const useOrders = () => {
  const context = useContext(OrderContext);
  if (!context) {
    throw new Error('useOrders must be used within an OrderProvider');
  }
  return context;
};
