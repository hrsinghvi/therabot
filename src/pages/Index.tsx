
import { useState } from "react";
import { Mic, MessageCircle, BarChart3, Settings, Moon, Sun, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import VoiceSession from "@/components/VoiceSession";
import DailyCheckin from "@/components/DailyCheckin";
import MoodDashboard from "@/components/MoodDashboard";
import TextChat from "@/components/TextChat";

const Index = () => {
  const [activeView, setActiveView] = useState<'home' | 'voice' | 'checkin' | 'dashboard' | 'text'>('home');
  const [isDarkMode, setIsDarkMode] = useState(false);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark');
  };

  const renderActiveView = () => {
    switch (activeView) {
      case 'voice':
        return <VoiceSession onBack={() => setActiveView('home')} />;
      case 'checkin':
        return <DailyCheckin onBack={() => setActiveView('home')} />;
      case 'dashboard':
        return <MoodDashboard onBack={() => setActiveView('home')} />;
      case 'text':
        return <TextChat onBack={() => setActiveView('home')} />;
      default:
        return renderHome();
    }
  };

  const renderHome = () => (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent/20 to-secondary/30 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8 pt-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center breathe">
              <Heart className="w-5 h-5 text-primary" />
            </div>
            <h1 className="text-2xl font-semibold text-foreground">CalmMind</h1>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="rounded-full hover:bg-accent"
          >
            {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </Button>
        </div>

        {/* Welcome Message */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-light text-foreground mb-4">
            Welcome to your safe space
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            I'm here to listen and support you. Whether you want to talk, reflect, or just check in with yourself, 
            this is your moment to breathe and be heard.
          </p>
        </div>

        {/* Main Actions */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card 
            className="group cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-[1.02] border-0 bg-gradient-to-br from-primary/10 to-primary/5"
            onClick={() => setActiveView('voice')}
          >
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4 float">
                <Mic className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-medium mb-2">Start Voice Session</h3>
              <p className="text-muted-foreground">
                Speak naturally and let me listen. Sometimes talking helps more than typing.
              </p>
            </CardContent>
          </Card>

          <Card 
            className="group cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-[1.02] border-0 bg-gradient-to-br from-accent/20 to-accent/10"
            onClick={() => setActiveView('checkin')}
          >
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-accent/40 rounded-full flex items-center justify-center mx-auto mb-4 float" style={{ animationDelay: '1s' }}>
                <Heart className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-medium mb-2">Daily Check-in</h3>
              <p className="text-muted-foreground">
                Take a moment to reflect on your day and how you're feeling right now.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Secondary Actions */}
        <div className="grid md:grid-cols-2 gap-4">
          <Button
            variant="outline"
            className="h-16 text-left justify-start gap-4 bg-card/50 hover:bg-accent/50 border-0"
            onClick={() => setActiveView('text')}
          >
            <MessageCircle className="w-5 h-5 text-primary" />
            <div>
              <div className="font-medium">Text Conversation</div>
              <div className="text-sm text-muted-foreground">Type when voice isn't an option</div>
            </div>
          </Button>

          <Button
            variant="outline"
            className="h-16 text-left justify-start gap-4 bg-card/50 hover:bg-accent/50 border-0"
            onClick={() => setActiveView('dashboard')}
          >
            <BarChart3 className="w-5 h-5 text-primary" />
            <div>
              <div className="font-medium">Mood Insights</div>
              <div className="text-sm text-muted-foreground">Track your emotional journey</div>
            </div>
          </Button>
        </div>

        {/* Breathing Animation */}
        <div className="flex justify-center mt-12">
          <div className="relative">
            <div className="w-24 h-24 bg-primary/10 rounded-full breathe"></div>
            <div className="absolute inset-0 w-24 h-24 border-2 border-primary/30 rounded-full pulse-soft"></div>
          </div>
        </div>

        <div className="text-center mt-4 text-sm text-muted-foreground">
          Take a deep breath. You're exactly where you need to be.
        </div>
      </div>
    </div>
  );

  return renderActiveView();
};

export default Index;
