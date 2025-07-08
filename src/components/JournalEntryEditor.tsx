import React, { useState, useEffect } from 'react';
import { Save, Loader2, Trash2, Brain, Sparkles, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { journalService, type JournalEntry } from '@/services/supabase';
import { moodOrchestrator } from '@/services/mood-orchestrator';
import { MOOD_CATEGORIES } from '@/services/gemini';

interface JournalEntryEditorProps {
  entry: JournalEntry | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
}

const JournalEntryEditor: React.FC<JournalEntryEditorProps> = ({ entry, isOpen, onClose, onSave }) => {
  console.log('JournalEntryEditor render - entry:', entry);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [moodAnalysis, setMoodAnalysis] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [startTime, setStartTime] = useState<number | null>(null);

  useEffect(() => {
    console.log('JournalEntryEditor useEffect - isOpen:', isOpen, 'entry:', entry);
    if (isOpen) {
      setStartTime(Date.now());
      if (entry?.id) {
        // Editing existing entry
        setTitle(entry.title || '');
        setContent(entry.content || '');
      } else {
        // New entry - check if it's a prompt-based entry
        if (entry && (entry as any)._isPromptBased) {
          setTitle(entry.title || '');
          setContent(entry.content || '');
        } else {
          setTitle('');
          setContent('');
        }
      }
      setMoodAnalysis(null);
    } else {
      setStartTime(null);
    }
  }, [entry, isOpen]);

  const handleSave = async () => {
    if (!title.trim() || !content.trim()) {
      alert('Please provide both a title and content for your journal entry.');
      return;
    }

    setIsSaving(true);
    
    try {
      console.log('Starting to save journal entry...');
      
      const entryData = {
        title: title.trim(),
        content: content.trim(),
      };

      let journalEntry;
      
      // Save or update the journal entry first
      if (entry?.id) {
        console.log('Updating existing entry with ID:', entry.id);
        journalEntry = await journalService.update(entry.id, entryData);
      } else {
        console.log('Creating new entry...');
        journalEntry = await journalService.create(entryData);
      }
      
      console.log('Journal entry saved successfully:', journalEntry.id);

      // Calculate duration in minutes
      let durationMinutes = null;
      if (startTime) {
        durationMinutes = Math.max(1, Math.round((Date.now() - startTime) / 60000));
      }

      // Trigger mood analysis
      try {
        console.log('Triggering mood analysis for entry:', journalEntry.id, 'with duration:', durationMinutes);
        await moodOrchestrator.handleRealtimeMoodUpdate(
          'journal',
          journalEntry.id,
          journalEntry.content,
          undefined,
          durationMinutes
        );
        console.log('Mood analysis complete.');
      } catch (analysisError) {
        console.error('Mood analysis failed:', analysisError);
        // Non-critical error, so we don't block the user
        // Maybe show a toast notification in a real app
      }

      // Reset form state
      setTitle('');
      setContent('');
      setMoodAnalysis(null);

      // Call onSave to refresh the list
      console.log('Refreshing journal list...');
      onSave();
      
      // Wait a moment for the refresh to start
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Close the dialog
      console.log('Closing dialog...');
      onClose();
      
    } catch (error) {
      console.error('Failed to save entry:', error);
      alert(`Failed to save journal entry: ${error.message}. Please try again.`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!entry?.id || !confirm("Are you sure you want to delete this journal entry?")) return;
    setIsSaving(true);
    try {
      await journalService.delete(entry.id);
      onSave(); // This will trigger a refresh on the main page
      onClose();
    } catch (error) {
      console.error("Failed to delete entry:", error);
      alert('Failed to delete journal entry. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  // Real-time mood preview (as user types)
  const handlePreviewMood = async () => {
    if (!content.trim() || content.length < 20) {
      return;
    }

    setIsAnalyzing(true);
    try {
      // We can't store this since we don't have an entry ID yet, but we can preview
      const { analyzeMoodFromText } = await import('@/services/gemini');
      const analysis = await analyzeMoodFromText(content, 'journal', title || undefined);
      setMoodAnalysis(analysis);
    } catch (error) {
      console.error('Error previewing mood:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const MoodPreview = () => {
    if (!moodAnalysis) return null;

    const moodMeta = MOOD_CATEGORIES[moodAnalysis.primaryMood];
    const confidenceColor = moodAnalysis.confidence > 0.7 ? 'text-green-500' : 
                           moodAnalysis.confidence > 0.4 ? 'text-yellow-500' : 'text-red-500';

    return (
      <Alert className="mt-4">
        <Brain className="h-4 w-4" />
        <AlertDescription>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-lg">{moodMeta.emoji}</span>
              <div>
                <div className="font-semibold capitalize">{moodAnalysis.primaryMood}</div>
                <div className="text-xs text-muted-foreground">
                  Intensity: {moodAnalysis.intensity}/10
                </div>
              </div>
            </div>
            <Badge variant="secondary" className={confidenceColor}>
              {Math.round(moodAnalysis.confidence * 100)}% confident
            </Badge>
          </div>
          {moodAnalysis.reasoning && (
            <p className="text-sm text-muted-foreground mt-2">
              {moodAnalysis.reasoning}
            </p>
          )}
          {moodAnalysis.keyEmotions && moodAnalysis.keyEmotions.length > 0 && (
            <div className="mt-2">
              <div className="text-xs text-muted-foreground mb-1">Key emotions:</div>
              <div className="flex flex-wrap gap-1">
                {moodAnalysis.keyEmotions.slice(0, 5).map((emotion, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {emotion}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </AlertDescription>
      </Alert>
    );
  };

  if (!isOpen) return null;

  // Fallback UI for invalid entry - only show error for malformed entries, not null (new entries)
  if (entry && (typeof entry !== 'object' || (!entry.id && !entry._isPromptBased && !entry.title))) {
    return (
      <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
        <div className="bg-background rounded-lg shadow-lg p-8 max-w-lg w-full text-center">
          <h2 className="text-xl font-bold mb-4 text-destructive">Error: Invalid journal entry</h2>
          <p className="mb-4">Something went wrong. Please try again or contact support.</p>
          <button className="btn btn-primary" onClick={onClose}>Close</button>
        </div>
      </div>
    );
  }

  try {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent 
          key={entry?.id || 'new-entry'}
          className="sm:max-w-4xl w-full h-[80vh] bg-card border-border flex flex-col"
        >
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {entry?.id ? 'Edit Entry' : 'New Journal Entry'}
              {content.startsWith('Prompt:') && (
                <Badge variant="outline" className="text-xs">
                  <BookOpen className="w-3 h-3 mr-1" />
                  Prompt-Based
                </Badge>
              )}
              <Badge variant="secondary" className="ml-auto">
                <Sparkles className="w-3 h-3 mr-1" />
                AI Analysis
              </Badge>
            </DialogTitle>
            <DialogDescription>
              {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex-1 flex flex-col gap-4 py-4 min-h-0">
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Give your entry a title..."
            />
            
            <div className="flex-1 flex gap-6 min-h-0">
              <div className="flex-1 flex flex-col h-full">
                          <Textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="What's on your mind? Write freely - AI will analyze your mood automatically when you save."
                className="w-full flex-1 resize-none"
                style={{
                  fontFamily: content.startsWith('Prompt:') ? 'monospace' : 'inherit'
                }}
              />
                
                {content.length > 20 && !isAnalyzing && !moodAnalysis && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handlePreviewMood}
                    className="mt-2 self-start"
                    disabled={isAnalyzing}
                  >
                    <Brain className="w-4 h-4 mr-2" />
                    Preview Mood Analysis
                  </Button>
                )}

                {isAnalyzing && (
                  <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Analyzing your mood...
                  </div>
                )}

                <MoodPreview />
              </div>
              
              <div className="w-[300px] space-y-4">
                <div>
                  <h4 className="font-medium mb-3 text-lg flex items-center gap-2">
                    <Brain className="w-5 h-5 text-primary" />
                    AI Mood Analysis
                  </h4>
                  <div className="text-sm text-muted-foreground mb-3">
                    Your mood will be automatically analyzed using AI when you save this entry. This helps track your emotional patterns over time.
                  </div>
                </div>
                
                <div className="pt-4 border-t border-border">
                  <h5 className="font-medium mb-2 text-sm">Available Moods</h5>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(MOOD_CATEGORIES).map(([mood, meta]) => (
                      <div
                        key={mood}
                        className="flex items-center gap-2 p-2 rounded-lg bg-muted/50 text-xs"
                      >
                        <span className="text-base">{meta.emoji}</span>
                        <span className="capitalize">{mood}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <DialogFooter className="flex justify-between w-full mt-auto">
              {entry?.id && (
                  <Button variant="destructive" onClick={handleDelete} disabled={isSaving}>
                      <Trash2 className="mr-2 h-4 w-4" /> Delete
                  </Button>
              )}
              <div className="flex-grow" />
              <Button onClick={handleSave} disabled={isSaving || !title.trim() || !content.trim()} size="lg">
                {isSaving ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Save className="mr-2 h-4 w-4" />
                )}
                {isSaving ? 'Saving & Analyzing...' : 'Save Entry'}
              </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  } catch (err) {
    return (
      <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
        <div className="bg-background rounded-lg shadow-lg p-8 max-w-lg w-full text-center">
          <h2 className="text-xl font-bold mb-4 text-destructive">Rendering Error</h2>
          <p className="mb-4">{String(err)}</p>
          <button className="btn btn-primary" onClick={onClose}>Close</button>
        </div>
      </div>
    );
  }
};

export default JournalEntryEditor; 