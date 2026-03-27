import React from 'react';
import { Meeting, Attendee, User, UserRole } from '../types';
import { TableProperties } from 'lucide-react';

interface MeetingScheduleTableProps {
    meetings: Meeting[];
    attendees: Attendee[];
    users: User[];
    currentUser: User;
}

const parseMeetingDate = (dateStr: string): Date | null => {
    const m1 = dateStr.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if (m1) return new Date(parseInt(m1[3]), parseInt(m1[2]) - 1, parseInt(m1[1]));
    const m2 = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (m2) return new Date(parseInt(m2[1]), parseInt(m2[2]) - 1, parseInt(m2[3]));
    return null;
};

const formatDateThai = (dateStr: string): string => {
    const d = parseMeetingDate(dateStr);
    if (!d) return dateStr;
    return d.toLocaleDateString('th-TH', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    });
};

export const MeetingScheduleTable: React.FC<MeetingScheduleTableProps> = ({
    meetings,
    attendees,
    users,
    currentUser,
}) => {
    const isAdmin = currentUser.role === UserRole.ADMIN;

    // Filter meetings based on role
    const visibleMeetings = isAdmin
        ? meetings
        : meetings.filter(m => {
              const isAttendee = attendees.some(
                  a => a.userId === currentUser.id && a.meetingId === m.id
              );
              const hasPermission = currentUser.allowedMeetingIds?.includes(m.id);
              return isAttendee || hasPermission;
          });

    // Sort by date ascending
    const sorted = [...visibleMeetings].sort(
        (a, b) =>
            (parseMeetingDate(a.date)?.getTime() || 0) -
            (parseMeetingDate(b.date)?.getTime() || 0)
    );

    const getAttendeeCount = (meetingId: string): number =>
        attendees.filter(a => a.meetingId === meetingId && a.status === 'ACCEPTED').length;

    const getAttendeeSummary = (meetingId: string): string => {
        const accepted = attendees.filter(
            a => a.meetingId === meetingId && a.status === 'ACCEPTED'
        );
        if (accepted.length === 0) return '-';
        const names = accepted.slice(0, 3).map(a => {
            if (a.userId) {
                const u = users.find(u => u.id === a.userId);
                return u ? `${u.name} ${u.surname}` : a.name;
            }
            return a.name;
        });
        const remaining = accepted.length - names.length;
        return remaining > 0 ? `${names.join(', ')} และอีก ${remaining} คน` : names.join(', ');
    };

    return (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-200 bg-orange-50 flex items-center gap-2">
                <TableProperties size={18} className="text-orange-600" />
                <h3 className="font-bold text-gray-800 text-base">ตารางการประชุม</h3>
                <span className="ml-auto text-xs px-2.5 py-1 bg-orange-100 text-orange-700 rounded-full font-semibold">
                    {sorted.length} รายการ
                </span>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                    <thead>
                        <tr className="bg-gray-50 border-b border-gray-200">
                            <th className="px-4 py-3 text-left font-semibold text-gray-600 border-r border-gray-200 whitespace-nowrap">
                                วัน-เดือน-ปี / เวลา
                            </th>
                            <th className="px-4 py-3 text-left font-semibold text-gray-600 border-r border-gray-200">
                                หัวข้อประชุม
                            </th>
                            <th className="px-4 py-3 text-center font-semibold text-gray-600 border-r border-gray-200">
                                ผู้เข้าร่วมประชุม (จำนวนคน)
                            </th>
                            <th className="px-4 py-3 text-left font-semibold text-gray-600">
                                สถานที่
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {sorted.length > 0 ? (
                            sorted.map((meeting, index) => {
                                const count = getAttendeeCount(meeting.id);
                                const summary = getAttendeeSummary(meeting.id);
                                const isCompleted = meeting.status === 'COMPLETED';
                                return (
                                    <tr
                                        key={meeting.id}
                                        className={`border-b border-gray-100 transition-colors hover:bg-orange-50/40 ${
                                            index % 2 === 1 ? 'bg-gray-50/40' : 'bg-white'
                                        }`}
                                    >
                                        {/* Date & Time */}
                                        <td className="px-4 py-3 border-r border-gray-100 whitespace-nowrap">
                                            <div className="font-medium text-gray-900">
                                                {formatDateThai(meeting.date)}
                                            </div>
                                            <div className="text-xs text-gray-500 mt-0.5">
                                                เวลา {meeting.time} น.
                                            </div>
                                            {isCompleted && (
                                                <span className="inline-block mt-1 text-[10px] px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded-full">
                                                    เสร็จสิ้น
                                                </span>
                                            )}
                                            {!isCompleted && (
                                                <span className="inline-block mt-1 text-[10px] px-1.5 py-0.5 bg-orange-100 text-orange-700 rounded-full">
                                                    กำลังดำเนินการ
                                                </span>
                                            )}
                                        </td>

                                        {/* Title */}
                                        <td className="px-4 py-3 border-r border-gray-100">
                                            <div className="font-semibold text-gray-800">
                                                {meeting.title}
                                            </div>
                                            <div className="text-xs text-gray-400 mt-0.5">
                                                ครั้งที่ {meeting.edition}
                                            </div>
                                        </td>

                                        {/* Attendee count + names */}
                                        <td className="px-4 py-3 border-r border-gray-100 text-center">
                                            <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-orange-100 text-orange-700 font-bold text-base mx-auto mb-1">
                                                {count}
                                            </div>
                                            <div className="text-xs text-gray-500 leading-tight max-w-[180px] mx-auto">
                                                {summary}
                                            </div>
                                        </td>

                                        {/* Location */}
                                        <td className="px-4 py-3">
                                            <span className="text-gray-700">{meeting.location}</span>
                                        </td>
                                    </tr>
                                );
                            })
                        ) : (
                            <tr>
                                <td
                                    colSpan={4}
                                    className="px-4 py-12 text-center text-gray-400 text-sm"
                                >
                                    ไม่มีข้อมูลตารางการประชุม
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
