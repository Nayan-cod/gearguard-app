'use client'
import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface CalendarProps {
  events: any[]
}

export default function Calendar({ events }: CalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [view, setView] = useState<'month' | 'week'>('month')

  // Helper to get days in month
  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  }

  // Helper to get day of week for first day (0-6)
  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay()
  }

  // Helper to get start of current week
  const getStartOfWeek = (date: Date) => {
      const d = new Date(date)
      const day = d.getDay()
      const diff = d.getDate() - day
      return new Date(d.setDate(diff))
  }

  const navigate = (direction: number) => {
    if (view === 'month') {
        setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() + direction)))
    } else {
        setCurrentDate(new Date(currentDate.setDate(currentDate.getDate() + (direction * 7))))
    }
  }

  // Generate calendar grid
  const renderCalendarDays = () => {
    const days = []
    
    if (view === 'month') {
        const daysInMonth = getDaysInMonth(currentDate)
        const firstDay = getFirstDayOfMonth(currentDate)
        const year = currentDate.getFullYear()
        
        // Empty cells for previous month
        for (let i = 0; i < firstDay; i++) {
            days.push(<div key={`empty-${i}`} className="bg-gray-50/50 min-h-[120px] border-b border-r border-gray-100"></div>)
        }

        // Days of current month
        for (let day = 1; day <= daysInMonth; day++) {
            const dateStr = `${year}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
            const isToday = new Date().toDateString() === new Date(year, currentDate.getMonth(), day).toDateString()
            const dayEvents = events.filter(e => e.schedule_date === dateStr)

            days.push(renderDayCell(day, dayEvents, isToday))
        }
    } else {
        // Week View
        const startOfWeek = getStartOfWeek(currentDate)
        for (let i = 0; i < 7; i++) {
            const d = new Date(startOfWeek)
            d.setDate(d.getDate() + i)
            const dateStr = d.toISOString().split('T')[0]
            const isToday = new Date().toDateString() === d.toDateString()
            const dayEvents = events.filter(e => e.schedule_date === dateStr)
            
            days.push(renderDayCell(d.getDate(), dayEvents, isToday, true))
        }
    }
    return days
  }

  const renderDayCell = (day: number, dayEvents: any[], isToday: boolean, isWeekView = false) => (
      <div key={day} className={`p-2 border-b border-r border-gray-100 ${isToday ? 'bg-blue-50/30' : 'bg-white'} ${isWeekView ? 'min-h-[400px]' : 'min-h-[120px]'}`}>
          <div className="flex justify-between items-start mb-2">
              <span className={`text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full ${isToday ? 'bg-blue-600 text-white' : 'text-gray-700'}`}>
                  {day}
              </span>
              {dayEvents.length > 0 && <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full font-medium">{dayEvents.length}</span>}
          </div>
          
          <div className="space-y-1.5">
              {dayEvents.map((event: any) => (
                  <div key={event.id} className={`text-[11px] px-2 py-1.5 rounded-md border shadow-sm truncate cursor-pointer hover:opacity-80 hover:shadow-md transition
                      ${getEventColor(event.request_type)}`}>
                      <div className="font-bold">{event.subject}</div>
                      <div className="text-[9px] opacity-75">{event.equipment?.name || 'Unknown'}</div>
                  </div>
              ))}
          </div>
      </div>
  )

  const headerDate = view === 'month' 
    ? `${currentDate.toLocaleString('default', { month: 'long' })} ${currentDate.getFullYear()}`
    : `Week of ${getStartOfWeek(currentDate).toLocaleDateString()}`

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Header */}
        <div className="p-4 flex flex-col md:flex-row items-center justify-between border-b border-gray-100 gap-4">
            <div className="flex items-center gap-4">
                <h2 className="text-xl font-bold text-gray-800 min-w-[200px]">{headerDate}</h2>
                <div className="flex bg-gray-100 p-1 rounded-lg">
                    <button 
                        onClick={() => setView('month')}
                        className={`px-3 py-1 text-xs font-bold rounded-md transition ${view === 'month' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        Month
                    </button>
                    <button 
                        onClick={() => setView('week')}
                        className={`px-3 py-1 text-xs font-bold rounded-md transition ${view === 'week' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        Week
                    </button>
                </div>
            </div>
            
            <div className="flex gap-2">
                <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-lg text-gray-600"><ChevronLeft size={20} /></button>
                <button onClick={() => setCurrentDate(new Date())} className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium">Today</button>
                <button onClick={() => navigate(1)} className="p-2 hover:bg-gray-100 rounded-lg text-gray-600"><ChevronRight size={20} /></button>
            </div>
        </div>

        {/* Days Header */}
        <div className="grid grid-cols-7 border-b border-gray-100 bg-gray-50">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    {day}
                </div>
            ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7">
            {renderCalendarDays()}
        </div>
    </div>
  )
}

function getEventColor(type: string) {
    if (type === 'corrective') return 'bg-orange-50 text-orange-700 border-orange-100'
    if (type === 'preventive') return 'bg-blue-50 text-blue-700 border-blue-100'
    return 'bg-gray-50 text-gray-700 border-gray-100'
}
