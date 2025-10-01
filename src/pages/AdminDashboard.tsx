import { useState, useEffect } from 'react';
import { Shop } from '@/types/shop';
import CSVUpload from '@/components/StoreLocator/CSVUpload';
import ShopEditor from '@/components/StoreLocator/ShopEditor';
import DuplicateAlert from '@/components/StoreLocator/DuplicateAlert';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Settings, Upload, ArrowLeft, Trash2, Download, Edit, Search, Filter } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { saveShopsToStorage, loadShopsFromStorage, clearShopsFromStorage } from '@/utils/shopStorage';
import { exportShopsToCSV, exportShopsToJSON } from '@/utils/csvExport';
import { useDuplicateDetection } from '@/hooks/useDuplicateDetection';
import { useToast } from '@/hooks/use-toast';

const AdminDashboard = () => {
  const [shops, setShops] = useState<Shop[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const navigate = useNavigate();
  const { toast } = useToast();

  // Détection des doublons
  const { duplicates, hasDuplicates, totalDuplicates } = useDuplicateDetection(shops);

  // Load existing shops from localStorage on component mount
  useEffect(() => {
    const savedShops = loadShopsFromStorage();
    setShops(savedShops);
  }, []);

  const handleDataLoaded = (loadedShops: Shop[]) => {
    // Éviter les doublons en vérifiant les noms et adresses
    const existingShops = loadShopsFromStorage();
    const newShops = loadedShops.filter(newShop => 
      !existingShops.some(existing => 
        existing.name === newShop.name && 
        existing.address === newShop.address
      )
    );
    
    const combinedShops = [...existingShops, ...newShops];
    
    setShops(combinedShops);
    saveShopsToStorage(combinedShops);
    
    toast({
      title: "Succès",
      description: `${newShops.length} nouveaux commerces ajoutés !`,
    });
  };

  const handleResetData = () => {
    clearShopsFromStorage();
    setShops([]);
    
    toast({
      title: "Données réinitialisées",
      description: "Tous les commerces ont été supprimés.",
    });
  };

  const handleShopUpdate = (updatedShop: Shop) => {
    const updatedShops = shops.map(shop => 
      shop.id === updatedShop.id ? updatedShop : shop
    );
    setShops(updatedShops);
    saveShopsToStorage(updatedShops);
  };

  const handleShopDelete = (shopId: string) => {
    const updatedShops = shops.filter(shop => shop.id !== shopId);
    setShops(updatedShops);
    saveShopsToStorage(updatedShops);
  };

  const handleExportCSV = () => {
    exportShopsToCSV(shops, 'commerces_admin');
    toast({
      title: "Export réussi",
      description: "Les données ont été exportées en CSV"
    });
  };

  const handleExportJSON = () => {
    exportShopsToJSON(shops, 'commerces_admin');
    toast({
      title: "Export réussi", 
      description: "Les données ont été exportées en JSON"
    });
  };

  // Filtrage des commerces pour l'interface d'édition
  const filteredShops = shops.filter(shop => {
    const matchesSearch = shop.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         shop.address.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || shop.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const categories = Array.from(new Set(shops.map(shop => shop.category))).sort();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour au site
          </Button>
        </div>

        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary to-primary-glow rounded-full mb-4 shadow-elegant">
            <Settings className="h-8 w-8 text-primary-foreground" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-4">
            Tableau de Bord Admin
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Gérez les données des commerces et ateliers affichés sur la carte interactive.
          </p>
        </div>

        {/* Section Import/Export */}
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Import */}
            <Card className="p-6 shadow-card">
              <div className="flex items-center gap-3 mb-6">
                <Upload className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-semibold">Import de données</h2>
              </div>
              
              <CSVUpload onShopsImported={handleDataLoaded} />
            </Card>

            {/* Export */}
            <Card className="p-6 shadow-card">
              <div className="flex items-center gap-3 mb-6">
                <Download className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-semibold">Export de données</h2>
              </div>
              
              {shops.length > 0 ? (
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Exporter les {shops.length} commerces actuellement chargés
                  </p>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Button 
                      onClick={handleExportCSV}
                      className="flex items-center gap-2"
                      variant="outline"
                    >
                      <Download className="h-4 w-4" />
                      Exporter CSV
                    </Button>
                    <Button 
                      onClick={handleExportJSON}
                      className="flex items-center gap-2"
                      variant="outline"
                    >
                      <Download className="h-4 w-4" />
                      Exporter JSON
                    </Button>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Aucune donnée à exporter
                </p>
              )}
            </Card>
          </div>

          {/* Statistiques et doublons */}
          {shops.length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <Card className="p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{shops.length}</div>
                  <div className="text-sm text-muted-foreground">Commerces total</div>
                </div>
              </Card>
              <Card className="p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-secondary">{categories.length}</div>
                  <div className="text-sm text-muted-foreground">Catégories</div>
                </div>
              </Card>
              <Card className="p-4">
                <div className="text-center">
                  <div className={`text-2xl font-bold ${hasDuplicates ? 'text-warning' : 'text-accent'}`}>
                    {totalDuplicates}
                  </div>
                  <div className="text-sm text-muted-foreground">Doublons potentiels</div>
                </div>
              </Card>
            </div>
          )}

          {/* Alerte doublons */}
          {hasDuplicates && (
            <DuplicateAlert 
              duplicates={duplicates} 
              onShopClick={(shop) => {
                // Centrer la carte sur le commerce sélectionné
                const mapElement = document.querySelector('.leaflet-container');
                if (mapElement) {
                  mapElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
              }}
              onDeleteDuplicates={(shopsToDelete) => {
                shopsToDelete.forEach(shop => {
                  handleShopDelete(shop.id);
                });
                toast({
                  title: "Doublons supprimés",
                  description: `${shopsToDelete.length} commerce${shopsToDelete.length > 1 ? 's' : ''} supprimé${shopsToDelete.length > 1 ? 's' : ''}`,
                });
              }}
            />
          )}

          {/* Section d'édition */}
          {shops.length > 0 && (
            <Card className="p-6 shadow-card">
              <div className="flex items-center gap-3 mb-6">
                <Edit className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-semibold">Gestion des commerces</h2>
                <Button 
                  variant="destructive" 
                  size="sm"
                  onClick={handleResetData}
                  className="flex items-center gap-2 ml-auto"
                >
                  <Trash2 className="h-4 w-4" />
                  Tout supprimer
                </Button>
              </div>

              {/* Filtres */}
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Rechercher par nom ou adresse..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-muted-foreground" />
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Filtrer par catégorie" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Toutes les catégories</SelectItem>
                      {categories.map(category => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Liste des commerces */}
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {filteredShops.map((shop) => (
                  <div key={shop.id} className="flex items-center justify-between p-3 bg-muted/20 rounded-lg hover:bg-muted/40 transition-colors">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium truncate">{shop.name}</span>
                        <Badge variant="outline" className="text-xs shrink-0">
                          {shop.category}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground truncate">
                        {shop.address}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 ml-4" onClick={(e) => e.stopPropagation()}>
                      <ShopEditor
                        shop={shop}
                        onSave={handleShopUpdate}
                        onDelete={handleShopDelete}
                        trigger={
                          <Button variant="ghost" size="sm" onClick={(e) => e.stopPropagation()}>
                            <Edit className="h-4 w-4" />
                          </Button>
                        }
                      />
                    </div>
                  </div>
                ))}
                
                {filteredShops.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    Aucun commerce trouvé avec les filtres actuels
                  </div>
                )}
              </div>
            </Card>
          )}

          <Card className="p-6 shadow-card">
            <h3 className="text-lg font-semibold mb-4">Instructions d'utilisation</h3>
            <div className="space-y-3 text-sm text-muted-foreground">
              <p>• Le fichier CSV doit contenir les colonnes : Nom, Catégorie, Adresse, Longitude, Latitude</p>
              <p>• Les coordonnées GPS (longitude/latitude) sont obligatoires pour l'affichage sur la carte</p>
              <p>• Les données importées seront immédiatement visibles sur la carte publique</p>
              <p>• Vous pouvez importer plusieurs fichiers pour mettre à jour les données</p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;