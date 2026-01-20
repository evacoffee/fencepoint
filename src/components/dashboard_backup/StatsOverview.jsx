import React from 'react';
import { Trophy, Swords, Target, TrendingUp } from 'lucide-react';

const StatsOverview = () => {
  const stats = [
    {
      label: "Win Rate",
      value: "60%",
      icon: Trophy,
      color: "text-amber-500",
      bg: "bg-amber-500/10"
    },
    {
      label: "Total Bouts",
      value: "5",
      icon: Swords,
      color: "text-blue-500",
      bg: "bg-blue-500/10"
    },
    {
      label: "Touch Ratio",
      value: "1.10",
      icon: TrendingUp,
      color: "text-green-500",
      bg: "bg-green-500/10"
    },
    {
      label: "Win Streak",
      value: "1",
      icon: TrendingUp,
      color: "text-purple-500",
      bg: "bg-purple-500/10"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <div key={index} className="bg-white rounded-lg p-4 shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">{stat.label}</p>
                <p className="text-2xl font-bold">{stat.value}</p>
              </div>
              <div className={`p-3 rounded-full ${stat.bg} ${stat.color}`}>
                <Icon className="h-5 w-5" />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default StatsOverview;
