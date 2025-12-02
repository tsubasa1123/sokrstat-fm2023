// App.jsx 
import { Routes, Route, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Navbar from "./components/Navbar";
import ScrollToTop from "./components/ScrollToTop";
import SplashScreen from "./components/SplashScreen";
import Home from "./pages/Home"; 
import Players from "./pages/Players";
import Player from "./pages/Player";
import Compare from "./pages/Compare";
import Admin from './pages/Admin';
import { Navigate } from 'react-router-dom';
import Login from './pages/Login';

// Composant pour protéger les routes admin
function ProtectedRoute({ children }) {
  const token = localStorage.getItem('admin_token');
  
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
}

// Animation de transition entre pages
function PageTransition({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}

export default function App() {
  const [darkMode, setDarkMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const location = useLocation();

  // Gestion du thème sombre
  useEffect(() => {
    if (darkMode) document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
  }, [darkMode]);

  // Splash screen lors du changement de route
  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => setLoading(false), 700);
    return () => clearTimeout(timer);
  }, [location.pathname]);

  if (loading) return <SplashScreen />;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-100 transition-colors duration-500 flex flex-col">
      {/* Barre de navigation */}
      <Navbar darkMode={darkMode} setDarkMode={setDarkMode} />

      {/* Contenu principal */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        <ScrollToTop />
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            {/* Accueil */}
            <Route path="/" element={<PageTransition><Home /></PageTransition>} />

            {/* Joueurs */}
            <Route path="/players" element={<PageTransition><Players /></PageTransition>} />
            <Route path="/player/:id" element={<PageTransition><Player /></PageTransition>} />

            {/* Comparateur */}
            <Route path="/compare" element={<PageTransition><Compare /></PageTransition>} />

            {/* Admin - CRUD */}
            <Route path="/" element={<PageTransition><Home /></PageTransition>} />
<Route path="/players" element={<PageTransition><Players /></PageTransition>} />
<Route path="/player/:id" element={<PageTransition><Player /></PageTransition>} />
<Route path="/compare" element={<PageTransition><Compare /></PageTransition>} />

{/* Login */}
<Route path="/login" element={<PageTransition><Login /></PageTransition>} />

{/* Admin protégé */}
<Route 
  path="/admin" 
  element={
    <ProtectedRoute>
      <PageTransition><Admin /></PageTransition>
    </ProtectedRoute>
  } 
/>
          </Routes>
        </AnimatePresence>
      </main>

      {/* Footer */}
      <motion.footer
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
        className="py-6 backdrop-blur-md bg-white/70 dark:bg-gray-800/60 border-t border-gray-200 dark:border-gray-700"
      >
        <div className="max-w-6xl mx-auto px-4 text-sm text-gray-500 dark:text-gray-400 text-center">
          © {new Date().getFullYear()} SokrStat - Football Manager 2023 • Projet LCAD - ISFA Lyon 1
        </div>
      </motion.footer>
    </div>
  );
}