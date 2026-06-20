'use client';

import { useState, useEffect } from 'react';
import { Search, Filter, BookOpen, Languages, ArrowRight } from 'lucide-react';
import type { DialectSearchParams, SearchResult, DialectFilterOptions } from '@/types/dialects';

export default function DialectSearchPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filterOptions, setFilterOptions] = useState<DialectFilterOptions | null>(null);
  const [selectedFilters, setSelectedFilters] = useState<DialectSearchParams>({
    limit: 20,
    offset: 0,
  });

  useEffect(() => {
    // Load filter options on mount
    loadFilterOptions();
  }, []);

  const loadFilterOptions = async () => {
    try {
      const response = await fetch('/api/dialects/filters/options');
      if (response.ok) {
        const options = await response.json();
        setFilterOptions(options);
      }
    } catch (error) {
      console.error('Error loading filter options:', error);
    }
  };

  const handleSearch = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/dialects/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query,
          ...selectedFilters,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setResults(data.results || []);
      }
    } catch (error) {
      console.error('Error searching:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const toggleFilter = (filterType: string, value: string) => {
    setSelectedFilters(prev => {
      const current = prev[filterType as keyof DialectSearchParams] as string[] || [];
      const updated = current.includes(value)
        ? current.filter(v => v !== value)
        : [...current, value];
      return {
        ...prev,
        [filterType]: updated,
      };
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Dialect Comparison Platform
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Search and compare Kurdish vocabulary across dialects
          </p>
        </div>

        {/* Search Bar */}
        <div className="max-w-3xl mx-auto mb-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Search for Kurdish words..."
              aria-label="Search for Kurdish words"
              className="w-full pl-12 pr-4 py-4 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            >
              <Filter className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && filterOptions && (
          <div className="max-w-3xl mx-auto mb-6 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Filters</h3>
            
            {/* Dialect Filter */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Dialects
              </label>
              <div className="flex flex-wrap gap-2">
                {filterOptions.dialects.map((dialect) => (
                  <button
                    key={dialect.id}
                    onClick={() => toggleFilter('dialectIds', dialect.id)}
                    className={`px-3 py-1 rounded-full text-sm ${
                      (selectedFilters.dialectIds || []).includes(dialect.id)
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    {dialect.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Part of Speech Filter */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Part of Speech
              </label>
              <div className="flex flex-wrap gap-2">
                {filterOptions.partsOfSpeech.map((pos) => (
                  <button
                    key={pos}
                    onClick={() => toggleFilter('partsOfSpeech', pos)}
                    className={`px-3 py-1 rounded-full text-sm ${
                      (selectedFilters.partsOfSpeech || []).includes(pos)
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    {pos}
                  </button>
                ))}
              </div>
            </div>

            {/* Difficulty Level Filter */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Difficulty Level
              </label>
              <div className="flex flex-wrap gap-2">
                {filterOptions.difficultyLevels.map((level) => (
                  <button
                    key={level}
                    onClick={() => toggleFilter('difficultyLevels', level)}
                    className={`px-3 py-1 rounded-full text-sm ${
                      (selectedFilters.difficultyLevels || []).includes(level)
                        ? 'bg-purple-500 text-white'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>

            {/* Semantic Domain Filter */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Semantic Domain
              </label>
              <div className="flex flex-wrap gap-2">
                {filterOptions.semanticDomains.map((domain) => (
                  <button
                    key={domain}
                    onClick={() => toggleFilter('semanticDomains', domain)}
                    className={`px-3 py-1 rounded-full text-sm ${
                      (selectedFilters.semanticDomains || []).includes(domain)
                        ? 'bg-orange-500 text-white'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    {domain}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleSearch}
              className="w-full mt-4 bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              Apply Filters
            </button>
          </div>
        )}

        {/* Search Button */}
        <div className="max-w-3xl mx-auto mb-8">
          <button
            onClick={handleSearch}
            disabled={loading}
            className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white font-medium py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Searching...
              </>
            ) : (
              <>
                <Search className="w-5 h-5" />
                Search
              </>
            )}
          </button>
        </div>

        {/* Results */}
        {results.length > 0 && (
          <div className="max-w-4xl mx-auto">
            <div className="mb-4 text-gray-600 dark:text-gray-300">
              Found {results.length} results
            </div>
            <div className="space-y-4">
              {results.map((result) => (
                <SearchResultCard key={result.entryId} result={result} />
              ))}
            </div>
          </div>
        )}

        {results.length === 0 && !loading && query && (
          <div className="max-w-3xl mx-auto text-center py-12">
            <BookOpen className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600 dark:text-gray-300">
              No results found for "{query}"
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              Try adjusting your search terms or filters
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function SearchResultCard({ result }: { result: SearchResult }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
            {result.kurdishWord}
          </h3>
          {result.normalizedForm && (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Normalized: {result.normalizedForm}
            </p>
          )}
        </div>
        <div className="flex gap-2">
          {result.dialects.map((dialect) => (
            <span
              key={dialect.id}
              className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm"
            >
              {dialect.name}
            </span>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Persian</p>
          <p className="text-gray-900 dark:text-white">{result.persianTranslation}</p>
        </div>
        {result.englishTranslation && (
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">English</p>
            <p className="text-gray-900 dark:text-white">{result.englishTranslation}</p>
          </div>
        )}
      </div>

      {result.partOfSpeech && (
        <div className="mb-4">
          <span className="inline-block px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded text-sm">
            {result.partOfSpeech}
          </span>
        </div>
      )}

      {result.variants.length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
            <Languages className="w-4 h-4" />
            Dialect Variants
          </h4>
          <div className="flex flex-wrap gap-2">
            {result.variants.map((variant) => (
              <span
                key={variant.id}
                className="px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded-full text-sm"
              >
                {variant.variantForm}
              </span>
            ))}
          </div>
        </div>
      )}

      {result.meanings.length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
            <BookOpen className="w-4 h-4" />
            Meanings
          </h4>
          <ul className="list-disc list-inside space-y-1">
            {result.meanings.map((meaning) => (
              <li key={meaning.id} className="text-gray-700 dark:text-gray-300">
                {meaning.definition}
              </li>
            ))}
          </ul>
        </div>
      )}

      <button className="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 flex items-center gap-2 text-sm font-medium">
        View Details <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );
}
