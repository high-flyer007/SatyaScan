
import { useMemo, useState } from 'react'
import { FileText, Search, ArrowUpRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useInspections } from '../context/InspectionContext'

export default function Reports() {
  const { inspections } = useInspections()
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const preferences = useMemo(() => {
    try {
        const stored = localStorage.getItem('satyascan_preferences')
        return stored ? JSON.parse(stored) : { dateFormat: 'local' }
    } catch {
        return { dateFormat: 'local' }
    }
    }, [])

  const stats = useMemo(() => {
    const compliant = inspections.filter(
      (i) => i.compliance?.overallStatus === 'COMPLIANT',
    ).length

    const nonCompliant = inspections.filter(
      (i) =>
        i.compliance?.overallStatus === 'NON-COMPLIANT' ||
        i.status === 'non-compliant',
    ).length

    const underReview = inspections.length - compliant - nonCompliant

    return { total: inspections.length, compliant, nonCompliant, underReview }
  }, [inspections])

  const filtered = inspections.filter((inspection) => {
    const query = search.toLowerCase()
    return (
      inspection.id.toLowerCase().includes(query) ||
      inspection.productName.toLowerCase().includes(query) ||
      inspection.manufacturer.toLowerCase().includes(query)
    )
  })

  function getStatus(inspection: (typeof inspections)[number]) {
    if (
      inspection.compliance?.overallStatus === 'NON-COMPLIANT' ||
      inspection.status === 'non-compliant'
    ) {
      return 'Non-Compliant'
    }

    if (inspection.compliance?.overallStatus === 'COMPLIANT') {
      return 'Compliant'
    }

    return 'Under Review'
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">
          Inspection Reports
        </h1>
        <p className="mt-2 text-slate-500">
          Review inspection outcomes and open individual inspection reports.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: 'Total Inspections', value: stats.total },
          { label: 'Compliant', value: stats.compliant },
          { label: 'Non-Compliant', value: stats.nonCompliant },
          { label: 'Under Review', value: stats.underReview },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl border border-slate-200 bg-white p-5"
          >
            <p className="text-sm text-slate-500">{stat.label}</p>
            <p className="mt-2 text-3xl font-bold text-slate-900">
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      <section className="rounded-xl border border-slate-200 bg-white p-5">
        <div className="mb-5 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              Inspection Register
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              {filtered.length} records
            </p>
          </div>

          <div className="relative sm:w-96">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search ID, product or manufacturer..."
              className="w-full rounded-lg border border-slate-200 py-3 pl-10 pr-3 outline-none focus:border-blue-500"
            />
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="py-12 text-center">
            <FileText className="mx-auto mb-3 text-slate-300" size={38} />
            <p className="font-semibold text-slate-800">
              No inspection reports found
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-xs uppercase text-slate-500">
                  <th className="px-3 py-4">Inspection ID</th>
                  <th className="px-3 py-4">Product</th>
                  <th className="px-3 py-4">Manufacturer</th>
                  <th className="px-3 py-4">Date</th>
                  <th className="px-3 py-4">Status</th>
                  <th className="px-3 py-4">Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((inspection) => {
                  const status = getStatus(inspection)

                  return (
                    <tr
                      key={inspection.id}
                      className="border-b border-slate-100 last:border-0 hover:bg-slate-50"
                    >
                      <td className="whitespace-nowrap px-3 py-4 font-semibold text-blue-800">
                        {inspection.id}
                      </td>
                      <td className="px-3 py-4 font-medium text-slate-800">
                        {inspection.productName}
                      </td>
                      <td className="px-3 py-4 text-slate-600">
                        {inspection.manufacturer || '—'}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-slate-600">
                        {preferences.dateFormat === 'iso'
                            ? new Date(inspection.date).toISOString().slice(0, 10)
                            : new Date(inspection.date).toLocaleDateString()}
                      </td>
                      <td className="px-3 py-4">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-medium ${
                            status === 'Compliant'
                              ? 'bg-green-50 text-green-700'
                              : status === 'Non-Compliant'
                                ? 'bg-red-50 text-red-700'
                                : 'bg-amber-50 text-amber-700'
                          }`}
                        >
                          {status}
                        </span>
                      </td>
                      <td className="px-3 py-4">
                        <button
                          onClick={() =>
                            navigate(
                              `/inspection/${inspection.id}/report`,
                            )
                          }
                          className="inline-flex items-center gap-1 font-medium text-blue-700 hover:text-blue-900"
                        >
                          Open <ArrowUpRight size={16} />
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  )
}
