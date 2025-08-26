 import { streamImageDescription } from "../config/gemini.js";
 
export const sendingBase64 = async (req, res) => {

    try {

        const { imageBase64: base64 } = req.body;
         await streamImageDescription(base64)
 
        res.status(200).json({ data: base64 });

    } catch (error) {
        console.log("something went wrong in getAudio controller", error);
        res.status(500).json({ message: "Internal server error" });
    }
}