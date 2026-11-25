import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { ShoppingCart, Heart, User, Package, LayoutDashboard } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useOrders } from "@/context/OrderContext";
import { useWishlist } from "@/context/WishlistContext";

const leftLinks = [
  { href: "/", label: "Home" },
  { href: "/shop", label: "Shop" },
  { href: "/orders", label: "Orders" },
];

const rightLinks = [
  { href: "/about", label: "About" },
  { href: "/gallery", label: "Gallery" },
  { href: "/contact", label: "Contact" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const { itemCount, openCart } = useCart();
  const { orderCount } = useOrders();
  const { wishlistItems } = useWishlist();
  const { role, token, user } = useAuth();
  const location = useLocation();
  const isAdmin = Boolean(token && role === "admin" && (!user || user.role === "admin"));

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (location.pathname.startsWith("/admin")) return null;

  const isHome = location.pathname === "/";

  return (
    <header
      className={`fixed top-0 left-0 right-0 w-full z-40 transition-all duration-300 ${
        isHome
          ? scrolled
            ? "pointer-events-none md:pointer-events-auto bg-transparent md:bg-[#0d0a05]/90 md:backdrop-blur-md md:border-b md:border-white/10 md:shadow-lg py-3 md:py-3.5"
            : "pointer-events-none md:pointer-events-auto bg-transparent py-3 md:py-4"
          : "pointer-events-auto bg-[#0d0a05]/95 backdrop-blur-md border-b border-white/10 shadow-lg py-3 md:py-4"
      }`}
    >
      <div
        className={`relative z-[2] mx-auto flex items-center justify-between md:grid md:grid-cols-3 ${
          isHome
            ? "max-w-7xl px-4 sm:px-6"
            : "max-w-[1440px] w-full px-4 sm:px-8 lg:px-12 min-h-[48px] md:min-h-0"
        }`}
      >
        {/* Mobile: Bigger centered logo on all pages EXCEPT Home */}
        {!isHome && (
          <Link
            to="/"
            className="md:hidden absolute left-1/2 -translate-x-1/2 flex items-center group pointer-events-auto"
          >
            <img
              src="/logo.png"
              alt="Padpu Farms"
              className="h-11 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
            />
          </Link>
        )}
        {/* Left Slot: Back to Admin button (STRICTLY visible to authenticated admins only) */}
        <div className="flex items-center justify-start pointer-events-auto min-w-[2rem]">
          {isAdmin && (
            <Link
              to="/admin"
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 md:px-3.5 md:py-2 rounded-xl bg-[#0d0a05]/85 md:bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/35 text-amber-400 text-[11px] md:text-xs font-bold tracking-wide backdrop-blur-md shadow-md transition-all"
              title="Back to Admin Console"
            >
              <LayoutDashboard className="w-3.5 h-3.5 shrink-0" />
              <span>
                Admin<span className="hidden lg:inline"> Panel</span>
              </span>
            </Link>
          )}
        </div>

        {/* Desktop Center Nav */}
        <nav className="hidden md:flex items-center justify-center w-full">
          <div className="flex items-center justify-end gap-7 flex-1">
            {leftLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className={`text-xs font-semibold uppercase tracking-wider transition-colors flex items-center gap-1.5 whitespace-nowrap ${
                  location.pathname === link.href
                    ? "text-amber-400"
                    : "text-stone-300 hover:text-white"
                }`}
              >
                <span>{link.label}</span>
                {link.href === "/orders" && orderCount > 0 && (
                  <span className="min-w-[16px] h-[16px] px-1 rounded-full bg-amber-500 text-stone-950 text-[10px] font-bold font-sans flex items-center justify-center">
                    {orderCount > 99 ? "99+" : orderCount}
                  </span>
                )}
              </Link>
            ))}
          </div>

          {!isHome ? (
            <Link to="/" className="mx-8 shrink-0 group">
              <img
                src="/logo.png"
                alt="Padpu Farms"
                className="h-12 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
              />
            </Link>
          ) : (
            <div className="mx-5 w-px h-4 bg-white/15 shrink-0" />
          )}

          <div className="flex items-center justify-start gap-7 flex-1">
            {rightLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className={`text-xs font-semibold uppercase tracking-wider transition-colors whitespace-nowrap ${
                  location.pathname === link.href
                    ? "text-amber-400"
                    : "text-stone-300 hover:text-white"
                }`}
              >
                <span>{link.label}</span>
              </Link>
            ))}
          </div>
        </nav>

        {/* Right Actions */}
        <div className="flex items-center justify-end gap-1 sm:gap-1.5 pointer-events-auto ml-auto">
          {/* Wishlist */}
          <Link
            to="/wishlist"
            className="relative p-2 hover:bg-white/10 rounded-xl transition-colors"
            title="Wishlist"
          >
            <Heart
              className={`w-4 h-4 ${
                location.pathname === "/wishlist" ? "text-amber-400" : "text-stone-300"
              }`}
            />
            {wishlistItems.length > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[15px] h-[15px] px-1 rounded-full bg-amber-500 text-stone-950 text-[9px] font-bold flex items-center justify-center">
                {wishlistItems.length}
              </span>
            )}
          </Link>

          {/* Orders */}
          <Link
            to="/orders"
            className="relative p-2 hover:bg-white/10 rounded-xl transition-colors hidden md:block"
            title="My Orders"
          >
            <Package
              className={`w-4 h-4 ${
                location.pathname === "/orders" ? "text-amber-400" : "text-stone-300"
              }`}
            />
          </Link>

          {/* Cart (available for guests and signed-in users) */}
          <button
            onClick={openCart}
            className="relative p-2 hover:bg-white/10 rounded-xl transition-colors"
            title="Cart"
          >
            <ShoppingCart className="w-4 h-4 text-stone-300" />
            {itemCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-[16px] px-1 rounded-full amber-gradient text-stone-950 text-[10px] font-bold flex items-center justify-center">
                {itemCount}
              </span>
            )}
          </button>

          {/* Profile / Login */}
          {role ? (
            <Link
              to="/profile"
              className="p-2 hover:bg-white/10 rounded-xl transition-colors"
              title="Profile"
            >
              <User
                className={`w-4 h-4 ${
                  location.pathname === "/profile" ? "text-amber-400" : "text-stone-300"
                }`}
              />
            </Link>
          ) : (
            <>
              <Link
                to="/login"
                className="p-2 hover:bg-white/10 rounded-xl transition-colors md:hidden"
                title="Sign In"
              >
                <User
                  className={`w-4 h-4 ${
                    location.pathname === "/login" ? "text-amber-400" : "text-stone-300"
                  }`}
                />
              </Link>
              <Link
                to="/login"
                className="px-4 py-2 amber-gradient text-stone-950 text-xs font-bold rounded-xl transition-all hover:opacity-90 hidden md:block"
              >
                Sign In
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
