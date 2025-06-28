
import { motion } from "framer-motion";
import { Moon, Sun, Volume2, VolumeX, Bell, BellOff, Palette, Shield } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useState } from "react";

const SettingsPanel = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  const settingsVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        delayChildren: 0.2,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 }
  };

  const settingsItems = [
    {
      icon: darkMode ? Sun : Moon,
      title: "Dark Mode",
      description: "Toggle between light and dark themes",
      action: (
        <Switch
          checked={darkMode}
          onCheckedChange={setDarkMode}
        />
      )
    },
    {
      icon: soundEnabled ? Volume2 : VolumeX,
      title: "Sound Effects",
      description: "Enable or disable audio feedback",
      action: (
        <Switch
          checked={soundEnabled}
          onCheckedChange={setSoundEnabled}
        />
      )
    },
    {
      icon: notificationsEnabled ? Bell : BellOff,
      title: "Daily Reminders",
      description: "Get gentle reminders for check-ins",
      action: (
        <Switch
          checked={notificationsEnabled}
          onCheckedChange={setNotificationsEnabled}
        />
      )
    }
  ];

  return (
    <motion.div
      variants={settingsVariants}
      initial="hidden"
      animate="visible"
      className="max-w-2xl mx-auto space-y-6"
    >
      <motion.div variants={itemVariants}>
        <h2 className="text-3xl font-light text-foreground mb-2">Settings</h2>
        <p className="text-muted-foreground">Customize your CalmMind experience</p>
      </motion.div>

      {/* Preferences */}
      <motion.div variants={itemVariants}>
        <Card className="border-0 bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="w-5 h-5 text-primary" />
              Preferences
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {settingsItems.map((item, index) => (
              <motion.div
                key={item.title}
                variants={itemVariants}
                whileHover={{ x: 5 }}
                className="flex items-center justify-between p-4 rounded-lg hover:bg-accent/20 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <motion.div
                    whileHover={{ scale: 1.2, rotate: 10 }}
                    transition={{ type: "spring", stiffness: 400 }}
                  >
                    <item.icon className="w-5 h-5 text-primary" />
                  </motion.div>
                  <div>
                    <h3 className="font-medium">{item.title}</h3>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  </div>
                </div>
                {item.action}
              </motion.div>
            ))}
          </CardContent>
        </Card>
      </motion.div>

      {/* Privacy */}
      <motion.div variants={itemVariants}>
        <Card className="border-0 bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              Privacy & Security
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-primary/10 rounded-lg">
              <h3 className="font-medium mb-2">Your data is safe</h3>
              <p className="text-sm text-muted-foreground">
                All conversations are encrypted and stored securely. You can delete your data at any time.
              </p>
            </div>
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button variant="outline" className="w-full">
                Manage Data
              </Button>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>

      {/* About */}
      <motion.div variants={itemVariants}>
        <Card className="border-0 bg-gradient-to-r from-primary/10 to-accent/10 backdrop-blur-sm">
          <CardContent className="p-6 text-center">
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="mb-4"
            >
              <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto">
                <motion.div
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                >
                  <Palette className="w-8 h-8 text-primary" />
                </motion.div>
              </div>
            </motion.div>
            <h3 className="font-medium mb-2">CalmMind v1.0</h3>
            <p className="text-sm text-muted-foreground">
              Your AI therapy companion, built with care for your mental wellbeing.
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
};

export default SettingsPanel;
