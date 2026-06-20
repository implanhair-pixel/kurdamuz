'use client';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Filter, X, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';

interface VocabularyFiltersProps {
  dialects?: Array<{ id: string; name: string; code: string }>;
  categories?: Array<{ id: string; name: string; slug: string }>;
  tags?: Array<{ id: string; name: string; slug: string }>;
  selectedDialects?: string[];
  selectedCategories?: string[];
  selectedTags?: string[];
  selectedDifficulty?: string[];
  onDialectToggle?: (id: string) => void;
  onCategoryToggle?: (id: string) => void;
  onTagToggle?: (id: string) => void;
  onDifficultyToggle?: (level: string) => void;
  onClearAll?: () => void;
}

const DIFFICULTY_LEVELS = ['beginner', 'elementary', 'intermediate', 'advanced'];

export function VocabularyFilters({
  dialects = [],
  categories = [],
  tags = [],
  selectedDialects = [],
  selectedCategories = [],
  selectedTags = [],
  selectedDifficulty = [],
  onDialectToggle,
  onCategoryToggle,
  onTagToggle,
  onDifficultyToggle,
  onClearAll,
}: VocabularyFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<'dialects' | 'categories' | 'tags' | 'difficulty' | null>(null);

  const hasActiveFilters =
    selectedDialects.length > 0 ||
    selectedCategories.length > 0 ||
    selectedTags.length > 0 ||
    selectedDifficulty.length > 0;

  const toggleSection = (section: 'dialects' | 'categories' | 'tags' | 'difficulty') => {
    setActiveSection(activeSection === section ? null : section);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2"
        >
          <Filter className="h-4 w-4" />
          Filters
          {hasActiveFilters && (
            <Badge variant="primary" className="ml-2">
              {selectedDialects.length + selectedCategories.length + selectedTags.length + selectedDifficulty.length}
            </Badge>
          )}
          {isOpen ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </Button>

        {hasActiveFilters && onClearAll && (
          <Button variant="ghost" size="sm" onClick={onClearAll}>
            <X className="h-4 w-4 mr-2" />
            Clear All
          </Button>
        )}
      </div>

      {isOpen && (
        <div className="space-y-4 border rounded-lg p-4 bg-white">
          {/* Dialects */}
          {dialects.length > 0 && (
            <div>
              <button
                onClick={() => toggleSection('dialects')}
                className="flex items-center justify-between w-full text-left font-medium mb-2"
              >
                Dialects
                {activeSection === 'dialects' ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </button>
              {activeSection === 'dialects' && (
                <div className="flex flex-wrap gap-2">
                  {dialects.map((dialect) => (
                    <Badge
                      key={dialect.id}
                      variant={selectedDialects.includes(dialect.id) ? 'primary' : 'default'}
                      className="cursor-pointer"
                      onClick={() => onDialectToggle?.(dialect.id)}
                    >
                      {dialect.name}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Categories */}
          {categories.length > 0 && (
            <div>
              <button
                onClick={() => toggleSection('categories')}
                className="flex items-center justify-between w-full text-left font-medium mb-2"
              >
                Categories
                {activeSection === 'categories' ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </button>
              {activeSection === 'categories' && (
                <div className="flex flex-wrap gap-2">
                  {categories.map((category) => (
                    <Badge
                      key={category.id}
                      variant={selectedCategories.includes(category.id) ? 'primary' : 'default'}
                      className="cursor-pointer"
                      onClick={() => onCategoryToggle?.(category.id)}
                    >
                      {category.name}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Tags */}
          {tags.length > 0 && (
            <div>
              <button
                onClick={() => toggleSection('tags')}
                className="flex items-center justify-between w-full text-left font-medium mb-2"
              >
                Tags
                {activeSection === 'tags' ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </button>
              {activeSection === 'tags' && (
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <Badge
                      key={tag.id}
                      variant={selectedTags.includes(tag.id) ? 'primary' : 'secondary'}
                      className="cursor-pointer"
                      onClick={() => onTagToggle?.(tag.id)}
                    >
                      {tag.name}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Difficulty */}
          <div>
            <button
              onClick={() => toggleSection('difficulty')}
              className="flex items-center justify-between w-full text-left font-medium mb-2"
            >
              Difficulty Level
              {activeSection === 'difficulty' ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </button>
            {activeSection === 'difficulty' && (
              <div className="flex flex-wrap gap-2">
                {DIFFICULTY_LEVELS.map((level) => (
                  <Badge
                    key={level}
                    variant={selectedDifficulty.includes(level) ? 'primary' : 'default'}
                    className="cursor-pointer capitalize"
                    onClick={() => onDifficultyToggle?.(level)}
                  >
                    {level}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
