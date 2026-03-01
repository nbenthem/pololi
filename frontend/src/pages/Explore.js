import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'sonner';
import { Search, Clock, Filter, Sparkles } from 'lucide-react';
import NavBar from '../components/NavBar';

const API_URL = process.env.REACT_APP_BACKEND_URL;

function Explore({ user }) {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [categories, setCategories] = useState([]);
  const [lessons, setLessons] = useState([]);
  const [filteredLessons, setFilteredLessons] = useState([]);
  const [progress, setProgress] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    filterLessons();
  }, [searchQuery, selectedCategory, lessons]);

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
      console.error('Error fetching data:', error);
      toast.error('Error al cargar datos');
    } finally {
      setLoading(false);
    }
  };

  const filterLessons = () => {
    let filtered = lessons;

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(l => l.category_id === selectedCategory);
    }

    if (searchQuery) {
      filtered = filtered.filter(l => 
        l.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        l.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredLessons(filtered);
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
          <div className="animate-pulse">Cargando...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20">
      <NavBar user={user} />
      
      <div className="container mx-auto px-6 pt-24">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-3 flex items-center gap-3">
            <Sparkles className="w-10 h-10 text-sky-500" />
            Explora y aprende
          </h1>
          <p className="text-lg text-slate-600">
            Descubre micro-lecciones sobre temas que te apasionan
          </p>
        </motion.div>

        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <div className="relative max-w-2xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar lecciones..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              data-testid="search-input"
              className="glass-input w-full pl-12"
            />
          </div>
        </motion.div>

        {/* Category Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-12"
        >
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-5 h-5 text-slate-600" />
            <span className="text-sm font-medium text-slate-600">Filtrar por categoría:</span>
          </div>
          
          <div className="flex flex-wrap gap-3">
            <CategoryFilter
              label="Todas"
              active={selectedCategory === 'all'}
              onClick={() => setSelectedCategory('all')}
              testId="filter-all"
            />
            {categories.map(cat => (
              <CategoryFilter
                key={cat.category_id}
                label={cat.name}
                active={selectedCategory === cat.category_id}
                onClick={() => setSelectedCategory(cat.category_id)}
                color={getCategoryColor(cat.category_id)}
                testId={`filter-${cat.slug}`}
              />
            ))}
          </div>
        </motion.div>

        {/* Results */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <p className="text-sm text-slate-600 mb-6">
            Mostrando {filteredLessons.length} {filteredLessons.length === 1 ? 'lección' : 'lecciones'}
          </p>
          
          {filteredLessons.length === 0 ? (
            <div className="glass-card p-12 text-center">
              <p className="text-lg text-slate-600">No se encontraron lecciones</p>
              <p className="text-sm text-slate-500 mt-2">Intenta con otra búsqueda o filtro</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredLessons.map((lesson, index) => (
                <LessonCard
                  key={lesson.lesson_id}
                  lesson={lesson}
                  completed={isLessonCompleted(lesson.lesson_id)}
                  categoryColor={getCategoryColor(lesson.category_id)}
                  index={index}
                  onClick={() => navigate(`/lesson/${lesson.lesson_id}`)}
                />
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}

function CategoryFilter({ label, active, onClick, color, testId }) {
  return (
    <button
      onClick={onClick}
      data-testid={testId}
      className={`px-6 py-2 rounded-full font-medium transition-all ${
        active
          ? color 
            ? `bg-gradient-to-r ${color} text-white shadow-lg`
            : 'bg-gradient-to-r from-sky-400 to-sky-600 text-white shadow-lg'
          : 'bg-white/60 backdrop-blur-sm border border-slate-200 text-slate-700 hover:border-sky-300'
      }`}
    >
      {label}
    </button>
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

export default Explore;