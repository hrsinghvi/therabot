import { motion } from "framer-motion";
import { Heart, TrendingUp, Calendar, MessageCircle, Mic, BarChart3 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const stats = [{
  icon: Calendar,
  label: "Days Tracked",
  value: "14",
  color: "text-blue-500"
}, {
  icon: Heart,
  label: "Positive Days",
  value: "9",
  color: "text-green-500"
}, {
  icon: TrendingUp,
  label: "Mood Trend",
  value: "+12%",
  color: "text-primary"
}];

const weeklyMoodData = [{
  day: 'Mon',
  mood: 'Happy',
  emoji: '😊',
  intensity: 8,
  color: 'bg-green-500'
}, {
  day: 'Tue',
  mood: 'Neutral',
  emoji: '😐',
  intensity: 5,
  color: 'bg-yellow-500'
}, {
  day: 'Wed',
  mood: 'Anxious',
  emoji: '😰',
  intensity: 3,
  color: 'bg-red-500'
}, {
  day: 'Thu',
  mood: 'Peaceful',
  emoji: '😌',
  intensity: 7,
  color: 'bg-blue-500'
}];

const quickActions = [{
  icon: Mic,
  label: "Voice Session",
  description: "Start speaking with CalmMind",
  color: "bg-primary/10 hover:bg-primary/20"
}, {
  icon: MessageCircle,
  label: "Text Chat",
  description: "Type your thoughts and feelings",
  color: "bg-blue-500/10 hover:bg-blue-500/20"
}, {
  icon: BarChart3,
  label: "View Insights",
  description: "See your mood patterns",
  color: "bg-green-500/10 hover:bg-green-500/20"
}];

const DashboardHome = () => {
  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="p-6 bg-secondary/50 rounded-lg">
        <h2 className="text-3xl font-light text-foreground mb-2">
          Welcome back to your safe space
        </h2>
        <p className="text-muted-foreground">
          Take a moment to check in with yourself. How are you feeling today?
        </p>
      </div>

      {/* Stats Cards */}
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

      {/* Mini Mood Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-primary" />
            <span>This Week's Mood Journey</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {weeklyMoodData.map(day => (
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
          <div className="mt-6 text-center">
            <Button variant="outline" size="sm">
              View Full Insights
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Daily Check-in */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-primary" />
            <span>Daily Check-in</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            How are you feeling right now? Take a moment to reflect on your emotions.
          </p>
          <Button>Start Check-in</Button>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-medium mb-4">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            {quickActions.map((action, index) => (
              <Card key={action.label} className={`border-0 ${action.color} cursor-pointer transition-all duration-300`}>
                <CardContent className="p-6">
                  <motion.div whileHover={{
                    rotate: 10
                  }} transition={{
                    type: "spring",
                    stiffness: 400
                  }}>
                    <action.icon className="w-8 h-8 text-primary mb-3" />
                  </motion.div>
                  <h4 className="font-medium mb-2">{action.label}</h4>
                  <p className="text-sm text-muted-foreground">{action.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Breathing Animation */}
      <Card>
        <CardHeader>
          <CardTitle className="text-center">
            <p className="text-sm text-muted-foreground">
              Take a deep breath. You're exactly where you need to be.
            </p>
          </CardTitle>
        </CardHeader>
      </Card>
    </div>
  );
};

export default DashboardHome;