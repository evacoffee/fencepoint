import React from 'react';
import { Sparkles } from 'lucide-react';

const AICoachTips = () => {
  const tips = [
    "Your parry-riposte timing could be 0.2s faster.",
    "Try varying your attack patterns more to keep opponents guessing.",
    "Your lunge recovery has improved by 12% this week!"
  ];

  return (
    <div className="bg-gray-900 text-white p-6 rounded-lg shadow">
      <div className="flex items-center mb-4">
        <Sparkles className="h-5 w-5 text-yellow-400 mr-2" />
        <h2 className="text-lg font-semibold">AI Coach Analysis</h2>
      </div>
      <p className="text-gray-300 mb-4">
        Here are some personalized tips to improve your fencing:
      </p>
      <ul className="space-y-3 mb-6">
        {tips.map((tip, index) => (
          <li key={index} className="flex items-start">
            <span className="text-yellow-400 mr-2">•</span>
            <span className="text-sm">{tip}</span>
          </li>
        ))}
      </ul>
      <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded flex items-center justify-center">
        <Sparkles className="h-4 w-4 mr-2" />
        Get More Insights
      </button>
    </div>
  );
};

export default AICoachTips;
