'use client'
import { useState, useEffect } from 'react'
import { Activity, AlertCircle, CheckCircle, Users, Wrench, Database, FileText, Layout, Clock } from 'lucide-react'
import { useRouter } from 'next/navigation'
import Modal from '../components/Modal'

export default function Dashboard() {
  const router = useRouter()
  
  // Stats State
  const [stats, setStats] = useState({ 
    total_equipment: 0, 
    active_requests: 0, 
    overdue_tasks: 0, 
    teams_available: 0 
  })
  const [loading, setLoading] = useState(true)

  // Modal State
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false)
  const [isEquipmentModalOpen, setIsEquipmentModalOpen] = useState(false)
  const [equipmentList, setEquipmentList] = useState<any[]>([])
  
  // Forms State
  const [newRequest, setNewRequest] = useState({
      subject: '', description: '', priority: 'medium', type: 'corrective', equipment_id: ''
  })
  const [newEquipment, setNewEquipment] = useState({
      name: '', serial_no: '', category: 'General', department: '', image_url: ''
  })

  useEffect(() => {
    // Auth Guard
    if (typeof window !== 'undefined' && !localStorage.getItem('token')) {
      router.push('/login')
      return
    }

    // Fetch Stats
    fetch('http://localhost:8000/api/stats')
      .then(res => res.json())
      .then(data => {
        setStats(data)
        setLoading(false)
      })
      .catch(err => setLoading(false))

    // Fetch Equipment for Request Dropdown
    fetch('http://localhost:8000/api/equipment')
        .then(res => res.json())
        .then(data => setEquipmentList(data))

  }, [router])

  const handleCreateRequest = async (e: React.FormEvent) => {
      e.preventDefault()
      try {
          const res = await fetch('http://localhost:8000/api/requests', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                  ...newRequest,
                  equipment_id: parseInt(newRequest.equipment_id),
                  stage: 'new',
                  request_type: newRequest.type,
                  schedule_date: new Date().toISOString().split('T')[0]
              })
          })
          if (res.ok) {
              setIsRequestModalOpen(false)
              setNewRequest({ subject: '', description: '', priority: 'medium', type: 'corrective', equipment_id: '' })
              // Refresh stats
              fetch('http://localhost:8000/api/stats').then(res => res.json()).then(setStats)
          }
      } catch (error) { console.error(error) }
  }

  const handleAddEquipment = async (e: React.FormEvent) => {
      e.preventDefault()
      try {
          const res = await fetch('http://localhost:8000/api/equipment', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(newEquipment)
          })
          if (res.ok) {
              setIsEquipmentModalOpen(false)
              setNewEquipment({ name: '', serial_no: '', category: 'General', department: '', image_url: '' })
              // Refresh stats
              fetch('http://localhost:8000/api/stats').then(res => res.json()).then(setStats)
          }
      } catch (error) { console.error(error) }
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center text-blue-600 font-bold animate-pulse">Loading IntenancePro...</div>

  return (
    <div>
      <div className="text-center mb-12 py-8 bg-gradient-to-b from-blue-50/50 to-transparent -mx-6 -mt-6 px-6">
        <h1 className="text-4xl font-extrabold mb-3 text-gray-900 tracking-tight">Maintenance <span className="text-blue-600">Dashboard</span></h1>
        <p className="text-gray-500 max-w-2xl mx-auto text-lg leading-relaxed">
            Real-time insights across your entire maintenance ecosystem.
        </p>
      </div>
      
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
        <StatCard title="Total Equipment" value={stats.total_equipment} sub="Assets Tracked" icon={<Wrench />} color="text-blue-600" bg="bg-blue-100" />
        <StatCard title="Active Requests" value={stats.active_requests} sub="Pending Actions" icon={<FileText />} color="text-orange-500" bg="bg-orange-100" />
        <StatCard title="Teams Available" value={stats.teams_available} sub="Ready to Deploy" icon={<Users />} color="text-emerald-500" bg="bg-emerald-100" />
        <StatCard title="Overdue Tasks" value={stats.overdue_tasks} sub="Critical Attention" icon={<AlertCircle />} color="text-red-500" bg="bg-red-100" />
      </div>

      {/* Workflow Process */}
      <div className="bg-white rounded-3xl p-10 mb-12 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100">
          <div className="flex items-center justify-center gap-3 mb-12">
            <h2 className="text-xl font-bold text-gray-800">Operational Workflow</h2>
            <div className="h-px bg-gray-200 w-24"></div>
          </div>
          
          <div className="flex flex-col md:flex-row justify-between items-start gap-8 relative px-4">
              {/* Connector lines only visible on desktop */}
              <div className="hidden md:block absolute top-[2.75rem] left-[10%] right-[10%] h-0.5 bg-gray-100 z-0"></div>

              <WorkflowStep 
                  step="01" 
                  title="Register" 
                  desc="Onboard assets to the digital inventory" 
                  icon={<Wrench className="text-white w-5 h-5" />} 
                  color="bg-blue-600 shadow-blue-200"
              />
              <WorkflowStep 
                  step="02" 
                  title="Request" 
                  desc="Log issues with auto-context" 
                  icon={<FileText className="text-white w-5 h-5" />} 
                  color="bg-orange-500 shadow-orange-200"
              />
              <WorkflowStep 
                  step="03" 
                  title="Assign" 
                  desc="Smart-route to teams" 
                  icon={<Users className="text-white w-5 h-5" />} 
                  color="bg-emerald-500 shadow-emerald-200"
              />
               <WorkflowStep 
                  step="04" 
                  title="Execute" 
                  desc="Track resolution via Kanban" 
                  icon={<Layout className="text-white w-5 h-5" />} 
                  color="bg-purple-600 shadow-purple-200"
              />
          </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
           {/* Quick Actions */}
           <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition duration-300">
               <h3 className="font-bold mb-6 text-lg">Quick Actions</h3>
               <div className="space-y-4">
                   <QuickActionItem 
                        onClick={() => setIsRequestModalOpen(true)}
                        icon={<AlertCircle size={20} />} 
                        title="Report Breakdown" 
                        desc="Create corrective maintenance request" 
                        color="bg-red-50 text-red-600" 
                        hover="group-hover:text-red-600"
                   />
                   <QuickActionItem 
                        onClick={() => router.push('/calendar')}
                        icon={<Clock size={20} />} 
                        title="Schedule Preventive" 
                        desc="Plan routine maintenance" 
                        color="bg-blue-50 text-blue-600" 
                        hover="group-hover:text-blue-600"
                   />
                   <QuickActionItem 
                        onClick={() => setIsEquipmentModalOpen(true)}
                        icon={<Wrench size={20} />} 
                        title="Register Equipment" 
                        desc="Add new assets to system" 
                        color="bg-green-50 text-green-600" 
                        hover="group-hover:text-green-600"
                   />
               </div>
           </div>

           {/* Workflow Activity (Dummy) */}
           <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
               <h3 className="font-bold mb-6 text-lg">Live Activity</h3>
               <div className="space-y-8 relative pl-2">
                   <div className="absolute top-2 bottom-2 left-[1.3rem] w-px bg-gray-100"></div>
                   <ActivityItem color="bg-red-500 ring-4 ring-red-50" title="Breakdown Reported" desc="CNC Machine Oil Leak" time="2 hours ago" tag="High" />
                   <ActivityItem color="bg-emerald-500 ring-4 ring-emerald-50" title="Equipment Added" desc="New 3D Printer S5" time="1 day ago" tag="Info" />
                   <ActivityItem color="bg-blue-500 ring-4 ring-blue-50" title="Scheduled Maintenance" desc="HVAC Filter Change" time="2 days ago" tag="Plan" />
               </div>
           </div>

           {/* System Performance */}
           <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-8 rounded-3xl shadow-xl text-white">
               <h3 className="font-bold mb-8 text-lg flex items-center gap-2">
                    <Activity size={18} className="text-blue-400" />
                    System Health
               </h3>
               <div className="space-y-8">
                   <PerformanceItem label="Equipment Uptime" value="98.5%" color="bg-emerald-400" track="bg-slate-700" w="w-[98%]" />
                   <PerformanceItem label="Avg Response Time" value="2.3 hrs" color="bg-blue-400" track="bg-slate-700" w="w-[70%]" />
                   <PerformanceItem label="Team Utilization" value="82%" color="bg-orange-400" track="bg-slate-700" w="w-[82%]" />
                   <PerformanceItem label="Efficiency Score" value="95%" color="bg-purple-400" track="bg-slate-700" w="w-[95%]" />
               </div>
           </div>
      </div>

       {/* --- MODALS --- */}
       <Modal isOpen={isRequestModalOpen} onClose={() => setIsRequestModalOpen(false)} title="Quick Report">
           <form onSubmit={handleCreateRequest} className="space-y-4">
              <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Equipment</label>
                  <select 
                    required className="w-full border p-2 rounded-lg"
                    value={newRequest.equipment_id} onChange={e => setNewRequest({...newRequest, equipment_id: e.target.value})}
                  >
                      <option value="">Select Asset</option>
                      {equipmentList.map(eq => <option key={eq.id} value={eq.id}>{eq.name} ({eq.serial_no})</option>)}
                  </select>
              </div>
               <input 
                  placeholder="Subject" required className="w-full border p-2 rounded-lg"
                  value={newRequest.subject} onChange={e => setNewRequest({...newRequest, subject: e.target.value})}
               />
               <textarea 
                  placeholder="Description..." required className="w-full border p-2 rounded-lg h-24"
                  value={newRequest.description} onChange={e => setNewRequest({...newRequest, description: e.target.value})}
               />
               <button type="submit" className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-bold">Submit</button>
           </form>
      </Modal>

      <Modal isOpen={isEquipmentModalOpen} onClose={() => setIsEquipmentModalOpen(false)} title="Quick Asset Register">
           <form onSubmit={handleAddEquipment} className="space-y-4">
              <input 
                  placeholder="Name" required className="w-full border p-2 rounded-lg"
                  value={newEquipment.name} onChange={e => setNewEquipment({...newEquipment, name: e.target.value})}
              />
              <input 
                  placeholder="Serial No" required className="w-full border p-2 rounded-lg"
                  value={newEquipment.serial_no} onChange={e => setNewEquipment({...newEquipment, serial_no: e.target.value})}
              />
              <input 
                  placeholder="Department" required className="w-full border p-2 rounded-lg"
                  value={newEquipment.department} onChange={e => setNewEquipment({...newEquipment, department: e.target.value})}
              />
              <button type="submit" className="w-full bg-green-600 text-white py-2.5 rounded-lg font-bold">Register</button>
           </form>
      </Modal>
    </div>
  )
}

function StatCard({ title, value, sub, icon, color, bg }: any) {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between hover:shadow-lg hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group">
      <div className={`absolute top-0 right-0 w-24 h-24 ${bg} rounded-full -mr-12 -mt-12 opacity-50 group-hover:scale-110 transition-transform`}></div>
      <div className="relative z-10">
           <div className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-1">{title}</div>
           <div className={`text-3xl font-extrabold mb-1 ${color}`}>{value}</div>
           <div className="text-xs text-gray-400 font-medium">{sub}</div>
      </div>
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${bg} ${color} shadow-sm relative z-10`}>
          {icon}
      </div>
    </div>
  )
}

function WorkflowStep({ step, title, desc, icon, color }: any) {
    return (
        <div className="flex flex-col items-center text-center relative z-10 flex-1 group">
             <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg mb-6 ${color} transform group-hover:scale-110 transition-transform duration-300`}>
                 {icon}
             </div>
             <div className={`w-8 h-8 rounded-lg bg-white border border-gray-100 text-xs font-bold text-gray-500 flex items-center justify-center mb-3 absolute top-12 -right-4 md:right-[unset] md:top-[unset] md:mb-0 md:-mt-10 shadow-sm`}>
                 {step}
             </div>
             <h3 className="font-bold text-gray-800 mb-2">{title}</h3>
             <p className="text-xs text-gray-500 leading-relaxed max-w-[180px]">{desc}</p>
        </div>
    )
}

function QuickActionItem({ icon, title, desc, color, hover, onClick }: any) {
    return (
        <button 
            onClick={onClick}
            className="w-full flex items-center gap-4 p-4 hover:bg-slate-50 rounded-2xl transition duration-200 text-left group border border-transparent hover:border-slate-100"
        >
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${color} group-hover:shadow-md duration-200`}>{icon}</div>
            <div>
                <div className={`font-bold text-sm text-gray-800 transition ${hover}`}>{title}</div>
                <div className="text-xs text-gray-500 font-medium">{desc}</div>
            </div>
        </button>
    )
}

function ActivityItem({ color, title, desc, time, tag }: any) {
    return (
        <div className="relative pl-8">
            <div className={`absolute left-0 top-1.5 w-3 h-3 rounded-full border-2 border-white shadow-sm ${color}`}></div>
            <div className="flex justify-between items-start mb-0.5">
                <span className="font-bold text-sm text-gray-800">{title}</span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${tag === 'High' ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-500'}`}>{tag}</span>
            </div>
            <p className="text-xs text-gray-500 mb-1">{desc}</p>
            <p className="text-[10px] text-gray-400 font-medium">{time}</p>
        </div>
    )
}

function PerformanceItem({ label, value, color, track, w }: any) {
    return (
        <div>
            <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-400 font-medium">{label}</span>
                <span className={`font-bold ${color.replace('bg-', 'text-')}`}>{value}</span>
            </div>
            <div className={`h-2.5 rounded-full overflow-hidden ${track || 'bg-gray-100'}`}>
                <div className={`h-full rounded-full shadow-sm ${color} ${w}`}></div>
            </div>
        </div>
    )
}