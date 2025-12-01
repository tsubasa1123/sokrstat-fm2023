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
  const [searchParams, setSearchParams] = useSearchParams();
  const [queries, setQueries] = useState(["", ""]);
  const [players, setPlayers] = useState([null, null]); 
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
      if (ids.length >= 2) {
        const count = Math.min(Math.max(ids.length, 2), 4);
        setNumPlayers(count);
        // Ajuster immédiatement les tableaux pour éviter des erreurs d'index
        setQueries(prev => {
            const newQ = [...prev];
            while (newQ.length < count) newQ.push("");
            return newQ.slice(0, count);
        });
        setPlayers(prev => {
            const newP = [...prev];
            while (newP.length < count) newP.push(null);
            return newP.slice(0, count);
        });
        loadPlayersById(ids, count);
      }
    }
  }, []); // Exécuté une seule fois au montage pour lire l'URL

  // Ajuste la taille des tableaux quand on change le nombre de joueurs manuellement
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

  const loadPlayersById = async (ids, count) => {
    setLoading(true);
    try {
      const data = await comparePlayers(ids);
      // Remplit les slots avec les données reçues
      const newPlayers = Array(count).fill(null);
      const newQueries = Array(count).fill("");
      
      data.forEach((p, i) => {
        if (i < count) {
            newPlayers[i] = p;
            newQueries[i] = p.name;
        }
      });
      setPlayers(newPlayers);
      setQueries(newQueries);
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
      setError("Veuillez entrer au moins 2 joueurs à comparer.");
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
      
      // Mettre à jour l'URL
      setSearchParams({ players: foundIds.join(",") });

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

  // FONCTION D'EXPORT COMPARATIF 
  const handleExport = (format) => {
    const activePlayers = players.filter(p => p !== null);
    if (activePlayers.length === 0) return;

    // 1. PDF (Impression native)
    if (format === 'pdf') {
      window.print();
      return;
    }

    // 2. CSV / Excel
    // On construit un tableau où chaque ligne est un attribut et chaque colonne un joueur
    const rows = [];
    const header = ['Attribut', ...activePlayers.map(p => p.name)];
    rows.push(header);

    // Fonction helper pour ajouter une ligne
    const addRow = (label, key, category = null) => {
        const row = [label];
        activePlayers.forEach(p => {
            let val = '';
            if (category && p[category]) {
                val = p[category][key];
            } else {
                val = p[key]; // Pour les infos de base
            }
            row.push(val !== undefined && val !== null ? String(val) : '');
        });
        rows.push(row);
    };

    // Infos générales
    addRow('Club', 'club');
    addRow('Nationalité', 'nationality');
    addRow('Position', 'position');
    addRow('Âge', 'age');
    addRow('Taille (cm)', 'height');
    addRow('Poids (kg)', 'weight');
    addRow('Pied Préféré', 'preferred_foot');
    addRow('Valeur', 'transfer_value');
    addRow('Matchs Carrière', 'career_apps');
    addRow('Buts Carrière', 'career_goals');

    // Attributs Techniques
    const techAttrs = ['corners', 'crossing', 'dribbling', 'finishing', 'first_touch', 'free_kicks', 'heading', 'long_shots', 'marking', 'passing', 'penalty_taking', 'tackling', 'technique'];
    techAttrs.forEach(attr => addRow(`Tech - ${attr}`, attr, 'technical'));

    // Attributs Mentaux
    const mentalAttrs = ['aggression', 'anticipation', 'bravery', 'composure', 'concentration', 'decisions', 'determination', 'flair', 'leadership', 'off_the_ball', 'positioning', 'teamwork', 'vision', 'work_rate'];
    mentalAttrs.forEach(attr => addRow(`Mental - ${attr}`, attr, 'mental'));

    // Attributs Physiques
    const physAttrs = ['acceleration', 'agility', 'balance', 'jumping', 'pace', 'stamina', 'strength'];
    physAttrs.forEach(attr => addRow(`Phys - ${attr}`, attr, 'physical'));

    // Génération du fichier
    const separator = format === 'excel' ? ';' : ',';
    const bom = format === 'excel' ? '\uFEFF' : '';
    const extension = 'csv';

    const csvContent = rows.map(e => e.map(cell => `"${cell.replace(/"/g, '""')}"`).join(separator)).join("\n");
    const blob = new Blob([bom + csvContent], { type: 'text/csv;charset=utf-8;' });
    
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `Comparaison_SokrStat_${new Date().toISOString().slice(0,10)}.${extension}`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleQueryChange = (index, value) => {
    const newQueries = [...queries];
    newQueries[index] = value;
    setQueries(newQueries);
  };

  const handleReset = () => {
    setQueries(Array(numPlayers).fill(""));
    setPlayers(Array(numPlayers).fill(null));
    setSearchParams({});
    setError(null);
  };

  const clearHistory = () => {
    localStorage.removeItem("compare_history");
    setHistory([]);
  };

  const buildRadarData = (category) => {
    const activePlayers = players.filter(p => p !== null);
    if (activePlayers.length === 0) return [];

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
        { label: "Tir Loin", key: "long_shots" },
      ],
      physical: [
        { label: "Vitesse", key: "pace" },
        { label: "Accél.", key: "acceleration" },
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
      className="min-h-screen bg-gray-50 p-4 md:p-6 print:bg-white print:p-0"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center print:hidden">
            Comparateur de Joueurs
        </h1>

        {/* Contrôles (Masqués à l'impression) */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8 border border-gray-200 print:hidden">
          {/* Sélecteur nombre de joueurs */}
          <div className="flex justify-center gap-4 mb-6">
            <span className="text-gray-600 self-center font-medium">Comparer :</span>
            {[2, 3, 4].map(n => (
              <button
                key={n}
                onClick={() => setNumPlayers(n)}
                className={`px-4 py-2 rounded-lg font-bold transition shadow-sm ${
                  numPlayers === n 
                    ? "bg-blue-600 text-white" 
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {n} Joueurs
              </button>
            ))}
          </div>

          {/* Champs de recherche */}
          <div className={`grid grid-cols-1 md:grid-cols-${numPlayers} gap-4 mb-6`}>
            {queries.map((q, i) => (
              <div key={i} className="relative">
                <input
                  type="text"
                  placeholder={`Nom du joueur ${i + 1}...`}
                  value={q}
                  onChange={(e) => handleQueryChange(i, e.target.value)}
                  className={`border rounded-lg px-4 py-3 w-full focus:ring-2 focus:ring-blue-500 outline-none transition ${
                    players[i] ? `border-${colors[i].replace('#','')} border-l-4` : "border-gray-300"
                  }`}
                  style={players[i] ? { borderLeftColor: colors[i] } : {}}
                />
                {players[i] && (
                   <span className="absolute right-3 top-3 text-green-500">✓</span>
                )}
              </div>
            ))}
          </div>

          {/* Boutons d'action */}
          <div className="flex justify-center gap-4">
            <button
              onClick={handleCompare}
              disabled={loading}
              className="bg-blue-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-blue-700 transition disabled:opacity-50 shadow-lg flex items-center gap-2"
            >
              {loading ? "⏳ Recherche..." : " Comparer"}
            </button>
            <button
              onClick={handleReset}
              className="bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-bold hover:bg-gray-300 transition"
            >
              Effacer
            </button>
          </div>

          {error && (
            <div className="mt-6 p-4 bg-red-50 text-red-700 rounded-lg text-center border border-red-200 flex items-center justify-center gap-2">
              <span>⚠️</span> {error}
            </div>
          )}
        </div>

        {/* Historique */}
        {history.length > 0 && !comparing && !players.some(p => p !== null) && (
          <div className="bg-white rounded-xl shadow-lg p-4 mb-6 print:hidden">
            <h3 className="text-lg font-semibold text-gray-700 mb-3 flex items-center justify-between">
              <span>Comparaisons récentes</span>
              <button onClick={clearHistory} className="text-xs text-red-600 hover:text-red-800">Effacer</button>
            </h3>
            <div className="flex flex-wrap gap-3">
              {history
                .filter(h => h.names && Array.isArray(h.names))
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

        {/* --- RÉSULTATS --- */}
        {players.some(p => p !== null) && !loading && (
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="space-y-8"
          >
            {/* BARRE D'EXPORTATION */}
            <div className="flex justify-end gap-2 print:hidden">
                <button onClick={() => handleExport('csv')} className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-bold rounded-lg transition flex items-center gap-2">
                  CSV
                </button>
                <button onClick={() => handleExport('excel')} className="px-3 py-2 bg-green-100 hover:bg-green-200 text-green-800 text-sm font-bold rounded-lg transition flex items-center gap-2">
                  Excel
                </button>
                <button onClick={() => handleExport('pdf')} className="px-3 py-2 bg-red-100 hover:bg-red-200 text-red-800 text-sm font-bold rounded-lg transition flex items-center gap-2">
                  PDF
                </button>
            </div>

            {/* 1. Cartes Joueurs */}
            <div className={`grid grid-cols-1 md:grid-cols-${numPlayers} gap-6`}>
              {players.map((p, i) => (
                p ? (
                  <div key={i} className="bg-white rounded-xl shadow-md overflow-hidden border-t-4 print:border print:shadow-none" style={{ borderColor: colors[i] }}>
                    <div className="p-6">
                      <div className="flex justify-between items-start">
                        <h3 className="text-xl font-bold mb-1 truncate w-full" style={{ color: colors[i] }}>
                            {p.name}
                        </h3>
                        <Link to={`/player/${p.id}`} className="text-gray-400 hover:text-blue-500 print:hidden">↗</Link>
                      </div>
                      
                      <div className="text-sm text-gray-600 space-y-1 mb-4">
                        <p>{p.club || "Sans club"}</p>
                        <p className="flex items-center gap-2">
                            <FlagIcon countryCode={p.nationality} /> {p.nationality}
                        </p>
                        <p>{p.position}</p>
                        <div className="flex gap-2 mt-2">
                            <span className="bg-gray-100 px-2 py-1 rounded text-xs font-semibold">{p.age} ans</span>
                            <span className="bg-gray-100 px-2 py-1 rounded text-xs font-semibold">{p.height} cm</span>
                            {p.transfer_value && <span className="bg-green-50 text-green-700 px-2 py-1 rounded text-xs font-semibold">{p.transfer_value}</span>}
                        </div>
                      </div>

                      {/* Mini Stats */}
                      <div className="pt-4 border-t grid grid-cols-3 gap-2 text-center text-xs">
                        <div className="bg-blue-50 p-2 rounded print:bg-transparent print:border">
                          <div className="font-bold text-blue-700 text-lg">{p.avg_technical?.toFixed(1)}</div>
                          <div className="text-blue-600/80">Tech</div>
                        </div>
                        <div className="bg-purple-50 p-2 rounded print:bg-transparent print:border">
                          <div className="font-bold text-purple-700 text-lg">{p.avg_mental?.toFixed(1)}</div>
                          <div className="text-purple-600/80">Mental</div>
                        </div>
                        <div className="bg-green-50 p-2 rounded print:bg-transparent print:border">
                          <div className="font-bold text-green-700 text-lg">{p.avg_physical?.toFixed(1)}</div>
                          <div className="text-green-600/80">Phys</div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div key={i} className="bg-gray-50 rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center h-full min-h-[200px] text-gray-400 print:hidden">
                    <span className="text-4xl mb-2">👤</span>
                    <span>Joueur {i+1}</span>
                  </div>
                )
              ))}
            </div>

            {/* 2. Graphiques Radar */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <RadarCard 
                title="Vue d'ensemble" 
                data={buildRadarData("overview")} 
                players={players} 
                colors={colors} 
              />
              <RadarCard 
                title="Technique" 
                data={buildRadarData("technical")} 
                players={players} 
                colors={colors} 
              />
              <RadarCard 
                title="Mental" 
                data={buildRadarData("mental")} 
                players={players} 
                colors={colors} 
              />
              <RadarCard 
                title="Physique" 
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

// Composant Graphique 
function RadarCard({ title, data, players, colors }) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 print:shadow-none print:border-gray-300 print:break-inside-avoid">
      <h3 className="text-lg font-bold text-center text-gray-700 mb-4">{title}</h3>
      <div className="h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart outerRadius={90} data={data}>
            <PolarGrid stroke="#e5e7eb" />
            <PolarAngleAxis dataKey="metric" tick={{ fontSize: 11, fill: '#4b5563' }} />
            <PolarRadiusAxis angle={30} domain={[0, 20]} tick={false} axisLine={false} />
            
            {players.map((p, i) => (
              p && (
                <Radar
                  key={i}
                  name={p.name}
                  dataKey={p.name}
                  stroke={colors[i]}
                  fill={colors[i]}
                  fillOpacity={0.2}
                />
              )
            ))}
            
            <Legend iconType="circle" wrapperStyle={{ paddingTop: '10px', fontSize: '12px' }}/>
            <Tooltip 
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                itemStyle={{ fontSize: '12px' }}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}