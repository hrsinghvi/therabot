import type { MoodEntry } from "@/services/supabase";
import { TrendingUp, Calendar, Heart } from "lucide-react";

const moodMeta = {
    happy: { emoji: '😊', color: 'bg-green-500' },
    peaceful: { emoji: '😌', color: 'bg-blue-500' },
    neutral: { emoji: '😐', color: 'bg-yellow-500' },
    sad: { emoji: '😔', color: 'bg-blue-600' },
    anxious: { emoji: '😰', color: 'bg-red-500' },
    frustrated: { emoji: '😠', color: 'bg-red-600' },
};

const getDayOfWeek = (date: Date) => {
    return date.toLocaleDateString('en-US', { weekday: 'short' });
}

export const processMoodData = (moodEntries: MoodEntry[]) => {
    if (!moodEntries || moodEntries.length === 0) {
        return {
            stats: [],
            weeklyData: [],
            insights: []
        };
    }

    const daysTracked = moodEntries.length;
    const positiveDays = moodEntries.filter(e => e.mood === 'happy' || e.mood === 'peaceful').length;
    const positiveDaysPercentage = daysTracked > 0 ? Math.round((positiveDays / daysTracked) * 100) : 0;

    const stats = [
        { icon: Calendar, label: "Days Tracked", value: String(daysTracked), color: "text-blue-500" },
        { icon: Heart, label: "Positive Days", value: `${positiveDaysPercentage}%`, color: "text-green-500" },
        { icon: TrendingUp, label: "Week Streak", value: "0", color: "text-primary" }, // Placeholder
    ];

    const today = new Date();
    const last7Days = new Date(today);
    last7Days.setDate(today.getDate() - 6);

    const weeklyEntries = moodEntries.filter(e => new Date(e.created_at) >= last7Days);
    
    const weeklyDataMap = new Map<string, { moods: string[], intensities: number[] }>();

    for (let i = 0; i < 7; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        const day = getDayOfWeek(date);
        if (!weeklyDataMap.has(day)) {
            weeklyDataMap.set(day, { moods: [], intensities: [] });
        }
    }
    
    weeklyEntries.forEach(entry => {
        const day = getDayOfWeek(new Date(entry.created_at));
        if (weeklyDataMap.has(day)) {
            const dayData = weeklyDataMap.get(day)!;
            dayData.moods.push(entry.mood);
            if (entry.intensity) {
                dayData.intensities.push(entry.intensity);
            }
        }
    });

    const weeklyData = Array.from(weeklyDataMap.entries()).map(([day, data]) => {
        const dominantMood = data.moods.length > 0
            ? data.moods.reduce((a, b, i, arr) =>
                (arr.filter(v => v === a).length >= arr.filter(v => v === b).length ? a : b),
                data.moods[0])
            : "neutral";

        const avgIntensity = data.intensities.length > 0
            ? data.intensities.reduce((a, b) => a + b, 0) / data.intensities.length
            : 5;

        return {
            day,
            mood: dominantMood,
            emoji: moodMeta[dominantMood as keyof typeof moodMeta]?.emoji || '😐',
            intensity: avgIntensity,
            color: moodMeta[dominantMood as keyof typeof moodMeta]?.color || 'bg-gray-500',
        };
    }).reverse();


    const insights = [];
    if(positiveDays > (daysTracked / 2)) {
        insights.push(`You've had ${positiveDays} positive mood days this week. That's great!`);
    } else {
        insights.push(`There have been a few challenging days this week. Remember to be kind to yourself.`);
    }

    const anxietyCount = moodEntries.filter(e => e.mood === 'anxious').length;
    if (anxietyCount > 2) {
        insights.push(`You've noted feeling anxious ${anxietyCount} times. It might be helpful to explore what's causing this.`);
    }

    return { stats, weeklyData, insights };
} 