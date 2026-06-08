'use client'
import { useEffect, useState } from 'react'
import Calendar from '../../components/Calendar'

import Modal from '../../components/Modal'
import { Calendar as CalendarIcon, Clock } from 'lucide-react'

export default function CalendarPage() {
    const [requests, setRequests] = useState([])
    const [equipmentList, setEquipmentList] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [newRequest, setNewRequest] = useState({
        subject: '', description: '', priority: 'medium', type: 'preventive', equipment_id: '', date: new Date().toISOString().split('T')[0]
    })

    const fetchRequests = () => {
         fetch('http://localhost:8000/api/requests')
            .then(res => res.json())
            .then(data => {
                setRequests(data)
                setLoading(false)
            })
            .catch(err => setLoading(false))
    }

    useEffect(() => {
        fetchRequests()

        fetch('http://localhost:8000/api/equipment')
            .then(res => res.json())
            .then(data => setEquipmentList(data))
    }, [])

    const handleSchedule = async (e: React.FormEvent) => {
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
                    schedule_date: newRequest.date
                })
            })
            if (res.ok) {
                fetchRequests()
                setIsModalOpen(false)
                setNewRequest({ subject: '', description: '', priority: 'medium', type: 'preventive', equipment_id: '', date: new Date().toISOString().split('T')[0] })
            }
        } catch (error) { console.error(error) }
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Maintenance Calendar</h1>
                    <p className="text-sm text-gray-500">Schedule and view preventive maintenance tasks</p>
                </div>
                <button 
                    onClick={() => setIsModalOpen(true)}
                    className="bg-[#0ea5e9] text-white px-5 py-2.5 rounded-lg font-bold hover:bg-[#0284c7] transition flex items-center gap-2 shadow-lg shadow-sky-100"
                >
                    <CalendarIcon size={18} />
                    Schedule Maintenance
                </button>
            </div>

            {loading ? (
                <div className="p-12 text-center text-gray-400">Loading Calendar...</div>
            ) : (
                <Calendar events={requests} />
            )}
            
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                 {/* Legend */}
                 <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                    <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2"><Clock size={16} /> Legend</h3>
                    <div className="flex flex-wrap gap-4">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-blue-500 ring-4 ring-blue-50"></div>
                            <span className="text-sm text-gray-600 font-medium">Preventive</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-orange-500 ring-4 ring-orange-50"></div>
                            <span className="text-sm text-gray-600 font-medium">Corrective</span>
                        </div>
                    </div>
                 </div>
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Schedule Maintenance">
                <form onSubmit={handleSchedule} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Target Equipment</label>
                        <select 
                            required className="w-full border border-gray-300 rounded-lg p-2.5 text-sm"
                            value={newRequest.equipment_id} onChange={e => setNewRequest({...newRequest, equipment_id: e.target.value})}
                        >
                            <option value="">Select Asset...</option>
                            {equipmentList.map(eq => <option key={eq.id} value={eq.id}>{eq.name} ({eq.serial_no})</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Task Title</label>
                        <input 
                            required className="w-full border border-gray-300 rounded-lg p-2.5 text-sm"
                            placeholder="e.g. Monthly Inspection"
                            value={newRequest.subject} onChange={e => setNewRequest({...newRequest, subject: e.target.value})}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                            <input 
                                type="date" required className="w-full border border-gray-300 rounded-lg p-2.5 text-sm"
                                value={newRequest.date} onChange={e => setNewRequest({...newRequest, date: e.target.value})}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                            <select 
                                className="w-full border border-gray-300 rounded-lg p-2.5 text-sm"
                                value={newRequest.type} onChange={e => setNewRequest({...newRequest, type: e.target.value})}
                            >
                                <option value="preventive">Preventive</option>
                                <option value="corrective">Corrective</option>
                            </select>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                        <textarea 
                            className="w-full border border-gray-300 rounded-lg p-2.5 text-sm h-24"
                            placeholder="Details..."
                            value={newRequest.description} onChange={e => setNewRequest({...newRequest, description: e.target.value})}
                        />
                    </div>
                    <button type="submit" className="w-full bg-[#0ea5e9] text-white py-2.5 rounded-lg font-bold hover:bg-[#0284c7]">
                        Confirm Schedule
                    </button>
                </form>
            </Modal>
        </div>
    )
}
