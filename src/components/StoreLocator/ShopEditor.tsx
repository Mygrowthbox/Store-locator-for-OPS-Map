import { useState } from 'react';
import { Shop } from '@/types/shop';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Edit, Save, X, MapPin, Phone, Globe, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ShopEditorProps {
  shop: Shop;
  onSave: (updatedShop: Shop) => void;
  onDelete?: (shopId: string) => void;
  trigger?: React.ReactNode;
}

const ShopEditor = ({ shop, onSave, onDelete, trigger }: ShopEditorProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [editedShop, setEditedShop] = useState<Shop>(shop);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSave = async () => {
    if (!editedShop.name.trim() || !editedShop.address.trim()) {
      toast({
        title: "Erreur",
        description: "Le nom et l'adresse sont obligatoires",
        variant: "destructive"
      });
      return;
    }

    if (!editedShop.latitude || !editedShop.longitude) {
      toast({
        title: "Erreur", 
        description: "Les coordonnées GPS sont obligatoires",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      onSave(editedShop);
      setIsOpen(false);
      toast({
        title: "Succès",
        description: "Commerce mis à jour avec succès"
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder les modifications",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = () => {
    if (onDelete && window.confirm('Êtes-vous sûr de vouloir supprimer ce commerce ?')) {
      onDelete(shop.id);
      setIsOpen(false);
      toast({
        title: "Commerce supprimé",
        description: "Le commerce a été supprimé avec succès"
      });
    }
  };

  const handleFieldChange = (field: keyof Shop, value: string | number) => {
    setEditedShop(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="ghost" size="sm">
            <Edit className="h-4 w-4" />
          </Button>
        )}
      </DialogTrigger>
      
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit className="h-5 w-5" />
            Modifier le commerce
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Informations de base */}
          <Card className="p-4">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Informations principales
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Nom *</Label>
                <Input
                  id="name"
                  value={editedShop.name}
                  onChange={(e) => handleFieldChange('name', e.target.value)}
                  placeholder="Nom du commerce"
                />
              </div>
              <div>
                <Label htmlFor="category">Catégorie *</Label>
                <Input
                  id="category"
                  value={editedShop.category}
                  onChange={(e) => handleFieldChange('category', e.target.value)}
                  placeholder="Catégorie"
                />
              </div>
            </div>
          </Card>

          {/* Adresse */}
          <Card className="p-4">
            <h3 className="font-semibold mb-3">Adresse</h3>
            <div className="space-y-4">
              <div>
                <Label htmlFor="address">Adresse complète *</Label>
                <Textarea
                  id="address"
                  value={editedShop.address}
                  onChange={(e) => handleFieldChange('address', e.target.value)}
                  placeholder="Adresse complète"
                  rows={2}
                />
              </div>
              <div>
                <Label htmlFor="additionalLocation">Informations complémentaires</Label>
                <Input
                  id="additionalLocation"
                  value={editedShop.additionalLocation || ''}
                  onChange={(e) => handleFieldChange('additionalLocation', e.target.value)}
                  placeholder="Bâtiment, étage, etc."
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="department">Département</Label>
                  <Input
                    id="department"
                    value={editedShop.department}
                    onChange={(e) => handleFieldChange('department', e.target.value)}
                    placeholder="Département"
                  />
                </div>
                <div>
                  <Label htmlFor="region">Région</Label>
                  <Input
                    id="region"
                    value={editedShop.region}
                    onChange={(e) => handleFieldChange('region', e.target.value)}
                    placeholder="Région"
                  />
                </div>
                <div>
                  <Label htmlFor="country">Pays</Label>
                  <Input
                    id="country"
                    value={editedShop.country}
                    onChange={(e) => handleFieldChange('country', e.target.value)}
                    placeholder="Pays"
                  />
                </div>
              </div>
            </div>
          </Card>

          {/* Coordonnées GPS */}
          <Card className="p-4">
            <h3 className="font-semibold mb-3">Coordonnées GPS</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="latitude">Latitude *</Label>
                <Input
                  id="latitude"
                  type="number"
                  step="any"
                  value={editedShop.latitude}
                  onChange={(e) => handleFieldChange('latitude', parseFloat(e.target.value))}
                  placeholder="46.603354"
                />
              </div>
              <div>
                <Label htmlFor="longitude">Longitude *</Label>
                <Input
                  id="longitude"
                  type="number"
                  step="any"
                  value={editedShop.longitude}
                  onChange={(e) => handleFieldChange('longitude', parseFloat(e.target.value))}
                  placeholder="1.888334"
                />
              </div>
            </div>
          </Card>

          {/* Contact */}
          <Card className="p-4">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Phone className="h-4 w-4" />
              Contact
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="phone">Téléphone</Label>
                <Input
                  id="phone"
                  value={editedShop.phone || ''}
                  onChange={(e) => handleFieldChange('phone', e.target.value)}
                  placeholder="01 23 45 67 89"
                />
              </div>
              <div>
                <Label htmlFor="website">Site web</Label>
                <Input
                  id="website"
                  value={editedShop.website || ''}
                  onChange={(e) => handleFieldChange('website', e.target.value)}
                  placeholder="https://www.exemple.com"
                />
              </div>
            </div>
          </Card>

          {/* Actions */}
          <div className="flex justify-between">
            <div>
              {onDelete && (
                <Button
                  variant="destructive"
                  onClick={handleDelete}
                  className="flex items-center gap-2"
                >
                  <Trash2 className="h-4 w-4" />
                  Supprimer
                </Button>
              )}
            </div>
            
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-2"
              >
                <X className="h-4 w-4" />
                Annuler
              </Button>
              <Button
                onClick={handleSave}
                disabled={isLoading}
                className="flex items-center gap-2"
              >
                <Save className="h-4 w-4" />
                {isLoading ? 'Sauvegarde...' : 'Sauvegarder'}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ShopEditor;