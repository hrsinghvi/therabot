// src/services/speechSynthesis.ts

interface SpeechSynthesisServiceOptions {
  onBoundary?: (event: SpeechSynthesisEvent) => void;
  onEnd?: (event: SpeechSynthesisEvent) => void;
  onError?: (event: SpeechSynthesisErrorEvent) => void;
}

class SpeechSynthesisService {
  private synthesis: SpeechSynthesis;
  private isSupported: boolean;
  private voices: SpeechSynthesisVoice[] = [];
  public isSpeaking: boolean = false;
  private isMuted: boolean = false;

  constructor() {
    this.isSupported = 'speechSynthesis' in window;
    if (this.isSupported) {
      this.synthesis = window.speechSynthesis;
      this.loadVoices();
      if (this.synthesis.onvoiceschanged !== undefined) {
        this.synthesis.onvoiceschanged = () => this.loadVoices();
      }
    } else {
      console.error("Speech synthesis not supported in this browser.");
    }
  }

  private loadVoices() {
    this.voices = this.synthesis.getVoices();
  }

  public speak(text: string, options?: SpeechSynthesisServiceOptions) {
    if (!this.isSupported || this.isSpeaking) {
      return;
    }

    this.cancel(); // Cancel any previous speech

    const utterance = new SpeechSynthesisUtterance(text);

    // Select a high-quality voice
    const preferredVoice = this.voices.find(
      (voice) => voice.lang === 'en-US' && voice.name.includes('Google')
    );
    utterance.voice = preferredVoice || this.voices.find(voice => voice.lang === 'en-US');
    utterance.pitch = 1;
    utterance.rate = 1;
    utterance.volume = this.isMuted ? 0 : 1;

    utterance.onstart = () => {
      this.isSpeaking = true;
    };

    utterance.onend = (event) => {
      this.isSpeaking = false;
      if (options?.onEnd) {
        options.onEnd(event);
      }
    };

    utterance.onerror = (event) => {
      this.isSpeaking = false;
      console.error("SpeechSynthesis Error", event);
      if (options?.onError) {
        options.onError(event);
      }
    };
    
    if (options?.onBoundary) {
        utterance.onboundary = options.onBoundary;
    }

    this.synthesis.speak(utterance);
  }

  public cancel() {
    if (!this.isSupported) return;
    this.synthesis.cancel();
    this.isSpeaking = false;
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (this.isSpeaking) {
      // To immediately apply mute, we have to stop and restart speech.
      // This is a simplification; a more complex implementation could try to re-speak.
      this.cancel();
    }
  }

  public getIsSupported(): boolean {
    return this.isSupported;
  }
}

export const speechSynthesisService = new SpeechSynthesisService(); 