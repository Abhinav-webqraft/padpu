export interface WeightOption {
  label: string;
  price: number;
  grams: number;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  shortDescription: string;
  description: string;
  price: number;
  originalPrice?: number;
  category: string;
  tags: string[];
  images: string[];
  weightOptions: WeightOption[];
  inStock: boolean;
  stockQuantity: number;
  rating: number;
  reviewCount: number;
  featured: boolean;
  badge?: string;
}

export interface GalleryImage {
  id: string;
  url: string;
  title: string;
  description: string;
  category: string;
  order: number;
}

export interface Testimonial {
  id: string;
  name: string;
  location: string;
  avatar: string;
  rating: number;
  review: string;
  date: string;
  verified: boolean;
}

export interface CartItem {
  productId: string;
  product: Product;
  quantity: number;
  selectedWeight: WeightOption;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  items: Array<{
    productId: string;
    product: Product;
    quantity: number;
    selectedWeight: WeightOption;
  }>;
  shippingAddress: {
    fullName: string;
    phone: string;
    line1: string;
    line2?: string;
    city: string;
    state: string;
    pincode: string;
  };
  subtotal: number;
  tax: number;
  shippingCharge: number;
  discount: number;
  total: number;
  paymentStatus: 'paid' | 'pending' | 'failed';
  paymentMethod: string;
  orderStatus: 'confirmed' | 'processing' | 'packed' | 'dispatched' | 'delivered' | 'cancelled';
  createdAt: string;
  updatedAt: string;
  couponCode?: string;
}

export interface Coupon {
  id: string;
  code: string;
  type: 'percentage' | 'flat';
  value: number;
  minOrderValue: number;
  maxUses: number;
  usedCount: number;
  validFrom: string;
  validUntil: string;
  isActive: boolean;
}

export interface AdminStats {
  totalOrders: number;
  totalRevenue: number;
  pendingOrders: number;
  lowStockProducts: number;
  todayOrders: number;
  todayRevenue: number;
  monthOrders: number;
  monthRevenue: number;
}
