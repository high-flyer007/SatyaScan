import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useInspections } from "../context/InspectionContext";
import { getInspectionImage } from "../services/imageStorage";
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Camera,
  Flag,
  ShieldAlert,
  FileText,
  Info,
} from "lucide-react";

export default function ReviewVerify() {
  const navigate = useNavigate();
  const { inspectionId } = useParams();

  const {
    getInspection,
    updateInspection,
    storageLoaded,
  } = useInspections();

  const inspection = getInspection(inspectionId || "");

  const [decision, setDecision] = React.useState<
    "confirmed" | "rejected" | null
  >(inspection?.confirmed === true
    ? "confirmed"
    : inspection?.confirmed === false
      ? "rejected"
      : null);

  const [notes, setNotes] = React.useState(
    inspection?.inspectorNotes ?? "",
  );

  const [retakeRequested, setRetakeRequested] =
    React.useState(false);

  const [manualAudit, setManualAudit] =
    React.useState(false);

  React.useEffect(() => {
    if (!inspection) return;

    setNotes(inspection.inspectorNotes ?? "");

    if (inspection.confirmed === true) {
      setDecision("confirmed");
    } else if (inspection.confirmed === false) {
      setDecision("rejected");
    }
  }, [inspection?.id, inspection?.confirmed, inspection?.inspectorNotes]);

  const aiFindings = inspection?.aiCompliance?.findings ?? [];

const findings =
  aiFindings.length > 0
    ? {
        score: Math.round(
          (aiFindings.filter(
            (finding) => finding.status === "PASS",
          ).length /
            aiFindings.length) *
            100,
        ),
        passed: aiFindings.filter(
          (finding) => finding.status === "PASS",
        ).length,
        failed: aiFindings.filter(
          (finding) => finding.status === "FAIL",
        ).length,
        review: aiFindings.filter(
          (finding) => finding.status === "REVIEW",
        ).length,
        overallStatus:
          inspection?.aiCompliance?.overallStatus ??
          "REVIEW_PENDING",
      }
    : inspection?.compliance ?? {
        score: 0,
        passed: 0,
        failed: 0,
        review: 0,
        overallStatus: "REVIEW_PENDING" as const,
      };

  const handleConfirm = () => {
    if (!inspection) return;

    setDecision("confirmed");

    updateInspection(inspection.id, {
      confirmed: true,
      inspectorNotes: notes,
      status: "non-compliant",
    });
  };

  const handleReject = () => {
    if (!inspection) return;

    setDecision("rejected");

    updateInspection(inspection.id, {
      confirmed: false,
      inspectorNotes: notes,
      status: "completed",
    });
  };

  const handleRetake = () => {
    if (!inspection) return;

    setRetakeRequested(true);

    updateInspection(inspection.id, {
      inspectorNotes: notes,
      status: "analyzing",
    });
  };

  const handleManualAudit = () => {
    if (!inspection) return;

    setManualAudit(true);

    updateInspection(inspection.id, {
      inspectorNotes: notes,
      status: "review",
    });
  };

  const handleNotesChange = (
    value: string,
  ) => {
    setNotes(value);

    if (inspection) {
      updateInspection(inspection.id, {
        inspectorNotes: value,
      });
    }
  };

  const [inspectionImage, setInspectionImage] =
  React.useState<string | null>(null);

const [imageLoading, setImageLoading] =
  React.useState(true);

  React.useEffect(() => {
  if (!inspection?.images?.length) {
    setImageLoading(false);
    return;
  }

  let cancelled = false;

  const loadImage = async () => {
    try {
      setImageLoading(true);

      const image = await getInspectionImage(
        inspection.images[0],
      );

      if (!cancelled) {
        setInspectionImage(image || null);
      }
    } catch (error) {
      console.error(
        "Unable to load inspection image.",
        error,
      );

      if (!cancelled) {
        setInspectionImage(null);
      }
    } finally {
      if (!cancelled) {
        setImageLoading(false);
      }
    }
  };

  loadImage();

  return () => {
    cancelled = true;
  };
}, [inspection?.id, inspection?.images]);

  if (!storageLoaded) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f7f9fc]">
        <p className="text-slate-500">
          Loading inspection...
        </p>
      </div>
    );
  }

  if (!inspection) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f7f9fc]">
        <div className="text-center">
          <h1 className="text-xl font-bold text-slate-900">
            Inspection not found
          </h1>

          <button
            onClick={() => navigate("/dashboard")}
            className="mt-4 rounded-xl bg-[#102a4c] px-5 py-3 font-semibold text-white"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7f9fc] text-[#102a4c]">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white px-8 py-5">
        <div className="mx-auto flex max-w-[1450px] items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() =>
                navigate(`/inspection/${inspectionId}/compliance`)
              }
              className="rounded-xl border border-slate-200 bg-white p-2.5 transition hover:bg-slate-50"
            >
              <ArrowLeft size={21} />
            </button>

            <div>
              <p className="text-sm font-medium text-slate-500">
                Inspection ID: {inspectionId}
              </p>

              <h1 className="mt-1 text-2xl font-bold tracking-tight">
                Review & Verify Findings
              </h1>

              <p className="mt-1 text-sm text-slate-500">
                Inspector verification of AI-generated compliance findings.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3">
            <ShieldAlert className="text-blue-700" size={21} />

            <div>
              <p className="text-xs font-medium text-blue-600">
                SatyaScan AI
              </p>
              <p className="text-sm font-semibold text-blue-900">
                Human verification required
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1450px] px-8 py-8">
        {/* Top action bar */}
        <div className="mb-6 flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:flex-row md:items-center md:justify-between">
          <div>
              <div className="flex flex-wrap items-center gap-2">
  <span
  className={`rounded-full px-3 py-1 text-xs font-bold ring-1 ${
    findings.overallStatus === "NON-COMPLIANT"
      ? "bg-red-50 text-red-700 ring-red-200"
      : findings.overallStatus === "COMPLIANT"
        ? "bg-green-50 text-green-700 ring-green-200"
        : "bg-orange-50 text-orange-700 ring-orange-200"
  }`}
>
  {findings.overallStatus.replace("_", " ")}
</span>

<span className="text-sm text-slate-500">
  {findings.failed} violation
  {findings.failed === 1 ? "" : "s"}{" "}
  • {findings.review} review
  {findings.review === 1 ? "" : "s"}
</span>
            </div>

            <p className="mt-2 text-sm text-slate-500">
              Review the AI evidence and make the final enforcement decision.
            </p>
          </div>

          <button
            onClick={() =>
              navigate(`/inspection/${inspectionId}/report`)
            }
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-2.5 font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            <FileText size={18} />
            View Compliance Results
          </button>
        </div>

        {/* Main split layout */}
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.45fr_0.9fr]">
          {/* Evidence */}
          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
              <div>
                <h2 className="text-lg font-bold">Inspection Evidence</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Original package image captured during this inspection.
                </p>
              </div>

              <div className="flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2 text-sm font-medium text-slate-600">
                <Camera size={17} />
                Front Image
              </div>
            </div>

           <div className="bg-slate-100 p-6">
  <div className="relative flex min-h-[590px] items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-white p-5">
    {imageLoading ? (
      <div className="flex items-center justify-center text-sm text-slate-500">
        Loading inspection evidence...
      </div>
    ) : inspectionImage ? (
      <img
        src={inspectionImage}
        alt={`Inspection evidence for ${inspection.productName}`}
        className="max-h-[550px] max-w-full rounded-lg object-contain shadow-sm"
      />
    ) : (
      <div className="text-center text-sm text-slate-500">
        <Camera
          size={32}
          className="mx-auto mb-3 text-slate-400"
        />
        Inspection image unavailable
      </div>
    )}

    <div className="absolute bottom-5 left-5 rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-medium text-slate-500 shadow-sm">
      Original inspection image
    </div>
  </div>
</div>
</section>
          {/* Finding panel */}
          <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 px-6 py-5">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold">Inspector Review</h2>

                <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-bold text-red-700">
                  AUTOMATED REVIEW
                </span>
              </div>
            </div>

            <div className="p-6">
              {/* Finding */}
              {/* Finding */}
<div
  className={`rounded-xl border p-5 ${
    findings.failed > 0
      ? "border-red-200 bg-red-50/40"
      : "border-orange-200 bg-orange-50/40"
  }`}
>
  <div className="flex items-start gap-3">
    <div
      className={`rounded-lg p-2 ${
        findings.failed > 0
          ? "bg-red-100"
          : "bg-orange-100"
      }`}
    >
      <ShieldAlert
        className={
          findings.failed > 0
            ? "text-red-600"
            : "text-orange-600"
        }
        size={22}
      />
    </div>

    <div>
      <p
  className={`text-xs font-bold uppercase tracking-wide ${
    findings.failed > 0
      ? "text-red-600"
      : findings.review > 0
        ? "text-orange-600"
        : "text-green-600"
  }`}
>
  {findings.failed > 0
    ? "Violation Requires Verification"
    : findings.review > 0
      ? "Review Required"
      : "Verification Complete"}
</p>

      <h3 className="mt-1 text-xl font-bold text-slate-900">
        {findings.failed > 0
          ? `${findings.failed} compliance violation${
              findings.failed === 1 ? "" : "s"
            } detected`
          : `${findings.review} declaration${
              findings.review === 1 ? "" : "s"
            } require review`}
      </h3>

      <p className="mt-2 text-sm leading-6 text-slate-600">
        SatyaScan has completed its automated rule
        evaluation. Items marked for review require
        inspector verification before a final decision.
      </p>
    </div>
  </div>
</div>

{/* Compliance summary */}
<div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-5">
  <div className="grid grid-cols-3 gap-4 text-center">
    <div>
      <p className="text-2xl font-bold text-green-600">
        {findings.passed}
      </p>
      <p className="text-xs text-slate-500">
        Passed
      </p>
    </div>

    <div>
      <p className="text-2xl font-bold text-red-600">
        {findings.failed}
      </p>
      <p className="text-xs text-slate-500">
        Violations
      </p>
    </div>

    <div>
      <p className="text-2xl font-bold text-orange-600">
        {findings.review}
      </p>
      <p className="text-xs text-slate-500">
        Review
      </p>
    </div>
  </div>

  <div className="mt-5 flex items-center justify-between">
    <span className="text-sm font-medium text-slate-500">
      Compliance Score
    </span>

    <span className="text-lg font-bold text-slate-900">
      {findings.score}%
    </span>
  </div>

  <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200">
    <div
      className="h-full rounded-full bg-green-500 transition-all"
      style={{
        width: `${findings.score}%`,
      }}
    />
  </div>
</div>

              {/* OCR confidence */}
<div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-5">
  <div className="flex items-center justify-between">
    <span className="text-sm font-medium text-slate-500">
      OCR Confidence
    </span>

    <span className="text-lg font-bold text-slate-900">
      {typeof inspection.ocrConfidence === "number"
        ? `${inspection.ocrConfidence.toFixed(1)}%`
        : "Not available"}
    </span>
  </div>

  {typeof inspection.ocrConfidence === "number" && (
    <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200">
      <div
        className="h-full rounded-full bg-blue-500 transition-all"
        style={{
          width: `${Math.min(
            Math.max(inspection.ocrConfidence, 0),
            100,
          )}%`,
        }}
      />
    </div>
  )}

  <p className="mt-2 text-xs text-slate-400">
    Confidence from the package OCR extraction. AI compliance
    confidence will appear after vision analysis is connected.
  </p>
</div>

              {/* Rule reference */}
              <div className="mt-5 rounded-xl border border-blue-100 bg-blue-50 p-5">
                <div className="flex gap-3">
                  <Info className="mt-0.5 shrink-0 text-blue-700" size={19} />

                  <div>
                    <p className="text-xs font-bold uppercase tracking-wide text-blue-600">
                      Applicable Rule
                    </p>

                    <p className="mt-1 font-semibold text-blue-900">
                      Packaged Commodities Rules, 2011
                    </p>

                    <p className="mt-1 text-sm text-blue-800">
                      PCR Rule 6 — Packaged commodity declaration requirements
                    </p>
                  </div>
                </div>
              </div>

              {/* Inspector notes */}
              <div className="mt-6">
                <label className="text-sm font-semibold text-slate-800">
                  Inspector Verification Notes
                </label>

                <textarea
                  value={notes}
                  onChange={(e) =>
                  handleNotesChange(e.target.value)
                }
                  placeholder="Add inspector notes or justification..."
                  className="mt-2 min-h-[120px] w-full resize-none rounded-xl border border-slate-300 bg-white p-4 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />

                <p className="mt-2 text-xs text-slate-400">
                  Notes will be attached to the inspection record.
                </p>
              </div>

              {/* Decision result */}
              {decision && (
                <div
                  className={`mt-5 rounded-xl border p-4 ${
                    decision === "confirmed"
                      ? "border-green-200 bg-green-50"
                      : "border-slate-200 bg-slate-50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {decision === "confirmed" ? (
                      <CheckCircle2 className="text-green-600" size={22} />
                    ) : (
                      <XCircle className="text-slate-600" size={22} />
                    )}

                    <div>
                      <p className="font-semibold">
                        {decision === "confirmed"
                          ? "Violation Confirmed"
                          : "AI Finding Rejected"}
                      </p>

                      <p className="text-sm text-slate-500">
                        Inspector decision recorded for this prototype.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="mt-6 space-y-3">
                <button
                  onClick={handleConfirm}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-red-600 px-5 py-3.5 font-semibold text-white shadow-sm transition hover:bg-red-700"
                >
                  <CheckCircle2 size={19} />
                  Confirm Violation
                </button>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={handleReject}
                    className="flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-3 font-semibold text-slate-700 transition hover:bg-slate-50"
                  >
                    <XCircle size={18} />
                    Reject Finding
                  </button>

                  <button
                    onClick={handleRetake}
                    className="flex items-center justify-center gap-2 rounded-xl border border-orange-200 bg-orange-50 px-4 py-3 font-semibold text-orange-700 transition hover:bg-orange-100"
                  >
                    <Camera size={18} />
                    Request Retake
                  </button>
                </div>

                <button
                onClick={handleManualAudit}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-500 transition hover:bg-slate-50"
                >
                  <Flag size={17} />
                  Flag for Manual Audit
                </button>

                {retakeRequested && (
  <div className="mt-4 rounded-xl border border-orange-200 bg-orange-50 p-4 text-sm text-orange-800">
    <div className="flex items-center gap-2 font-semibold">
      <Camera size={17} />
      Retake requested
    </div>

    <p className="mt-1">
      The inspection has been marked for a new image capture
      and re-analysis.
    </p>
  </div>
)}

{manualAudit && (
  <div className="mt-4 rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-800">
    <div className="flex items-center gap-2 font-semibold">
      <Flag size={17} />
      Manual audit requested
    </div>

    <p className="mt-1">
      This inspection remains in review until an inspector
      completes the manual verification.
    </p>
  </div>
)}
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}