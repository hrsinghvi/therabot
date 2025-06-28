
import { ArrowLeft, TrendingUp, Calendar, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface MoodDashboardProps {
  onBack: () => void;
}

const MoodDashboard = ({ onBack }: MoodDashboardProps) => {
  // Mock data for demonstration
  const weeklyData = [
    { day: 'Mon', mood: 'happy', emoji: '😊', intensity: 8 },
    { day: 'Tue', mood: 'neutral', emoji: '😐', intensity: 5 },
    { day: 'Wed', mood: 'anxious', emoji: '😰', intensity: 3 },
    { day: 'Thu', mood: 'peaceful', emoji: '😌', intensity: 7 },
    { day: 'Fri', mood: 'happy', emoji: '😊', intensity: 9 },
    { day: 'Sat', mood: 'peaceful', emoji: '😌', intensity: 8 },
    { day: 'Sun', mood: 'neutral', emoji: '😐', intensity: 6 },
  ];

  const insights = [
    "You've had 3 positive mood days this week - that's wonderful!",
    "Your emotional awareness has increased by 20% this month.",
    "Wednesday showed some anxiety - consider what patterns you notice.",
    "Weekend check-ins show consistent peace and balance."
  ];

  const getIntensityColor = (intensity: number) => {
    if (intensity >= 8) return 'bg-green-500';
    if (intensity >= 6) return 'bg-blue-500';
    if (intensity >= 4) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent/20 to-secondary/30 p-4">
      <div className="max-w-4xl mx-auto">
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
          <h1 className="text-xl font-medium">Mood Insights</h1>
          <div></div>
        </div>

        {/* Overview Cards */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <Card className="border-0 bg-gradient-to-br from-primary/10 to-primary/5">
            <CardContent className="p-6 text-center">
              <TrendingUp className="w-8 h-8 text-primary mx-auto mb-2" />
              <div className="text-2xl font-bold text-foreground">7</div>
              <div className="text-sm text-muted-foreground">Days tracked</div>
            </CardContent>
          </Card>
          
          <Card className="border-0 bg-gradient-to-br from-accent/20 to-accent/10">
            <CardContent className="p-6 text-center">
              <Heart className="w-8 h-8 text-primary mx-auto mb-2" />
              <div className="text-2xl font-bold text-foreground">71%</div>
              <div className="text-sm text-muted-foreground">Positive days</div>
            </CardContent>
          </Card>
          
          <Card className="border-0 bg-gradient-to-br from-secondary/20 to-secondary/10">
            <CardContent className="p-6 text-center">
              <Calendar className="w-8 h-8 text-primary mx-auto mb-2" />
              <div className="text-2xl font-bold text-foreground">3</div>
              <div className="text-sm text-muted-foreground">Week streak</div>
            </CardContent>
          </Card>
        </div>

        {/* Weekly Mood Chart */}
        <Card className="mb-8 border-0 bg-card/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              This Week's Journey
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {weeklyData.map((day, index) => (
                <div key={day.day} className="flex items-center gap-4 p-3 rounded-lg hover:bg-accent/20 transition-colors">
                  <div className="w-12 text-center font-medium text-sm text-muted-foreground">
                    {day.day}
                  </div>
                  <div className="text-2xl">{day.emoji}</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium capitalize">{day.mood}</span>
                      <div className="flex-1 bg-muted rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all duration-500 ${getIntensityColor(day.intensity)}`}
                          style={{ width: `${day.intensity * 10}%` }}
                        />
                      </div>
                      <span className="text-sm text-muted-foreground w-8">{day.intensity}/10</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Insights */}
        <Card className="border-0 bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Personal Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {insights.map((insight, index) => (
                <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-background/50">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-foreground">{insight}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Encouragement */}
        <div className="text-center mt-8 p-6 bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg">
          <h3 className="font-medium mb-2">You're doing great! 🌱</h3>
          <p className="text-muted-foreground">
            Regular check-ins are helping you build emotional awareness. 
            Every feeling you acknowledge is a step toward understanding yourself better.
          </p>
        </div>
      </div>
    </div>
  );
};

export default MoodDashboard;
