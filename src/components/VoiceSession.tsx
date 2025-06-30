import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Mic, Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useVoiceSession } from '@/hooks/use-voice-session';
import { speechSynthesisService } from '@/services/speechSynthesis';

const VoiceSession = () => {
  const { sessionState, transcript, error, startListening, stopListening } = useVoiceSession();
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    speechSynthesisService.setMuted(isMuted);
  }, [isMuted]);

  const handleMicClick = () => {
    if (sessionState === 'idle' || sessionState === 'error') {
      startListening();
    } else if (sessionState === 'listening') {
      stopListening();
    }
    // While processing or speaking, the button does nothing to prevent interruptions.
  };

  const getButtonAppearance = () => {
    switch (sessionState) {
      case 'listening':
        return {
          bgColor: 'bg-red-500/20',
          borderColor: 'border-red-500',
          iconColor: 'text-red-500',
          pulse: true,
        };
      case 'processing':
      case 'speaking':
        return {
          bgColor: 'bg-blue-500/20',
          borderColor: 'border-blue-500',
          iconColor: 'text-blue-500',
          pulse: true,
        };
       case 'error':
         return {
          bgColor: 'bg-gray-700/20',
          borderColor: 'border-gray-500',
          iconColor: 'text-gray-500',
          pulse: false,
        };
      case 'idle':
      default:
        return {
          bgColor: 'bg-primary/20',
          borderColor: 'border-primary',
          iconColor: 'text-primary',
          pulse: false,
        };
    }
  };
  
  const getHelperText = () => {
    switch(sessionState) {
      case 'listening':
        return transcript ? <span className="italic text-muted-foreground/80">{transcript}</span> : 'Listening...';
      case 'processing':
        return 'Processing...';
      case 'speaking':
        return 'Sage is speaking...';
      case 'error':
        return error || 'An error occurred. Click to restart.';
      case 'idle':
      default:
        return 'Click the microphone to start the session.';
    }
  }

  const { bgColor, borderColor, iconColor, pulse } = getButtonAppearance();

  return (
    <div className="flex flex-col items-center justify-center h-full w-full bg-background text-foreground p-4">
      <div className="text-center mb-12">
        <h1 className="text-2xl font-light">AI Voice Therapy</h1>
      </div>

      <div className="flex flex-col items-center justify-center flex-grow">
        <motion.div
          className={`relative w-40 h-40 rounded-full flex items-center justify-center transition-colors duration-300 ${bgColor}`}
          animate={{ scale: pulse ? [1, 1.05, 1] : 1 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
        >
          <div
            className={`absolute inset-0 rounded-full border-2 ${borderColor} transition-colors duration-300 pointer-events-none`}
          />
          <Button
            className={`w-32 h-32 rounded-full bg-background hover:bg-accent/50 transition-all duration-300`}
            onClick={handleMicClick}
            disabled={sessionState === 'processing' || sessionState === 'speaking'}
          >
            <Mic className={`w-16 h-16 transition-colors duration-300 ${iconColor}`} />
          </Button>
        </motion.div>

        <div className="text-center mt-10 h-16">
           <h2 className="text-xl font-semibold">
            {sessionState === 'idle' ? 'Start Your Session' : 
             sessionState === 'error' ? 'Session Ended' : 'Session in Progress'}
          </h2>
          <p className="text-muted-foreground mt-2 min-h-[20px]">
            {getHelperText()}
          </p>
        </div>
      </div>

      <div className="w-full max-w-md flex justify-end">
        <Button
          variant="ghost"
          className="gap-2"
          onClick={() => setIsMuted(!isMuted)}
        >
          {isMuted ? <VolumeX /> : <Volume2 />}
          {isMuted ? 'Unmute' : 'Mute'}
        </Button>
      </div>
    </div>
  );
};

export default VoiceSession;