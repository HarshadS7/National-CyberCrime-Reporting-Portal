# NERVE — Autonomous Outreach Engine

## Problem Statement

B2B sales development is a constant battle between quantity and quality. Sales teams spend the majority of their time on manual, non-revenue-generating tasks: researching leads, finding contact information, searching for relevant "buy signals," and writing endless email variations. This operational drag leads to:

- **Slow Speed-to-Lead:** High-intent prospects go cold while reps are buried in research.
- **Generic Messaging:** Under pressure to hit quotas, reps fall back on generic templates that get ignored.
- **Inconsistent Execution:** The quality of outreach varies wildly from rep to rep and day to day.
- **Wasted Talent:** Skilled salespeople are stuck doing data entry instead of building relationships and closing deals.

## Our Solution

NERVE is an autonomous agentic workforce designed to automate the entire B2B outreach process from end to end. It acts as a force multiplier for your sales team, executing the time-consuming research and writing tasks with machine speed and precision.

By connecting a series of specialized AI agents, NERVE transforms a single trigger—like a company name—into a fully executed, hyper-personalized outreach campaign. It finds the lead, scores their intent, identifies the perfect moment to engage, and crafts a unique message based on real-time data.

This allows your human sales team to focus exclusively on high-value activities: engaging with warm, high-intent leads and closing deals.

---

## Architecture

NERVE is built on a distributed, event-driven architecture designed for high-throughput, autonomous B2B outreach. The system is divided into three core layers orchestrating a 10-step agent pipeline.

1. **Frontend:** A Next.js (React 19) application that provides a real-time Decision Theatre, visualizing pipeline events and agent actions via Server-Sent Events (SSE).
2. **Backend:** A Node.js API server built with Hono, responsible for orchestrating the sequential AI agents, managing integrations, and handling webhook responses.
3. **Data Layer:** MongoDB stores all lead states, generated content, delivery logs, and intelligence data (like scoring weights and personas).

**The 10-Agent Pipeline:**
Zero human input is required after the initial trigger.

```text
Lead Ingestion → Signal Scout → Intent Scorer ┐
                                Persona Analyst ┘→ Strategy Commander
                                                 → Content Forge ┐
                                                   Explainer     ┘→ Delivery → Response Monitor → Learning Loop
```

---

## Stack

| Layer | Tech |
|-------|------|
| Server | Hono v4 + Node.js |
| Database | MongoDB |
| LLM | Groq Llama 3.3 70B (`@ai-sdk/groq`) |
| Enrichment | Apollo.io API |
| Signals | Tavily Search API |
| Email delivery | Resend |
| LinkedIn outreach | HeyReach |
| WhatsApp | AiSensy |
| Real-time events | Server-Sent Events (SSE) |
| Frontend | Next.js 15 (React 19) + Tailwind CSS + shadcn/ui |

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
GROQ_API_KEY=your_key                # https://console.groq.com
APOLLO_API_KEY=your_key              # https://app.apollo.io → Settings → API Keys
TAVILY_API_KEY=your_key              # https://tavily.com
MONGO_URI=mongodb://localhost:27017  # Valid MongoDB connection string
MONGO_DB_NAME=nerve_db               # Database name

# Optional (simulation mode covers these)
RESEND_API_KEY=your_key              # https://resend.com
HEYREACH_API_KEY=your_key            # https://heyreach.io
AISENSY_API_KEY=your_key             # https://aisensy.com

# Set true to mock all external calls (safe for demos)
SIMULATION_MODE=true

PORT=3001
CLIENT_URL=http://localhost:3000
```

### 3. Run

```bash
# Server (from /server)
npm run dev

# Client (from /client)
npm run dev
```

Server: `http://localhost:3001`  
Client: `http://localhost:3000`

---

## API

### Health
```text
GET /api/health
```

### Mode 1 — Targeted (you pick the company)
```json
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
```json
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
```text
GET /api/leads/:id
GET /api/leads
```

### Real-time events (SSE)
```text
GET /api/events?leadId=<id>
```
Event types: `agent_status`, `score_update`, `strategy_update`, `content_update`, `delivery_update`, `response_update`, `branch_decision`, `pipeline_complete`, `error`

### Response webhook (for real replies)
```json
POST /api/webhook/response
{
  "leadId": "...",
  "channel": "email",
  "messageBody": "Thanks, let's talk"
}
```
Triggers Agent 9 (sentiment) → Agent 10 (learning).

### Simulation toggle
```json
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
| 4 | Persona Analyst | Groq (Llama 3.3) classifies contact archetype → tone strategy |
| 5 | Strategy Commander | Picks channel (LinkedIn/email/WhatsApp), timing (IST-aware), cadence (3-touch) |
| 6 | Content Forge | Groq (Llama 3.3) generates per-touch messages + LinkedIn post + headline |
| 7 | Explainer | Plain-English rationale + React Flow graph data for Decision Theatre |
| 8 | Delivery | Routes Touch 1 via Resend/HeyReach/AiSensy, queues Touches 2–3 |
| 9 | Response Monitor | Keyword + LLM sentiment → positive/neutral/negative/no_reply |
| 10 | Learning Loop | Updates `scoring_weights` collection based on outcome |

### Conditional branches after Agent 9
| Sentiment | Action |
|-----------|--------|
| positive | `escalate_human` — stop cadence, hand to sales |
| negative | `cancel_sequence` — mark do-not-contact |
| neutral | `continue_cadence` — queue Touch 2/3 |
| no_reply | `nurture` — enter long-term drip |

---

## Database

Data is stored in **MongoDB** tracking the pipeline's execution and states.

Collections: `leads`, `campaigns`, `agent_runs`, `signals`, `intent_scores`, `persona_profiles`, `strategies`, `generated_content`, `delivery_logs`, `response_events`, `learning_history`, `scoring_weights`

---

## Notes

- **Groq API Rate Limits:** Free tiers hit quotas fast. Add a paid key or keep `SIMULATION_MODE=true` for demos. Simulation fallbacks produce identical payload shapes — all downstream agents work normally.
- **HeyReach:** requires a connected LinkedIn account in the dashboard before `AddLeadsToCampaign` works.
- **Resend:** free tier only sends from `onboarding@resend.dev`. Add a verified domain for custom sender.
- **AiSensy:** WhatsApp requires an approved template. Leave key empty to skip.
