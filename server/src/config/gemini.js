import { GoogleGenerativeAI } from "@google/generative-ai";

const genai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "AIzaSyCRzvZxl8G8RE0jGpSMZr91pH3YYUQB89g");
const model = genai.getGenerativeModel({ model: "gemini-1.5-flash" });

const getResponse = async (imageBase64) => {
  try {
    const result = await model.generateContentStream([
      "Describe this image in one concise sentence in the style of a David Attenborough nature documentary.",
      {
        inlineData: {
          data: imageBase64.split(",")[1], 
          mimeType: "image/jpeg",
        },
      },
    ]);

    let fullText = "";

    for await (const chunk of result.stream) {
      const chunkText = chunk.text();
      if (chunkText) {
        process.stdout.write(chunkText);  
        fullText += chunkText;
      }
    }

     
    return fullText;

  } catch (error) {
    console.error("Error in genai config", error);
    return "Error generating response.";
  }
};

export default getResponse;
