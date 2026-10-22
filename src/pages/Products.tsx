
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Package, Search } from 'lucide-react'
import { useInspections } from '../context/InspectionContext'

export default function Products() {
  const { inspections } = useInspections()
  const navigate = useNavigate()
  const [search, setSearch] = useState('')

  const products = useMemo(() => {
    const grouped = new Map<string, typeof inspections>()

    inspections.forEach((inspection) => {
      const key = [
        inspection.productName.trim().toLowerCase(),
        inspection.manufacturer.trim().toLowerCase(),
      ].join('|')

      if (!grouped.has(key)) grouped.set(key, [])
      grouped.get(key)!.push(inspection)
    })

    return Array.from(grouped.values()).map((records) => ({
      ...records[0],
      inspectionCount: records.length,
      latestDate: records
        .map((record) => record.date)
        .sort()
        .at(-1) ?? records[0].date,
    }))
  }, [inspections])

  const filteredProducts = products.filter((product) => {
    const query = search.toLowerCase()
    return (
      product.productName.toLowerCase().includes(query) ||
      product.manufacturer.toLowerCase().includes(query)
    )
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">
          Product Repository
        </h1>
        <p className="mt-2 text-slate-500">
          Products identified across SatyaScan inspections.
        </p>
      </div>

      <section className="rounded-xl border border-slate-200 bg-white p-5">
        <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <p className="text-sm text-slate-500">Unique products</p>
            <p className="text-3xl font-bold text-slate-900">
              {products.length}
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
              placeholder="Search product or manufacturer..."
              className="w-full rounded-lg border border-slate-200 py-3 pl-10 pr-3 outline-none focus:border-blue-500"
            />
          </div>
        </div>

        {filteredProducts.length === 0 ? (
          <div className="py-12 text-center">
            <Package className="mx-auto mb-3 text-slate-300" size={38} />
            <p className="font-semibold text-slate-800">
              No products found
            </p>
            <p className="mt-1 text-sm text-slate-500">
              Create an inspection to add a product to this repository.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-xs uppercase text-slate-500">
                  <th className="px-3 py-4">Product</th>
                  <th className="px-3 py-4">Manufacturer</th>
                  <th className="px-3 py-4">Latest Inspection</th>
                  <th className="px-3 py-4">Inspections</th>
                  <th className="px-3 py-4">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((product) => (
                  <tr
                    key={`${product.productName}-${product.manufacturer}`}
                    className="border-b border-slate-100 last:border-0 hover:bg-slate-50"
                  >
                    <td className="px-3 py-4 font-semibold text-slate-800">
                      {product.productName}
                    </td>
                    <td className="px-3 py-4 text-slate-600">
                      {product.manufacturer || '—'}
                    </td>
                    <td className="px-3 py-4 text-slate-600">
                      {product.latestDate
                        ? new Date(product.latestDate).toLocaleDateString()
                        : '—'}
                    </td>
                    <td className="px-3 py-4">
                      <span className="rounded-full bg-blue-50 px-3 py-1 text-blue-700">
                        {product.inspectionCount}
                      </span>
                    </td>
                    <td className="px-3 py-4">
                      <button
                        onClick={() =>
                          navigate(`/inspection/${product.id}/review`)
                        }
                        className="font-medium text-blue-700 hover:text-blue-900"
                      >
                        View inspection →
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
