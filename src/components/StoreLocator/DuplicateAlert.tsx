import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { AlertTriangle, Copy, MapPin, Eye } from 'lucide-react';
import { Shop } from '@/types/shop';
import { DuplicateGroup } from '@/hooks/useDuplicateDetection';

interface DuplicateAlertProps {
  duplicates: DuplicateGroup[];
  onShopClick?: (shop: Shop) => void;
  onDeleteDuplicates?: (shopsToDelete: Shop[]) => void;
  className?: string;
}

const DuplicateAlert = ({ duplicates, onShopClick, onDeleteDuplicates, className }: DuplicateAlertProps) => {
  if (duplicates.length === 0) return null;

  const getReason = (reason: DuplicateGroup['reason']) => {
    switch (reason) {
      case 'exact_match':
        return { text: 'Correspondance exacte', color: 'destructive' as const };
      case 'same_location':
        return { text: 'Même localisation', color: 'secondary' as const };
      case 'similar_name':
        return { text: 'Noms similaires', color: 'outline' as const };
      default:
        return { text: 'Doublon détecté', color: 'outline' as const };
    }
  };

  const totalDuplicates = duplicates.reduce((acc, group) => acc + group.shops.length, 0);

  return (
    <div className={className}>
      <Alert className="border-warning bg-warning/5">
        <AlertTriangle className="h-4 w-4 text-warning" />
        <AlertTitle className="text-warning">Doublons détectés</AlertTitle>
        <AlertDescription>
          {duplicates.length} groupe{duplicates.length > 1 ? 's' : ''} de doublons trouvé{duplicates.length > 1 ? 's' : ''} 
          ({totalDuplicates} commerces concernés)
        </AlertDescription>
      </Alert>

      <div className="mt-4 space-y-4 max-h-80 overflow-y-auto">
        {duplicates.map((group, index) => (
          <Card key={index} className="p-4 border-warning/20">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Copy className="h-4 w-4 text-warning" />
                <span className="font-medium text-sm">
                  Groupe {index + 1} - {group.shops.length} commerces
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={getReason(group.reason).color} className="text-xs">
                  {getReason(group.reason).text}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {Math.round(group.similarity * 100)}% similaire
                </Badge>
              </div>
            </div>

            <div className="space-y-2">
              {group.shops.map((shop, shopIndex) => (
                <div
                  key={shop.id}
                  className="flex items-center justify-between p-2 bg-muted/30 rounded-md hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm truncate">
                        {shop.name}
                      </span>
                      <Badge variant="outline" className="text-xs shrink-0">
                        {shop.category}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <MapPin className="h-3 w-3" />
                      <span className="truncate">{shop.address}</span>
                    </div>
                  </div>
                  
                  {onShopClick && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onShopClick(shop)}
                      className="shrink-0 ml-2"
                    >
                      <Eye className="h-3 w-3 mr-1" />
                      Voir
                    </Button>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-3 flex gap-2">
              <Button 
                size="sm" 
                variant="destructive"
                onClick={() => {
                  if (onDeleteDuplicates) {
                    // Supprimer tous les doublons sauf le premier
                    const shopsToDelete = group.shops.slice(1);
                    onDeleteDuplicates(shopsToDelete);
                  }
                }}
                className="flex-1"
              >
                Supprimer les doublons
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default DuplicateAlert;