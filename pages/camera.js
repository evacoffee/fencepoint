import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Video, Car, Smartphone, ArrowLeft } from "lucide-react";
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from "framer-motion";

import CameraStream from '../components/camera/CameraStream';
import BluetoothRCControl from '../components/camera/BluetoothRCControl';
import FollowModeControl from '../components/camera/FollowModeControl';

export default function Camera() {
  const [followMode, setFollowMode] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [mode, setMode] = useState('phone'); // 'phone' or 'rc-car'

  const handleCameraStateChange = (stream) => {
    setCameraActive(!!stream);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-slate-900 to-slate-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-blue-500/20 rounded-xl">
                <Video className="w-7 h-7 text-blue-400" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Camera & Recording</h1>
                <p className="text-slate-400 text-sm">Record your practice sessions</p>
              </div>
            </div>
            <Link to={createPageUrl('Dashboard')}>
              <Button variant="outline" className="border-slate-600 text-white hover:bg-slate-700">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Mode Selection */}
        <div className="mb-6">
          <Tabs value={mode} onValueChange={setMode} className="w-full">
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-2">
              <TabsTrigger value="phone" className="flex items-center gap-2">
                <Smartphone className="w-4 h-4" />
                Phone Camera
              </TabsTrigger>
              <TabsTrigger value="rc-car" className="flex items-center gap-2">
                <Car className="w-4 h-4" />
                RC Car Camera
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Phone Camera Mode */}
        {mode === 'phone' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <CameraStream onStreamChange={handleCameraStateChange} />
              </div>
              <div>
                <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-200">
                  <h3 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
                    <Smartphone className="w-5 h-5 text-blue-600" />
                    Phone Recording Mode
                  </h3>
                  <div className="space-y-3 text-sm text-slate-600">
                    <p>✓ Record yourself practicing</p>
                    <p>✓ Review technique and form</p>
                    <p>✓ Share with coaches</p>
                    <p>✓ Switch between front/back camera</p>
                    <p>✓ Download recordings instantly</p>
                  </div>
                </div>

                <div className="mt-6 bg-amber-50 border border-amber-200 rounded-xl p-4">
                  <p className="text-xs text-amber-700">
                    <strong>💡 Pro Tip:</strong> Set up your phone on a tripod or stand for stable recording. Use the back camera for better quality.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* RC Car Mode */}
        {mode === 'rc-car' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <CameraStream onStreamChange={handleCameraStateChange} />
                
                <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl p-6 text-white">
                  <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                    <Car className="w-6 h-6" />
                    How RC Car Follow Mode Works
                  </h3>
                  <div className="space-y-2 text-sm text-purple-100">
                    <p>1️⃣ <strong>Connect your Bluetooth RC car</strong> - Make sure it's turned on and in pairing mode</p>
                    <p>2️⃣ <strong>Start the camera</strong> - This allows the AI to track your position</p>
                    <p>3️⃣ <strong>Enable Follow Mode</strong> - The car will automatically follow you around</p>
                    <p>4️⃣ <strong>Practice freely</strong> - The camera keeps you centered while you fence</p>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <FollowModeControl 
                  isActive={followMode}
                  onToggle={setFollowMode}
                  cameraActive={cameraActive}
                />
                
                <BluetoothRCControl followMode={followMode} />

                <div className="bg-slate-800 text-white rounded-xl p-4">
                  <h4 className="font-semibold mb-2 text-sm">📱 Requirements</h4>
                  <ul className="text-xs space-y-1 text-slate-300">
                    <li>• Bluetooth-enabled RC car</li>
                    <li>• Chrome or Edge browser</li>
                    <li>• Camera with wide angle lens</li>
                    <li>• Good lighting conditions</li>
                  </ul>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                  <p className="text-xs text-blue-700">
                    <strong> Note:</strong> This feature requires a Bluetooth RC car with compatible firmware. Manual control is always available as a fallback.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Feature Comparison */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Smartphone className="w-5 h-5 text-blue-600" />
              </div>
              <h3 className="font-semibold text-slate-800">Phone Camera</h3>
            </div>
            <ul className="space-y-2 text-sm text-slate-600">
              <li className="flex items-start gap-2">
                <span className="text-emerald-500 mt-0.5">✓</span>
                <span>Simple setup - use any phone</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-500 mt-0.5">✓</span>
                <span>Manual positioning control</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-500 mt-0.5">✓</span>
                <span>Perfect for fixed-angle recording</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-500 mt-0.5">✓</span>
                <span>No additional hardware needed</span>
              </li>
            </ul>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Car className="w-5 h-5 text-purple-600" />
              </div>
              <h3 className="font-semibold text-slate-800">RC Car Camera</h3>
            </div>
            <ul className="space-y-2 text-sm text-slate-600">
              <li className="flex items-start gap-2">
                <span className="text-emerald-500 mt-0.5">✓</span>
                <span>AI-powered automatic following</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-500 mt-0.5">✓</span>
                <span>Dynamic camera angles</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-500 mt-0.5">✓</span>
                <span>Move freely without adjusting</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-500 mt-0.5">✓</span>
                <span>Professional-looking footage</span>
              </li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
}