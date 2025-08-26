import getResponse from "../config/gemini.js";
import ttsStream from "../config/murfai.js";
//  import saveAudioStreamToFile from "../config/murfai.js";

export const sendingBase64 = async (req, res) => {

    try {

        const file = req.file;



        if (!file) {
            return res.status(400).json({ message: "No file uploaded" });
        }

        const base64 = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;


        let f = await getResponse(base64);

        await ttsStream(f);

        console.log("final data from gemini", f);

        res.status(200).json({ data: base64 });

    } catch (error) {
        console.log("something went wrong in getAudio controller", error);
        res.status(500).json({ message: "Internal server error" });
    }
}