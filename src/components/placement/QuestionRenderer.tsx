'use client';

import { useTranslations } from 'next-intl';
import type { Question, QuestionType } from '@/lib/placement/question-bank/types';

interface QuestionRendererProps {
  question: Question;
  onResponse: (response: any) => void;
  currentResponse?: any;
}

export function QuestionRenderer({ question, onResponse, currentResponse }: QuestionRendererProps) {
  const t = useTranslations('placement');

  const renderQuestionContent = () => {
    switch (question.questionType) {
      case 'multiple_choice':
        return renderMultipleChoice();
      case 'true_false':
        return renderTrueFalse();
      case 'fill_blank':
        return renderFillBlank();
      case 'audio_listening':
        return renderAudioListening();
      case 'speaking':
        return renderSpeaking();
      default:
        return <div>Unsupported question type</div>;
    }
  };

  const renderMultipleChoice = () => {
    const options = question.content.options as string[];
    return (
      <div className="space-y-3" role="radiogroup" aria-label="Multiple choice options">
        {options.map((option, index) => (
          <button
            key={index}
            onClick={() => onResponse(option)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onResponse(option);
              }
            }}
            role="radio"
            aria-checked={currentResponse === option}
            tabIndex={0}
            className={`w-full p-4 text-left rounded-lg border-2 transition focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
              currentResponse === option
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            {option}
          </button>
        ))}
      </div>
    );
  };

  const renderTrueFalse = () => {
    return (
      <div className="space-y-3">
        {['true', 'false'].map((option) => (
          <button
            key={option}
            onClick={() => onResponse(option)}
            className={`w-full p-4 text-left rounded-lg border-2 transition ${
              currentResponse === option
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            {option === 'true' ? 'True' : 'False'}
          </button>
        ))}
      </div>
    );
  };

  const renderFillBlank = () => {
    return (
      <div>
        <input
          type="text"
          value={currentResponse || ''}
          onChange={(e) => onResponse(e.target.value)}
          className="w-full p-4 border-2 rounded-lg focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          placeholder="Type your answer..."
          aria-label="Fill in the blank answer"
          autoComplete="off"
        />
      </div>
    );
  };

  const renderAudioListening = () => {
    const audioUrl = question.content.audioUrl as string;
    const options = question.content.options as string[];
    return (
      <div className="space-y-4">
        <audio controls className="w-full">
          <source src={audioUrl} type="audio/mpeg" />
          Your browser does not support the audio element.
        </audio>
        <div className="space-y-3">
          {options.map((option, index) => (
            <button
              key={index}
              onClick={() => onResponse(option)}
              className={`w-full p-4 text-left rounded-lg border-2 transition ${
                currentResponse === option
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      </div>
    );
  };

  const renderSpeaking = () => {
    return (
      <div className="text-center">
        <p className="mb-4 text-gray-600">
          {question.content.prompt as string}
        </p>
        <button
          onClick={() => onResponse('recorded')}
          className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
        >
          Record Response
        </button>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6" role="region" aria-label="Question">
      <div className="mb-4">
        <span className="text-sm text-gray-500 uppercase tracking-wide">
          {t('questionTypes.' + question.questionType as any)}
        </span>
        <h3 className="text-xl font-semibold mt-1" id={`question-${question.id}`}>
          {question.content.question as string}
        </h3>
      </div>
      
      <div aria-labelledby={`question-${question.id}`}>
        {renderQuestionContent()}
      </div>
    </div>
  );
}
