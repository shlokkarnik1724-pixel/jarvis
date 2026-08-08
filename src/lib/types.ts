export type Role = "admin" | "member";

export type SkillStatus = "pending" | "approved" | "rejected";

export type DataSourceType = "slack" | "zendesk" | "email" | "manual" | "fireflies";

export type DataSourceStatus = "connected" | "coming_soon" | "disconnected";

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

export interface DataSource {
  id: string;
  organizationId: string;
  type: DataSourceType;
  name: string;
  status: DataSourceStatus;
  createdAt: string;
}

export interface Conversation {
  id: string;
  organizationId: string;
  dataSourceId: string;
  rawText: string;
  sourceRef: string;
  createdAt: string;
}

export interface SkillSchema {
  title: string;
  condition: string;
  action: string;
  category: SkillCategory;
  confidence: number;
  source_excerpt: string;
  flagged_fields: string[];
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

export interface Database {
  users: User[];
  organizations: Organization[];
  memberships: Membership[];
  dataSources: DataSource[];
  conversations: Conversation[];
  skills: Skill[];
  skillVersions: SkillVersion[];
  agentTestRuns: AgentTestRun[];
  activities: ActivityItem[];
}

export interface SessionPayload {
  userId: string;
  email: string;
  name: string;
  organizationId?: string;
  role?: Role;
}
