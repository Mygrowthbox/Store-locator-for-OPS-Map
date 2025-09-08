import { Shop } from '@/types/shop';

export const exportShopsToCSV = (shops: Shop[], filename: string = 'commerces') => {
  // En-têtes CSV
  const headers = [
    'ID',
    'Nom',
    'Catégorie', 
    'Adresse',
    'Informations complémentaires',
    'Département',
    'Région',
    'Pays',
    'Téléphone',
    'Site web',
    'Latitude',
    'Longitude'
  ];

  // Conversion des données
  const csvData = shops.map(shop => [
    shop.id,
    shop.name,
    shop.category,
    shop.address,
    shop.additionalLocation || '',
    shop.department,
    shop.region,
    shop.country,
    shop.phone || '',
    shop.website || '',
    shop.latitude.toString(),
    shop.longitude.toString()
  ]);

  // Ajout des en-têtes
  const csvContent = [headers, ...csvData]
    .map(row => row.map(field => `"${String(field).replace(/"/g, '""')}"`).join(','))
    .join('\n');

  // Création du blob et téléchargement
  const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
};

export const exportShopsToJSON = (shops: Shop[], filename: string = 'commerces') => {
  const jsonContent = JSON.stringify(shops, null, 2);
  
  const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.json`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
};