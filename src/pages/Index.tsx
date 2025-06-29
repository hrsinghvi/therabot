import { useState } from "react";
import { AppSidebar } from "@/components/AppSidebar";
import DashboardHome from "@/components/DashboardHome";
import VoiceSession from "@/components/VoiceSession";
import TextChat from "@/components/TextChat";
import Journal from "@/components/Journal";
import MoodDashboard from "@/components/MoodDashboard";
import SettingsPanel from "@/components/SettingsPanel";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";

const sections = {
  dashboard: DashboardHome,
  voice: VoiceSession,
  chat: TextChat,
  journal: Journal,
  insights: MoodDashboard,
  settings: SettingsPanel,
};

const Index = () => {
  const [activeSection, setActiveSection] = useState("dashboard");
  const ActiveComponent = sections[activeSection as keyof typeof sections];

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full bg-background">
        <AppSidebar
          activeSection={activeSection}
          onSectionChange={setActiveSection}
        />
        <SidebarInset className="flex-1 w-full">
          <main className="flex-1 w-full h-full overflow-y-auto p-4">
            <div className="w-full max-w-none">
              <ActiveComponent />
            </div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default Index;