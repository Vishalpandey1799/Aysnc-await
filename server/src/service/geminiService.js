import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import { initiateMurfClient } from "./murfService.js";
import { createMurfClient } from "../config/murfai.js";
dotenv.config();

// Initialize Gemini client
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

// System instruction — enhanced
function buildSystemPrompt(
  languageToLearn,
  nativeLanguage,
  proficiencyLevel,
  name
) {
  return `
You are an expert, friendly, and patient language tutor powered by AI.
Your goal is to teach **${languageToLearn}** to a learner whose native language is **${nativeLanguage}**.
The learner's proficiency level is **${proficiencyLevel}**.

Rules:
1. Always correct grammar, vocabulary, tenses, and sentence structure in the learner’s responses.
   Example:
   - User: "my name gautam"
   - You: "Correct sentence: 'My name is Gautam."

2. Use simple explanations in ${nativeLanguage} when necessary, but encourage replies mostly in ${languageToLearn}.

3. Keep the conversation interactive — always ask follow-up questions to continue the dialogue.

4. Adjust difficulty to the learner’s ${proficiencyLevel}.
   - Beginner → short, simple questions & corrections.
   - Intermediate → more complex sentences, introduce new vocabulary.
   - Advanced → encourage fluency, idioms, and natural conversation.

5. Encourage confidence: praise correct answers and motivate after mistakes.

6. Stay conversational, never dump too much information at once.
7.This is a voice based conversation so dont use emojis.
Now, let’s start teaching ${name} step by step in ${languageToLearn}.
  `;
}

// Murf client
let murfClient = null;
export async function getMurfClient(ws, voiceId) {
  console.log("Getting Murf client...");
  if (!murfClient) {
    murfClient = initiateMurfClient((audioBase64) => {
      if (ws.readyState === 1) {
        ws.send(
          JSON.stringify({ type: "murf-audio-chunk", data: audioBase64 })
        );
      }
    }, voiceId);
    await murfClient.readyPromise;
  }
  return murfClient;
}

let conversationHistory = [];
export async function processWithGemini(
  text,
  languageToLearn = "english",
  nativeLanguage = "Hindi",
  ws = null,
  voiceId = "en-US-alicia",
  proficiencyLevel = "Beginner",
  name = "Gautam"
) {
  if (conversationHistory.length === 0) {
    conversationHistory.push({
      role: "assistant",
      parts: [
        {
          text: buildSystemPrompt(
            languageToLearn,
            nativeLanguage,
            proficiencyLevel,
            name
          ),
        },
      ],
    });
  }
  // Add user message to history
  conversationHistory.push({ role: "user", parts: [{ text }] });

  try {
    const response = await ai.models.generateContentStream({
      model: "gemini-2.0-flash",
      contents: conversationHistory,
      config: {
        systemInstruction: buildSystemPrompt(
          languageToLearn,
          nativeLanguage,
          proficiencyLevel,
          name
        ),
        temperature: 0.8,
        maxOutputTokens: 1024,
      },
    });

    console.log("Murf call start:", voiceId);
    let murfClient = await getMurfClient(ws, voiceId);

    let fullResponse = "";
    let buffer = "";

    for await (const chunk of response) {
      if (chunk.text) {
        buffer += chunk.text;
        fullResponse += chunk.text;

        if (/[.!?]\s*$/.test(buffer)) {
          murfClient.sendText(buffer, false);
          console.log("Sent sentence to Murf:", buffer);
          buffer = "";
        }
      }
    }

    if (buffer.length > 0) {
      console.log("Sending buffer to Murf:", buffer);
      murfClient.sendText(buffer, false);
    }

    if (ws && ws.readyState === 1) {
      ws.send(
        JSON.stringify({
          type: "gemini-chunk",
          data: fullResponse,
        })
      );
    }

    // Save assistant response in history
    conversationHistory.push({
      role: "assistant",
      parts: [{ text: fullResponse }],
    });

    return fullResponse;
  } catch (error) {
    console.error("Gemini API Error:", error);

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

// Test
async function testGemini() {
  try {
    const response = await processWithGemini("Hello, I want to learn English");
    console.log("Test successful:", response);
  } catch (error) {
    console.error("Test failed:", error.message);
  }
}

// testGemini();
