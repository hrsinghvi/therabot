import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { Mic, MicOff, Volume2, VolumeX, Brain, Sparkles, AlertCircle, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { voiceTherapyService, VoiceSession as VoiceSessionType, VoiceMessage } from "@/services/voiceTherapy";
import { useAuth } from "@/contexts/AuthContext";

interface VoiceSessionState {
  isRecording: boolean;
  isProcessing: boolean;
  isSpeaking: boolean;
  error: string | null;
  sessionDuration: number;
  audioLevel: number;
  currentSession: VoiceSessionType | null;
  isSessionActive: boolean;
}

/**
 * Voice Session Component for AI Therapy
 * Provides real-time voice conversation with AI therapist
 */
const VoiceSession: React.FC = () => {
  const { user } = useAuth();
  const [state, setState] = useState<VoiceSessionState>({
    isRecording: false,
    isProcessing: false,
    isSpeaking: false,
    error: null,
    sessionDuration: 0,
    audioLevel: 0,
    currentSession: null,
    isSessionActive: false
  });

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const microphoneRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const animationRef = useRef<number | null>(null);

  // Start a new voice therapy session
  const handleStartSession = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, error: null, isProcessing: true }));
      
      const session = await voiceTherapyService.startSession();
      
      setState(prev => ({ 
        ...prev, 
        currentSession: session,
        isSessionActive: true,
        isProcessing: false,
        sessionDuration: 0
      }));

      // Start session timer
      timerRef.current = setInterval(() => {
        setState(prev => ({ ...prev, sessionDuration: prev.sessionDuration + 1 }));
      }, 1000);

    } catch (error) {
      console.error('Failed to start session:', error);
      setState(prev => ({ 
        ...prev, 
        error: 'Failed to start therapy session. Please try again.',
        isProcessing: false
      }));
    }
  }, []);

  // Start recording
  const handleStartRecording = useCallback(async () => {
    if (!state.isSessionActive) {
      await handleStartSession();
    }

    try {
      setState(prev => ({ ...prev, error: null, isRecording: true }));
      
      await voiceTherapyService.startRecording();
      
      // Set up audio visualization for recording feedback
      setupAudioVisualization();
      
    } catch (error) {
      console.error('Failed to start recording:', error);
      setState(prev => ({ 
        ...prev, 
        error: 'Failed to start recording. Please check microphone permissions.',
        isRecording: false
      }));
    }
  }, [state.isSessionActive, handleStartSession]);

  // Stop recording and process
  const handleStopRecording = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isRecording: false, isProcessing: true }));
      
      // Stop audio visualization
      if (audioContextRef.current) {
        audioContextRef.current.close();
        audioContextRef.current = null;
      }
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      
      // Stop recording and get user message
      const userMessage = await voiceTherapyService.stopRecording();
      console.log('User message:', userMessage);
      
      // Process the message and get AI response
      const aiMessage = await voiceTherapyService.processUserMessage(userMessage);
      console.log('AI message:', aiMessage);
      
      // Update session state
      setState(prev => ({ 
        ...prev, 
        currentSession: voiceTherapyService.getCurrentSession(),
        isProcessing: false,
        isSpeaking: true
      }));
      
      // Monitor TTS completion using speechSynthesis events
      const checkSpeechEnd = () => {
        if (!speechSynthesis.speaking) {
          setState(prev => ({ ...prev, isSpeaking: false }));
        } else {
          setTimeout(checkSpeechEnd, 500);
        }
      };
      
      // Start monitoring after a brief delay
      setTimeout(checkSpeechEnd, 1000);
      
    } catch (error) {
      console.error('Failed to process recording:', error);
      setState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Failed to process your message. Please try again.',
        isProcessing: false,
        isRecording: false
      }));
    }
  }, []);

  // Stop AI speaking
  const handleStopSpeaking = useCallback(() => {
    if ('speechSynthesis' in window) {
      speechSynthesis.cancel();
      setState(prev => ({ ...prev, isSpeaking: false }));
    }
  }, []);

  // End session
  const handleEndSession = useCallback(() => {
    voiceTherapyService.endSession();
    
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    
    setState({
      isRecording: false,
      isProcessing: false,
      isSpeaking: false,
      error: null,
      sessionDuration: 0,
      audioLevel: 0,
      currentSession: null,
      isSessionActive: false
    });
  }, []);

  // Set up audio visualization
  const setupAudioVisualization = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      audioContextRef.current = new AudioContext();
      analyserRef.current = audioContextRef.current.createAnalyser();
      microphoneRef.current = audioContextRef.current.createMediaStreamSource(stream);
      
      microphoneRef.current.connect(analyserRef.current);
      analyserRef.current.fftSize = 256;
      
      const checkAudioLevel = () => {
        if (analyserRef.current) {
          const bufferLength = analyserRef.current.frequencyBinCount;
          const dataArray = new Uint8Array(bufferLength);
          analyserRef.current.getByteFrequencyData(dataArray);
          
          const average = dataArray.reduce((a, b) => a + b) / bufferLength;
          setState(prev => ({ ...prev, audioLevel: average }));
          
          if (voiceTherapyService.isCurrentlyRecording()) {
            animationRef.current = requestAnimationFrame(checkAudioLevel);
          }
        }
      };
      
      checkAudioLevel();
    } catch (error) {
      console.error('Failed to set up audio visualization:', error);
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      handleEndSession();
    };
  }, [handleEndSession]);

  // Format duration helper
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Audio visualizer component
  const AudioVisualizer = () => (
    <div className="flex items-center justify-center space-x-1 h-16">
      {[...Array(9)].map((_, i) => (
        <motion.div
          key={i}
          className="bg-blue-500 rounded-full"
          style={{
            width: '4px',
            height: state.isRecording ? `${Math.max(8, (state.audioLevel / 255) * 64 + Math.random() * 16)}px` : '8px'
          }}
          animate={{
            height: state.isRecording 
              ? [8, Math.max(8, (state.audioLevel / 255) * 64 + Math.random() * 16), 8]
              : 8,
            opacity: state.isRecording ? [0.4, 1, 0.4] : 0.3
          }}
          transition={{
            duration: 0.5,
            repeat: state.isRecording ? Infinity : 0,
            delay: i * 0.1
          }}
        />
      ))}
    </div>
  );

  // Conversation history display
  const ConversationHistory = () => {
    if (!state.currentSession?.messages.length) return null;

    return (
      <div className="space-y-4 max-h-64 overflow-y-auto">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Conversation</h3>
        {state.currentSession.messages.map((message) => (
          <div
            key={message.id}
            className={`p-3 rounded-lg ${
              message.type === 'user' 
                ? 'bg-blue-50 dark:bg-blue-900/20 ml-4' 
                : 'bg-gray-50 dark:bg-gray-800/50 mr-4'
            }`}
          >
            <div className="flex items-start space-x-2">
              <div className={`w-2 h-2 rounded-full mt-2 ${
                message.type === 'user' ? 'bg-blue-500' : 'bg-green-500'
              }`} />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {message.type === 'user' ? 'You' : 'AI Therapist'}
                </p>
                <p className="text-gray-800 dark:text-gray-200 mt-1">
                  {message.content}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {message.timestamp.toLocaleTimeString()}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="flex-1 p-6 space-y-6">
      {/* Header Card */}
      <Card className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-purple-200 dark:border-purple-800">
        <CardContent className="p-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-100 dark:bg-purple-800 rounded-lg">
              <Brain className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-200">
                Voice Therapy Session
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Have a natural conversation with your AI therapist
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Error Alert */}
      {state.error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      )}

      {/* Main Session Interface */}
      <div className="flex flex-col items-center space-y-8">
        {/* Session Status */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center space-x-4">
            {state.isSessionActive && (
              <Badge variant="secondary" className="px-3 py-1">
                Session Active: {formatDuration(state.sessionDuration)}
              </Badge>
            )}
            {state.isProcessing && (
              <Badge variant="outline" className="px-3 py-1">
                <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                Processing...
              </Badge>
            )}
            {state.isSpeaking && (
              <Badge variant="outline" className="px-3 py-1">
                <Volume2 className="h-3 w-3 mr-1" />
                AI Speaking
              </Badge>
            )}
          </div>
        </div>

        {/* Recording Interface */}
        <div className="flex flex-col items-center space-y-6">
          {/* Audio Visualizer */}
          <AudioVisualizer />
          
          {/* Main Recording Button */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              size="lg"
              variant={state.isRecording ? "destructive" : "default"}
              className={`w-48 h-48 rounded-full text-white font-semibold text-lg shadow-lg transition-all duration-300 ${
                state.isRecording 
                  ? "bg-red-500 hover:bg-red-600 animate-pulse" 
                  : "bg-blue-500 hover:bg-blue-600"
              }`}
              onClick={state.isRecording ? handleStopRecording : handleStartRecording}
              disabled={state.isProcessing}
            >
              <div className="flex flex-col items-center space-y-2">
                {state.isRecording ? (
                  <MicOff className="h-12 w-12" />
                ) : (
                  <Mic className="h-12 w-12" />
                )}
                <span>
                  {state.isRecording ? "Stop Recording" : "Start Recording"}
                </span>
              </div>
            </Button>
          </motion.div>
        </div>

        {/* Control Buttons */}
        <div className="flex space-x-4">
          {state.isSpeaking && (
            <Button
              variant="outline"
              onClick={handleStopSpeaking}
              className="flex items-center space-x-2"
            >
              <VolumeX className="h-4 w-4" />
              <span>Stop Speaking</span>
            </Button>
          )}
          
          {state.isSessionActive && (
            <Button
              variant="outline"
              onClick={handleEndSession}
              className="flex items-center space-x-2"
            >
              <span>End Session</span>
            </Button>
          )}
        </div>
      </div>

      {/* Conversation History */}
      {state.currentSession?.messages.length > 0 && (
        <Card>
          <CardContent className="p-6">
            <ConversationHistory />
          </CardContent>
        </Card>
      )}

      {/* Instructions */}
      {!state.isSessionActive && (
        <Card>
          <CardContent className="p-6">
            <div className="text-center space-y-4">
              <Sparkles className="h-8 w-8 text-purple-500 mx-auto" />
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                Start Your Voice Therapy Session
              </h3>
              <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
                Click the microphone button to begin. Speak naturally about what's on your mind, 
                and your AI therapist will listen and respond with supportive guidance.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default VoiceSession;
