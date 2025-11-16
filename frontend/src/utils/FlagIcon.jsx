// src/components/FlagIcon.jsx
import { getCountryCode } from "../utils/flags";

export default function FlagIcon({ countryCode, size = "w-6 h-4" }) {
  const code = getCountryCode(countryCode);
  
  if (!code) return <span>🌍</span>;
  
  return (
    <img 
      src={`https://flagcdn.com/${code}.svg`}
      alt={countryCode}
      className={`${size} rounded shadow-sm`}
      loading="lazy"
    />
  );
}