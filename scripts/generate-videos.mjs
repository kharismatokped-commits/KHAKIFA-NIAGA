import { execSync } from "child_process";
import fs from "fs";

fs.mkdirSync("public/videos", { recursive: true });

console.log("🎬 Generating 4 cinematic promotional videos from official user assets with ffmpeg...");

// 1. Hero Logo Video (1280x720, 4s, 30fps)
// Clean dark emerald canvas with centered logo and subtle zoom/lighting
console.log("\n▶ [1/4] Rendering hero-logo.mp4...");
const heroPosterCmd = `ffmpeg -y -f lavfi -i "color=c=#092c1b:s=1280x720:d=1" \
  -i "public/images/logo-badge.jpg" \
  -filter_complex "[1:v]scale=520:-1[logo];[0:v][logo]overlay=(W-w)/2:(H-h)/2" \
  -vframes 1 public/videos/hero-poster.jpg`;
execSync(heroPosterCmd, { stdio: "inherit" });

const heroCmd = `ffmpeg -y -loop 1 -i "public/videos/hero-poster.jpg" \
  -filter_complex "zoompan=z='min(zoom+0.0006,1.08)':d=120:x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':s=1280x720:fps=30,fade=t=in:st=0:d=0.4" \
  -c:v libx264 -pix_fmt yuv420p -profile:v high -level 4.0 -crf 22 -preset medium -movflags +faststart \
  -t 4 "public/videos/hero-logo.mp4"`;
execSync(heroCmd, { stdio: "inherit" });

// 2. Showcase 1: Plastik Cap 1 (720x720, 4s, 30fps)
console.log("\n▶ [2/4] Rendering showcase-1.mp4 (Plastik Cap 1)...");
const plastikCmd = `ffmpeg -y -loop 1 -i "public/images/products/plastik-cap-satu.jpg" \
  -filter_complex "scale=1024:1024:force_original_aspect_ratio=increase,crop=1024:1024,zoompan=z='min(zoom+0.0008,1.1)':d=120:x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':s=720x720:fps=30,fade=t=in:st=0:d=0.4" \
  -c:v libx264 -pix_fmt yuv420p -profile:v high -level 4.0 -crf 22 -preset medium -movflags +faststart \
  -t 4 "public/videos/showcase-1.mp4"`;
execSync(plastikCmd, { stdio: "inherit" });

// 3. Showcase 2: Kertas HVS SiDU 70g (720x720, 4s, 30fps)
console.log("\n▶ [3/4] Rendering showcase-2.mp4 (Kertas HVS SiDU)...");
const siduCmd = `ffmpeg -y -loop 1 -i "public/images/products/kertas-sidu.jpg" \
  -filter_complex "scale=1024:1024:force_original_aspect_ratio=increase,crop=1024:1024,zoompan=z='min(zoom+0.0007,1.09)':d=120:x='(iw/zoom)*(0.4+0.1*on/120)':y='(ih/zoom)*(0.4+0.1*on/120)':s=720x720:fps=30,fade=t=in:st=0:d=0.4" \
  -c:v libx264 -pix_fmt yuv420p -profile:v high -level 4.0 -crf 22 -preset medium -movflags +faststart \
  -t 4 "public/videos/showcase-2.mp4"`;
execSync(siduCmd, { stdio: "inherit" });

// 4. Showcase 3: Pulpen Faster F3 (720x720, 4s, 30fps)
console.log("\n▶ [4/4] Rendering showcase-3.mp4 (Pulpen Faster F3)...");
const fasterCmd = `ffmpeg -y -loop 1 -i "public/images/products/pulpen-faster.jpg" \
  -filter_complex "scale=1024:1024:force_original_aspect_ratio=increase,crop=1024:1024,zoompan=z='min(zoom+0.0007,1.09)':d=120:x='(iw/zoom)*(0.3+0.2*on/120)':y='(ih/zoom)*(0.3+0.2*on/120)':s=720x720:fps=30,fade=t=in:st=0:d=0.4" \
  -c:v libx264 -pix_fmt yuv420p -profile:v high -level 4.0 -crf 22 -preset medium -movflags +faststart \
  -t 4 "public/videos/showcase-3.mp4"`;
execSync(fasterCmd, { stdio: "inherit" });

// 5. Showcase 4: Pulpen Snowman V-2 (720x720, 4s, 30fps)
console.log("\n▶ [Bonus] Rendering showcase-4.mp4 (Pulpen Snowman V-2)...");
const snowmanCmd = `ffmpeg -y -loop 1 -i "public/images/products/pulpen-snowman.jpg" \
  -filter_complex "scale=1024:1024:force_original_aspect_ratio=increase,crop=1024:1024,zoompan=z='min(zoom+0.0007,1.09)':d=120:x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':s=720x720:fps=30,fade=t=in:st=0:d=0.4" \
  -c:v libx264 -pix_fmt yuv420p -profile:v high -level 4.0 -crf 22 -preset medium -movflags +faststart \
  -t 4 "public/videos/showcase-4.mp4"`;
execSync(snowmanCmd, { stdio: "inherit" });

console.log("\n🎉 All promotional videos generated from user assets successfully!");
