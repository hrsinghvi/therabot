# TheraBot - AI Mental Health Companion

<div align="center">
  **A comprehensive mental health and wellness companion powered by AI**
</div>

## 🌟 What is TheraBot?

TheraBot is an empathetic AI-powered mental health companion that provides a safe, supportive digital space for users to explore their thoughts, track emotional patterns, and receive personalized insights about their mental well-being. Built with modern web technologies and professional therapeutic principles, TheraBot makes mental health support accessible to everyone.

**🚨 Important**: TheraBot is a supportive tool designed to complement, not replace, professional mental health care. If you're experiencing a mental health crisis, please contact a professional immediately.

## ✨ Key Features

### 🧠 **Intelligent Mood Analysis**

- Real-time emotional state detection from your written thoughts
- 7 comprehensive mood categories with intensity scoring
- AI-powered insights that help you understand your emotional patterns
- Daily mood summaries to track your mental health journey

### 💬 **Therapeutic Chat with "Sage"**

- Conversations with an AI therapist trained in CBT and mindfulness techniques
- Person-centered therapy approach with unconditional positive regard
- Crisis intervention protocols for safety
- Persistent chat history to track your progress over time

### 📝 **Smart Journaling**

- Rich text editor for personal reflections and thoughts
- Automatic mood analysis of your journal entries
- Historical entry management with search capabilities
- Daily check-in prompts for consistent self-reflection

### 📊 **Comprehensive Analytics**

- 30-day mood trends and pattern visualization
- Personalized AI-generated insights and recommendations
- Progress tracking with positive mood indicators
- Beautiful, easy-to-understand charts and graphs

### 🎤 **Voice Sessions** _(Coming Soon)_

- Voice therapy interface with intuitive controls
- Speech-to-text integration for hands-free journaling
- Mood analysis from voice transcripts

### 🔒 **Privacy & Security First**

- End-to-end encryption for all your personal data
- Complete user data isolation with advanced security policies
- GDPR-compliant data handling
- You own and control all your data

## 🎯 Who is TheraBot For?

- **Individuals** seeking to better understand their emotional patterns
- **People** looking for accessible mental health support tools
- **Anyone** interested in mindfulness and self-reflection practices
- **Students and professionals** managing stress and anxiety
- **Those** who want to track their mental health journey over time

## 🌈 The TheraBot Experience

### Beautiful, Calming Design

- Soft color palette designed for emotional comfort
- Smooth animations that feel natural and soothing
- Responsive design that works on all your devices
- Accessibility features following WCAG guidelines

### Intelligent AI That Understands

- Advanced mood detection using Google Gemini AI
- Contextual understanding of your emotional state
- Personalized recommendations based on your patterns
- Therapeutic responses grounded in proven methodologies

### Your Data, Your Privacy

- All conversations and journal entries are completely private
- Advanced encryption protects your sensitive information
- Row-level security ensures complete data isolation
- No data sharing with third parties

## 🚀 Getting Started

### For Users

1. **Visit TheraBot** at [your-deployed-url.com]
2. **Create your account** with secure email verification
3. **Start your journey** with a daily mood check-in
4. **Explore features** like journaling, AI chat, and analytics
5. **Track your progress** with beautiful mood visualizations

### For Developers & Contributors

TheraBot is open source! We welcome contributions from developers who want to help make mental health support more accessible.

## 🏗️ Tech Stack & Architecture

### Frontend Technologies

- **React 18.3.1** with TypeScript for type-safe development
- **Vite** for fast development and optimized builds
- **Tailwind CSS** for utility-first styling
- **Shadcn/ui** for beautiful, accessible components
- **Framer Motion** for smooth animations
- **React Query** for efficient state management

### Backend & Database

- **Supabase** (PostgreSQL) for database and real-time features
- **Row Level Security (RLS)** for data privacy and isolation
- **Supabase Auth** for secure user authentication
- **Real-time subscriptions** for live data updates

### AI & Services

- **Google Gemini API** for advanced mood analysis and therapeutic chat
- **Speech-to-Text** integration ready for voice features
- **Crisis intervention** protocols and safety measures

### Project Structure

```
therabot/
├── src/
│   ├── components/          # React components
│   │   ├── ui/             # Shadcn/ui component library
│   │   ├── AppSidebar.tsx  # Navigation sidebar
│   │   ├── DashboardHome.tsx # Main dashboard with analytics
│   │   ├── TextChat.tsx    # AI chat interface
│   │   ├── Journal.tsx     # Journaling component
│   │   ├── VoiceSession.tsx # Voice therapy UI
│   │   ├── DailyCheckin.tsx # Daily mood check-in
│   │   └── UserProfile.tsx # User settings and profile
│   ├── contexts/           # React contexts for state
│   │   └── AuthContext.tsx # Authentication state management
│   ├── hooks/              # Custom React hooks
│   │   ├── use-mobile.tsx  # Mobile detection
│   │   └── use-toast.ts    # Toast notifications
│   ├── lib/                # Utility libraries
│   │   ├── utils.ts        # General utilities
│   │   └── mood-processing.ts # Mood analytics logic
│   ├── pages/              # Page components
│   │   ├── Index.tsx       # Main application page
│   │   ├── AuthPage.tsx    # Login and signup
│   │   └── NotFound.tsx    # 404 error page
│   ├── services/           # External service integrations
│   │   ├── supabase.ts     # Database operations
│   │   ├── gemini.ts       # AI services and mood analysis
│   │   ├── speechToText.ts # Speech recognition (ready)
│   │   ├── voiceTherapy.ts # Voice processing (ready)
│   │   └── mood-orchestrator.ts # Mood data coordination
│   └── styles/             # CSS and styling
├── public/                 # Static assets and icons
├── backend/                # Optional Express.js backend
└── docs/                   # Documentation files
```

**Want to contribute?** Check out our [Contributing Guide](CONTRIBUTING.md) to get started.

## 🛡️ Safety & Professional Standards

### Crisis Intervention

- Automatic detection of crisis-related language
- Immediate redirection to professional resources
- Clear boundaries about AI limitations
- Integration with crisis hotlines (988, 111)

### Therapeutic Approach

- Grounded in evidence-based therapeutic practices
- Person-centered therapy principles
- Cognitive behavioral therapy techniques
- Mindfulness and grounding exercises

### Professional Boundaries

- Clear disclaimers about AI limitations
- Never claims to replace professional therapy
- Encourages professional help when appropriate
- Maintains ethical therapeutic boundaries

## 📊 How TheraBot Analyzes Your Mood

### 7 Core Mood Categories

- **Happy**: Joyful, content, positive emotions
- **Peaceful**: Calm, serene, relaxed states
- **Excited**: Energetic, enthusiastic, motivated feelings
- **Sad**: Down, melancholy, sorrowful emotions
- **Anxious**: Worried, nervous, stressed states
- **Frustrated**: Irritated, annoyed, overwhelmed feelings
- **Neutral**: Balanced, stable, unremarkable moods

### Analysis Sources

- **Journal Entries**: Deep analysis of your written reflections
- **Chat Conversations**: Understanding from your AI therapy sessions
- **Daily Check-ins**: Regular mood tracking data
- **Voice Sessions**: Future speech-to-text analysis capabilities

## 🌍 Community & Support

### Getting Help

- **Documentation**: Comprehensive guides and tutorials
- **Community**: Join discussions with other users
- **Support**: Technical support for any issues
- **Feedback**: Help us improve TheraBot with your suggestions

### Crisis Resources

If you're experiencing a mental health crisis:

- **US**: Call or text 988 (Suicide & Crisis Lifeline)
- **UK**: Call 111 (NHS 111) or text SHOUT to 85258
- **Canada**: Call 1-833-456-4566
- **International**: Visit [findahelpline.com](https://findahelpline.com)

**Remember**: TheraBot is here to support you, but professional help is always available when you need it.

## 🤝 Contributing to TheraBot

We believe mental health support should be accessible to everyone. If you're a developer, designer, mental health professional, or just someone passionate about this cause, we'd love your help!

### Ways to Contribute

- **Code**: Help improve features and fix bugs
- **Design**: Make TheraBot more beautiful and accessible
- **Documentation**: Help others understand and use TheraBot
- **Testing**: Ensure TheraBot works perfectly for everyone
- **Feedback**: Share your ideas for new features

### Development Setup

1. Fork the repository
2. Clone your fork locally
3. Install dependencies with `npm install`
4. Set up your environment variables
5. Start the development server with `npm run dev`

See our [Contributing Guide](CONTRIBUTING.md) for detailed instructions.

## 📜 License & Legal

TheraBot is open source software licensed under the [MIT License](LICENSE). This means:

- ✅ You can use TheraBot for personal or commercial purposes
- ✅ You can modify and distribute the code
- ✅ You can contribute improvements back to the community
- ✅ No warranty is provided - use at your own risk

## 🙏 Acknowledgments

TheraBot is built with love and powered by:

- **Google Gemini** for advanced AI capabilities
- **Supabase** for secure, scalable backend infrastructure
- **The Open Source Community** for incredible tools and libraries
- **Mental Health Professionals** who guided our therapeutic approach
- **Our Contributors** who help make mental health support accessible

---

<div align="center">
  <p><strong>Built with ❤️ for mental health and wellness</strong></p>
  <p>
    <a href="#-getting-started">🚀 Get Started</a> •
    <a href="CONTRIBUTING.md">🤝 Contribute</a> •
    <a href="#-community--support">💬 Get Help</a> •
    <a href="#crisis-resources">🆘 Crisis Resources</a>
  </p>
  
  <p><em>Your mental health matters. You matter. We're here to help.</em></p>
</div>
