
import { useState } from 'react'
import { Search, ShieldCheck, Scale, Info } from 'lucide-react'

const rules = [
  {
    title: 'Manufacturer, packer or importer details',
    reference: 'PCR Rule 6',
    description:
      'The package must declare the applicable manufacturer, packer or importer name and address.',
    keywords: 'manufacturer packer importer name address',
  },
  {
    title: 'Country of origin',
    reference: 'PCR Rule 6',
    description:
      'Imported packages must declare the country of origin as applicable.',
    keywords: 'country origin imported',
  },
  {
    title: 'Common or generic product name',
    reference: 'PCR Rule 6',
    description:
      'The package must identify the commodity by its common or generic name.',
    keywords: 'product commodity common generic name',
  },
  {
    title: 'Net quantity',
    reference: 'PCR Rule 6',
    description:
      'The net quantity must be declared using the appropriate unit of weight, measure or number.',
    keywords: 'net quantity weight measure volume units',
  },
  {
    title: 'Manufacture or packing date',
    reference: 'PCR Rule 6',
    description:
      'The applicable month and year declaration must be checked against the rules for the package.',
    keywords: 'manufacturing packing date month year',
  },
  {
    title: 'MRP inclusive of all taxes',
    reference: 'PCR Rule 6',
    description:
      'The maximum retail price must be declared inclusive of all applicable taxes.',
    keywords: 'mrp maximum retail price taxes rupees',
  },
  {
    title: 'Consumer care details',
    reference: 'PCR Rule 6',
    description:
      'Verify the applicable consumer-care contact information and required declarations.',
    keywords: 'consumer care email phone contact complaint',
  },
  {
    title: 'Best-before or use-by date',
    reference: 'Applicable product-specific requirements',
    description:
      'Check date declarations where required for the type of commodity and applicable rules.',
    keywords: 'expiry best before use by date food',
  },
  {
    title: 'Unit sale price and dimensions',
    reference: 'Where applicable',
    description:
      'Check unit sale price and prescribed dimensions when these declarations apply to the package.',
    keywords: 'unit sale price dimensions length width',
  },
]

export default function RulesCompliance() {
  const [search, setSearch] = useState('')

  const filteredRules = rules.filter((rule) =>
    `${rule.title} ${rule.description} ${rule.reference} ${rule.keywords}`
      .toLowerCase()
      .includes(search.toLowerCase()),
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">
          Rules & Compliance
        </h1>
        <p className="mt-2 text-slate-500">
          Reference checklist for packaged commodity declarations.
        </p>
      </div>

      <div className="flex items-start gap-3 rounded-xl border border-blue-200 bg-blue-50 p-4">
        <Info className="mt-0.5 shrink-0 text-blue-700" size={20} />
        <p className="text-sm leading-6 text-blue-900">
          This is a practical reference checklist, not a substitute for the
          current official rules. Requirements can vary by commodity, package
          type and applicable amendments. Verify legal decisions against the
          official Legal Metrology (Packaged Commodities) Rules and amendments.
        </p>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <div className="mb-5 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="text-green-700" size={22} />
              <h2 className="text-lg font-semibold text-slate-900">
                Declaration Checklist
              </h2>
            </div>
            <p className="mt-1 text-sm text-slate-500">
              {filteredRules.length} reference items
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
              placeholder="Search declarations or rules..."
              className="w-full rounded-lg border border-slate-200 py-3 pl-10 pr-3 outline-none focus:border-blue-500"
            />
          </div>
        </div>

        <div className="space-y-3">
          {filteredRules.map((rule) => (
            <article
              key={rule.title}
              className="rounded-lg border border-slate-200 p-4"
            >
              <div className="flex items-start gap-3">
                <Scale
                  size={20}
                  className="mt-1 shrink-0 text-blue-700"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h3 className="font-semibold text-slate-900">
                      {rule.title}
                    </h3>
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600">
                      {rule.reference}
                    </span>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    {rule.description}
                  </p>
                </div>
              </div>
            </article>
          ))}

          {filteredRules.length === 0 && (
            <p className="py-10 text-center text-sm text-slate-500">
              No matching declarations found.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
