
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ClipboardCheck, Search, ArrowUpRight } from 'lucide-react'
import { useInspections } from '../context/InspectionContext'

export default function ActiveInspections() {
  const { inspections } = useInspections()
  const navigate = useNavigate()
  const [search, setSearch] = useState('')

  const activeInspections = useMemo(() => {
    return inspections.filter((inspection) => {
      const status = String(inspection.status).toLowerCase()

      const isActive =
        status === 'draft' ||
        status === 'analyzing' ||
        status === 'review' ||
        status === 'review_pending'

      const query = search.toLowerCase()

      return (
        isActive &&
        [
          inspection.id,
          inspection.productName,
          inspection.manufacturer,
          inspection.location,
        ].some((value) =>
          String(value ?? '').toLowerCase().includes(query),
        )
      )
    })
  }, [inspections, search])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">
          Active Inspections
        </h1>
        <p className="mt-2 text-slate-500">
          Monitor inspections awaiting analysis or inspector review.
        </p>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <div className="mb-5 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <p className="text-sm text-slate-500">
              Active inspections
            </p>
            <p className="text-3xl font-bold text-slate-900">
              {activeInspections.length}
            </p>
          </div>

          <div className="relative w-full sm:max-w-sm">
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

        {activeInspections.length === 0 ? (
          <div className="py-14 text-center">
            <ClipboardCheck
              size={38}
              className="mx-auto mb-3 text-slate-300"
            />
            <h2 className="font-semibold text-slate-800">
              No active inspections found
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              New inspections awaiting review will appear here.
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
                  <th className="px-3 py-4">Location</th>
                  <th className="px-3 py-4">Status</th>
                  <th className="px-3 py-4">Action</th>
                </tr>
              </thead>

              <tbody>
                {activeInspections.map((inspection) => (
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
                    <td className="px-3 py-4 text-slate-600">
                      {inspection.location || '—'}
                    </td>
                    <td className="px-3 py-4">
                      <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700">
                        {inspection.status === 'analyzing'
                          ? 'Analyzing'
                          : inspection.status === 'draft'
                            ? 'Draft'
                            : 'Under Review'}
                      </span>
                    </td>
                    <td className="px-3 py-4">
                      <button
                        onClick={() =>
                          navigate(
                            inspection.status === 'draft' ||
                              inspection.status === 'analyzing'
                              ? `/inspection/${inspection.id}/analysis`
                              : `/inspection/${inspection.id}/review`,
                          )
                        }
                        className="inline-flex items-center gap-1 font-medium text-blue-700 hover:text-blue-900"
                      >
                        Open <ArrowUpRight size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
