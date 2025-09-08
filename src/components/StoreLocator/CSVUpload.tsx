import { useState, useRef } from 'react';
import { Upload, FileText, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { parseCSVWithValidation } from '@/utils/csvParser';
import { Shop } from '@/types/shop';
import { ImportResults as ImportResultsType, ImportValidationResult } from '@/types/import';
import { saveShopsToStorage } from '@/utils/shopStorage';
import { useAddressValidation } from '@/hooks/useAddressValidation';
import ImportResults from './ImportResults';
import { toast } from 'sonner';

interface CSVUploadProps {
  onShopsImported: (shops: Shop[]) => void;
}

const CSVUpload = ({ onShopsImported }: CSVUploadProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [importResults, setImportResults] = useState<ImportResultsType | null>(null);
  const [showValidation, setShowValidation] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { validateShops, progress, isValidating } = useAddressValidation();

  const processFile = async (file: File) => {
    setIsProcessing(true);
    setError(null);
    setImportResults(null);

    try {
      const text = await file.text();
      const { validShops, invalidEntries } = parseCSVWithValidation(text);
      
      if (validShops.length === 0) {
        setError('Aucun commerce valide trouvé dans le fichier CSV');
        return;
      }

      // Start validation process
      setShowValidation(true);
      const results = await validateShops(validShops);
      setImportResults(results);
      
      toast.success(`Import terminé: ${results.summary.valid} valides, ${results.summary.corrected} corrigés, ${results.summary.invalid} invalides`);
    } catch (err) {
      console.error('Error processing CSV:', err);
      setError('Erreur lors du traitement du fichier CSV');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleApplyCorrections = (correctedShops: ImportValidationResult[]) => {
    if (!importResults) return;
    
    // Fusionner les commerces corrigés avec les valides existants
    const updatedResults = {
      ...importResults,
      validShops: [
        ...importResults.validShops,
        ...correctedShops.map(result => ({ ...result, status: 'valid' as const }))
      ],
      correctedShops: [],
      summary: {
        ...importResults.summary,
        valid: importResults.summary.valid + correctedShops.length,
        corrected: 0
      }
    };
    
    setImportResults(updatedResults);
    toast.success(`${correctedShops.length} corrections appliquées - maintenant dans les commerces valides`);
  };

  const handleAcceptValid = (allValidShops: ImportValidationResult[]) => {
    const shops = allValidShops.map(result => result.shop);
    onShopsImported(shops);
    toast.success(`${shops.length} commerces importés avec succès`);
    setImportResults(null);
    setShowValidation(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      if (file.type === 'text/csv' || file.name.endsWith('.csv')) {
        processFile(file);
      } else {
        setError('Veuillez sélectionner un fichier CSV valide');
      }
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-4">
      {!showValidation && (
        <Card 
          className={`relative border-2 border-dashed transition-colors ${
            isDragging 
              ? 'border-primary bg-primary/5' 
              : 'border-muted-foreground/25 hover:border-primary/50'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className="p-8 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <Upload className="h-6 w-6 text-primary" />
            </div>
            
            <h3 className="mb-2 text-lg font-semibold">Importer un fichier CSV</h3>
            <p className="mb-4 text-sm text-muted-foreground">
              Glissez-déposez votre fichier CSV ici ou cliquez pour le sélectionner
            </p>
            
            <Button 
              onClick={handleClick}
              disabled={isProcessing || isValidating}
              variant="outline"
              className="mb-4"
            >
              <FileText className="mr-2 h-4 w-4" />
              {isProcessing ? 'Traitement...' : 'Sélectionner un fichier'}
            </Button>
            
            <p className="text-xs text-muted-foreground">
              Format attendu: nom, adresse, latitude, longitude, catégorie, etc.
            </p>
          </div>
          
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={handleFileSelect}
            className="hidden"
          />
        </Card>
      )}
      
      {isValidating && (
        <Card className="p-6">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
              <h3 className="text-lg font-semibold">Validation en cours...</h3>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>{progress.message}</span>
                <span>{progress.current}/{progress.total}</span>
              </div>
              <Progress value={(progress.current / progress.total) * 100} />
            </div>
            
            <p className="text-sm text-muted-foreground">
              Validation des adresses et correction automatique des coordonnées incohérentes...
            </p>
          </div>
        </Card>
      )}
      
      {importResults && (
        <ImportResults
          results={importResults}
          onApplyCorrections={handleApplyCorrections}
          onAcceptValid={handleAcceptValid}
        />
      )}
      
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default CSVUpload;