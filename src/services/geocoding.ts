export interface GeocodingResult {
  latitude: number;
  longitude: number;
  displayName: string;
  confidence: number;
}

export interface ReverseGeocodingResult {
  address: string;
  city: string;
  postcode: string;
  country: string;
  confidence: number;
}

const NOMINATIM_BASE_URL = 'https://nominatim.openstreetmap.org';

// Add delay between requests to respect rate limits
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export interface DetailedGeocodingResult extends GeocodingResult {
  usedAddress: string;
  precision: 'exact' | 'corrected' | 'street-only' | 'city-only' | 'fallback';
  rejectedAttempts: Array<{
    address: string;
    reason: string;
  }>;
}

export const geocodeAddressDetailed = async (originalAddress: string): Promise<DetailedGeocodingResult | null> => {
  const rejectedAttempts: Array<{ address: string; reason: string }> = [];
  
  try {
    await delay(1000); // Rate limiting
    
    // Step 1: Try original address (most precise)
    let result = await tryGeocode(originalAddress);
    if (result) {
      return {
        ...result,
        usedAddress: originalAddress,
        precision: 'exact',
        rejectedAttempts
      };
    }
    rejectedAttempts.push({ address: originalAddress, reason: 'Adresse originale non trouvée' });
    
    // Step 2: Try corrected address (fix postal codes, departments)
    const correctedAddress = correctFrenchAddress(originalAddress);
    if (correctedAddress !== originalAddress) {
      result = await tryGeocode(correctedAddress);
      if (result) {
        return {
          ...result,
          usedAddress: correctedAddress,
          precision: 'corrected',
          rejectedAttempts
        };
      }
      rejectedAttempts.push({ address: correctedAddress, reason: 'Adresse corrigée non trouvée' });
    }
    
    // Step 3: Try without building/street number (street-level precision)
    const streetOnlyAddress = extractStreetAddress(originalAddress);
    if (streetOnlyAddress && streetOnlyAddress !== originalAddress && streetOnlyAddress !== correctedAddress) {
      result = await tryGeocode(streetOnlyAddress);
      if (result) {
        return {
          ...result,
          usedAddress: streetOnlyAddress,
          precision: 'street-only',
          rejectedAttempts
        };
      }
      rejectedAttempts.push({ address: streetOnlyAddress, reason: 'Adresse au niveau rue non trouvée' });
    }
    
    // Step 4: Try city + postal code only (city-level precision)
    const cityAddress = extractCityAddress(originalAddress);
    if (cityAddress) {
      result = await tryGeocode(cityAddress);
      if (result) {
        return {
          ...result,
          usedAddress: cityAddress,
          precision: 'city-only',
          rejectedAttempts
        };
      }
      rejectedAttempts.push({ address: cityAddress, reason: 'Adresse au niveau ville non trouvée' });
    }
    
    // Step 5: Last resort - department + country (lowest precision)
    const fallbackAddress = extractDepartmentAddress(originalAddress);
    if (fallbackAddress) {
      result = await tryGeocode(fallbackAddress);
      if (result) {
        return {
          ...result,
          usedAddress: fallbackAddress,
          precision: 'fallback',
          rejectedAttempts
        };
      }
      rejectedAttempts.push({ address: fallbackAddress, reason: 'Même le département non trouvé' });
    }
    
    return null;
  } catch (error) {
    console.error('Detailed geocoding error:', error);
    return null;
  }
};

export const geocodeAddress = async (address: string): Promise<GeocodingResult | null> => {
  const detailed = await geocodeAddressDetailed(address);
  return detailed ? {
    latitude: detailed.latitude,
    longitude: detailed.longitude,
    displayName: detailed.displayName,
    confidence: detailed.confidence
  } : null;
};

const tryGeocode = async (address: string): Promise<GeocodingResult | null> => {
  try {
    const response = await fetch(
      `${NOMINATIM_BASE_URL}/search?format=json&q=${encodeURIComponent(address)}&limit=1&addressdetails=1&countrycodes=fr`
    );
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.length === 0) {
      return null;
    }
    
    const result = data[0];
    return {
      latitude: parseFloat(result.lat),
      longitude: parseFloat(result.lon),
      displayName: result.display_name,
      confidence: parseFloat(result.importance || '0')
    };
  } catch (error) {
    console.error('Geocoding error:', error);
    return null;
  }
};

// Correct common French address issues
const correctFrenchAddress = (address: string): string => {
  let corrected = address;
  
  // Fix postal codes (add leading zero for departments 01-09)
  corrected = corrected.replace(/\b(\d{4})\b/g, (match, code) => {
    const num = parseInt(code);
    if (num >= 1000 && num <= 9999 && num.toString().length === 4) {
      return `0${code}`;
    }
    return code;
  });
  
  // Fix common department name mismatches
  const departmentCorrections: Record<string, string> = {
    'Martinique': '',
    'Gironde': '',
    'Maine-et-Loire': '',
    'Meurthe-et-Moselle': '',
    'Manche': '',
    'Charente-Maritime': '',
    'Nord': '',
    'Rhône': '',
    'Ariége': 'Ariège',
    'La Réunion': '',
    'Corréze': 'Corrèze'
  };
  
  Object.entries(departmentCorrections).forEach(([wrong, correct]) => {
    if (corrected.includes(wrong)) {
      corrected = corrected.replace(wrong, correct);
    }
  });
  
  // Clean up multiple spaces and commas
  corrected = corrected.replace(/\s*,\s*,\s*/g, ', ');
  corrected = corrected.replace(/\s+/g, ' ');
  corrected = corrected.trim();
  
  return corrected;
};

export const reverseGeocode = async (latitude: number, longitude: number): Promise<ReverseGeocodingResult | null> => {
  try {
    await delay(1000); // Rate limiting
    
    const response = await fetch(
      `${NOMINATIM_BASE_URL}/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`
    );
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!data.address) {
      return null;
    }
    
    const address = data.address;
    return {
      address: data.display_name,
      city: address.city || address.town || address.village || address.hamlet || '',
      postcode: address.postcode || '',
      country: address.country || '',
      confidence: parseFloat(data.importance || '0')
    };
  } catch (error) {
    console.error('Reverse geocoding error:', error);
    return null;
  }
};

export const validateAddressCoordinates = async (
  address: string,
  latitude: number,
  longitude: number,
  tolerance: number = 10 // km
): Promise<{
  isValid: boolean;
  distance?: number;
  correctedCoordinates?: { latitude: number; longitude: number };
  geocodedAddress?: string;
}> => {
  try {
    // Get address from coordinates (reverse geocoding)
    const reverseResult = await reverseGeocode(latitude, longitude);
    
    // Get coordinates from address (forward geocoding)
    const forwardResult = await geocodeAddress(address);
    
    if (!reverseResult || !forwardResult) {
      return { isValid: false };
    }
    
    // Calculate distance between provided coordinates and geocoded coordinates
    const distance = calculateDistance(
      latitude,
      longitude,
      forwardResult.latitude,
      forwardResult.longitude
    );
    
    const isValid = distance <= tolerance;
    
    return {
      isValid,
      distance,
      correctedCoordinates: isValid ? undefined : {
        latitude: forwardResult.latitude,
        longitude: forwardResult.longitude
      },
      geocodedAddress: forwardResult.displayName
    };
  } catch (error) {
    console.error('Address validation error:', error);
    return { isValid: false };
  }
};

// Calculate distance between two points using Haversine formula
const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

// Extract different precision levels from address
const extractStreetAddress = (address: string): string | null => {
  // Remove building/apartment numbers but keep street name
  // Example: "27 Pl Maire, Polliat 01310, Ain" -> "Place Maire, Polliat 01310, Ain"
  let cleaned = address.replace(/^\d+\s+/, ''); // Remove leading numbers
  cleaned = cleaned.replace(/\s+Bis\s+/gi, ' '); // Remove "Bis"
  cleaned = cleaned.replace(/\s+Ter\s+/gi, ' '); // Remove "Ter"
  cleaned = cleaned.replace(/\bPl\b/gi, 'Place'); // Expand "Pl" to "Place"
  cleaned = cleaned.replace(/\bAv\b/gi, 'Avenue'); // Expand "Av" to "Avenue"
  cleaned = cleaned.replace(/\bBld\b/gi, 'Boulevard'); // Expand "Bld" to "Boulevard"
  cleaned = cleaned.replace(/\bRte\b/gi, 'Route'); // Expand "Rte" to "Route"
  cleaned = cleaned.trim();
  
  return cleaned !== address ? cleaned : null;
};

const extractCityAddress = (address: string): string | null => {
  // Extract city and postal code only
  // Example: "27 Pl Maire, Polliat 01310, Ain" -> "Polliat 01310"
  const parts = address.split(',').map(p => p.trim());
  
  if (parts.length >= 2) {
    // Find part with postal code (5 digits)
    for (let i = 1; i < parts.length; i++) {
      const part = parts[i];
      if (/\b\d{5}\b/.test(part) || /\b\d{4}\b/.test(part)) {
        // This part contains a postal code
        return part;
      }
    }
    
    // Fallback: return last part before department
    if (parts.length >= 2) {
      return parts[parts.length - 2];
    }
  }
  
  return null;
};

const extractDepartmentAddress = (address: string): string | null => {
  // Extract department only as last resort
  // Example: "27 Pl Maire, Polliat 01310, Ain" -> "Ain"
  const parts = address.split(',').map(p => p.trim());
  
  if (parts.length >= 2) {
    const lastPart = parts[parts.length - 1];
    // Common French departments
    const frenchDepartments = [
      'Ain', 'Aisne', 'Allier', 'Alpes-de-Haute-Provence', 'Hautes-Alpes', 'Alpes-Maritimes',
      'Ardèche', 'Ardennes', 'Ariège', 'Aube', 'Aude', 'Aveyron', 'Bouches-du-Rhône',
      'Calvados', 'Cantal', 'Charente', 'Charente-Maritime', 'Cher', 'Corrèze', 'Corse-du-Sud',
      'Côte-d\'Or', 'Côtes-d\'Armor', 'Creuse', 'Dordogne', 'France'
    ];
    
    if (frenchDepartments.some(dep => lastPart.toLowerCase().includes(dep.toLowerCase()))) {
      return `${lastPart}, France`;
    }
  }
  
  return null;
};

const toRadians = (degrees: number): number => degrees * (Math.PI / 180);