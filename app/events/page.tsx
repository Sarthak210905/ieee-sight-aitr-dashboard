'use client'

import { useState, useEffect, useCallback } from 'react'
import { Calendar, Clock, MapPin, Users, ExternalLink, Plus, Filter, ChevronLeft, ChevronRight, AlertCircle, Loader2 } from 'lucide-react'
import { useAdmin } from '@/contexts/AdminContext'

interface Event {
  _id: string
  title: string
  description: string
  date: string
  endDate?: string
  time?: string
  location: string
  type: 'workshop' | 'seminar' | 'meeting' | 'competition' | 'social' | 'other'
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled'
  registrationLink?: string
  maxParticipants?: number
  currentParticipants: number
  organizer: string
}

const EVENT_TYPES = [
  { value: 'all', label: 'All Events', color: 'bg-gray-500' },
  { value: 'workshop', label: 'Workshop', color: 'bg-blue-500' },
  { value: 'seminar', label: 'Seminar', color: 'bg-purple-500' },
  { value: 'meeting', label: 'Meeting', color: 'bg-green-500' },
  { value: 'competition', label: 'Competition', color: 'bg-orange-500' },
  { value: 'social', label: 'Social', color: 'bg-pink-500' },
  { value: 'other', label: 'Other', color: 'bg-gray-500' },
]

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]

export default function EventsPage() {
  const { isAdmin } = useAdmin()
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filterType, setFilterType] = useState('all')
  const [showAddForm, setShowAddForm] = useState(false)
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth())
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear())
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('list')

  const fetchEvents = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(`/api/events?year=${currentYear}`)
      
      if (!response.ok) {
        throw new Error(`Failed to fetch events: ${response.statusText}`)
      }
      
      const result = await response.json()
      if (result.success) {
        setEvents(result.data || [])
      } else {
        throw new Error(result.error || 'Failed to fetch events')
      }
    } catch (error) {
      console.error('Error fetching events:', error)
      setError(error instanceof Error ? error.message : 'An unexpected error occurred')
      setEvents([])
    } finally {
      setLoading(false)
    }
  }, [currentYear])

  useEffect(() => {
    fetchEvents()
  }, [fetchEvents])

  const getTypeColor = (type: string) => {
    return EVENT_TYPES.find(t => t.value === type)?.color || 'bg-gray-500'
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'upcoming': return 'bg-blue-100 text-blue-700'
      case 'ongoing': return 'bg-green-100 text-green-700'
      case 'completed': return 'bg-gray-100 text-gray-700'
      case 'cancelled': return 'bg-red-100 text-red-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const filteredEvents = events.filter(e => 
    filterType === 'all' || e.type === filterType
  )

  const upcomingEvents = filteredEvents
    .filter(e => e.status === 'upcoming' || e.status === 'ongoing')
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  const pastEvents = filteredEvents
    .filter(e => e.status === 'completed' || e.status === 'cancelled')
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  // Calendar view helpers
  const getDaysInMonth = (month: number, year: number) => {
    return new Date(year, month + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (month: number, year: number) => {
    return new Date(year, month, 1).getDay()
  }

  const getEventsForDay = (day: number) => {
    return events.filter(e => {
      const eventDate = new Date(e.date)
      return eventDate.getDate() === day && 
             eventDate.getMonth() === currentMonth && 
             eventDate.getFullYear() === currentYear
    })
  }

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11)
      setCurrentYear(currentYear - 1)
    } else {
      setCurrentMonth(currentMonth - 1)
    }
  }

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0)
      setCurrentYear(currentYear + 1)
    } else {
      setCurrentMonth(currentMonth + 1)
    }
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-md p-5 sm:p-6">
        <div className="flex flex-col gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-ieee-blue mb-2 flex items-center gap-2 sm:gap-3">
              <Calendar className="text-ieee-blue w-7 h-7 sm:w-8 sm:h-8" />
              Events Calendar
            </h1>
            <p className="text-base sm:text-lg text-gray-600">Upcoming workshops, seminars, and activities</p>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="flex border-2 border-gray-300 rounded-lg overflow-hidden flex-1 sm:flex-initial">
              <button
                onClick={() => setViewMode('list')}
                className={`flex-1 px-5 py-3 transition text-base font-medium min-h-[52px] flex items-center justify-center gap-2 ${
                  viewMode === 'list' ? 'bg-ieee-blue text-white' : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Filter size={18} />
                <span>List</span>
              </button>
              <button
                onClick={() => setViewMode('calendar')}
                className={`flex-1 px-5 py-3 transition text-base font-medium min-h-[52px] flex items-center justify-center gap-2 ${
                  viewMode === 'calendar' ? 'bg-ieee-blue text-white' : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Calendar size={18} />
                <span>Calendar</span>
              </button>
            </div>
            {isAdmin && (
              <button
                onClick={() => setShowAddForm(true)}
                className="w-full sm:w-auto bg-ieee-blue text-white px-5 py-3 rounded-lg hover:bg-ieee-light transition flex items-center justify-center gap-2 text-base font-medium min-h-[52px]"
              >
                <Plus size={20} />
                <span>Add Event</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-4 sm:p-5">
        <div className="flex items-center gap-3 overflow-x-auto scrollbar-thin pb-2">
          <Filter size={20} className="text-gray-500 flex-shrink-0" />
          {EVENT_TYPES.map(type => (
            <button
              key={type.value}
              onClick={() => setFilterType(type.value)}
              className={`px-5 py-2.5 rounded-full text-base font-medium whitespace-nowrap transition min-h-[44px] ${
                filterType === type.value
                  ? `${type.color} text-white shadow-md`
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {type.label}
            </button>
          ))}
        </div>
      </div>

      {viewMode === 'calendar' ? (
        /* Calendar View */
        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
          <div className="flex items-center justify-between mb-5 sm:mb-6">
            <button onClick={handlePrevMonth} className="p-3 hover:bg-gray-100 rounded-lg transition min-h-[44px] min-w-[44px] flex items-center justify-center">
              <ChevronLeft size={24} />
            </button>
            <h2 className="text-lg sm:text-xl font-bold text-gray-800">
              {MONTHS[currentMonth]} {currentYear}
            </h2>
            <button onClick={handleNextMonth} className="p-3 hover:bg-gray-100 rounded-lg transition min-h-[44px] min-w-[44px] flex items-center justify-center">
              <ChevronRight size={24} />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 sm:gap-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="text-center text-xs sm:text-sm font-medium text-gray-500 py-2">
                {day}
              </div>
            ))}

            {/* Empty cells for days before first day of month */}
            {Array.from({ length: getFirstDayOfMonth(currentMonth, currentYear) }).map((_, i) => (
              <div key={`empty-${i}`} className="h-20 sm:h-24 bg-gray-50 rounded"></div>
            ))}

            {/* Days of month */}
            {Array.from({ length: getDaysInMonth(currentMonth, currentYear) }).map((_, i) => {
              const day = i + 1
              const dayEvents = getEventsForDay(day)
              const isToday = new Date().getDate() === day && 
                              new Date().getMonth() === currentMonth && 
                              new Date().getFullYear() === currentYear

              return (
                <div
                  key={day}
                  className={`h-20 sm:h-24 border-2 rounded-lg p-1 overflow-hidden ${
                    isToday ? 'border-ieee-blue bg-blue-50' : 'border-gray-200'
                  }`}
                >
                  <div className={`text-xs sm:text-sm font-medium mb-1 ${isToday ? 'text-ieee-blue' : 'text-gray-700'}`}>
                    {day}
                  </div>
                  <div className="space-y-1">
                    {dayEvents.slice(0, 2).map(event => (
                      <div
                        key={event._id}
                        className={`text-[10px] sm:text-xs px-1 py-0.5 rounded truncate text-white ${getTypeColor(event.type)}`}
                        title={event.title}
                      >
                        {event.title}
                      </div>
                    ))}
                    {dayEvents.length > 2 && (
                      <div className="text-xs text-gray-500">
                        +{dayEvents.length - 2} more
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      ) : (
        /* List View */
        <div className="space-y-6">
          {/* Upcoming Events */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Clock className="text-green-500" />
              Upcoming Events
            </h2>

            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-ieee-blue mx-auto"></div>
              </div>
            ) : upcomingEvents.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No upcoming events</p>
            ) : (
              <div className="grid gap-4">
                {upcomingEvents.map(event => (
                  <div
                    key={event._id}
                    className="border-2 border-gray-200 rounded-lg p-4 sm:p-5 hover:border-ieee-blue hover:shadow-lg transition"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-4">
                      <div className={`hidden sm:block w-1 sm:w-2 h-full rounded-full ${getTypeColor(event.type)} flex-shrink-0`}></div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-3">
                          <div className="flex-1">
                            <h3 className="font-bold text-lg sm:text-xl text-gray-800 mb-2">{event.title}</h3>
                            <div className="flex flex-wrap items-center gap-2">
                              <span className={`text-xs sm:text-sm px-3 py-1 rounded-full font-medium ${getStatusBadge(event.status)}`}>
                                {event.status}
                              </span>
                              <div className={`px-3 py-1 rounded-full text-xs sm:text-sm text-white ${getTypeColor(event.type)} font-medium`}>
                                {event.type}
                              </div>
                            </div>
                          </div>
                        </div>

                        <p className="text-gray-600 mb-4 text-sm sm:text-base leading-relaxed">{event.description}</p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm sm:text-base text-gray-600">
                          <div className="flex items-center gap-2 sm:gap-3">
                            <Calendar className="text-ieee-blue flex-shrink-0" size={18} />
                            <span>{new Date(event.date).toLocaleDateString('en-US', {
                              weekday: 'short',
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })}</span>
                          </div>
                          {event.time && (
                            <div className="flex items-center gap-2 sm:gap-3">
                              <Clock className="text-ieee-blue flex-shrink-0" size={18} />
                              <span>{event.time}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-2 sm:gap-3">
                            <MapPin className="text-ieee-blue flex-shrink-0" size={18} />
                            <span className="truncate">{event.location}</span>
                          </div>
                          <div className="flex items-center gap-2 sm:gap-3">
                            <Users className="text-ieee-blue flex-shrink-0" size={18} />
                            <span className="truncate">{event.organizer}</span>
                          </div>
                        </div>

                        {event.registrationLink && (
                          <a
                            href={event.registrationLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-4 inline-flex items-center gap-2 text-ieee-blue hover:underline text-base font-medium min-h-[44px]"
                          >
                            <ExternalLink size={18} />
                            Register Now
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Past Events */}
          {pastEvents.length > 0 && (
            <div className="bg-white rounded-lg shadow-md p-5 sm:p-6">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 sm:mb-5">Past Events</h2>
              <div className="grid gap-3">
                {pastEvents.slice(0, 5).map(event => (
                  <div
                    key={event._id}
                    className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
                  >
                    <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-lg flex items-center justify-center text-white text-base sm:text-lg font-bold flex-shrink-0 ${getTypeColor(event.type)}`}>
                      {new Date(event.date).getDate()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-base sm:text-lg text-gray-800 truncate">{event.title}</h4>
                      <p className="text-sm sm:text-base text-gray-500">
                        {new Date(event.date).toLocaleDateString()} • {event.location}
                      </p>
                    </div>
                    <span className={`text-xs sm:text-sm px-2 sm:px-3 py-1 rounded-full font-medium flex-shrink-0 ${getStatusBadge(event.status)}`}>
                      {event.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Add Event Modal */}
      {showAddForm && <AddEventForm onClose={() => setShowAddForm(false)} onSuccess={fetchEvents} />}
    </div>
  )
}

function AddEventForm({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    location: '',
    type: 'workshop',
    registrationLink: '',
    maxParticipants: '',
    organizer: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          maxParticipants: formData.maxParticipants ? parseInt(formData.maxParticipants) : undefined,
        }),
      })

      const result = await response.json()

      if (result.success) {
        alert('Event created successfully!')
        onSuccess()
        onClose()
      } else {
        alert('Failed to create event: ' + result.error)
      }
    } catch (error) {
      console.error('Error creating event:', error)
      alert('Failed to create event')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="p-5 sm:p-6 border-b border-gray-200">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Add New Event</h2>
        </div>

        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-5">
          <div>
            <label className="block text-base sm:text-sm font-medium text-gray-700 mb-2">Title *</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-ieee-blue text-base"
            />
          </div>

          <div>
            <label className="block text-base sm:text-sm font-medium text-gray-700 mb-2">Description *</label>
            <textarea
              required
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-ieee-blue text-base"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-base sm:text-sm font-medium text-gray-700 mb-2">Date *</label>
              <input
                type="date"
                required
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-ieee-blue text-base"
              />
            </div>
            <div>
              <label className="block text-base sm:text-sm font-medium text-gray-700 mb-2">Time</label>
              <input
                type="time"
                value={formData.time}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-ieee-blue text-base"
              />
            </div>
          </div>

          <div>
            <label className="block text-base sm:text-sm font-medium text-gray-700 mb-2">Location *</label>
            <input
              type="text"
              required
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-ieee-blue text-base"
              placeholder="e.g., Room 101, Main Building"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-base sm:text-sm font-medium text-gray-700 mb-2">Type *</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-ieee-blue text-base"
              >
                <option value="workshop">Workshop</option>
                <option value="seminar">Seminar</option>
                <option value="meeting">Meeting</option>
                <option value="competition">Competition</option>
                <option value="social">Social</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-base sm:text-sm font-medium text-gray-700 mb-2">Max Participants</label>
              <input
                type="number"
                value={formData.maxParticipants}
                onChange={(e) => setFormData({ ...formData, maxParticipants: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-ieee-blue text-base"
              />
            </div>
          </div>

          <div>
            <label className="block text-base sm:text-sm font-medium text-gray-700 mb-2">Organizer *</label>
            <input
              type="text"
              required
              value={formData.organizer}
              onChange={(e) => setFormData({ ...formData, organizer: e.target.value })}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-ieee-blue text-base"
              placeholder="e.g., IEEE SIGHT AITR"
            />
          </div>

          <div>
            <label className="block text-base sm:text-sm font-medium text-gray-700 mb-2">Registration Link</label>
            <input
              type="url"
              value={formData.registrationLink}
              onChange={(e) => setFormData({ ...formData, registrationLink: e.target.value })}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-ieee-blue text-base"
              placeholder="https://..."
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:flex-1 py-3 border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition text-base font-medium min-h-[52px]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="w-full sm:flex-1 py-3 bg-ieee-blue text-white rounded-lg hover:bg-ieee-light transition disabled:bg-gray-400 text-base font-medium min-h-[52px]"
            >
              {loading ? 'Creating...' : 'Create Event'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
