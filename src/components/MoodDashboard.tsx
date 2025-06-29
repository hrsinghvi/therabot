import { motion } from "framer-motion";
import { TrendingUp, Calendar, Heart, BarChart3 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const weeklyData = [
    { day: 'Mon', mood: 'Happy', emoji: '😊', intensity: 8, color: 'bg-green-500' },
    { day: 'Tue', mood: 'Neutral', emoji: '😐', intensity: 5, color: 'bg-yellow-500' },
    { day: 'Wed', mood: 'Anxious', emoji: '😰', intensity: 3, color: 'bg-red-500' },
    { day: 'Thu', mood: 'Peaceful', emoji: '😌', intensity: 7, color: 'bg-blue-500' },
    { day: 'Fri', mood: 'Happy', emoji: '😊', intensity: 9, color: 'bg-green-500' },
    { day: 'Sat', mood: 'Peaceful', emoji: '😌', intensity: 8, color: 'bg-blue-500' },
    { day: 'Sun', mood: 'Neutral', emoji: '😐', intensity: 6, color: 'bg-yellow-500' },
];

const insights = [
    "You've had 3 positive mood days this week - that's wonderful!",
    "Your emotional awareness has increased by 20% this month.",
    "Wednesday showed some anxiety - consider what patterns you notice.",
    "Weekend check-ins show consistent peace and balance."
];

const stats = [{
  icon: Calendar,
  label: "Days Tracked",
  value: "7",
  color: "text-blue-500"
}, {
  icon: Heart,
  label: "Positive Days",
  value: "71%",
  color: "text-green-500"
}, {
  icon: TrendingUp,
  label: "Week Streak",
  value: "3",
  color: "text-primary"
}];

const MoodDashboard = () => {
  return (
    <div className="space-y-8">
      {/* Overview Cards */}
      <div className="grid md:grid-cols-3 gap-6">
        {stats.map(stat => (
          <Card key={stat.label}>
            <CardContent className="p-6 flex flex-col items-center justify-center text-center">
              <stat.icon className={`w-8 h-8 mb-3 ${stat.color}`} />
              <div className="text-3xl font-bold text-foreground mb-1">{stat.value}</div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Weekly Mood Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            <span>This Week's Journey</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {weeklyData.map(day => (
              <div key={day.day} className="flex items-center gap-4 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                <div className="w-10 text-center font-medium text-sm text-muted-foreground">{day.day}</div>
                <div className="text-xl">{day.emoji}</div>
                <div className="font-medium capitalize text-sm w-20">{day.mood}</div>
                <div className="flex-1 bg-muted rounded-full h-2">
                  <div className={`h-2 rounded-full ${day.color}`} style={{ width: `${day.intensity * 10}%` }} />
                </div>
                <span className="text-xs text-muted-foreground w-8 text-right">{day.intensity}/10</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-primary" />
            <span>Personal Insights</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            {insights.map((insight, index) => (
              <li key={index} className="flex items-start gap-3 p-3 rounded-lg bg-secondary">
                <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                <p className="text-foreground text-sm">{insight}</p>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Encouragement */}
      <div className="text-center p-6 bg-secondary/50 rounded-lg">
        <h3 className="font-medium mb-1 text-lg">You're doing great! 🌱</h3>
        <p className="text-muted-foreground text-sm">
          Every feeling you acknowledge is a step toward understanding yourself better.
        </p>
      </div>
    </div>
  );
};

export default MoodDashboard;
