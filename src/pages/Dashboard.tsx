import {
  ArrowUpRight,
  BarChart3,
  CheckCircle2,
  CircleAlert,
  Clock3,
  FileSearch,
  MapPin,
  MoreHorizontal,
  Plus,
  ShieldCheck,
  TrendingUp,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'

// import {
//   complianceTrend,
//   dashboardStats,
//   highPriorityActions,
//   pendingReviews,
//   violationDistribution,
// } from '../data/dashboardData'

import { useInspections } from '../context/InspectionContext'

function SeverityBadge({
  severity,
}: {
  severity: 'Critical' | 'High' | 'Medium'
}) {
  const styles = {
    Critical: 'bg-red-50 text-red-700 border-red-200',
    High: 'bg-orange-50 text-orange-700 border-orange-200',
    Medium: 'bg-blue-50 text-blue-700 border-blue-200',
  }

  return (
    <span
      className={`inline-flex rounded-md border px-2 py-1 text-[11px] font-semibold ${styles[severity]}`}
    >
      {severity}
    </span>
  )
}

function StatCard({
  title,
  value,
  icon,
  children,
  danger = false,
}: {
  title: string
  value: number
  icon: React.ReactNode
  children: React.ReactNode
  danger?: boolean
}) {
  return (
    <div
      className={`rounded-xl border bg-white p-5 ${
        danger ? 'border-red-200' : 'border-slate-200'
      }`}
    >
      <div className="flex items-start justify-between">
        <p className="text-sm font-medium text-slate-600">{title}</p>

        <div
          className={`flex h-8 w-8 items-center justify-center rounded-lg ${
            danger
              ? 'bg-red-50 text-red-600'
              : 'bg-slate-50 text-slate-600'
          }`}
        >
          {icon}
        </div>
      </div>

      <div
        className={`mt-3 text-[30px] font-bold tracking-tight ${
          danger ? 'text-red-600' : 'text-[#0B2347]'
        }`}
      >
        {value.toLocaleString()}
      </div>

      <div className="mt-1 text-xs text-slate-500">{children}</div>
    </div>
  )
}

export default function Dashboard() {
  const navigate = useNavigate()
  const { inspections, storageLoaded } = useInspections()

  const totalInspections = inspections.length

  const compliantInspections = inspections.filter(
    (inspection) =>
      inspection.compliance.overallStatus === 'COMPLIANT',
  ).length

  const nonCompliantInspections = inspections.filter(
    (inspection) =>
      inspection.compliance.overallStatus === 'NON-COMPLIANT',
  ).length

  const underReviewInspections = inspections.filter(
    (inspection) =>
      inspection.compliance.overallStatus === 'REVIEW_PENDING' ||
      inspection.status === 'analyzing' ||
      inspection.status === 'review',
  ).length

  const complianceRate =
    totalInspections > 0
      ? Math.round(
          (compliantInspections / totalInspections) * 100,
        )
      : 0

  const pendingReviews = inspections
    .filter(
      (inspection) =>
        inspection.status === 'review' ||
        inspection.compliance.overallStatus === 'REVIEW_PENDING',
    )
    .slice(0, 5)

  const highPriorityActions = inspections
    .filter(
      (inspection) =>
        inspection.status === 'non-compliant' ||
        inspection.compliance.failed > 0,
    )
    .slice(0, 5)
    .map((inspection) => ({
      id: inspection.id,
      title: inspection.violation?.title || 'Compliance violation detected',
      description:
        inspection.violation?.reason ||
        `${inspection.compliance.failed} compliance issue(s) require attention.`,
      time: inspection.date,
      severity:
  inspection.violation?.severity === 'CRITICAL'
    ? 'Critical'
    : 'High',
    }))

  const violationCounts: Record<string, number> = {}

  inspections.forEach((inspection) => {
    inspection.aiCompliance?.findings
      .filter((finding) => finding.status === 'FAIL')
      .forEach((finding) => {
        const label = finding.field || 'Other violation'
        violationCounts[label] =
          (violationCounts[label] || 0) + 1
      })
  })

  const totalViolations = Object.values(violationCounts).reduce(
    (sum, value) => sum + value,
    0,
  )

  const violationDistribution =
    totalViolations > 0
      ? Object.entries(violationCounts)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5)
          .map(([label, count]) => ({
            label,
            percentage: Math.round(
              (count / totalViolations) * 100,
            ),
          }))
      : []

  const complianceTrend = inspections
    .slice(-7)
    .map((inspection) => inspection.compliance.score)

  const averageCompliance =
    complianceTrend.length > 0
      ? Math.round(
          complianceTrend.reduce(
            (sum, value) => sum + value,
            0,
          ) / complianceTrend.length,
        )
      : 0

  const latestLocation =
    inspections[inspections.length - 1]?.location || 'All Locations'

  const today = new Date().toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })

  if (!storageLoaded) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f7f9fc]">
        <p className="text-slate-500">
          Loading dashboard...
        </p>
      </div>
    )
  }

  return (  
    <div className="px-7 py-6">
      {/* Page header */}
      <div className="mb-6 flex items-end justify-between border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-[28px] font-bold tracking-tight text-[#0B2347]">
            Enforcement Overview
          </h1>

          <div className="mt-2 flex items-center gap-5 text-sm text-slate-500">
            <span className="flex items-center gap-2">
              <Clock3 size={16} />
{today}
            </span>

            <span className="flex items-center gap-2">
              <MapPin size={16} />
{latestLocation}
            </span>
          </div>
        </div>

        <button
          onClick={() => navigate('/inspection/new')}
          className="flex items-center gap-2 rounded-lg bg-[#0B2347] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#12345F]"
        >
          <Plus size={17} />
          Start New Inspection
        </button>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-4 gap-4">
        <StatCard
          title="Total Inspections (30d)"
          value={totalInspections}
          icon={<BarChart3 size={17} />}
        >
          <span className="font-semibold text-green-600">
            ↑ {totalInspections > 0 ? 'Live' : 'No data'}
          </span>{' '}
          vs last month
        </StatCard>

        <StatCard
          title="Compliant"
          value={compliantInspections}
          icon={<CheckCircle2 size={17} />}
        >
          <span className="font-semibold text-slate-700">
            {complianceRate}%
          </span>{' '}
          of total
        </StatCard>

        <StatCard
          title="Non-Compliant"
          value={nonCompliantInspections}
          icon={<CircleAlert size={17} />}
          danger
        >
          <span className="font-semibold text-red-600">
            ↑ {nonCompliantInspections > 0
  ? 'Requires action'
  : 'No violations'}
          </span>{' '}
          increase
        </StatCard>

        <StatCard
          title="Under Review"
         value={underReviewInspections}
          icon={<MoreHorizontal size={17} />}
        >
          Awaiting inspector action
        </StatCard>
      </div>

      {/* Main content */}
      <div className="mt-7 grid grid-cols-[minmax(0,1.8fr)_minmax(300px,0.8fr)] gap-6">
        {/* Pending reviews */}
        <section className="min-w-0">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-[19px] font-bold text-[#0B2347]">
              Pending Inspector Reviews
            </h2>

            <button
              onClick={() => navigate('/history')}
              className="flex items-center gap-1 text-sm font-semibold text-[#0B4A8B] hover:underline"
            >
              View All
              <ArrowUpRight size={15} />
            </button>
          </div>

          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
            <div className="grid grid-cols-[120px_1.2fr_1.2fr_120px_90px] gap-3 border-b border-slate-200 bg-slate-50 px-4 py-3 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
              <span>Inspection ID</span>
              <span>Product</span>
              <span>Manufacturer</span>
              <span>Detection Date</span>
              <span>Severity</span>
            </div>

            {pendingReviews.length > 0 ? (
  pendingReviews.map((review) => (
              <button
                key={review.id}
                onClick={() =>
                  navigate(`/inspection/${review.id}`)
                }
                className="grid w-full grid-cols-[120px_1.2fr_1.2fr_120px_90px] gap-3 border-b border-slate-100 px-4 py-4 text-left transition last:border-b-0 hover:bg-slate-50"
              >
                <span className="text-sm font-semibold text-[#0B4A8B]">
                  {review.id}
                </span>

                <span className="text-sm font-medium text-slate-800">
                 {review.productName}
                </span>

                <span className="text-sm text-slate-600">
                  {review.manufacturer}
                </span>

                <span className="text-sm text-slate-500">
                  {review.date}
                </span>

                <span>
                  <SeverityBadge
  severity={
    review.violation?.severity === 'CRITICAL'
      ? 'Critical'
      : review.compliance.failed > 0
        ? 'High'
        : 'Medium'
  }
/>
                </span>
              </button>
            ))): (
  <div className="px-5 py-8 text-center text-sm text-slate-500">
    No inspections are currently waiting for inspector review.
  </div>
)}
          </div>

          {/* Recent actions */}
          <div className="mt-7">
            <h2 className="mb-3 text-[19px] font-bold text-[#0B2347]">
              Recent High-Priority Actions
            </h2>

            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
              {highPriorityActions.map((action) => (
                <div
                  key={action.id}
                  className="flex items-start gap-4 border-b border-slate-100 px-5 py-4 last:border-b-0"
                >
                  <div
                    className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${
                      action.severity === 'Critical'
                        ? 'bg-red-600'
                        : 'bg-orange-500'
                    }`}
                  />

                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-slate-800">
                      {action.title}
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      {action.description}
                    </p>
                  </div>

                  <span className="shrink-0 text-xs text-slate-400">
                    {action.time}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Right column */}
        <section className="space-y-6">
          {/* Compliance trends */}
          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-[17px] font-bold text-[#0B2347]">
                  Compliance Trends
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  Last 30 days
                </p>
              </div>

              <TrendingUp
                size={19}
                className="text-green-600"
              />
            </div>

            <div className="mt-5">
              <div className="text-[28px] font-bold text-[#0B2347]">
  {averageCompliance}%
</div>

              <div className="text-xs text-slate-500">
                Average Compliance Rate
              </div>
            </div>

            <div className="mt-5 flex h-[130px] items-end gap-2">
              {complianceTrend.map((value, index) => (
                <div
                  key={index}
                  className="group relative flex h-full flex-1 items-end"
                >
                  <div
                    className="w-full rounded-t-md bg-blue-100 transition group-hover:bg-blue-200"
                    style={{
                      height: `${value * 1.15}%`,
                    }}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Violation distribution */}
          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <h2 className="text-[17px] font-bold text-[#0B2347]">
              Violation Distribution
            </h2>

            <div className="mt-5 space-y-4">
             {violationDistribution.length > 0 ? (
  violationDistribution.map((item) => (
    <div key={item.label}>
      <div className="mb-1.5 flex justify-between text-xs">
        <span className="font-medium text-slate-700">
          {item.label}
        </span>

        <span className="font-semibold text-slate-500">
          {item.percentage}%
        </span>
      </div>

      <div className="h-2 overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full rounded-full bg-[#0B4A8B]"
          style={{
            width: `${item.percentage}%`,
          }}
        />
      </div>
    </div>
  ))
) : (
  <p className="py-4 text-center text-sm text-slate-500">
    No violations recorded yet.
  </p>
)}
            </div>
          </div>

          {/* AI Insight */}
          <div className="rounded-xl border border-blue-200 bg-blue-50/60 p-5">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-[#0B4A8B] shadow-sm">
                <ShieldCheck size={17} />
              </div>

              <div>
                <p className="text-sm font-bold text-[#0B2347]">
                  SatyaScan AI Insight
                </p>

                <p className="text-[11px] text-slate-500">
                  Automated analysis
                </p>
              </div>
            </div>

            <p className="mt-4 text-sm leading-6 text-slate-700">
  {nonCompliantInspections > 0
    ? `${nonCompliantInspections} inspection${
        nonCompliantInspections === 1 ? '' : 's'
      } currently show non-compliance findings. Prioritize these cases for inspector verification and corrective action.`
    : totalInspections > 0
      ? `SatyaScan has analyzed ${totalInspections} inspection${
          totalInspections === 1 ? '' : 's'
        } with an average compliance score of ${averageCompliance}%.`
      : 'No inspections have been recorded yet. Start a new inspection to populate the enforcement dashboard.'}
</p>
          </div>
        </section>
      </div>
    </div>
  )
}