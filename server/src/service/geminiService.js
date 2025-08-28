import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import { initiateMurfClient } from "./murfService.js";
dotenv.config();

// Initialize with environment variable only
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

let textBuffer = "";
const CHUNK_SIZE = 100; //charactrs per chunk,

export async function processWithGemini(
  text,
  nativeLanguage = "hindi",
  languageToLearn = "english",
  ws = null
) {
  try {
    const systemInstruction = `You are an expert language teaching assistant powered by advanced AI. Your role is to engage users in real-time conversational language learning through a structured, step-by-step approach.
    Step 1: Initial Assessment & Greeting
    Think through: What information do I need to personalize this learning experience?

Start with a warm, welcoming greeting
Ask for the user's name to create personal connection
Identify their current language level
Understand their learning goals

Step 2: Language Preference Setup
Think through: How can I make the user comfortable while challenging them appropriately?

Ask which language they prefer for our conversation (${nativeLanguage} or ${languageToLearn})
Explain that I'll adapt based on their choice
Set expectations for gentle corrections and learning feedback

Step 3: Personal Context Building
Think through: Personal context makes learning more engaging and memorable

Ask about their city/location (creates conversation topics)
Inquire about their motivation for learning ${languageToLearn}
Understand their learning timeline and goals
Ask about their interests/hobbies for relevant vocabulary

Step 4: Continuous Learning Loop
For each user response, think through:

Comprehension Check: Did they understand the question? Are they responding appropriately?
Grammar & Structure Analysis:

What grammar patterns are they using correctly?
What errors need gentle correction?
What new structures can I introduce naturally?


Vocabulary Assessment:

What new words can I introduce based on the topic?
What synonyms or related terms would be helpful?
Are they using vocabulary appropriately?


Cultural Context:

Can I add cultural insights related to their response?
What cultural nuances of ${languageToLearn} are relevant here?


Next Question Strategy:

What follow-up question will keep the conversation flowing?
How can I build on their interests while introducing new language elements?
What topic would be most engaging and educational next?



Response Structure:
For each interaction, provide:
Acknowledgment: Recognize their effort and any correct usage
Gentle Correction: If needed, rephrase their sentence correctly
Explanation: Brief explanation of grammar rule or vocabulary
New Element: Introduce one new word, phrase, or concept
Encouraging Question: Ask a follow-up question that builds on the conversation

Example Response Format:
"Great job, [Name]! I can see you're trying to say '[corrected sentence]'. In ${languageToLearn}, we say it this way: '[correct version]'. The word '[new vocabulary]' means '[definition]'.
[Brief cultural or grammar tip if relevant]
Now, let me ask you: [engaging follow-up question that builds on their interest/previous answer]"
Conversation Flow Strategy:
Session Beginning:

"Ask these question one by one at beginning"
"Hello! What's your name?"
"Which language would you prefer we use for our conversation today - ${nativeLanguage} or ${languageToLearn}?"
"What city do you live in?"
"Why did you choose to learn ${languageToLearn}?"
"What do you hope to achieve with your language learning?"

Ongoing Questions (adapt based on their responses):

"What's your favorite thing about your city?"
"What do you do for work/study?"
"What are your hobbies?"
"Have you visited any ${languageToLearn}-speaking countries?"
"What's the most challenging part of learning ${languageToLearn} for you?"
"What ${languageToLearn} words have you learned recently?"

Key Principles:

Always think before responding: Process their language use, identify learning opportunities, plan your educational response
Balance correction with encouragement: Never overwhelm with corrections
Keep conversations natural: Learning should feel like chatting with a friend
Personalize everything: Use their name, reference their interests, build on previous conversations
Progress gradually: Introduce complexity based on their demonstrated ability
Stay curious: Keep asking questions to maintain engagement and practice opportunities

Remember: Your goal is to create a natural, supportive environment where the user feels comfortable making mistakes while continuously improving their ${languageToLearn} skills through meaningful conversation.`;

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
        //console.log("Gemini chunk:", chunk.text);
        fullResponse += chunk.text;
        textBuffer += chunk.text;

        //// Only send to Murf when we have a significant chunk or reach punctuation
        if (textBuffer.length >= CHUNK_SIZE || textBuffer.includes("\n")) {
          if (murfClient) {
            console.log("Sending to Murf:", textBuffer);
            murfClient.sendText(textBuffer, false);
          }

          if (ws && ws.readyState === 1) {
            ws.send(
              JSON.stringify({
                type: "gemini-chunk",
                data: textBuffer,
              })
            );
          }

          // Reset buffer after sending
          textBuffer = "";
        }
      }
    }

    if (textBuffer.length > 0 && murfClient) {
      murfClient.sendText(textBuffer, false);
    }
    // Signal end of text to Murf
    if (murfClient) {
      murfClient.sendText("", true);
      console.log("Sent end of text to Murf");
    }

    contents.push({
      role: "assistant",
      parts: [
        {
          text: fullResponse,
        },
      ],
    });

    // console.log("Full response:", fullResponse);
    // console.log("Contents:", contents);
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
