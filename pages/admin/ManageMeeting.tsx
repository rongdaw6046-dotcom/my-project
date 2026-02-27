import React, { useState, useEffect } from 'react';
import { useApp } from '../../src/context/AppContext';
import { useNavigate, useParams } from 'react-router-dom';
import { Meeting } from '../../types';
import { ArrowLeft, Save, Upload, FileText, Trash, Calendar, MapPin, DollarSign, Info, Clock } from 'lucide-react';
import { AdminMeetingTabs } from '../../components/AdminMeetingTabs';

export const ManageMeeting: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { meetings, addMeeting, updateMeeting } = useApp();

    const isEditMode = !!id;
    const meeting = meetings.find(m => m.id === id);

    const [formData, setFormData] = useState<Omit<Meeting, 'id'>>({
        title: '',
        edition: '',
        date: '',
        time: '',
        location: '',
        status: 'UPCOMING',
        budget: 0,
        minutesFiles: []
    });

    useEffect(() => {
        if (isEditMode && meeting) {
            setFormData({
                title: meeting.title,
                edition: meeting.edition,
                date: meeting.date,
                time: meeting.time,
                location: meeting.location,
                status: meeting.status,
                budget: meeting.budget || 0,
                minutesFiles: meeting.minutesFiles || []
            });
        }
    }, [isEditMode, meeting]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (isEditMode && id) {
                await updateMeeting(id, formData);
                alert('บันทึกข้อมูลเรียบร้อย');
            } else {
                await addMeeting(formData);
                alert('สร้างการประชุมเรียบร้อย');
                navigate('/admin/dashboard');
            }
        } catch (error: any) {
            console.error('Save error:', error);
            alert(`ไม่สามารถบันทึกข้อมูลได้: ${error.message}`);
        }
    };

    const handleFileUpload = () => {
        const newFile = { name: `Minutes_Reports_${Date.now()}.pdf`, url: '#' };
        setFormData({ ...formData, minutesFiles: [...(formData.minutesFiles || []), newFile] });
    };

    const removeFile = (index: number) => {
        const updatedFiles = [...(formData.minutesFiles || [])];
        updatedFiles.splice(index, 1);
        setFormData({ ...formData, minutesFiles: updatedFiles });
    };

    return (
        <div className="pb-10">
            <div className="flex flex-col lg:flex-row gap-8">

                {/* Left Sidebar Menu */}
                <div className="w-full lg:w-64 flex-shrink-0">
                    <div className="sticky top-6 space-y-6">
                        {/* Header Section in Sidebar */}
                        <div className="flex flex-col gap-4">
                            <button
                                onClick={() => navigate('/admin/dashboard')}
                                className="inline-flex items-center text-gray-500 hover:text-orange-600 transition-colors w-fit"
                            >
                                <ArrowLeft size={20} className="mr-1" /> กลับหน้าหลัก
                            </button>
                            <div>
                                <h2 className="text-xl font-bold text-gray-800">{isEditMode ? 'จัดการการประชุม' : 'สร้างการประชุมใหม่'}</h2>
                                <p className="text-xs text-gray-500 mt-1 line-clamp-2 min-h-[16px]">
                                    {isEditMode ? meeting?.title : 'กรอกรายละเอียดเพื่อเริ่มสร้างการประชุม'}
                                </p>
                            </div>

                        </div>

                        {/* Navigation Tabs (Only in Edit Mode) */}
                        {isEditMode && id && <AdminMeetingTabs meetingId={id} />}
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="flex-1 w-full min-w-0">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Info Card */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <h3 className="font-bold text-gray-800 mb-5 flex items-center gap-2 pb-3 border-b border-gray-100">
                                <Info size={20} className="text-orange-600" /> ข้อมูลทั่วไป
                            </h3>
                            <div className="space-y-5">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">หัวข้อการประชุม <span className="text-red-500">*</span></label>
                                    <input
                                        required
                                        type="text"
                                        value={formData.title}
                                        onChange={e => setFormData({ ...formData, title: e.target.value })}
                                        className="block w-full border-gray-300 rounded-lg shadow-sm focus:ring-orange-500 focus:border-orange-500 py-2.5 px-3"
                                        placeholder="ระบุหัวข้อการประชุม"
                                    />
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">ครั้งที่ <span className="text-red-500">*</span></label>
                                        <input
                                            required
                                            type="text"
                                            value={formData.edition}
                                            onChange={e => setFormData({ ...formData, edition: e.target.value })}
                                            className="block w-full border-gray-300 rounded-lg shadow-sm focus:ring-orange-500 focus:border-orange-500 py-2.5 px-3"
                                            placeholder="เช่น 1/2567"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">สถานะ</label>
                                        <select
                                            value={formData.status}
                                            onChange={e => setFormData({ ...formData, status: e.target.value as 'UPCOMING' | 'COMPLETED' })}
                                            className="block w-full border-gray-300 rounded-lg shadow-sm focus:ring-orange-500 focus:border-orange-500 py-2.5 px-3"
                                        >
                                            <option value="UPCOMING">📅 กำลังดำเนินการ</option>
                                            <option value="COMPLETED">✅ เสร็จสิ้นแล้ว</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Date/Location Card */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <h3 className="font-bold text-gray-800 mb-5 flex items-center gap-2 pb-3 border-b border-gray-100">
                                <Calendar size={20} className="text-orange-600" /> วัน เวลา และสถานที่
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">วันที่ <span className="text-red-500">*</span></label>
                                    <input
                                        required
                                        type="date"
                                        value={formData.date}
                                        onChange={e => setFormData({ ...formData, date: e.target.value })}
                                        className="block w-full border-gray-300 rounded-lg shadow-sm focus:ring-orange-500 focus:border-orange-500 py-2.5 px-3"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">เวลา <span className="text-red-500">*</span></label>
                                    <input
                                        required
                                        type="time"
                                        value={formData.time}
                                        onChange={e => setFormData({ ...formData, time: e.target.value })}
                                        className="block w-full border-gray-300 rounded-lg shadow-sm focus:ring-orange-500 focus:border-orange-500 py-2.5 px-3"
                                    />
                                </div>
                                <div className="sm:col-span-2">
                                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">สถานที่ <span className="text-red-500">*</span></label>
                                    <div className="relative">
                                        <input
                                            required
                                            type="text"
                                            value={formData.location}
                                            onChange={e => setFormData({ ...formData, location: e.target.value })}
                                            className="block w-full pl-10 border-gray-300 rounded-lg shadow-sm focus:ring-orange-500 focus:border-orange-500 py-2.5 px-3"
                                            placeholder="ระบุห้องประชุม หรือลิงก์ออนไลน์"
                                        />
                                        <MapPin size={18} className="absolute left-3 top-3 text-gray-400" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Budget */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <h3 className="font-bold text-gray-800 mb-5 flex items-center gap-2 pb-3 border-b border-gray-100">
                                <DollarSign size={20} className="text-orange-600" /> งบประมาณ
                            </h3>
                            <div>
                                <input
                                    type="number"
                                    value={formData.budget}
                                    onChange={e => setFormData({ ...formData, budget: parseFloat(e.target.value) })}
                                    className="block w-full border-gray-300 rounded-lg shadow-sm focus:ring-orange-500 focus:border-orange-500 py-2.5 px-3 text-right"
                                    placeholder="0.00"
                                />
                                <p className="text-xs text-gray-500 mt-2 text-right">บาท</p>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
                            <button
                                type="button"
                                onClick={() => navigate('/admin/dashboard')}
                                className="px-6 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                            >
                                ยกเลิก
                            </button>
                            <button
                                type="submit"
                                className="px-6 py-2.5 bg-gray-900 text-white font-medium rounded-lg shadow-lg hover:bg-gray-800 transition-all transform hover:-translate-y-0.5 flex items-center gap-2"
                            >
                                <Save size={18} /> บันทึกข้อมูล
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};
