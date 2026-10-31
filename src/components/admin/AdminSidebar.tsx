import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  Image as ImageIcon,
  Leaf,
  Menu,
  X,
  LogOut,
  MessageCircle,
  Settings,
  ExternalLink,
  ChevronRight,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const navItems = [
  { href: "/admin", label: "Dashboard", Icon: LayoutDashboard },
  { href: "/admin/orders", label: "Orders", Icon: ShoppingBag },
  { href: "/admin/products", label: "Products", Icon: Package },
  { href: "/admin/categories", label: "Categories", Icon: Leaf },
  { href: "/admin/gallery", label: "Gallery", Icon: ImageIcon },
  { href: "/admin/messages", label: "Messages", Icon: MessageCircle },
  { href: "/admin/settings", label: "Settings", Icon: Settings },
];

export default function AdminSidebar() {
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const isActive = (href: string) =>
    location.pathname === href || (href !== "/admin" && location.pathname.startsWith(href));

  const currentItem = navItems.find((item) => isActive(item.href)) || navItems[0];

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Brand Header */}
      <div className="p-5 border-b border-white/10">
        <div className="flex items-center justify-between">
          <Link to="/admin" onClick={() => setOpen(false)} className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-amber-500/10 flex items-center justify-center p-1.5 border border-amber-500/20 shadow-[0_0_20px_rgba(245,158,11,0.1)]">
              <img src="/logo.png" alt="Padpu Farms" className="w-full h-full object-contain" />
            </div>
            <div>
              <p className="text-sm font-display font-bold text-white tracking-wide">Padpu Farms</p>
              <span className="inline-block text-[10px] font-bold text-amber-400 uppercase tracking-widest mt-0.5">
                Admin Console
              </span>
            </div>
          </Link>
          <button
            onClick={() => setOpen(false)}
            className="lg:hidden p-1.5 rounded-xl text-stone-400 hover:text-white hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 p-3.5 space-y-1 overflow-y-auto">
        <p className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-stone-500">
          Management
        </p>
        {navItems.map(({ href, label, Icon }) => {
          const active = isActive(href);
          return (
            <Link
              key={href}
              to={href}
              onClick={() => setOpen(false)}
              className={`group flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                active
                  ? "bg-amber-500/15 text-amber-400 border border-amber-500/30 shadow-[0_0_20px_rgba(245,158,11,0.08)]"
                  : "text-stone-400 hover:text-white hover:bg-white/[0.04] border border-transparent"
              }`}
            >
              <span className="flex items-center gap-3">
                <Icon className={`w-4 h-4 shrink-0 ${active ? "text-amber-400" : "text-stone-400 group-hover:text-white"}`} />
                {label}
              </span>
              {active && <ChevronRight className="w-3.5 h-3.5 text-amber-400" />}
            </Link>
          );
        })}
      </nav>

      {/* Bottom Actions */}
      <div className="p-3.5 border-t border-white/10 space-y-2">
        <Link
          to="/"
          className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium text-stone-300 hover:text-amber-400 bg-white/[0.03] hover:bg-white/[0.06] border border-white/10 transition-all"
        >
          <span>View Storefront</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </Link>

        <div className="flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-white/[0.02] border border-white/5">
          <div className="min-w-0">
            <p className="text-xs font-semibold text-white truncate">{user?.name || "Administrator"}</p>
            <p className="text-[10px] text-stone-500 truncate">{user?.email || "Admin Access"}</p>
          </div>
          <button
            onClick={handleLogout}
            title="Logout"
            className="p-2 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-500/15 transition-colors shrink-0"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col fixed left-0 top-0 bottom-0 w-64 z-30 bg-[#070b06]/95 backdrop-blur-xl border-r border-white/10">
        <SidebarContent />
      </aside>

      {/* Mobile Top Bar */}
      <header className="lg:hidden sticky top-0 z-30 h-14 px-4 bg-[#070b06]/90 backdrop-blur-xl border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setOpen(true)}
            className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-amber-400"
          >
            <Menu className="w-4 h-4" />
          </button>
          <span className="font-display font-bold text-sm text-white">{currentItem.label}</span>
        </div>
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-[11px] font-semibold text-amber-400"
        >
          Store <ExternalLink className="w-3 h-3" />
        </Link>
      </header>

      {/* Mobile Drawer */}
      {open && (
        <>
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setOpen(false)}
          />
          <aside className="fixed left-0 top-0 bottom-0 w-64 z-50 flex flex-col lg:hidden bg-[#070b06] border-r border-white/10 shadow-2xl">
            <SidebarContent />
          </aside>
        </>
      )}
    </>
  );
}
