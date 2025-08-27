export const learnLanguage = async (req, res) => {
    const {nativeLanguage, targetLanguage, voiceModel="us-Ken"} = req.body;

    try {
        if(!nativeLanguage || !targetLanguage) {
            return res.status(400).json({ message: "Missing required fields" });
        }
        const transcript = await sttTranscript(nativeLanguage, targetLanguage);
        if(transcript){
            const response = await geminiResponse(transcript);
            //send murfAudio through websocket


        }else{
            //send murfAudio through websocket
            //const audio = await murfAudio("Sorry could you please repeat that", voiceModel);
        }
    } catch (error) {
        console.error("Error learning language:", error?.message);
        return res.status(500).json({ message: "Internal server error" });
    }
}