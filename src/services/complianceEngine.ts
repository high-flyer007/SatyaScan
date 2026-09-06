export type ComplianceStatus = "PASS" | "FAIL" | "REVIEW";

export interface ComplianceInput {
  netQuantity?: string;
  mrp?: string;
  manufacturingDate?: string;
  expiryDate?: string;
  batchNumber?: string;
  consumerCare?: string;
  manufacturer?: string;
  ocrText?: string;
}

export interface ComplianceFinding {
  field:
    | "netQuantity"
    | "mrp"
    | "manufacturingDate"
    | "expiryDate"
    | "batchNumber"
    | "consumerCare"
    | "manufacturer";

  name: string;
  value: string;
  status: ComplianceStatus;
  reference: string;
  description: string;
  severity: "LOW" | "MEDIUM" | "HIGH";
}

export interface ComplianceResult {
  findings: ComplianceFinding[];
  passed: number;
  failed: number;
  review: number;
  score: number;
  overallStatus:
    | "COMPLIANT"
    | "NON-COMPLIANT"
    | "REVIEW_PENDING";
}

const QUANTITY_PATTERN =
  /^\d+(?:\.\d+)?\s*(kg|g|mg|ml|l|litre|liter)$/i;

const DATE_PATTERN =
  /^(?:\d{1,2}[\/.-]\d{1,2}[\/.-]\d{2,4}|\d{1,2}[\/.-]\d{4})$/;

const PHONE_PATTERN =
  /(?:\+91[\s-]?)?[6-9]\d{9}\b/;

const EMAIL_PATTERN =
  /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i;

function finding(
  field: ComplianceFinding["field"],
  name: string,
  value: string,
  status: ComplianceStatus,
  reference: string,
  description: string,
  severity: ComplianceFinding["severity"] = "MEDIUM",
): ComplianceFinding {
  return {
    field,
    name,
    value,
    status,
    reference,
    description,
    severity,
  };
}

/**
 * SatyaScan deterministic compliance engine.
 *
 * AI/OCR answers:
 * "What information can be read from the package?"
 *
 * This engine answers:
 * "Does the extracted information satisfy the configured
 * packaged-commodity validation rules?"
 *
 * A missing/uncertain extraction is REVIEW, not an automatic
 * legal violation.
 */
export function evaluateCompliance(
  input: ComplianceInput,
): ComplianceResult {
  const findings: ComplianceFinding[] = [];

  // ============================================================
  // 1. NET QUANTITY
  // ============================================================

  if (!input.netQuantity?.trim()) {
    findings.push(
      finding(
        "netQuantity",
        "Net Quantity Declaration",
        "Not extracted",
        "REVIEW",
        "PCR Rule 6",
        "Net quantity could not be reliably extracted. Inspector verification is required.",
        "HIGH",
      ),
    );
  } else {
    const value = input.netQuantity.trim();

    if (QUANTITY_PATTERN.test(value)) {
      findings.push(
        finding(
          "netQuantity",
          "Net Quantity Declaration",
          value,
          "PASS",
          "PCR Rule 6",
          "A numeric net quantity with a recognized standard unit was extracted.",
          "LOW",
        ),
      );
    } else {
      findings.push(
        finding(
          "netQuantity",
          "Net Quantity Declaration",
          value,
          "REVIEW",
          "PCR Rule 6",
          "A quantity was detected, but its numeric format or unit could not be reliably validated.",
          "HIGH",
        ),
      );
    }
  }

  // ============================================================
  // 2. MRP
  // ============================================================

  if (!input.mrp?.trim()) {
    findings.push(
      finding(
        "mrp",
        "MRP Declaration",
        "Not extracted",
        "REVIEW",
        "PCR Rule 6",
        "Maximum Retail Price could not be reliably extracted from the package.",
        "HIGH",
      ),
    );
  } else {
    const value = input.mrp.trim();
    const numericMrp = Number(value.replace(/,/g, ""));

    if (!Number.isFinite(numericMrp) || numericMrp <= 0) {
      findings.push(
        finding(
          "mrp",
          "MRP Declaration",
          value,
          "FAIL",
          "PCR Rule 6",
          "The extracted MRP is not a valid positive retail price.",
          "HIGH",
        ),
      );
    } else {
      const ocr = input.ocrText ?? "";

      const hasMrpLabel =
        /\bM\.?\s*R\.?\s*P\.?\b/i.test(ocr) ||
        /\bmaximum\s+retail\s+price\b/i.test(ocr);

      const hasCurrency =
        /₹|\bRs\.?\b|\bINR\b/i.test(ocr);

      if (hasMrpLabel && hasCurrency) {
        findings.push(
          finding(
            "mrp",
            "MRP Declaration",
            value,
            "PASS",
            "PCR Rule 6",
            "A positive MRP value and currency indicator were detected in the OCR evidence.",
            "LOW",
          ),
        );
      } else {
        findings.push(
          finding(
            "mrp",
            "MRP Declaration",
            value,
            "REVIEW",
            "PCR Rule 6",
            "A positive MRP value was extracted, but the complete MRP presentation could not be verified from OCR evidence.",
            "HIGH",
          ),
        );
      }
    }
  }

  // ============================================================
  // 3. MANUFACTURE / PACKING DATE
  // ============================================================

  if (!input.manufacturingDate?.trim()) {
    findings.push(
      finding(
        "manufacturingDate",
        "Manufacture / Packing Date",
        "Not extracted",
        "REVIEW",
        "PCR Rule 6",
        "A manufacture or packing date could not be reliably extracted. Inspector verification is required.",
        "MEDIUM",
      ),
    );
  } else {
    const value = input.manufacturingDate.trim();

    if (DATE_PATTERN.test(value)) {
      findings.push(
        finding(
          "manufacturingDate",
          "Manufacture / Packing Date",
          value,
          "PASS",
          "PCR Rule 6",
          "A recognizable manufacture or packing date was extracted.",
          "LOW",
        ),
      );
    } else {
      findings.push(
        finding(
          "manufacturingDate",
          "Manufacture / Packing Date",
          value,
          "REVIEW",
          "PCR Rule 6",
          "A date-like value was detected, but its format could not be reliably validated.",
          "MEDIUM",
        ),
      );
    }
  }

  // ============================================================
  // 4. CONSUMER CARE
  // ============================================================

  if (!input.consumerCare?.trim()) {
    findings.push(
      finding(
        "consumerCare",
        "Consumer Care Details",
        "Not extracted",
        "REVIEW",
        "PCR Rule 6",
        "Consumer-care details could not be reliably extracted.",
        "HIGH",
      ),
    );
  } else {
    const value = input.consumerCare.trim();

    const hasPhone = PHONE_PATTERN.test(value);
    const hasEmail = EMAIL_PATTERN.test(value);

    if (hasEmail) {
      findings.push(
        finding(
          "consumerCare",
          "Consumer Care Details",
          value,
          "PASS",
          "PCR Rule 6",
          "A consumer-care email address was detected in the extracted declaration.",
          "LOW",
        ),
      );
    } else if (hasPhone) {
      findings.push(
        finding(
          "consumerCare",
          "Consumer Care Details",
          value,
          "REVIEW",
          "PCR Rule 6",
          "A consumer-care phone number was detected, but an email address could not be verified from the available OCR evidence.",
          "MEDIUM",
        ),
      );
    } else {
      findings.push(
        finding(
          "consumerCare",
          "Consumer Care Details",
          value,
          "REVIEW",
          "PCR Rule 6",
          "Consumer-care text was detected, but no reliable contact detail could be validated.",
          "MEDIUM",
        ),
      );
    }
  }

  // ============================================================
  // RESULT
  // ============================================================

  const passed = findings.filter(
    (item) => item.status === "PASS",
  ).length;

  const failed = findings.filter(
    (item) => item.status === "FAIL",
  ).length;

  const review = findings.filter(
    (item) => item.status === "REVIEW",
  ).length;

  const score =
    findings.length > 0
      ? Math.round((passed / findings.length) * 100)
      : 0;

  const overallStatus =
    failed > 0
      ? "NON-COMPLIANT"
      : review > 0
        ? "REVIEW_PENDING"
        : "COMPLIANT";

  return {
    findings,
    passed,
    failed,
    review,
    score,
    overallStatus,
  };
}