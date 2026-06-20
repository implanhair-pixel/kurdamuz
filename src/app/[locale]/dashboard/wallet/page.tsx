'use client';

import { redirect } from 'next/navigation';
import Link from 'next/link';
import { BookOpen, Wallet, TrendingUp, Gift, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import { useEffect, useState } from 'react';

const mockWalletData = {
  balance: 1240,
  totalEarned: 3850,
  totalSpent: 2610,
  transactions: [
    { id: 1, type: 'earn', title: 'Completed Lesson', amount: 50, date: '2026-06-17', icon: '📚' },
    { id: 2, type: 'spend', title: 'Premium Feature Unlock', amount: -100, date: '2026-06-16', icon: '🔓' },
    { id: 3, type: 'earn', title: 'Daily Challenge', amount: 75, date: '2026-06-16', icon: '🎯' },
    { id: 4, type: 'earn', title: 'Achievement Reward', amount: 200, date: '2026-06-15', icon: '🏆' },
    { id: 5, type: 'spend', title: 'Course Upgrade', amount: -150, date: '2026-06-14', icon: '📖' },
    { id: 6, type: 'earn', title: 'Streak Bonus', amount: 120, date: '2026-06-13', icon: '🔥' },
    { id: 7, type: 'earn', title: 'Quiz Perfect Score', amount: 80, date: '2026-06-12', icon: '💯' },
    { id: 8, type: 'spend', title: 'Theme Purchase', amount: -50, date: '2026-06-11', icon: '🎨' },
  ],
};

export default function WalletPage({ params }: { params: Promise<{ locale: string }> }) {
  const [locale, setLocale] = useState('');
  const [walletData, setWalletData] = useState(mockWalletData);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initPage = async () => {
      const p = await params;
      setLocale(p.locale);
    };
    initPage();
  }, [params]);

  useEffect(() => {
    const fetchWallet = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/wallet/balance');
        const data = await response.json();
        if (data.wallet) {
          setWalletData(data.wallet);
        }
      } catch (error) {
        console.error('Error fetching wallet:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchWallet();
  }, []);

  return (
    <div className="min-h-screen bg-[#0a1628] flex">
      {/* Sidebar */}
      <aside className="w-60 bg-[#0d1f38] border-r border-white/6 flex flex-col min-h-screen sticky top-0 shrink-0">
        <div className="p-5 border-b border-white/6">
          <Link href={`/${locale}`} className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-xl flex items-center justify-center">
              <BookOpen className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="text-sm font-bold text-white">KURDAMUZ</div>
              <div className="text-xs text-emerald-400">کوردآموز</div>
            </div>
          </Link>
        </div>
        <nav className="flex-1 p-3 space-y-0.5">
          {[
            { icon: '📊', label: 'Dashboard', href: `/${locale}/dashboard` },
            { icon: '📖', label: 'Learn', href: `/${locale}/dashboard/learning` },
            { icon: '🎓', label: 'Courses', href: `/${locale}/courses` },
            { icon: '🎯', label: 'Practice', href: `/${locale}/srs` },
            { icon: '👥', label: 'Community', href: `/${locale}/community` },
            { icon: '🏆', label: 'Leaderboard', href: `/${locale}/leaderboard` },
            { icon: '⭐', label: 'Achievements', href: `/${locale}/achievements` },
          ].map((item) => (
            <Link key={item.label} href={item.href} className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium transition-all text-slate-400 hover:text-white hover:bg-white/5`}>
              <span className="text-base">{item.icon}</span>{item.label}
            </Link>
          ))}
        </nav>
      </aside>

      <main className="flex-1 overflow-auto">
        {/* Header */}
        <div className="bg-[#0d1f38] border-b border-white/6 px-8 py-5 sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                <Wallet className="w-6 h-6 text-amber-400" />
                Coin Wallet
              </h1>
              <p className="text-slate-400 text-sm mt-1">Manage your coins and view transaction history.</p>
            </div>
          </div>
        </div>

        <div className="p-8">
          {/* Balance Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Current Balance */}
            <div className="bg-gradient-to-br from-amber-500/10 to-amber-500/5 border border-amber-500/20 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-slate-400 text-sm mb-2">Current Balance</p>
                  <div className="flex items-center gap-2">
                    <span className="text-4xl font-bold text-white">{walletData.balance.toLocaleString()}</span>
                    <span className="text-2xl">₵</span>
                  </div>
                </div>
                <Wallet className="w-10 h-10 text-amber-400 opacity-50" />
              </div>
              <p className="text-xs text-slate-400">Available coins</p>
            </div>

            {/* Total Earned */}
            <div className="bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 border border-emerald-500/20 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-slate-400 text-sm mb-2">Total Earned</p>
                  <div className="flex items-center gap-2">
                    <span className="text-4xl font-bold text-emerald-400">{walletData.totalEarned.toLocaleString()}</span>
                    <span className="text-2xl">₵</span>
                  </div>
                </div>
                <ArrowUpRight className="w-10 h-10 text-emerald-400 opacity-50" />
              </div>
              <p className="text-xs text-emerald-400">All time earnings</p>
            </div>

            {/* Total Spent */}
            <div className="bg-gradient-to-br from-red-500/10 to-red-500/5 border border-red-500/20 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-slate-400 text-sm mb-2">Total Spent</p>
                  <div className="flex items-center gap-2">
                    <span className="text-4xl font-bold text-red-400">{walletData.totalSpent.toLocaleString()}</span>
                    <span className="text-2xl">₵</span>
                  </div>
                </div>
                <ArrowDownLeft className="w-10 h-10 text-red-400 opacity-50" />
              </div>
              <p className="text-xs text-red-400">All time spending</p>
            </div>
          </div>

          {/* Transactions */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <h2 className="text-lg font-bold text-white mb-6">Transaction History</h2>
            <div className="space-y-3">
              {walletData.transactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className={`flex items-center justify-between p-4 rounded-xl border transition-all ${
                    transaction.type === 'earn'
                      ? 'bg-emerald-500/10 border-emerald-500/20'
                      : 'bg-red-500/10 border-red-500/20'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-xl ${
                      transaction.type === 'earn'
                        ? 'bg-emerald-500/20'
                        : 'bg-red-500/20'
                    }`}>
                      {transaction.icon}
                    </div>
                    <div>
                      <p className="text-white font-semibold">{transaction.title}</p>
                      <p className="text-xs text-slate-400">
                        {new Date(transaction.date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: '2-digit',
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-lg font-bold ${
                      transaction.type === 'earn'
                        ? 'text-emerald-400'
                        : 'text-red-400'
                    }`}>
                      {transaction.type === 'earn' ? '+' : ''}{transaction.amount}
                    </p>
                    <p className="text-xs text-slate-400">₵</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
