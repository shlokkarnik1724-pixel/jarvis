import type {
  ActivityItem,
  Connector,
  Conversation,
  IngestionEvent,
  Membership,
  OpsRequest,
  Organization,
  RoutingItem,
  Skill,
  SkillVersion,
  User,
} from "./types";
import { id, now } from "./db";
import { CONNECTOR_CATALOG } from "./config";
import { withSop } from "./sop";
import { analyzeAndCorrectRequest } from "./ops-engine";

function minutesAgo(mins: number): string {
  return new Date(Date.now() - mins * 60_000).toISOString();
}

export const DEMO_EMAIL = "investor@demo.tactix.ai";
export const DEMO_PASSWORD = "demo1234";

const THREADS = {
  discount: `Alex (AE): Enterprise prospect wants 20% off to close this quarter.
Jordan (Manager): Cap at 15% for Enterprise — no manager sign-off needed under that. Above 15% escalate to me. Put an expiry on the exception when you log it.
Alex: Got it — locking 15% for Acme.`,

  refund: `Priya (Support): Customer #4821 is asking for a full refund 45 days after purchase — our window is 30 days, but they're Enterprise and had a 2-day outage.
Marcus (CS Lead): For Enterprise accounts impacted by a P1 outage, we can approve a full refund even outside the 30-day window. Document it as an exception and CC finance.
Priya: Perfect — I'll process the refund and note the P1 exception.`,

  escalate: `Sam (L1): VIP account NovaCorp says checkout is broken in production. Should I escalate?
Riley (On-call): Yes — any VIP or Enterprise with a blocking issue escalates to on-call immediately. First customer update within 15 minutes.
Sam: Escalating now and sending the status note.`,

  incident: `DevOps Bot: SEV-2 declared — payments latency > 3s in us-east.
Casey (SRE): Runbook: flip traffic to us-west standby, page payments owner, post status every 10 minutes until green.
Morgan: Following that — standby cutover started.`,

  zoom: `[Zoom transcript · QBR]
CEO: We need a single place that knows our discount rules, escalations, and refund exceptions.
COO: Right now that lives in Slack, Teams, Zoho tickets, and a Sheet called Policy Matrix.
Head of Support: If the brain can route VIP issues to Riley automatically, we save hours.`,
};

export function buildDemoSeed(userId: string) {
  const createdAt = now();
  const org: Organization = {
    id: id("org"),
    name: "Acme Inc (Demo)",
    industry: "SaaS",
    teamSize: "51-300",
    primaryUseCase: "Support Ops",
    inviteCode: "TX-DEMOACME01",
    createdBy: userId,
    createdAt,
  };

  const membership: Membership = {
    id: id("mem"),
    userId,
    organizationId: org.id,
    role: "admin",
    createdAt,
  };

  const connectedProviders = new Set([
    "slack",
    "google_sheets",
    "freshdesk",
    "looker",
    "whatsapp",
    "microsoft_teams",
    "zoom",
    "manual",
  ]);

  const connectors: Connector[] = CONNECTOR_CATALOG.map((c) => ({
    id: id("conn"),
    organizationId: org.id,
    provider: c.provider,
    name: c.name,
    status: connectedProviders.has(c.provider) ? "connected" : "disconnected",
    lastSyncedAt: connectedProviders.has(c.provider) ? minutesAgo(20) : null,
    meta: { blurb: c.blurb, category: c.category },
    createdAt,
  }));

  const byProvider = Object.fromEntries(
    connectors.map((c) => [c.provider, c.id])
  );

  const conversations: Conversation[] = [
    {
      id: id("conv"),
      organizationId: org.id,
      dataSourceId: byProvider.slack,
      connectorId: byProvider.slack,
      rawText: THREADS.discount,
      sourceRef: "Slack #sales-questions",
      createdAt: minutesAgo(120),
    },
    {
      id: id("conv"),
      organizationId: org.id,
      dataSourceId: byProvider.slack,
      connectorId: byProvider.slack,
      rawText: THREADS.refund,
      sourceRef: "Slack #support-escalations",
      createdAt: minutesAgo(85),
    },
    {
      id: id("conv"),
      organizationId: org.id,
      dataSourceId: byProvider.microsoft_teams,
      connectorId: byProvider.microsoft_teams,
      rawText: THREADS.escalate,
      sourceRef: "Teams · VIP Support",
      createdAt: minutesAgo(40),
    },
    {
      id: id("conv"),
      organizationId: org.id,
      dataSourceId: byProvider.zoho,
      connectorId: byProvider.zoho,
      rawText: THREADS.incident,
      sourceRef: "Zoho Desk · SEV-2",
      createdAt: minutesAgo(18),
    },
    {
      id: id("conv"),
      organizationId: org.id,
      dataSourceId: byProvider.zoom,
      connectorId: byProvider.zoom,
      rawText: THREADS.zoom,
      sourceRef: "Zoom · QBR transcript",
      createdAt: minutesAgo(10),
    },
  ];

  const skillDefs = [
    {
      conversationId: conversations[0].id,
      status: "approved" as const,
      confidence: 0.91,
      category: "Discounting" as const,
      title: "Enterprise Tier Discount Exception",
      schema: {
        title: "Enterprise Tier Discount Exception",
        condition: "Customer Tier = Enterprise",
        action: "Permit up to 15% discount without manager sign-off",
        category: "Discounting" as const,
        confidence: 0.91,
        source_excerpt:
          "Jordan (Manager): Cap at 15% for Enterprise — no manager sign-off needed under that.",
        flagged_fields: ["approval_expiry_date missing"],
      },
      updatedAt: minutesAgo(110),
      createdAt: minutesAgo(118),
    },
    {
      conversationId: conversations[1].id,
      status: "approved" as const,
      confidence: 0.88,
      category: "Refunds" as const,
      title: "Enterprise P1 Outage Refund Exception",
      schema: {
        title: "Enterprise P1 Outage Refund Exception",
        condition:
          "Customer is Enterprise AND request is outside the 30-day window AND a P1 outage impacted them",
        action:
          "Approve full refund as a documented exception and CC finance",
        category: "Refunds" as const,
        confidence: 0.88,
        source_excerpt:
          "Marcus (CS Lead): For Enterprise accounts impacted by a P1 outage, we can approve a full refund even outside the 30-day window.",
        flagged_fields: [],
      },
      updatedAt: minutesAgo(70),
      createdAt: minutesAgo(82),
    },
    {
      conversationId: conversations[2].id,
      status: "pending" as const,
      confidence: 0.84,
      category: "Escalation" as const,
      title: "VIP Blocking Issue Escalation",
      schema: {
        title: "VIP Blocking Issue Escalation",
        condition: "VIP or Enterprise customer reports a blocking issue",
        action:
          "Escalate to on-call immediately and send first customer update within 15 minutes",
        category: "Escalation" as const,
        confidence: 0.84,
        source_excerpt:
          "Riley (On-call): Yes — any VIP or Enterprise with a blocking issue escalates to on-call immediately.",
        flagged_fields: [],
      },
      updatedAt: minutesAgo(35),
      createdAt: minutesAgo(38),
    },
    {
      conversationId: conversations[3].id,
      status: "pending" as const,
      confidence: 0.79,
      category: "Incident Response" as const,
      title: "Payments Latency SEV-2 Cutover",
      schema: {
        title: "Payments Latency SEV-2 Cutover",
        condition: "Payments latency exceeds 3s in a primary region (SEV-2)",
        action:
          "Flip traffic to standby region, page payments owner, post status every 10 minutes until green",
        category: "Incident Response" as const,
        confidence: 0.79,
        source_excerpt:
          "Casey (SRE): Runbook: flip traffic to us-west standby, page payments owner, post status every 10 minutes until green.",
        flagged_fields: ["severity_threshold not explicit beyond SEV-2 label"],
      },
      updatedAt: minutesAgo(12),
      createdAt: minutesAgo(15),
    },
  ];

  const skills: Skill[] = [];
  const skillVersions: SkillVersion[] = [];

  for (const def of skillDefs) {
    const skillId = id("skl");
    const schema = withSop(def.schema);
    skills.push({
      id: skillId,
      organizationId: org.id,
      conversationId: def.conversationId,
      title: def.title,
      jsonSchema: schema,
      status: def.status,
      confidence: def.confidence,
      category: def.category,
      validFrom: def.createdAt,
      validTo: null,
      supersededBy: null,
      createdAt: def.createdAt,
      updatedAt: def.updatedAt,
    });
    skillVersions.push({
      id: id("ver"),
      skillId,
      jsonSchema: schema,
      editedBy: userId,
      createdAt: def.createdAt,
    });
  }

  // Bi-temporal example: older discount cap superseded by current 15% rule
  const legacyId = id("skl");
  const currentDiscount = skills.find((s) => s.category === "Discounting");
  if (currentDiscount) {
    skills.push({
      id: legacyId,
      organizationId: org.id,
      conversationId: conversations[0].id,
      title: "Legacy Enterprise Discount Cap (10%)",
      jsonSchema: withSop({
        title: "Legacy Enterprise Discount Cap (10%)",
        condition: "Customer Tier = Enterprise",
        action: "Permit up to 10% discount without manager sign-off",
        category: "Discounting",
        confidence: 0.9,
        source_excerpt: "Old policy: Enterprise capped at 10%.",
        flagged_fields: [],
      }),
      status: "superseded",
      confidence: 0.9,
      category: "Discounting",
      validFrom: minutesAgo(60 * 24 * 40),
      validTo: currentDiscount.validFrom,
      supersededBy: currentDiscount.id,
      createdAt: minutesAgo(60 * 24 * 40),
      updatedAt: currentDiscount.validFrom,
    });
  }

  const ingestionEvents: IngestionEvent[] = [
    {
      id: id("ing"),
      organizationId: org.id,
      source: "slack",
      channel: "#sales-questions",
      summary: "Passive listener extracted Enterprise discount decision",
      rawSnippet:
        "Jordan: Cap at 15% for Enterprise — no manager sign-off needed.",
      decisionDetected: true,
      skillId: currentDiscount?.id,
      createdAt: minutesAgo(118),
    },
    {
      id: id("ing"),
      organizationId: org.id,
      source: "zendesk",
      channel: "Ticket #4821",
      summary: "Zendesk thread mined for refund exception",
      rawSnippet:
        "Enterprise + P1 outage → full refund outside 30-day window.",
      decisionDetected: true,
      skillId: skills.find((s) => s.category === "Refunds")?.id,
      createdAt: minutesAgo(82),
    },
    {
      id: id("ing"),
      organizationId: org.id,
      source: "gong",
      channel: "Call · Acme QBR",
      summary: "Gong call restated discount ceiling (no new conflict)",
      rawSnippet: "We still hold Enterprise at 15% without manager.",
      decisionDetected: true,
      skillId: currentDiscount?.id,
      createdAt: minutesAgo(30),
    },
    {
      id: id("ing"),
      organizationId: org.id,
      source: "gmail",
      channel: "support-leads@",
      summary: "Email monitored — no net-new decision",
      rawSnippet: "FYI weekly VIP volume is up 12%.",
      decisionDetected: false,
      skillId: null,
      createdAt: minutesAgo(14),
    },
  ];

  const routingItems: RoutingItem[] = [
    {
      id: id("rte"),
      organizationId: org.id,
      title: "VIP checkout outage — NovaCorp",
      summary:
        "Blocking production issue from Teams VIP Support. Brain suggests escalate to Riley (on-call) within 15 min.",
      suggestedOwner: "Riley · On-call",
      channel: "Microsoft Teams",
      priority: "urgent",
      status: "open",
      sourceRef: "Teams · VIP Support",
      createdAt: minutesAgo(25),
    },
    {
      id: id("rte"),
      organizationId: org.id,
      title: "Enterprise refund exception request",
      summary:
        "Zoho ticket matches approved P1 refund skill. Route to Priya (Support) + CC Finance.",
      suggestedOwner: "Priya · Support",
      channel: "Zoho",
      priority: "high",
      status: "open",
      sourceRef: "Zoho Desk #4821",
      createdAt: minutesAgo(55),
    },
    {
      id: id("rte"),
      organizationId: org.id,
      title: "Discount approval for Acme deal",
      summary:
        "15% Enterprise discount is within approved skill — AE can proceed without manager.",
      suggestedOwner: "Alex · AE",
      channel: "Slack",
      priority: "normal",
      status: "routed",
      sourceRef: "Slack #sales-questions",
      createdAt: minutesAgo(100),
    },
  ];

  const activities: ActivityItem[] = [
    {
      id: id("act"),
      organizationId: org.id,
      message:
        "Company brain online — Slack, Sheets, Freshdesk, Looker, WhatsApp linked",
      createdAt: minutesAgo(125),
    },
    {
      id: id("act"),
      organizationId: org.id,
      message:
        'Skill approved: "Enterprise Tier Discount Exception" from Slack #sales-questions',
      createdAt: minutesAgo(110),
    },
    {
      id: id("act"),
      organizationId: org.id,
      message: "Corrected WhatsApp WISMO — missing tracking ID flagged",
      createdAt: minutesAgo(18),
    },
    {
      id: id("act"),
      organizationId: org.id,
      message: "Sheets · Shipments Tracker synced — 3 rows need AI correction",
      createdAt: minutesAgo(12),
    },
    {
      id: id("act"),
      organizationId: org.id,
      message: "Looker SLA board → ops attention (breach risk)",
      createdAt: minutesAgo(6),
    },
  ];

  const rawOps: {
    source: OpsRequest["source"];
    channel: string;
    rawText: string;
    mins: number;
  }[] = [
    {
      source: "google_sheets",
      channel: "Shipments Tracker · row 184",
      rawText:
        "Dispatch ASAP to Mumbai — 40 boxes, adress: Andheri East, pin code 40006, customer wants urgentttt delivery, no SKU listed",
      mins: 14,
    },
    {
      source: "whatsapp",
      channel: "Customer Line · +91…8821",
      rawText:
        "Hi where is my order? Pls check. I ordered last week but no update 😕",
      mins: 9,
    },
    {
      source: "slack",
      channel: "#sales-questions",
      rawText:
        "Alex: Can I give Globex 22% to close today? They're Enterprise.",
      mins: 22,
    },
    {
      source: "freshdesk",
      channel: "Ticket #90412",
      rawText:
        "Enterprise customer #4821 requesting full refund 45 days after purchase after P1 outage. Amount $2,400.",
      mins: 31,
    },
    {
      source: "looker",
      channel: "SLA Board · Support",
      rawText:
        "KPI alert: first-response SLA breach risk — VIP queue red, conversion drop on checkout funnel 18%.",
      mins: 5,
    },
    {
      source: "whatsapp",
      channel: "Driver Dispatch",
      rawText:
        "Driver: TRK-ACME441 stuck at hub, customer calling. Need reroute?",
      mins: 3,
    },
  ];

  const opsRequests: OpsRequest[] = rawOps.map((row) => {
    const analyzed = analyzeAndCorrectRequest({
      source: row.source,
      channel: row.channel,
      rawText: row.rawText,
      skills,
    });
    const ts = minutesAgo(row.mins);
    return {
      id: id("ops"),
      organizationId: org.id,
      ...analyzed,
      createdAt: ts,
      updatedAt: ts,
    };
  });

  return {
    org,
    membership,
    connectors,
    dataSources: connectors,
    conversations,
    skills,
    skillVersions,
    activities,
    routingItems,
    ingestionEvents,
    opsRequests,
    threads: THREADS,
  };
}

export function ensureDemoUserShape(
  existing: User | undefined,
  passwordHash: string
): User {
  if (existing) return existing;
  return {
    id: id("usr"),
    email: DEMO_EMAIL,
    name: "Investor Demo",
    passwordHash,
    createdAt: now(),
  };
}
