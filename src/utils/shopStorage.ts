import { Shop } from '@/types/shop';

const SHOPS_STORAGE_KEY = 'imported-shops';

export const saveShopsToStorage = (shops: Shop[]): void => {
  try {
    localStorage.setItem(SHOPS_STORAGE_KEY, JSON.stringify(shops));
  } catch (error) {
    console.error('Error saving shops to localStorage:', error);
  }
};

export const loadShopsFromStorage = (): Shop[] => {
  try {
    const stored = localStorage.getItem(SHOPS_STORAGE_KEY);
    if (!stored) return [];
    
    return JSON.parse(stored);
  } catch (error) {
    console.error('Error loading shops from localStorage:', error);
    return [];
  }
};

export const clearShopsFromStorage = (): void => {
  try {
    localStorage.removeItem(SHOPS_STORAGE_KEY);
  } catch (error) {
    console.error('Error clearing shops from localStorage:', error);
  }
};