// components/camera/PoseVisualization.jsx
import React, { useRef, useEffect } from 'react';
import { getKeypoint } from '../../utils/poseAnalysis';

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
  HIGHLIGHT: '#F59E0B',
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

const PoseVisualization = ({ pose, analysis, width = 640, height = 480 }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!pose || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

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
    <div className="relative">
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className="rounded-xl border-2 border-gold-500"
      />
    </div>
  );
};

export default React.memo(PoseVisualization);