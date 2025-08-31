import WebSocket from "ws";
import geminiService from "./gemini.js";
import { createMurfClient } from "./murfai.js";
import { STTClient } from "./stt.js";
import { processWithGemini } from "../service/geminiService.js";

export function handleWsConnection(clientWs) {
  console.log("Client connected via WS");

  let activeMurfClients = {};
  let sttClient = null;
  let debate = null;

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
      } else if (data.type === "debate" || data.type === "session-config") {
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
          } catch(e) {
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