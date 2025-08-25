// import fs from "fs";
// import axios from "axios";
 

// async function saveAudioStreamToFile(text) {
//   const apiUrl = "https://api.murf.ai/v1/speech/stream";
//   const apiKey = "ap2_c7abc8ae-7d19-4b35-84e3-a39b93a8ca7f";

//   const requestBody = {
//     text: text,
//     voiceId: "en-US-ken",
//   };

//   try {
//     const response = await axios.post(apiUrl, requestBody, {
//       headers: {
//         "Content-Type": "application/json",
//         "api-key": apiKey,
//       },
//       responseType: "stream",
//     });

//     const outputFilePath = "./output.wav";
//     const writer = fs.createWriteStream(outputFilePath);

//     response.data.pipe(writer);

//     writer.on("finish", () => {
//       console.log(`Audio saved to ${outputFilePath}`);
//     });

//     writer.on("error", (err) => {
//       console.error("Error writing to file:", err);
//     });
//   } catch (error) {
//     console.error("Error:", error.message);
//   }
// }

// export default saveAudioStreamToFile;



import WebSocket from "ws";
 import { Buffer } from "buffer";

const API_KEY = "ap2_c7abc8ae-7d19-4b35-84e3-a39b93a8ca7f"; 
const WS_URL = "wss://api.murf.ai/v1/speech/stream-input";
 

// Audio format settings
const SAMPLE_RATE = 44100;
const CHANNELS = 1;
const BIT_DEPTH = 16;

async function ttsStream(PARAGRAPH) {
  const ws = new WebSocket(`${WS_URL}?api-key=${API_KEY}&sample_rate=${SAMPLE_RATE}&channel_type=MONO&format=WAV`);

  ws.on("open", () => {
    console.log("Connected to Murf WebSocket");

    // Send voice config first
    const voiceConfigMsg = {
      voice_config: {
        voiceId: "en-US-amara",
        style: "Conversational",
        rate: 0,
        pitch: 0,
        variation: 1,
      },
    };
    console.log("Sending payload:", voiceConfigMsg);
    ws.send(JSON.stringify(voiceConfigMsg));

    // Send text
    const textMsg = {
      text: PARAGRAPH,
      end: true, // closes the context after speech
    };
    console.log("Sending payload:", textMsg);
    ws.send(JSON.stringify(textMsg));
  });

  // Setup audio player
  // const speaker = new speaker({
  //   channels: CHANNELS,
  //   bitDepth: BIT_DEPTH,
  //   sampleRate: SAMPLE_RATE,
  // });

  let firstChunk = true;

  ws.on("message", (message) => {
    const data = JSON.parse(message.toString());
 

    if (data.audio) {
      let audioBytes = Buffer.from(data.audio, "base64");

      // Skip WAV header on first chunk
      if (firstChunk && audioBytes.length > 44) {
        audioBytes = audioBytes.slice(44);
        firstChunk = false;
      }
     
    }

   

    if (data.final) {
      console.log("Streaming finished.");
      speaker.end();
      ws.close();
    }
  });

  ws.on("error", (err) => {
    console.error("WebSocket error:", err);
  });

  ws.on("close", () => {
    console.log("Connection closed.");
  });
}

 export default ttsStream;

