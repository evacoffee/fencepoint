import React, { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, RefreshCw, CheckCircle, AlertTriangle } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { motion, AnimatePresence } from "framer-motion";

export default function AICoachTips({ matches }) {
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);

  const generateAnalysis = async () => {
    if (matches.length === 0) return;
    
    setLoading(true);
    
    const matchSummary = matches.slice(-10).map(m => ({
      result: m.result,
      weapon: m.weapon,
      score: `${m.your_score}-${m.opponent_score}`,
      touchesLanded: m.touches_landed,
      touchesReceived: m.touches_received,
      actionsUsed: m.actions_used,
      energyLevel: m.energy_level,
      focusLevel: m.focus_level,
      notes: m.notes
    }));

    const wins = matches.filter(m => m.result === 'win').length;
    const winRate = Math.round((wins / matches.length) * 100);

    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `You are an expert fencing coach analyzing a student's recent practice bouts. 
      
Here are their last ${matchSummary.length} matches:
${JSON.stringify(matchSummary, null, 2)}

Overall win rate: ${winRate}%
Total matches logged: ${matches.length}

Provide personalized coaching feedback including:
1. What they're doing well (be specific about techniques and patterns)
2. Areas that need improvement (with specific drills or exercises)
3. 3 actionable tips for their next practice session
4. Mental game advice based on their focus/energy patterns

Be encouraging but honest. Use fencing terminology appropriately.`,
      response_json_schema: {
        type: "object",
        properties: {
          strengths: {
            type: "array",
            items: { type: "string" },
            description: "List of things the fencer is doing well"
          },
          improvements: {
            type: "array",
            items: { type: "string" },
            description: "Areas needing improvement with specific advice"
          },
          tips: {
            type: "array",
            items: { type: "string" },
            description: "3 actionable tips for next practice"
          },
          mental_advice: {
            type: "string",
            description: "Mental game and focus advice"
          },
          overall_assessment: {
            type: "string",
            description: "Brief overall assessment"
          }
        }
      }
    });

    setAnalysis(result);
    setLoading(false);
  };

  if (matches.length === 0) {
    return (
      <Card className="p-6 bg-gradient-to-br from-slate-800 to-slate-900 border-0 shadow-lg">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-5 h-5 text-amber-400" />
          <h3 className="text-lg font-semibold text-white">AI Coach Analysis</h3>
        </div>
        <p className="text-slate-400 text-center py-8">
          Log at least one match to get personalized coaching tips
        </p>
      </Card>
    );
  }

  return (
    <Card className="p-6 bg-gradient-to-br from-slate-800 to-slate-900 border-0 shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-amber-400" />
          <h3 className="text-lg font-semibold text-white">AI Coach Analysis</h3>
        </div>
        <Button
          onClick={generateAnalysis}
          disabled={loading}
          size="sm"
          className="bg-amber-500 hover:bg-amber-600 text-slate-900"
        >
          {loading ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : (
            <>
              <Sparkles className="w-4 h-4 mr-1" />
              Analyze
            </>
          )}
        </Button>
      </div>

      <AnimatePresence mode="wait">
        {!analysis && !loading && (
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-slate-400 text-center py-8"
          >
            Click "Analyze" to get personalized coaching feedback
          </motion.p>
        )}

        {loading && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center py-8"
          >
            <RefreshCw className="w-8 h-8 text-amber-400 animate-spin mx-auto mb-2" />
            <p className="text-slate-400">Analyzing your matches...</p>
          </motion.div>
        )}

        {analysis && !loading && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-5"
          >
            <p className="text-slate-300 text-sm italic">{analysis.overall_assessment}</p>

            <div>
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                <span className="text-sm font-medium text-emerald-400">Strengths</span>
              </div>
              <ul className="space-y-1.5">
                {analysis.strengths?.map((s, i) => (
                  <li key={i} className="text-sm text-slate-300 pl-6">• {s}</li>
                ))}
              </ul>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                <span className="text-sm font-medium text-amber-400">Areas to Improve</span>
              </div>
              <ul className="space-y-1.5">
                {analysis.improvements?.map((s, i) => (
                  <li key={i} className="text-sm text-slate-300 pl-6">• {s}</li>
                ))}
              </ul>
            </div>

            <div className="bg-slate-700/50 rounded-xl p-4">
              <p className="text-sm font-medium text-white mb-2">💡 Tips for Next Practice</p>
              <ol className="space-y-1.5">
                {analysis.tips?.map((t, i) => (
                  <li key={i} className="text-sm text-slate-300">{i + 1}. {t}</li>
                ))}
              </ol>
            </div>

            <div className="bg-blue-500/10 rounded-xl p-4 border border-blue-500/20">
              <p className="text-sm font-medium text-blue-400 mb-1">🧠 Mental Game</p>
              <p className="text-sm text-slate-300">{analysis.mental_advice}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}