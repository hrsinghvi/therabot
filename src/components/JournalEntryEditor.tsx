import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { Mic, MicOff, Save, Loader2, X, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { journalService, type JournalEntry } from '@/services/supabase';
import { analyzeJournalEntry } from '@/services/gemini';

// Type definition for the speech recognition instance
declare global {
  interface Window {
    SpeechRecognition: new () => any;
    webkitSpeechRecognition: new () => any;
  }
}

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
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any | null>(null);

  useEffect(() => {
    if (isOpen) {
      setTitle(entry?.title || '');
      setContent(entry?.content || '');
      setSelectedMood(entry?.mood || '');
    }
  }, [entry, isOpen]);

  useEffect(() => {
    // Check for browser support
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event: any) => {
        let interimTranscript = '';
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }
        setContent(prevContent => prevContent + finalTranscript);
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error', event.error);
        setIsListening(false);
      };
      
      recognitionRef.current.onend = () => {
        if (isListening) {
          recognitionRef.current?.start();
        }
      };
    }

    return () => {
      recognitionRef.current?.stop();
    };
  }, [isListening]);

  const handleListen = useCallback(() => {
    if (!recognitionRef.current) return;

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      setContent(prev => prev + ' '); // Add space before starting new transcription
      recognitionRef.current.start();
      setIsListening(true);
    }
  }, [isListening]);

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
            <div className="relative flex-1 h-full">
              <Textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="What's on your mind?"
                className="w-full h-full resize-none pr-12"
              />
              <Button 
                size="icon" 
                variant={isListening ? 'destructive' : 'outline'}
                onClick={handleListen}
                className="absolute bottom-3 right-3"
              >
                {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
              </Button>
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