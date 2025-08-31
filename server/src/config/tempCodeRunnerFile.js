// // import { GoogleGenAI } from "@google/genai";
// // import * as fs from "node:fs";

// // async function main() {

// //   const ai = new GoogleGenAI({apiKey : "AIzaSyD81AJkN6J9_8WY-Um6Z8j_EC327JLK_nI"});

// //   const response = await ai.models.generateImages({
// //     model: 'imagen-4.0-generate-001',
// //     prompt: 'Robot holding a red skateboard',
// //     config: {
// //       numberOfImages: 4,
// //     },
// //   });

// //   let idx = 1;
// //   for (const generatedImage of response.generatedImages) {
// //     let imgBytes = generatedImage.image.imageBytes;
// //     const buffer = Buffer.from(imgBytes, "base64");
// //     fs.writeFileSync(`imagen-${idx}.png`, buffer);
// //     idx++;
// //   }
// // }

// // main();


// import fs from "node:fs";
// import axios from "axios";
// import FormData from "form-data";

// const payload = {
//   prompt: "A grandson teaching his grandmother how to use a smartphone, vibrant colors, detailed, digital art",
//   output_format: "webp"
// };

// const response = await axios.postForm(
//   `https://api.stability.ai/v2beta/stable-image/generate/ultra`,
//   axios.toFormData(payload, new FormData()),
//   {
//     validateStatus: undefined,
//     responseType: "arraybuffer",
//     headers: { 
//       Authorization: `Bearer sk-jWBUkbUy165Hu7rx9qGs6GVkD1WODHZKU9eWTP3CkEnn9XZp`, 
//       Accept: "image/*" 
//     },
//   },
// );

// if(response.status === 200) {
//   fs.writeFileSync("./lighthouse.webp", Buffer.from(response.data));
// } else {
//   throw new Error(`${response.status}: ${response.data.toString()}`);
// }


import fs from "fs";
import fetch from "node-fetch";

const HF_TOKEN = "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"; // 🔑 Replace with Hugging Face token

async function generateVideo(prompt, outputPath) {
  const response = await fetch(
    "https://api-inference.huggingface.co/models/damo-vilab/text-to-video-ms-1.7b",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${HF_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ inputs: "create a cool video where grandson teaching grandmother how to use mobile phone" }),
    }
  );

  if (!response.ok) {
    console.error("❌ Error:", await response.text());
    return;
  }

  const buffer = Buffer.from(await response.arrayBuffer());
  fs.writeFileSync(outputPath, buffer);
  console.log(`✅ Video saved at ${outputPath}`);
}

// Example usage
generateVideo("a cinematic shot of a futuristic city", "output.mp4");
