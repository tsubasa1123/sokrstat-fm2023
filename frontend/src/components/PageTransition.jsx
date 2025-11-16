import { motion } from "framer-motion";

export default function PageTransition({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}   // départ (invisible, à droite)
      animate={{ opacity: 1, x: 0 }}    // entrée (visible, centré)
      exit={{ opacity: 0, x: -50 }}     // sortie (vers la gauche)
      transition={{ duration: 0.4, ease: "easeInOut" }}
      className="w-full h-full"
    >
      {children}
    </motion.div>
  );
}
