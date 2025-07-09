import React, { useEffect, useState } from 'react';
import { motion } from "framer-motion";
import { Heart, TrendingUp, Activity, Calendar, MessageCircle, Mic, BarChart3, Brain, Sparkles, TrendingDown, BookOpen } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { moodOrchestrator } from '@/services/mood-orchestrator';
import { processMoodData } from '@/lib/mood-processing';
import { MOOD_CATEGORIES } from '@/services/gemini';
import { format } from 'date-fns';

const DashboardHome = () => {
  const [stats, setStats] = useState([]);
  const [weeklyMoodData, setWeeklyMoodData] = useState([]);
  const [insights, setInsights] = useState([]);
  const [todaysMood, setTodaysMood] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const [recentAnalyses, setRecentAnalyses] = useState([]);

  useEffect(() => {
    const fetchMoodData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Get comprehensive mood analytics with 30 days for better insights
        const analytics = await moodOrchestrator.getMoodAnalytics(30);
        const { stats, weeklyData, insights } = processMoodData(analytics.summaries);
        
        setStats(stats);
        setWeeklyMoodData(weeklyData); // Show all data instead of slicing
        setInsights(insights); // Show all insights instead of limiting
        setTodaysMood(analytics.todaysSummary);
        setRecentAnalyses(analytics.recentAnalyses || []);
      } catch (error) {
        console.error("Error fetching mood analytics:", error);
        setError("Unable to load mood data. Please try again.");
        // Set fallback data
        setStats([
          { icon: Calendar, label: "Days Tracked", value: "0", color: "text-blue-500" },
          { icon: Heart, label: "Positive Days", value: "0%", color: "text-green-500" },
          { icon: TrendingUp, label: "Mood Trend", value: "N/A", color: "text-primary" }
        ]);
        setWeeklyMoodData([]);
        setInsights(["Start tracking your mood to see insights."]);
      } finally {
        setLoading(false);
      }
    };

    fetchMoodData();
  }, []);

  const StatCard = ({ icon: Icon, label, value, color, trend = null }) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6 flex flex-col items-center justify-center text-center">
        <Icon className={`w-8 h-8 mb-3 ${color || 'text-primary'}`} />
        <div className="text-3xl font-bold text-foreground mb-1">{value}</div>
        <div className="text-sm text-muted-foreground">{label}</div>
        {trend && (
          <Badge variant={trend.type === 'positive' ? 'default' : trend.type === 'negative' ? 'destructive' : 'secondary'} className="mt-2 text-xs">
            {trend.type === 'positive' && <TrendingUp className="w-3 h-3 mr-1" />}
            {trend.type === 'negative' && <TrendingDown className="w-3 h-3 mr-1" />}
            {trend.text}
          </Badge>
        )}
      </CardContent>
    </Card>
  );

  const TodayMoodCard = () => {
    if (!todaysMood || todaysMood.analysis_count === 0) {
      return (
        <Card className="bg-gradient-to-br from-primary/5 to-transparent">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="w-5 h-5 text-primary" />
              <span>Today's Mood Analysis</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-6">
              <div className="text-4xl mb-3">😐</div>
              <h3 className="font-semibold mb-2">No mood data for today</h3>
              <p className="text-muted-foreground text-sm mb-4">
                Your mood will be analyzed automatically as you use the app.
              </p>
              <div className="flex flex-wrap gap-2 justify-center">
                <Button size="sm" onClick={() => navigate("/journal")} className="flex items-center gap-1">
                  <BookOpen className="w-3 h-3" />
                  Journal Entry
                </Button>
                <Button size="sm" variant="outline" onClick={() => navigate("/voice")} className="flex items-center gap-1">
                  <Mic className="w-3 h-3" />
                  Voice Session
                </Button>
                <Button size="sm" variant="outline" onClick={() => navigate("/chat")} className="flex items-center gap-1">
                  <MessageCircle className="w-3 h-3" />
                  AI Chat
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      );
    }

    const moodMeta = MOOD_CATEGORIES[todaysMood.primary_mood];
    const confidenceColor = todaysMood.overall_confidence > 0.7 ? 'text-green-500' : 
                            todaysMood.overall_confidence > 0.4 ? 'text-yellow-500' : 'text-red-500';

    return (
      <Card className="bg-gradient-to-br from-primary/5 to-transparent">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-primary" />
            <span>Today's Mood Analysis</span>
            <Badge variant="secondary" className="ml-auto">
              <Sparkles className="w-3 h-3 mr-1" />
              AI Analyzed
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="text-5xl">{moodMeta.emoji}</div>
              <div>
                <div className="font-bold text-xl capitalize">{todaysMood.primary_mood}</div>
                <div className="text-muted-foreground">
                  Intensity: <span className="font-medium">{todaysMood.average_intensity}/10</span>
                </div>
                <div className={`text-sm ${confidenceColor}`}>
                  {Math.round(todaysMood.overall_confidence * 100)}% confidence
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-muted-foreground">
                <span className="font-medium">{todaysMood.analysis_count}</span> analyses
              </div>
              <div className="text-xs text-muted-foreground">
                Updated {new Date(todaysMood.last_updated).toLocaleTimeString()}
              </div>
            </div>
          </div>
          
          {todaysMood.key_emotions && todaysMood.key_emotions.length > 0 && (
            <div className="mt-4 pt-4 border-t border-border/50">
              <div className="text-sm text-muted-foreground mb-2">Key emotions detected:</div>
              <div className="flex flex-wrap gap-1">
                {todaysMood.key_emotions.slice(0, 6).map((emotion, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {emotion}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          
          <div className="mt-4 p-3 bg-muted/50 rounded-lg">
            <div className="text-xs text-muted-foreground mb-1">AI Analysis:</div>
            <p className="text-sm">{todaysMood.reasoning}</p>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-8 pt-6">
      {/* Welcome Section */}
      <div className="p-6 bg-secondary/50 rounded-lg">
        <h2 className="text-3xl font-light text-foreground mb-2">
          Welcome back to your safe space
        </h2>
        <p className="text-muted-foreground">
          Take a moment to check in with yourself. How are you feeling today?
        </p>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p>Loading your mood analytics...</p>
        </div>
      ) : error ? (
        <div className="text-center py-8">
          <p className="text-red-500 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      ) : (
        <>
          {/* Today's Mood Analysis */}
          <TodayMoodCard />

          {/* Stats Cards */}
          <div className="grid md:grid-cols-3 gap-6">
            {stats.length > 0 ? (
              stats.map(stat => <StatCard key={stat.label} {...stat} />)
            ) : (
              <>
                <StatCard icon={Calendar} label="Days Tracked" value="0" color="text-blue-500" />
                <StatCard icon={Heart} label="Positive Days" value="0%" color="text-green-500" />
                <StatCard icon={Activity} label="Mood Trend" value="N/A" color="text-primary" />
              </>
            )}
          </div>

          {/* Recent Mood Journey */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary" />
                <span>Recent Mood Journey</span>
                <Badge variant="secondary" className="ml-auto">
                  <Brain className="w-3 h-3 mr-1" />
                  AI Powered
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {weeklyMoodData.length > 0 ? (
                <div className="space-y-4">
                  {weeklyMoodData.map(day => (
                    <div key={day.day} className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="w-12 text-center font-medium text-sm text-muted-foreground">{day.day}</div>
                      <div className="text-2xl">{day.emoji}</div>
                      <div className="font-medium capitalize text-sm w-24">{day.mood}</div>
                      <div className="flex-1 bg-muted rounded-full h-3">
                        <div className={`h-3 rounded-full ${day.color}`} style={{ width: `${day.intensity * 10}%` }} />
                      </div>
                      <span className="text-sm text-muted-foreground w-12 text-right">{day.intensity}/10</span>
                      {day.analysisCount > 0 && (
                        <Badge variant="outline" className="text-xs">
                          {day.analysisCount}x
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <BarChart3 className="mx-auto h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-4 text-lg font-semibold">No mood data yet</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Start using the app to see your AI-analyzed mood journey here.
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2 justify-center">
                    <Button size="sm" onClick={() => navigate("/journal")} className="flex items-center gap-1">
                      <BookOpen className="w-3 h-3" />
                      Start Journal
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => navigate("/voice")} className="flex items-center gap-1">
                      <Mic className="w-3 h-3" />
                      Voice Session
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => navigate("/chat")} className="flex items-center gap-1">
                      <MessageCircle className="w-3 h-3" />
                      AI Chat
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* AI Insights */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                <span>AI-Powered Insights</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {insights.length > 0 ? (
                <div className="space-y-3">
                  {insights.map((insight, index) => (
                    <div key={index} className="flex items-start gap-3 p-4 rounded-lg bg-gradient-to-r from-muted/50 to-transparent border border-border/50">
                      <Brain className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                      <p className="text-foreground text-sm leading-relaxed">{insight}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <TrendingUp className="mx-auto h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-4 text-lg font-semibold">AI insights will appear here</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    The more you interact with the app, the more personalized insights our AI will generate.
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2 justify-center">
                    <Button size="sm" onClick={() => navigate("/journal")} variant="outline" className="flex items-center gap-1">
                      <BookOpen className="w-3 h-3" />
                      Write in Journal
                    </Button>
                    <Button size="sm" onClick={() => navigate("/chat")} variant="outline" className="flex items-center gap-1">
                      <MessageCircle className="w-3 h-3" />
                      Chat with AI
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

        </>
      )}
    </div>
  );
};

export default DashboardHome;