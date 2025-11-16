// Compare.jsx - Page Comparateur FM2023
import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";
import { searchPlayers, comparePlayers } from "../services/api";
import FlagIcon from "../components/FlagIcon";

export default function ComparePage() {
  const [searchParams] = useSearchParams();
  const [queries, setQueries] = useState(["", "", "", ""]);
  const [players, setPlayers] = useState([null, null, null, null]);
  const [loading, setLoading] = useState(false);
  const [comparing, setComparing] = useState(false);
  const [error, setError] = useState(null);
  const [history, setHistory] = useState([]);
  const [numPlayers, setNumPlayers] = useState(2);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("compare_history") || "[]");
    setHistory(saved);

    const playerIds = searchParams.get("players");
    if (playerIds) {
      const ids = playerIds.split(",").map(Number);
      loadPlayersById(ids);
    }
  }, []);

  useEffect(() => {
    if (history.length > 0) {
      localStorage.setItem("compare_history", JSON.stringify(history));
    }
  }, [history]);

  const loadPlayersById = async (ids) => {
    setLoading(true);
    try {
      const data = await comparePlayers(ids);
      setPlayers([...data, null, null, null, null].slice(0, 4));
      setNumPlayers(ids.length);
    } catch (err) {
      console.error(err);
      setError("Erreur lors du chargement des joueurs");
    } finally {
      setLoading(false);
    }
  };

  const handleCompare = async () => {
    const activeQueries = queries.slice(0, numPlayers).filter(q => q.trim());
    
    if (activeQueries.length < 2) {
      setError("⚠️ Veuillez entrer au moins 2 joueurs à comparer.");
      return;
    }

    setError(null);
    setPlayers([null, null, null, null]);
    setComparing(true);
    setLoading(true);

    try {
      const searchResults = await Promise.all(
        activeQueries.map(q => searchPlayers(q, 1))
      );

      if (searchResults.some(results => !results.length)) {
        throw new Error("Un ou plusieurs joueurs sont introuvables.");
      }

      const playerIds = searchResults.map(results => results[0].id);
      const compareData = await comparePlayers(playerIds);

      setTimeout(() => {
        const updatedPlayers = [...compareData, null, null, null, null].slice(0, 4);
        setPlayers(updatedPlayers);
        setComparing(false);

        const newEntry = {
          names: compareData.map(p => p.name),
          time: Date.now()
        };
        const updated = [newEntry, ...history].slice(0, 5);
        setHistory(updated);
      }, 1000);

    } catch (err) {
      console.error(err);
      setError(err.message);
      setComparing(false);
    } finally {
      setLoading(false);
    }
  };

  const handleQueryChange = (index, value) => {
    const newQueries = [...queries];
    newQueries[index] = value;
    setQueries(newQueries);
  };

  const handleReset = () => {
    setQueries(["", "", "", ""]);
    setPlayers([null, null, null, null]);
    setError(null);
  };

  const clearHistory = () => {
    localStorage.removeItem("compare_history");
    setHistory([]);
  };

  const buildRadarData = (category) => {
    const activePlayers = players.filter(p => p !== null);
    if (activePlayers.length === 0) return [];

    const metrics = {
      overview: [
        { metric: "Technique", key: "avg_technical" },
        { metric: "Mental", key: "avg_mental" },
        { metric: "Physique", key: "avg_physical" },
        { metric: "Gardien", key: "avg_goalkeeper" },
      ],
      technical: [
        { metric: "Dribbling", key: "dribbling" },
        { metric: "Passing", key: "passing" },
        { metric: "Finishing", key: "finishing" },
        { metric: "Crossing", key: "crossing" },
        { metric: "Technique", key: "technique" },
        { metric: "First Touch", key: "first_touch" },
      ],
      mental: [
        { metric: "Vision", key: "vision" },
        { metric: "Decisions", key: "decisions" },
        { metric: "Composure", key: "composure" },
        { metric: "Teamwork", key: "teamwork" },
        { metric: "Work Rate", key: "work_rate" },
        { metric: "Positioning", key: "positioning" },
      ],
      physical: [
        { metric: "Pace", key: "pace" },
        { metric: "Acceleration", key: "acceleration" },
        { metric: "Stamina", key: "stamina" },
        { metric: "Strength", key: "strength" },
        { metric: "Agility", key: "agility" },
        { metric: "Balance", key: "balance" },
      ],
    };

    const selectedMetrics = metrics[category] || metrics.overview;

    return selectedMetrics.map(({ metric, key }) => {
      const dataPoint = { metric };
      
      activePlayers.forEach(player => {
        let value = 0;
        
        if (category === "overview") {
          value = player[key] || 0;
        } else {
          value = player[category]?.[key] || 0;
        }
        
        dataPoint[player.name] = value;
      });

      return dataPoint;
    });
  };

  const colors = ["#3b82f6", "#ef4444", "#10b981", "#f59e0b"];

  return (
    <motion.div
      className="min-h-screen bg-gray-50 p-4 md:p-6"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-800 mb-6 text-center">
          🔄 Comparateur de Joueurs
        </h1>

        {/* Sélecteur nombre de joueurs */}
        <div className="flex justify-center gap-2 mb-6">
          <span className="text-gray-600 self-center">Comparer :</span>
          {[2, 3, 4].map(n => (
            <button
              key={n}
              onClick={() => setNumPlayers(n)}
              className={`px-4 py-2 rounded-lg font-bold transition ${
                numPlayers === n
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              {n} joueurs
            </button>
          ))}
        </div>

        {/* Zone de saisie */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className={`grid grid-cols-1 ${numPlayers === 2 ? 'md:grid-cols-2' : numPlayers === 3 ? 'md:grid-cols-3' : 'md:grid-cols-4'} gap-4 mb-4`}>
            {queries.slice(0, numPlayers).map((query, i) => (
              <input
                key={i}
                type="text"
                placeholder={`Joueur ${i + 1}...`}
                className="border border-gray-300 rounded-lg px-4 py-3 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={query}
                onChange={(e) => handleQueryChange(i, e.target.value)}
              />
            ))}
          </div>

          <div className="flex justify-center gap-3">
            <button
              onClick={handleCompare}
              disabled={loading}
              className="bg-blue-600 text-white rounded-lg px-6 py-3 hover:bg-blue-700 transition disabled:opacity-50 font-bold"
            >
              {loading ? "⏳ Chargement..." : "🔍 Comparer"}
            </button>
            <button
              onClick={handleReset}
              className="bg-gray-200 text-gray-700 rounded-lg px-6 py-3 hover:bg-gray-300 transition font-bold"
            >
              ✖ Réinitialiser
            </button>
          </div>
        </div>

        {/* Erreur */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6 text-center">
            ⚠️ {error}
          </div>
        )}

        {/* Historique */}
        {history.length > 0 && !comparing && (
          <div className="bg-white rounded-xl shadow-lg p-4 mb-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-3 flex items-center justify-between">
              <span>📜 Comparaisons récentes</span>
              <button
                onClick={clearHistory}
                className="text-xs text-red-600 hover:text-red-800"
              >
                Effacer l'historique
              </button>
            </h3>
            <div className="flex flex-wrap gap-3">
              {history
                .filter(h => h.names && Array.isArray(h.names) && h.names.length > 0)
                .map((h, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      h.names.forEach((name, i) => handleQueryChange(i, name));
                      setNumPlayers(h.names.length);
                    }}
                    className="px-3 py-2 bg-gray-100 text-sm rounded-lg hover:bg-blue-100 transition"
                  >
                    {h.names.join(" vs ")}
                  </button>
                ))}
            </div>
          </div>
        )}

        {/* Animation de comparaison */}
        {comparing && (
          <div className="relative flex justify-center items-center py-20">
            <motion.div
              className="text-2xl font-bold text-blue-600"
              animate={{ opacity: [0.5, 1, 0.5], scale: [1, 1.1, 1] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
            >
              ⚙️ Analyse des données en cours...
            </motion.div>
          </div>
        )}

        {/* Résultats */}
        {players.some(p => p !== null) && !comparing && (
          <motion.div
            className="mt-8 space-y-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            {/* Cartes des joueurs */}
            <div className={`grid grid-cols-1 ${numPlayers === 2 ? 'md:grid-cols-2' : numPlayers === 3 ? 'md:grid-cols-3' : 'md:grid-cols-4'} gap-4`}>
              {players.filter(p => p !== null).map((p, i) => (
                <motion.div
                  key={p.id}
                  whileHover={{ scale: 1.02 }}
                  className="bg-white p-6 rounded-xl shadow-lg border-t-4"
                  style={{ borderTopColor: colors[i] }}
                >
                  <h2 className="text-2xl font-bold mb-2" style={{ color: colors[i] }}>
                    {p.name}
                  </h2>
                  <p className="text-gray-600 mb-1">⚽ {p.club || "Sans club"}</p>
                  
                  <p className="text-gray-600 mb-1 flex items-center gap-2">
                    <FlagIcon countryCode={p.nationality} />
                    {p.nationality || "—"}
                  </p>

                  <p className="text-gray-600 mb-3">📍 {p.position || "—"}</p>
                  
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <Stat label="Âge" value={p.age || "—"} />
                    <Stat label="Taille" value={p.height ? `${p.height}cm` : "—"} />
                    <Stat label="Matchs" value={p.career_apps || 0} />
                    <Stat label="Buts" value={p.career_goals || 0} />
                  </div>

                  <div className="mt-4 pt-4 border-t">
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="text-center bg-blue-50 rounded p-2">
                        <div className="font-bold text-blue-600">{p.avg_technical?.toFixed(1) || "—"}</div>
                        <div className="text-gray-600">Technique</div>
                      </div>
                      <div className="text-center bg-purple-50 rounded p-2">
                        <div className="font-bold text-purple-600">{p.avg_mental?.toFixed(1) || "—"}</div>
                        <div className="text-gray-600">Mental</div>
                      </div>
                      <div className="text-center bg-green-50 rounded p-2">
                        <div className="font-bold text-green-600">{p.avg_physical?.toFixed(1) || "—"}</div>
                        <div className="text-gray-600">Physique</div>
                      </div>
                      {p.position?.includes("GK") && p.avg_goalkeeper && (
                        <div className="text-center bg-yellow-50 rounded p-2">
                          <div className="font-bold text-yellow-600">{p.avg_goalkeeper?.toFixed(1) || "—"}</div>
                          <div className="text-gray-600">Gardien</div>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Graphiques radar */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <RadarCard
                title="📊 Vue d'ensemble"
                data={buildRadarData("overview")}
                players={players.filter(p => p !== null)}
                colors={colors}
              />

              <RadarCard
                title="⚙️ Attributs Techniques"
                data={buildRadarData("technical")}
                players={players.filter(p => p !== null)}
                colors={colors}
              />

              <RadarCard
                title="🧠 Attributs Mentaux"
                data={buildRadarData("mental")}
                players={players.filter(p => p !== null)}
                colors={colors}
              />

              <RadarCard
                title="💪 Attributs Physiques"
                data={buildRadarData("physical")}
                players={players.filter(p => p !== null)}
                colors={colors}
              />
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}

// Composant Stat
function Stat({ label, value }) {
  return (
    <div className="bg-gray-50 rounded-lg p-2 text-center">
      <p className="text-lg font-bold text-gray-800">{value}</p>
      <p className="text-xs text-gray-600">{label}</p>
    </div>
  );
}

// Composant Radar Chart
function RadarCard({ title, data, players, colors }) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-lg">
      <h3 className="text-xl font-bold text-center text-gray-800 mb-4">
        {title}
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <RadarChart data={data}>
          <PolarGrid />
          <PolarAngleAxis dataKey="metric" tick={{ fontSize: 12 }} />
          <PolarRadiusAxis angle={90} domain={[0, 20]} />
          {players.map((player, i) => (
            <Radar
              key={player.id}
              name={player.name}
              dataKey={player.name}
              stroke={colors[i]}
              fill={colors[i]}
              fillOpacity={0.3}
            />
          ))}
          <Legend />
          <Tooltip />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}