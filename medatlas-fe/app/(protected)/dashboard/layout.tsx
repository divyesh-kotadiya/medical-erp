import { RequireAuth } from '@/components/providers/auth/RequireAuth'

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  return (
    <RequireAuth>
      <div className="flex min-h-screen">
        <div className="flex-1">
          <main>{children}</main>
        </div>
      </div>
    </RequireAuth>
  )
}
