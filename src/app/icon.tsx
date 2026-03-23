import { ImageResponse } from "next/og";
import fs from "fs/promises";
import path from "path";

// Route segment config
export const runtime = "nodejs";

// Image metadata
export const size = {
  width: 512,
  height: 512,
};
export const contentType = "image/png";

// Image generation
export default async function Icon() {
  try {
    const imagePath = path.join(process.cwd(), "public", "logo.png");
    const imageBuffer = await fs.readFile(imagePath);

    const base64Image = imageBuffer.toString("base64");
    const mimeType = "image/png";
    const imgSrc = `data:${mimeType};base64,${base64Image}`;

    return new ImageResponse(
      (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: "50%",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              width: "100%",
              height: "100%",
              backgroundImage: `url(${imgSrc})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          />
        </div>
      ),
      {
        ...size,
      }
    );
  } catch {
    // Fallback if no logo file exists.
    return new ImageResponse(
      (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: "50%",
            background: "#400080", // Approximate purple from the image
            color: "white",
            fontSize: 200,
            fontWeight: "bold",
          }}
        >
          F
        </div>
      ),
      {
        ...size,
      }
    );
  }
}
