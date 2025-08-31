import WebSocket from "ws";

const MURF_WS = "wss://api.murf.ai/v1/speech/stream-input";
 
const MURF_API_KEY = process.env.MURF_API_KEY || "ap2_c1c1c091-7147-46a4-94ae-07a16161f5f4";

export function createMurfClient(onAudio, contextId) {
  const murfWs = new WebSocket(
    `${MURF_WS}?api-key=${MURF_API_KEY}&sample_rate=44100&channel_type=MONO&format=WAV`
  );

  let readyResolve;
  const readyPromise = new Promise((res) => (readyResolve = res));

  murfWs.on("open", () => {
    console.log(`Murf WS connected for contextId: ${contextId}`);
    const voiceConfigMsg = {
      contextId: contextId,
      voice_config: {
        voiceId: "en-US-amara",
        style: "Conversational",
      },
    };
    murfWs.send(JSON.stringify(voiceConfigMsg));
    console.log("Murf voice config sent");
    readyResolve();
  });

  murfWs.on("message", (msg) => {
    try {
      const data = JSON.parse(msg.toString());
      
      // console.log(`Murf message for contextId: ${contextId}:`, data.audio.slice(0, 30) + "...");
      if (data.audio && onAudio) onAudio(data.audio);
    } catch (e) {
      console.warn("Non-JSON Murf msg:", msg.toString());
    }
  });

  murfWs.on("close", (code, reason) => {
    console.log(`Murf WS closed for contextId: ${contextId}. Code: ${code} , Reason: ${reason}`);
  });

  murfWs.on("error", (err) => {
    console.error(`Murf WS error for contextId: ${contextId}:`, err);
  });

  return {
    readyPromise,
    sendText: (text, end = false) => {
      if (murfWs.readyState === WebSocket.OPEN) {
        murfWs.send(JSON.stringify({ text, end, contextId }));
      }
    },
    
    clear: () => {
      if (murfWs.readyState === WebSocket.OPEN) {
        console.log(`Sending CLEAR signal for contextId: ${contextId}`);
        murfWs.send(JSON.stringify({ action: "clear", contextId: contextId }));
      }
    },
    close: () => {
        // Ensure we don't try to close a connection that's already closing or closed.
        if (murfWs.readyState === WebSocket.OPEN || murfWs.readyState === WebSocket.CONNECTING) {
            murfWs.close();
        }
    }
  };
}
