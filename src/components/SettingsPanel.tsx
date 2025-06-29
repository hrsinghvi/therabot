import { motion } from "framer-motion";
import { Moon, Sun, Palette, Shield, Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useState, useEffect } from "react";

const SettingsPanel = () => {
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
          <Button variant="outline" className="w-full">
            Manage Data
          </Button>
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
          <h3 className="font-medium mb-1">CalmMind v1.0</h3>
          <p className="text-sm text-muted-foreground">
            Your AI therapy companion, built with care for your mental wellbeing.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default SettingsPanel;
