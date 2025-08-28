import React, { useState, useRef, useEffect } from "react";

const LanguageLearningApp = () => {
  const [ws, setWs] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [connectionStatus, setConnectionStatus] = useState("disconnected");
  const audioContextRef = useRef(null);
  const processorRef = useRef(null);
  const wsRef = useRef(null); // Use a ref for the WebSocket instance
  const murfAudioRef = useRef(null);
  const playheadTimeRef = useRef(0);

  useEffect(() => {
    // Initialize WebSocket connection
    const websocket = new WebSocket("ws://localhost:5000");
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
            console.log("Received audio chunk from Murf");
              playAudioChunk(data.data);
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
          type: "session-config",
          data: {
            nativeLanguage: "english",
            targetLanguage: "hindi",
          },
        })
      );
    } else {
      console.error("WebSocket is not connected");
    }
  };
  
  // ---- Audio playback ----
  const base64ToPCMFloat32 = (base64) => {
    const binary = atob(base64);
    let offset = 0;
    if (binary.slice(0, 4) === "RIFF") offset = 44;  
    const bytes = new Uint8Array(binary.length - offset);
    for (let i = 0; i < bytes.length; i++)
      bytes[i] = binary.charCodeAt(i + offset);

    const view = new DataView(bytes.buffer);
    const float32Array = new Float32Array(bytes.length / 2);
    for (let i = 0; i < float32Array.length; i++) {
      const int16 = view.getInt16(i * 2, true);
      float32Array[i] = int16 / 32768;
    }
    return float32Array;
  };

  const playAudioChunk = (base64) => {
    if (!murfAudioRef.current) {
      murfAudioRef.current = new (window.AudioContext ||
        window.webkitAudioContext)({ sampleRate: 44100 });
      playheadTimeRef.current = murfAudioRef.current.currentTime;
    }

    const float32Array = base64ToPCMFloat32(base64);
    if (!float32Array || float32Array.length === 0) return;

    const buffer = murfAudioRef.current.createBuffer(
      1,
      float32Array.length,
      44100
    );
    buffer.copyToChannel(float32Array, 0);

    const source = murfAudioRef.current.createBufferSource();
    source.buffer = buffer;
    source.connect(murfAudioRef.current.destination);

    const now = murfAudioRef.current.currentTime;
    if (playheadTimeRef.current < now + 0.15)
      playheadTimeRef.current = now + 0.15;

    source.start(playheadTimeRef.current);
    playheadTimeRef.current += buffer.duration;
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
