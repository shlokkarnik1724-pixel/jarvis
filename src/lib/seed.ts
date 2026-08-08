import type {
  ActivityItem,
  Conversation,
  DataSource,
  Membership,
  Organization,
  Skill,
  SkillVersion,
  User,
} from "./types";
import { id, now } from "./db";

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

  const dataSources: DataSource[] = [
    {
      id: id("ds"),
      organizationId: org.id,
      type: "manual",
      name: "Paste Conversation",
      status: "connected",
      createdAt,
    },
    {
      id: id("ds"),
      organizationId: org.id,
      type: "slack",
      name: "Slack · #support-escalations",
      status: "connected",
      createdAt,
    },
    {
      id: id("ds"),
      organizationId: org.id,
      type: "zendesk",
      name: "Zendesk",
      status: "coming_soon",
      createdAt,
    },
    {
      id: id("ds"),
      organizationId: org.id,
      type: "email",
      name: "Gmail / Outlook",
      status: "coming_soon",
      createdAt,
    },
    {
      id: id("ds"),
      organizationId: org.id,
      type: "fireflies",
      name: "Fireflies / Gong",
      status: "coming_soon",
      createdAt,
    },
  ];

  const slackDs = dataSources[1].id;
  const manualDs = dataSources[0].id;

  const conversations: Conversation[] = [
    {
      id: id("conv"),
      organizationId: org.id,
      dataSourceId: slackDs,
      rawText: THREADS.discount,
      sourceRef: "Slack #sales-questions",
      createdAt: minutesAgo(120),
    },
    {
      id: id("conv"),
      organizationId: org.id,
      dataSourceId: slackDs,
      rawText: THREADS.refund,
      sourceRef: "Slack #support-escalations",
      createdAt: minutesAgo(85),
    },
    {
      id: id("conv"),
      organizationId: org.id,
      dataSourceId: slackDs,
      rawText: THREADS.escalate,
      sourceRef: "Slack #vip-support",
      createdAt: minutesAgo(40),
    },
    {
      id: id("conv"),
      organizationId: org.id,
      dataSourceId: manualDs,
      rawText: THREADS.incident,
      sourceRef: "Incident channel · SEV-2",
      createdAt: minutesAgo(18),
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
          "Riley (On-call): Yes — any VIP or Enterprise with a blocking issue escalates to on-call immediately. First customer update within 15 minutes.",
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
    skills.push({
      id: skillId,
      organizationId: org.id,
      conversationId: def.conversationId,
      title: def.title,
      jsonSchema: def.schema,
      status: def.status,
      confidence: def.confidence,
      category: def.category,
      createdAt: def.createdAt,
      updatedAt: def.updatedAt,
    });
    skillVersions.push({
      id: id("ver"),
      skillId,
      jsonSchema: def.schema,
      editedBy: userId,
      createdAt: def.createdAt,
    });
  }

  const activities: ActivityItem[] = [
    {
      id: id("act"),
      organizationId: org.id,
      message: `Workspace "${org.name}" ready for investor walkthrough`,
      createdAt: minutesAgo(125),
    },
    {
      id: id("act"),
      organizationId: org.id,
      message:
        'New skill extracted: "Enterprise Tier Discount Exception" from Slack #sales-questions',
      createdAt: minutesAgo(118),
    },
    {
      id: id("act"),
      organizationId: org.id,
      message: 'Skill approved: "Enterprise Tier Discount Exception" (v1)',
      createdAt: minutesAgo(110),
    },
    {
      id: id("act"),
      organizationId: org.id,
      message:
        'New skill extracted: "Enterprise P1 Outage Refund Exception" from Slack #support-escalations',
      createdAt: minutesAgo(82),
    },
    {
      id: id("act"),
      organizationId: org.id,
      message: 'Skill approved: "Enterprise P1 Outage Refund Exception" (v1)',
      createdAt: minutesAgo(70),
    },
    {
      id: id("act"),
      organizationId: org.id,
      message:
        'New skill extracted from Slack thread #vip-support — pending review',
      createdAt: minutesAgo(38),
    },
    {
      id: id("act"),
      organizationId: org.id,
      message:
        'New skill extracted: "Payments Latency SEV-2 Cutover" — 2 flagged fields',
      createdAt: minutesAgo(15),
    },
  ];

  return {
    org,
    membership,
    dataSources,
    conversations,
    skills,
    skillVersions,
    activities,
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
