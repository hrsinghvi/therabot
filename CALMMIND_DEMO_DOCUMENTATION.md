# TheraBot - Complete App Documentation & Demo Guide

## App Overview

**TheraBot** is a comprehensive mental health and wellness companion that combines AI-powered mood analysis with therapeutic conversation capabilities. The app provides a safe, supportive digital space for users to explore their thoughts, track their emotional patterns, and receive personalized insights about their mental well-being.

### Core Mission

Create an accessible, empathetic AI companion that helps users:

- Track and understand their emotional patterns
- Engage in therapeutic conversations
- Reflect through guided journaling
- Gain insights into their mental health journey

---

## Key Features & Functionality

### 1. **Comprehensive Dashboard**

- **Real-time mood analytics** with AI-generated insights
- **Today's mood summary** showing primary emotions, intensity, and confidence levels
- **Complete mood journey** visualization with 30-day trends
- **AI-powered insights** with personalized recommendations
- **Comprehensive analytics** including all mood tracking data
- **Quick navigation** to all app features
- **Personalized welcome** with contextual check-ins

### 2. **AI-Powered Text Chat**

- **Therapeutic conversations** with "Sage," an AI therapist
- **Persistent chat history** with conversation management
- **Auto-generated conversation titles** using AI
- **Mood analysis** of each conversation for tracking
- **Crisis intervention protocols** for safety

### 3. **Intelligent Journaling**

- **Rich text editor** for personal reflections
- **AI mood analysis** of journal entries
- **Automatic mood tracking** from written content
- **Historical entry management** with search/edit capabilities
- **Daily check-in prompts** for consistent reflection

### 4. **Voice Sessions** (UI Ready)

- **Voice therapy interface** with visual feedback
- **Recording state management** with intuitive controls
- **Prepared for speech-to-text integration**
- **Mood analysis pipeline** ready for voice transcripts

### 5. **User Profile & Settings**

- **Secure authentication** via Supabase
- **Customizable preferences** for personalized experience
- **Data privacy controls** with row-level security
- **Theme and interface options**

---

## AI & Technology Stack

### **AI Capabilities (Google Gemini Integration)**

- **Mood Analysis Engine**: Analyzes text to determine:
  - Primary and secondary moods from 7 categories
  - Emotional intensity (1-10 scale)
  - Confidence levels in analysis
  - Key emotions and reasoning
- **Therapeutic Chat**: Professional-grade AI therapist with:
  - Person-centered therapy approach
  - CBT techniques integration
  - Mindfulness guidance
  - Crisis intervention protocols
- **Daily Mood Orchestration**: Combines multiple analyses into comprehensive daily summaries

### **Technical Architecture**

```
Frontend: React + TypeScript + Vite
UI Framework: Shadcn/ui + Tailwind CSS
Animation: Framer Motion
Backend: Supabase (PostgreSQL)
Authentication: Supabase Auth
Real-time: Supabase subscriptions
AI: Google Gemini API
State Management: React Query + Context
```

### **Database Schema**

```sql
-- Core tables for comprehensive mood tracking
- conversations & messages (chat history)
- journal_entries (user reflections)
- mood_analysis_entries (individual AI analyses)
- daily_mood_summaries (aggregated daily data)
- user profiles & preferences
```

---

## Safety & Professional Standards

### **Crisis Intervention Protocol**

- **Automatic detection** of crisis keywords and phrases
- **Immediate redirection** to professional resources (988, 111)
- **Clear AI limitations** - never claims to be a licensed therapist
- **Professional boundary maintenance** throughout all interactions

### **Therapeutic Approach**

- **Person-Centered Therapy** principles with unconditional positive regard
- **Cognitive Behavioral Therapy** techniques for thought pattern recognition
- **Mindfulness practices** for grounding and present-moment awareness
- **Empathetic listening** with reflective response patterns

### **Data Privacy & Security**

- **Row Level Security (RLS)** ensuring users only access their data
- **Encrypted storage** via Supabase infrastructure
- **GDPR-compliant** data handling practices
- **Secure authentication** with industry-standard protocols

---

## Mood Analysis System

### **7 Core Mood Categories**

```javascript
happy: Joyful, content, positive;
peaceful: Calm, serene, relaxed;
excited: Energetic, enthusiastic, motivated;
sad: Down, melancholy, sorrowful;
anxious: Worried, nervous, stressed;
frustrated: Irritated, annoyed, overwhelmed;
neutral: Balanced, stable, unremarkable;
```

### **Analysis Sources**

- **Journal entries** with contextual understanding
- **Chat conversations** analyzing user messages
- **Voice sessions** (transcript-based analysis)
- **Daily check-ins** for regular tracking

### **Analytics Pipeline**

1. **Real-time Analysis**: Individual mood analyses stored immediately
2. **Daily Aggregation**: Multiple analyses combined into daily summaries
3. **Trend Calculation**: Weekly/monthly pattern recognition
4. **Insight Generation**: AI-powered personalized recommendations

---

## User Experience Highlights

### **Design Philosophy**

- **Calm, welcoming interface** with soft color palette
- **Smooth animations** using Framer Motion for emotional comfort
- **Intuitive navigation** with clear visual hierarchy
- **Responsive design** optimized for all devices
- **Accessibility features** following WCAG guidelines

### **User Journey Flow**

```
1. Secure Authentication →
2. Comprehensive Dashboard with All Analytics →
3. Choose Activity (Chat/Journal/Voice) →
4. AI Analysis & Feedback →
5. Real-time Mood Tracking Updates →
6. Pattern Recognition & Growth Insights
```

### **Key Interactions**

- **Seamless mood tracking** across all app activities
- **Intelligent conversation** with contextual AI responses
- **Comprehensive mood analytics** all in one dashboard view
- **Visual mood trends** with encouraging progress indicators
- **Gentle prompts** for regular check-ins and reflection

---

## Demo Scenarios

### **Scenario 1: New User Onboarding**

1. User registers and logs in
2. Dashboard shows welcome message and empty state
3. User creates first journal entry about work stress
4. AI analyzes mood (anxious, intensity 7/10)
5. Dashboard updates with mood summary and insights immediately

### **Scenario 2: Regular Check-in Flow**

1. User returns to dashboard showing comprehensive mood analytics
2. Views today's mood analysis and recent journey patterns
3. Starts chat conversation about relationship concerns
4. AI provides therapeutic responses with active listening
5. Dashboard updates with new mood data and insights in real-time

### **Scenario 3: Progress Tracking**

1. User views comprehensive mood analytics on dashboard
2. Reviews 30-day mood journey and trend analysis
3. Notices improvement in anxiety levels over time
4. AI insights highlight positive patterns and coping strategies
5. User feels validated and motivated to continue their journey

---

## Technical Innovation Points

### **Real-time Mood Orchestration**

- **Intelligent aggregation** of multiple daily mood analyses
- **Source-aware processing** (journal vs chat vs voice)
- **Confidence weighting** for more accurate daily summaries
- **Automatic recalculation** when new data arrives

### **Therapeutic AI Design**

- **Professionally crafted prompts** following therapy best practices
- **Safety-first approach** with built-in crisis detection
- **Contextual responses** that adapt to user's emotional state
- **Boundary-aware interactions** maintaining professional distance

### **Scalable Architecture**

- **Modular component design** for easy feature expansion
- **Type-safe development** with comprehensive TypeScript
- **Performance optimization** with React Query caching
- **Real-time capabilities** ready for collaborative features

### **Unified Analytics Dashboard**

- **Single comprehensive view** of all mood data and insights
- **30-day analytics** for deeper pattern recognition
- **Real-time updates** as users interact with the app
- **AI-generated insights** personalized to user patterns

---

## Value Proposition

### **For Users**

- **24/7 availability** for emotional support and reflection
- **Privacy-focused** alternative to traditional therapy apps
- **Comprehensive tracking** with all analytics in one place
- **Professional-grade AI** with therapeutic training
- **Growth-oriented insights** that promote self-awareness

### **For Healthcare Ecosystem**

- **Complementary tool** for existing therapy relationships
- **Early intervention** potential through mood pattern detection
- **Accessible entry point** for mental health awareness
- **Data-driven insights** for understanding population mental health

### **Technical Differentiators**

- **Multi-source mood analysis** combining journal, chat, and voice
- **Professional therapeutic approach** rather than generic chatbot
- **Real-time mood orchestration** with intelligent aggregation
- **Crisis-aware safety protocols** built into core functionality
- **Privacy-by-design** architecture with local-first principles
- **Unified analytics experience** with all insights on main dashboard

---

## Future Roadmap

### **Immediate Enhancements**

- Complete voice session implementation with speech-to-text
- Enhanced mood visualization with interactive charts
- Guided meditation and breathing exercise integration
- Customizable check-in reminders and prompts

### **Advanced Features**

- Predictive mood modeling for early intervention
- Integration with wearable devices for biometric data
- Collaborative features for therapy teams
- Advanced analytics dashboard for healthcare providers

---

## Technical Implementation Details

### **Mood Orchestrator Service**

The `MoodOrchestrator` class serves as the central nervous system for mood analysis:

- Handles analysis from multiple sources (journal, voice, chat)
- Automatically updates daily mood summaries
- Provides comprehensive analytics for dashboard display
- Manages real-time mood updates across the application

### **AI Integration Architecture**

- **Google Gemini API** integration with safety settings optimized for therapeutic use
- **Structured mood analysis** with validated JSON responses
- **Fallback mechanisms** ensuring graceful degradation
- **Context-aware prompting** for different interaction types

### **Database Design Highlights**

- **Separate analysis storage** for granular mood tracking
- **Daily summary aggregation** for performance optimization
- **User-scoped data isolation** with Supabase RLS
- **Efficient querying** for real-time dashboard updates

This comprehensive app represents the intersection of cutting-edge AI technology and evidence-based therapeutic practices, creating a powerful tool for mental health and emotional well-being.
