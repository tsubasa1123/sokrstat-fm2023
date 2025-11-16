// frontend/src/components/ScrollToTop.jsx
import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * Composant utilitaire qui force un retour en haut de la page
 * avec un scroll doux à chaque changement de route.
 */
export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: "smooth", // 🌀 scroll doux
    });
  }, [pathname]);

  return null;
}
