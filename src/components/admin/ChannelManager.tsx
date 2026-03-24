"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import SASButton from "@/components/ui/SASButton";
import SASCard from "@/components/ui/SASCard";
import { getChannels, addChannel, removeChannel } from "@/lib/botApi";
import type { ManagedChannel } from "@/lib/types";
import { Plus, Trash2, Radio, Users } from "lucide-react";

export default function ChannelManager() {
  const [channels, setChannels] = useState<ManagedChannel[]>([]);
  const [newChannel, setNewChannel] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchChannels();
  }, []);

  const fetchChannels = async () => {
    try {
      const data = (await getChannels()) as ManagedChannel[];
      setChannels(data);
    } catch {
      // ignore
    }
  };

  const handleAdd = async () => {
    if (!newChannel.trim()) return;
    setLoading(true);
    setError(null);
    try {
      await addChannel(newChannel.trim());
      setNewChannel("");
      await fetchChannels();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Channel konnte nicht aktiviert werden.");
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (name: string) => {
    if (!confirm(`Channel "${name}" wirklich entfernen?`)) return;
    setError(null);
    try {
      await removeChannel(name);
      await fetchChannels();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Channel konnte nicht entfernt werden.");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-foreground">Twitch Channels</h2>
        <p className="text-sm text-foreground/50 mt-1">
          Nur eigene freigeschaltete Kanaele. Vor dem Aktivieren bitte einmal <span className="font-medium">/mod milesandmorebot</span> im Kanal ausfuehren.
        </p>
      </div>

      {/* Add Channel */}
      <SASCard>
        <div className="flex gap-3">
          <input
            type="text"
            value={newChannel}
            onChange={(e) => setNewChannel(e.target.value)}
            placeholder="Eigener Twitch Username"
            className="flex-1 px-4 py-2.5 border border-white/[0.06] rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-aviation-blue focus:border-transparent"
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          />
          <SASButton onClick={handleAdd} loading={loading}>
            <Plus size={16} />
            Hinzufügen
          </SASButton>
        </div>
        {error ? <p className="mt-3 text-sm font-medium text-red-600">{error}</p> : null}
      </SASCard>

      {/* Channel List */}
      <SASCard padding="none">
        <div className="px-5 py-3 border-b border-border flex items-center gap-2">
          <Users size={16} className="text-foreground/40" />
          <span className="text-sm font-medium text-foreground/70">
            {channels.length} Channel{channels.length !== 1 ? "s" : ""}
          </span>
        </div>

        <div className="divide-y divide-border">
          <AnimatePresence>
            {channels.map((channel) => (
              <motion.div
                key={channel.id}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="flex items-center justify-between px-5 py-3"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      channel.active ? "bg-mm-success" : "bg-foreground/30"
                    }`}
                  />
                  <div>
                    <p className="text-sm font-medium text-foreground">{channel.channel_name}</p>
                    <p className="text-xs text-foreground/40">
                      Hinzugefügt: {new Date(channel.added_at).toLocaleDateString("de-DE")}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Radio size={14} className={channel.active ? "text-mm-success" : "text-foreground/30"} />
                  <button
                    onClick={() => handleRemove(channel.channel_name)}
                    className="p-1.5 text-foreground/40 hover:text-mm-destructive transition-colors cursor-pointer"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {channels.length === 0 && (
            <div className="px-5 py-8 text-center text-foreground/40 text-sm">
              Noch keine Channels hinzugefügt
            </div>
          )}
        </div>
      </SASCard>
    </div>
  );
}
