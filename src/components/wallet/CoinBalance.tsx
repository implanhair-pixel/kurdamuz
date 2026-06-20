import { Coins } from 'lucide-react';

interface CoinBalanceProps {
  balance: number;
  showIcon?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export function CoinBalance({ balance, showIcon = true, size = 'md' }: CoinBalanceProps) {
  const sizeClasses = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-4xl',
    xl: 'text-6xl',
  };

  const iconSizes = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
    xl: 'h-8 w-8',
  };

  return (
    <div className="flex items-center gap-2">
      {showIcon && <Coins className={`${iconSizes[size]} text-yellow-500`} />}
      <span className={`font-bold ${sizeClasses[size]}`}>
        {balance.toLocaleString()}
      </span>
    </div>
  );
}
