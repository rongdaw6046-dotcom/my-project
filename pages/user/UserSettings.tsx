import React, { useState, useEffect } from 'react';
import { useApp } from '../../src/context/AppContext';
import { Settings, User as UserIcon, Lock, Monitor, Save, Eye, EyeOff, Check } from 'lucide-react';

type Tab = 'profile' | 'security' | 'preferences';

export const UserSettings: React.FC = () => {
    const { user, updateUser } = useApp();
    const [activeTab, setActiveTab] = useState<Tab>('profile');
    const [saved, setSaved] = useState(false);

    // Profile form
    const [profile, setProfile] = useState({ name: '', surname: '', position: '', email: '', phone: '' });

    // Security form
    const [passwords, setPasswords] = useState({ current: '', newPass: '', confirm: '' });
    const [showPass, setShowPass] = useState({ current: false, new: false, confirm: false });
    const [passError, setPassError] = useState('');

    // Preferences
    const [lang, setLang] = useState<'th' | 'en'>('th');
    const [darkMode, setDarkMode] = useState(false);

    useEffect(() => {
        if (user) {
            const stored = JSON.parse(localStorage.getItem(`profile_extra_${user.id}`) || '{}');
            setProfile({
                name: user.name || '',
                surname: user.surname || '',
                position: user.position || '',
                email: stored.email || '',
                phone: stored.phone || '',
            });
        }
        const prefs = JSON.parse(localStorage.getItem('user_prefs') || '{}');
        setLang(prefs.lang || 'th');
        setDarkMode(prefs.darkMode || false);
    }, [user]);

    if (!user) return null;

    const showSaved = () => {
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
    };

    const handleSaveProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        // Save name/surname/position to server
        await updateUser(user.id, { name: profile.name, surname: profile.surname, position: profile.position, username: user.username, role: user.role });
        // Save extra fields to localStorage
        localStorage.setItem(`profile_extra_${user.id}`, JSON.stringify({ email: profile.email, phone: profile.phone }));
        showSaved();
    };

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setPassError('');
        if (passwords.current !== user.password) { setPassError('รหัสผ่านปัจจุบันไม่ถูกต้อง'); return; }
        if (passwords.newPass.length < 6) { setPassError('รหัสผ่านใหม่ต้องมีอย่างน้อย 6 ตัวอักษร'); return; }
        if (passwords.newPass !== passwords.confirm) { setPassError('รหัสผ่านใหม่ไม่ตรงกัน'); return; }
        await updateUser(user.id, { password: passwords.newPass, name: user.name, surname: user.surname, position: user.position, username: user.username, role: user.role });
        setPasswords({ current: '', newPass: '', confirm: '' });
        showSaved();
    };

    const handleSavePreferences = () => {
        localStorage.setItem('user_prefs', JSON.stringify({ lang, darkMode }));
        showSaved();
    };

    const tabs: { id: Tab; label: string; icon: any }[] = [
        { id: 'profile', label: 'ข้อมูลส่วนตัว', icon: UserIcon },
        { id: 'security', label: 'ความปลอดภัย', icon: Lock },
        { id: 'preferences', label: 'การแสดงผล', icon: Monitor },
    ];

    const InputField = ({ label, type = 'text', value, onChange, placeholder }: { label: string; type?: string; value: string; onChange: (v: string) => void; placeholder?: string }) => (
        <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">{label}</label>
            <input
                type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
                className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:ring-orange-500 focus:border-orange-500 transition-colors"
            />
        </div>
    );

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                    <Settings size={24} className="text-gray-600" /> ตั้งค่าบัญชีผู้ใช้
                </h2>
                <p className="text-sm text-gray-500 mt-1">จัดการข้อมูลส่วนตัว ความปลอดภัย และการแสดงผล</p>
            </div>

            {/* Saved banner */}
            {saved && (
                <div className="flex items-center gap-2 px-4 py-3 bg-green-50 border border-green-200 text-green-700 rounded-xl text-sm font-medium">
                    <Check size={16} /> บันทึกเรียบร้อยแล้ว
                </div>
            )}

            <div className="flex flex-col lg:flex-row gap-6">
                {/* Sidebar tabs */}
                <div className="lg:w-56 flex-shrink-0">
                    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-2 flex flex-row lg:flex-col gap-1">
                        {tabs.map(tab => {
                            const Icon = tab.icon;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all w-full text-left
                    ${activeTab === tab.id ? 'bg-orange-500 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-50'}`}
                                >
                                    <Icon size={18} />
                                    <span className="hidden sm:block">{tab.label}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 bg-white rounded-2xl border border-gray-200 shadow-sm p-6">

                    {/* Profile Tab */}
                    {activeTab === 'profile' && (
                        <form onSubmit={handleSaveProfile} className="space-y-5">
                            <div className="flex items-center gap-4 pb-5 border-b border-gray-100">
                                <div className="w-16 h-16 rounded-2xl bg-orange-100 flex items-center justify-center text-orange-600 font-bold text-2xl">
                                    {user.name?.charAt(0)?.toUpperCase() || 'U'}
                                </div>
                                <div>
                                    <p className="font-bold text-gray-800 text-lg">{user.name} {user.surname}</p>
                                    <p className="text-sm text-gray-500">{user.position}</p>
                                    <p className="text-xs text-gray-400">@{user.username}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <InputField label="ชื่อ" value={profile.name} onChange={v => setProfile(p => ({ ...p, name: v }))} placeholder="ชื่อ" />
                                <InputField label="นามสกุล" value={profile.surname} onChange={v => setProfile(p => ({ ...p, surname: v }))} placeholder="นามสกุล" />
                            </div>
                            <InputField label="ตำแหน่ง/แผนก" value={profile.position} onChange={v => setProfile(p => ({ ...p, position: v }))} placeholder="เช่น นักวิชาการ, หัวหน้าฝ่าย" />
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <InputField label="อีเมล" type="email" value={profile.email} onChange={v => setProfile(p => ({ ...p, email: v }))} placeholder="example@email.com" />
                                <InputField label="เบอร์โทรศัพท์" value={profile.phone} onChange={v => setProfile(p => ({ ...p, phone: v }))} placeholder="0xx-xxx-xxxx" />
                            </div>
                            <div className="pt-2">
                                <button type="submit" className="flex items-center gap-2 px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold rounded-xl shadow-sm transition-colors">
                                    <Save size={16} /> บันทึกข้อมูล
                                </button>
                            </div>
                        </form>
                    )}

                    {/* Security Tab */}
                    {activeTab === 'security' && (
                        <form onSubmit={handleChangePassword} className="space-y-5">
                            <h3 className="font-bold text-gray-700">เปลี่ยนรหัสผ่าน</h3>
                            {passError && (
                                <div className="px-4 py-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">{passError}</div>
                            )}
                            {(['current', 'new', 'confirm'] as const).map(k => {
                                const labels = { current: 'รหัสผ่านปัจจุบัน', new: 'รหัสผ่านใหม่ (อย่างน้อย 6 ตัว)', confirm: 'ยืนยันรหัสผ่านใหม่' };
                                const vals = { current: passwords.current, new: passwords.newPass, confirm: passwords.confirm };
                                const onChanges = {
                                    current: (v: string) => setPasswords(p => ({ ...p, current: v })),
                                    new: (v: string) => setPasswords(p => ({ ...p, newPass: v })),
                                    confirm: (v: string) => setPasswords(p => ({ ...p, confirm: v })),
                                };
                                const shown = { current: showPass.current, new: showPass.new, confirm: showPass.confirm };
                                const toggles = {
                                    current: () => setShowPass(s => ({ ...s, current: !s.current })),
                                    new: () => setShowPass(s => ({ ...s, new: !s.new })),
                                    confirm: () => setShowPass(s => ({ ...s, confirm: !s.confirm })),
                                };
                                return (
                                    <div key={k}>
                                        <label className="block text-xs font-semibold text-gray-600 mb-1.5">{labels[k]}</label>
                                        <div className="relative">
                                            <input
                                                type={shown[k] ? 'text' : 'password'}
                                                value={vals[k]}
                                                onChange={e => onChanges[k](e.target.value)}
                                                required
                                                className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:ring-orange-500 focus:border-orange-500 pr-10"
                                            />
                                            <button type="button" onClick={toggles[k]} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                                                {shown[k] ? <EyeOff size={16} /> : <Eye size={16} />}
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                            <button type="submit" className="flex items-center gap-2 px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold rounded-xl shadow-sm transition-colors">
                                <Save size={16} /> เปลี่ยนรหัสผ่าน
                            </button>
                        </form>
                    )}

                    {/* Preferences Tab */}
                    {activeTab === 'preferences' && (
                        <div className="space-y-6">
                            <h3 className="font-bold text-gray-700">การแสดงผล</h3>

                            {/* Language */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-3">ภาษาของระบบ</label>
                                <div className="flex gap-3">
                                    {[{ val: 'th', label: '🇹🇭 ภาษาไทย' }, { val: 'en', label: '🇬🇧 English' }].map(l => (
                                        <button key={l.val}
                                            onClick={() => setLang(l.val as 'th' | 'en')}
                                            className={`px-5 py-3 rounded-xl border text-sm font-medium transition-all ${lang === l.val ? 'bg-orange-500 text-white border-orange-500 shadow-sm' : 'bg-white text-gray-600 border-gray-200 hover:border-orange-300'}`}
                                        >
                                            {l.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Dark mode */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-3">โหมดหน้าจอ</label>
                                <div className="flex gap-3">
                                    {[{ val: false, label: '☀️ Light Mode' }, { val: true, label: '🌙 Dark Mode' }].map(m => (
                                        <button key={String(m.val)}
                                            onClick={() => setDarkMode(m.val)}
                                            className={`px-5 py-3 rounded-xl border text-sm font-medium transition-all ${darkMode === m.val ? 'bg-orange-500 text-white border-orange-500 shadow-sm' : 'bg-white text-gray-600 border-gray-200 hover:border-orange-300'}`}
                                        >
                                            {m.label}
                                        </button>
                                    ))}
                                </div>
                                {darkMode && <p className="text-xs text-gray-400 mt-2">* Dark Mode จะพร้อมใช้งานในอัปเดตถัดไป</p>}
                            </div>

                            <button onClick={handleSavePreferences} className="flex items-center gap-2 px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold rounded-xl shadow-sm transition-colors">
                                <Save size={16} /> บันทึกการตั้งค่า
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
