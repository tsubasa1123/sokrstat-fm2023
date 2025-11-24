// src/components/FlagIcon.jsx - Drapeaux via FlagsCDN

import { getCountryCode } from "../utils/flags";

export default function FlagIcon({ 
  countryCode, 
  size = "medium", 
  rounded = true,
  className = "" 
}) {
  const code = getCountryCode(countryCode);
  
  if (!code) {
    return <span className="text-gray-400 text-xs">🌍</span>;
  }

  // Tailles disponibles
  const sizes = {
    small: "w-5 h-4",
    medium: "w-7 h-5",
    large: "w-10 h-7",
    xlarge: "w-14 h-10"
  };

  const sizeClass = sizes[size] || sizes.medium;
  const roundedClass = rounded ? "rounded" : "";

  return (
    <img 
      src={`https://flagcdn.com/${code}.svg`}
      alt={`Flag of ${countryCode}`}
      className={`${sizeClass} ${roundedClass} shadow-sm object-cover ${className}`}
      title={countryCode}
      loading="lazy"
      onError={(e) => {
        // Fallback si le drapeau n'existe pas
        e.target.style.display = 'none';
        e.target.parentNode.innerHTML = '🌍';
      }}
    />
  );
}