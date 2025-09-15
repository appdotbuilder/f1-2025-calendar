import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { RaceResult, ResultType } from '../../../server/src/schema';

interface RaceResultsProps {
  sessionType: ResultType;
  sessionLabel: string;
  results: RaceResult[];
  loading: boolean;
  hasSessionPassed: boolean;
  onLoadResults: () => void;
}

export function RaceResults({
  sessionType,
  sessionLabel,
  results,
  loading,
  hasSessionPassed,
  onLoadResults
}: RaceResultsProps) {


  // Helper function to get team color
  const getTeamColor = (team: string): string => {
    const teamColors: Record<string, string> = {
      'Red Bull Racing': '#0600ef',
      'Mercedes': '#00d2be',
      'Ferrari': '#dc143c',
      'McLaren': '#ff8700',
      'Alpine': '#0090ff',
      'Aston Martin': '#006f62',
      'Williams': '#005aff',
      'AlphaTauri': '#2b4562',
      'Alfa Romeo': '#900000',
      'Haas': '#ffffff'
    };
    return teamColors[team] || '#6b7280';
  };

  // Helper function to format time display
  const formatTime = (time: string | null): string => {
    if (!time) return '-';
    if (time.startsWith('+')) return time;
    if (['DNF', 'DNS', 'DSQ', 'NC'].includes(time)) return time;
    return time;
  };

  // Helper function to get points color
  const getPointsColor = (points: number | null): string => {
    if (!points || points === 0) return 'text-gray-400';
    if (points >= 25) return 'text-yellow-400';
    if (points >= 18) return 'text-gray-300';
    if (points >= 15) return 'text-amber-600';
    return 'text-gray-500';
  };

  if (!hasSessionPassed) {
    return (
      <div className="text-center py-12">
        <div className="glass-card rounded-lg p-8 max-w-md mx-auto">
          <div className="text-6xl mb-4">⏰</div>
          <h3 className="text-xl font-semibold mb-2">{sessionLabel} Not Started</h3>
          <p className="text-gray-400">
            Results will be available after the session completes.
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="glass-card rounded-lg p-8 max-w-md mx-auto">
          <div className="w-16 h-16 f1-gradient rounded-full mx-auto mb-4 animate-pulse"></div>
          <h3 className="text-xl font-semibold mb-2">Loading Results</h3>
          <p className="text-gray-400">Fetching {sessionLabel.toLowerCase()} data...</p>
        </div>
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="glass-card rounded-lg p-8 max-w-md mx-auto">
          <div className="text-6xl mb-4">📊</div>
          <h3 className="text-xl font-semibold mb-2">No Results Available</h3>
          <p className="text-gray-400 mb-4">
            {sessionLabel} results haven't been published yet.
          </p>
          <Button
            onClick={onLoadResults}
            className="f1-gradient hover:opacity-90"
          >
            Refresh Results
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold text-white">
          {sessionLabel} Results
        </h3>
        <Button
          onClick={onLoadResults}
          variant="outline"
          size="sm"
          className="glass-card border-white/20 hover:glass-card-hover"
        >
          🔄 Refresh
        </Button>
      </div>

      {/* Results Table */}
      <div className="glass-card rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-white/10 hover:bg-white/5">
              <TableHead className="text-gray-300 font-semibold">Pos</TableHead>
              <TableHead className="text-gray-300 font-semibold">Driver</TableHead>
              <TableHead className="text-gray-300 font-semibold">Team</TableHead>
              <TableHead className="text-gray-300 font-semibold">Time</TableHead>
              {sessionType === 'race' && (
                <>
                  <TableHead className="text-gray-300 font-semibold">Points</TableHead>
                  <TableHead className="text-gray-300 font-semibold">Laps</TableHead>
                </>
              )}
              {(sessionType === 'race' || sessionType === 'qualifying') && (
                <TableHead className="text-gray-300 font-semibold">Grid</TableHead>
              )}
              <TableHead className="text-gray-300 font-semibold">FL</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {results.map((result: RaceResult, index: number) => (
              <TableRow
                key={result.id}
                className="border-white/5 hover:bg-white/5 transition-colors"
              >
                <TableCell className="font-medium">
                  <div className="flex items-center space-x-2">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                        result.position === 1 ? 'bg-yellow-500 text-black' :
                        result.position === 2 ? 'bg-gray-400 text-black' :
                        result.position === 3 ? 'bg-amber-600 text-black' :
                        'bg-gray-600 text-white'
                      }`}
                    >
                      {result.position || index + 1}
                    </div>
                  </div>
                </TableCell>
                
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <span className="font-semibold text-white">{result.driver_name}</span>
                    {result.fastest_lap && (
                      <Badge className="bg-purple-500/20 text-purple-300 text-xs border-purple-500/30">
                        FL
                      </Badge>
                    )}
                  </div>
                </TableCell>
                
                <TableCell>
                  <div 
                    className="px-2 py-1 rounded text-xs font-medium text-white"
                    style={{ backgroundColor: getTeamColor(result.team) + '40' }}
                  >
                    {result.team}
                  </div>
                </TableCell>
                
                <TableCell className="font-mono text-sm">
                  <span className={
                    result.time && ['DNF', 'DNS', 'DSQ'].includes(result.time) 
                      ? 'text-red-400' 
                      : 'text-gray-300'
                  }>
                    {formatTime(result.time)}
                  </span>
                </TableCell>
                
                {sessionType === 'race' && (
                  <>
                    <TableCell>
                      <span className={`font-semibold ${getPointsColor(result.points)}`}>
                        {result.points || '-'}
                      </span>
                    </TableCell>
                    <TableCell className="text-gray-400">
                      {result.laps || '-'}
                    </TableCell>
                  </>
                )}
                
                {(sessionType === 'race' || sessionType === 'qualifying') && (
                  <TableCell className="text-gray-400">
                    {result.grid_position || '-'}
                  </TableCell>
                )}
                
                <TableCell className="text-center">
                  {result.fastest_lap ? (
                    <span className="text-purple-400 text-lg">💨</span>
                  ) : (
                    <span className="text-gray-600">-</span>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Session Summary */}
      {sessionType === 'race' && results.length > 0 && (
        <div className="glass-card rounded-lg p-4">
          <h4 className="text-lg font-semibold text-white mb-3">Race Summary</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-yellow-400">
                {results.find(r => r.position === 1)?.driver_name || 'TBD'}
              </p>
              <p className="text-sm text-gray-400">Winner</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-purple-400">
                {results.find(r => r.fastest_lap)?.driver_name || 'TBD'}
              </p>
              <p className="text-sm text-gray-400">Fastest Lap</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-blue-400">
                {results.filter(r => r.laps && r.laps > 0).length}
              </p>
              <p className="text-sm text-gray-400">Finishers</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-red-400">
                {results.filter(r => r.time === 'DNF').length}
              </p>
              <p className="text-sm text-gray-400">DNF</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}