// Geographic data for France, Belgium, and Switzerland

export const COUNTRIES = [
  { value: 'France', label: 'France' },
  { value: 'Belgique', label: 'Belgique' },
  { value: 'Suisse', label: 'Suisse' }
];

export const FRANCE_REGIONS = [
  { value: 'Auvergne-Rhône-Alpes', label: 'Auvergne-Rhône-Alpes' },
  { value: 'Bourgogne-Franche-Comté', label: 'Bourgogne-Franche-Comté' },
  { value: 'Bretagne', label: 'Bretagne' },
  { value: 'Centre-Val de Loire', label: 'Centre-Val de Loire' },
  { value: 'Corse', label: 'Corse' },
  { value: 'Grand Est', label: 'Grand Est' },
  { value: 'Hauts-de-France', label: 'Hauts-de-France' },
  { value: 'Île-de-France', label: 'Île-de-France' },
  { value: 'Normandie', label: 'Normandie' },
  { value: 'Nouvelle-Aquitaine', label: 'Nouvelle-Aquitaine' },
  { value: 'Occitanie', label: 'Occitanie' },
  { value: 'Pays de la Loire', label: 'Pays de la Loire' },
  { value: 'Provence-Alpes-Côte d\'Azur', label: 'Provence-Alpes-Côte d\'Azur' },
  { value: 'Guadeloupe', label: 'Guadeloupe' },
  { value: 'Martinique', label: 'Martinique' },
  { value: 'Guyane', label: 'Guyane' },
  { value: 'La Réunion', label: 'La Réunion' },
  { value: 'Mayotte', label: 'Mayotte' }
];

export const BELGIUM_REGIONS = [
  { value: 'Bruxelles-Capitale', label: 'Bruxelles-Capitale' },
  { value: 'Flandre', label: 'Flandre' },
  { value: 'Wallonie', label: 'Wallonie' }
];

export const SWITZERLAND_CANTONS = [
  { value: 'Argovie', label: 'Argovie' },
  { value: 'Appenzell Rhodes-Extérieures', label: 'Appenzell Rhodes-Extérieures' },
  { value: 'Appenzell Rhodes-Intérieures', label: 'Appenzell Rhodes-Intérieures' },
  { value: 'Bâle-Campagne', label: 'Bâle-Campagne' },
  { value: 'Bâle-Ville', label: 'Bâle-Ville' },
  { value: 'Berne', label: 'Berne' },
  { value: 'Fribourg', label: 'Fribourg' },
  { value: 'Genève', label: 'Genève' },
  { value: 'Glaris', label: 'Glaris' },
  { value: 'Grisons', label: 'Grisons' },
  { value: 'Jura', label: 'Jura' },
  { value: 'Lucerne', label: 'Lucerne' },
  { value: 'Neuchâtel', label: 'Neuchâtel' },
  { value: 'Nidwald', label: 'Nidwald' },
  { value: 'Obwald', label: 'Obwald' },
  { value: 'Saint-Gall', label: 'Saint-Gall' },
  { value: 'Schaffhouse', label: 'Schaffhouse' },
  { value: 'Schwyz', label: 'Schwyz' },
  { value: 'Soleure', label: 'Soleure' },
  { value: 'Tessin', label: 'Tessin' },
  { value: 'Thurgovie', label: 'Thurgovie' },
  { value: 'Uri', label: 'Uri' },
  { value: 'Valais', label: 'Valais' },
  { value: 'Vaud', label: 'Vaud' },
  { value: 'Zoug', label: 'Zoug' },
  { value: 'Zurich', label: 'Zurich' }
];

export const FRANCE_DEPARTMENTS: Record<string, { value: string; label: string }[]> = {
  'Auvergne-Rhône-Alpes': [
    { value: 'Ain', label: 'Ain (01)' },
    { value: 'Allier', label: 'Allier (03)' },
    { value: 'Ardèche', label: 'Ardèche (07)' },
    { value: 'Cantal', label: 'Cantal (15)' },
    { value: 'Drôme', label: 'Drôme (26)' },
    { value: 'Isère', label: 'Isère (38)' },
    { value: 'Loire', label: 'Loire (42)' },
    { value: 'Haute-Loire', label: 'Haute-Loire (43)' },
    { value: 'Puy-de-Dôme', label: 'Puy-de-Dôme (63)' },
    { value: 'Rhône', label: 'Rhône (69)' },
    { value: 'Savoie', label: 'Savoie (73)' },
    { value: 'Haute-Savoie', label: 'Haute-Savoie (74)' }
  ],
  'Bourgogne-Franche-Comté': [
    { value: 'Côte-d\'Or', label: 'Côte-d\'Or (21)' },
    { value: 'Doubs', label: 'Doubs (25)' },
    { value: 'Jura', label: 'Jura (39)' },
    { value: 'Nièvre', label: 'Nièvre (58)' },
    { value: 'Haute-Saône', label: 'Haute-Saône (70)' },
    { value: 'Saône-et-Loire', label: 'Saône-et-Loire (71)' },
    { value: 'Yonne', label: 'Yonne (89)' },
    { value: 'Territoire de Belfort', label: 'Territoire de Belfort (90)' }
  ],
  'Bretagne': [
    { value: 'Côtes-d\'Armor', label: 'Côtes-d\'Armor (22)' },
    { value: 'Finistère', label: 'Finistère (29)' },
    { value: 'Ille-et-Vilaine', label: 'Ille-et-Vilaine (35)' },
    { value: 'Morbihan', label: 'Morbihan (56)' }
  ],
  'Centre-Val de Loire': [
    { value: 'Cher', label: 'Cher (18)' },
    { value: 'Eure-et-Loir', label: 'Eure-et-Loir (28)' },
    { value: 'Indre', label: 'Indre (36)' },
    { value: 'Indre-et-Loire', label: 'Indre-et-Loire (37)' },
    { value: 'Loir-et-Cher', label: 'Loir-et-Cher (41)' },
    { value: 'Loiret', label: 'Loiret (45)' }
  ],
  'Corse': [
    { value: 'Corse-du-Sud', label: 'Corse-du-Sud (2A)' },
    { value: 'Haute-Corse', label: 'Haute-Corse (2B)' }
  ],
  'Grand Est': [
    { value: 'Ardennes', label: 'Ardennes (08)' },
    { value: 'Aube', label: 'Aube (10)' },
    { value: 'Marne', label: 'Marne (51)' },
    { value: 'Haute-Marne', label: 'Haute-Marne (52)' },
    { value: 'Meurthe-et-Moselle', label: 'Meurthe-et-Moselle (54)' },
    { value: 'Meuse', label: 'Meuse (55)' },
    { value: 'Moselle', label: 'Moselle (57)' },
    { value: 'Bas-Rhin', label: 'Bas-Rhin (67)' },
    { value: 'Haut-Rhin', label: 'Haut-Rhin (68)' },
    { value: 'Vosges', label: 'Vosges (88)' }
  ],
  'Hauts-de-France': [
    { value: 'Aisne', label: 'Aisne (02)' },
    { value: 'Nord', label: 'Nord (59)' },
    { value: 'Oise', label: 'Oise (60)' },
    { value: 'Pas-de-Calais', label: 'Pas-de-Calais (62)' },
    { value: 'Somme', label: 'Somme (80)' }
  ],
  'Île-de-France': [
    { value: 'Paris', label: 'Paris (75)' },
    { value: 'Seine-et-Marne', label: 'Seine-et-Marne (77)' },
    { value: 'Yvelines', label: 'Yvelines (78)' },
    { value: 'Essonne', label: 'Essonne (91)' },
    { value: 'Hauts-de-Seine', label: 'Hauts-de-Seine (92)' },
    { value: 'Seine-Saint-Denis', label: 'Seine-Saint-Denis (93)' },
    { value: 'Val-de-Marne', label: 'Val-de-Marne (94)' },
    { value: 'Val-d\'Oise', label: 'Val-d\'Oise (95)' }
  ],
  'Normandie': [
    { value: 'Calvados', label: 'Calvados (14)' },
    { value: 'Eure', label: 'Eure (27)' },
    { value: 'Manche', label: 'Manche (50)' },
    { value: 'Orne', label: 'Orne (61)' },
    { value: 'Seine-Maritime', label: 'Seine-Maritime (76)' }
  ],
  'Nouvelle-Aquitaine': [
    { value: 'Charente', label: 'Charente (16)' },
    { value: 'Charente-Maritime', label: 'Charente-Maritime (17)' },
    { value: 'Corrèze', label: 'Corrèze (19)' },
    { value: 'Creuse', label: 'Creuse (23)' },
    { value: 'Dordogne', label: 'Dordogne (24)' },
    { value: 'Gironde', label: 'Gironde (33)' },
    { value: 'Landes', label: 'Landes (40)' },
    { value: 'Lot-et-Garonne', label: 'Lot-et-Garonne (47)' },
    { value: 'Pyrénées-Atlantiques', label: 'Pyrénées-Atlantiques (64)' },
    { value: 'Deux-Sèvres', label: 'Deux-Sèvres (79)' },
    { value: 'Vienne', label: 'Vienne (86)' },
    { value: 'Haute-Vienne', label: 'Haute-Vienne (87)' }
  ],
  'Occitanie': [
    { value: 'Ariège', label: 'Ariège (09)' },
    { value: 'Aude', label: 'Aude (11)' },
    { value: 'Aveyron', label: 'Aveyron (12)' },
    { value: 'Gard', label: 'Gard (30)' },
    { value: 'Haute-Garonne', label: 'Haute-Garonne (31)' },
    { value: 'Gers', label: 'Gers (32)' },
    { value: 'Hérault', label: 'Hérault (34)' },
    { value: 'Lot', label: 'Lot (46)' },
    { value: 'Lozère', label: 'Lozère (48)' },
    { value: 'Hautes-Pyrénées', label: 'Hautes-Pyrénées (65)' },
    { value: 'Pyrénées-Orientales', label: 'Pyrénées-Orientales (66)' },
    { value: 'Tarn', label: 'Tarn (81)' },
    { value: 'Tarn-et-Garonne', label: 'Tarn-et-Garonne (82)' }
  ],
  'Pays de la Loire': [
    { value: 'Loire-Atlantique', label: 'Loire-Atlantique (44)' },
    { value: 'Maine-et-Loire', label: 'Maine-et-Loire (49)' },
    { value: 'Mayenne', label: 'Mayenne (53)' },
    { value: 'Sarthe', label: 'Sarthe (72)' },
    { value: 'Vendée', label: 'Vendée (85)' }
  ],
  'Provence-Alpes-Côte d\'Azur': [
    { value: 'Alpes-de-Haute-Provence', label: 'Alpes-de-Haute-Provence (04)' },
    { value: 'Hautes-Alpes', label: 'Hautes-Alpes (05)' },
    { value: 'Alpes-Maritimes', label: 'Alpes-Maritimes (06)' },
    { value: 'Bouches-du-Rhône', label: 'Bouches-du-Rhône (13)' },
    { value: 'Var', label: 'Var (83)' },
    { value: 'Vaucluse', label: 'Vaucluse (84)' }
  ],
  'Guadeloupe': [
    { value: 'Guadeloupe', label: 'Guadeloupe (971)' }
  ],
  'Martinique': [
    { value: 'Martinique', label: 'Martinique (972)' }
  ],
  'Guyane': [
    { value: 'Guyane', label: 'Guyane (973)' }
  ],
  'La Réunion': [
    { value: 'La Réunion', label: 'La Réunion (974)' }
  ],
  'Mayotte': [
    { value: 'Mayotte', label: 'Mayotte (976)' }
  ]
};

export const BELGIUM_PROVINCES: Record<string, { value: string; label: string }[]> = {
  'Bruxelles-Capitale': [
    { value: 'Bruxelles', label: 'Bruxelles' }
  ],
  'Flandre': [
    { value: 'Anvers', label: 'Anvers' },
    { value: 'Brabant flamand', label: 'Brabant flamand' },
    { value: 'Flandre-Occidentale', label: 'Flandre-Occidentale' },
    { value: 'Flandre-Orientale', label: 'Flandre-Orientale' },
    { value: 'Limbourg', label: 'Limbourg' }
  ],
  'Wallonie': [
    { value: 'Brabant wallon', label: 'Brabant wallon' },
    { value: 'Hainaut', label: 'Hainaut' },
    { value: 'Liège', label: 'Liège' },
    { value: 'Luxembourg', label: 'Luxembourg' },
    { value: 'Namur', label: 'Namur' }
  ]
};

export const getRegionsForCountry = (country: string) => {
  switch (country) {
    case 'France':
      return FRANCE_REGIONS;
    case 'Belgique':
      return BELGIUM_REGIONS;
    case 'Suisse':
      return SWITZERLAND_CANTONS;
    default:
      return [];
  }
};

export const getDepartmentsForRegion = (country: string, region: string) => {
  if (country === 'France') {
    return FRANCE_DEPARTMENTS[region] || [];
  } else if (country === 'Belgique') {
    return BELGIUM_PROVINCES[region] || [];
  } else if (country === 'Suisse') {
    // For Switzerland, cantons are equivalent to both regions and departments
    return [];
  }
  return [];
};
