'use client';

import { useState, useEffect } from 'react';
import { createSpeechRecognition } from '@/lib/speech';

interface SpeakingRecorderProps {
  onRecordingComplete: (transcript: string, audioBlob?: Blob) => void;
  language?: string;
}

export function SpeakingRecorder({ onRecordingComplete, language = 'ckb-IR' }: SpeakingRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [status, setStatus] = useState('idle');
  const [speechService, setSpeechService] = useState<any>(null);

  useEffect(() => {
    const service = createSpeechRecognition({ language, continuous: false, interimResults: true, maxAlternatives: 1 }) as any;
    setSpeechService(service);

    if (typeof service.onResult === 'function') {
      service.onResult((result: any) => {
        if (result.transcript) {
          setTranscript(result.transcript);
        }
      });
    }

    if (typeof service.onStatusChange === 'function') {
      service.onStatusChange((newStatus: string) => {
        setStatus(newStatus);
      });
    }

    return () => {
      service.destroy();
    };
  }, [language]);

  const handleStartRecording = async () => {
    try {
      setIsRecording(true);
      setTranscript('');
      await speechService.start();
    } catch (error) {
      console.error('Error starting recording:', error);
      setIsRecording(false);
    }
  };

  const handleStopRecording = async () => {
    try {
      const result = await speechService.stop();
      setIsRecording(false);
      
      if (typeof result === 'object' && 'transcript' in result) {
        onRecordingComplete(result.transcript);
      } else if (typeof result === 'object' && 'audioBlob' in result) {
        onRecordingComplete('', result.audioBlob);
      }
    } catch (error) {
      console.error('Error stopping recording:', error);
      setIsRecording(false);
    }
  };

  const handleCancelRecording = () => {
    speechService.cancel();
    setIsRecording(false);
    setTranscript('');
  };

  return (
    <div className="flex flex-col items-center space-y-4 p-6 bg-gray-50 rounded-lg">
      <div className="text-center">
        <div className="text-2xl font-semibold mb-2">
          {isRecording ? 'Recording...' : 'Ready to Record'}
        </div>
        <div className="text-gray-600 text-sm">
          Status: {status}
        </div>
      </div>

      {transcript && (
        <div className="w-full p-4 bg-white rounded-lg border">
          <div className="text-sm text-gray-500 mb-1">Transcript:</div>
          <div className="text-gray-800">{transcript}</div>
        </div>
      )}

      <div className="flex gap-4">
        {!isRecording ? (
          <button
            onClick={handleStartRecording}
            className="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition flex items-center gap-2"
          >
            <span className="w-3 h-3 bg-white rounded-full" />
            Start Recording
          </button>
        ) : (
          <>
            <button
              onClick={handleStopRecording}
              className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
            >
              Stop & Submit
            </button>
            <button
              onClick={handleCancelRecording}
              className="px-6 py-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition"
            >
              Cancel
            </button>
          </>
        )}
      </div>
    </div>
  );
}
