import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import { initiateMurfClient } from "./murfService.js";
dotenv.config();

// Initialize with environment variable only
const ai = new GoogleGenAI({
  apiKey:
    process.env.GEMINI_API_KEY,
});

// Enhanced function with proper error handling
export async function processWithGemini(
  text,
  nativeLanguage = "hindi",
  languageToLearn = "english",
  ws = null
) {
  try {
    const systemInstruction = `You are a friendly language teaching assistant. 
      The user is learning ${languageToLearn} and their native language is ${nativeLanguage}.
      Respond in a helpful, encouraging manner. 
      First, ask the user whether they want to converse in ${nativeLanguage} or ${languageToLearn}.
      Adapt your responses based on their choice.
      Provide gentle corrections and explanations when needed.
      Keep responses conversational and appropriate for language learning.`;

    // Properly format the contents array
    const contents = [
      {
        role: "user",
        parts: [
          {
            text: text,
          },
        ],
      },
    ];

    const response = await ai.models.generateContentStream({
      model: "gemini-2.0-flash",
      contents: contents,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.8,
        maxOutputTokens: 1024,
        thinkingConfig: {
          thinkingBudget: 0,
        },
      },
    });

    let fullResponse = "";

    // Create Murf client if WebSocket is provided
    let murfClient = null;
    if (ws) {
      murfClient = initiateMurfClient((audioBase64) => {
        if (ws.readyState === 1) {
          ws.send(
            JSON.stringify({
              type: "murf-audio-chunk",
              data: audioBase64,
            })
          );
        }
      });

      // Wait for Murf client to be ready
      await murfClient.readyPromise;
    }

    for await (const chunk of response) {
      if (chunk.text) {
        console.log("Gemini chunk:", chunk.text);
        fullResponse += chunk.text;

        if (murfClient) {
          murfClient.sendText(chunk.text, false);
        }

        if (ws && ws.readyState === 1) {
          ws.send(
            JSON.stringify({
              type: "gemini-chunk",
              data: chunk.text,
            })
          );
        }
      }
    }

    // Signal end of text to Murf
    if (murfClient) {
      murfClient.sendText("", true);
      // Close Murf connection after a short delay
      setTimeout(() => {
        murfClient.close();
      }, 1000);
    }

    contents.push({
      role: "assistant",
      parts: [
        {
          text: fullResponse,
        },
      ],
    });

    console.log("Full response:", fullResponse);
    console.log("Contents:", contents);
    return fullResponse;
  } catch (error) {
    console.error("Gemini API Error:", error);

    // Handle specific API errors :cite[2]
    if (error.status === 400) {
      throw new Error("Invalid request to Gemini API. Check your parameters.");
    } else if (error.status === 403) {
      throw new Error(
        "API key authentication failed. Check your GEMINI_API_KEY."
      );
    } else if (error.status === 429) {
      throw new Error("Rate limit exceeded. Please try again later.");
    } else {
      throw new Error(`Gemini API error: ${error.message}`);
    }
  }
}

// Test function with error handling
async function testGemini() {
  try {
    const response = await processWithGemini("Hello, I want to learn English");
    console.log("Test successful:", response);
  } catch (error) {
    console.error("Test failed:", error.message);
  }
}

// testGemini();
