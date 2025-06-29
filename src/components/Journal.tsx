import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { journalService, type JournalEntry } from '@/services/supabase';

const Journal = () => {
  const [journalEntries, setJournalEntries] = React.useState<JournalEntry[]>([]);
  const [loading, setLoading] = React.useState(true);

  useEffect(() => {
    const fetchEntries = async () => {
      try {
        setLoading(true);
        const entries = await journalService.list();
        setJournalEntries(entries);
      } catch (error) {
        console.error("Error fetching journal entries:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEntries();
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="h-full flex flex-col space-y-6"
    >
      {/* Today's Reflection Section */}
      <Card className="bg-gradient-to-br from-primary/10 to-transparent">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Today's Reflection</CardTitle>
          <CardDescription>A quiet space for your thoughts.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button size="lg" className="w-full md:w-auto">
            <Plus className="mr-2 h-5 w-5" />
            Start Today's Entry
          </Button>
        </CardContent>
      </Card>

      <Separator />

      {/* Journal History Section */}
      <div className="flex-1 flex flex-col">
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          <BookOpen className="mr-3 h-6 w-6 text-primary" />
          Journal History
        </h2>
        <ScrollArea className="flex-1 pr-4 -mr-4">
          {loading ? (
            <div className="space-y-4">
                <p>Loading entries...</p>
            </div>
          ) : journalEntries.length > 0 ? (
            <div className="space-y-4">
              {journalEntries.map((entry, index) => (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.05 }}
                >
                  <Card className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardHeader>
                      <CardTitle className="text-lg">{entry.title}</CardTitle>
                      <CardDescription>{new Date(entry.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground">{entry.content?.substring(0, 100)}...</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm h-full">
              <div className="flex flex-col items-center gap-1 text-center">
                <h3 className="text-2xl font-bold tracking-tight">
                  You have no journal entries
                </h3>
                <p className="text-sm text-muted-foreground">
                  Start a new entry to begin your reflection.
                </p>
                <Button className="mt-4">
                  <Plus className="mr-2 h-4 w-4" /> New Entry
                </Button>
              </div>
            </div>
          )}
        </ScrollArea>
      </div>
    </motion.div>
  );
};

export default Journal;
