import { createClient } from '@supabase/supabase-js';
import type { MoodAnalysis, MoodType } from './gemini';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
export interface Conversation {
  id: string;
  title: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  role: 'user' | 'model';
  content: string;
  created_at: string;
}

export interface JournalEntry {
  id: string;
  user_id: string;
  created_at: string;
  title: string;
  content: string;
  mood?: string;
  ai_analysis?: string;
}

export interface DailyCheckin {
    id: string;
    user_id: string;
    mood: string;
    reflection: string;
    created_at: string;
}

export interface MoodEntry {
    id: string;
    user_id: string;
    mood: string;
    intensity: number;
    created_at: string;
}

// Enhanced mood analysis interfaces
export interface MoodAnalysisEntry {
    id: string;
    user_id: string;
    source: 'journal' | 'voice' | 'chat';
    source_id: string; // ID of the related journal entry, conversation, etc.
    primary_mood: MoodType;
    secondary_mood?: MoodType;
    intensity: number;
    confidence: number;
    reasoning: string;
    key_emotions: string[];
    raw_content: string; // The original text that was analyzed
    created_at: string;
}

export interface DailyMoodSummary {
    id: string;
    user_id: string;
    date: string; // YYYY-MM-DD format
    primary_mood: MoodType;
    secondary_mood?: MoodType;
    average_intensity: number;
    overall_confidence: number;
    reasoning: string;
    key_emotions: string[];
    analysis_count: number; // Number of analyses that went into this summary
    last_updated: string;
    created_at: string;
}

// Database operations
export const conversationService = {
  async list(): Promise<Conversation[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated");

    const { data, error } = await supabase
      .from('conversations')
      .select('*')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  async create(title: string): Promise<Conversation> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated");

    const { data, error } = await supabase
      .from('conversations')
      .insert({ title, user_id: user.id })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async updateTimestamp(id: string): Promise<void> {
    const { error } = await supabase
      .from('conversations')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', id);
    
    if (error) throw error;
  },

  async updateTitle(id: string, title: string): Promise<void> {
    const { error } = await supabase
      .from('conversations')
      .update({ title, updated_at: new Date().toISOString() })
      .eq('id', id);
    
    if (error) throw error;
  },

  async delete(id: string): Promise<void> {
    // First delete all messages in the conversation
    const { error: messagesError } = await supabase
      .from('messages')
      .delete()
      .eq('conversation_id', id);
    
    if (messagesError) throw messagesError;

    // Then delete the conversation
    const { error: conversationError } = await supabase
      .from('conversations')
      .delete()
      .eq('id', id);
    
    if (conversationError) throw conversationError;
  }
};

export const messageService = {
  async list(conversationId: string): Promise<Message[]> {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });
    
    if (error) throw error;
    return data || [];
  },

  async create(conversationId: string, role: 'user' | 'model', content: string): Promise<Message> {
    const { data, error } = await supabase
      .from('messages')
      .insert({ conversation_id: conversationId, role, content })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }
};

export const journalService = {
    async list(): Promise<JournalEntry[]> {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            console.error('No authenticated user found for journal list');
            throw new Error("User not authenticated");
        }

        console.log('Fetching journal entries for user:', user.id);
        const { data, error } = await supabase
            .from('journal_entries')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });
            
        if (error) {
            console.error('Supabase error fetching journal entries:', error);
            throw error;
        }
        
        console.log('Journal entries fetched:', data?.length || 0);
        return data || [];
    },
    async create(entry: Omit<JournalEntry, 'id' | 'created_at' | 'user_id'>): Promise<JournalEntry> {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            console.error('No authenticated user found');
            throw new Error("User not authenticated");
        }

        console.log('Creating journal entry for user:', user.id);
        const { data, error } = await supabase
            .from('journal_entries')
            .insert([{ ...entry, user_id: user.id }])
            .select()
            .single();
            
        if (error) {
            console.error('Supabase error creating journal entry:', error);
            throw error;
        }
        
        console.log('Journal entry created successfully:', data);
        return data;
    },
    async update(id: string, entry: Partial<Omit<JournalEntry, 'id' | 'created_at' | 'user_id'>>): Promise<JournalEntry> {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("User not authenticated");

        const { data, error } = await supabase
            .from('journal_entries')
            .update(entry)
            .eq('id', id)
            .eq('user_id', user.id)
            .select()
            .single();
        if (error) throw error;
        return data;
    },
    async delete(id: string): Promise<void> {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("User not authenticated");

        const { error } = await supabase
            .from('journal_entries')
            .delete()
            .eq('id', id)
            .eq('user_id', user.id);
        if (error) throw error;
    }
};

export const dailyCheckinService = {
    async list(): Promise<DailyCheckin[]> {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("User not authenticated");

        const { data, error } = await supabase
            .from('daily_checkins')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });
        if (error) throw error;
        return data || [];
    },
    async create(checkin: Omit<DailyCheckin, 'id' | 'created_at' | 'user_id'>): Promise<DailyCheckin> {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("User not authenticated");

        const { data, error } = await supabase
            .from('daily_checkins')
            .insert({ ...checkin, user_id: user.id })
            .select()
            .single();
        if (error) throw error;
        return data;
    }
};

export const moodService = {
    async list(): Promise<MoodEntry[]> {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("User not authenticated");

        const { data, error } = await supabase
            .from('mood_entries')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });
        if (error) throw error;
        return data || [];
    },
    async create(mood: Omit<MoodEntry, 'id' | 'created_at' | 'user_id'>): Promise<MoodEntry> {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("User not authenticated");

        const { data, error } = await supabase
            .from('mood_entries')
            .insert({ ...mood, user_id: user.id })
            .select()
            .single();
        if (error) throw error;
        return data;
    }
};

// Enhanced mood analysis services
export const moodAnalysisService = {
    async list(limit?: number): Promise<MoodAnalysisEntry[]> {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("User not authenticated");

        let query = supabase
            .from('mood_analyses')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });

        if (limit) {
            query = query.limit(limit);
        }

        const { data, error } = await query;
        if (error) throw error;
        return data || [];
    },

    async create(analysis: MoodAnalysis, sourceId: string, rawContent: string): Promise<MoodAnalysisEntry> {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("User not authenticated");

        const entry: Omit<MoodAnalysisEntry, 'id' | 'created_at'> = {
            user_id: user.id,
            source: analysis.source,
            source_id: sourceId,
            primary_mood: analysis.primaryMood,
            secondary_mood: analysis.secondaryMood,
            intensity: analysis.intensity,
            confidence: analysis.confidence,
            reasoning: analysis.reasoning,
            key_emotions: analysis.keyEmotions,
            raw_content: rawContent
        };

        const { data, error } = await supabase
            .from('mood_analyses')
            .insert(entry)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async getByDate(date: string): Promise<MoodAnalysisEntry[]> {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("User not authenticated");

        const startDate = new Date(date);
        const endDate = new Date(date);
        endDate.setDate(endDate.getDate() + 1);

        const { data, error } = await supabase
            .from('mood_analyses')
            .select('*')
            .eq('user_id', user.id)
            .gte('created_at', startDate.toISOString())
            .lt('created_at', endDate.toISOString())
            .order('created_at', { ascending: true });

        if (error) throw error;
        return data || [];
    },

    async getBySource(source: 'journal' | 'voice' | 'chat', sourceId: string): Promise<MoodAnalysisEntry[]> {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("User not authenticated");

        const { data, error } = await supabase
            .from('mood_analyses')
            .select('*')
            .eq('user_id', user.id)
            .eq('source', source)
            .eq('source_id', sourceId)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data || [];
    }
};

export const dailyMoodService = {
    async list(limit?: number): Promise<DailyMoodSummary[]> {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("User not authenticated");

        let query = supabase
            .from('daily_mood_summaries')
            .select('*')
            .eq('user_id', user.id)
            .order('date', { ascending: false });

        if (limit) {
            query = query.limit(limit);
        }

        const { data, error } = await query;
        if (error) throw error;
        return data || [];
    },

    async getByDate(date: string): Promise<DailyMoodSummary | null> {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("User not authenticated");

        const { data, error } = await supabase
            .from('daily_mood_summaries')
            .select('*')
            .eq('user_id', user.id)
            .eq('date', date)
            .single();

        if (error && error.code !== 'PGRST116') throw error; // PGRST116 is "not found"
        return data || null;
    },

    async upsert(summary: Omit<DailyMoodSummary, 'id' | 'user_id' | 'created_at'>): Promise<DailyMoodSummary> {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("User not authenticated");

        const entry = {
            ...summary,
            user_id: user.id
        };

        const { data, error } = await supabase
            .from('daily_mood_summaries')
            .upsert(entry, { 
                onConflict: 'user_id,date',
                ignoreDuplicates: false 
            })
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async updateFromAnalyses(date: string): Promise<DailyMoodSummary> {
        const analyses = await moodAnalysisService.getByDate(date);
        
        if (analyses.length === 0) {
            // Create a default entry if no analyses exist
            const defaultSummary: Omit<DailyMoodSummary, 'id' | 'user_id' | 'created_at'> = {
                date,
                primary_mood: 'neutral',
                average_intensity: 5,
                overall_confidence: 0.1,
                reasoning: "No mood data recorded for this day",
                key_emotions: [],
                analysis_count: 0,
                last_updated: new Date().toISOString()
            };
            return await this.upsert(defaultSummary);
        }

        // Calculate aggregated mood data
        const totalIntensity = analyses.reduce((sum, a) => sum + a.intensity, 0);
        const totalConfidence = analyses.reduce((sum, a) => sum + a.confidence, 0);
        const averageIntensity = totalIntensity / analyses.length;
        const averageConfidence = totalConfidence / analyses.length;

        // Find most common mood
        const moodCounts = analyses.reduce((counts, analysis) => {
            counts[analysis.primary_mood] = (counts[analysis.primary_mood] || 0) + 1;
            return counts;
        }, {} as Record<MoodType, number>);

        const primaryMood = Object.entries(moodCounts).sort(([,a], [,b]) => b - a)[0][0] as MoodType;

        // Collect all unique emotions
        const allEmotions = [...new Set(analyses.flatMap(a => a.key_emotions))];
        const topEmotions = allEmotions.slice(0, 10); // Limit to top 10

        // Generate reasoning
        const sourceCounts = analyses.reduce((counts, a) => {
            counts[a.source] = (counts[a.source] || 0) + 1;
            return counts;
        }, {} as Record<string, number>);

        const sourcesList = Object.entries(sourceCounts)
            .map(([source, count]) => `${count} ${source}`)
            .join(', ');

        const reasoning = `Based on ${analyses.length} mood analyses from ${sourcesList}. Most common mood: ${primaryMood}.`;

        const summary: Omit<DailyMoodSummary, 'id' | 'user_id' | 'created_at'> = {
            date,
            primary_mood: primaryMood,
            secondary_mood: undefined, // Could be enhanced to find secondary mood
            average_intensity: Math.round(averageIntensity * 10) / 10,
            overall_confidence: Math.round(averageConfidence * 100) / 100,
            reasoning,
            key_emotions: topEmotions,
            analysis_count: analyses.length,
            last_updated: new Date().toISOString()
        };

        return await this.upsert(summary);
    }
}; 