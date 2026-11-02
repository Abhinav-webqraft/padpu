import { useEffect, Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { OrderProvider } from './context/OrderContext';
import { WishlistProvider } from './context/WishlistContext';
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
const OrdersPage = lazy(() => import('./pages/OrdersPage'));
const WishlistPage = lazy(() => import('./pages/WishlistPage'));
const CheckoutPage = lazy(() => import('./pages/CheckoutPage'));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const AdminOrdersPage = lazy(() => import('./pages/admin/AdminOrdersPage'));
const AdminProductsPage = lazy(() => import('./pages/admin/AdminProductsPage'));
const AdminCategoriesPage = lazy(() => import('./pages/admin/AdminCategoriesPage'));
const AdminGalleryPage = lazy(() => import('./pages/admin/AdminGalleryPage'));
const AdminMessagesPage = lazy(() => import('./pages/admin/AdminMessagesPage'));
const AdminSettingsPage = lazy(() => import('./pages/admin/AdminSettings'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const SignupPage = lazy(() => import('./pages/SignupPage'));

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

const PublicLayout = ({ children }: { children: React.ReactNode }) => (
  <>
    <Navbar />
    <CartDrawer />
    <main className="min-h-screen pb-24 md:pb-0">{children}</main>
    <Footer />
    <BottomNav />
  </>
);

const AdminLayout = ({ children }: { children: React.ReactNode }) => (
  <div className="min-h-screen forest-bg text-white relative overflow-x-hidden">
    <div className="fixed top-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-amber-500/[0.06] blur-[150px] pointer-events-none z-0" />
    <div className="fixed bottom-[-10%] left-[10%] w-[500px] h-[500px] rounded-full bg-emerald-500/[0.04] blur-[150px] pointer-events-none z-0" />
    <AdminSidebar />
    <main className="lg:pl-64 min-h-screen relative z-10">{children}</main>
  </div>
);

const ProtectedAdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { role } = useAuth();
  if (role !== 'admin') {
    return <Navigate to="/login" replace />;
  }
  return <AdminLayout>{children}</AdminLayout>;
};

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
      <AuthProvider>
        <WishlistProvider>
          <CartProvider>
            <OrderProvider>
              <Suspense fallback={<div className="min-h-screen bg-[#0d0a05] flex items-center justify-center font-display text-xl text-amber-500/70 animate-pulse">Loading...</div>}>
                <Routes>
                  {/* Login/Signup Routes */}
                  <Route path="/login" element={<PublicLayout><LoginPage /></PublicLayout>} />
                  <Route path="/signup" element={<PublicLayout><SignupPage /></PublicLayout>} />

                  {/* Public Routes */}
                  <Route path="/" element={<PublicLayout><HomePage /></PublicLayout>} />
                  <Route path="/shop" element={<PublicLayout><ShopPage /></PublicLayout>} />
                  <Route path="/shop/:slug" element={<PublicLayout><ProductDetailPage /></PublicLayout>} />
                  <Route path="/about" element={<PublicLayout><AboutPage /></PublicLayout>} />
                  <Route path="/contact" element={<PublicLayout><ContactPage /></PublicLayout>} />
                  <Route path="/gallery" element={<PublicLayout><GalleryPage /></PublicLayout>} />

                  {/* User Routes (Protected) */}
                  <Route path="/checkout" element={<ProtectedUserRoute><CheckoutPage /></ProtectedUserRoute>} />
                  <Route path="/profile" element={<ProtectedUserRoute><ProfilePage /></ProtectedUserRoute>} />
                  <Route path="/orders" element={<ProtectedUserRoute><OrdersPage /></ProtectedUserRoute>} />
                  <Route path="/wishlist" element={<ProtectedUserRoute><WishlistPage /></ProtectedUserRoute>} />

                  {/* Admin Routes */}
                  <Route path="/admin" element={<ProtectedAdminRoute><AdminDashboard /></ProtectedAdminRoute>} />
                  <Route path="/admin/orders" element={<ProtectedAdminRoute><AdminOrdersPage /></ProtectedAdminRoute>} />
                  <Route path="/admin/products" element={<ProtectedAdminRoute><AdminProductsPage /></ProtectedAdminRoute>} />
                  <Route path="/admin/categories" element={<ProtectedAdminRoute><AdminCategoriesPage /></ProtectedAdminRoute>} />
                  <Route path="/admin/gallery" element={<ProtectedAdminRoute><AdminGalleryPage /></ProtectedAdminRoute>} />
                  <Route path="/admin/messages" element={<ProtectedAdminRoute><AdminMessagesPage /></ProtectedAdminRoute>} />
                  <Route path="/admin/settings" element={<ProtectedAdminRoute><AdminSettingsPage /></ProtectedAdminRoute>} />

                  {/* Catch-all to redirect to login */}
                  <Route path="*" element={<Navigate to="/login" replace />} />
                </Routes>
              </Suspense>
            </OrderProvider>
          </CartProvider>
        </WishlistProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
