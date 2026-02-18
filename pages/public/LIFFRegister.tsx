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
    const liffId = getParam('liffId') || '2009162011-O1Z3UDRu'; // Fallback to provided ID

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
        if (!meetingId || !profile) return;

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

            if (!response.ok) throw new Error('Failed to register');

            setStatus('SUCCESS');
            // Close window after 3 seconds
            setTimeout(() => {
                if (liff.isInClient()) liff.closeWindow();
            }, 3000);

        } catch (err: any) {
            setError(err.message);
        }
    };

    if (status === 'LOADING') return <div className="p-10 text-center">Loading LINE...</div>;
    if (status === 'ERROR') return <div className="p-10 text-center text-red-500"><AlertCircle className="mx-auto mb-2" />{error}</div>;
    if (status === 'SUCCESS') return (
        <div className="p-10 text-center flex flex-col items-center justify-center h-screen bg-green-50">
            <CheckCircle size={64} className="text-green-500 mb-4" />
            <h2 className="text-2xl font-bold text-green-700">ลงทะเบียนสำเร็จ!</h2>
            <p className="text-gray-600 mt-2">ขอบคุณที่เข้าร่วมการประชุม</p>
            <p className="text-xs text-gray-400 mt-8">หน้าต่างจะปิดอัตโนมัติ...</p>
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
                </div>
            </div>
            <p className="text-center text-xs text-gray-400 mt-8">KKU Meeting Manager</p>
        </div>
    );
};
