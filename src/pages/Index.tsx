import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { AppSidebar } from "@/components/AppSidebar";
import DashboardHome from "@/components/DashboardHome";
import Journal from "@/components/Journal";
import TextChat from "@/components/TextChat";
import VoiceSession from "@/components/VoiceSession";
import SettingsPanel from "@/components/SettingsPanel";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";

const components = {
  dashboard: DashboardHome,
  journal: Journal,
  chat: TextChat,
  voice: VoiceSession,
  settings: SettingsPanel,
};

type ComponentKey = keyof typeof components;

const Index = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Extract current section from URL path (remove leading slash)
  const currentSection = location.pathname.slice(1) || "dashboard";
  const ActiveComponent = components[currentSection as ComponentKey] || components.dashboard;

  const handleSectionChange = (newSection: string) => {
    navigate(`/${newSection}`);
  };

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full bg-background">
        <AppSidebar
          activeSection={currentSection}
          onSectionChange={handleSectionChange}
        />
        <SidebarInset className="flex-1 w-full">
          <main className="flex-1 w-full h-full overflow-hidden">
            <div className="w-full max-w-none h-full overflow-y-auto">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentSection}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className="w-full h-full p-4"
                >
              <ActiveComponent />
                </motion.div>
              </AnimatePresence>
            </div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default Index;