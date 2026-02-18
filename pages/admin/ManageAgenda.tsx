import React, { useState } from 'react';
import { useApp } from '../../src/context/AppContext';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeft, Plus, Edit, Trash2, FileText, Upload,
    X, Check, Save, AlertCircle, AlertTriangle
} from 'lucide-react';
import { AgendaItem } from '../../types';
import { AdminMeetingTabs } from '../../components/AdminMeetingTabs';

export const ManageAgenda: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { meetings, agendas, addAgenda, updateAgenda, deleteAgenda } = useApp();

    // State สำหรับ Form แก้ไข/เพิ่ม
    const [editingAgenda, setEditingAgenda] = useState<Partial<AgendaItem> | null>(null);
    const [isFormOpen, setIsFormOpen] = useState(false);

    // State ใหม่! สำหรับ Popup ลบ
    const [deleteId, setDeleteId] = useState<string | null>(null);

    const meeting = meetings.find(m => m.id === id);
    const meetingAgendas = agendas.filter(a => a.meetingId === id).sort((a, b) => a.order - b.order);

    if (!meeting) return <div>Meeting not found</div>;

    // --- Handlers ---

    const handleCreate = () => {
        setEditingAgenda({ meetingId: id, order: meetingAgendas.length + 1, title: '', description: '', files: [], isImportant: false });
        setIsFormOpen(true);
    };

    const handleEdit = (agenda: AgendaItem) => {
        setEditingAgenda(agenda);
        setIsFormOpen(true);
    };

    // 1. กดปุ่มถังขยะ -> เปิด Popup เก็บ ID ไว้
    const handleDeleteClick = (agendaId: string) => {
        setDeleteId(agendaId);
    };

    // 2. กดปุ่มยืนยันใน Popup -> ลบจริง
    const handleConfirmDelete = async () => {
        if (deleteId) {
            try {
                await deleteAgenda(deleteId);
                setDeleteId(null); // ปิด Popup
            } catch (error) {
                console.error("Delete failed:", error);
                alert("ลบไม่สำเร็จ กรุณาลองใหม่");
            }
        }
    };

    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingAgenda) return;

        try {
            if ('id' in editingAgenda && editingAgenda.id) {
                await updateAgenda(editingAgenda.id, editingAgenda);
            } else {
                await addAgenda(editingAgenda as Omit<AgendaItem, 'id'>);
            }
            setIsFormOpen(false);
            setEditingAgenda(null);
        } catch (error) {
            console.error("Error:", error);
            alert("บันทึกไม่สำเร็จ! กรุณาดู Error ใน Console");
        }
    };

    return (
        <div className="pb-10 bg-gray-50 min-h-screen">
            <div className="flex flex-col lg:flex-row gap-8 max-w-7xl mx-auto p-6">

                {/* Left Sidebar */}
                <div className="w-full lg:w-64 flex-shrink-0">
                    <div className="sticky top-6 space-y-6">
                        <div className="flex flex-col gap-4">
                            <button onClick={() => navigate('/admin/dashboard')} className="inline-flex items-center text-gray-500 hover:text-orange-600 transition-colors w-fit group">
                                <ArrowLeft size={20} className="mr-1 group-hover:-translate-x-1 transition-transform" /> กลับหน้าหลัก
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
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                            <div className="p-2 bg-orange-100 rounded-lg">
                                <FileText className="text-orange-600 w-5 h-5" />
                            </div>
                            วาระการประชุม <span className="text-gray-400 text-sm font-normal">({meetingAgendas.length})</span>
                        </h3>
                        <button onClick={handleCreate} className="inline-flex items-center px-4 py-2 bg-orange-600 text-white rounded-lg shadow-sm hover:bg-orange-700 hover:shadow-md transition-all font-medium text-sm">
                            <Plus size={18} className="mr-2" /> เพิ่มวาระ
                        </button>
                    </div>

                    <div className="space-y-4">
                        {meetingAgendas.length > 0 ? (
                            meetingAgendas.map((agenda) => (
                                <div key={agenda.id} className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 flex gap-5 group hover:shadow-md transition-all duration-200">
                                    {/* Order Badge */}
                                    <div className="flex flex-col items-center pt-1">
                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-xl shadow-sm ${agenda.isImportant
                                                ? 'bg-red-50 text-red-600 border border-red-100'
                                                : 'bg-gray-50 text-gray-600 border border-gray-100'
                                            }`}>
                                            {agenda.order}
                                        </div>
                                        {agenda.isImportant && (
                                            <span className="mt-2 text-[10px] font-bold text-red-500 bg-red-50 px-2 py-0.5 rounded-full border border-red-100">สำคัญ</span>
                                        )}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <h4 className="text-lg font-bold text-gray-800 mb-2 truncate">{agenda.title}</h4>
                                        <div className="text-gray-600 text-sm whitespace-pre-line leading-relaxed mb-3">
                                            {agenda.description || <span className="text-gray-400 italic flex items-center gap-1"><AlertCircle size={12} /> ไม่มีรายละเอียด</span>}
                                        </div>

                                        {agenda.files.length > 0 && (
                                            <div className="flex flex-wrap gap-2 mt-3">
                                                {agenda.files.map((f, idx) => (
                                                    <span key={idx} className="inline-flex items-center px-3 py-1.5 rounded-md text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100 transition-colors hover:bg-blue-100 cursor-default">
                                                        <FileText size={12} className="mr-1.5" />
                                                        {f.name}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex flex-col gap-2 border-l border-gray-100 pl-4 ml-2 justify-start">
                                        <button onClick={() => handleEdit(agenda)} className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors" title="แก้ไข">
                                            <Edit size={18} />
                                        </button>
                                        {/* เรียกใช้ handleDeleteClick เพื่อเปิด Popup */}
                                        <button onClick={() => handleDeleteClick(agenda.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="ลบ">
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="bg-white border-2 border-dashed border-gray-200 rounded-xl p-16 text-center">
                                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                                    <FileText size={32} />
                                </div>
                                <h3 className="text-gray-900 font-medium text-lg">ยังไม่มีวาระการประชุม</h3>
                                <p className="text-gray-500 text-sm mt-2">กดปุ่ม "เพิ่มวาระ" เพื่อเริ่มต้นสร้างวาระการประชุม</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* --- Delete Confirmation Modal (Popup ยืนยันการลบ) --- */}
            {deleteId && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center transform transition-all scale-100">
                        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <AlertTriangle className="w-8 h-8 text-red-500" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">ยืนยันการลบ?</h3>
                        <p className="text-gray-500 text-sm mb-6">
                            คุณแน่ใจหรือไม่ที่จะลบวาระนี้? <br />
                            การกระทำนี้ไม่สามารถย้อนกลับได้
                        </p>
                        <div className="flex gap-3 justify-center">
                            <button
                                onClick={() => setDeleteId(null)}
                                className="px-5 py-2.5 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors w-full"
                            >
                                ยกเลิก
                            </button>
                            <button
                                onClick={handleConfirmDelete}
                                className="px-5 py-2.5 rounded-lg bg-red-600 text-white font-medium hover:bg-red-700 shadow-lg hover:shadow-red-200 transition-all w-full"
                            >
                                ลบวาระ
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* --- Form Modal (Popup ฟอร์มแก้ไข/เพิ่ม) --- */}
            {isFormOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden transform transition-all scale-100 flex flex-col max-h-[90vh]">

                        {/* Header */}
                        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50 flex-shrink-0">
                            <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                                {editingAgenda?.id ? (
                                    <>
                                        <div className="p-1.5 bg-indigo-100 rounded text-indigo-600"><Edit className="w-5 h-5" /></div>
                                        แก้ไขวาระ
                                    </>
                                ) : (
                                    <>
                                        <div className="p-1.5 bg-green-100 rounded text-green-600"><Plus className="w-5 h-5" /></div>
                                        เพิ่มวาระใหม่
                                    </>
                                )}
                            </h3>
                            <button
                                onClick={() => setIsFormOpen(false)}
                                className="text-gray-400 hover:text-gray-600 hover:bg-gray-200 p-2 rounded-full transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Scrollable Form Body */}
                        <div className="p-6 overflow-y-auto">
                            <form id="agenda-form" onSubmit={handleFormSubmit} className="space-y-5">
                                {/* ... (Form Content เหมือนเดิม) ... */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                                        หัวข้อวาระ <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all placeholder-gray-400 text-gray-800"
                                        placeholder="เช่น รับรองรายงานการประชุม..."
                                        value={editingAgenda?.title || ''}
                                        onChange={e => setEditingAgenda(prev => prev ? { ...prev, title: e.target.value } : null)}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                                        รายละเอียด
                                    </label>
                                    <textarea
                                        rows={4}
                                        className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all placeholder-gray-400 text-gray-800 resize-none"
                                        placeholder="รายละเอียดเพิ่มเติม (ถ้ามี)"
                                        value={editingAgenda?.description || ''}
                                        onChange={e => setEditingAgenda(prev => prev ? { ...prev, description: e.target.value } : null)}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                                            ลำดับที่
                                        </label>
                                        <input
                                            type="number"
                                            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all font-medium"
                                            value={editingAgenda?.order || 0}
                                            onChange={e => setEditingAgenda(prev => prev ? { ...prev, order: parseInt(e.target.value) } : null)}
                                        />
                                    </div>
                                    <div className="flex flex-col justify-end">
                                        <label
                                            className={`flex items-center justify-between px-4 py-2.5 rounded-lg border cursor-pointer transition-all h-[46px] ${editingAgenda?.isImportant
                                                    ? 'bg-red-50 border-red-200 text-red-700 ring-1 ring-red-200'
                                                    : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50'
                                                }`}
                                        >
                                            <span className="text-sm font-semibold select-none">สำคัญมาก</span>
                                            <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${editingAgenda?.isImportant ? 'bg-red-500 border-red-500' : 'border-gray-400 bg-white'
                                                }`}>
                                                {editingAgenda?.isImportant && <Check className="w-3.5 h-3.5 text-white" />}
                                            </div>
                                            <input
                                                type="checkbox"
                                                className="hidden"
                                                checked={editingAgenda?.isImportant || false}
                                                onChange={e => setEditingAgenda(prev => prev ? { ...prev, isImportant: e.target.checked } : null)}
                                            />
                                        </label>
                                    </div>
                                </div>
                                {/* Files Section (เหมือนเดิม) */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        เอกสารประกอบ
                                    </label>
                                    {editingAgenda?.files && editingAgenda.files.length > 0 && (
                                        <div className="space-y-2 mb-3">
                                            {editingAgenda.files.map((f, i) => (
                                                <div key={i} className="flex justify-between items-center text-sm bg-blue-50/50 border border-blue-100 text-blue-800 px-3 py-2 rounded-lg">
                                                    <div className="flex items-center gap-2 overflow-hidden">
                                                        <FileText size={16} className="text-blue-500 flex-shrink-0" />
                                                        <span className="font-medium truncate">{f.name}</span>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            const newFiles = [...(editingAgenda.files || [])];
                                                            newFiles.splice(i, 1);
                                                            setEditingAgenda(prev => prev ? { ...prev, files: newFiles } : null);
                                                        }}
                                                        className="text-gray-400 hover:text-red-500 hover:bg-red-50 p-1.5 rounded-md transition-colors flex-shrink-0"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                    <div
                                        className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:bg-orange-50/50 hover:border-orange-300 transition-all cursor-pointer group relative"
                                    >
                                        <input
                                            type="file"
                                            multiple
                                            accept=".pdf,.jpg,.jpeg,.png"
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                            onChange={async (e) => {
                                                if (e.target.files && e.target.files.length > 0) {
                                                    const newFiles = [...(editingAgenda.files || [])];
                                                    for (let i = 0; i < e.target.files.length; i++) {
                                                        const file = e.target.files[i];
                                                        if (file.size > 2 * 1024 * 1024) { // 2MB Limit
                                                            alert(`ไฟล์ ${file.name} มีขนาดใหญ่เกิน 2MB`);
                                                            continue;
                                                        }

                                                        // Convert to Base64
                                                        const base64 = await new Promise<string>((resolve) => {
                                                            const reader = new FileReader();
                                                            reader.onload = () => resolve(reader.result as string);
                                                            reader.readAsDataURL(file);
                                                        });

                                                        newFiles.push({ name: file.name, url: base64 });
                                                    }
                                                    setEditingAgenda(prev => prev ? { ...prev, files: newFiles } : null);
                                                }
                                            }}
                                        />
                                        <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-2 group-hover:bg-orange-100 group-hover:text-orange-600 transition-colors text-gray-500">
                                            <Upload size={20} />
                                        </div>
                                        <span className="text-sm text-gray-600 font-medium group-hover:text-orange-700">คลิกเพื่ออัปโหลดไฟล์</span>
                                        <p className="text-xs text-gray-400 mt-1">รองรับไฟล์ PDF, JPG, PNG (ไม่เกิน 2MB)</p>
                                    </div>
                                </div>
                            </form>
                        </div>

                        {/* Footer */}
                        <div className="p-4 border-t border-gray-100 bg-gray-50 flex items-center justify-end gap-3 flex-shrink-0 rounded-b-2xl">
                            <button
                                type="button"
                                onClick={() => setIsFormOpen(false)}
                                className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 focus:ring-2 focus:ring-gray-200 transition-all"
                            >
                                ยกเลิก
                            </button>
                            <button
                                type="submit"
                                form="agenda-form"
                                className="px-5 py-2.5 text-sm font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800 focus:ring-4 focus:ring-gray-200 shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
                            >
                                <Save className="w-4 h-4" />
                                บันทึกข้อมูล
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};