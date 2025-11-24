// Player.jsx - Page Détails Joueur FM2023
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Tooltip,
} from "recharts";
import { getPlayer } from "../services/api";
import FlagIcon from "../components/FlagIcon";

export default function Player() {
  const { id } = useParams();
  const [player, setPlayer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadPlayer();
  }, [id]);

  const loadPlayer = async () => {
    try {
      setLoading(true);
      const data = await getPlayer(id);
      setPlayer(data);
    } catch (err) {
      console.error(err);
      setError("Impossible de charger les données du joueur");
    } finally {
      setLoading(false);
    }
  };

  // --- FONCTION D'EXPORT POLYVALENTE ---
  const handleExport = (format) => {
    if (!player) return;

    // 1. Export PDF : On utilise l'impression native du navigateur
    if (format === 'pdf') {
      window.print();
      return;
    }

    // 2. Préparation des données pour CSV/Excel
    const flatData = {
      ID: player.id,
      Nom: player.name,
      Age: player.age,
      Nationalite: player.nationality,
      Club: player.club,
      Position: player.position,
      Valeur: player.transfer_value,
      Taille: player.height,
      Poids: player.weight,
      Pied_Prefere: player.preferred_foot,
      Matchs_Carriere: player.career_apps,
      Buts_Carriere: player.career_goals,
      Moy_Technique: player.avg_technical,
      Moy_Mental: player.avg_mental,
      Moy_Physique: player.avg_physical,
    };

    // Ajout des attributs détaillés
    if (player.technical) Object.entries(player.technical).forEach(([k, v]) => flatData[`Tech_${k}`] = v);
    if (player.mental) Object.entries(player.mental).forEach(([k, v]) => flatData[`Mental_${k}`] = v);
    if (player.physical) Object.entries(player.physical).forEach(([k, v]) => flatData[`Phys_${k}`] = v);
    if (player.goalkeeper) Object.entries(player.goalkeeper).forEach(([k, v]) => flatData[`GK_${k}`] = v);

    // 3. Configuration selon le format
    // Pour Excel, on ajoute le BOM (\uFEFF) pour forcer l'UTF-8 et on utilise le point-virgule si besoin
    const separator = format === 'excel' ? ';' : ','; 
    const bom = format === 'excel' ? '\uFEFF' : '';
    // On utilise .csv pour Excel aussi car c'est le format texte le plus compatible sans librairie lourde
    const extension = 'csv'; 

    const headers = Object.keys(flatData).join(separator);
    const values = Object.values(flatData).map(v => {
        // Échapper les valeurs pour le CSV
        const stringVal = String(v !== undefined && v !== null ? v : '');
        return `"${stringVal.replace(/"/g, '""')}"`;
    }).join(separator);

    const csvContent = "data:text/csv;charset=utf-8," + encodeURIComponent(bom + headers + "\n" + values);

    // 4. Téléchargement
    const link = document.createElement("a");
    link.setAttribute("href", csvContent);
    link.setAttribute("download", `SokrStat_${player.name.replace(/ /g, "_")}_${format}.${extension}`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement du joueur...</p>
        </div>
      </div>
    );
  }

  if (error || !player) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center text-red-600">
          <span className="text-3xl">❌</span>
          <p className="text-xl font-bold mt-2">{error || "Joueur introuvable"}</p>
          <Link to="/players" className="mt-4 inline-block px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
            Retour à la liste
          </Link>
        </div>
      </div>
    );
  }

  const radarData = [
    { attribute: "Technique", value: player.avg_technical || 0 },
    { attribute: "Mental", value: player.avg_mental || 0 },
    { attribute: "Physique", value: player.avg_physical || 0 },
  ];

  if (player.position?.includes("GK") && player.avg_goalkeeper > 0) {
    radarData.push({ attribute: "Gardien", value: player.avg_goalkeeper });
  }

  const isGoalkeeper = player.position?.includes("GK");

  return (
    <motion.div
      className="min-h-screen bg-gray-50 p-4 md:p-6 print:bg-white print:p-0"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="max-w-7xl mx-auto">
        {/* Header de navigation (Masqué à l'impression) */}
        <div className="flex justify-between items-center mb-6 print:hidden">
          <Link to="/players" className="text-blue-600 hover:underline inline-flex items-center gap-2">
            ← Retour à la liste
          </Link>
        </div>

        {/* Carte principale */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6 relative overflow-hidden print:shadow-none print:border print:border-gray-300">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 to-purple-600 print:hidden"></div>

          <div className="flex flex-col md:flex-row justify-between items-start gap-6 pt-4">
            
            {/* Infos principales */}
            <div className="flex-1 w-full">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                <h1 className="text-4xl font-bold text-gray-800">{player.name}</h1>
                
                {/* Menu d'Export (Masqué à l'impression) */}
                <div className="flex gap-2 print:hidden">
                    <button
                      onClick={() => handleExport('csv')}
                      className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-bold rounded-lg transition flex items-center gap-1"
                      title="Format universel"
                    >
                      CSV
                    </button>
                    <button
                      onClick={() => handleExport('excel')}
                      className="px-3 py-2 bg-green-100 hover:bg-green-200 text-green-800 text-sm font-bold rounded-lg transition flex items-center gap-1"
                      title="Format optimisé pour Excel"
                    >
                      Excel
                    </button>
                    <button
                      onClick={() => handleExport('pdf')}
                      className="px-3 py-2 bg-red-100 hover:bg-red-200 text-red-800 text-sm font-bold rounded-lg transition flex items-center gap-1"
                      title="Imprimer en PDF"
                    >
                      PDF
                    </button>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2 mb-6">
                {player.position && (
                  <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-bold border border-blue-200 print:border-gray-300">
                    {player.position}
                  </span>
                )}
                {player.age && (
                  <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm border border-gray-200 print:border-gray-300">
                    {player.age} ans
                  </span>
                )}
                {player.preferred_foot && (
                  <span className="bg-green-50 text-green-700 px-3 py-1 rounded-full text-sm border border-green-200 print:border-gray-300">
                    {player.preferred_foot === "Left" ? "Gaucher" : player.preferred_foot === "Right" ? "Droitier" : "Ambidextre"}
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-gray-700 bg-gray-50 p-4 rounded-xl border border-gray-100 print:bg-white print:border-gray-300">
                <div className="flex items-center gap-3">
                  <span className="text-2xl"></span>
                  <div>
                    <p className="text-xs text-gray-500 uppercase font-semibold">Club</p>
                    <p className="font-medium">{player.club || "Sans club"}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="w-8 flex justify-center">
                      <FlagIcon countryCode={player.nationality} />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase font-semibold">Nationalité</p>
                    <p className="font-medium">{player.nationality}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                    <span className="text-2xl"></span>
                    <div>
                      <p className="text-xs text-gray-500 uppercase font-semibold">Physique</p>
                      <p className="font-medium">
                        {player.height ? `${player.height} cm` : '-'} / {player.weight ? `${player.weight} kg` : '-'}
                      </p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-2xl"></span>
                  <div>
                    <p className="text-xs text-gray-500 uppercase font-semibold">Valeur estimée</p>
                    <p className="font-medium text-green-600">{player.transfer_value || "Non définie"}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Graphique Radar */}
            <div className="w-full md:w-1/3 flex flex-col items-center print:hidden">
                <h3 className="text-lg font-semibold text-gray-700 mb-2">Profil du Joueur</h3>
                <div className="w-full h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                      <PolarGrid stroke="#e5e7eb" />
                      <PolarAngleAxis dataKey="attribute" tick={{ fill: '#4b5563', fontSize: 12 }} />
                      <PolarRadiusAxis angle={30} domain={[0, 20]} tick={false} axisLine={false} />
                      <Radar name={player.name} dataKey="value" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.5} />
                      <Tooltip />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
            </div>
          </div>
        </div>

        {/* Statistiques carrière */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard label="Matchs en carrière" value={player.career_apps || 0} color="blue" />
          <StatCard label="Buts en carrière" value={player.career_goals || 0}  color="green" />
          <StatCard label="Apps (Champ.)" value={player.league_apps || 0}      color="yellow" />
          <StatCard label="Buts (Champ.)" value={player.league_goals || 0}     color="red" />
        </div>

        {/* Attributs techniques */}
        {player.technical && (
          <AttributeSection
            title="Attributs Techniques"
            attributes={player.technical}
            color="blue"
          />
        )}

        {/* Attributs mentaux */}
        {player.mental && (
          <AttributeSection
            title="Attributs Mentaux"
            attributes={player.mental}
            color="purple"
          />
        )}

        {/* Attributs physiques */}
        {player.physical && (
          <AttributeSection
            title="Attributs Physiques"
            attributes={player.physical}
            color="green"
          />
        )}

        {/* Attributs gardien */}
        {isGoalkeeper && player.goalkeeper && (
          <AttributeSection
            title="Attributs Gardien"
            attributes={player.goalkeeper}
            color="yellow"
          />
        )}

        {/* Pieds */}
        {player.feet && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border border-gray-100 print:shadow-none print:border-gray-300">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-gray-800">
              Maîtrise des pieds
            </h2>
            <div className="grid grid-cols-3 gap-8">
              <div className="text-center p-4 bg-gray-50 rounded-lg print:bg-white print:border print:border-gray-200">
                <div className="text-sm font-semibold text-gray-500 uppercase mb-1">Pied préféré</div>
                <div className="text-2xl font-bold text-blue-600">{player.feet.preferred || "—"}</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg print:bg-white print:border print:border-gray-200">
                <div className="text-sm font-semibold text-gray-500 uppercase mb-1">Pied gauche</div>
                <div className="text-2xl font-bold text-blue-600">{player.feet.left || "—"}<span className="text-sm text-gray-400 font-normal">/20</span></div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg print:bg-white print:border print:border-gray-200">
                <div className="text-sm font-semibold text-gray-500 uppercase mb-1">Pied droit</div>
                <div className="text-2xl font-bold text-blue-600">{player.feet.right || "—"}<span className="text-sm text-gray-400 font-normal">/20</span></div>
              </div>
            </div>
          </div>
        )}

        {/* Bouton comparaison (Masqué à l'impression) */}
        <div className="text-center mb-12 print:hidden">
          <Link
            to={`/compare?players=${player.id}`}
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition font-bold shadow-lg transform hover:-translate-y-1"
          >
            <span className="text-xl"></span> Comparer ce joueur
          </Link>
        </div>
      </div>
    </motion.div>
  );
}

// Composant carte statistique
function StatCard({ label, value, icon, color = "blue" }) {
  const colors = {
    blue: "text-blue-600 bg-blue-50 border-blue-100",
    green: "text-green-600 bg-green-50 border-green-100",
    yellow: "text-yellow-600 bg-yellow-50 border-yellow-100",
    red: "text-red-600 bg-red-50 border-red-100",
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className={`rounded-xl shadow-sm p-4 text-center border ${colors[color]} transition print:shadow-none print:border-gray-300`}
    >
      <div className="text-3xl mb-2">{icon}</div>
      <div className="text-2xl font-bold mb-1">
        {value.toLocaleString()}
      </div>
      <div className="text-xs uppercase font-semibold opacity-80">{label}</div>
    </motion.div>
  );
}

// Composant section d'attributs
function AttributeSection({ title, attributes, color }) {
  const colorClasses = {
    blue: "border-blue-500",
    purple: "border-purple-500",
    green: "border-green-500",
    yellow: "border-yellow-500",
  };

  const barColors = {
     blue: "bg-blue-500",
     purple: "bg-purple-500",
     green: "bg-green-500",
     yellow: "bg-yellow-500",
  };

  return (
    <div className={`bg-white rounded-xl shadow-lg p-6 mb-6 border-l-4 ${colorClasses[color]} print:shadow-none print:border print:border-gray-300`}>
      <h2 className="text-2xl font-bold mb-6 text-gray-800">{title}</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-8 gap-y-4">
        {Object.entries(attributes).map(([key, value]) => {
          if (value === null || value === undefined) return null;
          
          const label = key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

          return (
            <div key={key} className="flex flex-col">
              <div className="flex justify-between items-end mb-1">
                <span className="text-sm font-medium text-gray-600">{label}</span>
                <span className={`text-sm font-bold ${value >= 15 ? "text-green-600" : value >= 10 ? "text-blue-600" : "text-gray-500"}`}>
                    {value}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5 print:bg-gray-100">
                <div
                  className={`h-2.5 rounded-full ${
                    value >= 15 ? "bg-green-500" :
                    value >= 10 ? barColors[color] :
                    "bg-gray-400"
                  } print:bg-black`} // En impression noir et blanc, on force une couleur sombre
                  style={{ width: `${(value / 20) * 100}%` }}
                ></div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}