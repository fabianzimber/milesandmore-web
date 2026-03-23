import type {
  BotLogEntry,
  BotRuntimeSettings,
  BotStatus,
  ChannelRecord,
  CommandMetadata,
  Flight,
  ManagedChannel,
  Participant,
  ParticipantLookupResult,
} from "./types";

const API_BASE = process.env.NEXT_PUBLIC_BOT_API_URL || "http://localhost:3001";


async function botFetch<T = unknown>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(error.error || `API error: ${res.status}`);
  }

  return res.json();
}

// SimBrief
export const importSimBrief = (pilotId: string) =>
  botFetch("/simbrief/import", { method: "POST", body: JSON.stringify({ pilotId }) });

// SimLink
export const connectSimLink = (url?: string) =>
  botFetch("/simlink/connect", { method: "POST", body: JSON.stringify({ url }) });

export const disconnectSimLink = () =>
  botFetch("/simlink/disconnect", { method: "POST" });

export const getSimLinkStatus = () =>
  botFetch<{ connected: boolean; lastData: Record<string, number> | null }>("/simlink/status");

// Flights
export const getFlights = (status?: string) =>
  botFetch<Flight[]>(`/flights${status ? `?status=${status}` : ""}`);

export const getFlight = (id: number) => botFetch<Flight | null>(`/flights/${id}`);

export const createFlight = (data: Record<string, unknown>) =>
  botFetch("/flights", { method: "POST", body: JSON.stringify(data) });

export const updateFlightStatus = (id: number, status: string) =>
  botFetch(`/flights/${id}/status`, { method: "POST", body: JSON.stringify({ status }) });

export const resumeBoarding = (id: number, extraMinutes?: number) =>
  botFetch(`/flights/${id}/resume-boarding`, { method: "POST", body: JSON.stringify({ extraMinutes }) });

export const resumeFlight = (id: number) =>
  botFetch(`/flights/${id}/resume-flight`, { method: "POST" });

export const assignSeats = (id: number) =>
  botFetch(`/flights/${id}/assign-seats`, { method: "POST" });

// Participants
export const getParticipants = (flightId: number) => botFetch<Participant[]>(`/flights/${flightId}/participants`);

export const getParticipant = (hash: string) => botFetch<ParticipantLookupResult | null>(`/participant/${hash}`);

// Seats
export const getSeats = (flightId: number) => botFetch<string[]>(`/flights/${flightId}/seats`);

export const changeSeat = (participantHash: string, newSeat: string) =>
  botFetch("/seats/change", {
    method: "POST",
    body: JSON.stringify({ participant_hash: participantHash, new_seat: newSeat }),
  });

// Channels
export const getChannels = () => botFetch<(ManagedChannel | ChannelRecord)[]>("/channels");

export const addChannel = (channelName: string) =>
  botFetch("/channels", { method: "POST", body: JSON.stringify({ channel_name: channelName }) });

export const removeChannel = (channelName: string) =>
  botFetch(`/channels/${channelName}`, { method: "DELETE" });

// Bot
export const getBotLogs = (limit?: number) => botFetch<BotLogEntry[]>(`/bot/logs?limit=${limit || 100}`);
export const getCommands = () => botFetch<CommandMetadata[]>("/commands");

export const restartBot = () => botFetch("/bot/restart", { method: "POST" });

export const getBotStatus = () =>
  botFetch<BotStatus>("/bot/status");

export const getBotSettings = () =>
  botFetch<BotRuntimeSettings>("/bot/settings");

// Leaderboard
export const getCountryLeaderboard = () => botFetch("/leaderboard/countries");
export const getMilesLeaderboard = () => botFetch("/leaderboard/miles");

// User Stats
export const getUserStats = (userId: string) => botFetch(`/user/${userId}/stats`);
