import React, { useState, useRef, useEffect } from "react";

const LanguageLearningApp = () => {
  const [ws, setWs] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [connectionStatus, setConnectionStatus] = useState("disconnected");
  const audioContextRef = useRef(null);
  const processorRef = useRef(null);
  const wsRef = useRef(null); // Use a ref for the WebSocket instance

  useEffect(() => {
    // Initialize WebSocket connection
    const websocket = new WebSocket("ws://localhost:0808");
    wsRef.current = websocket; // Store in ref for immediate access

    websocket.onopen = () => {
      console.log("Connected to server");
      setConnectionStatus("connected");
      setWs(websocket); // Also update state for UI reactivity
    };

    websocket.onclose = () => {
      console.log("Disconnected from server");
      setConnectionStatus("disconnected");
    };

    websocket.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    websocket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log("Received message:", data);

        if (data.type === "transcript") {
          setTranscript((prev) => prev + " " + data.transcript);
        } else if (data.type === "session-ready") {
          console.log("Session is ready, starting recording...");
          startRecording();
        } else if (data.type === "gemini-chunk") {
          //Update UI with text response
          setTranscript((prev) => prev + " " + data.data);
        } else if (data.type === "murf-audio-chunk") {
          //play audio chunk
          const audio = new Audio(`data:audio/wav;base64,${data.data}`);
          audio.play();
        } else if (data.type === "error") {
          console.error("Server error:", data.message, data.error);
        }
      } catch (error) {
        console.error("Error parsing message:", error);
      }
    };

    // // Send message to server
    // const sendMessage = (text) => {
    //   websocket.send(
    //     JSON.stringify({
    //       type: "text-message",
    //       text: text,
    //       nativeLanguage: "hindi",
    //       languageToLearn: "english",
    //     })
    //   );
    // };

    return () => {
      if (websocket.readyState === WebSocket.OPEN) {
        websocket.close();
      }
    };
  }, []);

  const startSession = () => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      console.log("Starting session...");
      wsRef.current.send(
        JSON.stringify({
          type: "tutor",
          data: {
            nativeLanguage: "hindi",
            targetLanguage: "english",
          },
        })
      );
    } else {
      console.error("WebSocket is not connected");
    }
  };

  const startRecording = async () => {
    try {
      console.log("Requesting microphone access...");
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          sampleRate: 16000,
          sampleSize: 16,
        },
      });

      // Initialize audio context for processing
      audioContextRef.current = new AudioContext({ sampleRate: 16000 });
      const source = audioContextRef.current.createMediaStreamSource(stream);

      // Create script processor for handling audio data
      const processor = audioContextRef.current.createScriptProcessor(
        4096,
        1,
        1
      );
      processorRef.current = processor;

      source.connect(processor);
      processor.connect(audioContextRef.current.destination);

      processor.onaudioprocess = (event) => {
        setIsRecording(true);

        // Use the ref instead of state for immediate access
        if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN)
          return;

        // Convert Float32Array to Int16Array (required by Google Speech API)
        const inputData = event.inputBuffer.getChannelData(0);
        const outputData = new Int16Array(inputData.length);

        for (let i = 0; i < inputData.length; i++) {
          outputData[i] = Math.max(-1, Math.min(1, inputData[i])) * 0x7fff;
        }

        // Convert to base64 for WebSocket transmission
        const base64Data = btoa(
          new Uint8Array(outputData.buffer).reduce(
            (data, byte) => data + String.fromCharCode(byte),
            ""
          )
        );

        console.log("Sending audio chunk");
        // Send audio chunk to server using the ref
        wsRef.current.send(
          JSON.stringify({
            type: "audio-chunk",
            data: base64Data,
          })
        );
      };

      console.log("Recording started");
    } catch (error) {
      console.error("Error accessing microphone:", error);
    }
  };

  const stopRecording = () => {
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    if (processorRef.current) {
      processorRef.current.disconnect();
      processorRef.current = null;
    }
    setIsRecording(false);
    console.log("Recording stopped");
  };

  const handleStart = () => {
    startSession();
  };

  const handleStop = () => {
    stopRecording();
  };

  return (
    <div className="app-container">
      <h1>Language Learning Assistant - Transcription Test</h1>
      <p>Connection status: {connectionStatus}</p>

      <div className="controls">
        <button
          onClick={handleStart}
          disabled={isRecording || connectionStatus !== "connected"}
        >
          Start Recording
        </button>
        <button onClick={handleStop} disabled={!isRecording}>
          Stop Recording
        </button>
      </div>

      <div className="transcript-section">
        <h2>Your Speech:</h2>
        <p>{transcript}</p>
      </div>
    </div>
  );
};

export default LanguageLearningApp;
