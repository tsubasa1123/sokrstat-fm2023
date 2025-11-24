import { motion, AnimatePresence } from "framer-motion";

/**
 * Écran de chargement animé affiché entre les transitions de pages
 */
export default function SplashScreen() {
  return (
    <AnimatePresence>
      <motion.div
        key="splash"
        className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 text-primary dark:text-accent"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.4 }}
      >
        {/*  Logo animé */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="flex flex-col items-center"
        >
          <motion.span
            className="text-4xl sm:text-5xl font-bold tracking-wide"
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            Sokr<span className="text-accent">Stat</span>
          </motion.span>

          <motion.p
            className="mt-2 text-sm sm:text-base text-gray-500 dark:text-gray-400"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            ⚽ Statistiques & visualisations football
          </motion.p>
        </motion.div>

        {/* 🔄 Loader circulaire */}
        <motion.div
          className="mt-8 w-14 h-14 border-4 border-primary dark:border-accent border-t-transparent rounded-full"
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
        ></motion.div>

        {/*  Texte animé */}
        <motion.p
          className="mt-4 text-base font-medium"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ repeat: Infinity, duration: 1.2, repeatType: "reverse" }}
        >
          Chargement en cours...
        </motion.p>
      </motion.div>
    </AnimatePresence>
  );
}
