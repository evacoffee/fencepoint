// components/camera/PoseVisualization.jsx
import React, { useRef, useEffect, useMemo } from 'react';
import { getKeypoint } from '../../utils/poseAnalysis';
import { motion } from 'framer-motion';

// Color scheme
const COLORS = {
  NAVY: {
    900: '#0F172A',
    800: '#1E293B',
    700: '#334155',
    600: '#475569',
  },
  GOLD: {
    500: '#D4AF37',
    400: '#E6C567',
    300: '#F0D78C',
  },
  WHITE: '#FFFFFF',
  HIGHLIGHT: '#0b84f5ff',
};

// Keypoint connections for drawing skeleton
const CONNECTIONS = [
  // Torso
  ['LEFT_SHOULDER', 'RIGHT_SHOULDER'],
  ['LEFT_SHOULDER', 'LEFT_HIP'],
  ['RIGHT_SHOULDER', 'RIGHT_HIP'],
  ['LEFT_HIP', 'RIGHT_HIP'],
  // Left arm
  ['LEFT_SHOULDER', 'LEFT_ELBOW'],
  ['LEFT_ELBOW', 'LEFT_WRIST'],
  // Right arm
  ['RIGHT_SHOULDER', 'RIGHT_ELBOW'],
  ['RIGHT_ELBOW', 'RIGHT_WRIST'],
  // Left leg
  ['LEFT_HIP', 'LEFT_KNEE'],
  ['LEFT_KNEE', 'LEFT_ANKLE'],
  // Right leg
  ['RIGHT_HIP', 'RIGHT_KNEE'],
  ['RIGHT_KNEE', 'RIGHT_ANKLE'],
];

const PoseVisualization = ({ pose, analysis, width = 640, height = 480, feedback = null }) => {
  const canvasRef = useRef(null);
  
  // Memoize the feedback to prevent unnecessary re-renders
  const feedbackItems = useMemo(() => {
    if (!feedback?.feedback?.length) return [];
    return feedback.feedback
      .filter(item => item.priority === 'high' || item.priority === 'medium')
      .slice(0, 3); // Show max 3 feedback items
  }, [feedback]);

  useEffect(() => {
    if (!pose || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw feedback highlights
    if (analysis?.details) {
      // Example: Highlight knees if knee angle needs adjustment
      if (analysis.details.kneeAngle?.score < 0.7) {
        const knee = getKeypoint(pose, 'LEFT_KNEE') || getKeypoint(pose, 'RIGHT_KNEE');
        if (knee) {
          ctx.beginPath();
          ctx.arc(knee.x, knee.y, 20, 0, 2 * Math.PI);
          ctx.fillStyle = 'rgba(255, 165, 0, 0.3)';
          ctx.fill();
        }
      }
      
      // Add more visual feedback based on analysis
      // ...
    }

    // Draw keypoints
    if (pose.keypoints) {
      // Draw connections first (skeleton)
      CONNECTIONS.forEach(([start, end]) => {
        const startKp = getKeypoint(pose, start);
        const endKp = getKeypoint(pose, end);

        if (startKp && endKp) {
          ctx.beginPath();
          ctx.moveTo(startKp.x, startKp.y);
          ctx.lineTo(endKp.x, endKp.y);
          ctx.lineWidth = 4;
          ctx.strokeStyle = COLORS.GOLD[500];
          ctx.stroke();
        }
      });

      // Draw keypoints
      pose.keypoints.forEach(kp => {
        if (kp.score > 0.3) {
          const isWeaponArm = 
            (kp.part === 'rightWrist' || kp.part === 'rightElbow') ||
            (kp.part === 'leftWrist' || kp.part === 'leftElbow' && analysis?.extension > 0.7);
          
          // Draw keypoint
          ctx.beginPath();
          ctx.arc(kp.x, kp.y, 6, 0, 2 * Math.PI);
          ctx.fillStyle = isWeaponArm ? COLORS.HIGHLIGHT : COLORS.GOLD[400];
          ctx.fill();
          ctx.strokeStyle = COLORS.NAVY[900];
          ctx.lineWidth = 2;
          ctx.stroke();
        }
      });

      // Draw balance indicator
      if (analysis?.balance !== undefined) {
        const balanceX = width - 30;
        const balanceY = height / 2;
        const balanceHeight = 100;
        
        // Background
        ctx.fillStyle = COLORS.NAVY[600];
        ctx.fillRect(balanceX - 10, balanceY - balanceHeight/2, 20, balanceHeight);
        
        // Balance indicator
        const indicatorY = balanceY + (0.5 - analysis.balance) * balanceHeight;
        ctx.fillStyle = COLORS.GOLD[500];
        ctx.fillRect(balanceX - 8, Math.min(balanceY + balanceHeight/2, indicatorY), 16, Math.abs(indicatorY - balanceY));
        
        // Center line
        ctx.strokeStyle = COLORS.WHITE;
        ctx.setLineDash([2, 2]);
        ctx.beginPath();
        ctx.moveTo(balanceX - 15, balanceY);
        ctx.lineTo(balanceX + 15, balanceY);
        ctx.stroke();
        ctx.setLineDash([]);
      }
    }

    // Draw analysis results
    if (analysis) {
      // Draw extension meter
      if (analysis.extension !== undefined) {
        const extensionX = 20;
        const extensionY = height - 30;
        const extensionWidth = 200;
        
        // Background
        ctx.fillStyle = COLORS.NAVY[600];
        ctx.fillRect(extensionX, extensionY - 10, extensionWidth, 10);
        
        // Extension level
        ctx.fillStyle = analysis.extension > 0.7 ? COLORS.GOLD[500] : COLORS.HIGHLIGHT;
        ctx.fillRect(extensionX, extensionY - 10, extensionWidth * analysis.extension, 10);
        
        // Text
        ctx.fillStyle = COLORS.WHITE;
        ctx.font = '12px Arial';
        ctx.fillText(`Extension: ${Math.round(analysis.extension * 100)}%`, extensionX, extensionY - 15);
      }

      // Draw suggestions
      if (analysis.suggestions?.length > 0) {
        ctx.fillStyle = `${COLORS.NAVY[800]}CC`;
        const suggestionHeight = 30;
        const startY = 20;
        
        analysis.suggestions.forEach((suggestion, index) => {
          const y = startY + (index * (suggestionHeight + 5));
          const textWidth = ctx.measureText(suggestion).width;
          
          // Background
          ctx.fillRect(10, y - 15, textWidth + 20, suggestionHeight);
          
          // Text
          ctx.fillStyle = COLORS.WHITE;
          ctx.font = '14px Arial';
          ctx.fillText(suggestion, 20, y);
          ctx.fillStyle = `${COLORS.NAVY[800]}CC`;
        });
      }
    }
  }, [pose, analysis, width, height]);

  return (
    <div className="relative w-full h-full">
      <canvas ref={canvasRef} width={width} height={height} className="absolute top-0 left-0 w-full h-full" />
      
      {/* Feedback indicators */}
      {feedbackItems.length > 0 && (
        <div className="absolute bottom-4 left-4 right-4 flex flex-wrap gap-2 justify-center">
          {feedbackItems.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`px-3 py-2 rounded-full text-sm font-medium flex items-center gap-2 ${
                item.priority === 'high' 
                  ? 'bg-red-500/90 text-white' 
                  : 'bg-yellow-500/90 text-gray-900'
              }`}
            >
              {item.priority === 'high' ? (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
              {item.message}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default React.memo(PoseVisualization);