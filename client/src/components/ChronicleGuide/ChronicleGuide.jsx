import React, { useRef, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Drone } from "lucide-react";

const TalkingFrame = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const wsRef = useRef(null);
  const [status, setStatus] = useState("Click START to begin.");
  const [isReady, setIsReady] = useState(false);
  const [stream, setStream] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const audioContextRef = useRef(null);
  const playheadTimeRef = useRef(0);

  // ---- WebSocket connection ----
  useEffect(() => {
   const ws = new WebSocket("ws://localhost:5000");
    wsRef.current = ws;

    ws.onopen = () => {
      console.log("✅ WebSocket connected");
      setStatus("Connected to server. Start camera to ask.");
    };

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        console.log(msg);

        if (msg.type === "audio-chunk") {
          playAudioChunk(msg.data);
        } else if (msg.type === "end") {
          setStatus("✅ Narration finished. Click again to ask.");
          setIsProcessing(false);
        } else if (msg.type === "error") {
          setStatus("❌ Server error: " + msg.message);
          setIsProcessing(false);
        }
      } catch (err) {
        console.error("Failed to parse WS message:", err, event.data);
      }
    };

    ws.onclose = () => {
      console.log("❌ WS closed");
      setStatus("WebSocket closed. Refresh to reconnect.");
    };

    return () => ws.close();
  }, []);

  // ---- Camera start/stop ----
  const startCamera = async () => {
    setStatus("Requesting camera permission...");
    try {
      const videoStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "user",
        },
      });
      if (videoRef.current) videoRef.current.srcObject = videoStream;
      setStream(videoStream);
      setIsReady(true);
      setStatus("Camera ready. Click on video to ask a question!");
    } catch (err) {
      console.error(err);
      setStatus("Could not access camera. Check permissions.");
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((t) => t.stop());
      setStream(null);
      if (videoRef.current) videoRef.current.srcObject = null;
      setIsReady(false);
      setStatus("Camera stopped. Click START to begin again.");
    }
  };

  // ---- Capture frame & send via WS ----
  const captureFrameAndAsk = async () => {
    if (!isReady) return setStatus("Please start camera first.");

    setIsProcessing(true);
    setStatus("Processing your request...");

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const base64Image = canvas.toDataURL("image/jpeg");

    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: "image", data: base64Image }));
      setStatus("📤 Sent frame to server, waiting for audio...");
    } else {
      setStatus("Refresh and try again!");
      setIsProcessing(false);
    }
  };


  const debateToAgent = async () => {
  if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
    console.warn("WS not ready");
    return;
  }

  try {
    // Tell server to prep STT + debate session
    wsRef.current.send(JSON.stringify({ type: "debate" }));
    setStatus("🎤 Debate started. Speak now...");

    // Get mic access
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        channelCount: 1,
        sampleRate: 16000,
        sampleSize: 16,
      },
    });

    const audioContext = new (window.AudioContext ||
      window.webkitAudioContext)({ sampleRate: 16000 });

    const source = audioContext.createMediaStreamSource(stream);
    const processor = audioContext.createScriptProcessor(4096, 1, 1);

    source.connect(processor);
    processor.connect(audioContext.destination);

    processor.onaudioprocess = (event) => {
      const inputData = event.inputBuffer.getChannelData(0);
      const outputData = new Int16Array(inputData.length);

      // ✅ Convert Float32 → Int16 properly
      for (let i = 0; i < inputData.length; i++) {
        let s = Math.max(-1, Math.min(1, inputData[i]));
        outputData[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
      }

      // ✅ Encode AFTER filling Int16
      const base64Data = btoa(
        String.fromCharCode(...new Uint8Array(outputData.buffer))
      );

      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(
          JSON.stringify({ type: "debate-chunk", data: base64Data })
        );
      }
    };

    audioContextRef.current = audioContext;
    console.log("🎙️ Mic streaming PCM16 → base64 → server...");
  } catch (err) {
    console.error("Mic error:", err);
    setStatus("❌ Mic error: " + err.message);
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
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext ||
        window.webkitAudioContext)({ sampleRate: 44100 });
      playheadTimeRef.current = audioContextRef.current.currentTime;
    }

    const float32Array = base64ToPCMFloat32(base64);
    if (!float32Array) return;

    const buffer = audioContextRef.current.createBuffer(
      1,
      float32Array.length,
      44100
    );
    buffer.copyToChannel(float32Array, 0);

    const source = audioContextRef.current.createBufferSource();
    source.buffer = buffer;
    source.connect(audioContextRef.current.destination);

    const now = audioContextRef.current.currentTime;
    if (playheadTimeRef.current < now + 0.15)
      playheadTimeRef.current = now + 0.15;

    source.start(playheadTimeRef.current);
    playheadTimeRef.current += buffer.duration;
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-neutral-900 to-neutral-950 overflow-hidden">
      {/* Main content area */}
      <div className="flex-1 flex flex-col p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-neutral-800/60">
            <Drone className="h-6 w-6 text-blue-400" />
          </div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            TalkingFrame
          </h1>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center gap-6">
          {/* Status indicator */}
          <div
            className={`inline-flex items-center justify-center px-4 py-2 rounded-full text-sm font-medium ${
              isProcessing
                ? "bg-blue-500 text-white animate-pulse"
                : status.includes("❌")
                ? "bg-red-500 text-white"
                : status.includes("✅")
                ? "bg-green-500 text-white"
                : "bg-neutral-800 text-neutral-200"
            }`}
          >
            {isProcessing && (
              <svg
                className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            )}
            <span>{status}</span>
          </div>

          {/* Video container */}
          <div className="relative rounded-2xl overflow-hidden bg-neutral-900 border border-neutral-800 shadow-2xl w-full max-w-4xl aspect-video">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              onClick={captureFrameAndAsk}
              className={`w-full h-full object-cover transition-all duration-300 ${
                isReady ? "cursor-pointer" : "opacity-60 grayscale"
              }`}
              title={
                isReady ? "Click to capture and ask" : "Start camera first"
              }
            />

            {!isReady && (
              <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-60">
                <div className="text-center p-4">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-neutral-800 mb-4">
                    <svg
                      className="w-8 h-8 text-neutral-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                      ></path>
                    </svg>
                  </div>
                  <p className="text-neutral-300 font-medium">
                    Camera not active
                  </p>
                  <p className="text-neutral-500 text-sm mt-1">
                    Click START to enable camera
                  </p>
                </div>
              </div>
            )}

            {isReady && (
              <div className="absolute bottom-6 left-0 right-0 flex justify-center">
                <motion.div
                  className="bg-black bg-opacity-70 text-white text-sm px-4 py-3 rounded-full backdrop-blur-sm border border-neutral-700 flex items-center gap-2"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    ></path>
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    ></path>
                  </svg>
                  Click anywhere to capture and ask
                </motion.div>
              </div>
            )}
          </div>

          {/* Controls */}
          <div className="flex gap-4">
            <Button
              className={`flex items-center gap-2 ${
                isReady
                  ? "bg-neutral-700 text-neutral-300 hover:bg-neutral-600"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
              onClick={startCamera}
              disabled={isReady}
              size="lg"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                ></path>
              </svg>
              START
            </Button>

            <Button
              className="flex items-center gap-2 bg-neutral-700 text-neutral-300 hover:bg-neutral-600"
              onClick={stopCamera}
              disabled={!isReady}
              size="lg"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                ></path>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z"
                ></path>
              </svg>
              STOP
            </Button>

            <Button
              className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700"
              onClick={debateToAgent}
              disabled={!isReady}
              size="lg"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z"
                ></path>
              </svg>
              Debate
            </Button>
          </div>
        </div>

        <canvas ref={canvasRef} className="hidden" />
      </div>
    </div>
  );
};

export default TalkingFrame;
