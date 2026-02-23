import React from 'react';
import { useApp } from '../src/context/AppContext';
import { Bell, Info, AlertTriangle, CheckCircle, X, Clock } from 'lucide-react';

interface NotificationCenterProps {
    onClose?: () => void;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({ onClose }) => {
    const { notifications, fetchNotifications, markAsRead, lang } = useApp();

    const getIcon = (type: string) => {
        switch (type.toUpperCase()) {
            case 'ALERT': return <AlertTriangle size={18} className="text-red-500" />;
            case 'MEETING': return <Bell size={18} className="text-blue-500" />;
            default: return <Info size={18} className="text-orange-500" />;
        }
    };

    return (
        <div className="flex flex-col h-full bg-white dark:bg-gray-800">
            <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
                <h3 className="font-bold text-gray-800 dark:text-white flex items-center gap-2">
                    <Bell size={18} className="text-orange-600" />
                    {lang === 'th' ? 'การแจ้งเตือน' : 'Notifications'}
                </h3>
                {onClose && (
                    <button onClick={onClose} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-gray-400">
                        <X size={20} />
                    </button>
                )}
            </div>

            <div className="flex-1 overflow-y-auto divide-y divide-gray-50 dark:divide-gray-700">
                {notifications.map(n => (
                    <div
                        key={n.id}
                        onClick={() => !n.isRead && markAsRead(n.id)}
                        className={`p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${!n.isRead ? 'bg-orange-50/30 dark:bg-orange-900/10' : ''}`}
                    >
                        <div className="flex gap-3">
                            <div className="mt-1 flex-shrink-0">{getIcon(n.type)}</div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold text-gray-800 dark:text-white">{n.title}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">{n.message}</p>
                                <div className="flex items-center gap-2 mt-2">
                                    <Clock size={12} className="text-gray-300" />
                                    <span className="text-[10px] text-gray-400 capitalize">
                                        {new Date(n.createdAt).toLocaleString(lang === 'th' ? 'th-TH' : 'en-US', {
                                            month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                                        })}
                                    </span>
                                </div>
                            </div>
                            {!n.isRead && (
                                <div className="w-2 h-2 rounded-full bg-orange-500 mt-2" />
                            )}
                        </div>
                    </div>
                ))}
                {notifications.length === 0 && (
                    <div className="p-10 text-center">
                        <Bell size={40} className="mx-auto text-gray-200 mb-3" />
                        <p className="text-sm text-gray-400">{lang === 'th' ? 'ยังไม่มีการแจ้งเตือน' : 'No notifications yet'}</p>
                    </div>
                )}
            </div>
        </div>
    );
};
