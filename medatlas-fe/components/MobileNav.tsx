'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function MobileNav() {
  const [open, setOpen] = useState(false)

  return (
    <div className="md:hidden border-b bg-white">
      <button className="p-4" onClick={() => setOpen(!open)}>☰</button>
      {open && (
        <nav className="flex flex-col bg-white">
          <Link href="/dashboard" className="px-4 py-2 border-t">Dashboard</Link>
          <Link href="/admin" className="px-4 py-2 border-t">Admin</Link>
        </nav>
      )}
    </div>
  )
}
