import React, { useState } from 'react';
import { useApp } from '../../src/context/AppContext';
import { Link } from 'react-router-dom';
import { Search, Calendar, MapPin, ChevronRight, Clock, List, ChevronLeft } from 'lucide-react';
import { Meeting } from '../../types';

// ---- Mini Calendar Component ----
const THAI_MONTHS = [
  'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
  'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม',
];
const THAI_DAYS_SHORT = ['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส'];

interface CalendarViewProps {
  meetings: Meeting[];
}

const CalendarView: React.FC<CalendarViewProps> = ({ meetings }) => {
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth()); // 0-indexed
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  // Parse meeting dates (format: DD/MM/YYYY or YYYY-MM-DD)
  const parseMeetingDate = (dateStr: string): Date | null => {
    // Try DD/MM/YYYY
    const thaiMatch = dateStr.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if (thaiMatch) {
      return new Date(parseInt(thaiMatch[3]), parseInt(thaiMatch[2]) - 1, parseInt(thaiMatch[1]));
    }
    // Try YYYY-MM-DD
    const isoMatch = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (isoMatch) {
      return new Date(parseInt(isoMatch[1]), parseInt(isoMatch[2]) - 1, parseInt(isoMatch[3]));
    }
    return null;
  };

  // Build a map of "YYYY-M-D" -> meetings[]
  const meetingsByDay: Record<string, Meeting[]> = {};
  for (const m of meetings) {
    const d = parseMeetingDate(m.date);
    if (d) {
      const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
      if (!meetingsByDay[key]) meetingsByDay[key] = [];
      meetingsByDay[key].push(m);
    }
  }

  const firstDay = new Date(viewYear, viewMonth, 1).getDay(); // 0=Sun
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  };

  const selectedKey = selectedDate;
  const selectedMeetings = selectedKey ? (meetingsByDay[selectedKey] || []) : [];

  // Format selected date display
  const formatSelectedDate = (key: string) => {
    const [y, mo, d] = key.split('-').map(Number);
    return `${d} ${THAI_MONTHS[mo]} ${y + 543}`;
  };

  const todayKey = `${today.getFullYear()}-${today.getMonth()}-${today.getDate()}`;

  // Cells: blank cells before the 1st, then days
  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  return (
    <div className="space-y-4">
      {/* Calendar Header */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white">
          <button onClick={prevMonth} className="p-1.5 rounded-lg hover:bg-white/20 transition-colors">
            <ChevronLeft size={20} />
          </button>
          <h3 className="text-lg font-bold tracking-wide">
            {THAI_MONTHS[viewMonth]} {viewYear + 543}
          </h3>
          <button onClick={nextMonth} className="p-1.5 rounded-lg hover:bg-white/20 transition-colors">
            <ChevronRight size={20} />
          </button>
        </div>

        {/* Day headers */}
        <div className="grid grid-cols-7 border-b border-gray-100">
          {THAI_DAYS_SHORT.map((d, i) => (
            <div
              key={d}
              className={`text-center py-2 text-xs font-semibold ${i === 0 ? 'text-red-500' : i === 6 ? 'text-blue-500' : 'text-gray-500'}`}
            >
              {d}
            </div>
          ))}
        </div>

        {/* Day cells */}
        <div className="grid grid-cols-7">
          {cells.map((day, idx) => {
            if (!day) return <div key={`blank-${idx}`} className="p-1" />;

            const key = `${viewYear}-${viewMonth}-${day}`;
            const hasMeetings = !!meetingsByDay[key];
            const isToday = key === todayKey;
            const isSelected = key === selectedDate;
            const meetingCount = meetingsByDay[key]?.length || 0;

            return (
              <button
                key={key}
                onClick={() => setSelectedDate(isSelected ? null : key)}
                className={`
                  relative flex flex-col items-center justify-start p-1.5 min-h-[52px] text-sm
                  border-t border-gray-50 transition-all duration-150
                  ${isSelected ? 'bg-orange-50 ring-2 ring-inset ring-orange-400' : 'hover:bg-gray-50'}
                  ${idx % 7 === 0 ? 'text-red-500' : idx % 7 === 6 ? 'text-blue-500' : 'text-gray-700'}
                `}
              >
                <span
                  className={`
                    w-7 h-7 flex items-center justify-center rounded-full font-medium text-sm
                    ${isToday ? 'bg-orange-500 text-white font-bold' : ''}
                  `}
                >
                  {day}
                </span>
                {hasMeetings && (
                  <span className="mt-0.5 px-1.5 py-0.5 bg-orange-100 text-orange-700 text-[10px] font-semibold rounded-full leading-none">
                    {meetingCount} ประชุม
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Day Detail */}
      {selectedDate && (
        <div className="bg-white rounded-xl border border-orange-200 shadow-sm p-5">
          <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <Calendar size={16} className="text-orange-500" />
            การประชุมวันที่ {formatSelectedDate(selectedDate)}
          </h4>
          {selectedMeetings.length > 0 ? (
            <div className="space-y-2">
              {selectedMeetings.map(m => (
                <Link
                  key={m.id}
                  to={`/user/meetings/${m.id}`}
                  className="flex items-center justify-between p-3 rounded-lg bg-orange-50 hover:bg-orange-100 transition-colors border border-orange-100"
                >
                  <div>
                    <p className="font-medium text-gray-900 text-sm">{m.title}</p>
                    <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                      <span className="flex items-center gap-1"><Clock size={12} /> {m.time} น.</span>
                      <span className="flex items-center gap-1"><MapPin size={12} /> {m.location}</span>
                    </div>
                  </div>
                  <ChevronRight size={16} className="text-orange-400 flex-shrink-0" />
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400 italic">ไม่มีการประชุมในวันนี้</p>
          )}
        </div>
      )}

      {/* Legend */}
      <div className="flex items-center gap-4 text-xs text-gray-500 px-1">
        <span className="flex items-center gap-1.5">
          <span className="w-5 h-5 rounded-full bg-orange-500 inline-block"></span> วันนี้
        </span>
        <span className="flex items-center gap-1.5">
          <span className="px-1.5 py-0.5 bg-orange-100 text-orange-700 font-semibold rounded-full">N ประชุม</span> มีการประชุม
        </span>
      </div>
    </div>
  );
};

// ---- Main UserDashboard ----
export const UserDashboard: React.FC = () => {
  const { meetings, user, attendees } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'list' | 'calendar'>('list');

  if (!user) return null;

  // Filter meetings user has access to
  const myMeetings = meetings.filter(m => {
    const isAttendee = attendees.some(a => a.userId === user.id && a.meetingId === m.id);
    const hasPermission = user.allowedMeetingIds?.includes(m.id);
    return isAttendee || hasPermission;
  });

  const filteredMeetings = myMeetings.filter(m =>
    m.title.toLowerCase().includes(searchTerm.toLowerCase()) || m.edition.includes(searchTerm)
  );

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">การประชุมของฉัน</h2>

      {/* Tab Toggle */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setActiveTab('list')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${activeTab === 'list'
              ? 'bg-orange-500 text-white shadow-sm'
              : 'bg-white border border-gray-200 text-gray-600 hover:bg-orange-50 hover:text-orange-600'
            }`}
        >
          <List size={16} /> รายการ
        </button>
        <button
          onClick={() => setActiveTab('calendar')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${activeTab === 'calendar'
              ? 'bg-orange-500 text-white shadow-sm'
              : 'bg-white border border-gray-200 text-gray-600 hover:bg-orange-50 hover:text-orange-600'
            }`}
        >
          <Calendar size={16} /> ปฏิทิน
        </button>
      </div>

      {/* Search bar - only for list view */}
      {activeTab === 'list' && (
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
            <Search size={18} />
          </div>
          <input
            type="text"
            placeholder="ค้นหาการประชุม..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-orange-500 focus:border-orange-500"
          />
        </div>
      )}

      {/* Content */}
      {activeTab === 'list' ? (
        <div className="grid grid-cols-1 gap-4">
          {filteredMeetings.length > 0 ? (
            filteredMeetings.map(meeting => (
              <Link key={meeting.id} to={`/user/meetings/${meeting.id}`} className="block bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow duration-200">
                <div className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`px-2 py-0.5 rounded text-xs font-semibold ${meeting.status === 'UPCOMING' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                          {meeting.status === 'UPCOMING' ? 'กำลังจะมาถึง' : 'เสร็จสิ้น'}
                        </span>
                        <span className="text-gray-500 text-sm">ครั้งที่ {meeting.edition}</span>
                      </div>
                      <h3 className="text-lg font-bold text-gray-900 mb-2">{meeting.title}</h3>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-y-2 gap-x-6 text-sm text-gray-600">
                        <div className="flex items-center gap-1.5"><Calendar size={16} /> {meeting.date}</div>
                        <div className="flex items-center gap-1.5"><Clock size={16} /> {meeting.time} น.</div>
                        <div className="flex items-center gap-1.5"><MapPin size={16} /> {meeting.location}</div>
                      </div>
                    </div>
                    <div className="flex items-center justify-end text-orange-600 font-medium text-sm">
                      ดูรายละเอียด <ChevronRight size={16} className="ml-1" />
                    </div>
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <div className="bg-white p-12 text-center rounded-lg border border-gray-200 text-gray-500">
              <div className="inline-block p-4 rounded-full bg-gray-50 mb-3"><Calendar size={32} className="text-gray-400" /></div>
              <p>คุณยังไม่มีรายการการประชุมที่ได้รับเชิญ</p>
            </div>
          )}
        </div>
      ) : (
        <CalendarView meetings={myMeetings} />
      )}
    </div>
  );
};
