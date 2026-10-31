import { Link, useLocation } from 'react-router-dom';
import { Home, ShoppingBag, Package, Info, Phone, User } from 'lucide-react';
import { useOrders } from '../../context/OrderContext';

const navItems = [
  { href: '/', label: 'Home', Icon: Home },
  { href: '/shop', label: 'Shop', Icon: ShoppingBag },
  { href: '/orders', label: 'Orders', Icon: Package, badgeKey: 'orders' },
  { href: '/about', label: 'About', Icon: Info },
  { href: '/contact', label: 'Contact', Icon: Phone },
  { href: '/profile', label: 'Profile', Icon: User },
];

export default function BottomNav() {
  const location = useLocation();
  const { orderCount } = useOrders();

  if (location.pathname.startsWith('/admin')) return null;

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40">
      {/* Solid flat dark background matching admin style */}
      <div
        className="absolute inset-0 z-0 bg-[#0d0a05]/95 backdrop-blur-md border-t border-white/10"
      />
      {/* Horizontally scrollable content container */}
      <div className="relative z-[2] flex items-center justify-between sm:justify-around px-2 py-1.5 pb-safe overflow-x-auto no-scrollbar gap-1 min-w-full">
        {navItems.map(({ href, label, Icon, badgeKey }) => {
          const isActive = location.pathname === href || (href !== '/' && location.pathname.startsWith(href));
          return (
            <Link
              key={href}
              to={href}
              className="flex flex-col items-center justify-center shrink-0 min-w-[52px] max-w-[68px] px-1.5 py-1 rounded-xl transition-all duration-300 relative text-center"
            >
              {isActive && (
                <span
                  className="absolute inset-0 rounded-xl"
                  style={{
                    background: 'rgba(245,158,11,0.12)',
                    border: '1px solid rgba(245,158,11,0.2)',
                  }}
                />
              )}
              <div className="relative">
                <Icon
                  className={`w-5 h-5 transition-colors ${isActive ? 'text-amber-400' : 'text-gray-400'}`}
                />
                {badgeKey === 'orders' && orderCount > 0 && (
                  <span className="absolute -top-1.5 -right-2.5 min-w-[17px] h-[17px] px-1 rounded-full bg-red-600 text-white text-[10px] font-bold font-sans flex items-center justify-center shadow-lg shadow-red-500/50 animate-pulse border border-[#0d0a05]">
                    {orderCount > 99 ? '99+' : orderCount}
                  </span>
                )}
              </div>
              <span
                className={`text-[10px] font-medium tracking-tight mt-0.5 truncate transition-colors ${
                  isActive ? 'text-amber-400 font-semibold' : 'text-gray-400'
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

