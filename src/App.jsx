import { useState, useEffect } from 'react';
import { Search, Users, Trophy, Plus, Trash2, AlertCircle, RefreshCw } from 'lucide-react';

export default function FantasyBasketball() {
  const [teams, setTeams] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [updatingStats, setUpdatingStats] = useState(false);
  const [selectedWeek, setSelectedWeek] = useState(3); // Default to Week 3

  // Week 1 started on 10/20/2025
  const SEASON_START = new Date('2025-10-20');
  
  const getWeekDates = (weekNumber) => {
    const startDate = new Date(SEASON_START);
    startDate.setDate(startDate.getDate() + (weekNumber - 1) * 7);
    
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 6); // Monday to Sunday
    
    return {
      start: startDate.toISOString().split('T')[0],
      end: endDate.toISOString().split('T')[0]
    };
  };

  // Load teams from localStorage on mount
  useEffect(() => {
    const savedTeams = localStorage.getItem('fantasyTeams');
    if (savedTeams) {
      try {
        setTeams(JSON.parse(savedTeams));
      } catch (error) {
        console.error('Error loading teams:', error);
        setTeams([]);
      }
    }
  }, []);

  // Save teams to localStorage whenever they change
  useEffect(() => {
    if (teams.length > 0) {
      localStorage.setItem('fantasyTeams', JSON.stringify(teams));
    }
  }, [teams]);

  const fetchPlayer = async (name) => {
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch(`/api/player?search=${encodeURIComponent(name)}`);
      
      if (!response.ok) {
        throw new Error('API request failed');
      }
      
      const json = await response.json();
      
      if (json.data && json.data.length > 0) {
        // Filter for only active players (players with a current team)
        const activePlayers = json.data.filter(player => 
          player.team && player.team.id && player.team.abbreviation
        );
        
        const players = activePlayers.map(player => ({
          id: player.id,
          name: `${player.first_name} ${player.last_name}`,
          position: player.position || 'N/A',
          team_abbr: player.team?.abbreviation || 'FA'
        }));
        setSearchResults(players);
        setShowDropdown(true);
        setLoading(false);
        return players;
      }
      
      setSearchResults([]);
      setShowDropdown(false);
      setLoading(false);
      return null;
    } catch (err) {
      console.error('Fetch error:', err);
      setError('Failed to fetch player. Please try again.');
      setSearchResults([]);
      setShowDropdown(false);
      setLoading(false);
      return null;
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setError('Please enter a player name');
      return;
    }

    if (!selectedTeam) {
      setError('Please select a team first');
      return;
    }

    await fetchPlayer(searchQuery);
  };

  const addPlayerToTeam = (player) => {
    const team = teams.find(t => t.id === selectedTeam);
    const existing = team.players.find(p => p.id === player.id);

    if (existing) {
      setError(`${player.name} is already on this team`);
      setShowDropdown(false);
      return;
    }

    const updatedTeams = teams.map(t => {
      if (t.id === selectedTeam) {
        return {
          ...t,
          players: [...t.players, { 
            ...player, 
            stats: {
              pts: 0,
              reb: 0,
              ast: 0,
              stl: 0,
              blk: 0,
              turnover: 0,
              fg3m: 0
            },
            fantasyPoints: 0,
            role: 'Bench',
            addedDate: new Date().toISOString()
          }]
        };
      }
      return t;
    });

    setTeams(updatedTeams);
    setSearchQuery('');
    setSearchResults([]);
    setShowDropdown(false);
    setError('');
  };

  const fetchPlayerStats = async (playerId) => {
    try {
      const weekDates = getWeekDates(selectedWeek);
      const response = await fetch(
        `/api/games?player_id=${playerId}&start_date=${weekDates.start}&end_date=${weekDates.end}`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch stats');
      }
      
      const json = await response.json();
      
      if (json.data && json.data.length > 0) {
        // Sort games by date to get the first game of the week
        const sortedGames = json.data.sort((a, b) => 
          new Date(a.game.date) - new Date(b.game.date)
        );
        
        const firstGame = sortedGames[0];
        const gameDate = new Date(firstGame.game.date).toLocaleDateString();
        
        // Determine opponent
        let opponent = 'Unknown';
        if (firstGame.game.home_team_id === firstGame.team.id) {
          // Home game - find visitor team abbreviation
          opponent = `vs ${firstGame.game.visitor_team_id === firstGame.team.id ? 'Unknown' : 'OPP'}`;
          // We need to look up the team abbreviation or use a simpler format
          opponent = `Home Game`;
        } else {
          // Away game
          opponent = `Away Game`;
        }
        
        return {
          pts: firstGame.pts || 0,
          reb: firstGame.reb || 0,
          ast: firstGame.ast || 0,
          stl: firstGame.stl || 0,
          blk: firstGame.blk || 0,
          turnover: firstGame.turnover || 0,
          fg3m: firstGame.fg3m || 0,
          gameInfo: `${opponent} on ${gameDate}`
        };
      }
      return null;
    } catch (error) {
      console.error('Error fetching stats:', error);
      return null;
    }
  };

  const calculateFantasyPoints = (stats) => {
    if (!stats) return 0;
    
    // Fantasy point calculations
    const blockPoints = (stats.blk || 0) * 2;
    const stealPoints = (stats.stl || 0) * 2;
    const reboundPoints = (stats.reb || 0) * 1;
    const assistPoints = (stats.ast || 0) * 1;
    const turnoverPoints = (stats.turnover || 0) * -1;
    const pointsScored = (stats.pts || 0) * 1;
    const threePtBonus = (stats.fg3m || 0) * 1;
    
    return blockPoints + stealPoints + reboundPoints + assistPoints + 
           turnoverPoints + pointsScored + threePtBonus;
  };

  const updateAllStats = async () => {
    setUpdatingStats(true);
    setError('');
    
    const updatedTeams = await Promise.all(
      teams.map(async (team) => {
        const updatedPlayers = await Promise.all(
          team.players.map(async (player) => {
            const stats = await fetchPlayerStats(player.id);
            if (stats) {
              const fantasyPoints = calculateFantasyPoints(stats);
              return { ...player, stats, fantasyPoints };
            }
            return player;
          })
        );
        return { ...team, players: updatedPlayers };
      })
    );
    
    setTeams(updatedTeams);
    setUpdatingStats(false);
  };

  const removePlayer = (teamId, playerId) => {
    const updatedTeams = teams.map(t => {
      if (t.id === teamId) {
        return {
          ...t,
          players: t.players.filter(p => p.id !== playerId)
        };
      }
      return t;
    });
    setTeams(updatedTeams);
  };

  const updatePlayerRole = (teamId, playerId, newRole) => {
    const updatedTeams = teams.map(t => {
      if (t.id === teamId) {
        return {
          ...t,
          players: t.players.map(p => 
            p.id === playerId ? { ...p, role: newRole } : p
          )
        };
      }
      return t;
    });
    setTeams(updatedTeams);
  };

  const createTeam = () => {
    const teamName = prompt('Enter team name:');
    if (!teamName || !teamName.trim()) return;

    const newTeam = {
      id: Date.now(),
      name: teamName.trim(),
      players: [],
      createdDate: new Date().toISOString()
    };
    setTeams([...teams, newTeam]);
    setSelectedTeam(newTeam.id);
  };

  const deleteTeam = (teamId) => {
    if (!confirm('Are you sure you want to delete this team?')) return;
    setTeams(teams.filter(t => t.id !== teamId));
    if (selectedTeam === teamId) {
      setSelectedTeam(null);
    }
  };

  const getStarters = (players) => players.filter(p => p.role === 'Starter');
  const getBench = (players) => players.filter(p => p.role === 'Bench');

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-4 md:p-6 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <Trophy className="text-orange-600" size={32} />
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Fantasy Basketball Tracker</h1>
          </div>
          
          {/* Search Bar */}
          <div className="relative">
            <div className="flex flex-col md:flex-row gap-2 mb-4">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Search NBA player (e.g., LeBron James)..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
              <select
                value={selectedTeam || ''}
                onChange={(e) => setSelectedTeam(Number(e.target.value))}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="">Select Team</option>
                {teams.map(t => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
              <button
                onClick={handleSearch}
                disabled={loading}
                className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:bg-gray-400 flex items-center justify-center gap-2 transition-colors"
              >
                <Search size={20} />
                {loading ? 'Searching...' : 'Search'}
              </button>
            </div>

            {/* Dropdown Results */}
            {showDropdown && searchResults.length > 0 && (
              <div className="absolute z-10 w-full md:w-2/3 bg-white border border-gray-300 rounded-lg shadow-lg max-h-80 overflow-y-auto">
                {searchResults.map((player) => (
                  <button
                    key={player.id}
                    onClick={() => addPlayerToTeam(player)}
                    className="w-full px-4 py-3 text-left hover:bg-orange-50 border-b border-gray-200 last:border-b-0 transition-colors"
                  >
                    <div className="font-semibold text-gray-800">{player.name}</div>
                    <div className="text-sm text-gray-600">
                      {player.position} | {player.team_abbr}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2 mb-4">
              <AlertCircle size={20} />
              <span>{error}</span>
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            <button
              onClick={createTeam}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2 transition-colors"
            >
              <Plus size={20} />
              Create New Team
            </button>

            <select
              value={selectedWeek}
              onChange={(e) => setSelectedWeek(Number(e.target.value))}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(week => (
                <option key={week} value={week}>Week {week}</option>
              ))}
            </select>

            <button
              onClick={updateAllStats}
              disabled={updatingStats || teams.length === 0}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 flex items-center gap-2 transition-colors"
            >
              <RefreshCw size={20} className={updatingStats ? 'animate-spin' : ''} />
              {updatingStats ? 'Updating Stats...' : 'Update All Stats'}
            </button>
          </div>
        </div>

        {/* Teams Grid */}
        {teams.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {teams.map(team => {
              const starters = getStarters(team.players);
              const bench = getBench(team.players);
              
              return (
                <div key={team.id} className="bg-white rounded-lg shadow-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Users className="text-orange-600" size={24} />
                      <h2 className="text-xl md:text-2xl font-bold text-gray-800">{team.name}</h2>
                    </div>
                    <button
                      onClick={() => deleteTeam(team.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete team"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>

                  {/* Starters Section */}
                  {starters.length > 0 && (
                    <div className="mb-4">
                      <h3 className="text-sm font-semibold text-gray-700 mb-2 uppercase tracking-wide">Starters</h3>
                      <div className="space-y-2">
                        {starters.map(player => (
                          <PlayerCard 
                            key={player.id} 
                            player={player} 
                            teamId={team.id}
                            onRemove={removePlayer}
                            onRoleChange={updatePlayerRole}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Bench Section */}
                  {bench.length > 0 && (
                    <div className="mb-4">
                      <h3 className="text-sm font-semibold text-gray-700 mb-2 uppercase tracking-wide">Bench</h3>
                      <div className="space-y-2">
                        {bench.map(player => (
                          <PlayerCard 
                            key={player.id} 
                            player={player} 
                            teamId={team.id}
                            onRemove={removePlayer}
                            onRoleChange={updatePlayerRole}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {team.players.length === 0 && (
                    <p className="text-gray-500 italic text-center py-8">No players yet. Search and add players above!</p>
                  )}

                  <div className="mt-4 pt-4 border-t border-gray-200 flex justify-between text-sm text-gray-600">
                    <span>Total Players: {team.players.length}</span>
                    <span>Starters: {starters.length}</span>
                    <span className="font-bold text-orange-600">
                      Total FP: {starters.reduce((sum, p) => sum + (p.fantasyPoints || 0), 0).toFixed(1)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-lg p-12 text-center">
            <Users className="mx-auto text-gray-400 mb-4" size={48} />
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No teams yet</h3>
            <p className="text-gray-600 mb-4">Create your first team to start building your fantasy roster!</p>
            <button
              onClick={createTeam}
              className="px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 inline-flex items-center gap-2 transition-colors"
            >
              <Plus size={20} />
              Create Team
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function PlayerCard({ player, teamId, onRemove, onRoleChange }) {
  return (
    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
      <div className="flex-1">
        <div className="font-semibold text-gray-800">{player.name}</div>
        <div className="text-sm text-gray-600">
          {player.position} | {player.team_abbr}
        </div>
        {player.stats && player.stats.pts > 0 && (
          <>
            <div className="text-xs text-gray-500 mt-1">
              PTS: {player.stats.pts?.toFixed(1)} | REB: {player.stats.reb?.toFixed(1)} | AST: {player.stats.ast?.toFixed(1)} | 
              STL: {player.stats.stl?.toFixed(1)} | BLK: {player.stats.blk?.toFixed(1)} | TO: {player.stats.turnover?.toFixed(1)} | 
              3PM: {player.stats.fg3m?.toFixed(1)}
            </div>
            {player.stats.gameInfo && (
              <div className="text-xs text-blue-600 mt-1 font-medium">
                {player.stats.gameInfo}
              </div>
            )}
          </>
        )}
        <div className="text-sm font-bold text-orange-600 mt-1">
          Fantasy Points: {player.fantasyPoints?.toFixed(1) || '0.0'}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <select
          value={player.role}
          onChange={(e) => onRoleChange(teamId, player.id, e.target.value)}
          className="text-sm px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
        >
          <option value="Starter">Starter</option>
          <option value="Bench">Bench</option>
        </select>
        <button
          onClick={() => onRemove(teamId, player.id)}
          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          title="Remove player"
        >
          <Trash2 size={18} />
        </button>
      </div>
    </div>
  );
}