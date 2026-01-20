import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Plus, BookOpen, ArrowLeft } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

import SessionForm from '../components/practice/SessionForm';
import PracticeStats from '../components/practice/PracticeStats';
import ConsistencyCalendar from '../components/practice/ConsistencyCalendar';
import DrillEffectiveness from '../components/practice/DrillEffectiveness';
import RecentSessions from '../components/practice/RecentSessions';

export default function Practice() {
  const [showForm, setShowForm] = useState(false);
  const queryClient = useQueryClient();

  const { data: sessions = [], isLoading } = useQuery({
    queryKey: ['practice-sessions'],
    queryFn: () => base44.entities.PracticeSession.list('-date'),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.PracticeSession.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['practice-sessions'] });
      setShowForm(false);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.PracticeSession.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['practice-sessions'] });
    }
  });

  const handleSubmit = (data) => {
    createMutation.mutate(data);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-purple-900 to-blue-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-purple-500/20 rounded-xl">
                <BookOpen className="w-7 h-7 text-purple-300" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Practice Sessions</h1>
                <p className="text-purple-200 text-sm">Track drills, consistency & improvement</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Link to={createPageUrl('Dashboard')}>
                <Button variant="outline" className="border-purple-400 text-white hover:bg-purple-800">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Dashboard
                </Button>
              </Link>
              <Button 
                onClick={() => setShowForm(true)}
                className="bg-purple-500 hover:bg-purple-600 text-white font-semibold"
              >
                <Plus className="w-4 h-4 mr-2" />
                Log Session
              </Button>
            </div>
          </motion.div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-8"
            >
              <SessionForm 
                onSubmit={handleSubmit} 
                onCancel={() => setShowForm(false)} 
              />
            </motion.div>
          )}
        </AnimatePresence>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-pulse text-slate-400">Loading your practice data...</div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Stats Overview */}
            <PracticeStats sessions={sessions} />

            {/* Calendar and Recent Sessions */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ConsistencyCalendar sessions={sessions} />
              <RecentSessions sessions={sessions} onDelete={(id) => deleteMutation.mutate(id)} />
            </div>

            {/* Drill Effectiveness */}
            <DrillEffectiveness sessions={sessions} />

            {/* Tips */}
            {sessions.length === 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-xl p-6"
              >
                <h3 className="font-semibold text-slate-800 mb-3">📚 Getting Started with Practice Tracking</h3>
                <div className="space-y-2 text-sm text-slate-600">
                  <p>• <strong>Log every practice session</strong> - Track duration, drills, and how you felt</p>
                  <p>• <strong>Rate your drills</strong> - Mark effectiveness to identify what works best</p>
                  <p>• <strong>Set specific goals</strong> - Focus on what you want to improve each session</p>
                  <p>• <strong>Track consistency</strong> - Build a practice streak and see your progress</p>
                  <p>• <strong>Review analytics</strong> - Identify which drills give you the best results</p>
                </div>
              </motion.div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}