'use client'
import { useEffect, useState } from 'react'
import Modal from '../../components/Modal'

export default function EquipmentPage() {
  const [equipment, setEquipment] = useState([])
  const [selectedEquipment, setSelectedEquipment] = useState<any>(null)
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false)
  const [equipmentRequests, setEquipmentRequests] = useState([])

  // --- ADD EQUIPMENT STATE ---
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [newEquipment, setNewEquipment] = useState({
      name: '', serial_no: '', category: 'General', department: '', image_url: ''
  })

  // --- NEW REQUEST STATE ---
  const [isNewRequestModalOpen, setIsNewRequestModalOpen] = useState(false)
  const [newRequest, setNewRequest] = useState({
      subject: '', description: '', priority: 'medium', type: 'corrective'
  })


  const fetchEquipment = () => {
    fetch('http://localhost:8000/api/equipment', { cache: 'no-store' })
      .then(res => res.json())
      .then(data => setEquipment(data))
  }

  useEffect(() => {
    fetchEquipment()
  }, [])

  const fetchEquipmentRequests = (equipmentId: number) => {
      setEquipmentRequests([]) 
      fetch('http://localhost:8000/api/requests')
        .then(res => res.json())
        .then(data => {
            const related = data.filter((r: any) => r.equipment_id === equipmentId)
            setEquipmentRequests(related)
        })
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
              fetchEquipment()
              setIsAddModalOpen(false)
              setNewEquipment({ name: '', serial_no: '', category: 'General', department: '', image_url: '' })
          }
      } catch (error) {
          console.error("Failed to add equipment", error)
      }
  }

  const handleCreateRequest = async (e: React.FormEvent) => {
      e.preventDefault()
      if (!selectedEquipment) return

      try {
          const res = await fetch('http://localhost:8000/api/requests', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                  ...newRequest,
                  equipment_id: selectedEquipment.id,
                  stage: 'new',
                  request_type: newRequest.type,
                  schedule_date: new Date().toISOString().split('T')[0] // Today
              })
          })
          if (res.ok) {
              fetchEquipmentRequests(selectedEquipment.id) // Refresh local list
              fetchEquipment() // Refresh counts on main card
              setIsNewRequestModalOpen(false)
              setNewRequest({ subject: '', description: '', priority: 'medium', type: 'corrective' })
          }
      } catch (error) {
          console.error("Failed to create request", error)
      }
  }

  return (
    <div>
      <div className="flex justify-between mb-6">
        <h1 className="text-2xl font-bold">Equipment Management</h1>
        <button 
            onClick={() => setIsAddModalOpen(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
        >
            + Add Equipment
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {equipment.map((item: any) => (
          <div key={item.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden group hover:shadow-md transition">
             {/* Equipment Image */}
             <div className="h-48 w-full bg-gray-100 relative">
                {item.image_url ? (
                    <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">No Image</div>
                )}
                {/* Status Badge */}
                <div className="absolute top-3 right-3 flex flex-col gap-1 items-end z-10">
                    {item.is_scrapped ? (
                        <span className="bg-red-600 text-white px-3 py-1 rounded-full text-[10px] font-bold shadow-sm uppercase tracking-wider">
                            Scrapped
                        </span>
                    ) : (item.open_requests || 0) > 0 ? (
                        <span className="bg-orange-500 text-white px-3 py-1 rounded-full text-[10px] font-bold shadow-sm uppercase tracking-wider">
                            Maintenance
                        </span>
                    ) : (
                        <span className="bg-emerald-500 text-white px-3 py-1 rounded-full text-[10px] font-bold shadow-sm uppercase tracking-wider">
                            Operational
                        </span>
                    )}
                </div>
             </div>
            
            <div className="p-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-bold text-lg leading-tight">{item.name}</h3>
                  <p className="text-xs text-gray-500 font-mono mt-1">{item.serial_no}</p>
                </div>
              </div>

              <div className="text-sm text-gray-600 mb-4 space-y-1">
                <p className="flex justify-between"><span className="text-gray-400">Category:</span> {item.category}</p>
                <p className="flex justify-between"><span className="text-gray-400">Dept:</span> <span className="text-right truncate max-w-[150px]">{item.department}</span></p>
              </div>

              {/* Smart Button Logic */}
              <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                <button 
                    onClick={() => {
                        setSelectedEquipment(item)
                        fetchEquipmentRequests(item.id)
                        setIsRequestModalOpen(true)
                    }}
                    className="flex items-center gap-2 text-sm font-bold text-blue-600 hover:text-blue-800 transition"
                >
                   <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs">{item.open_requests}</span>
                   Maintenance History
                </button>
                <button 
                    onClick={() => {
                        setSelectedEquipment(item)
                        fetchEquipmentRequests(item.id)
                        setIsRequestModalOpen(true)
                    }}
                    className="text-gray-400 hover:text-gray-600 text-sm"
                >
                    Details
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* --- ADD EQUIPMENT MODAL --- */}
      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Register New Equipment">
          <form onSubmit={handleAddEquipment} className="space-y-4">
              <input 
                  placeholder="Equipment Name" required className="w-full border p-2 rounded"
                  value={newEquipment.name} onChange={e => setNewEquipment({...newEquipment, name: e.target.value})}
              />
              <div className="grid grid-cols-2 gap-4">
                  <input 
                      placeholder="Serial Number" required className="w-full border p-2 rounded"
                      value={newEquipment.serial_no} onChange={e => setNewEquipment({...newEquipment, serial_no: e.target.value})}
                  />
                  <input 
                      placeholder="Category" required className="w-full border p-2 rounded"
                      value={newEquipment.category} onChange={e => setNewEquipment({...newEquipment, category: e.target.value})}
                  />
              </div>
              <input 
                  placeholder="Department / Location" required className="w-full border p-2 rounded"
                  value={newEquipment.department} onChange={e => setNewEquipment({...newEquipment, department: e.target.value})}
              />
              <input 
                  placeholder="Image URL (e.g., /equipment/new.jpg)" className="w-full border p-2 rounded"
                  value={newEquipment.image_url} onChange={e => setNewEquipment({...newEquipment, image_url: e.target.value})}
              />
              <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded font-bold">Register Equipment</button>
          </form>
      </Modal>

      {/* --- EQUIPMENT DETAIL / REQUESTS MODAL (Redesigned) --- */}
      {selectedEquipment && (
         <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${isRequestModalOpen ? '' : 'hidden'}`}>
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsRequestModalOpen(false)} />
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                <button onClick={() => setIsRequestModalOpen(false)} className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"><span className="text-2xl">&times;</span></button>
                
                {/* 1. Large Header Image (from Photo 2 concept) */}
                <div className="h-48 w-full bg-gray-100">
                    {selectedEquipment.image_url ? (
                        <img src={selectedEquipment.image_url} className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-300">No Hero Image</div>
                    )}
                </div>

                <div className="p-8">
                     {/* 2. Two Columns Info (from Photo 1) */}
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-10">
                        {/* Left Column: Basic Info */}
                        <div>
                            <h3 className="text-lg font-bold text-gray-900 border-b pb-2 mb-4">Basic Information</h3>
                            <div className="space-y-4">
                                <div>
                                    <span className="block text-gray-400 text-xs uppercase tracking-wider">Equipment Name</span>
                                    <div className="font-medium text-gray-800 text-lg">{selectedEquipment.name}</div>
                                </div>
                                <div>
                                    <span className="block text-gray-400 text-xs uppercase tracking-wider">Serial Number</span>
                                    <div className="font-mono text-gray-800">{selectedEquipment.serial_no}</div>
                                </div>
                                <div>
                                    <span className="block text-gray-400 text-xs uppercase tracking-wider">Category</span>
                                    <div className="text-gray-800">{selectedEquipment.category}</div>
                                </div>
                                <div>
                                    <span className="block text-gray-400 text-xs uppercase tracking-wider">Status</span>
                                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold mt-1 ${selectedEquipment.is_scrapped ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                                        {selectedEquipment.is_scrapped ? 'Scrapped' : 'Active'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Right Column: Assignment */}
                        <div>
                            <h3 className="text-lg font-bold text-gray-900 border-b pb-2 mb-4">Assignment & Location</h3>
                            <div className="space-y-4">
                                <div>
                                    <span className="block text-gray-400 text-xs uppercase tracking-wider">Department</span>
                                    <div className="text-gray-800">{selectedEquipment.department}</div>
                                </div>
                                <div>
                                    <span className="block text-gray-400 text-xs uppercase tracking-wider">Location</span>
                                    <div className="text-gray-800">Main Facility - {selectedEquipment.department}</div> 
                                </div>
                                <div>
                                    <span className="block text-gray-400 text-xs uppercase tracking-wider">Maintenance Team</span>
                                    <div className="text-gray-800">Assigned Team</div>
                                </div>
                            </div>
                        </div>
                     </div>

                     {/* 3. Maintenance Requests List (from Photo 1) */}
                     <div className="flex justify-between items-center mb-6">
                         <h3 className="text-xl font-bold text-gray-900">Maintenance Requests</h3>
                         <div className="flex gap-4 items-center">
                             <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">{equipmentRequests.filter((r: any) => r.stage !== 'repaired').length} Open</span>
                             <button 
                                onClick={() => setIsNewRequestModalOpen(true)}
                                className="bg-[#00bda5] text-white px-4 py-2 rounded-lg font-bold hover:bg-[#00a08b] transition"
                             >
                                 + New Request
                             </button>
                         </div>
                     </div>

                     <div className="space-y-4">
                        {equipmentRequests.length === 0 ? (
                            <p className="text-center text-gray-500 py-8 border-2 border-dashed border-gray-100 rounded-xl">No requests on file.</p>
                        ) : (
                            equipmentRequests.map((req: any) => (
                                <div key={req.id} className="p-4 border border-gray-200 rounded-xl bg-white hover:border-blue-300 transition flex justify-between items-start group">
                                    <div>
                                        <div className="flex items-center gap-3 mb-1">
                                            <h4 className="font-bold text-gray-800">{req.subject}</h4>
                                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${req.stage === 'repaired' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                                {req.stage.replace('_', ' ')}
                                            </span>
                                        </div>
                                        <p className="text-gray-600 text-sm mb-2 max-w-xl">{req.description}</p>
                                        <div className="flex gap-4 text-xs text-gray-400">
                                            <span>Type: <span className="capitalize text-gray-600">{req.request_type}</span></span>
                                            <span>Priority: <span className="capitalize text-gray-600">{req.priority}</span></span>
                                            <span>Created: {req.schedule_date}</span>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                     </div>
                </div>
            </div>
         </div>
      )}

      {/* --- NESTED MODAL: NEW REQUEST --- */}
      {isNewRequestModalOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
               <div className="absolute inset-0 bg-black/60" onClick={() => setIsNewRequestModalOpen(false)} />
               <div className="relative bg-white rounded-xl shadow-xl w-full max-w-lg p-6 animate-in fade-in zoom-in-95">
                    <h2 className="text-xl font-bold mb-4">Create New Request</h2>
                    <form onSubmit={handleCreateRequest} className="space-y-4">
                        <input 
                            placeholder="Subject (e.g. Screen Flickering)" required className="w-full border p-2 rounded"
                            value={newRequest.subject} onChange={e => setNewRequest({...newRequest, subject: e.target.value})}
                        />
                         <textarea 
                            placeholder="Detailed Description..." required className="w-full border p-2 rounded h-24"
                            value={newRequest.description} onChange={e => setNewRequest({...newRequest, description: e.target.value})}
                        />
                        <div className="grid grid-cols-2 gap-4">
                             <select className="border p-2 rounded" value={newRequest.priority} onChange={e => setNewRequest({...newRequest, priority: e.target.value})}>
                                 <option value="low">Low Priority</option>
                                 <option value="medium">Medium Priority</option>
                                 <option value="high">High Priority</option>
                             </select>
                             <select className="border p-2 rounded" value={newRequest.type} onChange={e => setNewRequest({...newRequest, type: e.target.value})}>
                                 <option value="corrective">Corrective</option>
                                 <option value="preventive">Preventive</option>
                             </select>
                        </div>
                        <div className="flex gap-2 pt-2">
                             <button type="button" onClick={() => setIsNewRequestModalOpen(false)} className="flex-1 bg-gray-100 text-gray-700 py-2 rounded font-bold hover:bg-gray-200">Cancel</button>
                             <button type="submit" className="flex-1 bg-blue-600 text-white py-2 rounded font-bold hover:bg-blue-700">Create Request</button>
                        </div>
                    </form>
               </div>
          </div>
      )}

    </div>
  )
}