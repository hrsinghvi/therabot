
import { useState, useRef, useEffect } from "react";
import { ArrowLeft, Send, Mic } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

interface TextChatProps {
  onBack: () => void;
}

interface Message {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
}

const TextChat = ({ onBack }: TextChatProps) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'ai',
      content: "Hello, I'm here to listen and support you. Feel free to share whatever is on your mind - whether it's something that happened today, how you're feeling, or anything else you'd like to talk about. This is your safe space.",
      timestamp: new Date()
    }
  ]);
  const [currentMessage, setCurrentMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const generateAIResponse = (userMessage: string): string => {
    const responses = [
      "I hear you. What you're experiencing sounds really challenging. Can you tell me more about how this is affecting you?",
      "Thank you for sharing that with me. It takes courage to express these feelings. What would help you feel more supported right now?",
      "It sounds like you're carrying a lot. I want you to know that your feelings are completely valid. Have you been able to talk to anyone else about this?",
      "I can sense the emotion behind your words. Sometimes when we're going through difficult times, it helps to focus on small steps. What's one thing that might bring you a moment of peace today?",
      "What you're describing resonates with many people, and you're definitely not alone in feeling this way. How long have you been experiencing these feelings?",
      "I appreciate you trusting me with this. It sounds like you're being really hard on yourself. What would you say to a friend who was going through the same thing?",
      "Those feelings you're describing are so human and understandable. When you think about this situation, what feels most overwhelming about it?",
      "I'm glad you're taking the time to reflect on this. Self-awareness like yours is actually a strength. What do you think your emotions are trying to tell you?",
    ];
    
    return responses[Math.floor(Math.random() * responses.length)];
  };

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

    // Simulate AI thinking time
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: generateAIResponse(userMessage.content),
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, aiResponse]);
      setIsTyping(false);
    }, 1500 + Math.random() * 1000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent/20 to-secondary/30 flex flex-col">
      <div className="max-w-4xl mx-auto flex flex-col h-screen w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border/50">
          <Button
            variant="ghost"
            onClick={onBack}
            className="gap-2 hover:bg-accent/50"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          <h1 className="text-xl font-medium">Text Conversation</h1>
          <div className="w-16"></div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <Card
                className={`max-w-[80%] border-0 ${
                  message.type === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-card/70'
                }`}
              >
                <CardContent className="p-4">
                  <p className="whitespace-pre-wrap leading-relaxed">
                    {message.content}
                  </p>
                  <div className={`text-xs mt-2 opacity-70 ${
                    message.type === 'user' ? 'text-primary-foreground' : 'text-muted-foreground'
                  }`}>
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </CardContent>
              </Card>
            </div>
          ))}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex justify-start">
              <Card className="bg-card/70 border-0">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                    <span className="text-sm text-muted-foreground">CalmMind is typing...</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t border-border/50 bg-background/80 backdrop-blur">
          <div className="flex gap-3 items-end">
            <div className="flex-1">
              <Textarea
                ref={textareaRef}
                value={currentMessage}
                onChange={(e) => setCurrentMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Share what's on your mind..."
                className="min-h-12 max-h-32 resize-none border-0 bg-card/50 focus:bg-card"
                rows={1}
              />
            </div>
            <Button
              onClick={sendMessage}
              disabled={!currentMessage.trim() || isTyping}
              className="bg-primary hover:bg-primary/90 px-4 py-3"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
          
          <div className="mt-2 text-xs text-muted-foreground text-center">
            💡 Press Enter to send, Shift+Enter for new line
          </div>
        </div>
      </div>
    </div>
  );
};

export default TextChat;
