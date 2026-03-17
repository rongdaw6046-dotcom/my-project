import React, { useState, useEffect } from 'react';
import { useApp } from '../../src/context/AppContext';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Search, CheckCircle, XCircle, Clock, Trash, UserPlus, Share2, Users, Printer } from 'lucide-react';
import { AdminMeetingTabs } from '../../components/AdminMeetingTabs';
import { MeetingReport } from '../../components/MeetingReport';

export const ManageAttendees: React.FC = () => {
    // ... (rest of the component)
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    // เรียกใช้ fetchAttendees เพิ่มเติมจาก Context
    const { meetings, attendees, users, addAttendee, removeAttendee, fetchAttendees } = useApp();

    const [searchTerm, setSearchTerm] = useState('');



    // Invite Form State
    const [inviteType, setInviteType] = useState<'INTERNAL' | 'EXTERNAL'>('INTERNAL');
    const [selectedUserId, setSelectedUserId] = useState('');
    const [externalName, setExternalName] = useState('');
    const [externalPosition, setExternalPosition] = useState('');

    // 1. โหลดข้อมูลผู้เข้าร่วมทันทีเมื่อเข้าหน้า หรือเมื่อ ID เปลี่ยน และ Auto-refresh ทุก 5 วินาที
    useEffect(() => {
        if (id) {
            fetchAttendees(id);
            const interval = setInterval(() => fetchAttendees(id), 5000);
            return () => clearInterval(interval);
        }
    }, [id]); // เอา fetchAttendees ออกจาก deps เพื่อป้องกัน loop ถ้า function เปลี่ยน

    const meeting = meetings.find(m => m.id === id);
    // กรองเฉพาะคนของ Meeting นี้
    const meetingAttendees = attendees.filter(a => a.meetingId === id);

    if (!meeting) return <div>Meeting not found</div>;

    const stats = {
        accepted: meetingAttendees.filter(a => a.status === 'ACCEPTED').length,
        declined: meetingAttendees.filter(a => a.status === 'DECLINED').length,
        pending: meetingAttendees.filter(a => a.status === 'PENDING').length,
        total: meetingAttendees.length
    };

    const handleAddAttendee = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            if (inviteType === 'INTERNAL') {
                // 1. เช็คว่าเลือกคนหรือยัง
                if (!selectedUserId) {
                    alert('กรุณาเลือกรายชื่อบุคลากรที่ต้องการเชิญ');
                    return;
                }

                const u = users.find(user => user.id === selectedUserId);
                if (u) {
                    // เช็คซ้ำว่ามีในลิสต์หรือยัง
                    if (meetingAttendees.some(a => a.userId === u.id)) {
                        alert('ผู้ใช้นี้ถูกเชิญแล้ว');
                        return;
                    }

                    // ส่งข้อมูลไปบันทึก
                    await addAttendee({
                        meetingId: meeting.id,
                        userId: u.id,
                        name: `${u.name} ${u.surname}`,
                        position: u.position || 'Staff',
                        status: 'PENDING'
                    });
                    alert('เพิ่มผู้เข้าร่วมเรียบร้อยแล้ว');
                }
            } else if (inviteType === 'EXTERNAL') {
                // 2. เช็คว่ากรอกชื่อหรือยัง
                if (!externalName) {
                    alert('กรุณาระบุชื่อผู้เข้าร่วมประชุม');
                    return;
                }

                await addAttendee({
                    meetingId: meeting.id,
                    name: externalName,
                    position: externalPosition || 'บุคคลภายนอก',
                    status: 'PENDING'
                    // หมายเหตุ: กรณีนี้จะไม่มี userId ส่งไป ต้องตรวจสอบว่าตารางใน DB อนุญาตให้ user_id เป็น NULL ได้
                });

                setExternalName('');
                setExternalPosition('');
                alert('เพิ่มรายชื่อบุคคลภายนอกเรียบร้อยแล้ว');
            }

            // เคลียร์ค่าหลังจากบันทึกสำเร็จเท่านั้น
            setSelectedUserId('');

        } catch (error: any) {
            // 3. แสดง Error ที่แท้จริงออกมา
            console.error("Error adding attendee:", error);
            alert(`เกิดข้อผิดพลาด: ${error.message || 'ไม่สามารถบันทึกข้อมูลได้ กรุณาลองใหม่อีกครั้ง'}`);
        }
    };

    const handleRemove = async (attendeeId: string) => {
        if (window.confirm('ยืนยันการลบรายชื่อนี้?')) {
            await removeAttendee(attendeeId);
        }
    };

    const rsvpLink = `${window.location.origin}/#/rsvp/${meeting.id}`;
    const copyLink = () => {
        navigator.clipboard.writeText(rsvpLink);
        alert('คัดลอกลิงก์สำหรับส่งไฟล์แล้ว: ' + rsvpLink);
    };

    const sendBotInvite = async (attendee: any, userWithLine: any) => {
        if (!userWithLine.lineUserId) return alert('ผู้ใช้ท่านนี้ยังไม่ได้เชื่อมต่อ LINE');

        try {
            const res = await fetch('/api/line/send-invite', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    lineUserId: userWithLine.lineUserId,
                    meeting: {
                        title: meeting.title,
                        date: meeting.date,
                        time: meeting.time,
                        location: meeting.location
                    },
                    rsvpLink
                })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to send');
            alert('ส่งบัตรเชิญผ่าน LINE Bot สำเร็จ!');
        } catch (err: any) {
            alert('ส่งไม่สำเร็จ: ' + err.message + '\n(ตรวจสอบ Channel Access Token ใน Server)');
        }
    };

    return (
        <div className="pb-10">
            <div className="flex flex-col lg:flex-row gap-8">
                {/* Sidebar */}
                <div className="w-full lg:w-64 flex-shrink-0">
                    <div className="sticky top-6 space-y-6">
                        <div className="flex flex-col gap-4">
                            <button onClick={() => navigate('/admin/dashboard')} className="inline-flex items-center text-gray-500 hover:text-orange-600 transition-colors w-fit">
                                <ArrowLeft size={20} className="mr-1" /> กลับหน้าหลัก
                            </button>
                            <div>
                                <h2 className="text-xl font-bold text-gray-800">จัดการการประชุม</h2>
                                <p className="text-xs text-gray-500 mt-1 line-clamp-2">{meeting.title}</p>
                            </div>
                        </div>
                        <AdminMeetingTabs meetingId={id!} />
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 w-full min-w-0">

                    {/* Stats Cards */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex flex-col justify-between h-24">
                            <div className="flex items-center gap-2 text-gray-500 text-sm font-medium">
                                <UserPlus size={16} /> ทั้งหมด
                            </div>
                            <div className="text-2xl font-bold text-gray-800">{stats.total} <span className="text-sm font-normal text-gray-400">คน</span></div>
                        </div>
                        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex flex-col justify-between h-24 relative overflow-hidden">
                            <div className="absolute right-0 top-0 p-8 bg-green-50 rounded-full -mr-4 -mt-4"></div>
                            <div className="flex items-center gap-2 text-green-700 text-sm font-medium relative z-10">
                                <CheckCircle size={16} /> ตอบรับ
                            </div>
                            <div className="text-2xl font-bold text-green-700 relative z-10">{stats.accepted} <span className="text-sm font-normal text-green-500">คน</span></div>
                        </div>
                        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex flex-col justify-between h-24 relative overflow-hidden">
                            <div className="absolute right-0 top-0 p-8 bg-orange-50 rounded-full -mr-4 -mt-4"></div>
                            <div className="flex items-center gap-2 text-orange-600 text-sm font-medium relative z-10">
                                <Clock size={16} /> รอตอบรับ
                            </div>
                            <div className="text-2xl font-bold text-orange-600 relative z-10">{stats.pending} <span className="text-sm font-normal text-orange-400">คน</span></div>
                        </div>
                        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex flex-col justify-between h-24">
                            <div className="flex items-center gap-2 text-red-600 text-sm font-medium">
                                <XCircle size={16} /> ปฏิเสธ
                            </div>
                            <div className="text-2xl font-bold text-red-600">{stats.declined} <span className="text-sm font-normal text-red-400">คน</span></div>
                        </div>
                    </div>

                    <div className="flex flex-col xl:flex-row gap-6">
                        {/* List Section */}
                        <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden min-h-[500px] flex flex-col">
                            <div className="p-5 border-b border-gray-200 flex flex-wrap justify-between items-center gap-4 bg-gray-50/50">
                                <h3 className="font-bold text-gray-800 text-lg flex items-center gap-2 min-w-fit">
                                    <Users size={20} className="text-orange-600 flex-shrink-0" /> <span className="truncate">รายชื่อผู้เข้าร่วม</span>
                                </h3>
                                <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 w-full sm:w-auto">
                                    <button
                                        onClick={() => window.print()}
                                        className="whitespace-nowrap flex items-center gap-2 bg-gray-600 hover:bg-gray-700 text-white px-3 py-2 rounded-lg shadow-sm transition-all text-sm font-medium"
                                    >
                                        <Printer size={16} /> <span className="hidden md:inline">พิมพ์รายงาน</span>
                                    </button>
                                    <button
                                        onClick={() => {
                                            const rsvpLink = `${window.location.origin}/#/rsvp/${meeting.id}`;
                                            const message = `📌 [เชิญเข้าร่วมประชุม]\n━━━━━━━━━━━━━━\n📝 หัวข้อ: ${meeting.title}\n📅 วันที่: ${meeting.date}\n⏰ เวลา: ${meeting.time}\n📍 สถานที่: ${meeting.location}\n━━━━━━━━━━━━━━\n\n✅ กรุณาตอบรับได้ที่:\n${rsvpLink}\n\n[ระบบจัดการการประชุมโรงพยาบาลศรีเทพ]`;
                                            window.open(`https://line.me/R/msg/text/?${encodeURIComponent(message)}`, '_blank');
                                        }}
                                        className="whitespace-nowrap flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg shadow-sm transition-all text-sm font-medium"
                                    >
                                        <Share2 size={16} /> <span className="hidden md:inline">แชร์ลิงก์</span>
                                    </button>
                                    <div className="relative flex-1 min-w-[150px] sm:w-48 lg:w-64">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                            <Search size={16} />
                                        </div>
                                        <input
                                            type="text"
                                            placeholder="ค้นหาชื่อ..."
                                            className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-orange-500 focus:border-orange-500"
                                            value={searchTerm}
                                            onChange={e => setSearchTerm(e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="overflow-x-auto flex-1">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50 text-gray-500">
                                        <tr>
                                            <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider w-1/3 min-w-[180px]">ชื่อ - นามสกุล</th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider w-1/4">ตำแหน่ง</th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider w-1/4">สถานะ</th>
                                            <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider w-20">จัดการ</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {meetingAttendees
                                            .filter(a => a.name.toLowerCase().includes(searchTerm.toLowerCase()))
                                            .map(a => (
                                                <tr key={a.id} className="hover:bg-gray-50 transition-colors">
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                        <div className="flex items-center gap-2">
                                                            {(() => {
                                                                if (a.userId) {
                                                                    const u = users.find(user => user.id === a.userId);
                                                                    return u ? `${u.name} ${u.surname}` : a.name;
                                                                }
                                                                return a.name;
                                                            })()}
                                                            {/* Check if this attendee is an internal user with LINE ID */}
                                                            {a.userId && users.find(u => u.id === a.userId)?.lineUserId && (
                                                                <Share2 size={14} className="text-green-500 fill-green-100" title="เชื่อมต่อ LINE แล้ว" />
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{a.position}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                        {a.status === 'ACCEPTED' && <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200"><CheckCircle size={12} /> เข้าร่วม</span>}
                                                        {a.status === 'DECLINED' && <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-200"><XCircle size={12} /> ไม่เข้าร่วม</span>}
                                                        {a.status === 'PENDING' && <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800 border border-orange-200"><Clock size={12} /> รอตอบรับ</span>}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                                                        <div className="flex justify-end gap-2">
                                                            {(() => {
                                                                const u = a.userId ? users.find(user => user.id === a.userId) : null;
                                                                if (u?.lineUserId) {
                                                                    return (
                                                                        <button
                                                                            onClick={() => sendBotInvite(a, u)}
                                                                            className="text-green-600 hover:bg-green-50 p-2 rounded-lg transition-colors"
                                                                            title="ส่งบัตรเชิญผ่าน LINE Bot"
                                                                        >
                                                                            <Share2 size={16} />
                                                                        </button>
                                                                    );
                                                                }
                                                                return null;
                                                            })()}
                                                            <button onClick={() => handleRemove(a.id)} className="text-gray-400 hover:text-red-600 hover:bg-red-50 p-2 rounded-lg transition-colors" title="ลบรายชื่อ"><Trash size={16} /></button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        {meetingAttendees.length === 0 && (
                                            <tr>
                                                <td colSpan={4} className="text-center py-12 text-gray-400 bg-gray-50">
                                                    <div className="flex flex-col items-center">
                                                        <UserPlus size={32} className="mb-2 opacity-50" />
                                                        <p>ยังไม่มีผู้เข้าร่วม</p>
                                                        <p className="text-xs mt-1">เชิญผู้เข้าร่วมจากเมนูด้านขวา</p>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Invite Form Panel */}
                        <div className="w-full xl:w-80 flex-shrink-0 space-y-6">
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden sticky top-6">
                                <div className="bg-gray-900 px-5 py-4 text-white">
                                    <h3 className="font-bold flex items-center gap-2"><UserPlus size={18} /> เชิญผู้เข้าร่วม</h3>
                                </div>

                                <div className="p-5">
                                    <div className="flex rounded-lg bg-gray-100 p-1 mb-5">
                                        <button
                                            type="button"
                                            onClick={() => setInviteType('INTERNAL')}
                                            className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all ${inviteType === 'INTERNAL' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                                        >
                                            บุคลากรภายใน
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setInviteType('EXTERNAL')}
                                            className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all ${inviteType === 'EXTERNAL' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                                        >
                                            บุคคลภายนอก
                                        </button>
                                    </div>

                                    <form onSubmit={handleAddAttendee} className="space-y-4">
                                        {inviteType === 'INTERNAL' ? (
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1.5">ค้นหาชื่อบุคลากร</label>
                                                <select
                                                    className="block w-full border border-gray-300 rounded-lg shadow-sm py-2.5 px-3 focus:ring-orange-500 focus:border-orange-500 sm:text-sm bg-white"
                                                    value={selectedUserId}
                                                    onChange={e => setSelectedUserId(e.target.value)}
                                                >
                                                    <option value="">-- เลือกจากรายชื่อ --</option>
                                                    {users.filter(u => !meetingAttendees.some(a => a.userId === u.id)).map(u => (
                                                        <option key={u.id} value={u.id}>{u.name} ({u.position})</option>
                                                    ))}
                                                </select>
                                                <p className="text-xs text-gray-400 mt-2">เลือกรายชื่อที่มีอยู่ในฐานข้อมูลระบบ</p>
                                            </div>
                                        ) : (
                                            <>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">ชื่อ - นามสกุล</label>
                                                    <input
                                                        type="text"
                                                        required
                                                        value={externalName}
                                                        onChange={e => setExternalName(e.target.value)}
                                                        className="block w-full border border-gray-300 rounded-lg shadow-sm py-2 px-3 focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                                                        placeholder="ระบุชื่อผู้เข้าประชุม"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">ตำแหน่ง</label>
                                                    <input
                                                        type="text"
                                                        value={externalPosition}
                                                        onChange={e => setExternalPosition(e.target.value)}
                                                        className="block w-full border border-gray-300 rounded-lg shadow-sm py-2 px-3 focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                                                        placeholder="ระบุตำแหน่ง"
                                                    />
                                                </div>
                                            </>
                                        )}
                                        <button type="submit" className="w-full flex justify-center items-center gap-2 py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 focus:outline-none transition-colors mt-4">
                                            <Plus size={16} /> เพิ่มลงในรายชื่อ
                                        </button>
                                    </form>
                                </div>
                            </div>


                        </div>
                    </div>
                </div>
            </div>

            <MeetingReport meeting={meeting} attendees={meetingAttendees} users={users} />
        </div>
    );
};