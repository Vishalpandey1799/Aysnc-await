import WebSocket from "ws";
import { createWriteStream } from "fs";

export class MurfTTSClient {
  constructor(
    apiKey,
    sampleRate = 44100,
    channelType = "MONO",
    format = "WAV",
    voiceId = "en-US-alicia"
  ) {
    this.apiKey = apiKey;
    this.sampleRate = sampleRate;
    this.channelType = channelType;
    this.format = format;
    this.ws = null;
    this.voiceId = voiceId;
    this.audioCallback = null;
    this.isFirstChunk = true;
    this.readyPromise = null;
    this.resolveReady = null;
  

    // Create a promise to track when the connection is ready
    this.readyPromise = new Promise((resolve) => {
      this.resolveReady = resolve;
    });
  }

  async connect(audioCallback) {
    this.audioCallback = audioCallback;

    const wsUrl = `wss://api.murf.ai/v1/speech/stream-input?api-key=${this.apiKey}&sample_rate=${this.sampleRate}&channel_type=${this.channelType}&format=${this.format}`;

    this.ws = new WebSocket(wsUrl);

    this.ws.on("open", () => {
      console.log("Connected to Murf AI WebSocket", this.voiceId);
      
      // Send voice configuration
      const voiceConfigMsg = {
        voice_config: {
          voiceId: this.voiceId,
          style: "Conversational",
          rate: 0,
          pitch: 0,
          variation: 1,
        },
      };

      console.log("Sending voice config:", voiceConfigMsg);
      this.ws.send(JSON.stringify(voiceConfigMsg));

      // Resolve the ready promise
      console.log(
        "WebSocket connection is ready from MurfService",
        this.ws.readyState
      );
      this.resolveReady();
    });

    this.ws.on("message", (data) => {
      try {
        const response = JSON.parse(data);

        if (response.audio) {
          const audioBytes = Buffer.from(response.audio, "base64");

          // Skip the first 44 bytes (WAV header) only for the first chunk
          let processedAudio = audioBytes;
          if (this.isFirstChunk && audioBytes.length > 44) {
            const isWavHeader = audioBytes.slice(0, 4).toString() === "RIFF";
            if (isWavHeader) {
              processedAudio = audioBytes.slice(44);
              console.log("Removed WAV header from first chunk");
            }
            this.isFirstChunk = false;
          }

          // Send audio to the callback function
          if (this.audioCallback) {
            this.audioCallback(processedAudio.toString("base64"));
          }
        }

        if (response.final) {
          console.log("Final audio chunk received");
          this.sendText("", true);
        }
      } catch (error) {
        console.error("Error processing Murf response:", error);
      }
    });

    this.ws.on("error", (error) => {
      console.error("WebSocket error:", error);
    });

    this.ws.on("close", () => {
      console.log("WebSocket connection closed");
    });

    return this.readyPromise;
  }

  sendText(text, isEnd = false) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      const textMsg = {
        text: text,
        end: isEnd,
      };

      console.log("Sending text to Murf:", textMsg);
      this.ws.send(JSON.stringify(textMsg));
    } else {
      console.warn("WebSocket is not open. Cannot send text.");
    }
  }

  close() {
    if (this.ws) {
      this.ws.close();
    }
  }
}

// Create and export a Murf client instance
export function initiateMurfClient(audioCallback, voiceId) {
  try {
    const apiKey = process.env.MURF_API_KEY;
    if (!apiKey) {
      throw new Error("MURF_API_KEY environment variable is not set");
    }

    const murfClient = new MurfTTSClient(apiKey, voiceId);
    murfClient.connect(audioCallback);

    return murfClient;
  } catch (error) {
    console.error("Error creating Murf client:", error);
  }
}
