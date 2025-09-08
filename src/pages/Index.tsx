import { useState, useMemo, useEffect } from 'react';
import { Shop, MapFilters } from '@/types/shop';
import { loadShopsFromStorage, saveShopsToStorage } from '@/utils/shopStorage';
import SearchBar from '@/components/StoreLocator/SearchBar';
import FilterPanel from '@/components/StoreLocator/FilterPanel';
import MapView from '@/components/StoreLocator/MapView';
import VirtualizedShopList from '@/components/StoreLocator/VirtualizedShopList';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { MapPin, Store } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const Index = () => {
  const [shops, setShops] = useState<Shop[]>([]);
  const { toast } = useToast();
  
  // Load shops from localStorage on component mount
  useEffect(() => {
    const savedShops = loadShopsFromStorage();
    console.log('Shops loaded from storage:', savedShops.length);
    console.log('Sample shops:', savedShops.slice(0, 3));
    setShops(savedShops);
  }, []);

  const [filters, setFilters] = useState<MapFilters>({
    categories: [],
    departments: [],
    countries: [],
    regions: [],
    searchQuery: ''
  });


  // Filter shops based on current filters
  const filteredShops = useMemo(() => {
    console.log('Filtering with:', filters);
    console.log('Total shops available:', shops.length);
    
    if (shops.length === 0) {
      console.log('No shops loaded');
      return [];
    }
    
    const filtered = shops.filter(shop => {
      const matchesCategory = filters.categories.length === 0 || filters.categories.includes(shop.category);
      const matchesDepartment = filters.departments.length === 0 || filters.departments.includes(shop.department);
      const matchesCountry = filters.countries.length === 0 || filters.countries.includes(shop.country);
      const matchesRegion = filters.regions.length === 0 || filters.regions.includes(shop.region);
      
      // Enhanced search: search in all text fields with better logic
      const matchesSearch = !filters.searchQuery || (() => {
        const query = filters.searchQuery.toLowerCase().trim();
        if (!query) return true;
        
        // Create search text from all available fields
        const searchableText = [
          shop.name,
          shop.address,
          shop.department, 
          shop.region,
          shop.country,
          shop.additionalLocation,
          shop.category,
          shop.phone,
          // Extract potential postal code from address (5 digits)
          shop.address.match(/\b\d{5}\b/g)?.join(' ') || '',
          // Extract potential city from end of address (after last comma)
          shop.address.split(',').pop()?.trim() || ''
        ].filter(Boolean).join(' ').toLowerCase();
        
        console.log(`Searching "${query}" in: ${searchableText}`);
        return searchableText.includes(query);
      })();

      const result = matchesCategory && matchesDepartment && matchesCountry && matchesRegion && matchesSearch;
      if (filters.searchQuery && result) {
        console.log(`Match found: ${shop.name} - ${shop.address}`);
      }
      return result;
    });
    
    console.log('Filtered results:', filtered.length);
    if (filters.searchQuery && filtered.length === 0) {
      console.log('No results for search query:', filters.searchQuery);
    }
    
    return filtered;
  }, [shops, filters]);

  // Get unique categories and departments for filters
  const categories = useMemo(() => 
    Array.from(new Set(shops.map(shop => shop.category))).sort()
  , [shops]);

  const departments = useMemo(() => 
    Array.from(new Set(shops.map(shop => shop.department))).filter(Boolean).sort()
  , [shops]);

  const countries = useMemo(() => 
    Array.from(new Set(shops.map(shop => shop.country))).filter(Boolean).sort()
  , [shops]);

  const regions = useMemo(() => 
    Array.from(new Set(shops.map(shop => shop.region))).filter(Boolean).sort()
  , [shops]);

  const handleSearch = (query: string) => {
    console.log('Search query:', query);
    console.log('Available shops:', shops.length);
    setFilters(prev => ({ ...prev, searchQuery: query }));
  };

  const handleShopClick = (shop: Shop) => {
    console.log('Shop clicked:', shop);
    // You could add functionality here like showing details, directions, etc.
  };

  const handleShopSave = (updatedShop: Shop) => {
    const updatedShops = shops.map(shop => 
      shop.id === updatedShop.id ? updatedShop : shop
    );
    setShops(updatedShops);
    saveShopsToStorage(updatedShops);
    toast({
      title: "Commerce mis à jour",
      description: "Les modifications ont été sauvegardées avec succès"
    });
  };

  const handleShopDelete = (shopId: string) => {
    const updatedShops = shops.filter(shop => shop.id !== shopId);
    setShops(updatedShops);
    saveShopsToStorage(updatedShops);
    toast({
      title: "Commerce supprimé",
      description: "Le commerce a été supprimé avec succès"
    });
  };

  const hasActiveFilters = filters.categories.length > 0 || filters.departments.length > 0 || 
    filters.countries.length > 0 || filters.regions.length > 0 || filters.searchQuery;
  const showResults = shops.length > 0 && (hasActiveFilters || filteredShops.length > 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto px-4 py-8">
        {/* Main Application */}
          <div className="space-y-6">
            {/* Search Section */}
            <Card className="p-6 shadow-card">
              <div className="flex items-center gap-3 mb-4">
                <MapPin className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-semibold">Recherche et Filtres</h2>
              </div>
              <SearchBar onSearch={handleSearch} />
            </Card>

            {/* Filters and Map Section */}
            <div className="grid lg:grid-cols-4 gap-6">
              <div className="lg:col-span-1 space-y-6">
                <FilterPanel
                  filters={filters}
                  categories={categories}
                  departments={departments}
                  countries={countries}
                  regions={regions}
                  onFilterChange={setFilters}
                  resultsCount={filteredShops.length}
                />
              </div>
              
              <div className="lg:col-span-3">
                {showResults ? (
                  <MapView
                    shops={filteredShops}
                    onShopClick={handleShopClick}
                  />
                ) : (
                  <Card className="p-12 text-center shadow-card">
                    <MapPin className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-xl font-semibold mb-2">
                      {shops.length === 0 ? "Carte en cours de chargement..." : "Prêt à explorer ?"}
                    </h3>
                    <p className="text-muted-foreground">
                      {shops.length === 0 
                        ? "Les commerces seront bientôt disponibles sur cette carte interactive."
                        : "Utilisez les filtres ou la barre de recherche pour découvrir les commerces sur la carte."
                      }
                    </p>
                  </Card>
                )}
              </div>
            </div>

            {/* Results Section */}
            {showResults && (
              <>
                <Separator className="my-8" />
                
                <div>
                  <div className="flex items-center gap-3 mb-6">
                    <Store className="h-5 w-5 text-primary" />
                    <h2 className="text-xl font-semibold">Résultats de la recherche</h2>
                  </div>
                  
                  <VirtualizedShopList
                    shops={filteredShops}
                    onShopClick={handleShopClick}
                    onShopSave={handleShopSave}
                    onShopDelete={handleShopDelete}
                    height={600}
                    isAdmin={false}
                  />
                </div>
              </>
            )}
          </div>
      </div>
    </div>
  );
};

export default Index;
