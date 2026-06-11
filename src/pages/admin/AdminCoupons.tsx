import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Tag, ToggleLeft, ToggleRight } from 'lucide-react';
import { coupons as initialCoupons } from '../../data/mockData';
import { Coupon } from '../../types';

export default function AdminCoupons() {
  const [coupons, setCoupons] = useState<Coupon[]>(initialCoupons);
  const [showForm, setShowForm] = useState(false);
  const [newCoupon, setNewCoupon] = useState({ code: '', type: 'percentage', value: '', minOrderValue: '', maxUses: '' });

  const toggleActive = (id: string) => {
    setCoupons(prev => prev.map(c => c.id === id ? { ...c, isActive: !c.isActive } : c));
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-bold text-2xl text-white">Coupons</h1>
          <p className="text-white/40 text-sm">{coupons.filter(c => c.isActive).length} active coupons</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-amber-950 text-sm amber-gradient hover:opacity-90"
        >
          <Plus className="w-4 h-4" /> Create Coupon
        </button>
      </div>

      {/* Create form */}
      {showForm && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/5 border border-white/10 rounded-2xl p-5"
        >
          <h3 className="font-display font-semibold text-white mb-4 flex items-center gap-2">
            <Tag className="w-4 h-4 text-amber-400" /> New Coupon
          </h3>
          <div className="grid sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs text-white/40 uppercase tracking-wide block mb-1.5">Coupon Code</label>
              <input
                type="text"
                placeholder="SUMMER20"
                className="input-dark text-sm uppercase"
                value={newCoupon.code}
                onChange={e => setNewCoupon(n => ({ ...n, code: e.target.value.toUpperCase() }))}
              />
            </div>
            <div>
              <label className="text-xs text-white/40 uppercase tracking-wide block mb-1.5">Discount Type</label>
              <select
                className="input-dark text-sm"
                value={newCoupon.type}
                onChange={e => setNewCoupon(n => ({ ...n, type: e.target.value }))}
              >
                <option value="percentage">Percentage (%)</option>
                <option value="flat">Flat Amount (₹)</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-white/40 uppercase tracking-wide block mb-1.5">Value</label>
              <input
                type="number"
                placeholder={newCoupon.type === 'percentage' ? '20' : '100'}
                className="input-dark text-sm"
                value={newCoupon.value}
                onChange={e => setNewCoupon(n => ({ ...n, value: e.target.value }))}
              />
            </div>
            <div>
              <label className="text-xs text-white/40 uppercase tracking-wide block mb-1.5">Min Order ₹</label>
              <input
                type="number"
                placeholder="500"
                className="input-dark text-sm"
                value={newCoupon.minOrderValue}
                onChange={e => setNewCoupon(n => ({ ...n, minOrderValue: e.target.value }))}
              />
            </div>
            <div>
              <label className="text-xs text-white/40 uppercase tracking-wide block mb-1.5">Max Uses</label>
              <input
                type="number"
                placeholder="100"
                className="input-dark text-sm"
                value={newCoupon.maxUses}
                onChange={e => setNewCoupon(n => ({ ...n, maxUses: e.target.value }))}
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={() => setShowForm(false)}
                className="w-full py-2.5 rounded-xl font-semibold text-amber-950 text-sm amber-gradient hover:opacity-90"
              >
                Create Coupon
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Coupons table */}
      <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="table-dark">
            <thead>
              <tr>
                <th>Code</th>
                <th>Type</th>
                <th>Value</th>
                <th>Min Order</th>
                <th>Usage</th>
                <th>Valid Until</th>
                <th>Status</th>
                <th>Toggle</th>
              </tr>
            </thead>
            <tbody>
              {coupons.map((coupon, i) => (
                <motion.tr
                  key={coupon.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <td className="font-mono font-bold text-amber-400">{coupon.code}</td>
                  <td className="capitalize">{coupon.type}</td>
                  <td className="text-white font-semibold">
                    {coupon.type === 'percentage' ? `${coupon.value}%` : `₹${coupon.value}`}
                  </td>
                  <td>₹{coupon.minOrderValue}</td>
                  <td>
                    <div className="text-white/60">{coupon.usedCount}/{coupon.maxUses}</div>
                    <div className="w-20 h-1 bg-white/10 rounded-full mt-1 overflow-hidden">
                      <div
                        className="h-full bg-amber-500 rounded-full"
                        style={{ width: `${Math.min(100, (coupon.usedCount / coupon.maxUses) * 100)}%` }}
                      />
                    </div>
                  </td>
                  <td>{new Date(coupon.validUntil).toLocaleDateString('en-IN')}</td>
                  <td>
                    <span className={`badge ${coupon.isActive ? 'text-green-400 bg-green-500/10' : 'text-red-400 bg-red-500/10'}`}>
                      {coupon.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>
                    <button
                      onClick={() => toggleActive(coupon.id)}
                      className="text-white/40 hover:text-amber-400 transition-colors"
                    >
                      {coupon.isActive
                        ? <ToggleRight className="w-5 h-5 text-green-400" />
                        : <ToggleLeft className="w-5 h-5" />
                      }
                    </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
