import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Mail, Phone, MapPin, Instagram, Facebook, Youtube } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const [settings, setSettings] = useState({
    phone: '+91 98765 43210',
    email: 'hello@padpufarms.com',
    address: 'Dakshina Kannada, Karnataka'
  });

  useEffect(() => {
    fetch('http://localhost:5000/api/admin/settings')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data) {
          setSettings({
            phone: data.data.phone || '+91 98765 43210',
            email: data.data.email || 'hello@padpufarms.com',
            address: data.data.address || 'Dakshina Kannada, Karnataka'
          });
        }
      })
      .catch(() => {});
  }, []);

  return (
    <footer className="bg-[#0d0a05] text-white border-t border-white/10 hidden md:block">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <img src="/logo.png" alt="Padpu Farms" className="h-12 w-auto object-contain mb-3" />
            <p className="text-stone-400 text-xs leading-relaxed max-w-xs mb-4 font-light">
              100% pure, natural honey harvested sustainably from the Western Ghats since 1983.
            </p>
            <div className="flex gap-2.5">
              {[Instagram, Facebook, Youtube].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="w-8 h-8 rounded-xl bg-white/[0.04] border border-white/10 flex items-center justify-center text-stone-400 hover:text-amber-400 hover:border-amber-500/30 transition-all"
                >
                  <Icon className="w-3.5 h-3.5" />
                </a>
              ))}
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-stone-400 mb-3">Explore</h4>
            <ul className="space-y-2 text-stone-400 text-xs">
              <li><Link to="/shop" className="hover:text-amber-400 transition-colors">Shop Honey</Link></li>
              <li><Link to="/about" className="hover:text-amber-400 transition-colors">Our Story</Link></li>
              <li><Link to="/gallery" className="hover:text-amber-400 transition-colors">Farm Gallery</Link></li>
              <li><Link to="/contact" className="hover:text-amber-400 transition-colors">Contact</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-stone-400 mb-3">Contact</h4>
            <div className="space-y-2.5 text-stone-400 text-xs">
              <div className="flex gap-2.5 items-center">
                <Phone className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <a href={`tel:${settings.phone.replace(/\D/g, '')}`} className="hover:text-amber-400 transition-colors">{settings.phone}</a>
              </div>
              <div className="flex gap-2.5 items-center">
                <Mail className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <a href={`mailto:${settings.email}`} className="hover:text-amber-400 transition-colors">{settings.email}</a>
              </div>
              <div className="flex gap-2.5 items-start">
                <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                <span className="leading-snug">{settings.address}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-white/5 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-stone-500">
          <p>&copy; {currentYear} Padpu Farms. All rights reserved.</p>
          <div className="flex items-center gap-3">
            <span>Pure Natural Honey</span>
            <span className="w-1 h-1 rounded-full bg-amber-500/40" />
            <span>Western Ghats Origin</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
