import { useState, useEffect, useRef, useCallback } from 'react';
import { speechRecognitionService } from '@/services/speechToText';
import { speechSynthesisService } from '@/services/speechSynthesis';
import { getChatSession, sendMessageToGemini } from '@/services/gemini';
import { ChatSession } from '@google/generative-ai';

export type SessionState = 'idle' | 'listening' | 'processing' | 'speaking' | 'error';
export type ChatMessage = {
  role: 'user' | 'model';
  content: string;
};

const SYSTEM_PROMPT = `You are Sage, an empathetic and supportive AI voice therapist. Your goal is to listen, understand, and guide the user through their thoughts and feelings. Use a calm, gentle, and encouraging tone. Keep your responses concise and open-ended to encourage the user to continue sharing. Do not provide medical advice. Focus on active listening and reflective questioning.`;

export const useVoiceSession = () => {
  const [sessionState, setSessionState] = useState<SessionState>('idle');
  const [transcript, setTranscript] = useState('');
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [error, setError] = useState<string | null>(null);

  const geminiChatSession = useRef<ChatSession | null>(null);
  const isMounted = useRef(true);
  const lastTranscript = useRef('');

  useEffect(() => {
    isMounted.current = true;
    geminiChatSession.current = getChatSession(SYSTEM_PROMPT);
    return () => {
      isMounted.current = false;
      speechRecognitionService.stop();
      speechSynthesisService.cancel();
    };
  }, []);

  const processAIResponse = useCallback(async (text: string) => {
    if (!geminiChatSession.current) return;
    setChatHistory(prev => [...prev, { role: 'user', content: text }]);

    try {
      const aiResponse = await sendMessageToGemini(geminiChatSession.current, text);
      if (!isMounted.current) return;

      setChatHistory(prev => [...prev, { role: 'model', content: aiResponse }]);
      setSessionState('speaking');
      speechSynthesisService.speak(aiResponse, { 
        onEnd: () => isMounted.current && setSessionState('idle') 
      });
    } catch (e) {
      if (!isMounted.current) return;
      console.error("Error sending message to Gemini:", e);
      setError("I'm having trouble responding right now.");
      setSessionState('error');
    }
  }, []);
  
  const handleListenResult = useCallback((text: string, isFinal: boolean) => {
    if (!isMounted.current) return;
    lastTranscript.current = text;
    setTranscript(text);
  }, []);
  
  const handleListenError = useCallback((e: SpeechRecognitionErrorEvent) => {
    if (!isMounted.current) return;
    console.error('Speech recognition error:', e.error);
    setError(`Recognition error: ${e.error}. Please check your connection and browser permissions.`);
    setSessionState('error');
  }, []);
  
  const handleListenEnd = useCallback(() => {
    if (!isMounted.current) return;
    // This is the key: process the final transcript when recognition ends.
    if (sessionState === 'processing') {
      const finalText = lastTranscript.current.trim();
      if (finalText) {
        processAIResponse(finalText);
      } else {
        // User stopped without speaking.
        setSessionState('idle');
      }
    }
  }, [sessionState, processAIResponse]);

  const startListening = useCallback(async () => {
    if (sessionState !== 'idle' && sessionState !== 'error') return;

    setError(null);
    setTranscript('');
    lastTranscript.current = '';

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop());
      
      setSessionState('listening');
      speechRecognitionService.start(handleListenResult, handleListenError, handleListenEnd);
    } catch (err) {
      console.error("Mic permission error:", err);
      setError("Microphone permission denied. Please enable it in your browser's site settings.");
      setSessionState('error');
    }
  }, [sessionState, handleListenResult, handleListenError, handleListenEnd]);

  const stopListening = useCallback(() => {
    if (sessionState !== 'listening') return;
    setSessionState('processing');
    speechRecognitionService.stop();
  }, [sessionState]);

  return {
    sessionState,
    transcript,
    chatHistory,
    error,
    startListening,
    stopListening,
  };
}; 