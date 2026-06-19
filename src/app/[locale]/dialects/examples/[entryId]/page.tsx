'use client';

import { use, useState, useEffect } from 'react';
import { BookOpen, Languages, Filter, Volume2, Info, ChevronDown, ChevronUp } from 'lucide-react';

interface ExampleSentence {
  id: string;
  sentence: string;
  translation: string;
  englishTranslation?: string;
  dialect?: {
    id: string;
    name: string;
    code: string;
  };
  sourceReference?: string;
  context?: string;
}

export default function ExampleSentenceViewerPage({ params }: { params: Promise<{ entryId: string }> }) {
  const { entryId } = use(params);
  const [examples, setExamples] = useState<ExampleSentence[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDialect, setSelectedDialect] = useState<string | null>(null);
  const [expandedExamples, setExpandedExamples] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadExamples();
  }, [entryId, selectedDialect]);

  const loadExamples = async () => {
    setLoading(true);
    try {
      const url = selectedDialect
        ? `/api/dialects/examples/${entryId}?dialectId=${selectedDialect}`
        : `/api/dialects/examples/${entryId}`;
      
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setExamples(data.examples || []);
      }
    } catch (error) {
      console.error('Error loading examples:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = (exampleId: string) => {
    setExpandedExamples(prev => {
      const newSet = new Set(prev);
      if (newSet.has(exampleId)) {
        newSet.delete(exampleId);
      } else {
        newSet.add(exampleId);
      }
      return newSet;
    });
  };

  const playAudio = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'ckb';
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-teal-50 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 flex items-center justify-center gap-3">
            <BookOpen className="w-8 h-8" />
            Example Sentences
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Context-aware example sentences with dialect information
          </p>
        </div>

        {/* Dialect Filter */}
        <div className="max-w-3xl mx-auto mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
            <div className="flex items-center gap-2 mb-3">
              <Filter className="w-5 h-5 text-gray-500" />
              <h3 className="font-semibold text-gray-900 dark:text-white">Filter by Dialect</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedDialect(null)}
                className={`px-3 py-1 rounded-full text-sm ${
                  selectedDialect === null
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                }`}
              >
                All Dialects
              </button>
              <button
                onClick={() => setSelectedDialect('ckb')}
                className={`px-3 py-1 rounded-full text-sm ${
                  selectedDialect === 'ckb'
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                }`}
              >
                Central Kurdish (Sorani)
              </button>
              <button
                onClick={() => setSelectedDialect('kmr')}
                className={`px-3 py-1 rounded-full text-sm ${
                  selectedDialect === 'kmr'
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                }`}
              >
                Northern Kurdish (Kurmanji)
              </button>
              <button
                onClick={() => setSelectedDialect('sdh')}
                className={`px-3 py-1 rounded-full text-sm ${
                  selectedDialect === 'sdh'
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                }`}
              >
                Southern Kurdish
              </button>
            </div>
          </div>
        </div>

        {/* Examples List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto"></div>
          </div>
        ) : examples.length === 0 ? (
          <div className="max-w-3xl mx-auto text-center py-12">
            <BookOpen className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600 dark:text-gray-300">
              No example sentences found
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              Try selecting a different dialect or check back later
            </p>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto space-y-4">
            {examples.map((example) => (
              <ExampleSentenceCard
                key={example.id}
                example={example}
                isExpanded={expandedExamples.has(example.id)}
                onToggleExpand={() => toggleExpand(example.id)}
                onPlayAudio={() => playAudio(example.sentence)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ExampleSentenceCard({
  example,
  isExpanded,
  onToggleExpand,
  onPlayAudio,
}: {
  example: ExampleSentence;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onPlayAudio: () => void;
}) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
      {/* Main Content */}
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            {/* Kurdish Sentence */}
            <div className="mb-3">
              <p className="text-2xl font-bold text-gray-900 dark:text-white mb-2" dir="rtl">
                {example.sentence}
              </p>
              <button
                onClick={onPlayAudio}
                className="inline-flex items-center gap-1 text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300 text-sm"
              >
                <Volume2 className="w-4 h-4" />
                Listen
              </button>
            </div>

            {/* Persian Translation */}
            <div className="mb-2">
              <p className="text-gray-700 dark:text-gray-300">
                {example.translation}
              </p>
            </div>

            {/* English Translation */}
            {example.englishTranslation && (
              <div className="mb-2">
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  {example.englishTranslation}
                </p>
              </div>
            )}

            {/* Dialect Badge */}
            {example.dialect && (
              <div className="flex items-center gap-2 mb-2">
                <Languages className="w-4 h-4 text-green-500" />
                <span className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full text-xs">
                  {example.dialect.name}
                </span>
              </div>
            )}
          </div>

          {/* Expand Button */}
          <button
            onClick={onToggleExpand}
            className="ml-4 p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
          >
            {isExpanded ? (
              <ChevronUp className="w-5 h-5" />
            ) : (
              <ChevronDown className="w-5 h-5" />
            )}
          </button>
        </div>

        {/* Expanded Content */}
        {isExpanded && (
          <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4 space-y-3">
            {/* Context */}
            {example.context && (
              <div className="flex items-start gap-2">
                <Info className="w-4 h-4 text-blue-500 mt-1 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Context
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {example.context}
                  </p>
                </div>
              </div>
            )}

            {/* Source Reference */}
            {example.sourceReference && (
              <div className="flex items-start gap-2">
                <BookOpen className="w-4 h-4 text-purple-500 mt-1 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Source
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {example.sourceReference}
                  </p>
                </div>
              </div>
            )}

            {/* Linguistic Notes */}
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Linguistic Notes
              </p>
              <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                <li>• Sentence demonstrates natural usage in {example.dialect?.name || 'Kurdish'}</li>
                <li>• Contains common grammatical structures</li>
                <li>• Suitable for intermediate learners</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
