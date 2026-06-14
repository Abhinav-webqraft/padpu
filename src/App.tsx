import { useEffect, Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import BottomNav from './components/layout/BottomNav';
import CartDrawer from './components/cart/CartDrawer';
import AdminSidebar from './components/admin/AdminSidebar';

const HomePage = lazy(() => import('./pages/HomePage'));
const ShopPage = lazy(() => import('./pages/ShopPage'));
const ProductDetailPage = lazy(() => import('./pages/ProductDetailPage'));
const AboutPage = lazy(() => import('./pages/AboutPage'));
const ContactPage = lazy(() => import('./pages/ContactPage'));
const GalleryPage = lazy(() => import('./pages/GalleryPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const WishlistPage = lazy(() => import('./pages/WishlistPage'));
const CheckoutPage = lazy(() => import('./pages/CheckoutPage'));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const AdminOrdersPage = lazy(() => import('./pages/admin/AdminOrdersPage'));
const AdminProductsPage = lazy(() => import('./pages/admin/AdminProductsPage'));
const AdminCategoriesPage = lazy(() => import('./pages/admin/AdminCategoriesPage'));
const AdminGalleryPage = lazy(() => import('./pages/admin/AdminGalleryPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const SignupPage = lazy(() => import('./pages/SignupPage'));
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
          <Suspense fallback={<div className="min-h-screen bg-[#0d0a05] flex items-center justify-center font-display text-xl text-amber-500/70 animate-pulse">Loading...</div>}>
            <Routes>
              {/* Login/Signup Routes */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />

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
              <Route path="/admin/categories" element={<ProtectedAdminRoute><AdminCategoriesPage /></ProtectedAdminRoute>} />
              <Route path="/admin/gallery" element={<ProtectedAdminRoute><AdminGalleryPage /></ProtectedAdminRoute>} />

              {/* Catch-all to redirect to login */}
              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
          </Suspense>
        </AuthProvider>
      </CartProvider>
    </BrowserRouter>
  );
}

export default App;
