
import { useEffect, useState } from 'react'
import { Save, Settings as SettingsIcon, RotateCcw } from 'lucide-react'

type Preferences = {
  defaultLocation: string
  defaultInspector: string
  dateFormat: 'local' | 'iso'
  compactTable: boolean
}

const DEFAULTS: Preferences = {
  defaultLocation: 'Pune',
  defaultInspector: '',
  dateFormat: 'local',
  compactTable: false,
}

const STORAGE_KEY = 'satyascan_preferences'

export default function Settings() {
  const [preferences, setPreferences] = useState<Preferences>(DEFAULTS)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        setPreferences({ ...DEFAULTS, ...JSON.parse(stored) })
      }
    } catch {
      // Keep default preferences if stored settings are invalid.
    }
  }, [])

  function update<K extends keyof Preferences>(
    key: K,
    value: Preferences[K],
  ) {
    setPreferences((current) => ({ ...current, [key]: value }))
    setSaved(false)
  }

  function saveSettings() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences))
    setSaved(true)
  }

  function resetSettings() {
    setPreferences(DEFAULTS)
    localStorage.removeItem(STORAGE_KEY)
    setSaved(false)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">
          Settings
        </h1>
        <p className="mt-2 text-slate-500">
          Manage inspection defaults and display preferences for this browser.
        </p>
      </div>

      <section className="rounded-xl border border-slate-200 bg-white p-6">
        <div className="mb-6 flex items-center gap-3">
          <span className="rounded-lg bg-blue-50 p-3 text-blue-700">
            <SettingsIcon size={22} />
          </span>
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              Inspection Preferences
            </h2>
            <p className="text-sm text-slate-500">
              Defaults to use when starting new work.
            </p>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-700">
              Default inspection location
            </span>
            <input
              value={preferences.defaultLocation}
              onChange={(event) =>
                update('defaultLocation', event.target.value)
              }
              placeholder="e.g. Pune"
              className="w-full rounded-lg border border-slate-200 px-3 py-3 outline-none focus:border-blue-500"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-700">
              Default inspector name
            </span>
            <input
              value={preferences.defaultInspector}
              onChange={(event) =>
                update('defaultInspector', event.target.value)
              }
              placeholder="Enter inspector name"
              className="w-full rounded-lg border border-slate-200 px-3 py-3 outline-none focus:border-blue-500"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-700">
              Date display format
            </span>
            <select
              value={preferences.dateFormat}
              onChange={(event) =>
                update(
                  'dateFormat',
                  event.target.value as Preferences['dateFormat'],
                )
              }
              className="w-full rounded-lg border border-slate-200 px-3 py-3 outline-none focus:border-blue-500"
            >
              <option value="local">Local date format</option>
              <option value="iso">YYYY-MM-DD</option>
            </select>
          </label>

          <label className="flex cursor-pointer items-center gap-3 self-end rounded-lg border border-slate-200 p-4">
            <input
              type="checkbox"
              checked={preferences.compactTable}
              onChange={(event) =>
                update('compactTable', event.target.checked)
              }
              className="h-4 w-4 accent-blue-700"
            />
            <span>
              <span className="block text-sm font-medium text-slate-800">
                Compact tables
              </span>
              <span className="text-xs text-slate-500">
                Preference saved for future UI integration.
              </span>
            </span>
          </label>
        </div>

        <div className="mt-8 flex flex-wrap items-center gap-3 border-t border-slate-100 pt-5">
          <button
            onClick={saveSettings}
            className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-5 py-3 font-medium text-white hover:bg-slate-800"
          >
            <Save size={17} />
            Save Settings
          </button>

          <button
            onClick={resetSettings}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-5 py-3 font-medium text-slate-700 hover:bg-slate-50"
          >
            <RotateCcw size={17} />
            Reset
          </button>

          {saved && (
            <span className="text-sm font-medium text-green-700">
              Preferences saved successfully.
            </span>
          )}
        </div>

        <p className="mt-5 text-xs leading-5 text-slate-500">
          Preferences are stored in this browser only. The location, inspector,
          date format and compact-table option will not affect other pages
          until those pages are connected to these settings.
        </p>
      </section>
    </div>
  )
}
