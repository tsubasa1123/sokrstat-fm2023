// frontend/src/components/LoadingSpinner.jsx
import { motion } from "framer-motion";

export default function LoadingSpinner() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 text-primary dark:text-accent">
      {/* Cercle animé */}
      <motion.div
        className="w-16 h-16 border-4 border-primary dark:border-accent border-t-transparent rounded-full"
        animate={{ rotate: 360 }}
        transition={{
          repeat: Infinity,
          duration: 1,
          ease: "linear",
        }}
      ></motion.div>

      {/* Texte animé */}
      <motion.p
        className="mt-4 text-lg font-medium"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ repeat: Infinity, duration: 1.2, repeatType: "reverse" }}
      >
        Chargement...
      </motion.p>
    </div>
  );
}
