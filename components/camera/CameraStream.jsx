import React, { useRef, useEffect, useState, useCallback } from 'react';
import * as tf from '@tensorflow/tfjs';
import * as poseDetection from '@tensorflow-models/pose-detection';
import '@tensorflow/tfjs-backend-webgl';
import { analyzeFencingPose, adaptToEnvironment } from '../../utils/poseAnalysis';
import PoseVisualization from './PoseVisualization';

const CameraStream = ({ onPoseDetected, onCameraStateChange, onError }) => {
  const videoRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const [detector, setDetector] = useState(null);
  const [fps, setFps] = useState(0);
  const [environment, setEnvironment] = useState({ lighting: 1, contrast: 1 });
  const [dimensions, setDimensions] = useState({ width: 640, height: 480 });
  const frameCount = useRef(0);
  const lastFpsUpdate = useRef(performance.now());
  const lastPose = useRef(null);
  const poseHistory = useRef([]);
  const animationFrameId = useRef(null);

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

    const detect = async () => {
      frameCount.current++;
      const now = performance.now();
      const delta = now - lastFpsUpdate.current;
      
      // Update FPS counter every second
      if (delta >= 1000) {
        setFps(Math.round((frameCount.current * 1000) / delta));
        frameCount.current = 0;
        lastFpsUpdate.current = now;
      }

      try {
        // Get current environment conditions
        const env = adaptToEnvironment(videoRef.current);
        setEnvironment(env);

        // Adjust detection parameters based on environment
        const minPoseScore = Math.max(0.2, 0.5 - (1 - env.lighting) * 0.3);
        
        // Detect poses
        const poses = await detector.estimatePoses(videoRef.current, {
          flipHorizontal: false,
          maxPoses: 1,
          scoreThreshold: minPoseScore
        });
        
        if (poses.length > 0) {
          // Smooth the pose data
          const smoothedPose = smoothPose(poses[0]);
          lastPose.current = {
            ...smoothedPose,
            analysis: analyzeFencingPose(smoothedPose),
            timestamp: now
          };
          
          // Pass both raw and analyzed data to parent
          onPoseDetected?.(lastPose.current);
        }
      } catch (err) {
        console.error('Error detecting pose:', err);
      }

      animationFrameId.current = requestAnimationFrame(detect);
    };

    detect();
  }, [detector, onPoseDetected]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64 bg-navy-900 rounded-xl">
        <div className="animate-pulse text-white">Initializing camera...</div>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-xl border-2 border-gold-500 shadow-lg">
      <video
        ref={videoRef}
        className="w-full h-auto"
        playsInline
        muted
        autoPlay
      />
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <PoseVisualization 
          pose={lastPose.current} 
          analysis={lastPose.current?.analysis} 
          width={dimensions.width} 
          height={dimensions.height}
        />
      </div>
      <div className="absolute top-2 right-2 bg-navy-800/80 text-white text-xs px-2 py-1 rounded">
        {fps} FPS • {Math.round(environment.lighting * 100)}% Light
      </div>
    </div>
  );
};

export default React.memo(CameraStream);