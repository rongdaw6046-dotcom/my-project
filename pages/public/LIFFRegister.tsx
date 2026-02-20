import React, { useEffect, useState } from 'react';
import liff from '@line/liff';
import { useSearchParams } from 'react-router-dom';
import { User, MapPin, Calendar, CheckCircle, AlertCircle } from 'lucide-react';

export const LIFFRegister: React.FC = () => {
    const [searchParams] = useSearchParams();

    // Detection logic: Check both standard search and hash search
    const getParam = (key: string) => {
        return searchParams.get(key) || new URLSearchParams(window.location.search).get(key);
    };

    const meetingId = getParam('meetingId');
    const liffId = getParam('liffId') || '2009162011-czxzSLew'; // Fallback to provided ID

    const [profile, setProfile] = useState<any>(null);
    const [name, setName] = useState('');
    const [position, setPosition] = useState('');
    const [status, setStatus] = useState<'LOADING' | 'READY' | 'SUCCESS' | 'ERROR'>('LOADING');
    const [error, setError] = useState('');

    useEffect(() => {
        const initLiff = async () => {
            if (!liffId) {
                setError('Missing LIFF ID in URL');
                setStatus('ERROR');
                return;
            }

            try {
                await liff.init({ liffId });
                if (!liff.isLoggedIn()) {
                    liff.login();
                    return;
                }

                const userProfile = await liff.getProfile();
                setProfile(userProfile);
                setName(userProfile.displayName); // Pre-fill name
                setStatus('READY');
            } catch (err: any) {
                setError('LIFF Init Failed: ' + err.message);
                setStatus('ERROR');
            }
        };

        initLiff();
    }, [liffId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!meetingId) {
            alert("ไม่พบรหัสการประชุม (Missing Meeting ID)");
            return;
        }
        if (!profile) {
            alert("ไม่พบข้อมูลผู้ใช้ LINE (Missing Profile)");
            return;
        }

        // Show loading state while submitting
        // setStatus('LOADING'); // Optional: can just disable button

        try {
            const response = await fetch('/api/attendees/liff', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    meetingId,
                    lineUserId: profile.userId,
                    name,
                    position,
                    pictureUrl: profile.pictureUrl
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to register');
            }

            setStatus('SUCCESS');
            // Close window after 3 seconds
            setTimeout(() => {
                if (liff.isInClient()) liff.closeWindow();
            }, 3000);

        } catch (err: any) {
            console.error('Submit Error:', err);
            alert(`เกิดข้อผิดพลาด: ${err.message}`);
            // Do not set status to ERROR, stay on form to retry
        }
    };

    if (status === 'LOADING') return (
        <div className="flex flex-col items-center justify-center min-h-screen p-10 text-center bg-gray-50">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-orange-600 mb-4"></div>
            <p>กำลังโหลดข้อมูล LINE...</p>
        </div>
    );

    if (status === 'ERROR') return (
        <div className="flex flex-col items-center justify-center min-h-screen p-10 text-center bg-red-50 text-red-600">
            <AlertCircle size={48} className="mb-4" />
            <h2 className="text-xl font-bold mb-2">เกิดข้อผิดพลาด</h2>
            <p className="bg-white p-4 rounded border border-red-200 text-sm font-mono break-all">{error}</p>
            <div className="mt-6 text-xs text-gray-500 text-left w-full max-w-md">
                <p><strong>Debug Info:</strong></p>
                <p>LIFF ID: {liffId}</p>
                <p>Meeting ID: {meetingId || 'null'}</p>
            </div>
            <button onClick={() => window.location.reload()} className="mt-8 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">ลองใหม่อีกครั้ง</button>
        </div>
    );

    if (status === 'SUCCESS') return (
        <div className="flex flex-col items-center justify-center min-h-screen p-10 text-center bg-green-50">
            <CheckCircle size={64} className="text-green-500 mb-4" />
            <h2 className="text-2xl font-bold text-green-700">ลงทะเบียนสำเร็จ!</h2>
            <p className="text-gray-600 mt-2">ขอบคุณที่เข้าร่วมการประชุม</p>
            <p className="text-xs text-gray-400 mt-8">หน้าต่างจะปิดอัตโนมัติ...</p>
            <button onClick={() => liff.closeWindow()} className="mt-4 px-4 py-2 border border-green-600 text-green-600 rounded hover:bg-green-50">ปิดหน้าต่าง</button>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 p-4">
            <div className="bg-white rounded-xl shadow-sm overflow-hidden max-w-md mx-auto">
                <div className="bg-orange-600 p-4 text-white text-center">
                    <h1 className="font-bold text-lg">ลงทะเบียนเข้าประชุม</h1>
                </div>

                <div className="p-6">
                    <div className="flex justify-center mb-6">
                        {profile?.pictureUrl ? (
                            <img src={profile.pictureUrl} alt="Profile" className="w-20 h-20 rounded-full border-4 border-orange-100" />
                        ) : (
                            <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center">
                                <User size={32} className="text-gray-400" />
                            </div>
                        )}
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">ชื่อ - นามสกุล</label>
                            <input
                                type="text"
                                required
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500"
                                value={name}
                                onChange={e => setName(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">ตำแหน่ง / หน่วยงาน</label>
                            <input
                                type="text"
                                required
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500"
                                value={position}
                                onChange={e => setPosition(e.target.value)}
                                placeholder="เช่น นักวิชาการคอมพิวเตอร์"
                            />
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-orange-600 text-white font-bold py-3 rounded-lg hover:bg-orange-700 transition-colors shadow-md mt-6"
                        >
                            ยืนยันการเข้าร่วม
                        </button>
                    </form>

                    <div className="mt-4 text-[10px] text-gray-300 text-center font-mono">
                        Meeting: {meetingId} | LIFF: {liffId}
                    </div>
                </div>
            </div>
            <p className="text-center text-xs text-gray-400 mt-8">Meeting Manager</p>
        </div>
    );
};
