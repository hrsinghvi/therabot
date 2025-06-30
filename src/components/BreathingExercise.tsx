import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { Pause, Play, Square, Wind } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Breathing patterns configuration
const BREATHING_PATTERNS = {
  simple: { name: 'Simple Breathing', inhale: 6, hold1: 0, exhale: 6, hold2: 0 },
  box: { name: 'Box Breathing', inhale: 4, hold1: 4, exhale: 4, hold2: 4 },
  '4-7-8': { name: '4-7-8 Technique', inhale: 4, hold1: 7, exhale: 8, hold2: 0 },
  calm: { name: 'Calming Breath', inhale: 5, hold1: 2, exhale: 7, hold2: 1 },
};

const SESSION_DURATIONS = [
  { value: 30, label: '30 seconds' },
  { value: 60, label: '60 seconds' },
  { value: 90, label: '90 seconds' },
  { value: 120, label: '120 seconds' },
];

type BreathingPhase = 'inhale' | 'hold1' | 'exhale' | 'hold2';

export function BreathingExercise() {
  const [selectedPattern, setSelectedPattern] = useState<keyof typeof BREATHING_PATTERNS>('simple');
  const [sessionDuration, setSessionDuration] = useState(60); // 60 seconds default
  const [isActive, setIsActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentPhase, setCurrentPhase] = useState<BreathingPhase>('inhale');
  const [phaseTimer, setPhaseTimer] = useState(0);
  const [sessionTimer, setSessionTimer] = useState(0);
  const [totalCycles, setTotalCycles] = useState(0);


  const pattern = BREATHING_PATTERNS[selectedPattern];
  const phaseDuration = pattern[currentPhase];

  // Calculate session progress
  const sessionProgress = sessionDuration > 0 ? (sessionTimer / sessionDuration) * 100 : 0;
  const remainingTime = Math.max(0, sessionDuration - sessionTimer);

  // Format time display
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Get phase instruction text
  const getPhaseText = () => {
    switch (currentPhase) {
      case 'inhale': return 'Breathe In';
      case 'hold1': return 'Hold';
      case 'exhale': return 'Breathe Out';
      case 'hold2': return 'Hold';
      default: return '';
    }
  };

  // Move to next breathing phase
  const nextPhase = useCallback(() => {
    const phases: BreathingPhase[] = ['inhale', 'hold1', 'exhale', 'hold2'];
    const currentIndex = phases.indexOf(currentPhase);
    let nextIndex = (currentIndex + 1) % phases.length;
    
    // Skip phases with 0 duration
    while (pattern[phases[nextIndex]] === 0 && nextIndex !== currentIndex) {
      nextIndex = (nextIndex + 1) % phases.length;
    }
    
    setCurrentPhase(phases[nextIndex]);
    setPhaseTimer(0);
    
    // Increment cycle count when completing exhale
    if (phases[nextIndex] === 'inhale') {
      setTotalCycles(prev => prev + 1);
    }
  }, [currentPhase, pattern]);

  // Main timer effect
  useEffect(() => {
    if (!isActive || isPaused) return;

    const interval = setInterval(() => {
      setPhaseTimer(prev => {
        if (prev >= phaseDuration) {
          nextPhase();
          return 0;
        }
        return prev + 0.1;
      });

      setSessionTimer(prev => {
        if (prev >= sessionDuration) {
          setIsActive(false);
          return sessionDuration;
        }
        return prev + 0.1;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [isActive, isPaused, phaseDuration, sessionDuration, nextPhase]);

  // Start breathing session
  const startSession = () => {
    setIsActive(true);
    setIsPaused(false);
    setSessionTimer(0);
    setPhaseTimer(0);
    setTotalCycles(0);
    setCurrentPhase('inhale');
  };

  // Stop breathing session
  const stopSession = () => {
    setIsActive(false);
    setIsPaused(false);
    setSessionTimer(0);
    setPhaseTimer(0);
    setCurrentPhase('inhale');
  };

  // Toggle pause
  const togglePause = () => {
    setIsPaused(!isPaused);
  };

  // Calculate breathing circle scale and colors
  const getBreathingScale = () => {
    const progress = phaseDuration > 0 ? phaseTimer / phaseDuration : 0;
    
    switch (currentPhase) {
      case 'inhale':
        return 0.6 + (progress * 0.4); // Scale from 0.6 to 1.0
      case 'hold1':
        return 1.0; // Hold at full size
      case 'exhale':
        return 1.0 - (progress * 0.4); // Scale from 1.0 to 0.6
      case 'hold2':
        return 0.6; // Hold at small size
      default:
        return 0.6;
    }
  };

  const getBreathingColors = () => {
    // Use the specified color #4E85A2
    return 'from-[#4E85A2] to-[#6B9AC7]';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="h-full flex flex-col space-y-6 pt-6"
    >
      {/* Header */}
      <Card className="bg-gradient-to-br from-primary/10 to-transparent">
        <CardHeader>
          <div className="flex items-start justify-between gap-6">
            <div className="flex-1">
              <CardTitle className="text-2xl font-bold flex items-center gap-2">
                <Wind className="w-6 h-6 text-primary" />
                Breathing Exercise
              </CardTitle>
              <CardDescription>
                Find your calm with guided breathing exercises
              </CardDescription>
            </div>
            {!isActive && (
              <div className="flex flex-col gap-3 min-w-0">
                <div className="grid grid-cols-2 gap-3">
                  <div className="min-w-0">
                    <Select
                      value={selectedPattern}
                      onValueChange={(value: keyof typeof BREATHING_PATTERNS) => setSelectedPattern(value)}
                    >
                      <SelectTrigger className="h-9 text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(BREATHING_PATTERNS).map(([key, pattern]) => (
                          <SelectItem key={key} value={key}>
                            {pattern.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="min-w-0">
                    <Select
                      value={sessionDuration.toString()}
                      onValueChange={(value) => setSessionDuration(parseInt(value))}
                    >
                      <SelectTrigger className="h-9 text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {SESSION_DURATIONS.map((duration) => (
                          <SelectItem key={duration.value} value={duration.value.toString()}>
                            {duration.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="text-xs text-muted-foreground text-right">
                  {pattern.inhale}s in{pattern.hold1 > 0 && ` • ${pattern.hold1}s hold`} • {pattern.exhale}s out{pattern.hold2 > 0 && ` • ${pattern.hold2}s hold`}
                </div>
              </div>
            )}
            {isActive && (
              <div className="flex items-center gap-3">
                <Badge variant="secondary">{pattern.name}</Badge>
                <Badge variant="outline">{formatTime(sessionDuration)}</Badge>
              </div>
            )}
          </div>
        </CardHeader>
      </Card>



      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-0">
        {!isActive ? (
          // Pre-session view
          <Card className="bg-gradient-to-br from-secondary/20 to-transparent">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-center">Ready to breathe?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <p className="text-muted-foreground mb-4">
                  Get comfortable and prepare for a guided breathing session
                </p>
                <div className="flex items-center justify-center gap-2 mb-6">
                  <Badge variant="secondary">{pattern.name}</Badge>
                  <span className="text-muted-foreground">•</span>
                  <Badge variant="outline">{formatTime(sessionDuration)}</Badge>
                </div>
              </div>
              <Button onClick={startSession} size="lg" className="w-full">
                <Play className="h-5 w-5 mr-2" />
                Start Breathing Session
              </Button>
            </CardContent>
          </Card>
        ) : (
          // Active session view
          <div className="space-y-6">
            {/* Session Status Card */}
            <Card>
              <CardContent className="p-6">
                <div className="text-center">
                  <div className="text-3xl font-bold mb-2">{formatTime(Math.ceil(remainingTime))}</div>
                  <div className="text-muted-foreground mb-4">
                    Cycle {totalCycles + 1} • {pattern.name}
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <Badge variant={isPaused ? "destructive" : "default"}>
                      {isPaused ? "Paused" : getPhaseText()}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Breathing Animation Card */}
            <Card className="bg-gradient-to-br from-secondary/20 to-transparent">
              <CardContent className="p-12">
                <div className="flex flex-col items-center justify-center">
                  {/* Simple Circle Breathing Animation */}
                  <div className="relative mb-8">
                    <motion.div
                      className={`w-48 h-48 rounded-full bg-gradient-to-br ${getBreathingColors()} shadow-2xl`}
                      animate={{
                        scale: getBreathingScale(),
                      }}
                      transition={{
                        duration: 0.1,
                        ease: "easeInOut"
                      }}
                    />
                  </div>

                  {/* Instructions - moved below the animation */}
                  <div className="text-center mb-6">
                    <div className="text-xl font-semibold text-foreground mb-1">{getPhaseText()}</div>
                    <div className="text-sm text-muted-foreground">
                      {Math.ceil(phaseDuration - phaseTimer)}s remaining
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full max-w-md">
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-gradient-to-r from-primary to-primary/60"
                        style={{ width: `${sessionProgress}%` }}
                        transition={{ duration: 0.1 }}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Controls Card */}
            <Card className="bg-gradient-to-br from-secondary/20 to-transparent">
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={togglePause}
                    className="w-full sm:w-auto flex items-center gap-2"
                  >
                    {isPaused ? <Play className="h-5 w-5" /> : <Pause className="h-5 w-5" />}
                    {isPaused ? 'Resume' : 'Pause'}
                  </Button>
                  <Button
                    variant="destructive"
                    size="lg"
                    onClick={stopSession}
                    className="w-full sm:w-auto flex items-center gap-2"
                  >
                    <Square className="h-4 w-4" />
                    Stop Session
                  </Button>
                </div>
                <div className="mt-4 text-center text-sm text-muted-foreground">
                  Focus on your breath and let your mind relax
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Session Complete Modal */}
      <AnimatePresence>
        {sessionTimer >= sessionDuration && isActive && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-6 z-50"
            onClick={stopSession}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-background rounded-lg p-8 max-w-md w-full text-center"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-4xl mb-4">🌸</div>
              <h3 className="text-xl font-semibold mb-2">Session Complete</h3>
              <p className="text-muted-foreground mb-4">
                Great job! You completed {totalCycles} breathing cycles in {formatTime(sessionDuration)}.
              </p>
              <div className="flex gap-3">
                <Button onClick={startSession} className="flex-1">
                  Start Another
                </Button>
                <Button onClick={stopSession} variant="outline" className="flex-1">
                  Finish
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
} 