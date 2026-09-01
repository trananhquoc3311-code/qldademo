import { ProtectedRoute } from '@/components/ProtectedRoute'
import { Dashboard } from '@/features/dashboard/components/dashboard'

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <Dashboard />
    </ProtectedRoute>
  )
}
