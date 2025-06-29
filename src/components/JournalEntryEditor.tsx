import React, { useState, useEffect } from 'react';
import { Save, Loader2, Trash2, Brain, Sparkles } from 'lucide-react';
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
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [moodAnalysis, setMoodAnalysis] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setTitle(entry?.title || '');
      setContent(entry?.content || '');
      setMoodAnalysis(null);
    }
  }, [entry, isOpen]);

  const handleSave = async () => {
    if (!title.trim() || !content.trim()) {
      alert('Please provide both a title and content for your journal entry.');
      return;
    }

    setIsSaving(true);
    try {
      let journalEntry;
      const entryData = {
        title: title.trim(),
        content: content.trim(),
      };

      // Save or update the journal entry first
      if (entry?.id) {
        journalEntry = await journalService.update(entry.id, entryData);
      } else {
        journalEntry = await journalService.create(entryData);
      }

      // Trigger mood analysis using the mood orchestrator
      try {
        const moodResult = await moodOrchestrator.handleRealtimeMoodUpdate(
          'journal', 
          journalEntry.id, 
          content, 
          title
        );
        setMoodAnalysis(moodResult.analysis);
      } catch (error) {
        console.error('Error analyzing mood:', error);
        // Don't fail the save if mood analysis fails
      }

      onSave();
      onClose();
    } catch (error) {
      console.error('Failed to save entry:', error);
      alert('Failed to save journal entry. Please try again.');
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl w-full h-[80vh] bg-card border-border flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {entry?.id ? 'Edit Entry' : 'New Journal Entry'}
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
                
                <MoodPreview />
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
};

export default JournalEntryEditor; 