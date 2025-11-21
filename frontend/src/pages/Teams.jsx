import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { getFlagFromCode } from "../utils/flags";

export default function Teams() {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch("http://127.0.0.1:5000/api/teams")
      .then((res) => {
        if (!res.ok) throw new Error("Erreur lors du chargement des équipes");
        return res.json();
      })
      .then((data) => {
        setTeams(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError("Impossible de charger les équipes");
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="p-10 text-center text-lg text-primary dark:text-accent animate-pulse">
        ⏳ Chargement des équipes...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-10 text-center text-red-500 text-lg">
        ❌ {error}
      </div>
    );
  }

  if (teams.length === 0) {
    return (
      <div className="p-10 text-center text-gray-500 dark:text-gray-400">
        Aucune équipe disponible.
      </div>
    );
  }

  return (
    <motion.div
      className="pt-24 pb-12 px-6 max-w-6xl mx-auto"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <h1 className="text-3xl font-bold text-primary dark:text-accent mb-8 text-center">
         Liste des équipes
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {teams.map((team, i) => (
          <motion.div
            key={team.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Link
              to={`/team/${team.id}`} 
              className="block bg-white dark:bg-gray-800 p-5 rounded-xl shadow-md hover:shadow-glow transition transform hover:-translate-y-1"
            >
              <div className="flex items-center gap-3">
                {getFlagFromCode(team.country_code)} {/* drapeau */}
                <div>
                  <h2 className="text-xl font-semibold text-primary dark:text-accent">
                    {team.name}
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Code pays : {team.country_code}
                  </p>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
