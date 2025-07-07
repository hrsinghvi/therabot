import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Plus, BookOpen, Edit, Brain, Sparkles, PenTool } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { journalService, type JournalEntry } from '@/services/supabase';
import JournalEntryEditor from './JournalEntryEditor';
import JournalPromptSelector from './JournalPromptSelector';
import Resources from "@/components/Resources";
import { JournalPrompt } from '@/services/journalPrompts';

const Journal = () => {
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isPromptSelectorOpen, setIsPromptSelectorOpen] = useState(false);

  const fetchEntries = useCallback(async () => {
    try {
      console.log('Fetching journal entries...');
      setLoading(true);
      setError(null); // Clear any previous errors
      const entries = await journalService.list();
      console.log('Journal entries fetched:', entries.length);
      setJournalEntries(entries.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));
    } catch (error) {
      console.error("Error fetching journal entries:", error);
      setError(`Failed to load journal entries: ${error.message}`);
    } finally {
      setLoading(false);
      console.log('Loading set to false');
    }
  }, []);

  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);
  
  const handleNewEntry = () => {
    console.log('Journal: handleNewEntry called');
    // Always open a blank editor for new entry
    setSelectedEntry(null);
    setIsEditorOpen(true);
    setIsPromptSelectorOpen(false);
    console.log('Journal: Editor should be open for free writing');
  };

  const handlePromptMe = () => {
    // Open the prompt selector modal
    setIsPromptSelectorOpen(true);
  };

  const handleSelectPrompt = (prompt: JournalPrompt) => {
    console.log('Selected prompt:', prompt.text);
    console.log('About to create temp entry...');
    // Create a temporary entry object with the prompt data
    const tempEntry = {
      id: null,
      title: `Journal Entry - ${prompt.category}`,
      content: `Prompt: ${prompt.text}\n\n`,
      created_at: new Date().toISOString(),
      user_id: '',
      mood: null,
      ai_analysis: null,
      _isPromptBased: true // Custom flag to identify prompt-based entries
    };
    console.log('Created temp entry:', tempEntry);
    setSelectedEntry(tempEntry as any);
    console.log('Set selected entry, about to open editor...');
    setIsEditorOpen(true);
    setIsPromptSelectorOpen(false);
    console.log('Editor should be open now');
  };

  const handleEditEntry = (entry: JournalEntry) => {
    console.log('Editing journal entry:', entry.id);
    setSelectedEntry(entry);
    setIsEditorOpen(true);
  };

  const handleCloseEditor = () => {
    console.log('Closing journal editor...');
    setIsEditorOpen(false);
    setSelectedEntry(null);
  };

  const handleSave = async () => {
    console.log('Journal handleSave called, refreshing entries...');
    setIsSaving(true);
    try {
      // Refresh entries immediately
      await fetchEntries();
      console.log('Entries refreshed successfully');
    } catch (error) {
      console.error('Error refreshing entries:', error);
      setError(`Failed to refresh entries: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <div className="h-full flex flex-col space-y-6 pt-6">
        <Card className="bg-gradient-to-br from-primary/10 to-transparent">
          <CardHeader>
            <CardTitle className="text-2xl font-bold">Today's Reflection</CardTitle>
            <CardDescription>A quiet space for your thoughts.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button size="lg" className="flex-1" onClick={handlePromptMe}>
                <Sparkles className="mr-2 h-5 w-5" />
                Prompt Me
              </Button>
              <Button variant="outline" size="lg" className="flex-1" onClick={handleNewEntry}>
                <Plus className="mr-2 h-5 w-5" />
                Write Freely
              </Button>
            </div>
            <p className="text-sm text-muted-foreground mt-3">
              Choose to write freely or get inspired with thoughtful prompts.
            </p>
          </CardContent>
        </Card>

        <Separator />

        <div className="flex-1 flex flex-col min-h-0">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <BookOpen className="mr-3 h-6 w-6 text-primary" />
            Journal History
          </h2>
          <ScrollArea className="flex-1 pr-4 -mr-4">
            {error ? (
              <div className="flex flex-1 items-center justify-center rounded-lg border border-destructive/50 bg-destructive/10 shadow-sm h-full py-24">
                <div className="flex flex-col items-center gap-1 text-center">
                  <h3 className="text-2xl font-bold tracking-tight text-destructive">
                    Error Loading Entries
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    {error}
                  </p>
                  <Button variant="outline" onClick={fetchEntries}>
                    Try Again
                  </Button>
                </div>
              </div>
            ) : loading || isSaving ? (
              <div className="flex items-center justify-center h-24">
                <p>{isSaving ? 'Saving entry...' : 'Loading entries...'}</p>
              </div>
            ) : journalEntries.length > 0 ? (
              <div className="space-y-4">
                {journalEntries.map((entry, index) => (
                  <div key={entry.id}>
                    <Card className="hover:shadow-md transition-shadow group">
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-lg">{entry.title}</CardTitle>
                            <CardDescription>
                              {new Date(entry.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                              {entry.mood && ` - Feeling ${entry.mood}`}
                            </CardDescription>
                          </div>
                          <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => handleEditEntry(entry)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-muted-foreground line-clamp-2">{entry.content}</p>
                        {entry.ai_analysis && (
                          <div className="mt-3 pt-3 border-t border-border/50">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-xs font-medium text-primary">AI Analysis:</span>
                              <Badge variant="outline" className="text-xs">
                                <Brain className="w-3 h-3 mr-1" />
                                Mood Detected
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground">{entry.ai_analysis}</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm h-full py-24">
                <div className="flex flex-col items-center gap-1 text-center">
                  <h3 className="text-2xl font-bold tracking-tight">
                    You have no journal entries
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Start a new entry to begin your reflection.
                  </p>
                  <Button className="mt-4" onClick={handleNewEntry}>
                    <Plus className="mr-2 h-4 w-4" /> New Entry
                  </Button>
                </div>
              </div>
            )}
          </ScrollArea>
        </div>
      </div>

      <JournalEntryEditor
        entry={selectedEntry}
        isOpen={isEditorOpen}
        onClose={handleCloseEditor}
        onSave={handleSave}
      />

      {isPromptSelectorOpen && (
        <JournalPromptSelector
          onSelectPrompt={handleSelectPrompt}
          onWriteFreely={handleNewEntry}
          onClose={() => setIsPromptSelectorOpen(false)}
        />
      )}
    </>
  );
};

export default Journal;
