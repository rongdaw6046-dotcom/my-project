
import React, { useState, useEffect } from 'react';
import { useApp } from '../../src/context/AppContext';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText, Upload, Trash, Download } from 'lucide-react';
import { AdminMeetingTabs } from '../../components/AdminMeetingTabs';

export const ManageDocuments: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { meetings, documents, fetchDocuments, addDocument, deleteDocument } = useApp();
    const meeting = meetings.find(m => m.id === id);

    const [docName, setDocName] = useState('');
    const [docUrl, setDocUrl] = useState('');

    useEffect(() => {
        if (id) fetchDocuments(id);
    }, [id]);

    if (!meeting) return <div>Meeting not found</div>;

    const handleAdd = (e: React.FormEvent) => {
        e.preventDefault();
        if (!docName || !docUrl) return alert('กรุณาระบุชื่อและลิงก์เอกสาร');

        addDocument({
            meetingId: meeting.id,
            name: docName,
            url: docUrl
        });
        setDocName('');
        setDocUrl('');
        alert('เพิ่มเอกสารเรียบร้อยแล้ว');
    };

    const handleDelete = (docId: string) => {
        if (confirm('ยืนยันการลบเอกสาร?')) {
            deleteDocument(docId);
        }
    };

    return (
        <div className="pb-10">
            <div className="flex flex-col lg:flex-row gap-8">
                {/* Sidebar */}
                <div className="w-full lg:w-64 flex-shrink-0">
                    <div className="sticky top-6 space-y-6">
                        <div className="flex flex-col gap-4">
                            <button onClick={() => navigate('/admin/dashboard')} className="inline-flex items-center text-gray-500 hover:text-orange-600 transition-colors w-fit">
                                <ArrowLeft size={20} className="mr-1" /> กลับหน้าหลัก
                            </button>
                            <div>
                                <h2 className="text-xl font-bold text-gray-800">จัดการการประชุม</h2>
                                <p className="text-xs text-gray-500 mt-1 line-clamp-2">{meeting.title}</p>
                            </div>
                        </div>
                        <AdminMeetingTabs meetingId={id!} />
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 w-full min-w-0">
                    <div className="flex flex-col xl:flex-row gap-6">
                        {/* List Section */}
                        <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden min-h-[500px] flex flex-col">
                            <div className="p-5 border-b border-gray-200 bg-gray-50/50">
                                <h3 className="font-bold text-gray-800 text-lg flex items-center gap-2">
                                    <FileText size={20} className="text-orange-600" /> เอกสารประกอบการประชุม
                                </h3>
                            </div>
                            <div className="overflow-x-auto flex-1 p-0">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50 text-gray-500">
                                        <tr>
                                            <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">ชื่อเอกสาร</th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">วันที่อัปโหลด</th>
                                            <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider">จัดการ</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {documents.map(doc => (
                                            <tr key={doc.id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                    <a href={doc.url} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-blue-600 hover:underline">
                                                        <FileText size={16} /> {doc.name}
                                                    </a>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {new Date(doc.createdAt).toLocaleDateString('th-TH')}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                                                    <button onClick={() => handleDelete(doc.id)} className="text-red-500 hover:text-red-700 p-2"><Trash size={16} /></button>
                                                </td>
                                            </tr>
                                        ))}
                                        {documents.length === 0 && (
                                            <tr>
                                                <td colSpan={3} className="text-center py-12 text-gray-400">ยังไม่มีเอกสาร</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Upload Form */}
                        <div className="w-full xl:w-80 flex-shrink-0">
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 sticky top-6">
                                <div className="bg-gray-900 px-5 py-4 text-white rounded-t-xl">
                                    <h3 className="font-bold flex items-center gap-2"><Upload size={18} /> อัปโหลดเอกสาร</h3>
                                </div>
                                <div className="p-5 space-y-4">
                                    <form onSubmit={handleAdd}>
                                        <div className="mb-4">
                                            <label className="block text-sm font-medium text-gray-700 mb-1">ชื่อเอกสาร</label>
                                            <input
                                                type="text"
                                                className="block w-full border border-gray-300 rounded-lg p-2.5 focus:ring-orange-500 focus:border-orange-500"
                                                value={docName}
                                                onChange={e => setDocName(e.target.value)}
                                                placeholder="เช่น ระเบียบวาระการประชุม..."
                                                required
                                            />
                                        </div>
                                        <div className="mb-4">
                                            <label className="block text-sm font-medium text-gray-700 mb-1">ลิงก์ไฟล์ (URL)</label>
                                            <input
                                                type="url"
                                                className="block w-full border border-gray-300 rounded-lg p-2.5 focus:ring-orange-500 focus:border-orange-500"
                                                value={docUrl}
                                                onChange={e => setDocUrl(e.target.value)}
                                                placeholder="https://..."
                                                required
                                            />
                                            <p className="text-xs text-gray-400 mt-1">วางลิงก์จาก Google Drive หรือเว็บฝากไฟล์</p>
                                        </div>
                                        <button type="submit" className="w-full bg-orange-600 text-white rounded-lg py-2.5 font-medium hover:bg-orange-700 transition-colors flex justify-center items-center gap-2">
                                            <Upload size={18} /> เพิ่มเอกสาร
                                        </button>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
