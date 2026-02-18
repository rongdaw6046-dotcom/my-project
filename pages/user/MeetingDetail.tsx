import React, { useState } from 'react';
import { useApp } from '../../src/context/AppContext';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, FileText, Download, Calendar, MapPin, Clock, Info } from 'lucide-react';
import { AgendaItem } from '../../types';

export const MeetingDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { meetings, agendas } = useApp();
  const [activeAgendaId, setActiveAgendaId] = useState<string | null>(null);

  const meeting = meetings.find(m => m.id === id);
  const meetingAgendas = agendas.filter(a => a.meetingId === id).sort((a, b) => a.order - b.order);

  if (!meeting) return <div>ไม่พบการประชุม</div>;

  // Set first agenda active by default if none selected
  React.useEffect(() => {
    if (meetingAgendas.length > 0 && !activeAgendaId) {
        setActiveAgendaId(meetingAgendas[0].id);
    }
  }, [meetingAgendas, activeAgendaId]);

  const activeAgenda = meetingAgendas.find(a => a.id === activeAgendaId);

  return (
    <div className="space-y-6 h-[calc(100vh-140px)] flex flex-col">
       {/* Header Section */}
       <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 flex-shrink-0">
          <Link to="/user/dashboard" className="inline-flex items-center text-sm text-gray-500 hover:text-orange-600 mb-3">
             <ArrowLeft size={16} className="mr-1"/> กลับสู่หน้ารวม
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{meeting.title}</h1>
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-gray-600">
              <span className="bg-orange-50 text-orange-800 px-2 py-0.5 rounded border border-orange-100 font-medium">ครั้งที่ {meeting.edition}</span>
              <span className="flex items-center gap-1"><Calendar size={16} /> {meeting.date}</span>
              <span className="flex items-center gap-1"><Clock size={16} /> {meeting.time} น.</span>
              <span className="flex items-center gap-1"><MapPin size={16} /> {meeting.location}</span>
          </div>
       </div>

       {/* Main Split View */}
       <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0">
          {/* Sidebar: Agenda List */}
          <div className="w-full lg:w-1/3 bg-white rounded-lg shadow-sm border border-gray-200 flex flex-col overflow-hidden">
             <div className="p-4 bg-gray-50 border-b border-gray-200 font-semibold text-gray-700 flex items-center gap-2">
                <FileText size={18} /> วาระการประชุม
             </div>
             <div className="overflow-y-auto flex-1 p-2 space-y-1">
                {meetingAgendas.map(agenda => (
                   <button 
                      key={agenda.id} 
                      onClick={() => setActiveAgendaId(agenda.id)}
                      className={`w-full text-left p-3 rounded-md text-sm transition-colors duration-150 flex items-start gap-3
                        ${activeAgendaId === agenda.id ? 'bg-orange-50 text-orange-900 border border-orange-100 shadow-sm' : 'text-gray-700 hover:bg-gray-50'}`}
                   >
                      <span className={`flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold ${activeAgendaId === agenda.id ? 'bg-orange-200 text-orange-800' : 'bg-gray-200 text-gray-600'}`}>
                         {agenda.order}
                      </span>
                      <span className="font-medium line-clamp-2">{agenda.title}</span>
                   </button>
                ))}
                {meetingAgendas.length === 0 && (
                    <div className="p-8 text-center text-gray-400 text-sm">ไม่มีข้อมูลวาระ</div>
                )}
             </div>
          </div>

          {/* Content: Active Agenda Detail */}
          <div className="w-full lg:w-2/3 bg-white rounded-lg shadow-sm border border-gray-200 flex flex-col overflow-hidden">
              {activeAgenda ? (
                  <>
                     <div className="p-6 border-b border-gray-100">
                         <div className="flex items-center gap-2 mb-2">
                             <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">วาระที่ {activeAgenda.order}</span>
                         </div>
                         <h2 className="text-xl font-bold text-gray-900">{activeAgenda.title}</h2>
                     </div>
                     <div className="p-6 overflow-y-auto flex-1">
                         <div className="prose prose-sm max-w-none text-gray-700 mb-8 whitespace-pre-line">
                            {activeAgenda.description || <span className="text-gray-400 italic">ไม่มีรายละเอียด</span>}
                         </div>

                         {/* Attachments */}
                         {activeAgenda.files.length > 0 && (
                             <div className="mt-8">
                                 <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                     <Download size={16} /> เอกสารประกอบ
                                 </h4>
                                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                     {activeAgenda.files.map((file, idx) => (
                                         <a key={idx} href={file.url} className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-200 transition-colors group">
                                             <div className="p-2 bg-red-100 text-red-600 rounded mr-3">
                                                 <FileText size={20} />
                                             </div>
                                             <div className="flex-1 min-w-0">
                                                 <p className="text-sm font-medium text-gray-900 truncate group-hover:text-blue-700">{file.name}</p>
                                                 <p className="text-xs text-gray-500">คลิกเพื่อดาวน์โหลด</p>
                                             </div>
                                         </a>
                                     ))}
                                 </div>
                             </div>
                         )}
                     </div>
                  </>
              ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
                      <Info size={48} className="mb-4 text-gray-300" />
                      <p>เลือกวาระเพื่อดูรายละเอียด</p>
                  </div>
              )}
          </div>
       </div>
    </div>
  );
};
