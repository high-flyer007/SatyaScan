import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AppShell } from './components/layout/AppShell'
import { PagePlaceholder } from './components/ui/PagePlaceholder'
import Dashboard from './pages/Dashboard'
import NewInspection from './pages/NewInspection'
import InspectionAnalysis from './pages/InspectionAnalysis'
import ComplianceCheck from './pages/ComplianceCheck'
import ReviewVerify from './pages/ReviewVerify'
import Report from './pages/Report'
import History from './pages/History'
import Login from './pages/Login'

function Placeholder({
  title,
  description,
}: {
  title: string
  description: string
}) {
  return (
    <PagePlaceholder
      title={title}
      description={description}
    />
  )
}

function ProtectedApp() {
  const session = localStorage.getItem('satyascan_session')

  if (!session) {
    return <Navigate to="/login" replace />
  }

  return <AppPages />
}

function AppPages() {
  return (
    <AppShell>
      <Routes>
        <Route
          path="/"
          element={<Navigate to="/dashboard" replace />}
        />

        <Route path="/dashboard" element={<Dashboard />} />

        <Route
          path="/inspection/new"
          element={<NewInspection />}
        />

        <Route
          path="/inspection/:inspectionId/compliance"
          element={<ComplianceCheck />}
        />

        <Route
          path="/inspection/:inspectionId/review"
          element={<ReviewVerify />}
        />

        <Route
          path="/inspection/:inspectionId/report"
          element={<Report />}
        />

        <Route
          path="/inspection/active"
          element={
            <Placeholder
              title="Active Inspections"
              description="Monitor inspections currently awaiting review."
            />
          }
        />

        <Route
          path="/inspection/:id/extraction"
          element={
            <Placeholder
              title="Extracted Declarations & Evidence"
              description="AI extraction and evidence review will be implemented next."
            />
          }
        />

        <Route
          path="/inspection/:inspectionId/analysis"
          element={<InspectionAnalysis />}
        />

        <Route
          path="/inspection/:id"
          element={
            <Placeholder
              title="Compliance Review"
              description="Inspector verification and violation review will be implemented next."
            />
          }
        />

        <Route path="/history" element={<History />} />

        <Route
          path="/products"
          element={
            <Placeholder
              title="Product Repository"
              description="Product records and inspection history will appear here."
            />
          }
        />

        <Route
          path="/manufacturers"
          element={
            <Placeholder
              title="Manufacturers"
              description="Manufacturer records will appear here."
            />
          }
        />

        <Route
          path="/reports"
          element={
            <Placeholder
              title="Reports"
              description="Compliance and inspection reports will appear here."
            />
          }
        />

        <Route
          path="/analytics"
          element={
            <Placeholder
              title="Analytics"
              description="Compliance analytics will appear here."
            />
          }
        />

        <Route
          path="/rules"
          element={
            <Placeholder
              title="Rules & Compliance"
              description="Legal Metrology rules and validation logic will appear here."
            />
          }
        />

        <Route
          path="/users"
          element={
            <Placeholder
              title="Users"
              description="System users and access management will appear here."
            />
          }
        />

        <Route
          path="/audit-log"
          element={
            <Placeholder
              title="Audit Log"
              description="SatyaScan activity and verification history will appear here."
            />
          }
        />

        <Route
          path="/settings"
          element={
            <Placeholder
              title="Settings"
              description="SatyaScan configuration will appear here."
            />
          }
        />

        <Route
          path="/help"
          element={
            <Placeholder
              title="Help"
              description="SatyaScan help and support resources will appear here."
            />
          }
        />

        <Route
          path="*"
          element={
            <Placeholder
              title="Page Not Found"
              description="The requested SatyaScan page does not exist."
            />
          }
        />
      </Routes>
    </AppShell>
  )
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Login is intentionally outside AppShell */}
        <Route path="/login" element={<Login />} />

        {/* All application pages use the normal SatyaScan shell */}
       <Route path="*" element={<ProtectedApp />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App