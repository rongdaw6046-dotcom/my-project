import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../../src/context/AppContext';
import { AdminMeetingTabs } from '../../components/AdminMeetingTabs';
import { VoteSession, VoteResult, VoteSessionStatus } from '../../types';
import {
    ArrowLeft, Plus, Trash2, Edit, Vote, BarChart3,
    PlayCircle, StopCircle, Clock, CheckCircle, XCircle,
    MinusCircle, Download, AlertTriangle, X, Save, ChevronRight
} from 'lucide-react';

const StatusBadge: React.FC<{ status: VoteSessionStatus }> = ({ status }) => {
    const map = {
        PENDING: { label: 'รอเปิด', bg: 'bg-yellow-50', text: 'text-yellow-700', ring: 'ring-yellow-200' },
        OPEN: { label: 'เปิดลงมติ', bg: 'bg-green-50', text: 'text-green-700', ring: 'ring-green-200' },
        CLOSED: { label: 'ปิดแล้ว', bg: 'bg-gray-100', text: 'text-gray-600', ring: 'ring-gray-200' },
    };
    const s = map[status];
    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ring-1 ${s.bg} ${s.text} ${s.ring}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${status === 'OPEN' ? 'bg-green-500 animate-pulse' : status === 'PENDING' ? 'bg-yellow-400' : 'bg-gray-400'}`} />
            {s.label}
        </span>
    );
};

const ResultBar: React.FC<{ label: string; count: number; total: number; color: string; icon: React.ReactNode }> = ({ label, count, total, color, icon }) => {
    const pct = total > 0 ? Math.round((count / total) * 100) : 0;
    return (
        <div className="space-y-1">
            <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-1.5 font-medium text-gray-700">{icon}{label}</span>
                <span className="font-bold text-gray-800">{count} <span className="text-gray-400 font-normal">({pct}%)</span></span>
            </div>
            <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                <div className={`h-full ${color} rounded-full transition-all duration-700`} style={{ width: `${pct}%` }} />
            </div>
        </div>
    );
};

export const ManageVoting: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const {
        meetings, agendas, user, voteSessions, attendees,
        fetchVoteSessions, fetchAttendees, sendNotification,
        addVoteSession, updateVoteSession, deleteVoteSession,
        setVoteSessionStatus, fetchVoteResults
    } = useApp();

    const meeting = meetings.find(m => m.id === id);
    const meetingAgendas = agendas.filter(a => a.meetingId === id).sort((a, b) => a.order - b.order);
    const meetingSessions = voteSessions.filter(s => s.meetingId === id);

    const [results, setResults] = useState<Record<string, VoteResult>>({});
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingSession, setEditingSession] = useState<Partial<VoteSession> | null>(null);
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

    useEffect(() => {
        if (id) {
            fetchVoteSessions(id);
            fetchAttendees(id);
        }
    }, [id]);

    // Poll results for OPEN sessions every 5 seconds
    useEffect(() => {
        if (pollingRef.current) clearInterval(pollingRef.current);
        const openSessions = meetingSessions.filter(s => s.status === 'OPEN');
        if (openSessions.length > 0) {
            const loadResults = async () => {
                for (const s of openSessions) {
                    try {
                        const r = await fetchVoteResults(s.id);
                        setResults(prev => ({ ...prev, [s.id]: r }));
                    } catch { }
                }
            };
            loadResults();
            pollingRef.current = setInterval(loadResults, 5000);
        }
        return () => { if (pollingRef.current) clearInterval(pollingRef.current); };
    }, [meetingSessions.map(s => s.id + s.status).join(',')]);

    // Load results for CLOSED sessions once
    useEffect(() => {
        (async () => {
            for (const s of meetingSessions.filter(s => s.status === 'CLOSED' && !results[s.id])) {
                try {
                    const r = await fetchVoteResults(s.id);
                    setResults(prev => ({ ...prev, [s.id]: r }));
                } catch { }
            }
        })();
    }, [meetingSessions.length]);


    if (!meeting) return <div>ไม่พบข้อมูลการประชุม</div>;

    const handleCreate = () => {
        setEditingSession({ meetingId: id, agendaId: meetingAgendas[0]?.id || '', title: '', status: 'PENDING', createdBy: user?.id });
        setIsFormOpen(true);
    };

    const handleEdit = (session: VoteSession) => {
        setEditingSession({ ...session });
        setIsFormOpen(true);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingSession) return;
        setIsSaving(true);
        try {
            if ('id' in editingSession && editingSession.id) {
                await updateVoteSession(editingSession.id, editingSession);
            } else {
                await addVoteSession(editingSession as Omit<VoteSession, 'id' | 'createdAt'>);
            }
            setIsFormOpen(false);
            setEditingSession(null);
        } catch (err: any) {
            alert('บันทึกไม่สำเร็จ: ' + err.message);
        } finally {
            setIsSaving(false);
        }
    };

    const handleStatusChange = async (sessionId: string, status: VoteSessionStatus) => {
        try {
            await setVoteSessionStatus(sessionId, status);

            if (status === 'OPEN') {
                const session = meetingSessions.find(s => s.id === sessionId);
                if (session) {
                    const validAttendees = attendees.filter(a => a.meetingId === id && a.userId && a.status !== 'DECLINED');

                    Promise.all(validAttendees.map(a =>
                        sendNotification({
                            userId: a.userId!,
                            type: 'MEETING',
                            title: 'มีวาระการประชุมเปิดให้ลงมติ',
                            message: `วาระ "${session.title}" ถูกเปิดให้ลงมติแล้ว กรุณาตรวจสอบและลงคะแนน`,
                            link: '/user/voting'
                        })
                    )).catch(err => console.error('Failed to send voting notifications:', err));
                }
            }

            if (status !== 'PENDING') {
                const r = await fetchVoteResults(sessionId);
                setResults(prev => ({ ...prev, [sessionId]: r }));
            }
        } catch (err: any) { alert('เกิดข้อผิดพลาด: ' + err.message); }
    };

    const handleDelete = async () => {
        if (!deleteId) return;
        await deleteVoteSession(deleteId);
        setDeleteId(null);
    };

    const downloadCSV = (session: VoteSession) => {
        const r = results[session.id] || { approve: 0, reject: 0, abstain: 0, total: 0 };
        const agenda = meetingAgendas.find(a => a.id === session.agendaId);
        const lines = [
            ['รายงานผลการลงมติ'],
            ['การประชุม', meeting.title],
            ['วาระ', agenda?.title || session.agendaId],
            ['หัวข้อลงมติ', session.title],
            ['สถานะ', session.status],
            [],
            ['ผลคะแนน', 'จำนวน', 'ร้อยละ'],
            ['เห็นชอบ', r.approve, r.total > 0 ? Math.round(r.approve / r.total * 100) + '%' : '0%'],
            ['ไม่เห็นชอบ', r.reject, r.total > 0 ? Math.round(r.reject / r.total * 100) + '%' : '0%'],
            ['งดออกเสียง', r.abstain, r.total > 0 ? Math.round(r.abstain / r.total * 100) + '%' : '0%'],
            ['รวมทั้งหมด', r.total, '100%'],
        ];
        const csv = lines.map(row => row.map(c => `"${c}"`).join(',')).join('\n');
        const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = `vote_result_${session.id.slice(0, 8)}.csv`; a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="pb-10">
            <div className="flex flex-col lg:flex-row gap-8">
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
                            <div className="p-2 bg-purple-100 rounded-lg"><Vote className="text-purple-600 w-5 h-5" /></div>
                            ระบบลงมติ <span className="text-gray-400 text-sm font-normal">({meetingSessions.length})</span>
                        </h3>
                        <button onClick={handleCreate} className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg shadow-sm hover:bg-purple-700 transition-all font-medium text-sm">
                            <Plus size={18} className="mr-2" /> สร้าง Session ลงมติ
                        </button>
                    </div>

                    {meetingSessions.length === 0 ? (
                        <div className="bg-white border-2 border-dashed border-gray-200 rounded-xl p-16 text-center">
                            <div className="w-16 h-16 bg-purple-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Vote size={32} className="text-purple-300" />
                            </div>
                            <h3 className="text-gray-900 font-medium text-lg">ยังไม่มี Session การลงมติ</h3>
                            <p className="text-gray-500 text-sm mt-2">กดปุ่ม "สร้าง Session ลงมติ" เพื่อเริ่มต้น</p>
                        </div>
                    ) : (
                        <div className="space-y-5">
                            {meetingSessions.map(session => {
                                const agenda = meetingAgendas.find(a => a.id === session.agendaId);
                                const r = results[session.id];
                                return (
                                    <div key={session.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all">
                                        {/* Header */}
                                        <div className="p-5 flex flex-col sm:flex-row sm:items-start gap-4">
                                            <div className="flex-1 min-w-0">
                                                <div className="flex flex-wrap items-center gap-2 mb-2">
                                                    <StatusBadge status={session.status} />
                                                    {agenda && (
                                                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-md">
                                                            วาระที่ {agenda.order}: {agenda.title}
                                                        </span>
                                                    )}
                                                </div>
                                                <h4 className="text-base font-bold text-gray-900">{session.title}</h4>
                                                {session.opensAt && (
                                                    <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                                                        <Clock size={12} />
                                                        เปิด: {new Date(session.opensAt).toLocaleString('th-TH')}
                                                        {session.closesAt && ` · ปิด: ${new Date(session.closesAt).toLocaleString('th-TH')}`}
                                                    </p>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-2 flex-shrink-0">
                                                {session.status === 'PENDING' && (
                                                    <button onClick={() => handleStatusChange(session.id, 'OPEN')}
                                                        className="flex items-center gap-1.5 px-3 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors shadow-sm">
                                                        <PlayCircle size={16} /> เปิดลงมติ
                                                    </button>
                                                )}
                                                {session.status === 'OPEN' && (
                                                    <button onClick={() => handleStatusChange(session.id, 'CLOSED')}
                                                        className="flex items-center gap-1.5 px-3 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors shadow-sm">
                                                        <StopCircle size={16} /> ปิดลงมติ
                                                    </button>
                                                )}
                                                {session.status === 'CLOSED' && (
                                                    <button onClick={() => downloadCSV(session)}
                                                        className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm">
                                                        <Download size={16} /> ดาวน์โหลด
                                                    </button>
                                                )}
                                                {session.status === 'PENDING' && (
                                                    <button onClick={() => handleEdit(session)} className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors" title="แก้ไข">
                                                        <Edit size={18} />
                                                    </button>
                                                )}
                                                <button onClick={() => setDeleteId(session.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="ลบ">
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </div>

                                        {/* Results (shown when OPEN or CLOSED) */}
                                        {(session.status === 'OPEN' || session.status === 'CLOSED') && (
                                            <div className="px-5 pb-5 pt-2 border-t border-gray-100">
                                                <div className="flex items-center gap-2 mb-3">
                                                    <BarChart3 size={14} className="text-gray-400" />
                                                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                                        ผลคะแนน {session.status === 'OPEN' && <span className="text-green-500 ml-1">● Live</span>}
                                                    </span>
                                                    {r && <span className="ml-auto text-xs text-gray-400">รวม {r.total} เสียง</span>}
                                                </div>
                                                {r ? (
                                                    <div className="space-y-3">
                                                        <ResultBar label="เห็นชอบ" count={r.approve} total={r.total} color="bg-green-500" icon={<CheckCircle size={14} className="text-green-500" />} />
                                                        <ResultBar label="ไม่เห็นชอบ" count={r.reject} total={r.total} color="bg-red-500" icon={<XCircle size={14} className="text-red-500" />} />
                                                        <ResultBar label="งดออกเสียง" count={r.abstain} total={r.total} color="bg-gray-400" icon={<MinusCircle size={14} className="text-gray-400" />} />
                                                    </div>
                                                ) : (
                                                    <div className="text-sm text-gray-400 text-center py-3">กำลังโหลดผล...</div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* Form Modal */}
            {isFormOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                            <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                                <div className="p-1.5 bg-purple-100 rounded text-purple-600"><Vote className="w-5 h-5" /></div>
                                {editingSession?.id ? 'แก้ไข Session ลงมติ' : 'สร้าง Session ลงมติใหม่'}
                            </h3>
                            <button onClick={() => setIsFormOpen(false)} className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-200 transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-6 overflow-y-auto">
                            <form id="vote-session-form" onSubmit={handleSave} className="space-y-5">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">วาระที่ต้องการลงมติ <span className="text-red-500">*</span></label>
                                    <select required className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all text-gray-800 bg-white"
                                        value={editingSession?.agendaId || ''}
                                        onChange={e => setEditingSession(prev => prev ? { ...prev, agendaId: e.target.value } : null)}>
                                        <option value="">-- เลือกวาระ --</option>
                                        {meetingAgendas.map(a => <option key={a.id} value={a.id}>วาระที่ {a.order}: {a.title}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">หัวข้อการลงมติ <span className="text-red-500">*</span></label>
                                    <input type="text" required placeholder="เช่น มติที่ประชุมเรื่อง..."
                                        className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all text-gray-800"
                                        value={editingSession?.title || ''}
                                        onChange={e => setEditingSession(prev => prev ? { ...prev, title: e.target.value } : null)} />
                                </div>
                            </form>
                        </div>
                        <div className="p-4 border-t border-gray-100 bg-gray-50 flex items-center justify-end gap-3">
                            <button type="button" onClick={() => setIsFormOpen(false)}
                                className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 transition-all">
                                ยกเลิก
                            </button>
                            <button type="submit" form="vote-session-form" disabled={isSaving}
                                className="px-5 py-2.5 text-sm font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700 shadow-sm transition-all flex items-center gap-2 disabled:opacity-60">
                                <Save className="w-4 h-4" />{isSaving ? 'กำลังบันทึก...' : 'บันทึก'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirm Modal */}
            {deleteId && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center">
                        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <AlertTriangle className="w-8 h-8 text-red-500" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">ยืนยันการลบ?</h3>
                        <p className="text-gray-500 text-sm mb-6">คุณแน่ใจหรือไม่ที่จะลบ Session นี้?<br />ข้อมูลการลงมติทั้งหมดจะหายไปด้วย</p>
                        <div className="flex gap-3">
                            <button onClick={() => setDeleteId(null)} className="flex-1 px-4 py-2.5 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors">ยกเลิก</button>
                            <button onClick={handleDelete} className="flex-1 px-4 py-2.5 rounded-lg bg-red-600 text-white font-medium hover:bg-red-700 shadow transition-all">ลบ</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
