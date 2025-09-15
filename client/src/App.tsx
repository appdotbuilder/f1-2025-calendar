import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { trpc } from '@/utils/trpc';
import { useState, useEffect, useCallback } from 'react';
import type { Race, RaceResult } from '../../server/src/schema';

function App() {
  const [races, setRaces] = useState<Race[]>([]);
  const [selectedRace, setSelectedRace] = useState<Race | null>(null);
  const [raceResults, setRaceResults] = useState<RaceResult[]>([]);
  const [qualifyingResults, setQualifyingResults] = useState<RaceResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);
  const [hasAttemptedSeed, setHasAttemptedSeed] = useState(false);

  // Load races for 2025 season
  const loadRaces = useCallback(async () => {
    try {
      setIsLoading(true);
      console.log('Loading races for 2025...');
      const result = await trpc.getRacesBySeason.query({ season: 2025 });
      console.log('Races loaded:', result);
      setRaces(result);
      return result;
    } catch (error) {
      console.error('Failed to load races:', error);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load race results for selected race
  const loadRaceResults = useCallback(async (raceId: number) => {
    try {
      setIsLoading(true);
      
      // Load race results
      const raceRes = await trpc.getRaceResults.query({ 
        race_id: raceId, 
        result_type: 'race' 
      });
      setRaceResults(raceRes);

      // Load qualifying results
      const qualRes = await trpc.getRaceResults.query({ 
        race_id: raceId, 
        result_type: 'qualifying' 
      });
      setQualifyingResults(qualRes);
      
    } catch (error) {
      console.error('Failed to load race results:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Handle race selection
  const handleRaceClick = useCallback((race: Race) => {
    setSelectedRace(race);
    loadRaceResults(race.id);
  }, [loadRaceResults]);

  // Go back to calendar
  const handleBackToCalendar = useCallback(() => {
    setSelectedRace(null);
    setRaceResults([]);
    setQualifyingResults([]);
  }, []);

  // Seed database
  const handleSeedDatabase = useCallback(async () => {
    try {
      setIsSeeding(true);
      console.log('Starting database seeding...');
      const result = await trpc.seedDatabase.mutate();
      console.log('Database seeded successfully:', result);
      
      // Reload races after seeding
      const newRaces = await trpc.getRacesBySeason.query({ season: 2025 });
      console.log('Races after seeding:', newRaces);
      setRaces(newRaces);
    } catch (error) {
      console.error('Failed to seed database:', error);
    } finally {
      setIsSeeding(false);
    }
  }, []);

  // Load races on component mount
  useEffect(() => {
    const initializeApp = async () => {
      // First check if server is healthy
      try {
        await trpc.healthcheck.query();
        console.log('Server is healthy');
      } catch (error) {
        console.error('Server health check failed:', error);
        return;
      }

      // Try to load races
      const races = await loadRaces();
      
      // If no races found and we haven't attempted to seed yet, try seeding once
      if (races.length === 0 && !hasAttemptedSeed) {
        console.log('No races found, attempting to seed database...');
        setHasAttemptedSeed(true);
        try {
          await handleSeedDatabase();
        } catch (error) {
          console.log('Auto-seeding failed, user can manually seed:', error);
        }
      }
    };
    
    initializeApp();
  }, []); // Remove dependencies to avoid infinite loops

  // Format date and time for display
  const formatDateTime = (date: Date, time: string) => {
    const dateStr = date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });
    return `${dateStr} ${time}`;
  };

  // Get position color for race results
  const getPositionColor = (position: number | null) => {
    if (!position) return 'bg-gray-600';
    if (position === 1) return 'bg-yellow-500';
    if (position === 2) return 'bg-gray-400';
    if (position === 3) return 'bg-orange-500';
    if (position <= 10) return 'bg-green-600';
    return 'bg-gray-600';
  };

  // Race Calendar View
  if (!selectedRace) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-red-950 to-black">
        <div className="absolute inset-0 opacity-30">
          <div className="w-full h-full" style={{
            backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.03\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
            backgroundRepeat: 'repeat'
          }}>
          </div>
        </div>
        
        <div className="relative z-10 container mx-auto p-6">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-6xl font-bold text-white mb-4 tracking-tight">
              🏎️ <span className="bg-gradient-to-r from-red-500 to-red-700 bg-clip-text text-transparent">F1</span> 2025
            </h1>
            <p className="text-xl text-red-200 font-light">Formula 1 Race Calendar</p>
          </div>

          {/* Controls */}
          <div className="flex justify-center mb-8">
            <Button
              onClick={handleSeedDatabase}
              disabled={isSeeding}
              className="bg-red-600 hover:bg-red-700 text-white font-semibold px-6 py-3 rounded-lg border border-red-500/30 backdrop-blur-sm"
            >
              {isSeeding ? '🌱 Seeding...' : '🌱 Load Sample Data'}
            </Button>
          </div>

          {/* Loading State */}
          {isLoading && races.length === 0 && (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div>
              <p className="text-red-200 mt-4">Loading races...</p>
            </div>
          )}

          {/* No races message */}
          {!isLoading && races.length === 0 && (
            <Card className="bg-black/40 border-red-500/30 backdrop-blur-sm">
              <CardContent className="text-center py-12">
                <h3 className="text-xl text-red-200 mb-4">No races found for 2025 season</h3>
                <p className="text-red-300/70">Click "Load Sample Data" to populate with race schedule and results</p>
              </CardContent>
            </Card>
          )}

          {/* Race Grid */}
          {races.length > 0 && (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {races.map((race: Race) => (
                <Card 
                  key={race.id}
                  className="bg-black/40 border-red-500/30 backdrop-blur-sm hover:bg-black/60 hover:border-red-400/50 transition-all duration-300 cursor-pointer transform hover:scale-105"
                  onClick={() => handleRaceClick(race)}
                >
                  <CardHeader className="pb-3">
                    <CardTitle className="text-white flex items-center justify-between">
                      <span className="text-lg">{race.name}</span>
                      <Badge variant="secondary" className="bg-red-600/80 text-white text-xs">
                        Round {race.round}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="text-red-200">
                      <p className="font-semibold">{race.circuit_name}</p>
                      <p className="text-sm text-red-300/70">{race.city}, {race.country}</p>
                    </div>
                    
                    <Separator className="bg-red-500/20" />
                    
                    <div className="space-y-2 text-sm">
                      <div className="text-red-200">
                        <span className="font-semibold text-white">🏁 Race:</span>{' '}
                        {formatDateTime(race.race_date, race.race_time)}
                      </div>
                      {race.qualifying_date && (
                        <div className="text-red-300/80">
                          <span className="font-semibold">⏱️ Qualifying:</span>{' '}
                          {formatDateTime(race.qualifying_date, race.qualifying_time || '')}
                        </div>
                      )}
                      {race.sprint_date && (
                        <div className="text-red-300/80">
                          <span className="font-semibold">⚡ Sprint:</span>{' '}
                          {formatDateTime(race.sprint_date, race.sprint_time || '')}
                        </div>
                      )}
                    </div>
                    
                    <div className="pt-2">
                      <Button 
                        variant="ghost" 
                        className="w-full text-red-200 hover:text-white hover:bg-red-600/20 border border-red-500/20"
                      >
                        View Race Details →
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Race Detail View
  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-red-950 to-black">
      <div className="absolute inset-0 opacity-30">
        <div className="w-full h-full" style={{
          backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.03\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
          backgroundRepeat: 'repeat'
        }}>
        </div>
      </div>
      
      <div className="relative z-10 container mx-auto p-6">
        {/* Header */}
        <div className="mb-6">
          <Button
            onClick={handleBackToCalendar}
            variant="ghost"
            className="mb-4 text-red-200 hover:text-white hover:bg-red-600/20"
          >
            ← Back to Calendar
          </Button>
          
          <div className="text-center">
            <h1 className="text-4xl font-bold text-white mb-2">{selectedRace.name}</h1>
            <p className="text-xl text-red-200">{selectedRace.circuit_name}</p>
            <p className="text-lg text-red-300/70">{selectedRace.city}, {selectedRace.country}</p>
            <Badge className="mt-3 bg-red-600 text-white">Round {selectedRace.round} • 2025 Season</Badge>
          </div>
        </div>

        {/* Race Schedule */}
        <Card className="mb-6 bg-black/40 border-red-500/30 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white">📅 Schedule</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {selectedRace.practice1_date && (
                <div className="text-center p-4 bg-red-950/30 rounded-lg border border-red-500/20">
                  <p className="font-semibold text-red-200">Practice 1</p>
                  <p className="text-sm text-red-300/70">
                    {formatDateTime(selectedRace.practice1_date, selectedRace.practice1_time || '')}
                  </p>
                </div>
              )}
              {selectedRace.practice2_date && (
                <div className="text-center p-4 bg-red-950/30 rounded-lg border border-red-500/20">
                  <p className="font-semibold text-red-200">Practice 2</p>
                  <p className="text-sm text-red-300/70">
                    {formatDateTime(selectedRace.practice2_date, selectedRace.practice2_time || '')}
                  </p>
                </div>
              )}
              {selectedRace.practice3_date && (
                <div className="text-center p-4 bg-red-950/30 rounded-lg border border-red-500/20">
                  <p className="font-semibold text-red-200">Practice 3</p>
                  <p className="text-sm text-red-300/70">
                    {formatDateTime(selectedRace.practice3_date, selectedRace.practice3_time || '')}
                  </p>
                </div>
              )}
              {selectedRace.sprint_date && (
                <div className="text-center p-4 bg-yellow-950/30 rounded-lg border border-yellow-500/20">
                  <p className="font-semibold text-yellow-200">⚡ Sprint</p>
                  <p className="text-sm text-yellow-300/70">
                    {formatDateTime(selectedRace.sprint_date, selectedRace.sprint_time || '')}
                  </p>
                </div>
              )}
              {selectedRace.qualifying_date && (
                <div className="text-center p-4 bg-blue-950/30 rounded-lg border border-blue-500/20">
                  <p className="font-semibold text-blue-200">⏱️ Qualifying</p>
                  <p className="text-sm text-blue-300/70">
                    {formatDateTime(selectedRace.qualifying_date, selectedRace.qualifying_time || '')}
                  </p>
                </div>
              )}
              <div className="text-center p-4 bg-green-950/30 rounded-lg border border-green-500/20">
                <p className="font-semibold text-green-200">🏁 Race</p>
                <p className="text-sm text-green-300/70">
                  {formatDateTime(selectedRace.race_date, selectedRace.race_time)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results Tabs */}
        <Tabs defaultValue="race" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-black/40 border-red-500/30">
            <TabsTrigger 
              value="race" 
              className="data-[state=active]:bg-red-600 data-[state=active]:text-white text-red-200"
              disabled={raceResults.length === 0}
            >
              🏁 Race Results {raceResults.length > 0 && `(${raceResults.length})`}
            </TabsTrigger>
            <TabsTrigger 
              value="qualifying"
              className="data-[state=active]:bg-red-600 data-[state=active]:text-white text-red-200"
              disabled={qualifyingResults.length === 0}
            >
              ⏱️ Qualifying {qualifyingResults.length > 0 && `(${qualifyingResults.length})`}
            </TabsTrigger>
          </TabsList>

          {/* Race Results */}
          <TabsContent value="race">
            <Card className="bg-black/40 border-red-500/30 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white">🏁 Race Results</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="text-center py-8">
                    <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-red-500"></div>
                    <p className="text-red-200 mt-2">Loading results...</p>
                  </div>
                ) : raceResults.length === 0 ? (
                  <p className="text-center text-red-300/70 py-8">No race results available yet</p>
                ) : (
                  <div className="space-y-2">
                    {raceResults.map((result: RaceResult) => (
                      <div 
                        key={result.id}
                        className="flex items-center gap-4 p-4 bg-red-950/20 rounded-lg border border-red-500/20 hover:bg-red-950/30 transition-colors"
                      >
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold ${getPositionColor(result.position)}`}>
                          {result.position || 'DNF'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-white truncate">{result.driver_name}</p>
                          <p className="text-sm text-red-300/70">{result.team}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-white font-mono">{result.time || 'DNF'}</p>
                          <div className="flex gap-2 text-xs">
                            {result.points !== null && result.points > 0 && (
                              <span className="bg-green-600/80 text-white px-2 py-1 rounded">
                                {result.points} pts
                              </span>
                            )}
                            {result.fastest_lap && (
                              <span className="bg-purple-600/80 text-white px-2 py-1 rounded">
                                🔥 FL
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Qualifying Results */}
          <TabsContent value="qualifying">
            <Card className="bg-black/40 border-red-500/30 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white">⏱️ Qualifying Results</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="text-center py-8">
                    <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-red-500"></div>
                    <p className="text-red-200 mt-2">Loading results...</p>
                  </div>
                ) : qualifyingResults.length === 0 ? (
                  <p className="text-center text-red-300/70 py-8">No qualifying results available yet</p>
                ) : (
                  <div className="space-y-2">
                    {qualifyingResults.map((result: RaceResult) => (
                      <div 
                        key={result.id}
                        className="flex items-center gap-4 p-4 bg-blue-950/20 rounded-lg border border-blue-500/20 hover:bg-blue-950/30 transition-colors"
                      >
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold ${getPositionColor(result.position)}`}>
                          {result.position}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-white truncate">{result.driver_name}</p>
                          <p className="text-sm text-blue-300/70">{result.team}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-white font-mono">{result.time}</p>
                          <p className="text-xs text-blue-300/70">Grid: P{result.grid_position}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

export default App;