import { analyzeFencingPose } from './poseAnalysis.js';

// Ideal pose templates for different fencing positions
const IDEAL_POSES = {
  // Basic Positions
  ENGARDE: {
    name: 'En Garde',
    description: 'Basic fencing stance',
    keypoints: {
      frontKneeAngle: { min: 100, max: 130 },
      backKneeAngle: { min: 150, max: 170 },
      torsoAngle: { min: 80, max: 100 },
      weaponArmAngle: { min: 30, max: 60 },
      guardHandHeight: { min: 0.3, max: 0.5 },
      feetDistance: { min: 0.8, max: 1.2 },
      shoulderHipAlignment: { min: 0.8, max: 1.2 }
    }
  },

  // Attacks
  LUNGE: {
    name: 'Lunge',
    description: 'Basic attacking movement',
    keypoints: {
      frontKneeAngle: { min: 80, max: 100 },
      backLegAngle: { min: 130, max: 170 },
      torsoAngle: { min: 70, max: 90 },
      weaponArmExtension: { min: 0.8, max: 1.0 },
      backFootAngle: { min: 45, max: 90 },
      hipShoulderAlignment: { min: 0.9, max: 1.1 }
    }
  },
  FLEECHE: {
    name: 'Fleche',
    description: 'Running attack',
    keypoints: {
      bodyLean: { min: 30, max: 45 },
      armExtension: { min: 0.9, max: 1.1 },
      backLegAngle: { min: 160, max: 180 },
      forwardMomentum: { min: 0.7, max: 1.0 }
    }
  },
  DISENGAGE_ATTACK: {
    name: 'Disengage Attack',
    description: 'Blade disengagement followed by attack',
    keypoints: {
      bladeAngle: { min: 30, max: 60 },
      wristFlexion: { min: 20, max: 40 },
      armExtension: { min: 0.8, max: 1.0 },
      bodyAlignment: { min: 0.9, max: 1.1 }
    }
  },

  // Defensive Actions
  PARRY_4: {
    name: 'Parry 4',
    description: 'High outside parry',
    keypoints: {
      weaponArmAngle: { min: 45, max: 90 },
      guardHandPosition: { x: { min: 0.5, max: 0.8 }, y: { min: 0.4, max: 0.7 } },
      bladeAngle: { min: 30, max: 60 },
      elbowAngle: { min: 90, max: 120 }
    }
  },
  PARRY_6: {
    name: 'Parry 6',
    description: 'High inside parry',
    keypoints: {
      weaponArmAngle: { min: 90, max: 135 },
      guardHandPosition: { x: { min: 0.2, max: 0.5 }, y: { min: 0.4, max: 0.7 } },
      bladeAngle: { min: 30, max: 60 },
      elbowAngle: { min: 90, max: 120 }
    }
  },
  PARRY_8: {
    name: 'Parry 8',
    description: 'Low outside parry',
    keypoints: {
      weaponArmAngle: { min: 45, max: 90 },
      guardHandPosition: { x: { min: 0.5, max: 0.8 }, y: { min: 0.6, max: 0.9 } },
      bladeAngle: { min: 30, max: 60 },
      elbowAngle: { min: 90, max: 120 }
    }
  },
  CIRCLE_PARRY: {
    name: 'Circular Parry',
    description: 'Circular blade movement to deflect attack',
    keypoints: {
      wristFlexion: { min: 20, max: 45 },
      circleDiameter: { min: 0.2, max: 0.4 },
      bladeSpeed: { min: 0.7, max: 1.0 }
    }
  },

  // Counterattacks
  RIPOSTE: {
    name: 'Riposte',
    description: 'Immediate counterattack after parry',
    keypoints: {
      timing: { min: 0, max: 0.5 }, // seconds after parry
      armExtension: { min: 0.9, max: 1.1 },
      bodyAlignment: { min: 0.9, max: 1.1 },
      bladeAngle: { min: 20, max: 40 }
    }
  },
  COUNTER_RIPOSTE: {
    name: 'Counter-Riposte',
    description: 'Counter to a riposte',
    keypoints: {
      timing: { min: 0, max: 0.3 },
      distanceControl: { min: 0.8, max: 1.2 },
      bladeAngle: { min: 30, max: 60 },
      bodyAlignment: { min: 0.9, max: 1.1 }
    }
  },

  // Footwork
  ADVANCE: {
    name: 'Advance',
    description: 'Forward movement',
    keypoints: {
      stepLength: { min: 0.3, max: 0.5 },
      kneeBend: { min: 150, max: 170 },
      bodyHeight: { min: 0.9, max: 1.1 },
      balance: { min: 0.8, max: 1.2 }
    }
  },
  RETREAT: {
    name: 'Retreat',
    description: 'Backward movement',
    keypoints: {
      stepLength: { min: 0.3, max: 0.5 },
      bodyPosture: { min: 0.9, max: 1.1 },
      weightDistribution: { min: 0.4, max: 0.6 },
      recovery: { min: 0.8, max: 1.2 }
    }
  },
  BALESTRA: {
    name: 'Balestra',
    description: 'Forward jump followed by lunge',
    keypoints: {
      jumpHeight: { min: 0.1, max: 0.3 },
      distance: { min: 0.5, max: 0.8 },
      landingStability: { min: 0.8, max: 1.2 },
      preparation: { min: 0.7, max: 1.0 }
    }
  },

  // Advanced Techniques
  BEAT_ATTACK: {
    name: 'Beat Attack',
    description: 'Hitting opponent\'s blade before attacking',
    keypoints: {
      beatStrength: { min: 0.5, max: 1.0 },
      timing: { min: 0.1, max: 0.3 },
      bladeContact: { min: 0.8, max: 1.2 },
      followThrough: { min: 0.7, max: 1.0 }
    }
  },
  BIND: {
    name: 'Bind',
    description: 'Taking opponent\'s blade from high to low line',
    keypoints: {
      bladeContact: { min: 0.8, max: 1.2 },
      pressure: { min: 0.6, max: 1.0 },
      angle: { min: 30, max: 60 },
      control: { min: 0.8, max: 1.2 }
    }
  },
  DISENGAGE: {
    name: 'Disengage',
    description: 'Avoiding opponent\'s blade',
    keypoints: {
      circleSize: { min: 0.1, max: 0.3 },
      timing: { min: 0.1, max: 0.4 },
      wristFlexion: { min: 20, max: 45 },
      smoothness: { min: 0.7, max: 1.0 }
    }
  },
  REMISE: {
    name: 'Remise',
    description: 'Immediate renewal of attack',
    keypoints: {
      timing: { min: 0, max: 0.3 },
      distance: { min: 0.9, max: 1.1 },
      bladeAngle: { min: 20, max: 40 },
      extension: { min: 0.9, max: 1.1 }
    }
  }
};

// Track user's historical data for progress analysis
const userProgress = {
  sessions: [],
  lastSession: null,
  bestScores: {},
  improvements: []
};

// Analyze current pose against ideal positions
export const analyzePoseAgainstIdeal = (pose, moveType = 'ENGARDE') => {
  const idealPose = IDEAL_POSES[moveType];
  if (!idealPose) return null;

  const currentAnalysis = analyzeFencingPose(pose);
  const comparison = {
    score: 0,
    feedback: [],
    details: {}
  };

  // Calculate score based on keypoint comparisons
  let totalScore = 0;
  let maxScore = 0;

  // Compare each key metric against ideal
  if (currentAnalysis) {
    // Example: Compare knee angles
    if (currentAnalysis.kneeAngle) {
      const idealRange = idealPose.keypoints.frontKneeAngle;
      const diff = Math.max(
        0,
        Math.max(idealRange.min - currentAnalysis.kneeAngle, 0) +
        Math.max(currentAnalysis.kneeAngle - idealRange.max, 0)
      );
      const score = Math.max(0, 1 - (diff / 45)); // Normalize to 0-1
      
      comparison.details.kneeAngle = {
        current: currentAnalysis.kneeAngle,
        ideal: `${idealRange.min}-${idealRange.max}°`,
        score: score.toFixed(2)
      };
      
      if (score < 0.8) {
        comparison.feedback.push(
          currentAnalysis.kneeAngle < idealRange.min 
            ? 'Bend your front knee more for better lunge power.'
            : 'Your front knee is bending too much. Maintain a 90° angle.'
        );
      }
      
      totalScore += score;
      maxScore += 1;
    }

    // Add more comparisons for other key metrics
    // ...
  }

  // Calculate overall score
  comparison.score = maxScore > 0 ? (totalScore / maxScore) * 100 : 0;
  
  // Track progress
  trackProgress(comparison, moveType);
  
  return comparison;
};

// Track user progress over time
const trackProgress = (currentAnalysis, moveType) => {
  const now = new Date();
  const session = {
    timestamp: now,
    moveType,
    score: currentAnalysis.score,
    details: currentAnalysis.details
  };

  // Add to session history
  userProgress.sessions.push(session);
  userProgress.lastSession = session;

  // Update best scores
  if (!userProgress.bestScores[moveType] || currentAnalysis.score > userProgress.bestScores[moveType].score) {
    userProgress.bestScores[moveType] = {
      score: currentAnalysis.score,
      timestamp: now
    };
  }

  // Calculate improvements
  if (userProgress.sessions.length > 1) {
    const previousSession = userProgress.sessions[userProgress.sessions.length - 2];
    if (previousSession.moveType === moveType) {
      const improvement = currentAnalysis.score - previousSession.score;
      if (improvement > 0) {
        userProgress.improvements.push({
          moveType,
          improvement,
          timestamp: now
        });
      }
    }
  }
};

// Get specific move analysis
export const analyzeSpecificMove = (pose, moveType) => {
  switch (moveType.toLowerCase()) {
    case 'lunge':
      return analyzeLunge(pose);
    case 'parry':
      return analyzeParry(pose);
    case 'riposte':
      return analyzeRiposte(pose);
    default:
      return analyzePoseAgainstIdeal(pose, 'ENGARDE');
  }
};

// Specific move analyzers
const analyzeLunge = (pose) => {
  const analysis = analyzePoseAgainstIdeal(pose, 'LUNGE');
  // Add lunge-specific analysis
  return analysis;
};

const analyzeParry = (pose) => {
  const analysis = analyzePoseAgainstIdeal(pose, 'PARRY');
  // Add parry-specific analysis
  return analysis;
};

const analyzeRiposte = (pose) => {
  // Riposte is a counter-attack after a parry
  const analysis = analyzePoseAgainstIdeal(pose, 'ENGARDE');
  // Add riposte-specific analysis
  return analysis;
};

// Get user's progress data
export const getUserProgress = () => ({
  overallScore: calculateOverallScore(),
  lastSession: userProgress.lastSession,
  bestScores: userProgress.bestScores,
  recentImprovements: userProgress.improvements.slice(-5),
  totalSessions: userProgress.sessions.length
});

const calculateOverallScore = () => {
  if (userProgress.sessions.length === 0) return 0;
  const total = userProgress.sessions.reduce((sum, session) => sum + session.score, 0);
  return total / userProgress.sessions.length;
};

// Real-time feedback generator
export const generateRealTimeFeedback = (pose, currentMove) => {
  const analysis = analyzePoseAgainstIdeal(pose, currentMove);
  const feedback = [];

  // Generate feedback based on analysis
  if (analysis.score < 70) {
    feedback.push({
      priority: 'high',
      message: 'Adjust your stance for better balance',
      tip: 'Keep your weight evenly distributed between both feet'
    });
  }

  // Add more feedback based on specific metrics
  if (analysis.details.kneeAngle?.score < 0.7) {
    feedback.push({
      priority: 'medium',
      message: 'Adjust your knee position',
      tip: 'Keep your front knee aligned with your ankle'
    });
  }

  return {
    score: analysis.score,
    feedback: feedback.sort((a, b) => b.priority.localeCompare(a.priority)),
    timestamp: new Date()
  };
};
