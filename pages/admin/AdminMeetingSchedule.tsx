import React, { useState } from 'react';
import { useApp } from '../../src/context/AppContext';
import { TableProperties } from 'lucide-react';
import { MeetingScheduleTable } from '../../components/MeetingScheduleTable';

export const AdminMeetingSchedule: React.FC = () => {
    const { meetings, attendees, users, user } = useApp();
    const [filterStatus, setFilterStatus] = useState<'ALL' | 'UPCOMING' | 'COMPLETED'>('ALL');

    if (!user) return null;

    const filtered = filterStatus === 'ALL'
        ? meetings
        : meetings.filter(m => m.status === filterStatus);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                        <TableProperties size={24} className="text-orange-500" />
                        ตารางการประชุม
                    </h2>
                    <p className="text-gray-500 mt-1 text-sm">ตารางการประชุมทั้งหมดในระบบ</p>
                </div>
            </div>

            {/* Filter */}
            <div className="flex p-1 bg-gray-100/80 rounded-xl w-full md:w-auto inline-flex">
                {(['ALL', 'UPCOMING', 'COMPLETED'] as const).map((status) => (
                    <button
                        key={status}
                        onClick={() => setFilterStatus(status)}
                        className={`flex-1 md:flex-none px-6 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                            filterStatus === status
                                ? 'bg-white text-orange-600 shadow-sm'
                                : 'text-gray-500 hover:text-gray-700'
                        }`}
                    >
                        {status === 'ALL' ? 'ทั้งหมด' : status === 'UPCOMING' ? 'กำลังดำเนินการ' : 'เสร็จสิ้น'}
                    </button>
                ))}
            </div>

            {/* Table */}
            <MeetingScheduleTable
                meetings={filtered}
                attendees={attendees}
                users={users}
                currentUser={user}
            />
        </div>
    );
};
