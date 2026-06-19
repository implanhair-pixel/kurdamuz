'use client';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Volume2, Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';

interface ReviewCardProps {
  vocabulary: {
    id: string;
    kurdishWord: string;
    persianTranslation: string;
    englishTranslation?: string;
    pronunciation?: string;
    examples?: Array<{
      kurdishSentence: string;
      persianTranslation: string;
      englishTranslation: string;
    }>;
  };
  showAnswer?: boolean;
  onReveal?: () => void;
  onRate?: (quality: number) => void;
  onPlayAudio?: () => void;
}

const REVIEW_QUALITY_LABELS = [
  { value: 0, label: 'Failed', color: 'bg-red-600' },
  { value: 1, label: 'Hard', color: 'bg-orange-500' },
  { value: 2, label: 'Okay', color: 'bg-yellow-500' },
  { value: 3, label: 'Good', color: 'bg-green-500' },
  { value: 4, label: 'Easy', color: 'bg-blue-500' },
  { value: 5, label: 'Perfect', color: 'bg-purple-500' },
];

export function ReviewCard({
  vocabulary,
  showAnswer = false,
  onReveal,
  onRate,
  onPlayAudio,
}: ReviewCardProps) {
  const [showTranslation, setShowTranslation] = useState(false);

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="text-center pb-4">
        <div className="space-y-4">
          <div>
            <h2 className="text-4xl font-bold mb-2" dir="rtl">
              {vocabulary.kurdishWord}
            </h2>
            {vocabulary.pronunciation && (
              <div className="flex items-center justify-center gap-2">
                <span className="text-gray-600">{vocabulary.pronunciation}</span>
                {onPlayAudio && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onPlayAudio}
                    className="h-8 w-8 p-0"
                  >
                    <Volume2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            )}
          </div>

          {!showAnswer ? (
            <Button onClick={onReveal} size="lg">
              Show Answer
            </Button>
          ) : (
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-2xl font-medium" dir="rtl">
                  {vocabulary.persianTranslation}
                </p>
                {vocabulary.englishTranslation && (
                  <p className="text-gray-600 mt-2">
                    {vocabulary.englishTranslation}
                  </p>
                )}
              </div>

              {vocabulary.examples && vocabulary.examples.length > 0 && (
                <div className="text-left">
                  <button
                    onClick={() => setShowTranslation(!showTranslation)}
                    className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
                  >
                    {showTranslation ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                    {showTranslation ? 'Hide' : 'Show'} Example
                  </button>
                  {showTranslation && (
                    <div className="mt-2 p-3 bg-blue-50 rounded-lg">
                      <p className="text-sm" dir="rtl">
                        {vocabulary.examples[0].kurdishSentence}
                      </p>
                      <p className="text-sm text-gray-600 mt-1" dir="rtl">
                        {vocabulary.examples[0].persianTranslation}
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        {vocabulary.examples[0].englishTranslation}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {onRate && (
                <div className="space-y-3">
                  <p className="text-sm font-medium text-gray-700">
                    How well did you remember?
                  </p>
                  <div className="flex flex-wrap justify-center gap-2">
                    {REVIEW_QUALITY_LABELS.map((item) => (
                      <Button
                        key={item.value}
                        onClick={() => onRate(item.value)}
                        className={`${item.color} text-white hover:opacity-90`}
                      >
                        {item.label}
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </CardHeader>
    </Card>
  );
}
