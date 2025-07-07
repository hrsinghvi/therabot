import React, { useState } from 'react';
import { Sparkles, BookOpen, PenTool, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { JournalPrompt, getRandomPrompt, getCategories, getDifficulties } from '@/services/journalPrompts';

interface JournalPromptSelectorProps {
  onSelectPrompt: (prompt: JournalPrompt) => void;
  onWriteFreely: () => void;
  onClose: () => void;
}

const JournalPromptSelector: React.FC<JournalPromptSelectorProps> = ({ onSelectPrompt, onWriteFreely, onClose }) => {
  const [showPrompts, setShowPrompts] = useState(false);
  const [currentPrompt, setCurrentPrompt] = useState<JournalPrompt>(getRandomPrompt());

  const handleShowPrompts = () => {
    setShowPrompts(true);
  };

  const handleGetNewPrompt = () => {
    setCurrentPrompt(getRandomPrompt());
  };

  const handleUsePrompt = () => {
    console.log('JournalPromptSelector: handleUsePrompt called with prompt:', currentPrompt);
    onSelectPrompt(currentPrompt);
  };

  if (showPrompts) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-background rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-hidden">
          <CardHeader className="border-b">
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" />
              Choose a Prompt
            </CardTitle>
          </CardHeader>
          
          <CardContent className="p-6 space-y-4">
            <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
              <CardContent className="p-6">
                <p className="text-lg leading-relaxed mb-4">{currentPrompt.text}</p>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    {currentPrompt.category}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {currentPrompt.difficulty}
                  </Badge>
                </div>
              </CardContent>
            </Card>
            
            <div className="flex gap-3">
              <Button onClick={handleUsePrompt} className="flex-1">
                <BookOpen className="mr-2 h-4 w-4" />
                Use This Prompt
              </Button>
              <Button variant="outline" onClick={handleGetNewPrompt} className="flex-1">
                <RefreshCw className="mr-2 h-4 w-4" />
                Try Another
              </Button>
            </div>
            
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setShowPrompts(false)} className="flex-1">
                Back to Options
              </Button>
              <Button variant="outline" onClick={onClose} className="flex-1">
                Cancel
              </Button>
            </div>
          </CardContent>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-background rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-hidden">
        <CardHeader className="border-b">
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Choose Your Writing Style
          </CardTitle>
        </CardHeader>
        
        <CardContent className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card 
              className="cursor-pointer hover:shadow-md transition-shadow border-2 border-primary/20 hover:border-primary/40"
              onClick={onWriteFreely}
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  <PenTool className="h-6 w-6 text-primary" />
                  <h3 className="font-semibold">Write Freely</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  Start with a blank page and write whatever comes to mind.
                </p>
              </CardContent>
            </Card>

            <Card 
              className="cursor-pointer hover:shadow-md transition-shadow border-2 border-primary/20 hover:border-primary/40"
              onClick={handleShowPrompts}
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  <BookOpen className="h-6 w-6 text-primary" />
                  <h3 className="font-semibold">Use a Prompt</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  Get inspired with thoughtful prompts to guide your writing.
                </p>
              </CardContent>
            </Card>
          </div>
          
          <div className="flex gap-3 mt-6">
            <Button onClick={onWriteFreely} className="flex-1">
              <PenTool className="mr-2 h-4 w-4" />
              Write Freely
            </Button>
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
          </div>
        </CardContent>
      </div>
    </div>
  );
};

export default JournalPromptSelector; 