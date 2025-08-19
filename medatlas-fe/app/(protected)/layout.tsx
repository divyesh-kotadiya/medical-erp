import Sidebar from '@/components/Sidebar'
import MobileNav from '@/components/MobileNav'

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <div className="flex-1">
        <MobileNav />
        <main>{children}</main>
      </div>
    </div>
  )
}
