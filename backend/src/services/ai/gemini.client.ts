import { GoogleGenAI } from '@google/genai';
import { ENV } from '../../config/env';

class GeminiClient {
  private ai: GoogleGenAI | null = null;
  private primaryModel: string = 'gemini-2.0-flash';

  constructor() {
    const apiKey = ENV?.GEMINI_API_KEY || process.env.GEMINI_API_KEY;
    if (apiKey) {
      try {
        this.ai = new GoogleGenAI({ apiKey });
        console.log('✅ Google Gemini AI Client initialized with model:', this.primaryModel);
      } catch (e) {
        console.warn('⚠️ Gemini Client initialization failed:', e);
      }
    } else {
      console.warn('⚠️ GEMINI_API_KEY not set. Using smart AI heuristic fallbacks.');
    }
  }

  async generateText(prompt: string, systemInstruction?: string): Promise<string | null> {
    const apiKey = ENV?.GEMINI_API_KEY || process.env.GEMINI_API_KEY;
    if (!this.ai || !apiKey) return null;

    const modelsToTry = ['gemini-2.0-flash', 'gemini-2.0-flash-lite'];

    for (const modelName of modelsToTry) {
      try {
        const response = await this.ai.models.generateContent({
          model: modelName,
          contents: prompt,
          config: systemInstruction ? { systemInstruction } : undefined,
        });

        if (response && response.text) {
          return response.text;
        }
      } catch (error: any) {
        console.warn(`Gemini API call failed for ${modelName}, trying fallback model:`, error?.message || error);
      }
    }

    return null;
  }
}

export const geminiClient = new GeminiClient();
