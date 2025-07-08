// Text-to-Speech Service
// This service provides interfaces for different text-to-speech providers

export interface TTSConfig {
  apiKey?: string;
  voice?: string;
  language?: string;
  speed?: number;
  pitch?: number;
  volume?: number;
}

export interface TTSResult {
  audioUrl: string;
  duration?: number;
  wordCount?: number;
}

// Base TTS Provider interface
export interface TTSProvider {
  synthesize(text: string, config?: TTSConfig): Promise<TTSResult>;
}

// Google Text-to-Speech Provider
export class GoogleTTSProvider implements TTSProvider {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async synthesize(text: string, config?: TTSConfig): Promise<TTSResult> {
    try {
      const response = await fetch(
        `https://texttospeech.googleapis.com/v1/text:synthesize?key=${this.apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            input: { text },
            voice: {
              languageCode: config?.language || 'en-US',
              name: config?.voice || 'en-US-Standard-A',
            },
            audioConfig: {
              audioEncoding: 'MP3',
              speakingRate: config?.speed || 1.0,
              pitch: config?.pitch || 0.0,
              volumeGainDb: config?.volume || 0.0,
            },
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Google TTS API error: ${response.statusText}`);
      }

      const result = await response.json();
      const audioContent = result.audioContent;
      
      // Convert base64 to blob
      const audioBlob = this.base64ToBlob(audioContent, 'audio/mp3');
      const audioUrl = URL.createObjectURL(audioBlob);

      return {
        audioUrl,
        wordCount: text.split(' ').length,
      };
    } catch (error) {
      console.error('Google TTS Error:', error);
      throw new Error('Failed to synthesize speech with Google TTS');
    }
  }

  private base64ToBlob(base64: string, mimeType: string): Blob {
    const byteCharacters = atob(base64);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray], { type: mimeType });
  }
}

// OpenAI Text-to-Speech Provider
export class OpenAITTSProvider implements TTSProvider {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async synthesize(text: string, config?: TTSConfig): Promise<TTSResult> {
    try {
      const response = await fetch('https://api.openai.com/v1/audio/speech', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'tts-1',
          input: text,
          voice: config?.voice || 'alloy',
          response_format: 'mp3',
          speed: config?.speed || 1.0,
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenAI TTS API error: ${response.statusText}`);
      }

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);

      return {
        audioUrl,
        wordCount: text.split(' ').length,
      };
    } catch (error) {
      console.error('OpenAI TTS Error:', error);
      throw new Error('Failed to synthesize speech with OpenAI TTS');
    }
  }
}

// Web Speech API Provider (browser built-in)
export class WebSpeechTTSProvider implements TTSProvider {
  async synthesize(text: string, config?: TTSConfig): Promise<TTSResult> {
    function getVoicesAsync(): Promise<SpeechSynthesisVoice[]> {
      return new Promise(resolve => {
        const voices = speechSynthesis.getVoices();
        if (voices.length) {
          resolve(voices);
        } else {
          speechSynthesis.onvoiceschanged = () => {
            resolve(speechSynthesis.getVoices());
          };
        }
      });
    }

    return new Promise(async (resolve, reject) => {
      if (!('speechSynthesis' in window)) {
        reject(new Error('Web Speech API not supported'));
        return;
      }

      const utterance = new SpeechSynthesisUtterance(text);

      // Wait for voices to be loaded
      const voices = await getVoicesAsync();
      utterance.voice =
        voices.find(
          v => v.lang.startsWith('en') && v.name.toLowerCase().includes('female')
        ) ||
        voices.find(
          v => v.lang.startsWith('en') && v.name.toLowerCase().includes('woman')
        ) ||
        voices.find(v => v.lang.startsWith('en')) ||
        null;

      utterance.rate = config?.speed || 1.0;
      utterance.pitch = config?.pitch || 1.4;
      utterance.volume = config?.volume || 1.0;

      // Create a simple audio element to simulate the result
      const audio = new Audio();
      audio.src = `data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT`;
      const audioUrl = audio.src;

      utterance.onend = () => {
        resolve({
          audioUrl,
          wordCount: text.split(' ').length,
        });
      };

      utterance.onerror = (error) => {
        reject(new Error(`Web Speech TTS error: ${error.error}`));
      };

      speechSynthesis.speak(utterance);
    });
  }
}

// Mock TTS Provider for development/testing
export class MockTTSProvider implements TTSProvider {
  async synthesize(text: string, config?: TTSConfig): Promise<TTSResult> {
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Return mock audio URL
    const mockAudioUrl = `data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT`;
    
    return {
      audioUrl: mockAudioUrl,
      wordCount: text.split(' ').length,
      duration: text.length * 50, // Rough estimate: 50ms per character
    };
  }
}

// AssemblyAI Text-to-Speech Provider
export class AssemblyAITTSProvider implements TTSProvider {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async synthesize(text: string, config?: TTSConfig): Promise<TTSResult> {
    // 1. Request TTS from AssemblyAI
    const response = await fetch('https://api.assemblyai.com/v2/tts/stream', {
      method: 'POST',
      headers: {
        'authorization': this.apiKey,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        text,
        voice: config?.voice || 'nova', // 'nova' is a default AssemblyAI voice
        // You can add more config options if AssemblyAI supports them
      }),
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('AssemblyAI TTS error:', errorData);
      throw new Error('AssemblyAI TTS failed: ' + (errorData.error || response.statusText));
    }
    const audioBlob = await response.blob();
    const audioUrl = URL.createObjectURL(audioBlob);
    return {
      audioUrl,
      wordCount: text.split(' ').length,
    };
  }
}

// ElevenLabs Text-to-Speech Provider
export class ElevenLabsTTSProvider implements TTSProvider {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async synthesize(text: string, config?: TTSConfig): Promise<TTSResult> {
    try {
      console.log('ElevenLabs TTS: Starting synthesis for text length:', text.length);
      
      // You can customize the voice_id and other params as needed
      const voiceId = config?.voice || 'EXAVITQu4vr4xnSDxMaL'; // Default ElevenLabs voice
      const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
        method: 'POST',
        headers: {
          'xi-api-key': this.apiKey,
          'Content-Type': 'application/json',
          'Accept': 'audio/mpeg'
        },
        body: JSON.stringify({
          text,
          model_id: 'eleven_monolingual_v1',
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
            style: 0.5,
            use_speaker_boost: true
          }
        }),
      });

      const contentType = response.headers.get('content-type');
      if (!response.ok || !contentType?.startsWith('audio/')) {
        const errorText = await response.text();
        console.error('ElevenLabs TTS error:', errorText);
        throw new Error('ElevenLabs TTS failed: ' + errorText);
      }

      const audioBlob = await response.blob();
      console.log('ElevenLabs TTS: Received audio blob, size:', audioBlob.size, 'bytes');
      
      // Check blob size - if too large for data URL, use blob URL as fallback
      const maxSize = 50 * 1024 * 1024; // 50MB limit for data URLs
      
      let audioUrl: string;
      if (audioBlob.size > maxSize) {
        console.log('ElevenLabs TTS: Large file, using blob URL');
        // Use blob URL for large files
        audioUrl = URL.createObjectURL(audioBlob);
      } else {
        console.log('ElevenLabs TTS: Converting to base64 data URL');
        // Convert blob to base64 data URL for better Vercel compatibility
        const arrayBuffer = await audioBlob.arrayBuffer();
        const uint8Array = new Uint8Array(arrayBuffer);
        const base64String = btoa(String.fromCharCode(...uint8Array));
        audioUrl = `data:audio/mpeg;base64,${base64String}`;
      }

      console.log('ElevenLabs TTS: Audio URL created, type:', audioUrl.startsWith('data:') ? 'data URL' : 'blob URL');
      
      return {
        audioUrl,
        wordCount: text.split(' ').length,
      };
    } catch (error) {
      console.error('ElevenLabs TTS Error:', error);
      throw new Error('Failed to synthesize speech with ElevenLabs TTS');
    }
  }
}

// LiveKit Text-to-Speech Provider (stub for linter)
export class LiveKitTTSProvider implements TTSProvider {
  private apiKey: string;
  constructor(apiKey: string) { this.apiKey = apiKey; }
  async synthesize(text: string, config?: TTSConfig): Promise<TTSResult> {
    throw new Error('LiveKitTTSProvider is not implemented.');
  }
}

// TTS Service Factory
export class TTSService {
  private provider: TTSProvider;

  constructor(provider: TTSProvider) {
    this.provider = provider;
  }

  async synthesize(text: string, config?: TTSConfig): Promise<TTSResult> {
    return this.provider.synthesize(text, config);
  }

  // Factory method to create TTS service based on provider type
  static create(providerType: 'google' | 'openai' | 'web' | 'mock' | 'assemblyai' | 'livekit' | 'elevenlabs', apiKey?: string): TTSService {
    switch (providerType) {
      case 'google':
        if (!apiKey) throw new Error('Google TTS requires API key');
        return new TTSService(new GoogleTTSProvider(apiKey));
      case 'openai':
        if (!apiKey) throw new Error('OpenAI TTS requires API key');
        return new TTSService(new OpenAITTSProvider(apiKey));
      case 'assemblyai':
        if (!apiKey) throw new Error('AssemblyAI TTS requires API key');
        return new TTSService(new AssemblyAITTSProvider(apiKey));
      case 'livekit':
        if (!apiKey) throw new Error('LiveKit TTS requires API key');
        return new TTSService(new LiveKitTTSProvider(apiKey));
      case 'elevenlabs':
        if (!apiKey) throw new Error('ElevenLabs TTS requires API key');
        return new TTSService(new ElevenLabsTTSProvider(apiKey));
      case 'web':
        return new TTSService(new WebSpeechTTSProvider());
      case 'mock':
        return new TTSService(new MockTTSProvider());
      default:
        throw new Error(`Unknown TTS provider: ${providerType}`);
    }
  }
}

// Default export - create based on environment variables
const TTS_PROVIDER = import.meta.env.VITE_TTS_PROVIDER || 'mock';
const TTS_API_KEY = import.meta.env.VITE_TTS_API_KEY;

console.log('TTS Configuration:', { 
  provider: TTS_PROVIDER, 
  hasApiKey: !!TTS_API_KEY,
  keyLength: TTS_API_KEY?.length || 0
});

export const ttsService = TTSService.create(
  TTS_PROVIDER as 'google' | 'openai' | 'web' | 'mock' | 'assemblyai' | 'livekit' | 'elevenlabs',
  TTS_API_KEY
); 