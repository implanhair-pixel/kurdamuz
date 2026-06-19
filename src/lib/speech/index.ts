import { WebSpeechAPI } from './web-speech-api';
import { AudioRecorder } from './audio-recorder';
import type { 
  SpeechRecognitionResult, 
  AudioRecordingResult,
  SpeechRecognitionConfig,
  SpeechRecognitionStatus 
} from './types';

/**
 * Unified speech recognition service
 * Uses Web Speech API when available, falls back to audio recording
 */
export class SpeechRecognitionService {
  private webSpeech: WebSpeechAPI | null = null;
  private audioRecorder: AudioRecorder | null = null;
  private mode: 'speech' | 'audio' = 'speech';
  private currentTranscript: string = '';
  private finalTranscript: string = '';

  constructor(config?: SpeechRecognitionConfig) {
    // Try Web Speech API first
    this.webSpeech = new WebSpeechAPI(config);
    
    if (this.webSpeech.isBrowserSupported()) {
      this.mode = 'speech';
      this.setupWebSpeechHandlers();
    } else {
      // Fall back to audio recording
      this.mode = 'audio';
      this.audioRecorder = new AudioRecorder();
    }
  }

  private setupWebSpeechHandlers(): void {
    if (!this.webSpeech) return;

    this.webSpeech.onResult((result: SpeechRecognitionResult) => {
      if (result.isFinal) {
        this.finalTranscript += ' ' + result.transcript;
        this.currentTranscript = '';
      } else {
        this.currentTranscript = result.transcript;
      }
    });

    this.webSpeech.onError((error) => {
      console.error('Speech recognition error:', error);
      // Fall back to audio recording on error
      if (this.mode === 'speech') {
        this.mode = 'audio';
        this.audioRecorder = new AudioRecorder();
      }
    });
  }

  /**
   * Start recognition (speech or audio recording)
   */
  async start(): Promise<void> {
    this.currentTranscript = '';
    this.finalTranscript = '';

    if (this.mode === 'speech' && this.webSpeech) {
      this.webSpeech.start();
    } else if (this.mode === 'audio' && this.audioRecorder) {
      await this.audioRecorder.start();
    }
  }

  /**
   * Stop recognition and return result
   */
  async stop(): Promise<SpeechRecognitionResult | AudioRecordingResult> {
    if (this.mode === 'speech' && this.webSpeech) {
      this.webSpeech.stop();
      
      // Wait a bit for final result
      await new Promise(resolve => setTimeout(resolve, 500));
      
      return {
        transcript: (this.finalTranscript + ' ' + this.currentTranscript).trim(),
        confidence: 0.8, // Default confidence
        isFinal: true,
      };
    } else if (this.mode === 'audio' && this.audioRecorder) {
      return await this.audioRecorder.stop();
    }

    throw new Error('No recognition method available');
  }

  /**
   * Get current mode
   */
  getMode(): 'speech' | 'audio' {
    return this.mode;
  }

  /**
   * Get current status
   */
  getStatus(): SpeechRecognitionStatus {
    if (this.mode === 'speech' && this.webSpeech) {
      return this.webSpeech.getStatus();
    } else if (this.mode === 'audio' && this.audioRecorder) {
      return this.audioRecorder.isActive() ? 'listening' : 'idle';
    }
    return 'idle';
  }

  /**
   * Get current transcript (interim)
   */
  getCurrentTranscript(): string {
    return this.currentTranscript;
  }

  /**
   * Get final transcript
   */
  getFinalTranscript(): string {
    return this.finalTranscript;
  }

  /**
   * Cancel recognition
   */
  cancel(): void {
    if (this.mode === 'speech' && this.webSpeech) {
      this.webSpeech.stop();
    } else if (this.mode === 'audio' && this.audioRecorder) {
      this.audioRecorder.cancel();
    }
  }

  /**
   * Cleanup
   */
  destroy(): void {
    if (this.webSpeech) {
      this.webSpeech.destroy();
    }
    this.webSpeech = null;
    this.audioRecorder = null;
  }
}

// Export convenience function
export function createSpeechRecognition(config?: SpeechRecognitionConfig): SpeechRecognitionService {
  return new SpeechRecognitionService(config);
}
