import WebSocket from "ws";
import { streamImageDescription } from "./gemini.js";
import { createMurfClient } from "./murfai.js";

export function handleWsConnection(clientWs) {
  console.log("Client connected via WS");

  let murf = null;

  clientWs.on("message", async (msg) => {
    try {
      const data = JSON.parse(msg.toString());

      if (data.type === "image") {
        const imageBase64 = data.data;

        //  Open Murf connection
        murf = createMurfClient((audioBase64) => {
          if (clientWs.readyState === WebSocket.OPEN) {
            clientWs.send(JSON.stringify({ type: "audio-chunk", data: audioBase64 }));
          }
        });

      
        await murf.readyPromise;

        console.log("Streaming Gemini chunks to Murf...");

        try {
          for await (const textChunk of streamImageDescription(imageBase64)) {
            murf.sendText(textChunk, false);
          }
          murf.sendText("", true); // signal end of stream
        } catch (e) {
          console.error("Error streaming Gemini chunks:", e);
        }
      }
    } catch (err) {
      console.error("WS error:", err);
      if (clientWs.readyState === WebSocket.OPEN) {
        clientWs.send(JSON.stringify({ type: "error", message: "Server error" }));
      }
    }
  });

  clientWs.on("close", () => {
    console.log("Client closed");
    if (murf) murf.close();
  });
}
