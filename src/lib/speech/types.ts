// Speech recognition type definitions

export type SpeechRecognitionStatus = 'idle' | 'listening' | 'processing' | 'error' | 'success';

export interface SpeechRecognitionResult {
  transcript: string;
  confidence: number;
  isFinal: boolean;
}

export interface AudioRecordingResult {
  audioBlob: Blob;
  audioUrl: string;
  duration: number;
}

export interface SpeechRecognitionConfig {
  language: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
}

export interface SpeechError {
  error: string;
  message: string;
}
