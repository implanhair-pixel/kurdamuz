import type { AudioRecordingResult } from './types';

/**
 * Audio recording fallback for browsers without Web Speech API support
 */
export class AudioRecorder {
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private stream: MediaStream | null = null;
  private isRecording: boolean = false;
  private startTime: number = 0;

  /**
   * Start audio recording
   */
  async start(): Promise<void> {
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.mediaRecorder = new MediaRecorder(this.stream);
      this.audioChunks = [];
      this.startTime = Date.now();

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data);
        }
      };

      this.mediaRecorder.start();
      this.isRecording = true;
    } catch (error) {
      console.error('Error starting audio recording:', error);
      throw new Error('Failed to access microphone');
    }
  }

  /**
   * Stop audio recording and return result
   */
  async stop(): Promise<AudioRecordingResult> {
    if (!this.mediaRecorder || !this.isRecording) {
      throw new Error('No recording in progress');
    }

    return new Promise((resolve, reject) => {
      this.mediaRecorder!.onstop = () => {
        const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
        const audioUrl = URL.createObjectURL(audioBlob);
        const duration = Date.now() - this.startTime;

        // Cleanup
        if (this.stream) {
          this.stream.getTracks().forEach(track => track.stop());
        }

        resolve({
          audioBlob,
          audioUrl,
          duration,
        });
      };

      this.mediaRecorder!.stop();
      this.isRecording = false;
    });
  }

  /**
   * Check if currently recording
   */
  isActive(): boolean {
    return this.isRecording;
  }

  /**
   * Cancel recording without saving
   */
  cancel(): void {
    if (this.mediaRecorder && this.isRecording) {
      this.mediaRecorder.stop();
      this.isRecording = false;
      this.audioChunks = [];

      if (this.stream) {
        this.stream.getTracks().forEach(track => track.stop());
      }
    }
  }

  /**
   * Check if audio recording is supported
   */
  static isSupported(): boolean {
    return typeof MediaRecorder !== 'undefined' && 
           typeof navigator.mediaDevices !== 'undefined' &&
           typeof navigator.mediaDevices.getUserMedia === 'function';
  }
}
