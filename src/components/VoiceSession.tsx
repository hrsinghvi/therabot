
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, MicOff, ArrowLeft, Volume2, VolumeX, Play, Pause, Waves } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface VoiceSessionProps {
  onBack: () => void;
}

const VoiceSession = ({ onBack }: VoiceSessionProps) => {
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [aiResponse, setAiResponse] = useState("");
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [volume, setVolume] = useState(true);
  
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Initialize speech recognition if available
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      
      recognitionRef.current.onresult = (event: any) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          }
        }
        if (finalTranscript) {
          setTranscript(finalTranscript);
          handleUserInput(finalTranscript);
        }
      };
      
      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  }, []);

  const startListening = () => {
    if (recognitionRef.current) {
      setIsListening(true);
      setTranscript("");
      recognitionRef.current.start();
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  const handleUserInput = async (input: string) => {
    setIsProcessing(true);
    
    // Simulate AI processing
    setTimeout(() => {
      const responses = [
        "I hear that you're feeling overwhelmed. That's completely understandable, and I want you to know that these feelings are valid. Take a deep breath with me.",
        "Thank you for sharing that with me. It sounds like you're carrying a lot right now. Let's explore what might help you feel a bit lighter.",
        "I can sense the emotion in your words. It's brave of you to express these feelings. How long have you been experiencing this?",
        "What you're describing resonates with many people. You're not alone in feeling this way. Would you like to talk about what triggered these feelings?",
        "I appreciate your openness. Sometimes just speaking our thoughts aloud can be the first step toward understanding them better."
      ];
      
      const response = responses[Math.floor(Math.random() * responses.length)];
      setAiResponse(response);
      setIsProcessing(false);
      
      // Simulate text-to-speech
      if ('speechSynthesis' in window && volume) {
        const utterance = new SpeechSynthesisUtterance(response);
        utterance.rate = 0.8;
        utterance.pitch = 0.9;
        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => setIsSpeaking(false);
        speechSynthesis.speak(utterance);
      }
    }, 2000);
  };

  const toggleSpeech = () => {
    if (isSpeaking) {
      speechSynthesis.cancel();
      setIsSpeaking(false);
    } else if (aiResponse && volume) {
      const utterance = new SpeechSynthesisUtterance(aiResponse);
      utterance.rate = 0.8;
      utterance.pitch = 0.9;
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      speechSynthesis.speak(utterance);
    }
  };

  const pulseVariants = {
    listening: {
      scale: [1, 1.2, 1],
      opacity: [0.7, 1, 0.7],
      transition: {
        duration: 1.5,
        repeat: Infinity,
        ease: [0.4, 0, 0.6, 1] as const
      }
    },
    idle: {
      scale: 1,
      opacity: 1
    }
  };

  const waveVariants = {
    animate: {
      scale: [1, 1.5, 2],
      opacity: [0.8, 0.4, 0],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: [0.4, 0, 0.6, 1] as const
      }
    }
  };

  return (
    <div className="h-[calc(100vh-200px)] bg-card/20 backdrop-blur-sm rounded-lg border border-border/50 overflow-hidden">
      {/* Header */}
      <motion.div 
        className="flex items-center justify-between p-4 border-b border-border/50"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <motion.div
          whileHover={{ x: -5 }}
          whileTap={{ scale: 0.95 }}
        >
          <Button
            variant="ghost"
            onClick={onBack}
            className="gap-2 hover:bg-accent/50"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
        </motion.div>
        
        <div className="flex items-center gap-2">
          <motion.div
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
          >
            <Waves className="w-5 h-5 text-primary" />
          </motion.div>
          <h1 className="text-xl font-medium">Voice Session</h1>
        </div>
        
        <motion.div
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setVolume(!volume)}
            className="hover:bg-accent/50"
          >
            {volume ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
          </Button>
        </motion.div>
      </motion.div>

      <div className="p-8 flex flex-col items-center justify-center h-full space-y-8">
        {/* Voice Interface */}
        <div className="relative">
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              size="lg"
              className={`w-32 h-32 rounded-full transition-all duration-300 ${
                isListening 
                  ? 'bg-red-500 hover:bg-red-600' 
                  : 'bg-primary hover:bg-primary/90'
              }`}
              onClick={isListening ? () => setIsListening(false) : () => setIsListening(true)}
              disabled={isProcessing}
            >
              <motion.div
                variants={pulseVariants}
                animate={isListening ? 'listening' : 'idle'}
              >
                {isListening ? (
                  <MicOff className="w-12 h-12" />
                ) : (
                  <Mic className="w-12 h-12" />
                )}
              </motion.div>
            </Button>
          </motion.div>
          
          {/* Animated Waves */}
          <AnimatePresence>
            {isListening && (
              <>
                {[...Array(3)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute inset-0 w-32 h-32 border-2 border-red-400 rounded-full"
                    variants={waveVariants}
                    initial={{ scale: 1, opacity: 0 }}
                    animate="animate"
                    style={{ animationDelay: `${i * 0.5}s` }}
                  />
                ))}
              </>
            )}
          </AnimatePresence>
        </div>
        
        <motion.p 
          className="text-lg text-muted-foreground text-center max-w-md"
          animate={{ opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          {isListening 
            ? "I'm listening... Speak naturally about what's on your mind" 
            : isProcessing 
              ? "Processing your message with care..." 
              : "Tap the microphone to start your voice session"
          }
        </motion.p>

        {/* Transcript */}
        <AnimatePresence>
          {transcript && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="w-full max-w-2xl"
            >
              <Card className="border-0 bg-accent/20 backdrop-blur-sm">
                <CardContent className="p-6">
                  <h3 className="font-medium mb-2 text-sm text-muted-foreground">You said:</h3>
                  <p className="text-foreground">{transcript}</p>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* AI Response */}
        <AnimatePresence>
          {aiResponse && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="w-full max-w-2xl"
            >
              <Card className="border-0 bg-primary/10 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-sm text-muted-foreground">CalmMind responds:</h3>
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {}}
                        className="gap-2"
                      >
                        {isSpeaking ? (
                          <>
                            <Pause className="w-4 h-4" />
                            Pause
                          </>
                        ) : (
                          <>
                            <Play className="w-4 h-4" />
                            Play
                          </>
                        )}
                      </Button>
                    </motion.div>
                  </div>
                  <p className="text-foreground leading-relaxed">{aiResponse}</p>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Processing Animation */}
        <AnimatePresence>
          {isProcessing && (
            <motion.div 
              className="text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="inline-flex gap-2">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    className="w-3 h-3 bg-primary rounded-full"
                    animate={{
                      y: [0, -12, 0],
                      opacity: [0.4, 1, 0.4]
                    }}
                    transition={{
                      duration: 1.2,
                      repeat: Infinity,
                      delay: i * 0.2
                    }}
                  />
                ))}
              </div>
              <p className="mt-2 text-muted-foreground">Thinking with empathy...</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default VoiceSession;
