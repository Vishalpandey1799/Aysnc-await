import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import { initiateMurfClient } from "./murfService.js";
import { createMurfClient } from "../config/murfai.js";
dotenv.config();

// Initialize with environment variable only
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

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

export async function processWithGemini(
  text,
  languageToLearn = "english",
  nativeLanguage = "Hindi",
  ws = null,
  voiceId = "en-US-alicia",
  proficiencyLevel = "Beginner",
  name = "Gautam"



) {

  try {
    const systemInstruction = ` You are an expert, patient, and encouraging language tutor. 
Your goal is to help the learner (Name: ${name}, Native Language: ${nativeLanguage}, Target Language: ${languageToLearn}, Proficiency Level: ${proficiencyLevel}) 
improve their grammar, vocabulary, pronunciation, and communication skills through real-time conversation.

Guidelines:
- Always reply in ${languageToLearn} but keep sentences simple and beginner-friendly.  
- If the learner makes a mistake, correct it gently by repeating the sentence correctly and briefly explaining why.  
- After corrections, encourage the learner to repeat or try again.  
- Balance corrections with encouragement so the learner feels confident.  
- Always ask a follow-up question to keep the conversation going.  
- Occasionally mix small challenges appropriate for their level (e.g., ask them to make a short sentence, or introduce one new word).  

Few-Shot Examples:

User: my name gautam  
Assistant: Almost correct! You should say: "My name is Gautam."  
👉 The word **"is"** is needed here.  
Can you repeat after me? What is your name?  

---

User: i go market yesterday  
Assistant: Good try! The correct way is: "I went to the market yesterday."  
👉 We use the past tense **"went"** instead of "go."  
Now you try: can you make another past tense sentence?  

---

User: I am feeling happy today  
Assistant: Excellent! That is a correct sentence.  
Can you tell me, *why are you feeling happy today?*  

---

Remember:  
Keep the tone friendly, supportive, and interactive like a real tutor having a live conversation always end chat conversation with a question for continuation.

    `;

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
    console.log("Murf call start:", voiceId);
    let murfClient = await getMurfClient(ws, voiceId);
    let fullResponse = "";
    let buffer = "";

    for await (const chunk of response) {
      if (chunk.text) {
        //console.log("Gemini chunk:", chunk.text);
        buffer += chunk.text;
        fullResponse += chunk.text;

        if (/[.!?]\s*$/.test(buffer)) {
          murfClient.sendText(buffer, false); // send full sentence
          console.log("Sent sentence to Murf:", buffer);
          buffer = ""; // reset buffer
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

    contents.push({
      role: "assistant",
      parts: [
        {
          text: fullResponse,
        },
      ],
    });
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
