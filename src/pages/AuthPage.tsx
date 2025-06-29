import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '@/services/supabase';
import { motion } from 'framer-motion';
import { Heart } from 'lucide-react';
import { useState, useEffect } from 'react';

const AuthPage = () => {
  const [authView, setAuthView] = useState<'sign_in' | 'sign_up'>('sign_in');

  const getSubtitleText = () => {
    return authView === 'sign_in' 
      ? "Sign in to continue your journey"
      : "Create your account to begin your wellness journey";
  };

  useEffect(() => {
    const handleClick = (e: Event) => {
      const target = e.target as HTMLElement;
      const text = target.textContent?.trim();
      
      // Only change view for specific link clicks
      if (text === "Don't have an account? Create one") {
        setAuthView('sign_up');
      } else if (text === "Already have an account? Sign in") {
        setAuthView('sign_in');
      }
    };

    document.addEventListener('click', handleClick);

    return () => {
      document.removeEventListener('click', handleClick);
    };
  }, []);

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
            <motion.p 
              key={authView}
              className="text-muted-foreground mt-2"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {getSubtitleText()}
            </motion.p>
        </div>
        <Auth
          supabaseClient={supabase}
          appearance={{ 
            theme: ThemeSupa,
            variables: {
              default: {
                colors: {
                  brand: 'hsl(var(--primary))',
                  brandAccent: 'hsl(var(--primary))',
                }
              }
            }
          }}
          localization={{
            variables: {
              sign_up: {
                button_label: "Create Account",
                link_text: "Don't have an account? Create one",
                loading_button_label: "Creating account...",
              },
              sign_in: {
                button_label: "Sign In",
                link_text: "Already have an account? Sign in",
                loading_button_label: "Signing in...",
              }
            }
          }}
          providers={['google', 'github']}
          theme="dark"
          showLinks={true}
          redirectTo={window.location.origin}
        />
      </motion.div>
    </div>
  );
};

export default AuthPage; 