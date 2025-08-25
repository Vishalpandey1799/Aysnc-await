import fs from "fs";
import axios from "axios";
 

async function saveAudioStreamToFile(text) {
  const apiUrl = "https://api.murf.ai/v1/speech/stream";
  const apiKey = "ap2_c7abc8ae-7d19-4b35-84e3-a39b93a8ca7f";

  const requestBody = {
    text: text,
    voiceId: "en-US-ken",
  };

  try {
    const response = await axios.post(apiUrl, requestBody, {
      headers: {
        "Content-Type": "application/json",
        "api-key": apiKey,
      },
      responseType: "stream",
    });

    const outputFilePath = "./output.wav";
    const writer = fs.createWriteStream(outputFilePath);

    response.data.pipe(writer);

    writer.on("finish", () => {
      console.log(`Audio saved to ${outputFilePath}`);
    });

    writer.on("error", (err) => {
      console.error("Error writing to file:", err);
    });
  } catch (error) {
    console.error("Error:", error.message);
  }
}

export default saveAudioStreamToFile;
