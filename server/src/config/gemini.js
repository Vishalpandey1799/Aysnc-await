import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import { createMurfClient } from "./murfai.js";


dotenv.config();

class GeminiService {
  constructor() {
    this.ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY || "AIzaSyCRzvZxl8G8RE0jGpSMZr91pH3YYUQB89g",
    });
  }

   
  async *streamImageDescription(imageBase64) {
    try {
      const response = await this.ai.models.generateContentStream({
        model: "gemini-2.0-flash-exp",
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

 
 // 
async processTranscription(text, options = {}, ws = null) {
  try {
    const {
      context = "general",
      style = "friendly",
      maxTokens = 512,
      temperature = 0.7,
    } = options;

    const systemInstruction = `You are a helpful assistant processing transcribed text. 
      The user has provided text that was transcribed from speech. 
      Respond in a ${style} manner and provide helpful insights about the content.
      Keep your response concise and relevant to the context: ${context}.`;

    const stream = await this.ai.models.generateContentStream({
      model: "gemini-2.0-flash",
      contents: [
        { role: "user", parts: [{ text }] },
      ],
      config: { systemInstruction, temperature, maxOutputTokens: maxTokens },
    });

    let fullText = "";

    // --- Murf integration ---
    let murfClient = null;
    if (ws) {
      murfClient = createMurfClient((audioBase64) => {
        if (ws.readyState === 1) {
          ws.send(JSON.stringify({ type: "audio-chunk", data: audioBase64 }));
        }
      });
      await murfClient.readyPromise;
    }

    for await (const chunk of stream) {
      const chunkText = chunk?.candidates?.[0]?.content?.parts?.[0]?.text || "";
      if (chunkText) {
        fullText += chunkText;
        process.stdout.write(chunkText);

        if (murfClient) murfClient.sendText(chunkText, false);
        if (ws && ws.readyState === 1) {
          ws.send(JSON.stringify({ type: "gemini-chunk", data: chunkText }));
        }
      }
    }

    if (murfClient) {
      murfClient.sendText("", true);
      setTimeout(() => murfClient.close(), 1000);
    }

    console.log("\nGemini Transcription (final):", fullText);
    return fullText;
  } catch (error) {
    console.error("Gemini Transcription API Error:", error);
    throw this.handleApiError(error);
  }
}



  // Error handling utility
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

// Create and export a singleton instance
const geminiService = new GeminiService();
export default geminiService;