import { analyzeMoodFromText, combineMoodAnalyses, type MoodAnalysis } from './gemini';
import { moodAnalysisService, dailyMoodService, journalService, type MoodAnalysisEntry } from './supabase';

/**
 * Central service for mood analysis orchestration
 * Handles the flow from text input -> Gemini analysis -> database storage -> daily summary updates
 */
export class MoodOrchestrator {
    
    /**
     * Analyzes mood from journal entry and stores results
     */
    async analyzeJournalEntry(entryId: string, content: string, duration?: number): Promise<MoodAnalysisEntry> {
        const analysis = await analyzeMoodFromText(content, 'journal');
        return this.saveAnalysis(analysis, entryId, content, duration);
    }

    /**
     * Analyzes mood from chat conversation and stores results
     */
    async analyzeChatMessage(messageId: string, content: string, duration?: number): Promise<MoodAnalysisEntry> {
        const analysis = await analyzeMoodFromText(content, 'chat');
        return this.saveAnalysis(analysis, messageId, content, duration);
    }

    /**
     * Analyzes mood from voice session and stores results
     */
    async analyzeVoiceSession(sessionId: string, content: string, duration?: number): Promise<MoodAnalysisEntry> {
        const analysis = await analyzeMoodFromText(content, 'voice');
        return this.saveAnalysis(analysis, sessionId, content, duration);
    }

    /**
     * Process unanalyzed journal entries retroactively
     */
    async processUnanalyzedJournalEntries(): Promise<{
        processed: number;
        errors: string[];
    }> {
        console.log('Starting retroactive journal analysis...');
        
        try {
            // Get all journal entries
            const journalEntries = await journalService.list();
            console.log(`Found ${journalEntries.length} journal entries`);
            
            // Get all existing mood analyses for journal entries
            const existingAnalyses = await moodAnalysisService.list(1000);
            const analyzedEntryIds = new Set(
                existingAnalyses
                    .filter(a => a.source === 'journal')
                    .map(a => a.source_id)
            );
            
            // Find unanalyzed entries
            const unanalyzedEntries = journalEntries.filter(entry => 
                !analyzedEntryIds.has(entry.id) && 
                entry.content && 
                entry.content.trim().length > 10
            );
            
            console.log(`Found ${unanalyzedEntries.length} unanalyzed journal entries`);
            
            const errors: string[] = [];
            let processed = 0;
            
            // Process each unanalyzed entry
            for (const entry of unanalyzedEntries) {
                try {
                    console.log(`Processing journal entry: ${entry.id}`);
                    await this.analyzeJournalEntry(entry.id, entry.content);
                    processed++;
                    console.log(`Successfully processed entry ${entry.id}`);
                    
                    // Add a small delay to avoid rate limiting
                    await new Promise(resolve => setTimeout(resolve, 500));
                } catch (error) {
                    const errorMsg = `Failed to process entry ${entry.id}: ${error.message}`;
                    console.error(errorMsg);
                    errors.push(errorMsg);
                }
            }
            
            console.log(`Retroactive analysis complete. Processed: ${processed}, Errors: ${errors.length}`);
            
            return { processed, errors };
        } catch (error) {
            console.error('Error in retroactive analysis:', error);
            throw error;
        }
    }

    /**
     * Gets today's mood summary with real-time updates
     */
    async getTodaysMoodSummary() {
        const today = new Date().toISOString().split('T')[0];
        
        // First update the summary with latest analyses
        const summary = await dailyMoodService.updateFromAnalyses(today);
        
        return summary;
    }

    /**
     * Gets mood analytics for the dashboard
     */
    async getMoodAnalytics(days: number = 7) {
        const summaries = await dailyMoodService.list(days);
        const recentAnalyses = await moodAnalysisService.list(20);
        
        return {
            summaries,
            recentAnalyses,
            todaysSummary: await this.getTodaysMoodSummary()
        };
    }

    /**
     * Gets detailed mood insights for a specific date
     */
    async getMoodInsights(date: string) {
        const [summary, analyses] = await Promise.all([
            dailyMoodService.getByDate(date),
            moodAnalysisService.getByDate(date)
        ]);

        // Group analyses by source
        const analysesBySource = analyses.reduce((groups, analysis) => {
            if (!groups[analysis.source]) {
                groups[analysis.source] = [];
            }
            groups[analysis.source].push(analysis);
            return groups;
        }, {} as Record<string, MoodAnalysisEntry[]>);

        return {
            summary,
            analyses,
            analysesBySource,
            totalAnalyses: analyses.length
        };
    }

    /**
     * Recalculates mood summaries for multiple days (useful for data corrections)
     */
    async recalculateSummaries(startDate: string, endDate: string) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        const summaries = [];

        for (let date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) {
            const dateString = date.toISOString().split('T')[0];
            const summary = await dailyMoodService.updateFromAnalyses(dateString);
            summaries.push(summary);
        }

        return summaries;
    }

    /**
     * Gets mood trends and patterns
     */
    async getMoodTrends(days: number = 30) {
        const summaries = await dailyMoodService.list(days);
        
        if (summaries.length === 0) {
            return {
                averageIntensity: 5,
                dominantMood: 'neutral',
                moodDistribution: {},
                intensityTrend: 'stable',
                daysWithData: 0
            };
        }

        // Calculate average intensity
        const totalIntensity = summaries.reduce((sum, s) => sum + s.average_intensity, 0);
        const averageIntensity = totalIntensity / summaries.length;

        // Find dominant mood
        const moodCounts = summaries.reduce((counts, summary) => {
            counts[summary.primary_mood] = (counts[summary.primary_mood] || 0) + 1;
            return counts;
        }, {} as Record<string, number>);

        const dominantMood = Object.entries(moodCounts)
            .sort(([,a], [,b]) => b - a)[0][0];

        // Calculate mood distribution
        const total = summaries.length;
        const moodDistribution = Object.entries(moodCounts).reduce((dist, [mood, count]) => {
            dist[mood] = Math.round((count / total) * 100);
            return dist;
        }, {} as Record<string, number>);

        // Determine intensity trend (simple comparison of first vs last week)
        const firstWeek = summaries.slice(-7);
        const lastWeek = summaries.slice(0, 7);
        
        const firstWeekAvg = firstWeek.reduce((sum, s) => sum + s.average_intensity, 0) / firstWeek.length;
        const lastWeekAvg = lastWeek.reduce((sum, s) => sum + s.average_intensity, 0) / lastWeek.length;
        
        let intensityTrend = 'stable';
        if (lastWeekAvg > firstWeekAvg + 0.5) intensityTrend = 'improving';
        else if (lastWeekAvg < firstWeekAvg - 0.5) intensityTrend = 'declining';

        return {
            averageIntensity: Math.round(averageIntensity * 10) / 10,
            dominantMood,
            moodDistribution,
            intensityTrend,
            daysWithData: summaries.length
        };
    }

    /**
     * Handles real-time mood updates (called after any user interaction)
     */
    async handleRealtimeMoodUpdate(
      sourceType: 'journal' | 'chat' | 'voice',
      sourceId: string,
      content: string,
      context?: string,
      duration?: number
    ): Promise<{
      analysis: MoodAnalysisEntry;
      todaysSummary: any;
    }> {
      let analysis: MoodAnalysisEntry;

      switch (sourceType) {
        case 'journal':
          analysis = await this.analyzeJournalEntry(sourceId, content, duration);
          break;
        case 'chat':
          analysis = await this.analyzeChatMessage(sourceId, content, duration);
          break;
        case 'voice':
          analysis = await this.analyzeVoiceSession(sourceId, content, duration);
          break;
        default:
          throw new Error('Unsupported source type');
      }

      const todaysSummary = await this.getTodaysMoodSummary();

      return {
        analysis,
        todaysSummary
      };
    }

    private async saveAnalysis(analysis: MoodAnalysis, entryId: string, content: string, duration?: number): Promise<MoodAnalysisEntry> {
      // Store the analysis, now with duration
      const storedAnalysis = await moodAnalysisService.create(analysis, entryId, content, duration);
      // Update daily summary
      const today = new Date().toISOString().split('T')[0];
      await dailyMoodService.updateFromAnalyses(today);
      return storedAnalysis;
    }
}

// Export a singleton instance
export const moodOrchestrator = new MoodOrchestrator(); 