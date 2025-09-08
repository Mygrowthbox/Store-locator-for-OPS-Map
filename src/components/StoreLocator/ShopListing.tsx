import { useState } from 'react';
import { Shop, getCategoryColor } from '@/types/shop';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MapPin, Phone, ExternalLink, SortAsc, SortDesc } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ShopListingProps {
  shops: Shop[];
  onShopClick?: (shop: Shop) => void;
  className?: string;
}

type SortField = 'name' | 'category' | 'department' | 'region';
type SortDirection = 'asc' | 'desc';

const ShopListing = ({ shops, onShopClick, className }: ShopListingProps) => {
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  const sortedShops = [...shops].sort((a, b) => {
    let aValue = a[sortField]?.toString().toLowerCase() || '';
    let bValue = b[sortField]?.toString().toLowerCase() || '';
    
    const comparison = aValue.localeCompare(bValue, 'fr', { numeric: true });
    return sortDirection === 'asc' ? comparison : -comparison;
  });

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getCategoryBadgeVariant = (category: string) => {
    const categoryColor = getCategoryColor(category);
    const variants = {
      restaurant: 'bg-marker-restaurant/10 text-marker-restaurant border-marker-restaurant/20',
      shop: 'bg-marker-shop/10 text-marker-shop border-marker-shop/20', 
      service: 'bg-marker-service/10 text-marker-service border-marker-service/20',
      default: 'bg-marker-default/10 text-marker-default border-marker-default/20'
    };
    return variants[categoryColor];
  };

  if (shops.length === 0) {
    return (
      <Card className="p-8 text-center shadow-card">
        <MapPin className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
        <h3 className="text-lg font-semibold mb-2">Aucun commerce trouvé</h3>
        <p className="text-muted-foreground">
          Modifiez vos filtres ou votre recherche pour voir plus de résultats.
        </p>
      </Card>
    );
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Sort Controls */}
      <Card className="p-4 shadow-soft">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold mb-1">
              {shops.length} commerce{shops.length !== 1 ? 's' : ''} trouvé{shops.length !== 1 ? 's' : ''}
            </h3>
            <p className="text-sm text-muted-foreground">
              Triez et explorez les commerces près de chez vous
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-2">
            <Select value={sortField} onValueChange={(value: SortField) => setSortField(value)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Nom</SelectItem>
                <SelectItem value="category">Catégorie</SelectItem>
                <SelectItem value="department">Département</SelectItem>
                <SelectItem value="region">Région</SelectItem>
              </SelectContent>
            </Select>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')}
              className="px-3"
            >
              {sortDirection === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </Card>

      {/* Shop Cards */}
      <div className="grid gap-4 sm:gap-6">
        {sortedShops.map((shop) => (
          <Card 
            key={shop.id} 
            className="p-6 hover:shadow-card transition-all duration-300 cursor-pointer transform hover:-translate-y-1"
            onClick={() => onShopClick?.(shop)}
          >
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Shop Image */}
              {shop.imageUrl && (
                <div className="lg:w-32 lg:h-24 w-full h-48 flex-shrink-0 rounded-lg overflow-hidden bg-muted">
                  <img
                    src={shop.imageUrl}
                    alt={shop.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                </div>
              )}

              {/* Shop Details */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-3">
                  <div>
                    <h4 className="text-xl font-semibold mb-2">{shop.name}</h4>
                    <Badge 
                      variant="outline" 
                      className={cn("text-xs", getCategoryBadgeVariant(shop.category))}
                    >
                      {shop.category}
                    </Badge>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                    <div className="text-sm">
                      <p className="text-foreground">{shop.address}</p>
                      {shop.additionalLocation && (
                        <p className="text-muted-foreground">{shop.additionalLocation}</p>
                      )}
                      <p className="text-muted-foreground">
                        {shop.department}, {shop.region}, {shop.country}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Contact Info */}
                <div className="flex flex-wrap gap-3">
                  {shop.phone && (
                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                      <Phone className="h-4 w-4" />
                      <span>{shop.phone}</span>
                    </div>
                  )}
                  
                  {shop.website && (
                    <a
                      href={shop.website}
                      target="_blank"
                      rel="nofollow noopener"
                      onClick={(e) => e.stopPropagation()}
                      className="inline-flex items-center gap-1.5 text-sm text-primary hover:text-primary-glow transition-colors"
                    >
                      <ExternalLink className="h-4 w-4" />
                      Visiter le site
                    </a>
                  )}
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ShopListing;