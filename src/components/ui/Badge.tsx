interface BadgeProps {
  children: React.ReactNode;
  variant?: 'amber' | 'green' | 'red' | 'gray' | 'purple';
  size?: 'sm' | 'md';
}

const variants = {
  amber: 'bg-amber-100 text-amber-800 border border-amber-200',
  green: 'bg-green-100 text-green-800 border border-green-200',
  red: 'bg-red-100 text-red-800 border border-red-200',
  gray: 'bg-gray-100 text-gray-700 border border-gray-200',
  purple: 'bg-purple-100 text-purple-800 border border-purple-200',
};

export default function Badge({ children, variant = 'amber', size = 'sm' }: BadgeProps) {
  return (
    <span className={`inline-flex items-center rounded-full font-semibold tracking-wide uppercase ${
      size === 'sm' ? 'text-[10px] px-2.5 py-0.5' : 'text-xs px-3 py-1'
    } ${variants[variant]}`}>
      {children}
    </span>
  );
}
