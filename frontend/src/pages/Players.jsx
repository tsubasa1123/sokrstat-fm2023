// Players.jsx - Page Liste des Joueurs FM2023
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getPlayers, searchPlayers, listNationalities, listPositions } from "../services/api";
import ExportButton from "../components/ExportButton";
import FlagIcon from "../components/FlagIcon";

export default function Players() {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalPlayers, setTotalPlayers] = useState(0);
  const perPage = 50;
  
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({
    position: "",
    nationality: "",
    club: "",
    min_age: "",
    max_age: "",
    sort_by: "name",
    order: "asc"
  });
  
  const [nationalities, setNationalities] = useState([]);
  const [positions, setPositions] = useState([]);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    loadFilterLists();
  }, []);

  useEffect(() => {
    loadPlayers();
  }, [currentPage, filters]);

  const loadFilterLists = async () => {
    try {
      const [nats, poss] = await Promise.all([
        listNationalities(),
        listPositions()
      ]);
      setNationalities(nats);
      setPositions(poss.slice(0, 20));
    } catch (err) {
      console.error("Erreur chargement filtres:", err);
    }
  };

  const loadPlayers = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const params = {
        page: currentPage,
        per_page: perPage,
        ...filters
      };
      
      Object.keys(params).forEach(key => {
        if (params[key] === "" || params[key] === null) {
          delete params[key];
        }
      });
      
      const data = await getPlayers(params);
      setPlayers(data.players || []);
      setTotalPages(data.pagination?.pages || 1);
      setTotalPlayers(data.pagination?.total || 0);
    } catch (err) {
      setError("Erreur lors du chargement des joueurs");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    
    if (!searchQuery.trim()) {
      loadPlayers();
      return;
    }

    setLoading(true);
    try {
      const results = await searchPlayers(searchQuery, 100);
      setPlayers(results);
      setTotalPlayers(results.length);
      setTotalPages(1);
      setCurrentPage(1);
    } catch (err) {
      setError("Erreur lors de la recherche");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const resetFilters = () => {
    setFilters({
      position: "",
      nationality: "",
      club: "",
      min_age: "",
      max_age: "",
      sort_by: "name",
      order: "asc"
    });
    setSearchQuery("");
    setCurrentPage(1);
  };

  const getPositionBadgeColor = (position) => {
    if (!position) return "bg-gray-500";
    if (position.includes("GK")) return "bg-yellow-500";
    if (position.includes("D")) return "bg-blue-500";
    if (position.includes("M")) return "bg-green-500";
    if (position.includes("ST") || position.includes("AM")) return "bg-red-500";
    return "bg-gray-500";
  };

  if (loading && players.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement des joueurs...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center text-red-600">
          <p className="text-xl font-bold">{error}</p>
          <button 
            onClick={loadPlayers}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Joueurs Football Manager 2023
          </h1>
          <p className="text-gray-600">
            {totalPlayers.toLocaleString()} joueurs disponibles
          </p>
        </div>

        <form onSubmit={handleSearch} className="mb-6">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Rechercher par nom, club, ou nationalité..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button type="submit" className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold">
              Rechercher
            </button>
            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className="px-4 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
            >
              {showFilters ? "🔼 Masquer" : "🔽 Filtres"}
            </button>
            <ExportButton filters={filters} buttonText="Export" />
          </div>
        </form>

        {showFilters && (
          <div className="mb-6 p-4 bg-white rounded-lg shadow">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Position</label>
                <select
                  value={filters.position}
                  onChange={(e) => handleFilterChange("position", e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Toutes les positions</option>
                  {positions.slice(0, 15).map((pos) => (
                    <option key={pos} value={pos}>{pos}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nationalité</label>
                <select
                  value={filters.nationality}
                  onChange={(e) => handleFilterChange("nationality", e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Toutes</option>
                  {nationalities.map((nat) => (
                    <option key={nat} value={nat}>{nat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Club</label>
                <input
                  type="text"
                  placeholder="Nom du club..."
                  value={filters.club}
                  onChange={(e) => handleFilterChange("club", e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Âge min</label>
                <input
                  type="number"
                  placeholder="Ex: 18"
                  value={filters.min_age}
                  onChange={(e) => handleFilterChange("min_age", e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Âge max</label>
                <input
                  type="number"
                  placeholder="Ex: 35"
                  value={filters.max_age}
                  onChange={(e) => handleFilterChange("max_age", e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Trier par</label>
                <div className="flex gap-2">
                  <select
                    value={filters.sort_by}
                    onChange={(e) => handleFilterChange("sort_by", e.target.value)}
                    className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="name">Nom</option>
                    <option value="age">Âge</option>
                    <option value="nationality">Nationalité</option>
                  </select>
                  <select
                    value={filters.order}
                    onChange={(e) => handleFilterChange("order", e.target.value)}
                    className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="asc">↑</option>
                    <option value="desc">↓</option>
                  </select>
                </div>
              </div>
            </div>

            <button onClick={resetFilters} className="text-sm text-blue-600 hover:text-blue-800 font-medium">
              ✖ Réinitialiser les filtres
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
          {players.map((player) => (
            <Link
              key={player.id}
              to={`/player/${player.id}`}
              className="block bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-4"
            >
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-bold text-gray-800 text-lg leading-tight">
                  {player.name}
                </h3>
                {player.position && (
                  <span className={`${getPositionBadgeColor(player.position)} text-white text-xs font-bold px-2 py-1 rounded`}>
                    {player.position.split(' ')[0]}
                  </span>
                )}
              </div>
              
              <div className="space-y-1 text-sm text-gray-600">
                {player.club && (
                  <p className="flex items-center gap-1">
                    <span>⚽</span>
                    <span className="truncate">{player.club}</span>
                  </p>
                )}
                {player.nationality && (
                  <p className="flex items-center gap-2">
                    <FlagIcon countryCode={player.nationality} />
                    <span>{player.nationality}</span>
                  </p>
                )}
                {player.age && (
                  <p className="flex items-center gap-1">
                    <span>📅</span>
                    <span>{player.age} ans</span>
                  </p>
                )}
              </div>
              
              <div className="mt-3 pt-3 border-t border-gray-100">
                <span className="text-blue-600 text-sm font-medium hover:underline">
                  Voir détails →
                </span>
              </div>
            </Link>
          ))}
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-6">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 bg-white border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              ← Précédent
            </button>
            
            <span className="px-4 py-2 text-gray-700">
              Page {currentPage} sur {totalPages}
            </span>
            
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 bg-white border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Suivant →
            </button>
          </div>
        )}

        <p className="text-center text-gray-500 text-sm mt-4">
          Page {currentPage} sur {totalPages} • {totalPlayers.toLocaleString()} joueurs
        </p>
      </div>
    </div>
  );
}