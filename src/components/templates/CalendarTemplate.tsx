import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon, Clock, Edit2, Trash2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { CalendarEvent } from '../../types';

const CalendarTemplate: React.FC = () => {
  const { calendarEvents, addCalendarEvent, updateCalendarEvent, deleteCalendarEvent } = useApp();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'month' | 'week'>('month');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);

  const today = new Date();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(new Date(currentYear, currentMonth + (direction === 'next' ? 1 : -1), 1));
  };

  const formatDate = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  const getEventsForDate = (date: string) => {
    return calendarEvents.filter(event => event.date === date);
  };

  const handleDateClick = (day: number) => {
    const clickedDate = new Date(currentYear, currentMonth, day);
    const dateString = formatDate(clickedDate);
    setSelectedDate(dateString);
    setShowAddModal(true);
  };

  const handleEditEvent = (event: CalendarEvent) => {
    setEditingEvent(event);
    setShowAddModal(true);
  };

  const tagColors = [
    { name: 'Meeting', color: 'bg-blue-500' },
    { name: 'Review', color: 'bg-green-500' },
    { name: 'Planning', color: 'bg-purple-500' },
    { name: 'Deadline', color: 'bg-red-500' },
    { name: 'Personal', color: 'bg-yellow-500' },
  ];

  const renderCalendarGrid = () => {
    const days = [];
    const totalCells = 42; // 6 weeks × 7 days

    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(
        <div key={`empty-${i}`} className="h-24 p-1 border border-gray-200 bg-gray-50"></div>
      );
    }

    // Days of the current month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentYear, currentMonth, day);
      const dateString = formatDate(date);
      const events = getEventsForDate(dateString);
      const isToday = date.toDateString() === today.toDateString();

      days.push(
        <div
          key={day}
          className={`h-24 p-1 border border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors ${
            isToday ? 'bg-blue-50 border-blue-300' : 'bg-white'
          }`}
          onClick={() => handleDateClick(day)}
        >
          <div className={`text-sm font-medium mb-1 ${isToday ? 'text-blue-600' : 'text-gray-900'}`}>
            {day}
          </div>
          <div className="space-y-1">
            {events.slice(0, 2).map((event) => (
              <div
                key={event.id}
                className={`text-xs p-1 rounded text-white truncate ${event.color}`}
                onClick={(e) => {
                  e.stopPropagation();
                  handleEditEvent(event);
                }}
              >
                {event.title}
              </div>
            ))}
            {events.length > 2 && (
              <div className="text-xs text-gray-500">
                +{events.length - 2} more
              </div>
            )}
          </div>
        </div>
      );
    }

    // Fill remaining cells
    const remainingCells = totalCells - firstDayOfMonth - daysInMonth;
    for (let i = 0; i < remainingCells; i++) {
      days.push(
        <div key={`empty-end-${i}`} className="h-24 p-1 border border-gray-200 bg-gray-50"></div>
      );
    }

    return days;
  };

  return (
    <div className="flex-1 bg-white">
      {/* Header */}
      <div className="border-b border-gray-200 px-8 py-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Calendar</h1>
            <p className="text-gray-600">Organize events and deadlines</p>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setViewMode('month')}
              className={`px-4 py-2 rounded-md transition-colors ${
                viewMode === 'month' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'
              }`}
            >
              Month
            </button>
            <button
              onClick={() => setViewMode('week')}
              className={`px-4 py-2 rounded-md transition-colors ${
                viewMode === 'week' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'
              }`}
            >
              Week
            </button>
          </div>
        </div>
      </div>

      {/* Calendar Controls */}
      <div className="px-8 py-4 border-b border-gray-200 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigateMonth('prev')}
            className="p-2 rounded-md hover:bg-gray-100 transition-colors"
          >
            <ChevronLeft size={20} />
          </button>
          <h2 className="text-xl font-semibold text-gray-900">
            {monthNames[currentMonth]} {currentYear}
          </h2>
          <button
            onClick={() => navigateMonth('next')}
            className="p-2 rounded-md hover:bg-gray-100 transition-colors"
          >
            <ChevronRight size={20} />
          </button>
        </div>
        <button
          onClick={() => {
            setSelectedDate(formatDate(new Date()));
            setShowAddModal(true);
          }}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={16} className="mr-2" />
          Add Event
        </button>
      </div>

      {/* Calendar Grid */}
      <div className="px-8 py-6">
        {viewMode === 'month' && (
          <div className="grid grid-cols-7 gap-px bg-gray-200 rounded-lg overflow-hidden">
            {/* Day headers */}
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <div key={day} className="bg-gray-100 p-3 text-center text-sm font-medium text-gray-600">
                {day}
              </div>
            ))}
            {/* Calendar cells */}
            {renderCalendarGrid()}
          </div>
        )}

        {viewMode === 'week' && (
          <div className="text-center text-gray-500 py-12">
            <CalendarIcon size={48} className="mx-auto mb-4 text-gray-300" />
            <p className="text-lg">Week view coming soon!</p>
            <p className="text-sm">For now, enjoy the month view with full functionality.</p>
          </div>
        )}
      </div>

      {/* Add/Edit Event Modal */}
      {showAddModal && (
        <EventModal
          event={editingEvent}
          selectedDate={selectedDate}
          tagColors={tagColors}
          onClose={() => {
            setShowAddModal(false);
            setEditingEvent(null);
            setSelectedDate('');
          }}
        />
      )}
    </div>
  );
};

const EventModal: React.FC<{
  event: CalendarEvent | null;
  selectedDate: string;
  tagColors: { name: string; color: string }[];
  onClose: () => void;
}> = ({ event, selectedDate, tagColors, onClose }) => {
  const { addCalendarEvent, updateCalendarEvent, deleteCalendarEvent } = useApp();
  const [formData, setFormData] = useState({
    title: event?.title || '',
    date: event?.date || selectedDate,
    time: event?.time || '09:00',
    tag: event?.tag || 'Meeting',
    color: event?.color || 'bg-blue-500'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.title.trim()) {
      if (event) {
        updateCalendarEvent(event.id, formData);
      } else {
        addCalendarEvent(formData);
      }
      onClose();
    }
  };

  const handleDelete = () => {
    if (event) {
      deleteCalendarEvent(event.id);
      onClose();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === 'tag') {
      const selectedTag = tagColors.find(t => t.name === value);
      setFormData(prev => ({ 
        ...prev, 
        [name]: value,
        color: selectedTag?.color || 'bg-blue-500'
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <h2 className="text-lg font-semibold mb-4">
          {event ? 'Edit Event' : 'Add New Event'}
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Event Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date
              </label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Time
              </label>
              <input
                type="time"
                name="time"
                value={formData.time}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tag
            </label>
            <select
              name="tag"
              value={formData.tag}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {tagColors.map(tag => (
                <option key={tag.name} value={tag.name}>{tag.name}</option>
              ))}
            </select>
          </div>

          <div className="flex justify-between items-center pt-4">
            {event && (
              <button
                type="button"
                onClick={handleDelete}
                className="flex items-center px-4 py-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
              >
                <Trash2 size={16} className="mr-2" />
                Delete
              </button>
            )}
            <div className="flex space-x-3 ml-auto">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                {event ? 'Update' : 'Add'} Event
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CalendarTemplate;
