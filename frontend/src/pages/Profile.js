import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'sonner';
import { 
  User, Star, BookOpen, TrendingUp, Clock, 
  Sparkles, Award, Target, Zap
} from 'lucide-react';
import NavBar from '../components/NavBar';

const API_URL = process.env.REACT_APP_BACKEND_URL;

function Profile({ user }) {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [progress, setProgress] = useState([]);
  const [completedLessons, setCompletedLessons] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    try {
      const [statsRes, favoritesRes, progressRes] = await Promise.all([
        axios.get(`${API_URL}/api/user/stats`, { withCredentials: true }),
        axios.get(`${API_URL}/api/favorites`, { withCredentials: true }),
        axios.get(`${API_URL}/api/progress`, { withCredentials: true })
      ]);
      
      setStats(statsRes.data);
      setFavorites(favoritesRes.data);
      
      const completed = progressRes.data.filter(p => p.completed);
      setProgress(progressRes.data);
      
      // Fetch lesson details for completed lessons
      if (completed.length > 0) {
        const lessonIds = completed.map(p => p.lesson_id);
        const lessonsRes = await axios.get(`${API_URL}/api/lessons`, { withCredentials: true });
        const completedLessonsList = lessonsRes.data.filter(l => lessonIds.includes(l.lesson_id));
        setCompletedLessons(completedLessonsList);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast.error('Error al cargar perfil');
    } finally {
      setLoading(false);
    }
  };

  const getCategoryColor = (categoryId) => {
    const colors = {
      'cat_negotiation': 'from-sky-400 to-sky-600',
      'cat_psychology': 'from-pink-400 to-pink-600',
      'cat_finance': 'from-lime-400 to-lime-600',
      'cat_science': 'from-purple-400 to-purple-600',
      'cat_productivity': 'from-amber-400 to-amber-600',
      'cat_health': 'from-emerald-400 to-emerald-600',
      'cat_creativity': 'from-violet-400 to-violet-600',
      'cat_leadership': 'from-rose-400 to-rose-600'
    };
    return colors[categoryId] || 'from-slate-400 to-slate-600';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="glass-card p-8">
          <div className="animate-pulse">Cargando perfil...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20">
      <NavBar user={user} />
      
      <div className="container mx-auto px-6 pt-24">
        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-8 mb-8"
        >
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-sky-400 to-lime-400 p-1">
              {user?.picture ? (
                <img 
                  src={user.picture} 
                  alt={user.name} 
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <div className="w-full h-full rounded-full bg-white flex items-center justify-center">
                  <User className="w-12 h-12 text-sky-500" />
                </div>
              )}
            </div>
            
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-3xl md:text-4xl font-bold mb-2">{user?.name}</h1>
              <p className="text-slate-600">{user?.email}</p>
              <div className="flex items-center justify-center md:justify-start gap-2 mt-3">
                <Award className="w-5 h-5 text-lime-500" />
                <span className="text-sm font-medium text-slate-700">
                  {stats?.completed_lessons || 0} lecciones completadas
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid md:grid-cols-4 gap-6 mb-12"
        >
          <StatCard
            icon={<BookOpen className="w-6 h-6" />}
            label="Completadas"
            value={stats?.completed_lessons || 0}
            color="from-sky-400 to-sky-600"
          />
          <StatCard
            icon={<Star className="w-6 h-6" />}
            label="Favoritos"
            value={stats?.favorites_count || 0}
            color="from-pink-400 to-pink-600"
          />
          <StatCard
            icon={<TrendingUp className="w-6 h-6" />}
            label="Progreso"
            value={`${stats?.completion_rate || 0}%`}
            color="from-lime-400 to-lime-600"
          />
          <StatCard
            icon={<Zap className="w-6 h-6" />}
            label="Total lecciones"
            value={stats?.total_lessons || 0}
            color="from-purple-400 to-purple-600"
          />
        </motion.div>

        {/* Progress Ring */}
        {stats && stats.completion_rate > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="glass-card p-8 mb-12 text-center"
          >
            <h2 className="text-2xl font-bold mb-6 flex items-center justify-center gap-2">
              <Target className="w-6 h-6 text-sky-500" />
              Tu progreso de aprendizaje
            </h2>
            <div className="relative inline-flex items-center justify-center">
              <svg className="w-48 h-48 transform -rotate-90">
                <circle
                  cx="96"
                  cy="96"
                  r="88"
                  stroke="#E0F2FE"
                  strokeWidth="12"
                  fill="none"
                />
                <circle
                  cx="96"
                  cy="96"
                  r="88"
                  stroke="url(#gradient)"
                  strokeWidth="12"
                  fill="none"
                  strokeDasharray={`${2 * Math.PI * 88}`}
                  strokeDashoffset={`${2 * Math.PI * 88 * (1 - stats.completion_rate / 100)}`}
                  strokeLinecap="round"
                  className="transition-all duration-1000"
                />
                <defs>
                  <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#0EA5E9" />
                    <stop offset="100%" stopColor="#84CC16" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl font-bold bg-gradient-to-r from-sky-600 to-lime-600 bg-clip-text text-transparent">
                  {stats.completion_rate}%
                </span>
                <span className="text-sm text-slate-600">Completado</span>
              </div>
            </div>
            <p className="mt-6 text-slate-600">
              ¡Sigue así! Has completado {stats.completed_lessons} de {stats.total_lessons} lecciones
            </p>
          </motion.div>
        )}

        {/* Favorites Section */}
        {favorites.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-12"
          >
            <h2 className="text-2xl md:text-3xl font-semibold mb-6 flex items-center gap-2">
              <Star className="w-6 h-6 text-pink-500 fill-current" />
              Tus favoritos
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {favorites.map((lesson, index) => (
                <LessonCard
                  key={lesson.lesson_id}
                  lesson={lesson}
                  categoryColor={getCategoryColor(lesson.category_id)}
                  index={index}
                  onClick={() => navigate(`/lesson/${lesson.lesson_id}`)}
                />
              ))}
            </div>
          </motion.div>
        )}

        {/* Completed Lessons */}
        {completedLessons.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <h2 className="text-2xl md:text-3xl font-semibold mb-6 flex items-center gap-2">
              <BookOpen className="w-6 h-6 text-lime-500" />
              Lecciones completadas
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {completedLessons.map((lesson, index) => (
                <LessonCard
                  key={lesson.lesson_id}
                  lesson={lesson}
                  completed={true}
                  categoryColor={getCategoryColor(lesson.category_id)}
                  index={index}
                  onClick={() => navigate(`/lesson/${lesson.lesson_id}`)}
                />
              ))}
            </div>
          </motion.div>
        )}

        {/* Empty State */}
        {favorites.length === 0 && completedLessons.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="glass-card p-12 text-center"
          >
            <Sparkles className="w-16 h-16 text-sky-400 mx-auto mb-4" />
            <h3 className="text-2xl font-bold mb-3">¡Comienza tu viaje de aprendizaje!</h3>
            <p className="text-slate-600 mb-6">
              Completa tu primera lección y guarda tus favoritas para verlas aquí
            </p>
            <button
              onClick={() => navigate('/explore')}
              data-testid="explore-from-profile-btn"
              className="glossy-button"
            >
              Explorar lecciones
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, color }) {
  return (
    <div className="glass-card p-6 hover:-translate-y-1 transition-all duration-300">
      <div className={`inline-flex p-3 rounded-2xl bg-gradient-to-br ${color} mb-3`}>
        <div className="text-white">{icon}</div>
      </div>
      <p className="text-sm text-slate-600 mb-1">{label}</p>
      <p className="text-3xl font-bold">{value}</p>
    </div>
  );
}

function LessonCard({ lesson, completed, categoryColor, index, onClick }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.05 * index }}
      whileHover={{ y: -5 }}
      onClick={onClick}
      data-testid={`profile-lesson-card-${lesson.lesson_id}`}
      className="glass-card p-6 cursor-pointer hover:-translate-y-1 transition-all duration-300 relative"
    >
      {completed && (
        <div className="absolute top-4 right-4 bg-lime-500 text-white rounded-full p-1.5">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        </div>
      )}
      
      <div className={`h-2 w-16 rounded-full bg-gradient-to-r ${categoryColor} mb-4`}></div>
      
      <h3 className="text-lg font-semibold mb-2 line-clamp-2">{lesson.title}</h3>
      <p className="text-sm text-slate-600 mb-4 line-clamp-2">{lesson.description}</p>
      
      <div className="flex items-center justify-between text-sm text-slate-500">
        <div className="flex items-center gap-1">
          <Clock className="w-4 h-4" />
          <span>{lesson.duration} min</span>
        </div>
        <span className="text-sky-600 font-medium">Leer →</span>
      </div>
    </motion.div>
  );
}

export default Profile;
