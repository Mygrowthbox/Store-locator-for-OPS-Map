import { useState } from 'react';
import { Search, MapPin } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface SearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
  className?: string;
}

const SearchBar = ({ 
  onSearch, 
  placeholder = "Rechercher par adresse, ville ou code postal...",
  className 
}: SearchBarProps) => {
  const [query, setQuery] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(query.trim());
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuery = e.target.value;
    setQuery(newQuery);
    // Déclencher la recherche en temps réel
    onSearch(newQuery.trim());
  };

  return (
    <form onSubmit={handleSubmit} className={cn("relative flex items-center", className)}>
      <div className="relative flex-1">
        <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          type="text"
          value={query}
          onChange={handleInputChange}
          placeholder={placeholder}
          className="pl-10 pr-4 h-12 text-base border-2 border-border/50 focus:border-primary transition-colors"
        />
      </div>
      <Button
        type="submit"
        size="lg"
        className="ml-3 h-12 px-6 bg-gradient-to-r from-primary to-primary-glow hover:shadow-elegant transition-all duration-300"
      >
        <Search className="h-4 w-4 mr-2" />
        Rechercher
      </Button>
    </form>
  );
};

export default SearchBar;