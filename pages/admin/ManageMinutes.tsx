
import React, { useState, useEffect } from 'react';
import { useApp } from '../../src/context/AppContext';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText, Save, Upload, Trash, Download, FileCheck } from 'lucide-react';
import { AdminMeetingTabs } from '../../components/AdminMeetingTabs';

export const ManageMinutes: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { meetings, updateMeeting } = useApp();
    const meeting = meetings.find(m => m.id === id);

    const [summary, setSummary] = useState('');
    const [minutesFiles, setMinutesFiles] = useState<{ name: string; url: string }[]>([]);

    // File input state
    const [fileName, setFileName] = useState('');
    const [fileUrl, setFileUrl] = useState('');

    useEffect(() => {
        if (meeting) {
            setSummary(meeting.minutesSummary || '');
            setMinutesFiles(meeting.minutesFiles || []);
        }
    }, [meeting]);

    if (!meeting) return <div>Meeting not found</div>;

    const handleSaveSummary = () => {
        updateMeeting(meeting.id, { minutesSummary: summary });
        alert('บันทึกสรุปการประชุมเรียบร้อยแล้ว');
    };

    const handleAddFile = (e: React.FormEvent) => {
        e.preventDefault();
        if (!fileName || !fileUrl) return alert('กรุณาระบุชื่อและลิงก์ไฟล์');

        const newFiles = [...minutesFiles, { name: fileName, url: fileUrl }];
        setMinutesFiles(newFiles);
        updateMeeting(meeting.id, { minutesFiles: newFiles });

        setFileName('');
        setFileUrl('');
        alert('เพิ่มไฟล์รายงานการประชุมเรียบร้อยแล้ว');
    };

    const handleRemoveFile = (index: number) => {
        if (confirm('ยืนยันลบไฟล์นี้?')) {
            const newFiles = minutesFiles.filter((_, i) => i !== index);
            setMinutesFiles(newFiles);
            updateMeeting(meeting.id, { minutesFiles: newFiles });
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
                <div className="flex-1 w-full min-w-0 space-y-6">

                    {/* Summary Section */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="p-5 border-b border-gray-200 bg-gray-50/50 flex justify-between items-center">
                            <h3 className="font-bold text-gray-800 text-lg flex items-center gap-2">
                                <FileCheck size={20} className="text-orange-600" /> สรุปผลการประชุม
                            </h3>
                            <button onClick={handleSaveSummary} className="bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-orange-700 transition-colors flex items-center gap-2">
                                <Save size={16} /> บันทึกสรุป
                            </button>
                        </div>
                        <div className="p-5">
                            <textarea
                                className="w-full h-64 p-4 border border-gray-300 rounded-xl focus:ring-orange-500 focus:border-orange-500 text-sm leading-relaxed"
                                placeholder="พิมพ์สรุปการประชุมที่นี่..."
                                value={summary}
                                onChange={e => setSummary(e.target.value)}
                            ></textarea>
                        </div>
                    </div>

                    {/* Files Section */}
                    <div className="flex flex-col xl:flex-row gap-6">
                        <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden min-h-[300px] flex flex-col">
                            <div className="p-5 border-b border-gray-200 bg-gray-50/50">
                                <h3 className="font-bold text-gray-800 text-lg flex items-center gap-2">
                                    <FileText size={20} className="text-orange-600" /> ไฟล์รายงานการประชุม
                                </h3>
                            </div>
                            <div className="overflow-x-auto flex-1 p-0">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50 text-gray-500">
                                        <tr>
                                            <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">ชื่อไฟล์</th>
                                            <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider">จัดการ</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {minutesFiles.map((file, idx) => (
                                            <tr key={idx} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                    <a href={file.url} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-blue-600 hover:underline">
                                                        <FileText size={16} /> {file.name}
                                                    </a>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                                                    <button onClick={() => handleRemoveFile(idx)} className="text-red-500 hover:text-red-700 p-2"><Trash size={16} /></button>
                                                </td>
                                            </tr>
                                        ))}
                                        {minutesFiles.length === 0 && (
                                            <tr>
                                                <td colSpan={2} className="text-center py-12 text-gray-400">ยังไม่มีไฟล์แนบ</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <div className="w-full xl:w-80 flex-shrink-0">
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 sticky top-6">
                                <div className="bg-gray-900 px-5 py-4 text-white rounded-t-xl">
                                    <h3 className="font-bold flex items-center gap-2"><Upload size={18} /> อัปโหลดไฟล์รายงาน</h3>
                                </div>
                                <div className="p-5 space-y-4">
                                    <form onSubmit={handleAddFile}>
                                        <div className="mb-4">
                                            <label className="block text-sm font-medium text-gray-700 mb-1">ชื่อไฟล์</label>
                                            <input
                                                type="text"
                                                className="block w-full border border-gray-300 rounded-lg p-2.5 focus:ring-orange-500 focus:border-orange-500"
                                                value={fileName}
                                                onChange={e => setFileName(e.target.value)}
                                                placeholder="เช่น รายงานการประชุมครั้งที่ 1..."
                                                required
                                            />
                                        </div>
                                        <div className="mb-4">
                                            <label className="block text-sm font-medium text-gray-700 mb-1">ลิงก์ไฟล์ (URL)</label>
                                            <input
                                                type="url"
                                                className="block w-full border border-gray-300 rounded-lg p-2.5 focus:ring-orange-500 focus:border-orange-500"
                                                value={fileUrl}
                                                onChange={e => setFileUrl(e.target.value)}
                                                placeholder="https://..."
                                                required
                                            />
                                        </div>
                                        <button type="submit" className="w-full bg-orange-600 text-white rounded-lg py-2.5 font-medium hover:bg-orange-700 transition-colors flex justify-center items-center gap-2">
                                            <Upload size={18} /> แนบไฟล์
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
