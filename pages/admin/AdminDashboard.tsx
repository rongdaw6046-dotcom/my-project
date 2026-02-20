import React from 'react';
import { useApp } from '../../src/context/AppContext';
import { List, Users, DollarSign, CheckCircle, Calendar, Clock, ArrowRight, PieChart, TrendingUp, UserPlus, AlertCircle, Bell, BarChart2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const StatCard: React.FC<{ title: string; value: string; subtitle?: string; icon: React.ReactNode; colorClass: string; bgClass: string }> = ({ title, value, subtitle, icon, colorClass, bgClass }) => (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between h-full transition-all hover:shadow-md">
        <div className="flex justify-between items-start mb-4">
            <div className={`p-3 rounded-xl ${bgClass} ${colorClass}`}>
                {icon}
            </div>
            {subtitle && <span className={`text-xs font-medium px-2 py-1 rounded-full ${bgClass} ${colorClass}`}>{subtitle}</span>}
        </div>
        <div>
            <h3 className="text-3xl font-bold text-gray-800 mb-1">{value}</h3>
            <p className="text-sm font-medium text-gray-500">{title}</p>
        </div>
    </div>
);

export const AdminDashboard: React.FC = () => {
    const { meetings, attendees, users } = useApp();
    const navigate = useNavigate();

    // 1. Meeting Stats
    const totalMeetings = meetings.length;
    const upcomingMeetings = meetings
        .filter(m => m.status === 'UPCOMING')
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    const nextMeeting = upcomingMeetings[0];
    const completedMeetingsCount = meetings.filter(m => m.status === 'COMPLETED').length;

    // 2. Budget Stats
    const totalBudget = meetings.reduce((sum, m) => sum + (m.budget || 0), 0);
    const avgBudget = totalMeetings > 0 ? totalBudget / totalMeetings : 0;
    const topBudgetMeetings = [...meetings]
        .sort((a, b) => (b.budget || 0) - (a.budget || 0))
        .slice(0, 3);

    // 3. Attendee Stats
    const totalInvited = attendees.length;
    const acceptedCount = attendees.filter(a => a.status === 'ACCEPTED').length;
    const declinedCount = attendees.filter(a => a.status === 'DECLINED').length;
    const pendingCount = attendees.filter(a => a.status === 'PENDING').length;

    const participationRate = totalInvited > 0 ? Math.round((acceptedCount / totalInvited) * 100) : 0;

    return (
        <div className="space-y-8 pb-10">
            {/* Header */}
            <div className="flex justify-between items-end border-b border-gray-200 pb-6">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 tracking-tight">ภาพรวมระบบ (Dashboard)</h2>
                    <p className="text-gray-500 mt-1 text-sm">สถิติและข้อมูลสรุปการจัดการการประชุมประจำเดือน</p>
                </div>
                <div className="hidden sm:block text-sm text-right text-gray-500">
                    <p>ข้อมูล ณ วันที่</p>
                    <p className="font-medium text-gray-800">{new Date().toLocaleDateString('th-TH', { dateStyle: 'long' })}</p>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="การประชุมทั้งหมด"
                    value={totalMeetings.toString()}
                    subtitle={`${upcomingMeetings.length} รอฝ่านเนินการ`}
                    icon={<List size={24} />}
                    colorClass="text-blue-600"
                    bgClass="bg-blue-50"
                />
                <StatCard
                    title="อัตราการตอบรับ"
                    value={`${participationRate}%`}
                    subtitle={`จาก ${totalInvited} คน`}
                    icon={<Users size={24} />}
                    colorClass="text-purple-600"
                    bgClass="bg-purple-50"
                />
                <StatCard
                    title="งบประมาณรวม"
                    value={`${(totalBudget / 1000).toFixed(1)}k`}
                    subtitle={`เฉลี่ย ${Math.round(avgBudget).toLocaleString()}/ครั้ง`}
                    icon={<DollarSign size={24} />}
                    colorClass="text-green-600"
                    bgClass="bg-green-50"
                />
                <StatCard
                    title="สถานะปัจจุบัน"
                    value={pendingCount.toString()}
                    subtitle="คน รอตอบรับ"
                    icon={<AlertCircle size={24} />}
                    colorClass="text-orange-600"
                    bgClass="bg-orange-50"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Upcoming Meetings (2/3 width) */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center">
                            <h3 className="font-bold text-gray-800 flex items-center gap-2">
                                <Calendar className="text-orange-600" size={20} /> การประชุมเร็วๆ นี้
                            </h3>
                            <Link to="/admin/meetings" className="text-sm text-orange-600 hover:text-orange-700 font-medium flex items-center">
                                ดูทั้งหมด <ArrowRight size={16} className="ml-1" />
                            </Link>
                        </div>
                        <div className="divide-y divide-gray-100">
                            {upcomingMeetings.length > 0 ? (
                                upcomingMeetings.slice(0, 5).map(meeting => (
                                    <div key={meeting.id} className="p-5 hover:bg-gray-50 transition-colors flex flex-col sm:flex-row gap-4 sm:items-center">
                                        <div className="flex-shrink-0 w-16 h-16 bg-orange-50 rounded-xl flex flex-col items-center justify-center text-orange-700 border border-orange-100">
                                            <span className="text-xl font-bold leading-none">{new Date(meeting.date).getDate()}</span>
                                            <span className="text-xs font-medium uppercase">{new Date(meeting.date).toLocaleDateString('th-TH', { month: 'short' })}</span>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-700 uppercase tracking-wide">ครั้งที่ {meeting.edition}</span>
                                                <div className="flex items-center text-xs text-gray-500 gap-1">
                                                    <Clock size={12} /> {meeting.time} น.
                                                </div>
                                            </div>
                                            <h4 className="text-base font-bold text-gray-900 truncate">{meeting.title}</h4>
                                            <p className="text-sm text-gray-500 truncate mt-0.5">{meeting.location}</p>
                                        </div>
                                        <div className="flex-shrink-0">
                                            <Link
                                                to={`/admin/meetings/${meeting.id}/attendees`}
                                                className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50"
                                            >
                                                จัดการ
                                            </Link>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="p-12 text-center text-gray-500">
                                    <Calendar size={48} className="mx-auto mb-3 text-gray-300" />
                                    <p>ไม่มีการประชุมที่กำลังจะมาถึง</p>
                                    <Link to="/admin/meetings/new" className="text-orange-600 font-medium mt-2 inline-block">สร้างการประชุมใหม่</Link>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Link to="/admin/meetings/new" className="flex items-center p-4 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl text-white shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5">
                            <div className="p-3 bg-white/20 rounded-lg mr-4">
                                <List size={24} />
                            </div>
                            <div>
                                <h4 className="font-bold">สร้างการประชุมใหม่</h4>
                                <p className="text-orange-100 text-sm">เพิ่มวาระและกำหนดการ</p>
                            </div>
                        </Link>
                        <div onClick={() => navigate('/admin/users')} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-pointer group">
                            <div className="flex items-center justify-between mb-4">
                                <div className="p-3 bg-blue-50 text-blue-600 rounded-lg group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                    <Users size={24} />
                                </div>
                                <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">{users.length}</span>
                            </div>
                            <h3 className="text-lg font-bold text-gray-800 mb-1">จัดการผู้ใช้งาน</h3>
                            <p className="text-sm text-gray-500">เพิ่ม ลบ แก้ไข ข้อมูลบุคลากร</p>
                        </div>

                        <div onClick={() => navigate('/admin/notifications')} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-pointer group">
                            <div className="flex items-center justify-between mb-4">
                                <div className="p-3 bg-purple-50 text-purple-600 rounded-lg group-hover:bg-purple-600 group-hover:text-white transition-colors">
                                    <Bell size={24} />
                                </div>
                            </div>
                            <h3 className="text-lg font-bold text-gray-800 mb-1">แจ้งเตือน</h3>
                            <p className="text-sm text-gray-500">ส่งประกาศแจ้งเตือนถึงผู้ใช้งาน</p>
                        </div>

                        <div onClick={() => navigate('/admin/reports')} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-pointer group">
                            <div className="flex items-center justify-between mb-4">
                                <div className="p-3 bg-green-50 text-green-600 rounded-lg group-hover:bg-green-600 group-hover:text-white transition-colors">
                                    <BarChart2 size={24} />
                                </div>
                            </div>
                            <h3 className="text-lg font-bold text-gray-800 mb-1">รายงาน</h3>
                            <p className="text-sm text-gray-500">ดูสรุปผล สถิติ และรายงานต่างๆ</p>
                        </div>
                    </div>
                </div>

                {/* Right Column: Analysis (1/3 width) */}
                <div className="space-y-6">

                    {/* Attendance Chart */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                        <h3 className="font-bold text-gray-800 mb-6 flex items-center gap-2">
                            <PieChart className="text-purple-600" size={20} /> สรุปการตอบรับ
                        </h3>

                        <div className="space-y-4">
                            <div>
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="text-gray-600 flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-green-500"></span> ยืนยันเข้าร่วม</span>
                                    <span className="font-bold text-gray-900">{acceptedCount} คน</span>
                                </div>
                                <div className="w-full bg-gray-100 rounded-full h-2.5">
                                    <div className="bg-green-500 h-2.5 rounded-full" style={{ width: `${totalInvited ? (acceptedCount / totalInvited) * 100 : 0}%` }}></div>
                                </div>
                            </div>

                            <div>
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="text-gray-600 flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-orange-400"></span> รอตอบรับ</span>
                                    <span className="font-bold text-gray-900">{pendingCount} คน</span>
                                </div>
                                <div className="w-full bg-gray-100 rounded-full h-2.5">
                                    <div className="bg-orange-400 h-2.5 rounded-full" style={{ width: `${totalInvited ? (pendingCount / totalInvited) * 100 : 0}%` }}></div>
                                </div>
                            </div>

                            <div>
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="text-gray-600 flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-red-500"></span> ปฏิเสธ</span>
                                    <span className="font-bold text-gray-900">{declinedCount} คน</span>
                                </div>
                                <div className="w-full bg-gray-100 rounded-full h-2.5">
                                    <div className="bg-red-500 h-2.5 rounded-full" style={{ width: `${totalInvited ? (declinedCount / totalInvited) * 100 : 0}%` }}></div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 pt-6 border-t border-gray-100 text-center">
                            <p className="text-gray-400 text-xs">คำนวณจากผู้เข้าร่วมทั้งหมด {totalInvited} รายการ</p>
                        </div>
                    </div>

                    {/* Budget Top List */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                        <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <TrendingUp className="text-green-600" size={20} /> ใช้งบประมาณสูงสุด
                        </h3>
                        <div className="space-y-4">
                            {topBudgetMeetings.map((m, index) => (
                                <div key={m.id} className="flex items-center justify-between pb-3 border-b border-gray-50 last:border-0 last:pb-0">
                                    <div className="flex items-center gap-3 overflow-hidden">
                                        <span className="flex-shrink-0 w-6 h-6 rounded bg-gray-100 text-gray-600 text-xs font-bold flex items-center justify-center">{index + 1}</span>
                                        <div className="min-w-0">
                                            <p className="text-sm font-medium text-gray-900 truncate">{m.title}</p>
                                            <p className="text-xs text-gray-400">ครั้งที่ {m.edition}</p>
                                        </div>
                                    </div>
                                    <span className="font-bold text-gray-800 text-sm whitespace-nowrap">{(m.budget || 0).toLocaleString()} ฿</span>
                                </div>
                            ))}
                            {topBudgetMeetings.length === 0 && <p className="text-gray-400 text-sm text-center py-4">ไม่มีข้อมูลบประมาณ</p>}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};