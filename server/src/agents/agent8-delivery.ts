import { nanoid } from "nanoid";
import { config } from "../config.js";
import { db } from "../db/index.js";
import { deliveryLogs } from "../db/schema.js";
import { sseManager } from "../lib/sse.js";
import type {
  EnrichedLead,
  OutreachStrategy,
  GeneratedContent,
  DeliveryResult,
  OutreachChannel,
  TouchContent,
} from "../types/index.js";

const AGENT_NUMBER = 8;
const AGENT_NAME = "Delivery Agent";

// ─── Resend (Email) ───

async function sendViaResend(
  lead: EnrichedLead,
  touch: TouchContent
): Promise<DeliveryResult> {
  const now = new Date().toISOString();

  if (config.simulationMode || !config.resendApiKey) {
    return simulateDelivery(lead.id, touch.touchNumber, "email", "Email simulated — Resend");
  }

  try {
    const toEmail = lead.contactEmail || `${lead.contactName.toLowerCase().replace(/\s+/g, ".")}@${lead.companyDomain || "example.com"}`;

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${config.resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "onboarding@resend.dev", // Resend's free-tier verified sender
        to: [toEmail],
        subject: touch.subject || `Quick note for ${lead.contactName}`,
        html: touch.body.replace(/\n/g, "<br>"),
      }),
    });

    const data = (await response.json()) as { id?: string; statusCode?: number; message?: string };

    if (response.ok && data.id) {
      return {
        leadId: lead.id,
        touchNumber: touch.touchNumber,
        channel: "email",
        status: "sent",
        messageId: data.id,
        sentAt: now,
        simulationMode: false,
        rawApiResponse: data,
      };
    }

    console.warn(`Resend API error: ${response.status} — ${data.message || "unknown"}`);
    return {
      leadId: lead.id,
      touchNumber: touch.touchNumber,
      channel: "email",
      status: "failed",
      sentAt: now,
      simulationMode: false,
      rawApiResponse: data,
    };
  } catch (error) {
    console.warn("Resend delivery error:", error);
    return {
      leadId: lead.id,
      touchNumber: touch.touchNumber,
      channel: "email",
      status: "failed",
      sentAt: now,
      simulationMode: false,
      rawApiResponse: { error: String(error) },
    };
  }
}

// ─── HeyReach (LinkedIn DM) ───

async function sendViaHeyReach(
  lead: EnrichedLead,
  touch: TouchContent
): Promise<DeliveryResult> {
  const now = new Date().toISOString();

  if (config.simulationMode || !config.heyreachApiKey) {
    return simulateDelivery(lead.id, touch.touchNumber, "linkedin_dm", "LinkedIn DM simulated — HeyReach");
  }

  try {
    // HeyReach flow: Add lead to a campaign via AddLeadsToCampaign
    // This requires a campaignId. First check for existing campaigns.
    const campaignsRes = await fetch("https://api.heyreach.io/api/public/campaign/getall", {
      method: "POST",
      headers: {
        "X-API-KEY": config.heyreachApiKey,
        "Content-Type": "application/json",
      },
      body: "{}",
    });

    const campaignsData = (await campaignsRes.json()) as {
      totalCount: number;
      items: Array<{ id: number; name: string }>;
    };

    if (!campaignsRes.ok || campaignsData.totalCount === 0) {
      // No campaigns — can't send DMs without a campaign configured in HeyReach dashboard
      console.warn("HeyReach: No campaigns found. Create a campaign at app.heyreach.io first.");
      return {
        leadId: lead.id,
        touchNumber: touch.touchNumber,
        channel: "linkedin_dm",
        status: "queued",
        sentAt: now,
        simulationMode: false,
        rawApiResponse: { note: "No HeyReach campaigns configured — message queued for manual send" },
      };
    }

    // Use first campaign
    const campaignId = campaignsData.items[0].id;
    const linkedInUrl = lead.contactLinkedIn || `https://linkedin.com/in/${lead.contactName.toLowerCase().replace(/\s+/g, "-")}`;

    // Add lead to campaign — this triggers the campaign's automated sequence
    const addRes = await fetch("https://api.heyreach.io/api/public/campaign/AddLeadsToCampaign", {
      method: "POST",
      headers: {
        "X-API-KEY": config.heyreachApiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        campaignId,
        AccountLeadPairs: [
          {
            leads: [
              {
                linkedInUrl,
                firstName: lead.contactName.split(" ")[0],
                lastName: lead.contactName.split(" ").slice(1).join(" ") || "",
                companyName: lead.companyName,
                title: lead.contactTitle,
              },
            ],
          },
        ],
      }),
    });

    const addData = await addRes.json();

    if (addRes.ok) {
      return {
        leadId: lead.id,
        touchNumber: touch.touchNumber,
        channel: "linkedin_dm",
        status: "queued",
        messageId: `heyreach-${campaignId}-${nanoid(6)}`,
        sentAt: now,
        simulationMode: false,
        rawApiResponse: addData,
      };
    }

    console.warn(`HeyReach API error: ${addRes.status}`, addData);
    return {
      leadId: lead.id,
      touchNumber: touch.touchNumber,
      channel: "linkedin_dm",
      status: "failed",
      sentAt: now,
      simulationMode: false,
      rawApiResponse: addData,
    };
  } catch (error) {
    console.warn("HeyReach delivery error:", error);
    return {
      leadId: lead.id,
      touchNumber: touch.touchNumber,
      channel: "linkedin_dm",
      status: "failed",
      sentAt: now,
      simulationMode: false,
      rawApiResponse: { error: String(error) },
    };
  }
}

// ─── AiSensy (WhatsApp) ───

async function sendViaAisensy(
  lead: EnrichedLead,
  touch: TouchContent
): Promise<DeliveryResult> {
  const now = new Date().toISOString();

  if (config.simulationMode || !config.aisensyApiKey) {
    return simulateDelivery(lead.id, touch.touchNumber, "whatsapp", "WhatsApp simulated — AiSensy");
  }

  try {
    // AiSensy API: Send template or session message
    const phone = lead.contactPhone || "";
    if (!phone) {
      return {
        leadId: lead.id,
        touchNumber: touch.touchNumber,
        channel: "whatsapp",
        status: "failed",
        sentAt: now,
        simulationMode: false,
        rawApiResponse: { error: "No phone number available" },
      };
    }

    const response = await fetch("https://backend.aisensy.com/campaign/t1/api/v2", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        apiKey: config.aisensyApiKey,
        campaignName: `NERVE-Touch-${touch.touchNumber}-${nanoid(4)}`,
        destination: phone,
        userName: lead.contactName,
        templateParams: [touch.body.slice(0, 1024)],
        source: "NERVE Engine",
        media: {},
      }),
    });

    const data = await response.json();

    if (response.ok) {
      return {
        leadId: lead.id,
        touchNumber: touch.touchNumber,
        channel: "whatsapp",
        status: "sent",
        messageId: `aisensy-${nanoid(8)}`,
        sentAt: now,
        simulationMode: false,
        rawApiResponse: data,
      };
    }

    return {
      leadId: lead.id,
      touchNumber: touch.touchNumber,
      channel: "whatsapp",
      status: "failed",
      sentAt: now,
      simulationMode: false,
      rawApiResponse: data,
    };
  } catch (error) {
    console.warn("AiSensy delivery error:", error);
    return {
      leadId: lead.id,
      touchNumber: touch.touchNumber,
      channel: "whatsapp",
      status: "failed",
      sentAt: now,
      simulationMode: false,
      rawApiResponse: { error: String(error) },
    };
  }
}

// ─── Simulation Helper ───

function simulateDelivery(
  leadId: string,
  touchNumber: number,
  channel: OutreachChannel,
  note: string
): DeliveryResult {
  return {
    leadId,
    touchNumber,
    channel,
    status: "simulated",
    messageId: `sim-${channel}-${nanoid(8)}`,
    sentAt: new Date().toISOString(),
    simulationMode: true,
    rawApiResponse: {
      note,
      simulatedAt: new Date().toISOString(),
      wouldHaveSent: true,
    },
  };
}

// ─── Channel Router ───

async function deliverTouch(
  lead: EnrichedLead,
  touch: TouchContent
): Promise<DeliveryResult> {
  switch (touch.channel) {
    case "email":
      return sendViaResend(lead, touch);
    case "linkedin_dm":
      return sendViaHeyReach(lead, touch);
    case "whatsapp":
      return sendViaAisensy(lead, touch);
    default:
      return simulateDelivery(lead.id, touch.touchNumber, touch.channel, "Unknown channel");
  }
}

// ─── Main Agent Function ───

export async function runDeliveryAgent(
  lead: EnrichedLead,
  strategy: OutreachStrategy,
  content: GeneratedContent
): Promise<DeliveryResult[]> {
  const startTime = Date.now();

  sseManager.emitAgentStatus(lead.id, AGENT_NUMBER, AGENT_NAME, "running");

  try {
    const results: DeliveryResult[] = [];

    // Deliver Touch 1 immediately
    // Touches 2 and 3 are scheduled for later — store them as "queued"
    for (const touch of content.touches) {
      let result: DeliveryResult;

      if (touch.touchNumber === 1) {
        // Send Touch 1 now
        result = await deliverTouch(lead, touch);
      } else {
        // Queue subsequent touches (in production, a scheduler would pick these up)
        result = {
          leadId: lead.id,
          touchNumber: touch.touchNumber,
          channel: touch.channel,
          status: config.simulationMode ? "simulated" : "queued",
          messageId: `queued-t${touch.touchNumber}-${nanoid(6)}`,
          sentAt: new Date().toISOString(),
          simulationMode: config.simulationMode,
          rawApiResponse: {
            note: `Touch ${touch.touchNumber} scheduled for Day +${strategy.cadence.find((c) => c.touchNumber === touch.touchNumber)?.dayOffset || "?"}`,
            scheduledAt: strategy.cadence.find((c) => c.touchNumber === touch.touchNumber)?.scheduledAt,
          },
        };
      }

      // Persist to DB
      db.insert(deliveryLogs)
        .values({
          id: nanoid(),
          leadId: lead.id,
          touchNumber: result.touchNumber,
          channel: result.channel,
          status: result.status,
          messageId: result.messageId || null,
          sentAt: result.sentAt,
          simulationMode: result.simulationMode,
          rawResponse: JSON.stringify(result.rawApiResponse),
        })
        .run();

      results.push(result);

      // Emit per-touch delivery event
      sseManager.emit("delivery_update", lead.id, result);
    }

    const durationMs = Date.now() - startTime;
    const sentCount = results.filter((r) => r.status === "sent" || r.status === "simulated").length;
    const queuedCount = results.filter((r) => r.status === "queued").length;
    const failedCount = results.filter((r) => r.status === "failed").length;

    const summary = `${sentCount} sent, ${queuedCount} queued, ${failedCount} failed | ${config.simulationMode ? "SIMULATION" : "LIVE"}`;

    sseManager.emitAgentStatus(lead.id, AGENT_NUMBER, AGENT_NAME, "complete", summary);

    console.log(`✅ Agent 8 complete in ${durationMs}ms — ${summary}`);
    return results;
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : "Unknown error";
    sseManager.emitAgentStatus(lead.id, AGENT_NUMBER, AGENT_NAME, "error", undefined, errMsg);
    throw error;
  }
}
