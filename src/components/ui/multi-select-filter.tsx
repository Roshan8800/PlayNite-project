'use client';

import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { ChevronDown, X } from 'lucide-react';

interface MultiSelectFilterProps {
  label: string;
  options: string[];
  selected: string[];
  onChange: (selected: string[]) => void;
  placeholder?: string;
  maxDisplay?: number;
}

export function MultiSelectFilter({
  label,
  options,
  selected,
  onChange,
  placeholder = 'Select options...',
  maxDisplay = 3,
}: MultiSelectFilterProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const filteredOptions = options.filter(option =>
    option.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelect = (option: string) => {
    if (selected.includes(option)) {
      onChange(selected.filter(item => item !== option));
    } else {
      onChange([...selected, option]);
    }
  };

  const handleRemove = (option: string) => {
    onChange(selected.filter(item => item !== option));
  };

  const handleClearAll = () => {
    onChange([]);
  };

  const displaySelected = selected.slice(0, maxDisplay);
  const remainingCount = selected.length - maxDisplay;

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={isOpen}
            className="w-full justify-between"
          >
            <div className="flex flex-wrap gap-1">
              {selected.length === 0 ? (
                <span className="text-muted-foreground">{placeholder}</span>
              ) : (
                <>
                  {displaySelected.map(option => (
                    <Badge
                      key={option}
                      variant="secondary"
                      className="text-xs"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemove(option);
                      }}
                    >
                      {option}
                      <X className="ml-1 h-3 w-3" />
                    </Badge>
                  ))}
                  {remainingCount > 0 && (
                    <Badge variant="secondary" className="text-xs">
                      +{remainingCount} more
                    </Badge>
                  )}
                </>
              )}
            </div>
            <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="start">
          <div className="p-2">
            <Input
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="mb-2"
            />
            {selected.length > 0 && (
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">
                  {selected.length} selected
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClearAll}
                  className="h-auto p-1 text-xs"
                >
                  Clear all
                </Button>
              </div>
            )}
          </div>
          <Separator />
          <ScrollArea className="h-48">
            <div className="p-2">
              {filteredOptions.length === 0 ? (
                <div className="text-center text-sm text-muted-foreground py-4">
                  No options found
                </div>
              ) : (
                filteredOptions.map(option => (
                  <div
                    key={option}
                    className="flex items-center space-x-2 p-2 hover:bg-accent rounded-sm cursor-pointer"
                    onClick={() => handleSelect(option)}
                  >
                    <Checkbox
                      checked={selected.includes(option)}
                      onChange={() => handleSelect(option)}
                    />
                    <Label className="text-sm font-normal cursor-pointer">
                      {option}
                    </Label>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </PopoverContent>
      </Popover>
    </div>
  );
}