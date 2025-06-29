import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Plus, BookOpen, Edit, Brain } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { journalService, type JournalEntry } from '@/services/supabase';
import JournalEntryEditor from './JournalEntryEditor';

const Journal = () => {
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);

  const fetchEntries = useCallback(async () => {
    try {
      setLoading(true);
      const entries = await journalService.list();
      setJournalEntries(entries.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));
    } catch (error) {
      console.error("Error fetching journal entries:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);
  
  const handleNewEntry = () => {
    setSelectedEntry(null);
    setIsEditorOpen(true);
  };

  const handleEditEntry = (entry: JournalEntry) => {
    setSelectedEntry(entry);
    setIsEditorOpen(true);
  };

  const handleCloseEditor = () => {
    setIsEditorOpen(false);
    setSelectedEntry(null);
  };

  const handleSave = () => {
    fetchEntries();
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
        className="h-full flex flex-col space-y-6 pt-6"
      >
        <Card className="bg-gradient-to-br from-primary/10 to-transparent">
          <CardHeader>
            <CardTitle className="text-2xl font-bold">Today's Reflection</CardTitle>
            <CardDescription>A quiet space for your thoughts.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button size="lg" className="w-full md:w-auto" onClick={handleNewEntry}>
              <Plus className="mr-2 h-5 w-5" />
              Start Today's Entry
            </Button>
          </CardContent>
        </Card>

        <Separator />

        <div className="flex-1 flex flex-col min-h-0">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <BookOpen className="mr-3 h-6 w-6 text-primary" />
            Journal History
          </h2>
          <ScrollArea className="flex-1 pr-4 -mr-4">
            {loading ? (
              <p>Loading entries...</p>
            ) : journalEntries.length > 0 ? (
              <div className="space-y-4">
                {journalEntries.map((entry, index) => (
                  <motion.div
                    key={entry.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.05 }}
                  >
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
                  </motion.div>
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
      </motion.div>

      <JournalEntryEditor
        entry={selectedEntry}
        isOpen={isEditorOpen}
        onClose={handleCloseEditor}
        onSave={handleSave}
      />
    </>
  );
};

export default Journal;
