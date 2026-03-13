import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Compass, User, LogOut, Sparkles, PenLine } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';
import { useSettings } from '../contexts/SettingsContext';

const API_URL = process.env.REACT_APP_BACKEND_URL;

function NavBar({ user }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useSettings();

  const handleLogout = async () => {
    try {
      await axios.post(`${API_URL}/api/auth/logout`, {}, { withCredentials: true });
      toast.success(t('nav_logout'));
      navigate('/');
    } catch (error) {
      toast.error('Error');
    }
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="fixed top-4 left-1/2 -translate-x-1/2 bg-white/80 dark:bg-slate-900/85 backdrop-blur-xl border border-white/40 dark:border-white/[0.06] shadow-2xl rounded-full px-3 sm:px-5 py-2.5 z-50 flex items-center gap-1 sm:gap-2">
      <div className="flex items-center gap-1.5 pr-2 sm:pr-3 border-r border-slate-200 dark:border-white/10">
        <div className="bg-gradient-to-br from-sky-400 to-lime-400 p-1.5 rounded-full">
          <Sparkles className="w-3.5 h-3.5 text-white" />
        </div>
        <span className="font-bold text-slate-900 dark:text-white text-sm hidden sm:block">MicroSkill</span>
      </div>

      <NavItem icon={<Home className="w-4 h-4 sm:w-5 sm:h-5" />} label={t('nav_home')} onClick={() => navigate('/dashboard')} active={isActive('/dashboard')} testId="nav-home" color="sky" />
      <NavItem icon={<Compass className="w-4 h-4 sm:w-5 sm:h-5" />} label={t('nav_explore')} onClick={() => navigate('/explore')} active={isActive('/explore')} testId="nav-explore" color="sky" />
      <NavItem icon={<PenLine className="w-4 h-4 sm:w-5 sm:h-5" />} label={t('nav_create')} onClick={() => navigate('/create-lesson')} active={isActive('/create-lesson')} testId="nav-create" color="violet" />
      <NavItem icon={<User className="w-4 h-4 sm:w-5 sm:h-5" />} label={t('nav_profile')} onClick={() => navigate('/profile')} active={isActive('/profile')} testId="nav-profile" color="sky" />

      <div className="pl-2 sm:pl-3 border-l border-slate-200 dark:border-white/10">
        <button
          onClick={handleLogout}
          data-testid="nav-logout"
          className="flex items-center gap-1.5 px-2.5 sm:px-3 py-2 rounded-full text-red-500 hover:bg-red-500/10 hover:shadow-md hover:shadow-red-500/10 transition-all"
        >
          <LogOut className="w-4 h-4 sm:w-5 sm:h-5" />
          <span className="text-xs font-medium hidden sm:block">{t('nav_logout')}</span>
        </button>
      </div>
    </nav>
  );
}

function NavItem({ icon, label, onClick, active, testId, color }) {
  const activeClasses = color === 'violet'
    ? 'bg-violet-500/15 text-violet-600 dark:text-violet-400 shadow-sm shadow-violet-500/10'
    : 'bg-sky-500/15 text-sky-600 dark:text-sky-400 shadow-sm shadow-sky-500/10';

  const inactiveClasses = color === 'violet'
    ? 'text-violet-600 dark:text-violet-400 hover:bg-violet-500/10 hover:shadow-md hover:shadow-violet-500/10'
    : 'text-slate-800 dark:text-slate-200 hover:bg-sky-500/10 hover:shadow-md hover:shadow-sky-500/10';

  return (
    <button
      onClick={onClick}
      data-testid={testId}
      className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-2 rounded-full transition-all duration-200 text-xs sm:text-sm font-semibold ${
        active ? activeClasses : inactiveClasses
      }`}
    >
      {icon}
      <span className="hidden sm:block">{label}</span>
    </button>
  );
}

export default NavBar;
