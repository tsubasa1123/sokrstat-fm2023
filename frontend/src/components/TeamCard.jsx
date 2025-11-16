import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

/* Carte interactive représentant une équipe.*/
export default function TeamCard({ team }) {
  const navigate = useNavigate();

  return (
    <motion.div
      onClick={() => navigate(`/team/${team.id}`)}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.97 }}
      className="
        bg-white dark:bg-gray-800 
        rounded-xl p-5 shadow-md cursor-pointer
        hover:shadow-glow transition
        flex flex-col items-start gap-2
      "
    >
      {/*  Nom de l'équipe */}
      <h2 className="text-xl font-semibold text-primary dark:text-accent">
        {team.name}
      </h2>

      {/*  Code du pays */}
      <p className="text-gray-600 dark:text-gray-300 text-sm">
         {team.country_code || "Code inconnu"}
      </p>

      {/* 🔹 Petit effet de ligne décorative */}
      <div className="mt-2 w-full h-[2px] bg-primary/20 dark:bg-accent/30 rounded-full"></div>

      {/*  Animation d’apparition */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="text-sm text-gray-500 dark:text-gray-400"
      >
        Cliquez pour voir les joueurs →
      </motion.div>
    </motion.div>
  );
}
