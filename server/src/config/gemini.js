import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
 


dotenv.config();

class GeminiService {
  constructor() {
    this.ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
    });
  }

    
  async *streamImageDescription(imageBase64) {
    try {
      const response = await this.ai.models.generateContentStream({
        model: "gemini-1.5-flash",
        contents: [
          {
            role: "user",
            parts: [
              {
                text: `You are narrating in the style of Sir David Attenborough. Given an image, identify what is shown and describe it with vivid, cinematic narration.

                If it is a landmark or place: name it, give its history, cultural meaning, and fascinating facts.

                If it is a plant or animal: identify it, describe its traits, behaviors, and role in nature.

                If it is a man-made object or structure: explain its purpose, origin, and importance to human life.

                If it is a person or group of people: do not just say 'Homo sapiens.' Instead, describe them in a documentary style—what they might represent (e.g., a traveler, a worker, a student, a leader), their activity, clothing, culture, or role in society. Make it feel human, personal, and cinematic`,
              },
              {
                inlineData: {
                  data: imageBase64.split(",")[1],
                  mimeType: "image/jpeg",
                },
              },
            ],
          },
        ],
        config: {
          temperature: 0.7,
          maxOutputTokens: 1024,
        },
      });

      for await (const chunk of response) {
        if (chunk.text) {
          console.log("Gemini image chunk:", chunk.text);
          yield chunk.text;
        }
      }
    } catch (error) {
      console.error("Gemini Image API Error:", error);
      throw this.handleApiError(error);
    }
  }

 

 
  handleApiError(error) {
    if (error.status === 400) {
      return new Error("Invalid request to Gemini API. Check your parameters.");
    } else if (error.status === 403) {
      return new Error(
        "API key authentication failed. Check your GEMINI_API_KEY."
      );
    } else if (error.status === 429) {
      return new Error("Rate limit exceeded. Please try again later.");
    } else {
      return new Error(`Gemini API error: ${error.message}`);
    }
  }
}

const geminiService = new GeminiService();
export default geminiService;
