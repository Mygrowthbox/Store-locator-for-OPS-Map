export interface Shop {
  id: string;
  name: string;
  category: string;
  address: string;
  additionalLocation?: string;
  department: string;
  region: string;
  country: string;
  website?: string;
  phone?: string;
  imageUrl?: string;
  longitude: number;
  latitude: number;
}

export interface MapFilters {
  categories: string[];
  departments: string[];
  countries: string[];
  regions: string[];
  searchQuery: string;
}

export interface MapBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

export type ShopCategory = 'restaurant' | 'shop' | 'service' | 'bike-shop' | 'bike-workshop' | 'bike-mobile' | 'bike-pump' | 'bike-parking' | 'default';

export const CATEGORY_COLORS: Record<string, ShopCategory> = {
  'Restaurant': 'restaurant',
  'Café': 'restaurant',
  'Bar': 'restaurant',
  'Boulangerie': 'restaurant',
  'Pâtisserie': 'restaurant',
  'Boutique': 'shop', 
  'Magasin': 'shop',
  'Commerce': 'shop',
  'Supermarché': 'shop',
  'Pharmacie': 'shop',
  'Librairie': 'shop',
  'Service': 'service',
  'Réparation': 'service',
  'Coiffeur': 'service',
  'Banque': 'service',
  'Hôtel': 'service',
  'Garage': 'service',
  'Magasin de vélo/Atelier de réparation': 'bike-shop',
  'Magasin de vélo / Atelier de réparation': 'bike-shop',
  'Atelier participatif': 'bike-workshop',
  'Atelier mobile': 'bike-mobile',
  'Station de gonflage': 'bike-pump',
  'Parking vélo sécurisé': 'bike-parking',
};

// Icônes spécifiques par catégorie exacte
export const SPECIFIC_CATEGORY_ICONS: Record<string, string> = {
  'Restaurant': 'utensils',
  'Café': 'coffee',
  'Bar': 'wine',
  'Boulangerie': 'wheat',
  'Pâtisserie': 'cake',
  'Boutique': 'shopping-bag',
  'Magasin': 'store',
  'Commerce': 'shopping-cart',
  'Supermarché': 'shopping-cart',
  'Pharmacie': 'cross',
  'Librairie': 'book-open',
  'Service': 'wrench',
  'Réparation': 'hammer',
  'Coiffeur': 'scissors',
  'Banque': 'landmark',
  'Hôtel': 'bed',
  'Garage': 'car',
  'Magasin de vélo/Atelier de réparation': 'bike',
  'Magasin de vélo / Atelier de réparation': 'bike',
  'Atelier participatif': 'users',
  'Atelier mobile': 'truck',
  'Station de gonflage': 'wind',
  'Parking vélo sécurisé': 'shield-check',
};

export const CATEGORY_ICONS: Record<ShopCategory, string> = {
  restaurant: 'utensils',
  shop: 'shopping-bag',
  service: 'wrench',
  'bike-shop': 'bike',
  'bike-workshop': 'users',
  'bike-mobile': 'truck',
  'bike-pump': 'wind',
  'bike-parking': 'shield-check',
  default: 'map-pin'
};

export const getCategoryColor = (category: string): ShopCategory => {
  return CATEGORY_COLORS[category] || 'default';
};

export const getCategoryIcon = (category: string): string => {
  // D'abord chercher une icône spécifique pour la catégorie exacte
  if (SPECIFIC_CATEGORY_ICONS[category]) {
    return SPECIFIC_CATEGORY_ICONS[category];
  }
  // Sinon utiliser l'icône générale du type de catégorie
  const categoryType = getCategoryColor(category);
  return CATEGORY_ICONS[categoryType];
};

export type SortField = 'name' | 'category' | 'department' | 'region' | 'country';
export type SortDirection = 'asc' | 'desc';