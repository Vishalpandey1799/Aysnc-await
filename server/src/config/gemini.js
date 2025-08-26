
import { GoogleGenerativeAI } from "@google/generative-ai";

const genai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "AIzaSyCRzvZxl8G8RE0jGpSMZr91pH3YYUQB89g");
const model = genai.getGenerativeModel({ model: "gemini-1.5-flash" });

 
export async function* streamImageDescription(imageBase64) {
  const result = await model.generateContentStream([
    "Describe this image if it's place name it if a plant name it if you think you know the name ... in the style of a David Attenborough nature documentary.",
    {
      inlineData: {
        data: imageBase64.split(",")[1],
        mimeType: "image/jpeg",
      },
    },
  ]);

  for await (const chunk of result.stream) {
    const text = chunk.text();
    console.log("Gemini chunk:", text);
    if (text) yield text;
  }
}
