import React, { useEffect } from 'react';
import { useApp } from '../../src/context/AppContext';
import { Link } from 'react-router-dom';
import { Calendar, Clock, MapPin, CheckSquare, FileText, ChevronRight, TrendingUp, CalendarDays } from 'lucide-react';

const parseMeetingDate = (dateStr: string): Date | null => {
    const m1 = dateStr.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if (m1) return new Date(parseInt(m1[3]), parseInt(m1[2]) - 1, parseInt(m1[1]));
    const m2 = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (m2) return new Date(parseInt(m2[1]), parseInt(m2[2]) - 1, parseInt(m2[3]));
    return null;
};

const isSameDay = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

export const UserDashboardHome: React.FC = () => {
    const { meetings, user, attendees, agendas } = useApp();
    const today = new Date();

    if (!user) return null;

    const myMeetings = meetings.filter(m => {
        const isAttendee = attendees.some(a => a.userId === user.id && a.meetingId === m.id);
        const hasPermission = user.allowedMeetingIds?.includes(m.id);
        return isAttendee || hasPermission;
    });

    const todayMeetings = myMeetings.filter(m => {
        const d = parseMeetingDate(m.date);
        return d && isSameDay(d, today);
    });

    const upcomingMeetings = myMeetings
        .filter(m => m.status === 'UPCOMING')
        .sort((a, b) => (parseMeetingDate(a.date)?.getTime() || 0) - (parseMeetingDate(b.date)?.getTime() || 0));

    const completedCount = myMeetings.filter(m => m.status === 'COMPLETED').length;

    // Action items from localStorage
    const storedActions = JSON.parse(localStorage.getItem(`actions_${user.id}`) || '[]');
    const pendingActions = storedActions.filter((a: any) => a.status !== 'DONE');

    const StatCard = ({ icon: Icon, label, value, color, to }: { icon: any; label: string; value: number | string; color: string; to: string }) => (
        <Link to={to} className={`bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-all group flex items-center gap-4`}>
            <div className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center flex-shrink-0`}>
                <Icon size={22} className="text-white" />
            </div>
            <div>
                <p className="text-2xl font-bold text-gray-800">{value}</p>
                <p className="text-sm text-gray-500">{label}</p>
            </div>
            <ChevronRight size={16} className="ml-auto text-gray-300 group-hover:text-emerald-400" />
        </Link>
    );

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h2 className="text-2xl font-bold text-gray-800">สวัสดี, {user.name} 👋</h2>
                <p className="text-gray-500 text-sm mt-1">
                    {today.toLocaleDateString('th-TH', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard icon={Calendar} label="การประชุมวันนี้" value={todayMeetings.length} color="bg-emerald-500" to="/user/dashboard" />
                <StatCard icon={CalendarDays} label="กำลังจะมาถึง" value={upcomingMeetings.length} color="bg-blue-500" to="/user/calendar" />
                <StatCard icon={TrendingUp} label="ผ่านมาแล้ว" value={completedCount} color="bg-green-500" to="/user/history" />
                <StatCard icon={CheckSquare} label="งานค้างอยู่" value={pendingActions.length} color="bg-purple-500" to="/user/actions" />
            </div>

            {/* Today's meetings */}
            {todayMeetings.length > 0 && (
                <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-2xl p-6 text-white">
                    <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><Calendar size={20} /> การประชุมวันนี้</h3>
                    <div className="space-y-3">
                        {todayMeetings.map(m => (
                            <Link key={m.id} to={`/user/meetings/${m.id}`}
                                className="flex items-center justify-between bg-white/20 hover:bg-white/30 backdrop-blur rounded-xl p-4 transition-colors">
                                <div>
                                    <p className="font-semibold">{m.title}</p>
                                    <div className="flex items-center gap-3 text-sm text-emerald-100 mt-1">
                                        <span className="flex items-center gap-1"><Clock size={13} /> {m.time} น.</span>
                                        <span className="flex items-center gap-1"><MapPin size={13} /> {m.location}</span>
                                    </div>
                                </div>
                                <ChevronRight size={18} />
                            </Link>
                        ))}
                    </div>
                </div>
            )}

            {/* Upcoming meetings */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                        <h3 className="font-bold text-gray-700 flex items-center gap-2"><Calendar size={16} className="text-emerald-500" /> การประชุมที่กำลังจะมาถึง</h3>
                        <Link to="/user/dashboard" className="text-xs text-emerald-600 hover:underline">ดูทั้งหมด</Link>
                    </div>
                    <div className="divide-y divide-gray-50">
                        {upcomingMeetings.slice(0, 4).map(m => {
                            const d = parseMeetingDate(m.date);
                            return (
                                <Link key={m.id} to={`/user/meetings/${m.id}`}
                                    className="flex items-center gap-4 px-5 py-3 hover:bg-emerald-50 transition-colors group">
                                    {d && (
                                        <div className="text-center w-10 flex-shrink-0">
                                            <div className="text-xs font-semibold text-emerald-500">{d.toLocaleDateString('th-TH', { month: 'short' })}</div>
                                            <div className="text-xl font-bold text-gray-800 leading-none">{d.getDate()}</div>
                                        </div>
                                    )}
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-gray-800 truncate group-hover:text-emerald-700">{m.title}</p>
                                        <p className="text-xs text-gray-400">{m.time} น. · {m.location}</p>
                                    </div>
                                    <ChevronRight size={14} className="text-gray-300 group-hover:text-emerald-400 flex-shrink-0" />
                                </Link>
                            );
                        })}
                        {upcomingMeetings.length === 0 && (
                            <div className="px-5 py-8 text-center text-sm text-gray-400">ไม่มีการประชุมที่กำลังจะมาถึง</div>
                        )}
                    </div>
                </div>

                {/* Pending actions */}
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                        <h3 className="font-bold text-gray-700 flex items-center gap-2"><CheckSquare size={16} className="text-purple-500" /> งานที่ยังค้างอยู่</h3>
                        <Link to="/user/actions" className="text-xs text-purple-600 hover:underline">จัดการทั้งหมด</Link>
                    </div>
                    <div className="divide-y divide-gray-50">
                        {pendingActions.slice(0, 4).map((action: any) => (
                            <div key={action.id} className="px-5 py-3 flex items-start gap-3">
                                <div className={`mt-0.5 w-2.5 h-2.5 rounded-full flex-shrink-0 ${action.status === 'IN_PROGRESS' ? 'bg-yellow-400' : 'bg-gray-300'}`} />
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-800 truncate">{action.title}</p>
                                    {action.dueDate && (
                                        <p className="text-xs text-gray-400">กำหนด: {action.dueDate}</p>
                                    )}
                                </div>
                                <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold flex-shrink-0 ${action.status === 'IN_PROGRESS' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-500'}`}>
                                    {action.status === 'IN_PROGRESS' ? 'กำลังทำ' : 'รอดำเนินการ'}
                                </span>
                            </div>
                        ))}
                        {pendingActions.length === 0 && (
                            <div className="px-5 py-8 text-center text-sm text-gray-400">ไม่มีงานค้างอยู่ 🎉</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
