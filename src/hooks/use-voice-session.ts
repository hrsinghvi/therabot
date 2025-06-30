import { useState, useEffect, useCallback, useRef } from 'react';
import { sendMessageToGemini, getChatSession } from '../services/gemini';

type ConversationTurn = {
  speaker: 'user' | 'ai';
  text: string;
};

type SessionState = 'idle' | 'listening' | 'processing' | 'speaking' | 'error';

const useVoiceSession = () => {
  const [sessionState, setSessionState] = useState<SessionState>('idle');
  const [transcript, setTranscript] = useState<string>('');
  const [conversationHistory, setConversationHistory] = useState<ConversationTurn[]>([]);
  const [error, setError] = useState<string>('');
  
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const chatSessionRef = useRef<ReturnType<typeof getChatSession> | null>(null);

  const processAndRespond = useCallback(async (text: string) => {
    if (!text.trim()) return;
    
    setSessionState('processing');
    const newHistory: ConversationTurn[] = [...conversationHistory, { speaker: 'user', text }];
    setConversationHistory(newHistory);

    if (!chatSessionRef.current) {
      const systemPrompt = `You are an empathetic AI therapist. Your role is to be a helpful and a good listener. 
      Keep your responses concise and encouraging. Do not sound like a robot. 
      The user will be speaking to you.`;
      chatSessionRef.current = getChatSession(systemPrompt);
    }
    
    try {
      const aiResponse = await sendMessageToGemini(chatSessionRef.current, text);
      setConversationHistory(prev => [...prev, { speaker: 'ai', text: aiResponse }]);
      setSessionState('speaking');
      
      // Make the speech more natural by adding pauses and processing text
      const processedResponse = aiResponse
        .replace(/\./g, '... ') // Add pauses after periods
        .replace(/,/g, ', ') // Slight pause after commas
        .replace(/;/g, '; ') // Pause after semicolons
        .replace(/:/g, ': ') // Pause after colons
        .replace(/\?/g, '?... ') // Longer pause after questions
        .replace(/!/g, '!... '); // Longer pause after exclamations
      
      const utterance = new SpeechSynthesisUtterance(processedResponse);
      
      // Ensure voices are loaded, then set female voice
      const setFemaleVoice = () => {
        const voices = speechSynthesis.getVoices();
        console.log('Available voices:', voices.map(v => v.name)); // Debug log
        
        const femaleVoice = voices.find(voice => 
          // Prioritize high-quality female voices
          voice.name.toLowerCase().includes('samantha') || // macOS premium voice
          voice.name.toLowerCase().includes('karen') ||    // macOS premium voice
          voice.name.toLowerCase().includes('susan') ||    // macOS premium voice
          voice.name.toLowerCase().includes('victoria') || // Windows premium voice
          voice.name.toLowerCase().includes('hazel') ||    // Windows premium voice
          voice.name.toLowerCase().includes('zira') ||     // Windows voice
          voice.name.toLowerCase().includes('female') ||
          voice.name.toLowerCase().includes('woman') ||
          voice.name.toLowerCase().includes('amelie') ||   // French female
          voice.name.toLowerCase().includes('anna') ||     // German female
          voice.name.toLowerCase().includes('catherine') || // English female
          voice.name.toLowerCase().includes('fiona') ||    // Scottish female
          voice.name.toLowerCase().includes('moira') ||    // Irish female
          voice.name.toLowerCase().includes('tessa') ||    // South African female
          (voice.name.toLowerCase().includes('google') && voice.name.toLowerCase().includes('standard-a')) ||
          (voice.name.toLowerCase().includes('microsoft') && voice.name.toLowerCase().includes('zira'))
        );
        
        if (femaleVoice) {
          utterance.voice = femaleVoice;
          console.log('Selected female voice:', femaleVoice.name);
        } else {
          // Fallback: avoid obvious male voices
          const fallbackFemale = voices.find(voice => {
            const name = voice.name.toLowerCase();
            return !name.includes('male') && 
                   !name.includes('man') && 
                   !name.includes('david') && 
                   !name.includes('alex') && 
                   !name.includes('daniel') && 
                   !name.includes('james') && 
                   !name.includes('thomas') && 
                   !name.includes('fred');
          });
          
          if (fallbackFemale) {
            utterance.voice = fallbackFemale;
            console.log('Selected fallback female voice:', fallbackFemale.name);
          } else {
            console.log('No female voice found, using default');
          }
        }
      };
      
      // Try to set voice immediately
      setFemaleVoice();
      
      // If no voices loaded yet, wait for them
      if (speechSynthesis.getVoices().length === 0) {
        speechSynthesis.onvoiceschanged = () => {
          setFemaleVoice();
          speechSynthesis.onvoiceschanged = null; // Remove listener
        };
      }
      
      // Fine-tune speech parameters for more natural sound
      utterance.rate = 1.0; // Normal pace, slightly faster than before
      utterance.pitch = 1.05; // Slightly higher pitch
      utterance.volume = 1.0; // Full volume to avoid audio processing issues
      
      // Fix audio glitches by ensuring clean speech synthesis
      utterance.onstart = () => {
        console.log('Speech started');
      };
      
      utterance.onend = () => {
        console.log('Speech ended');
        setSessionState('idle');
      };
      
      utterance.onerror = (event) => {
        console.error('Speech synthesis error:', event);
        setSessionState('idle');
      };
      
      // Cancel any existing speech before starting new one
      speechSynthesis.cancel();
      
      // Small delay to ensure cancel completes before starting new speech
      setTimeout(() => {
        speechSynthesis.speak(utterance);
      }, 100);
    } catch (error) {
      console.error("Error with Gemini API or speech synthesis:", error);
      setError("Failed to get AI response. Please try again.");
      setSessionState('error');
    }
  }, [conversationHistory]);

  // Initialize speech recognition once
  useEffect(() => {
    if (!('webkitSpeechRecognition' in window)) {
      setError("Speech recognition is not supported in this browser. Please use Chrome.");
      setSessionState('error');
      return;
    }

    const SpeechRecognition = window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.continuous = false; // Changed to false for more control
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      console.log("Speech recognition started");
      setError('');
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interimTranscript = '';
      let finalTranscript = '';
      
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }
      
      setTranscript(finalTranscript || interimTranscript);
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error('Speech recognition error:', event.error);
      
      let errorMessage = '';
      switch (event.error) {
        case 'network':
          errorMessage = "Network error. Please check your internet connection and try again.";
          break;
        case 'not-allowed':
          errorMessage = "Microphone access denied. Please allow microphone permissions.";
          break;
        case 'no-speech':
          errorMessage = "No speech detected. Please try speaking again.";
          break;
        default:
          errorMessage = `Speech recognition error: ${event.error}`;
      }
      
      setError(errorMessage);
      setSessionState('error');
    };
    
    recognition.onend = () => {
      console.log("Speech recognition ended");
      if (sessionState === 'listening') {
        setSessionState('idle');
      }
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []); // Empty dependency array - only run once

  const toggleListening = () => {
    if (!recognitionRef.current) {
      setError("Speech recognition not available.");
      return;
    }

    if (sessionState === 'listening') {
      // Stop listening and process
      recognitionRef.current.stop();
      setSessionState('idle');
      
      if (transcript.trim()) {
        processAndRespond(transcript.trim());
      }
    } else if (sessionState === 'idle' || sessionState === 'error') {
      // Start listening
      setTranscript('');
      setError('');
      
      try {
        recognitionRef.current.start();
        setSessionState('listening');
      } catch (error) {
        console.error("Error starting recognition:", error);
        setError("Failed to start speech recognition. Please try again.");
        setSessionState('error');
      }
    }
  };

  const endSession = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    speechSynthesis.cancel();
    setSessionState('idle');
    setTranscript('');
    setConversationHistory([]);
    setError('');
  };

  return { 
    sessionState, 
    transcript, 
    conversationHistory, 
    error,
    toggleListening, 
    endSession 
  };
};

export default useVoiceSession; 