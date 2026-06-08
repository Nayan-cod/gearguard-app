'use client'
import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { LayoutDashboard, Wrench, ClipboardList, Calendar, LogOut, Users, KanbanSquare, Settings, User } from 'lucide-react'
import { usePathname, useRouter } from 'next/navigation'

export default function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  
  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [dropdownRef])

  const [user, setUser] = useState<{name: string, email: string, role: string, image_url?: string | null}>({ name: 'Loading...', email: '', role: 'Facility Manager', image_url: null })

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
        fetch('http://localhost:8000/api/users/me', {
            headers: { 'Authorization': `Bearer ${token}` }
        })
        .then(res => res.json())
        .then(data => {
            if (data.email) setUser({ ...data, role: 'Facility Manager' })
        })
        .catch(err => console.error("Failed to fetch user", err))
    }
  }, [pathname]) // Refresh on path change in case of login

  if (['/login', '/signup'].includes(pathname)) return null

  const handleLogout = () => {
    localStorage.removeItem('token')
    router.push('/login')
  }

  return (
    <nav className="bg-white/90 backdrop-blur-xl border-b border-gray-100/50 px-8 py-4 flex justify-between items-center sticky top-0 z-40 transition-all duration-300">
      <div className="flex items-center gap-12">
        <div className="font-bold text-2xl bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent flex items-center gap-2">
           <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white shadow-indigo-200 shadow-md">
                <Wrench size={18} strokeWidth={2.5} />
           </div>
           <span>GearGuard</span>
        </div>
        
        <div className="flex items-center gap-2 bg-gray-100/50 p-1.5 rounded-xl border border-gray-100">
          <NavLink href="/" icon={<LayoutDashboard size={18} />} text="Overview" active={pathname === '/'} />
          <NavLink href="/equipment" icon={<Wrench size={18} />} text="Equipment" active={pathname === '/equipment'} />
          <NavLink href="/requests" icon={<ClipboardList size={18} />} text="Requests" active={pathname === '/requests'} />
          <NavLink href="/kanban" icon={<KanbanSquare size={18} />} text="Kanban" active={pathname === '/kanban'} />
          <NavLink href="/teams" icon={<Users size={18} />} text="Teams" active={pathname.startsWith('/teams')} />
          <NavLink href="/calendar" icon={<Calendar size={18} />} text="Calendar" active={pathname === '/calendar'} />
        </div>
      </div>

      <div className="flex items-center gap-6">
          {/* Notification Bell Placeholder */}
          <button className="relative text-gray-400 hover:text-gray-600 transition">
              <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>
          </button>

          {/* Profile Dropdown */}
          <div className="relative" ref={dropdownRef}>
              <button 
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-3 hover:bg-gray-50 p-1.5 pr-3 rounded-full transition border border-transparent hover:border-gray-200"
              >
                  {user.image_url ? (
                      <img 
                        src={user.image_url} 
                        alt="User" 
                        className="w-9 h-9 rounded-full object-cover border-2 border-white shadow-sm"
                      />
                  ) : (
                      <div className="w-9 h-9 rounded-full bg-indigo-100 border-2 border-white shadow-sm flex items-center justify-center text-indigo-600 font-bold text-sm">
                          {user.name.charAt(0).toUpperCase()}
                      </div>
                  )}
                  <div className="hidden md:block text-left">
                      <p className="text-xs font-bold text-gray-700">{user.name}</p>
                      <p className="text-[10px] text-gray-500">{user.role}</p>
                  </div>
                  <svg className={`w-4 h-4 text-gray-400 transition ${isProfileOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
              </button>

              {/* Dropdown Menu */}
              {isProfileOpen && (
                  <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 py-2 animate-in fade-in slide-in-from-top-2">
                       <div className="px-4 py-3 border-b border-gray-100">
                           <p className="text-sm font-bold text-gray-900">Signed in as</p>
                           <p className="text-xs text-gray-500 truncate">{user.email}</p>
                       </div>
                       
                       <div className="py-1">
                           <Link href="/settings" className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition">
                                <Settings size={16} className="text-gray-400" />
                                Settings
                           </Link>
                           <Link href="/profile" className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition">
                                <User size={16} className="text-gray-400" />
                                My Profile
                           </Link>
                       </div>

                       <div className="border-t border-gray-100 mt-1 pt-1">
                           <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition">
                                <LogOut size={16} />
                                Sign Out
                           </button>
                       </div>
                  </div>
              )}
          </div>
      </div>
    </nav>
  )
}

function NavLink({ href, icon, text, active }: any) {
  return (
    <Link 
      href={href} 
      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition text-sm font-medium ${
        active ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-900 hover:bg-white/50'
      }`}
    >
      {icon}
      <span>{text}</span>
    </Link>
  )
}