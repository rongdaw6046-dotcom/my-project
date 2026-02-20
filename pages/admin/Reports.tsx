
import React from 'react';
import { useApp } from '../../src/context/AppContext';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, Calendar, FileText, CheckCircle, Clock, XCircle, BarChart2, PieChart } from 'lucide-react';

export const Reports: React.FC = () => {
    const navigate = useNavigate();
    const { users, meetings, attendees, documents } = useApp();

    // -- Statistics Calculation --
    const totalUsers = users.length;
    const totalMeetings = meetings.length;

    // Attendee Stats
    const totalAttendees = attendees.length;
    const acceptedAttendees = attendees.filter(a => a.status === 'ACCEPTED').length;
    const pendingAttendees = attendees.filter(a => a.status === 'PENDING').length;
    const declinedAttendees = attendees.filter(a => a.status === 'DECLINED').length;

    const acceptedRate = totalAttendees ? Math.round((acceptedAttendees / totalAttendees) * 100) : 0;

    // Meeting Status
    const completedMeetings = meetings.filter(m => m.status === 'COMPLETED').length;
    const upcomingMeetings = meetings.filter(m => m.status === 'UPCOMING').length;

    // Budget
    const totalBudget = meetings.reduce((sum, m) => sum + (m.budget || 0), 0);

    return (
        <div className="pb-10">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                <div>
                    <button onClick={() => navigate('/admin/dashboard')} className="mb-2 inline-flex items-center text-gray-500 hover:text-orange-600 transition-colors">
                        <ArrowLeft size={20} className="mr-1" /> กลับหน้าหลัก
                    </button>
                    <h2 className="text-2xl font-bold text-gray-800">รายงานสรุปผลการดำเนินงาน</h2>
                    <p className="text-gray-500 text-sm">ภาพรวมข้อมูลการใช้งานระบบและการประชุม</p>
                </div>
                <button
                    onClick={() => window.print()}
                    className="flex items-center gap-2 bg-gray-800 hover:bg-gray-900 text-white px-4 py-2.5 rounded-lg shadow-sm transition-all font-medium"
                >
                    <FileText size={18} /> พิมพ์รายงาน
                </button>
            </div>

            {/* Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm font-medium text-gray-500">การประชุมทั้งหมด</p>
                            <h3 className="text-3xl font-bold text-gray-800 mt-2">{totalMeetings}</h3>
                        </div>
                        <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
                            <Calendar size={24} />
                        </div>
                    </div>
                    <div className="mt-4 flex gap-3 text-sm">
                        <span className="text-green-600 font-medium">{completedMeetings} เสร็จสิ้น</span>
                        <span className="text-orange-600 font-medium">{upcomingMeetings} รอจัด</span>
                    </div>
                </div>

                <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm font-medium text-gray-500">ผู้ใช้งานระบบ</p>
                            <h3 className="text-3xl font-bold text-gray-800 mt-2">{totalUsers}</h3>
                        </div>
                        <div className="p-3 bg-purple-50 text-purple-600 rounded-lg">
                            <Users size={24} />
                        </div>
                    </div>
                    <div className="mt-4 text-sm text-gray-500">
                        บุคลากรภายในและผู้ดูแลระบบ
                    </div>
                </div>

                <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm font-medium text-gray-500">การตอบรับเข้าร่วม</p>
                            <h3 className="text-3xl font-bold text-gray-800 mt-2">{acceptedRate}%</h3>
                        </div>
                        <div className="p-3 bg-green-50 text-green-600 rounded-lg">
                            <PieChart size={24} />
                        </div>
                    </div>
                    <div className="mt-4 text-sm text-gray-500">
                        จากผู้ได้รับเชิญทั้งหมด {totalAttendees} คน
                    </div>
                </div>

                <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm font-medium text-gray-500">งบประมาณรวม</p>
                            <h3 className="text-3xl font-bold text-gray-800 mt-2">฿{totalBudget.toLocaleString()}</h3>
                        </div>
                        <div className="p-3 bg-orange-50 text-orange-600 rounded-lg">
                            <BarChart2 size={24} />
                        </div>
                    </div>
                    <div className="mt-4 text-sm text-gray-500">
                        งบประมาณการจัดประชุมทั้งหมด
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Meetings List */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="p-5 border-b border-gray-200 bg-gray-50">
                        <h3 className="font-bold text-gray-800">รายการประชุมล่าสุด</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-white">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">หัวข้อประชุม</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">วันเวลา</th>
                                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">สถานะ</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {meetings.slice(0, 5).map(m => (
                                    <tr key={m.id}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{m.title}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{m.date} {m.time}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center text-sm">
                                            {m.status === 'COMPLETED' ? (
                                                <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">เสร็จสิ้น</span>
                                            ) : (
                                                <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">รอจัด</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Participation Stats */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="p-5 border-b border-gray-200 bg-gray-50">
                        <h3 className="font-bold text-gray-800">สถิติการตอบรับ</h3>
                    </div>
                    <div className="p-6">
                        <div className="space-y-4">
                            <div>
                                <div className="flex justify-between text-sm font-medium mb-1">
                                    <span className="flex items-center gap-2"><CheckCircle size={16} className="text-green-500" /> เข้าร่วม</span>
                                    <span>{acceptedAttendees} คน</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2.5">
                                    <div className="bg-green-500 h-2.5 rounded-full" style={{ width: `${totalAttendees ? (acceptedAttendees / totalAttendees) * 100 : 0}%` }}></div>
                                </div>
                            </div>
                            <div>
                                <div className="flex justify-between text-sm font-medium mb-1">
                                    <span className="flex items-center gap-2"><Clock size={16} className="text-orange-500" /> รอตอบรับ</span>
                                    <span>{pendingAttendees} คน</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2.5">
                                    <div className="bg-orange-500 h-2.5 rounded-full" style={{ width: `${totalAttendees ? (pendingAttendees / totalAttendees) * 100 : 0}%` }}></div>
                                </div>
                            </div>
                            <div>
                                <div className="flex justify-between text-sm font-medium mb-1">
                                    <span className="flex items-center gap-2"><XCircle size={16} className="text-red-500" /> ปฏิเสธ</span>
                                    <span>{declinedAttendees} คน</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2.5">
                                    <div className="bg-red-500 h-2.5 rounded-full" style={{ width: `${totalAttendees ? (declinedAttendees / totalAttendees) * 100 : 0}%` }}></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
