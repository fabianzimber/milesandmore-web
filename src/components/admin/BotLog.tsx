"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import SASCard from "@/components/ui/SASCard";
import { getBotLogs } from "@/lib/botApi";
import type { BotLogEntry } from "@/lib/types";
import { ScrollText, Trash2 } from "lucide-react";

const LEVEL_COLORS: Record<string, string> = {
  info: "text-blue-600",
  error: "text-red-600",
  warn: "text-amber-600",
  irc: "text-purple-600",
  api: "text-green-600",
};

interface BotLogProps {
  logs: BotLogEntry[];
  setLogs: React.Dispatch<React.SetStateAction<BotLogEntry[]>>;
}

export default function BotLog({ logs, setLogs }: BotLogProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const data = (await getBotLogs(200)) as BotLogEntry[];
        setLogs(data);
      } catch {
        // ignore
      }
    };
    fetchLogs();
    const interval = setInterval(fetchLogs, 15000);
    return () => clearInterval(interval);
  }, [setLogs]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-sas-gray-900">Bot Log</h2>
          <p className="text-sm text-sas-gray-500 mt-1">
            Echtzeit-Logs des FlightBot Prozesses
          </p>
        </div>
        <button
          onClick={() => setLogs([])}
          className="text-sas-gray-400 hover:text-sas-gray-600 transition-colors p-2 cursor-pointer"
        >
          <Trash2 size={16} />
        </button>
      </div>

      <SASCard padding="none">
        <div className="px-4 py-2 border-b border-border flex items-center gap-2">
          <ScrollText size={14} className="text-sas-gray-400" />
          <span className="text-xs text-sas-gray-500">{logs.length} Einträge</span>
        </div>

        <div
          ref={scrollRef}
          className="h-[300px] overflow-y-auto bg-sas-gray-900 p-4 font-mono text-[11px] sm:h-[500px] sm:text-xs"
        >
          {logs.map((log, i) => (
            <motion.div
              key={log.id || i}
              initial={i > logs.length - 5 ? { opacity: 0 } : false}
              animate={{ opacity: 1 }}
              className="flex gap-3 py-0.5 hover:bg-sas-gray-800 px-1 rounded"
            >
              <span className="text-sas-gray-500 shrink-0">
                {log.timestamp
                  ? new Date(log.timestamp).toLocaleTimeString("de-DE")
                  : "--:--:--"}
              </span>
              <span className={`shrink-0 uppercase w-12 ${LEVEL_COLORS[log.level] || "text-gray-400"}`}>
                [{log.level}]
              </span>
              <span className="text-gray-200 break-all">{log.message}</span>
            </motion.div>
          ))}

          {logs.length === 0 && (
            <div className="text-center text-sas-gray-500 py-8">
              Keine Logs vorhanden
            </div>
          )}
        </div>
      </SASCard>
    </div>
  );
}
