import React, { useEffect, useState } from 'react';
import { useApp } from '../../src/context/AppContext';
import { VoteChoice, VoteSession, VoteResult } from '../../types';
import {
    Vote, CheckCircle, XCircle, MinusCircle, Clock,
    BarChart3, ChevronRight, AlertCircle, Loader2
} from 'lucide-react';

type VoteState = { choice: VoteChoice | null; loading: boolean; done: boolean };

const ChoiceButton: React.FC<{
    label: string; value: VoteChoice; selected: boolean; disabled: boolean;
    onClick: () => void; icon: React.ReactNode; color: string;
}> = ({ label, value, selected, disabled, onClick, icon, color }) => (
    <button
        onClick={onClick}
        disabled={disabled}
        className={`flex-1 flex flex-col items-center gap-2 py-4 px-3 rounded-xl border-2 font-semibold text-sm transition-all duration-200
      ${selected ? `${color} shadow-lg scale-105` : 'border-gray-200 text-gray-500 hover:border-gray-300 hover:bg-gray-50'}
      ${disabled && !selected ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
    >
        {icon}
        <span>{label}</span>
    </button>
);

const ResultBar: React.FC<{ label: string; count: number; total: number; color: string; icon: React.ReactNode }> = ({ label, count, total, color, icon }) => {
    const pct = total > 0 ? Math.round((count / total) * 100) : 0;
    return (
        <div className="space-y-1.5">
            <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-1.5 font-medium text-gray-700">{icon}{label}</span>
                <span className="font-bold text-gray-900">{count} <span className="text-gray-400 font-normal text-xs">({pct}%)</span></span>
            </div>
            <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                <div className={`h-full ${color} rounded-full transition-all duration-700`} style={{ width: `${pct}%` }} />
            </div>
        </div>
    );
};

export const UserVoting: React.FC = () => {
    const { user, meetings, agendas, voteSessions, fetchVoteSessions, castVote, fetchMyVote, fetchVoteResults, attendees } = useApp();

    // Meetings user is allowed to join
    const allowedMeetings = meetings.filter(m => {
        if (m.status === 'DRAFT' || m.status === 'CANCELLED') return false;
        if (user?.role === 'ADMIN') return true;
        const isAttendee = attendees.some(a => a.userId === user?.id && a.meetingId === m.id);
        const hasPermission = user?.allowedMeetingIds?.includes(m.id);
        return isAttendee || hasPermission;
    });
    const [selectedMeetingId, setSelectedMeetingId] = useState<string | null>(null);

    useEffect(() => {
        if (allowedMeetings.length > 0 && !selectedMeetingId) {
            setSelectedMeetingId(allowedMeetings[0].id);
        }
    }, [allowedMeetings.length]);

    useEffect(() => {
        if (selectedMeetingId) fetchVoteSessions(selectedMeetingId);
    }, [selectedMeetingId]);

    const currentSessions = voteSessions.filter(s => s.meetingId === selectedMeetingId && (s.status === 'OPEN' || s.status === 'CLOSED'));

    // Per-session vote state
    const [voteStates, setVoteStates] = useState<Record<string, VoteState>>({});
    const [results, setResults] = useState<Record<string, VoteResult>>({});

    // Load existing votes and results when sessions load
    useEffect(() => {
        if (!user) return;
        currentSessions.forEach(async session => {
            if (!voteStates[session.id]) {
                const [myVote, r] = await Promise.all([
                    fetchMyVote(session.id, user.id),
                    fetchVoteResults(session.id),
                ]);
                setVoteStates(prev => ({ ...prev, [session.id]: { choice: myVote?.choice || null, loading: false, done: !!myVote } }));
                setResults(prev => ({ ...prev, [session.id]: r }));
            }
        });
    }, [currentSessions.map(s => s.id).join(',')]);

    const handleVote = async (sessionId: string, choice: VoteChoice) => {
        if (!user) return;
        setVoteStates(prev => ({ ...prev, [sessionId]: { ...prev[sessionId], loading: true } }));
        try {
            await castVote(sessionId, user.id, choice);
            const r = await fetchVoteResults(sessionId);
            setVoteStates(prev => ({ ...prev, [sessionId]: { choice, loading: false, done: true } }));
            setResults(prev => ({ ...prev, [sessionId]: r }));
        } catch (err: any) {
            alert('ลงมติไม่สำเร็จ: ' + err.message);
            setVoteStates(prev => ({ ...prev, [sessionId]: { ...prev[sessionId], loading: false } }));
        }
    };

    const selectedMeeting = meetings.find(m => m.id === selectedMeetingId);

    return (
        <div className="space-y-6 max-w-3xl mx-auto">
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl p-6 text-white shadow-lg">
                <div className="flex items-center gap-3 mb-1">
                    <div className="p-2 bg-white/20 rounded-xl"><Vote size={22} /></div>
                    <h1 className="text-2xl font-bold">ลงมติวาระการประชุม</h1>
                </div>
                <p className="text-purple-200 text-sm">เลือกการประชุมและลงมติในวาระที่เปิดให้ลงมติ</p>
            </div>

            {/* Meeting Selector */}
            {allowedMeetings.length > 1 && (
                <div className="flex gap-2 flex-wrap">
                    {allowedMeetings.map(m => (
                        <button key={m.id} onClick={() => setSelectedMeetingId(m.id)}
                            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all border
                ${selectedMeetingId === m.id ? 'bg-purple-600 text-white border-purple-600 shadow-sm' : 'bg-white text-gray-700 border-gray-200 hover:border-purple-300 hover:text-purple-700'}`}>
                            {m.title}
                        </button>
                    ))}
                </div>
            )}

            {allowedMeetings.length === 0 && (
                <div className="bg-white rounded-2xl border border-gray-200 p-16 text-center">
                    <AlertCircle size={40} className="text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 font-medium">ไม่มีการประชุมที่คุณมีสิทธิ์เข้าร่วม</p>
                </div>
            )}

            {selectedMeeting && currentSessions.length === 0 && (
                <div className="bg-white rounded-2xl border border-gray-200 p-16 text-center">
                    <Vote size={40} className="text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-600 font-medium">ยังไม่มีวาระที่เปิดให้ลงมติ</p>
                    <p className="text-gray-400 text-sm mt-1">กรุณารอให้ผู้ดูแลระบบเปิดการลงมติ</p>
                </div>
            )}

            {/* Session Cards */}
            <div className="space-y-5">
                {currentSessions.map(session => {
                    const agenda = agendas.find(a => a.id === session.agendaId);
                    const state = voteStates[session.id] || { choice: null, loading: false, done: false };
                    const result = results[session.id];
                    const isOpen = session.status === 'OPEN';
                    const isClosed = session.status === 'CLOSED';

                    return (
                        <div key={session.id} className={`bg-white rounded-2xl border shadow-sm overflow-hidden transition-all ${isOpen ? 'border-green-200 shadow-green-50' : 'border-gray-200'}`}>
                            {/* Session Header */}
                            <div className={`px-6 py-4 ${isOpen ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-b border-green-100' : 'bg-gray-50 border-b border-gray-100'}`}>
                                <div className="flex items-start justify-between gap-3">
                                    <div>
                                        {agenda && (
                                            <p className="text-xs font-medium text-gray-400 mb-1">วาระที่ {agenda.order}: {agenda.title}</p>
                                        )}
                                        <h3 className="font-bold text-gray-900 text-base">{session.title}</h3>
                                    </div>
                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold flex-shrink-0
                    ${isOpen ? 'bg-green-100 text-green-700 ring-1 ring-green-200' : 'bg-gray-100 text-gray-600 ring-1 ring-gray-200'}`}>
                                        <span className={`w-1.5 h-1.5 rounded-full ${isOpen ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
                                        {isOpen ? 'เปิดลงมติ' : 'ปิดแล้ว'}
                                    </span>
                                </div>
                                {agenda?.description && (
                                    <p className="text-sm text-gray-500 mt-2 line-clamp-2">{agenda.description}</p>
                                )}
                            </div>

                            <div className="p-6">
                                {/* Voting buttons */}
                                {isOpen && (
                                    <div className="mb-5">
                                        {state.done ? (
                                            <div className="mb-4 flex items-center gap-2 px-4 py-3 bg-blue-50 border border-blue-200 text-blue-700 rounded-xl text-sm font-medium">
                                                <CheckCircle size={16} className="flex-shrink-0" />
                                                คุณลงมติแล้ว:&nbsp;
                                                <strong>
                                                    {state.choice === 'APPROVE' ? '✅ เห็นชอบ' : state.choice === 'REJECT' ? '❌ ไม่เห็นชอบ' : '⚪ งดออกเสียง'}
                                                </strong>
                                            </div>
                                        ) : (
                                            <p className="text-sm font-semibold text-gray-700 mb-3">เลือกการลงมติของคุณ:</p>
                                        )}
                                        <div className="flex gap-3">
                                            <ChoiceButton
                                                label="เห็นชอบ" value="APPROVE"
                                                selected={state.choice === 'APPROVE'} disabled={state.done || state.loading || isClosed}
                                                onClick={() => handleVote(session.id, 'APPROVE')}
                                                icon={state.loading && state.choice === 'APPROVE' ? <Loader2 size={22} className="animate-spin" /> : <CheckCircle size={22} />}
                                                color="border-green-500 bg-green-50 text-green-700"
                                            />
                                            <ChoiceButton
                                                label="ไม่เห็นชอบ" value="REJECT"
                                                selected={state.choice === 'REJECT'} disabled={state.done || state.loading || isClosed}
                                                onClick={() => handleVote(session.id, 'REJECT')}
                                                icon={state.loading && state.choice === 'REJECT' ? <Loader2 size={22} className="animate-spin" /> : <XCircle size={22} />}
                                                color="border-red-500 bg-red-50 text-red-700"
                                            />
                                            <ChoiceButton
                                                label="งดออกเสียง" value="ABSTAIN"
                                                selected={state.choice === 'ABSTAIN'} disabled={state.done || state.loading || isClosed}
                                                onClick={() => handleVote(session.id, 'ABSTAIN')}
                                                icon={state.loading && state.choice === 'ABSTAIN' ? <Loader2 size={22} className="animate-spin" /> : <MinusCircle size={22} />}
                                                color="border-gray-400 bg-gray-50 text-gray-600"
                                            />
                                        </div>
                                    </div>
                                )}

                                {/* Closed state: show my choice */}
                                {isClosed && state.choice && (
                                    <div className="mb-4 flex items-center gap-2 px-4 py-3 bg-gray-50 border border-gray-200 text-gray-700 rounded-xl text-sm font-medium">
                                        <CheckCircle size={16} className="text-gray-400 flex-shrink-0" />
                                        คุณได้ลงมติ:&nbsp;
                                        <strong>{state.choice === 'APPROVE' ? '✅ เห็นชอบ' : state.choice === 'REJECT' ? '❌ ไม่เห็นชอบ' : '⚪ งดออกเสียง'}</strong>
                                    </div>
                                )}

                                {/* Results */}
                                {result && (
                                    <div className={`pt-4 ${(isOpen && state.done) || isClosed ? 'border-t border-gray-100' : ''}`}>
                                        <div className="flex items-center gap-2 mb-3">
                                            <BarChart3 size={14} className="text-gray-400" />
                                            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">ผลคะแนน</span>
                                            <span className="ml-auto text-xs text-gray-400">รวม {result.total} เสียง</span>
                                        </div>
                                        <div className="space-y-2.5">
                                            <ResultBar label="เห็นชอบ" count={result.approve} total={result.total} color="bg-green-500" icon={<CheckCircle size={14} className="text-green-500" />} />
                                            <ResultBar label="ไม่เห็นชอบ" count={result.reject} total={result.total} color="bg-red-500" icon={<XCircle size={14} className="text-red-500" />} />
                                            <ResultBar label="งดออกเสียง" count={result.abstain} total={result.total} color="bg-gray-400" icon={<MinusCircle size={14} className="text-gray-400" />} />
                                        </div>
                                        {isClosed && result.total > 0 && (
                                            <div className="mt-4 px-4 py-3 rounded-xl text-sm font-semibold text-center
                        bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-800 border border-blue-100">
                                                {result.approve > result.reject && result.approve > result.abstain
                                                    ? '✅ มติที่ประชุม: เห็นชอบ'
                                                    : result.reject > result.approve && result.reject > result.abstain
                                                        ? '❌ มติที่ประชุม: ไม่เห็นชอบ'
                                                        : '⚠️ ผลคะแนนเท่ากัน / งดออกเสียงมากที่สุด'}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
