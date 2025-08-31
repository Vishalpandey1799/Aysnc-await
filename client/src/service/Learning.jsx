import React, { useState, useRef, useEffect } from "react";
import { Phone, PhoneOff, Send, Mic, Flame, RefreshCcw } from "lucide-react";
import { Button } from "../components/ui/button";
import ChatMessage from "@/components/languageTutor/ChatMessage";
import SessionEndCard from "@/components/languageTutor/SessionEndCard";

import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";

const LanguageLearninApp = () => {
  const [config, setConfig] = useState(null);
  useEffect(() => {
    setConfig(JSON.parse(localStorage.getItem("config")));
  }, []);
  console.log("New-config", config);
  const [sessionState, setSessionState] = useState("idle");
  const [localConfigData, setLocalConfigData] = useState({});
  const navigate = useNavigate;
  //idle active ended
  const [messages, setMessages] = useState([]);
  const [connectionStatus, setConnectionStatus] = useState("disconnected");
  const wsRef = useRef(null);
  const audioContextRef = useRef(null);
  const processorRef = useRef(null);
  const murfAudioRef = useRef(null);
  const playheadTimeRef = useRef(0);
  const chatEndRef = useRef(null);
  const [isInitiateGreeting, setIsInitiateGreeting] = useState(false);

  //Auto-scroll
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    const websocket = new WebSocket("wss://aysnc-await.onrender.com");

    wsRef.current = websocket;

    setLocalConfigData(JSON.parse(localStorage.getItem("config")));

    websocket.onopen = () => {
      setConnectionStatus("connected");
      // if(localConfigData !== null){
      //   websocket.send(
      //     JSON.stringify({ type: "session-config", data: localConfigData })
      //   );
      // }
    };
    websocket.onclose = () => setConnectionStatus("disconnected");
    websocket.onerror = (error) => console.error("WebSocket error:", error);

    websocket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        if (data.type === "final-transcript") {
          setMessages((prev) => [
            ...prev,
            { sender: "user", text: data.transcript },
          ]);
        } else if (data.type === "gemini-chunk") {
          setMessages((prev) => [...prev, { sender: "ai", text: data.data }]);
        } else if (data.type === "murf-audio-chunk") {
          console.log("Received Murf audio chunk");
          playMurfAudioChunk(data.data);
        } else if (data.type === "error") {
          console.error("Server error:", data.message, data.error);
        }
      } catch (error) {
        console.error("Error parsing message:", error?.message);
      }
    };

    return () => {
      if (websocket.readyState === WebSocket.OPEN) websocket.close();
    };
  }, []);

  const startSession = () => {
    if (
      wsRef.current &&
      wsRef.current.readyState === WebSocket.OPEN &&
      config
    ) {
      //  if(!isInitiateGreeting){
      //   wsRef.current.send(JSON.stringify({ type: "initial-greeting" }));
      //   setIsInitiateGreeting(true);
      // }
      wsRef.current.send(
        JSON.stringify({ type: "session-config", data: config })
      );
      startRecording();
      setSessionState("active");
    } else {
      console.error("WebSocket is not connected");
    }
  };

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

  const playMurfAudioChunk = (base64) => {
    if (!murfAudioRef.current) {
      murfAudioRef.current = new (window.AudioContext ||
        window.webkitAudioContext)({ sampleRate: 44100 });
      playheadTimeRef.current = murfAudioRef.current.currentTime;
    }

    if (murfAudioRef.current.state === "suspended")
      murfAudioRef.current.resume();
    console.log("murfAudioRef.current.state", murfAudioRef.current.state);

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
    console.log("Recording stopped");
    setSessionState("ended");
  };

  const handleGoHome = () => {
    setMessages([
      {
        sender: "ai",
        text: `Hi ${config.name}! Ready for another round?`,
        author: config.voiceModel,
      },
    ]);
    setSessionState("idle");
    // You might want to navigate the user or reset the parent component state here
    if (wsRef.current) wsRef.current.close();
    navigate("/");
    //config = {};
  };

  return (
    <div className="flex flex-col h-screen w-full bg-background text-foreground">
      <header className="flex items-center justify-center p-4 border-b border-border">
        <h1 className="text-2xl font-bold tracking-widest bg-gradient-to-r from-fuchsia-500 to-violet-500 text-transparent bg-clip-text">
          CHRONICLE
        </h1>
      </header>

      <main className="flex-grow p-4 md:p-8 overflow-y-auto">
        {sessionState === "ended" ? (
          <SessionEndCard userName={config?.name} onGoHome={handleGoHome} />
        ) : (
          <div className="flex flex-col space-y-6 px-5 lg:px-20">
            {messages?.map((msg, index) => (
              <ChatMessage key={index} message={msg} />
            ))}
            <div ref={chatEndRef} />
          </div>
        )}
      </main>

      {sessionState !== "ended" && (
        <footer className="flex items-center justify-center p-4 gap-5">
          <div className="flex items-center justify-center p-2 rounded-full bg-card border border-border">
            <Button
              onClick={sessionState === "active" ? stopRecording : startSession}
              className={`w-16 h-16 rounded-full text-white shadow-lg transition-colors ${
                sessionState === "active"
                  ? "bg-red-500 hover:bg-red-600"
                  : "bg-green-500 hover:bg-green-600"
              }`}
            >
              {sessionState === "active" ? (
                <PhoneOff size={28} />
              ) : (
                <Mic size={28} />
              )}
            </Button>
          </div>
          <Button
            className={"w-14 rounded-full"}
            onClick={() => window.location.reload()}
          >
            <RefreshCcw size={28} />
          </Button>
          {connectionStatus === "disconnected" ? (
            <Badge>Refresh to connect</Badge>
          ) : (
            <Badge className={"pb-1 rounded-full"} variant={"outline"}>
              {connectionStatus}
            </Badge>
          )}
        </footer>
      )}
    </div>
  );
};

export default LanguageLearninApp;
