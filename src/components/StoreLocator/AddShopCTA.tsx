import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, MapPin } from "lucide-react";

interface AddShopCTAProps {
  className?: string;
}

const AddShopCTA = ({ className }: AddShopCTAProps) => {
  const handleAddShop = () => {
    // Pour l'instant, on peut ouvrir un lien vers un formulaire ou une page de contact
    window.open('mailto:contact@example.com?subject=Ajouter mon atelier à la carte&body=Bonjour, je souhaiterais ajouter mon atelier à votre carte. Voici mes informations :', '_blank');
  };

  return (
    <Card className={className}>
      <CardContent className="p-6 text-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="bg-primary/10 p-3 rounded-full">
            <MapPin className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-2">
              Votre atelier n'est pas sur la carte ?
            </h3>
            <p className="text-muted-foreground mb-4">
              Rejoignez notre réseau et rendez votre atelier visible par tous les cyclistes de la région.
            </p>
          </div>
          <Button onClick={handleAddShop} className="w-full sm:w-auto">
            <Plus className="h-4 w-4 mr-2" />
            Ajouter mon atelier
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default AddShopCTA;