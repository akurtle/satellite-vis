# 🛰️ Satellite Visualizer

A real-time satellite visualization web app built with **Vite + React + TypeScript**, featuring interactive map rendering, TLE parsing, and **Redis-backed caching** via Vercel serverless functions.

The app fetches Two-Line Element (TLE) data from public sources (e.g. CelesTrak), caches responses to avoid repeated network reads, and visualizes satellite positions on a world map.

Live on: [Live Link](https://satellite-vis.vercel.app/ )

---

## ✨ Features

- 🌍 Interactive satellite map (Leaflet)
- 📡 TLE ingestion from public endpoints
- ⚡ Redis caching (Upstash + Vercel Serverless)
- 🚀 Fast Vite-based frontend
- 🎨 Modern UI with Tailwind CSS and shadcn UI
- ☁️ Deployed on Vercel (frontend + API)
