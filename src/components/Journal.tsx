import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Book, Plus, Calendar, Clock, Edit3, Trash2, Save, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

interface JournalEntry {
  id: string;
  date: string;
  content: string;
  timestamp: Date;
  mood?: 'happy' | 'sad' | 'anxious' | 'peaceful' | 'frustrated' | 'neutral';
}

const Journal = () => {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [currentEntry, setCurrentEntry] = useState("");
  const [selectedMood, setSelectedMood] = useState<JournalEntry['mood']>();
  const [editingEntry, setEditingEntry] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");

  // Load entries from localStorage on component mount
  useEffect(() => {
    const savedEntries = localStorage.getItem('journal-entries');
    if (savedEntries) {
      const parsedEntries = JSON.parse(savedEntries).map((entry: any) => ({
        ...entry,
        timestamp: new Date(entry.timestamp)
      }));
      setEntries(parsedEntries);
    }
  }, []);

  // Save entries to localStorage whenever entries change
  useEffect(() => {
    localStorage.setItem('journal-entries', JSON.stringify(entries));
  }, [entries]);

  const today = new Date().toISOString().split('T')[0];
  const hasEntryToday = entries.some(entry => entry.date === today);

  const handleCreateEntry = () => {
    if (!currentEntry.trim()) return;

    const newEntry: JournalEntry = {
      id: Date.now().toString(),
      date: today,
      content: currentEntry.trim(),
      timestamp: new Date(),
      mood: selectedMood
    };

    setEntries(prev => [newEntry, ...prev]);
    setCurrentEntry("");
    setSelectedMood(undefined);
    setIsCreating(false);
  };

  const handleEditEntry = (entry: JournalEntry) => {
    setEditingEntry(entry.id);
    setEditContent(entry.content);
  };

  const handleSaveEdit = (entryId: string) => {
    if (!editContent.trim()) return;

    setEntries(prev => prev.map(entry => 
      entry.id === entryId 
        ? { ...entry, content: editContent.trim() }
        : entry
    ));
    setEditingEntry(null);
    setEditContent("");
  };

  const handleDeleteEntry = (entryId: string) => {
    setEntries(prev => prev.filter(entry => entry.id !== entryId));
  };

  const getMoodEmoji = (mood?: string) => {
    const moodEmojis: Record<string, string> = {
      happy: '😊',
      sad: '😢',
      anxious: '😰',
      peaceful: '😌',
      frustrated: '😤',
      neutral: '😐'
    };
    return moodEmojis[mood || 'neutral'] || '📝';
  };

  const getMoodColor = (mood?: string) => {
    const moodColors: Record<string, string> = {
      happy: 'bg-green-100 text-green-800 border-green-200',
      sad: 'bg-blue-100 text-blue-800 border-blue-200',
      anxious: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      peaceful: 'bg-purple-100 text-purple-800 border-purple-200',
      frustrated: 'bg-red-100 text-red-800 border-red-200',
      neutral: 'bg-gray-100 text-gray-800 border-gray-200'
    };
    return moodColors[mood || 'neutral'] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <div className="flex items-center justify-center gap-3 mb-4">
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            <Book className="w-8 h-8 text-primary" />
          </motion.div>
          <h1 className="text-3xl font-light">Personal Journal</h1>
        </div>
        <p className="text-muted-foreground">
          Reflect on your day and track your emotional journey
        </p>
      </motion.div>

      {/* Today's Entry Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="border-0 bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary" />
                Today's Reflection
              </CardTitle>
              {hasEntryToday && (
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  ✓ Completed
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {!isCreating && !hasEntryToday ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">
                  Take a moment to reflect on your day
                </p>
                <Button
                  onClick={() => setIsCreating(true)}
                  className="bg-primary hover:bg-primary/90 gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Start Today's Entry
                </Button>
              </div>
            ) : isCreating ? (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-4"
              >
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    How are you feeling today?
                  </label>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {[
                      { value: 'happy', label: 'Happy', emoji: '😊' },
                      { value: 'peaceful', label: 'Peaceful', emoji: '😌' },
                      { value: 'neutral', label: 'Neutral', emoji: '😐' },
                      { value: 'sad', label: 'Sad', emoji: '😢' },
                      { value: 'anxious', label: 'Anxious', emoji: '😰' },
                      { value: 'frustrated', label: 'Frustrated', emoji: '😤' }
                    ].map((mood) => (
                      <Button
                        key={mood.value}
                        variant={selectedMood === mood.value ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSelectedMood(mood.value as JournalEntry['mood'])}
                        className="gap-2"
                      >
                        <span>{mood.emoji}</span>
                        {mood.label}
                      </Button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">
                    What's on your mind?
                  </label>
                  <Textarea
                    value={currentEntry}
                    onChange={(e) => setCurrentEntry(e.target.value)}
                    placeholder="Share your thoughts, feelings, experiences, or anything you'd like to reflect on..."
                    className="min-h-32 resize-none border-0 bg-background/50 focus:bg-background"
                    rows={6}
                  />
                </div>

                <div className="flex gap-3 justify-end">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsCreating(false);
                      setCurrentEntry("");
                      setSelectedMood(undefined);
                    }}
                    className="gap-2"
                  >
                    <X className="w-4 h-4" />
                    Cancel
                  </Button>
                  <Button
                    onClick={handleCreateEntry}
                    disabled={!currentEntry.trim()}
                    className="bg-primary hover:bg-primary/90 gap-2"
                  >
                    <Save className="w-4 h-4" />
                    Save Entry
                  </Button>
                </div>
              </motion.div>
            ) : (
              <div className="p-4 bg-primary/10 rounded-lg">
                <p className="text-muted-foreground text-center">
                  You've already completed today's reflection. Check back tomorrow for a new entry!
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Previous Entries */}
      {entries.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="border-0 bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Book className="w-5 h-5 text-primary" />
                Previous Entries
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <AnimatePresence>
                  {entries.map((entry, index) => (
                    <motion.div
                      key={entry.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ delay: index * 0.1 }}
                      className="border border-border/50 rounded-lg p-4 bg-background/30"
                    >
                      {editingEntry === entry.id ? (
                        <div className="space-y-3">
                          <Textarea
                            value={editContent}
                            onChange={(e) => setEditContent(e.target.value)}
                            className="min-h-24 resize-none border-0 bg-background/50 focus:bg-background"
                            rows={4}
                          />
                          <div className="flex gap-2 justify-end">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setEditingEntry(null);
                                setEditContent("");
                              }}
                            >
                              Cancel
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => handleSaveEdit(entry.id)}
                              disabled={!editContent.trim()}
                            >
                              Save
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div>
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-muted-foreground" />
                                <span className="text-sm font-medium">
                                  {formatDate(entry.date)}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4 text-muted-foreground" />
                                <span className="text-sm text-muted-foreground">
                                  {entry.timestamp.toLocaleTimeString([], { 
                                    hour: '2-digit', 
                                    minute: '2-digit' 
                                  })}
                                </span>
                              </div>
                              {entry.mood && (
                                <Badge 
                                  variant="outline" 
                                  className={`${getMoodColor(entry.mood)} border`}
                                >
                                  {getMoodEmoji(entry.mood)} {entry.mood}
                                </Badge>
                              )}
                            </div>
                            <div className="flex gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEditEntry(entry)}
                                className="h-8 w-8 p-0"
                              >
                                <Edit3 className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteEntry(entry.id)}
                                className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                          <div className="prose prose-sm max-w-none">
                            <p className="whitespace-pre-wrap leading-relaxed text-foreground">
                              {entry.content}
                            </p>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Empty State */}
      {entries.length === 0 && !isCreating && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-center py-12"
        >
          <Book className="w-16 h-16 text-muted-foreground/50 mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">No journal entries yet</h3>
          <p className="text-muted-foreground mb-4">
            Start your journaling journey by creating your first entry
          </p>
          <Button
            onClick={() => setIsCreating(true)}
            className="bg-primary hover:bg-primary/90 gap-2"
          >
            <Plus className="w-4 h-4" />
            Create First Entry
          </Button>
        </motion.div>
      )}
    </div>
  );
};

export default Journal;
