// Navbar.jsx 
import { NavLink } from "react-router-dom";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";

export default function Navbar() {
  const [darkMode, setDarkMode] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Gestion du thème sombre
  useEffect(() => {
    if (darkMode) document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
  }, [darkMode]);

  // Détection du scroll pour changer le style de la navbar
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={`
        fixed top-0 left-0 w-full z-50 transition-all duration-500
        backdrop-blur-md
        ${isScrolled
          ? "bg-white/80 dark:bg-gray-900/70 shadow-md border-b border-gray-200 dark:border-gray-700"
          : "bg-transparent"
        }
      `}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="flex items-center gap-2 cursor-pointer"
          >
            <span className="text-2xl font-extrabold text-primary dark:text-accent drop-shadow-sm">
              Sokr<span className="text-accent dark:text-primary">Stat</span>
            </span>
            <span className="hidden sm:inline text-sm text-gray-500 dark:text-gray-400">
              Football Manager 2023
            </span>
          </motion.div>

          {/* Navigation principale */}
          <nav className="flex items-center gap-4 text-sm font-medium">
            <NavItem to="/" label="Accueil" />
            <NavItem to="/players" label="Joueurs" />
            <NavItem to="/compare" label="Comparateur" />
            <NavItem to="/admin" label="Admin" /> 
            
            {/* Bouton thème sombre */}
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setDarkMode(!darkMode)}
              className="ml-2 px-3 py-2 rounded-md text-sm font-semibold bg-primary text-white dark:bg-accent dark:text-gray-900 hover:opacity-85 transition"
            >
              {darkMode ? "☀️" : "🌙"}
            </motion.button>
          </nav>
        </div>
      </div>
    </motion.header>
  );
}

// Composant pour chaque lien de navigation
function NavItem({ to, label }) {
  return (
    <NavLink
      to={to}
      end
      className={({ isActive }) =>
        `px-3 py-2 rounded-md transition-all duration-300 ${
          isActive
            ? "text-primary dark:text-accent font-semibold bg-primary/10 dark:bg-accent/20 shadow-sm"
            : "text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-accent"
        }`
      }
    >
      {label}
    </NavLink>
  );
}