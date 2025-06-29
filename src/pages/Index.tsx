import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import VoiceSession from "@/components/VoiceSession";
import DailyCheckin from "@/components/DailyCheckin";
import MoodDashboard from "@/components/MoodDashboard";
import TextChat from "@/components/TextChat";
import SettingsPanel from "@/components/SettingsPanel";
import DashboardHome from "@/components/DashboardHome";
import Journal from "@/components/Journal";
import { Moon, Sun } from "lucide-react";

const SECTION_TITLES: { [key: string]: string } = {
  dashboard: 'Dashboard',
  voice: 'Voice Session',
  chat: 'Text Chat',
  journal: 'Journal',
  insights: 'Mood Insights',
  settings: 'Settings',
};

const Index = () => {
  const [activeSection, setActiveSection] = useState(() => {
    return localStorage.getItem('activeSection') || 'dashboard';
  });
  const [pageTitle, setPageTitle] = useState(SECTION_TITLES[activeSection]);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      // Check localStorage first, then fallback to DOM class
      const saved = localStorage.getItem('theme');
      if (saved) {
        return saved === 'dark';
      }
      return document.documentElement.classList.contains('dark');
    }
    return false;
  });

  useEffect(() => {
    localStorage.setItem('activeSection', activeSection);
    setPageTitle(SECTION_TITLES[activeSection] || 'Dashboard');
  }, [activeSection]);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };
  const renderContent = () => {
    const contentVariants = {
      hidden: {
        opacity: 0,
        y: 20
      },
      visible: {
        opacity: 1,
        y: 0
      }
    };
    switch (activeSection) {
      case 'dashboard':
        return <motion.div key="dashboard" variants={contentVariants} initial="hidden" animate="visible" transition={{
          duration: 0.3
        }}>
            <DashboardHome />
          </motion.div>;
      case 'voice':
        return <motion.div key="voice" variants={contentVariants} initial="hidden" animate="visible" transition={{
          duration: 0.3
        }}>
            <VoiceSession />
          </motion.div>;
      case 'chat':
        return <motion.div key="chat" variants={contentVariants} initial="hidden" animate="visible" transition={{
          duration: 0.3
        }}>
            <TextChat />
          </motion.div>;
      case 'journal':
        return <motion.div key="journal" variants={contentVariants} initial="hidden" animate="visible" transition={{
          duration: 0.3
        }}>
            <Journal />
          </motion.div>;
      case 'insights':
        return <motion.div key="insights" variants={contentVariants} initial="hidden" animate="visible" transition={{
          duration: 0.3
        }}>
            <MoodDashboard />
          </motion.div>;
      case 'settings':
        return <motion.div key="settings" variants={contentVariants} initial="hidden" animate="visible" transition={{
          duration: 0.3
        }}>
            <SettingsPanel />
          </motion.div>;
      default:
        return <DashboardHome />;
    }
  };
  return <div className="min-h-screen bg-background text-foreground">
      <SidebarProvider>
        <div className="flex min-h-screen w-full">
          <AppSidebar 
            activeSection={activeSection} 
            onSectionChange={setActiveSection} 
          />
          
          <SidebarInset className="flex-1 flex flex-col">
            {/* Header */}
            <motion.header className="flex justify-between items-center p-6 border-b border-border backdrop-blur-sm bg-background/80 h-[88px] sticky top-0 z-10" initial={{
            opacity: 0,
            y: -20
          }} animate={{
            opacity: 1,
            y: 0
          }} transition={{
            duration: 0.6
          }}>
              <motion.div className="flex items-center gap-3" whileHover={{
              scale: 1.02
            }} transition={{
              type: "spring" as const,
              stiffness: 400,
              damping: 10
            }}>
                <SidebarTrigger className="mr-2 rounded-3xl " />
                <div>
                  <h1 className="text-2xl font-semibold text-foreground">{pageTitle}</h1>
                </div>
              </motion.div>
              
              <motion.div whileHover={{
              scale: 1.1
            }} whileTap={{
              scale: 0.9
            }}>
                <Button variant="ghost" size="icon" onClick={toggleTheme} className="rounded-full hover:bg-accent transition-colors duration-200">
                  <motion.div animate={{
                  rotate: isDarkMode ? 180 : 0
                }} transition={{
                  duration: 0.3
                }}>
                    {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                  </motion.div>
                </Button>
              </motion.div>
            </motion.header>

            {/* Main Content */}
            <main className="flex-1 p-6 overflow-y-auto">
              {renderContent()}
            </main>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </div>;
};
export default Index;