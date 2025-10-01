// Utility functions for validating geographic consistency

export interface GeographicBounds {
  latMin: number;
  latMax: number;
  lonMin: number;
  lonMax: number;
  name: string;
}

// Define geographic bounds for French territories
export const GEOGRAPHIC_REGIONS: Record<string, GeographicBounds> = {
  'mainland': {
    latMin: 41,
    latMax: 51,
    lonMin: -5,
    lonMax: 10,
    name: 'France métropolitaine'
  },
  'martinique': {
    latMin: 14.3,
    latMax: 14.9,
    lonMin: -61.3,
    lonMax: -60.7,
    name: 'Martinique'
  },
  'guadeloupe': {
    latMin: 15.8,
    latMax: 16.5,
    lonMin: -61.8,
    lonMax: -61.0,
    name: 'Guadeloupe'
  },
  'guyane': {
    latMin: 2.0,
    latMax: 6.0,
    lonMin: -55.0,
    lonMax: -51.0,
    name: 'Guyane'
  },
  'reunion': {
    latMin: -21.4,
    latMax: -20.9,
    lonMin: 55.2,
    lonMax: 55.8,
    name: 'La Réunion'
  },
  'mayotte': {
    latMin: -13.0,
    latMax: -12.6,
    lonMin: 45.0,
    lonMax: 45.3,
    name: 'Mayotte'
  }
};

// Determine which region coordinates belong to
export const detectRegionFromCoordinates = (
  latitude: number,
  longitude: number
): string | null => {
  for (const [key, bounds] of Object.entries(GEOGRAPHIC_REGIONS)) {
    if (
      latitude >= bounds.latMin &&
      latitude <= bounds.latMax &&
      longitude >= bounds.lonMin &&
      longitude <= bounds.lonMax
    ) {
      return key;
    }
  }
  return null;
};

// Check if declared region matches GPS coordinates
export const validateCoordinatesMatchRegion = (
  latitude: number,
  longitude: number,
  declaredRegion: string,
  declaredCountry: string
): {
  isValid: boolean;
  detectedRegion: string | null;
  declaredRegionKey: string | null;
  message?: string;
} => {
  const detectedRegionKey = detectRegionFromCoordinates(latitude, longitude);
  
  // Determine which region was declared
  const normalized = `${declaredRegion} ${declaredCountry}`.toLowerCase();
  
  let declaredRegionKey: string | null = null;
  
  if (normalized.includes('martinique')) declaredRegionKey = 'martinique';
  else if (normalized.includes('guadeloupe')) declaredRegionKey = 'guadeloupe';
  else if (normalized.includes('guyane')) declaredRegionKey = 'guyane';
  else if (normalized.includes('réunion') || normalized.includes('reunion')) declaredRegionKey = 'reunion';
  else if (normalized.includes('mayotte')) declaredRegionKey = 'mayotte';
  else declaredRegionKey = 'mainland';
  
  const isValid = detectedRegionKey === declaredRegionKey;
  
  if (!isValid && detectedRegionKey && declaredRegionKey) {
    const detectedName = GEOGRAPHIC_REGIONS[detectedRegionKey]?.name || detectedRegionKey;
    const declaredName = GEOGRAPHIC_REGIONS[declaredRegionKey]?.name || declaredRegionKey;
    
    return {
      isValid: false,
      detectedRegion: detectedRegionKey,
      declaredRegionKey,
      message: `Les coordonnées GPS pointent vers ${detectedName}, mais le commerce est déclaré en ${declaredName}`
    };
  }
  
  return {
    isValid: true,
    detectedRegion: detectedRegionKey,
    declaredRegionKey
  };
};

// Map postal codes to departments
export const getDepartmentFromPostalCode = (postalCode: string): {
  departmentCode: string;
  departmentName: string;
  region: string;
} | null => {
  // Handle 4-digit postal codes (add leading zero)
  let code = postalCode;
  if (code.length === 4 && parseInt(code) < 9999) {
    code = '0' + code;
  }
  
  if (code.length !== 5) return null;
  
  const departmentCode = code.substring(0, 2);
  
  const departmentMap: Record<string, { name: string; region: string }> = {
    '01': { name: 'Ain', region: 'Auvergne-Rhône-Alpes' },
    '02': { name: 'Aisne', region: 'Hauts-de-France' },
    '03': { name: 'Allier', region: 'Auvergne-Rhône-Alpes' },
    '04': { name: 'Alpes-de-Haute-Provence', region: 'Provence-Alpes-Côte d\'Azur' },
    '05': { name: 'Hautes-Alpes', region: 'Provence-Alpes-Côte d\'Azur' },
    '06': { name: 'Alpes-Maritimes', region: 'Provence-Alpes-Côte d\'Azur' },
    '07': { name: 'Ardèche', region: 'Auvergne-Rhône-Alpes' },
    '08': { name: 'Ardennes', region: 'Grand Est' },
    '09': { name: 'Ariège', region: 'Occitanie' },
    '10': { name: 'Aube', region: 'Grand Est' },
    '11': { name: 'Aude', region: 'Occitanie' },
    '12': { name: 'Aveyron', region: 'Occitanie' },
    '13': { name: 'Bouches-du-Rhône', region: 'Provence-Alpes-Côte d\'Azur' },
    '14': { name: 'Calvados', region: 'Normandie' },
    '15': { name: 'Cantal', region: 'Auvergne-Rhône-Alpes' },
    '16': { name: 'Charente', region: 'Nouvelle-Aquitaine' },
    '17': { name: 'Charente-Maritime', region: 'Nouvelle-Aquitaine' },
    '18': { name: 'Cher', region: 'Centre-Val de Loire' },
    '19': { name: 'Corrèze', region: 'Nouvelle-Aquitaine' },
    '21': { name: 'Côte-d\'Or', region: 'Bourgogne-Franche-Comté' },
    '22': { name: 'Côtes-d\'Armor', region: 'Bretagne' },
    '23': { name: 'Creuse', region: 'Nouvelle-Aquitaine' },
    '24': { name: 'Dordogne', region: 'Nouvelle-Aquitaine' },
    '25': { name: 'Doubs', region: 'Bourgogne-Franche-Comté' },
    '26': { name: 'Drôme', region: 'Auvergne-Rhône-Alpes' },
    '27': { name: 'Eure', region: 'Normandie' },
    '28': { name: 'Eure-et-Loir', region: 'Centre-Val de Loire' },
    '29': { name: 'Finistère', region: 'Bretagne' },
    '30': { name: 'Gard', region: 'Occitanie' },
    '31': { name: 'Haute-Garonne', region: 'Occitanie' },
    '32': { name: 'Gers', region: 'Occitanie' },
    '33': { name: 'Gironde', region: 'Nouvelle-Aquitaine' },
    '34': { name: 'Hérault', region: 'Occitanie' },
    '35': { name: 'Ille-et-Vilaine', region: 'Bretagne' },
    '36': { name: 'Indre', region: 'Centre-Val de Loire' },
    '37': { name: 'Indre-et-Loire', region: 'Centre-Val de Loire' },
    '38': { name: 'Isère', region: 'Auvergne-Rhône-Alpes' },
    '39': { name: 'Jura', region: 'Bourgogne-Franche-Comté' },
    '40': { name: 'Landes', region: 'Nouvelle-Aquitaine' },
    '41': { name: 'Loir-et-Cher', region: 'Centre-Val de Loire' },
    '42': { name: 'Loire', region: 'Auvergne-Rhône-Alpes' },
    '43': { name: 'Haute-Loire', region: 'Auvergne-Rhône-Alpes' },
    '44': { name: 'Loire-Atlantique', region: 'Pays de la Loire' },
    '45': { name: 'Loiret', region: 'Centre-Val de Loire' },
    '46': { name: 'Lot', region: 'Occitanie' },
    '47': { name: 'Lot-et-Garonne', region: 'Nouvelle-Aquitaine' },
    '48': { name: 'Lozère', region: 'Occitanie' },
    '49': { name: 'Maine-et-Loire', region: 'Pays de la Loire' },
    '50': { name: 'Manche', region: 'Normandie' },
    '51': { name: 'Marne', region: 'Grand Est' },
    '52': { name: 'Haute-Marne', region: 'Grand Est' },
    '53': { name: 'Mayenne', region: 'Pays de la Loire' },
    '54': { name: 'Meurthe-et-Moselle', region: 'Grand Est' },
    '55': { name: 'Meuse', region: 'Grand Est' },
    '56': { name: 'Morbihan', region: 'Bretagne' },
    '57': { name: 'Moselle', region: 'Grand Est' },
    '58': { name: 'Nièvre', region: 'Bourgogne-Franche-Comté' },
    '59': { name: 'Nord', region: 'Hauts-de-France' },
    '60': { name: 'Oise', region: 'Hauts-de-France' },
    '61': { name: 'Orne', region: 'Normandie' },
    '62': { name: 'Pas-de-Calais', region: 'Hauts-de-France' },
    '63': { name: 'Puy-de-Dôme', region: 'Auvergne-Rhône-Alpes' },
    '64': { name: 'Pyrénées-Atlantiques', region: 'Nouvelle-Aquitaine' },
    '65': { name: 'Hautes-Pyrénées', region: 'Occitanie' },
    '66': { name: 'Pyrénées-Orientales', region: 'Occitanie' },
    '67': { name: 'Bas-Rhin', region: 'Grand Est' },
    '68': { name: 'Haut-Rhin', region: 'Grand Est' },
    '69': { name: 'Rhône', region: 'Auvergne-Rhône-Alpes' },
    '70': { name: 'Haute-Saône', region: 'Bourgogne-Franche-Comté' },
    '71': { name: 'Saône-et-Loire', region: 'Bourgogne-Franche-Comté' },
    '72': { name: 'Sarthe', region: 'Pays de la Loire' },
    '73': { name: 'Savoie', region: 'Auvergne-Rhône-Alpes' },
    '74': { name: 'Haute-Savoie', region: 'Auvergne-Rhône-Alpes' },
    '75': { name: 'Paris', region: 'Île-de-France' },
    '76': { name: 'Seine-Maritime', region: 'Normandie' },
    '77': { name: 'Seine-et-Marne', region: 'Île-de-France' },
    '78': { name: 'Yvelines', region: 'Île-de-France' },
    '79': { name: 'Deux-Sèvres', region: 'Nouvelle-Aquitaine' },
    '80': { name: 'Somme', region: 'Hauts-de-France' },
    '81': { name: 'Tarn', region: 'Occitanie' },
    '82': { name: 'Tarn-et-Garonne', region: 'Occitanie' },
    '83': { name: 'Var', region: 'Provence-Alpes-Côte d\'Azur' },
    '84': { name: 'Vaucluse', region: 'Provence-Alpes-Côte d\'Azur' },
    '85': { name: 'Vendée', region: 'Pays de la Loire' },
    '86': { name: 'Vienne', region: 'Nouvelle-Aquitaine' },
    '87': { name: 'Haute-Vienne', region: 'Nouvelle-Aquitaine' },
    '88': { name: 'Vosges', region: 'Grand Est' },
    '89': { name: 'Yonne', region: 'Bourgogne-Franche-Comté' },
    '90': { name: 'Territoire de Belfort', region: 'Bourgogne-Franche-Comté' },
    '91': { name: 'Essonne', region: 'Île-de-France' },
    '92': { name: 'Hauts-de-Seine', region: 'Île-de-France' },
    '93': { name: 'Seine-Saint-Denis', region: 'Île-de-France' },
    '94': { name: 'Val-de-Marne', region: 'Île-de-France' },
    '95': { name: 'Val-d\'Oise', region: 'Île-de-France' },
    '971': { name: 'Guadeloupe', region: 'Guadeloupe' },
    '972': { name: 'Martinique', region: 'Martinique' },
    '973': { name: 'Guyane', region: 'Guyane' },
    '974': { name: 'La Réunion', region: 'La Réunion' },
    '976': { name: 'Mayotte', region: 'Mayotte' }
  };
  
  const dept = departmentMap[departmentCode];
  if (!dept) return null;
  
  return {
    departmentCode,
    departmentName: dept.name,
    region: dept.region
  };
};
