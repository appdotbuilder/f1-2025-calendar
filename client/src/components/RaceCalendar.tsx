import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import type { Race } from '../../../server/src/schema';

interface RaceCalendarProps {
  races: Race[];
  onRaceSelect: (raceId: number) => void;
}

export function RaceCalendar({ races, onRaceSelect }: RaceCalendarProps) {
  // Helper function to determine race status
  const getRaceStatus = (race: Race): 'upcoming' | 'live' | 'completed' => {
    const now = new Date();
    const raceDateTime = new Date(`${race.race_date.toDateString()} ${race.race_time}`);
    
    if (raceDateTime > now) {
      return 'upcoming';
    } else if (raceDateTime.toDateString() === now.toDateString()) {
      return 'live';
    } else {
      return 'completed';
    }
  };

  // Helper function to format date
  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  // Helper function to format time
  const formatTime = (time: string): string => {
    return time;
  };

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

  if (races.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="glass-card rounded-lg p-8 max-w-md mx-auto">
          <div className="text-6xl mb-4">🏁</div>
          <h2 className="text-2xl font-bold mb-2">No Races Scheduled</h2>
          <p className="text-gray-400">The 2025 F1 calendar is not available yet.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Calendar Header */}
      <div className="text-center mb-8">
        <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-red-500 via-pink-500 to-red-600 bg-clip-text text-transparent">
          2025 Formula 1 World Championship
        </h2>
        <p className="text-gray-400 text-lg">
          {races.length} races • {races.filter(r => getRaceStatus(r) === 'completed').length} completed
        </p>
      </div>

      {/* Race Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {races.map((race: Race) => {
          const status = getRaceStatus(race);
          
          return (
            <Card
              key={race.id}
              className="glass-card hover:glass-card-hover transition-all duration-300 cursor-pointer transform hover:scale-105 border-0"
              onClick={() => onRaceSelect(race.id)}
            >
              <CardContent className="p-6">
                {/* Race Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{getFlagEmoji(race.country)}</span>
                    <div>
                      <h3 className="text-xl font-bold text-white">{race.name}</h3>
                      <p className="text-gray-400 text-sm">Round {race.round}</p>
                    </div>
                  </div>
                  
                  <Badge
                    className={`px-3 py-1 text-xs font-medium border ${
                      status === 'upcoming' ? 'status-upcoming' :
                      status === 'live' ? 'status-live' :
                      'status-completed'
                    }`}
                  >
                    {status === 'upcoming' ? 'Upcoming' :
                     status === 'live' ? 'Live' : 'Completed'}
                  </Badge>
                </div>

                {/* Circuit Info */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center space-x-2 text-gray-300">
                    <span className="text-sm">🏁</span>
                    <span className="text-sm">{race.circuit_name}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-gray-300">
                    <span className="text-sm">📍</span>
                    <span className="text-sm">{race.city}, {race.country}</span>
                  </div>
                </div>

                {/* Race Date & Time */}
                <div className="bg-black/20 rounded-lg p-3 mb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-400 uppercase tracking-wide">Race</p>
                      <p className="text-white font-medium">
                        {formatDate(race.race_date)} • {formatTime(race.race_time)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-400">Local Time</p>
                    </div>
                  </div>
                </div>

                {/* Quick Session Info */}
                <div className="flex flex-wrap gap-2">
                  {race.practice1_date && (
                    <span className="px-2 py-1 bg-blue-500/20 text-blue-300 text-xs rounded border border-blue-500/30">
                      FP1
                    </span>
                  )}
                  {race.practice2_date && (
                    <span className="px-2 py-1 bg-blue-500/20 text-blue-300 text-xs rounded border border-blue-500/30">
                      FP2
                    </span>
                  )}
                  {race.practice3_date && (
                    <span className="px-2 py-1 bg-blue-500/20 text-blue-300 text-xs rounded border border-blue-500/30">
                      FP3
                    </span>
                  )}
                  {race.qualifying_date && (
                    <span className="px-2 py-1 bg-yellow-500/20 text-yellow-300 text-xs rounded border border-yellow-500/30">
                      Qualifying
                    </span>
                  )}
                  {race.sprint_date && (
                    <span className="px-2 py-1 bg-green-500/20 text-green-300 text-xs rounded border border-green-500/30">
                      Sprint
                    </span>
                  )}
                </div>

                {/* Click indicator */}
                <div className="flex items-center justify-end mt-4 text-gray-500 text-xs">
                  <span>Click for details →</span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}