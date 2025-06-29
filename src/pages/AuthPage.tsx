import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '@/services/supabase';
import { motion } from 'framer-motion';
import { Heart } from 'lucide-react';

const AuthPage = () => {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div 
        className="w-full max-w-md"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="text-center mb-8">
            <motion.div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4" animate={{
          scale: [1, 1.1, 1],
          rotate: [0, 5, -5, 0]
        }} transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut"
        }}>
            <Heart className="w-8 h-8 text-primary" />
          </motion.div>
            <h1 className="text-3xl font-bold text-foreground">Welcome to CalmMind</h1>
            <p className="text-muted-foreground mt-2">Sign in to continue your journey</p>
        </div>
        <Auth
          supabaseClient={supabase}
          appearance={{ theme: ThemeSupa }}
          providers={['google', 'github']}
          theme="dark"
        />
      </motion.div>
    </div>
  );
};

export default AuthPage; 