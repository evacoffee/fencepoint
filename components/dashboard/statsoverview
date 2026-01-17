import React from 'react';
import { Card } from "@/components/ui/card";
import { Trophy, Target, TrendingUp, Swords } from "lucide-react";
import { motion } from "framer-motion";

export default function StatsOverview({ matches }) {
  const totalMatches = matches.length;
  const wins = matches.filter(m => m.result === 'win').length;
  const winRate = totalMatches > 0 ? Math.round((wins / totalMatches) * 100) : 0;
  
  const totalTouchesLanded = matches.reduce((sum, m) => sum + (m.your_score || 0), 0);
  const totalTouchesReceived = matches.reduce((sum, m) => sum + (m.opponent_score || 0), 0);
  const touchRatio = totalTouchesReceived > 0 ? (totalTouchesLanded / totalTouchesReceived).toFixed(2) : 0;

  // Calculate streak
  const sortedMatches = [...matches].sort((a, b) => new Date(b.date) - new Date(a.date));
  let currentStreak = 0;
  for (const match of sortedMatches) {
    if (match.result === 'win') currentStreak++;
    else break;
  }

  const stats = [
    {
      label: "Win Rate",
      value: `${winRate}%`,
      icon: Trophy,
      color: "text-amber-500",
      bg: "bg-amber-500/10"
    },
    {
      label: "Total Bouts",
      value: totalMatches,
      icon: Swords,
      color: "text-blue-500",
      bg: "bg-blue-500/10"
    },
    {
      label: "Touch Ratio",
      value: touchRatio,
      icon: Target,
      color: "text-emerald-500",
      bg: "bg-emerald-500/10"
    },
    {
      label: "Win Streak",
      value: currentStreak,
      icon: TrendingUp,
      color: "text-purple-500",
      bg: "bg-purple-500/10"
    }
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <Card className="p-5 bg-white border-0 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">{stat.label}</p>
                <p className="text-3xl font-bold text-slate-800 mt-1">{stat.value}</p>
              </div>
              <div className={`p-2.5 rounded-xl ${stat.bg}`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
            </div>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}