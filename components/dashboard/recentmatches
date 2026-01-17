import React from 'react';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format, parseISO } from 'date-fns';
import { motion } from "framer-motion";

const weaponEmoji = {
  foil: '🤺',
  epee: '⚔️',
  sabre: '🗡️'
};

export default function RecentMatches({ matches }) {
  const recentMatches = [...matches]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5);

  if (recentMatches.length === 0) {
    return (
      <Card className="p-6 bg-white border-0 shadow-sm">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">Recent Bouts</h3>
        <div className="text-center py-8 text-slate-400">
          No matches logged yet. Start tracking your bouts!
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 bg-white border-0 shadow-sm">
      <h3 className="text-lg font-semibold text-slate-800 mb-4">Recent Bouts</h3>
      <div className="space-y-3">
        {recentMatches.map((match, index) => (
          <motion.div
            key={match.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors"
          >
            <div className="flex items-center gap-3">
              <span className="text-xl">{weaponEmoji[match.weapon]}</span>
              <div>
                <p className="font-medium text-slate-800">vs {match.opponent_name}</p>
                <p className="text-xs text-slate-400">
                  {format(parseISO(match.date), 'MMM d, yyyy')}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="font-mono font-semibold text-slate-600">
                {match.your_score} - {match.opponent_score}
              </span>
              <Badge 
                className={
                  match.result === 'win' 
                    ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100' 
                    : match.result === 'loss'
                    ? 'bg-red-100 text-red-700 hover:bg-red-100'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-100'
                }
              >
                {match.result.toUpperCase()}
              </Badge>
            </div>
          </motion.div>
        ))}
      </div>
    </Card>
  );
}