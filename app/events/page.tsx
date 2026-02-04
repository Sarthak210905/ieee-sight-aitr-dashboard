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
      <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
        <div className="flex flex-col gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-ieee-blue mb-2 flex items-center gap-2">
              <Calendar className="text-ieee-blue w-6 h-6 sm:w-8 sm:h-8" />
              Events Calendar
            </h1>
            <p className="text-sm sm:text-base text-gray-600">Upcoming workshops, seminars, and activities</p>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="flex bg-gray-100 rounded-lg p-1 flex-1 sm:flex-initial">
              <button
                onClick={() => setViewMode('list')}
                className={`flex-1 sm:flex-initial px-3 sm:px-4 py-2 rounded-md transition text-sm sm:text-base ${viewMode === 'list' ? 'bg-white shadow text-ieee-blue' : 'text-gray-600'}`}
              >
                List
              </button>
              <button
                onClick={() => setViewMode('calendar')}
                className={`flex-1 sm:flex-initial px-3 sm:px-4 py-2 rounded-md transition text-sm sm:text-base ${viewMode === 'calendar' ? 'bg-white shadow text-ieee-blue' : 'text-gray-600'}`}
              >
                Calendar
              </button>
            </div>
            {isAdmin && (
              <button
                onClick={() => setShowAddForm(true)}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-ieee-blue text-white rounded-lg hover:bg-ieee-light transition text-sm sm:text-base"
              >
                <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="hidden sm:inline">Add Event</span>
                <span className="sm:hidden">Add</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          <Filter size={18} className="text-gray-500 flex-shrink-0" />
          {EVENT_TYPES.map(type => (
            <button
              key={type.value}
              onClick={() => setFilterType(type.value)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition ${
                filterType === type.value
                  ? `${type.color} text-white`
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {type.label}
            </button>
          ))}
        </div>
      </div>

      {viewMode === 'calendar' ? (
        /* Calendar View */
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-6">
            <button onClick={handlePrevMonth} className="p-2 hover:bg-gray-100 rounded-lg">
              <ChevronLeft size={24} />
            </button>
            <h2 className="text-xl font-bold text-gray-800">
              {MONTHS[currentMonth]} {currentYear}
            </h2>
            <button onClick={handleNextMonth} className="p-2 hover:bg-gray-100 rounded-lg">
              <ChevronRight size={24} />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
                {day}
              </div>
            ))}

            {/* Empty cells for days before first day of month */}
            {Array.from({ length: getFirstDayOfMonth(currentMonth, currentYear) }).map((_, i) => (
              <div key={`empty-${i}`} className="h-24 bg-gray-50 rounded"></div>
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
                  className={`h-24 border rounded-lg p-1 overflow-hidden ${
                    isToday ? 'border-ieee-blue bg-blue-50' : 'border-gray-200'
                  }`}
                >
                  <div className={`text-sm font-medium mb-1 ${isToday ? 'text-ieee-blue' : 'text-gray-700'}`}>
                    {day}
                  </div>
                  <div className="space-y-1">
                    {dayEvents.slice(0, 2).map(event => (
                      <div
                        key={event._id}
                        className={`text-xs px-1 py-0.5 rounded truncate text-white ${getTypeColor(event.type)}`}
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
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition"
                  >
                    <div className="flex items-start gap-4">
                      <div className={`w-2 h-full rounded-full ${getTypeColor(event.type)}`}></div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="font-bold text-lg text-gray-800">{event.title}</h3>
                            <span className={`text-xs px-2 py-1 rounded-full ${getStatusBadge(event.status)}`}>
                              {event.status}
                            </span>
                          </div>
                          <div className={`px-3 py-1 rounded-full text-xs text-white ${getTypeColor(event.type)}`}>
                            {event.type}
                          </div>
                        </div>
                        <p className="text-gray-600 mb-3">{event.description}</p>
                        <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <Calendar size={14} />
                            {new Date(event.date).toLocaleDateString('en-US', {
                              weekday: 'short',
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </span>
                          {event.time && (
                            <span className="flex items-center gap-1">
                              <Clock size={14} />
                              {event.time}
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <MapPin size={14} />
                            {event.location}
                          </span>
                          <span className="flex items-center gap-1">
                            <Users size={14} />
                            {event.organizer}
                          </span>
                        </div>
                        {event.registrationLink && (
                          <a
                            href={event.registrationLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 mt-3 text-ieee-blue hover:underline"
                          >
                            <ExternalLink size={14} />
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
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Past Events</h2>
              <div className="grid gap-3">
                {pastEvents.slice(0, 5).map(event => (
                  <div
                    key={event._id}
                    className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg"
                  >
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-white text-xs ${getTypeColor(event.type)}`}>
                      {new Date(event.date).getDate()}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-800">{event.title}</h4>
                      <p className="text-sm text-gray-500">
                        {new Date(event.date).toLocaleDateString()} • {event.location}
                      </p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${getStatusBadge(event.status)}`}>
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
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800">Add New Event</h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-ieee-blue"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
            <textarea
              required
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-ieee-blue"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
              <input
                type="date"
                required
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-ieee-blue"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
              <input
                type="time"
                value={formData.time}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-ieee-blue"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Location *</label>
            <input
              type="text"
              required
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-ieee-blue"
              placeholder="e.g., Room 101, Main Building"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type *</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-ieee-blue"
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Max Participants</label>
              <input
                type="number"
                value={formData.maxParticipants}
                onChange={(e) => setFormData({ ...formData, maxParticipants: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-ieee-blue"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Organizer *</label>
            <input
              type="text"
              required
              value={formData.organizer}
              onChange={(e) => setFormData({ ...formData, organizer: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-ieee-blue"
              placeholder="e.g., IEEE SIGHT AITR"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Registration Link</label>
            <input
              type="url"
              value={formData.registrationLink}
              onChange={(e) => setFormData({ ...formData, registrationLink: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-ieee-blue"
              placeholder="https://..."
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2 bg-ieee-blue text-white rounded-lg hover:bg-ieee-light transition disabled:bg-gray-400"
            >
              {loading ? 'Creating...' : 'Create Event'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
