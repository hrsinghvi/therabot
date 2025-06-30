import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { 
  Calendar, 
  Target, 
  TrendingUp, 
  CheckCircle, 
  Circle, 
  Plus,
  Brain,
  Sparkles,
  Clock,
  Star,
  ArrowRight,
  BarChart3,
  Heart,
  Book,
  Zap,
  Users,
  Shield,
  Smile,
  RefreshCw,
  AlertTriangle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { moodAnalysisService, planService, type WeeklyPlan as DBWeeklyPlan, type Exercise as DBExercise } from '@/services/supabase';
import { analyzeMoodFromText } from '@/services/gemini';
import { planGenerator, type MoodPattern } from '@/services/planGenerator';

// Use the types from Supabase service directly
type WeeklyPlan = DBWeeklyPlan;
type Exercise = DBExercise;

interface MoodInsight {
  primaryMood: string;
  frequency: number;
  intensity: number;
  keyEmotions: string[];
}

const WeeklyPlans: React.FC = () => {
  const [currentPlan, setCurrentPlan] = useState<WeeklyPlan | null>(null);
  const [pastPlans, setPastPlans] = useState<WeeklyPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [moodInsights, setMoodInsights] = useState<MoodInsight[]>([]);
  const [error, setError] = useState<string | null>(null);

  const analyzeMoodData = useCallback(async () => {
    try {
      const recentAnalyses = await moodAnalysisService.list(50);
      if (recentAnalyses.length < 3) { // Require a minimum amount of data
        setMoodInsights([]);
        return;
      }
      const moodGroups: { [key: string]: any[] } = {};
      recentAnalyses.forEach(analysis => {
        if (!moodGroups[analysis.primary_mood]) {
          moodGroups[analysis.primary_mood] = [];
        }
        moodGroups[analysis.primary_mood].push(analysis);
      });
      const insights: MoodInsight[] = Object.entries(moodGroups).map(([mood, analyses]) => ({
        primaryMood: mood,
        frequency: analyses.length,
        intensity: analyses.reduce((sum, a) => sum + a.intensity, 0) / analyses.length,
        keyEmotions: [...new Set(analyses.flatMap(a => a.key_emotions || []))].slice(0, 5),
      }));
      insights.sort((a, b) => b.frequency - a.frequency);
      setMoodInsights(insights);
    } catch (error) {
      console.error('Error analyzing mood data:', error);
      setError('Could not analyze mood patterns.');
    }
  }, []);

  const loadPlansAndInsights = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const plans = await planService.list();
      const current = plans.find((p) => !p.completed && isCurrentWeek(p.week_of));
      const past = plans.filter((p) => p.completed || !isCurrentWeek(p.week_of));
      setCurrentPlan(current || null);
      setPastPlans(past);
      await analyzeMoodData();
    } catch (error) {
      console.error('Error loading plans:', error);
      setError('Failed to load weekly plans.');
    } finally {
      setLoading(false);
    }
  }, [analyzeMoodData]);

  useEffect(() => {
    loadPlansAndInsights();
  }, [loadPlansAndInsights]);

  const generateNewPlan = async () => {
    if (moodInsights.length === 0) {
      setError('Not enough mood data to generate a plan. Use the journal or chat features more to build up your mood profile.');
      return;
    }
    if(currentPlan) {
      setError('You already have an active plan for this week. Complete it before generating a new one.');
      return;
    }

    setGenerating(true);
    setError(null);
    try {
      const topMoodInsight = moodInsights[0];
      const recentAnalyses = await moodAnalysisService.list(10);
      const recentEntries = recentAnalyses
        .filter(analysis => analysis.raw_content && analysis.raw_content.length > 20)
        .slice(0, 3)
        .map(analysis => analysis.raw_content.substring(0, 100));

      const moodPattern: MoodPattern = {
        primaryMood: topMoodInsight.primaryMood,
        frequency: topMoodInsight.frequency,
        intensity: topMoodInsight.intensity,
        keyEmotions: topMoodInsight.keyEmotions,
        recentEntries,
      };

      const generatedPlan = await planGenerator.generateWeeklyPlan(moodPattern);
      
      const weekOf = getStartOfWeek(new Date()).toISOString().split('T')[0];
      
      const planData = {
        title: generatedPlan.title,
        description: generatedPlan.description,
        target_area: generatedPlan.targetArea,
        confidence: generatedPlan.confidence,
        week_of: weekOf,
        insights: generatedPlan.insights,
      };
      
      const exercisesData = generatedPlan.exercises.map((exercise, index) => ({
        title: exercise.title,
        description: exercise.description,
        type: exercise.type,
        duration: exercise.duration,
        difficulty: exercise.difficulty,
        due_date: new Date(Date.now() + (index + 1) * 24 * 60 * 60 * 1000).toISOString(),
        instructions: exercise.instructions,
        benefits: exercise.benefits
      }));

      const newPlan = await planService.create(planData as any, exercisesData as any);
      setCurrentPlan(newPlan);

    } catch (error) {
      console.error('Error generating plan:', error);
      setError('Failed to generate weekly plan. The AI service may be temporarily unavailable.');
    } finally {
      setGenerating(false);
    }
  };

  const toggleExerciseCompletion = async (exerciseId: string) => {
    if (!currentPlan) return;

    const exercise = currentPlan.exercises?.find(e => e.id === exerciseId);
    if (!exercise) return;

    try {
      const updatedExercise = await planService.updateExerciseCompletion(exerciseId, !exercise.completed);
      
      const updatedExercises = currentPlan.exercises!.map(e => e.id === exerciseId ? updatedExercise : e);
      const completedCount = updatedExercises.filter(e => e.completed).length;
      const progress = (completedCount / updatedExercises.length) * 100;
      
      let updatedPlan = { ...currentPlan, exercises: updatedExercises };

      if (progress === 100) {
        const finishedPlan = await planService.updatePlanCompletion(currentPlan.id, true);
        updatedPlan = { ...updatedPlan, ...finishedPlan };
        // Move to past plans
        setPastPlans(prev => [updatedPlan, ...prev]);
        setCurrentPlan(null);
      } else {
        setCurrentPlan(updatedPlan);
      }
    } catch (error) {
      console.error('Failed to update exercise:', error);
      setError('Could not update your progress. Please try again.');
    }
  };

  const isCurrentWeek = (weekOf: string): boolean => {
    const weekStart = getStartOfWeek(new Date());
    const planWeekStart = new Date(weekOf);
    return weekStart.toISOString().split('T')[0] === planWeekStart.toISOString().split('T')[0];
  };

  const getStartOfWeek = (date: Date): Date => {
    const start = new Date(date);
    const day = start.getDay(); // Sunday - 0, Monday - 1, ...
    const diff = start.getDate() - day + (day === 0 ? -6 : 1); // Adjust to make Monday the first day
    start.setDate(diff);
    start.setHours(0, 0, 0, 0);
    return start;
  };

  const calculateProgress = (plan: WeeklyPlan): number => {
    if (!plan.exercises || plan.exercises.length === 0) {
      return 0;
    }
    const completedCount = plan.exercises.filter(e => e.completed).length;
    return (completedCount / plan.exercises.length) * 100;
  };

  const getExerciseIcon = (type: string) => {
    const icons = {
      breathing: Clock,
      journaling: Book,
      mindfulness: Heart,
      behavioral: Users,
      cognitive: Brain,
      physical: Zap
    };
    return icons[type as keyof typeof icons] || Circle;
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'hard': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <Brain className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
          <p>Loading your wellness plans...</p>
        </div>
      </div>
    );
  }

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
          <CardTitle className="text-2xl font-bold flex items-center gap-2">
            <Calendar className="w-6 h-6" />
            Weekly Plans
          </CardTitle>
          <p className="text-muted-foreground">
            AI-powered wellness plans tailored to your emotional patterns and goals
          </p>
        </CardHeader>
      </Card>

      {error && (
        <Alert className="border-destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Current Plan */}
      {currentPlan ? (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-primary" />
                  {currentPlan.title}
                </CardTitle>
                <p className="text-muted-foreground mt-1">{currentPlan.description}</p>
              </div>
              <Badge variant="secondary" className="flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                AI Generated
              </Badge>
            </div>
            <div className="flex items-center gap-4 mt-4">
              <div className="flex items-center gap-2">
                <Progress value={calculateProgress(currentPlan)} className="w-32" />
                <span className="text-sm text-muted-foreground">
                  {Math.round(calculateProgress(currentPlan))}% complete
                </span>
              </div>
              <Badge className="flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                {currentPlan.target_area}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            {/* Insights */}
            <div className="mb-6">
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <Brain className="w-4 h-4" />
                Key Insights
              </h4>
              <div className="space-y-2">
                {currentPlan.insights.map((insight, index) => (
                  <div key={index} className="flex items-start gap-2 text-sm">
                    <Star className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                    <span>{insight}</span>
                  </div>
                ))}
              </div>
            </div>

            <Separator className="my-4" />

            {/* Exercises */}
            <div>
              <h4 className="font-semibold mb-4 flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                This Week's Exercises
              </h4>
              <div className="space-y-4">
                {currentPlan.exercises.map((exercise) => {
                  const IconComponent = getExerciseIcon(exercise.type);
                  return (
                    <Card key={exercise.id} className={`transition-all ${exercise.completed ? 'bg-muted/50' : ''}`}>
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="p-1 h-auto"
                            onClick={() => toggleExerciseCompletion(exercise.id)}
                          >
                            {exercise.completed ? (
                              <CheckCircle className="w-5 h-5 text-green-600" />
                            ) : (
                              <Circle className="w-5 h-5 text-muted-foreground" />
                            )}
                          </Button>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <IconComponent className="w-4 h-4 text-primary" />
                              <h5 className={`font-medium ${exercise.completed ? 'line-through text-muted-foreground' : ''}`}>
                                {exercise.title}
                              </h5>
                              <Badge variant="outline" className={`text-xs ${getDifficultyColor(exercise.difficulty)}`}>
                                {exercise.difficulty}
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                {exercise.duration}min
                              </Badge>
                            </div>
                            
                            <p className="text-sm text-muted-foreground mb-3">
                              {exercise.description}
                            </p>
                            
                            {!exercise.completed && (
                              <div className="space-y-2">
                                <div>
                                  <h6 className="text-xs font-medium text-muted-foreground mb-1">Instructions:</h6>
                                  <ul className="text-xs text-muted-foreground space-y-1">
                                    {exercise.instructions.map((instruction, index) => (
                                      <li key={index} className="flex items-start gap-1">
                                        <span className="text-primary">•</span>
                                        <span>{instruction}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                                
                                <div>
                                  <h6 className="text-xs font-medium text-muted-foreground mb-1">Benefits:</h6>
                                  <div className="flex flex-wrap gap-1">
                                    {exercise.benefits.map((benefit, index) => (
                                      <Badge key={index} variant="secondary" className="text-xs">
                                        {benefit}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-8 text-center">
            <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Current Plan</h3>
            <p className="text-muted-foreground mb-6">
              Generate a personalized weekly plan based on your recent mood patterns and emotional data.
            </p>
            
            {moodInsights.length > 0 ? (
              <div className="mb-6">
                <h4 className="font-medium mb-3">Based on your recent patterns:</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-md mx-auto">
                  {moodInsights.slice(0, 2).map((insight, index) => (
                    <div key={index} className="text-sm p-3 bg-muted rounded-lg">
                      <div className="font-medium capitalize">{insight.primaryMood}</div>
                      <div className="text-muted-foreground">{insight.frequency} occurrences</div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="mb-6">
                <p className="text-sm text-muted-foreground">
                  Use the journal or voice features to build mood data, then return here for a personalized plan.
                </p>
              </div>
            )}
            
            <Button 
              onClick={generateNewPlan} 
              disabled={generating || !!currentPlan || moodInsights.length === 0}
              size="lg"
            >
              {generating ? (
                <>
                  <Brain className="w-4 h-4 mr-2 animate-spin" />
                  Generating Plan...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Generate Weekly Plan
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Past Plans */}
      {pastPlans.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Past Plans
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {pastPlans.slice(0, 3).map((plan) => (
                <div key={plan.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <h5 className="font-medium">{plan.title}</h5>
                    <p className="text-sm text-muted-foreground">
                      Week of {new Date(plan.week_of).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Progress value={calculateProgress(plan)} className="w-20" />
                    <span className="text-sm text-muted-foreground">
                      {Math.round(calculateProgress(plan))}%
                    </span>
                    {plan.completed && (
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </motion.div>
  );
};

export default WeeklyPlans; 