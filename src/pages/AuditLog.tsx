
import { useMemo, useState } from 'react'
import { Search, History, ClipboardCheck } from 'lucide-react'
import { useInspections } from '../context/InspectionContext'

export default function AuditLog() {
  const { inspections } = useInspections()
  const [search, setSearch] = useState('')

  const entries = useMemo(() => {
    return inspections
      .map((inspection) => ({
        id: inspection.id,
        product: inspection.productName,
        manufacturer: inspection.manufacturer || '—',
        inspector: inspection.inspector || '—',
        date: inspection.date,
        status: inspection.status,
        confirmed: inspection.confirmed,
        notes: inspection.inspectorNotes || '',
      }))
      .filter((entry) => {
        const query = search.toLowerCase()
        return [
          entry.id,
          entry.product,
          entry.manufacturer,
          entry.inspector,
          entry.status,
          entry.notes,
        ].some((value) => value.toLowerCase().includes(query))
      })
      .sort(
        (a, b) =>
          new Date(b.date).getTime() - new Date(a.date).getTime(),
      )
  }, [inspections, search])

  function statusLabel(status: string, confirmed?: boolean) {
    if (confirmed) return 'Inspector confirmed'
    if (status === 'non-compliant') return 'Non-compliant'
    if (status === 'completed') return 'Completed'
    if (status === 'analyzing') return 'Analysis started'
    if (status === 'draft') return 'Draft created'
    return 'Awaiting review'
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">
          Audit Log
        </h1>
        <p className="mt-2 text-slate-500">
          Review recorded inspections and their current verification details.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">Inspection records</p>
            <History className="text-blue-700" size={22} />
          </div>
          <p className="mt-3 text-3xl font-bold text-slate-900">
            {inspections.length}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">Inspector-confirmed</p>
            <ClipboardCheck className="text-green-700" size={22} />
          </div>
          <p className="mt-3 text-3xl font-bold text-slate-900">
            {inspections.filter((i) => i.confirmed).length}
          </p>
        </div>
      </div>

      <section className="rounded-xl border border-slate-200 bg-white p-5">
        <div className="mb-5 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              Inspection Activity Register
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              {entries.length} matching records
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
              placeholder="Search ID, product, inspector or notes..."
              className="w-full rounded-lg border border-slate-200 py-3 pl-10 pr-3 outline-none focus:border-blue-500"
            />
          </div>
        </div>

        {entries.length === 0 ? (
          <div className="py-12 text-center">
            <History className="mx-auto mb-3 text-slate-300" size={38} />
            <p className="font-semibold text-slate-800">
              No matching records
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-xs uppercase text-slate-500">
                  <th className="px-3 py-4">Date</th>
                  <th className="px-3 py-4">Inspection ID</th>
                  <th className="px-3 py-4">Product</th>
                  <th className="px-3 py-4">Inspector</th>
                  <th className="px-3 py-4">Recorded status</th>
                  <th className="px-3 py-4">Notes</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((entry) => (
                  <tr
                    key={entry.id}
                    className="border-b border-slate-100 last:border-0 hover:bg-slate-50"
                  >
                    <td className="whitespace-nowrap px-3 py-4 text-slate-600">
                      {new Date(entry.date).toLocaleString()}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 font-semibold text-blue-800">
                      {entry.id}
                    </td>
                    <td className="px-3 py-4">
                      <p className="font-medium text-slate-800">
                        {entry.product}
                      </p>
                      <p className="text-xs text-slate-500">
                        {entry.manufacturer}
                      </p>
                    </td>
                    <td className="px-3 py-4 text-slate-600">
                      {entry.inspector}
                    </td>
                    <td className="px-3 py-4 text-slate-700">
                      {statusLabel(entry.status, entry.confirmed)}
                    </td>
                    <td className="max-w-xs px-3 py-4 text-slate-600">
                      {entry.notes || '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <p className="mt-4 text-xs leading-5 text-slate-500">
          This register reflects the inspection records currently stored by
          SatyaScan. It is not an immutable, event-by-event audit trail.
        </p>
      </section>
    </div>
  )
}
