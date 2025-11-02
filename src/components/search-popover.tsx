'use client';

import { Search } from 'lucide-react';
import { memo } from 'react';

interface SearchPopoverProps {
  suggestions: string[];
  onSuggestionClick: (suggestion: string) => void;
}

export const SearchPopover = memo(function SearchPopover({ suggestions, onSuggestionClick }: SearchPopoverProps) {
  if (suggestions.length === 0) return null;

  return (
    <div className="py-2">
      <p className="px-4 pb-2 text-sm font-semibold text-muted-foreground">
        Suggestions
      </p>
      <div className="flex flex-col">
        {suggestions.map((suggestion, index) => (
          <button
            key={`${suggestion}-${index}`}
            onClick={() => onSuggestionClick(suggestion)}
            className="flex items-center gap-3 px-4 py-2 text-sm text-left hover:bg-accent transition-colors"
            type="button"
          >
            <Search className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <span className="truncate">{suggestion}</span>
          </button>
        ))}
      </div>
    </div>
  );
});
