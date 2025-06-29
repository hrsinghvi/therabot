import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { Send, Sparkles, BrainCircuit, Plus, MessageSquare, Edit2, Trash2, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { getChatSession, sendMessageToGemini, generateChatTitle } from "@/services/gemini";
import { conversationService, messageService, type Conversation, type Message as DBMessage } from "@/services/supabase";
import { useAuth } from "@/contexts/AuthContext";

// UI Message type for local state
interface Message {
  id?: string;
  role: 'user' | 'model';
  content: string;
  conversation_id?: string;
  created_at?: string;
}
import type { ChatSession } from "@google/generative-ai";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

// Using types from supabase service

const EmptyChatState = () => (
  <motion.div
    key="empty-state"
    initial={{ opacity: 0, scale: 0.98 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 0.98 }}
    transition={{ duration: 0.3 }}
    className="flex-1 flex flex-col items-center justify-center text-center p-4"
  >
    <h2 className="text-2xl font-medium text-[#131313] dark:text-[#EAE9E8]">What's on your mind today?</h2>
  </motion.div>
);

const TextChat = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [currentMessage, setCurrentMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [chatSession, setChatSession] = useState<ChatSession | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState("");

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const listConversations = useCallback(async () => {
    if (!user) return;
    try {
      const conversations = await conversationService.list();
      setConversations(conversations);
    } catch (error) {
      console.error("Failed to fetch conversations:", error);
    }
  }, [user]);

  useEffect(() => {
    const initializeApp = async () => {
      if (!user) return;
      setIsInitializing(true);
      try {
        const response = await fetch('/SYSTEM_PROMPT.md');
        if (!response.ok) throw new Error("Failed to fetch system prompt");
        const systemPrompt = await response.text();
        const session = getChatSession(systemPrompt);
        setChatSession(session);
        await listConversations();
      } catch (error) {
        console.error("Failed to initialize app:", error);
      } finally {
        setIsInitializing(false);
      }
    };
    initializeApp();
  }, [listConversations, user]);
  
  useEffect(() => {
    if (!isLoading) textareaRef.current?.focus();
  }, [isLoading]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleNewConversation = () => {
    setActiveConversationId(null);
    setMessages([]);
  };

  const handleStartRename = (conversation: Conversation) => {
    setEditingId(conversation.id);
    setEditingTitle(conversation.title);
  };

  const handleCancelRename = () => {
    setEditingId(null);
    setEditingTitle("");
  };

  const handleSaveRename = async () => {
    if (!editingId || !editingTitle.trim()) return;
    
    try {
      await conversationService.updateTitle(editingId, editingTitle.trim());
      await listConversations();
      setEditingId(null);
      setEditingTitle("");
    } catch (error) {
      console.error("Failed to rename conversation:", error);
    }
  };

  const handleDeleteConversation = async (conversationId: string) => {
    if (!confirm("Are you sure you want to delete this conversation? This action cannot be undone.")) {
      return;
    }

    try {
      await conversationService.delete(conversationId);
      await listConversations();
      
      // If we deleted the active conversation, clear the messages
      if (activeConversationId === conversationId) {
        setActiveConversationId(null);
        setMessages([]);
      }
    } catch (error) {
      console.error("Failed to delete conversation:", error);
    }
  };

  const loadConversation = useCallback(async (conversationId: string) => {
    try {
      setActiveConversationId(conversationId);
      const dbMessages = await messageService.list(conversationId);
      const messages: Message[] = dbMessages.map(msg => ({
        id: msg.id,
        role: msg.role,
        content: msg.content,
        conversation_id: msg.conversation_id,
        created_at: msg.created_at,
      }));
      setMessages(messages);
    } catch (error) {
      console.error("Failed to load conversation:", error);
    }
  }, []);

  const handleSendMessage = useCallback(async () => {
    if (!currentMessage.trim() || !chatSession || isLoading) return;

    const userMessage: Message = { role: 'user', content: currentMessage.trim() };
    setMessages((prev) => [...prev, userMessage]);
    const optimisticMessage = currentMessage;
    setCurrentMessage("");
    setIsLoading(true);

    let currentConversationId = activeConversationId;
    let newConversationCreated = false;

    // 1. Save user message and create conversation if needed
    try {
      if (!currentConversationId) {
        // Generate a meaningful title using Gemini
        const generatedTitle = await generateChatTitle(optimisticMessage);
        const newConversation = await conversationService.create(generatedTitle);
        currentConversationId = newConversation.id;
        setActiveConversationId(currentConversationId);
        newConversationCreated = true;
      }

      await messageService.create(currentConversationId, userMessage.role, userMessage.content);

    } catch (error) {
      console.error('Error saving user message:', error);
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        conversation_id: currentConversationId || '',
        role: 'model',
        content: "I had trouble saving your message. Please check your database connection.",
        created_at: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMessage]);
      setIsLoading(false);
      return;
    }

    // 2. Get AI response
    try {
      const responseText = await sendMessageToGemini(chatSession, optimisticMessage);
      
      const savedAiMessage = await messageService.create(currentConversationId, 'model', responseText);
      const aiMessage: Message = {
        id: savedAiMessage.id,
        role: savedAiMessage.role,
        content: savedAiMessage.content,
        conversation_id: savedAiMessage.conversation_id,
        created_at: savedAiMessage.created_at,
      };
      setMessages((prev) => [...prev, aiMessage]);
      
      // Update conversation timestamp
      await conversationService.updateTimestamp(currentConversationId);
      
      if (newConversationCreated) await listConversations();

    } catch (error) {
      console.error('Error saving AI message:', error);
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        conversation_id: currentConversationId || '',
        role: 'model',
        content: "The AI is having trouble responding. Please check your API connection.",
        created_at: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [currentMessage, chatSession, isLoading, activeConversationId, listConversations]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const messageVariants: Variants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 25 } },
  };
  return (
    <div className="h-[calc(100vh-180px)] flex bg-card/20 backdrop-blur-sm rounded-lg border border-border overflow-hidden">
      <div className="w-1/4 min-w-[250px] border-r border-border flex flex-col">
        <div className="p-4 border-b border-border flex justify-between items-center h-[88px]">
          <h1 className="text-2xl font-medium">Chat</h1>
        </div>
        <ScrollArea className="flex-1">
          <div className="p-2 space-y-2">
            <Button
              variant="outline"
              className="w-full justify-center gap-2 border-border"
              onClick={handleNewConversation}
            >
              <Plus className="w-4 h-4" />
              New Chat
            </Button>
            <Separator />
            {isInitializing ? (
              <div className="p-4 text-center text-muted-foreground">Loading...</div>
            ) : (
              conversations.map(convo => (
                <div key={convo.id} className="group relative">
                  {editingId === convo.id ? (
                    <div className="flex items-center gap-1 p-2 bg-secondary rounded-md">
                      <MessageSquare className="w-4 h-4 flex-shrink-0" />
                      <Input
                        value={editingTitle}
                        onChange={(e) => setEditingTitle(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') handleSaveRename();
                          if (e.key === 'Escape') handleCancelRename();
                        }}
                        className="flex-1 h-8 text-sm"
                        autoFocus
                      />
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0"
                        onClick={handleSaveRename}
                      >
                        <Check className="w-3 h-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0"
                        onClick={handleCancelRename}
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  ) : (
                    <Button 
                      variant={activeConversationId === convo.id ? "secondary" : "ghost"}
                      className="w-full justify-start gap-2 pr-2 group-hover:pr-16 transition-all duration-200"
                      onClick={() => loadConversation(convo.id)}
                    >
                      <MessageSquare className="w-4 h-4 flex-shrink-0" />
                      <span className="truncate text-left flex-1">
                        {convo.title.length > 25 ? `${convo.title.substring(0, 25)}...` : convo.title}
                      </span>
                    </Button>
                  )}
                  
                  {editingId !== convo.id && (
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0 hover:bg-muted"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStartRename(convo);
                        }}
                      >
                        <Edit2 className="w-3 h-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0 hover:bg-destructive hover:text-destructive-foreground"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteConversation(convo.id);
                        }}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </div>

      <div className="flex-1 flex flex-col">
        <div className="flex items-center justify-center p-4 border-b border-border h-[88px]">
          <div className="flex items-center gap-2 text-primary">
          </div>
        </div>
        
        <AnimatePresence mode="wait">
          {messages.length === 0 ? (
            <EmptyChatState />
          ) : (
            <motion.div
              key="messages-list"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="flex-1 overflow-y-auto p-4 space-y-6"
            >
              {messages.map((message, index) => (
                <motion.div
                  key={message.id || `local-${index}`}
                  variants={messageVariants}
                  initial="hidden"
                  animate="visible"
                  className={`flex items-end gap-2 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {message.role === 'model' && <Sparkles className="w-6 h-6 text-primary flex-shrink-0" />}
                  <Card
                    className={`max-w-[85%] border-2 ${
                      message.role === 'user' ? 'bg-primary text-primary-foreground border-primary' : 'bg-card/70 border-border'
                    }`}
                  >
                    <CardContent className="p-3">
                      <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
              {isLoading && (
                <motion.div 
                  className="flex items-end gap-2 justify-start"
                  variants={messageVariants}
                  initial="hidden"
                  animate="visible"
                >
                  <Sparkles className="w-6 h-6 text-primary flex-shrink-0" />
                  <Card className="bg-card/70 border-2 border-border">
                    <CardContent className="p-3">
                      <div className="flex items-center gap-2">
                        <div className="flex gap-1.5">
                          {[0, 1, 2].map((i) => (
                            <motion.div
                              key={i}
                              className="w-2 h-2 bg-primary rounded-full"
                              animate={{ y: [0, -6, 0] }}
                              transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
                            />
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </motion.div>
          )}
        </AnimatePresence>

        <div className="p-4 border-t border-border">
                         <div className="flex items-center bg-background/50 dark:bg-muted/60 border border-border rounded-full px-4 py-2 shadow-sm hover:shadow-md transition-shadow duration-200 focus-within:border-primary/50 focus-within:shadow-lg">
              <Textarea
                ref={textareaRef}
                value={currentMessage}
                onChange={(e) => setCurrentMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={activeConversationId ? "Reply..." : "Start a new conversation..."}
                className="flex-1 resize-none bg-transparent border-none outline-none focus:ring-0 focus-visible:ring-0 placeholder:text-muted-foreground/60 text-sm leading-relaxed py-2 max-h-32"
                rows={1}
                disabled={isLoading || isInitializing}
                style={{
                  minHeight: '24px',
                  maxHeight: '128px',
                  overflowY: currentMessage.split('\n').length > 4 ? 'auto' : 'hidden'
                }}
              />
              <Button 
                onClick={handleSendMessage} 
                disabled={isLoading || isInitializing || !currentMessage.trim()}
                size="icon"
                className="rounded-full flex-shrink-0 w-8 h-8 ml-2 bg-primary hover:bg-primary/90 disabled:bg-muted disabled:text-muted-foreground transition-all duration-200"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
  );
};

export default TextChat;
