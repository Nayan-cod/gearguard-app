'use client'
import { useEffect, useState } from 'react'
import { Filter, ChevronDown, CheckCircle, Clock, AlertTriangle, AlertCircle } from 'lucide-react'
import Modal from '../../components/Modal'

export default function RequestsPage() {
  const [requests, setRequests] = useState<any[]>([])
  const [equipmentList, setEquipmentList] = useState<any[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [newRequest, setNewRequest] = useState({
      subject: '', description: '', priority: 'medium', type: 'corrective', equipment_id: ''
  })
  const [selectedRequest, setSelectedRequest] = useState<any>(null)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)

  // Fetch Requests & Equipment
  const fetchData = () => {
    fetch('http://localhost:8000/api/requests')
      .then(res => res.json())
      .then(data => setRequests(data))
    
    fetch('http://localhost:8000/api/equipment')
      .then(res => res.json())
      .then(data => setEquipmentList(data))
  }

  useEffect(() => {
    fetchData()
  }, [])

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
              fetchData()
              setIsModalOpen(false)
              setNewRequest({ subject: '', description: '', priority: 'medium', type: 'corrective', equipment_id: '' })
          }
      } catch (error) {
          console.error("Failed to create request", error)
      }
  }

  // Stats Logic - Calculate from real data
  const total = requests.length
  const critical = requests.filter(r => r.priority === 'high').length
  const completed = requests.filter(r => r.stage === 'repaired').length

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold mb-1">Maintenance Requests</h1>
          <p className="text-gray-500 text-sm">Manage and track all maintenance activities</p>
        </div>
        <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg text-sm font-bold flex items-center gap-2 shadow-lg shadow-blue-200 transition"
        >
            <AlertCircle size={18} />
            Make Request
        </button>
      </div>

       {/* Stats Section moved to Grid */}
       <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-4 rounded-xl border border-gray-100 flex items-center gap-4 shadow-sm">
                <div className="p-3 bg-orange-50 text-orange-500 rounded-lg"><Clock size={20} /></div>
                <div><h3 className="text-2xl font-bold">{requests.filter(r => r.stage !== 'repaired' && r.stage !== 'scrap').length}</h3><p className="text-xs text-gray-500">Active Requests</p></div>
            </div>
            <div className="bg-white p-4 rounded-xl border border-gray-100 flex items-center gap-4 shadow-sm">
                <div className="p-3 bg-red-50 text-red-500 rounded-lg"><AlertTriangle size={20} /></div>
                <div><h3 className="text-2xl font-bold">1</h3><p className="text-xs text-gray-500">Overdue</p></div>
            </div>
            <div className="bg-white p-4 rounded-xl border border-gray-100 flex items-center gap-4 shadow-sm">
                 <div className="p-3 bg-green-50 text-green-500 rounded-lg"><CheckCircle size={20} /></div>
                 <div><h3 className="text-2xl font-bold">{requests.filter(r => r.stage === 'repaired').length}</h3><p className="text-xs text-gray-500">Completed</p></div>
            </div>
       </div>

      {/* Filters */}
       <div className="flex gap-4 mb-6">
            <FilterButton label="All Statuses" />
            <FilterButton label="All Types" />
            <FilterButton label="All Priorities" />
            <button className="ml-auto flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700">
                <Filter size={14} />
                Reset Filters
            </button>
       </div>

       {/* List */}
       <div className="space-y-4">
          {requests.map(req => (
              <div key={req.id} className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-start md:items-center hover:shadow-md transition">
                  <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                          <h3 className="font-bold text-gray-800">{req.subject}</h3>
                          {req.priority === 'high' && <span className="bg-red-100 text-red-700 text-[10px] font-bold px-2 py-0.5 rounded">High</span>}
                          {req.priority === 'medium' && <span className="bg-yellow-100 text-yellow-700 text-[10px] font-bold px-2 py-0.5 rounded">Medium</span>}
                          {req.priority === 'low' && <span className="bg-green-100 text-green-700 text-[10px] font-bold px-2 py-0.5 rounded">Low</span>}
                          
                          <span className="bg-blue-50 text-blue-600 text-[10px] font-bold px-2 py-0.5 rounded capitalize">{req.request_type}</span>
                          {req.stage === 'scrap' && <span className="bg-gray-100 text-gray-600 text-[10px] font-bold px-2 py-0.5 rounded">Scrap</span>}
                      </div>
                      <p className="text-sm text-gray-500 mb-2 line-clamp-1">{req.description}</p>
                      <div className="flex gap-6 text-xs text-gray-400">
                          <span className="flex items-center gap-1"><WrenchIcon size={12}/> {req.equipment ? req.equipment.name : 'Unknown Equipment'}</span>
                          <span className="flex items-center gap-1"><UserIcon size={12}/> {req.team ? req.team.name : 'Unassigned'}</span>
                          <span className="flex items-center gap-1"><CalendarIcon size={12}/> {req.schedule_date}</span>
                      </div>
                  </div>
                   <button 
                        onClick={() => { setSelectedRequest(req); setIsDetailModalOpen(true); }}
                        className="bg-gray-50 hover:bg-gray-100 text-gray-600 px-4 py-2 rounded-lg text-sm font-medium border border-gray-200 transition"
                   >
                      View Details
                   </button>
              </div>
          ))}
       </div>

        {/* Create Request Modal */}
        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create New Request">
            <form onSubmit={handleCreateRequest} className="space-y-4">
               <div>
                   <label className="block text-sm font-medium text-gray-700 mb-1">Target Equipment</label>
                   <select 
                       required
                       className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                       value={newRequest.equipment_id}
                       onChange={(e) => setNewRequest({...newRequest, equipment_id: e.target.value})}
                   >
                       <option value="">Select Equipment...</option>
                       {equipmentList.map(eq => (
                           <option key={eq.id} value={eq.id}>{eq.name} - {eq.serial_no}</option>
                       ))}
                   </select>
               </div>

               <div>
                   <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                   <input 
                       required
                       type="text"
                       className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                       placeholder="e.g. Hydraulic Leak on Press #4"
                       value={newRequest.subject}
                       onChange={(e) => setNewRequest({...newRequest, subject: e.target.value})}
                   />
               </div>

               <div className="grid grid-cols-2 gap-4">
                   <div>
                       <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                       <select 
                           className="w-full border border-gray-300 rounded-lg p-2.5 text-sm outline-none"
                           value={newRequest.priority}
                           onChange={(e) => setNewRequest({...newRequest, priority: e.target.value})}
                       >
                           <option value="low">Low</option>
                           <option value="medium">Medium</option>
                           <option value="high">High</option>
                       </select>
                   </div>
                   <div>
                       <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                       <select 
                           className="w-full border border-gray-300 rounded-lg p-2.5 text-sm outline-none"
                           value={newRequest.type}
                           onChange={(e) => setNewRequest({...newRequest, type: e.target.value})}
                       >
                           <option value="corrective">Corrective</option>
                           <option value="preventive">Preventive</option>
                       </select>
                   </div>
               </div>

               <div>
                   <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                   <textarea 
                       required
                       rows={4}
                       className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                       placeholder="Describe the issue in detail..."
                       value={newRequest.description}
                       onChange={(e) => setNewRequest({...newRequest, description: e.target.value})}
                   />
               </div>

               <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                   <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 text-gray-600 font-medium hover:bg-gray-100 rounded-lg transition">Cancel</button>
                   <button type="submit" className="px-5 py-2.5 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition shadow-lg shadow-blue-200">Create Request</button>
               </div>
            </form>
        </Modal>

        {/* View Details Modal */}
        {selectedRequest && (
            <Modal isOpen={isDetailModalOpen} onClose={() => setIsDetailModalOpen(false)} title="Request Details">
                <div className="space-y-6">
                    <div className="flex justify-between items-start">
                        <div>
                             <h2 className="text-xl font-bold text-gray-900">{selectedRequest.subject}</h2>
                             <p className="text-xs text-gray-500">{selectedRequest.id} • Created on {selectedRequest.schedule_date}</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                            selectedRequest.priority === 'high' ? 'bg-red-100 text-red-700' : 
                            selectedRequest.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'
                        }`}>
                            {selectedRequest.priority} Priority
                        </span>
                    </div>

                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 space-y-3">
                         <div className="flex justify-between text-sm">
                             <span className="text-gray-500">Equipment:</span>
                             <span className="font-bold">{selectedRequest.equipment?.name || 'Unknown'}</span>
                         </div>
                         <div className="flex justify-between text-sm">
                             <span className="text-gray-500">Assigned Team:</span>
                             <span className="font-bold">{selectedRequest.team?.name || 'Pending Assignment'}</span>
                         </div>
                         <div className="flex justify-between text-sm">
                             <span className="text-gray-500">Stage:</span>
                             <span className="font-bold capitalize text-blue-600">{selectedRequest.stage.replace('_', ' ')}</span>
                         </div>
                    </div>

                    <div>
                        <h4 className="font-bold text-sm text-gray-900 mb-2">Description</h4>
                        <p className="text-gray-600 text-sm leading-relaxed">{selectedRequest.description}</p>
                    </div>

                    <div className="flex justify-end pt-6">
                        <button onClick={() => setIsDetailModalOpen(false)} className="px-5 py-2.5 bg-gray-100 text-gray-700 font-bold rounded-lg hover:bg-gray-200 transition">Close</button>
                    </div>
                </div>
            </Modal>
        )}
    </div>
  )
}

function FilterButton({ label }: any) {
    return (
        <button className="flex items-center justify-between px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm text-gray-600 min-w-[160px]">
            {label}
            <ChevronDown size={16} className="text-gray-400" />
        </button>
    )
}

import { Wrench as WrenchIcon, User as UserIcon, Calendar as CalendarIcon } from 'lucide-react'
