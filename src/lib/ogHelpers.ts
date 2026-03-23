import fs from "fs/promises";
import path from "path";

/** Returns the logo as a base64 data-URI (PNG), for use inside ImageResponse */
export async function getLogoDataUri(): Promise<string> {
  const buf = await fs.readFile(path.join(process.cwd(), "public", "logo.png"));
  return `data:image/png;base64,${buf.toString("base64")}`;
}
