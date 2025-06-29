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
