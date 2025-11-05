import { useState, useEffect } from 'react';
import { Search, Users, Trophy, Plus, Trash2, AlertCircle, RefreshCw, BarChart3 } from 'lucide-react';

export default function FantasyBasketball() {
  const [teams, setTeams] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [updatingStats, setUpdatingStats] = useState(false);
  const [selectedWeek, setSelectedWeek] = useState(3);
  const [viewMode, setViewMode] = useState('all');
  const [viewingTeamId, setViewingTeamId] = useState(null);
  const [currentPage, setCurrentPage] = useState('teams'); // 'teams', 'standings', or 'matchups'

  const SEASON_START = new Date('2025-10-20');
  
  // Mapping is now identity since teams use real names
  const nameMapping = {
    "Aidan": "Aidan",
    "Zach": "Zach",
    "Austin": "Austin",
    "Chase": "Chase",
    "Chris": "Chris",
    "Hayden": "Hayden",
    "Keegan": "Keegan",
    "Alex": "Alex",
    "Brody": "Brody",
    "Sean": "Sean"
  };
  
  // Weekly matchup schedule data (using real names for display)
  const matchupSchedule = {
    1: [
      { team1: "Aidan", team2: "Chris" },
      { team1: "Chase", team2: "Austin" },
      { team1: "Hayden", team2: "Brody" },
      { team1: "Keegan", team2: "Alex" },
      { team1: "Zach", team2: "Sean" }
    ],
    2: [
      { team1: "Aidan", team2: "Brody" },
      { team1: "Chris", team2: "Austin" },
      { team1: "Alex", team2: "Chase" },
      { team1: "Hayden", team2: "Sean" },
      { team1: "Keegan", team2: "Zach" }
    ],
    3: [
      { team1: "Aidan", team2: "Sean" },
      { team1: "Chris", team2: "Chase" },
      { team1: "Brody", team2: "Austin" },
      { team1: "Hayden", team2: "Keegan" },
      { team1: "Alex", team2: "Zach" }
    ],
    4: [
      { team1: "Aidan", team2: "Austin" },
      { team1: "Zach", team2: "Chris" },
      { team1: "Chase", team2: "Brody" },
      { team1: "Hayden", team2: "Alex" },
      { team1: "Keegan", team2: "Sean" }
    ],
    5: [
      { team1: "Aidan", team2: "Chase" },
      { team1: "Chris", team2: "Brody" },
      { team1: "Keegan", team2: "Austin" },
      { team1: "Hayden", team2: "Zach" },
      { team1: "Alex", team2: "Sean" }
    ],
    6: [
      { team1: "Aidan", team2: "Alex" },
      { team1: "Zach", team2: "Austin" },
      { team1: "Chris", team2: "Sean" },
      { team1: "Hayden", team2: "Chase" },
      { team1: "Keegan", team2: "Brody" }
    ],
    7: [
      { team1: "Aidan", team2: "Hayden" },
      { team1: "Chris", team2: "Alex" },
      { team1: "Austin", team2: "Sean" },
      { team1: "Keegan", team2: "Chase" },
      { team1: "Brody", team2: "Zach" }
    ],
    8: [
      { team1: "Aidan", team2: "Keegan" },
      { team1: "Chris", team2: "Hayden" },
      { team1: "Chase", team2: "Zach" },
      { team1: "Austin", team2: "Alex" },
      { team1: "Brody", team2: "Sean" }
    ],
    9: [
      { team1: "Aidan", team2: "Chase" },
      { team1: "Chris", team2: "Brody" },
      { team1: "Hayden", team2: "Austin" },
      { team1: "Keegan", team2: "Alex" },
      { team1: "Zach", team2: "Sean" }
    ],
    10: [
      { team1: "Aidan", team2: "Chris" },
      { team1: "Chase", team2: "Austin" },
      { team1: "Hayden", team2: "Sean" },
      { team1: "Brody", team2: "Alex" },
      { team1: "Keegan", team2: "Zach" }
    ],
    11: [
      { team1: "Aidan", team2: "Brody" },
      { team1: "Chris", team2: "Austin" },
      { team1: "Sean", team2: "Chase" },
      { team1: "Hayden", team2: "Keegan" },
      { team1: "Alex", team2: "Zach" }
    ],
    12: [
      { team1: "Aidan", team2: "Zach" },
      { team1: "Chris", team2: "Chase" },
      { team1: "Brody", team2: "Austin" },
      { team1: "Hayden", team2: "Alex" },
      { team1: "Keegan", team2: "Sean" }
    ],
    13: [
      { team1: "Aidan", team2: "Austin" },
      { team1: "Chris", team2: "Keegan" },
      { team1: "Chase", team2: "Brody" },
      { team1: "Hayden", team2: "Zach" },
      { team1: "Alex", team2: "Sean" }
    ],
    14: [
      { team1: "Aidan", team2: "Sean" },
      { team1: "Alex", team2: "Chase" },
      { team1: "Keegan", team2: "Austin" },
      { team1: "Hayden", team2: "Brody" },
      { team1: "Zach", team2: "Chris" }
    ],
    15: [
      { team1: "Aidan", team2: "Alex" },
      { team1: "Zach", team2: "Austin" },
      { team1: "Chris", team2: "Sean" },
      { team1: "Hayden", team2: "Chase" },
      { team1: "Keegan", team2: "Brody" }
    ],
    16: [
      { team1: "Aidan", team2: "Hayden" },
      { team1: "Chris", team2: "Alex" },
      { team1: "Austin", team2: "Sean" },
      { team1: "Keegan", team2: "Chase" },
      { team1: "Brody", team2: "Zach" }
    ],
    17: [
      { team1: "Aidan", team2: "Keegan" },
      { team1: "Chris", team2: "Hayden" },
      { team1: "Chase", team2: "Zach" },
      { team1: "Austin", team2: "Alex" },
      { team1: "Brody", team2: "Sean" }
    ],
    18: [
      { team1: "Aidan", team2: "Zach" },
      { team1: "Chris", team2: "Keegan" },
      { team1: "Chase", team2: "Sean" },
      { team1: "Hayden", team2: "Austin" },
      { team1: "Brody", team2: "Alex" }
    ],
    19: [
      { team1: "Aidan", team2: "Sean" },
      { team1: "Alex", team2: "Chase" },
      { team1: "Keegan", team2: "Hayden" },
      { team1: "Zach", team2: "Chris" },
      { team1: "Austin", team2: "Keegan" }
    ]
  };
  
  const getWeekDates = (weekNumber) => {
    const startDate = new Date(SEASON_START);
    startDate.setDate(startDate.getDate() + (weekNumber - 1) * 7);
    
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 6);
    
    return {
      start: startDate.toISOString().split('T')[0],
      end: endDate.toISOString().split('T')[0]
    };
  };

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
            starterSlot: null, // null, 'G1', 'G2', 'F1', 'F2', 'C', 'FLEX'
            alternateRank: null, // null, 'G1', 'G2', 'G3', 'G4', 'F1', 'F2', 'F3', 'F4', 'C1', 'C2'
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

  const updatePlayerStarterSlot = (teamId, playerId, slot) => {
    const updatedTeams = teams.map(t => {
      if (t.id === teamId) {
        return {
          ...t,
          players: t.players.map(p => 
            p.id === playerId ? { ...p, starterSlot: slot, role: slot ? 'Starter' : 'Bench' } : p
          )
        };
      }
      return t;
    });
    setTeams(updatedTeams);
  };

  const updatePlayerAlternateRank = (teamId, playerId, rank) => {
    const updatedTeams = teams.map(t => {
      if (t.id === teamId) {
        return {
          ...t,
          players: t.players.map(p => 
            p.id === playerId ? { ...p, alternateRank: rank } : p
          )
        };
      }
      return t;
    });
    setTeams(updatedTeams);
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
        const weekDates = getWeekDates(selectedWeek);
        const weekStart = new Date(weekDates.start);
        const weekEnd = new Date(weekDates.end);
        
        const gamesInWeek = json.data.filter(game => {
          const gameDate = new Date(game.game.date);
          return gameDate >= weekStart && gameDate <= weekEnd;
        });
        
        if (gamesInWeek.length === 0) {
          return null;
        }
        
        const sortedGames = gamesInWeek.sort((a, b) => 
          new Date(a.game.date) - new Date(b.game.date)
        );
        
        const firstGame = sortedGames[0];
        
        const gameDateStr = firstGame.game.date;
        const [year, month, day] = gameDateStr.split('-');
        const gameDate = new Date(year, month - 1, day);
        const formattedDate = gameDate.toLocaleDateString('en-US', { 
          month: 'numeric', 
          day: 'numeric', 
          year: 'numeric',
          timeZone: 'America/New_York'
        });
        
        let opponent = 'Unknown';
        if (firstGame.game.home_team_id === firstGame.team.id) {
          opponent = `Home Game`;
        } else {
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
          gameInfo: `${opponent} on ${formattedDate}`
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
            return { 
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
              fantasyPoints: 0 
            };
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
      record: { wins: 0, losses: 0 },
      divisionRecord: { wins: 0, losses: 0 },
      flexPositionType: 'G', // 'G', 'F', or 'C' - which position alternates to use for FLEX
      createdDate: new Date().toISOString()
    };
    setTeams([...teams, newTeam]);
    setSelectedTeam(newTeam.id);
  };

  const updateFlexPositionType = (teamId, positionType) => {
    const updatedTeams = teams.map(t => 
      t.id === teamId ? { ...t, flexPositionType: positionType } : t
    );
    setTeams(updatedTeams);
  };

  const deleteTeam = (teamId) => {
    if (!confirm('Are you sure you want to delete this team?')) return;
    setTeams(teams.filter(t => t.id !== teamId));
    if (selectedTeam === teamId) {
      setSelectedTeam(null);
    }
    if (viewingTeamId === teamId) {
      setViewMode('all');
      setViewingTeamId(null);
    }
  };

  const editTeamName = (teamId) => {
    const team = teams.find(t => t.id === teamId);
    const newName = prompt('Enter new team name:', team.name);
    if (!newName || !newName.trim()) return;

    const updatedTeams = teams.map(t => 
      t.id === teamId ? { ...t, name: newName.trim() } : t
    );
    setTeams(updatedTeams);
  };

  const editTeamRecord = (teamId) => {
    const team = teams.find(t => t.id === teamId);
    const wins = prompt('Enter wins:', team.record?.wins || 0);
    const losses = prompt('Enter losses:', team.record?.losses || 0);
    const divWins = prompt('Enter division wins:', team.divisionRecord?.wins || 0);
    const divLosses = prompt('Enter division losses:', team.divisionRecord?.losses || 0);

    if (wins === null || losses === null || divWins === null || divLosses === null) return;

    const updatedTeams = teams.map(t => 
      t.id === teamId ? { 
        ...t, 
        record: { wins: parseInt(wins) || 0, losses: parseInt(losses) || 0 },
        divisionRecord: { wins: parseInt(divWins) || 0, losses: parseInt(divLosses) || 0 }
      } : t
    );
    setTeams(updatedTeams);
  };

  const viewTeam = (teamId) => {
    setViewingTeamId(teamId);
    setViewMode('single');
  };

  const backToAllTeams = () => {
    setViewMode('all');
    setViewingTeamId(null);
  };

  const getStarters = (players) => players.filter(p => p.starterSlot);
  const getBench = (players) => players.filter(p => !p.starterSlot && !p.alternateRank);
  const getAlternates = (players) => players.filter(p => p.alternateRank);

  const displayTeams = viewMode === 'single' 
    ? teams.filter(t => t.id === viewingTeamId)
    : teams;

  // Calculate team score with alternate replacement logic
  const calculateTeamScore = (team) => {
    const starters = team.players.filter(p => p.starterSlot);
    const alternates = team.players.filter(p => p.alternateRank);
    const flexPositionType = team.flexPositionType || 'G';
    
    let totalScore = 0;
    
    starters.forEach(starter => {
      // Check if starter played (has stats with any counting stats)
      const starterPlayed = starter.stats && starter.stats.pts !== undefined && 
                           (starter.stats.pts > 0 || starter.stats.reb > 0 || 
                            starter.stats.ast > 0 || starter.stats.stl > 0 || 
                            starter.stats.blk > 0);
      
      if (starterPlayed) {
        // Starter played, use their score (even if 0 FP from bad game)
        totalScore += starter.fantasyPoints || 0;
      } else {
        // Starter didn't play (DNP), check for alternates based on their SLOT position
        const slot = starter.starterSlot;
        let replacement = null;
        
        // Determine which alternate ranks to check based on starter slot
        let ranksToCheck = [];
        if (slot === 'G1' || slot === 'G2') {
          ranksToCheck = ['G1', 'G2', 'G3', 'G4'];
        } else if (slot === 'F1' || slot === 'F2') {
          ranksToCheck = ['F1', 'F2', 'F3', 'F4'];
        } else if (slot === 'C') {
          ranksToCheck = ['C1', 'C2'];
        } else if (slot === 'FLEX') {
          // FLEX uses the team's selected position type
          if (flexPositionType === 'G') {
            ranksToCheck = ['G1', 'G2', 'G3', 'G4'];
          } else if (flexPositionType === 'F') {
            ranksToCheck = ['F1', 'F2', 'F3', 'F4'];
          } else if (flexPositionType === 'C') {
            ranksToCheck = ['C1', 'C2'];
          }
        }
        
        // Find the first alternate that played
        for (const rank of ranksToCheck) {
          const alternate = alternates.find(p => p.alternateRank === rank);
          if (alternate && alternate.stats) {
            const alternatePlayed = alternate.stats.pts !== undefined && 
                                   (alternate.stats.pts > 0 || alternate.stats.reb > 0 || 
                                    alternate.stats.ast > 0 || alternate.stats.stl > 0 || 
                                    alternate.stats.blk > 0);
            if (alternatePlayed) {
              replacement = alternate;
              break;
            }
          }
        }
        
        if (replacement) {
          totalScore += replacement.fantasyPoints || 0;
        }
      }
    });
    
    return totalScore;
  };

  const standings = teams.map(team => {
    const weekScore = calculateTeamScore(team);
    const starters = team.players.filter(p => p.role === 'Starter');
    return {
      id: team.id,
      name: team.name,
      weekScore: weekScore,
      totalPlayers: team.players.length,
      starters: starters.length,
      record: team.record || { wins: 0, losses: 0 },
      divisionRecord: team.divisionRecord || { wins: 0, losses: 0 }
    };
  }).sort((a, b) => b.weekScore - a.weekScore);

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-4 md:p-6 mb-6">
          <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <Trophy className="text-orange-600" size={32} />
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Fantasy Basketball</h1>
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={() => { setCurrentPage('teams'); setViewMode('all'); }}
                className={`px-4 py-2 rounded-lg font-semibold transition-colors flex items-center gap-2 ${
                  currentPage === 'teams' 
                    ? 'bg-orange-600 text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                <Users size={20} />
                Teams
              </button>
              <button
                onClick={() => setCurrentPage('standings')}
                className={`px-4 py-2 rounded-lg font-semibold transition-colors flex items-center gap-2 ${
                  currentPage === 'standings' 
                    ? 'bg-orange-600 text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                <BarChart3 size={20} />
                Standings
              </button>
              <button
                onClick={() => setCurrentPage('matchups')}
                className={`px-4 py-2 rounded-lg font-semibold transition-colors flex items-center gap-2 ${
                  currentPage === 'matchups' 
                    ? 'bg-orange-600 text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                <Trophy size={20} />
                Matchups
              </button>
            </div>
          </div>

          {currentPage === 'teams' && (
            <>
              <div className="relative mb-4">
                <div className="flex flex-col md:flex-row gap-2">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    placeholder="Search NBA player..."
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

                {showDropdown && searchResults.length > 0 && (
                  <div className="absolute z-10 w-full md:w-2/3 bg-white border border-gray-300 rounded-lg shadow-lg max-h-80 overflow-y-auto mt-2">
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
            </>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2 mb-4">
              <AlertCircle size={20} />
              <span>{error}</span>
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            {currentPage === 'teams' && (
              <button
                onClick={createTeam}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2 transition-colors"
              >
                <Plus size={20} />
                Create Team
              </button>
            )}

            <select
              value={selectedWeek}
              onChange={(e) => setSelectedWeek(Number(e.target.value))}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19].map(week => (
                <option key={week} value={week}>Week {week}</option>
              ))}
            </select>

            <button
              onClick={updateAllStats}
              disabled={updatingStats || teams.length === 0}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 flex items-center gap-2 transition-colors"
            >
              <RefreshCw size={20} className={updatingStats ? 'animate-spin' : ''} />
              {updatingStats ? 'Updating...' : 'Update Stats'}
            </button>
          </div>
        </div>

        {currentPage === 'teams' && (
          <>
            {teams.length > 0 ? (
              <>
                {viewMode === 'single' && (
                  <button
                    onClick={backToAllTeams}
                    className="mb-4 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    ← Back to All Teams
                  </button>
                )}
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {displayTeams.map(team => {
                    const starters = getStarters(team.players);
                    const bench = getBench(team.players);
                    const alternates = getAlternates(team.players);
                    
                    return (
                      <div key={team.id} className="bg-white rounded-lg shadow-lg p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-2 flex-1">
                            <Users className="text-orange-600" size={24} />
                            <h2 className="text-xl md:text-2xl font-bold text-gray-800">{team.name}</h2>
                            <span className="px-3 py-1 bg-red-500 text-white text-sm font-bold rounded-full">
                              {calculateTeamScore(team).toFixed(1)} FP
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            {viewMode === 'all' && (
                              <button
                                onClick={() => viewTeam(team.id)}
                                className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                              >
                                View
                              </button>
                            )}
                            <button
                              onClick={() => editTeamName(team.id)}
                              className="px-3 py-1 text-sm bg-gray-600 text-white rounded hover:bg-gray-700"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => deleteTeam(team.id)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                            >
                              <Trash2 size={20} />
                            </button>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                          <div>
                            {/* Starter Slots */}
                            <div className="mb-4">
                              <div className="flex items-center justify-between mb-2">
                                <h3 className="text-sm font-semibold text-gray-700 uppercase">Starting Lineup</h3>
                                <div className="flex items-center gap-2">
                                  <span className="text-xs text-gray-600">FLEX Uses:</span>
                                  <select
                                    value={team.flexPositionType || 'G'}
                                    onChange={(e) => updateFlexPositionType(team.id, e.target.value)}
                                    className="text-xs px-2 py-1 border rounded focus:ring-2 focus:ring-orange-500"
                                  >
                                    <option value="G">Guards</option>
                                    <option value="F">Forwards</option>
                                    <option value="C">Centers</option>
                                  </select>
                                </div>
                              </div>
                              <div className="space-y-2">
                                {['G1', 'G2', 'F1', 'F2', 'C', 'FLEX'].map(slot => {
                                  const player = team.players.find(p => p.starterSlot === slot);
                                  return (
                                    <StarterSlot
                                      key={slot}
                                      slot={slot}
                                      player={player}
                                      teamId={team.id}
                                      onRemove={removePlayer}
                                      onSlotChange={updatePlayerStarterSlot}
                                      benchPlayers={bench}
                                    />
                                  );
                                })}
                              </div>
                            </div>

                            {bench.length > 0 && (
                              <div className="mb-4">
                                <h3 className="text-sm font-semibold text-gray-700 mb-2 uppercase">Bench</h3>
                                <div className="space-y-2">
                                  {bench.map(player => (
                                    <PlayerCard 
                                      key={player.id} 
                                      player={player} 
                                      teamId={team.id}
                                      onRemove={removePlayer}
                                      onRoleChange={updatePlayerRole}
                                      onAlternateChange={updatePlayerAlternateRank}
                                    />
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>

                          {viewMode === 'single' && (
                            <div>
                              <h3 className="text-sm font-semibold text-gray-700 mb-2 uppercase">Alternates</h3>
                              <div className="bg-gray-50 rounded-lg p-3">
                                <div className="text-xs text-gray-600 mb-3">
                                  Drag bench players here to rank them by position
                                </div>
                                
                                <div className="space-y-3">
                                  <div>
                                    <div className="text-xs font-semibold text-gray-600 mb-1">GUARDS</div>
                                    {['G1', 'G2', 'G3', 'G4'].map(rank => {
                                      const player = alternates.find(p => p.alternateRank === rank);
                                      return (
                                        <AlternateSlot 
                                          key={rank}
                                          rank={rank}
                                          player={player}
                                          teamId={team.id}
                                          onRemove={removePlayer}
                                          onAlternateChange={updatePlayerAlternateRank}
                                          benchPlayers={bench}
                                        />
                                      );
                                    })}
                                  </div>

                                  <div>
                                    <div className="text-xs font-semibold text-gray-600 mb-1">FORWARDS</div>
                                    {['F1', 'F2', 'F3', 'F4'].map(rank => {
                                      const player = alternates.find(p => p.alternateRank === rank);
                                      return (
                                        <AlternateSlot 
                                          key={rank}
                                          rank={rank}
                                          player={player}
                                          teamId={team.id}
                                          onRemove={removePlayer}
                                          onAlternateChange={updatePlayerAlternateRank}
                                          benchPlayers={bench}
                                        />
                                      );
                                    })}
                                  </div>

                                  <div>
                                    <div className="text-xs font-semibold text-gray-600 mb-1">CENTERS</div>
                                    {['C1', 'C2'].map(rank => {
                                      const player = alternates.find(p => p.alternateRank === rank);
                                      return (
                                        <AlternateSlot 
                                          key={rank}
                                          rank={rank}
                                          player={player}
                                          teamId={team.id}
                                          onRemove={removePlayer}
                                          onAlternateChange={updatePlayerAlternateRank}
                                          benchPlayers={bench}
                                        />
                                      );
                                    })}
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>

                        {team.players.length === 0 && (
                          <p className="text-gray-500 italic text-center py-8">No players yet</p>
                        )}

                        <div className="mt-4 pt-4 border-t border-gray-200 flex justify-between text-sm text-gray-600">
                          <span>Players: {team.players.length}</span>
                          <span>Starters: {starters.length}</span>
                          <span className="font-bold text-orange-600">
                            FP: {calculateTeamScore(team).toFixed(1)}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            ) : (
              <div className="bg-white rounded-lg shadow-lg p-12 text-center">
                <Users className="mx-auto text-gray-400 mb-4" size={48} />
                <h3 className="text-xl font-semibold text-gray-800 mb-2">No teams yet</h3>
                <p className="text-gray-600 mb-4">Create your first team!</p>
                <button
                  onClick={createTeam}
                  className="px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 inline-flex items-center gap-2"
                >
                  <Plus size={20} />
                  Create Team
                </button>
              </div>
            )}
          </>
        )}

        {currentPage === 'standings' && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Standings - Week {selectedWeek}</h2>
              <div className="text-sm text-gray-600">
                Click team name to view details | Click record to edit
              </div>
            </div>
            
            {teams.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2 border-gray-300">
                      <th className="text-left py-3 px-4">Rank</th>
                      <th className="text-left py-3 px-4">Team</th>
                      <th className="text-center py-3 px-4">Record</th>
                      <th className="text-center py-3 px-4">Division</th>
                      <th className="text-center py-3 px-4">Starters</th>
                      <th className="text-right py-3 px-4">Fantasy Points</th>
                    </tr>
                  </thead>
                  <tbody>
                    {standings.map((team, index) => (
                      <tr key={team.id} className="border-b hover:bg-gray-50">
                        <td className="py-4 px-4">
                          <span className="font-semibold text-lg">{index + 1}</span>
                        </td>
                        <td className="py-4 px-4">
                          <button
                            onClick={() => {
                              setCurrentPage('teams');
                              viewTeam(team.id);
                            }}
                            className="text-blue-600 hover:underline font-semibold"
                          >
                            {team.name}
                          </button>
                        </td>
                        <td className="py-4 px-4 text-center">
                          <button
                            onClick={() => editTeamRecord(team.id)}
                            className="font-semibold hover:text-orange-600 transition-colors"
                            title="Click to edit record"
                          >
                            {team.record.wins}-{team.record.losses}
                          </button>
                        </td>
                        <td className="py-4 px-4 text-center">
                          <button
                            onClick={() => editTeamRecord(team.id)}
                            className="text-gray-600 hover:text-orange-600 transition-colors"
                            title="Click to edit record"
                          >
                            {team.divisionRecord.wins}-{team.divisionRecord.losses}
                          </button>
                        </td>
                        <td className="py-4 px-4 text-center">{team.starters}/6</td>
                        <td className="py-4 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {index === 0 && <Trophy className="text-yellow-500" size={24} />}
                            <span className="text-lg font-bold text-orange-600">
                              {team.weekScore.toFixed(1)}
                            </span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500 mb-4">No teams yet!</p>
                <button
                  onClick={() => setCurrentPage('teams')}
                  className="px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
                >
                  Go to Teams
                </button>
              </div>
            )}
          </div>
        )}

        {currentPage === 'matchups' && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Weekly Matchups - Week {selectedWeek}</h2>
            
            {matchupSchedule[selectedWeek] ? (
              <div className="space-y-4">
                {matchupSchedule[selectedWeek].map((matchup, index) => {
                  // Map real names to team names to find teams
                  const team1 = teams.find(t => t.name === nameMapping[matchup.team1]);
                  const team2 = teams.find(t => t.name === nameMapping[matchup.team2]);
                  
                  const team1Score = team1 ? calculateTeamScore(team1) : 0;
                  const team2Score = team2 ? calculateTeamScore(team2) : 0;
                  
                  return (
                    <div key={index} className="border-2 border-gray-200 rounded-lg p-4 hover:border-orange-300 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <button
                            onClick={() => {
                              if (team1) {
                                setCurrentPage('teams');
                                viewTeam(team1.id);
                              }
                            }}
                            className={`text-lg font-semibold hover:text-orange-600 transition-colors ${team1Score > team2Score && team1Score > 0 ? 'text-green-600' : 'text-gray-800'}`}
                          >
                            {matchup.team1}
                          </button>
                          <div className="text-2xl font-bold text-gray-900 mt-1">
                            {team1Score.toFixed(1)}
                          </div>
                        </div>
                        
                        <div className="px-6 text-2xl font-bold text-gray-400">
                          VS
                        </div>
                        
                        <div className="flex-1 text-right">
                          <button
                            onClick={() => {
                              if (team2) {
                                setCurrentPage('teams');
                                viewTeam(team2.id);
                              }
                            }}
                            className={`text-lg font-semibold hover:text-orange-600 transition-colors ${team2Score > team1Score && team2Score > 0 ? 'text-green-600' : 'text-gray-800'}`}
                          >
                            {matchup.team2}
                          </button>
                          <div className="text-2xl font-bold text-gray-900 mt-1">
                            {team2Score.toFixed(1)}
                          </div>
                        </div>
                      </div>
                      
                      {team1Score === 0 && team2Score === 0 && (
                        <div className="text-center mt-2 text-sm text-gray-500">
                          No stats yet this week
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                No matchups scheduled for Week {selectedWeek}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function PlayerCard({ player, teamId, onRemove, onRoleChange, onAlternateChange }) {
  return (
    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100">
      <div className="flex-1">
        <div className="font-semibold text-gray-800">{player.name}</div>
        <div className="text-sm text-gray-600">{player.position} | {player.team_abbr}</div>
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
          FP: {player.fantasyPoints?.toFixed(1) || '0.0'}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={() => onRemove(teamId, player.id)}
          className="p-2 text-red-600 hover:bg-red-50 rounded"
        >
          <Trash2 size={18} />
        </button>
      </div>
    </div>
  );
}

function StarterSlot({ slot, player, teamId, onSlotChange, benchPlayers }) {
  const [showSelector, setShowSelector] = useState(false);
  
  const getSlotLabel = (slot) => {
    const labels = {
      'G1': 'Guard 1',
      'G2': 'Guard 2',
      'F1': 'Forward 1',
      'F2': 'Forward 2',
      'C': 'Center',
      'FLEX': 'Flex'
    };
    return labels[slot] || slot;
  };
  
  return (
    <div className="mb-2">
      <div className="text-xs font-semibold text-gray-500 mb-1">{getSlotLabel(slot)}</div>
      {player ? (
        <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border-2 border-green-200">
          <div className="flex-1">
            <div className="font-semibold text-gray-800">{player.name}</div>
            <div className="text-sm text-gray-600">{player.position} | {player.team_abbr}</div>
            {player.stats && player.stats.pts >= 0 && (
              <>
                <div className="text-xs text-gray-500 mt-1">
                  PTS: {player.stats.pts?.toFixed(1)} | REB: {player.stats.reb?.toFixed(1)} | AST: {player.stats.ast?.toFixed(1)}
                </div>
                {player.stats.gameInfo && (
                  <div className="text-xs text-blue-600 mt-1 font-medium">
                    {player.stats.gameInfo}
                  </div>
                )}
              </>
            )}
            <div className="text-sm font-bold text-orange-600 mt-1">
              FP: {player.fantasyPoints?.toFixed(1) || '0.0'}
            </div>
          </div>
          <button
            onClick={() => onSlotChange(teamId, player.id, null)}
            className="p-2 text-red-600 hover:bg-red-50 rounded text-sm"
          >
            Remove
          </button>
        </div>
      ) : (
        <div className="relative">
          <button
            onClick={() => setShowSelector(!showSelector)}
            className="w-full p-3 border-2 border-dashed border-gray-300 rounded text-sm text-gray-500 hover:border-orange-400 hover:text-orange-600 transition-colors"
          >
            + Add Player to {getSlotLabel(slot)}
          </button>
          {showSelector && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded shadow-lg max-h-60 overflow-y-auto">
              {benchPlayers.length > 0 ? (
                benchPlayers.map(p => (
                  <button
                    key={p.id}
                    onClick={() => {
                      onSlotChange(teamId, p.id, slot);
                      setShowSelector(false);
                    }}
                    className="w-full px-3 py-2 text-left hover:bg-orange-50 border-b last:border-b-0"
                  >
                    <div className="font-semibold">{p.name}</div>
                    <div className="text-xs text-gray-600">{p.position} | FP: {p.fantasyPoints?.toFixed(1) || '0.0'}</div>
                  </button>
                ))
              ) : (
                <div className="px-3 py-2 text-sm text-gray-500">No bench players available</div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function AlternateSlot({ rank, player, teamId, onRemove, onAlternateChange, benchPlayers }) {
  const [showSelector, setShowSelector] = useState(false);
  
  return (
    <div className="mb-2">
      <div className="text-xs font-semibold text-gray-500 mb-1">{rank}</div>
      {player ? (
        <div className="flex items-center justify-between p-2 bg-white rounded border border-gray-200">
          <div className="flex-1 text-sm">
            <div className="font-semibold">{player.name}</div>
            <div className="text-xs text-gray-600">{player.position} | FP: {player.fantasyPoints?.toFixed(1) || '0.0'}</div>
          </div>
          <button
            onClick={() => onAlternateChange(teamId, player.id, null)}
            className="p-1 text-red-600 hover:bg-red-50 rounded text-xs"
          >
            Remove
          </button>
        </div>
      ) : (
        <div className="relative">
          <button
            onClick={() => setShowSelector(!showSelector)}
            className="w-full p-2 border-2 border-dashed border-gray-300 rounded text-sm text-gray-500 hover:border-orange-400 hover:text-orange-600 transition-colors"
          >
            + Add Player
          </button>
          {showSelector && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded shadow-lg max-h-40 overflow-y-auto">
              {benchPlayers.length > 0 ? (
                benchPlayers.map(p => (
                  <button
                    key={p.id}
                    onClick={() => {
                      onAlternateChange(teamId, p.id, rank);
                      setShowSelector(false);
                    }}
                    className="w-full px-3 py-2 text-left hover:bg-orange-50 border-b last:border-b-0 text-sm"
                  >
                    <div className="font-semibold">{p.name}</div>
                    <div className="text-xs text-gray-600">{p.position}</div>
                  </button>
                ))
              ) : (
                <div className="px-3 py-2 text-sm text-gray-500">No bench players</div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}