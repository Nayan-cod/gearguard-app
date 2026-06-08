'use client'
import { useState, useEffect } from 'react'
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'
import { Clock, AlertCircle, Wrench } from 'lucide-react'

// Stages configuration
const STAGES = {
  new: 'New Request',
  in_progress: 'In Progress',
  repaired: 'Repaired',
  scrap: 'Scrap'
}

export default function KanbanPage() {
  const [requests, setRequests] = useState<any[]>([])

  // Fetch Requests
  const fetchRequests = () => {
      fetch('http://localhost:8000/api/requests')
        .then(res => res.json())
        .then(data => setRequests(data))
  }

  useEffect(() => {
    fetchRequests()
  }, [])

  // Handle Drag End
  const onDragEnd = async (result: any) => {
    if (!result.destination) return

    const { source, destination, draggableId } = result
    
    // If dropped in same column, do nothing
    if (source.droppableId === destination.droppableId) return

    const newStage = destination.droppableId
    
    // Optimistic Update
    const updatedRequests = requests.map(req => 
        req.id.toString() === draggableId ? { ...req, stage: newStage } : req
    )
    setRequests(updatedRequests)

    // Backend Update
    try {
        await fetch(`http://localhost:8000/api/requests/${draggableId}/move?new_stage=${newStage}`, {
            method: 'PUT'
        })
    } catch (error) {
        console.error("Failed to move request", error)
        fetchRequests() // Revert on error
    }
  }

  // Get color for priority strip
  const getPriorityColor = (priority: string) => {
      if (priority === 'high') return 'bg-red-500'
      if (priority === 'medium') return 'bg-orange-400'
      return 'bg-blue-400'
  }

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col">
       <div className="flex justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold mb-1">Maintenance Kanban</h1>
          <p className="text-gray-500 text-sm">Drag and drop requests to update their status</p>
        </div>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex-1 grid grid-cols-4 gap-6 h-full overflow-hidden">
            {Object.entries(STAGES).map(([stageKey, stageLabel]) => (
                <div key={stageKey} className="flex flex-col h-full bg-gray-50 rounded-xl border border-gray-200/60">
                    {/* Column Header */}
                    <div className="p-4 border-b border-gray-200">
                        <div className="flex justify-between items-center mb-1">
                            <h3 className="font-bold text-gray-700">{stageLabel}</h3>
                            <span className="bg-white px-2 py-0.5 rounded text-xs text-gray-500 border border-gray-100 shadow-sm">
                                {requests.filter(r => r.stage === stageKey).length}
                            </span>
                        </div>
                        {stageKey === 'scrap' && <p className="text-[10px] text-red-500">Equipment in this column will be marked as Scrapped.</p>}
                    </div>

                    {/* Droppable Area */}
                     <Droppable droppableId={stageKey}>
                        {(provided, snapshot) => (
                            <div
                                {...provided.droppableProps}
                                ref={provided.innerRef}
                                className={`flex-1 p-3 overflow-y-auto space-y-3 transition-colors ${snapshot.isDraggingOver ? 'bg-blue-50/50' : ''}`}
                            >
                                {requests
                                    .filter(req => req.stage === stageKey)
                                    .map((req, index) => (
                                        <Draggable key={req.id.toString()} draggableId={req.id.toString()} index={index}>
                                            {(provided) => (
                                                <div
                                                    ref={provided.innerRef}
                                                    {...provided.draggableProps}
                                                    {...provided.dragHandleProps}
                                                    className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition group relative overflow-hidden"
                                                >
                                                    {/* Priority/Overdue Strip */}
                                                    <div className={`absolute top-0 left-0 bottom-0 w-1 ${getPriorityColor(req.priority)}`}></div>
                                                    
                                                    <div className="pl-2">
                                                        <h4 className="font-bold text-sm text-gray-800 mb-1 leading-tight">{req.subject}</h4>
                                                        <p className="text-xs text-gray-500 mb-3 line-clamp-2">{req.description}</p>
                                                        
                                                        <div className="flex justify-between items-end">
                                                            <div className="text-[10px] text-gray-400 flex flex-col gap-1">
                                                                <span className="flex items-center gap-1"><Wrench size={10} /> {req.equipment ? req.equipment.name : 'Unknown'}</span>
                                                                <span className="flex items-center gap-1"><Clock size={10} /> {req.schedule_date}</span>
                                                            </div>

                                                            {/* Avatar */}
                                                            {req.technician_id && (
                                                                <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-[10px] font-bold border border-white shadow-sm" title={`Tech ID: ${req.technician_id}`}>
                                                                    T{req.technician_id}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </Draggable>
                                    ))}
                                {provided.placeholder}
                            </div>
                        )}
                    </Droppable>
                </div>
            ))}
        </div>
      </DragDropContext>
    </div>
  )
}