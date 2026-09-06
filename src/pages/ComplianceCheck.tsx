import { useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  ShieldCheck,
  FileCheck2,
  ChevronRight,
  Scale,
} from "lucide-react";
import { useInspections } from "../context/InspectionContext";
import {
  evaluateCompliance,
} from "../services/complianceEngine";

type FindingStatus = "PASS" | "FAIL" | "REVIEW";


function StatusBadge({ status }: { status: FindingStatus }) {
  if (status === "PASS") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700 ring-1 ring-green-200">
        <CheckCircle2 size={14} />
        PASS
      </span>
    );
  }

  if (status === "FAIL") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-700 ring-1 ring-red-200">
        <AlertCircle size={14} />
        FAIL
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-orange-50 px-3 py-1 text-xs font-semibold text-orange-700 ring-1 ring-orange-200">
      <AlertTriangle size={14} />
      REVIEW
    </span>
  );
}

export default function ComplianceCheck() {
  const navigate = useNavigate();
  const { inspectionId } = useParams();

  const {
  inspections,
  currentInspection,
  storageLoaded,
  updateInspection,
} = useInspections();

const inspection = useMemo(() => {
  if (!inspectionId) {
    return null;
  }

  const persistedInspection = inspections.find(
    (item) => item.id === inspectionId
  );

  if (persistedInspection) {
    return persistedInspection;
  }

  if (currentInspection?.id === inspectionId) {
    return currentInspection;
  }

  return null;
}, [
  inspectionId,
  inspections,
  currentInspection,
]);

const isInspectionDataLoaded = storageLoaded;

const extractedData = inspection?.extractedData ?? {};
const aiCompliance = inspection?.aiCompliance;
const aiFindings = aiCompliance?.findings ?? [];

const complianceResult = useMemo(() => {
  return evaluateCompliance({
    ...extractedData,
    ocrText: inspection?.ocrText ?? "",
  });
}, [
  extractedData.netQuantity,
  extractedData.mrp,
  extractedData.manufacturingDate,
  extractedData.expiryDate,
  extractedData.batchNumber,
  extractedData.consumerCare,
  extractedData.manufacturer,
  inspection?.ocrText,
]);

const findings =
  aiFindings.length > 0
    ? aiFindings.map((finding) => ({
        field: finding.field,
        name: finding.field,
        value: finding.detectedValue,
        status: finding.status,
        reference: finding.ruleReference,
        description: finding.reason,
        severity:
          finding.status === "FAIL"
            ? "HIGH"
            : finding.status === "REVIEW"
              ? "MEDIUM"
              : "LOW",
        evidence: finding.evidence,
        confidence: finding.confidence,
      }))
    : complianceResult.findings;

const passCount = findings.filter(
  (finding) => finding.status === "PASS",
).length;

const failCount = findings.filter(
  (finding) => finding.status === "FAIL",
).length;

const reviewCount = findings.filter(
  (finding) => finding.status === "REVIEW",
).length;

const overallStatus =
  aiFindings.length > 0
    ? aiCompliance?.overallStatus ?? "REVIEW_PENDING"
    : complianceResult.overallStatus;

const complianceScore =
  findings.length > 0
    ? Math.round((passCount / findings.length) * 100)
    : 0;
  useEffect(() => {
  if (!storageLoaded || !inspection) return;

  if (aiFindings.length > 0 && aiCompliance) {
    updateInspection(inspection.id, {
      compliance: {
        score: complianceScore,
        passed: passCount,
        failed: failCount,
        review: reviewCount,
        overallStatus: aiCompliance.overallStatus,
      },
      status:
        aiCompliance.overallStatus === "NON-COMPLIANT"
          ? "non-compliant"
          : "review",
    });

    return;
  }

  updateInspection(inspection.id, {
    compliance: {
      score: complianceResult.score,
      passed: complianceResult.passed,
      failed: complianceResult.failed,
      review: complianceResult.review,
      overallStatus: complianceResult.overallStatus,
    },
    status:
      complianceResult.overallStatus === "NON-COMPLIANT"
        ? "non-compliant"
        : "review",
  });
}, [
  storageLoaded,
  inspection?.id,
  aiFindings.length,
  aiCompliance,
  complianceScore,
  passCount,
  failCount,
  reviewCount,
  complianceResult.score,
  complianceResult.passed,
  complianceResult.failed,
  complianceResult.review,
  complianceResult.overallStatus,
  updateInspection,
]);
  if (!inspection && !isInspectionDataLoaded) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f7f9fc]">
      <div className="rounded-2xl border border-slate-200 bg-white px-8 py-7 shadow-sm">
        <p className="font-semibold text-slate-900">
          Loading inspection...
        </p>

        <p className="mt-2 text-sm text-slate-500">
          SatyaScan is loading the inspection record.
        </p>
      </div>
    </div>
  );
}

  if (!inspection) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f7f9fc]">
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <AlertCircle
            className="mx-auto text-red-500"
            size={40}
          />

          <h1 className="mt-4 text-xl font-bold text-slate-900">
            Inspection Not Found
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            The inspection record could not be loaded.
          </p>

          <button
            onClick={() => navigate("/dashboard")}
            className="mt-6 rounded-xl bg-[#082b55] px-5 py-3 font-semibold text-white"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7f9fc] text-[#102a4c]">
      {/* Header */}
      <div className="border-b border-slate-200 bg-white px-8 py-5">
        <div className="mx-auto flex max-w-[1400px] items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() =>
                navigate(
                  `/inspection/${inspectionId}/analysis`,
                )
              }
              className="rounded-xl border border-slate-200 bg-white p-2.5 transition hover:bg-slate-50"
            >
              <ArrowLeft size={21} />
            </button>

            <div>
              <p className="text-sm font-medium text-slate-500">
                Inspection ID: {inspection.id}
              </p>

              <h1 className="mt-1 text-2xl font-bold tracking-tight">
                Compliance Assessment
              </h1>

              <p className="mt-1 text-sm text-slate-500">
                AI-extracted declarations compared against
                Legal Metrology requirements.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3">
            <ShieldCheck
              className="text-blue-700"
              size={20}
            />

            <div>
              <p className="text-xs font-medium text-blue-600">
                SatyaScan Compliance Engine
              </p>

              <p className="text-sm font-semibold text-blue-900">
                Rule validation active
              </p>
            </div>
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-[1400px] px-8 py-8">
        {/* Summary */}
        <section className="grid grid-cols-1 gap-5 md:grid-cols-4">
          <div
            className={`rounded-2xl border bg-white p-6 shadow-sm md:col-span-2 ${
              overallStatus === "NON-COMPLIANT"
                ? "border-red-200"
                : overallStatus === "REVIEW_PENDING"
                  ? "border-orange-200"
                  : "border-green-200"
            }`}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Overall Compliance Result
                </p>

                <div className="mt-3 flex items-center gap-3">
                  <div
                    className={`rounded-xl p-3 ${
                      overallStatus === "NON-COMPLIANT"
                        ? "bg-red-50"
                        : overallStatus ===
                            "REVIEW_PENDING"
                          ? "bg-orange-50"
                          : "bg-green-50"
                    }`}
                  >
                    {overallStatus ===
                    "NON-COMPLIANT" ? (
                      <AlertCircle
                        className="text-red-600"
                        size={28}
                      />
                    ) : overallStatus ===
                      "REVIEW_PENDING" ? (
                      <AlertTriangle
                        className="text-orange-600"
                        size={28}
                      />
                    ) : (
                      <CheckCircle2
                        className="text-green-600"
                        size={28}
                      />
                    )}
                  </div>

                  <div>
                    <h2
                      className={`text-2xl font-bold ${
                        overallStatus ===
                        "NON-COMPLIANT"
                          ? "text-red-600"
                          : overallStatus ===
                              "REVIEW_PENDING"
                            ? "text-orange-600"
                            : "text-green-600"
                      }`}
                    >
                      {overallStatus ===
                      "REVIEW_PENDING"
                        ? "REVIEW PENDING"
                        : overallStatus}
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                      {overallStatus ===
                      "NON-COMPLIANT"
                        ? "Compliance action required"
                        : overallStatus ===
                            "REVIEW_PENDING"
                          ? "Inspector verification required"
                          : "All evaluated declarations passed"}
                    </p>
                  </div>
                </div>
              </div>

              <Scale
                className="text-slate-300"
                size={28}
              />
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm text-slate-500">
              Checks Passed
            </p>

            <p className="mt-2 text-3xl font-bold text-green-600">
              {passCount}
            </p>

            <p className="mt-1 text-xs text-slate-400">
              of {findings.length} declarations
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm text-slate-500">
              Issues Detected
            </p>

            <p className="mt-2 text-3xl font-bold text-red-600">
              {failCount + reviewCount}
            </p>

            <p className="mt-1 text-xs text-slate-400">
              {failCount} violation • {reviewCount} review
            </p>
          </div>
        </section>

        {/* Rule engine */}
        <section className="mt-8 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-6 py-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold">
                  Rule-Engine Compliance Checklist
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Each extracted declaration is evaluated
                  against the applicable packaged commodity
                  requirement.
                </p>
              </div>

              <div className="flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-600">
                <FileCheck2 size={17} />
                {findings.length} rules evaluated
              </div>
            </div>
          </div>

          <div className="divide-y divide-slate-100">
            {findings.map((finding) => (
              <div
                key={finding.name}
                className={`p-6 transition hover:bg-slate-50 ${
                  finding.status === "FAIL"
                    ? "border-l-4 border-red-500 bg-red-50/30"
                    : finding.status === "REVIEW"
                      ? "border-l-4 border-orange-400 bg-orange-50/20"
                      : "border-l-4 border-transparent"
                }`}
              >
                <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1.5fr_1fr_160px_180px] lg:items-center">
                  <div>
                    <h3 className="font-semibold text-slate-900">
                      {finding.name}
                    </h3>

                    <p className="mt-1 text-sm text-slate-500">
                      {finding.description}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                      Detected Value
                    </p>

                    <p
                      className={`mt-1 font-semibold ${
                        finding.status === "FAIL"
                          ? "text-red-600"
                          : finding.status ===
                              "REVIEW"
                            ? "text-orange-700"
                            : "text-slate-800"
                      }`}
                    >
                      {finding.value}
                    </p>
                  </div>

                  <div>
                    <StatusBadge
                      status={finding.status}
                    />
                  </div>

                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                      Rule Reference
                    </p>

                    <p className="mt-1 text-sm font-medium text-blue-700">
                      {finding.reference}
                    </p>
                  </div>
                </div>

                {finding.status === "FAIL" && (
                  <div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4">
                    <div className="flex gap-3">
                      <AlertCircle
                        size={19}
                        className="mt-0.5 shrink-0 text-red-600"
                      />

                      <div>
                        <p className="font-semibold text-red-800">
                          Violation detected
                        </p>

                        <p className="mt-1 text-sm leading-6 text-red-700">
                          {finding.description}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {finding.status === "REVIEW" && (
                  <div className="mt-5 rounded-xl border border-orange-200 bg-orange-50 p-4">
                    <div className="flex gap-3">
                      <AlertTriangle
                        size={19}
                        className="mt-0.5 shrink-0 text-orange-600"
                      />

                      <div>
                        <p className="font-semibold text-orange-800">
                          Inspector verification required
                        </p>

                        <p className="mt-1 text-sm leading-6 text-orange-700">
                          SatyaScan could not establish full
                          compliance from the currently
                          extracted evidence alone.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Action */}
        <section className="mt-6 flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:flex-row md:items-center md:justify-between">
          <div>
            <p className="font-semibold text-slate-900">
              Compliance assessment completed
            </p>

            <p className="mt-1 text-sm text-slate-500">
              Review the detected findings before confirming
              the inspection.
            </p>
          </div>

          <button
            onClick={() =>
              navigate(
                `/inspection/${inspectionId}/review`,
              )
            }
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#082b55] px-6 py-3 font-semibold text-white shadow-sm transition hover:bg-[#061f3e]"
          >
            Review Findings
            <ChevronRight size={18} />
          </button>
        </section>
      </main>
    </div>
  );
}