import type { Skill } from "./types";
import { isSkillActive } from "./graph";

export type OpsSource =
  | "slack"
  | "google_sheets"
  | "freshdesk"
  | "looker"
  | "whatsapp"
  | "email"
  | "zoom";

export type OpsRequestStatus =
  | "detected"
  | "needs_correction"
  | "corrected"
  | "approved"
  | "executing"
  | "shipped"
  | "resolved"
  | "rejected";

export type OpsPriority = "low" | "normal" | "high" | "urgent";

export interface OpsCorrection {
  field: string;
  from: string;
  to: string;
  reason: string;
}

export interface OpsShipment {
  id: string;
  stage:
    | "intake"
    | "validated"
    | "routed"
    | "in_progress"
    | "fulfilled"
    | "blocked";
  eta?: string;
  owner?: string;
  trackingNote?: string;
}

/** A live business request the company brain pulled from a source and is managing. */
export interface OpsRequest {
  id: string;
  organizationId: string;
  source: OpsSource;
  channel: string;
  title: string;
  rawText: string;
  detectedIntent: string;
  category:
    | "Shipment"
    | "Refund"
    | "Discount"
    | "Support"
    | "Analytics"
    | "Escalation"
    | "Other";
  priority: OpsPriority;
  status: OpsRequestStatus;
  confidence: number;
  corrections: OpsCorrection[];
  correctedPayload?: Record<string, string>;
  shipment?: OpsShipment;
  skillId?: string | null;
  suggestedAction: string;
  createdAt: string;
  updatedAt: string;
}

export interface SourcePulse {
  source: OpsSource;
  label: string;
  status: "online" | "syncing" | "degraded" | "offline";
  lastEventAt: string;
  eventsPerMin: number;
  highlight: string;
}

export interface BrainPulse {
  organizationId: string;
  generatedAt: string;
  neuralLoad: number;
  sourcesOnline: number;
  openRequests: number;
  correctionsToday: number;
  shipmentsInFlight: number;
  sources: SourcePulse[];
  stream: {
    id: string;
    source: OpsSource;
    message: string;
    at: string;
    tone: "info" | "warn" | "ok" | "action";
  }[];
  requests: OpsRequest[];
}

const SOURCE_META: Record<
  OpsSource,
  { label: string; channels: string[] }
> = {
  slack: { label: "Slack", channels: ["#ops", "#sales", "#support"] },
  google_sheets: {
    label: "Google Sheets",
    channels: ["Shipments Tracker", "Policy Matrix", "Refund Log"],
  },
  freshdesk: {
    label: "Freshdesk",
    channels: ["Tickets", "Priority Queue"],
  },
  looker: {
    label: "Looker Studio",
    channels: ["Ops Dashboard", "SLA Board"],
  },
  whatsapp: {
    label: "WhatsApp Web",
    channels: ["Customer Line", "Driver Dispatch"],
  },
  email: { label: "Email", channels: ["ops@", "support@"] },
  zoom: { label: "Zoom", channels: ["Standup transcript"] },
};

/** Deterministic AI that finds + corrects messy business requests across sources. */
export function analyzeAndCorrectRequest(input: {
  source: OpsSource;
  channel: string;
  rawText: string;
  skills: Skill[];
}): Omit<
  OpsRequest,
  "id" | "organizationId" | "createdAt" | "updatedAt"
> {
  const text = input.rawText;
  const lower = text.toLowerCase();
  const active = input.skills.filter((s) => isSkillActive(s));

  let category: OpsRequest["category"] = "Other";
  let detectedIntent = "Unclassified operational message";
  let priority: OpsPriority = "normal";
  let suggestedAction = "Review and route to the owning team";
  let skillId: string | null = null;
  const corrections: OpsCorrection[] = [];
  const correctedPayload: Record<string, string> = {};
  let shipment: OpsShipment | undefined;

  const shipmentHit =
    /(ship|shipment|dispatch|delivery|tracking|awb|consignment|warehouse)/i.test(
      text
    );
  const refundHit = /(refund|chargeback|money back|credit note)/i.test(text);
  const discountHit = /(discount|% off|pricing|quote)/i.test(text);
  const escalateHit = /(escalate|vip|urgent|sev-|p1|outage)/i.test(text);
  const analyticsHit = /(looker|dashboard|kpi|conversion|churn)/i.test(text);

  if (shipmentHit) {
    category = "Shipment";
    detectedIntent = "Shipment / fulfillment request";
    const qty =
      text.match(/(\d+)\s*(units|pcs|boxes|orders)/i)?.[1] ||
      text.match(/\bx(\d+)\b/i)?.[1] ||
      "1";
    const dest =
      text.match(/to\s+([A-Z][a-zA-Z]+(?:\s+[A-Z][a-zA-Z]+)?)/)?.[1] ||
      text.match(/destination[:\s]+([^\n,]+)/i)?.[1]?.trim() ||
      "Unspecified destination";

    // Common human errors the brain corrects
    if (/adress|addres\b/i.test(text)) {
      corrections.push({
        field: "address_typo",
        from: "adress/addres",
        to: "address",
        reason: "Normalized address field spelling before warehouse handoff",
      });
    }
    if (/asap|urgentttt|urgnt/i.test(text)) {
      corrections.push({
        field: "priority",
        from: "informal urgency",
        to: "high",
        reason: "Mapped slang urgency to governed priority = high",
      });
      priority = "high";
    }
    if (/\b(\d{1,2})\s*%\s*off\b/i.test(text) && !discountHit) {
      // ignore
    }
    // Missing SKU / phone patterns
    if (!/(sku|item[- ]?#|product[- ]?id)/i.test(text)) {
      corrections.push({
        field: "sku",
        from: "missing",
        to: "SKU-PENDING-REVIEW",
        reason: "No SKU found — flagged for catalog match before pick",
      });
    }
    if (/pin\s*code\s*[:=]?\s*(\d{5})\b/i.test(text)) {
      const bad = text.match(/pin\s*code\s*[:=]?\s*(\d{5})\b/i)?.[1];
      corrections.push({
        field: "postal_code",
        from: bad || "5-digit",
        to: `${bad || "00000"}0 (verify)`,
        reason: "Postal code looks incomplete — verify before carrier label",
      });
    }

    correctedPayload.quantity = qty;
    correctedPayload.destination = dest.trim();
    correctedPayload.sla_hours = priority === "high" ? "12" : "48";
    suggestedAction = `Validate shipment · qty ${qty} → ${dest.trim()} · stage to warehouse`;
    shipment = {
      id: `SHP-${qty}${dest.slice(0, 3).toUpperCase()}`,
      stage: corrections.length ? "intake" : "validated",
      eta: new Date(Date.now() + (priority === "high" ? 12 : 48) * 3600_000)
        .toISOString()
        .slice(0, 10),
      owner: "Warehouse Ops",
      trackingNote: corrections.length
        ? "Awaiting correction approval"
        : "Ready for carrier label",
    };
  } else if (refundHit) {
    category = "Refund";
    detectedIntent = "Refund / credit request";
    const skill = active.find((s) => s.category === "Refunds");
    skillId = skill?.id || null;
    if (/45\s*day|outside|past\s*30/i.test(text) && /p1|outage/i.test(text)) {
      suggestedAction =
        skill?.jsonSchema.action ||
        "Approve Enterprise P1 refund exception and CC finance";
      priority = "high";
    } else if (/45\s*day|outside|past\s*30/i.test(text)) {
      corrections.push({
        field: "policy_match",
        from: "outside standard window",
        to: "reject unless P1 exception",
        reason: "Outside 30-day window without P1 — auto-correct to deny path",
      });
      suggestedAction = "Deny standard refund; offer store credit option";
      priority = "normal";
    } else {
      suggestedAction = "Process refund within standard window";
    }
    const amount = text.match(/\$?\s*(\d+(?:\.\d{2})?)/)?.[1];
    if (amount) correctedPayload.amount = amount;
  } else if (discountHit) {
    category = "Discount";
    detectedIntent = "Pricing / discount exception";
    const skill = active.find((s) => s.category === "Discounting");
    skillId = skill?.id || null;
    const asked =
      text.match(/(\d{1,2})\s*%/i)?.[1] ||
      text.match(/(\d{1,2})\s*percent/i)?.[1];
    if (asked && Number(asked) > 15) {
      corrections.push({
        field: "discount_percent",
        from: `${asked}%`,
        to: "15% (Enterprise cap)",
        reason:
          skill?.jsonSchema.action ||
          "Enterprise policy caps at 15% without manager sign-off",
      });
      correctedPayload.discount_percent = "15";
      suggestedAction = `Correct ${asked}% → 15% and allow AE to proceed`;
      priority = "normal";
    } else {
      suggestedAction =
        skill?.jsonSchema.action || "Apply approved Enterprise discount";
      correctedPayload.discount_percent = asked || "15";
    }
  } else if (escalateHit) {
    category = "Escalation";
    detectedIntent = "VIP / incident escalation";
    const skill = active.find(
      (s) =>
        s.category === "Escalation" || s.category === "Incident Response"
    );
    skillId = skill?.id || null;
    priority = "urgent";
    suggestedAction =
      skill?.jsonSchema.action ||
      "Escalate to on-call and send customer update within 15 minutes";
  } else if (analyticsHit || input.source === "looker") {
    category = "Analytics";
    detectedIntent = "Analytics / KPI anomaly";
    if (/drop|down|spike|breach|red/i.test(lower)) {
      priority = "high";
      corrections.push({
        field: "alert_severity",
        from: "raw dashboard flag",
        to: "ops_attention",
        reason: "Looker anomaly elevated into actionable ops request",
      });
    }
    suggestedAction = "Open ops review with owning metric owner";
  } else if (input.source === "whatsapp" || input.source === "freshdesk") {
    category = "Support";
    detectedIntent = "Customer support request";
    if (/where is my (order|package|shipment)/i.test(text)) {
      category = "Shipment";
      detectedIntent = "Where-is-my-order tracking request";
      const track =
        text.match(/\b(?:TRK|AWB|ORD)[- ]?[A-Z0-9]{3,}\b/i)?.[0] ||
        "TRK-UNKNOWN";
      correctedPayload.tracking_id = track.toUpperCase();
      if (/trk-unknown|unknown/i.test(track)) {
        corrections.push({
          field: "tracking_id",
          from: "missing/unclear",
          to: "ask customer for order ID",
          reason: "Cannot locate shipment without order/tracking ID",
        });
      }
      suggestedAction = `Pull tracking for ${track.toUpperCase()} and reply on ${SOURCE_META[input.source].label}`;
      shipment = {
        id: track.toUpperCase(),
        stage: "in_progress",
        owner: "CX · WhatsApp",
        trackingNote: "Customer chase — sync carrier status",
      };
    } else {
      suggestedAction = "Draft CX reply and attach matching skill / SOP";
    }
  }

  const confidence =
    corrections.length === 0 ? 0.9 : corrections.length === 1 ? 0.82 : 0.7;
  const status: OpsRequestStatus = corrections.length
    ? "needs_correction"
    : "detected";

  return {
    source: input.source,
    channel: input.channel,
    title: titleFrom(detectedIntent, text),
    rawText: text,
    detectedIntent,
    category,
    priority,
    status,
    confidence,
    corrections,
    correctedPayload:
      Object.keys(correctedPayload).length > 0 ? correctedPayload : undefined,
    shipment,
    skillId,
    suggestedAction,
  };
}

function titleFrom(intent: string, text: string): string {
  const first = text
    .split("\n")
    .map((l) => l.trim())
    .find(Boolean);
  if (first && first.length < 80) return first.replace(/^[^:]+:\s*/, "");
  return intent;
}

export function buildSourcePulses(nowIso: string): SourcePulse[] {
  const sources: OpsSource[] = [
    "slack",
    "google_sheets",
    "freshdesk",
    "looker",
    "whatsapp",
  ];
  return sources.map((source, i) => ({
    source,
    label: SOURCE_META[source].label,
    status: i === 3 ? "syncing" : "online",
    lastEventAt: nowIso,
    eventsPerMin: [12, 4, 7, 2, 9][i],
    highlight: [
      "Decision threads in #ops",
      "Shipments Tracker rows changing",
      "Priority tickets streaming",
      "SLA board refresh",
      "Customer + dispatch chats",
    ][i],
  }));
}

export { SOURCE_META };
