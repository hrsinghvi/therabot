import { useState } from "react";
import { ArrowLeft, Heart, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { dailyCheckinService } from "@/services/supabase";

interface DailyCheckinProps {
  onBack: () => void;
}

const DailyCheckin = ({ onBack }: DailyCheckinProps) => {
  const [selectedMood, setSelectedMood] = useState<string>("");
  const [reflection, setReflection] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const moods = [
    { emoji: "😊", label: "Happy", value: "happy", color: "bg-green-100 border-green-300 text-green-800" },
    { emoji: "😌", label: "Peaceful", value: "peaceful", color: "bg-blue-100 border-blue-300 text-blue-800" },
    { emoji: "😐", label: "Neutral", value: "neutral", color: "bg-gray-100 border-gray-300 text-gray-800" },
    { emoji: "😔", label: "Sad", value: "sad", color: "bg-blue-100 border-blue-400 text-blue-900" },
    { emoji: "😰", label: "Anxious", value: "anxious", color: "bg-yellow-100 border-yellow-400 text-yellow-900" },
    { emoji: "😠", label: "Frustrated", value: "frustrated", color: "bg-red-100 border-red-300 text-red-800" },
  ];

  const handleSubmit = async () => {
    if (!selectedMood) return;
    
    try {
      await dailyCheckinService.create({
        mood: selectedMood,
        reflection: reflection
      });
      setSubmitted(true);
    } catch (error) {
        console.error("Error creating daily checkin:", error);
        // Optionally, show an error message to the user
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-accent/20 to-secondary/30 p-4">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-8 pt-4">
            <Button
              variant="ghost"
              onClick={onBack}
              className="gap-2 hover:bg-accent/50"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
            <h1 className="text-xl font-medium">Daily Check-in</h1>
            <div></div>
          </div>

          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4 breathe">
              <Heart className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-2xl font-light mb-2">Thank you for checking in</h2>
            <p className="text-muted-foreground">Your reflection has been saved</p>
          </div>

          <Card className="border-0 bg-primary/10 mb-6">
            <CardContent className="p-6">
              <h3 className="font-medium mb-4">Your reflection today:</h3>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-2xl">{moods.find(m => m.value === selectedMood)?.emoji}</span>
                <span className="font-medium">{moods.find(m => m.value === selectedMood)?.label}</span>
              </div>
              {reflection && (
                <p className="text-muted-foreground mb-4">"{reflection}"</p>
              )}
            </CardContent>
          </Card>

          <div className="text-center mt-8">
            <Button
              onClick={onBack}
              className="bg-primary hover:bg-primary/90"
            >
              Continue your journey
            </Button>
          </div>
        </div>
      </div>
    );
  }

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
          <h1 className="text-xl font-medium">Daily Check-in</h1>
          <div></div>
        </div>

        {/* Welcome */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-light mb-4">How are you feeling today?</h2>
          <p className="text-muted-foreground">
            Take a moment to pause and reflect on your emotional state right now.
          </p>
        </div>

        {/* Mood Selection */}
        <div className="mb-8">
          <h3 className="font-medium mb-4">Choose what resonates with you:</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {moods.map((mood) => (
              <Button
                key={mood.value}
                variant="outline"
                className={`h-20 flex-col gap-2 transition-all duration-200 ${
                  selectedMood === mood.value 
                    ? `${mood.color} border-2 scale-105` 
                    : 'border hover:bg-accent/50'
                }`}
                onClick={() => setSelectedMood(mood.value)}
              >
                <span className="text-2xl">{mood.emoji}</span>
                <span className="text-sm font-medium">{mood.label}</span>
              </Button>
            ))}
          </div>
        </div>

        {/* Reflection */}
        <div className="mb-8">
          <h3 className="font-medium mb-4">What's on your mind? (Optional)</h3>
          <Textarea
            placeholder="Share any thoughts, experiences, or feelings from today. This is your safe space..."
            value={reflection}
            onChange={(e) => setReflection(e.target.value)}
            className="min-h-24 resize-none border-0 bg-card/50 focus:bg-card"
            rows={4}
          />
        </div>

        {/* Submit */}
        <div className="text-center">
          <Button
            onClick={handleSubmit}
            disabled={!selectedMood}
            className="bg-primary hover:bg-primary/90 px-8 gap-2"
          >
            <Send className="w-4 h-4" />
            Complete Check-in
          </Button>
        </div>

        <div className="mt-8 p-4 bg-muted/50 rounded-lg">
          <p className="text-sm text-muted-foreground text-center">
            🔒 Your check-ins are private and help track your emotional patterns over time.
          </p>
        </div>
      </div>
    </div>
  );
};

export default DailyCheckin;
