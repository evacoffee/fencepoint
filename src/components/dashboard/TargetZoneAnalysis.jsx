import React from 'react';
import { Card } from "@/components/ui/card";

export default function TargetZoneAnalysis({ matches }) {
  const zones = ['head', 'torso', 'arm', 'leg'];
  
  const touchesLanded = zones.reduce((acc, zone) => {
    acc[zone] = matches.reduce((sum, m) => sum + (m.touches_landed?.[zone] || 0), 0);
    return acc;
  }, {});
  
  const touchesReceived = zones.reduce((acc, zone) => {
    acc[zone] = matches.reduce((sum, m) => sum + (m.touches_received?.[zone] || 0), 0);
    return acc;
  }, {});

  const totalLanded = Object.values(touchesLanded).reduce((a, b) => a + b, 0);
  const totalReceived = Object.values(touchesReceived).reduce((a, b) => a + b, 0);

  const zoneLabels = {
    head: { label: 'Head', color: 'bg-amber-500' },
    torso: { label: 'Torso', color: 'bg-blue-500' },
    arm: { label: 'Arm', color: 'bg-emerald-500' },
    leg: { label: 'Leg', color: 'bg-purple-500' }
  };

  return (
    <Card className="p-6 bg-white border-0 shadow-sm">
      <h3 className="text-lg font-semibold text-slate-800 mb-4">Target Zone Analysis</h3>
      
      <div className="grid grid-cols-2 gap-6">
        <div>
          <p className="text-sm font-medium text-emerald-600 mb-3">Touches Landed</p>
          <div className="space-y-3">
            {zones.map(zone => {
              const percentage = totalLanded > 0 ? (touchesLanded[zone] / totalLanded) * 100 : 0;
              return (
                <div key={zone}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-600">{zoneLabels[zone].label}</span>
                    <span className="font-medium text-slate-800">{touchesLanded[zone]}</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${zoneLabels[zone].color} rounded-full transition-all duration-500`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div>
          <p className="text-sm font-medium text-red-500 mb-3">Touches Received</p>
          <div className="space-y-3">
            {zones.map(zone => {
              const percentage = totalReceived > 0 ? (touchesReceived[zone] / totalReceived) * 100 : 0;
              return (
                <div key={zone}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-600">{zoneLabels[zone].label}</span>
                    <span className="font-medium text-slate-800">{touchesReceived[zone]}</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className={`h-full bg-red-400 rounded-full transition-all duration-500`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </Card>
  );
}