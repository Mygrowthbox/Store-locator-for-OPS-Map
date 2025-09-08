import { Filter, X, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command';
import { MapFilters } from '@/types/shop';

interface FilterPanelProps {
  filters: MapFilters;
  categories: string[];
  departments: string[];
  countries: string[];
  regions: string[];
  onFilterChange: (filters: MapFilters) => void;
  resultsCount?: number;
}

const FilterPanel = ({ 
  filters, 
  categories, 
  departments, 
  countries,
  regions,
  onFilterChange, 
  resultsCount 
}: FilterPanelProps) => {
  const hasActiveFilters = filters.categories.length > 0 || filters.departments.length > 0 || 
    filters.countries.length > 0 || filters.regions.length > 0 || filters.searchQuery;

  const clearFilters = () => {
    onFilterChange({
      categories: [],
      departments: [],
      countries: [],
      regions: [],
      searchQuery: ''
    });
  };

  const toggleMultiSelect = (key: keyof MapFilters, value: string) => {
    if (key === 'searchQuery') return;
    
    const currentValues = filters[key] as string[];
    const newValues = currentValues.includes(value)
      ? currentValues.filter(v => v !== value)
      : [...currentValues, value];
    
    onFilterChange({
      ...filters,
      [key]: newValues
    });
  };

  const MultiSelectFilter = ({ 
    label, 
    options, 
    selectedValues, 
    filterKey,
    placeholder 
  }: {
    label: string;
    options: string[];
    selectedValues: string[];
    filterKey: keyof MapFilters;
    placeholder: string;
  }) => (
    <div>
      <label className="text-sm font-medium mb-2 block">{label}</label>
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" className="w-full justify-start text-left font-normal">
            {selectedValues.length > 0 
              ? `${selectedValues.length} sélectionné${selectedValues.length > 1 ? 's' : ''}`
              : placeholder
            }
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="start">
          <Command>
            <CommandInput placeholder={`Rechercher ${label.toLowerCase()}...`} />
            <CommandEmpty>Aucun résultat trouvé.</CommandEmpty>
            <CommandGroup className="max-h-64 overflow-auto">
              {options.sort().map((option) => (
                <CommandItem
                  key={option}
                  onSelect={() => toggleMultiSelect(filterKey, option)}
                  className="cursor-pointer"
                >
                  <Check
                    className={`mr-2 h-4 w-4 ${
                      selectedValues.includes(option) ? "opacity-100" : "opacity-0"
                    }`}
                  />
                  {option}
                </CommandItem>
              ))}
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );

  return (
    <Card className="p-6 shadow-card">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Filter className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">Filtres</h3>
          {resultsCount !== undefined && (
            <Badge variant="secondary" className="ml-2">
              {resultsCount} résultat{resultsCount !== 1 ? 's' : ''}
            </Badge>
          )}
        </div>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4 mr-1" />
            Effacer
          </Button>
        )}
      </div>

      <div className="space-y-4">
        <MultiSelectFilter
          label="Pays"
          options={countries}
          selectedValues={filters.countries}
          filterKey="countries"
          placeholder="Tous les pays"
        />

        <MultiSelectFilter
          label="Départements"
          options={departments}
          selectedValues={filters.departments}
          filterKey="departments"
          placeholder="Tous les départements"
        />

        <MultiSelectFilter
          label="Régions"
          options={regions}
          selectedValues={filters.regions}
          filterKey="regions"
          placeholder="Toutes les régions"
        />

        <MultiSelectFilter
          label="Catégories"
          options={categories}
          selectedValues={filters.categories}
          filterKey="categories"
          placeholder="Toutes les catégories"
        />
      </div>

      {hasActiveFilters && (
        <div className="mt-6 pt-4 border-t">
          <div className="flex flex-wrap gap-2">
            {filters.countries.map(country => (
              <Badge key={country} variant="outline" className="bg-primary/10 text-primary border-primary/20">
                Pays: {country}
                <X 
                  className="h-3 w-3 ml-1 cursor-pointer" 
                  onClick={() => toggleMultiSelect('countries', country)}
                />
              </Badge>
            ))}
            {filters.departments.map(department => (
              <Badge key={department} variant="outline" className="bg-secondary/10 text-secondary border-secondary/20">
                Département: {department}
                <X 
                  className="h-3 w-3 ml-1 cursor-pointer" 
                  onClick={() => toggleMultiSelect('departments', department)}
                />
              </Badge>
            ))}
            {filters.regions.map(region => (
              <Badge key={region} variant="outline" className="bg-accent/10 text-accent-foreground border-accent/20">
                Région: {region}
                <X 
                  className="h-3 w-3 ml-1 cursor-pointer" 
                  onClick={() => toggleMultiSelect('regions', region)}
                />
              </Badge>
            ))}
            {filters.categories.map(category => (
              <Badge key={category} variant="outline" className="bg-muted/50 text-muted-foreground border-muted/50">
                Catégorie: {category}
                <X 
                  className="h-3 w-3 ml-1 cursor-pointer" 
                  onClick={() => toggleMultiSelect('categories', category)}
                />
              </Badge>
            ))}
            {filters.searchQuery && (
              <Badge variant="outline" className="bg-muted/50 text-muted-foreground border-muted/50">
                Recherche: {filters.searchQuery}
                <X 
                  className="h-3 w-3 ml-1 cursor-pointer" 
                  onClick={() => onFilterChange({ ...filters, searchQuery: '' })}
                />
              </Badge>
            )}
          </div>
        </div>
      )}
    </Card>
  );
};

export default FilterPanel;