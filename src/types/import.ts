import { Shop } from './shop';

export interface ImportValidationResult {
  shop: Shop;
  status: 'valid' | 'corrected' | 'invalid';
  issues: string[];
  corrections?: {
    originalLatitude?: number;
    originalLongitude?: number;
    correctedLatitude?: number;
    correctedLongitude?: number;
    distance?: number;
    geocodedAddress?: string;
    originalAddress?: string;
    correctedAddress?: string;
    addressCorrectionReason?: string;
    usedAddress?: string;
    precision?: 'exact' | 'corrected' | 'street-only' | 'city-only' | 'fallback';
    rejectedAttempts?: Array<{
      address: string;
      reason: string;
    }>;
  };
}

export interface ImportResults {
  validShops: ImportValidationResult[];
  correctedShops: ImportValidationResult[];
  invalidShops: ImportValidationResult[];
  totalProcessed: number;
  summary: {
    valid: number;
    corrected: number;
    invalid: number;
  };
}

export interface ImportProgress {
  current: number;
  total: number;
  status: 'processing' | 'validating' | 'geocoding' | 'completed' | 'error';
  message: string;
}