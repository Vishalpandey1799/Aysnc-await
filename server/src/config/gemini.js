import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
 


dotenv.config();

class GeminiService {
  constructor() {
    this.ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY || "AIzaSyDNU2pHSMILB8vgNdukaS0YKCfmXiA9gVc",
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
                text: "Describe this image if it's place name it if a plant name it if you think you know the name ... in the style of a David Attenborough nature documentary.",
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
