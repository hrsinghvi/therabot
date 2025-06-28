
import { GoogleGenerativeAI } from '@google/generative-ai';

const API_KEY = 'AIzaSyAEQcMouVdNU4rLFF0eP7WxauDc0MOwO8s';
const genAI = new GoogleGenerativeAI(API_KEY);

export interface GeminiResponse {
  content: string;
  isTherapeutic: boolean;
  emotionalTone: 'supportive' | 'empathetic' | 'encouraging' | 'grounding';
  suggestedActions?: string[];
}

export const generateTherapeuticResponse = async (userMessage: string, conversationHistory: string[] = []): Promise<GeminiResponse> => {
  const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

  const therapeuticPrompt = `
    You are CalmMind, a compassionate AI therapy companion. Your role is to provide emotional support, active listening, and gentle guidance. 

    Guidelines:
    - Be warm, empathetic, and non-judgmental
    - Use reflective listening techniques
    - Ask open-ended questions to help users explore their feelings
    - Offer coping strategies when appropriate
    - Validate emotions and experiences
    - Keep responses conversational and supportive
    - If someone expresses crisis thoughts, gently suggest professional help
    - Maintain a calm, therapeutic tone

    Recent conversation context: ${conversationHistory.slice(-3).join('\n')}
    
    User message: "${userMessage}"
    
    Please respond as CalmMind would, with empathy and therapeutic insight. Keep responses to 2-3 sentences maximum.
  `;

  try {
    const result = await model.generateContent(therapeuticPrompt);
    const response = await result.response;
    const content = response.text();

    // Simple emotion analysis based on content
    const emotionalTone = analyzeEmotionalTone(content);
    
    return {
      content: content.trim(),
      isTherapeutic: true,
      emotionalTone,
      suggestedActions: generateSuggestedActions(userMessage)
    };
  } catch (error) {
    console.error('Gemini API error:', error);
    return {
      content: "I'm here to listen and support you. Sometimes I have trouble connecting, but I want you to know that your feelings are valid and important.",
      isTherapeutic: true,
      emotionalTone: 'supportive'
    };
  }
};

const analyzeEmotionalTone = (response: string): 'supportive' | 'empathetic' | 'encouraging' | 'grounding' => {
  const lowerResponse = response.toLowerCase();
  
  if (lowerResponse.includes('understand') || lowerResponse.includes('hear you')) {
    return 'empathetic';
  } else if (lowerResponse.includes('strength') || lowerResponse.includes('capable')) {
    return 'encouraging';
  } else if (lowerResponse.includes('breathe') || lowerResponse.includes('present')) {
    return 'grounding';
  }
  
  return 'supportive';
};

const generateSuggestedActions = (userMessage: string): string[] => {
  const suggestions = [];
  const lowerMessage = userMessage.toLowerCase();
  
  if (lowerMessage.includes('stress') || lowerMessage.includes('anxious')) {
    suggestions.push('Try a breathing exercise', 'Take a short walk');
  }
  
  if (lowerMessage.includes('sad') || lowerMessage.includes('down')) {
    suggestions.push('Listen to calming music', 'Write in a journal');
  }
  
  if (lowerMessage.includes('overwhelmed')) {
    suggestions.push('Break tasks into smaller steps', 'Practice mindfulness');
  }
  
  return suggestions;
};
