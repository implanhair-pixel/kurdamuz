'use client';

import { useState, useEffect } from 'react';
import { Search, BookOpen, Volume2, Languages, ArrowLeft, ArrowRight, Info } from 'lucide-react';
import type { DictionaryEntry } from '@/types/dialects';

export default function DictionaryModePage() {
  const [query, setQuery] = useState('');
  const [entry, setEntry] = useState<DictionaryEntry | null>(null);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  const handleSearch = async () => {
    if (!query.trim()) return;
    
    setLoading(true);
    try {
      const response = await fetch(`/api/dialects/dictionary/${encodeURIComponent(query)}`);
      if (response.ok) {
        const data = await response.json();
        setEntry(data.entry);
        
        // Add to history if not already present
        if (!history.includes(query)) {
          setHistory(prev => [query, ...prev.slice(0, 9)]);
        }
      }
    } catch (error) {
      console.error('Error fetching dictionary entry:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const navigateHistory = (direction: 'back' | 'forward') => {
    if (direction === 'back' && historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setQuery(history[newIndex]);
      handleSearch();
    } else if (direction === 'forward' && historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setQuery(history[newIndex]);
      handleSearch();
    }
  };

  const playAudio = (word: string) => {
    // Text-to-speech for pronunciation
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(word);
      utterance.lang = 'ckb'; // Central Kurdish
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2 flex items-center justify-center gap-3">
            <BookOpen className="w-10 h-10" />
            Dictionary Mode
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Comprehensive lexical dictionary with dialect variations
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
              placeholder="Enter a Kurdish word..."
              className="w-full pl-12 pr-20 py-4 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            />
            <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex gap-1">
              <button
                onClick={() => navigateHistory('back')}
                disabled={historyIndex >= history.length - 1}
                aria-label="Previous search"
                className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 disabled:opacity-30"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <button
                onClick={() => navigateHistory('forward')}
                disabled={historyIndex <= 0}
                aria-label="Next search"
                className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 disabled:opacity-30"
              >
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Search Button */}
        <div className="max-w-3xl mx-auto mb-8">
          <button
            onClick={handleSearch}
            disabled={loading}
            className="w-full bg-amber-500 hover:bg-amber-600 disabled:bg-gray-400 text-white font-medium py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Searching...
              </>
            ) : (
              <>
                <Search className="w-5 h-5" />
                Look Up
              </>
            )}
          </button>
        </div>

        {/* Dictionary Entry */}
        {entry && (
          <div className="max-w-4xl mx-auto">
            <DictionaryEntryCard entry={entry} onPlayAudio={playAudio} />
          </div>
        )}

        {entry === null && query && !loading && (
          <div className="max-w-3xl mx-auto text-center py-12">
            <BookOpen className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600 dark:text-gray-300">
              No dictionary entry found for "{query}"
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              Try a different spelling or check if the word exists in our database
            </p>
          </div>
        )}

        {/* Quick History */}
        {history.length > 0 && (
          <div className="max-w-3xl mx-auto mt-8">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Recent Searches</h3>
            <div className="flex flex-wrap gap-2">
              {history.map((word, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setQuery(word);
                    setHistoryIndex(index);
                    handleSearch();
                  }}
                  className={`px-3 py-1 rounded-full text-sm ${
                    index === historyIndex
                      ? 'bg-amber-500 text-white'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                  }`}
                >
                  {word}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function DictionaryEntryCard({ entry, onPlayAudio }: { entry: DictionaryEntry; onPlayAudio: (word: string) => void }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-6 text-white">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-4xl font-bold mb-2">{entry.lemma}</h2>
            {entry.normalizedForm && (
              <p className="text-amber-100 mb-1">Normalized: {entry.normalizedForm}</p>
            )}
            {entry.pronunciation && (
              <div className="flex items-center gap-2 text-amber-100">
                <Volume2 className="w-4 h-4" />
                <span className="text-lg">[{entry.pronunciation}]</span>
                <button
                  onClick={() => onPlayAudio(entry.lemma)}
                  className="ml-2 p-1 hover:bg-amber-600 rounded"
                >
                  <Volume2 className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
          {entry.partOfSpeech && (
            <span className="px-4 py-2 bg-white/20 rounded-full text-white font-medium">
              {entry.partOfSpeech}
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-6">
        {/* Meanings */}
        <section>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
            <BookOpen className="w-5 h-5" />
            Definitions
          </h3>
          <div className="space-y-3">
            {entry.meanings.map((meaning, index) => (
              <div key={meaning.id} className="flex gap-3">
                <span className="text-amber-600 dark:text-amber-400 font-bold min-w-[2rem]">
                  {index + 1}.
                </span>
                <div>
                  <p className="text-gray-900 dark:text-white">{meaning.definition}</p>
                  {meaning.semanticDomain && (
                    <span className="inline-block mt-1 px-2 py-0.5 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded text-xs">
                      {meaning.semanticDomain}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Dialect Variants */}
        {entry.dialectVariants.length > 0 && (
          <section>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <Languages className="w-5 h-5" />
              Dialect Variations
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {entry.dialectVariants.map((variant) => (
                <div key={variant.id} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-gray-900 dark:text-white">
                      {variant.variantForm}
                    </span>
                    {variant.phoneticForm && (
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        [{variant.phoneticForm}]
                      </span>
                    )}
                  </div>
                  {variant.usageFrequency && (
                    <span className={`inline-block px-2 py-0.5 rounded text-xs ${
                      variant.usageFrequency === 'common' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                      variant.usageFrequency === 'uncommon' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                      variant.usageFrequency === 'rare' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' :
                      'bg-gray-100 text-gray-800 dark:bg-gray-600 dark:text-gray-200'
                    }`}>
                      {variant.usageFrequency}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Example Sentences */}
        {entry.exampleSentences.length > 0 && (
          <section>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <Info className="w-5 h-5" />
              Example Sentences
            </h3>
            <div className="space-y-3">
              {entry.exampleSentences.map((example, index) => (
                <div key={index} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <p className="text-lg text-gray-900 dark:text-white mb-2" dir="rtl">
                    {example.sentence}
                  </p>
                  <p className="text-gray-600 dark:text-gray-300 mb-1">
                    {example.translation}
                  </p>
                  {example.dialect && (
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      Dialect: {example.dialect.name}
                    </span>
                  )}
                  {example.sourceReference && (
                    <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                      Source: {example.sourceReference}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Etymology */}
        {entry.etymology && (
          <section>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Etymology</h3>
            <p className="text-gray-700 dark:text-gray-300">{entry.etymology}</p>
          </section>
        )}

        {/* Root Form */}
        {entry.rootForm && (
          <section>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Root Form</h3>
            <p className="text-gray-700 dark:text-gray-300">{entry.rootForm}</p>
          </section>
        )}

        {/* Linguistic Annotations */}
        {entry.annotations.length > 0 && (
          <section>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Linguistic Notes</h3>
            <div className="space-y-2">
              {entry.annotations.map((annotation) => (
                <div key={annotation.id} className="p-3 bg-purple-50 dark:bg-purple-900/30 rounded-lg">
                  <span className="font-medium text-purple-800 dark:text-purple-200 capitalize">
                    {annotation.annotationType}:
                  </span>
                  <span className="ml-2 text-gray-700 dark:text-gray-300">
                    {JSON.stringify(annotation.annotationData)}
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Related Terms */}
        {entry.relatedTerms.length > 0 && (
          <section>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Related Terms</h3>
            <div className="flex flex-wrap gap-2">
              {entry.relatedTerms.map((relation) => (
                <span
                  key={relation.id}
                  className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-sm"
                >
                  {relation.relationshipType}
                </span>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
