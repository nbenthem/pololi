import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'sonner';
import {
  User, Star, BookOpen, TrendingUp, Clock, Settings, Globe, Palette,
  Sparkles, Award, Target, Zap, Shield, ChevronRight, Save, Eye, EyeOff,
  Sun, Moon
} from 'lucide-react';
import NavBar from '../components/NavBar';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const SOCIAL_FIELDS = [
  { key: 'twitter', label: 'Twitter / X', placeholder: '@usuario', icon: 'X' },
  { key: 'linkedin', label: 'LinkedIn', placeholder: 'https://linkedin.com/in/...', icon: 'in' },
  { key: 'github', label: 'GitHub', placeholder: 'https://github.com/...', icon: 'GH' },
  { key: 'instagram', label: 'Instagram', placeholder: '@usuario', icon: 'IG' },
  { key: 'website', label: 'Sitio web', placeholder: 'https://...', icon: 'WEB' },
];

const LEVEL_BADGES = [
  { level: 1, name: 'Novato', color: 'from-slate-400 to-slate-500' },
  { level: 2, name: 'Iniciado', color: 'from-sky-400 to-sky-500' },
  { level: 3, name: 'Aprendiz', color: 'from-blue-400 to-blue-500' },
  { level: 4, name: 'Estudiante', color: 'from-indigo-400 to-indigo-500' },
  { level: 5, name: 'Conocedor', color: 'from-violet-400 to-violet-500' },
  { level: 6, name: 'Experto', color: 'from-purple-400 to-purple-500' },
  { level: 7, name: 'Sabio', color: 'from-fuchsia-400 to-fuchsia-500' },
  { level: 8, name: 'Maestro', color: 'from-pink-400 to-pink-500' },
  { level: 9, name: 'Gran Maestro', color: 'from-rose-400 to-rose-500' },
  { level: 10, name: 'Leyenda', color: 'from-amber-400 to-amber-500' },
];

const LEVELS_POINTS = [0, 100, 250, 500, 1000, 2000, 3500, 5000, 7500, 10000, 15000, 20000, 30000, 50000, 75000, 100000];

function Profile({ user }) {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [completedLessons, setCompletedLessons] = useState([]);
  const [gamification, setGamification] = useState(null);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [savingSettings, setSavingSettings] = useState(false);
  const [localSettings, setLocalSettings] = useState({});

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    try {
      const [statsRes, favoritesRes, progressRes, gamifRes, settingsRes] = await Promise.all([
        axios.get(`${API_URL}/api/user/stats`, { withCredentials: true }),
        axios.get(`${API_URL}/api/favorites`, { withCredentials: true }),
        axios.get(`${API_URL}/api/progress`, { withCredentials: true }),
        axios.get(`${API_URL}/api/gamification/me`, { withCredentials: true }),
        axios.get(`${API_URL}/api/user/settings`, { withCredentials: true })
      ]);

      setStats(statsRes.data);
      setFavorites(favoritesRes.data);
      setGamification(gamifRes.data);
      setSettings(settingsRes.data);
      setLocalSettings(settingsRes.data);

      const completed = progressRes.data.filter(p => p.completed);
      if (completed.length > 0) {
        const lessonIds = completed.map(p => p.lesson_id);
        const lessonsRes = await axios.get(`${API_URL}/api/lessons`, { withCredentials: true });
        setCompletedLessons(lessonsRes.data.filter(l => lessonIds.includes(l.lesson_id)));
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast.error('Error al cargar perfil');
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    setSavingSettings(true);
    try {
      const res = await axios.put(`${API_URL}/api/user/settings`, localSettings, { withCredentials: true });
      setSettings(res.data);
      toast.success('Configuracion guardada');
      if (localSettings.theme !== settings.theme) {
        document.documentElement.classList.toggle('dark', localSettings.theme === 'dark');
      }
    } catch (error) {
      toast.error('Error al guardar');
    } finally {
      setSavingSettings(false);
    }
  };

  const getLevelBadge = (level) => LEVEL_BADGES.find(b => b.level === level) || LEVEL_BADGES[0];
  
  const getLevelProgress = () => {
    if (!gamification) return 0;
    const currentLevelThreshold = LEVELS_POINTS[gamification.level - 1] || 0;
    const nextLevelThreshold = LEVELS_POINTS[gamification.level] || LEVELS_POINTS[LEVELS_POINTS.length - 1];
    const range = nextLevelThreshold - currentLevelThreshold;
    const progress = gamification.points - currentLevelThreshold;
    return range > 0 ? Math.min((progress / range) * 100, 100) : 100;
  };

  const getCategoryColor = (categoryId) => {
    const colors = { 'cat_negotiation': 'from-sky-400 to-sky-600', 'cat_psychology': 'from-pink-400 to-pink-600', 'cat_finance': 'from-lime-400 to-lime-600', 'cat_science': 'from-purple-400 to-purple-600', 'cat_productivity': 'from-amber-400 to-amber-600', 'cat_health': 'from-emerald-400 to-emerald-600', 'cat_creativity': 'from-violet-400 to-violet-600', 'cat_leadership': 'from-rose-400 to-rose-600' };
    return colors[categoryId] || 'from-slate-400 to-slate-600';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="glass-card p-8">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 border-4 border-sky-400 border-t-transparent rounded-full animate-spin" />
            <span>Cargando perfil...</span>
          </div>
        </div>
      </div>
    );
  }

  const badge = gamification ? getLevelBadge(gamification.level) : getLevelBadge(1);

  return (
    <div className="min-h-screen pb-20">
      <NavBar user={user} />

      <div className="container mx-auto px-4 sm:px-6 pt-24">
        {/* Profile Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6 sm:p-8 mb-8">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-sky-400 to-lime-400 p-1">
                {user?.picture ? (
                  <img src={user.picture} alt={user.name} className="w-full h-full rounded-full object-cover" />
                ) : (
                  <div className="w-full h-full rounded-full bg-white flex items-center justify-center">
                    <User className="w-12 h-12 text-sky-500" />
                  </div>
                )}
              </div>
              {settings?.show_badge !== false && gamification && (
                <div data-testid="level-badge" className={`absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-gradient-to-br ${badge.color} flex items-center justify-center text-white text-xs font-bold border-2 border-white shadow`}>
                  {gamification.level}
                </div>
              )}
            </div>

            <div className="flex-1 text-center sm:text-left">
              <h1 className="text-2xl sm:text-3xl font-bold mb-1">{user?.name}</h1>
              <p className="text-slate-500 text-sm">{user?.email}</p>
              {gamification && (
                <div className="flex items-center justify-center sm:justify-start gap-3 mt-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold text-white bg-gradient-to-r ${badge.color}`}>
                    Nivel {gamification.level} - {badge.name}
                  </span>
                  <span className="text-sm text-slate-500">{gamification.points} pts</span>
                  {gamification.current_streak > 0 && (
                    <span className="text-sm text-orange-500 font-medium">{gamification.current_streak}d racha</span>
                  )}
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Tab Navigation */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          {[
            { id: 'overview', label: 'Resumen', icon: <TrendingUp className="w-4 h-4" /> },
            { id: 'badges', label: 'Logros', icon: <Award className="w-4 h-4" /> },
            { id: 'settings', label: 'Configuracion', icon: <Settings className="w-4 h-4" /> },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              data-testid={`tab-${tab.id}`}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-sky-400 to-sky-600 text-white shadow-lg'
                  : 'bg-white/60 backdrop-blur-sm border border-slate-200 text-slate-600 hover:border-sky-300'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
            {/* Stats Grid */}
            {stats && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <StatCard icon={<BookOpen className="w-5 h-5" />} label="Completadas" value={stats.completed_lessons} color="from-sky-400 to-sky-600" />
                <StatCard icon={<Star className="w-5 h-5" />} label="Favoritos" value={stats.favorites_count} color="from-pink-400 to-pink-600" />
                <StatCard icon={<TrendingUp className="w-5 h-5" />} label="Progreso" value={`${stats.completion_rate}%`} color="from-lime-400 to-lime-600" />
                <StatCard icon={<Zap className="w-5 h-5" />} label="Total" value={stats.total_lessons} color="from-purple-400 to-purple-600" />
              </div>
            )}

            {/* Level Progress */}
            {gamification && (
              <div className="glass-card p-6">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-bold text-slate-700">Nivel {gamification.level} - {badge.name}</span>
                  <span className="text-xs text-slate-500">
                    {gamification.points} / {LEVELS_POINTS[gamification.level] || '---'} pts
                  </span>
                </div>
                <div className="h-3 bg-slate-200 rounded-full overflow-hidden">
                  <motion.div
                    className={`h-full bg-gradient-to-r ${badge.color} rounded-full`}
                    initial={{ width: 0 }}
                    animate={{ width: `${getLevelProgress()}%` }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                  />
                </div>
                <p className="text-xs text-slate-500 mt-2">
                  {LEVELS_POINTS[gamification.level] ? `${LEVELS_POINTS[gamification.level] - gamification.points} pts para nivel ${gamification.level + 1}` : 'Nivel maximo alcanzado!'}
                </p>
              </div>
            )}

            {/* Favorites */}
            {favorites.length > 0 && (
              <div>
                <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <Star className="w-5 h-5 text-pink-500 fill-current" /> Favoritos
                </h2>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {favorites.slice(0, 6).map((lesson, i) => (
                    <LessonCard key={lesson.lesson_id} lesson={lesson} categoryColor={getCategoryColor(lesson.category_id)} index={i} onClick={() => navigate(`/lesson/${lesson.lesson_id}`)} />
                  ))}
                </div>
              </div>
            )}

            {/* Completed */}
            {completedLessons.length > 0 && (
              <div>
                <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-lime-500" /> Completadas
                </h2>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {completedLessons.slice(0, 6).map((lesson, i) => (
                    <LessonCard key={lesson.lesson_id} lesson={lesson} completed categoryColor={getCategoryColor(lesson.category_id)} index={i} onClick={() => navigate(`/lesson/${lesson.lesson_id}`)} />
                  ))}
                </div>
              </div>
            )}

            {favorites.length === 0 && completedLessons.length === 0 && (
              <div className="glass-card p-10 text-center">
                <Sparkles className="w-14 h-14 text-sky-400 mx-auto mb-4" />
                <h3 className="text-xl font-bold mb-2">Comienza tu viaje!</h3>
                <p className="text-slate-500 text-sm mb-5">Completa lecciones y guarda favoritos para verlos aqui</p>
                <button onClick={() => navigate('/explore')} data-testid="explore-from-profile-btn" className="glossy-button text-sm">
                  Explorar lecciones
                </button>
              </div>
            )}
          </motion.div>
        )}

        {/* Badges Tab */}
        {activeTab === 'badges' && (
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            {/* Level Badges */}
            <div className="glass-card p-6 sm:p-8">
              <h2 className="text-lg font-bold mb-5 flex items-center gap-2">
                <Shield className="w-5 h-5 text-violet-500" /> Niveles
              </h2>
              <div className="space-y-4">
                {LEVEL_BADGES.map(lb => {
                  const isUnlocked = gamification && gamification.level >= lb.level;
                  const isCurrent = gamification && gamification.level === lb.level;
                  const threshold = LEVELS_POINTS[lb.level - 1] || 0;
                  const nextThreshold = LEVELS_POINTS[lb.level] || threshold;
                  const progress = gamification ? Math.min(((gamification.points - threshold) / (nextThreshold - threshold || 1)) * 100, 100) : 0;

                  return (
                    <div key={lb.level} className={`flex items-center gap-4 p-3 rounded-2xl transition-all ${isCurrent ? 'bg-violet-50 border border-violet-200' : isUnlocked ? 'opacity-80' : 'opacity-40'}`}>
                      <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${lb.color} flex items-center justify-center text-white font-bold text-sm ${!isUnlocked ? 'grayscale' : ''}`}>
                        {lb.level}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-semibold">{lb.name}</span>
                          <span className="text-xs text-slate-500">{threshold} pts</span>
                        </div>
                        <div className="h-1.5 bg-slate-200 rounded-full mt-1.5 overflow-hidden">
                          <div
                            className={`h-full bg-gradient-to-r ${lb.color} rounded-full transition-all duration-700`}
                            style={{ width: isUnlocked ? '100%' : isCurrent ? `${progress}%` : '0%' }}
                          />
                        </div>
                      </div>
                      {isUnlocked && <Award className="w-5 h-5 text-lime-500 flex-shrink-0" />}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Achievement Badges */}
            {gamification?.badges_details && gamification.badges_details.length > 0 && (
              <div className="glass-card p-6 sm:p-8">
                <h2 className="text-lg font-bold mb-5 flex items-center gap-2">
                  <Award className="w-5 h-5 text-amber-500" /> Logros desbloqueados
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {gamification.badges_details.map(b => (
                    <div key={b.badge_id} className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-center">
                      <div className="text-3xl mb-2">{b.icon}</div>
                      <p className="text-sm font-bold">{b.name}</p>
                      <p className="text-xs text-slate-500 mt-1">{b.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            {/* Appearance */}
            <div className="glass-card p-6 sm:p-8">
              <h2 className="text-lg font-bold mb-5 flex items-center gap-2">
                <Palette className="w-5 h-5 text-violet-500" /> Apariencia
              </h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Tema</p>
                    <p className="text-xs text-slate-500">Alterna entre claro y oscuro</p>
                  </div>
                  <button
                    onClick={() => setLocalSettings(prev => ({ ...prev, theme: prev.theme === 'dark' ? 'light' : 'dark' }))}
                    data-testid="theme-toggle"
                    className={`relative w-14 h-7 rounded-full transition-colors ${localSettings.theme === 'dark' ? 'bg-violet-500' : 'bg-slate-300'}`}
                  >
                    <div className={`absolute top-0.5 w-6 h-6 rounded-full bg-white shadow flex items-center justify-center transition-transform ${localSettings.theme === 'dark' ? 'translate-x-7' : 'translate-x-0.5'}`}>
                      {localSettings.theme === 'dark' ? <Moon className="w-3.5 h-3.5 text-violet-500" /> : <Sun className="w-3.5 h-3.5 text-amber-500" />}
                    </div>
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Mostrar badge de nivel</p>
                    <p className="text-xs text-slate-500">Muestra tu nivel en tu foto de perfil</p>
                  </div>
                  <button
                    onClick={() => setLocalSettings(prev => ({ ...prev, show_badge: !prev.show_badge }))}
                    data-testid="badge-toggle"
                    className={`relative w-14 h-7 rounded-full transition-colors ${localSettings.show_badge ? 'bg-lime-500' : 'bg-slate-300'}`}
                  >
                    <div className={`absolute top-0.5 w-6 h-6 rounded-full bg-white shadow flex items-center justify-center transition-transform ${localSettings.show_badge ? 'translate-x-7' : 'translate-x-0.5'}`}>
                      {localSettings.show_badge ? <Eye className="w-3.5 h-3.5 text-lime-500" /> : <EyeOff className="w-3.5 h-3.5 text-slate-400" />}
                    </div>
                  </button>
                </div>
              </div>
            </div>

            {/* Language */}
            <div className="glass-card p-6 sm:p-8">
              <h2 className="text-lg font-bold mb-5 flex items-center gap-2">
                <Globe className="w-5 h-5 text-sky-500" /> Idioma
              </h2>
              <div className="flex gap-3">
                {[{ code: 'es', label: 'Espanol' }, { code: 'en', label: 'English' }].map(lang => (
                  <button
                    key={lang.code}
                    onClick={() => setLocalSettings(prev => ({ ...prev, language: lang.code }))}
                    data-testid={`lang-${lang.code}`}
                    className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      localSettings.language === lang.code
                        ? 'bg-sky-100 text-sky-700 border border-sky-300'
                        : 'bg-white/50 border border-slate-200 text-slate-600 hover:border-sky-300'
                    }`}
                  >
                    {lang.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Social Links */}
            <div className="glass-card p-6 sm:p-8">
              <h2 className="text-lg font-bold mb-2 flex items-center gap-2">
                <User className="w-5 h-5 text-pink-500" /> Redes sociales
              </h2>
              <p className="text-xs text-slate-500 mb-5">Pronto los perfiles seran publicos y buscables</p>
              <div className="space-y-3">
                {SOCIAL_FIELDS.map(field => (
                  <div key={field.key} className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500 flex-shrink-0">
                      {field.icon}
                    </div>
                    <input
                      type="text"
                      value={localSettings.social_links?.[field.key] || ''}
                      onChange={e => setLocalSettings(prev => ({
                        ...prev,
                        social_links: { ...prev.social_links, [field.key]: e.target.value }
                      }))}
                      placeholder={field.placeholder}
                      data-testid={`social-${field.key}`}
                      className="glass-input flex-1"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Save */}
            <button
              onClick={saveSettings}
              disabled={savingSettings}
              data-testid="save-settings-btn"
              className="glossy-button w-full flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {savingSettings ? 'Guardando...' : 'Guardar configuracion'}
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, color }) {
  return (
    <div className="glass-card p-4 sm:p-5">
      <div className={`inline-flex p-2.5 rounded-xl bg-gradient-to-br ${color} mb-2`}>
        <div className="text-white">{icon}</div>
      </div>
      <p className="text-xs text-slate-500">{label}</p>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  );
}

function LessonCard({ lesson, completed, categoryColor, index, onClick }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.05 * index }}
      whileHover={{ y: -3 }}
      onClick={onClick}
      data-testid={`profile-lesson-card-${lesson.lesson_id}`}
      className="glass-card p-5 cursor-pointer transition-all duration-300 relative"
    >
      {completed && (
        <div className="absolute top-3 right-3 bg-lime-500 text-white rounded-full p-1">
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        </div>
      )}
      <div className={`h-1.5 w-12 rounded-full bg-gradient-to-r ${categoryColor} mb-3`} />
      <h3 className="text-sm font-semibold mb-1 line-clamp-2">{lesson.title}</h3>
      <div className="flex items-center gap-1 text-xs text-slate-500 mt-2">
        <Clock className="w-3 h-3" />
        <span>{lesson.duration} min</span>
      </div>
    </motion.div>
  );
}

export default Profile;
