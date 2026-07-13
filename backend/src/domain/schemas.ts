import { z } from "zod";

export const trustLabelSchema = z.enum([
  "verified",
  "inferred",
  "synthetic",
  "cached",
]);

export const lifecycleSchema = z.enum([
  "paying",
  "trial",
  "evaluator",
  "dormant",
  "expansion",
  "rejected",
]);

export const accountListQuerySchema = z.object({
  lifecycle: lifecycleSchema.optional(),
  cluster: z.string().trim().min(1).optional(),
});

export const accountIdParamsSchema = z.object({
  accountId: z.string().trim().min(1),
});

export const runIdParamsSchema = z.object({
  runId: z.string().trim().min(1),
});

export const approvalIdParamsSchema = z.object({
  approvalId: z.string().trim().min(1),
});

export const approvalDecisionSchema = z.object({
  decision: z.enum(["approved", "rejected", "more_research"]),
  note: z.string().trim().max(2_000).default(""),
});

export const analyzeAccountRequestSchema = z.object({
  enrich: z.boolean().default(false),
  questions: z.array(z.string().trim().min(1).max(300)).max(5).default([]),
});

export const signalKeySchema = z.enum([
  "nimble_live_data_need",
  "nimble_structured_extraction",
  "nimble_scale",
  "nimble_ai_dependency",
  "nimble_reliability_pain",
  "nimble_recent_trigger",
  "kylon_multi_agent",
  "kylon_fragmented_context",
  "kylon_human_collaboration",
  "kylon_governance",
  "kylon_cross_functional",
  "kylon_recent_trigger",
]);

export const accountSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  domain: z.string().min(1),
  lifecycle: lifecycleSchema,
  industry: z.string(),
  employeeBand: z.string(),
  currentProducts: z.array(z.enum(["nimble", "kylon"])),
  trustLabel: trustLabelSchema,
});

export const contactSchema = z.object({
  id: z.string().min(1),
  accountId: z.string().min(1),
  fullName: z.string().min(1),
  title: z.string(),
  email: z.email(),
  trustLabel: trustLabelSchema,
});

export const usageRecordSchema = z.object({
  id: z.string().min(1),
  accountId: z.string().min(1),
  product: z.enum(["nimble", "kylon", "joint", "other"]),
  occurredAt: z.iso.datetime(),
  metrics: z.record(z.string(), z.number()),
  interpretation: z.string(),
  trustLabel: trustLabelSchema,
});

export const engagementSchema = z.object({
  id: z.string().min(1),
  accountId: z.string().min(1),
  contactId: z.string().optional(),
  type: z.string(),
  occurredAt: z.iso.datetime(),
  details: z.string(),
  trustLabel: trustLabelSchema,
});

export const formSubmissionSchema = z.object({
  id: z.string().min(1),
  accountId: z.string().min(1),
  contactId: z.string().optional(),
  submittedAt: z.iso.datetime(),
  responses: z.record(z.string(), z.string()),
  trustLabel: trustLabelSchema,
});

export const meetingRecordSchema = z.object({
  id: z.string().min(1),
  accountId: z.string().min(1),
  occurredAt: z.iso.datetime(),
  summary: z.string(),
  openQuestions: z.array(z.string()),
  trustLabel: trustLabelSchema,
});

export const evidenceRecordSchema = z.object({
  id: z.string().min(1),
  accountId: z.string().min(1),
  sourceUrl: z.url(),
  sourceTitle: z.string(),
  sourceDomain: z.string().min(1),
  publishedAt: z.iso.datetime().nullable(),
  retrievedAt: z.iso.datetime(),
  excerpt: z.string(),
  decision: z.enum(["supported", "weak", "rejected"]),
  signalKeys: z.array(signalKeySchema),
  trustLabel: trustLabelSchema,
});

const scoreContributionSchema = z.object({
  key: signalKeySchema,
  label: z.string(),
  points: z.number(),
  maximum: z.number(),
  evidenceIds: z.array(z.string()),
  trustLabels: z.array(trustLabelSchema),
});

const sponsorScoreSchema = z.object({
  total: z.number(),
  maximum: z.literal(100),
  contributions: z.array(scoreContributionSchema),
});

const profileQuestionSchema = z.object({
  key: z.enum([
    "why_use_product",
    "when_use_product",
    "current_workflow",
    "blocker_to_progress",
    "decision_process",
  ]),
  question: z.string(),
  status: z.enum(["answered", "missing"]),
  answer: z.string().nullable(),
  referenceIds: z.array(z.string()),
});

export const gtmActionSchema = z.object({
  type: z.enum([
    "diagnose_conversion_friction",
    "expand_joint_adoption",
    "capture_customer_proof",
    "offer_nimble_reliability_audit",
    "offer_kylon_readiness_map",
    "request_missing_evidence",
    "reactivate_with_new_trigger",
    "document_disqualification",
  ]),
  title: z.string(),
  rationale: z.string(),
  sensitive: z.boolean(),
  evidenceIds: z.array(z.string()),
});

export const accountAnalysisSchema = z.object({
  id: z.string(),
  accountId: z.string(),
  analyzedAt: z.iso.datetime(),
  lifecycle: lifecycleSchema,
  recommendedPlaybook: z.enum(["nimble", "kylon", "joint", "none"]),
  qualified: z.boolean(),
  primaryClusterId: z.string(),
  nimbleScore: sponsorScoreSchema,
  kylonScore: sponsorScoreSchema,
  profileQuestions: z.array(profileQuestionSchema),
  strongestEvidenceIds: z.array(z.string()),
  findings: z.array(z.string()),
  actions: z.array(gtmActionSchema),
  warnings: z.array(z.string()),
});

export const auditEventSchema = z.object({
  id: z.string(),
  runId: z.string(),
  accountId: z.string(),
  occurredAt: z.iso.datetime(),
  type: z.string(),
  message: z.string(),
  trustLabel: trustLabelSchema,
});
