import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Swords, Search, Filter, Trash2, ChevronDown, ChevronUp,
  Calendar, Target, Zap
} from "lucide-react";
import { format, parseISO } from 'date-fns';
import { motion, AnimatePresence } from "framer-motion";
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

const weaponEmoji = { foil: '🤺', epee: '⚔️', sabre: '🗡️' };

export default function History() {
  const [search, setSearch] = useState('');
  const [weaponFilter, setWeaponFilter] = useState('all');
  const [resultFilter, setResultFilter] = useState('all');
  const [expandedId, setExpandedId] = useState(null);
  const queryClient = useQueryClient();

  const { data: matches = [], isLoading } = useQuery({
    queryKey: ['matches'],
    queryFn: () => base44.entities.Match.list('-date'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Match.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['matches'] });
    }
  });

  const filteredMatches = matches.filter(m => {
    const matchesSearch = m.opponent_name?.toLowerCase().includes(search.toLowerCase());
    const matchesWeapon = weaponFilter === 'all' || m.weapon === weaponFilter;
    const matchesResult = resultFilter === 'all' || m.result === resultFilter;
    return matchesSearch && matchesWeapon && matchesResult;
  });

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-slate-900 to-slate-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-amber-500/20 rounded-xl">
                <Swords className="w-7 h-7 text-amber-400" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Match History</h1>
                <p className="text-slate-400 text-sm">{matches.length} bouts logged</p>
              </div>
            </div>
            <Link to={createPageUrl('Dashboard')}>
              <Button variant="outline" className="border-slate-600 text-white hover:bg-slate-700">
                Back to Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <Card className="p-4 mb-6 bg-white border-0 shadow-sm">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Search opponents..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Select value={weaponFilter} onValueChange={setWeaponFilter}>
                <SelectTrigger className="w-32">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Weapon" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Weapons</SelectItem>
                  <SelectItem value="foil">🤺 Foil</SelectItem>
                  <SelectItem value="epee">⚔️ Épée</SelectItem>
                  <SelectItem value="sabre">🗡️ Sabre</SelectItem>
                </SelectContent>
              </Select>
              <Select value={resultFilter} onValueChange={setResultFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Result" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Results</SelectItem>
                  <SelectItem value="win">Wins</SelectItem>
                  <SelectItem value="loss">Losses</SelectItem>
                  <SelectItem value="draw">Draws</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </Card>

        {/* Match List */}
        {isLoading ? (
          <div className="text-center py-12 text-slate-400">Loading matches...</div>
        ) : filteredMatches.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            {matches.length === 0 ? 'No matches logged yet' : 'No matches match your filters'}
          </div>
        ) : (
          <div className="space-y-3">
            <AnimatePresence>
              {filteredMatches.map((match, index) => (
                <motion.div
                  key={match.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.03 }}
                >
                  <Card className="bg-white border-0 shadow-sm overflow-hidden">
                    <div 
                      className="p-4 cursor-pointer hover:bg-slate-50 transition-colors"
                      onClick={() => setExpandedId(expandedId === match.id ? null : match.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <span className="text-2xl">{weaponEmoji[match.weapon]}</span>
                          <div>
                            <p className="font-semibold text-slate-800">vs {match.opponent_name}</p>
                            <p className="text-sm text-slate-400 flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {format(parseISO(match.date), 'MMM d, yyyy')}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="font-mono text-lg font-semibold text-slate-600">
                            {match.your_score} - {match.opponent_score}
                          </span>
                          <Badge className={
                            match.result === 'win' 
                              ? 'bg-emerald-100 text-emerald-700' 
                              : match.result === 'loss'
                              ? 'bg-red-100 text-red-700'
                              : 'bg-slate-100 text-slate-700'
                          }>
                            {match.result.toUpperCase()}
                          </Badge>
                          {expandedId === match.id ? (
                            <ChevronUp className="w-5 h-5 text-slate-400" />
                          ) : (
                            <ChevronDown className="w-5 h-5 text-slate-400" />
                          )}
                        </div>
                      </div>
                    </div>

                    <AnimatePresence>
                      {expandedId === match.id && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="border-t border-slate-100"
                        >
                          <div className="p-4 bg-slate-50 space-y-4">
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                              <div className="flex items-center gap-2">
                                <Zap className="w-4 h-4 text-amber-500" />
                                <div>
                                  <p className="text-xs text-slate-400">Energy</p>
                                  <p className="font-medium text-slate-700 capitalize">{match.energy_level || 'N/A'}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Target className="w-4 h-4 text-blue-500" />
                                <div>
                                  <p className="text-xs text-slate-400">Focus</p>
                                  <p className="font-medium text-slate-700 capitalize">{match.focus_level || 'N/A'}</p>
                                </div>
                              </div>
                            </div>

                            {match.actions_used?.length > 0 && (
                              <div>
                                <p className="text-xs text-slate-400 mb-2">Successful Actions</p>
                                <div className="flex flex-wrap gap-1">
                                  {match.actions_used.map(action => (
                                    <Badge key={action} variant="outline" className="text-xs">
                                      {action}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}

                            {match.notes && (
                              <div>
                                <p className="text-xs text-slate-400 mb-1">Notes</p>
                                <p className="text-sm text-slate-600">{match.notes}</p>
                              </div>
                            )}

                            <div className="flex justify-end">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-red-500 hover:text-red-600 hover:bg-red-50"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteMutation.mutate(match.id);
                                }}
                              >
                                <Trash2 className="w-4 h-4 mr-1" />
                                Delete
                              </Button>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </main>
    </div>
  );
}