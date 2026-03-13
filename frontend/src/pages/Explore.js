import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'sonner';
import { Search, Clock, Filter, BookOpen, Grid3X3, List, Brain } from 'lucide-react';
import NavBar from '../components/NavBar';

const API_URL = process.env.REACT_APP_BACKEND_URL;

function Explore({ user }) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [categories, setCategories] = useState([]);
  const [lessons, setLessons] = useState([]);
  const [filteredLessons, setFilteredLessons] = useState([]);
  const [progress, setProgress] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'all');
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid');

  useEffect(() => { fetchData(); }, []);
  useEffect(() => { filterLessons(); }, [searchQuery, selectedCategory, lessons]);

  const fetchData = async () => {
    try {
      const [categoriesRes, lessonsRes, progressRes] = await Promise.all([
        axios.get(`${API_URL}/api/categories`, { withCredentials: true }),
        axios.get(`${API_URL}/api/lessons`, { withCredentials: true }),
        axios.get(`${API_URL}/api/progress`, { withCredentials: true })
      ]);
      setCategories(categoriesRes.data);
      setLessons(lessonsRes.data);
      setProgress(progressRes.data);
    } catch (error) {
      toast.error('Error al cargar datos');
    } finally {
      setLoading(false);
    }
  };

  const filterLessons = () => {
    let filtered = lessons;
    if (selectedCategory !== 'all') filtered = filtered.filter(l => l.category_id === selectedCategory);
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(l => l.title.toLowerCase().includes(q) || l.description.toLowerCase().includes(q));
    }
    setFilteredLessons(filtered);
  };

  const isLessonCompleted = (lessonId) => progress.some(p => p.lesson_id === lessonId && p.completed);

  const getCategoryColor = (categoryId) => {
    const colors = { 'cat_negotiation': 'from-sky-400 to-sky-600', 'cat_psychology': 'from-pink-400 to-pink-600', 'cat_finance': 'from-lime-400 to-lime-600', 'cat_science': 'from-purple-400 to-purple-600', 'cat_productivity': 'from-amber-400 to-amber-600', 'cat_health': 'from-emerald-400 to-emerald-600', 'cat_creativity': 'from-violet-400 to-violet-600', 'cat_leadership': 'from-rose-400 to-rose-600' };
    return colors[categoryId] || 'from-slate-400 to-slate-600';
  };

  const getCategoryIcon = (iconName) => {
    const icons = { 'handshake': '🤝', 'brain': '🧠', 'dollar-sign': '💰', 'atom': '⚛️', 'rocket': '🚀', 'heart': '❤️', 'lightbulb': '💡', 'users': '👥' };
    return icons[iconName] || '📚';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="glass-card p-8">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 border-4 border-sky-400 border-t-transparent rounded-full animate-spin" />
            <span>Cargando...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20">
      <NavBar user={user} />

      <div className="container mx-auto px-4 sm:px-6 pt-24">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-2 flex items-center gap-3">
            <BookOpen className="w-8 h-8 sm:w-10 sm:h-10 text-sky-500" />
            Biblioteca
          </h1>
          <p className="text-base text-slate-600">Todas las micro-lecciones disponibles</p>
        </motion.div>

        {/* Search + View Toggle */}
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="flex items-center gap-3 mb-6">
          <div className="relative flex-1 max-w-xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar lecciones..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              data-testid="search-input"
              className="glass-input w-full pl-10 text-sm"
            />
          </div>
          <div className="flex bg-white/60 backdrop-blur-sm border border-slate-200 rounded-xl overflow-hidden">
            <button onClick={() => setViewMode('grid')} data-testid="view-grid" className={`p-2.5 transition-colors ${viewMode === 'grid' ? 'bg-sky-100 text-sky-600' : 'text-slate-400'}`}>
              <Grid3X3 className="w-4 h-4" />
            </button>
            <button onClick={() => setViewMode('list')} data-testid="view-list" className={`p-2.5 transition-colors ${viewMode === 'list' ? 'bg-sky-100 text-sky-600' : 'text-slate-400'}`}>
              <List className="w-4 h-4" />
            </button>
          </div>
        </motion.div>

        {/* Category Quick Filters */}
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-8">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedCategory('all')}
              data-testid="filter-all"
              className={`px-4 py-2 rounded-full text-xs sm:text-sm font-medium transition-all ${
                selectedCategory === 'all'
                  ? 'bg-gradient-to-r from-sky-400 to-sky-600 text-white shadow-lg'
                  : 'bg-white/60 border border-slate-200 text-slate-600 hover:border-sky-300'
              }`}
            >
              Todas ({lessons.length})
            </button>
            {categories.map(cat => {
              const count = lessons.filter(l => l.category_id === cat.category_id).length;
              return (
                <button
                  key={cat.category_id}
                  onClick={() => setSelectedCategory(cat.category_id)}
                  data-testid={`filter-${cat.slug}`}
                  className={`px-4 py-2 rounded-full text-xs sm:text-sm font-medium transition-all flex items-center gap-1.5 ${
                    selectedCategory === cat.category_id
                      ? `bg-gradient-to-r ${getCategoryColor(cat.category_id)} text-white shadow-lg`
                      : 'bg-white/60 border border-slate-200 text-slate-600 hover:border-sky-300'
                  }`}
                >
                  <span>{getCategoryIcon(cat.icon)}</span>
                  <span>{cat.name}</span>
                  <span className="text-[10px] opacity-70">({count})</span>
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* Results Count */}
        <p className="text-xs text-slate-500 mb-4" data-testid="results-count">
          {filteredLessons.length} {filteredLessons.length === 1 ? 'leccion' : 'lecciones'}
        </p>

        {/* Results */}
        {filteredLessons.length === 0 ? (
          <div className="glass-card p-10 text-center">
            <Brain className="w-14 h-14 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-600 font-medium">No se encontraron lecciones</p>
            <p className="text-sm text-slate-400 mt-1">Intenta con otra busqueda o filtro</p>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredLessons.map((lesson, index) => (
              <GridCard key={lesson.lesson_id} lesson={lesson} completed={isLessonCompleted(lesson.lesson_id)} categoryColor={getCategoryColor(lesson.category_id)} index={index} onClick={() => navigate(`/lesson/${lesson.lesson_id}`)} />
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredLessons.map((lesson, index) => (
              <ListCard key={lesson.lesson_id} lesson={lesson} completed={isLessonCompleted(lesson.lesson_id)} categoryColor={getCategoryColor(lesson.category_id)} index={index} onClick={() => navigate(`/lesson/${lesson.lesson_id}`)} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function GridCard({ lesson, completed, categoryColor, index, onClick }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.03 * index }}
      whileHover={{ y: -4 }}
      onClick={onClick}
      data-testid={`lesson-card-${lesson.lesson_id}`}
      className="glass-card overflow-hidden cursor-pointer transition-all duration-300 relative"
    >
      {completed && (
        <div className="absolute top-3 right-3 bg-lime-500 text-white rounded-full p-1 z-10">
          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        </div>
      )}
      {lesson.image_url && (
        <div className="h-32 overflow-hidden">
          <img src={lesson.image_url} alt="" className="w-full h-full object-cover" />
        </div>
      )}
      <div className="p-5">
        {!lesson.image_url && <div className={`h-1.5 w-12 rounded-full bg-gradient-to-r ${categoryColor} mb-3`} />}
        <h3 className="text-sm font-semibold mb-1.5 line-clamp-2">{lesson.title}</h3>
        <p className="text-xs text-slate-500 mb-3 line-clamp-2">{lesson.description}</p>
        <div className="flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            <span>{lesson.duration} min</span>
          </div>
          {lesson.quiz?.length > 0 && (
            <span className="flex items-center gap-1 text-violet-500">
              <Brain className="w-3 h-3" /> Quiz
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function ListCard({ lesson, completed, categoryColor, index, onClick }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.03 * index }}
      onClick={onClick}
      data-testid={`lesson-card-${lesson.lesson_id}`}
      className="glass-card p-4 flex items-center gap-4 cursor-pointer hover:-translate-y-1 transition-all"
    >
      {lesson.image_url ? (
        <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0">
          <img src={lesson.image_url} alt="" className="w-full h-full object-cover" />
        </div>
      ) : (
        <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${categoryColor} flex-shrink-0`} />
      )}
      <div className="flex-1 min-w-0">
        <h3 className="text-sm font-semibold line-clamp-1">{lesson.title}</h3>
        <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">{lesson.description}</p>
        <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-400">
          <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{lesson.duration} min</span>
          {lesson.quiz?.length > 0 && <span className="text-violet-500">Quiz</span>}
        </div>
      </div>
      {completed && (
        <div className="bg-lime-500 text-white rounded-full p-1 flex-shrink-0">
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        </div>
      )}
    </motion.div>
  );
}

export default Explore;
