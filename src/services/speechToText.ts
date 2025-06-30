// src/services/speechToText.ts

type RecognitionCallback = (text: string, isFinal: boolean) => void;
type ErrorCallback = (error: SpeechRecognitionErrorEvent) => void;
type EndCallback = () => void;

class SpeechRecognitionService {
  private recognition: SpeechRecognition | null = null;
  private isSupported: boolean;
  private isListening: boolean = false;

  private onResultCallback: RecognitionCallback | null = null;
  private onErrorCallback: ErrorCallback | null = null;
  private onEndCallback: EndCallback | null = null;

  constructor() {
    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
    this.isSupported = !!SpeechRecognitionAPI;
    if (this.isSupported) {
      this.recognition = new SpeechRecognitionAPI();
      this.configureRecognition();
    } else {
      console.error("Speech recognition not supported in this browser.");
    }
  }

  private configureRecognition() {
    if (!this.recognition) return;

    this.recognition.continuous = true;
    this.recognition.interimResults = true;
    this.recognition.lang = 'en-US';

    this.recognition.onresult = (event: SpeechRecognitionEvent) => {
      if (!this.onResultCallback) return;
      
      let finalTranscript = '';
      let interimTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript + ' ';
        } else {
          interimTranscript += transcript;
        }
      }

      if (finalTranscript.trim()) {
        this.onResultCallback(finalTranscript.trim(), true);
      }
      if (interimTranscript.trim()) {
        this.onResultCallback(interimTranscript.trim(), false);
      }
    };

    this.recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error('SpeechRecognitionService Error:', event.error);
      if (this.onErrorCallback) {
        this.onErrorCallback(event);
      }
      this.isListening = false;
    };

    this.recognition.onend = () => {
      this.isListening = false;
      if (this.onEndCallback) {
        this.onEndCallback();
      }
    };
  }

  public start(onResult: RecognitionCallback, onError: ErrorCallback, onEnd: EndCallback) {
    if (!this.isSupported || this.isListening || !this.recognition) {
      return;
    }
    this.onResultCallback = onResult;
    this.onErrorCallback = onError;
    this.onEndCallback = onEnd;
    
    try {
      this.isListening = true;
      this.recognition.start();
    } catch (error) {
      console.error("Error starting speech recognition:", error);
      this.isListening = false;
      this.onErrorCallback({ error: 'start-failed' } as SpeechRecognitionErrorEvent);
    }
  }

  public stop() {
    if (!this.isSupported || !this.isListening || !this.recognition) {
      return;
    }
    this.recognition.stop();
  }

  public getIsListening(): boolean {
    return this.isListening;
  }

  public getIsSupported(): boolean {
    return this.isSupported;
  }
}

export const speechRecognitionService = new SpeechRecognitionService(); 