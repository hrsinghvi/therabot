import { useState } from 'react';
import { motion } from 'framer-motion';
import useVoiceSession from '../hooks/use-voice-session';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { Mic, MicOff, BrainCircuit, Bot, User, CircleStop, AlertCircle, Sparkles } from 'lucide-react';
import { moodOrchestrator } from '@/services/mood-orchestrator';

const VoiceSession = () => {
  const { sessionState, transcript, conversationHistory, error, toggleListening, endSession } = useVoiceSession();
  const [sessionStartTime, setSessionStartTime] = useState<number | null>(null);

  const latestAiResponse = conversationHistory.filter(turn => turn.speaker === 'ai').pop()?.text;

  const getStatusIndicator = () => {
    switch (sessionState) {
      case 'listening':
        return <Badge variant="destructive" className="animate-pulse"><Mic className="w-4 h-4 mr-2" />Listening...</Badge>;
      case 'processing':
        return <Badge variant="secondary"><BrainCircuit className="w-4 h-4 mr-2 animate-spin" />Thinking...</Badge>;
      case 'speaking':
        return <Badge variant="default"><Bot className="w-4 h-4 mr-2" />Speaking...</Badge>;
      case 'error':
        return <Badge variant="destructive"><AlertCircle className="w-4 h-4 mr-2" />Error</Badge>;
      default:
        return <Badge variant="outline">Ready</Badge>;
    }
  };

  const getButtonIcon = () => {
    switch (sessionState) {
      case 'listening':
        return <MicOff className="w-6 h-6" />;
      default:
        return <Mic className="w-6 h-6" />;
    }
  };
  
  const getButtonText = () => {
    switch (sessionState) {
        case 'listening': return 'Stop Listening';
        case 'processing': return 'Processing...';
        case 'speaking': return 'Speaking...';
        case 'error': return 'Try Again';
        default: return 'Start Listening';
    }
  };

  // Custom toggleListening to track session start
  const handleToggleListening = () => {
    if (sessionState === 'idle' || sessionState === 'error') {
      setSessionStartTime(Date.now());
    }
    toggleListening();
  };

  // Custom endSession to track duration and trigger mood analysis
  const handleEndSession = async () => {
    endSession();
    if (sessionStartTime && conversationHistory.length > 0) {
      const durationMinutes = Math.max(1, Math.round((Date.now() - sessionStartTime) / 60000));
      // Combine all user turns as content
      const userContent = conversationHistory.filter(turn => turn.speaker === 'user').map(turn => turn.text).join(' ');
      try {
        await moodOrchestrator.handleRealtimeMoodUpdate(
          'voice',
          'voice-session', // You may want to use a real session ID if available
          userContent,
          undefined,
          durationMinutes
        );
      } catch (err) {
        // Non-blocking
        console.error('Voice session mood analysis failed:', err);
      }
    }
    setSessionStartTime(null);
  };

    return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="h-full flex flex-col space-y-6 pt-6"
    >
      {/* Welcome Section */}
      <Card className="bg-gradient-to-br from-primary/10 to-transparent">
        <CardHeader>
          <CardTitle className="text-2xl font-bold flex items-center gap-2">
            <Mic className="w-6 h-6 text-primary" />
            Voice Therapy Session
          </CardTitle>
          <CardDescription>
            Share your thoughts through voice and have a natural conversation with your AI therapist.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
              {getStatusIndicator()}
              {conversationHistory.length > 0 && (
                <Badge variant="outline" className="text-xs">
                  <Sparkles className="w-3 h-3 mr-1" />
                  {Math.floor(conversationHistory.length / 2)} exchanges
              </Badge>
              )}
            </div>
          </div>
          
          {error && (
            <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        </CardContent>
      </Card>

      {/* Conversation Area */}
      <div className="flex-1 grid md:grid-cols-2 gap-4 min-h-0">
        {/* AI Response */}
        <Card className="hover:shadow-md transition-shadow flex flex-col">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Bot className="w-5 h-5 text-primary" />
              AI Therapist
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1">
            <div className="min-h-[120px] flex items-center justify-center h-full">
              {latestAiResponse ? (
                <motion.p 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-lg leading-relaxed"
                >
                  {latestAiResponse}
                </motion.p>
              ) : (
                <p className="text-muted-foreground text-center">
                  Your AI therapist's response will appear here. Click "Start Listening" to begin the conversation.
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* User Transcript */}
        <Card className="bg-muted/50 flex flex-col">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <User className="w-5 h-5 text-muted-foreground" />
              Your Voice
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1">
            <div className="min-h-[80px] flex items-center justify-center h-full">
              {transcript ? (
                <motion.p 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-lg italic text-center"
                >
                  "{transcript}"
                </motion.p>
              ) : (
                <p className="text-muted-foreground text-center">
                  Your transcribed speech will appear here while you speak.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Control Panel */}
      <Card className="bg-gradient-to-br from-secondary/20 to-transparent">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
            <Button 
              onClick={handleToggleListening} 
              disabled={sessionState === 'processing' || sessionState === 'speaking'}
              className="w-full sm:w-auto flex-grow sm:flex-grow-0"
              size="lg"
            >
              {getButtonIcon()}
              <span className="ml-2">{getButtonText()}</span>
            </Button>
            
            {conversationHistory.length > 0 && (
              <Button
                onClick={handleEndSession} 
                variant="destructive"
                className="w-full sm:w-auto"
                size="lg"
              >
                <CircleStop className="w-6 h-6" />
                <span className="ml-2">End Session</span>
              </Button>
            )}
        </div>

          <div className="mt-4 text-center text-sm text-muted-foreground">
            Click "Start Listening" to speak, then click again to stop and get a response
          </div>
      </CardContent>
    </Card>
    </motion.div>
  );
};

export default VoiceSession;