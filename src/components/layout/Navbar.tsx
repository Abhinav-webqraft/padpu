import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { ShoppingCart, Leaf, Search, Heart, User } from "lucide-react";
import { useCart } from "@/context/CartContext";

const leftLinks = [
  { href: "/", label: "Home" },
  { href: "/shop", label: "Shop" },
];

const rightLinks = [
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const { itemCount, openCart } = useCart();
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
      className={`fixed top-0 w-full z-40 transition-all duration-500 pointer-events-none md:pointer-events-auto ${
        scrolled ? 'md:py-3 py-2 bg-[#0d0a05]/95 border-b border-white/10 shadow-xl pointer-events-auto' : 'bg-transparent md:py-5 py-4'
      }`}
    >

      <div className="relative z-[2] max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between md:grid md:grid-cols-3">
        {/* Mobile: Logo left (Hidden as requested) */}
        <Link to="/" className="hidden items-center gap-2 group">
          <img
            src="/logo.png"
            alt="Padpu Farms"
            className="h-8 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
          />
        </Link>
        {/* Desktop: left placeholder for grid alignment */}
        <div className="hidden md:block" />

        {/* Desktop Center Nav */}
        <nav className="hidden md:flex items-center justify-center gap-8">
          {leftLinks.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              className={`text-sm font-medium transition-colors ${
                location.pathname === link.href
                  ? "text-amber-400"
                  : "text-gray-300 hover:text-white"
              }`}
            >
              {link.label}
            </Link>
          ))}

          <Link to="/" className="mx-2 group">
            <img
              src="/logo.png"
              alt="Padpu Farms"
              className="h-10 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
            />
          </Link>

          {rightLinks.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              className={`text-sm font-medium transition-colors ${
                location.pathname === link.href
                  ? "text-amber-400"
                  : "text-gray-300 hover:text-white"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right Actions */}
        <div className="flex items-center justify-end gap-2 pointer-events-auto ml-auto">
          {/* Desktop only: Search */}
          <button className="p-2 hover:bg-white/10 rounded-lg transition-colors hidden md:block">
            <Search className="w-5 h-5 text-gray-300" />
          </button>

          {/* Desktop only: Wishlist */}
          <Link
            to="/wishlist"
            className="p-2 hover:bg-white/10 rounded-lg transition-colors hidden md:block"
          >
            <Heart
              className={`w-5 h-5 ${
                location.pathname === "/wishlist" ? "text-amber-400" : "text-gray-300"
              }`}
            />
          </Link>

          {/* Desktop only: Profile */}
          <Link
            to="/profile"
            className="p-2 hover:bg-white/10 rounded-lg transition-colors hidden md:block"
          >
            <User
              className={`w-5 h-5 ${
                location.pathname === "/profile" ? "text-amber-400" : "text-gray-300"
              }`}
            />
          </Link>

          {/* Cart (always visible) */}
          <button
            onClick={openCart}
            className="relative p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <ShoppingCart className="w-5 h-5 text-gray-300" />
            {itemCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full amber-gradient text-white text-xs font-bold flex items-center justify-center">
                {itemCount}
              </span>
            )}
          </button>

          {/* Mobile Only: Wishlist icon on right side of top bar */}
          <Link
            to="/wishlist"
            className="p-2 hover:bg-white/10 rounded-lg transition-colors md:hidden"
          >
            <Heart
              className={`w-5 h-5 ${
                location.pathname === "/wishlist" ? "text-amber-400" : "text-gray-300"
              }`}
            />
          </Link>
        </div>
      </div>
    </header>
  );
}
