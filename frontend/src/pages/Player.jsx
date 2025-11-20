// Player.jsx - Page Détails Joueur FM2023
import { useEffect, useState, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import LoadingSpinner from "../components/LoadingSpinner";

const Player = () => {
  const { id } = useParams();
  const [player, setPlayer] = useState(null);
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  const loadPlayer = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/players/${id}`
      );

      if (!response.ok) throw new Error("Impossible de charger le joueur");

      const data = await response.json();
      setPlayer(data.player);
      setStats(data.stats);
      setLoading(false);
    } catch (error) {
      console.error("Erreur:", error);
      setError("Erreur lors du chargement du joueur");
      setLoading(false);
    }
  };

  // 📌 EXPORT (PDF / Excel / CSV)
  const handleExport = async (format) => {
    try {
      setLoading(true);

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/players/${id}/export/${format}`
      );

      if (!response.ok) throw new Error("Erreur lors de l'export");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;

      const extension =
        format === "excel" ? "xlsx" : format === "csv" ? "csv" : "pdf";

      link.setAttribute(
        "download",
        `${player.name.replace(/ /g, "_")}_stats.${extension}`
      );

      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      setLoading(false);
    } catch (error) {
      console.error("Erreur export:", error);
      setError("Erreur lors de l'export");
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPlayer();
  }, []);

  if (loading) return <LoadingSpinner />;
  if (error) return <p className="text-center text-red-500">{error}</p>;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Link to="/" className="text-blue-500 hover:underline">
        ← Retour
      </Link>

      <h1 className="text-3xl font-bold text-center mt-4 mb-6">
        {player.name}
      </h1>

      {/* BOUTONS D'EXPORT */}
      <div className="flex justify-center gap-4 mb-6">
        <button
          onClick={() => handleExport("pdf")}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
        >
          📄 Export PDF
        </button>

        <button
          onClick={() => handleExport("excel")}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
        >
          📊 Export Excel
        </button>

        <button
          onClick={() => handleExport("csv")}
          className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-800"
        >
          🧾 Export CSV
        </button>
      </div>

      {/* STATISTIQUES */}
      <div className="bg-white shadow p-6 rounded-lg">
        <h2 className="text-xl font-semibold mb-4">Statistiques</h2>

        {stats.length === 0 ? (
          <p className="text-gray-500 text-center">Aucune statistique trouvée.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border">
              <thead className="bg-gray-200">
                <tr>
                  <th className="p-2 border">Saison</th>
                  <th className="p-2 border">Âge</th>
                  <th className="p-2 border">Club</th>
                  <th className="p-2 border">Compétition</th>
                  <th className="p-2 border">Matchs joués</th>
                  <th className="p-2 border">Buts</th>
                  <th className="p-2 border">Passes décisives</th>
                </tr>
              </thead>
              <tbody>
                {stats.map((s, idx) => (
                  <tr key={idx} className="text-center">
                    <td className="p-2 border">{s.season}</td>
                    <td className="p-2 border">{s.age}</td>
                    <td className="p-2 border">{s.club}</td>
                    <td className="p-2 border">{s.competition}</td>
                    <td className="p-2 border">{s.appearances}</td>
                    <td className="p-2 border">{s.goals}</td>
                    <td className="p-2 border">{s.assists}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* BOUTON COMPARAISON */}
      <div className="text-center mt-8">
        <Link
          to={`/compare/${id}`}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          ⚔️ Comparer ce joueur
        </Link>
      </div>
    </div>
  );
};

export default Player;
