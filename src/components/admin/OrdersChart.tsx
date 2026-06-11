import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { ordersChartData } from '../../data/mockData';

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/5 border border-white/10 px-4 py-3 rounded-xl">
        <p className="text-amber-400 font-semibold text-sm mb-1">{label}</p>
        <p className="text-white text-sm">{payload[0].value} orders</p>
      </div>
    );
  }
  return null;
};

export default function OrdersChart() {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={ordersChartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(245,158,11,0.05)" />
        <XAxis
          dataKey="day"
          tick={{ fill: 'rgba(245,158,11,0.5)', fontSize: 11 }}
          axisLine={{ stroke: 'rgba(245,158,11,0.1)' }}
          tickLine={false}
        />
        <YAxis
          tick={{ fill: 'rgba(245,158,11,0.5)', fontSize: 11 }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(245,158,11,0.05)' }} />
        <Bar
          dataKey="orders"
          fill="url(#amberGradient)"
          radius={[6, 6, 0, 0]}
        />
        <defs>
          <linearGradient id="amberGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#fbbf24" />
            <stop offset="100%" stopColor="#d97706" />
          </linearGradient>
        </defs>
      </BarChart>
    </ResponsiveContainer>
  );
}
