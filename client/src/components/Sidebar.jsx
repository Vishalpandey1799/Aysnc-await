import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  MessageSquare,
  BrainCircuit,
  Podcast,
  Settings,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  Drone,
} from "lucide-react";

const navItems = [
  { name: "Dashboard", url: "/", icon: Drone },
  { name: "Chat", url: "/ling", icon: MessageSquare },
  { name: "Models", url: "/models", icon: BrainCircuit },
  { name: "Voice", url: "/talk", icon: Podcast },
];

const footerItems = [
  { name: "Settings", url: "/settings", icon: Settings },
  { name: "Help", url: "/help", icon: HelpCircle },
];

function Sidebar() {
  const [expanded, setExpanded] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (url) => {
    if (url === "/") return location.pathname === "/";
    return location.pathname.startsWith(url);
  };

  

  return (
    <AnimatePresence initial={false}>
      <motion.aside
        className="relative h-screen bg-neutral-950 border-r border-neutral-800 flex flex-col overflow-hidden text-slate-100"
        initial={{ width: expanded ? 256 : 72 }}
        animate={{ width: expanded ? 256 : 72 }}
        transition={{ duration: 0.2, ease: "easeInOut" }}
      >
        {/* Header */}
        <div className="flex items-center gap-3 px-3 py-4 relative">
          <div className="relative flex h-9 w-9 items-center justify-center rounded-full bg-neutral-800/60">
            <Drone className="h-10 w-10" />
          </div>
          <AnimatePresence>
            {expanded && (
              <motion.span
                key="brand"
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                transition={{ duration: 0.15 }}
                className="text-2xl font-bold tracking-tight bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent"
              >
                Chronicle AI
              </motion.span>
            )}
          </AnimatePresence>
          <Button
            aria-label="Toggle sidebar"
            variant="ghost"
            size="sm"
            className= {`ml-auto ${!expanded && "absolute left-12" } h-8 w-8 p-0 rounded-full hover:bg-neutral-800/60`}
            onClick={() => setExpanded((v) => !v)}
          >
            {expanded ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
          </Button>
        </div>

        <Separator className="bg-neutral-800/80" />

        {/* Navigation */}
        <div className="flex-1 px-2 py-4">
          <TooltipProvider delayDuration={0}>
            <nav className="space-y-1">
              {navItems.map(({ name, url, icon: Icon }) => {
                const active = isActive(url);
                const content = (
                  <Button
                    variant={active ? "secondary" : "ghost"}
                    className={`w-full justify-start gap-3 ${expanded ? "px-3" : "px-0 justify-center"} ${
                      active ? "bg-neutral-800/60 text-white" : ""
                    }`}
                    onClick={() => navigate(url)}
                  >
                    <Icon size={expanded ? 22 : 20} />
                    <AnimatePresence>
                      {expanded && (
                        <motion.span
                          initial={{ opacity: 0, x: -6 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -6 }}
                          transition={{ duration: 0.15 }}
                          className="text-base font-medium"
                        >
                          {name}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </Button>
                );

                return expanded ? (
                  <div key={name} className="text-base">{content}</div>
                ) : (
                  <Tooltip key={name}>
                    <TooltipTrigger asChild>{content}</TooltipTrigger>
                    <TooltipContent side="right">{name}</TooltipContent>
                  </Tooltip>
                );
              })}
            </nav>
          </TooltipProvider>
        </div>

        <Separator className="bg-neutral-800/80" />

        {/* Footer */}
        <div className="px-2 py-3">
          <TooltipProvider delayDuration={0}>
            <nav className="space-y-1">
              {footerItems.map(({ name, url, icon: Icon }) => {
                const content = (
                  <Button
                    variant="ghost"
                    className={`w-full justify-start gap-3 ${expanded ? "px-3" : "px-0 justify-center"}`}
                    onClick={() => navigate(url)}
                  >
                    <Icon size={22} />
                    <AnimatePresence>
                      {expanded && (
                        <motion.span
                          initial={{ opacity: 0, x: -6 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -6 }}
                          transition={{ duration: 0.15 }}
                          className="text-base font-medium"
                        >
                          {name}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </Button>
                );

                return expanded ? (
                  <div key={name}>{content}</div>
                ) : (
                  <Tooltip key={name}>
                    <TooltipTrigger asChild>{content}</TooltipTrigger>
                    <TooltipContent side="right">{name}</TooltipContent>
                  </Tooltip>
                );
              })}
            </nav>
          </TooltipProvider>
        </div>

        {/* Subtle animated glow */}
        <motion.div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-32 opacity-20"
          style={{
            background:
              "radial-gradient(80% 60% at 50% 100%, rgba(124,58,237,0.6) 0%, transparent 70%)",
          }}
          initial={{ opacity: 0.12 }}
          animate={{ opacity: 0.2 }}
          transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
        />
      </motion.aside>
    </AnimatePresence>
  );
}

export default Sidebar;
