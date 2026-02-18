import { writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { Resvg } from "@resvg/resvg-js";

const WIDTH = 1200;
const HEIGHT = 630;

const svg = `
<svg width="${WIDTH}" height="${HEIGHT}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <!-- Background gradient -->
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#042f2e" />
      <stop offset="50%" stop-color="#134e4a" />
      <stop offset="100%" stop-color="#115e59" />
    </linearGradient>

    <!-- Subtle glow -->
    <radialGradient id="glow1" cx="85%" cy="20%" r="40%">
      <stop offset="0%" stop-color="#0d9488" stop-opacity="0.15" />
      <stop offset="100%" stop-color="#0d9488" stop-opacity="0" />
    </radialGradient>
    <radialGradient id="glow2" cx="10%" cy="80%" r="35%">
      <stop offset="0%" stop-color="#14b8a6" stop-opacity="0.1" />
      <stop offset="100%" stop-color="#14b8a6" stop-opacity="0" />
    </radialGradient>

    <!-- Dot pattern -->
    <pattern id="dots" x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse">
      <circle cx="2" cy="2" r="0.8" fill="white" opacity="0.06" />
    </pattern>

    <!-- Chart area gradient -->
    <linearGradient id="chartFill" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#2dd4bf" stop-opacity="0.25" />
      <stop offset="100%" stop-color="#2dd4bf" stop-opacity="0.02" />
    </linearGradient>

    <!-- Grid line color -->
    <pattern id="grid" x="0" y="0" width="80" height="50" patternUnits="userSpaceOnUse">
      <line x1="0" y1="50" x2="80" y2="50" stroke="white" stroke-opacity="0.04" stroke-width="1" />
      <line x1="80" y1="0" x2="80" y2="50" stroke="white" stroke-opacity="0.04" stroke-width="1" />
    </pattern>
  </defs>

  <!-- Background -->
  <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#bg)" />
  <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#dots)" />
  <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#glow1)" />
  <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#glow2)" />

  <!-- Full-width chart (behind everything) -->
  <g opacity="0.9">
    <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#grid)" />

    <!-- Chart area fill — extends to right edge for smooth fade -->
    <path d="M 0,${HEIGHT} C 80,${HEIGHT - 20} 160,${HEIGHT - 40} 240,${HEIGHT - 80} C 320,${HEIGHT - 120} 400,${HEIGHT - 100} 480,${HEIGHT - 160} C 560,${HEIGHT - 220} 640,${HEIGHT - 200} 720,${HEIGHT - 260} C 800,${HEIGHT - 320} 880,${HEIGHT - 300} 960,${HEIGHT - 370} C 1020,${HEIGHT - 420} 1080,${HEIGHT - 410} 1140,${HEIGHT - 470} L ${WIDTH},${HEIGHT - 510} L ${WIDTH},${HEIGHT} L 0,${HEIGHT} Z"
      fill="url(#chartFill)" />

    <!-- Chart line -->
    <path d="M 0,${HEIGHT} C 80,${HEIGHT - 20} 160,${HEIGHT - 40} 240,${HEIGHT - 80} C 320,${HEIGHT - 120} 400,${HEIGHT - 100} 480,${HEIGHT - 160} C 560,${HEIGHT - 220} 640,${HEIGHT - 200} 720,${HEIGHT - 260} C 800,${HEIGHT - 320} 880,${HEIGHT - 300} 960,${HEIGHT - 370} C 1020,${HEIGHT - 420} 1080,${HEIGHT - 410} 1140,${HEIGHT - 470}"
      fill="none" stroke="#2dd4bf" stroke-width="2.5" stroke-linecap="round" />

    <!-- End dot -->
    <circle cx="1140" cy="${HEIGHT - 470}" r="4" fill="#2dd4bf" />
    <circle cx="1140" cy="${HEIGHT - 470}" r="9" fill="#2dd4bf" opacity="0.2" />
  </g>

  <!-- Badge -->
  <g transform="translate(80, 100)">
    <rect width="222" height="32" rx="16" fill="#2dd4bf" fill-opacity="0.12" />
    <text x="111" y="21" font-family="Inter, system-ui, sans-serif" font-size="11" font-weight="600" fill="#5eead4" letter-spacing="2.5" text-anchor="middle">
      AI-POWERED DISCOVERY
    </text>
  </g>

  <!-- Title -->
  <text x="80" y="205" font-family="'Source Serif 4', Georgia, serif" font-size="72" font-weight="700" fill="white" letter-spacing="-1">
    ETF Finder
  </text>

  <!-- Subtitle -->
  <text font-family="Inter, system-ui, sans-serif" font-size="22" fill="#99f6e4" opacity="0.5">
    <tspan x="80" y="260">Search any sector or theme and get instant</tspan>
    <tspan x="80" y="290">ETF recommendations with real-time data.</tspan>
  </text>

  <!-- Feature pills -->
  <g transform="translate(80, 340)">
    <!-- Pill 1 -->
    <rect x="0" y="0" width="180" height="40" rx="8" fill="white" fill-opacity="0.06" stroke="white" stroke-opacity="0.1" />
    <text x="90" y="26" font-family="Inter, system-ui, sans-serif" font-size="14" font-weight="500" fill="#ccfbf1" text-anchor="middle">Performance Charts</text>

    <!-- Pill 2 -->
    <rect x="196" y="0" width="194" height="40" rx="8" fill="white" fill-opacity="0.06" stroke="white" stroke-opacity="0.1" />
    <text x="293" y="26" font-family="Inter, system-ui, sans-serif" font-size="14" font-weight="500" fill="#ccfbf1" text-anchor="middle">Country Allocations</text>

    <!-- Pill 3 -->
    <rect x="406" y="0" width="155" height="40" rx="8" fill="white" fill-opacity="0.06" stroke="white" stroke-opacity="0.1" />
    <text x="483" y="26" font-family="Inter, system-ui, sans-serif" font-size="14" font-weight="500" fill="#ccfbf1" text-anchor="middle">Expense Ratios</text>
  </g>

</svg>
`;

const resvg = new Resvg(svg, {
  fitTo: { mode: "width", value: WIDTH },
  font: {
    loadSystemFonts: true,
  },
});

const png = resvg.render().asPng();
const outPath = resolve(import.meta.dirname, "../public/og-image.png");
writeFileSync(outPath, png);

console.log(
  `Generated OG image: ${outPath} (${(png.byteLength / 1024).toFixed(1)} KB)`
);
