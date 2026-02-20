
import React, { useState, useEffect } from 'react';
import { useApp } from '../../src/context/AppContext';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Bell, Send, Clock, User, CheckCircle } from 'lucide-react';

export const ManageNotifications: React.FC = () => {
    const navigate = useNavigate();
    const { users, notifications, fetchNotifications, sendNotification } = useApp();

    const [title, setTitle] = useState('');
    const [message, setMessage] = useState('');
    const [targetUserId, setTargetUserId] = useState(''); // Empty = Broadcast

    useEffect(() => {
        fetchNotifications();
    }, []);

    const handleSend = (e: React.FormEvent) => {
        e.preventDefault();
        if (!title || !message) return alert('กรุณาระบุหัวข้อและข้อความ');

        sendNotification({
            userId: targetUserId || undefined,
            title,
            message,
            type: 'System'
        });

        setTitle('');
        setMessage('');
        alert('ส่งการแจ้งเตือนเรียบร้อยแล้ว');
    };

    return (
        <div className="pb-10">
            <div className="flex flex-col lg:flex-row gap-8">
                {/* Content */}
                <div className="flex-1 w-full min-w-0 flex flex-col xl:flex-row gap-6">

                    {/* Send Form */}
                    <div className="w-full xl:w-96 flex-shrink-0">
                        <div className="sticky top-6">
                            <button onClick={() => navigate('/admin/dashboard')} className="mb-4 inline-flex items-center text-gray-500 hover:text-orange-600 transition-colors">
                                <ArrowLeft size={20} className="mr-1" /> กลับหน้าหลัก
                            </button>

                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                                <div className="bg-gray-900 px-5 py-4 text-white">
                                    <h3 className="font-bold flex items-center gap-2"><Bell size={18} /> ส่งการแจ้งเตือน</h3>
                                </div>
                                <div className="p-5">
                                    <form onSubmit={handleSend} className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">ส่งถึง</label>
                                            <select
                                                className="block w-full border border-gray-300 rounded-lg p-2.5 focus:ring-orange-500 focus:border-orange-500 bg-white"
                                                value={targetUserId}
                                                onChange={e => setTargetUserId(e.target.value)}
                                            >
                                                <option value="">ทุกคน (Broadcast)</option>
                                                {users.map(u => (
                                                    <option key={u.id} value={u.id}>{u.name} ({u.position})</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">หัวข้อ</label>
                                            <input
                                                type="text"
                                                className="block w-full border border-gray-300 rounded-lg p-2.5 focus:ring-orange-500 focus:border-orange-500"
                                                value={title}
                                                onChange={e => setTitle(e.target.value)}
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">ข้อความ</label>
                                            <textarea
                                                className="block w-full border border-gray-300 rounded-lg p-2.5 focus:ring-orange-500 focus:border-orange-500 h-32"
                                                value={message}
                                                onChange={e => setMessage(e.target.value)}
                                                required
                                            ></textarea>
                                        </div>
                                        <button type="submit" className="w-full bg-orange-600 text-white rounded-lg py-2.5 font-medium hover:bg-orange-700 transition-colors flex justify-center items-center gap-2">
                                            <Send size={18} /> ส่งข้อความ
                                        </button>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* History List */}
                    <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden min-h-[500px] flex flex-col mt-12 xl:mt-0">
                        <div className="p-5 border-b border-gray-200 bg-gray-50/50">
                            <h3 className="font-bold text-gray-800 text-lg flex items-center gap-2">
                                <Clock size={20} className="text-orange-600" /> ประวัติการแจ้งเตือน
                            </h3>
                        </div>
                        <div className="overflow-x-auto flex-1">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50 text-gray-500">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">หัวข้อ</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">ข้อความ</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">ส่งถึง</th>
                                        <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider">เวลา</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {notifications.map(n => (
                                        <tr key={n.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 text-sm font-medium text-gray-900">{n.title}</td>
                                            <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">{n.message}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {n.userId ? (
                                                    <span className="flex items-center gap-1"><User size={14} /> {users.find(u => u.id === n.userId)?.name || 'Unknown User'}</span>
                                                ) : (
                                                    <span className="flex items-center gap-1 text-orange-600"><CheckCircle size={14} /> ทุกคน</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-500">
                                                {new Date(n.createdAt).toLocaleString('th-TH')}
                                            </td>
                                        </tr>
                                    ))}
                                    {notifications.length === 0 && (
                                        <tr>
                                            <td colSpan={4} className="text-center py-12 text-gray-400">ยังไม่มีประวัติการแจ้งเตือน</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};
