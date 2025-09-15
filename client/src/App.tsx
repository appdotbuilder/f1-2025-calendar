import { useState, useEffect, useCallback } from 'react';
import { trpc } from '@/utils/trpc';
import { RaceCalendar } from '@/components/RaceCalendar';
import { RaceDetail } from '@/components/RaceDetail';
import type { Race } from '../../server/src/schema';
import './App.css';

function App() {
  const [selectedRaceId, setSelectedRaceId] = useState<number | null>(null);
  const [races, setRaces] = useState<Race[]>([]);
  const [selectedRace, setSelectedRace] = useState<Race | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load races for 2025 season
  const loadRaces = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await trpc.getRacesBySeason.query({ season: 2025 });
      setRaces(result);
    } catch (error) {
      console.error('Failed to load races:', error);
      setError('Failed to load race calendar');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load specific race details
  const loadRaceDetails = useCallback(async (raceId: number) => {
    try {
      const race = await trpc.getRaceById.query({ id: raceId });
      setSelectedRace(race);
    } catch (error) {
      console.error('Failed to load race details:', error);
      setError('Failed to load race details');
    }
  }, []);

  useEffect(() => {
    loadRaces();
  }, [loadRaces]);

  // Handle race selection
  const handleRaceSelect = useCallback((raceId: number) => {
    setSelectedRaceId(raceId);
    loadRaceDetails(raceId);
  }, [loadRaceDetails]);

  // Handle back to calendar
  const handleBackToCalendar = useCallback(() => {
    setSelectedRaceId(null);
    setSelectedRace(null);
  }, []);

  // Animated background particles
  const Particles = () => (
    <div className="particles">
      {Array.from({ length: 50 }, (_, i) => (
        <div
          key={i}
          className="particle"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 6}s`,
            animationDuration: `${4 + Math.random() * 4}s`,
          }}
        />
      ))}
    </div>
  );

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Particles />
        <div className="glass-card rounded-lg p-8 text-center max-w-md">
          <h2 className="text-2xl font-bold text-red-400 mb-4">⚠️ Error</h2>
          <p className="text-gray-300">{error}</p>
          <button
            onClick={loadRaces}
            className="mt-4 px-6 py-2 f1-gradient text-white rounded-lg font-medium hover:opacity-90 transition-opacity"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-white">
      <Particles />
      
      {/* Header */}
      <header className="glass-card border-b border-white/10 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 f1-gradient rounded-lg flex items-center justify-center">
                <span className="text-2xl font-bold">🏎️</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                  Formula 1 Calendar
                </h1>
                <p className="text-gray-400">2025 Season</p>
              </div>
            </div>
            
            {selectedRaceId && (
              <button
                onClick={handleBackToCalendar}
                className="glass-card px-6 py-2 rounded-lg hover:glass-card-hover transition-all duration-200 flex items-center space-x-2"
              >
                <span>←</span>
                <span>Back to Calendar</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {isLoading ? (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="glass-card rounded-lg p-8 text-center">
              <div className="w-16 h-16 f1-gradient rounded-full mx-auto mb-4 animate-pulse"></div>
              <h2 className="text-xl font-semibold mb-2">Loading Calendar</h2>
              <p className="text-gray-400">Fetching 2025 race schedule...</p>
            </div>
          </div>
        ) : selectedRaceId && selectedRace ? (
          <RaceDetail race={selectedRace} />
        ) : (
          <RaceCalendar races={races} onRaceSelect={handleRaceSelect} />
        )}
      </main>
    </div>
  );
}

export default App;