import React from 'react';
import { Meeting, Attendee, User } from '../types';
import { MapPin, Calendar, Clock } from 'lucide-react';

interface MeetingReportProps {
    meeting: Meeting;
    attendees: Attendee[];
    users: User[]; // To map userId to details if needed
}

export const MeetingReport: React.FC<MeetingReportProps> = ({ meeting, attendees, users }) => {
    // Group by Position or just list? Usually just a list.
    // Filter only Accepted? Or all? Usually only Accepted for "Participant List".
    const acceptedAttendees = attendees.filter(a => a.status === 'ACCEPTED');

    return (
        <div className="hidden print:block absolute inset-0 bg-white z-[9999] p-8 text-black">
            <div className="text-center mb-8">
                <h1 className="text-2xl font-bold mb-2">รายงานการประชุม</h1>
                <h2 className="text-xl font-medium">{meeting.title}</h2>
            </div>

            <div className="flex justify-between mb-6 border-b pb-4 border-gray-300">
                <div className="flex items-center gap-2">
                    <Calendar size={18} /> <span>{meeting.date}</span>
                </div>
                <div className="flex items-center gap-2">
                    <Clock size={18} /> <span>{meeting.time}</span>
                </div>
                <div className="flex items-center gap-2">
                    <MapPin size={18} /> <span>{meeting.location}</span>
                </div>
            </div>

            <h3 className="text-lg font-bold mb-4">รายชื่อผู้เข้าร่วมประชุม ({acceptedAttendees.length} ท่าน)</h3>

            <table className="w-full border-collapse border border-gray-300 text-sm">
                <thead>
                    <tr className="bg-gray-100">
                        <th className="border border-gray-300 px-4 py-2 w-16 text-center">ลำดับ</th>
                        <th className="border border-gray-300 px-4 py-2 text-left">ชื่อ - นามสกุล</th>
                        <th className="border border-gray-300 px-4 py-2 text-left">ตำแหน่ง / หน่วยงาน</th>
                        <th className="border border-gray-300 px-4 py-2 w-40 text-center">เซ็นชื่อ</th>
                        <th className="border border-gray-300 px-4 py-2 w-32 text-center">หมายเหตุ</th>
                    </tr>
                </thead>
                <tbody>
                    {acceptedAttendees.map((attendee, index) => (
                        <tr key={attendee.id}>
                            <td className="border border-gray-300 px-4 py-3 text-center">{index + 1}</td>
                            <td className="border border-gray-300 px-4 py-3">
                                {(() => {
                                    if (attendee.userId) {
                                        const u = users.find(user => user.id === attendee.userId);
                                        return u ? `${u.name} ${u.surname}` : attendee.name;
                                    }
                                    return attendee.name;
                                })()}
                            </td>
                            <td className="border border-gray-300 px-4 py-3">{attendee.position}</td>
                            <td className="border border-gray-300 px-4 py-3"></td>
                            <td className="border border-gray-300 px-4 py-3"></td>
                        </tr>
                    ))}
                    {acceptedAttendees.length === 0 && (
                        <tr>
                            <td colSpan={5} className="border border-gray-300 px-4 py-8 text-center text-gray-500">
                                ยังไม่มีผู้ตอบรับเข้าร่วม
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>

            <div className="mt-12 flex justify-end">
                <div className="text-center w-64">
                    <div className="border-b border-black mb-2 h-8"></div>
                    <p>ผู้จดบันทึกการประชุม</p>
                </div>
            </div>

            <div className="print-footer fixed bottom-4 w-full text-center text-xs text-gray-400">
                จากระบบบริหารจัดการการประชุมโรงพยาบาลศรีเทพ เมื่อ {new Date().toLocaleDateString('th-TH')}
            </div>
        </div>
    );
};
