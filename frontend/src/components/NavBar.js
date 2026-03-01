import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Compass, User, LogOut, Sparkles } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';

const API_URL = process.env.REACT_APP_BACKEND_URL;

function NavBar({ user }) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    try {
      await axios.post(`${API_URL}/api/auth/logout`, {}, { withCredentials: true });
      toast.success('Sesión cerrada');
      navigate('/');
    } catch (error) {
      toast.error('Error al cerrar sesión');
    }
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="fixed top-6 left-1/2 -translate-x-1/2 bg-white/80 backdrop-blur-xl border border-white/40 shadow-2xl rounded-full px-6 py-3 z-50 flex items-center gap-6">
      <div className="flex items-center gap-2 pr-4 border-r border-slate-200">
        <div className="bg-gradient-to-br from-sky-400 to-lime-400 p-2 rounded-full">
          <Sparkles className="w-4 h-4 text-white" />
        </div>
        <span className="font-bold text-slate-800">MicroSkill</span>
      </div>
      
      <NavItem
        icon={<Home className="w-5 h-5" />}
        label="Inicio"
        onClick={() => navigate('/dashboard')}
        active={isActive('/dashboard')}
        testId="nav-home"
      />
      
      <NavItem
        icon={<Compass className="w-5 h-5" />}
        label="Explorar"
        onClick={() => navigate('/explore')}
        active={isActive('/explore')}
        testId="nav-explore"
      />
      
      <NavItem
        icon={<User className="w-5 h-5" />}
        label="Perfil"
        onClick={() => navigate('/profile')}
        active={isActive('/profile')}
        testId="nav-profile"
      />
      
      <div className="pl-4 border-l border-slate-200">
        <button
          onClick={handleLogout}
          data-testid="nav-logout"
          className="flex items-center gap-2 px-4 py-2 rounded-full hover:bg-red-50 text-red-600 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span className="text-sm font-medium">Salir</span>
        </button>
      </div>
    </nav>
  );
}

function NavItem({ icon, label, onClick, active, testId }) {
  return (
    <button
      onClick={onClick}
      data-testid={testId}
      className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${
        active 
          ? 'bg-sky-100 text-sky-600' 
          : 'hover:bg-sky-50 text-slate-600 hover:text-sky-600'
      }`}
    >
      {icon}
      <span className="text-sm font-medium">{label}</span>
    </button>
  );
}

export default NavBar;