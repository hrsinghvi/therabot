import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold, ChatSession } from "@google/generative-ai";

// IMPORTANT: Do not hardcode the API key. Use environment variables.
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(API_KEY);

const modelConfig = {
  model: "gemini-1.5-flash-latest",
  safetySettings: [
    { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
    { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
    { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
    { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
  ],
};

// Predefined mood categories
export const MOOD_CATEGORIES = {
  happy: { emoji: '😊', color: 'bg-green-500', description: 'Joyful, content, positive' },
  peaceful: { emoji: '😌', color: 'bg-blue-500', description: 'Calm, serene, relaxed' },
  excited: { emoji: '🤩', color: 'bg-yellow-500', description: 'Energetic, enthusiastic, motivated' },
  sad: { emoji: '😔', color: 'bg-blue-600', description: 'Down, melancholy, sorrowful' },
  anxious: { emoji: '😰', color: 'bg-red-500', description: 'Worried, nervous, stressed' },
  frustrated: { emoji: '😠', color: 'bg-red-600', description: 'Irritated, annoyed, overwhelmed' },
  neutral: { emoji: '😐', color: 'bg-gray-500', description: 'Balanced, stable, unremarkable' },
} as const;

export type MoodType = keyof typeof MOOD_CATEGORIES;

export interface MoodAnalysis {
  primaryMood: MoodType;
  secondaryMood?: MoodType;
  intensity: number; // 1-10 scale
  confidence: number; // 0-1 scale
  reasoning: string;
  keyEmotions: string[];
  timestamp: string;
  source: 'journal' | 'voice' | 'chat';
}

// Memoize the chat session to maintain conversation history
let chatSession: ChatSession | null = null;

export const getChatSession = (systemPrompt: string): ChatSession => {
  if (chatSession) {
    return chatSession;
  }

  const model = genAI.getGenerativeModel({
    ...modelConfig,
    systemInstruction: systemPrompt,
  });

  chatSession = model.startChat({
    history: [],
  });

  return chatSession;
};

export const sendMessageToGemini = async (session: ChatSession, message: string): Promise<string> => {
  try {
    const result = await session.sendMessage(message);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Gemini API Error:", error);
    // Provide a generic, supportive error message to the user
    return "I'm finding it a little difficult to connect right now. Thank you for your patience. I'm still here to listen.";
  }
};

export const generateChatTitle = async (userMessage: string): Promise<string> => {
  try {
    const model = genAI.getGenerativeModel({
      ...modelConfig,
      systemInstruction: "You are a helpful assistant that generates concise, meaningful titles for conversations. Create a short title (2-5 words) that captures the main topic or theme of the user's message. Respond only with the title, no additional text or punctuation."
    });

    const result = await model.generateContent(
      `Generate a short, meaningful title for this conversation starter: "${userMessage}"`
    );
    const response = await result.response;
    const title = response.text().trim();
    
    // Fallback to first few words if title is too long or empty
    if (!title || title.length > 50) {
      return userMessage.substring(0, 40).trim() + (userMessage.length > 40 ? "..." : "");
    }
    
    return title;
  } catch (error) {
    console.error("Error generating chat title:", error);
    // Fallback to truncated message
    return userMessage.substring(0, 40).trim() + (userMessage.length > 40 ? "..." : "");
  }
};

export async function analyzeJournalEntry(entryContent: string): Promise<string> {
  const model = genAI.getGenerativeModel({ model: "gemini-pro" });
  const prompt = `Analyze the sentiment and key themes of the following journal entry. Provide a brief, one-sentence summary. Entry: "${entryContent}"`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Error analyzing journal entry:", error);
    return "AI analysis could not be completed.";
  }
}

/**
 * Analyzes text content to determine mood and emotional state
 */
export async function analyzeMoodFromText(
  content: string, 
  source: 'journal' | 'voice' | 'chat',
  context?: string
): Promise<MoodAnalysis> {
  const model = genAI.getGenerativeModel({
    ...modelConfig,
    systemInstruction: `You are an expert emotional intelligence AI that analyzes text to determine mood and emotional state. 

Available mood categories:
${Object.entries(MOOD_CATEGORIES).map(([key, value]) => `- ${key}: ${value.description}`).join('\n')}

Your task is to analyze the provided text and return a JSON response with the following structure:
{
  "primaryMood": "one of the mood categories",
  "secondaryMood": "optional secondary mood if present",
  "intensity": "number from 1-10 indicating emotional intensity",
  "confidence": "number from 0-1 indicating how confident you are in this analysis",
  "reasoning": "brief explanation of why you chose this mood",
  "keyEmotions": ["array", "of", "key", "emotional", "words", "detected"]
}

Focus on the overall emotional tone, not just keywords. Consider context, writing style, and implicit emotions. Be empathetic and accurate.`
  });

  const prompt = `Analyze the mood and emotional state from this ${source} content:

Content: "${content}"
${context ? `Additional context: ${context}` : ''}

Respond with only the JSON object, no additional text.`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text().trim();
    
    // Extract JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("No valid JSON found in response");
    }
    
    const analysis = JSON.parse(jsonMatch[0]);
    
    // Validate and ensure required fields
    const validatedAnalysis: MoodAnalysis = {
      primaryMood: MOOD_CATEGORIES[analysis.primaryMood as MoodType] ? analysis.primaryMood : 'neutral',
      secondaryMood: analysis.secondaryMood && MOOD_CATEGORIES[analysis.secondaryMood as MoodType] ? analysis.secondaryMood : undefined,
      intensity: Math.max(1, Math.min(10, Number(analysis.intensity) || 5)),
      confidence: Math.max(0, Math.min(1, Number(analysis.confidence) || 0.5)),
      reasoning: analysis.reasoning || "Mood analysis completed",
      keyEmotions: Array.isArray(analysis.keyEmotions) ? analysis.keyEmotions.slice(0, 5) : [],
      timestamp: new Date().toISOString(),
      source
    };
    
    return validatedAnalysis;
  } catch (error) {
    console.error("Error analyzing mood from text:", error);
    
    // Fallback analysis
    return {
      primaryMood: 'neutral',
      intensity: 5,
      confidence: 0.3,
      reasoning: "Analysis failed, defaulting to neutral mood",
      keyEmotions: [],
      timestamp: new Date().toISOString(),
      source
    };
  }
}

/**
 * Combines multiple mood analyses to determine the dominant mood for the day
 */
export async function combineMoodAnalyses(analyses: MoodAnalysis[]): Promise<MoodAnalysis> {
  if (analyses.length === 0) {
    return {
      primaryMood: 'neutral',
      intensity: 5,
      confidence: 0.1,
      reasoning: "No data available for analysis",
      keyEmotions: [],
      timestamp: new Date().toISOString(),
      source: 'journal'
    };
  }

  if (analyses.length === 1) {
    return analyses[0];
  }

  const model = genAI.getGenerativeModel({
    ...modelConfig,
    systemInstruction: `You are an expert emotional intelligence AI that combines multiple mood analyses to determine the overall dominant mood for a day.

Available mood categories:
${Object.entries(MOOD_CATEGORIES).map(([key, value]) => `- ${key}: ${value.description}`).join('\n')}

Your task is to analyze multiple mood data points and determine the most representative overall mood. Consider:
- Recency (more recent moods may be more representative)
- Intensity (stronger emotions may be more significant)
- Confidence levels (more confident analyses should weigh more)
- Overall emotional trajectory throughout the day

Return a JSON response with the same structure as individual analyses, representing the combined/dominant mood.`
  });

  const prompt = `Combine these mood analyses to determine the dominant mood for today:

${analyses.map((analysis, index) => `
Analysis ${index + 1} (${analysis.source}):
- Primary mood: ${analysis.primaryMood}
- Intensity: ${analysis.intensity}/10
- Confidence: ${Math.round(analysis.confidence * 100)}%
- Reasoning: ${analysis.reasoning}
- Time: ${new Date(analysis.timestamp).toLocaleTimeString()}
`).join('\n')}

Determine the most representative overall mood and respond with only the JSON object.`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text().trim();
    
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("No valid JSON found in response");
    }
    
    const analysis = JSON.parse(jsonMatch[0]);
    
    return {
      primaryMood: MOOD_CATEGORIES[analysis.primaryMood as MoodType] ? analysis.primaryMood : 'neutral',
      secondaryMood: analysis.secondaryMood && MOOD_CATEGORIES[analysis.secondaryMood as MoodType] ? analysis.secondaryMood : undefined,
      intensity: Math.max(1, Math.min(10, Number(analysis.intensity) || 5)),
      confidence: Math.max(0, Math.min(1, Number(analysis.confidence) || 0.5)),
      reasoning: analysis.reasoning || "Combined mood analysis",
      keyEmotions: Array.isArray(analysis.keyEmotions) ? analysis.keyEmotions.slice(0, 5) : [],
      timestamp: new Date().toISOString(),
      source: 'journal' // Default source for combined analysis
    };
  } catch (error) {
    console.error("Error combining mood analyses:", error);
    
    // Fallback: Use the most recent high-confidence analysis
    const sortedAnalyses = analyses
      .sort((a, b) => b.confidence - a.confidence)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    
    return {
      ...sortedAnalyses[0],
      reasoning: "Combined from multiple analyses (fallback method)",
      timestamp: new Date().toISOString()
    };
  }
}
