// utils/poseAnalysis.js
export const analyzeFencingPose = (pose) => {
  if (!pose || !pose.keypoints) return null;

  // Keypoint indices for MoveNet
  const KEYPOINTS = {
    NOSE: 0,
    LEFT_EYE: 1,
    RIGHT_EYE: 2,
    LEFT_EAR: 3,
    RIGHT_EAR: 4,
    LEFT_SHOULDER: 5,
    RIGHT_SHOULDER: 6,
    LEFT_ELBOW: 7,
    RIGHT_ELBOW: 8,
    LEFT_WRIST: 9,
    RIGHT_WRIST: 10,
    LEFT_HIP: 11,
    RIGHT_HIP: 12,
    LEFT_KNEE: 13,
    RIGHT_KNEE: 14,
    LEFT_ANKLE: 15,
    RIGHT_ANKLE: 16
  };

  // Calculate angles between keypoints
  const calculateAngle = (a, b, c) => {
    const ab = Math.sqrt(Math.pow(b.x - a.x, 2) + Math.pow(b.y - a.y, 2));
    const cb = Math.sqrt(Math.pow(b.x - c.x, 2) + Math.pow(b.y - c.y, 2));
    const ac = Math.sqrt(Math.pow(c.x - a.x, 2) + Math.pow(c.y - a.y, 2));
    const angle = Math.acos((ab * ab + cb * cb - ac * ac) / (2 * ab * cb)) * (180 / Math.PI);
    return isNaN(angle) ? 0 : angle;
  };

  // Get keypoint by name
  const getKeypoint = (name) => {
    const kp = pose.keypoints[KEYPOINTS[name]];
    return kp && kp.score > 0.3 ? { x: kp.x, y: kp.y } : null;
  };

  // Analyze fencing-specific metrics
  const analysis = {
    enGarde: false,
    lunge: false,
    riposte: false,
    parry: false,
    balance: 0.5, // 0-1, 0.5 is balanced
    extension: 0, // 0-1, how extended the weapon arm is
    stability: 0.5, // 0-1, how stable the stance is
    suggestions: []
  };

  // Get relevant keypoints
  const leftShoulder = getKeypoint('LEFT_SHOULDER');
  const rightShoulder = getKeypoint('RIGHT_SHOULDER');
  const leftElbow = getKeypoint('LEFT_ELBOW');
  const rightElbow = getKeypoint('RIGHT_ELBOW');
  const leftWrist = getKeypoint('LEFT_WRIST');
  const rightWrist = getKeypoint('RIGHT_WRIST');
  const leftHip = getKeypoint('LEFT_HIP');
  const rightHip = getKeypoint('RIGHT_HIP');
  const leftKnee = getKeypoint('LEFT_KNEE');
  const rightKnee = getKeypoint('RIGHT_KNEE');
  const leftAnkle = getKeypoint('LEFT_ANKLE');
  const rightAnkle = getKeypoint('RIGHT_ANKLE');

  // Analyze en garde position
  if (leftShoulder && rightShoulder && leftHip && rightHip) {
    const shoulderWidth = Math.abs(leftShoulder.x - rightShoulder.x);
    const hipWidth = Math.abs(leftHip.x - rightHip.x);
    const shoulderHipRatio = shoulderWidth / hipWidth;
    
    // Check for proper en garde stance
    if (shoulderHipRatio > 0.8 && shoulderHipRatio < 1.2) {
      analysis.enGarde = true;
    } else {
      analysis.suggestions.push('Widen your stance for better balance');
    }
  }

  // Analyze lunge
  if (leftKnee && rightKnee && leftAnkle && rightAnkle) {
    const frontKnee = leftKnee.y > rightKnee.y ? leftKnee : rightKnee;
    const backKnee = leftKnee.y > rightKnee.y ? rightKnee : leftKnee;
    
    if (frontKnee.x && backKnee.x) {
      const kneeAngle = calculateAngle(
        { x: frontKnee.x, y: 0 },
        frontKnee,
        { x: frontKnee.x, y: frontKnee.y + 100 }
      );
      
      if (kneeAngle > 45 && kneeAngle < 90) {
        analysis.lunge = true;
        analysis.extension = 1 - (kneeAngle / 90);
      }
    }
  }

  // Analyze weapon arm extension
  const weaponArm = rightWrist || leftWrist;
  const weaponElbow = rightWrist ? rightElbow : leftElbow;
  const weaponShoulder = rightWrist ? rightShoulder : leftShoulder;
  
  if (weaponArm && weaponElbow && weaponShoulder) {
    const armAngle = calculateAngle(weaponShoulder, weaponElbow, weaponArm);
    analysis.extension = 1 - (Math.abs(armAngle - 170) / 170);
    
    if (armAngle < 150) {
      analysis.suggestions.push('Extend your weapon arm further');
    }
  }

  // Calculate balance
  if (leftShoulder && rightShoulder && leftHip && rightHip && leftAnkle && rightAnkle) {
    const shoulderMidX = (leftShoulder.x + rightShoulder.x) / 2;
    const hipMidX = (leftHip.x + rightHip.x) / 2;
    const ankleMidX = (leftAnkle.x + rightAnkle.x) / 2;
    
    const upperBodyBalance = Math.abs(shoulderMidX - hipMidX) / 50; // Normalized
    const lowerBodyBalance = Math.abs(hipMidX - ankleMidX) / 50; // Normalized
    
    analysis.balance = 1 - Math.min(1, (upperBodyBalance + lowerBodyBalance) / 2);
    
    if (analysis.balance < 0.7) {
      analysis.suggestions.push('Center your weight for better balance');
    }
  }

  // Calculate stability based on keypoint movement
  analysis.stability = 0.8; // This would be calculated based on frame-to-frame movement

  return analysis;
};

// Environment adaptation
let environmentData = {
  lighting: 1.0, // 0-1, 1 is ideal
  contrast: 1.0, // 0-1, 1 is ideal
  lastUpdate: Date.now()
};

export const adaptToEnvironment = (videoElement) => {
  if (!videoElement) return environmentData;
  
  try {
    // This is a simplified version - in a real app, you'd analyze the video frames
    const now = Date.now();
    if (now - environmentData.lastUpdate > 5000) { // Update every 5 seconds
      // Sample some pixels to estimate lighting
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = videoElement.videoWidth;
      canvas.height = videoElement.videoHeight;
      ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
      
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      let totalBrightness = 0;
      let totalPixels = 0;
      
      // Sample pixels for performance
      for (let i = 0; i < imageData.data.length; i += 16) {
        const r = imageData.data[i];
        const g = imageData.data[i + 1];
        const b = imageData.data[i + 2];
        totalBrightness += (r + g + b) / 3;
        totalPixels++;
      }
      
      const avgBrightness = totalBrightness / totalPixels / 255;
      
      // Update environment data
      environmentData = {
        lighting: Math.min(1, Math.max(0, avgBrightness * 1.2)), // Scale slightly
        contrast: 1.0, // Would calculate based on histogram in a real implementation
        lastUpdate: now
      };
    }
    
    return environmentData;
  } catch (e) {
    console.error('Error analyzing environment:', e);
    return environmentData;
  }
};

// Helper function to get keypoint by name
export const getKeypoint = (pose, name) => {
  const KEYPOINTS = {
    NOSE: 0,
    LEFT_EYE: 1,
    RIGHT_EYE: 2,
    LEFT_EAR: 3,
    RIGHT_EAR: 4,
    LEFT_SHOULDER: 5,
    RIGHT_SHOULDER: 6,
    LEFT_ELBOW: 7,
    RIGHT_ELBOW: 8,
    LEFT_WRIST: 9,
    RIGHT_WRIST: 10,
    LEFT_HIP: 11,
    RIGHT_HIP: 12,
    LEFT_KNEE: 13,
    RIGHT_KNEE: 14,
    LEFT_ANKLE: 15,
    RIGHT_ANKLE: 16
  };
  
  const index = KEYPOINTS[name];
  return pose && pose.keypoints && pose.keypoints[index]?.score > 0.3 
    ? pose.keypoints[index] 
    : null;
};