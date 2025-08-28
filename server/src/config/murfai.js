import WebSocket from "ws";

const MURF_WS = "wss://api.murf.ai/v1/speech/stream-input";
const MURF_API_KEY = process.env.MURF_API_KEY || "ap2_c7abc8ae-7d19-4b35-84e3-a39b93a8ca7f";

export function createMurfClient(onAudio) {
  const murfWs = new WebSocket(
    `${MURF_WS}?api-key=${MURF_API_KEY}&sample_rate=44100&channel_type=MONO&format=WAV`
  );

  let readyResolve;
  const readyPromise = new Promise((res) => (readyResolve = res));

  murfWs.on("open", () => {
    console.log("Murf WS connected");

    // send voice config
    const voiceConfigMsg = {
      voice_config: {
        voiceId: "en-US-amara",
        style: "Conversational",
        rate: 0,
        pitch: 0,
        variation: 1,
      },
    };
    murfWs.send(JSON.stringify(voiceConfigMsg));
    readyResolve();
  });

  murfWs.on("message", (msg) => {
    try {
      const data = JSON.parse(msg.toString());
  

      // forward audio chunks
      if (data.audio && onAudio) onAudio(data.audio);
    } catch (e) {
      console.warn("Non-JSON Murf msg:", msg.toString());
    }
  });

  murfWs.on("close", () => {
    console.log("Murf WS closed");
  });

  murfWs.on("error", (err) => {
    console.error("Murf WS error:", err);
  });

  return {
    readyPromise,
    sendText: (text, end = false) => {
      if (murfWs.readyState === WebSocket.OPEN) {
        murfWs.send(JSON.stringify({ text, end }));
      }
    },
    close: () => murfWs.close(),
  };
}
