import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { AppSidebar } from "@/components/AppSidebar";
import DashboardHome from "@/components/DashboardHome";
import Journal from "@/components/Journal";
import TextChat from "@/components/TextChat";
import VoiceSession from "@/components/VoiceSession";
import { BreathingExercise } from "@/components/BreathingExercise";
import SettingsPanel from "@/components/SettingsPanel";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import Resources from "@/components/Resources";

const components = {
  dashboard: DashboardHome,
  journal: Journal,
  chat: TextChat,
  voice: VoiceSession,          
  breathing: BreathingExercise,
  resources: Resources,
  settings: SettingsPanel,
};

type ComponentKey = keyof typeof components;

const Index = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Extract current section from URL path (remove leading slash)
  const currentSection = location.pathname.slice(1) || "dashboard";
  const ActiveComponent = components[currentSection as ComponentKey] || components.dashboard;

  console.log('Index component render - current section:', currentSection, 'path:', location.pathname);

  const handleSectionChange = (newSection: string) => {
    console.log('Section change requested:', newSection);
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
              {/* Temporarily disable AnimatePresence to debug black screen issue */}
              <div className="w-full h-full p-4">
                <ActiveComponent />
              </div>
            </div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default Index;