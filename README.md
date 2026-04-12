# NERVE — Autonomous Outreach Engine

> 10-agent AI pipeline that finds, scores, writes, and delivers B2B outreach — zero human input after trigger.

```
Lead Input ──► Agent 1: Lead Ingestion & Enrichment
                   │
                   ▼
              Agent 2: Signal Scout
                   │
          ┌────────┴────────┐
          ▼                 ▼
   Agent 3: Intent    Agent 4: Persona
      Scorer            Analyst
          └────────┬────────┘
                   ▼
          Agent 5: Strategy Commander
                   │
          ┌────────┴────────┐
          ▼                 ▼
   Agent 6: Content   Agent 7: Explainer
      Forge
          └────────┬────────┘
                   ▼
          Agent 8: Delivery
                   │
                   ▼
          Agent 9: Response Monitor
                   │
        ┌──────────┼──────────┬──────────┐
        ▼          ▼          ▼          ▼
  escalate    continue    cancel      nurture
   _human     _cadence   _sequence
                   │
                   ▼
          Agent 10: Learning Loop
```

---

## Stack

| Layer | Tech |
|-------|------|
| Server | Hono v4 + Node.js 20 (ESM) |
| Database | MongoDB (local) |
| LLM | Groq — Llama 3.3 70B Versatile (`@ai-sdk/groq`) |
| Agent Framework | Mastra (`mastra@1.5.0`, `@mastra/core`) — Studio at `:4111` |
| Enrichment | Apollo.io API |
| Signals | Tavily Search API |
| Email delivery | Resend |
| LinkedIn outreach | HeyReach |
| WhatsApp | AiSensy |
| Real-time events | Server-Sent Events (SSE) |
| Frontend | React 19 + Vite 7 + TypeScript 5.9 + Tailwind CSS 4 + shadcn/ui + Framer Motion 12 |

---

## Features

- **Targeted mode** — provide a company name; agents enrich, score, and outreach automatically
- **Discovery mode** — describe your product; Agent 1 finds and recommends matching companies
- **Phase-wise pipeline UI** — 7-phase stepper with prev/next navigation and keyboard shortcuts (← →)
- **Real-time SSE** — watch every agent run live in the browser
- **Outreach Calendar** — month-view calendar showing all scheduled touchpoints across leads
- **AI Schedule Assistant** — chatbot (Groq LLM) answers questions about your outreach schedule
- **Mastra Studio** — visual agent/workflow debugger at `localhost:4111`
- **Simulate Reply** — test Agent 9 sentiment classification and Agent 10 weight updates from the UI
- **Learning Loop** — Agent 10 adjusts 9 scoring dimension weights after every outcome

---

## Setup

### 1. Clone & install

```bash
git clone https://github.com/ritwikmohanty/HackX
cd HackX

# Server
cd server && npm install

# Client
cd ../client && npm install
```

### 2. Configure environment

Create `server/.env`:

```env
# LLM — Groq (free, generous limits)
GROQ_API_KEY=your_key              # https://console.groq.com

# Enrichment & Signals
APOLLO_API_KEY=your_key            # https://app.apollo.io → Settings → API Keys
TAVILY_API_KEY=your_key            # https://tavily.com

# Outreach (optional — simulation mode covers these)
RESEND_API_KEY=your_key            # https://resend.com
HEYREACH_API_KEY=your_key          # https://heyreach.io
AISENSY_API_KEY=your_key           # https://aisensy.com

# Database
MONGO_URI=mongodb://localhost:27017
MONGO_DB_NAME=nerve

# Set true to mock all external calls (safe for demos)
SIMULATION_MODE=false

PORT=3001
CLIENT_URL=http://localhost:5173
```

### 3. Run

```bash
# Terminal 1 — Server (from /server)
npm start
# or: npx tsx src/index.ts

# Terminal 2 — Client (from /client)
npm run dev

# Terminal 3 — Mastra Studio (optional, from /HackX root)
npx mastra dev
```

| Service | URL |
|---------|-----|
| API Server | `http://localhost:3001` |
| Frontend | `http://localhost:5173` |
| Mastra Studio | `http://localhost:4111` |

---

## Frontend Pages

| Route | Page |
|-------|------|
| `/` | Landing page |
| `/dashboard` | Command Center — all leads with status |
| `/dashboard/new` | New Mission — targeted or discovery mode form |
| `/dashboard/pipeline/:id` | Pipeline — 7-phase agent visualizer with live SSE |
| `/dashboard/activity` | Activity log |
| `/dashboard/calendar` | Outreach Calendar + AI Schedule Chatbot |
| `/dashboard/settings` | Settings |

---

## API Reference

### Health
```
GET /api/health
```
Returns server status, simulation mode, connected SSE clients, and API key presence flags.

---

### Mode 1 — Targeted (you pick the company)
```
POST /api/leads/execute
{
  "companyName": "Stripe",
  "contactName": "Patrick Collison",    // optional — Apollo fills gaps
  "contactTitle": "CEO",
  "contactEmail": "...",                // optional
  "contactLinkedIn": "...",             // optional
  "location": "San Francisco",
  "additionalContext": "..."            // optional
}
```
Returns `{ pipelineId, leadId, status: "started" }` immediately. Pipeline runs async.

---

### Mode 2 — Discovery (AI finds companies)
```
POST /api/leads/discover
{
  "productName": "CortexReach",
  "productDescription": "Autonomous B2B outreach engine",
  "targetIndustries": ["SaaS", "FinTech"],
  "targetGeographies": ["India", "US"],
  "targetCompanySize": "50-200",        // optional
  "idealCustomerProfile": "...",        // optional
  "maxResults": 5
}
```

---

### Lead state
```
GET /api/leads/:id      # Full pipeline output for one lead
GET /api/leads          # All leads
```

---

### Real-time events (SSE)
```
GET /api/events?leadId=<id>
```

| Event type | When |
|------------|------|
| `connected` | On SSE connect |
| `agent_status` | Agent starts/completes |
| `score_update` | Intent score ready |
| `strategy_update` | Strategy decided |
| `content_update` | Messages generated |
| `delivery_update` | Messages dispatched |
| `response_update` | Sentiment classified |
| `branch_decision` | Cadence branch chosen |
| `pipeline_complete` | All 10 agents done |
| `error` | Any agent failure |

---

### Response webhook (for real replies)
```
POST /api/webhook/response
{
  "leadId": "...",
  "channel": "email",
  "messageBody": "Thanks, let's talk"
}
```
Triggers Agent 9 (sentiment classification) → Agent 10 (learning weight update).

---

### Calendar
```
GET  /api/calendar/events        # All scheduled touchpoints across all leads
POST /api/calendar/chat          # AI chatbot for schedule queries
     { "message": "What's scheduled this week?" }
```

---

### Simulation toggle
```
POST /api/config/simulation
{ "enabled": true }
```

---

## Agents

| # | Name | Input | Output | Key behaviour |
|---|------|-------|--------|--------------|
| 1 | **Lead Ingestion** | `TargetedInput` or `DiscoveryInput` | `EnrichedLead[]` | Apollo enrichment (targeted) or Groq LLM company discovery from a 20+ company pool across 7 industries. Deduplicates by company domain hash. |
| 2 | **Signal Scout** | `EnrichedLead` | `SignalBundle` | Tavily web search for hiring spikes, funding rounds, product launches, exec hires, LinkedIn activity. 18 unique signal types across 6 pools. |
| 3 | **Intent Scorer** | `EnrichedLead`, `SignalBundle` | `IntentScore` | 9-dimension weighted scoring → 0–100 composite + tier (HOT/WARM/COOL/COLD). Dimensions: ICP fit, seniority, geography, industry, company size, funding stage, signal strength, LinkedIn activity, engagement history. |
| 4 | **Persona Analyst** | `EnrichedLead` | `PersonaProfile` | Groq LLM classifies contact into one of 4 archetypes (strategic_executive, practitioner, innovator, networker). Returns tone guidance and messaging avoidances. |
| 5 | **Strategy Commander** | `EnrichedLead`, `SignalBundle`, `IntentScore`, `PersonaProfile` | `OutreachStrategy` | Picks primary channel (LinkedIn/email/WhatsApp), send timing (IST-aware), tone framework, and full 3-touch cadence with ISO `scheduledAt` timestamps. |
| 6 | **Content Forge** | All prior outputs | `GeneratedContent` | Groq LLM generates 3 personalised touch messages + LinkedIn thought leadership post + headline suggestion. Signal-aware, industry-specific templates. |
| 7 | **Explainer** | All prior outputs | `DecisionRationale` | Plain-English rationale for every agent decision. Provides confidence scores, decision summaries, and React Flow graph data for the Decision Theatre UI. |
| 8 | **Delivery** | `OutreachStrategy`, `GeneratedContent` | `DeliveryResult[]` | Routes Touch 1 via Resend (email), HeyReach (LinkedIn), or AiSensy (WhatsApp). Queues Touches 2–3. Returns provider message IDs. |
| 9 | **Response Monitor** | `leadId`, `channel`, `messageBody?` | `ResponseEvent` | Keyword + Groq LLM sentiment classification → positive/neutral/negative/no_reply. Deterministic distribution in simulation: 15% positive, 10% negative, 25% neutral, 50% no_reply. |
| 10 | **Learning Loop** | `ResponseEvent`, `IntentScore`, `OutreachStrategy`, `PersonaProfile` | `LearningResult` | Updates 9 scoring dimension weights based on outcome. Records heuristic and tone rule adjustments for compounding improvement across campaigns. |

---

### Conditional branches after Agent 9

| Sentiment | Action | Behaviour |
|-----------|--------|-----------|
| `positive` | `escalate_human` | Stop cadence, hand off to human sales rep |
| `negative` | `cancel_sequence` | Mark lead as do-not-contact, stop all outreach |
| `neutral` | `continue_cadence` | Proceed with Touch 2 / Touch 3 |
| `no_reply` | `nurture` | Move lead to long-term drip sequence |

---

## Database

MongoDB at `mongodb://localhost:27017`, database name `nerve`.

| Collection | Contents |
|------------|----------|
| `leads` | Enriched lead records |
| `campaigns` | Pipeline run state per lead |
| `agent_runs` | Every agent execution with JSON output |
| `signals` | Signal bundles from Agent 2 |
| `intent_scores` | Composite scores from Agent 3 |
| `persona_profiles` | Archetype profiles from Agent 4 |
| `strategies` | Outreach strategies + cadence from Agent 5 |
| `generated_content` | Touch messages + LinkedIn posts from Agent 6 |
| `delivery_logs` | Delivery receipts from Agent 8 |
| `response_events` | Sentiment events from Agent 9 |
| `learning_history` | Weight update history from Agent 10 |
| `scoring_weights` | Current live scoring weights (updated by Agent 10) |

---

## Mastra Studio

NERVE agents and the full pipeline workflow are registered with Mastra for visual debugging.

```bash
npx mastra dev    # from /HackX root
# → http://localhost:4111
```

The Mastra Studio lets you inspect agent inputs/outputs, replay individual steps, and visualise the `nervePipeline` workflow DAG.

---

## Notes

- **Groq free tier** is generous (14,400 req/day, 500k tokens/min for Llama 3.3 70B). Production load may need a paid key.
- **HeyReach** requires a connected LinkedIn account in the HeyReach dashboard before `AddLeadsToCampaign` works.
- **Resend** free tier only sends from `onboarding@resend.dev`. Add a verified domain for a custom sender address.
- **AiSensy** WhatsApp requires an approved message template. Leave `AISENSY_API_KEY` empty to skip WhatsApp entirely.
- **MongoDB** must be running locally before starting the server (`mongod` or MongoDB Compass).
- **Simulation mode** (`SIMULATION_MODE=true`) mocks all external API calls (Apollo, Tavily, Resend, HeyReach, AiSensy) and produces identical payload shapes — all downstream agents and the UI work normally.
