import type { DailyMoodSummary } from "@/services/supabase";
import { MOOD_CATEGORIES, type MoodType } from "@/services/gemini";
import { TrendingUp, TrendingDown, Activity, Calendar, Heart } from "lucide-react";

const getDayOfWeek = (date: Date) => {
    return date.toLocaleDateString('en-US', { weekday: 'short' });
}

const getDayName = (daysAgo: number) => {
    const date = new Date();
    date.setDate(date.getDate() - daysAgo);
    return getDayOfWeek(date);
}

export const processMoodData = (moodSummaries: DailyMoodSummary[]) => {
    if (!moodSummaries || moodSummaries.length === 0) {
        return {
            stats: [
                { icon: Calendar, label: "Days Tracked", value: "0", color: "text-blue-500" },
                { icon: Heart, label: "Positive Days", value: "0%", color: "text-green-500" },
                { icon: Activity, label: "Mood Trend", value: "N/A", color: "text-primary" }
            ],
            weeklyData: [],
            insights: ["Start tracking your mood to see insights here."]
        };
    }

    const daysTracked = moodSummaries.length;
    const positiveMoods = ['happy', 'peaceful', 'excited'];
    const positiveDays = moodSummaries.filter(s => positiveMoods.includes(s.primary_mood)).length;
    const positiveDaysPercentage = daysTracked > 0 ? Math.round((positiveDays / daysTracked) * 100) : 0;

    // Calculate mood trend (comparing recent vs older data)
    const recentSummaries = moodSummaries.slice(0, Math.min(3, moodSummaries.length));
    const olderSummaries = moodSummaries.slice(-Math.min(3, moodSummaries.length));
    
    const recentAvgIntensity = recentSummaries.reduce((sum, s) => sum + s.average_intensity, 0) / recentSummaries.length;
    const olderAvgIntensity = olderSummaries.reduce((sum, s) => sum + s.average_intensity, 0) / olderSummaries.length;
    
    let trendValue = "Stable";
    let trendColor = "text-primary";
    let trendIcon = Activity;
    
    if (recentAvgIntensity > olderAvgIntensity + 0.5) {
        trendValue = "Improving";
        trendColor = "text-green-500";
        trendIcon = TrendingUp;
    } else if (recentAvgIntensity < olderAvgIntensity - 0.5) {
        trendValue = "Declining";
        trendColor = "text-red-500";
        trendIcon = TrendingDown;
    }

    const stats = [
        { icon: Calendar, label: "Days Tracked", value: String(daysTracked), color: "text-blue-500" },
        { icon: Heart, label: "Positive Days", value: `${positiveDaysPercentage}%`, color: "text-green-500" },
        { icon: trendIcon, label: "Mood Trend", value: trendValue, color: trendColor }
    ];

    // Create weekly data (last 7 days)
    const weeklyData = [];
    for (let i = 6; i >= 0; i--) {
        const dayName = getDayName(i);
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateString = date.toISOString().split('T')[0];
        
        // Find summary for this day
        const daySummary = moodSummaries.find(s => s.date === dateString);
        
        if (daySummary) {
            const moodMeta = MOOD_CATEGORIES[daySummary.primary_mood];
            weeklyData.push({
                day: dayName,
                mood: daySummary.primary_mood,
                emoji: moodMeta.emoji,
                intensity: daySummary.average_intensity,
                color: moodMeta.color,
                confidence: Math.round(daySummary.overall_confidence * 100),
                analysisCount: daySummary.analysis_count
            });
        } else {
            // No data for this day
            weeklyData.push({
                day: dayName,
                mood: 'neutral',
                emoji: '😐',
                intensity: 5,
                color: 'bg-gray-300',
                confidence: 0,
                analysisCount: 0
            });
        }
    }

    // Generate insights
    const insights = generateInsights(moodSummaries);

    return { stats, weeklyData, insights };
};

function generateInsights(moodSummaries: DailyMoodSummary[]): string[] {
    const insights: string[] = [];
    
    if (moodSummaries.length === 0) {
        return ["Start tracking your mood to see personalized insights."];
    }

    // Analyze mood patterns
    const moodCounts = moodSummaries.reduce((counts, summary) => {
        counts[summary.primary_mood] = (counts[summary.primary_mood] || 0) + 1;
        return counts;
    }, {} as Record<string, number>);

    const dominantMood = Object.entries(moodCounts)
        .sort(([,a], [,b]) => b - a)[0][0];

    const dominantMoodCount = moodCounts[dominantMood];
    const dominantMoodPercentage = Math.round((dominantMoodCount / moodSummaries.length) * 100);

    // Most common mood insight
    if (dominantMoodPercentage > 50) {
        const moodDescription = MOOD_CATEGORIES[dominantMood as MoodType]?.description || dominantMood;
        insights.push(`Your most common mood has been ${dominantMood} (${dominantMoodPercentage}% of days). ${getMoodAdvice(dominantMood as MoodType)}`);
    }

    // Intensity patterns
    const avgIntensity = moodSummaries.reduce((sum, s) => sum + s.average_intensity, 0) / moodSummaries.length;
    if (avgIntensity > 7) {
        insights.push("You've been experiencing intense emotions lately. Remember to practice self-care and reach out for support when needed.");
    } else if (avgIntensity < 4) {
        insights.push("Your emotional intensity has been relatively low. Consider engaging in activities that bring you joy and energy.");
    }

    // Analysis frequency insight
    const totalAnalyses = moodSummaries.reduce((sum, s) => sum + s.analysis_count, 0);
    const avgAnalysesPerDay = totalAnalyses / moodSummaries.length;
    
    if (avgAnalysesPerDay > 3) {
        insights.push("Great job staying engaged with your mental health tracking! Your consistent input helps us provide better insights.");
    } else if (avgAnalysesPerDay < 1) {
        insights.push("Try to engage more frequently with journaling, voice sessions, or chat to get more accurate mood insights.");
    }

    // Recent trend insight
    if (moodSummaries.length >= 3) {
        const recentDays = moodSummaries.slice(0, 3);
        const positiveMoods = ['happy', 'peaceful', 'excited'];
        const recentPositive = recentDays.filter(s => positiveMoods.includes(s.primary_mood)).length;
        
        if (recentPositive >= 2) {
            insights.push("You've had mostly positive moods recently! Keep up the good mental health practices.");
        } else if (recentPositive === 0) {
            insights.push("The past few days have been challenging. Remember that it's okay to have difficult days, and consider reaching out for support.");
        }
    }

    // Emotional keywords insight
    const allEmotions = moodSummaries.flatMap(s => s.key_emotions || []);
    const emotionCounts = allEmotions.reduce((counts, emotion) => {
        counts[emotion] = (counts[emotion] || 0) + 1;
        return counts;
    }, {} as Record<string, number>);

    const topEmotions = Object.entries(emotionCounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 3)
        .map(([emotion]) => emotion);

    if (topEmotions.length > 0) {
        insights.push(`Your most frequent emotions have been: ${topEmotions.join(', ')}. Notice any patterns?`);
    }

    return insights.length > 0 ? insights : ["Keep tracking your mood to discover personalized insights."];
}

function getMoodAdvice(mood: MoodType): string {
    const advice = {
        happy: "Enjoy these positive moments and consider what's contributing to your happiness.",
        peaceful: "Your calm state is wonderful. Try to maintain these peaceful practices in your routine.",
        excited: "Your enthusiasm is great! Make sure to balance high energy with adequate rest.",
        sad: "It's okay to feel sad sometimes. Consider gentle activities that bring you comfort.",
        anxious: "Anxiety is manageable. Try breathing exercises, meditation, or talking to someone you trust.",
        frustrated: "Frustration is a signal. Identify what's causing it and consider constructive ways to address it.",
        neutral: "Neutral moods are perfectly normal. They can be a stable foundation for personal growth."
    };

    return advice[mood] || "Every emotion has value and teaches us something about ourselves.";
}

export { MOOD_CATEGORIES, type MoodType }; 