import { createClient } from '@supabase/supabase-js';

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

// Database operations
export const conversationService = {
  async list(): Promise<Conversation[]> {
    const { data, error } = await supabase
      .from('conversations')
      .select('*')
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
        const { data, error } = await supabase
            .from('journal_entries')
            .select('*')
            .order('created_at', { ascending: false });
        if (error) throw error;
        return data || [];
    },
    async create(entry: Omit<JournalEntry, 'id' | 'created_at' | 'user_id'>): Promise<JournalEntry> {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("User not authenticated");

        const { data, error } = await supabase
            .from('journal_entries')
            .insert([{ ...entry, user_id: user.id }])
            .select()
            .single();
        if (error) throw error;
        return data;
    },
    async update(id: string, entry: Partial<Omit<JournalEntry, 'id' | 'created_at' | 'user_id'>>): Promise<JournalEntry> {
        const { data, error } = await supabase
            .from('journal_entries')
            .update(entry)
            .eq('id', id)
            .select()
            .single();
        if (error) throw error;
        return data;
    },
    async delete(id: string): Promise<void> {
        const { error } = await supabase
            .from('journal_entries')
            .delete()
            .eq('id', id);
        if (error) throw error;
    }
};

export const dailyCheckinService = {
    async list(): Promise<DailyCheckin[]> {
        const { data, error } = await supabase
            .from('daily_checkins')
            .select('*')
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
        const { data, error } = await supabase
            .from('mood_entries')
            .select('*')
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