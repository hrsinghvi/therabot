import React from 'react';
import { motion } from "framer-motion";
import { Home, Mic, MessageCircle, BarChart3, Settings, ChevronRight, Heart, Book, Bell, LineChart, Package, Users, MessageSquare, BookOpen, LogOut, Moon, Sun, Wind, Library, Calendar } from "lucide-react";
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarTrigger, SidebarHeader, useSidebar } from "@/components/ui/sidebar";
import { UserProfile } from "./UserProfile";
import { Skeleton } from './ui/skeleton';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from './ui/badge';

interface AppSidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

const navigationItems = [
  {
    id: 'dashboard',
    title: "Dashboard",
    url: "/dashboard",
    icon: Home,
    label: 'Dashboard',
    description: 'Overview & insights'
  },
  {
    id: 'voice',
    title: "Voice Session",
    url: "/voice",
    icon: Mic,
    label: 'Voice Session',
    description: 'AI voice session'
  },
  {
    id: 'chat',
    title: "Text Chat",
    url: "/chat",
    icon: MessageCircle,
    label: 'Text Chat',
    description: 'Written conversation'
  },
  {
    id: 'journal',
    title: "Journal",
    url: "/journal", 
    icon: BookOpen,
    label: 'Journal',
    description: 'Personal reflections'
  },
  {
    id: 'breathing',
    title: "Breathing",
    url: "/breathing",
    icon: Wind,
    label: 'Breathing',
    description: 'Guided breathing exercises'
  },
  {
    id: 'plans',
    title: "Weekly Plans",
    url: "/plans",
    icon: Calendar,
    label: 'Weekly Plans',
    description: 'AI-powered wellness plans'
  },
  {
    id: 'resources',
    title: "Resources",
    url: "/resources",
    icon: Library,
    label: 'Resources',
    description: 'Additional resources'
  },
  {
    id: 'settings',
    title: "Settings",
    url: "/settings",
    icon: Settings,
    label: 'Settings',
    description: 'Preferences & config'
  },
];

// Helper function to get user initials
const getInitials = (name: string) => {
  const names = name.split(' ');
  if (names.length > 1) {
    return `${names[0][0]}${names[names.length - 1][0]}`;
  }
  return names[0][0];
};

// Helper function to format user name
const formatUserName = (name: string) => {
    if (name.length > 15) {
        const names = name.split(' ');
        if (names.length > 1) {
            return `${names[0]} ${names[names.length - 1][0]}.`;
        }
    }
    return name;
}

export function AppSidebar({
  activeSection,
  onSectionChange
}: AppSidebarProps) {
  const { user, loading, logout } = useAuth();

  const {
    state
  } = useSidebar();
  const isCollapsed = state === "collapsed";

  const userName = user?.user_metadata?.full_name || 'Anonymous';
  const userEmail = user?.email;

  return <Sidebar className="border-r border-border/50 bg-card/50 backdrop-blur-sm w-64" collapsible="offcanvas">
      <SidebarHeader className="p-4 border-b border-border/50 h-[88px] flex justify-between items-center py-[24px] flex-shrink-0">
        <motion.div initial={{
        opacity: 0
      }} animate={{
        opacity: 1
      }} transition={{
        delay: 0.2
      }} className="flex items-center gap-3">
          <motion.div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center" animate={{
          scale: [1, 1.1, 1],
          rotate: [0, 5, -5, 0]
        }} transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut"
        }}>
            <Heart className="w-5 h-5 text-primary" />
          </motion.div>
          <div>
                          <h2 className="text-xl font-bold text-foreground">TheraBot</h2>
            <p className="text-xs text-muted-foreground">Your AI Wellness Companion</p>
          </div>
        </motion.div>
        
      </SidebarHeader>

      <SidebarContent className="p-2 flex flex-col h-full">
        <SidebarGroup className="flex-1 min-h-0">
          <SidebarGroupLabel className="px-2 text-xs font-medium text-muted-foreground/70 mb-4">
            Main Menu
          </SidebarGroupLabel>
          
          <SidebarGroupContent className="mt-2">
            <SidebarMenu className="space-y-2">
              {navigationItems.filter(item => item.id !== 'settings').map((item, index) => <SidebarMenuItem key={item.id}>
                  <motion.div initial={{
                opacity: 0,
                x: -20
              }} animate={{
                opacity: 1,
                x: 0
              }} transition={{
                delay: index * 0.1,
                type: "spring",
                stiffness: 300,
                damping: 25
              }} whileHover={{
                scale: 1.02,
                x: 4
              }} whileTap={{
                scale: 0.98
              }} className="mb-1">
                    <SidebarMenuButton onClick={() => onSectionChange(item.id)} isActive={activeSection === item.id} className={`
                        relative w-full justify-start gap-3 rounded-lg px-4 py-3
                        transition-all duration-300 ease-out
                        ${activeSection === item.id ? 'bg-primary/20 text-primary border-l-4 border-primary shadow-lg' : 'hover:bg-secondary/80 hover:shadow-md hover:translate-x-1'}
                      `}>
                      <motion.div whileHover={{
                    rotate: 5
                  }} transition={{
                    type: "spring",
                    stiffness: 400,
                    damping: 10
                  }}>
                        <item.icon className="w-5 h-5 shrink-0" />
                      </motion.div>
                      
                      <motion.div className="flex flex-col flex-1 min-w-0" initial={{
                    opacity: 0,
                    x: -10
                  }} animate={{
                    opacity: 1,
                    x: 0
                  }} transition={{
                    delay: 0.1
                  }}>
                        <span className="font-medium truncate">{item.label}</span>
                        <span className="text-xs text-muted-foreground truncate">
                          {item.description}
                        </span>
                      </motion.div>
                      
                      {activeSection === item.id && <motion.div initial={{
                    opacity: 0,
                    scale: 0
                  }} animate={{
                    opacity: 1,
                    scale: 1
                  }} transition={{
                    type: "spring",
                    stiffness: 400,
                    damping: 10
                  }}>
                          <ChevronRight className="w-4 h-4 text-primary" />
                        </motion.div>}
                    </SidebarMenuButton>
                  </motion.div>
                </SidebarMenuItem>)}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <motion.div className="mt-auto p-2 border-t border-border/50 flex-shrink-0" initial={{
        opacity: 0,
        y: 20
      }} animate={{
        opacity: 1,
        y: 0
      }} transition={{
        delay: 0.5
      }}>
          {loading ? (
             <div className="flex items-center gap-3 p-3">
              <Skeleton className="w-10 h-10 rounded-full" />
              <div className="flex flex-col gap-1">
                <Skeleton className="w-24 h-4" />
                <Skeleton className="w-32 h-3" />
              </div>
            </div>
          ) : user ? (
            <UserProfile 
              name={formatUserName(userName)} 
              email={userEmail}
              imageUrl={user.user_metadata.avatar_url}
              onSettingsClick={() => onSectionChange('settings')} 
              onLogout={logout}
            />
          ) : (
            <div className="p-3">
              <p>No user found</p>
            </div>
          )}
        </motion.div>
      </SidebarContent>
    </Sidebar>;
}