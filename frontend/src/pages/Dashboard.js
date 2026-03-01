import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'sonner';
import { 
  Home, Compass, User, LogOut, Search, Star, Clock, 
  TrendingUp, BookOpen, Sparkles, ChevronRight 
} from 'lucide-react';
import NavBar from '../components/NavBar';

const API_URL = process.env.REACT_APP_BACKEND_URL;

function Dashboard({ user }) {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [lessons, setLessons] = useState([]);
  const [stats, setStats] = useState(null);
  const [progress, setProgress] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [categoriesRes, lessonsRes, statsRes, progressRes] = await Promise.all([
        axios.get(`${API_URL}/api/categories`, { withCredentials: true }),
        axios.get(`${API_URL}/api/lessons`, { withCredentials: true }),
        axios.get(`${API_URL}/api/user/stats`, { withCredentials: true }),
        axios.get(`${API_URL}/api/progress`, { withCredentials: true })
      ]);
      
      setCategories(categoriesRes.data);
      setLessons(lessonsRes.data);
      setStats(statsRes.data);
      setProgress(progressRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Error al cargar datos');
    } finally {
      setLoading(false);
    }
  };

  const isLessonCompleted = (lessonId) => {
    return progress.some(p => p.lesson_id === lessonId && p.completed);
  };

  const getCategoryColor = (categoryId) => {
    const colors = {
      'cat_negotiation': 'from-sky-400 to-sky-600',
      'cat_psychology': 'from-pink-400 to-pink-600',
      'cat_finance': 'from-lime-400 to-lime-600',
      'cat_science': 'from-purple-400 to-purple-600'
    };
    return colors[categoryId] || 'from-slate-400 to-slate-600';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="glass-card p-8">
          <div className="animate-pulse flex space-x-4">
            <div className="h-12 w-12 bg-sky-400 rounded-full"></div>
            <div className="flex-1 space-y-3 py-1">
              <div className="h-4 bg-sky-400 rounded w-3/4"></div>
              <div className="h-4 bg-sky-300 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20">
      <NavBar user={user} />
      
      <div className="container mx-auto px-6 pt-24">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-3">
            ¡Hola, {user?.name?.split(' ')[0] || 'Aprendiz'}! ✨
          </h1>
          <p className="text-lg text-slate-600">
            ¿Qué quieres aprender hoy en 5 minutos?
          </p>
        </motion.div>

        {/* Stats Cards */}
        {stats && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid md:grid-cols-3 gap-6 mb-12"
          >
            <StatCard
              icon={<BookOpen className="w-6 h-6" />}
              label="Lecciones completadas"
              value={stats.completed_lessons}
              color="from-sky-400 to-sky-600"
            />
            <StatCard
              icon={<Star className="w-6 h-6" />}
              label="Favoritos"
              value={stats.favorites_count}
              color="from-pink-400 to-pink-600"
            />
            <StatCard
              icon={<TrendingUp className="w-6 h-6" />}
              label="Progreso"
              value={`${stats.completion_rate}%`}
              color="from-lime-400 to-lime-600"
            />
          </motion.div>
        )}

        {/* Categories */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-12"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl md:text-3xl font-semibold">Explora por categoría</h2>
            <button
              onClick={() => navigate('/explore')}
              data-testid="view-all-categories-btn"
              className="text-sky-600 hover:text-sky-700 font-medium flex items-center gap-1"
            >
              Ver todas <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((category, index) => (
              <motion.div
                key={category.category_id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 * index }}
                whileHover={{ scale: 1.05, y: -5 }}
                onClick={() => navigate(`/explore?category=${category.category_id}`)}
                data-testid={`category-card-${category.slug}`}
                className={`bg-gradient-to-br ${getCategoryColor(category.category_id)} p-8 rounded-3xl shadow-lg text-white cursor-pointer transition-all`}
              >
                <div className="text-4xl mb-3">{getCategoryIcon(category.icon)}</div>
                <h3 className="text-xl font-semibold mb-2">{category.name}</h3>
                <p className="text-white/80 text-sm">{category.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Recent Lessons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl md:text-3xl font-semibold">Lecciones recientes</h2>
            <button
              onClick={() => navigate('/explore')}
              data-testid="explore-all-lessons-btn"
              className="text-sky-600 hover:text-sky-700 font-medium flex items-center gap-1"
            >
              Explorar todo <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {lessons.slice(0, 6).map((lesson, index) => (
              <LessonCard
                key={lesson.lesson_id}
                lesson={lesson}
                completed={isLessonCompleted(lesson.lesson_id)}
                categoryColor={getCategoryColor(lesson.category_id)}
                index={index}
              />
            ))}
          </div>
        </motion.div>
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

function LessonCard({ lesson, completed, categoryColor, index }) {
  const navigate = useNavigate();
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 * index }}
      whileHover={{ y: -5 }}
      onClick={() => navigate(`/lesson/${lesson.lesson_id}`)}
      data-testid={`lesson-card-${lesson.lesson_id}`}
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

function getCategoryIcon(iconName) {
  const icons = {
    'handshake': '🤝',
    'brain': '🧠',
    'dollar-sign': '💰',
    'atom': '⚛️'
  };
  return icons[iconName] || '📚';
}

export default Dashboard;
