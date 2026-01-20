import React from 'react';

const TargetZoneAnalysis = () => {
  const zones = [
    { name: 'Head', landed: 16, received: 13, color: 'bg-blue-600' },
    { name: 'Torso', landed: 24, received: 18, color: 'bg-green-500' },
    { name: 'Left Arm', landed: 12, received: 15, color: 'bg-yellow-500' },
    { name: 'Right Arm', landed: 18, received: 20, color: 'bg-red-500' },
  ];

  return (
    <div className="bg-white rounded-lg p-4 shadow mb-6">
      <h2 className="text-lg font-semibold mb-4">Target Zone Analysis</h2>
      <div className="space-y-4">
        {zones.map((zone, index) => {
          const percentage = Math.round((zone.landed / (zone.landed + zone.received)) * 100) || 0;
          return (
            <div key={index}>
              <div className="flex justify-between mb-1">
                <span>{zone.name}</span>
                <span className="text-sm text-gray-500">{zone.landed} / {zone.received}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div 
                  className={`h-2.5 rounded-full ${zone.color}`} 
                  style={{ width: `${percentage}%` }}
                ></div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TargetZoneAnalysis;
