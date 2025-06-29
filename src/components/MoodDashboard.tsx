import React, { useEffect, useState } from 'react';
import { motion } from "framer-motion";
import { TrendingUp, Calendar, Heart, BarChart3, TrendingDown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from './ui/button';
import { moodService, type MoodEntry } from '@/services/supabase';
import { processMoodData } from '@/lib/mood-processing';

const MoodDashboard = () => {
  const [stats, setStats] = useState([]);
  const [weeklyData, setWeeklyData] = useState([]);
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMoodData = async () => {
      try {
        setLoading(true);
        const entries = await moodService.list();
        const { stats, weeklyData, insights } = processMoodData(entries);
        setStats(stats);
        setWeeklyData(weeklyData);
        setInsights(insights);
      } catch (error) {
        console.error("Error fetching mood entries:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMoodData();
  }, []);

  const StatCard = ({ icon: Icon, label, value, color }) => (
    <Card>
      <CardContent className="p-6 flex flex-col items-center justify-center text-center">
        <Icon className={`w-8 h-8 mb-3 ${color || 'text-primary'}`} />
        <div className="text-3xl font-bold text-foreground mb-1">{value}</div>
        <div className="text-sm text-muted-foreground">{label}</div>
      </CardContent>
    </Card>
  );

  return (
    <motion.div 
      className="space-y-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {loading ? <p>Loading dashboard...</p> : <>
      {/* Overview Cards */}
      <div className="grid md:grid-cols-3 gap-6">
        {stats.length > 0 ? (
          stats.map(stat => <StatCard key={stat.label} {...stat} />)
        ) : (
          <>
            <StatCard icon={Calendar} label="Days Tracked" value="0" color="text-blue-500" />
            <StatCard icon={Heart} label="Positive Days" value="0%" color="text-green-500" />
            <StatCard icon={TrendingUp} label="Week Streak" value="0" color="text-primary" />
          </>
        )}
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
          {weeklyData.length > 0 ? (
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
          ) : (
            <div className="text-center py-12">
              <BarChart3 className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">No mood data yet</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Start tracking your mood to see your journey here.
              </p>
              <Button className="mt-4">Track Today's Mood</Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            <span>Personal Insights</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {insights.length > 0 ? (
            <ul className="space-y-3">
              {insights.map((insight, index) => (
                <li key={index} className="flex items-start gap-3 p-3 rounded-lg bg-secondary">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                  <p className="text-foreground text-sm">{insight}</p>
                </li>
              ))}
            </ul>
          ) : (
             <div className="text-center py-12">
              <TrendingUp className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">Insights will appear here</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                The more you track, the more personalized insights you'll get.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Encouragement */}
      <div className="text-center p-6 bg-secondary/50 rounded-lg">
        <h3 className="font-medium mb-1 text-lg">You're doing great! 🌱</h3>
        <p className="text-muted-foreground text-sm">
          Every feeling you acknowledge is a step toward understanding yourself better.
        </p>
      </div>
      </>}
    </motion.div>
  );
};

export default MoodDashboard;
