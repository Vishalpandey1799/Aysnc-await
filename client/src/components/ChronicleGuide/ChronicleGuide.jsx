import React, { useRef, useState, useEffect } from "react";

const ChronicleGuide = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const wsRef = useRef(null);
  const [status, setStatus] = useState("Click START to begin.");
  const [isReady, setIsReady] = useState(false);
  const [stream, setStream] = useState(null);

  const audioContextRef = useRef(null);
  const playheadTimeRef = useRef(0);

  // ---- WebSocket connection ----
  useEffect(() => {
    const ws = new WebSocket("ws://localhost:0808");
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
        } else if (msg.type === "error") {
          setStatus("❌ Server error: " + msg.message);
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
        video: true,
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
      setStatus("❌ WebSocket not connected.");
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
    <div style={{ textAlign: "center", padding: "2rem" }}>
      <h1>Chronicle Guide</h1>
      <p>{status}</p>
      <div>
        <button onClick={startCamera} disabled={isReady}>
          START
        </button>
        <button onClick={stopCamera} disabled={!isReady}>
          STOP
        </button>
      </div>
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        onClick={captureFrameAndAsk}
        style={{
          width: "100%",
          maxWidth: "640px",
          border: "1px solid #ccc",
          cursor: isReady ? "pointer" : "default",
          opacity: isReady ? 1 : 0.5,
        }}
        title={isReady ? "Click to capture and ask" : "Start camera first"}
      />
      <canvas ref={canvasRef} style={{ display: "none" }} />
    </div>
  );
};

export default ChronicleGuide;
