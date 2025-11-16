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
      const data = await getPlayer(id);
      setPlayer(data);
    } catch (err) {
      console.error(err);
      setError("Impossible de charger les données du joueur");
    } finally {
      setLoading(false);
    }
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

  // Données pour le graphique radar
  const radarData = [
    { attribute: "Technique", value: player.avg_technical || 0 },
    { attribute: "Mental", value: player.avg_mental || 0 },
    { attribute: "Physique", value: player.avg_physical || 0 },
  ];

  // Ajouter gardien si applicable
  if (player.position?.includes("GK") && player.avg_goalkeeper > 0) {
    radarData.push({ attribute: "Gardien", value: player.avg_goalkeeper });
  }

  const isGoalkeeper = player.position?.includes("GK");

  return (
    <motion.div
      className="min-h-screen bg-gray-50 p-4 md:p-6"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <Link to="/players" className="text-blue-600 hover:underline mb-6 inline-flex items-center gap-2">
          ← Retour à la liste
        </Link>

        {/* Carte principale */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex flex-col md:flex-row justify-between items-start gap-6">
            {/* Infos principales */}
            <div className="flex-1">
              <h1 className="text-4xl font-bold text-gray-800 mb-2">{player.name}</h1>
              
              <div className="flex flex-wrap gap-2 mb-4">
                {player.position && (
                  <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                    {player.position}
                  </span>
                )}
                {player.age && (
                  <span className="bg-gray-200 text-gray-700 px-3 py-1 rounded-full text-sm">
                    {player.age} ans
                  </span>
                )}
                {player.preferred_foot && (
                  <span className="bg-green-500 text-white px-3 py-1 rounded-full text-sm">
                    {player.preferred_foot === "Left" ? "⚽ Gaucher" : player.preferred_foot === "Right" ? "⚽ Droitier" : "⚽ Ambidextre"}
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-gray-700">
                {player.club && (
                  <div className="flex items-center gap-2">
                    <span className="text-xl">🏟️</span>
                    <span><strong>Club:</strong> {player.club}</span>
                  </div>
         )}
                
{/* --- DÉBUT DE LA CORRECTION --- */}
                {player.nationality && (
                  <div className="flex items-center gap-2">
                    <FlagIcon countryCode={player.nationality} size="w-8 h-6" />
                    <span><strong>Nationalité:</strong> {player.nationality}</span>
                  </div>
                )}
{/* --- FIN DE LA CORRECTION --- */}

                {player.height && (
                  <div className="flex items-center gap-2">
                    <span className="text-xl">📏</span>
                    <span><strong>Taille:</strong> {player.height} cm</span>
                  </div>
                )}
                {player.weight && (
                  <div className="flex items-center gap-2">
                    <span className="text-xl">⚖️</span>
                    <span><strong>Poids:</strong> {player.weight} kg</span>
                  </div>
                )}
                {player.transfer_value && (
                  <div className="flex items-center gap-2">
                    <span className="text-xl">💰</span>
                    <span><strong>Valeur:</strong> {player.transfer_value}</span>
                  </div>
                )}
                {player.birth_date && (
                  <div className="flex items-center gap-2">
                    <span className="text-xl">📅</span>
                    <span><strong>Date de naissance:</strong> {player.birth_date}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Graphique Radar */}
            <div className="w-full md:w-96">
               <ResponsiveContainer width="100%" height={300}>
                <RadarChart data={radarData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="attribute" />
                  <PolarRadiusAxis angle={90} domain={[0, 20]} />
                  <Radar name="Attributs" dataKey="value" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} />
                  <Tooltip />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Statistiques carrière */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <StatCard label="Matchs en carrière" value={player.career_apps || 0} icon="⚽" color="blue" />
          <StatCard label="Buts en carrière" value={player.career_goals || 0} icon="🎯" color="green" />
          <StatCard label="Matchs en championnat" value={player.league_apps || 0} icon="🏆" color="yellow" />
          <StatCard label="Buts en championnat" value={player.league_goals || 0} icon="⭐" color="red" />
        </div>

        {/* Attributs techniques */}
        {player.technical && (
          <AttributeSection
            title="⚙️ Attributs Techniques"
            attributes={player.technical}
            color="blue"
          />
        )}

        {/* Attributs mentaux */}
        {player.mental && (
          <AttributeSection
            title="🧠 Attributs Mentaux"
            attributes={player.mental}
            color="purple"
          />
  )}

        {/* Attributs physiques */}
        {player.physical && (
          <AttributeSection
            title="💪 Attributs Physiques"
            attributes={player.physical}
            color="green"
          />
        )}

        {/* Attributs gardien */}
        {isGoalkeeper && player.goalkeeper && (
          <AttributeSection
            title="🧤 Attributs Gardien"
            attributes={player.goalkeeper}
            color="yellow"
          />
        )}

        {/* Pieds */}
        {player.feet && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              👟 Maîtrise des pieds
            </h2>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-lg font-bold text-gray-700">Pied préféré</div>
                <div className="text-2xl font-bold text-blue-600">{player.feet.preferred || "—"}</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-gray-700">Pied gauche</div>
                <div className="text-2xl font-bold text-blue-600">{player.feet.left || "—"}/20</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-gray-700">Pied droit</div>
                <div className="text-2xl font-bold text-blue-600">{player.feet.right || "—"}/20</div>
              </div>
            </div>
          </div>
        )}

        {/* Bouton comparaison */}
         <div className="text-center">
          <Link
            to={`/compare?players=${player.id}`}
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-bold"
          >
            🔄 Comparer ce joueur
          </Link>
        </div>
      </div>
    </motion.div>
  );
}

// Composant carte statistique
function StatCard({ label, value, icon, color = "blue" }) {
  const colors = {
    blue: "bg-blue-500",
    green: "bg-green-500",
    yellow: "bg-yellow-500",
    red: "bg-red-500",
  };

  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      className="bg-white rounded-xl shadow-md p-4 text-center hover:shadow-lg transition"
   >
      <div className="text-3xl mb-2">{icon}</div>
      <div className={`text-2xl font-bold ${colors[color]} bg-opacity-20 rounded py-1`}>
        {value.toLocaleString()}
      </div>
      <div className="text-sm text-gray-600 mt-1">{label}</div>
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

  const bgColors = {
    blue: "bg-blue-50",
    purple: "bg-purple-50",
    green: "bg-green-50",
    yellow: "bg-yellow-50",
  };

  return (
    <div className={`bg-white rounded-xl shadow-lg p-6 mb-6 border-l-4 ${colorClasses[color]}`}>
     <h2 className="text-2xl font-bold mb-4">{title}</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {Object.entries(attributes).map(([key, value]) => {
          if (value === null || value === undefined) return null;
          
          // Formater le nom de l'attribut
          const label = key
            .replace(/_/g, " ")
            .replace(/\b\w/g, (c) => c.toUpperCase());

          return (
            <div key={key} className={`${bgColors[color]} rounded-lg p-3`}>
             <div className="text-sm text-gray-600 mb-1">{label}</div>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      value >= 15 ? "bg-green-500" :
                      value >= 10 ? "bg-yellow-500" :
                      "bg-red-500"
                    }`}
                    style={{ width: `${(value / 20) * 100}%` }}
                 ></div>
                </div>
                <span className="text-lg font-bold text-gray-800">{value}</span>
              </div>
            </div>
          );
       })}
      </div>
    </div>
  );
}