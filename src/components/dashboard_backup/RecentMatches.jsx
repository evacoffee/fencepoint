import React from 'react';
import { Clock, CheckCircle, XCircle } from 'lucide-react';

const RecentMatches = () => {
  const matches = [
    { id: 1, opponent: 'Alex Johnson', date: '2023-06-15', score: '5-3', won: true },
    { id: 2, opponent: 'Maria Garcia', date: '2023-06-10', score: '4-5', won: false },
    { id: 3, opponent: 'John Smith', date: '2023-06-05', score: '5-2', won: true },
  ];

  return (
    <div className="bg-white rounded-lg p-4 shadow mb-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Recent Matches</h2>
        <button className="text-sm text-blue-600 hover:text-blue-800">View All</button>
      </div>
      <div className="space-y-3">
        {matches.map((match) => (
          <div key={match.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded">
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-full ${match.won ? 'bg-green-100' : 'bg-red-100'}`}>
                {match.won ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-600" />
                )}
              </div>
              <div>
                <p className="font-medium">{match.opponent}</p>
                <p className="text-sm text-gray-500 flex items-center">
                  <Clock className="h-3 w-3 mr-1" />
                  {new Date(match.date).toLocaleDateString()}
                </p>
              </div>
            </div>
            <span className={`px-2 py-1 rounded text-sm font-medium ${
              match.won ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              {match.score}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentMatches;
