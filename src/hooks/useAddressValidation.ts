import { useState, useCallback } from 'react';
import { Shop } from '@/types/shop';
import { ImportValidationResult, ImportResults, ImportProgress } from '@/types/import';
import { validateAddressCoordinates, geocodeAddressDetailed } from '@/services/geocoding';

export const useAddressValidation = () => {
  const [progress, setProgress] = useState<ImportProgress>({
    current: 0,
    total: 0,
    status: 'processing',
    message: ''
  });
  const [isValidating, setIsValidating] = useState(false);

  const validateShops = useCallback(async (shops: Shop[]): Promise<ImportResults> => {
    setIsValidating(true);
    setProgress({
      current: 0,
      total: shops.length,
      status: 'processing',
      message: 'Début de la validation...'
    });

    const validShops: ImportValidationResult[] = [];
    const correctedShops: ImportValidationResult[] = [];
    const invalidShops: ImportValidationResult[] = [];

    for (let i = 0; i < shops.length; i++) {
      const shop = shops[i];
      
      setProgress({
        current: i + 1,
        total: shops.length,
        status: 'validating',
        message: `Validation de ${shop.name}...`
      });

      try {
        // Basic validation first
        if (!shop.address || !shop.latitude || !shop.longitude) {
          invalidShops.push({
            shop,
            status: 'invalid',
            issues: ['Adresse ou coordonnées manquantes']
          });
          continue;
        }

        // Validate coordinates are within reasonable bounds
        if (shop.latitude < -90 || shop.latitude > 90 || 
            shop.longitude < -180 || shop.longitude > 180) {
          invalidShops.push({
            shop,
            status: 'invalid',
            issues: ['Coordonnées hors limites géographiques']
          });
          continue;
        }

        setProgress({
          current: i + 1,
          total: shops.length,
          status: 'geocoding',
          message: `Géocodage de ${shop.name}...`
        });

        // First, check for geographic inconsistencies
        // Enhanced postal code detection to handle missing leading zeros
        let cityPostalCode = shop.address.match(/(\d{5})/)?.[1];
        
        // Handle 4-digit postal codes (missing leading zero)
        if (!cityPostalCode) {
          const fourDigitMatch = shop.address.match(/(\d{4})/)?.[1];
          if (fourDigitMatch && parseInt(fourDigitMatch) < 9999) {
            cityPostalCode = '0' + fourDigitMatch;
            console.log(`Detected 4-digit postal code ${fourDigitMatch}, converted to ${cityPostalCode}`);
          }
        }
        
        let hasGeographicInconsistency = false;
        let suggestedDepartment = '';
        let suggestedRegion = '';
        
        if (cityPostalCode) {
          // French postal code analysis for department detection
          const departmentCode = cityPostalCode.substring(0, 2);
          const departmentMap: Record<string, { name: string; region: string }> = {
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
          
          const expectedDept = departmentMap[departmentCode];
          if (expectedDept) {
            suggestedDepartment = expectedDept.name;
            suggestedRegion = expectedDept.region;
            
            // Check if current department/region matches the postal code
            if (shop.department.toLowerCase() !== expectedDept.name.toLowerCase() || 
                shop.region.toLowerCase() !== expectedDept.region.toLowerCase()) {
              hasGeographicInconsistency = true;
            }
          }
        }

        // Handle geographic inconsistency before geocoding
        if (hasGeographicInconsistency) {
          const correctedShop = {
            ...shop,
            department: suggestedDepartment,
            region: suggestedRegion
          };

          correctedShops.push({
            shop: correctedShop,
            status: 'corrected',
            issues: [
              `Incohérence géographique détectée`,
              `Code postal ${cityPostalCode} correspond à ${suggestedDepartment} (${suggestedRegion})`,
              `Département/région automatiquement corrigés`
            ],
            corrections: {
              originalLatitude: shop.latitude,
              originalLongitude: shop.longitude,
              correctedLatitude: shop.latitude,
              correctedLongitude: shop.longitude,
              originalAddress: `${shop.department}, ${shop.region}`,
              correctedAddress: `${suggestedDepartment}, ${suggestedRegion}`,
              addressCorrectionReason: 'Correction automatique basée sur le code postal'
            }
          });
          continue;
        }

        // Validate address coordinates consistency with stricter tolerance
        const originalFullAddress = `${shop.address}, ${shop.department}, ${shop.country}`;
        console.log(`Validating coordinates for ${shop.name}: ${originalFullAddress} at ${shop.latitude}, ${shop.longitude}`);
        
        const validation = await validateAddressCoordinates(
          originalFullAddress,
          shop.latitude,
          shop.longitude,
          5 // 5km tolerance (reduced from 10km for better detection)
        );

        console.log(`Validation result for ${shop.name}:`, validation);
        
        if (validation.isValid) {
          validShops.push({
            shop,
            status: 'valid',
            issues: []
          });
        } else if (validation.correctedCoordinates) {
          // Create corrected shop
          const correctedShop = {
            ...shop,
            latitude: validation.correctedCoordinates.latitude,
            longitude: validation.correctedCoordinates.longitude
          };

          console.log(`Correcting coordinates for ${shop.name}: ${validation.distance?.toFixed(2)}km away from expected location`);
          
          correctedShops.push({
            shop: correctedShop,
            status: 'corrected',
            issues: [
              `Coordonnées incohérentes avec l'adresse (distance: ${validation.distance?.toFixed(2)}km)`,
              `Localisation automatiquement corrigée selon l'adresse`,
              `Vérifiez que l'adresse et le département/région sont cohérents`
            ],
            corrections: {
              originalLatitude: shop.latitude,
              originalLongitude: shop.longitude,
              correctedLatitude: validation.correctedCoordinates.latitude,
              correctedLongitude: validation.correctedCoordinates.longitude,
              distance: validation.distance,
              geocodedAddress: validation.geocodedAddress,
              addressCorrectionReason: `Coordonnées relocalisées - écart de ${validation.distance?.toFixed(2)}km détecté`
            }
          });
        } else {
          // Try detailed geocoding with precision tracking
          const geocoded = await geocodeAddressDetailed(originalFullAddress);
          
          if (geocoded) {
            const correctedShop = {
              ...shop,
              latitude: geocoded.latitude,
              longitude: geocoded.longitude
            };

            const precisionLabels = {
              'exact': 'Adresse exacte trouvée',
              'corrected': 'Adresse corrigée automatiquement',
              'street-only': 'Géocodage au niveau de la rue',
              'city-only': 'Géocodage au niveau de la ville',
              'fallback': 'Géocodage de fallback par département'
            };

            const precision = precisionLabels[geocoded.precision];
            const issues = [`Coordonnées originales invalides - ${precision}`];
            
            if (geocoded.rejectedAttempts.length > 0) {
              issues.push(`Tentatives échouées: ${geocoded.rejectedAttempts.map(r => r.reason).join(', ')}`);
            }

            correctedShops.push({
              shop: correctedShop,
              status: 'corrected',
              issues,
              corrections: {
                originalLatitude: shop.latitude,
                originalLongitude: shop.longitude,
                correctedLatitude: geocoded.latitude,
                correctedLongitude: geocoded.longitude,
                geocodedAddress: geocoded.displayName,
                usedAddress: geocoded.usedAddress,
                precision: geocoded.precision,
                rejectedAttempts: geocoded.rejectedAttempts,
                originalAddress: originalFullAddress,
                addressCorrectionReason: `Géocodage avec précision: ${precision}`
              }
            });
          } else {
            invalidShops.push({
              shop,
              status: 'invalid',
              issues: [
                'Impossible de valider ou géocoder l\'adresse',
                'Vérifiez le format: rue, code postal, ville, département'
              ]
            });
          }
        }
      } catch (error) {
        console.error(`Error validating shop ${shop.name}:`, error);
        invalidShops.push({
          shop,
          status: 'invalid',
          issues: ['Erreur lors de la validation']
        });
      }
    }

    setProgress({
      current: shops.length,
      total: shops.length,
      status: 'completed',
      message: 'Validation terminée'
    });

    setIsValidating(false);

    return {
      validShops,
      correctedShops,
      invalidShops,
      totalProcessed: shops.length,
      summary: {
        valid: validShops.length,
        corrected: correctedShops.length,
        invalid: invalidShops.length
      }
    };
  }, []);

  return {
    validateShops,
    progress,
    isValidating
  };
};