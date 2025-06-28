
import { motion } from "framer-motion";
import { Heart, TrendingUp, Calendar, MessageCircle, Mic, BarChart3 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const DashboardHome = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: 0.2,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  const stats = [
    { icon: Calendar, label: "Days Tracked", value: "14", color: "text-blue-500" },
    { icon: Heart, label: "Positive Days", value: "9", color: "text-green-500" },
    { icon: TrendingUp, label: "Mood Trend", value: "+12%", color: "text-primary" },
  ];

  const quickActions = [
    { icon: Mic, label: "Voice Session", description: "Start speaking with CalmMind", color: "bg-primary/10 hover:bg-primary/20" },
    { icon: MessageCircle, label: "Text Chat", description: "Type your thoughts and feelings", color: "bg-blue-500/10 hover:bg-blue-500/20" },
    { icon: BarChart3, label: "View Insights", description: "See your mood patterns", color: "bg-green-500/10 hover:bg-green-500/20" },
  ];

  // Mock mood data for mini insights
  const weeklyMoodData = [
    { day: 'Mon', mood: 'happy', emoji: '😊', intensity: 8 },
    { day: 'Tue', mood: 'neutral', emoji: '😐', intensity: 5 },
    { day: 'Wed', mood: 'anxious', emoji: '😰', intensity: 3 },
    { day: 'Thu', mood: 'peaceful', emoji: '😌', intensity: 7 },
    { day: 'Fri', mood: 'happy', emoji: '😊', intensity: 9 },
    { day: 'Sat', mood: 'peaceful', emoji: '😌', intensity: 8 },
    { day: 'Sun', mood: 'neutral', emoji: '😐', intensity: 6 },
  ];

  const getIntensityColor = (intensity: number) => {
    if (intensity >= 8) return 'bg-green-500';
    if (intensity >= 6) return 'bg-blue-500';
    if (intensity >= 4) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8"
    >
      {/* Welcome Section */}
      <motion.div variants={itemVariants} className="text-center">
        <motion.h2 
          className="text-4xl font-light text-foreground mb-4"
          animate={{ opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 3, repeat: Infinity }}
        >
          Welcome back to your safe space
        </motion.h2>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Take a moment to check in with yourself. How are you feeling today?
        </p>
      </motion.div>

      {/* Stats Cards */}
      <motion.div variants={itemVariants} className="grid md:grid-cols-3 gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            whileHover={{ scale: 1.05, y: -5 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <Card className="border-0 bg-card/50 backdrop-blur-sm hover:bg-card/80 transition-all duration-300">
              <CardContent className="p-6 text-center">
                <motion.div
                  animate={{ rotateY: [0, 360] }}
                  transition={{ duration: 2, delay: index * 0.2, repeat: Infinity, repeatDelay: 8 }}
                >
                  <stat.icon className={`w-8 h-8 mx-auto mb-3 ${stat.color}`} />
                </motion.div>
                <div className="text-3xl font-bold text-foreground mb-1">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Mini Mood Insights */}
      <motion.div variants={itemVariants}>
        <Card className="border-0 bg-gradient-to-r from-primary/10 to-accent/10 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <BarChart3 className="w-5 h-5 text-primary" />
              </motion.div>
              This Week's Mood Journey
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {weeklyMoodData.slice(0, 4).map((day, index) => (
                <motion.div
                  key={day.day}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center gap-4 p-2 rounded-lg hover:bg-background/30 transition-colors"
                >
                  <div className="w-10 text-center font-medium text-sm text-muted-foreground">
                    {day.day}
                  </div>
                  <div className="text-xl">{day.emoji}</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium capitalize text-sm">{day.mood}</span>
                      <div className="flex-1 bg-muted rounded-full h-1.5">
                        <div 
                          className={`h-1.5 rounded-full transition-all duration-500 ${getIntensityColor(day.intensity)}`}
                          style={{ width: `${day.intensity * 10}%` }}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground w-8">{day.intensity}/10</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
            <div className="mt-4 text-center">
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button variant="outline" size="sm" className="text-xs">
                  View Full Insights
                </Button>
              </motion.div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Daily Check-in */}
      <motion.div variants={itemVariants}>
        <Card className="border-0 bg-gradient-to-r from-primary/10 to-accent/10 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Heart className="w-5 h-5 text-primary" />
              </motion.div>
              Daily Check-in
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              How are you feeling right now? Take a moment to reflect on your emotions.
            </p>
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button className="bg-primary hover:bg-primary/90 transition-colors duration-300">
                Start Check-in
              </Button>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Quick Actions */}
      <motion.div variants={itemVariants}>
        <h3 className="text-xl font-medium mb-4">Quick Actions</h3>
        <div className="grid md:grid-cols-3 gap-4">
          {quickActions.map((action, index) => (
            <motion.div
              key={action.label}
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <Card className={`border-0 ${action.color} cursor-pointer transition-all duration-300`}>
                <CardContent className="p-6">
                  <motion.div
                    whileHover={{ rotate: 10 }}
                    transition={{ type: "spring", stiffness: 400 }}
                  >
                    <action.icon className="w-8 h-8 text-primary mb-3" />
                  </motion.div>
                  <h4 className="font-medium mb-2">{action.label}</h4>
                  <p className="text-sm text-muted-foreground">{action.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Breathing Animation */}
      <motion.div variants={itemVariants} className="flex justify-center">
        <div className="relative">
          <motion.div
            className="w-24 h-24 bg-primary/20 rounded-full"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.5, 0.8, 0.5]
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          <motion.div
            className="absolute inset-0 w-24 h-24 border-2 border-primary/30 rounded-full"
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.8, 0.2, 0.8]
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0.5
            }}
          />
        </div>
      </motion.div>

      <motion.div variants={itemVariants} className="text-center">
        <p className="text-sm text-muted-foreground">
          Take a deep breath. You're exactly where you need to be.
        </p>
      </motion.div>
    </motion.div>
  );
};

export default DashboardHome;
