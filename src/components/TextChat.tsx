
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { generateTherapeuticResponse } from "@/services/gemini";

interface Message {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
  emotionalTone?: 'supportive' | 'empathetic' | 'encouraging' | 'grounding';
  suggestedActions?: string[];
}

const TextChat = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'ai',
      content: "Hello, I'm CalmMind, your AI therapy companion. I'm here to listen and support you through whatever you're experiencing. Feel free to share what's on your mind - this is your safe space.",
      timestamp: new Date(),
      emotionalTone: 'supportive'
    }
  ]);
  const [currentMessage, setCurrentMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [conversationHistory, setConversationHistory] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!currentMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: currentMessage.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setCurrentMessage("");
    setIsTyping(true);

    // Update conversation history
    const newHistory = [...conversationHistory, userMessage.content];
    setConversationHistory(newHistory);

    try {
      const response = await generateTherapeuticResponse(userMessage.content, newHistory);
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: response.content,
        timestamp: new Date(),
        emotionalTone: response.emotionalTone,
        suggestedActions: response.suggestedActions
      };
      
      setMessages(prev => [...prev, aiMessage]);
      setConversationHistory(prev => [...prev, response.content]);
    } catch (error) {
      console.error('Error generating response:', error);
      const fallbackMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: "I'm having trouble connecting right now, but I want you to know that I'm here for you. Your feelings are valid and important.",
        timestamp: new Date(),
        emotionalTone: 'supportive'
      };
      setMessages(prev => [...prev, fallbackMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const getEmotionalToneColor = (tone?: string) => {
    switch (tone) {
      case 'empathetic': return 'border-l-blue-500';
      case 'encouraging': return 'border-l-green-500';
      case 'grounding': return 'border-l-purple-500';
      default: return 'border-l-primary';
    }
  };

  const messageVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1
    }
  };

  return (
    <div className="h-[calc(100vh-180px)] flex flex-col bg-card/20 backdrop-blur-sm rounded-lg border border-border/50">
      {/* Header */}
      <motion.div 
        className="flex items-center justify-center p-4 border-b border-border/50"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center gap-2">
          <motion.div
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          >
            <Sparkles className="w-5 h-5 text-primary" />
          </motion.div>
          <h1 className="text-xl font-medium">AI Therapy Chat</h1>
        </div>
      </motion.div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <AnimatePresence>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              variants={messageVariants}
              initial="hidden"
              animate="visible"
              transition={{ type: "spring" as const, stiffness: 300, damping: 25 }}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <Card
                className={`max-w-[80%] border-0 ${
                  message.type === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : `bg-card/70 border-l-4 ${getEmotionalToneColor(message.emotionalTone)}`
                }`}
              >
                <CardContent className="p-4">
                  <motion.p 
                    className="whitespace-pre-wrap leading-relaxed"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    {message.content}
                  </motion.p>
                  
                  {message.suggestedActions && message.suggestedActions.length > 0 && (
                    <motion.div 
                      className="mt-3 space-y-2"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 }}
                    >
                      <p className="text-xs text-muted-foreground">Suggested actions:</p>
                      <div className="flex flex-wrap gap-2">
                        {message.suggestedActions.map((action, index) => (
                          <motion.span
                            key={index}
                            className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            {action}
                          </motion.span>
                        ))}
                      </div>
                    </motion.div>
                  )}
                  
                  <div className={`text-xs mt-2 opacity-70 ${
                    message.type === 'user' ? 'text-primary-foreground' : 'text-muted-foreground'
                  }`}>
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Typing Indicator */}
        <AnimatePresence>
          {isTyping && (
            <motion.div 
              className="flex justify-start"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Card className="bg-card/70 border-0">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      {[0, 1, 2].map((i) => (
                        <motion.div
                          key={i}
                          className="w-2 h-2 bg-primary rounded-full"
                          animate={{
                            y: [0, -8, 0],
                            opacity: [0.4, 1, 0.4]
                          }}
                          transition={{
                            duration: 1,
                            repeat: Infinity,
                            delay: i * 0.2
                          }}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-muted-foreground">CalmMind is thinking...</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <motion.div 
        className="p-4 border-t border-border/50 bg-background/80 backdrop-blur"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex gap-3 items-end">
          <div className="flex-1">
            <Textarea
              ref={textareaRef}
              value={currentMessage}
              onChange={(e) => setCurrentMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Share what's on your mind..."
              className="min-h-12 max-h-32 resize-none border-0 bg-card/50 focus:bg-card transition-colors"
              rows={1}
            />
          </div>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              onClick={sendMessage}
              disabled={!currentMessage.trim() || isTyping}
              className="bg-primary hover:bg-primary/90 px-4 py-3 transition-colors"
            >
              <Send className="w-4 h-4" />
            </Button>
          </motion.div>
        </div>
        
        <div className="mt-2 text-xs text-muted-foreground text-center">
          💡 Press Enter to send, Shift+Enter for new line
        </div>
      </motion.div>
    </div>
  );
};

export default TextChat;
