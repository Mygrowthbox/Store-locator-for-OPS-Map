import { ImportResults as ImportResultsType, ImportValidationResult } from '@/types/import';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CheckCircle, AlertTriangle, XCircle, MapPin, Navigation } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ImportResultsProps {
  results: ImportResultsType;
  onApplyCorrections: (correctedShops: ImportValidationResult[]) => void;
  onAcceptValid: (validShops: ImportValidationResult[]) => void;
}

const ImportResults = ({ results, onApplyCorrections, onAcceptValid }: ImportResultsProps) => {
  const ShopResultCard = ({ result }: { result: ImportValidationResult }) => (
    <Card className="p-4 mb-3">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h4 className="font-medium">{result.shop.name}</h4>
            <Badge 
              variant={
                result.status === 'valid' ? 'default' : 
                result.status === 'corrected' ? 'secondary' : 'destructive'
              }
            >
              {result.status === 'valid' ? 'Valide' : 
               result.status === 'corrected' ? 'Corrigé' : 'Invalide'}
            </Badge>
          </div>
          
          <p className="text-sm text-muted-foreground mb-2">
            {result.shop.address}, {result.shop.department}
          </p>
          
          <div className="flex items-center gap-4 text-xs text-muted-foreground mb-2">
            <span className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {result.shop.latitude.toFixed(6)}, {result.shop.longitude.toFixed(6)}
            </span>
          </div>
          
          {result.issues.length > 0 && (
            <div className="space-y-1">
              {result.issues.map((issue, index) => (
                <p key={index} className="text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded">
                  {issue}
                </p>
              ))}
            </div>
          )}
          
          {result.corrections && (
            <div className="mt-3 p-3 bg-blue-50 rounded border">
              <h5 className="text-sm font-medium text-blue-900 mb-2">Corrections appliquées :</h5>
              <div className="space-y-1 text-xs">
                {result.corrections.precision && (
                  <div className="mb-2 p-2 bg-green-50 rounded border-l-2 border-green-400">
                    <div className="flex justify-between items-start">
                      <span className="font-medium text-green-800">Niveau de précision :</span>
                      <span className="text-green-700 capitalize">
                        {result.corrections.precision === 'exact' && '✓ Adresse exacte'}
                        {result.corrections.precision === 'corrected' && '⚠ Adresse corrigée'}
                        {result.corrections.precision === 'street-only' && '📍 Niveau rue'}
                        {result.corrections.precision === 'city-only' && '🏙 Niveau ville'}
                        {result.corrections.precision === 'fallback' && '⚠ Département uniquement'}
                      </span>
                    </div>
                    {result.corrections.usedAddress && (
                      <div className="text-green-700 mt-1 text-xs">
                        <strong>Adresse utilisée :</strong> {result.corrections.usedAddress}
                      </div>
                    )}
                  </div>
                )}
                
                {result.corrections.rejectedAttempts && result.corrections.rejectedAttempts.length > 0 && (
                  <div className="mb-2 p-2 bg-orange-50 rounded border-l-2 border-orange-400">
                    <div className="font-medium text-orange-800 mb-1">Tentatives échouées :</div>
                    {result.corrections.rejectedAttempts.map((attempt, idx) => (
                      <div key={idx} className="text-xs text-orange-700 mb-1">
                        <span className="font-medium">• {attempt.address}</span>
                        <br />
                        <span className="text-orange-600 italic ml-2">→ {attempt.reason}</span>
                      </div>
                    ))}
                  </div>
                )}
                
                {result.corrections.originalAddress && result.corrections.correctedAddress && (
                  <div className="mb-2 p-2 bg-white rounded border-l-2 border-orange-400">
                    <div className="flex justify-between items-start">
                      <span className="font-medium text-orange-800">Adresse originale :</span>
                    </div>
                    <div className="text-orange-700 mt-1">{result.corrections.originalAddress}</div>
                    <div className="flex justify-between items-start mt-1">
                      <span className="font-medium text-green-800">Adresse corrigée :</span>
                    </div>
                    <div className="text-green-700 mt-1">{result.corrections.correctedAddress}</div>
                    {result.corrections.addressCorrectionReason && (
                      <div className="text-xs text-blue-600 mt-2 italic">
                        <strong>Raison :</strong> {result.corrections.addressCorrectionReason}
                      </div>
                    )}
                  </div>
                )}
                
                <div className="flex justify-between">
                  <span>Coordonnées originales :</span>
                  <span>{result.corrections.originalLatitude?.toFixed(6)}, {result.corrections.originalLongitude?.toFixed(6)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Coordonnées corrigées :</span>
                  <span className="font-medium text-green-700">
                    {result.corrections.correctedLatitude?.toFixed(6)}, {result.corrections.correctedLongitude?.toFixed(6)}
                  </span>
                </div>
                {result.corrections.distance && (
                  <div className="flex justify-between">
                    <span>Distance d'écart :</span>
                    <span>{result.corrections.distance.toFixed(2)} km</span>
                  </div>
                )}
                {result.corrections.geocodedAddress && (
                  <div className="mt-2">
                    <span className="block text-blue-800">Adresse géocodée :</span>
                    <span className="text-blue-700">{result.corrections.geocodedAddress}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Summary */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Résultats de l'import</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold">{results.totalProcessed}</div>
            <div className="text-sm text-muted-foreground">Total traité</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{results.summary.valid}</div>
            <div className="text-sm text-muted-foreground">Valides</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{results.summary.corrected}</div>
            <div className="text-sm text-muted-foreground">Corrigés</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">{results.summary.invalid}</div>
            <div className="text-sm text-muted-foreground">Invalides</div>
          </div>
        </div>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-4">
        {results.validShops.length > 0 && (
          <Button 
            onClick={() => onAcceptValid(results.validShops)}
            className="flex items-center gap-2"
          >
            <CheckCircle className="h-4 w-4" />
            Accepter les {results.summary.valid} commerces valides
          </Button>
        )}
        
        {results.correctedShops.length > 0 && (
          <Button 
            variant="secondary"
            onClick={() => onApplyCorrections(results.correctedShops)}
            className="flex items-center gap-2"
          >
            <Navigation className="h-4 w-4" />
            Valider les {results.summary.corrected} corrections
          </Button>
        )}
      </div>

      {/* Detailed Results */}
      <Tabs defaultValue="valid" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="valid" className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            Valides ({results.summary.valid})
          </TabsTrigger>
          <TabsTrigger value="corrected" className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Corrigés ({results.summary.corrected})
          </TabsTrigger>
          <TabsTrigger value="invalid" className="flex items-center gap-2">
            <XCircle className="h-4 w-4" />
            Invalides ({results.summary.invalid})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="valid" className="mt-4">
          <div className="space-y-2">
            {results.validShops.length > 0 ? (
              results.validShops.map((result, index) => (
                <ShopResultCard key={index} result={result} />
              ))
            ) : (
              <Card className="p-8 text-center">
                <p className="text-muted-foreground">Aucun commerce valide trouvé</p>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="corrected" className="mt-4">
          <div className="space-y-2">
            {results.correctedShops.length > 0 ? (
              results.correctedShops.map((result, index) => (
                <ShopResultCard key={index} result={result} />
              ))
            ) : (
              <Card className="p-8 text-center">
                <p className="text-muted-foreground">Aucune correction nécessaire</p>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="invalid" className="mt-4">
          <div className="space-y-2">
            {results.invalidShops.length > 0 ? (
              results.invalidShops.map((result, index) => (
                <ShopResultCard key={index} result={result} />
              ))
            ) : (
              <Card className="p-8 text-center">
                <p className="text-muted-foreground">Aucun commerce invalide</p>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ImportResults;