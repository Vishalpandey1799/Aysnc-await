import React, { useRef, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Drone, Camera, CameraOff, RotateCw } from "lucide-react";

// Typewriter component
const Typewriter = ({ text }) => {
  const [displayed, setDisplayed] = useState("");
  useEffect(() => {
    let i = 0;
    setDisplayed("");
    const interval = setInterval(() => {
      if (i < text.length) {
        setDisplayed((prev) => prev + text[i]);
        i++;
      } else clearInterval(interval);
    }, 20);
    return () => clearInterval(interval);
  }, [text]);
  return <p className="whitespace-pre-wrap">{displayed}</p>;
};

const ChronicleGuide = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const wsRef = useRef(null);

  const [status, setStatus] = useState("Click START to begin.");
  const [isReady, setIsReady] = useState(false);
  const [stream, setStream] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [aiResponse, setAiResponse] = useState("");
  const [facingMode, setFacingMode] = useState("user"); // front/back

  const audioContextRef = useRef(null);
  const playheadTimeRef = useRef(0);
  const audioSourcesRef = useRef([]);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);

  const currentContextIdRef = useRef(null);
  const nextActionRef = useRef(null);

  // WebSocket
  const textChunksRef = useRef([]); // store chunks for current context

  useEffect(() => {
    const ws = new WebSocket("wss://aysnc-await.onrender.com");

    wsRef.current = ws;

    ws.onopen = () => setStatus("✅ Connected to server. Start camera.");

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);

        if (msg.type === "interrupted-ack") {
          if (typeof nextActionRef.current === "function") {
            nextActionRef.current();
            nextActionRef.current = null;
          }
        } else if (msg.type === "audio-chunk" && msg.contextId) {
          playAudioChunk(msg.data, msg.contextId);
        } else if (msg.type === "text-chunk" && msg.contextId) {
          // If context changed, reset chunk array but don't stop Murf
          if (currentContextIdRef.current !== msg.contextId) {
            textChunksRef.current = [];
            currentContextIdRef.current = msg.contextId;
          }

          // append new chunk
          textChunksRef.current.push(msg.data);

          // update displayed text safely
          setAiResponse(textChunksRef.current.join(""));
        } else if (msg.type === "error") {
          setStatus(`❌ Server error: ${msg.message}`);
          setIsProcessing(false);
        }
      } catch (err) {
        console.error("Failed to parse WS message:", err, event.data);
      }
    };

    ws.onclose = () => setStatus("❌ WS closed. Refresh to reconnect.");

    return () => {
      if (wsRef.current) wsRef.current.close();
      stopAllAudio();
      stopCamera();
    };
  }, []);

  // Camera
  const startCamera = async () => {
    setStatus("Requesting camera...");
    try {
      const videoStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode },
      });
      if (videoRef.current) videoRef.current.srcObject = videoStream;
      setStream(videoStream);
      setIsReady(true);
      setStatus("Camera ready. Click video to capture frame.");
    } catch (err) {
      console.error(err);
      setStatus("❌ Could not access camera.");
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((t) => t.stop());
      setStream(null);
      if (videoRef.current) videoRef.current.srcObject = null;
      setIsReady(false);
      setStatus("Camera stopped.");
    }
    stopAllAudio();
  };

  const toggleCamera = () => {
    stopCamera();
    setFacingMode(facingMode === "user" ? "environment" : "user");
    setTimeout(startCamera, 300);
  };

  // Audio
  const stopAllAudio = () => {
    audioSourcesRef.current.forEach((source) => {
      try {
        source.stop();
      } catch (e) {}
    });
    audioSourcesRef.current = [];
    setIsAudioPlaying(false);
    currentContextIdRef.current = null;
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    playheadTimeRef.current = 0;
  };

  const interrupt = () => {
    if (isAudioPlaying && currentContextIdRef.current) {
      wsRef.current.send(
        JSON.stringify({
          type: "interrupt",
          contextIdToStop: currentContextIdRef.current,
        })
      );
      stopAllAudio();
      return true;
    }
    return false;
  };

  // Capture frame & send
  const startImageCapture = () => {
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
      setStatus("📤 Sent frame, waiting for AI...");
      setAiResponse("");
    } else {
      setStatus("Refresh and try again!");
      setIsProcessing(false);
    }
  };

  const captureFrameAndAsk = () => {
    if (!isReady) return;
    const wasInterrupted = interrupt();
    if (wasInterrupted) nextActionRef.current = startImageCapture;
    else startImageCapture();
  };

  const base64ToPCMFloat32 = (base64) => {
    const binary = atob(base64);
    let offset = binary.slice(0, 4) === "RIFF" ? 44 : 0;
    const bytes = new Uint8Array(binary.length - offset);
    for (let i = 0; i < bytes.length; i++)
      bytes[i] = binary.charCodeAt(i + offset);
    const view = new DataView(bytes.buffer);
    const float32Array = new Float32Array(bytes.length / 2);
    for (let i = 0; i < float32Array.length; i++) {
      float32Array[i] = view.getInt16(i * 2, true) / 32768;
    }
    return float32Array;
  };

  const playAudioChunk = (base64, contextId) => {
    if (
      !audioContextRef.current ||
      audioContextRef.current.state === "closed"
    ) {
      audioContextRef.current = new (window.AudioContext ||
        window.webkitAudioContext)({ sampleRate: 44100 });
      playheadTimeRef.current = audioContextRef.current.currentTime;
    }

    if (currentContextIdRef.current !== contextId) stopAllAudio();
    currentContextIdRef.current = contextId;

    const float32Array = base64ToPCMFloat32(base64);
    if (!float32Array || float32Array.length === 0) return;

    const buffer = audioContextRef.current.createBuffer(
      1,
      float32Array.length,
      44100
    );
    buffer.copyToChannel(float32Array, 0);
    const source = audioContextRef.current.createBufferSource();
    source.buffer = buffer;
    source.connect(audioContextRef.current.destination);
    audioSourcesRef.current.push(source);

    const now = audioContextRef.current.currentTime;
    if (playheadTimeRef.current < now) playheadTimeRef.current = now;
    source.start(playheadTimeRef.current);
    playheadTimeRef.current += buffer.duration;

    source.onended = () => {
      audioSourcesRef.current = audioSourcesRef.current.filter(
        (s) => s !== source
      );
      if (audioSourcesRef.current.length === 0) {
        currentContextIdRef.current = null;
        setIsAudioPlaying(false);
      }
    };
    if (!isAudioPlaying) setIsAudioPlaying(true);
  };

  return (
    <div className="flex h-screen bg-neutral-900 text-neutral-200">
      {/* Left: Camera */}
      <div className="flex-1 flex flex-col p-6 gap-4">
        <div className="flex items-center gap-3">
          <Drone className="h-7 w-7 text-blue-400" />
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            ChronicleGuide
          </h1>
          <Button
            size="sm"
            variant="secondary"
            className="ml-auto flex items-center gap-1"
            onClick={toggleCamera}
          >
            <RotateCw className="w-4 h-4" /> Toggle Camera
          </Button>
        </div>

        <div className="relative rounded-2xl overflow-hidden bg-neutral-800 border border-neutral-700 shadow-lg flex-1">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            onClick={captureFrameAndAsk}
            className={`w-full h-full object-cover transition-opacity duration-300 ${
              isReady ? "cursor-pointer" : "opacity-60 grayscale"
            }`}
            title={isReady ? "Click to capture" : "Start camera first"}
          />
        </div>

        <div className="flex gap-4 mt-2">
          <Button onClick={startCamera} disabled={isReady}>
            START
          </Button>
          <Button onClick={stopCamera} disabled={!isReady}>
            STOP
          </Button>
        </div>

        <div
          className={`mt-2 px-3 py-1 rounded-full text-sm font-medium ${
            isProcessing
              ? "bg-blue-500 animate-pulse text-white"
              : status.includes("❌")
              ? "bg-red-500"
              : status.includes("✅")
              ? "bg-green-500"
              : "bg-neutral-700 text-neutral-200"
          }`}
        >
          {status}
        </div>

        <canvas ref={canvasRef} className="hidden" />
      </div>

      {/* Right: AI Response */}
      <div className="w-96 p-4 border-l border-neutral-700 overflow-y-auto flex flex-col">
        <h2 className="text-lg font-semibold mb-2">AI Response</h2>
        <div className="bg-neutral-800 p-3 rounded-lg flex-1 overflow-y-auto">
          <Typewriter text={aiResponse} />
        </div>
      </div>
    </div>
  );
};

export default ChronicleGuide;
