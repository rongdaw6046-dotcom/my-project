import React, { useState, useEffect } from 'react';
import { useApp } from '../../src/context/AppContext';
import { translations } from '../../src/translations';
import { Settings, User as UserIcon, Lock, Monitor, Save, Eye, EyeOff, Check, Sun, Moon, Globe, PlusCircle } from 'lucide-react';

type Tab = 'profile' | 'security' | 'preferences';

export const UserSettings: React.FC = () => {
    const { user, updateUser, lang, darkMode, setLang, setDarkMode } = useApp();
    const t = translations[lang];
    const [activeTab, setActiveTab] = useState<Tab>('profile');
    const [saved, setSaved] = useState(false);

    // Profile form
    const [profile, setProfile] = useState({ name: '', surname: '', position: '', email: '', phone: '', profileImage: '' });

    // Security form
    const [passwords, setPasswords] = useState({ current: '', newPass: '', confirm: '' });
    const [showPass, setShowPass] = useState({ current: false, new: false, confirm: false });
    const [passError, setPassError] = useState('');

    useEffect(() => {
        if (user) {
            const stored = JSON.parse(localStorage.getItem(`profile_extra_${user.id}`) || '{}');
            setProfile({
                name: user.name || '',
                surname: user.surname || '',
                position: user.position || '',
                email: stored.email || '',
                phone: stored.phone || '',
                profileImage: user.profileImage || '',
            });
        }
    }, [user]);

    if (!user) return null;

    const showSaved = () => {
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
    };

    const handleSaveProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        await updateUser(user.id, {
            name: profile.name,
            surname: profile.surname,
            position: profile.position,
            username: user.username,
            role: user.role,
            profileImage: profile.profileImage
        });
        localStorage.setItem(`profile_extra_${user.id}`, JSON.stringify({ email: profile.email, phone: profile.phone }));
        showSaved();
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) {
                alert(lang === 'th' ? 'ขนาดไฟล์ห้ามเกิน 2MB' : 'File size must be less than 2MB');
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => {
                setProfile(p => ({ ...p, profileImage: reader.result as string }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setPassError('');
        if (passwords.current !== user.password) { setPassError(lang === 'th' ? 'รหัสผ่านปัจจุบันไม่ถูกต้อง' : 'Incorrect current password'); return; }
        if (passwords.newPass.length < 6) { setPassError(lang === 'th' ? 'รหัสผ่านใหม่ต้องมีอย่างน้อย 6 ตัวอักษร' : 'New password must be at least 6 characters'); return; }
        if (passwords.newPass !== passwords.confirm) { setPassError(lang === 'th' ? 'รหัสผ่านใหม่ไม่ตรงกัน' : 'New passwords do not match'); return; }
        await updateUser(user.id, { password: passwords.newPass, name: user.name, surname: user.surname, position: user.position, username: user.username, role: user.role });
        setPasswords({ current: '', newPass: '', confirm: '' });
        showSaved();
    };

    const handleSavePreferences = () => {
        showSaved();
    };

    const tabs: { id: Tab; label: string; icon: any }[] = [
        { id: 'profile', label: t.profileTab, icon: UserIcon },
        { id: 'security', label: t.securityTab, icon: Lock },
        { id: 'preferences', label: t.preferencesTab, icon: Monitor },
    ];

    const InputField = ({ label, type = 'text', value, onChange, placeholder }: { label: string; type?: string; value: string; onChange: (v: string) => void; placeholder?: string }) => (
        <div>
            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">{label}</label>
            <input
                type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
                className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-xl px-4 py-2.5 text-sm focus:ring-orange-500 focus:border-orange-500 transition-colors"
            />
        </div>
    );

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                    <Settings size={24} className="text-gray-600 dark:text-gray-400" /> {t.settingsTitle}
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{t.settingsSub}</p>
            </div>

            {/* Saved banner */}
            {saved && (
                <div className="flex items-center gap-2 px-4 py-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 rounded-xl text-sm font-medium">
                    <Check size={16} /> {t.saveSuccess}
                </div>
            )}

            <div className="flex flex-col lg:flex-row gap-6">
                {/* Sidebar tabs */}
                <div className="lg:w-56 flex-shrink-0">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-2 flex flex-row lg:flex-col gap-1">
                        {tabs.map(tab => {
                            const Icon = tab.icon;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all w-full text-left
                    ${activeTab === tab.id ? 'bg-orange-500 text-white shadow-sm' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50'}`}
                                >
                                    <Icon size={18} />
                                    <span className="hidden sm:block">{tab.label}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-6">

                    {/* Profile Tab */}
                    {activeTab === 'profile' && (
                        <form onSubmit={handleSaveProfile} className="space-y-5">
                            <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-gray-100 dark:border-gray-700">
                                <div className="relative group">
                                    <div className="w-24 h-24 rounded-2xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-orange-600 dark:text-orange-400 font-bold text-3xl overflow-hidden border-2 border-dashed border-orange-200 dark:border-orange-800">
                                        {profile.profileImage ? (
                                            <img src={profile.profileImage} alt="Profile" className="w-full h-full object-cover" />
                                        ) : (
                                            user.name?.charAt(0)?.toUpperCase() || 'U'
                                        )}
                                    </div>
                                    <label className="absolute -bottom-2 -right-2 p-2 bg-white dark:bg-gray-700 rounded-lg shadow-md border border-gray-100 dark:border-gray-600 cursor-pointer hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-colors">
                                        <PlusCircle size={16} className="text-orange-600" />
                                        <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                                    </label>
                                </div>
                                <div className="text-center sm:text-left">
                                    <p className="font-bold text-gray-800 dark:text-white text-xl">{user.name} {user.surname}</p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">{user.position}</p>
                                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">@{user.username}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <InputField label={lang === 'th' ? 'ชื่อ' : 'First Name'} value={profile.name} onChange={v => setProfile(p => ({ ...p, name: v }))} placeholder="" />
                                <InputField label={lang === 'th' ? 'นามสกุล' : 'Last Name'} value={profile.surname} onChange={v => setProfile(p => ({ ...p, surname: v }))} placeholder="" />
                            </div>
                            <InputField label={lang === 'th' ? 'ตำแหน่ง/แผนก' : 'Position/Department'} value={profile.position} onChange={v => setProfile(p => ({ ...p, position: v }))} placeholder="" />
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <InputField label={lang === 'th' ? 'อีเมล' : 'Email'} type="email" value={profile.email} onChange={v => setProfile(p => ({ ...p, email: v }))} placeholder="example@email.com" />
                                <InputField label={lang === 'th' ? 'เบอร์โทรศัพท์' : 'Phone'} value={profile.phone} onChange={v => setProfile(p => ({ ...p, phone: v }))} placeholder="0xx-xxx-xxxx" />
                            </div>
                            <div className="pt-2">
                                <button type="submit" className="flex items-center gap-2 px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold rounded-xl shadow-sm transition-colors">
                                    <Save size={16} /> {t.saveBtn}
                                </button>
                            </div>
                        </form>
                    )}

                    {/* Security Tab */}
                    {activeTab === 'security' && (
                        <form onSubmit={handleChangePassword} className="space-y-5">
                            <h3 className="font-bold text-gray-700 dark:text-gray-200">{t.changePassword}</h3>
                            {passError && (
                                <div className="px-4 py-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 rounded-xl text-sm">{passError}</div>
                            )}
                            {(['current', 'new', 'confirm'] as const).map(k => {
                                const labels = { current: t.currentPassword, new: t.newPassword, confirm: t.confirmPassword };
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
                                        <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">{labels[k]}</label>
                                        <div className="relative">
                                            <input
                                                type={shown[k] ? 'text' : 'password'}
                                                value={vals[k]}
                                                onChange={e => onChanges[k](e.target.value)}
                                                required
                                                className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-xl px-4 py-2.5 text-sm focus:ring-orange-500 focus:border-orange-500 pr-10"
                                            />
                                            <button type="button" onClick={toggles[k]} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                                                {shown[k] ? <EyeOff size={16} /> : <Eye size={16} />}
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                            <button type="submit" className="flex items-center gap-2 px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold rounded-xl shadow-sm transition-colors">
                                <Save size={16} /> {t.changePassword}
                            </button>
                        </form>
                    )}

                    {/* Preferences Tab */}
                    {activeTab === 'preferences' && (
                        <div className="space-y-6">
                            <h3 className="font-bold text-gray-700 dark:text-gray-200">{t.preferencesTab}</h3>

                            {/* Language */}
                            <div>
                                <div className="flex items-center gap-2 mb-3">
                                    <Globe size={16} className="text-gray-500 dark:text-gray-400" />
                                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-200">{t.systemLanguage}</label>
                                </div>
                                <div className="flex gap-3">
                                    {([{ val: 'th', label: '🇹🇭 ภาษาไทย' }, { val: 'en', label: '🇬🇧 English' }] as const).map(l => (
                                        <button key={l.val}
                                            onClick={() => setLang(l.val)}
                                            className={`px-5 py-3 rounded-xl border text-sm font-medium transition-all ${lang === l.val ? 'bg-orange-500 text-white border-orange-500 shadow-sm' : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-600 hover:border-orange-300'}`}
                                        >
                                            {l.label}
                                        </button>
                                    ))}
                                </div>
                                <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                                    {t.langNote}
                                </p>
                            </div>

                            {/* Dark mode */}
                            <div>
                                <div className="flex items-center gap-2 mb-3">
                                    {darkMode ? <Moon size={16} className="text-indigo-500" /> : <Sun size={16} className="text-yellow-500" />}
                                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-200">{t.displayMode}</label>
                                </div>
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => setDarkMode(false)}
                                        className={`flex items-center gap-2 px-5 py-3 rounded-xl border text-sm font-medium transition-all ${!darkMode ? 'bg-orange-500 text-white border-orange-500 shadow-sm' : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-600 hover:border-orange-300'}`}
                                    >
                                        <Sun size={16} /> Light Mode
                                    </button>
                                    <button
                                        onClick={() => setDarkMode(true)}
                                        className={`flex items-center gap-2 px-5 py-3 rounded-xl border text-sm font-medium transition-all ${darkMode ? 'bg-orange-500 text-white border-orange-500 shadow-sm' : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-600 hover:border-orange-300'}`}
                                    >
                                        <Moon size={16} /> Dark Mode
                                    </button>
                                </div>
                                {darkMode && (
                                    <p className="text-xs text-indigo-500 mt-2 font-medium">{t.darkModeNote}</p>
                                )}
                            </div>

                            <button onClick={handleSavePreferences} className="flex items-center gap-2 px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold rounded-xl shadow-sm transition-colors">
                                <Save size={16} /> {t.saveSettings}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
