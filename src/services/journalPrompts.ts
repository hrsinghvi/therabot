export interface JournalPrompt {
  id: string;
  text: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

export const JOURNAL_PROMPTS: JournalPrompt[] = [
  // Self-reflection prompts
  {
    id: 'self-reflection-1',
    text: "What's one thing you're grateful for today, and why?",
    category: 'Gratitude',
    difficulty: 'easy'
  },
  {
    id: 'self-reflection-2',
    text: "Describe a moment today that made you smile. What made it special?",
    category: 'Daily Moments',
    difficulty: 'easy'
  },
  {
    id: 'self-reflection-3',
    text: "What's something you're looking forward to this week?",
    category: 'Future',
    difficulty: 'easy'
  },
  {
    id: 'self-reflection-4',
    text: "Write about a challenge you faced recently and how you handled it.",
    category: 'Challenges',
    difficulty: 'medium'
  },
  {
    id: 'self-reflection-5',
    text: "What's one thing you'd like to improve about yourself?",
    category: 'Growth',
    difficulty: 'medium'
  },

  // Emotional exploration
  {
    id: 'emotions-1',
    text: "How are you feeling right now? Try to describe the emotion in detail.",
    category: 'Emotions',
    difficulty: 'easy'
  },
  {
    id: 'emotions-2',
    text: "What's something that's been bothering you lately?",
    category: 'Emotions',
    difficulty: 'medium'
  },
  {
    id: 'emotions-3',
    text: "Write about a time when you felt proud of yourself.",
    category: 'Achievement',
    difficulty: 'easy'
  },
  {
    id: 'emotions-4',
    text: "What's something that always makes you feel better when you're down?",
    category: 'Self-Care',
    difficulty: 'easy'
  },
  {
    id: 'emotions-5',
    text: "Describe a moment when you felt completely at peace.",
    category: 'Mindfulness',
    difficulty: 'medium'
  },

  // Relationships
  {
    id: 'relationships-1',
    text: "Who is someone you admire and why?",
    category: 'Relationships',
    difficulty: 'easy'
  },
  {
    id: 'relationships-2',
    text: "Write about a meaningful conversation you had recently.",
    category: 'Relationships',
    difficulty: 'medium'
  },
  {
    id: 'relationships-3',
    text: "What's something you'd like to tell someone but haven't been able to?",
    category: 'Relationships',
    difficulty: 'hard'
  },
  {
    id: 'relationships-4',
    text: "How do you show love and care to the people in your life?",
    category: 'Relationships',
    difficulty: 'medium'
  },

  // Goals and dreams
  {
    id: 'goals-1',
    text: "What's one goal you have for this month?",
    category: 'Goals',
    difficulty: 'easy'
  },
  {
    id: 'goals-2',
    text: "Where do you see yourself in five years?",
    category: 'Future',
    difficulty: 'medium'
  },
  {
    id: 'goals-3',
    text: "What's something you've always wanted to learn or try?",
    category: 'Growth',
    difficulty: 'easy'
  },
  {
    id: 'goals-4',
    text: "Write about a dream you had recently and what it might mean.",
    category: 'Dreams',
    difficulty: 'medium'
  },

  // Creative prompts
  {
    id: 'creative-1',
    text: "If you could have dinner with anyone, living or dead, who would it be and why?",
    category: 'Creative',
    difficulty: 'easy'
  },
  {
    id: 'creative-2',
    text: "What's your favorite place in the world and what makes it special?",
    category: 'Places',
    difficulty: 'easy'
  },
  {
    id: 'creative-3',
    text: "Write about a book, movie, or song that changed your perspective.",
    category: 'Art & Culture',
    difficulty: 'medium'
  },
  {
    id: 'creative-4',
    text: "If you could give your younger self one piece of advice, what would it be?",
    category: 'Reflection',
    difficulty: 'medium'
  },
  {
    id: 'creative-5',
    text: "What's something you used to believe that you no longer believe?",
    category: 'Growth',
    difficulty: 'hard'
  },

  // Mindfulness and wellness
  {
    id: 'mindfulness-1',
    text: "What's one thing you can do today to take care of yourself?",
    category: 'Self-Care',
    difficulty: 'easy'
  },
  {
    id: 'mindfulness-2',
    text: "Describe your ideal morning routine.",
    category: 'Wellness',
    difficulty: 'easy'
  },
  {
    id: 'mindfulness-3',
    text: "What's something that always helps you feel more centered?",
    category: 'Mindfulness',
    difficulty: 'medium'
  },
  {
    id: 'mindfulness-4',
    text: "Write about a time when you felt completely in the present moment.",
    category: 'Mindfulness',
    difficulty: 'medium'
  },

  // Deep reflection
  {
    id: 'deep-1',
    text: "What's one thing you're afraid of and why?",
    category: 'Fears',
    difficulty: 'hard'
  },
  {
    id: 'deep-2',
    text: "What's something you've learned about yourself recently?",
    category: 'Self-Discovery',
    difficulty: 'medium'
  },
  {
    id: 'deep-3',
    text: "Write about a time when you had to make a difficult decision.",
    category: 'Decisions',
    difficulty: 'hard'
  },
  {
    id: 'deep-4',
    text: "What's one thing you'd like to be remembered for?",
    category: 'Legacy',
    difficulty: 'hard'
  },
  {
    id: 'deep-5',
    text: "What's something you're passionate about and why?",
    category: 'Passions',
    difficulty: 'medium'
  }
];

export const getRandomPrompt = (category?: string, difficulty?: string): JournalPrompt => {
  let filteredPrompts = JOURNAL_PROMPTS;
  
  if (category) {
    filteredPrompts = filteredPrompts.filter(prompt => prompt.category === category);
  }
  
  if (difficulty) {
    filteredPrompts = filteredPrompts.filter(prompt => prompt.difficulty === difficulty);
  }
  
  if (filteredPrompts.length === 0) {
    return JOURNAL_PROMPTS[Math.floor(Math.random() * JOURNAL_PROMPTS.length)];
  }
  
  return filteredPrompts[Math.floor(Math.random() * filteredPrompts.length)];
};

export const getCategories = (): string[] => {
  const categories = new Set(JOURNAL_PROMPTS.map(prompt => prompt.category));
  return Array.from(categories).sort();
};

export const getDifficulties = (): string[] => {
  return ['easy', 'medium', 'hard'];
}; 