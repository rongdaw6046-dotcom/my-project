import React from 'react';
import { useApp } from '../src/context/AppContext';
import { UserRole } from '../types';
import { translations } from '../src/translations';
import {
  LogOut, LayoutDashboard, User as UserIcon, Calendar, CalendarDays,
  Users, Menu as MenuIcon, PlusCircle, History, BookOpen,
  CheckSquare, Settings, Home
} from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout, lang } = useApp();
  const t = translations[lang];
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path: string) => {
    if (path === '/admin/meetings' && location.pathname === '/admin/meetings/new') return false;
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const NavItem = ({ to, icon: Icon, label }: { to: string; icon: any; label: string }) => (
    <Link
      to={to}
      onClick={() => setIsMobileMenuOpen(false)}
      className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group
        ${isActive(to)
          ? 'bg-orange-600 text-white shadow-md shadow-orange-200'
          : 'text-gray-600 dark:text-gray-300 hover:bg-orange-50 dark:hover:bg-orange-900/20 hover:text-orange-700 dark:hover:text-orange-400'}`}
    >
      <Icon size={20} className={isActive(to) ? 'text-white' : 'text-gray-400 group-hover:text-orange-600'} />
      <span>{label}</span>
    </Link>
  );

  const SectionLabel = ({ label }: { label: string }) => (
    <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1 px-4 mt-4 first:mt-2">{label}</div>
  );

  const userNavItems = (
    <>
      <SectionLabel label={t.overview} />
      <NavItem to="/user/home" icon={Home} label={t.home} />

      <SectionLabel label={t.meetings} />
      <NavItem to="/user/dashboard" icon={Calendar} label={t.myMeetings} />
      <NavItem to="/user/calendar" icon={CalendarDays} label={t.calendar} />
      <NavItem to="/user/history" icon={History} label={t.history} />
      <NavItem to="/user/reports" icon={BookOpen} label={t.reports} />

      <SectionLabel label={t.tasks} />
      <NavItem to="/user/actions" icon={CheckSquare} label={t.assignedTasks} />

      <SectionLabel label={t.account} />
      <NavItem to="/user/settings" icon={Settings} label={t.accountSettings} />
    </>
  );

  const adminNavItems = (
    <>
      <SectionLabel label={t.adminMenu} />
      <NavItem to="/admin/dashboard" icon={LayoutDashboard} label={t.adminDashboard} />
      <NavItem to="/admin/meetings" icon={Calendar} label={t.manageMeetings} />
      <NavItem to="/admin/meetings/new" icon={PlusCircle} label={t.createMeeting} />
      <NavItem to="/admin/users" icon={Users} label={t.manageUsers} />

      <SectionLabel label={t.account} />
      <NavItem to="/user/settings" icon={Settings} label={t.accountSettings} />
    </>
  );

  return (
    <div className="min-h-screen bg-[#F3F4F6] flex">
      {/* Sidebar Desktop */}
      <aside className="hidden md:flex flex-col w-72 bg-white border-r border-gray-200 fixed h-full z-10">
        <div className="p-6 border-b border-gray-100 flex items-center gap-3">
          <img src="/logo.png" alt="Logo" className="w-10 h-10 object-contain" />
          <div>
            <h1 className="font-bold text-gray-800 text-lg leading-tight">Meeting Srithep</h1>
            <p className="text-xs text-gray-400">ระบบบริหารจัดการการประชุม</p>
          </div>
        </div>

        <div className="p-4 space-y-1 flex-1 overflow-y-auto">
          {user?.role === UserRole.ADMIN ? adminNavItems : userNavItems}
        </div>

        <div className="p-4 border-t border-gray-100">
          <div className="bg-gray-50 rounded-xl p-4 flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold">
              {user?.name?.charAt(0)?.toUpperCase() || <UserIcon size={20} />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-gray-800 truncate">{user?.name} {user?.surname}</p>
              <p className="text-xs text-gray-500 truncate">{user?.role === UserRole.ADMIN ? t.admin : t.user}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center justify-center gap-2 w-full px-4 py-2 text-sm text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <LogOut size={16} /> {t.logout}
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden fixed w-full bg-white border-b border-gray-200 z-20 flex items-center justify-between p-4">
        <div className="flex items-center gap-2">
          <img src="/logo.png" alt="Logo" className="w-8 h-8 object-contain" />
          <span className="font-bold text-gray-800">Meeting Srithep</span>
        </div>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 text-gray-600">
          <MenuIcon size={24} />
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 bg-gray-800 bg-opacity-75 z-30" onClick={() => setIsMobileMenuOpen(false)}>
          <div className="bg-white w-72 h-full p-4 overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="space-y-0.5 mt-14">
              {user?.role === UserRole.ADMIN ? adminNavItems : userNavItems}
              <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 text-red-600 w-full text-left rounded-xl hover:bg-red-50 mt-2">
                <LogOut size={20} /> {t.logout}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 md:ml-72 p-4 md:p-8 mt-14 md:mt-0 transition-all">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};