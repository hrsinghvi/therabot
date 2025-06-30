import { getChatSession, sendMessageToGemini } from './gemini';

// Voice therapy system prompt
const THERAPY_SYSTEM_PROMPT = `You are a compassionate, professional AI therapist specializing in cognitive behavioral therapy and mindfulness techniques. Your role is to:

1. Listen actively and empathetically to the user's concerns
2. Provide supportive, non-judgmental responses
3. Ask thoughtful questions to help users explore their thoughts and feelings
4. Offer practical coping strategies and mindfulness exercises when appropriate
5. Maintain professional boundaries while being warm and caring
6. Encourage self-reflection and personal growth
7. Never give medical advice or diagnose conditions
8. Keep responses conversational and natural for voice interaction

Always respond as if you're having a natural conversation. Keep responses concise (2-3 sentences) for voice interaction, but be supportive and therapeutic in your approach.`;

export interface VoiceSession {
  id: string;
  startTime: Date;
  messages: VoiceMessage[];
}

export interface VoiceMessage {
  id: string;
  timestamp: Date;
  type: 'user' | 'ai';
  content: string;
  audioUrl?: string;
}

// Web Speech API STT Service
class WebSTTService {
  private recognition: any = null;

  constructor() {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = false;
      this.recognition.interimResults = false;
      this.recognition.lang = 'en-US';
      this.recognition.maxAlternatives = 1;
    }
  }

  async transcribe(audioBlob: Blob): Promise<{ text: string }> {
    return new Promise((resolve, reject) => {
      if (!this.recognition) {
        reject(new Error('Speech recognition not supported'));
        return;
      }

      // Create a new recognition instance for each transcription
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';
      recognition.maxAlternatives = 1;

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        console.log('STT Result:', transcript);
        resolve({ text: transcript });
      };

      recognition.onerror = (event: any) => {
        console.error('STT Error:', event.error);
        reject(new Error(`Speech recognition error: ${event.error}`));
      };

      recognition.onend = () => {
        console.log('STT ended');
      };

      // Start recognition
      try {
        recognition.start();
        console.log('STT started');
      } catch (error) {
        console.error('Failed to start STT:', error);
        reject(error);
      }
    });
  }
}

// Web Speech API TTS Service
class WebTTSService {
  private currentUtterance: SpeechSynthesisUtterance | null = null;

  async synthesize(text: string): Promise<{ audioUrl: string }> {
    return new Promise((resolve, reject) => {
      if (!('speechSynthesis' in window)) {
        reject(new Error('Speech synthesis not supported'));
        return;
      }

      // Cancel any ongoing speech
      speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      this.currentUtterance = utterance;
      
      // Wait for voices to load if they haven't already
      const setVoiceAndSpeak = () => {
        const voices = speechSynthesis.getVoices();
        console.log('Available voices:', voices.length);
        
        // Find a suitable voice (prefer female English voices for therapy)
        const preferredVoice = voices.find(voice => 
          voice.lang.startsWith('en') && (
            voice.name.toLowerCase().includes('female') ||
            voice.name.toLowerCase().includes('samantha') ||
            voice.name.toLowerCase().includes('karen') ||
            voice.name.toLowerCase().includes('susan')
          )
        ) || voices.find(voice => voice.lang.startsWith('en')) || voices[0];
        
        if (preferredVoice) {
          utterance.voice = preferredVoice;
          console.log('Selected voice:', preferredVoice.name);
        }
        
        utterance.rate = 0.9; // Slightly slower for therapy
        utterance.pitch = 1.0; // Natural pitch
        utterance.volume = 1.0;
        
        utterance.onstart = () => {
          console.log('TTS started speaking');
        };
        
        utterance.onend = () => {
          console.log('TTS finished speaking');
          // Create a mock audio URL for consistency
          const mockAudioUrl = `data:audio/wav;base64,${btoa(text)}`;
          resolve({ audioUrl: mockAudioUrl });
        };
        
        utterance.onerror = (error) => {
          console.error('TTS Error:', error);
          reject(new Error(`Speech synthesis error: ${error.error}`));
        };
        
        console.log('Starting TTS for:', text.substring(0, 50) + '...');
        speechSynthesis.speak(utterance);
      };

      // Check if voices are already loaded
      if (speechSynthesis.getVoices().length > 0) {
        setVoiceAndSpeak();
      } else {
        // Wait for voices to load
        speechSynthesis.onvoiceschanged = () => {
          setVoiceAndSpeak();
        };
      }
    });
  }

  // Method to stop current speech
  stop(): void {
    if (speechSynthesis.speaking) {
      speechSynthesis.cancel();
    }
    this.currentUtterance = null;
  }

  // Check if currently speaking
  isSpeaking(): boolean {
    return speechSynthesis.speaking;
  }
}

class VoiceTherapyService {
  private currentSession: VoiceSession | null = null;
  private chatSession: any = null;
  private recognition: any = null;
  private isRecording = false;
  private sttService = new WebSTTService();
  private ttsService = new WebTTSService();

  // Initialize a new therapy session
  async startSession(): Promise<VoiceSession> {
    this.currentSession = {
      id: `session_${Date.now()}`,
      startTime: new Date(),
      messages: []
    };

    // Initialize AI chat session with therapy prompt
    try {
      const response = await fetch('/SYSTEM_PROMPT.md');
      let systemPrompt = THERAPY_SYSTEM_PROMPT;
      if (response.ok) {
        const customPrompt = await response.text();
        systemPrompt = customPrompt + '\n\n' + THERAPY_SYSTEM_PROMPT;
      }
      this.chatSession = getChatSession(systemPrompt);
    } catch (error) {
      console.error('Failed to load system prompt, using default:', error);
      this.chatSession = getChatSession(THERAPY_SYSTEM_PROMPT);
    }

    return this.currentSession;
  }

  // Get current session
  getCurrentSession(): VoiceSession | null {
    return this.currentSession;
  }

  // Start recording audio using Web Speech Recognition
  async startRecording(): Promise<void> {
    try {
      console.log('VoiceTherapy: Starting speech recognition...');
      
      if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
        throw new Error('Speech recognition not supported in this browser');
      }

      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      this.recognition = new SpeechRecognition();
      
      this.recognition.continuous = true;
      this.recognition.interimResults = true;
      this.recognition.lang = 'en-US';
      this.recognition.maxAlternatives = 1;

      this.isRecording = true;
      console.log('VoiceTherapy: Speech recognition configured and started');
    } catch (error) {
      console.error('VoiceTherapy: Error starting recording:', error);
      throw new Error('Failed to start recording. Please check microphone permissions.');
    }
  }

  // Stop recording and process audio using Web Speech Recognition
  async stopRecording(): Promise<VoiceMessage> {
    return new Promise((resolve, reject) => {
      console.log('VoiceTherapy: Stop recording called');
      if (!this.recognition) {
        console.error('VoiceTherapy: No active recognition');
        reject(new Error('No active recording'));
        return;
      }

      let finalTranscript = '';

      this.recognition.onresult = (event: any) => {
        console.log('VoiceTherapy: Speech recognition result received');
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          }
        }
      };

      this.recognition.onend = async () => {
        try {
          console.log('VoiceTherapy: Speech recognition ended');
          console.log('VoiceTherapy: Final transcript:', finalTranscript);
          
          if (!finalTranscript.trim()) {
            reject(new Error('No speech detected. Please try speaking again.'));
            return;
          }
          
          // Create user message
          const userMessage: VoiceMessage = {
            id: `msg_${Date.now()}`,
            timestamp: new Date(),
            type: 'user',
            content: finalTranscript.trim(),
            audioUrl: undefined // No audio URL for speech recognition
          };

          // Add to session
          if (this.currentSession) {
            this.currentSession.messages.push(userMessage);
          }

          this.isRecording = false;
          console.log('VoiceTherapy: User message created:', userMessage);
          resolve(userMessage);
        } catch (error) {
          console.error('VoiceTherapy: Error in stopRecording:', error);
          reject(error);
        }
      };

      this.recognition.onerror = (event: any) => {
        console.error('VoiceTherapy: Speech recognition error:', event.error);
        this.isRecording = false;
        reject(new Error(`Speech recognition error: ${event.error}`));
      };

      console.log('VoiceTherapy: Starting speech recognition...');
      try {
        this.recognition.start();
      } catch (error) {
        console.error('VoiceTherapy: Failed to start recognition:', error);
        reject(error);
      }
    });
  }

  // Process user message and get AI response
  async processUserMessage(userMessage: VoiceMessage): Promise<VoiceMessage> {
    try {
      // Ensure chat session is initialized
      if (!this.chatSession) {
        console.log('VoiceTherapy: Initializing chat session...');
        this.chatSession = getChatSession(THERAPY_SYSTEM_PROMPT);
      }
      
      // Get AI response from Gemini
      console.log('VoiceTherapy: Getting AI response for:', userMessage.content);
      const aiResponse = await sendMessageToGemini(this.chatSession, userMessage.content);
      console.log('VoiceTherapy: AI response received:', aiResponse);
      
      // Convert AI response to speech using TTS service
      console.log('VoiceTherapy: Converting to speech...');
      const ttsResult = await this.ttsService.synthesize(aiResponse);
      console.log('VoiceTherapy: TTS completed, audioUrl:', ttsResult.audioUrl ? 'generated' : 'none');
      
      // Create AI message
      const aiMessage: VoiceMessage = {
        id: `msg_${Date.now()}`,
        timestamp: new Date(),
        type: 'ai',
        content: aiResponse,
        audioUrl: ttsResult.audioUrl
      };

      // Add to session
      if (this.currentSession) {
        this.currentSession.messages.push(aiMessage);
        console.log('VoiceTherapy: AI message added to session. Total messages:', this.currentSession.messages.length);
      }

      return aiMessage;
    } catch (error) {
      console.error('VoiceTherapy: Error processing message:', error);
      throw new Error(`Failed to process message: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Get recording status
  isCurrentlyRecording(): boolean {
    return this.isRecording;
  }

  // End current session
  endSession(): void {
    this.currentSession = null;
    this.chatSession = null;
    this.isRecording = false;
    if (this.recognition) {
      this.recognition.stop();
      this.recognition = null;
    }
    // Stop any ongoing speech
    this.ttsService.stop();
  }
}

// Export singleton instance
export const voiceTherapyService = new VoiceTherapyService(); 