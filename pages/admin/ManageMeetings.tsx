import React, { useState } from 'react';
import { useApp } from '../../src/context/AppContext';
import { Link } from 'react-router-dom';
import { Search, Edit, List, Trash, FileText, Calendar, Clock, MapPin, Users, FileDown, CheckCircle } from 'lucide-react';

export const ManageMeetings: React.FC = () => {
  const { meetings, deleteMeeting } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'UPCOMING' | 'COMPLETED'>('ALL');

  const filteredMeetings = meetings.filter(m => {
    const matchesSearch = m.title.toLowerCase().includes(searchTerm.toLowerCase()) || m.edition.includes(searchTerm);
    const matchesStatus = filterStatus === 'ALL' ? true : m.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const handleDelete = (id: string) => {
    if (window.confirm('คุณต้องการลบการประชุมนี้ใช่หรือไม่? ข้อมูลวาระและผู้เข้าร่วมจะถูกลบด้วย')) {
      deleteMeeting(id);
    }
  };

  const handleReport = (type: 'doc' | 'pdf') => {
      alert(`ระบบกำลังสร้างรายงานการประชุมรูปแบบ ${type === 'doc' ? 'Word' : 'PDF'}... กรุณารอสักครู่`);
  }

  // Helper to format date for the badge
  const getDateParts = (dateString: string) => {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return { day: '-', month: '-' };
    const day = date.getDate();
    const month = date.toLocaleDateString('th-TH', { month: 'short' });
    return { day, month };
  };

  return (
    <div className="space-y-8">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">จัดการการประชุม</h2>
          <p className="text-gray-500 mt-1 text-sm">รายการการประชุมทั้งหมดในระบบ</p>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-2 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex p-1 bg-gray-100/80 rounded-xl w-full md:w-auto">
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

          <div className="relative w-full md:w-72 pr-2">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <Search size={18} />
              </div>
              <input
                type="text"
                placeholder="ค้นหาชื่อการประชุม..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-4 py-2.5 bg-transparent border-transparent focus:bg-gray-50 rounded-xl text-sm focus:ring-0 placeholder-gray-400 transition-colors"
              />
          </div>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredMeetings.length > 0 ? (
          filteredMeetings.map((meeting) => {
            const { day, month } = getDateParts(meeting.date);
            const isCompleted = meeting.status === 'COMPLETED';
            
            return (
              <div key={meeting.id} className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col overflow-hidden relative">
                {/* Status Stripe */}
                <div className={`h-1.5 w-full ${isCompleted ? 'bg-gray-300' : 'bg-orange-500'}`}></div>
                
                <div className="p-6 flex-1">
                    <div className="flex justify-between items-start gap-4 mb-4">
                         {/* Date Badge */}
                        <div className={`flex flex-col items-center justify-center w-14 h-14 rounded-xl flex-shrink-0 ${isCompleted ? 'bg-gray-100 text-gray-500' : 'bg-orange-50 text-orange-600'}`}>
                            <span className="text-xl font-bold leading-none">{day}</span>
                            <span className="text-xs font-medium uppercase">{month}</span>
                        </div>
                        
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">ครั้งที่ {meeting.edition}</span>
                                {isCompleted && <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full"><CheckCircle size={10} /> เสร็จสิ้น</span>}
                            </div>
                            <h3 className="text-lg font-bold text-gray-800 leading-tight line-clamp-2 group-hover:text-orange-600 transition-colors">
                                {meeting.title}
                            </h3>
                        </div>
                    </div>

                    <div className="space-y-2.5">
                         <div className="flex items-center gap-3 text-sm text-gray-600">
                            <div className="w-8 flex justify-center"><Clock size={16} className="text-gray-400"/></div>
                            <span>{meeting.time} น.</span>
                         </div>
                         <div className="flex items-center gap-3 text-sm text-gray-600">
                            <div className="w-8 flex justify-center"><MapPin size={16} className="text-gray-400"/></div>
                            <span className="line-clamp-1">{meeting.location}</span>
                         </div>
                         {meeting.budget && meeting.budget > 0 && (
                             <div className="flex items-center gap-3 text-sm text-gray-600">
                                <div className="w-8 flex justify-center"><span className="text-gray-400 font-serif">฿</span></div>
                                <span>{meeting.budget.toLocaleString()} บาท</span>
                             </div>
                         )}
                    </div>
                </div>

                {/* Actions Footer */}
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between gap-2">
                     <div className="flex items-center gap-1">
                         <Link to={`/admin/meetings/${meeting.id}/attendees`} className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="ผู้เข้าร่วม">
                            <Users size={18} />
                         </Link>
                         <Link to={`/admin/meetings/${meeting.id}/agenda`} className="p-2 text-gray-500 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors" title="วาระการประชุม">
                            <List size={18} />
                         </Link>
                     </div>

                     <div className="h-4 w-px bg-gray-300 mx-1"></div>

                     <div className="flex items-center gap-1">
                         <Link to={`/admin/meetings/edit/${meeting.id}`} className="p-2 text-gray-500 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors" title="แก้ไข">
                            <Edit size={18} />
                         </Link>
                         <div className="relative group/dl">
                            <button className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors" title="รายงาน">
                                <FileDown size={18} />
                            </button>
                            {/* Dropdown for report */}
                             <div className="absolute bottom-full right-0 mb-2 w-32 bg-white rounded-lg shadow-xl border border-gray-100 hidden group-hover/dl:block z-10 p-1">
                                <button onClick={() => handleReport('doc')} className="block w-full text-left px-3 py-2 text-xs hover:bg-indigo-50 hover:text-indigo-600 rounded">Word (.doc)</button>
                                <button onClick={() => handleReport('pdf')} className="block w-full text-left px-3 py-2 text-xs hover:bg-indigo-50 hover:text-indigo-600 rounded">PDF (.pdf)</button>
                            </div>
                         </div>
                         <button onClick={() => handleDelete(meeting.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="ลบ">
                            <Trash size={18} />
                         </button>
                     </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="col-span-full py-20 text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-50 rounded-full mb-4">
                  <List size={40} className="text-gray-300" />
              </div>
              <h3 className="text-lg font-medium text-gray-900">ไม่พบการประชุม</h3>
              <p className="text-gray-500 mt-1">ลองปรับเปลี่ยนคำค้นหา หรือสร้างการประชุมใหม่จากเมนูด้านซ้าย</p>
          </div>
        )}
      </div>
    </div>
  );
};