import { motion } from "framer-motion";

/**
 * Carte d'affichage d'un joueur
 * Utilisée pour la page d'équipe ou les classements
 */
export default function PlayerCard({ player, onClick }) {
  return (
    <motion.div
      onClick={onClick}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.97 }}
      className="
        bg-white dark:bg-gray-800 
        rounded-2xl shadow-md p-5 
        cursor-pointer hover:shadow-glow 
        transition duration-200
        flex flex-col items-center justify-center
      "
    >
      {/*  Nom du joueur */}
      <h2 className="text-lg font-semibold text-primary dark:text-accent mb-1 text-center">
        {player.name || "Joueur inconnu"}
      </h2>

      {/*  Équipe */}
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
        {player.team_name ? `${player.team_name}` : "Équipe inconnue"}
      </p>

      {/*  Statistiques principales */}
      <div className="flex gap-3 text-sm text-gray-500 dark:text-gray-300">
        <span>{player.goals ?? 0}</span>
        <span>{player.assists ?? 0}</span>
        <span>{player.minutes ?? 0} min</span>
      </div>

      {/*  Position + maillot */}
      <div className="mt-3 text-sm text-gray-500 dark:text-gray-400 italic">
        {player.position_detailed || player.position || "—"}
        {player.jersey_number ? ` • #${player.jersey_number}` : ""}
      </div>
    </motion.div>
  );
}
