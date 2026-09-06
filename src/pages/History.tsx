import React from 'react'
import {
  CalendarDays,
  CheckCircle2,
  CircleAlert,
  Clock3,
  Search,
  MapPin,
  ArrowUpRight,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useInspections } from '../context/InspectionContext'

export default function History() {
  const navigate = useNavigate()
  const { inspections, storageLoaded } = useInspections()

  const [searchTerm, setSearchTerm] = React.useState('')
  const [statusFilter, setStatusFilter] = React.useState('ALL')

  const filteredInspections = inspections.filter((inspection) => {
    const search = searchTerm.toLowerCase()

    const matchesSearch =
      inspection.id.toLowerCase().includes(search) ||
      inspection.productName.toLowerCase().includes(search) ||
      inspection.manufacturer.toLowerCase().includes(search) ||
      inspection.location.toLowerCase().includes(search)

    const matchesStatus =
      statusFilter === 'ALL' ||
      inspection.status === statusFilter ||
      inspection.compliance.overallStatus === statusFilter

    return matchesSearch && matchesStatus
  })

  const getStatus = (inspection: (typeof inspections)[number]) => {
    if (inspection.compliance.overallStatus === 'NON-COMPLIANT') {
      return {
        label: 'Non-Compliant',
        className: 'bg-red-50 text-red-700 border-red-200',
        icon: <CircleAlert size={13} />,
      }
    }

    if (
      inspection.status === 'review' ||
      inspection.status === 'analyzing' ||
      inspection.compliance.overallStatus === 'REVIEW_PENDING'
    ) {
      return {
        label: 'Under Review',
        className: 'bg-amber-50 text-amber-700 border-amber-200',
        icon: <Clock3 size={13} />,
      }
    }

    return {
      label: 'Compliant',
      className: 'bg-green-50 text-green-700 border-green-200',
      icon: <CheckCircle2 size={13} />,
    }
  }

  if (!storageLoaded) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f7f9fc]">
        <p className="text-slate-500">Loading inspection history...</p>
      </div>
    )
  }

  return (
    <div className="px-7 py-6">
      {/* Header */}
      <div className="mb-6 flex items-end justify-between border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-[28px] font-bold tracking-tight text-[#0B2347]">
            Inspection History
          </h1>

          <div className="mt-2 flex items-center gap-5 text-sm text-slate-500">
            <span className="flex items-center gap-2">
              <CalendarDays size={16} />
              {inspections.length} total inspections
            </span>

            <span className="flex items-center gap-2">
              <MapPin size={16} />
              All Locations
            </span>
          </div>
        </div>

        <button
          onClick={() => navigate('/inspection/new')}
          className="flex items-center gap-2 rounded-lg bg-[#0B2347] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#12345F]"
        >
          + New Inspection
        </button>
      </div>

      {/* Filters */}
      <div className="mb-5 flex items-center gap-3">
        <div className="relative flex-1">
          <Search
            size={17}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />

          <input
            type="text"
            placeholder="Search inspection ID, product, manufacturer or location..."
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-[#0B4A8B] focus:ring-2 focus:ring-blue-100"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value)}
          className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 outline-none focus:border-[#0B4A8B]"
        >
          <option value="ALL">All Statuses</option>
          <option value="COMPLIANT">Compliant</option>
          <option value="NON-COMPLIANT">Non-Compliant</option>
          <option value="REVIEW_PENDING">Under Review</option>
          <option value="review">Review</option>
          <option value="analyzing">Analyzing</option>
        </select>
      </div>

      {/* History table */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="grid grid-cols-[120px_1.2fr_1.2fr_1fr_130px_120px_40px] gap-3 border-b border-slate-200 bg-slate-50 px-4 py-3 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
          <span>Inspection ID</span>
          <span>Product</span>
          <span>Manufacturer</span>
          <span>Location</span>
          <span>Date</span>
          <span>Status</span>
          <span />
        </div>

        {filteredInspections.length > 0 ? (
          filteredInspections.map((inspection) => {
            const status = getStatus(inspection)

            return (
              <button
                key={inspection.id}
                onClick={() =>
  navigate(`/inspection/${inspection.id}/review`)
}
                className="grid w-full grid-cols-[120px_1.2fr_1.2fr_1fr_130px_120px_40px] items-center gap-3 border-b border-slate-100 px-4 py-4 text-left transition last:border-b-0 hover:bg-slate-50"
              >
                <span className="text-sm font-semibold text-[#0B4A8B]">
                  {inspection.id}
                </span>

                <span className="truncate text-sm font-medium text-slate-800">
                  {inspection.productName}
                </span>

                <span className="truncate text-sm text-slate-600">
                  {inspection.manufacturer}
                </span>

                <span className="truncate text-sm text-slate-600">
                  {inspection.location}
                </span>

                <span className="text-sm text-slate-500">
                  {new Date(inspection.date).toLocaleDateString(
                    'en-IN',
                    {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                    },
                  )}
                </span>

                <span
                  className={`inline-flex w-fit items-center gap-1.5 rounded-md border px-2 py-1 text-[11px] font-semibold ${status.className}`}
                >
                  {status.icon}
                  {status.label}
                </span>

                <ArrowUpRight
                  size={16}
                  className="text-slate-400"
                />
              </button>
            )
          })
        ) : (
          <div className="px-5 py-12 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-50">
              <Search size={20} className="text-slate-400" />
            </div>

            <p className="mt-3 text-sm font-semibold text-slate-700">
              No inspections found
            </p>

            <p className="mt-1 text-xs text-slate-500">
              Try changing your search or status filter.
            </p>
          </div>
        )}
      </div>

      {/* Summary */}
      <div className="mt-5 text-xs text-slate-500">
        Showing {filteredInspections.length} of {inspections.length}{' '}
        inspections
      </div>
    </div>
  )
}