'use client';

import { Search } from 'lucide-react';

interface SearchPopoverProps {
  suggestions: string[];
  onSuggestionClick: (suggestion: string) => void;
}

export function SearchPopover({ suggestions, onSuggestionClick }: SearchPopoverProps) {
  return (
    <div className="py-2">
      <p className="px-4 pb-2 text-sm font-semibold text-muted-foreground">
        Suggestions
      </p>
      <div className="flex flex-col">
        {suggestions.map((suggestion, index) => (
          <button
            key={index}
            onClick={() => onSuggestionClick(suggestion)}
            className="flex items-center gap-3 px-4 py-2 text-sm text-left hover:bg-accent"
          >
            <Search className="h-4 w-4 text-muted-foreground" />
            <span>{suggestion}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
