'use client'
import { useEffect, useState } from 'react'
import { Users, Clock, AlertCircle, CheckCircle } from 'lucide-react'
import Modal from '../../components/Modal'

export default function TeamsPage() {
  const [teams, setTeams] = useState<any[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [newMember, setNewMember] = useState({ name: '', team_id: '' })

  const fetchTeams = () => {
      fetch('http://localhost:8000/api/teams')
        .then(res => res.json())
        .then(data => setTeams(data))
  }

  useEffect(() => {
    fetchTeams()
  }, [])

  const handleAddMember = async (e: React.FormEvent) => {
      e.preventDefault()
      try {
          const res = await fetch('http://localhost:8000/api/technicians', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                  name: newMember.name,
                  team_id: parseInt(newMember.team_id)
              })
          })
          if (res.ok) {
              fetchTeams()
              setIsModalOpen(false)
              setNewMember({ name: '', team_id: '' })
          }
      } catch (error) {
          console.error("Failed to add member", error)
      }
  }

  return (
    <div>
      <div className="flex justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold mb-1">Maintenance Teams</h1>
          <p className="text-gray-500 text-sm">Manage specialized maintenance teams and technicians</p>
        </div>
        <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-[#0ea5e9] text-white px-4 py-2 rounded-lg font-medium hover:bg-[#0284c7] transition flex items-center gap-2"
        >
          <span>+ Add Team Member</span>
        </button>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add Team Member">
          <form onSubmit={handleAddMember} className="space-y-4">
              <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <input 
                    type="text" 
                    required
                    className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none"
                    value={newMember.name}
                    onChange={e => setNewMember({...newMember, name: e.target.value})}
                  />
              </div>
              <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Assign to Team</label>
                  <select 
                    required
                    className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none"
                    value={newMember.team_id}
                    onChange={e => setNewMember({...newMember, team_id: e.target.value})}
                  >
                      <option value="">Select a Team</option>
                      {teams.map(team => (
                          <option key={team.id} value={team.id}>{team.name}</option>
                      ))}
                  </select>
              </div>
              <button type="submit" className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-bold hover:bg-blue-700 transition">
                  Add Member
              </button>
          </form>
      </Modal>

        {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <StatCard icon={<Users className="text-blue-500" />} value="3" label="Active Teams" />
        <StatCard icon={<Users className="text-green-500" />} value="9" label="Total Technicians" />
        <StatCard icon={<AlertCircle className="text-orange-500" />} value="25" label="Active Requests" />
        <StatCard icon={<Clock className="text-purple-500" />} value="2.4h" label="Avg Response Time" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {teams.map((team, index) => (
          <div key={team.id} className={`bg-white rounded-xl shadow-sm border-t-4 p-6 ${getTeamColor(index)}`}>
            <div className="flex justify-between items-start mb-4">
               <div className="flex gap-3 items-center">
                    <div className={`p-2 rounded-lg ${getTeamIconBg(index)}`}>
                        {getTeamIcon(index)}
                    </div>
                   <div>
                        <h3 className="font-bold text-lg">{team.name}</h3>
                        <p className="text-xs text-gray-500">{getTeamRole(team.name)}</p>
                   </div>
               </div>
               <button className="text-gray-400 hover:text-gray-600">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/></svg>
               </button>
            </div>

            <p className="text-sm text-gray-600 mb-6 min-h-[40px]">{getTeamDescription(team.name)}</p>

            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Team Members</h4>
            
            <div className="space-y-4">
                {team.members.map((member: any) => (
                    <div key={member.id} className="flex items-center gap-3">
                         <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white ${getMemberColor(member.name)}`}>
                            {getInitials(member.name)}
                         </div>
                         <div>
                             <p className="text-sm font-bold text-gray-800">{member.name}</p>
                             <p className="text-xs text-gray-500">{getMemberRole(member.name)}</p>
                         </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-3 gap-2 mt-6 pt-4 border-t border-gray-100 text-center">
                 <div>
                    <span className="block font-bold text-lg">{Math.floor(Math.random() * 10) + 5}</span>
                    <span className="text-[10px] text-gray-400 uppercase">Active</span>
                 </div>
                 <div>
                    <span className="block font-bold text-lg">{Math.floor(Math.random() * 30) + 15}</span>
                    <span className="text-[10px] text-gray-400 uppercase">Completed</span>
                 </div>
                 <div>
                    <span className="block font-bold text-lg">{(Math.random() * 4).toFixed(1)}h</span>
                    <span className="text-[10px] text-gray-400 uppercase">Avg Time</span>
                 </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function StatCard({ icon, value, label }: any) {
    return (
        <div className="bg-white p-4 rounded-xl border border-gray-100 flex items-center gap-4">
            <div className="p-3 bg-gray-50 rounded-lg">{icon}</div>
            <div>
                <h3 className="text-2xl font-bold">{value}</h3>
                <p className="text-xs text-gray-500">{label}</p>
            </div>
        </div>
    )
}

// Helpers for dummy styling/data matching the screenshot
function getTeamColor(index: number) {
    const colors = ['border-orange-400', 'border-blue-500', 'border-green-500']
    return colors[index % colors.length]
}
function getTeamIconBg(index: number) {
    const colors = ['bg-orange-50 text-orange-500', 'bg-blue-50 text-blue-500', 'bg-green-50 text-green-500']
    return colors[index % colors.length]
}
function getTeamIcon(index: number) {
     if (index === 0) return <WrenchIcon />
     if (index === 1) return <ZapIcon />
     return <MonitorIcon />
}
function getTeamRole(name: string) {
    if (name.includes('Mechanical')) return "Mechanical Repairs"
    if (name.includes('Electrical')) return "Electrical Systems"
    return "Technology Equipment"
}
function getTeamDescription(name: string) {
    if (name.includes('Mechanical')) return "Handles all mechanical equipment maintenance and repairs"
    if (name.includes('Electrical')) return "Specializes in electrical equipment and building systems"
    return "Maintains computers, printers, and digital equipment"
}
function getMemberRole(name: string) {
    // Dummy roles based on screenshot names
    if (name === "Mike Johnson") return "Senior Technician"
    if (name === "Tom Rodriguez") return "Technician"
    if (name === "Steve Wilson") return "Junior Technician"
    if (name === "Lisa Park") return "Lead Electrician"
    if (name === "Jennifer Wu") return "Electrician"
    if (name === "Carlos Martinez") return "Apprentice Electrician"
    if (name === "Alex Chen") return "IT Specialist"
    if (name === "Kevin Zhang") return "Technical Support"
    return "Help Desk Technician"
}
function getMemberColor(name: string) {
     if (name.includes("Mike") || name.includes("Lisa") || name.includes("Alex")) return "bg-blue-600"
     if (name.includes("Tom") || name.includes("Jen") || name.includes("Kevin")) return "bg-indigo-500" 
     return "bg-slate-500" 
}
function getInitials(name: string) {
    return name.split(' ').map(n => n[0]).join('')
}

const WrenchIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>

const ZapIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>

const MonitorIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
