import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

export interface MoodPattern {
  primaryMood: string;
  frequency: number;
  intensity: number;
  keyEmotions: string[];
  recentEntries: string[];
}

export interface GeneratedPlan {
  title: string;
  description: string;
  targetArea: string;
  confidence: number;
  insights: string[];
  exercises: GeneratedExercise[];
}

export interface GeneratedExercise {
  title: string;
  description: string;
  type: 'breathing' | 'journaling' | 'mindfulness' | 'behavioral' | 'cognitive' | 'physical';
  duration: number;
  difficulty: 'easy' | 'medium' | 'hard';
  instructions: string[];
  benefits: string[];
}

export class PlanGeneratorService {
  private model;

  constructor() {
    this.model = genAI.getGenerativeModel({ model: 'gemini-pro' });
  }

  async generateWeeklyPlan(moodPattern: MoodPattern): Promise<GeneratedPlan> {
    const prompt = this.createPlanPrompt(moodPattern);
    
    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      // Parse the AI response and structure it
      return this.parsePlanResponse(text, moodPattern);
    } catch (error) {
      console.error('Error generating plan:', error);
      // Fallback to template-based plan
      return this.generateTemplatePlan(moodPattern);
    }
  }

  private createPlanPrompt(moodPattern: MoodPattern): string {
    return `You are a compassionate AI wellness coach. Create a personalized weekly wellness plan for someone with the following emotional patterns:

Primary Mood: ${moodPattern.primaryMood} (appeared ${moodPattern.frequency} times)
Average Intensity: ${moodPattern.intensity}/10
Key Emotions: ${moodPattern.keyEmotions.join(', ')}
Recent Context: ${moodPattern.recentEntries.slice(0, 2).join(' | ')}

Create a structured weekly plan that includes:

1. A compassionate, encouraging title for the plan
2. A brief description of the plan's approach
3. The main target area for improvement
4. 3-4 key insights about their emotional patterns
5. 5-7 specific exercises with these details for each:
   - Exercise title
   - Brief description
   - Type (breathing, journaling, mindfulness, behavioral, cognitive, or physical)
   - Duration in minutes (5-30)
   - Difficulty (easy, medium, hard)
   - 3-4 step-by-step instructions
   - 2-3 benefits

Focus on evidence-based techniques from CBT, mindfulness, positive psychology, and wellness practices. Make it practical, achievable, and encouraging.

Format your response as JSON with this structure:
{
  "title": "Plan title",
  "description": "Plan description", 
  "targetArea": "Main focus area",
  "insights": ["insight1", "insight2", "insight3"],
  "exercises": [
    {
      "title": "Exercise title",
      "description": "Exercise description",
      "type": "exercise_type",
      "duration": 15,
      "difficulty": "easy",
      "instructions": ["step1", "step2", "step3"],
      "benefits": ["benefit1", "benefit2"]
    }
  ]
}`;
  }

  private parsePlanResponse(text: string, moodPattern: MoodPattern): GeneratedPlan {
    try {
      // Clean the response and extract JSON
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          title: parsed.title || this.getDefaultTitle(moodPattern.primaryMood),
          description: parsed.description || this.getDefaultDescription(moodPattern.primaryMood),
          targetArea: parsed.targetArea || this.getDefaultTargetArea(moodPattern.primaryMood),
          confidence: 0.85,
          insights: parsed.insights || this.getDefaultInsights(moodPattern.primaryMood),
          exercises: this.validateExercises(parsed.exercises || [])
        };
      }
    } catch (error) {
      console.error('Error parsing AI response:', error);
    }
    
    // Fallback to template
    return this.generateTemplatePlan(moodPattern);
  }

  private validateExercises(exercises: any[]): GeneratedExercise[] {
    return exercises.map(exercise => ({
      title: exercise.title || 'Wellness Exercise',
      description: exercise.description || 'A helpful wellness activity',
      type: this.validateExerciseType(exercise.type),
      duration: this.validateDuration(exercise.duration),
      difficulty: this.validateDifficulty(exercise.difficulty),
      instructions: Array.isArray(exercise.instructions) ? exercise.instructions : [],
      benefits: Array.isArray(exercise.benefits) ? exercise.benefits : []
    }));
  }

  private validateExerciseType(type: string): GeneratedExercise['type'] {
    const validTypes: GeneratedExercise['type'][] = ['breathing', 'journaling', 'mindfulness', 'behavioral', 'cognitive', 'physical'];
    return validTypes.includes(type as any) ? type as GeneratedExercise['type'] : 'mindfulness';
  }

  private validateDuration(duration: any): number {
    const num = parseInt(duration);
    return isNaN(num) ? 10 : Math.max(5, Math.min(30, num));
  }

  private validateDifficulty(difficulty: string): GeneratedExercise['difficulty'] {
    const validDifficulties: GeneratedExercise['difficulty'][] = ['easy', 'medium', 'hard'];
    return validDifficulties.includes(difficulty as any) ? difficulty as GeneratedExercise['difficulty'] : 'easy';
  }

  private generateTemplatePlan(moodPattern: MoodPattern): GeneratedPlan {
    const mood = moodPattern.primaryMood;
    
    const templates = {
      sad: {
        title: "Brightening Days Plan",
        description: "Gentle activities to lift your spirits and build emotional resilience",
        targetArea: "Mood Enhancement & Emotional Support"
      },
      anxious: {
        title: "Finding Calm Plan", 
        description: "Evidence-based techniques to reduce anxiety and build inner peace",
        targetArea: "Anxiety Management & Stress Reduction"
      },
      frustrated: {
        title: "Emotional Balance Plan",
        description: "Healthy strategies to process frustration and develop emotional regulation",
        targetArea: "Emotional Regulation & Stress Management"
      },
      neutral: {
        title: "Wellness Foundation Plan",
        description: "Building positive habits and emotional resilience for overall well-being",
        targetArea: "General Wellness & Preventive Care"
      },
      happy: {
        title: "Sustaining Joy Plan",
        description: "Strategies to maintain and amplify positive emotional experiences",
        targetArea: "Positive Psychology & Well-being Enhancement"
      }
    };

    const template = templates[mood as keyof typeof templates] || templates.neutral;
    
    return {
      ...template,
      confidence: 0.75,
      insights: this.getDefaultInsights(mood),
      exercises: this.generateTemplateExercises(mood)
    };
  }

  private generateTemplateExercises(mood: string): GeneratedExercise[] {
    const baseExercises: GeneratedExercise[] = [
      {
        title: "Daily Gratitude Practice",
        description: "Write down three things you're grateful for each day",
        type: "journaling",
        duration: 5,
        difficulty: "easy",
        instructions: [
          "Set aside 5 minutes each morning or evening",
          "Write down 3 specific things you're grateful for today",
          "Include why you're grateful for each item",
          "Notice how this practice affects your mood over time"
        ],
        benefits: ["Increases positive emotions", "Improves overall well-being"]
      },
      {
        title: "Mindful Breathing",
        description: "A simple breathing technique to center yourself and reduce stress",
        type: "breathing",
        duration: 10,
        difficulty: "easy",
        instructions: [
          "Find a comfortable seated position",
          "Breathe in slowly for 4 counts",
          "Hold for 4 counts",
          "Breathe out slowly for 6 counts"
        ],
        benefits: ["Reduces stress", "Improves focus"]
      }
    ];

    const moodSpecificExercises: { [key: string]: GeneratedExercise[] } = {
      sad: [
        {
          title: "Sunshine Walk",
          description: "Take a gentle walk outdoors to boost mood naturally",
          type: "physical",
          duration: 20,
          difficulty: "easy",
          instructions: [
            "Choose a route with natural light if possible",
            "Walk at a comfortable, unhurried pace",
            "Notice colors, sounds, and textures around you",
            "Take deep breaths of fresh air"
          ],
          benefits: ["Increases serotonin", "Improves mood naturally"]
        }
      ],
      anxious: [
        {
          title: "5-4-3-2-1 Grounding",
          description: "Use your senses to ground yourself in the present moment",
          type: "mindfulness",
          duration: 10,
          difficulty: "easy",
          instructions: [
            "Name 5 things you can see around you",
            "Name 4 things you can touch",
            "Name 3 things you can hear",
            "Name 2 things you can smell"
          ],
          benefits: ["Reduces anxiety", "Grounds you in the present"]
        }
      ],
      frustrated: [
        {
          title: "Emotion Processing Journal",
          description: "Explore and process frustrating emotions through writing",
          type: "journaling",
          duration: 15,
          difficulty: "medium",
          instructions: [
            "Describe the situation that triggered frustration",
            "Identify the specific emotions you're feeling",
            "Explore what values or needs weren't met",
            "Brainstorm healthy ways to address the situation"
          ],
          benefits: ["Increases emotional awareness", "Provides healthy outlet"]
        }
      ]
    };

    return [...baseExercises, ...(moodSpecificExercises[mood] || [])];
  }

  private getDefaultTitle(mood: string): string {
    const titles = {
      sad: "Lifting Your Spirits Plan",
      anxious: "Finding Your Calm Plan", 
      frustrated: "Emotional Balance Plan",
      happy: "Amplifying Joy Plan",
      neutral: "Wellness Foundation Plan"
    };
    return titles[mood as keyof typeof titles] || "Personal Wellness Plan";
  }

  private getDefaultDescription(mood: string): string {
    const descriptions = {
      sad: "Gentle activities designed to brighten your days and build emotional resilience",
      anxious: "Calming techniques to reduce anxiety and create inner peace",
      frustrated: "Healthy strategies to process difficult emotions and find balance",
      happy: "Practices to sustain and amplify your positive emotional state",
      neutral: "Foundation-building activities for overall emotional well-being"
    };
    return descriptions[mood as keyof typeof descriptions] || "A personalized approach to improving your emotional well-being";
  }

  private getDefaultTargetArea(mood: string): string {
    const areas = {
      sad: "Mood Enhancement & Emotional Support",
      anxious: "Anxiety Management & Stress Reduction", 
      frustrated: "Emotional Regulation & Stress Management",
      happy: "Positive Psychology & Joy Amplification",
      neutral: "General Wellness & Emotional Foundation"
    };
    return areas[mood as keyof typeof areas] || "Emotional Well-being";
  }

  private getDefaultInsights(mood: string): string[] {
    const insights = {
      sad: [
        "Sadness is a natural emotion that helps us process difficult experiences",
        "Small, consistent activities can gradually lift your mood over time",
        "Connection with others and nature provides powerful emotional support"
      ],
      anxious: [
        "Anxiety often stems from worry about future events - grounding helps",
        "Regular breathing exercises retrain your nervous system's stress response",
        "Breaking overwhelming thoughts into smaller parts makes them manageable"
      ],
      frustrated: [
        "Frustration often signals that something important to you needs attention",
        "Physical movement is one of the fastest ways to shift emotional states",
        "Processing emotions through writing provides clarity and perspective"
      ],
      happy: [
        "Positive emotions can be cultivated and sustained through practice",
        "Gratitude and mindfulness naturally amplify feelings of happiness",
        "Sharing joy with others multiplies its positive impact"
      ],
      neutral: [
        "Neutral periods are perfect opportunities to build emotional resilience",
        "Small daily practices create significant long-term improvements",
        "Prevention-focused activities help maintain emotional stability"
      ]
    };
    return insights[mood as keyof typeof insights] || [
      "Every emotional state provides opportunities for growth and learning",
      "Consistent self-care practices build lasting emotional resilience"
    ];
  }
}

export const planGenerator = new PlanGeneratorService(); 