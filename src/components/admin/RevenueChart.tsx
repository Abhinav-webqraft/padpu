import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { revenueChartData } from '../../data/mockData';

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/5 border border-white/10 px-4 py-3 rounded-xl">
        <p className="text-amber-400 font-semibold text-sm mb-1">{label}</p>
        <p className="text-white text-sm">₹{payload[0].value.toLocaleString()}</p>
        <p className="text-white/50 text-xs">{payload[1]?.value} orders</p>
      </div>
    );
  }
  return null;
};

export default function RevenueChart() {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <LineChart data={revenueChartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(245,158,11,0.05)" />
        <XAxis
          dataKey="month"
          tick={{ fill: 'rgba(245,158,11,0.5)', fontSize: 11 }}
          axisLine={{ stroke: 'rgba(245,158,11,0.1)' }}
          tickLine={false}
        />
        <YAxis
          tick={{ fill: 'rgba(245,158,11,0.5)', fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          tickFormatter={v => `₹${(v / 1000).toFixed(0)}K`}
        />
        <Tooltip content={<CustomTooltip />} />
        <Line
          type="monotone"
          dataKey="revenue"
          stroke="#f59e0b"
          strokeWidth={2.5}
          dot={{ r: 4, fill: '#f59e0b', strokeWidth: 0 }}
          activeDot={{ r: 6, fill: '#fbbf24', strokeWidth: 0 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
