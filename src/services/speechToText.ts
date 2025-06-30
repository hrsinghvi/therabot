// Speech-to-Text Service
// This service provides interfaces for different speech-to-text providers

console.log('STT Provider:', import.meta.env.VITE_STT_PROVIDER);

export interface STTConfig {
  apiKey?: string;
  language?: string;
  model?: string;
  endpoint?: string;
}

export interface STTResult {
  text: string;
  confidence?: number;
  language?: string;
  duration?: number;
}

// Base STT Provider interface
export interface STTProvider {
  transcribe(audioBlob: Blob, config?: STTConfig): Promise<STTResult>;
}

// Google Speech-to-Text Provider
export class GoogleSTTProvider implements STTProvider {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async transcribe(audioBlob: Blob, config?: STTConfig): Promise<STTResult> {
    try {
      // Convert audio to base64
      const base64Audio = await this.blobToBase64(audioBlob);
      
      const response = await fetch(
        `https://speech.googleapis.com/v1/speech:recognize?key=${this.apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            config: {
              encoding: 'WEBM_OPUS',
              sampleRateHertz: 44100,
              languageCode: config?.language || 'en-US',
              model: config?.model || 'latest_long',
              useEnhanced: true,
            },
            audio: {
              content: base64Audio.split(',')[1], // Remove data URL prefix
            },
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Google STT API error: ${response.statusText}`);
      }

      const result = await response.json();
      
      if (result.results && result.results.length > 0) {
        const transcript = result.results
          .map((r: any) => r.alternatives[0].transcript)
          .join(' ');
        
        return {
          text: transcript,
          confidence: result.results[0].alternatives[0].confidence,
          language: config?.language || 'en-US',
        };
      }

      return { text: '', language: config?.language || 'en-US' };
    } catch (error) {
      console.error('Google STT Error:', error);
      throw new Error('Failed to transcribe audio with Google STT');
    }
  }

  private blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }
}

// OpenAI Whisper Provider
export class OpenAIWhisperProvider implements STTProvider {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async transcribe(audioBlob: Blob, config?: STTConfig): Promise<STTResult> {
    try {
      const formData = new FormData();
      formData.append('file', audioBlob, 'audio.webm');
      formData.append('model', config?.model || 'whisper-1');
      formData.append('language', config?.language || 'en');

      const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`OpenAI Whisper API error: ${response.statusText}`);
      }

      const result = await response.json();
      
      return {
        text: result.text,
        language: config?.language || 'en',
      };
    } catch (error) {
      console.error('OpenAI Whisper Error:', error);
      throw new Error('Failed to transcribe audio with OpenAI Whisper');
    }
  }
}

// AssemblyAI Provider
export class AssemblyAIProvider implements STTProvider {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async transcribe(audioBlob: Blob, config?: STTConfig): Promise<STTResult> {
    // 1. Upload audio to AssemblyAI
    const uploadRes = await fetch('https://api.assemblyai.com/v2/upload', {
      method: 'POST',
      headers: {
        'authorization': this.apiKey,
      },
      body: audioBlob,
    });
    const uploadData = await uploadRes.json();
    const audioUrl = uploadData.upload_url;

    // 2. Request transcription
    const transcriptRes = await fetch('https://api.assemblyai.com/v2/transcript', {
      method: 'POST',
      headers: {
        'authorization': this.apiKey,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        audio_url: audioUrl,
        language_code: config?.language || 'en_us',
        punctuate: true,
      }),
    });
    const transcriptData = await transcriptRes.json();
    if (!transcriptRes.ok) {
      console.error('AssemblyAI transcript creation error:', transcriptData);
      throw new Error('AssemblyAI transcript creation failed: ' + (transcriptData.error || transcriptRes.statusText));
    }
    const transcriptId = transcriptData.id;

    // 3. Poll for completion
    let status = transcriptData.status;
    let text = '';
    while (status !== 'completed' && status !== 'error') {
      await new Promise(res => setTimeout(res, 2000));
      const pollRes = await fetch(`https://api.assemblyai.com/v2/transcript/${transcriptId}`, {
        headers: { 'authorization': this.apiKey },
      });
      const pollData = await pollRes.json();
      console.log('AssemblyAI polling:', pollData); // Log polling response
      status = pollData.status;
      text = pollData.text || '';
    }
    if (status === 'error') {
      console.error('AssemblyAI returned error status:', text);
    }

    if (status === 'completed') {
      return { text };
    } else {
      throw new Error('AssemblyAI transcription failed');
    }
  }
}

// Mock STT Provider for development/testing
export class MockSTTProvider implements STTProvider {
  async transcribe(audioBlob: Blob, config?: STTConfig): Promise<STTResult> {
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Return mock transcription
    const mockResponses = [
      "I'm feeling a bit overwhelmed today and could use someone to talk to.",
      "I've been having trouble sleeping lately and it's affecting my mood.",
      "I want to work on my anxiety and find better coping mechanisms.",
      "I'm grateful for the good things in my life but still struggle with stress.",
      "I'd like to learn more about mindfulness and meditation techniques."
    ];
    
    const randomResponse = mockResponses[Math.floor(Math.random() * mockResponses.length)];
    
    return {
      text: randomResponse,
      confidence: 0.95,
      language: config?.language || 'en-US',
      duration: 3000,
    };
  }
}

// STT Service Factory
export class STTService {
  private provider: STTProvider;

  constructor(provider: STTProvider) {
    this.provider = provider;
  }

  async transcribe(audioBlob: Blob, config?: STTConfig): Promise<STTResult> {
    return this.provider.transcribe(audioBlob, config);
  }

  // Factory method to create STT service based on provider type
  static create(providerType: 'google' | 'openai' | 'mock' | 'assemblyai', apiKey?: string): STTService {
    switch (providerType) {
      case 'google':
        if (!apiKey) throw new Error('Google STT requires API key');
        return new STTService(new GoogleSTTProvider(apiKey));
      case 'openai':
        if (!apiKey) throw new Error('OpenAI Whisper requires API key');
        return new STTService(new OpenAIWhisperProvider(apiKey));
      case 'assemblyai':
        if (!apiKey) throw new Error('AssemblyAI requires API key');
        return new STTService(new AssemblyAIProvider(apiKey));
      case 'mock':
        return new STTService(new MockSTTProvider());
      default:
        throw new Error(`Unknown STT provider: ${providerType}`);
    }
  }
}

// Default export - create based on environment variables
const STT_PROVIDER = import.meta.env.VITE_STT_PROVIDER || 'mock';
const STT_API_KEY = import.meta.env.VITE_STT_API_KEY;

export const sttService = STTService.create(
  STT_PROVIDER as 'google' | 'openai' | 'mock' | 'assemblyai',
  STT_API_KEY
); 