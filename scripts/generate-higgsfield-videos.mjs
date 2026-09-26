import fs from "fs";
import path from "path";

// Read .env manually
function loadEnv() {
  try {
    const envFile = fs.readFileSync(".env", "utf8");
    for (const line of envFile.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const idx = trimmed.indexOf("=");
      if (idx !== -1) {
        const key = trimmed.slice(0, idx).trim();
        let val = trimmed.slice(idx + 1).trim();
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
          val = val.slice(1, -1);
        }
        if (!process.env[key]) {
          process.env[key] = val;
        }
      }
    }
  } catch (e) {
    // ignore
  }
}

loadEnv();

const HF_KEY = process.env.HF_KEY || process.env.HIGGSFIELD_API_KEY;

if (!HF_KEY) {
  console.error("❌ Higgsfield API key not found in .env (HF_KEY or HIGGSFIELD_API_KEY)");
  process.exit(1);
}

const JOBS = [
  {
    name: "hero-logo.mp4",
    prompt: "Cinematic 3D reveal of Khalifa Niaga logo on modern dark emerald background, smooth camera slow zoom in, volumetric lighting, subtle glowing particle effects, ultra high definition commercial",
    endpoint: "https://api.higgsfield.ai/kling-video/v3.0-turbo/text-to-video",
  },
  {
    name: "showcase-1.mp4",
    prompt: "Professional commercial product photography of Lem G cyanoacrylate super glue bottle, clean studio lighting, subtle slow camera pan and zoom, reflection on glossy white surface, 4k",
    endpoint: "https://api.higgsfield.ai/kling-video/v3.0-turbo/text-to-video",
  },
  {
    name: "showcase-2.mp4",
    prompt: "Professional product photography of Standard AE7 ballpoint pen on clean studio table, subtle macro camera slide and soft emerald rim lighting, commercial advertising style",
    endpoint: "https://api.higgsfield.ai/kling-video/v3.0-turbo/text-to-video",
  },
  {
    name: "showcase-3.mp4",
    prompt: "Commercial studio product photography of V-Tec Premium Glossy Photo Paper packaging with sample colorful photos, smooth slow push in camera movement, bright clean lighting",
    endpoint: "https://api.higgsfield.ai/kling-video/v3.0-turbo/text-to-video",
  },
];

async function generateWithHiggsfield(job) {
  console.log(`\n🎬 Requesting video generation for: ${job.name}...`);
  try {
    const response = await fetch(job.endpoint, {
      method: "POST",
      headers: {
        Authorization: `Key ${HF_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt: job.prompt,
        duration: 5,
        aspect_ratio: "16:9",
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      console.warn(`⚠️ Higgsfield API returned status ${response.status}:`, data);
      return { success: false, error: data };
    }

    console.log(`✅ Job created successfully:`, data);
    return { success: true, data };
  } catch (err) {
    console.error(`❌ Network error while calling Higgsfield:`, err.message);
    return { success: false, error: err.message };
  }
}

async function main() {
  console.log("🚀 Testing Higgsfield Video Generation Pipeline...");
  for (const job of JOBS) {
    await generateWithHiggsfield(job);
  }
}

main();
