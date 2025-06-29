import React, { useState, useEffect } from 'react';
import { Save, Loader2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { journalService, type JournalEntry } from '@/services/supabase';
import { analyzeJournalEntry } from '@/services/gemini';

const moods = ["😊 Happy", "😢 Sad", "😠 Angry", "😐 Neutral", "😮 Surprised", "🤔 Thoughtful"];

interface JournalEntryEditorProps {
  entry: JournalEntry | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
}

const JournalEntryEditor: React.FC<JournalEntryEditorProps> = ({ entry, isOpen, onClose, onSave }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedMood, setSelectedMood] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setTitle(entry?.title || '');
      setContent(entry?.content || '');
      setSelectedMood(entry?.mood || '');
    }
  }, [entry, isOpen]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const ai_analysis = await analyzeJournalEntry(content);
      
      const entryData = {
        title,
        content,
        mood: selectedMood,
        ai_analysis,
      };

      if (entry?.id) {
        await journalService.update(entry.id, entryData);
      } else {
        await journalService.create(entryData);
      }
      onSave();
      onClose();
    } catch (error) {
      console.error('Failed to save entry:', error);
      // You might want to show a toast notification here
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
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl w-full h-[80vh] bg-card border-border flex flex-col">
        <DialogHeader>
          <DialogTitle>{entry?.id ? 'Edit Entry' : 'New Journal Entry'}</DialogTitle>
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
            <div className="flex-1 h-full">
              <Textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="What's on your mind?"
                className="w-full h-full resize-none"
              />
            </div>
            
            <div className="w-[240px]">
              <h4 className="font-medium mb-4 text-lg">How are you feeling?</h4>
              <div className="flex flex-col gap-2">
                {moods.map(mood => (
                  <Button 
                    key={mood}
                    variant={selectedMood === mood ? 'default' : 'secondary'}
                    onClick={() => setSelectedMood(mood)}
                    className="transition-all justify-start p-4 h-12 text-base"
                  >
                    {mood}
                  </Button>
                ))}
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
            <Button onClick={handleSave} disabled={isSaving} size="lg">
              {isSaving ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              Save Entry
            </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default JournalEntryEditor; 