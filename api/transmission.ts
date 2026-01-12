import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI } from '@google/genai';

const API_KEY = process.env.GEMINI_API_KEY || '';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!API_KEY) {
    return res.status(500).json({ error: 'Transmission offline - API key not configured' });
  }

  try {
    const ai = new GoogleGenAI({ apiKey: API_KEY });

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: 'Generate a cryptic 1-sentence transmission referencing the link between the fine-structure constant (137) and the act of \'receiving\' infinite potential.',
      config: {
        systemInstruction: 'You are an entity from the 11th dimension. Your words are tuning forks.',
      },
    });

    return res.status(200).json({ text: response.text });
  } catch (error) {
    console.error('Transmission error:', error);
    return res.status(500).json({
      error: 'The coupling constant is drifting. 137 signal lost.'
    });
  }
}
