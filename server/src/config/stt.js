import speech from "@google-cloud/speech";

export class STTClient {
  static speechClient = new speech.SpeechClient({
    keyFilename: "D:/Mern-Stack/Async-Await/server/speech-to-text.json",
  });

  constructor(onFinalTranscript, languageCode) {
    this.transcript = "";
    this.recognizeStream = null;
    this.error = "";
    this.languageCode = languageCode;
    this.initiateStt(onFinalTranscript);
  }

  initiateStt(onFinalTranscript, languageCode) {
    console.log("Speech-to-Text client starting");
    try {
      this.recognizeStream = STTClient.speechClient
        .streamingRecognize({
          config: {
            encoding: "LINEAR16",
            sampleRateHertz: 16000,
            languageCode: languageCode || "en-US",
            enableAutomaticPunctuation: true,
            model: "latest_long",
          },
          interimResults: true,
        })
        .on("error", (error) => {
          console.error("Speech recognition error:", error?.message || error);
          this.error = error?.message;
        })
        .on("data", (data) => {
          const transcript = data.results[0]?.alternatives[0]?.transcript || "";
          const isFinal = data.results[0]?.isFinal || false;

          console.log("Transcript:", transcript, "Is final:", isFinal);

          if (isFinal) {
            this.transcript = transcript.trim();
            if (onFinalTranscript && this.transcript.trim() !== "") {
              onFinalTranscript(this.transcript);
            }
          }
        });
      console.log(
        "Speech-to-Text client initialized successfully",
        this.languageCode
      );
    } catch (error) {
      console.error("Error initializing speech recognition:", error);
      this.error = error.message;
    }
  }

  getFinalTranscript() {
    return this.transcript;
  }

  getStream() {
    return this.recognizeStream;
  }

  getError() {
    return this.error;
  }

  close() {
    if (this.recognizeStream) {
      this.recognizeStream.end();
    }
  }
}
