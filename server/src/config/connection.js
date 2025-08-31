import WebSocket from "ws";
import geminiService from "./gemini.js";
import { createMurfClient } from "./murfai.js";
import { STTClient } from "./stt.js";
import { getMurfClient, processWithGemini } from "../service/geminiService.js";

export function handleWsConnection(clientWs) {
  console.log("Client connected via WS");

  let activeMurfClients = {};
  let sttClient = null;
  let debate = null;
  let initialGreetingSent = false; //flag to track if initial greeting has been sent

  async function sendInitialResponse() {
    console.log("Getting Murf client...");
    let murfClient = null;
    murfClient = await getMurfClient(clientWs, "en-US-alicia");
    if (murfClient) {
      murfClient.sendText(
        `Hello, I am your language tutor. Let's start learning and wish you a great day!`,
        true
      );
    }
    console.log("called murf initial prompt");
  }

  clientWs.on("message", async (msg) => {
    try {
      const data = JSON.parse(msg.toString());

      if (data.type === "interrupt") {
        const { contextIdToStop } = data;
        console.log(`Received INTERRUPT request for contextId: ${contextIdToStop}`);

        const murfToStop = activeMurfClients[contextIdToStop];
        if (murfToStop) {
          murfToStop.clear();
          setTimeout(() => murfToStop.close(), 100);
          delete activeMurfClients[contextIdToStop];
          console.log(`Cleanup complete for ${contextIdToStop}.`);
        }

        // Send acknowledgment back to the client so it knows it's safe to proceed.
        if (clientWs.readyState === WebSocket.OPEN) {
          clientWs.send(JSON.stringify({
            type: "interrupted-ack",
            stoppedContextId: contextIdToStop
          }));
        }
        return;
      }

      if (data.type === "image") {
        const imageBase64 = data.data;
        const contextId = crypto.randomUUID();

        const murf = createMurfClient((audioBase64) => {
          if (activeMurfClients[contextId] && clientWs.readyState === WebSocket.OPEN) {
            clientWs.send(JSON.stringify({ type: "audio-chunk", data: audioBase64, contextId }));
          }
        }, contextId);

        activeMurfClients[contextId] = murf;
        await murf.readyPromise;

        try {
          for await (const textChunk of geminiService.streamImageDescription(imageBase64)) {
            if (!activeMurfClients[contextId]) break;
            murf.sendText(textChunk, false);

            if (clientWs.readyState === WebSocket.OPEN) {
              clientWs.send(JSON.stringify({ type: "text-chunk", data: textChunk, contextId }));
            }
          }

          if (activeMurfClients[contextId]) murf.sendText("", true);
        } catch (e) {
          console.error("Error streaming Gemini for image:", e);
        }
        // was working on this audio feature so anyone can ask question related to the image but i messed up something and now it is not working i will make it work later it gonna be something unique
      } else if (data.type === "debate") {
        const sttHandler = async (finalTranscript) => {
          const contextId = crypto.randomUUID();

          const murfClient = createMurfClient((audioBase64) => {
            if (activeMurfClients[contextId] && clientWs.readyState === WebSocket.OPEN) {
              clientWs.send(JSON.stringify({ type: "audio-chunk", data: audioBase64, contextId }));
            }
          }, contextId);

          activeMurfClients[contextId] = murfClient;
          await murfClient.readyPromise;

          try {
            if (data.type === "debate") {
              await geminiService.processTranscription(finalTranscript, {}, clientWs, contextId, murfClient);
            } else {
              await processWithGemini(finalTranscript, "hindi", "english", clientWs, contextId, murfClient);
            }
          } catch (e) {
            console.error("Error in Gemini processing after STT:", e);
            if (activeMurfClients[contextId]) {
              delete activeMurfClients[contextId];
              murfClient.close();
            }
          }
        };

        if (data.type === "debate") debate = new STTClient(sttHandler);
        else sttClient = new STTClient(sttHandler);

        if (clientWs.readyState === WebSocket.OPEN) {
          clientWs.send(JSON.stringify({ type: "session-ready", message: "Speech recognition ready" }));
        }

      } else if (data.type === "audio-chunk" || data.type === "debate-chunk") {
        const targetStt = data.type === "audio-chunk" ? sttClient : debate;
        if (targetStt?.getStream()) {
          const audioBuffer = Buffer.from(data.data, "base64");
          targetStt.getStream().write(audioBuffer);
        }
      } else if (data.type === "initial-greeting") {
        if (!initialGreetingSent) {
          // sendInitialResponse();
          initialGreetingSent = true; // Set flag to true after sending
        }
      } else if (data.type === "debate") {
        debate = new STTClient(async (finalTranscript) => {
          console.log("Final Transcript:", finalTranscript);

          try {
            //streams text + Murf audio + ws events
            await geminiService.processTranscription(
              finalTranscript,
              {},
              clientWs
            );
          } catch (e) {
            console.error("Error handling debate response:", e);
          }
        });
      } else if (data.type === "session-config") {
        console.log("Session config received", data.data);
        sttClient = new STTClient(async (finalTranscript) => {
          console.log("Final Transcript:", finalTranscript);

          if (clientWs.readyState === WebSocket.OPEN) {
            clientWs.send(
              JSON.stringify({
                type: "final-transcript",
                transcript: finalTranscript,
              })
            );
          }
          //call gemini with finalTranscript
          console.log("Calling gemini...");
          await processWithGemini(
            finalTranscript,
            data.data.targetLanguage,
            data.data.nativeLanguage,
            clientWs,
            data.data.voiceId,
            data.data.proficiencyLevel,
            data.data.name
          );
          console.log("gemini called");
        }, data.data.languageCode);

        if (clientWs.readyState === WebSocket.OPEN) {
          clientWs.send(
            JSON.stringify({
              type: "session-ready",
              message: "Speech recognition ready",
            })
          );
        }
      } else if (data.type === "audio-chunk") {
        // Handle audio data from client
        //console.log("recognizeStream:", recognizeStream);
        // console.log("Audio chunk received, size:", data.data.length);
        if (sttClient && sttClient.getStream()) {
          try {
            // Convert base64 audio data to buffer
            const audioBuffer = Buffer.from(data.data, "base64");
            sttClient.getStream().write(audioBuffer);
          } catch (error) {
            console.error("Error writing to recognition stream:", error);
          }
        } else {
          console.warn("Recognition stream not initialized");
          if (clientWs.readyState === WebSocket.OPEN) {
            clientWs.send(
              JSON.stringify({
                type: "error",
                message:
                  "Speech recognition not initialized. Send session-config first.",
              })
            );
          }
        }
      } else if (data.type === "debate-chunk") {
        if (debate && debate.getStream()) {
          try {
            const audioBuffer = Buffer.from(data.data, "base64");
            debate.getStream().write(audioBuffer);
          } catch (error) {
            console.error("Error writing to recognition stream:", error);
          }
        }
      } else {
        console.log("Unknown message type:", data.type);
      }
    } catch (err) {
      console.error("WS message processing error:", err);
    }
  });

  clientWs.on("close", () => {
    console.log("Client disconnected. Cleaning up all resources.");
    Object.values(activeMurfClients).forEach(client => client.close());
    activeMurfClients = {};
    if (sttClient) sttClient.close();
    if (debate) debate.close();
  });
}
