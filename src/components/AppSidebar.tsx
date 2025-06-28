
import { motion } from "framer-motion";
import { 
  Home, 
  Mic, 
  MessageCircle, 
  BarChart3, 
  Settings,
  ChevronRight,
  Heart
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  SidebarHeader,
  useSidebar,
} from "@/components/ui/sidebar";

interface AppSidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

const navigationItems = [
  { id: 'dashboard', label: 'Dashboard', icon: Home, description: 'Overview & insights' },
  { id: 'voice', label: 'Voice Session', icon: Mic, description: 'AI voice therapy' },
  { id: 'chat', label: 'Text Chat', icon: MessageCircle, description: 'Written conversation' },
  { id: 'insights', label: 'Mood Insights', icon: BarChart3, description: 'Analytics & trends' },
  { id: 'settings', label: 'Settings', icon: Settings, description: 'Preferences & config' }
];

export function AppSidebar({ activeSection, onSectionChange }: AppSidebarProps) {
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

  return (
    <Sidebar 
      className="border-r border-border/50 bg-card/50 backdrop-blur-sm w-64"
      collapsible="offcanvas"
    >
      <SidebarHeader className="p-4 border-b border-border/50 h-[88px] flex justify-between items-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex items-center gap-3"
        >
          <motion.div 
            className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center"
            animate={{ 
              scale: [1, 1.1, 1],
              rotate: [0, 5, -5, 0]
            }}
            transition={{ 
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <Heart className="w-5 h-5 text-primary" />
          </motion.div>
          <div>
            <h2 className="text-xl font-bold text-foreground">CalmMind</h2>
            <p className="text-xs text-muted-foreground">Your AI Therapy Companion</p>
          </div>
        </motion.div>
        <SidebarTrigger className="ml-auto" />
      </SidebarHeader>

      <SidebarContent className="p-2">
        <SidebarGroup>
          <SidebarGroupLabel className="px-2 text-xs font-medium text-muted-foreground/70 mb-4">
            Main Menu
          </SidebarGroupLabel>
          
          <SidebarGroupContent className="mt-2">
            <SidebarMenu className="space-y-2">
              {navigationItems.map((item, index) => (
                <SidebarMenuItem key={item.id}>
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ 
                      opacity: 1, 
                      x: 0
                    }}
                    transition={{
                      delay: index * 0.1,
                      type: "spring",
                      stiffness: 300,
                      damping: 25
                    }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.98 }}
                    className="mb-1"
                  >
                    <SidebarMenuButton
                      onClick={() => onSectionChange(item.id)}
                      isActive={activeSection === item.id}
                      className={`
                        relative w-full justify-start gap-3 rounded-lg px-4 py-3
                        transition-all duration-200
                        ${activeSection === item.id 
                          ? 'bg-primary/20 text-primary border-l-4 border-primary' 
                          : 'hover:bg-transparent'
                        }
                      `}
                    >
                      <motion.div
                        whileHover={{ rotate: 5 }}
                        transition={{ type: "spring", stiffness: 400, damping: 10 }}
                      >
                        <item.icon className="w-5 h-5 shrink-0" />
                      </motion.div>
                      
                      <motion.div 
                        className="flex flex-col flex-1 min-w-0"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                      >
                        <span className="font-medium truncate">{item.label}</span>
                        <span className="text-xs text-muted-foreground truncate">
                          {item.description}
                        </span>
                      </motion.div>
                      
                      {activeSection === item.id && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ type: "spring", stiffness: 400, damping: 10 }}
                        >
                          <ChevronRight className="w-4 h-4 text-primary" />
                        </motion.div>
                      )}
                    </SidebarMenuButton>
                  </motion.div>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <motion.div 
          className="mt-auto p-4 border-t border-border/50"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div className="text-xs text-muted-foreground text-center space-y-1">
            <p>✨ CalmMind AI</p>
            <p>Your mental wellness companion</p>
          </div>
        </motion.div>
      </SidebarContent>
    </Sidebar>
  );
}
