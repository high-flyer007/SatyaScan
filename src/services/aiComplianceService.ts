export interface AIComplianceFinding {
  field: string;
  detectedValue: string;
  status: "PASS" | "FAIL" | "REVIEW";
  reason: string;
  ruleReference: string;
  evidence: string;
  confidence: number;
}

export interface AIComplianceResult {
  overallStatus:
    | "COMPLIANT"
    | "NON-COMPLIANT"
    | "REVIEW_PENDING";
  summary: string;
  confidence: number;
  findings: AIComplianceFinding[];
}

export interface AIComplianceInput {
  image: string;
  ocrText: string;
  extractedData: Record<string, unknown>;
}

const AI_BACKEND_URL = "http://localhost:3001";

export async function analyzeCompliance(
  input: AIComplianceInput,
): Promise<AIComplianceResult> {
  const response = await fetch(
    `${AI_BACKEND_URL}/api/ai-compliance`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(input),
    },
  );

  const data = await response.json();

  if (!response.ok || !data.success) {
    throw new Error(
      data.error ||
        data.details ||
        "AI compliance analysis failed",
    );
  }

  return data.result as AIComplianceResult;
}