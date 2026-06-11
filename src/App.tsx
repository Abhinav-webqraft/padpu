import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import BottomNav from './components/layout/BottomNav';
import CartDrawer from './components/cart/CartDrawer';
import HomePage from './pages/HomePage';
import ShopPage from './pages/ShopPage';
import ProductDetailPage from './pages/ProductDetailPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import GalleryPage from './pages/GalleryPage';
import ProfilePage from './pages/ProfilePage';
import WishlistPage from './pages/WishlistPage';
import CheckoutPage from './pages/CheckoutPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminSidebar from './components/admin/AdminSidebar';
import AdminOrdersPage from './pages/admin/AdminOrdersPage';
import AdminProductsPage from './pages/admin/AdminProductsPage';
import AdminGalleryPage from './pages/admin/AdminGalleryPage';
import LoginPage from './pages/LoginPage';
// ScrollToTop component to reset window scroll position on route change
function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}
// Public layout wrapper (for logged-in users)
const PublicLayout = ({ children }: { children: React.ReactNode }) => (
  <>
    <Navbar />
    <CartDrawer />
    <main className="min-h-screen">{children}</main>
    <Footer />
    <BottomNav />
  </>
);

// Admin layout wrapper
const AdminLayout = ({ children }: { children: React.ReactNode }) => (
  <div className="min-h-screen bg-[#110e07] text-white">
    <AdminSidebar />
    <main className="lg:pl-64 min-h-screen">{children}</main>
  </div>
);

// Protected Route wrapper for Admin
const ProtectedAdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { role } = useAuth();
  if (role !== 'admin') {
    return <Navigate to="/login" replace />;
  }
  return <AdminLayout>{children}</AdminLayout>;
};

// Protected Route wrapper for Users (admin can also see user pages)
const ProtectedUserRoute = ({ children }: { children: React.ReactNode }) => {
  const { role } = useAuth();
  if (!role) {
    return <Navigate to="/login" replace />;
  }
  return <PublicLayout>{children}</PublicLayout>;
};

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <CartProvider>
        <AuthProvider>
          <Routes>
            {/* Login Route */}
            <Route path="/login" element={<LoginPage />} />

            {/* User Routes (Protected) */}
            <Route path="/" element={<ProtectedUserRoute><HomePage /></ProtectedUserRoute>} />
            <Route path="/shop" element={<ProtectedUserRoute><ShopPage /></ProtectedUserRoute>} />
            <Route path="/shop/:slug" element={<ProtectedUserRoute><ProductDetailPage /></ProtectedUserRoute>} />
            <Route path="/checkout" element={<ProtectedUserRoute><CheckoutPage /></ProtectedUserRoute>} />
            <Route path="/about" element={<ProtectedUserRoute><AboutPage /></ProtectedUserRoute>} />
            <Route path="/contact" element={<ProtectedUserRoute><ContactPage /></ProtectedUserRoute>} />
            <Route path="/gallery" element={<ProtectedUserRoute><GalleryPage /></ProtectedUserRoute>} />
            <Route path="/profile" element={<ProtectedUserRoute><ProfilePage /></ProtectedUserRoute>} />
            <Route path="/wishlist" element={<ProtectedUserRoute><WishlistPage /></ProtectedUserRoute>} />

            {/* Admin Routes */}
            <Route path="/admin" element={<ProtectedAdminRoute><AdminDashboard /></ProtectedAdminRoute>} />
            <Route path="/admin/orders" element={<ProtectedAdminRoute><AdminOrdersPage /></ProtectedAdminRoute>} />
            <Route path="/admin/products" element={<ProtectedAdminRoute><AdminProductsPage /></ProtectedAdminRoute>} />
            <Route path="/admin/gallery" element={<ProtectedAdminRoute><AdminGalleryPage /></ProtectedAdminRoute>} />

            {/* Catch-all to redirect to login */}
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </AuthProvider>
      </CartProvider>
    </BrowserRouter>
  );
}

export default App;
