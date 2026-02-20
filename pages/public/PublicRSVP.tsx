import React, { useState } from 'react';
import { useApp } from '../../src/context/AppContext';
import { useParams } from 'react-router-dom';
import { Calendar, MapPin, Clock, CheckCircle, XCircle, Info, ChevronRight } from 'lucide-react';
import { AttendeeStatus } from '../../types';

export const PublicRSVP: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const { meetings, attendees, updateAttendeeStatus, fetchAttendees, isLoading } = useApp();
    const [selectedAttendeeId, setSelectedAttendeeId] = useState('');
    const [submitted, setSubmitted] = useState(false);
    const [status, setStatus] = useState<AttendeeStatus | null>(null);

    const meeting = meetings.find(m => m.id === id);

    React.useEffect(() => {
        if (id) {
            fetchAttendees(id);
        }
    }, [id]);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-orange-600 animate-pulse">กำลังโหลดข้อมูล...</div>
            </div>
        );
    }

    if (!meeting) return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
            <div className="text-center text-gray-500">
                <Info size={48} className="mx-auto mb-4 text-gray-300" />
                <p className="text-lg">ไม่พบข้อมูลการประชุม หรือลิงก์อาจหมดอายุ</p>
            </div>
        </div>
    );

    const meetingAttendees = attendees.filter(a => a.meetingId === id);

    const handleSubmit = (selectedStatus: AttendeeStatus) => {
        if (!selectedAttendeeId) return;
        updateAttendeeStatus(selectedAttendeeId, selectedStatus);
        setStatus(selectedStatus);
        setSubmitted(true);
    };

    if (submitted) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
                <div className="bg-white p-10 rounded-2xl shadow-xl max-w-md w-full text-center border border-gray-100">
                    <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full mb-6 ${status === 'ACCEPTED' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                        {status === 'ACCEPTED' ? <CheckCircle size={40} /> : <XCircle size={40} />}
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">บันทึกข้อมูลเรียบร้อยแล้ว</h2>
                    <p className="text-gray-600 mb-8">ขอบคุณสำหรับการแจ้งสถานะการเข้าร่วมของคุณ</p>

                    <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-500 text-left">
                        <p className="font-semibold text-gray-700 mb-1">{meeting.title}</p>
                        <p>{meeting.date} | {meeting.time}</p>
                    </div>
                </div>
            </div>
        );
    }

    // 4. ยืนยันการเข้าร่วมประชุม (ผ่านไลน์ Mobile Web)
    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 to-gray-100 py-12 px-4 flex items-center justify-center">
            <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200">
                {/* Header Banner */}
                <div className="bg-orange-700 px-8 py-8 relative overflow-hidden">
                    <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-white opacity-10 rounded-full blur-xl"></div>
                    <div className="absolute bottom-0 left-0 -mb-4 -ml-4 w-32 h-32 bg-yellow-400 opacity-20 rounded-full blur-xl"></div>

                    <h1 className="text-xl font-bold text-white relative z-10">แบบตอบรับการเข้าร่วมประชุม</h1>
                    <p className="text-orange-100 text-sm mt-1 relative z-10 opacity-90">ระบบจัดการการประชุมโรงพยาบาลศรีเทพ</p>
                </div>

                <div className="p-8">
                    {/* Meeting Details */}
                    <div className="mb-8">
                        <span className="inline-block px-3 py-1 rounded-full bg-orange-50 text-orange-700 text-xs font-bold mb-3 border border-orange-100">
                            ขอเชิญเข้าร่วม
                        </span>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4 leading-tight">{meeting.title}</h2>

                        <div className="space-y-3">
                            <div className="flex items-start gap-3 text-gray-600">
                                <Calendar size={20} className="text-orange-500 mt-0.5 flex-shrink-0" />
                                <div>
                                    <p className="font-medium text-gray-900">วันที่</p>
                                    <p className="text-sm">{meeting.date}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3 text-gray-600">
                                <Clock size={20} className="text-orange-500 mt-0.5 flex-shrink-0" />
                                <div>
                                    <p className="font-medium text-gray-900">เวลา</p>
                                    <p className="text-sm">{meeting.time} น.</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3 text-gray-600">
                                <MapPin size={20} className="text-orange-500 mt-0.5 flex-shrink-0" />
                                <div>
                                    <p className="font-medium text-gray-900">สถานที่</p>
                                    <p className="text-sm">{meeting.location}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="border-t border-gray-100 my-6"></div>

                    {/* Form */}
                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">ระบุชื่อของคุณ</label>
                            <div className="relative">
                                <select
                                    className="block w-full appearance-none border border-gray-300 rounded-xl shadow-sm py-3.5 px-4 pr-10 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-gray-700 bg-white"
                                    value={selectedAttendeeId}
                                    onChange={e => setSelectedAttendeeId(e.target.value)}
                                >
                                    <option value="">-- กรุณาเลือกรายชื่อ --</option>
                                    {meetingAttendees.map(a => (
                                        <option key={a.id} value={a.id}>{a.name} ({a.position})</option>
                                    ))}
                                </select>
                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
                                    <ChevronRight size={16} className="rotate-90" />
                                </div>
                            </div>
                            <p className="text-xs text-gray-400 mt-2">* หากไม่พบรายชื่อ กรุณาติดต่อผู้จัดการประชุม</p>
                        </div>

                        <div className="grid grid-cols-2 gap-4 pt-2">
                            <button
                                disabled={!selectedAttendeeId}
                                onClick={() => handleSubmit('ACCEPTED')}
                                className="flex flex-col items-center justify-center gap-2 py-4 px-4 border border-transparent rounded-xl shadow-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none transition-transform active:scale-95 disabled:opacity-50 disabled:scale-100 disabled:cursor-not-allowed"
                            >
                                <CheckCircle size={24} />
                                <span>ยินดีเข้าร่วม</span>
                            </button>
                            <button
                                disabled={!selectedAttendeeId}
                                onClick={() => handleSubmit('DECLINED')}
                                className="flex flex-col items-center justify-center gap-2 py-4 px-4 border border-gray-200 rounded-xl shadow-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none transition-transform active:scale-95 disabled:opacity-50 disabled:scale-100 disabled:cursor-not-allowed"
                            >
                                <XCircle size={24} className="text-gray-400" />
                                <span>ไม่สะดวก</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            <p className="fixed bottom-4 text-xs text-gray-400">©Meeting System</p>
        </div>
    );
};
