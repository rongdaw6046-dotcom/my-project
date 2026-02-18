import React, { useState } from 'react';
import { useApp } from '../../src/context/AppContext';
import { Link } from 'react-router-dom';
import { Search, Calendar, MapPin, ChevronRight, Clock } from 'lucide-react';

export const UserDashboard: React.FC = () => {
  const { meetings, user } = useApp();
  const [searchTerm, setSearchTerm] = useState('');

  if (!user) return null;

  // Filter meetings user has access to
  const myMeetings = meetings.filter(m => 
    user.allowedMeetingIds.includes(m.id) &&
    (m.title.toLowerCase().includes(searchTerm.toLowerCase()) || m.edition.includes(searchTerm))
  );

  return (
    <div className="space-y-6">
       <h2 className="text-2xl font-bold text-gray-800">การประชุมของฉัน</h2>
       
       <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
            <Search size={18} />
          </div>
          <input
            type="text"
            placeholder="ค้นหาการประชุม..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-orange-500 focus:border-orange-500"
          />
       </div>

       <div className="grid grid-cols-1 gap-4">
         {myMeetings.length > 0 ? (
           myMeetings.map(meeting => (
             <Link key={meeting.id} to={`/user/meetings/${meeting.id}`} className="block bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow duration-200">
               <div className="p-6">
                 <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                           <span className={`px-2 py-0.5 rounded text-xs font-semibold ${meeting.status === 'UPCOMING' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                              {meeting.status === 'UPCOMING' ? 'กำลังจะมาถึง' : 'เสร็จสิ้น'}
                           </span>
                           <span className="text-gray-500 text-sm">ครั้งที่ {meeting.edition}</span>
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-2">{meeting.title}</h3>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-y-2 gap-x-6 text-sm text-gray-600">
                            <div className="flex items-center gap-1.5"><Calendar size={16} /> {meeting.date}</div>
                            <div className="flex items-center gap-1.5"><Clock size={16} /> {meeting.time} น.</div>
                            <div className="flex items-center gap-1.5"><MapPin size={16} /> {meeting.location}</div>
                        </div>
                    </div>
                    <div className="flex items-center justify-end text-orange-600 font-medium text-sm">
                        ดูรายละเอียด <ChevronRight size={16} className="ml-1" />
                    </div>
                 </div>
               </div>
             </Link>
           ))
         ) : (
           <div className="bg-white p-12 text-center rounded-lg border border-gray-200 text-gray-500">
              <div className="inline-block p-4 rounded-full bg-gray-50 mb-3"><Calendar size={32} className="text-gray-400"/></div>
              <p>คุณยังไม่มีรายการการประชุมที่ได้รับเชิญ</p>
           </div>
         )}
       </div>
    </div>
  );
};
