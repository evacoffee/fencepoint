import React, { useState } from 'react';
import { base44 } from '../src/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Plus, Swords } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import dynamic from 'next/dynamic';

import StatsOverview from '../components/dashboard/StatsOverview';
import RecentMatches from '../components/dashboard/RecentMatches';
import TargetZoneAnalysis from '../components/dashboard/TargetZoneAnalysis';
import AICoachTips from '../components/dashboard/AICoachTips';

const PerformanceChart = dynamic(
  () => import('../components/dashboard/PerformanceChart'),
  { ssr: false }
);

const MatchForm = dynamic(
  () => import('../components/match/MatchForm'),
  { ssr: false }
);

export default function Dashboard() {
  const [showForm, setShowForm] = useState(false);
  const queryClient = useQueryClient();

  const { data: matches = [], isLoading } = useQuery({
    queryKey: ['matches'],
    queryFn: () => base44.entities.Match.list('-date'),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Match.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['matches'] });
      setShowForm(false);
    }
  });

  const handleSubmit = (data) => {
    createMutation.mutate(data);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <header className="mb-8">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">FencePoint</h1>
          <Button onClick={() => setShowForm(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Log Bout
          </Button>
        </div>
      </header>

      <main className="space-y-6">
        <StatsOverview matches={matches} />
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="bg-white p-6 rounded-lg shadow mb-6">
              <h2 className="text-lg font-semibold mb-4">Performance Trend</h2>
              <div className="h-64">
                <PerformanceChart matches={matches} />
              </div>
            </div>
            
            <RecentMatches matches={matches} />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <PerformanceChart matches={matches} />
              <RecentMatches matches={matches} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <TargetZoneAnalysis matches={matches} />
              <AICoachTips matches={matches} />
          </div>
        )}
      </main>
    </div>
  );
}