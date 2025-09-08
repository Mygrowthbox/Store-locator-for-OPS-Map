import Papa from 'papaparse';
import { Shop } from '@/types/shop';

export interface CSVRow {
  name?: string;
  category?: string;
  address?: string;
  additionalLocation?: string;
  department?: string;
  region?: string;
  country?: string;
  website?: string;
  phone?: string;
  imageUrl?: string;
  longitude?: string;
  latitude?: string;
  [key: string]: string | undefined;
}

export const parseCSV = (csvText: string): Shop[] => {
  console.log('Raw CSV text:', csvText.substring(0, 500));
  
  // Split lines and filter empty ones
  let lines = csvText.split('\n').filter(line => line.trim());
  console.log(`Found ${lines.length} lines in CSV`);
  
  // Clean each line by removing outer quotes if present
  const processedLines = lines.map((line, index) => {
    let processed = line.trim();
    
    // Remove outer quotes if the entire line is quoted
    if (processed.startsWith('"') && processed.endsWith('"')) {
      processed = processed.slice(1, -1);
      // Fix escaped quotes
      processed = processed.replace(/""/g, '"');
    }
    
    console.log(`Line ${index}: ${processed.substring(0, 100)}...`);
    return processed;
  });
  
  // Reconstruct CSV with cleaned lines
  const cleanedCsvText = processedLines.join('\n');
  console.log('Processing cleaned CSV:', cleanedCsvText.substring(0, 800));
  
  const result = Papa.parse<CSVRow>(cleanedCsvText, {
    header: true,
    skipEmptyLines: true,
    quoteChar: '"',
    delimiter: ',',
    transformHeader: (header: string) => {
      // Transform French headers to English, including encoded characters
      const headerMap: Record<string, string> = {
        'Nom': 'name',
        'Catégorie': 'category',
        'CatÃ©gorie': 'category', // Handle encoding issue
        'Adresse': 'address',
        'Complément de localisation': 'additionalLocation',
        'ComplÃ©ment de localisation': 'additionalLocation', // Handle encoding issue
        'Département': 'department',
        'DÃ©partement': 'department', // Handle encoding issue
        'Région': 'region',
        'RÃ©gion': 'region', // Handle encoding issue
        'Pays': 'country',
        'Site web': 'website',
        'Téléphone': 'phone',
        'TÃ©lÃ©phone': 'phone', // Handle encoding issue
        'Image': 'imageUrl',
        'Longitude': 'longitude',
        'Latitude': 'latitude',
        'long': 'longitude', // Handle short form
        'lat': 'latitude' // Handle short form
      };
      
      const cleaned = header.trim();
      return headerMap[cleaned] || cleaned.toLowerCase().replace(/\s+/g, '');
    }
  });

  if (result.errors.length > 0) {
    console.error('CSV parsing errors:', result.errors);
  }

  console.log('Parsed headers:', result.meta?.fields);
  console.log('First few parsed rows:', result.data.slice(0, 3));

  const validShops = result.data
    .filter((row, index) => {
      // Check if we have the required fields with different possible names
      const hasName = row.name || row.nom;
      const hasLongitude = row.longitude || row.long;
      const hasLatitude = row.latitude || row.lat;
      
      const longValue = row.longitude || row.long;
      const latValue = row.latitude || row.lat;
      
      console.log(`Row ${index}:`, {
        name: hasName,
        longitude: longValue,
        latitude: latValue,
        longNum: Number(longValue),
        latNum: Number(latValue),
        isLongValid: !isNaN(Number(longValue)),
        isLatValid: !isNaN(Number(latValue)),
        fullRow: row
      });
      
      const isValid = hasName && hasLongitude && hasLatitude && 
             !isNaN(Number(longValue)) && !isNaN(Number(latValue));
             
      console.log(`Row ${index} is valid:`, isValid);
      return isValid;
    })
    .map((row, index) => ({
      id: `shop-${index}`,
      name: (row.name || row.nom)?.trim() || '',
      category: (row.category || row.catégorie)?.trim() || 'Autre',
      address: (row.address || row.adresse)?.trim() || '',
      additionalLocation: (row.additionalLocation || row.additionallocation)?.trim(),
      department: (row.department || row.département)?.trim() || '',
      region: (row.region || row.région)?.trim() || '',
      country: (row.country || row.pays)?.trim() || 'France',
      website: (row.website || row.siteweb)?.trim(),
      phone: (row.phone || row.téléphone)?.trim(),
      imageUrl: (row.imageUrl || row.imageurl || row.image)?.trim(),
      longitude: Number(row.longitude || row.long),
      latitude: Number(row.latitude || row.lat)
    }));
  
  console.log(`Successfully parsed ${validShops.length} shops from CSV`);
  return validShops;
};

// Enhanced CSV parser that returns both valid and invalid entries for validation
export const parseCSVWithValidation = (csvText: string): {
  validShops: Shop[];
  invalidEntries: Array<{ row: CSVRow; issues: string[]; index: number }>;
} => {
  console.log('Raw CSV text:', csvText.substring(0, 500));
  
  // Split lines and filter empty ones
  let lines = csvText.split('\n').filter(line => line.trim());
  console.log(`Found ${lines.length} lines in CSV`);
  
  // Clean each line by removing outer quotes if present
  const processedLines = lines.map((line, index) => {
    let processed = line.trim();
    
    // Remove outer quotes if the entire line is quoted
    if (processed.startsWith('"') && processed.endsWith('"')) {
      processed = processed.slice(1, -1);
      // Fix escaped quotes
      processed = processed.replace(/""/g, '"');
    }
    
    console.log(`Line ${index}: ${processed.substring(0, 100)}...`);
    return processed;
  });
  
  // Reconstruct CSV with cleaned lines
  const cleanedCsvText = processedLines.join('\n');
  console.log('Processing cleaned CSV:', cleanedCsvText.substring(0, 800));
  
  const result = Papa.parse<CSVRow>(cleanedCsvText, {
    header: true,
    skipEmptyLines: true,
    quoteChar: '"',
    delimiter: ',',
    transformHeader: (header: string) => {
      // Transform French headers to English, including encoded characters
      const headerMap: Record<string, string> = {
        'Nom': 'name',
        'Catégorie': 'category',
        'CatÃ©gorie': 'category', // Handle encoding issue
        'Adresse': 'address',
        'Complément de localisation': 'additionalLocation',
        'ComplÃ©ment de localisation': 'additionalLocation', // Handle encoding issue
        'Département': 'department',
        'DÃ©partement': 'department', // Handle encoding issue
        'Région': 'region',
        'RÃ©gion': 'region', // Handle encoding issue
        'Pays': 'country',
        'Site web': 'website',
        'Téléphone': 'phone',
        'TÃ©lÃ©phone': 'phone', // Handle encoding issue
        'Image': 'imageUrl',
        'Longitude': 'longitude',
        'Latitude': 'latitude',
        'long': 'longitude', // Handle short form
        'lat': 'latitude' // Handle short form
      };
      
      const cleaned = header.trim();
      return headerMap[cleaned] || cleaned.toLowerCase().replace(/\s+/g, '');
    }
  });

  if (result.errors.length > 0) {
    console.error('CSV parsing errors:', result.errors);
  }

  console.log('Parsed headers:', result.meta?.fields);
  console.log('First few parsed rows:', result.data.slice(0, 3));

  const validShops: Shop[] = [];
  const invalidEntries: Array<{ row: CSVRow; issues: string[]; index: number }> = [];

  result.data.forEach((row, index) => {
    const issues: string[] = [];
    
    // Check required fields
    const hasName = row.name || row.nom;
    const hasLongitude = row.longitude || row.long;
    const hasLatitude = row.latitude || row.lat;
    const hasAddress = row.address || row.adresse;
    
    if (!hasName) {
      issues.push('Nom manquant');
    }
    
    if (!hasAddress) {
      issues.push('Adresse manquante');
    }
    
    if (!hasLongitude || !hasLatitude) {
      issues.push('Coordonnées manquantes');
    } else {
      const longValue = row.longitude || row.long;
      const latValue = row.latitude || row.lat;
      
      if (isNaN(Number(longValue)) || isNaN(Number(latValue))) {
        issues.push('Coordonnées invalides (non numériques)');
      } else {
        const longitude = Number(longValue);
        const latitude = Number(latValue);
        
        if (longitude < -180 || longitude > 180) {
          issues.push('Longitude hors limites (-180 à 180)');
        }
        
        if (latitude < -90 || latitude > 90) {
          issues.push('Latitude hors limites (-90 à 90)');
        }
      }
    }
    
    if (issues.length > 0) {
      invalidEntries.push({ row, issues, index });
    } else {
      const shop: Shop = {
        id: `shop-${validShops.length}`,
        name: (row.name || row.nom)?.trim() || '',
        category: (row.category || row.catégorie)?.trim() || 'Autre',
        address: (row.address || row.adresse)?.trim() || '',
        additionalLocation: (row.additionalLocation || row.additionallocation)?.trim(),
        department: (row.department || row.département)?.trim() || '',
        region: (row.region || row.région)?.trim() || '',
        country: (row.country || row.pays)?.trim() || 'France',
        website: (row.website || row.siteweb)?.trim(),
        phone: (row.phone || row.téléphone)?.trim(),
        imageUrl: (row.imageUrl || row.imageurl || row.image)?.trim(),
        longitude: Number(row.longitude || row.long),
        latitude: Number(row.latitude || row.lat)
      };
      
      validShops.push(shop);
    }
  });
  
  console.log(`Successfully parsed ${validShops.length} valid shops and found ${invalidEntries.length} invalid entries`);
  return { validShops, invalidEntries };
};

export const validateShopData = (shop: Shop): boolean => {
  return !!(
    shop.name &&
    shop.longitude &&
    shop.latitude &&
    !isNaN(shop.longitude) &&
    !isNaN(shop.latitude) &&
    shop.longitude >= -180 && shop.longitude <= 180 &&
    shop.latitude >= -90 && shop.latitude <= 90
  );
};