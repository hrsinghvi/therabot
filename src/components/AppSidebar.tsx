
import { motion } from "framer-motion";
import { 
  Home, 
  Mic, 
  MessageCircle, 
  BarChart3, 
  Settings,
  ChevronRight
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
      className="border-r border-border/50 bg-card/50 backdrop-blur-sm"
      collapsible="icon"
    >
      <SidebarHeader className="p-4 border-b border-border/50">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <h2 className="text-lg font-semibold text-foreground">Navigation</h2>
              <p className="text-xs text-muted-foreground">Therapy dashboard</p>
            </motion.div>
          )}
          <SidebarTrigger className="ml-auto" />
        </div>
      </SidebarHeader>

      <SidebarContent className="p-2">
        <SidebarGroup>
          {!isCollapsed && (
            <SidebarGroupLabel className="px-2 text-xs font-medium text-muted-foreground/70">
              Main Menu
            </SidebarGroupLabel>
          )}
          
          <SidebarGroupContent className="mt-2">
            <SidebarMenu>
              {navigationItems.map((item, index) => (
                <SidebarMenuItem key={item.id}>
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ 
                      opacity: 1, 
                      x: 0,
                      transition: {
                        delay: index * 0.1,
                        type: "spring" as const,
                        stiffness: 300,
                        damping: 25
                      }
                    }}
                  >
                    <SidebarMenuButton
                      onClick={() => onSectionChange(item.id)}
                      isActive={activeSection === item.id}
                      className={`
                        relative w-full justify-start gap-3 rounded-lg px-3 py-2.5 
                        transition-all duration-200 hover:bg-accent/70
                        ${activeSection === item.id 
                          ? 'bg-primary/20 text-primary hover:bg-primary/30 border-l-4 border-primary' 
                          : 'hover:bg-accent/50'
                        }
                        ${isCollapsed ? 'justify-center px-2' : ''}
                      `}
                      tooltip={isCollapsed ? item.label : undefined}
                    >
                      <motion.div
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        whileTap={{ scale: 0.9 }}
                        transition={{ type: "spring" as const, stiffness: 400, damping: 10 }}
                      >
                        <item.icon className="w-5 h-5 shrink-0" />
                      </motion.div>
                      
                      {!isCollapsed && (
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
                      )}
                      
                      {!isCollapsed && activeSection === item.id && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ type: "spring" as const, stiffness: 400, damping: 10 }}
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

        {!isCollapsed && (
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
        )}
      </SidebarContent>
    </Sidebar>
  );
}
