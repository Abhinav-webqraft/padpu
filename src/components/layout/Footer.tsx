import { Link } from "react-router-dom";
import { Leaf, Mail, Phone, MapPin, Instagram, Facebook, Twitter, Youtube } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="forest-bg text-white relative overflow-hidden hidden md:block">
      <div className="absolute inset-0 bg-honeycomb-pattern opacity-5 mix-blend-overlay"></div>
      <div className="absolute top-0 w-full h-px amber-gradient opacity-30"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8 mb-12">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <img src="/logo.png" alt="Padpu Farms" className="h-16 w-auto object-contain" />
            </div>
            <p className="text-gray-400 text-sm leading-relaxed max-w-sm mb-6">
              Pure, raw, farm-sourced honey straight to your doorstep. Crafted with traditional methods and deep respect for nature.
            </p>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 rounded-full glass flex items-center justify-center text-amber-200 hover:text-white hover:border-amber-400/50 transition-all">
                <Instagram className="w-4 h-4" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full glass flex items-center justify-center text-amber-200 hover:text-white hover:border-amber-400/50 transition-all">
                <Facebook className="w-4 h-4" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full glass flex items-center justify-center text-amber-200 hover:text-white hover:border-amber-400/50 transition-all">
                <Twitter className="w-4 h-4" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full glass flex items-center justify-center text-amber-200 hover:text-white hover:border-amber-400/50 transition-all">
                <Youtube className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-semibold text-amber-100 mb-4">Quick Links</h4>
            <ul className="space-y-3 text-gray-400 text-sm">
              <li><Link to="/shop" className="hover:text-amber-300 transition-colors">Shop All</Link></li>
              <li><Link to="/about" className="hover:text-amber-300 transition-colors">Our Story</Link></li>
              <li><Link to="/gallery" className="hover:text-amber-300 transition-colors">Farm Gallery</Link></li>
              <li><Link to="/contact" className="hover:text-amber-300 transition-colors">Contact Us</Link></li>
            </ul>
          </div>

          {/* Info */}
          <div>
            <h4 className="font-semibold text-amber-100 mb-4">Customer Care</h4>
            <ul className="space-y-3 text-gray-400 text-sm">
              <li><Link to="/privacy" className="hover:text-amber-300 transition-colors">Privacy Policy</Link></li>
              <li><Link to="/terms" className="hover:text-amber-300 transition-colors">Terms of Service</Link></li>
              <li><Link to="/shipping" className="hover:text-amber-300 transition-colors">Shipping Info</Link></li>
              <li><Link to="/faq" className="hover:text-amber-300 transition-colors">FAQs</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold text-amber-100 mb-4">Contact Us</h4>
            <div className="space-y-3 text-gray-400 text-sm">
              <div className="flex gap-3 items-start">
                <Phone className="w-4 h-4 flex-shrink-0 mt-1 text-amber-500" />
                <a href="tel:+919876543210" className="hover:text-amber-300 transition-colors">+91 98765 43210</a>
              </div>
              <div className="flex gap-3 items-start">
                <Mail className="w-4 h-4 flex-shrink-0 mt-1 text-amber-500" />
                <a href="mailto:hello@padpufarms.com" className="hover:text-amber-300 transition-colors">hello@padpufarms.com</a>
              </div>
              <div className="flex gap-3 items-start">
                <MapPin className="w-4 h-4 flex-shrink-0 mt-1 text-amber-500" />
                <span>Solan Valley,<br/>Himachal Pradesh, India</span>
              </div>
            </div>
          </div>
        </div>

        {/* Newsletter */}
        <div className="border-t border-amber-500/10 py-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h4 className="font-semibold text-amber-100 mb-2">Subscribe to our newsletter</h4>
            <p className="text-gray-400 text-sm">Get 10% off your first order and stay updated on fresh harvests.</p>
          </div>
          <div className="flex w-full md:w-auto max-w-md">
            <input 
              type="email" 
              placeholder="Your email address" 
              className="bg-white/5 border border-amber-500/20 rounded-l-lg px-4 py-3 w-full outline-none focus:border-amber-500 text-sm"
            />
            <button className="amber-gradient text-stone-900 font-semibold px-6 py-3 rounded-r-lg hover:opacity-90 transition-opacity whitespace-nowrap">
              Subscribe
            </button>
          </div>
        </div>

        <div className="border-t border-amber-500/10 pt-8 text-center text-gray-500 text-sm flex flex-col md:flex-row justify-between items-center gap-4">
          <p>&copy; {currentYear} Padpu Farms. All rights reserved.</p>
          <div className="flex gap-4">
            <span>100% Pure Natural Honey</span>
            <span className="w-1 h-1 rounded-full bg-amber-500/50 my-auto"></span>
            <span>Directly from Farms</span>
          </div>
        </div>

        {/* Developed by section */}
        <div className="border-t border-white/5 mt-6 pt-6 flex flex-col items-center justify-center gap-3">
          <p className="text-xs text-gray-600 uppercase tracking-widest font-medium">Designed & Developed by</p>
          <a href="#" className="opacity-70 hover:opacity-100 transition-opacity">
            <img
              src="/webqraft-logo.png"
              alt="WebQraft Solutions"
              className="h-8 w-auto object-contain"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                e.currentTarget.nextElementSibling!.classList.remove('hidden');
              }}
            />
            <span className="hidden text-sm text-gray-400 font-semibold">WebQraft Solutions</span>
          </a>
        </div>
      </div>
    </footer>
  );
}
