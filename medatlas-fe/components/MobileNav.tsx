'use client'
import { useState } from 'react'
import Link from 'next/link'
import { Menu, X, Home, Settings, FileText, Calendar, Clipboard, AlertCircle, BarChart } from 'lucide-react'

export default function MobileNav() {
  const [open, setOpen] = useState(false)

  const links = [
    { href: '/dashboard', label: 'Dashboard', icon: <Home className="w-5 h-5 mr-2" /> },
    { href: '/dashboard/scheduling', label: 'Scheduling', icon: <Calendar className="w-5 h-5 mr-2" /> },
    { href: '/dashboard/timesheets', label: 'Timesheets', icon: <Clipboard className="w-5 h-5 mr-2" /> },
    { href: '/dashboard/incidents', label: 'Incidents', icon: <AlertCircle className="w-5 h-5 mr-2" /> },
    { href: '/dashboard/documents', label: 'Documents', icon: <FileText className="w-5 h-5 mr-2" /> },
    { href: '/dashboard/reports', label: 'Reports', icon: <BarChart className="w-5 h-5 mr-2" /> },
    { href: '/dashboard/settings', label: 'Settings', icon: <Settings className="w-5 h-5 mr-2" /> },
  ]

  return (
    <div className="md:hidden relative">
      <button
        className="p-2 text-2xl z-20 relative"
        onClick={() => setOpen(!open)}
        aria-label="Toggle menu"
      >
        {open ? <X /> : <Menu />}
      </button>

      {open && (
        <div
          className="fixed inset-0 bg-black bg-opacity-30 z-10"
          onClick={() => setOpen(false)}
        ></div>
      )}

      <div
        className={`fixed top-16 left-0 right-0 bg-white z-20 overflow-hidden transition-[max-height,opacity] duration-300 ease-in-out ${
          open ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="flex items-center px-4 py-3 border-b"
            onClick={() => setOpen(false)}
          >
            {link.icon}
            {link.label}
          </Link>
        ))}
      </div>
    </div>
  )
}
