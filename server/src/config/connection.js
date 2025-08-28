import WebSocket from "ws";
import geminiService from "./gemini.js";
import { createMurfClient } from "./murfai.js";
import { STTClient } from "./stt.js";
import { processWithGemini } from "../service/geminiService.js";

export function handleWsConnection(clientWs) {
  console.log("Client connected via WS");

  let murf = null;
  let sttClient = null;
  let debate = null;

  clientWs.on("message", async (msg) => {
    try {
      const data = JSON.parse(msg.toString());
       

      if (data.type === "image") {
        const imageBase64 = data.data;

        // Open Murf connection
        murf = createMurfClient((audioBase64) => {
          if (clientWs.readyState === WebSocket.OPEN) {
            clientWs.send(
              JSON.stringify({ type: "audio-chunk", data: audioBase64 })
            );
          }
        });

        await murf.readyPromise;

        // console.log("Streaming Gemini chunks to Murf...");

        try {
          for await (const textChunk of geminiService.streamImageDescription(imageBase64)) {
            murf.sendText(textChunk, false);
          }
          murf.sendText("", true); // signal end of stream
        } catch (e) {
          console.error("Error streaming Gemini chunks:", e);
        }
        // todo debate 
      } else if (data.type === "debate") {
  debate = new STTClient(async (finalTranscript) => {
    console.log("Final Transcript:", finalTranscript);

    try {
      //streams text + Murf audio + ws events
      await geminiService.processTranscription(finalTranscript, {}, clientWs);
    } catch (e) {
      console.error("Error handling debate response:", e);
    }
  });
}

          
       else if (data.type === "session-config") {
        console.log("Session config received");
        sttClient = new STTClient( async (finalTranscript) => {
          console.log("Final Transcript:", finalTranscript);
          //call gemini with finalTranscript
           await processWithGemini(finalTranscript, "hindi", "english", clientWs);
          
        });
        // if (clientWs.readyState === WebSocket.OPEN) {
        //   clientWs.send(
        //     JSON.stringify({
        //       type: "final-transcript",
        //       transcript: finalTranscript,
        //     })
        //   );
        // }

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
      } else if(data.type === "debate-chunk"){

           if (debate && debate.getStream()) {
          try {
            const audioBuffer = Buffer.from(data.data, "base64");
            debate.getStream().write(audioBuffer);
          } catch (error) {
            console.error("Error writing to recognition stream:", error);
          }
      }
    }
       
       else {
        console.log("Unknown message type:", data.type);
      }
    } catch (err) {
      console.error("WS error:", err);
      if (clientWs.readyState === WebSocket.OPEN) {
        clientWs.send(
          JSON.stringify({
            type: "error",
            message: "Server error",
            error: err.message,
          })
        );
      }
    }
  });

  clientWs.on("close", () => {
    console.log("Client closed");
    if (murf) murf.close();
    if (sttClient) {
      sttClient.close();
      console.log("Speech-to-Text client closed");
    }

    if(debate){
      debate.close();
      console.log("Debate STT client closed");
    }
  });
}


