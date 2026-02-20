import React, { useState } from 'react';
import { useApp } from '../../src/context/AppContext';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, FileText, Download, Calendar, MapPin, Clock, Info, Eye } from 'lucide-react';
import { AgendaItem } from '../../types';
import { FilePreviewModal } from '../../components/FilePreviewModal';

export const MeetingDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const { meetings, agendas } = useApp();
    const [activeAgendaId, setActiveAgendaId] = useState<string | null>(null);

    // Preview State
    const [previewFile, setPreviewFile] = useState<{ url: string; name: string; type?: string } | null>(null);

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

    const handlePreview = (url: string, name: string) => {
        setPreviewFile({ url, name });
    };

    return (
        <>
            <div className="space-y-6 h-[calc(100vh-140px)] flex flex-col">
                {/* Header Section */}
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 flex-shrink-0">
                    <Link to="/user/dashboard" className="inline-flex items-center text-sm text-gray-500 hover:text-orange-600 mb-3">
                        <ArrowLeft size={16} className="mr-1" /> กลับสู่หน้ารวม
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

                                    {/* General Meeting Documents Section */}
                                    <GeneralDocumentsSection meetingId={meeting.id} onPreview={handlePreview} />

                                    {/* Agenda Attachments */}
                                    {activeAgenda.files.length > 0 && (
                                        <div className="mt-8 border-t border-gray-100 pt-6">
                                            <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                                <Download size={16} /> เอกสารแนบวาระ
                                            </h4>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                {activeAgenda.files.map((file, idx) => {
                                                    // Determine if we can preview
                                                    // Logic: If it's a data URL, we can likely preview PDF/Images provided the string has metadata
                                                    // If it's a regular URL, check extension
                                                    const canPreview = file.url.startsWith('data:') || file.name.match(/\.(pdf|jpg|jpeg|png)$/i);

                                                    return (
                                                        <div key={idx} className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-200 transition-colors group">
                                                            <div className="p-2 bg-blue-100 text-blue-600 rounded mr-3">
                                                                <FileText size={20} />
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <p className="text-sm font-medium text-gray-900 truncate group-hover:text-blue-700">{file.name}</p>
                                                                <div className="flex gap-3 text-xs mt-1">
                                                                    {canPreview ? (
                                                                        <button
                                                                            onClick={() => handlePreview(file.url, file.name)}
                                                                            className="text-orange-600 hover:text-orange-700 font-medium flex items-center gap-1"
                                                                        >
                                                                            <Eye size={12} /> ดูตัวอย่าง
                                                                        </button>
                                                                    ) : (
                                                                        <a
                                                                            href={file.url}
                                                                            target="_blank"
                                                                            rel="noreferrer"
                                                                            className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
                                                                        >
                                                                            <Download size={12} /> ดาวน์โหลด
                                                                        </a>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
                                <GeneralDocumentsSection meetingId={meeting.id} isCenter={true} onPreview={handlePreview} />
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <FilePreviewModal
                isOpen={!!previewFile}
                onClose={() => setPreviewFile(null)}
                fileUrl={previewFile?.url || ''}
                fileName={previewFile?.name || ''}
                fileType={previewFile?.type}
            />
        </>
    );
};

const GeneralDocumentsSection: React.FC<{ meetingId: string, isCenter?: boolean, onPreview: (url: string, name: string) => void }> = ({ meetingId, isCenter, onPreview }) => {
    const { documents, fetchDocuments } = useApp();
    const [searchTerm, setSearchTerm] = useState('');

    React.useEffect(() => {
        fetchDocuments(meetingId);
    }, [meetingId]);

    const filteredDocs = documents.filter(d => d.name.toLowerCase().includes(searchTerm.toLowerCase()));

    if (documents.length === 0) {
        if (isCenter) return (
            <div className="text-center">
                <Info size={48} className="mx-auto mb-4 text-gray-300" />
                <p>เลือกวาระเพื่อดูรายละเอียด</p>
                <p className="text-sm mt-2">ยังไม่มีเอกสารการประชุม</p>
            </div>
        );
        return null;
    }

    return (
        <div className={`mt-8 ${isCenter ? 'w-full max-w-md p-6' : 'border-t border-gray-100 pt-6'}`}>
            <div className="flex justify-between items-center mb-4">
                <h4 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                    <FileText size={16} className="text-orange-600" /> เอกสารการประชุม ({filteredDocs.length})
                </h4>
                <input
                    type="text"
                    placeholder="ค้นหา..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="text-xs border border-gray-300 rounded px-2 py-1"
                />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {filteredDocs.map(doc => {
                    const downloadUrl = doc.url || `/api/documents/${doc.id}/download`;
                    // Assume uploaded docs (doc.url is empty) are previewable if they are PDF/Image
                    // Server serves them.
                    const canPreview = !doc.url || doc.name.match(/\.(pdf|jpg|jpeg|png)$/i);

                    return (
                        <div key={doc.id} className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-orange-50 hover:border-orange-200 transition-colors group">
                            <div className="p-2 bg-orange-100 text-orange-600 rounded mr-3">
                                <FileText size={20} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate group-hover:text-orange-700">{doc.name}</p>
                                <div className="flex gap-2 text-xs text-gray-500 mt-0.5 items-center">
                                    <span>{new Date(doc.createdAt).toLocaleDateString('th-TH')}</span>

                                    <div className="ml-auto flex gap-2">
                                        {canPreview && (
                                            <button
                                                onClick={() => onPreview(downloadUrl, doc.name)}
                                                className="text-orange-600 hover:text-orange-700 font-medium flex items-center gap-1"
                                            >
                                                <Eye size={12} /> ดู
                                            </button>
                                        )}
                                        <a
                                            href={downloadUrl}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="text-green-600 hover:text-green-700 font-medium flex items-center gap-1"
                                        >
                                            <Download size={12} /> โหลด
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
