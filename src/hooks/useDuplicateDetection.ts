import { useMemo } from 'react';
import { Shop } from '@/types/shop';

export interface DuplicateGroup {
  shops: Shop[];
  reason: 'exact_match' | 'similar_name' | 'same_location';
  similarity: number;
}

export const useDuplicateDetection = (shops: Shop[]) => {
  const duplicates = useMemo(() => {
    const duplicateGroups: DuplicateGroup[] = [];
    const processedShops = new Set<string>();

    shops.forEach((shop, index) => {
      if (processedShops.has(shop.id)) return;

      const similarShops: Shop[] = [shop];
      let duplicateReason: DuplicateGroup['reason'] = 'exact_match';
      let maxSimilarity = 0;

      // Chercher les doublons potentiels
      for (let i = index + 1; i < shops.length; i++) {
        const otherShop = shops[i];
        if (processedShops.has(otherShop.id)) continue;

        // Correspondance exacte (nom et adresse)
        if (shop.name.toLowerCase().trim() === otherShop.name.toLowerCase().trim() &&
            shop.address.toLowerCase().trim() === otherShop.address.toLowerCase().trim()) {
          similarShops.push(otherShop);
          duplicateReason = 'exact_match';
          maxSimilarity = 1;
          processedShops.add(otherShop.id);
          continue;
        }

        // Même localisation (coordonnées très proches)
        const distance = Math.sqrt(
          Math.pow(shop.latitude - otherShop.latitude, 2) + 
          Math.pow(shop.longitude - otherShop.longitude, 2)
        );
        
        if (distance < 0.001) { // Environ 100m
          similarShops.push(otherShop);
          duplicateReason = 'same_location';
          maxSimilarity = Math.max(maxSimilarity, 0.9);
          processedShops.add(otherShop.id);
          continue;
        }

        // Noms similaires avec même adresse partielle
        const nameSimilarity = calculateStringSimilarity(shop.name, otherShop.name);
        const addressSimilarity = calculateStringSimilarity(shop.address, otherShop.address);
        
        if (nameSimilarity > 0.8 && addressSimilarity > 0.6) {
          similarShops.push(otherShop);
          duplicateReason = 'similar_name';
          maxSimilarity = Math.max(maxSimilarity, (nameSimilarity + addressSimilarity) / 2);
          processedShops.add(otherShop.id);
        }
      }

      if (similarShops.length > 1) {
        duplicateGroups.push({
          shops: similarShops,
          reason: duplicateReason,
          similarity: maxSimilarity
        });
        similarShops.forEach(s => processedShops.add(s.id));
      }
    });

    return duplicateGroups;
  }, [shops]);

  const duplicateShopIds = useMemo(() => {
    return new Set(duplicates.flatMap(group => group.shops.map(shop => shop.id)));
  }, [duplicates]);

  const getDuplicateInfo = (shopId: string) => {
    const group = duplicates.find(g => g.shops.some(s => s.id === shopId));
    return group ? {
      count: group.shops.length,
      reason: group.reason,
      similarity: group.similarity,
      relatedShops: group.shops.filter(s => s.id !== shopId)
    } : null;
  };

  return {
    duplicates,
    duplicateShopIds,
    getDuplicateInfo,
    hasDuplicates: duplicates.length > 0,
    totalDuplicates: duplicates.reduce((acc, group) => acc + group.shops.length, 0)
  };
};

// Fonction pour calculer la similarité entre deux chaînes
function calculateStringSimilarity(str1: string, str2: string): number {
  const s1 = str1.toLowerCase().trim();
  const s2 = str2.toLowerCase().trim();
  
  if (s1 === s2) return 1;
  
  const longer = s1.length > s2.length ? s1 : s2;
  const shorter = s1.length > s2.length ? s2 : s1;
  
  if (longer.length === 0) return 1;
  
  const editDistance = levenshteinDistance(longer, shorter);
  return (longer.length - editDistance) / longer.length;
}

function levenshteinDistance(str1: string, str2: string): number {
  const matrix = [];
  
  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i];
  }
  
  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j;
  }
  
  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  
  return matrix[str2.length][str1.length];
}