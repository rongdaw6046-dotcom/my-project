import React, { useState } from 'react';
import { useApp } from '../../src/context/AppContext';
import { Link } from 'react-router-dom';
import { Calendar, ChevronLeft, ChevronRight, Clock, MapPin } from 'lucide-react';
import { Meeting } from '../../types';

const THAI_MONTHS = [
    'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
    'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม',
];
const THAI_DAYS_SHORT = ['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส'];

const parseMeetingDate = (dateStr: string): Date | null => {
    const thaiMatch = dateStr.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if (thaiMatch)
        return new Date(parseInt(thaiMatch[3]), parseInt(thaiMatch[2]) - 1, parseInt(thaiMatch[1]));
    const isoMatch = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (isoMatch)
        return new Date(parseInt(isoMatch[1]), parseInt(isoMatch[2]) - 1, parseInt(isoMatch[3]));
    return null;
};

export const UserCalendar: React.FC = () => {
    const { meetings, user, attendees } = useApp();
    const today = new Date();
    const [viewYear, setViewYear] = useState(today.getFullYear());
    const [viewMonth, setViewMonth] = useState(today.getMonth());
    const [selectedKey, setSelectedKey] = useState<string | null>(null);

    if (!user) return null;

    // Filter meetings the user has access to
    const myMeetings = meetings.filter(m => {
        const isAttendee = attendees.some(a => a.userId === user.id && a.meetingId === m.id);
        const hasPermission = user.allowedMeetingIds?.includes(m.id);
        return isAttendee || hasPermission;
    });

    // Group by day key "YYYY-M-D"
    const meetingsByDay: Record<string, Meeting[]> = {};
    for (const m of myMeetings) {
        const d = parseMeetingDate(m.date);
        if (d) {
            const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
            if (!meetingsByDay[key]) meetingsByDay[key] = [];
            meetingsByDay[key].push(m);
        }
    }

    const firstDay = new Date(viewYear, viewMonth, 1).getDay();
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const todayKey = `${today.getFullYear()}-${today.getMonth()}-${today.getDate()}`;

    const cells: (number | null)[] = [
        ...Array(firstDay).fill(null),
        ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
    ];

    const prevMonth = () => {
        if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
        else setViewMonth(m => m - 1);
        setSelectedKey(null);
    };
    const nextMonth = () => {
        if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
        else setViewMonth(m => m + 1);
        setSelectedKey(null);
    };

    const goToday = () => {
        setViewYear(today.getFullYear());
        setViewMonth(today.getMonth());
        setSelectedKey(todayKey);
    };

    const selectedMeetings = selectedKey ? (meetingsByDay[selectedKey] || []) : [];
    const formatSelectedDate = (key: string) => {
        const [y, mo, d] = key.split('-').map(Number);
        return `${d} ${THAI_MONTHS[mo]} ${y + 543}`;
    };

    // Count upcoming meetings this month
    const upcomingThisMonth = myMeetings.filter(m => {
        const d = parseMeetingDate(m.date);
        return d && d.getFullYear() === viewYear && d.getMonth() === viewMonth && m.status === 'UPCOMING';
    }).length;

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">ปฏิทินการประชุม</h2>
                    <p className="text-sm text-gray-500 mt-0.5">การประชุมที่คุณได้ลงทะเบียนเข้าร่วม</p>
                </div>
                <div className="flex items-center gap-3">
                    {upcomingThisMonth > 0 && (
                        <span className="px-3 py-1.5 bg-orange-100 text-orange-700 text-sm font-semibold rounded-full">
                            {upcomingThisMonth} ประชุมในเดือนนี้
                        </span>
                    )}
                    <button
                        onClick={goToday}
                        className="px-4 py-2 text-sm font-medium bg-white border border-gray-300 rounded-lg text-gray-600 hover:bg-orange-50 hover:border-orange-400 hover:text-orange-600 transition-colors"
                    >
                        วันนี้
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Calendar */}
                <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                    {/* Month Nav */}
                    <div className="flex items-center justify-between px-6 py-5 bg-gradient-to-r from-orange-500 to-orange-600 text-white">
                        <button onClick={prevMonth} className="p-2 rounded-xl hover:bg-white/20 transition-colors">
                            <ChevronLeft size={20} />
                        </button>
                        <h3 className="text-xl font-bold tracking-wide">
                            {THAI_MONTHS[viewMonth]} {viewYear + 543}
                        </h3>
                        <button onClick={nextMonth} className="p-2 rounded-xl hover:bg-white/20 transition-colors">
                            <ChevronRight size={20} />
                        </button>
                    </div>

                    {/* Day Labels */}
                    <div className="grid grid-cols-7 border-b border-gray-100 bg-gray-50">
                        {THAI_DAYS_SHORT.map((d, i) => (
                            <div
                                key={d}
                                className={`text-center py-3 text-xs font-bold uppercase tracking-wider ${i === 0 ? 'text-red-500' : i === 6 ? 'text-blue-500' : 'text-gray-400'}`}
                            >
                                {d}
                            </div>
                        ))}
                    </div>

                    {/* Day Cells */}
                    <div className="grid grid-cols-7 auto-rows-fr">
                        {cells.map((day, idx) => {
                            if (!day) return <div key={`b-${idx}`} className="min-h-[72px] border-b border-r border-gray-50" />;
                            const key = `${viewYear}-${viewMonth}-${day}`;
                            const hasMeetings = !!meetingsByDay[key];
                            const isToday = key === todayKey;
                            const isSelected = key === selectedKey;
                            const count = meetingsByDay[key]?.length || 0;
                            const dayMeetings = meetingsByDay[key] || [];

                            return (
                                <button
                                    key={key}
                                    onClick={() => setSelectedKey(isSelected ? null : key)}
                                    className={`
                    min-h-[72px] p-2 border-b border-r border-gray-50 flex flex-col items-start gap-1
                    transition-all duration-150 text-left
                    ${isSelected ? 'bg-orange-50 ring-2 ring-inset ring-orange-400' : hasMeetings ? 'hover:bg-orange-50' : 'hover:bg-gray-50'}
                    ${idx % 7 === 0 ? 'text-red-500' : idx % 7 === 6 ? 'text-blue-500' : 'text-gray-700'}
                  `}
                                >
                                    <span
                                        className={`w-8 h-8 flex items-center justify-center rounded-full text-sm font-semibold
                      ${isToday ? 'bg-orange-500 text-white' : ''}`}
                                    >
                                        {day}
                                    </span>
                                    {hasMeetings && (
                                        <div className="w-full space-y-0.5">
                                            {dayMeetings.slice(0, 2).map(m => (
                                                <div
                                                    key={m.id}
                                                    className="text-[10px] leading-tight px-1.5 py-0.5 bg-orange-100 text-orange-800 rounded truncate font-medium"
                                                >
                                                    {m.title}
                                                </div>
                                            ))}
                                            {count > 2 && (
                                                <div className="text-[10px] text-orange-500 font-semibold px-1">+{count - 2} เพิ่มเติม</div>
                                            )}
                                        </div>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Right Panel */}
                <div className="space-y-4">
                    {/* Selected Day Panel */}
                    {selectedKey ? (
                        <div className="bg-white rounded-2xl border border-orange-200 shadow-sm p-5">
                            <h4 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                                <Calendar size={18} className="text-orange-500" />
                                {formatSelectedDate(selectedKey)}
                            </h4>
                            {selectedMeetings.length > 0 ? (
                                <div className="space-y-3">
                                    {selectedMeetings.map(m => (
                                        <Link
                                            key={m.id}
                                            to={`/user/meetings/${m.id}`}
                                            className="block p-4 rounded-xl bg-orange-50 hover:bg-orange-100 border border-orange-100 transition-colors"
                                        >
                                            <div className="flex items-start justify-between gap-2">
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-semibold text-gray-900 text-sm leading-tight">{m.title}</p>
                                                    <p className="text-xs text-orange-600 mt-0.5">ครั้งที่ {m.edition}</p>
                                                    <div className="mt-2 space-y-1 text-xs text-gray-500">
                                                        <div className="flex items-center gap-1.5">
                                                            <Clock size={12} className="flex-shrink-0" />
                                                            {m.time} น.
                                                        </div>
                                                        <div className="flex items-center gap-1.5">
                                                            <MapPin size={12} className="flex-shrink-0" />
                                                            <span className="truncate">{m.location}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <span className={`flex-shrink-0 mt-0.5 px-2 py-0.5 rounded text-[10px] font-bold ${m.status === 'UPCOMING' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                                                    {m.status === 'UPCOMING' ? 'กำลังจะมาถึง' : 'เสร็จสิ้น'}
                                                </span>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-gray-400 italic text-center py-6">ไม่มีการประชุมในวันนี้</p>
                            )}
                        </div>
                    ) : (
                        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 text-center text-gray-400">
                            <Calendar size={40} className="mx-auto mb-3 text-gray-200" />
                            <p className="text-sm">คลิกที่วันที่<br />เพื่อดูการประชุม</p>
                        </div>
                    )}

                    {/* Upcoming meetings list */}
                    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                        <div className="px-5 py-4 border-b border-gray-100 bg-gray-50">
                            <h4 className="font-bold text-gray-700 text-sm">การประชุมที่กำลังจะมาถึง</h4>
                        </div>
                        <div className="divide-y divide-gray-50 max-h-80 overflow-y-auto">
                            {myMeetings
                                .filter(m => m.status === 'UPCOMING')
                                .sort((a, b) => {
                                    const da = parseMeetingDate(a.date);
                                    const db = parseMeetingDate(b.date);
                                    return (da?.getTime() || 0) - (db?.getTime() || 0);
                                })
                                .map(m => (
                                    <Link
                                        key={m.id}
                                        to={`/user/meetings/${m.id}`}
                                        className="flex items-center gap-3 px-5 py-3 hover:bg-orange-50 transition-colors group"
                                    >
                                        <div className="flex-shrink-0 text-center w-10">
                                            {(() => {
                                                const d = parseMeetingDate(m.date);
                                                return d ? (
                                                    <>
                                                        <div className="text-xs text-orange-500 font-semibold">{THAI_MONTHS[d.getMonth()].substring(0, 3)}</div>
                                                        <div className="text-lg font-bold text-gray-800 leading-none">{d.getDate()}</div>
                                                    </>
                                                ) : null;
                                            })()}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-gray-800 truncate group-hover:text-orange-700">{m.title}</p>
                                            <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5"><Clock size={10} /> {m.time} น.</p>
                                        </div>
                                        <ChevronRight size={14} className="text-gray-300 group-hover:text-orange-400 flex-shrink-0" />
                                    </Link>
                                ))}
                            {myMeetings.filter(m => m.status === 'UPCOMING').length === 0 && (
                                <div className="px-5 py-6 text-center text-sm text-gray-400">ไม่มีการประชุมที่กำลังจะมาถึง</div>
                            )}
                        </div>
                    </div>

                    {/* Legend */}
                    <div className="flex flex-wrap gap-4 text-xs text-gray-500 px-1">
                        <span className="flex items-center gap-1.5">
                            <span className="w-6 h-6 rounded-full bg-orange-500 inline-flex items-center justify-center text-white text-[10px] font-bold">8</span>
                            วันนี้
                        </span>
                        <span className="flex items-center gap-1.5">
                            <span className="px-2 py-0.5 bg-orange-100 text-orange-800 rounded text-[10px] font-medium">ชื่อประชุม</span>
                            มีการประชุม
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};
