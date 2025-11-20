// Compare.jsx - Page Comparateur FM2023
import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
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
  const [queries, setQueries] = useState(["", ""]);
  const [players, setPlayers] = useState([null, null]); // Commence avec 2 slots
  const [loading, setLoading] = useState(false);
  const [comparing, setComparing] = useState(false);
  const [error, setError] = useState(null);
  const [numPlayers, setNumPlayers] = useState(2);
  const [history, setHistory] = useState([]);

  // Chargement historique
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("compare_history") || "[]");
    setHistory(saved);
  }, []);

  // Sauvegarde historique
  useEffect(() => {
    if (history.length > 0) {
      localStorage.setItem("compare_history", JSON.stringify(history));
    }
  }, [history]);

  // Chargement via URL (ex: ?players=123,456)
  useEffect(() => {
    const playerIds = searchParams.get("players");
    if (playerIds) {
      const ids = playerIds.split(",").map(Number);
      if (ids.length > 0) {
        setNumPlayers(Math.max(2, ids.length));
        loadPlayersById(ids);
      }
    }
  }, [searchParams]);

  // Ajuste la taille des tableaux quand on change le nombre de joueurs
  useEffect(() => {
    setQueries(prev => {
      const newQ = [...prev];
      while (newQ.length < numPlayers) newQ.push("");
      return newQ.slice(0, numPlayers);
    });
    setPlayers(prev => {
      const newP = [...prev];
      while (newP.length < numPlayers) newP.push(null);
      return newP.slice(0, numPlayers);
    });
  }, [numPlayers]);

  const loadPlayersById = async (ids) => {
    setLoading(true);
    try {
      const data = await comparePlayers(ids);
      // Remplit les slots avec les données reçues
      const newPlayers = Array(numPlayers).fill(null);
      data.forEach((p, i) => {
        if (i < numPlayers) newPlayers[i] = p;
      });
      setPlayers(newPlayers);
      // Met à jour les champs de recherche avec les noms
      setQueries(newPlayers.map(p => p ? p.name : ""));
    } catch (err) {
      console.error(err);
      setError("Impossible de charger les joueurs via l'URL.");
    } finally {
      setLoading(false);
    }
  };

  const handleCompare = async () => {
    const activeQueries = queries.filter(q => q && q.trim() !== "");
    
    if (activeQueries.length < 2) {
      setError("⚠️ Veuillez entrer au moins 2 joueurs à comparer.");
      return;
    }

    setError(null);
    setComparing(true);
    setLoading(true);

    try {
      // 1. Rechercher les ID pour chaque nom entré
      const searchResults = await Promise.all(
        queries.map(async (q) => {
          if (!q.trim()) return null;
          const res = await searchPlayers(q, 1);
          return res.length > 0 ? res[0] : null;
        })
      );

      // Vérifier si des joueurs sont introuvables
      const foundIds = searchResults.map(r => r ? r.id : null).filter(id => id !== null);
      
      if (foundIds.length < 2) {
        throw new Error("Joueurs introuvables. Vérifiez l'orthographe.");
      }

      // 2. Comparer avec les IDs trouvés
      const compareData = await comparePlayers(foundIds);
      
      // Mettre à jour l'état
      const newPlayers = Array(numPlayers).fill(null);
      compareData.forEach((p, i) => {
         if (i < numPlayers) newPlayers[i] = p;
      });
      
      setPlayers(newPlayers);

      // Mise à jour historique
      const newEntry = {
        names: compareData.map(p => p.name),
        time: Date.now()
      };
      setHistory(prev => [newEntry, ...prev].slice(0, 5));
      
    } catch (err) {
      console.error(err);
      setError(err.message || "Erreur lors de la comparaison.");
    } finally {
      setLoading(false);
      setComparing(false);
    }
  };

  const handleQueryChange = (index, value) => {
    const newQueries = [...queries];
    newQueries[index] = value;
    setQueries(newQueries);
  };

  const handleReset = () => {
    setQueries(Array(numPlayers).fill(""));
    setPlayers(Array(numPlayers).fill(null));
    setError(null);
  };

  const clearHistory = () => {
    localStorage.removeItem("compare_history");
    setHistory([]);
  };

  const buildRadarData = (category) => {
    const activePlayers = players.filter(p => p !== null);
    if (activePlayers.length === 0) return [];

    // Définition des métriques par catégorie
    const metricsMap = {
      overview: [
        { label: "Technique", key: "avg_technical" },
        { label: "Mental", key: "avg_mental" },
        { label: "Physique", key: "avg_physical" },
        { label: "Gardien", key: "avg_goalkeeper" },
      ],
      technical: [
        { label: "Dribble", key: "dribbling" },
        { label: "Finition", key: "finishing" },
        { label: "Passe", key: "passing" },
        { label: "Tacle", key: "tackling" },
        { label: "Technique", key: "technique" },
        { label: "Tir", key: "long_shots" },
      ],
      mental: [
        { label: "Vision", key: "vision" },
        { label: "Décisions", key: "decisions" },
        { label: "Sang-froid", key: "composure" },
        { label: "Collectif", key: "teamwork" },
        { label: "Activité", key: "work_rate" },
        { label: "Placement", key: "positioning" },
      ],
      physical: [
        { label: "Accél.", key: "acceleration" },
        { label: "Vitesse", key: "pace" },
        { label: "Endurance", key: "stamina" },
        { label: "Force", key: "strength" },
        { label: "Agilité", key: "agility" },
        { label: "Détente", key: "jumping" },
      ]
    };

    const metrics = metricsMap[category] || metricsMap.overview;

    return metrics.map(m => {
      const point = { metric: m.label };
      activePlayers.forEach(p => {
        let val = 0;
        if (category === 'overview') {
            val = p[m.key] || 0;
        } else {
            // Accès aux sous-objets (technical.dribbling)
            val = p[category] ? p[category][m.key] : 0;
        }
        point[p.name] = val;
      });
      return point;
    });
  };

  const colors = ["#3b82f6", "#ef4444", "#10b981", "#f59e0b"];

  return (
    <motion.div
      className="min-h-screen bg-gray-50 p-4 md:p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">
          ⚔️ Comparateur de Joueurs
        </h1>

        {/* Contrôles */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <div className="flex justify-center gap-4 mb-6">
            <span className="text-gray-600 self-center">Comparer :</span>
            {[2, 3, 4].map(n => (
              <button
                key={n}
                onClick={() => setNumPlayers(n)}
                className={`px-4 py-2 rounded-lg font-bold transition ${
                  numPlayers === n ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {n} Joueurs
              </button>
            ))}
          </div>

          <div className={`grid grid-cols-1 md:grid-cols-${numPlayers} gap-4 mb-6`}>
            {queries.map((q, i) => (
              <input
                key={i}
                type="text"
                placeholder={`Nom du joueur ${i + 1}...`}
                value={q}
                onChange={(e) => handleQueryChange(i, e.target.value)}
                className="border border-gray-300 rounded-lg px-4 py-3 w-full focus:ring-2 focus:ring-blue-500 outline-none"
              />
            ))}
          </div>

          <div className="flex justify-center gap-4">
            <button
              onClick={handleCompare}
              disabled={loading}
              className="bg-blue-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-blue-700 transition disabled:opacity-50 shadow-lg flex items-center gap-2"
            >
              {loading ? "⏳ Chargement..." : "🔍 Comparer"}
            </button>
            <button
              onClick={handleReset}
              className="bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-bold hover:bg-gray-300 transition"
            >
              🗑️ Effacer
            </button>
          </div>

          {error && (
            <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-lg text-center border border-red-200">
              {error}
            </div>
          )}
        </div>

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
        {players.some(p => p !== null) && !loading && !comparing && (
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="space-y-8"
          >
            {/* Cartes Joueurs */}
            <div className={`grid grid-cols-1 md:grid-cols-${numPlayers} gap-6`}>
              {players.map((p, i) => (
                p ? (
                  <div key={i} className="bg-white rounded-xl shadow-md overflow-hidden border-t-4" style={{ borderColor: colors[i] }}>
                    <div className="p-6">
                      <h3 className="text-xl font-bold mb-2 truncate" style={{ color: colors[i] }}>{p.name}</h3>
                      <div className="text-sm text-gray-600 space-y-1">
                        <p>⚽ {p.club || "Sans club"}</p>
                        <p className="flex items-center gap-2"><FlagIcon countryCode={p.nationality} /> {p.nationality}</p>
                        <p>📍 {p.position}</p>
                        <p className="font-semibold text-gray-800 mt-2">{p.age} ans • {p.height}cm</p>
                      </div>
                      <div className="mt-4 pt-4 border-t grid grid-cols-3 gap-2 text-center text-xs">
                        <div className="bg-gray-50 p-1 rounded">
                          <div className="font-bold text-blue-600">{p.avg_technical?.toFixed(1)}</div>
                          <div>Tech</div>
                        </div>
                        <div className="bg-gray-50 p-1 rounded">
                          <div className="font-bold text-purple-600">{p.avg_mental?.toFixed(1)}</div>
                          <div>Mental</div>
                        </div>
                        <div className="bg-gray-50 p-1 rounded">
                          <div className="font-bold text-green-600">{p.avg_physical?.toFixed(1)}</div>
                          <div>Phys</div>
                        </div>
                      </div>
                      <div className="mt-4 text-center">
                        <Link to={`/player/${p.id}`} className="text-blue-500 hover:underline text-sm">
                          Voir détails →
                        </Link>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div key={i} className="bg-gray-50 rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center h-48 text-gray-400">
                    Joueur {i+1}
                  </div>
                )
              ))}
            </div>

            {/* Graphiques Radar */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <RadarCard 
                title="📊 Vue d'ensemble" 
                data={buildRadarData("overview")} 
                players={players} 
                colors={colors} 
              />
              <RadarCard 
                title="⚙️ Technique" 
                data={buildRadarData("technical")} 
                players={players} 
                colors={colors} 
              />
              <RadarCard 
                title="🧠 Mental" 
                data={buildRadarData("mental")} 
                players={players} 
                colors={colors} 
              />
              <RadarCard 
                title="💪 Physique" 
                data={buildRadarData("physical")} 
                players={players} 
                colors={colors} 
              />
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}

function RadarCard({ title, data, players, colors }) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-lg">
      <h3 className="text-lg font-bold text-center text-gray-700 mb-4">{title}</h3>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart outerRadius={90} data={data}>
            <PolarGrid />
            <PolarAngleAxis dataKey="metric" tick={{ fontSize: 12 }} />
            <PolarRadiusAxis angle={30} domain={[0, 20]} />
            {players.map((p, i) => (
              p && (
                <Radar
                  key={i}
                  name={p.name}
                  dataKey={p.name}
                  stroke={colors[i]}
                  fill={colors[i]}
                  fillOpacity={0.4}
                />
              )
            ))}
            <Legend />
            <Tooltip />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}