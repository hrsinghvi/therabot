
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, MessageCircle, BarChart3, Settings, Moon, Sun, Heart, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import VoiceSession from "@/components/VoiceSession";
import DailyCheckin from "@/components/DailyCheckin";
import MoodDashboard from "@/components/MoodDashboard";
import TextChat from "@/components/TextChat";
import SettingsPanel from "@/components/SettingsPanel";
import DashboardHome from "@/components/DashboardHome";

const Index = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return document.documentElement.classList.contains('dark');
    }
    return false;
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  const tabVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 }
  };

  const headerVariants = {
    hidden: { opacity: 0, y: -50 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6, ease: [0.4, 0, 0.2, 1] }
    }
  };

  const navigationItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'voice', label: 'Voice', icon: Mic },
    { id: 'chat', label: 'Chat', icon: MessageCircle },
    { id: 'insights', label: 'Insights', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent/20 to-secondary/30">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div 
          className="flex justify-between items-center p-6 border-b border-border/50 backdrop-blur-sm bg-background/80"
          variants={headerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div 
            className="flex items-center gap-3"
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            <motion.div 
              className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center"
              animate={{ 
                scale: [1, 1.1, 1],
                rotate: [0, 5, -5, 0]
              }}
              transition={{ 
                duration: 4,
                repeat: Infinity,
                ease: [0.4, 0, 0.6, 1]
              }}
            >
              <Heart className="w-6 h-6 text-primary" />
            </motion.div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">CalmMind</h1>
              <p className="text-sm text-muted-foreground">Your AI Therapy Companion</p>
            </div>
          </motion.div>
          
          <motion.div
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="rounded-full hover:bg-accent transition-colors duration-200"
            >
              <motion.div
                animate={{ rotate: isDarkMode ? 180 : 0 }}
                transition={{ duration: 0.3 }}
              >
                {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </motion.div>
            </Button>
          </motion.div>
        </motion.div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          {/* Navigation */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <TabsList className="grid w-full grid-cols-5 bg-card/50 backdrop-blur-sm border-0 p-2 mx-6 mt-6">
              {navigationItems.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * index }}
                >
                  <TabsTrigger 
                    value={item.id}
                    className="flex flex-col gap-2 py-4 data-[state=active]:bg-primary/20 data-[state=active]:text-primary transition-all duration-300"
                  >
                    <motion.div
                      whileHover={{ scale: 1.2, rotate: 5 }}
                      whileTap={{ scale: 0.9 }}
                      transition={{ type: "spring", stiffness: 400, damping: 10 }}
                    >
                      <item.icon className="w-5 h-5" />
                    </motion.div>
                    <span className="text-xs font-medium">{item.label}</span>
                  </TabsTrigger>
                </motion.div>
              ))}
            </TabsList>
          </motion.div>

          {/* Tab Content */}
          <div className="p-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                variants={tabVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                transition={{ duration: 0.3 }}
              >
                <TabsContent value="dashboard" className="mt-0">
                  <DashboardHome />
                </TabsContent>
                
                <TabsContent value="voice" className="mt-0">
                  <VoiceSession onBack={() => setActiveTab('dashboard')} />
                </TabsContent>
                
                <TabsContent value="chat" className="mt-0">
                  <TextChat onBack={() => setActiveTab('dashboard')} />
                </TabsContent>
                
                <TabsContent value="insights" className="mt-0">
                  <MoodDashboard onBack={() => setActiveTab('dashboard')} />
                </TabsContent>
                
                <TabsContent value="settings" className="mt-0">
                  <SettingsPanel />
                </TabsContent>
              </motion.div>
            </AnimatePresence>
          </div>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
