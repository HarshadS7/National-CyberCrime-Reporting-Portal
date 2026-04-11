# NERVE — Autonomous Outreach Engine

10-agent pipeline that finds, scores, writes, and delivers B2B outreach. Zero human input after trigger.

```
Lead Ingestion → Signal Scout → Intent Scorer ┐
                                Persona Analyst ┘→ Strategy Commander
                                                 → Content Forge ┐
                                                   Explainer     ┘→ Delivery → Response Monitor → Learning Loop
```

---

## Stack

| Layer | Tech |
|-------|------|
| Server | Hono v4 + Node.js (ESM) |
| Database | SQLite + Drizzle ORM |
| LLM | Gemini 2.0 Flash (`@ai-sdk/google`) |
| Enrichment | Apollo.io API |
| Signals | Tavily Search API |
| Email delivery | Resend |
| LinkedIn outreach | HeyReach |
| WhatsApp | AiSensy |
| Real-time events | Server-Sent Events (SSE) |
| Frontend | React + Vite + shadcn/ui |

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

```bash
cp server/.env.example server/.env   # or create manually
```

```env
# Required
GEMINI_API_KEY=your_key              # https://aistudio.google.com
APOLLO_API_KEY=your_key              # https://app.apollo.io → Settings → API Keys
TAVILY_API_KEY=your_key              # https://tavily.com

# Optional (simulation mode covers these)
RESEND_API_KEY=your_key              # https://resend.com
HEYREACH_API_KEY=your_key           # https://heyreach.io
AISENSY_API_KEY=your_key            # https://aisensy.com

# Set true to mock all external calls (safe for demos)
SIMULATION_MODE=true

PORT=3001
CLIENT_URL=http://localhost:5173
```

### 3. Run

```bash
# Server (from /server)
npx tsx src/index.ts

# Client (from /client)
npm run dev
```

Server: `http://localhost:3001`  
Client: `http://localhost:5173`

---

## API

### Health
```
GET /api/health
```

### Mode 1 — Targeted (you pick the company)
```
POST /api/leads/execute
{
  "companyName": "Stripe",
  "contactName": "Patrick Collison",   // optional — Apollo fills gaps
  "contactTitle": "CEO",
  "location": "San Francisco"
}
```
Returns `{ pipelineId, status: "started" }` immediately. Pipeline runs async — stream events via SSE.

### Mode 2 — Discovery (AI finds companies)
```
POST /api/leads/discover
{
  "productName": "CortexReach",
  "productDescription": "Autonomous B2B outreach engine",
  "targetIndustries": ["SaaS", "FinTech"],
  "targetGeographies": ["India", "US"],
  "maxResults": 5
}
```

### Lead state (full pipeline output)
```
GET /api/leads/:id
GET /api/leads
```

### Real-time events (SSE)
```
GET /api/events?leadId=<id>
```
Event types: `agent_status`, `score_update`, `strategy_update`, `content_update`, `delivery_update`, `response_update`, `branch_decision`, `pipeline_complete`, `error`

### Response webhook (for real replies)
```
POST /api/webhook/response
{
  "leadId": "...",
  "channel": "email",
  "messageBody": "Thanks, let's talk"
}
```
Triggers Agent 9 (sentiment) → Agent 10 (learning).

### Simulation toggle
```
POST /api/config/simulation
{ "enabled": true }
```

---

## Agents

| # | Name | What it does |
|---|------|-------------|
| 1 | Lead Ingestion | Apollo enrichment (targeted) or AI company discovery (discovery mode) |
| 2 | Signal Scout | Tavily web search — hiring, funding, news, product launches |
| 3 | Intent Scorer | 9-dimension weighted scoring → 0–100 composite, tier: HOT/WARM/COOL/COLD |
| 4 | Persona Analyst | Gemini classifies contact archetype → tone strategy |
| 5 | Strategy Commander | Picks channel (LinkedIn/email/WhatsApp), timing (IST-aware), cadence (3-touch) |
| 6 | Content Forge | Gemini generates per-touch messages + LinkedIn post + headline |
| 7 | Explainer | Plain-English rationale + React Flow graph data for Decision Theatre |
| 8 | Delivery | Routes Touch 1 via Resend/HeyReach/AiSensy, queues Touches 2–3 |
| 9 | Response Monitor | Keyword + LLM sentiment → positive/neutral/negative/no_reply |
| 10 | Learning Loop | Updates `scoring_weights` table based on outcome |

### Conditional branches after Agent 9
| Sentiment | Action |
|-----------|--------|
| positive | `escalate_human` — stop cadence, hand to sales |
| negative | `cancel_sequence` — mark do-not-contact |
| neutral | `continue_cadence` — queue Touch 2/3 |
| no_reply | `nurture` — enter long-term drip |

---

## Database

SQLite at `server/nerve.db` — auto-created on first run.

Tables: `leads`, `campaigns`, `agent_runs`, `signals`, `intent_scores`, `persona_profiles`, `strategies`, `generated_content`, `delivery_logs`, `response_events`, `learning_history`, `scoring_weights`

---

## Notes

- **Gemini free tier** hits quota fast. Add a paid key or keep `SIMULATION_MODE=true` for demos. Simulation fallbacks produce identical payload shapes — all downstream agents work normally.
- **HeyReach** requires a connected LinkedIn account in the dashboard before `AddLeadsToCampaign` works.
- **Resend** free tier only sends from `onboarding@resend.dev`. Add a verified domain for custom sender.
- **AiSensy** WhatsApp requires an approved template. Leave key empty to skip.
