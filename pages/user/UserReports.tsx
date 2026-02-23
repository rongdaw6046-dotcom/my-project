import React, { useState, useEffect } from 'react';
import { useApp } from '../../src/context/AppContext';
import { FileText, Download, Eye, Search, BookOpen, ChevronDown, ChevronUp } from 'lucide-react';
import { FilePreviewModal } from '../../components/FilePreviewModal';

export const UserReports: React.FC = () => {
    const { meetings, user, attendees, documents, fetchDocuments } = useApp();
    const [searchTerm, setSearchTerm] = useState('');
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [previewFile, setPreviewFile] = useState<{ url: string; name: string } | null>(null);
    const [loadedMeetings, setLoadedMeetings] = useState<Set<string>>(new Set());

    if (!user) return null;

    // Meetings the user can access, that have COMPLETED status (reports are for completed meetings)
    const myMeetings = meetings.filter(m => {
        const isAttendee = attendees.some(a => a.userId === user.id && a.meetingId === m.id);
        const hasPermission = user.allowedMeetingIds?.includes(m.id);
        return (isAttendee || hasPermission);
    });

    const filtered = myMeetings.filter(m =>
        m.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.edition.includes(searchTerm)
    );

    const sorted = [...filtered].sort((a, b) => {
        const order = { UPCOMING: 1, COMPLETED: 0 };
        return (order[a.status] || 0) - (order[b.status] || 0);
    });

    const handleExpand = (meetingId: string) => {
        const isOpen = expandedId === meetingId;
        setExpandedId(isOpen ? null : meetingId);
        if (!isOpen && !loadedMeetings.has(meetingId)) {
            fetchDocuments(meetingId);
            setLoadedMeetings(prev => new Set([...prev, meetingId]));
        }
    };

    const getMeetingDocs = (meetingId: string) =>
        documents.filter(d => d.meetingId === meetingId);

    return (
        <>
            <div className="space-y-6">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                        <BookOpen size={24} className="text-orange-500" /> รายงานการประชุม / เอกสาร
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">รายงานและเอกสารประกอบการประชุมที่คุณมีส่วนร่วม</p>
                </div>

                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                        <Search size={18} />
                    </div>
                    <input
                        type="text"
                        placeholder="ค้นหาการประชุม..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl shadow-sm focus:ring-orange-500 focus:border-orange-500"
                    />
                </div>

                <div className="space-y-3">
                    {sorted.map(meeting => {
                        const isExpanded = expandedId === meeting.id;
                        const docs = getMeetingDocs(meeting.id);
                        const hasMinutes = (meeting.minutesFiles && meeting.minutesFiles.length > 0) || !!meeting.minutesSummary;

                        return (
                            <div key={meeting.id} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                                <button
                                    onClick={() => handleExpand(meeting.id)}
                                    className="w-full p-5 text-left hover:bg-gray-50 transition-colors flex items-center justify-between gap-4"
                                >
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className={`px-2 py-0.5 text-xs font-semibold rounded ${meeting.status === 'UPCOMING' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                                                {meeting.status === 'UPCOMING' ? 'กำลังจะมาถึง' : 'เสร็จสิ้น'}
                                            </span>
                                            <span className="text-xs text-gray-400">ครั้งที่ {meeting.edition}</span>
                                            {hasMinutes && (
                                                <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-semibold rounded">มีรายงาน</span>
                                            )}
                                        </div>
                                        <p className="font-bold text-gray-900">{meeting.title}</p>
                                        <p className="text-sm text-gray-500 mt-0.5">{meeting.date} · {meeting.time} น.</p>
                                    </div>
                                    {isExpanded ? <ChevronUp size={18} className="text-gray-400 flex-shrink-0" /> : <ChevronDown size={18} className="text-gray-400 flex-shrink-0" />}
                                </button>

                                {isExpanded && (
                                    <div className="border-t border-gray-100 p-5 space-y-5 bg-gray-50">

                                        {/* Minutes summary */}
                                        {meeting.minutesSummary && (
                                            <div>
                                                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">สรุปการประชุม</h4>
                                                <div className="bg-white rounded-xl p-4 border border-blue-100 text-sm text-gray-700 whitespace-pre-line">
                                                    {meeting.minutesSummary}
                                                </div>
                                            </div>
                                        )}

                                        {/* Minutes files */}
                                        {meeting.minutesFiles && meeting.minutesFiles.length > 0 && (
                                            <div>
                                                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">ไฟล์รายงานการประชุม</h4>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                                    {meeting.minutesFiles.map((f, i) => {
                                                        const canPreview = f.url.startsWith('data:') || /\.(pdf|jpg|jpeg|png)$/i.test(f.name);
                                                        return (
                                                            <div key={i} className="flex items-center p-3 bg-white border border-gray-200 rounded-xl gap-3 group hover:border-blue-300 transition-colors">
                                                                <div className="p-2 bg-blue-100 text-blue-600 rounded-lg"><FileText size={18} /></div>
                                                                <div className="flex-1 min-w-0">
                                                                    <p className="text-sm font-medium text-gray-800 truncate">{f.name}</p>
                                                                    <div className="flex gap-2 mt-1">
                                                                        {canPreview && (
                                                                            <button onClick={() => setPreviewFile(f)} className="text-xs text-orange-600 hover:text-orange-700 flex items-center gap-1 font-medium">
                                                                                <Eye size={11} /> ดู
                                                                            </button>
                                                                        )}
                                                                        <a href={f.url} download={f.name} className="text-xs text-green-600 hover:text-green-700 flex items-center gap-1 font-medium">
                                                                            <Download size={11} /> ดาวน์โหลด
                                                                        </a>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        )}

                                        {/* Meeting documents */}
                                        <div>
                                            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">เอกสารประกอบการประชุม ({docs.length})</h4>
                                            {docs.length > 0 ? (
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                                    {docs.map(doc => {
                                                        const url = doc.url || `/api/documents/${doc.id}/download`;
                                                        const canPreview = !doc.url || /\.(pdf|jpg|jpeg|png)$/i.test(doc.name);
                                                        return (
                                                            <div key={doc.id} className="flex items-center p-3 bg-white border border-gray-200 rounded-xl gap-3 group hover:border-orange-200 transition-colors">
                                                                <div className="p-2 bg-orange-100 text-orange-600 rounded-lg"><FileText size={18} /></div>
                                                                <div className="flex-1 min-w-0">
                                                                    <p className="text-sm font-medium text-gray-800 truncate">{doc.name}</p>
                                                                    <div className="flex gap-2 mt-1">
                                                                        {canPreview && (
                                                                            <button onClick={() => setPreviewFile({ url, name: doc.name })} className="text-xs text-orange-600 hover:text-orange-700 flex items-center gap-1 font-medium">
                                                                                <Eye size={11} /> ดู
                                                                            </button>
                                                                        )}
                                                                        <a href={url} target="_blank" rel="noreferrer" className="text-xs text-green-600 hover:text-green-700 flex items-center gap-1 font-medium">
                                                                            <Download size={11} /> โหลด
                                                                        </a>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            ) : (
                                                <p className="text-sm text-gray-400 italic py-2">ไม่มีเอกสารประกอบ</p>
                                            )}
                                        </div>

                                        {!meeting.minutesSummary && (!meeting.minutesFiles || meeting.minutesFiles.length === 0) && docs.length === 0 && (
                                            <p className="text-sm text-gray-400 italic text-center py-4">ยังไม่มีรายงานหรือเอกสารสำหรับการประชุมนี้</p>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}

                    {sorted.length === 0 && (
                        <div className="bg-white p-12 text-center rounded-2xl border border-gray-200 text-gray-500">
                            <div className="inline-block p-4 rounded-full bg-gray-50 mb-3"><BookOpen size={32} className="text-gray-300" /></div>
                            <p className="font-medium">ไม่พบรายงานการประชุม</p>
                        </div>
                    )}
                </div>
            </div>

            <FilePreviewModal
                isOpen={!!previewFile}
                onClose={() => setPreviewFile(null)}
                fileUrl={previewFile?.url || ''}
                fileName={previewFile?.name || ''}
            />
        </>
    );
};
