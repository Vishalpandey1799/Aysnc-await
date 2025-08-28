import speech from "@google-cloud/speech";


export class STTClient {
  static speechClient = new speech.SpeechClient({
    keyFilename: "D:/THISISIT/Aysnc-await/server/speech-to-text.json",
  });

  constructor(onFinalTranscript) {
    this.transcript = "";
    this.recognizeStream = null;
    this.initiateStt(onFinalTranscript);
    this.error = "";
  }

  initiateStt(onFinalTranscript) {
    console.log("Speech-to-Text client starting");
    try {
      this.recognizeStream = STTClient.speechClient
        .streamingRecognize({
          config: {
            encoding: "LINEAR16",
            sampleRateHertz: 16000,
            languageCode: "en-US",
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
      console.log("Speech-to-Text client initialized successfully");
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
