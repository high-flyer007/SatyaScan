
import { useMemo } from 'react'
import { BarChart3, CheckCircle2, AlertTriangle, Clock } from 'lucide-react'
import { useInspections } from '../context/InspectionContext'

export default function Analytics() {
  const { inspections } = useInspections()

  const analytics = useMemo(() => {
    const compliant = inspections.filter(
      (i) => i.compliance?.overallStatus === 'COMPLIANT',
    ).length

    const nonCompliant = inspections.filter(
      (i) =>
        i.compliance?.overallStatus === 'NON-COMPLIANT' ||
        i.status === 'non-compliant',
    ).length

    const underReview = Math.max(
      0,
      inspections.length - compliant - nonCompliant,
    )

    const complianceRate = inspections.length
      ? Math.round((compliant / inspections.length) * 100)
      : 0

    const manufacturers = new Map<string, number>()
    inspections.forEach((i) => {
      const name = i.manufacturer.trim() || 'Unknown'
      manufacturers.set(name, (manufacturers.get(name) ?? 0) + 1)
    })

    const topManufacturers = [...manufacturers.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)

    const now = new Date()
    const lastSevenDays = Array.from({ length: 7 }, (_, index) => {
      const day = new Date(now)
      day.setHours(0, 0, 0, 0)
      day.setDate(now.getDate() - (6 - index))

      const count = inspections.filter((i) => {
        const date = new Date(i.date)
        return date.toDateString() === day.toDateString()
      }).length

      return {
        label: day.toLocaleDateString('en-IN', {
          day: 'numeric',
          month: 'short',
        }),
        count,
      }
    })

    return {
      total: inspections.length,
      compliant,
      nonCompliant,
      underReview,
      complianceRate,
      topManufacturers,
      lastSevenDays,
    }
  }, [inspections])

  const maxDaily = Math.max(
    1,
    ...analytics.lastSevenDays.map((day) => day.count),
  )

  const maxManufacturer = Math.max(
    1,
    ...analytics.topManufacturers.map((item) => item[1]),
  )

  const cards = [
    {
      label: 'Total Inspections',
      value: analytics.total,
      icon: BarChart3,
      color: 'text-blue-700 bg-blue-50',
    },
    {
      label: 'Compliant',
      value: analytics.compliant,
      icon: CheckCircle2,
      color: 'text-green-700 bg-green-50',
    },
    {
      label: 'Non-Compliant',
      value: analytics.nonCompliant,
      icon: AlertTriangle,
      color: 'text-red-700 bg-red-50',
    },
    {
      label: 'Under Review',
      value: analytics.underReview,
      icon: Clock,
      color: 'text-amber-700 bg-amber-50',
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">
          Compliance Analytics
        </h1>
        <p className="mt-2 text-slate-500">
          Inspection activity and compliance outcomes from recorded inspections.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => {
          const Icon = card.icon
          return (
            <div
              key={card.label}
              className="rounded-xl border border-slate-200 bg-white p-5"
            >
              <div className="flex items-center justify-between">
                <p className="text-sm text-slate-500">{card.label}</p>
                <span className={`rounded-lg p-2 ${card.color}`}>
                  <Icon size={19} />
                </span>
              </div>
              <p className="mt-4 text-3xl font-bold text-slate-900">
                {card.value}
              </p>
            </div>
          )
        })}
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <section className="rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="text-lg font-semibold text-slate-900">
            Compliance Overview
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Share of recorded inspections marked compliant.
          </p>

          <div className="my-6 flex items-end gap-3">
            <span className="text-5xl font-bold text-slate-900">
              {analytics.complianceRate}%
            </span>
            <span className="mb-2 text-sm text-slate-500">
              {analytics.compliant} of {analytics.total} inspections
            </span>
          </div>

          <div className="h-3 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-green-500 transition-all"
              style={{ width: `${analytics.complianceRate}%` }}
            />
          </div>

          <div className="mt-5 grid grid-cols-3 gap-3 text-sm">
            <div>
              <span className="text-green-700">● Compliant</span>
              <p className="mt-1 font-semibold">{analytics.compliant}</p>
            </div>
            <div>
              <span className="text-red-700">● Non-compliant</span>
              <p className="mt-1 font-semibold">{analytics.nonCompliant}</p>
            </div>
            <div>
              <span className="text-amber-700">● Under review</span>
              <p className="mt-1 font-semibold">{analytics.underReview}</p>
            </div>
          </div>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="text-lg font-semibold text-slate-900">
            Inspections — Last 7 Days
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Counts based on inspection dates.
          </p>

          <div className="mt-6 flex h-48 items-end justify-around gap-3">
            {analytics.lastSevenDays.map((day) => (
              <div
                key={day.label}
                className="flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-2"
              >
                <span className="text-xs font-medium text-slate-600">
                  {day.count}
                </span>
                <div className="flex h-36 w-full items-end">
                  <div
                    className="w-full rounded-t-md bg-blue-500"
                    style={{
                      height: `${Math.max(
                        day.count > 0 ? 8 : 0,
                        (day.count / maxDaily) * 100,
                      )}%`,
                    }}
                  />
                </div>
                <span className="text-xs text-slate-500">{day.label}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-5 xl:col-span-2">
          <h2 className="text-lg font-semibold text-slate-900">
            Manufacturer Activity
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Number of recorded inspections per manufacturer.
          </p>

          {analytics.topManufacturers.length === 0 ? (
            <p className="py-8 text-sm text-slate-500">
              No manufacturer data available yet.
            </p>
          ) : (
            <div className="mt-6 space-y-5">
              {analytics.topManufacturers.map(([name, count]) => (
                <div key={name}>
                  <div className="mb-2 flex justify-between gap-4 text-sm">
                    <span className="font-medium text-slate-700">{name}</span>
                    <span className="text-slate-500">
                      {count} inspection{count === 1 ? '' : 's'}
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-blue-500"
                      style={{
                        width: `${(count / maxManufacturer) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
