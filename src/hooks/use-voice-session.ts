import { useState, useEffect, useCallback, useRef } from 'react';
import { sendMessageToGemini, getChatSession } from '../services/gemini';
import { ttsService } from '@/services/textToSpeech';

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
      
      // Use ElevenLabs (or configured TTS) instead of Web Speech API
      try {
        const ttsResult = await ttsService.synthesize(processedResponse, {});
        const audio = new Audio();
        
        // Better error handling for Vercel deployment
        audio.onended = () => setSessionState('idle');
        audio.onerror = (e) => {
          console.error('Audio playback error:', e);
          setError('Audio playback failed. Please check your connection.');
          setSessionState('idle');
        };
        
        audio.oncanplaythrough = () => {
          audio.play().catch((playError) => {
            console.error('Audio play failed:', playError);
            setError('Could not play audio. Please try again.');
            setSessionState('idle');
          });
        };
        
        // Set source after all event listeners are attached
        audio.src = ttsResult.audioUrl;
        
      } catch (ttsError) {
        console.error('TTS error:', ttsError);
        setError('Speech synthesis failed. Please try again.');
        setSessionState('idle');
      }
      
      // --- Old Web Speech API code removed ---
      // const utterance = new SpeechSynthesisUtterance(processedResponse);
      // ... set voice, pitch, etc ...
      // speechSynthesis.speak(utterance);
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