import React from 'react';
import { Card } from "@/components/ui/card";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { format, parseISO } from 'date-fns';

export default function PerformanceChart({ matches }) {
  const sortedMatches = [...matches]
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .slice(-20);

  const chartData = sortedMatches.map((match, index) => {
    const recentMatches = sortedMatches.slice(0, index + 1).slice(-5);
    const winRate = Math.round(
      (recentMatches.filter(m => m.result === 'win').length / recentMatches.length) * 100
    );
    
    return {
      date: match.date,
      winRate,
      touchDiff: match.your_score - match.opponent_score,
      displayDate: format(parseISO(match.date), 'MMM d')
    };
  });

  if (chartData.length === 0) {
    return (
      <Card className="p-6 bg-white border-0 shadow-sm">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">Performance Trend</h3>
        <div className="h-48 flex items-center justify-center text-slate-400">
          Log some matches to see your performance trend
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 bg-white border-0 shadow-sm">
      <h3 className="text-lg font-semibold text-slate-800 mb-4">Performance Trend</h3>
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="winRateGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#1e3a5f" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#1e3a5f" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <XAxis 
              dataKey="displayDate" 
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#94a3b8', fontSize: 12 }}
            />
            <YAxis 
              domain={[0, 100]}
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#94a3b8', fontSize: 12 }}
              tickFormatter={(value) => `${value}%`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1e293b',
                border: 'none',
                borderRadius: '8px',
                color: '#fff'
              }}
              formatter={(value) => [`${value}%`, 'Win Rate']}
            />
            <Area
              type="monotone"
              dataKey="winRate"
              stroke="#1e3a5f"
              strokeWidth={2}
              fill="url(#winRateGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}