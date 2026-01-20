import React, { useRef, useEffect, useState, useCallback } from 'react';
import * as tf from '@tensorflow/tfjs';
import * as poseDetection from '@tensorflow-models/pose-detection';
import '@tensorflow/tfjs-backend-webgl';
import { analyzeFencingPose, adaptToEnvironment } from '../../../src/utils/poseAnalysis';
import { analyzePoseAgainstIdeal, generateRealTimeFeedback } from '../../../src/utils/advancedPoseAnalysis';
import PoseVisualization from './PoseVisualization';
import PoseFeedback from './PoseFeedback';

const CameraStream = ({ onPoseDetected, onCameraStateChange, onError }) => {
  const videoRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const [detector, setDetector] = useState(null);
  const [fps, setFps] = useState(0);
  const [environment, setEnvironment] = useState({ lighting: 1, contrast: 1 });
  const [dimensions, setDimensions] = useState({ width: 640, height: 480 });
  const [currentMove, setCurrentMove] = useState('ENGARDE');
  const [currentWeapon, setCurrentWeapon] = useState('FOIL');
  const [aiFeedback, setAiFeedback] = useState(null);
  const [showFeedback, setShowFeedback] = useState(true);
  const frameCount = useRef(0);
  const lastFpsUpdate = useRef(performance.now());
  const lastPose = useRef(null);
  const poseHistory = useRef([]);
  const animationFrameId = useRef(null);
  const feedbackCooldown = useRef(false);

  // Initialize the pose detector
  useEffect(() => {
    const initPoseDetection = async () => {
      try {
        await tf.setBackend('webgl');
        await tf.ready();
        
        const model = poseDetection.SupportedModels.MoveNet;
        const detectorConfig = {
          modelType: poseDetection.movenet.modelType.SINGLEPOSE_THUNDER,
          enableSmoothing: true,
          minPoseScore: 0.3,
          multiPoseMaxDimension: 256,
          enableTracking: true,
          trackerType: poseDetection.TrackerType.BoundingBox
        };
        
        const poseDetector = await poseDetection.createDetector(model, detectorConfig);
        setDetector(poseDetector);
        setupCamera();
      } catch (err) {
        console.error('Error initializing pose detection:', err);
        onError?.('Failed to initialize pose detection');
      }
    };

    initPoseDetection();

    return () => {
      if (detector) {
        detector.dispose();
      }
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, []);

  // Setup camera stream
  const setupCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          width: 1280,
          height: 720,
          facingMode: 'environment', 
          frameRate: { ideal: 30 },
          resizeMode: 'crop-and-scale'
        },
        audio: false
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await new Promise((resolve) => {
          videoRef.current.onloadedmetadata = () => {
            videoRef.current.play().then(() => {
              // Update dimensions when video is ready
              setDimensions({
                width: videoRef.current.videoWidth,
                height: videoRef.current.videoHeight
              });
              resolve();
            });
          };
        });
        onCameraStateChange?.(true);
        detectPose();
      }
    } catch (err) {
      console.error('Error accessing camera:', err);
      onError?.('Could not access camera');
    } finally {
      setIsLoading(false);
    }
  };

  // Smooth pose data using weighted average
  const smoothPose = (newPose) => {
    if (!newPose || !newPose.keypoints) return newPose;

    // Add new pose to history (keep last 5 poses)
    poseHistory.current = [newPose, ...poseHistory.current].slice(0, 5);
    
    // If we don't have enough history, return the new pose
    if (poseHistory.current.length < 3) return newPose;

    // Calculate weighted average of poses (newer poses have more weight)
    const smoothedKeypoints = newPose.keypoints.map((kp, i) => {
      let totalWeight = 0;
      let x = 0;
      let y = 0;
      let score = 0;

      poseHistory.current.forEach((pose, idx) => {
        const weight = 1 / (idx + 1); // More weight to recent poses
        const histKp = pose.keypoints[i];
        x += histKp.x * weight;
        y += histKp.y * weight;
        score += histKp.score * weight;
        totalWeight += weight;
      });

      return {
        ...kp,
        x: x / totalWeight,
        y: y / totalWeight,
        score: score / totalWeight
      };
    });

    return {
      ...newPose,
      keypoints: smoothedKeypoints
    };
  };

  // Detect poses in real-time
  const detectPose = useCallback(async () => {
    if (!detector || !videoRef.current) return;

    const now = performance.now();
    frameCount.current++;

    // Update FPS counter every second
    if (now - lastFpsUpdate.current >= 1000) {
      setFps(Math.round((frameCount.current * 1000) / (now - lastFpsUpdate.current)));
      frameCount.current = 0;
      lastFpsUpdate.current = now;
    }

    try {
      // Detect poses
      const poses = await detector.estimatePoses(videoRef.current, {
        maxPoses: 1,
        flipHorizontal: false,
        scoreThreshold: 0.3,
      });

      if (poses && poses.length > 0) {
        // Smooth pose data
        const smoothedPose = smoothPose(poses[0]);
        const basicAnalysis = analyzeFencingPose(smoothedPose);
        
        // Analyze pose with AI feedback based on current weapon
        const aiAnalysis = analyzePoseAgainstIdeal(smoothedPose, currentMove, currentWeapon);
        
        lastPose.current = {
          ...smoothedPose,
          analysis: { ...basicAnalysis, ...aiAnalysis },
          timestamp: now
        };

        // Generate feedback (throttled to avoid overwhelming updates)
        if (!feedbackCooldown.current) {
          feedbackCooldown.current = true;
          const feedback = generateRealTimeFeedback(smoothedPose, currentMove, currentWeapon);
          setAiFeedback(feedback);
          
          // Reset cooldown after delay
          setTimeout(() => {
            feedbackCooldown.current = false;
          }, 500);
        }

        // Notify parent component
        if (onPoseDetected) {
          onPoseDetected(lastPose.current);
        }
      } else {
        lastPose.current = null;
        setAiFeedback(null);
      }
    } catch (error) {
      console.error('Error detecting pose:', error);
      if (onError) onError('Failed to detect pose');
    }

    animationFrameId.current = requestAnimationFrame(detectPose);
  }, [detector, onPoseDetected, onError, currentMove, currentWeapon]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64 bg-navy-900 rounded-xl">
        <div className="animate-pulse text-white">Initializing camera...</div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="w-full h-full object-cover"
        style={{
          transform: 'scaleX(-1)',
          filter: `brightness(${environment.lighting}) contrast(${environment.contrast})`,
        }}
      />
      {lastPose.current && (
        <PoseVisualization pose={lastPose.current} dimensions={dimensions} />
      )}
      {isLoading ? (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
          <div className="animate-pulse text-white">Loading pose detection...</div>
        </div>
      ) : (
        <>
          <PoseFeedback 
            feedback={aiFeedback?.feedback} 
            score={aiFeedback?.score || 0}
            isVisible={showFeedback}
            currentWeapon={currentWeapon}
            onWeaponChange={setCurrentWeapon}
          />
          <div className="absolute top-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded flex items-center gap-2">
            <span>{fps} FPS</span>
            <span className="w-px h-4 bg-white/30 mx-1"></span>
            <select 
              value={currentMove}
              onChange={(e) => setCurrentMove(e.target.value)}
              className="bg-black/50 border-none text-xs text-white focus:ring-0 focus:ring-offset-0 p-0 pr-5"
            >
              <option value="ENGARDE">En Garde</option>
              <option value="LUNGE">Lunge</option>
              <option value="PARRY">Parry</option>
              <option value="RIPOSTE">Riposte</option>
            </select>
            <button 
              onClick={() => setShowFeedback(!showFeedback)}
              className="ml-1 p-1 hover:bg-white/10 rounded"
              title={showFeedback ? 'Hide feedback' : 'Show feedback'}
            >
              {showFeedback ? '👁️' : '👁️‍🗨️'}
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default React.memo(CameraStream);