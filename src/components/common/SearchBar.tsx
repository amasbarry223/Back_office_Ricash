'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Search, X, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface FilterOption {
  value: string;
  label: string;
}

interface FilterConfig {
  key: string;
  label: string;
  type: 'select' | 'date' | 'range';
  options?: FilterOption[];
}

interface SearchBarProps {
  placeholder?: string;
  filters?: FilterConfig[];
  onSearch: (query: string, activeFilters: Record<string, unknown>) => void;
}

export default function SearchBar({
  placeholder = 'Rechercher…',
  filters = [],
  onSearch,
}: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [activeFilters, setActiveFilters] = useState<Record<string, unknown>>({});
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Debounced search trigger
  const debouncedSearch = useCallback(
    (q: string, f: Record<string, unknown>) => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        onSearch(q, f);
      }, 250);
    },
    [onSearch],
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  const handleQueryChange = useCallback(
    (value: string) => {
      setQuery(value);
      debouncedSearch(value, activeFilters);
    },
    [activeFilters, debouncedSearch],
  );

  const handleFilterChange = useCallback(
    (key: string, value: string) => {
      const newFilters = { ...activeFilters };
      if (value && value !== '__none__') {
        newFilters[key] = value;
      } else {
        delete newFilters[key];
      }
      setActiveFilters(newFilters);
      // Filter changes are immediate (no debounce)
      onSearch(query, newFilters);
    },
    [activeFilters, query, onSearch],
  );

  const removeFilter = useCallback(
    (key: string) => {
      const newFilters = { ...activeFilters };
      delete newFilters[key];
      setActiveFilters(newFilters);
      onSearch(query, newFilters);
    },
    [activeFilters, query, onSearch],
  );

  const clearAll = useCallback(() => {
    setQuery('');
    setActiveFilters({});
    if (debounceRef.current) clearTimeout(debounceRef.current);
    onSearch('', {});
  }, [onSearch]);

  const getFilterLabel = (key: string): string => {
    const filter = filters.find((f) => f.key === key);
    if (!filter) return key;
    if (filter.type === 'select' && filter.options) {
      const option = filter.options.find((o) => o.value === activeFilters[key]);
      return option?.label ?? String(activeFilters[key]);
    }
    return String(activeFilters[key]);
  };

  const getSelectPlaceholder = (filter: FilterConfig): string => {
    switch (filter.key) {
      case 'status':
        return 'Filtrer par statut…';
      case 'country':
        return 'Choisir un pays…';
      case 'type':
        return 'Filtrer par type…';
      case 'channel':
        return 'Filtrer par canal…';
      case 'operator':
        return 'Choisir un opérateur…';
      default:
        return `Filtrer par ${filter.label.toLowerCase()}…`;
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
        {/* Search input */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder={placeholder}
            value={query}
            onChange={(e) => handleQueryChange(e.target.value)}
            className="pl-9 h-9"
          />
          {query && (
            <button
              onClick={() => handleQueryChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="size-3.5" />
            </button>
          )}
        </div>

        {/* Filter selects */}
        {filters.map((filter) => (
          <div key={filter.key} className="min-w-[160px]">
            {filter.type === 'select' && filter.options ? (
              <Select
                value={(activeFilters[filter.key] as string) ?? ''}
                onValueChange={(val) => handleFilterChange(filter.key, val)}
              >
                <SelectTrigger className="h-9 w-full">
                  <SelectValue placeholder={getSelectPlaceholder(filter)} />
                </SelectTrigger>
                <SelectContent>
                  {filter.options.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : filter.type === 'date' ? (
              <Input
                type="date"
                value={(activeFilters[filter.key] as string) ?? ''}
                onChange={(e) => handleFilterChange(filter.key, e.target.value)}
                placeholder={getSelectPlaceholder(filter)}
                className="h-9"
              />
            ) : null}
          </div>
        ))}

        {/* Clear all button */}
        {(query || Object.keys(activeFilters).length > 0) && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAll}
            className="text-muted-foreground hover:text-foreground text-xs h-9"
          >
            <X className="size-3.5 mr-1" />
            Réinitialiser
          </Button>
        )}
      </div>

      {/* Active filter badges */}
      {Object.keys(activeFilters).length > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          <Filter className="size-3.5 text-muted-foreground" />
          {Object.entries(activeFilters).map(([key, value]) => {
            const filterConfig = filters.find((f) => f.key === key);
            return (
              <Badge
                key={key}
                variant="secondary"
                className="text-xs gap-1 py-0.5 pr-1"
              >
                <span className="text-muted-foreground">{filterConfig?.label ?? key}:</span>
                <span>{getFilterLabel(key)}</span>
                <button
                  onClick={() => removeFilter(key)}
                  className="ml-0.5 hover:text-foreground text-muted-foreground"
                >
                  <X className="size-3" />
                </button>
              </Badge>
            );
          })}
        </div>
      )}
    </div>
  );
}
