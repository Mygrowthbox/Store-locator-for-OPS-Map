import React, { useState, useMemo } from 'react';
import { Shop, SortField, SortDirection, getCategoryIcon } from '@/types/shop';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import ShopEditor from '@/components/StoreLocator/ShopEditor';
import { 
  MapPin, Phone, Globe, ExternalLink, ArrowUpDown, ArrowUp, ArrowDown,
  Utensils, ShoppingBag, Wrench, Coffee, Wine, Wheat, Cake, Store, 
  ShoppingCart, Cross, BookOpen, Hammer, Scissors, Landmark, Bed, Car,
  Bike, Users, Truck, Wind, ShieldCheck, Edit
} from 'lucide-react';

interface VirtualizedShopListProps {
  shops: Shop[];
  onShopClick: (shop: Shop) => void;
  onShopSave: (shop: Shop) => void;
  onShopDelete: (shopId: string) => void;
  height?: number;
  isAdmin?: boolean;
}

const VirtualizedShopList: React.FC<VirtualizedShopListProps> = ({ 
  shops, 
  onShopClick, 
  onShopSave,
  onShopDelete,
  height = 600,
  isAdmin = false
}) => {
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  // Debug logging
  console.log('📋 VIRTUALIZED LIST: Received shops count:', shops.length);
  console.log('📋 VIRTUALIZED LIST: Received shops IDs:', shops.map(s => s.id).join(', '));
  console.log('📋 VIRTUALIZED LIST: Sample names:', shops.slice(0, 3).map(s => s.name));

  const getCategoryIconComponent = (category: string) => {
    const iconName = getCategoryIcon(category);
    const iconProps = "h-4 w-4";
    
    switch (iconName) {
      case 'utensils': return <Utensils className={iconProps} />;
      case 'coffee': return <Coffee className={iconProps} />;
      case 'wine': return <Wine className={iconProps} />;
      case 'wheat': return <Wheat className={iconProps} />;
      case 'cake': return <Cake className={iconProps} />;
      case 'shopping-bag': return <ShoppingBag className={iconProps} />;
      case 'store': return <Store className={iconProps} />;
      case 'shopping-cart': return <ShoppingCart className={iconProps} />;
      case 'cross': return <Cross className={iconProps} />;
      case 'book-open': return <BookOpen className={iconProps} />;
      case 'wrench': return <Wrench className={iconProps} />;
      case 'hammer': return <Hammer className={iconProps} />;
      case 'scissors': return <Scissors className={iconProps} />;
      case 'landmark': return <Landmark className={iconProps} />;
      case 'bed': return <Bed className={iconProps} />;
      case 'car': return <Car className={iconProps} />;
      case 'bike': return <Bike className={iconProps} />;
      case 'users': return <Users className={iconProps} />;
      case 'truck': return <Truck className={iconProps} />;
      case 'wind': return <Wind className={iconProps} />;
      case 'shield-check': return <ShieldCheck className={iconProps} />;
      default: return <MapPin className={iconProps} />;
    }
  };

  const sortedShops = useMemo(() => {
    const sorted = [...shops].sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];
      
      if (typeof aValue === 'string') aValue = aValue.toLowerCase();
      if (typeof bValue === 'string') bValue = bValue.toLowerCase();
      
      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
    console.log('📋 VIRTUALIZED LIST: After sort, count:', sorted.length);
    console.log('📋 VIRTUALIZED LIST: After sort, IDs:', sorted.map(s => s.id).join(', '));
    return sorted;
  }, [shops, sortField, sortDirection]);

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };
  if (sortedShops.length === 0) {
    return (
      <Card className="p-8 text-center">
        <p className="text-muted-foreground">Aucun commerce trouvé avec les filtres actuels.</p>
      </Card>
    );
  }

  return (
    <div className="w-full">
      <div className="mb-4 flex items-center justify-between flex-wrap gap-4">
        <p className="text-sm text-muted-foreground">
          {sortedShops.length} commerce{sortedShops.length > 1 ? 's' : ''} trouvé{sortedShops.length > 1 ? 's' : ''}
        </p>
        
        <div className="flex items-center gap-2 text-sm">
          <span className="text-muted-foreground">Trier par:</span>
          <Select value={sortField} onValueChange={(value: SortField) => setSortField(value)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name">Nom</SelectItem>
              <SelectItem value="category">Catégorie</SelectItem>
              <SelectItem value="department">Département</SelectItem>
              <SelectItem value="region">Région</SelectItem>
              <SelectItem value="country">Pays</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => toggleSort(sortField)}
            className="p-1"
          >
            {sortDirection === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />}
          </Button>
        </div>
      </div>
      
      <div 
        className="overflow-auto rounded-lg border border-border bg-background"
        style={{ height: `${height}px` }}
      >
        <div className="space-y-2 p-2">
          {sortedShops.map((shop) => (
            <Card key={shop.id} className="p-4 hover:shadow-lg transition-shadow">
              <div className="flex justify-between items-start mb-2">
                <div className="flex-1 cursor-pointer" onClick={() => onShopClick(shop)}>
                  <h3 className="font-semibold text-lg text-foreground line-clamp-1">{shop.name}</h3>
                </div>
                <div className="flex items-center gap-2 shrink-0 ml-2">
                  <Badge 
                    variant="secondary" 
                    className="bg-primary/10 text-primary border-primary/20 flex items-center gap-1"
                  >
                    {getCategoryIconComponent(shop.category)}
                    <span className="text-xs">{shop.category}</span>
                  </Badge>
                  {isAdmin && (
                    <ShopEditor
                      shop={shop}
                      onSave={onShopSave}
                      onDelete={onShopDelete}
                      trigger={
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <Edit className="h-4 w-4" />
                        </Button>
                      }
                    />
                  )}
                </div>
              </div>
              
              <div className="space-y-2 text-sm text-muted-foreground cursor-pointer" onClick={() => onShopClick(shop)}>
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 mt-1 shrink-0 text-primary" />
                  <div className="min-w-0">
                    <p className="line-clamp-1">{shop.address}</p>
                    {shop.additionalLocation && (
                      <p className="text-xs text-muted-foreground/80 line-clamp-1">{shop.additionalLocation}</p>
                    )}
                    <div className="flex gap-2 mt-1">
                      <span className="text-xs bg-muted/50 px-2 py-1 rounded">
                        {shop.department}
                      </span>
                      <span className="text-xs bg-accent/10 px-2 py-1 rounded">
                        {shop.country}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  {shop.phone && (
                    <div className="flex items-center gap-1">
                      <Phone className="h-3 w-3 text-secondary" />
                      <span className="text-xs">{shop.phone}</span>
                    </div>
                  )}
                  {shop.website && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-auto p-1 text-xs text-accent hover:text-accent-foreground"
                      onClick={(e) => {
                        e.stopPropagation();
                        window.open(shop.website, '_blank');
                      }}
                    >
                      <Globe className="h-3 w-3 mr-1" />
                      Site web
                      <ExternalLink className="h-2 w-2 ml-1" />
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default VirtualizedShopList;