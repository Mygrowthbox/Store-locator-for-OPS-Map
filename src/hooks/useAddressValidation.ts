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

        // First, check for GPS coordinate inconsistencies with declared region/country
        const gpsValidation = validateCoordinatesMatchRegion(
          shop.latitude,
          shop.longitude,
          shop.region || '',
          shop.country || ''
        );
        
        if (!gpsValidation.isValid && gpsValidation.message) {
          invalidShops.push({
            shop,
            status: 'invalid',
            issues: [
              'Incohérence géographique majeure',
              gpsValidation.message,
              'Vérifiez les coordonnées GPS et la région/pays déclarés'
            ]
          });
          continue;
        }

        // Then check for postal code inconsistencies
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
          const deptInfo = getDepartmentFromPostalCode(cityPostalCode);
          
          if (deptInfo) {
            suggestedDepartment = deptInfo.departmentName;
            suggestedRegion = deptInfo.region;
            
            // Check if current department/region matches the postal code
            if (shop.department.toLowerCase() !== deptInfo.departmentName.toLowerCase() || 
                shop.region.toLowerCase() !== deptInfo.region.toLowerCase()) {
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