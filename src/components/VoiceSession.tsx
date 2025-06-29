import { motion } from "framer-motion";
import { Mic, MicOff, Volume2, VolumeX } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState } from "react";

const VoiceSession = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  const toggleRecording = () => setIsRecording(!isRecording);
  const toggleMute = () => setIsMuted(!isMuted);

  return (
    <div className="pt-6 h-[calc(100vh-60px)]">
      <Card className="h-full flex flex-col">
        <CardHeader>
          <CardTitle className="text-center text-xl font-medium">AI Voice Therapy</CardTitle>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col items-center justify-center text-center space-y-8">
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
              {isRecording ? <MicOff size={40} /> : <Mic size={40} />}
            </div>
          </motion.div>

          <div className="space-y-2">
            <p className="font-medium text-lg">
              {isRecording 
                ? "I'm listening..."
                : "Start Your Session"
              }
            </p>
            <p className="text-muted-foreground text-sm">
              {isRecording
                ? "Feel free to share what's on your mind. I'm here for you."
                : "Click the microphone to begin your voice therapy session."
              }
            </p>
          </div>
          
          <Button
            variant="ghost"
            onClick={toggleMute}
            className="gap-2 mx-auto"
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            <span>{isMuted ? 'Unmute' : 'Mute'}</span>
          </Button>

        </CardContent>
      </Card>
    </div>
  );
};

export default VoiceSession;
