# TheraBot - AI Mental Health Companion

<div align="center">
  <img src="public/favicon.ico" alt="TheraBot Logo" width="80" height="80">
  
  **A comprehensive mental health and wellness companion powered by AI**
  
  [![React](https://img.shields.io/badge/React-18.3.1-blue.svg)](https://reactjs.org/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5.5.3-blue.svg)](https://www.typescriptlang.org/)
  [![Supabase](https://img.shields.io/badge/Supabase-Database-green.svg)](https://supabase.com/)
  [![Google Gemini](https://img.shields.io/badge/Google_Gemini-AI-orange.svg)](https://ai.google.dev/)
  [![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4.11-blue.svg)](https://tailwindcss.com/)
</div>

## 🌟 Overview

TheraBot is an empathetic AI-powered mental health companion that provides a safe, supportive digital space for users to explore their thoughts, track emotional patterns, and receive personalized insights about their mental well-being. Built with modern web technologies and professional therapeutic principles.

### ✨ Key Features

- **🧠 AI-Powered Mood Analysis** - Real-time emotional state detection from text
- **💬 Therapeutic Chat** - Conversations with "Sage," an AI therapist using CBT and mindfulness techniques
- **📝 Intelligent Journaling** - Rich text editor with automatic mood tracking
- **📊 Comprehensive Analytics** - 30-day mood trends and personalized insights
- **🎤 Voice Sessions** - Voice therapy interface (UI ready for speech integration)
- **🔒 Privacy-First** - End-to-end encryption with Supabase Row Level Security
- **📱 Responsive Design** - Beautiful, accessible interface across all devices

## 🚀 Quick Start

### Prerequisites

- **Node.js** (v18 or higher)
- **npm** or **yarn** package manager
- **Supabase account** for database
- **Google Gemini API key** for AI features

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/yourusername/therabot.git
   cd therabot
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   ```bash
   cp .env.example .env
   ```

   Edit `.env` with your credentials:

   ```env
   # Supabase Configuration
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

   # Google Gemini AI
   VITE_GEMINI_API_KEY=your_gemini_api_key
   ```

4. **Set up the database**

   - Create a new Supabase project
   - Run the database schema (see [Database Setup](#database-setup))
   - Enable Row Level Security policies

5. **Start the development server**

   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to `http://localhost:8080`

## 🏗️ Architecture

### Tech Stack

**Frontend:**

- **React 18.3.1** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **Shadcn/ui** component library
- **Framer Motion** for animations
- **React Query** for state management

**Backend & Database:**

- **Supabase** (PostgreSQL) for database and authentication
- **Row Level Security (RLS)** for data privacy
- **Real-time subscriptions** for live updates

**AI & Services:**

- **Google Gemini API** for mood analysis and therapeutic chat
- **Speech-to-Text** integration ready
- **Crisis intervention** protocols

### Project Structure

```
therabot/
├── src/
│   ├── components/          # React components
│   │   ├── ui/             # Shadcn/ui components
│   │   ├── AppSidebar.tsx  # Navigation sidebar
│   │   ├── DashboardHome.tsx # Main dashboard
│   │   ├── TextChat.tsx    # AI chat interface
│   │   ├── Journal.tsx     # Journaling component
│   │   └── VoiceSession.tsx # Voice therapy UI
│   ├── contexts/           # React contexts
│   │   └── AuthContext.tsx # Authentication state
│   ├── hooks/              # Custom React hooks
│   ├── lib/                # Utility libraries
│   │   ├── utils.ts        # General utilities
│   │   └── mood-processing.ts # Mood analytics
│   ├── pages/              # Page components
│   │   ├── Index.tsx       # Main app page
│   │   ├── AuthPage.tsx    # Login/signup
│   │   └── NotFound.tsx    # 404 page
│   ├── services/           # External service integrations
│   │   ├── supabase.ts     # Database operations
│   │   ├── gemini.ts       # AI services
│   │   ├── speechToText.ts # Speech recognition
│   │   └── voiceTherapy.ts # Voice processing
│   └── styles/             # CSS files
├── backend/                # Optional Express.js backend
├── public/                 # Static assets
└── docs/                   # Documentation
```

## 🔧 Database Setup

### Required Tables

Create these tables in your Supabase project:

```sql
-- Conversations table
CREATE TABLE conversations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Messages table
CREATE TABLE messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'model')),
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Journal entries table
CREATE TABLE journal_entries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  mood TEXT,
  ai_analysis TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Mood analysis entries
CREATE TABLE mood_analysis_entries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  source TEXT NOT NULL CHECK (source IN ('journal', 'voice', 'chat')),
  source_id UUID NOT NULL,
  primary_mood TEXT NOT NULL,
  secondary_mood TEXT,
  intensity INTEGER CHECK (intensity >= 1 AND intensity <= 10),
  confidence DECIMAL CHECK (confidence >= 0 AND confidence <= 1),
  reasoning TEXT,
  key_emotions TEXT[],
  raw_content TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Daily mood summaries
CREATE TABLE daily_mood_summaries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  primary_mood TEXT NOT NULL,
  secondary_mood TEXT,
  average_intensity DECIMAL,
  overall_confidence DECIMAL,
  reasoning TEXT,
  key_emotions TEXT[],
  analysis_count INTEGER DEFAULT 0,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, date)
);
```

### Row Level Security (RLS) Policies

```sql
-- Enable RLS on all tables
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE mood_analysis_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_mood_summaries ENABLE ROW LEVEL SECURITY;

-- Create policies (users can only access their own data)
CREATE POLICY "Users can manage their own conversations" ON conversations
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own messages" ON messages
  FOR ALL USING (auth.uid() IN (
    SELECT user_id FROM conversations WHERE id = conversation_id
  ));

CREATE POLICY "Users can manage their own journal entries" ON journal_entries
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own mood analyses" ON mood_analysis_entries
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own mood summaries" ON daily_mood_summaries
  FOR ALL USING (auth.uid() = user_id);
```

## 🤖 AI Features

### Mood Analysis System

TheraBot uses Google Gemini to analyze emotional states from text with:

- **7 Core Mood Categories**: Happy, Peaceful, Excited, Sad, Anxious, Frustrated, Neutral
- **Intensity Scoring**: 1-10 scale for emotional intensity
- **Confidence Levels**: AI confidence in analysis (0-1 scale)
- **Key Emotions**: Extracted emotional keywords
- **Contextual Reasoning**: Explanation of mood determination

### Therapeutic Chat

"Sage" the AI therapist provides:

- **Person-Centered Therapy** approach with unconditional positive regard
- **Cognitive Behavioral Therapy** techniques for thought pattern recognition
- **Mindfulness practices** for grounding and present-moment awareness
- **Crisis intervention** with immediate professional resource redirection
- **Conversation history** with intelligent title generation

### Safety Protocols

- **Crisis Detection**: Automatic identification of crisis keywords
- **Professional Boundaries**: Clear AI limitations and disclaimers
- **Resource Redirection**: Immediate connection to crisis hotlines (988, 111)
- **Data Privacy**: GDPR-compliant data handling with encryption

## 📊 Analytics & Insights

### Dashboard Features

- **Today's Mood Summary**: Current emotional state with confidence indicators
- **30-Day Trends**: Visual mood patterns and progress tracking
- **AI-Generated Insights**: Personalized recommendations based on patterns
- **Activity Tracking**: Journal entries, chat sessions, and voice sessions
- **Progress Indicators**: Positive mood percentage and trend analysis

### Mood Processing Pipeline

1. **Real-time Analysis**: Text analyzed immediately upon input
2. **Daily Aggregation**: Multiple analyses combined into daily summaries
3. **Trend Calculation**: Weekly and monthly pattern recognition
4. **Insight Generation**: AI-powered personalized recommendations
5. **Visual Representation**: Charts and graphs for easy understanding

## 🎨 UI/UX Design

### Design Philosophy

- **Calm & Welcoming**: Soft color palette with soothing gradients
- **Accessibility First**: WCAG compliant with keyboard navigation
- **Responsive Design**: Optimized for mobile, tablet, and desktop
- **Smooth Animations**: Framer Motion for emotional comfort
- **Intuitive Navigation**: Clear visual hierarchy and user flow

### Color Scheme

- **Primary**: `#4E85A2` (Calming blue)
- **Background**: Dark theme with warm accents
- **Mood Colors**: Contextual colors for different emotional states
- **Status Indicators**: Green for positive, amber for neutral, red for concerning

## 🔐 Security & Privacy

### Data Protection

- **End-to-End Encryption**: All data encrypted at rest and in transit
- **Row Level Security**: Database-level access control
- **User Isolation**: Complete data separation between users
- **GDPR Compliance**: Right to deletion and data portability

### Authentication

- **Supabase Auth**: Industry-standard authentication system
- **Email Verification**: Required for account activation
- **Session Management**: Secure token-based sessions
- **Password Security**: Bcrypt hashing with salt

## 🚀 Deployment

### Development

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

### Production Deployment

1. **Build the application**

   ```bash
   npm run build
   ```

2. **Deploy to your hosting platform**

   - **Vercel**: Connect GitHub repository for automatic deployments
   - **Netlify**: Drag and drop `dist` folder or connect repository
   - **AWS S3**: Upload `dist` contents to S3 bucket with CloudFront

3. **Environment Variables**
   Set production environment variables in your hosting platform:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_GEMINI_API_KEY`

### Backend (Optional)

If using the Express.js backend:

```bash
cd backend
npm install
npm start
```

## 🧪 Testing

### Running Tests

```bash
npm test              # Run unit tests
npm run test:e2e      # Run end-to-end tests
npm run test:coverage # Generate coverage report
```

### Test Coverage

- **Components**: Unit tests for all React components
- **Services**: Integration tests for API services
- **Database**: Tests for Supabase operations
- **AI Features**: Mock tests for Gemini integration

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Workflow

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Standards

- **TypeScript**: Strict type checking enabled
- **ESLint**: Code linting with React hooks rules
- **Prettier**: Code formatting (configured in `.prettierrc`)
- **Conventional Commits**: Semantic commit messages

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

### Getting Help

- **Documentation**: Check the [docs](docs/) folder for detailed guides
- **Issues**: Report bugs on [GitHub Issues](https://github.com/yourusername/therabot/issues)
- **Discussions**: Join community discussions on [GitHub Discussions](https://github.com/yourusername/therabot/discussions)

### Crisis Resources

If you're experiencing a mental health crisis:

- **US**: Call 988 (Suicide & Crisis Lifeline)
- **UK**: Call 111 (NHS 111)
- **International**: Visit [findahelpline.com](https://findahelpline.com)

**Remember**: TheraBot is a supportive tool, not a replacement for professional mental health care.

## 🙏 Acknowledgments

- **Google Gemini** for powerful AI capabilities
- **Supabase** for excellent backend-as-a-service
- **Shadcn/ui** for beautiful, accessible components
- **The mental health community** for guidance on therapeutic approaches

---

<div align="center">
  <p><strong>Built with ❤️ for mental health and wellness</strong></p>
  <p>
    <a href="https://github.com/yourusername/therabot">⭐ Star us on GitHub</a> •
    <a href="https://github.com/yourusername/therabot/issues">🐛 Report Bug</a> •
    <a href="https://github.com/yourusername/therabot/issues">✨ Request Feature</a>
  </p>
</div>
