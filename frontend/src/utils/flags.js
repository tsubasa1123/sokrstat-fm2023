// src/utils/flags.js
export function getCountryCode(countryCode) {
  if (!countryCode) return null;
  
  const map = {
    'ARG': 'ar', 'BRA': 'br', 'FRA': 'fr', 'ENG': 'gb-eng',
    'ESP': 'es', 'GER': 'de', 'ITA': 'it', 'POR': 'pt',
    'NED': 'nl', 'BEL': 'be', 'USA': 'us', 'MEX': 'mx',
  };
  
  const code = countryCode.toUpperCase();
  return map[code] || countryCode.toLowerCase();
}