import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'sonner';
import {
  BookOpen, Star, TrendingUp, Sparkles, ChevronRight,
  Clock, Flame, Target, PenLine, Compass, Award
} from 'lucide-react';
import NavBar from '../components/NavBar';

const API_URL = process.env.REACT_APP_BACKEND_URL;

function Dashboard({ user }) {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [recentLessons, setRecentLessons] = useState([]);
  const [gamification, setGamification] = useState(null);
  const [progress, setProgress] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, recsRes, lessonsRes, progressRes, gamifRes] = await Promise.all([
        axios.get(`${API_URL}/api/user/stats`, { withCredentials: true }),
        axios.get(`${API_URL}/api/lessons/recommendations`, { withCredentials: true }),
        axios.get(`${API_URL}/api/lessons`, { withCredentials: true }),
        axios.get(`${API_URL}/api/progress`, { withCredentials: true }),
        axios.get(`${API_URL}/api/gamification/me`, { withCredentials: true }).catch(() => ({ data: null }))
      ]);

      setStats(statsRes.data);
      setRecommendations(recsRes.data);
      setProgress(progressRes.data);
      setGamification(gamifRes.data);

      // Get recently completed lessons (for "continue" section)
      const completedIds = progressRes.data.filter(p => p.completed).map(p => p.lesson_id);
      const notCompleted = lessonsRes.data.filter(l => !completedIds.includes(l.lesson_id));
      setRecentLessons(notCompleted.slice(0, 4));
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Error al cargar datos');
    } finally {
      setLoading(false);
    }
  };

  const isLessonCompleted = (lessonId) => progress.some(p => p.lesson_id === lessonId && p.completed);

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
            <span className="text-slate-600">Cargando...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20">
      <NavBar user={user} />

      <div className="container mx-auto px-4 sm:px-6 pt-24">
        {/* Welcome Section */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-2">
            Hola, {user?.name?.split(' ')[0] || 'Aprendiz'}!
          </h1>
          <p className="text-base text-slate-600">
            Que quieres aprender hoy en 5 minutos?
          </p>
        </motion.div>

        {/* Quick Stats + Streak */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
          <QuickStat icon={<BookOpen className="w-5 h-5" />} value={stats?.completed_lessons || 0} label="Completadas" gradient="from-sky-400 to-sky-600" />
          <QuickStat icon={<Star className="w-5 h-5" />} value={stats?.favorites_count || 0} label="Favoritos" gradient="from-pink-400 to-pink-600" />
          <QuickStat icon={<TrendingUp className="w-5 h-5" />} value={`${stats?.completion_rate || 0}%`} label="Progreso" gradient="from-lime-400 to-lime-600" />
          <QuickStat icon={<Flame className="w-5 h-5" />} value={gamification?.current_streak || 0} label="Dias de racha" gradient="from-orange-400 to-red-500" />
        </motion.div>

        {/* Gamification Summary */}
        {gamification && gamification.points > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="glass-card p-5 sm:p-6 mb-10 flex flex-col sm:flex-row items-center gap-4"
          >
            <div className="flex items-center gap-3 flex-1">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-violet-400 to-purple-500 flex items-center justify-center text-white font-bold">
                {gamification.level}
              </div>
              <div>
                <p className="text-sm font-bold">Nivel {gamification.level}</p>
                <p className="text-xs text-slate-500">{gamification.points} puntos</p>
              </div>
            </div>
            {gamification.badges && gamification.badges.length > 0 && (
              <div className="flex gap-1">
                {gamification.badges_details?.slice(0, 4).map(b => (
                  <span key={b.badge_id} title={b.name} className="text-xl">{b.icon}</span>
                ))}
                {gamification.badges.length > 4 && <span className="text-xs text-slate-500 self-center">+{gamification.badges.length - 4}</span>}
              </div>
            )}
            <button onClick={() => navigate('/profile')} className="text-sm text-violet-600 hover:text-violet-700 font-medium flex items-center gap-1" data-testid="view-profile-btn">
              Ver perfil <ChevronRight className="w-4 h-4" />
            </button>
          </motion.div>
        )}

        {/* Quick Actions */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }} className="grid grid-cols-2 gap-4 mb-10">
          <button
            onClick={() => navigate('/explore')}
            data-testid="quick-explore-btn"
            className="glass-card p-5 text-left hover:-translate-y-1 transition-all group"
          >
            <Compass className="w-8 h-8 text-sky-500 mb-3 group-hover:scale-110 transition-transform" />
            <p className="font-bold text-sm">Explorar</p>
            <p className="text-xs text-slate-500">Descubre nuevas lecciones</p>
          </button>
          <button
            onClick={() => navigate('/create-lesson')}
            data-testid="quick-create-btn"
            className="glass-card p-5 text-left hover:-translate-y-1 transition-all group"
          >
            <PenLine className="w-8 h-8 text-violet-500 mb-3 group-hover:scale-110 transition-transform" />
            <p className="font-bold text-sm">Crear leccion</p>
            <p className="text-xs text-slate-500">Comparte tu conocimiento</p>
          </button>
        </motion.div>

        {/* Recommendations */}
        {recommendations.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="mb-10">
            <div className="flex items-center gap-3 mb-5">
              <div className="bg-gradient-to-br from-purple-400 to-pink-500 p-2.5 rounded-2xl">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-bold">Recomendadas para ti</h2>
                <p className="text-xs text-slate-500">Basadas en tu historial</p>
              </div>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {recommendations.slice(0, 6).map((lesson, index) => (
                <div key={lesson.lesson_id} className="relative">
                  {index < 3 && (
                    <div className="absolute -top-2 -right-2 bg-gradient-to-br from-purple-500 to-pink-500 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full shadow-lg z-10">
                      Para ti
                    </div>
                  )}
                  <LessonCard lesson={lesson} completed={isLessonCompleted(lesson.lesson_id)} categoryColor={getCategoryColor(lesson.category_id)} index={index} />
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Continue Learning */}
        {recentLessons.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="bg-gradient-to-br from-sky-400 to-blue-500 p-2.5 rounded-2xl">
                  <Target className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-lg sm:text-xl font-bold">Pendientes</h2>
              </div>
              <button onClick={() => navigate('/explore')} className="text-sm text-sky-600 hover:text-sky-700 font-medium flex items-center gap-1" data-testid="explore-all-lessons-btn">
                Ver todas <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {recentLessons.map((lesson, index) => (
                <LessonCard key={lesson.lesson_id} lesson={lesson} completed={false} categoryColor={getCategoryColor(lesson.category_id)} index={index} />
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

function QuickStat({ icon, value, label, gradient }) {
  return (
    <div className="glass-card p-4 sm:p-5">
      <div className={`inline-flex p-2 rounded-xl bg-gradient-to-br ${gradient} mb-2`}>
        <div className="text-white">{icon}</div>
      </div>
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-xs text-slate-500">{label}</p>
    </div>
  );
}

function LessonCard({ lesson, completed, categoryColor, index }) {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.05 * index }}
      whileHover={{ y: -4 }}
      onClick={() => navigate(`/lesson/${lesson.lesson_id}`)}
      data-testid={`lesson-card-${lesson.lesson_id}`}
      className="glass-card p-5 cursor-pointer transition-all duration-300 relative"
    >
      {completed && (
        <div className="absolute top-3 right-3 bg-lime-500 text-white rounded-full p-1">
          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        </div>
      )}
      {lesson.image_url && (
        <div className="h-28 -mx-5 -mt-5 mb-3 rounded-t-3xl overflow-hidden">
          <img src={lesson.image_url} alt="" className="w-full h-full object-cover" />
        </div>
      )}
      {!lesson.image_url && <div className={`h-1.5 w-12 rounded-full bg-gradient-to-r ${categoryColor} mb-3`} />}
      <h3 className="text-sm font-semibold mb-1.5 line-clamp-2">{lesson.title}</h3>
      <p className="text-xs text-slate-500 mb-3 line-clamp-2">{lesson.description}</p>
      <div className="flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-1">
          <Clock className="w-3 h-3" />
          <span>{lesson.duration} min</span>
        </div>
        <span className="text-sky-600 font-medium">Leer</span>
      </div>
    </motion.div>
  );
}

export default Dashboard;
