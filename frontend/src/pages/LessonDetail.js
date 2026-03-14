import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'sonner';
import confetti from 'canvas-confetti';
import {
  ArrowLeft, Clock, Star, Check, Sparkles, BookOpen,
  Lightbulb, ExternalLink, Share2, ChevronDown, ChevronUp,
  Award, Target, Copy, Brain
} from 'lucide-react';
import NavBar from '../components/NavBar';
import InteractiveQuiz from '../components/InteractiveQuiz';

const API_URL = process.env.REACT_APP_BACKEND_URL;

function LessonDetail({ user }) {
  const { lessonId } = useParams();
  const navigate = useNavigate();
  const [lesson, setLesson] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [readingProgress, setReadingProgress] = useState(0);
  const [activeSection, setActiveSection] = useState(0);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const contentRef = useRef(null);

  useEffect(() => {
    fetchLessonData();
    window.scrollTo(0, 0);
  }, [lessonId]);

  useEffect(() => {
    const handleScroll = () => {
      if (!contentRef.current) return;
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = totalHeight > 0 ? (window.scrollY / totalHeight) * 100 : 0;
      setReadingProgress(Math.min(progress, 100));
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lesson]);

  const fetchLessonData = async () => {
    try {
      const [lessonRes, favoritesRes, progressRes] = await Promise.all([
        axios.get(`${API_URL}/api/lessons/${lessonId}`, { withCredentials: true }),
        axios.get(`${API_URL}/api/favorites`, { withCredentials: true }),
        axios.get(`${API_URL}/api/progress`, { withCredentials: true })
      ]);
      setLesson(lessonRes.data);
      const favIds = Array.isArray(favoritesRes.data) ? favoritesRes.data.map(l => l.lesson_id) : [];
      setIsFavorite(favIds.includes(lessonId));
      const progressItem = progressRes.data.find(p => p.lesson_id === lessonId);
      setIsCompleted(progressItem?.completed || false);
    } catch (error) {
      console.error('Error fetching lesson:', error);
      toast.error('Error al cargar la leccion');
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorite = async () => {
    try {
      if (isFavorite) {
        await axios.delete(`${API_URL}/api/favorites/${lessonId}`, { withCredentials: true });
        toast.success('Eliminado de favoritos');
      } else {
        await axios.post(`${API_URL}/api/favorites/${lessonId}`, {}, { withCredentials: true });
        toast.success('Agregado a favoritos');
      }
      setIsFavorite(!isFavorite);
    } catch (error) {
      toast.error('Error al actualizar favoritos');
    }
  };

  const markAsCompleted = async () => {
    try {
      const response = await axios.put(
        `${API_URL}/api/progress/${lessonId}`,
        { completed: true },
        { withCredentials: true }
      );
      setIsCompleted(true);
      confetti({ particleCount: 150, spread: 100, origin: { y: 0.6 } });
      if (response.data.gamification) {
        const { points, level, streak } = response.data.gamification;
        toast.success(`+${points} puntos | Nivel ${level} | Racha: ${streak} dias`, { duration: 5000 });
      } else {
        toast.success('Leccion completada!');
      }
    } catch (error) {
      toast.error('Error al actualizar progreso');
    }
  };

  const handleQuizComplete = (score) => {
    if (score >= 70 && !isCompleted) {
      markAsCompleted();
    } else if (score < 70) {
      toast.info('Necesitas 70% para completar. Intentalo de nuevo!');
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    const text = `Aprendi sobre "${lesson.title}" en MicroSkill!`;
    if (navigator.share) {
      try { await navigator.share({ title: lesson.title, text, url }); } catch {}
    } else {
      await navigator.clipboard.writeText(url);
      toast.success('Link copiado al portapapeles');
    }
    setShowShareMenu(false);
  };

  const getCategoryColor = (categoryId) => {
    const colors = {
      'cat_negotiation': { gradient: 'from-sky-400 to-sky-600', bg: 'bg-sky-50', text: 'text-sky-700', border: 'border-sky-200' },
      'cat_psychology': { gradient: 'from-pink-400 to-pink-600', bg: 'bg-pink-50', text: 'text-pink-700', border: 'border-pink-200' },
      'cat_finance': { gradient: 'from-lime-400 to-lime-600', bg: 'bg-lime-50', text: 'text-lime-700', border: 'border-lime-200' },
      'cat_science': { gradient: 'from-purple-400 to-purple-600', bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
      'cat_productivity': { gradient: 'from-amber-400 to-amber-600', bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
      'cat_health': { gradient: 'from-emerald-400 to-emerald-600', bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
      'cat_creativity': { gradient: 'from-violet-400 to-violet-600', bg: 'bg-violet-50', text: 'text-violet-700', border: 'border-violet-200' },
      'cat_leadership': { gradient: 'from-rose-400 to-rose-600', bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200' }
    };
    return colors[categoryId] || { gradient: 'from-slate-400 to-slate-600', bg: 'bg-slate-50', text: 'text-slate-700', border: 'border-slate-200' };
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="glass-card p-8">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 border-4 border-sky-400 border-t-transparent rounded-full animate-spin" />
            <span className="text-slate-600">Cargando leccion...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="glass-card p-8 text-center">
          <p className="text-lg text-slate-600">Leccion no encontrada</p>
          <button onClick={() => navigate('/dashboard')} className="mt-4 text-sky-600 hover:text-sky-700 font-medium">
            Volver al inicio
          </button>
        </div>
      </div>
    );
  }

  const cat = getCategoryColor(lesson.category_id);
  const hasQuiz = lesson.quiz && lesson.quiz.length > 0;
  const hasResources = lesson.resources && lesson.resources.length > 0;
  const hasInsights = lesson.insights && lesson.insights.length > 0;

  return (
    <div className="min-h-screen pb-20">
      <NavBar user={user} />

      {/* Reading Progress Bar */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-slate-200/50 z-[60]">
        <motion.div
          className={`h-full bg-gradient-to-r ${cat.gradient}`}
          style={{ width: `${readingProgress}%` }}
          transition={{ duration: 0.1 }}
        />
      </div>

      <div className="container mx-auto px-4 sm:px-6 pt-24" ref={contentRef}>
        {/* Back Button */}
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => navigate(-1)}
          data-testid="back-button"
          className="flex items-center gap-2 text-slate-600 hover:text-slate-800 mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="font-medium">Volver</span>
        </motion.button>

        <div className="max-w-4xl mx-auto">
          {/* Hero Section */}
          {lesson.image_url ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative rounded-3xl overflow-hidden mb-8 h-72 sm:h-96"
            >
              <img src={lesson.image_url} alt={lesson.title} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent flex items-end">
                <div className="p-6 sm:p-8 text-white w-full">
                  <div className={`inline-block px-4 py-1.5 rounded-full bg-gradient-to-r ${cat.gradient} text-sm font-semibold mb-3`}>
                    <Clock className="w-3.5 h-3.5 inline mr-1.5" />{lesson.duration} min
                  </div>
                  <h1 data-testid="lesson-title" className="text-2xl sm:text-4xl lg:text-5xl font-bold leading-tight">
                    {lesson.title}
                  </h1>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card p-6 sm:p-8 mb-8"
            >
              <div className={`h-2 w-20 rounded-full bg-gradient-to-r ${cat.gradient} mb-5`} />
              <h1 data-testid="lesson-title" className="text-2xl sm:text-4xl font-bold mb-3">{lesson.title}</h1>
              <p className="text-base text-slate-600">{lesson.description}</p>
            </motion.div>
          )}

          {/* Action Bar */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex flex-wrap items-center gap-3 mb-8"
          >
            <div className="flex items-center gap-1.5 text-slate-500 text-sm">
              <Clock className="w-4 h-4" />
              <span>{lesson.duration} min</span>
            </div>

            <button
              onClick={toggleFavorite}
              data-testid="favorite-button"
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                isFavorite ? 'bg-pink-100 text-pink-600' : 'bg-white/60 backdrop-blur-sm border border-slate-200 text-slate-600 hover:border-pink-300 hover:text-pink-600'
              }`}
            >
              <Star className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
              {isFavorite ? 'Guardado' : 'Guardar'}
            </button>

            {!isCompleted && (
              <button
                onClick={markAsCompleted}
                data-testid="complete-button"
                className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium glossy-button"
              >
                <Check className="w-4 h-4" />
                Completar
              </button>
            )}
            {isCompleted && (
              <div data-testid="completed-badge" className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-lime-100 text-lime-700 text-sm font-medium">
                <Check className="w-4 h-4" />
                Completada
              </div>
            )}

            <button
              onClick={handleShare}
              data-testid="share-button"
              className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/60 backdrop-blur-sm border border-slate-200 text-slate-600 hover:border-sky-300 hover:text-sky-600 text-sm font-medium transition-all"
            >
              <Share2 className="w-4 h-4" />
              Compartir
            </button>
          </motion.div>

          {/* Section Navigation */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="flex gap-2 mb-8 overflow-x-auto pb-2 scrollbar-hide"
          >
            {['Contenido', hasInsights && 'Insights', hasResources && 'Recursos', hasQuiz && 'Quiz'].filter(Boolean).map((name, i) => (
              <button
                key={name}
                onClick={() => setActiveSection(i)}
                data-testid={`section-tab-${i}`}
                className={`px-5 py-2.5 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                  activeSection === i
                    ? `bg-gradient-to-r ${cat.gradient} text-white shadow-lg`
                    : 'bg-white/60 backdrop-blur-sm border border-slate-200 text-slate-600 hover:border-sky-300'
                }`}
              >
                {name}
              </button>
            ))}
          </motion.div>

          {/* Content Sections */}
          <AnimatePresence mode="wait">
            {activeSection === 0 && (
              <motion.div
                key="content"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-8"
              >
                {/* Key Points */}
                {lesson.content?.key_points && (
                  <div className="glass-card p-6 sm:p-8" data-testid="key-points-section">
                    <h2 className="text-lg sm:text-xl font-bold mb-5 flex items-center gap-2">
                      <div className={`p-2 rounded-xl bg-gradient-to-br ${cat.gradient}`}>
                        <Sparkles className="w-5 h-5 text-white" />
                      </div>
                      Puntos clave
                    </h2>
                    <div className="space-y-4">
                      {lesson.content.key_points.map((point, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -15 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.08 * index }}
                          className="flex gap-4"
                        >
                          <div className={`flex-shrink-0 w-8 h-8 rounded-xl bg-gradient-to-br ${cat.gradient} text-white flex items-center justify-center font-bold text-sm`}>
                            {index + 1}
                          </div>
                          <p className="text-slate-700 leading-relaxed flex-1 text-sm sm:text-base">{point}</p>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Practical Examples */}
                {lesson.content?.practical_examples && lesson.content.practical_examples.length > 0 && (
                  <div className="glass-card p-6 sm:p-8" data-testid="examples-section">
                    <h2 className="text-lg sm:text-xl font-bold mb-5 flex items-center gap-2">
                      <div className="p-2 rounded-xl bg-gradient-to-br from-lime-400 to-emerald-500">
                        <BookOpen className="w-5 h-5 text-white" />
                      </div>
                      Ejemplos practicos
                    </h2>
                    <div className="space-y-4">
                      {lesson.content.practical_examples.map((example, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, y: 15 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.15 + 0.1 * index }}
                          className={`${cat.bg} border ${cat.border} rounded-2xl p-5`}
                        >
                          <p className="text-slate-700 leading-relaxed text-sm sm:text-base italic">"{example}"</p>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Conclusion */}
                {lesson.content?.conclusion && (
                  <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="glass-card p-6 sm:p-8 bg-gradient-to-br from-sky-50/80 to-lime-50/80"
                    data-testid="conclusion-section"
                  >
                    <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
                      <Target className="w-5 h-5 text-sky-600" />
                      Conclusion
                    </h3>
                    <p className="text-slate-700 leading-relaxed text-sm sm:text-base">{lesson.content.conclusion}</p>
                  </motion.div>
                )}
              </motion.div>
            )}

            {/* Insights Section */}
            {activeSection === 1 && hasInsights && (
              <motion.div
                key="insights"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="glass-card p-6 sm:p-8"
                data-testid="insights-section"
              >
                <h2 className="text-lg sm:text-xl font-bold mb-6 flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500">
                    <Lightbulb className="w-5 h-5 text-white" />
                  </div>
                  Datos curiosos
                </h2>
                <div className="space-y-4">
                  {lesson.insights.map((insight, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.1 * index }}
                      className="flex gap-4 p-4 rounded-2xl bg-amber-50/80 border border-amber-200"
                    >
                      <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
                        <Lightbulb className="w-5 h-5 text-white" />
                      </div>
                      <p className="text-slate-700 leading-relaxed flex-1 text-sm sm:text-base">{insight}</p>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Resources Section */}
            {activeSection === (hasInsights ? 2 : 1) && hasResources && (
              <motion.div
                key="resources"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="glass-card p-6 sm:p-8"
                data-testid="resources-section"
              >
                <h2 className="text-lg sm:text-xl font-bold mb-6 flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-gradient-to-br from-blue-400 to-indigo-500">
                    <ExternalLink className="w-5 h-5 text-white" />
                  </div>
                  Profundiza mas
                </h2>
                <div className="space-y-3">
                  {lesson.resources.map((resource, index) => (
                    <motion.a
                      key={index}
                      href={resource.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 * index }}
                      data-testid={`resource-link-${index}`}
                      className="flex items-start gap-4 p-4 rounded-2xl border border-slate-200 bg-white/50 hover:bg-sky-50 hover:border-sky-300 transition-all group cursor-pointer"
                    >
                      <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <ExternalLink className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-slate-800 group-hover:text-sky-700 transition-colors text-sm sm:text-base">
                          {resource.title}
                        </h4>
                        {resource.description && (
                          <p className="text-xs sm:text-sm text-slate-500 mt-1">{resource.description}</p>
                        )}
                      </div>
                      <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-sky-500 flex-shrink-0 mt-1" />
                    </motion.a>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Quiz Section */}
            {activeSection === [true, hasInsights, hasResources, hasQuiz].filter(Boolean).length - 1 && hasQuiz && (
              <motion.div
                key="quiz"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                data-testid="quiz-section"
              >
                <div className="mb-4 flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-gradient-to-br from-violet-400 to-purple-500">
                    <Brain className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="text-lg sm:text-xl font-bold">Pon a prueba lo aprendido</h2>
                </div>
                <InteractiveQuiz
                  questions={lesson.quiz}
                  onComplete={handleQuizComplete}
                  lessonId={lessonId}
                />
                {isCompleted && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center text-lime-600 font-medium mt-4"
                  >
                    Ya completaste esta leccion. El quiz es solo para repaso.
                  </motion.p>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Complete CTA at bottom */}
          {!isCompleted && !hasQuiz && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mt-10 text-center"
            >
              <button
                onClick={markAsCompleted}
                data-testid="complete-cta-button"
                className="glossy-button text-base px-10"
              >
                <Check className="w-5 h-5 inline mr-2" />
                Marcar como completada
              </button>
            </motion.div>
          )}

          {!isCompleted && hasQuiz && activeSection !== [true, hasInsights, hasResources, hasQuiz].filter(Boolean).length - 1 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mt-10 text-center"
            >
              <button
                onClick={() => setActiveSection([true, hasInsights, hasResources, hasQuiz].filter(Boolean).length - 1)}
                data-testid="go-to-quiz-button"
                className="glossy-button text-base px-10"
              >
                <Brain className="w-5 h-5 inline mr-2" />
                Ir al Quiz para completar
              </button>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}

export default LessonDetail;
