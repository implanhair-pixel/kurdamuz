import type { 
  SpeechRecognitionResult, 
  SpeechRecognitionStatus, 
  SpeechRecognitionConfig,
  SpeechError 
} from './types';

/**
 * Web Speech API implementation for speech-to-text
 * Falls back to audio recording if not supported
 */
export class WebSpeechAPI {
  private recognition: any = null;
  private isSupported: boolean = false;
  private status: SpeechRecognitionStatus = 'idle';
  private onResultCallback: ((result: SpeechRecognitionResult) => void) | null = null;
  private onErrorCallback: ((error: SpeechError) => void) | null = null;
  private onStatusCallback: ((status: SpeechRecognitionStatus) => void) | null = null;

  constructor(config: SpeechRecognitionConfig = { language: 'ckb-IR', continuous: false, interimResults: true, maxAlternatives: 1 }) {
    this.initialize(config);
  }

  private initialize(config: SpeechRecognitionConfig): void {
    // Check for browser support
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      this.recognition = new SpeechRecognition();
      this.isSupported = true;
      
      this.recognition.lang = config.language;
      this.recognition.continuous = config.continuous;
      this.recognition.interimResults = config.interimResults;
      this.recognition.maxAlternatives = config.maxAlternatives;

      this.setupEventHandlers();
    } else {
      console.warn('Web Speech API not supported in this browser');
      this.isSupported = false;
    }
  }

  private setupEventHandlers(): void {
    if (!this.recognition) return;

    this.recognition.onstart = () => {
      this.status = 'listening';
      this.onStatusCallback?.(this.status);
    };

    this.recognition.onresult = (event: any) => {
      const result = this.processResult(event);
      this.onResultCallback?.(result);
    };

    this.recognition.onerror = (event: any) => {
      this.status = 'error';
      const error: SpeechError = {
        error: event.error,
        message: event.message || 'Speech recognition error',
      };
      this.onErrorCallback?.(error);
      this.onStatusCallback?.(this.status);
    };

    this.recognition.onend = () => {
      if (this.status === 'listening') {
        this.status = 'idle';
        this.onStatusCallback?.(this.status);
      }
    };
  }

  private processResult(event: any): SpeechRecognitionResult {
    const last = event.results.length - 1;
    const result = event.results[last];
    const transcript = result[0].transcript;
    const confidence = result[0].confidence;
    const isFinal = result.isFinal;

    return {
      transcript,
      confidence,
      isFinal,
    };
  }

  /**
   * Start speech recognition
   */
  start(): void {
    if (!this.isSupported || !this.recognition) {
      throw new Error('Web Speech API not supported');
    }

    try {
      this.recognition.start();
    } catch (error) {
      this.status = 'error';
      this.onErrorCallback?.({
        error: 'start_error',
        message: 'Failed to start speech recognition',
      });
    }
  }

  /**
   * Stop speech recognition
   */
  stop(): void {
    if (!this.isSupported || !this.recognition) return;

    try {
      this.recognition.stop();
    } catch (error) {
      console.error('Error stopping speech recognition:', error);
    }
  }

  /**
   * Check if Web Speech API is supported
   */
  isBrowserSupported(): boolean {
    return this.isSupported;
  }

  /**
   * Set result callback
   */
  onResult(callback: (result: SpeechRecognitionResult) => void): void {
    this.onResultCallback = callback;
  }

  /**
   * Set error callback
   */
  onError(callback: (error: SpeechError) => void): void {
    this.onErrorCallback = callback;
  }

  /**
   * Set status callback
   */
  onStatusChange(callback: (status: SpeechRecognitionStatus) => void): void {
    this.onStatusCallback = callback;
  }

  /**
   * Get current status
   */
  getStatus(): SpeechRecognitionStatus {
    return this.status;
  }

  /**
   * Cleanup
   */
  destroy(): void {
    if (this.recognition) {
      this.recognition.abort();
      this.recognition = null;
    }
    this.isSupported = false;
    this.status = 'idle';
    this.onResultCallback = null;
    this.onErrorCallback = null;
    this.onStatusCallback = null;
  }
}
