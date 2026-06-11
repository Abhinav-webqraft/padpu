import { Link, useLocation } from 'react-router-dom';
import { Home, ShoppingBag, Info, Phone, User } from 'lucide-react';

const navItems = [
  { href: '/', label: 'Home', Icon: Home },
  { href: '/shop', label: 'Shop', Icon: ShoppingBag },
  { href: '/about', label: 'About', Icon: Info },
  { href: '/contact', label: 'Contact', Icon: Phone },
  { href: '/profile', label: 'Profile', Icon: User },
];

export default function BottomNav() {
  const location = useLocation();

  if (location.pathname.startsWith('/admin')) return null;

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 overflow-hidden">
      {/* Solid flat dark background matching admin style */}
      <div
        className="absolute inset-0 z-0 bg-[#0d0a05] border-t border-white/10"
      />
      {/* Content */}
      <div className="relative z-[2] flex items-center justify-around px-2 py-2 pb-safe">
        {navItems.map(({ href, label, Icon }) => {
          const isActive = location.pathname === href || (href !== '/' && location.pathname.startsWith(href));
          return (
            <Link
              key={href}
              to={href}
              className="flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-2xl transition-all duration-300 relative"
            >
              {isActive && (
                <span
                  className="absolute inset-0 rounded-2xl"
                  style={{
                    background: 'rgba(245,158,11,0.12)',
                    border: '1px solid rgba(245,158,11,0.2)',
                  }}
                />
              )}
              <Icon
                className={`w-5 h-5 transition-colors ${isActive ? 'text-amber-400' : 'text-gray-500'}`}
              />
              <span
                className={`text-[10px] font-medium tracking-wide transition-colors ${
                  isActive ? 'text-amber-400' : 'text-gray-500'
                }`}
              >
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
