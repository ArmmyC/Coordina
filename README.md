# Coordina Thailand

Coordina is a multi-agent hospital operations dashboard concept for coordinating patient flow across departments. It focuses on the operational bottlenecks that can remain even when diagnosis becomes faster: beds, pharmacy, discharge, transport, wards, infrastructure, and communication.

The current demo is a React + TypeScript + Tailwind web app using synthetic hospital operations data. It is designed for a short product pitch and shows how Coordina turns scattered department signals into one explainable root-cause insight and human-review action brief.

## Demo Focus

- Siriraj respiratory-surge command simulation
- T1-T8 operational sentinel mesh
- Primary bottleneck and secondary monitored issues
- Department-level flow details
- Insight timeline and anomaly notification behavior
- Human-review action brief with removable recommendations
- Safety and governance boundaries for non-clinical coordination

## Product Principle

Coordina is insight-first, not data-first.

Instead of showing only that the ED is crowded, Coordina explains why the crowding is happening. For example, the visible issue may be ED boarding, while the real cause may involve delayed discharge medications, bed cleaning, family pickup, transport, and referral communication.

Coordina does not diagnose, treat, discharge, prioritize patients clinically, or automate hospital decisions. It prepares operational insights and safe follow-up actions for humans to review.

## Tech Stack

- React
- TypeScript
- Vite
- Tailwind CSS
- Lucide React icons
- Synthetic mock data and local fallback insight logic

## Getting Started

Install dependencies:

```bash
npm install
```

Run the app locally:

```bash
npm run dev
```

Open:

```text
http://127.0.0.1:5173/
```

Build for production:

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

## Optional Local API

The app includes an optional API script:

```bash
npm run api
```

To use OpenAI-backed narrative generation, create a local `.env` file:

```bash
cp .env.example .env
```

Then edit `.env`:

```env
OPENAI_API_KEY=sk-your-key-here
OPENAI_MODEL=gpt-4o-mini
COORDINA_API_PORT=8787
```

Run the API server and frontend in two terminals:

```bash
npm run api
```

```bash
npm run dev
```

Terminal environment variables still take priority over `.env` values. The demo is usable without a live AI backend because it includes synthetic data and local fallback narratives.

## Project Structure

```text
src/
  components/        UI pages and reusable dashboard components
  data/              Synthetic Coordina and Siriraj surge demo data
  lib/               AI client and simulation helpers
  utils/             Insight utility logic
  types.ts           Shared TypeScript models
public/
  favicon.svg
server/
  api-server.mjs     Optional local API server
```

## Safety Boundary

This project uses synthetic data only. It is not connected to real patient records, hospital telemetry, or clinical systems.

Use Coordina language carefully:

- Use: unusual operational pattern, above baseline, review suggested, escalation recommended, anomaly score
- Avoid: pandemic detected, outbreak confirmed, diagnosis inferred

All suggested actions are operational and human-review oriented, such as:

- mark reviewed
- add to brief
- escalate
- assign to role

Coordina should not present execution-style clinical commands.

## Scripts

```bash
npm run dev      # Start Vite dev server
npm run api      # Start optional local API server
npm run build    # Type-check and build production assets
npm run preview  # Preview production build locally
```

## Repository Notes

Generated output, local dependencies, logs, TypeScript build info, and private environment files should not be committed. See `.gitignore`.
