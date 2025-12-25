import { GoogleGenAI, Type, Schema } from "@google/genai";
import { TweetData } from "../types";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

const FEED_SCHEMA: Schema = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      id: { type: Type.STRING },
      authorName: { type: Type.STRING },
      authorHandle: { type: Type.STRING },
      content: { type: Type.STRING },
      timestamp: { type: Type.STRING, description: "Relative time string like '2h', '15m', '1d'" },
      likes: { type: Type.INTEGER },
      retweets: { type: Type.INTEGER },
      replies: { type: Type.INTEGER },
      views: { type: Type.INTEGER, description: "Total impressions/views (should be significantly higher than likes, e.g. 1000-50000)" },
      reach: { type: Type.INTEGER, description: "Unique accounts reached (slightly lower than views)" },
      isVerified: { type: Type.BOOLEAN },
    },
    required: ["id", "authorName", "authorHandle", "content", "timestamp", "likes", "retweets", "replies", "views"],
  },
};

export const generateFeed = async (topic?: string): Promise<TweetData[]> => {
  if (!apiKey) {
    console.warn("No API Key provided. Returning empty feed.");
    return [];
  }

  try {
    const prompt = topic 
      ? `Generate 5 engaging social media posts specifically about "${topic}". 
         Make them feel authentic, varied in tone (some serious, some casual), and written by real humans.
         Ensure the handles look realistic.
         Generate realistic view counts (impressions) and reach stats.`
      : `Generate 5 diverse and engaging social media posts. 
         Mix topics like technology, coding humor, ai news, coffee culture, and motivation. 
         Make them feel authentic and written by real humans.
         Ensure the handles look realistic (e.g., @coder_life, @tech_guru).
         Generate realistic view counts (impressions) that are proportionate to likes (usually 20x-100x likes).`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: FEED_SCHEMA,
      },
    });

    const text = response.text;
    if (!text) return [];
    
    const data = JSON.parse(text) as TweetData[];
    
    // Add avatar URLs since Gemini doesn't generate actual image links reliably
    return data.map((tweet, index) => ({
      ...tweet,
      // Ensure fallbacks if AI misses a field
      views: tweet.views || tweet.likes * 50 || 1000,
      reach: tweet.reach || Math.floor((tweet.views || 1000) * 0.8),
      avatarUrl: `https://picsum.photos/seed/${tweet.authorHandle}/200/200`
    }));

  } catch (error) {
    console.error("Error generating feed:", error);
    return [];
  }
};

export const refineTweetText = async (currentText: string, tone: 'funny' | 'professional' | 'viral'): Promise<string> => {
  if (!apiKey) return currentText;

  try {
    const prompt = `Rewrite the following social media post to be more ${tone}, engaging, and concise. Keep hashtags if relevant. Text: "${currentText}"`;
    
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });

    return response.text?.trim() || currentText;
  } catch (error) {
    console.error("Error refining tweet:", error);
    return currentText;
  }
};