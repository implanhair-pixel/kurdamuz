'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';

interface PlacementWizardProps {
  onStart: () => void;
}

export function PlacementWizard({ onStart }: PlacementWizardProps) {
  const t = useTranslations('placement');
  const [step, setStep] = useState(0);

  const steps = [
    {
      title: t('messages.welcome'),
      description: t('description'),
    },
    {
      title: t('instructions'),
      description: 'Instructions for the placement test',
    },
  ];

  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      onStart();
    }
  };

  const handlePrevious = () => {
    if (step > 0) {
      setStep(step - 1);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-4 sm:p-6">
      <div className="bg-white rounded-lg shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-center mb-4">{t('title')}</h1>
        
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center justify-between mb-4">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`h-2 flex-1 mx-0.5 sm:mx-1 rounded ${
                  index <= step ? 'bg-blue-500' : 'bg-gray-200'
                }`}
              />
            ))}
          </div>
          
          <div className="text-center">
            <h2 className="text-xl sm:text-2xl font-semibold mb-2">{steps[step].title}</h2>
            <p className="text-gray-600 text-sm sm:text-base">{steps[step].description}</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-between gap-3 sm:gap-0">
          <button
            onClick={handlePrevious}
            disabled={step === 0}
            className="w-full sm:w-auto px-6 py-3 sm:py-2 bg-gray-200 text-gray-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300 transition text-center"
          >
            {t('messages.previous')}
          </button>
          
          <button
            onClick={handleNext}
            className="w-full sm:w-auto px-6 py-3 sm:py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition text-center"
          >
            {step === steps.length - 1 ? t('start') : t('messages.next')}
          </button>
        </div>
      </div>
    </div>
  );
}
