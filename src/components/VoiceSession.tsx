import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Mic, MicOff, Volume2, VolumeX, Brain, Sparkles, Play, Pause, Square } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Textarea } from "@/components/ui/textarea";
import { moodOrchestrator } from "@/services/mood-orchestrator";
import { MOOD_CATEGORIES } from "@/services/gemini";

const VoiceSession = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [sessionId, setSessionId] = useState("");
  const [moodAnalysis, setMoodAnalysis] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [sessionStartTime, setSessionStartTime] = useState(null);
  const [sessionDuration, setSessionDuration] = useState(0);
  const timerRef = useRef(null);

  // Simulate voice session ID generation
  useEffect(() => {
    setSessionId(`voice-session-${Date.now()}`);
  }, []);

  // Timer for session duration
  useEffect(() => {
    if (isRecording) {
      setSessionStartTime(Date.now());
      timerRef.current = setInterval(() => {
        setSessionDuration(prev => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isRecording]);

  // Simulated speech-to-text (In a real implementation, you'd use Web Speech API or similar)
  useEffect(() => {
    if (isRecording) {
      const simulateTranscription = () => {
        const samplePhrases = [
          "I've been feeling really anxious about work lately.",
          "Today was a good day, I felt peaceful and content.",
          "I'm struggling with some difficult emotions right now.",
          "I had a breakthrough in therapy today and feel hopeful.",
          "Work has been overwhelming and I feel burned out.",
          "I'm grateful for the support system I have in my life.",
          "Sometimes I feel like I'm not making progress.",
          "I notice I'm being more kind to myself these days."
        ];
        
        const randomPhrase = samplePhrases[Math.floor(Math.random() * samplePhrases.length)];
        setTranscript(prev => prev + (prev ? " " : "") + randomPhrase);
      };

      // Simulate periodic transcription updates
      const interval = setInterval(simulateTranscription, 3000);
      return () => clearInterval(interval);
    }
  }, [isRecording]);

  const toggleRecording = () => {
    if (isRecording) {
      handleStopRecording();
    } else {
      handleStartRecording();
    }
  };

  const handleStartRecording = () => {
    setIsRecording(true);
    setTranscript("");
    setMoodAnalysis(null);
    setSessionDuration(0);
  };

  const handleStopRecording = async () => {
    setIsRecording(false);
    
    if (transcript.trim()) {
      await analyzeSessionMood();
    }
  };

  const analyzeSessionMood = async () => {
    if (!transcript.trim()) return;

    setIsAnalyzing(true);
    try {
      const result = await moodOrchestrator.handleRealtimeMoodUpdate(
        'voice',
        sessionId,
        transcript,
        `Voice wellness session - ${Math.floor(sessionDuration / 60)}:${String(sessionDuration % 60).padStart(2, '0')}`
      );
      setMoodAnalysis(result.analysis);
    } catch (error) {
      console.error('Error analyzing voice session mood:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const toggleMute = () => setIsMuted(!isMuted);

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${String(secs).padStart(2, '0')}`;
  };

  const MoodAnalysisDisplay = () => {
    if (!moodAnalysis) return null;

    const moodMeta = MOOD_CATEGORIES[moodAnalysis.primaryMood];
    const confidenceColor = moodAnalysis.confidence > 0.7 ? 'text-green-500' : 
                           moodAnalysis.confidence > 0.4 ? 'text-yellow-500' : 'text-red-500';

    return (
      <Alert className="mt-4">
        <Brain className="h-4 w-4" />
        <AlertDescription>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{moodMeta.emoji}</span>
                <div>
                  <div className="font-semibold text-lg capitalize">{moodAnalysis.primaryMood}</div>
                  <div className="text-sm text-muted-foreground">
                    Intensity: {moodAnalysis.intensity}/10
                  </div>
                </div>
              </div>
              <Badge variant="secondary" className={confidenceColor}>
                {Math.round(moodAnalysis.confidence * 100)}% confident
              </Badge>
            </div>
            
            {moodAnalysis.reasoning && (
              <div className="p-3 bg-muted/50 rounded-lg">
                <div className="text-sm font-medium mb-1">AI Analysis:</div>
                <p className="text-sm text-muted-foreground">{moodAnalysis.reasoning}</p>
              </div>
            )}
            
            {moodAnalysis.keyEmotions && moodAnalysis.keyEmotions.length > 0 && (
              <div>
                <div className="text-sm font-medium mb-2">Key emotions detected:</div>
                <div className="flex flex-wrap gap-1">
                  {moodAnalysis.keyEmotions.map((emotion, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {emotion}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </AlertDescription>
      </Alert>
    );
  };

  return (
    <div className="pt-6 h-[calc(100vh-60px)]">
      <Card className="h-full flex flex-col">
        <CardContent className="flex-1 flex flex-col">
          
          {/* Recording Controls */}
          <div className="flex-1 flex flex-col items-center justify-center space-y-6">
            {/* Title */}
            <div className="text-center mb-4">
              <div className="text-xl font-medium flex items-center justify-center gap-2 mb-2">
                AI Voice Session
                <Badge variant="secondary">
                  <Sparkles className="w-3 h-3 mr-1" />
                  Mood Analysis
                </Badge>
              </div>
            </div>
            <motion.div
              className="w-40 h-40 mx-auto rounded-full bg-secondary flex items-center justify-center cursor-pointer"
              animate={isRecording ? { scale: [1, 1.05, 1] } : {}}
              transition={{ duration: 1.5, repeat: isRecording ? Infinity : 0, ease: "easeInOut" }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleRecording}
            >
              <div
                className={`w-24 h-24 rounded-full flex items-center justify-center transition-colors duration-300 ${
                  isRecording 
                    ? 'bg-red-500/80 text-white' 
                    : 'bg-primary text-primary-foreground'
                }`}
              >
                {isRecording ? <Square size={40} /> : <Mic size={40} />}
              </div>
            </motion.div>

            <div className="space-y-2 text-center">
              <p className="font-medium text-lg">
                {isRecording 
                  ? "Recording in progress..."
                  : moodAnalysis 
                  ? "Session complete - Mood analyzed!"
                  : "Start Your Voice Session"
                }
              </p>
              <p className="text-muted-foreground text-sm">
                {isRecording
                  ? `Duration: ${formatDuration(sessionDuration)} • Feel free to share what's on your mind`
                  : moodAnalysis
                  ? "Your emotional state has been analyzed using AI"
                  : "Click the microphone to begin your voice wellness session"
                }
              </p>
            </div>
            
            <div className="flex gap-4">
              <Button
                variant="ghost"
                onClick={toggleMute}
                className="gap-2"
                disabled={isRecording}
              >
                {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                <span>{isMuted ? 'Unmuted' : 'Muted'}</span>
              </Button>
              
              {transcript && !isRecording && (
                <Button
                  variant="outline"
                  onClick={analyzeSessionMood}
                  disabled={isAnalyzing}
                  className="gap-2"
                >
                  <Brain className="w-4 h-4" />
                  {isAnalyzing ? 'Analyzing...' : 'Re-analyze Mood'}
                </Button>
              )}
            </div>
          </div>

          {/* Transcript Section */}
          {(transcript || isRecording) && (
            <div className="space-y-4 mt-6">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">Session Transcript</h3>
                {isRecording && (
                  <Badge variant="destructive" className="animate-pulse">
                    <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                    Recording
                  </Badge>
                )}
              </div>
              <div className="p-4 bg-muted/50 rounded-lg min-h-[120px]">
                <p className="text-sm text-muted-foreground">
                  {transcript || "Your speech will appear here as you talk..."}
                </p>
              </div>
              
              {isAnalyzing && (
                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                  <Brain className="h-4 w-4 animate-pulse" />
                  Analyzing your emotional state...
                </div>
              )}
              
              <MoodAnalysisDisplay />
            </div>
          )}

          {/* Demo Note */}
        </CardContent>
      </Card>
    </div>
  );
};

export default VoiceSession;
