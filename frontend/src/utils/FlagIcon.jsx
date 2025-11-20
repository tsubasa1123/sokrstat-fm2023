import React from 'react';

// Mapping partiel des codes pays FM (3 lettres) vers ISO-2 (2 lettres) pour flagcdn.
const countryMap = {
  "ALG": "dz", "ANG": "ao", "ARG": "ar", "AUS": "au", "AUT": "at",
  "BEL": "be", "BIH": "ba", "BRA": "br", "BUL": "bg", "CAN": "ca",
  "CHI": "cl", "CHN": "cn", "COL": "co", "CRC": "cr", "CRO": "hr",
  "CZE": "cz", "DEN": "dk", "ECU": "ec", "EGY": "eg", "ENG": "gb-eng",
  "ESP": "es", "FIN": "fi", "FRA": "fr", "GER": "de", "GHA": "gh",
  "GRE": "gr", "HON": "hn", "HUN": "hu", "ICE": "is", "IRL": "ie",
  "IRN": "ir", "ISR": "il", "ITA": "it", "JPN": "jp", "KOR": "kr",
  "KSA": "sa", "MAR": "ma", "MEX": "mx", "NED": "nl", "NGA": "ng",
  "NIR": "gb-nir", "NOR": "no", "NZL": "nz", "PAR": "py", "PER": "pe",
  "POL": "pl", "POR": "pt", "ROU": "ro", "RSA": "za", "RUS": "ru",
  "SCO": "gb-sct", "SEN": "sn", "SRB": "rs", "SUI": "ch", "SVK": "sk",
  "SVN": "si", "SWE": "se", "TUN": "tn", "TUR": "tr", "UKR": "ua",
  "URU": "uy", "USA": "us", "VEN": "ve", "WAL": "gb-wls"
};

const FlagIcon = ({ countryCode }) => {
  if (!countryCode) return null;

  // Récupère le code ISO-2 ou utilise les 2 premières lettres en minuscule par défaut
  const code = countryMap[countryCode] || countryCode.slice(0, 2).toLowerCase();

  return (
    <img 
      src={`https://flagcdn.com/24x18/${code}.png`}
      srcSet={`https://flagcdn.com/48x36/${code}.png 2x`}
      width="24" 
      height="18" 
      alt={countryCode}
      className="mr-2 inline-block shadow-sm rounded-sm object-cover"
      style={{ verticalAlign: 'middle' }}
      onError={(e) => { 
        e.target.style.display = 'none'; 
      }}
    />
  );
};

export default FlagIcon;