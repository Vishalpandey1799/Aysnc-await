import React, { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Mic2,
  Camera,
  Play,
  Volume2,
  VolumeX,
  Settings,
  MessageSquare,
  Star,
  Wand2,
  Sparkles,
  Activity,
  Gauge,
  Bot,
  Clock,
} from "lucide-react";
import { getCamera } from "@/service/camera";

const styles = {
  card: "rounded-2xl border border-neutral-800 bg-neutral-900/60 backdrop-blur-sm shadow-[0_10px_30px_-10px_rgba(0,0,0,0.5)] transition-all duration-300 ease-in-out hover:border-blue-400/40 hover:shadow-blue-900/50 hover:shadow-2xl hover:-translate-y-1",
  gradientText:
    "bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent",
  chip: "inline-flex items-center gap-1 rounded-full border border-neutral-700/70 bg-neutral-800/60 px-3 py-1 text-sm text-neutral-200 transition-colors hover:bg-neutral-800",
};

const narrativeStyles = [
  { label: "Casual" },
  { label: "Adventurous" },
  { label: "Humorous", featured: true },
  { label: "Educational" },
  { label: "Poetic" },
];

const history = [
  {
    id: 1,
    time: "10:21",
    text: "Spotted a curious cat by the window, plotting a daring leap onto the sofa...",
  },
  {
    id: 2,
    time: "10:18",
    text: "Coffee mug detected. Steam curls like a tiny storm cloud—brewing motivation.",
  },
  {
    id: 3,
    time: "10:12",
    text: "Laptop awake. Keys clack as ideas line up for their turn on stage.",
  },
];

export default function Home() {
  const [muted, setMuted] = useState(false);
  const [isCameraOn, setIsCameraOn] = useState(false);
  const liveCameraRef = useRef(null);

  const handleLiveCamera = async () => {
    console.log("clicked");
    setIsCameraOn(true);
    try {
      const stream = await getCamera();
      if (liveCameraRef.current) {
        liveCameraRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error("Error accessing camera:", error);
      setIsCameraOn(false);
    }
  };

  return (
    <div className="space-y-8 pb-12 max-w-7xl mx-auto">
      {/* Hero */}
      <div className="text-center flex flex-col items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex items-center justify-center gap-2 text-3xl md:text-4xl font-bold"
        >
          <Mic2 className="text-blue-400" />
          <span className={styles.gradientText}>Chronicle AI</span>
        </motion.div>
        <p className={`mt-2 text-neutral-100 text-sm md:text-base `}>
          Real-time visual storyteller powered by Murf AI
        </p>
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Visual Narrator */}
        <motion.div
          initial={{ opacity: 0, y: 0 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className={`lg:col-span-2 ${styles.card}`}
        >
          <div className="p-4 md:p-6">
            <div className="aspect-video w-full rounded-xl border border-blue-900 bg-neutral-800/60 relative overflow-hidden ">
              {isCameraOn ? (
                <video
                  ref={liveCameraRef}
                  id="camera"
                  className="w-full h-auto"
                  autoPlay
                  muted
                ></video>
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6 py-2 gap-5">
                  <Camera className="h-10 w-10 text-blue-400" />
                  <h3 className="text-2xl md:text-3xl font-extrabold">
                    Visual Narrator
                  </h3>
                  <p className="mt-2 max-w-xl text-neutral-300 text-sm md:text-base">
                    Click "Start Narration" to begin. The AI will identify
                    objects in your camera feed and create engaging stories in
                    real-time.
                  </p>
                  <button
                    onClick={() => handleLiveCamera()}
                    className="flex items-center justify-center gap-2 rounded-xl px-8 py-4 text-xl font-semibold text-white bg-gradient-to-r from-blue-600 via-purple-500 to-purple-400 hover:from-blue-700 hover:to-purple-600 cursor-pointer hover:shadow-xl hover:shadow-blue-900/50 hover:-translate-y-1 transition-all duration-300 ease-in-out"
                  >
                    <span className="hidden md:inline">Start Narration</span>
                    <Play size={20} className="text-center" />
                  </button>
                </div>
              )}

              <div className="absolute inset-0 rounded-xl ring-1 ring-black/10 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.02)] pointer-events-none" />
            </div>
          </div>
        </motion.div>

        {/* AI Narration */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.05 }}
          className={`${styles.card}`}
        >
          <div className="p-4 md:p-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl md:text-2xl font-bold">AI Narration</h3>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9"
                  onClick={() => setMuted((m) => !m)}
                >
                  {muted ? <VolumeX /> : <Volume2 />}
                </Button>
                <Button variant="ghost" size="icon" className="h-9 w-9">
                  <Settings />
                </Button>
              </div>
            </div>

            {/* Chat bubble */}
            <div className="mt-4">
              <div className="relative">
                <div className="ml-4 inline-block rounded-2xl bg-blue-600 text-white px-4 py-3 shadow-lg">
                  <span className="font-semibold">Chronicle AI:</span> Hello!
                  I'm ready to narrate your visual world. Click the start button
                  when you're ready to begin!
                </div>
                <div className="absolute -left-1 top-4 h-3 w-3 rotate-45 bg-blue-600" />
              </div>
            </div>

            {/* Narrative Style */}
            <div className="mt-6">
              <h4 className="text-sm font-semibold text-neutral-300 flex items-center gap-2">
                <Wand2 className="h-4 w-4 text-purple-300" /> Narrative Style
              </h4>
              <div className="mt-3 flex flex-wrap gap-2">
                {narrativeStyles.map((s) => (
                  <span
                    key={s.label}
                    className={`${styles.chip} ${
                      s.featured ? "ring-1 ring-blue-400/50" : ""
                    }`}
                  >
                    {s.featured && (
                      <Star className="h-3.5 w-3.5 text-yellow-400 fill-yellow-400" />
                    )}
                    {s.label}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Status grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatusCard
          icon={<Activity className="text-blue-400" />}
          label="Status"
          value="Ready"
        />
        <StatusCard
          icon={<MessageSquare className="text-purple-300" />}
          label="Objects Detected"
          value="0"
        />
        <StatusCard
          icon={<Bot className="text-pink-300" />}
          label="Voice Output"
          value={muted ? "Muted" : "Enabled"}
        />
        <StatusCard
          icon={<Gauge className="text-green-300" />}
          label="Processing"
          value="Idle"
        />
      </div>

      {/* History */}
      <div className={`grid grid-cols-1 lg:grid-cols-3 gap-6`}>
        <div className={`lg:col-span-2 ${styles.card}`}>
          <div className="p-4 md:p-6">
            <h3 className="text-lg md:text-xl font-semibold flex items-center gap-2">
              <Sparkles className="text-pink-300" /> Narrative History
            </h3>
            <ul className="mt-4 space-y-3">
              {history.map((h) => (
                <li
                  key={h.id}
                  className="flex items-start gap-3 rounded-xl border border-neutral-800 bg-neutral-900/40 p-3"
                >
                  <div className="flex items-center gap-1 text-sm text-neutral-400 pt-0.5">
                    <Clock className="h-4 w-4" /> {h.time}
                  </div>
                  <p className="text-neutral-200 leading-relaxed">{h.text}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className={`${styles.card}`}>
          <div className="p-4 md:p-6">
            <h3 className="text-lg md:text-xl font-semibold mb-2">
              Quick Actions
            </h3>
            <div className="flex flex-col gap-2">
              <Button variant="secondary" className="justify-start">
                <Play className="mr-2" size={18} /> Start Narration
              </Button>
              <Button variant="outline" className="justify-start">
                <Wand2 className="mr-2" size={18} /> Change Style
              </Button>
              <Button variant="ghost" className="justify-start">
                <Settings className="mr-2" size={18} /> Settings
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatusCard({ icon, label, value }) {
  return (
    <div className={`${styles.card} p-4 md:p-5`}>
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-neutral-800/60">
          {icon}
        </div>
        <div>
          <div className="text-sm text-neutral-400">{label}</div>
          <div className="text-lg md:text-xl font-semibold">{value}</div>
        </div>
      </div>
    </div>
  );
}
