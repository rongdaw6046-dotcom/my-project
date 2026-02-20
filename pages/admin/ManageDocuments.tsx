
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
    const [uploadType, setUploadType] = useState<'FILE' | 'URL'>('FILE');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        if (id) fetchDocuments(id);
    }, [id]);

    if (!meeting) return <div>Meeting not found</div>;

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setSelectedFile(e.target.files[0]);
            // Auto-fill name if empty
            if (!docName) {
                setDocName(e.target.files[0].name);
            }
        }
    };

    const convertToBase64 = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => {
                const result = reader.result as string;
                // Remove data:application/pdf;base64, prefix
                const base64 = result.split(',')[1];
                resolve(base64);
            };
            reader.onerror = error => reject(error);
        });
    };

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            if (uploadType === 'URL') {
                if (!docName || !docUrl) return alert('กรุณาระบุชื่อและลิงก์เอกสาร');
                await addDocument({
                    meetingId: meeting.id,
                    name: docName,
                    url: docUrl
                });
            } else {
                if (!docName || !selectedFile) return alert('กรุณาระบุชื่อและเลือกไฟล์');

                // Check file size (e.g. max 10MB)
                if (selectedFile.size > 10 * 1024 * 1024) {
                    return alert('ไฟล์มีขนาดใหญ่เกินไป (สูงสุด 10MB)');
                }

                const base64 = await convertToBase64(selectedFile);
                await addDocument({
                    meetingId: meeting.id,
                    name: docName,
                    fileData: base64,
                    mimeType: selectedFile.type,
                    url: '' // No external URL
                });
            }

            setDocName('');
            setDocUrl('');
            setSelectedFile(null);
            alert('เพิ่มเอกสารเรียบร้อยแล้ว');
        } catch (error) {
            console.error(error);
            alert('เกิดข้อผิดพลาดในการอัปโหลด');
        }
    };

    const handleDelete = (docId: string) => {
        if (confirm('ยืนยันการลบเอกสาร?')) {
            deleteDocument(docId);
        }
    };

    const filteredDocs = documents.filter(d => d.name.toLowerCase().includes(searchTerm.toLowerCase()));

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
                            <div className="p-5 border-b border-gray-200 bg-gray-50/50 flex justify-between items-center">
                                <h3 className="font-bold text-gray-800 text-lg flex items-center gap-2">
                                    <FileText size={20} className="text-orange-600" /> เอกสารประกอบการประชุม
                                </h3>
                                <input
                                    type="text"
                                    placeholder="ค้นหาเอกสาร..."
                                    value={searchTerm}
                                    onChange={e => setSearchTerm(e.target.value)}
                                    className="text-sm border border-gray-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-orange-500"
                                />
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
                                        {filteredDocs.map(doc => (
                                            <tr key={doc.id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                    {doc.url ? (
                                                        <a href={doc.url} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-blue-600 hover:underline">
                                                            <FileText size={16} /> {doc.name} (ลิงก์ภายนอก)
                                                        </a>
                                                    ) : (
                                                        <a href={`/api/documents/${doc.id}/download`} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-green-600 hover:underline">
                                                            <Download size={16} /> {doc.name}
                                                        </a>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {new Date(doc.createdAt).toLocaleDateString('th-TH')}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                                                    <button onClick={() => handleDelete(doc.id)} className="text-red-500 hover:text-red-700 p-2"><Trash size={16} /></button>
                                                </td>
                                            </tr>
                                        ))}
                                        {filteredDocs.length === 0 && (
                                            <tr>
                                                <td colSpan={3} className="text-center py-12 text-gray-400">ไม่พบเอกสาร</td>
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
                                    <h3 className="font-bold flex items-center gap-2"><Upload size={18} /> เพิ่มเอกสารใหม่</h3>
                                </div>
                                <div className="p-5 space-y-4">
                                    {/* Link Toggle */}
                                    <div className="flex bg-gray-100 p-1 rounded-lg mb-4">
                                        <button
                                            type="button"
                                            onClick={() => setUploadType('FILE')}
                                            className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all ${uploadType === 'FILE' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                                        >
                                            อัปโหลดไฟล์
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setUploadType('URL')}
                                            className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all ${uploadType === 'URL' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                                        >
                                            ลิงก์ภายนอก
                                        </button>
                                    </div>

                                    <form onSubmit={handleAdd}>
                                        <div className="mb-4">
                                            <label className="block text-sm font-medium text-gray-700 mb-1">ชื่อเอกสาร</label>
                                            <input
                                                type="text"
                                                className="block w-full border border-gray-300 rounded-lg p-2.5 focus:ring-orange-500 focus:border-orange-500"
                                                value={docName}
                                                onChange={e => setDocName(e.target.value)}
                                                placeholder="ระบุชื่อเอกสาร..."
                                                required
                                            />
                                        </div>

                                        {uploadType === 'FILE' ? (
                                            <div className="mb-4">
                                                <label className="block text-sm font-medium text-gray-700 mb-1">เลือกไฟล์</label>
                                                <input
                                                    type="file"
                                                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100"
                                                    onChange={handleFileChange}
                                                    accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.jpg,.jpeg,.png"
                                                />
                                                <p className="text-xs text-gray-400 mt-1">รองรับไฟล์ PDF, Office, รูปภาพ (ไม่เกิน 10MB)</p>
                                            </div>
                                        ) : (
                                            <div className="mb-4">
                                                <label className="block text-sm font-medium text-gray-700 mb-1">ลิงก์ไฟล์ (URL)</label>
                                                <input
                                                    type="url"
                                                    className="block w-full border border-gray-300 rounded-lg p-2.5 focus:ring-orange-500 focus:border-orange-500"
                                                    value={docUrl}
                                                    onChange={e => setDocUrl(e.target.value)}
                                                    placeholder="https://..."
                                                />
                                            </div>
                                        )}

                                        <button type="submit" className="w-full bg-orange-600 text-white rounded-lg py-2.5 font-medium hover:bg-orange-700 transition-colors flex justify-center items-center gap-2">
                                            <Upload size={18} /> {uploadType === 'FILE' ? 'อัปโหลด' : 'บันทึก'}
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
