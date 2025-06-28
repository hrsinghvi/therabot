
import { useState, useRef, useEffect } from "react";
import { Mic, MicOff, ArrowLeft, Volume2, VolumeX, Play, Pause } from "lucide-react";
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent/20 to-secondary/30 p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 pt-4">
          <Button
            variant="ghost"
            onClick={onBack}
            className="gap-2 hover:bg-accent/50"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          <h1 className="text-xl font-medium">Voice Session</h1>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setVolume(!volume)}
            className="hover:bg-accent/50"
          >
            {volume ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
          </Button>
        </div>

        {/* Voice Interface */}
        <div className="text-center mb-8">
          <div className="relative inline-block">
            <Button
              size="lg"
              className={`w-32 h-32 rounded-full transition-all duration-300 ${
                isListening 
                  ? 'bg-red-500 hover:bg-red-600 animate-pulse' 
                  : 'bg-primary hover:bg-primary/90'
              }`}
              onClick={isListening ? stopListening : startListening}
              disabled={isProcessing}
            >
              {isListening ? (
                <MicOff className="w-12 h-12" />
              ) : (
                <Mic className="w-12 h-12" />
              )}
            </Button>
            
            {isListening && (
              <div className="absolute inset-0 w-32 h-32 border-4 border-red-400 rounded-full animate-ping"></div>
            )}
          </div>
          
          <p className="mt-4 text-lg text-muted-foreground">
            {isListening 
              ? "I'm listening... Tap to stop" 
              : isProcessing 
                ? "Processing your message..." 
                : "Tap to start speaking"
            }
          </p>
        </div>

        {/* Transcript */}
        {transcript && (
          <Card className="mb-6 border-0 bg-accent/20">
            <CardContent className="p-6">
              <h3 className="font-medium mb-2 text-sm text-muted-foreground">You said:</h3>
              <p className="text-foreground">{transcript}</p>
            </CardContent>
          </Card>
        )}

        {/* AI Response */}
        {aiResponse && (
          <Card className="mb-6 border-0 bg-primary/10">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium text-sm text-muted-foreground">CalmMind responds:</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleSpeech}
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
              </div>
              <p className="text-foreground leading-relaxed">{aiResponse}</p>
            </CardContent>
          </Card>
        )}

        {/* Processing Animation */}
        {isProcessing && (
          <div className="text-center">
            <div className="inline-flex gap-2">
              <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
            <p className="mt-2 text-muted-foreground">Thinking...</p>
          </div>
        )}

        {/* Instructions */}
        <div className="mt-8 p-4 bg-muted/50 rounded-lg">
          <p className="text-sm text-muted-foreground text-center">
            💡 Speak naturally about whatever is on your mind. I'm here to listen without judgment and offer gentle guidance.
          </p>
        </div>
      </div>
    </div>
  );
};

export default VoiceSession;
