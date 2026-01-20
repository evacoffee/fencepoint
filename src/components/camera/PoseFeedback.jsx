import React, { useState, useEffect } from 'react';
import { CheckCircle, AlertCircle, Info, Swords, Zap, Shield } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const FENCING_WEAPONS = {
  FOIL: {
    name: 'Foil',
    icon: <Swords className="w-4 h-4" />,
    target: 'Torso only',
    color: 'text-blue-400'
  },
  EPEE: {
    name: 'Épée',
    icon: <Zap className="w-4 h-4" />,
    target: 'Entire body',
    color: 'text-green-400'
  },
  SABRE: {
    name: 'Sabre',
    icon: <Shield className="w-4 h-4" />,
    target: 'Waist up',
    color: 'text-yellow-400'
  }
};

const feedbackIcons = {
  high: <AlertCircle className="w-5 h-5 text-red-500" />,
  medium: <Info className="w-5 h-5 text-yellow-500" />,
  low: <CheckCircle className="w-5 h-5 text-green-500" />
};

const PoseFeedback = ({ feedback, score, isVisible, onWeaponChange, currentWeapon = 'FOIL' }) => {
  const [showWeaponInfo, setShowWeaponInfo] = useState(false);
  
  if (!isVisible) return null;

  const scoreColor = score >= 80 ? 'text-green-500' : 
                    score >= 60 ? 'text-yellow-500' : 'text-red-500';
                    
  const weapon = FENCING_WEAPONS[currentWeapon] || FENCING_WEAPONS.FOIL;

  return (
    <div className="absolute bottom-4 right-4 w-80 bg-gray-900/90 backdrop-blur-sm rounded-lg p-4 text-white shadow-xl border border-gray-700">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="font-semibold text-lg">AI Coach</h3>
          <div className="relative flex items-center mt-1">
            <select
              value={currentWeapon}
              onChange={(e) => onWeaponChange(e.target.value)}
              className="text-xs bg-gray-800 text-white border border-gray-600 rounded pl-2 pr-6 py-1 appearance-none"
            >
              {Object.entries(FENCING_WEAPONS).map(([key, { name }]) => (
                <option key={key} value={key}>
                  {name}
                </option>
              ))}
            </select>
            <div className="absolute right-2 pointer-events-none">
              {weapon.icon}
            </div>
          </div>
        </div>
        <div className={`text-2xl font-bold ${scoreColor}`}>
          {Math.round(score)}%
        </div>
      </div>
      
      <div className="text-xs text-gray-400 mb-3 flex items-center">
        <span className="inline-flex items-center mr-2">
          <span className="w-2 h-2 rounded-full bg-blue-500 mr-1"></span>
          {weapon.target}
        </span>
        <button 
          onClick={() => setShowWeaponInfo(!showWeaponInfo)}
          className="text-blue-400 hover:underline text-xs"
        >
          {showWeaponInfo ? 'Hide info' : 'Show weapon info'}
        </button>
      </div>
      
      {showWeaponInfo && (
        <div className="bg-gray-800/50 p-2 rounded text-xs mb-3 text-gray-300">
          <p className="font-medium">{weapon.name} Rules:</p>
          <ul className="list-disc pl-4 mt-1 space-y-1">
            {currentWeapon === 'FOIL' && (
              <>
                <li>Target: Torso only (including back, not arms)</li>
                <li>Right of way rules apply</li>
                <li>Light thrusting weapon</li>
              </>
            )}
            {currentWeapon === 'EPEE' && (
              <>
                <li>Target: Entire body</li>
                <li>First touch scores</li>
                <li>Heavier thrusting weapon</li>
              </>
            )}
            {currentWeapon === 'SABRE' && (
              <>
                <li>Target: Waist up (except hands)</li>
                <li>Right of way rules apply</li>
                <li>Cutting and thrusting weapon</li>
              </>
            )}
          </ul>
        </div>
      )}
      
      <div className="w-full bg-gray-700 rounded-full h-2.5 mb-4">
        <div 
          className="bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 h-2.5 rounded-full" 
          style={{ width: `${score}%` }}
        />
      </div>

      <div className="space-y-3">
        <AnimatePresence>
          {feedback.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="flex items-start gap-3 p-2 bg-gray-800/50 rounded-md"
            >
              <div className="pt-0.5">
                {feedbackIcons[item.priority] || feedbackIcons.medium}
              </div>
              <div>
                <p className="font-medium text-sm">{item.message}</p>
                {item.tip && (
                  <p className="text-xs text-gray-300 mt-1">
                    <span className="font-medium">Tip:</span> {item.tip}
                  </p>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
      
      <div className="mt-3 pt-3 border-t border-gray-700 text-xs text-gray-400">
        <div className="flex items-center justify-between">
          <span>Keep it up!</span>
          <span className="flex items-center">
            <RotateCw className="w-3 h-3 mr-1" />
            Real-time analysis active
          </span>
        </div>
      </div>
    </div>
  );
};

export default PoseFeedback;
