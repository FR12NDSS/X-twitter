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
      hashtags: { type: Type.ARRAY, items: { type: Type.STRING }, description: "List of relevant hashtags for the post" },
    },
    required: ["id", "authorName", "authorHandle", "content", "timestamp", "likes", "retweets", "replies", "views"],
  },
};

// Mock image collections for demo purposes
const MOCK_IMAGE_SETS = [
    // 3 Images (Golden Heart style)
    [
        'https://picsum.photos/seed/gold1/600/600',
        'https://picsum.photos/seed/gold2/400/400',
        'https://picsum.photos/seed/gold3/400/400'
    ],
    // 1 Large Image (Ad style)
    ['https://picsum.photos/seed/ad/800/400'],
    // No images
    [],
    // 2 Images
    ['https://picsum.photos/seed/two1/600/400', 'https://picsum.photos/seed/two2/600/400'],
    // 4 Images
    [
        'https://picsum.photos/seed/four1/400/400', 
        'https://picsum.photos/seed/four2/400/400',
        'https://picsum.photos/seed/four3/400/400',
        'https://picsum.photos/seed/four4/400/400'
    ],
    [],
    []
];

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
         Generate realistic view counts (impressions) and reach stats.
         Include relevant hashtags.`
      : `Generate 5 diverse and engaging social media posts. 
         Mix topics like technology, coding humor, ai news, coffee culture, and motivation. 
         Make them feel authentic and written by real humans.
         Ensure the handles look realistic (e.g., @coder_life, @tech_guru).
         Generate realistic view counts (impressions) that are proportionate to likes (usually 20x-100x likes).
         Include relevant hashtags.`;

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
    
    // Enrich with avatars and images
    return data.map((tweet, index) => ({
      ...tweet,
      // Ensure fallbacks if AI misses a field
      views: tweet.views || tweet.likes * 50 || 1000,
      reach: tweet.reach || Math.floor((tweet.views || 1000) * 0.8),
      avatarUrl: `https://picsum.photos/seed/${tweet.authorHandle}/200/200`,
      // Assign mock images based on index to simulate variety
      images: MOCK_IMAGE_SETS[index % MOCK_IMAGE_SETS.length]
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