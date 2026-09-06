interface PagePlaceholderProps {
  title: string
  description: string
}

export function PagePlaceholder({
  title,
  description,
}: PagePlaceholderProps) {
  return (
    <div className="flex min-h-[60vh] items-center justify-center p-8">
      <div className="max-w-md text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-700 shadow-sm">
          SS
        </div>

        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
          {title}
        </h1>

        <p className="mt-2 text-sm leading-6 text-slate-500">
          {description}
        </p>

        <div className="mt-5 inline-flex rounded-md border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-500">
          SatyaScan module
        </div>
      </div>
    </div>
  )
}