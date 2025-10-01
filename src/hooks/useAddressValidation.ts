import { useState, useCallback } from 'react';
import { Shop } from '@/types/shop';
import { ImportValidationResult, ImportResults, ImportProgress } from '@/types/import';
import { validateAddressCoordinates, geocodeAddressDetailed } from '@/services/geocoding';
import { validateCoordinatesMatchRegion, getDepartmentFromPostalCode } from '@/utils/geographicValidation';

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

        // PRIORITY 1: Check postal code consistency FIRST (before GPS validation)
        // Enhanced postal code detection to handle all formats
        let cityPostalCode: string | null = null;
        
        // Try to find 5-digit postal code first
        const fiveDigitMatch = shop.address.match(/\b(\d{5})\b/)?.[1];
        if (fiveDigitMatch) {
          cityPostalCode = fiveDigitMatch;
          console.log(`[${shop.name}] Found 5-digit postal code: ${cityPostalCode}`);
        }
        
        // Handle 4-digit postal codes (missing leading zero) - common format error
        if (!cityPostalCode) {
          const fourDigitMatch = shop.address.match(/\b(\d{4})\b/)?.[1];
          if (fourDigitMatch && parseInt(fourDigitMatch) <= 9999) {
            cityPostalCode = '0' + fourDigitMatch;
            console.log(`[${shop.name}] Detected 4-digit postal code ${fourDigitMatch}, converted to ${cityPostalCode}`);
          }
        }
        
        let hasPostalCodeInconsistency = false;
        let suggestedDepartment = '';
        let suggestedRegion = '';
        
        if (cityPostalCode) {
          const deptInfo = getDepartmentFromPostalCode(cityPostalCode);
          console.log(`[${shop.name}] Postal code ${cityPostalCode} analysis:`, deptInfo);
          
          if (deptInfo) {
            suggestedDepartment = deptInfo.departmentName;
            suggestedRegion = deptInfo.region;
            
            // Check if current region matches the postal code region
            // This is critical to detect cases like "2200, Martinique" where 2200 is in Hauts-de-France
            const normalizedShopRegion = shop.region.toLowerCase().trim();
            const normalizedSuggestedRegion = deptInfo.region.toLowerCase().trim();
            
            console.log(`[${shop.name}] Region comparison: "${normalizedShopRegion}" vs "${normalizedSuggestedRegion}"`);
            
            if (normalizedShopRegion !== normalizedSuggestedRegion) {
              hasPostalCodeInconsistency = true;
              console.log(`[${shop.name}] ⚠️ POSTAL CODE INCONSISTENCY DETECTED!`);
            }
          } else {
            console.log(`[${shop.name}] ⚠️ Department info not found for postal code ${cityPostalCode}`);
          }
        } else {
          console.log(`[${shop.name}] ⚠️ No postal code detected in address: ${shop.address}`);
        }

        // Handle postal code inconsistency - this takes priority over GPS validation
        if (hasPostalCodeInconsistency) {
          const correctedShop = {
            ...shop,
            department: suggestedDepartment,
            region: suggestedRegion
          };

          correctedShops.push({
            shop: correctedShop,
            status: 'corrected',
            issues: [
              `Incohérence géographique détectée dans l'adresse`,
              `Le code postal ${cityPostalCode} correspond à ${suggestedDepartment} (${suggestedRegion})`,
              `Région modifiée de "${shop.region}" vers "${suggestedRegion}"`,
              `Vérifiez que l'adresse complète est correcte`
            ],
            corrections: {
              originalLatitude: shop.latitude,
              originalLongitude: shop.longitude,
              correctedLatitude: shop.latitude,
              correctedLongitude: shop.longitude,
              originalAddress: `${shop.department}, ${shop.region}`,
              correctedAddress: `${suggestedDepartment}, ${suggestedRegion}`,
              addressCorrectionReason: `Correction automatique : le code postal ${cityPostalCode} n'est pas situé en ${shop.region}`
            }
          });
          continue;
        }

        // PRIORITY 2: Check for GPS coordinate inconsistencies with declared region/country
        const gpsValidation = validateCoordinatesMatchRegion(
          shop.latitude,
          shop.longitude,
          shop.region || '',
          shop.country || ''
        );
        
        if (!gpsValidation.isValid && gpsValidation.message) {
          // Suggest correction based on GPS coordinates
          const detectedRegionName = gpsValidation.detectedRegion 
            ? `${gpsValidation.detectedRegion}` 
            : 'région inconnue';
          
          correctedShops.push({
            shop: {
              ...shop,
              // Keep the shop data but flag it for manual review
            },
            status: 'corrected',
            issues: [
              'Incohérence géographique entre coordonnées GPS et région déclarée',
              gpsValidation.message,
              `Les coordonnées GPS (${shop.latitude}, ${shop.longitude}) ne correspondent pas à la région "${shop.region}"`,
              'Vérifiez l\'adresse complète ou les coordonnées GPS'
            ],
            corrections: {
              originalLatitude: shop.latitude,
              originalLongitude: shop.longitude,
              correctedLatitude: shop.latitude,
              correctedLongitude: shop.longitude,
              originalAddress: `${shop.address}, ${shop.department}, ${shop.region}`,
              correctedAddress: `${shop.address}, ${shop.department}, ${shop.region}`,
              addressCorrectionReason: `Attention: Les coordonnées GPS indiquent ${detectedRegionName} mais le commerce est déclaré en ${shop.region}`
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