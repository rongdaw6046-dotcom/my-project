import React, { useState, useEffect } from 'react';
import { useApp } from '../../src/context/AppContext';
import { CheckSquare, Plus, Trash2, Edit3, Check, Clock, Circle, AlertCircle } from 'lucide-react';

type ActionStatus = 'PENDING' | 'IN_PROGRESS' | 'DONE';

interface ActionItem {
    id: string;
    title: string;
    description: string;
    meetingTitle: string;
    dueDate: string;
    status: ActionStatus;
    createdAt: string;
}

const STATUS_CONFIG: Record<ActionStatus, { label: string; color: string; icon: any }> = {
    PENDING: { label: 'รอดำเนินการ', color: 'bg-gray-100 text-gray-600', icon: Circle },
    IN_PROGRESS: { label: 'กำลังดำเนินการ', color: 'bg-yellow-100 text-yellow-700', icon: Clock },
    DONE: { label: 'เสร็จแล้ว', color: 'bg-green-100 text-green-700', icon: Check },
};

export const ActionItems: React.FC = () => {
    const { user, meetings, attendees } = useApp();
    const [actions, setActions] = useState<ActionItem[]>([]);
    const [filter, setFilter] = useState<ActionStatus | 'ALL'>('ALL');
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [form, setForm] = useState({ title: '', description: '', meetingTitle: '', dueDate: '', status: 'PENDING' as ActionStatus });

    if (!user) return null;

    const storageKey = `actions_${user.id}`;

    useEffect(() => {
        const stored = localStorage.getItem(storageKey);
        if (stored) setActions(JSON.parse(stored));
    }, [storageKey]);

    const save = (updated: ActionItem[]) => {
        setActions(updated);
        localStorage.setItem(storageKey, JSON.stringify(updated));
    };

    const myMeetings = meetings.filter(m => {
        const isAttendee = attendees.some(a => a.userId === user.id && a.meetingId === m.id);
        return isAttendee || user.allowedMeetingIds?.includes(m.id);
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.title.trim()) return;
        if (editingId) {
            save(actions.map(a => a.id === editingId ? { ...a, ...form } : a));
            setEditingId(null);
        } else {
            const newAction: ActionItem = {
                id: Date.now().toString(),
                ...form,
                createdAt: new Date().toISOString(),
            };
            save([newAction, ...actions]);
        }
        setForm({ title: '', description: '', meetingTitle: '', dueDate: '', status: 'PENDING' });
        setShowForm(false);
    };

    const startEdit = (action: ActionItem) => {
        setForm({ title: action.title, description: action.description, meetingTitle: action.meetingTitle, dueDate: action.dueDate, status: action.status });
        setEditingId(action.id);
        setShowForm(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const deleteAction = (id: string) => {
        if (confirm('ต้องการลบงานนี้หรือไม่?')) save(actions.filter(a => a.id !== id));
    };

    const cycleStatus = (id: string) => {
        const order: ActionStatus[] = ['PENDING', 'IN_PROGRESS', 'DONE'];
        save(actions.map(a => {
            if (a.id !== id) return a;
            const next = order[(order.indexOf(a.status) + 1) % order.length];
            return { ...a, status: next };
        }));
    };

    const filtered = filter === 'ALL' ? actions : actions.filter(a => a.status === filter);
    const counts = { ALL: actions.length, PENDING: actions.filter(a => a.status === 'PENDING').length, IN_PROGRESS: actions.filter(a => a.status === 'IN_PROGRESS').length, DONE: actions.filter(a => a.status === 'DONE').length };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                        <CheckSquare size={24} className="text-purple-500" /> งานที่ได้รับมอบหมาย
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">ติดตามงานหลังการประชุม</p>
                </div>
                <button
                    onClick={() => { setShowForm(!showForm); setEditingId(null); setForm({ title: '', description: '', meetingTitle: '', dueDate: '', status: 'PENDING' }); }}
                    className="flex items-center gap-2 px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-xl shadow-sm transition-colors"
                >
                    <Plus size={16} /> เพิ่มงาน
                </button>
            </div>

            {/* Add/Edit form */}
            {showForm && (
                <div className="bg-white rounded-2xl border border-purple-200 shadow-sm p-5">
                    <h3 className="font-bold text-gray-700 mb-4">{editingId ? 'แก้ไขงาน' : 'เพิ่มงานใหม่'}</h3>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-semibold text-gray-600 mb-1">ชื่องาน *</label>
                                <input
                                    required value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                                    placeholder="เช่น จัดทำรายงาน..."
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-purple-500 focus:border-purple-500"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-600 mb-1">การประชุมที่เกี่ยวข้อง</label>
                                <select
                                    value={form.meetingTitle} onChange={e => setForm(f => ({ ...f, meetingTitle: e.target.value }))}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-purple-500 focus:border-purple-500"
                                >
                                    <option value="">-- เลือกการประชุม --</option>
                                    {myMeetings.map(m => <option key={m.id} value={m.title}>{m.title}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-600 mb-1">กำหนดเสร็จ</label>
                                <input
                                    type="date" value={form.dueDate} onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-purple-500 focus:border-purple-500"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-600 mb-1">สถานะ</label>
                                <select
                                    value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value as ActionStatus }))}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-purple-500 focus:border-purple-500"
                                >
                                    <option value="PENDING">รอดำเนินการ</option>
                                    <option value="IN_PROGRESS">กำลังดำเนินการ</option>
                                    <option value="DONE">เสร็จแล้ว</option>
                                </select>
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-1">รายละเอียด</label>
                            <textarea
                                value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                                rows={2} placeholder="รายละเอียดเพิ่มเติม..."
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-purple-500 focus:border-purple-500 resize-none"
                            />
                        </div>
                        <div className="flex gap-2 justify-end">
                            <button type="button" onClick={() => { setShowForm(false); setEditingId(null); }}
                                className="px-4 py-2 text-sm text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">ยกเลิก</button>
                            <button type="submit"
                                className="px-4 py-2 text-sm text-white bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors font-medium">
                                {editingId ? 'บันทึก' : 'เพิ่มงาน'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Filter tabs */}
            <div className="flex flex-wrap gap-2">
                {(['ALL', 'PENDING', 'IN_PROGRESS', 'DONE'] as const).map(s => (
                    <button key={s}
                        onClick={() => setFilter(s)}
                        className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${filter === s ? 'bg-purple-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-purple-50'}`}
                    >
                        {s === 'ALL' ? 'ทั้งหมด' : STATUS_CONFIG[s].label} ({counts[s]})
                    </button>
                ))}
            </div>

            {/* Action list */}
            <div className="space-y-3">
                {filtered.length > 0 ? filtered.map(action => {
                    const cfg = STATUS_CONFIG[action.status];
                    const Icon = cfg.icon;
                    const isOverdue = action.dueDate && action.status !== 'DONE' && new Date(action.dueDate) < new Date();
                    return (
                        <div key={action.id} className={`bg-white rounded-2xl border shadow-sm p-5 transition-all ${action.status === 'DONE' ? 'opacity-60 border-gray-100' : 'border-gray-200'}`}>
                            <div className="flex items-start gap-4">
                                <button onClick={() => cycleStatus(action.id)}
                                    className={`mt-0.5 w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${cfg.color} hover:opacity-80`}
                                    title="คลิกเพื่อเปลี่ยนสถานะ">
                                    <Icon size={16} />
                                </button>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-2">
                                        <p className={`font-semibold text-gray-900 ${action.status === 'DONE' ? 'line-through text-gray-400' : ''}`}>{action.title}</p>
                                        <div className="flex gap-1 flex-shrink-0">
                                            <button onClick={() => startEdit(action)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><Edit3 size={14} /></button>
                                            <button onClick={() => deleteAction(action.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={14} /></button>
                                        </div>
                                    </div>
                                    {action.description && <p className="text-sm text-gray-500 mt-1">{action.description}</p>}
                                    <div className="flex flex-wrap items-center gap-3 mt-2">
                                        {action.meetingTitle && (
                                            <span className="text-xs px-2 py-0.5 bg-orange-50 text-orange-700 rounded-full">{action.meetingTitle}</span>
                                        )}
                                        {action.dueDate && (
                                            <span className={`text-xs flex items-center gap-1 ${isOverdue ? 'text-red-600 font-semibold' : 'text-gray-400'}`}>
                                                {isOverdue && <AlertCircle size={11} />}
                                                กำหนด: {new Date(action.dueDate).toLocaleDateString('th-TH')}
                                            </span>
                                        )}
                                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${cfg.color}`}>{cfg.label}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                }) : (
                    <div className="bg-white p-12 text-center rounded-2xl border border-gray-200 text-gray-500">
                        <div className="inline-block p-4 rounded-full bg-gray-50 mb-3"><CheckSquare size={32} className="text-gray-300" /></div>
                        <p className="font-medium">{filter === 'ALL' ? 'ยังไม่มีงานที่ได้รับมอบหมาย' : 'ไม่มีงานในหมวดนี้'}</p>
                        <p className="text-sm text-gray-400 mt-1">กด "+ เพิ่มงาน" เพื่อเริ่มต้น</p>
                    </div>
                )}
            </div>
        </div>
    );
};
