
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Info, Users, List, FileText, CheckSquare, ChevronRight, BarChart2, Bell } from 'lucide-react';

interface AdminMeetingTabsProps {
  meetingId: string;
}

export const AdminMeetingTabs: React.FC<AdminMeetingTabsProps> = ({ meetingId }) => {
  const location = useLocation();

  const tabs = [
    { path: `/admin/meetings/edit/${meetingId}`, label: 'ข้อมูลทั่วไป', icon: Info },
    { path: `/admin/meetings/${meetingId}/agenda`, label: 'วาระการประชุม', icon: List },
    { path: `/admin/meetings/${meetingId}/attendees`, label: 'ผู้เข้าร่วม', icon: Users },
    { path: `/admin/meetings/${meetingId}/documents`, label: 'เอกสาร', icon: FileText },
    { path: `/admin/meetings/${meetingId}/minutes`, label: 'สรุปการประชุม', icon: CheckSquare },
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
      <div className="p-4 bg-gray-50 border-b border-gray-100">
        <h3 className="font-semibold text-gray-700 text-sm uppercase tracking-wider">เมนูจัดการ</h3>
      </div>
      <nav className="flex flex-col p-2 space-y-1">
        {tabs.map((tab) => {
          const isActive = location.pathname === tab.path;
          const Icon = tab.icon;
          return (
            <Link
              key={tab.path}
              to={tab.path}
              className={`flex items-center justify-between px-4 py-3 text-sm font-medium rounded-lg transition-all
                  ${isActive
                  ? 'bg-orange-50 text-orange-700'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
            >
              <div className="flex items-center gap-3">
                <Icon size={18} className={isActive ? 'text-orange-600' : 'text-gray-400'} />
                <span>{tab.label}</span>
              </div>
              {isActive && <ChevronRight size={16} className="text-orange-400" />}
            </Link>
          );
        })}
      </nav>
    </div>
  );
};
