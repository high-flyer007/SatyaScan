
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Building2, Search } from 'lucide-react'
import { useInspections } from '../context/InspectionContext'

export default function Manufacturers() {
  const { inspections } = useInspections()
  const navigate = useNavigate()
  const [search, setSearch] = useState('')

  const manufacturers = useMemo(() => {
    const grouped = new Map<string, typeof inspections>()

    inspections.forEach((inspection) => {
      const name = inspection.manufacturer.trim()
      if (!name) return

      const key = name.toLowerCase()
      if (!grouped.has(key)) grouped.set(key, [])
      grouped.get(key)!.push(inspection)
    })

    return Array.from(grouped.values()).map((records) => ({
      name: records[0].manufacturer.trim(),
      inspectionCount: records.length,
      products: [...new Set(
        records.map((record) => record.productName.trim()),
      )],
      latestInspection: records
        .slice()
        .sort(
          (a, b) =>
            new Date(b.date).getTime() -
            new Date(a.date).getTime(),
        )[0],
    }))
  }, [inspections])

  const filtered = manufacturers.filter((manufacturer) => {
    const query = search.toLowerCase()
    return (
      manufacturer.name.toLowerCase().includes(query) ||
      manufacturer.products.some((product) =>
        product.toLowerCase().includes(query),
      )
    )
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">
          Manufacturers
        </h1>
        <p className="mt-2 text-slate-500">
          Explore manufacturers and their associated inspection records.
        </p>
      </div>

      <section className="rounded-xl border border-slate-200 bg-white p-5">
        <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <p className="text-sm text-slate-500">
              Registered manufacturers
            </p>
            <p className="text-3xl font-bold text-slate-900">
              {manufacturers.length}
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
              placeholder="Search manufacturer or product..."
              className="w-full rounded-lg border border-slate-200 py-3 pl-10 pr-3 outline-none focus:border-blue-500"
            />
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="py-12 text-center">
            <Building2
              size={38}
              className="mx-auto mb-3 text-slate-300"
            />
            <p className="font-semibold text-slate-800">
              No manufacturers found
            </p>
            <p className="mt-1 text-sm text-slate-500">
              Manufacturers will appear when inspections contain their names.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-xs uppercase text-slate-500">
                  <th className="px-3 py-4">Manufacturer</th>
                  <th className="px-3 py-4">Products</th>
                  <th className="px-3 py-4">Inspections</th>
                  <th className="px-3 py-4">Latest Inspection</th>
                  <th className="px-3 py-4">Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((manufacturer) => (
                  <tr
                    key={manufacturer.name.toLowerCase()}
                    className="border-b border-slate-100 last:border-0 hover:bg-slate-50"
                  >
                    <td className="px-3 py-4 font-semibold text-slate-800">
                      {manufacturer.name}
                    </td>
                    <td className="px-3 py-4 text-slate-600">
                      {manufacturer.products.join(', ')}
                    </td>
                    <td className="px-3 py-4">
                      <span className="rounded-full bg-blue-50 px-3 py-1 text-blue-700">
                        {manufacturer.inspectionCount}
                      </span>
                    </td>
                    <td className="px-3 py-4 text-slate-600">
                      {new Date(
                        manufacturer.latestInspection.date,
                      ).toLocaleDateString()}
                    </td>
                    <td className="px-3 py-4">
                      <button
                        onClick={() =>
                          navigate(
                            `/inspection/${manufacturer.latestInspection.id}/review`,
                          )
                        }
                        className="font-medium text-blue-700 hover:text-blue-900"
                      >
                        View latest →
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  )
}
