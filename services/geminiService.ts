
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { Message, Role } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export class GeminiService {
  private static model = 'gemini-3-flash-preview';

  static async *streamChat(history: Message[], userInput: string, userImage?: string) {
    // Format history for Gemini
    const contents = history.map(msg => ({
      role: msg.role === Role.ASSISTANT ? 'model' : 'user',
      parts: [{ text: msg.content }]
    }));

    // Add current user input
    const currentParts: any[] = [{ text: userInput }];
    if (userImage) {
      currentParts.push({
        inlineData: {
          mimeType: 'image/png', // Simplified for demo
          data: userImage.split(',')[1],
        },
      });
    }

    contents.push({
      role: 'user',
      parts: currentParts
    });

    try {
      const responseStream = await ai.models.generateContentStream({
        model: this.model,
        contents: contents,
        config: {
          systemInstruction: "You are Lumina, a premium AI assistant. Your responses are helpful, sophisticated, and insightful. Use markdown for clear structure and code blocks where necessary.",
          temperature: 0.8,
        }
      });

      for await (const chunk of responseStream) {
        const text = chunk.text;
        if (text) {
          yield text;
        }
      }
    } catch (error) {
      console.error("Gemini API Error:", error);
      yield "I'm sorry, I encountered a connection issue with my neural networks. Please try again in a moment.";
    }
  }
}
