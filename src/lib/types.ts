export type Role = "admin" | "member";

export type SkillStatus = "pending" | "approved" | "rejected" | "superseded";

export type ConnectorStatus =
  | "connected"
  | "syncing"
  | "disconnected"
  | "coming_soon";

export type SkillCategory =
  | "Refunds"
  | "Escalation"
  | "Discounting"
  | "Incident Response"
  | "Other";

export interface User {
  id: string;
  email: string;
  name: string;
  passwordHash: string;
  createdAt: string;
}

export interface Organization {
  id: string;
  name: string;
  industry: string;
  teamSize: string;
  primaryUseCase: string;
  inviteCode: string;
  createdBy: string;
  createdAt: string;
}

export interface Membership {
  id: string;
  userId: string;
  organizationId: string;
  role: Role;
  createdAt: string;
}

export interface Connector {
  id: string;
  organizationId: string;
  provider: string;
  name: string;
  status: ConnectorStatus;
  meta?: Record<string, unknown>;
  lastSyncedAt?: string | null;
  createdAt: string;
}

/** @deprecated use Connector */
export type DataSource = Connector & { type?: string };

export interface Conversation {
  id: string;
  organizationId: string;
  dataSourceId: string;
  connectorId?: string;
  rawText: string;
  sourceRef: string;
  createdAt: string;
}

export interface SopStep {
  step: number;
  title: string;
  detail: string;
  owner?: string;
}

export interface SkillSchema {
  title: string;
  condition: string;
  action: string;
  category: SkillCategory;
  confidence: number;
  source_excerpt: string;
  flagged_fields: string[];
  sop_steps?: SopStep[];
}

export interface Skill {
  id: string;
  organizationId: string;
  conversationId: string;
  title: string;
  jsonSchema: SkillSchema;
  status: SkillStatus;
  confidence: number;
  category: SkillCategory;
  /** Bi-temporal: when this rule became valid */
  validFrom: string;
  /** Bi-temporal: when this rule stopped being valid (null = still active) */
  validTo: string | null;
  supersededBy: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface SkillVersion {
  id: string;
  skillId: string;
  jsonSchema: SkillSchema;
  editedBy: string;
  createdAt: string;
}

export interface AgentTestRun {
  id: string;
  skillId: string;
  organizationId: string;
  userQuery: string;
  agentResponse: string;
  createdAt: string;
}

export interface ActivityItem {
  id: string;
  organizationId: string;
  message: string;
  createdAt: string;
}

export interface RoutingItem {
  id: string;
  organizationId: string;
  title: string;
  summary: string;
  suggestedOwner: string;
  channel: string;
  priority: "low" | "normal" | "high" | "urgent";
  status: "open" | "routed" | "done";
  sourceRef: string;
  createdAt: string;
}

export interface BrainMessage {
  id: string;
  organizationId: string;
  userId?: string;
  role: "user" | "assistant" | "system";
  content: string;
  citations: { skillId?: string; title: string; sourceRef?: string }[];
  createdAt: string;
}

/** Zero-touch passive ingestion event */
export interface IngestionEvent {
  id: string;
  organizationId: string;
  source: string;
  channel: string;
  summary: string;
  rawSnippet: string;
  decisionDetected: boolean;
  skillId?: string | null;
  createdAt: string;
}

export interface Database {
  users: User[];
  organizations: Organization[];
  memberships: Membership[];
  dataSources: Connector[];
  connectors: Connector[];
  conversations: Conversation[];
  skills: Skill[];
  skillVersions: SkillVersion[];
  agentTestRuns: AgentTestRun[];
  activities: ActivityItem[];
  routingItems: RoutingItem[];
  brainMessages: BrainMessage[];
  ingestionEvents: IngestionEvent[];
}

export interface SessionPayload {
  userId: string;
  email: string;
  name: string;
  organizationId?: string;
  role?: Role;
}
