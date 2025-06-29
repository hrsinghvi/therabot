import { motion } from "framer-motion";
import { Moon, Sun, Palette, Shield, Sparkles, LogOut } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";

const SettingsPanel = () => {
  const { logout } = useAuth();
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('theme');
      if (saved) return saved === 'dark';
      return document.documentElement.classList.contains('dark');
    }
    return false;
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <div className="space-y-8 pt-6">


      {/* Privacy & Security Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            <span>Privacy & Security</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-secondary rounded-lg">
            <h3 className="font-medium mb-2">Your data is safe</h3>
            <p className="text-sm text-muted-foreground">
              All conversations are encrypted and stored securely. You can delete your data at any time.
            </p>
          </div>
          
          {/* Logout Section */}
          <div className="pt-4 border-t border-border">
            <div className="flex items-center justify-between p-4 rounded-lg hover:bg-muted/50 transition-colors">
              <div className="flex items-center gap-4">
                <LogOut className="w-5 h-5 text-red-500" />
                <div>
                  <h3 className="font-medium">Sign Out</h3>
                  <p className="text-sm text-muted-foreground">Log out of your account and return to the sign-in page.</p>
                </div>
              </div>
              <Button 
                variant="outline" 
                onClick={handleLogout}
                className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:border-red-800 dark:hover:bg-red-950"
              >
                Sign Out
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* About Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            <span>About</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
             <Sparkles className="w-8 h-8 text-primary" />
          </div>
          <h3 className="font-medium mb-1">TheraBot v1.0</h3>
          <p className="text-sm text-muted-foreground">
            Your AI wellness companion, built with care for your mental wellbeing.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default SettingsPanel;
