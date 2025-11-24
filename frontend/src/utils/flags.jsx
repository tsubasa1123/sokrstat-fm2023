// src/utils/flags.js - Conversion code pays → code ISO pour drapeaux

/**
 * Convertit un code pays FM2023 en code ISO 3166-1 alpha-2
 * @param {string} countryCode - Code pays (ISO 3166-1 alpha-3)
 * @returns {string} Code ISO alpha-2 (pour flag-icons)
 */
export function getCountryCode(countryCode) {
  if (!countryCode) return null;
  
  // Mapping des codes pays FM2023 vers ISO 3166-1 alpha-2
  const countryCodeMap = {
    'ARG': 'ar', // Argentine
    'BRA': 'br', // Brésil
    'FRA': 'fr', // France
    'ENG': 'gb-eng', // Angleterre
    'ESP': 'es', // Espagne
    'GER': 'de', // Allemagne
    'ITA': 'it', // Italie
    'POR': 'pt', // Portugal
    'NED': 'nl', // Pays-Bas
    'BEL': 'be', // Belgique
    'URU': 'uy', // Uruguay
    'COL': 'co', // Colombie
    'MEX': 'mx', // Mexique
    'USA': 'us', // États-Unis
    'CAN': 'ca', // Canada
    'CHI': 'cl', // Chili
    'ECU': 'ec', // Équateur
    'PAR': 'py', // Paraguay
    'PER': 'pe', // Pérou
    'VEN': 've', // Venezuela
    'CRO': 'hr', // Croatie
    'SER': 'rs', // Serbie
    'POL': 'pl', // Pologne
    'SWE': 'se', // Suède
    'DEN': 'dk', // Danemark
    'NOR': 'no', // Norvège
    'SUI': 'ch', // Suisse
    'AUT': 'at', // Autriche
    'CZE': 'cz', // République tchèque
    'SVK': 'sk', // Slovaquie
    'SCO': 'gb-sct', // Écosse
    'WAL': 'gb-wls', // Pays de Galles
    'NIR': 'gb-nir', // Irlande du Nord
    'IRL': 'ie', // Irlande
    'TUR': 'tr', // Turquie
    'RUS': 'ru', // Russie
    'UKR': 'ua', // Ukraine
    'GRE': 'gr', // Grèce
    'ROU': 'ro', // Roumanie
    'BUL': 'bg', // Bulgarie
    'HUN': 'hu', // Hongrie
    'JPN': 'jp', // Japon
    'KOR': 'kr', // Corée du Sud
    'CHN': 'cn', // Chine
    'AUS': 'au', // Australie
    'NZL': 'nz', // Nouvelle-Zélande
    'RSA': 'za', // Afrique du Sud
    'NGA': 'ng', // Nigeria
    'EGY': 'eg', // Égypte
    'MAR': 'ma', // Maroc
    'ALG': 'dz', // Algérie
    'SEN': 'sn', // Sénégal
    'CMR': 'cm', // Cameroun
    'CIV': 'ci', // Côte d'Ivoire
    'GHA': 'gh', // Ghana
    'TUN': 'tn', // Tunisie
    'ISR': 'il', // Israël
    'SAU': 'sa', // Arabie Saoudite
    'IRN': 'ir', // Iran
    'IRQ': 'iq', // Irak
    'IND': 'in', // Inde
    'THA': 'th', // Thaïlande
    'VIE': 'vn', // Vietnam
    'PHI': 'ph', // Philippines
    'IDN': 'id', // Indonésie
    'MAS': 'my', // Malaisie
    'SIN': 'sg', // Singapour
  };

  const code = countryCode.toUpperCase();
  return countryCodeMap[code] || countryCode.toLowerCase();
}

/**
 * Composant Flag réutilisable
 */
export function FlagIcon({ countryCode, size = "w-6 h-4", className = "" }) {
  const code = getCountryCode(countryCode);
  
  if (!code) return <span className="text-gray-400">🌍</span>;
  
  return (
    <span 
      className={`fi fi-${code} ${size} ${className} inline-block rounded shadow-sm`}
      title={countryCode}
      style={{ fontSize: '1.5em', lineHeight: 1 }}
    />
  );
}