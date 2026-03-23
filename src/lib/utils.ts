/**
 * Parse seat configuration string (e.g. "3-3", "2-4-2", "3-3-3") into layout array
 */
export function parseSeatConfig(config: string): number[] {
  const segments = config
    .split("-")
    .map((segment) => segment.trim())
    .filter(Boolean);

  if (segments.length === 0) {
    throw new Error("Invalid seat configuration");
  }

  const layout = segments.map((segment) => Number.parseInt(segment, 10));
  if (layout.some((value) => !Number.isFinite(value) || value <= 0)) {
    throw new Error("Invalid seat configuration");
  }

  return layout;
}

/**
 * Generate seat letters based on layout (e.g. [3,3] → ['A','B','C','D','E','F'])
 */
export function getSeatLetters(layout: number[]): string[] {
  const total = layout.reduce((sum, n) => sum + n, 0);
  return Array.from({ length: total }, (_, i) => String.fromCharCode(65 + i));
}

/**
 * Calculate number of rows from total seats and seats per row
 */
export function calculateRows(totalSeats: number, seatsPerRow: number): number {
  return Math.ceil(totalSeats / seatsPerRow);
}

/**
 * Format seat ID from row number and letter (e.g. 1, "A" → "1A")
 */
export function formatSeatId(row: number, letter: string): string {
  return `${row}${letter}`;
}

/**
 * Parse seat ID into row and letter (e.g. "12A" → { row: 12, letter: "A" })
 */
export function parseSeatId(seatId: string): { row: number; letter: string } {
  const letter = seatId[seatId.length - 1];
  const row = parseInt(seatId.slice(0, -1));
  return { row, letter };
}

/**
 * Format distance in nautical miles
 */
export function formatDistance(nm: number): string {
  return `${nm.toLocaleString()} NM`;
}

/**
 * Format duration in seconds to hours and minutes
 */
export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (hours === 0) return `${minutes}min`;
  return `${hours}h ${minutes}min`;
}

/**
 * Format altitude in feet
 */
export function formatAltitude(feet: number): string {
  return `FL${Math.round(feet / 100)}`;
}

/**
 * Format speed in knots
 */
export function formatSpeed(knots: number): string {
  return `${Math.round(knots)} kts`;
}

/**
 * Get the WebSocket URL for the bot server
 */
export function getBotWsUrl(): string {
  return "";
}

/**
 * Get the Bot API URL
 */
export function getBotApiUrl(): string {
  return process.env.NEXT_PUBLIC_BOT_API_URL || "http://localhost:3001";
}

/**
 * CN utility for combining class names
 */
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(" ");
}
