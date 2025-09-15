import { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { trpc } from '@/utils/trpc';
import { RaceResults } from '@/components/RaceResults';
import type { Race, RaceResult, ResultType } from '../../../server/src/schema';

interface RaceDetailProps {
  race: Race;
}

export function RaceDetail({ race }: RaceDetailProps) {
  const [results, setResults] = useState<Record<ResultType, RaceResult[]>>({
    practice1: [],
    practice2: [],
    practice3: [],
    qualifying: [],
    sprint: [],
    race: []
  });
  const [loadingResults, setLoadingResults] = useState<Record<ResultType, boolean>>({
    practice1: false,
    practice2: false,
    practice3: false,
    qualifying: false,
    sprint: false,
    race: false
  });

  // Helper function to get flag emoji
  const getFlagEmoji = (country: string): string => {
    const flags: Record<string, string> = {
      'Bahrain': '🇧🇭',
      'Saudi Arabia': '🇸🇦',
      'Australia': '🇦🇺',
      'Japan': '🇯🇵',
      'China': '🇨🇳',
      'Miami': '🇺🇸',
      'Italy': '🇮🇹',
      'Monaco': '🇲🇨',
      'Canada': '🇨🇦',
      'Spain': '🇪🇸',
      'Austria': '🇦🇹',
      'Great Britain': '🇬🇧',
      'Hungary': '🇭🇺',
      'Belgium': '🇧🇪',
      'Netherlands': '🇳🇱',
      'Singapore': '🇸🇬',
      'USA': '🇺🇸',
      'Mexico': '🇲🇽',
      'Brazil': '🇧🇷',
      'Las Vegas': '🇺🇸',
      'Qatar': '🇶🇦',
      'Abu Dhabi': '🇦🇪',
    };
    return flags[country] || '🏁';
  };

  // Helper function to format date and time
  const formatDateTime = (date: Date, time: string): string => {
    return `${date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    })} at ${time}`;
  };

  // Load results for a specific session type
  const loadResults = useCallback(async (resultType: ResultType) => {
    try {
      setLoadingResults(prev => ({ ...prev, [resultType]: true }));
      const result = await trpc.getRaceResults.query({
        race_id: race.id,
        result_type: resultType
      });
      setResults(prev => ({ ...prev, [resultType]: result }));
    } catch (error) {
      console.error(`Failed to load ${resultType} results:`, error);
    } finally {
      setLoadingResults(prev => ({ ...prev, [resultType]: false }));
    }
  }, [race.id]);

  // Check if a session has passed
  const hasSessionPassed = (sessionDate: Date | null, sessionTime: string | null): boolean => {
    if (!sessionDate || !sessionTime) return false;
    const sessionDateTime = new Date(`${sessionDate.toDateString()} ${sessionTime}`);
    return sessionDateTime < new Date();
  };

  // Determine which tabs to show based on scheduled sessions
  const availableSessions = [
    { type: 'race' as ResultType, label: 'Race', date: race.race_date, time: race.race_time, icon: '🏁' },
    ...(race.qualifying_date ? [{ type: 'qualifying' as ResultType, label: 'Qualifying', date: race.qualifying_date, time: race.qualifying_time, icon: '⚡' }] : []),
    ...(race.sprint_date ? [{ type: 'sprint' as ResultType, label: 'Sprint', date: race.sprint_date, time: race.sprint_time, icon: '🏃‍♂️' }] : []),
    ...(race.practice3_date ? [{ type: 'practice3' as ResultType, label: 'FP3', date: race.practice3_date, time: race.practice3_time, icon: '🔧' }] : []),
    ...(race.practice2_date ? [{ type: 'practice2' as ResultType, label: 'FP2', date: race.practice2_date, time: race.practice2_time, icon: '🔧' }] : []),
    ...(race.practice1_date ? [{ type: 'practice1' as ResultType, label: 'FP1', date: race.practice1_date, time: race.practice1_time, icon: '🔧' }] : []),
  ];

  return (
    <div className="space-y-8">
      {/* Race Header */}
      <Card className="glass-card border-0">
        <CardHeader className="pb-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-4">
              <span className="text-5xl">{getFlagEmoji(race.country)}</span>
              <div>
                <CardTitle className="text-4xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                  {race.name}
                </CardTitle>
                <p className="text-xl text-gray-400 mt-2">Round {race.round} • {race.season}</p>
              </div>
            </div>
            
            <Badge className="status-upcoming px-4 py-2 text-sm">
              {formatDateTime(race.race_date, race.race_time)}
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Circuit Information */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <span className="text-2xl">🏁</span>
                <div>
                  <h3 className="text-lg font-semibold text-white">Circuit</h3>
                  <p className="text-gray-300">{race.circuit_name}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <span className="text-2xl">📍</span>
                <div>
                  <h3 className="text-lg font-semibold text-white">Location</h3>
                  <p className="text-gray-300">{race.city}, {race.country}</p>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <span className="text-2xl">📅</span>
                <div>
                  <h3 className="text-lg font-semibold text-white">Race Date</h3>
                  <p className="text-gray-300">{formatDateTime(race.race_date, race.race_time)}</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Schedule Overview */}
      <Card className="glass-card border-0">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-white">Weekend Schedule</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {race.practice1_date && (
              <div className="bg-black/20 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-white">Free Practice 1</h4>
                  <span className="text-blue-400">🔧</span>
                </div>
                <p className="text-gray-300 text-sm">
                  {formatDateTime(race.practice1_date, race.practice1_time || '')}
                </p>
                {hasSessionPassed(race.practice1_date, race.practice1_time) && (
                  <Badge className="mt-2 status-completed text-xs">Completed</Badge>
                )}
              </div>
            )}
            
            {race.practice2_date && (
              <div className="bg-black/20 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-white">Free Practice 2</h4>
                  <span className="text-blue-400">🔧</span>
                </div>
                <p className="text-gray-300 text-sm">
                  {formatDateTime(race.practice2_date, race.practice2_time || '')}
                </p>
                {hasSessionPassed(race.practice2_date, race.practice2_time) && (
                  <Badge className="mt-2 status-completed text-xs">Completed</Badge>
                )}
              </div>
            )}
            
            {race.practice3_date && (
              <div className="bg-black/20 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-white">Free Practice 3</h4>
                  <span className="text-blue-400">🔧</span>
                </div>
                <p className="text-gray-300 text-sm">
                  {formatDateTime(race.practice3_date, race.practice3_time || '')}
                </p>
                {hasSessionPassed(race.practice3_date, race.practice3_time) && (
                  <Badge className="mt-2 status-completed text-xs">Completed</Badge>
                )}
              </div>
            )}
            
            {race.qualifying_date && (
              <div className="bg-black/20 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-white">Qualifying</h4>
                  <span className="text-yellow-400">⚡</span>
                </div>
                <p className="text-gray-300 text-sm">
                  {formatDateTime(race.qualifying_date, race.qualifying_time || '')}
                </p>
                {hasSessionPassed(race.qualifying_date, race.qualifying_time) && (
                  <Badge className="mt-2 status-completed text-xs">Completed</Badge>
                )}
              </div>
            )}
            
            {race.sprint_date && (
              <div className="bg-black/20 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-white">Sprint Race</h4>
                  <span className="text-green-400">🏃‍♂️</span>
                </div>
                <p className="text-gray-300 text-sm">
                  {formatDateTime(race.sprint_date, race.sprint_time || '')}
                </p>
                {hasSessionPassed(race.sprint_date, race.sprint_time) && (
                  <Badge className="mt-2 status-completed text-xs">Completed</Badge>
                )}
              </div>
            )}
            
            <div className="bg-gradient-to-r from-red-500/20 to-pink-500/20 rounded-lg p-4 border border-red-500/30">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-white">Race</h4>
                <span className="text-red-400">🏁</span>
              </div>
              <p className="text-gray-300 text-sm">
                {formatDateTime(race.race_date, race.race_time)}
              </p>
              {hasSessionPassed(race.race_date, race.race_time) && (
                <Badge className="mt-2 status-completed text-xs">Completed</Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results Tabs */}
      <Card className="glass-card border-0">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-white">Results & Timing</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="race" className="w-full">
            <TabsList className="grid grid-cols-3 lg:grid-cols-6 w-full bg-black/20 p-1">
              {availableSessions.map((session) => {
                const hasPassed = hasSessionPassed(session.date, session.time);
                return (
                  <TabsTrigger
                    key={session.type}
                    value={session.type}
                    className="flex items-center space-x-2 text-xs data-[state=active]:bg-red-600/20 data-[state=active]:text-red-300"
                    onClick={() => hasPassed && loadResults(session.type)}
                  >
                    <span>{session.icon}</span>
                    <span className="hidden sm:inline">{session.label}</span>
                  </TabsTrigger>
                );
              })}
            </TabsList>

            {availableSessions.map((session) => (
              <TabsContent key={session.type} value={session.type} className="mt-6">
                <RaceResults
                  sessionType={session.type}
                  sessionLabel={session.label}
                  results={results[session.type]}
                  loading={loadingResults[session.type]}
                  hasSessionPassed={hasSessionPassed(session.date, session.time)}
                  onLoadResults={() => loadResults(session.type)}
                />
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}