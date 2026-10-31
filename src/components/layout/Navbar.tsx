import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { ShoppingCart, Heart, User, Package } from "lucide-react";
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
  const { role } = useAuth();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (location.pathname.startsWith("/admin")) return null;

  return (
    <header
      className={`fixed top-0 w-full z-40 transition-all duration-300 pointer-events-none md:pointer-events-auto ${
        scrolled
          ? "md:py-3 py-2.5 bg-[#0d0a05]/90 backdrop-blur-md border-b border-white/10 shadow-lg pointer-events-auto"
          : "bg-transparent md:py-4 py-3"
      }`}
    >
      <div className="relative z-[2] max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between md:grid md:grid-cols-3">
        {/* Mobile: Logo centered */}
        <Link to="/" className="md:hidden absolute left-1/2 -translate-x-1/2 flex items-center group pointer-events-auto">
          <img
            src="/logo.png"
            alt="Padpu Farms"
            className="h-8 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
          />
        </Link>
        <div className="md:hidden w-6" />

        {/* Desktop: left placeholder */}
        <div className="hidden md:block" />

        {/* Desktop Center Nav */}
        <nav className="hidden md:flex items-center justify-center w-full">
          <div className="flex items-center justify-end gap-6 flex-1">
            {leftLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className={`text-xs font-semibold uppercase tracking-wider transition-colors flex items-center gap-1.5 ${
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

          <Link to="/" className="mx-6 shrink-0 group">
            <img
              src="/logo.png"
              alt="Padpu Farms"
              className="h-10 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
            />
          </Link>

          <div className="flex items-center justify-start gap-6 flex-1">
            {rightLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className={`text-xs font-semibold uppercase tracking-wider transition-colors ${
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
        <div className="flex items-center justify-end gap-1.5 pointer-events-auto ml-auto">
          {role && (
            <>
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
            </>
          )}

          {/* Profile / Login */}
          {role ? (
            <Link
              to="/profile"
              className="p-2 hover:bg-white/10 rounded-xl transition-colors hidden md:block"
              title="Profile"
            >
              <User
                className={`w-4 h-4 ${
                  location.pathname === "/profile" ? "text-amber-400" : "text-stone-300"
                }`}
              />
            </Link>
          ) : (
            <Link
              to="/login"
              className="px-4 py-2 amber-gradient text-stone-950 text-xs font-bold rounded-xl transition-all hover:opacity-90 hidden md:block"
            >
              Sign In
            </Link>
          )}

          {role && (
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
          )}
        </div>
      </div>
    </header>
  );
}
