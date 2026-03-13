import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Compass, User, LogOut, Sparkles, PenLine } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';

const API_URL = process.env.REACT_APP_BACKEND_URL;

function NavBar({ user }) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    try {
      await axios.post(`${API_URL}/api/auth/logout`, {}, { withCredentials: true });
      toast.success('Sesion cerrada');
      navigate('/');
    } catch (error) {
      toast.error('Error al cerrar sesion');
    }
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="fixed top-4 left-1/2 -translate-x-1/2 bg-white/80 backdrop-blur-xl border border-white/40 shadow-2xl rounded-full px-3 sm:px-5 py-2.5 z-50 flex items-center gap-1 sm:gap-2">
      <div className="flex items-center gap-1.5 pr-2 sm:pr-3 border-r border-slate-200">
        <div className="bg-gradient-to-br from-sky-400 to-lime-400 p-1.5 rounded-full">
          <Sparkles className="w-3.5 h-3.5 text-white" />
        </div>
        <span className="font-bold text-slate-800 text-sm hidden sm:block">MicroSkill</span>
      </div>

      <NavItem icon={<Home className="w-4 h-4 sm:w-5 sm:h-5" />} label="Inicio" onClick={() => navigate('/dashboard')} active={isActive('/dashboard')} testId="nav-home" />
      <NavItem icon={<Compass className="w-4 h-4 sm:w-5 sm:h-5" />} label="Explorar" onClick={() => navigate('/explore')} active={isActive('/explore')} testId="nav-explore" />
      <NavItem icon={<PenLine className="w-4 h-4 sm:w-5 sm:h-5" />} label="Crear" onClick={() => navigate('/create-lesson')} active={isActive('/create-lesson')} testId="nav-create" accent />
      <NavItem icon={<User className="w-4 h-4 sm:w-5 sm:h-5" />} label="Perfil" onClick={() => navigate('/profile')} active={isActive('/profile')} testId="nav-profile" />

      <div className="pl-2 sm:pl-3 border-l border-slate-200">
        <button
          onClick={handleLogout}
          data-testid="nav-logout"
          className="flex items-center gap-1.5 px-2.5 sm:px-3 py-2 rounded-full hover:bg-red-50 text-red-500 transition-colors"
        >
          <LogOut className="w-4 h-4 sm:w-5 sm:h-5" />
          <span className="text-xs font-medium hidden sm:block">Salir</span>
        </button>
      </div>
    </nav>
  );
}

function NavItem({ icon, label, onClick, active, testId, accent }) {
  return (
    <button
      onClick={onClick}
      data-testid={testId}
      className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-2 rounded-full transition-all text-xs sm:text-sm font-medium ${
        active
          ? accent ? 'bg-violet-100 text-violet-600' : 'bg-sky-100 text-sky-600'
          : accent ? 'hover:bg-violet-50 text-violet-500 hover:text-violet-600' : 'hover:bg-sky-50 text-slate-600 hover:text-sky-600'
      }`}
    >
      {icon}
      <span className="hidden sm:block">{label}</span>
    </button>
  );
}

export default NavBar;
