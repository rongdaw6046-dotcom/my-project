import React, { useState } from 'react';
import { useApp } from '../../src/context/AppContext';
import { Link } from 'react-router-dom';
import { History, Search, Calendar, Clock, MapPin, ChevronRight, FileText } from 'lucide-react';

export const MeetingHistory: React.FC = () => {
    const { meetings, user, attendees, agendas } = useApp();
    const [searchTerm, setSearchTerm] = useState('');
    const [expandedId, setExpandedId] = useState<string | null>(null);

    if (!user) return null;

    const myMeetings = meetings.filter(m => {
        const isAttendee = attendees.some(a => a.userId === user.id && a.meetingId === m.id);
        const hasPermission = user.allowedMeetingIds?.includes(m.id);
        return (isAttendee || hasPermission) && m.status === 'COMPLETED';
    });

    const filtered = myMeetings.filter(m =>
        m.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.edition.includes(searchTerm) ||
        m.location.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Sort by date descending (latest completed first)
    const sorted = [...filtered].sort((a, b) => {
        const parse = (s: string) => {
            const m1 = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
            if (m1) return new Date(parseInt(m1[3]), parseInt(m1[2]) - 1, parseInt(m1[1])).getTime();
            return new Date(s).getTime();
        };
        return parse(b.date) - parse(a.date);
    });

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                    <History size={24} className="text-orange-500" /> ประวัติการประชุม
                </h2>
                <p className="text-sm text-gray-500 mt-1">การประชุมที่เสร็จสิ้นแล้วที่คุณมีส่วนร่วม</p>
            </div>

            {/* Search */}
            <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <Search size={18} />
                </div>
                <input
                    type="text"
                    placeholder="ค้นหาประวัติการประชุม..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl shadow-sm focus:ring-orange-500 focus:border-orange-500"
                />
            </div>

            {/* Count */}
            <div className="flex items-center gap-2">
                <span className="px-3 py-1 bg-gray-100 text-gray-600 text-sm font-medium rounded-full">
                    {sorted.length} รายการ
                </span>
            </div>

            {/* Meeting list */}
            <div className="space-y-3">
                {sorted.length > 0 ? sorted.map(meeting => {
                    const meetingAgendas = agendas.filter(a => a.meetingId === meeting.id).sort((a, b) => a.order - b.order);
                    const isExpanded = expandedId === meeting.id;

                    return (
                        <div key={meeting.id} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                            <div
                                className="p-5 cursor-pointer hover:bg-gray-50 transition-colors"
                                onClick={() => setExpandedId(isExpanded ? null : meeting.id)}
                            >
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1.5">
                                            <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs font-semibold rounded">เสร็จสิ้น</span>
                                            <span className="text-gray-400 text-xs">ครั้งที่ {meeting.edition}</span>
                                        </div>
                                        <h3 className="font-bold text-gray-900">{meeting.title}</h3>
                                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-500 mt-2">
                                            <span className="flex items-center gap-1"><Calendar size={13} /> {meeting.date}</span>
                                            <span className="flex items-center gap-1"><Clock size={13} /> {meeting.time} น.</span>
                                            <span className="flex items-center gap-1"><MapPin size={13} /> {meeting.location}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Link
                                            to={`/user/meetings/${meeting.id}`}
                                            onClick={e => e.stopPropagation()}
                                            className="flex items-center gap-1 px-3 py-1.5 bg-orange-50 text-orange-600 text-xs font-medium rounded-lg hover:bg-orange-100 transition-colors"
                                        >
                                            ดูรายละเอียด <ChevronRight size={13} />
                                        </Link>
                                        <button className={`text-gray-400 transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`}>
                                            <ChevronRight size={18} />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Expanded: Agenda list */}
                            {isExpanded && (
                                <div className="border-t border-gray-100 bg-gray-50 px-5 py-4">
                                    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                                        <FileText size={13} /> วาระการประชุม ({meetingAgendas.length})
                                    </h4>
                                    {meetingAgendas.length > 0 ? (
                                        <div className="space-y-2">
                                            {meetingAgendas.map(agenda => (
                                                <div key={agenda.id} className="flex items-start gap-3 p-3 bg-white rounded-xl border border-gray-100">
                                                    <span className="w-6 h-6 rounded-full bg-orange-100 text-orange-700 text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                                                        {agenda.order}
                                                    </span>
                                                    <div>
                                                        <p className="text-sm font-semibold text-gray-800">{agenda.title}</p>
                                                        {agenda.description && (
                                                            <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{agenda.description}</p>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-sm text-gray-400 italic">ไม่มีข้อมูลวาระการประชุม</p>
                                    )}

                                    {/* Minutes summary */}
                                    {meeting.minutesSummary && (
                                        <div className="mt-4 p-3 bg-blue-50 rounded-xl border border-blue-100">
                                            <p className="text-xs font-bold text-blue-700 mb-1">สรุปรายงานการประชุม</p>
                                            <p className="text-sm text-blue-800 whitespace-pre-line">{meeting.minutesSummary}</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    );
                }) : (
                    <div className="bg-white p-12 text-center rounded-2xl border border-gray-200 text-gray-500">
                        <div className="inline-block p-4 rounded-full bg-gray-50 mb-3">
                            <History size={32} className="text-gray-300" />
                        </div>
                        <p className="font-medium">ยังไม่มีประวัติการประชุม</p>
                        <p className="text-sm text-gray-400 mt-1">การประชุมที่เสร็จสิ้นแล้วจะแสดงที่นี่</p>
                    </div>
                )}
            </div>
        </div>
    );
};
