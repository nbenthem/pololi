import React, { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'sonner';
import confetti from 'canvas-confetti';
import { 
  ArrowLeft, Clock, Star, Check, Sparkles, BookOpen, 
  Lightbulb, ExternalLink, Share2, Volume2, TrendingUp,
  Award, Target
} from 'lucide-react';
import { TwitterShareButton, LinkedinShareButton, WhatsappShareButton } from 'react-share';
import NavBar from '../components/NavBar';
import InteractiveQuiz from '../components/InteractiveQuiz';

const API_URL = process.env.REACT_APP_BACKEND_URL;

function LessonDetailEnhanced({ user }) {
  const { lessonId } = useParams();
  const navigate = useNavigate();
  const [lesson, setLesson] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [readingProgress, setReadingProgress] = useState(0);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const contentRef = useRef(null);

  useEffect(() => {
    fetchLessonData();
  }, [lessonId]);

  useEffect(() => {
    const handleScroll = () => {
      if (!contentRef.current) return;
      
      const element = contentRef.current;
      const totalHeight = element.scrollHeight - element.clientHeight;
      const progress = (window.scrollY / totalHeight) * 100;
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
      setIsFavorite(favoritesRes.data.some(l => l.lesson_id === lessonId));
      
      const progressItem = progressRes.data.find(p => p.lesson_id === lessonId);
      setIsCompleted(progressItem?.completed || false);
    } catch (error) {
      console.error('Error fetching lesson:', error);
      toast.error('Error al cargar la lección');
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
        toast.success('Añadido a favoritos');
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
      
      // Confetti celebration
      confetti({
        particleCount: 150,
        spread: 100,
        origin: { y: 0.6 }
      });
      
      // Show gamification reward if available
      if (response.data.gamification) {
        const { points, level, streak } = response.data.gamification;
        toast.success(`¡Lección completada! +${points} puntos | Nivel ${level} | Racha: ${streak} días 🔥`, {
          duration: 5000
        });
      } else {
        toast.success('¡Lección completada! 🎉');
      }
    } catch (error) {
      toast.error('Error al actualizar progreso');
    }
  };

  const handleQuizComplete = (score) => {
    if (score >= 80 && !isCompleted) {
      markAsCompleted();
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
          <div className="animate-pulse">Cargando lección...</div>
        </div>
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="glass-card p-8 text-center">
          <p className="text-lg text-slate-600">Lección no encontrada</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="mt-4 text-sky-600 hover:text-sky-700 font-medium"
          >
            Volver al inicio
          </button>
        </div>
      </div>
    );
  }

  const shareUrl = window.location.href;
  const shareTitle = `¡Acabo de aprender sobre "${lesson.title}" en MicroSkill!`;

  return (
    <div className="min-h-screen pb-20">
      <NavBar user={user} />
      
      {/* Reading Progress Bar */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-slate-200 z-50">
        <motion.div
          className={`h-full bg-gradient-to-r ${getCategoryColor(lesson.category_id)}`}
          style={{ width: `${readingProgress}%` }}
        />
      </div>

      <div className="container mx-auto px-6 pt-24" ref={contentRef}>
        {/* Back Button */}
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => navigate(-1)}
          data-testid="back-button"
          className="flex items-center gap-2 text-slate-600 hover:text-slate-800 mb-8 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="font-medium">Volver</span>
        </motion.button>

        <div className="max-w-4xl mx-auto">
          {/* Hero Image */}
          {lesson.image_url && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative rounded-3xl overflow-hidden mb-8 h-96"
            >
              <img
                src={lesson.image_url}
                alt={lesson.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end">
                <div className="p-8 text-white">
                  <div className={`inline-block px-4 py-2 rounded-full bg-gradient-to-r ${getCategoryColor(lesson.category_id)} mb-4`}>
                    <span className="font-semibold">{lesson.duration} min de lectura</span>
                  </div>
                  <h1 className="text-4xl md:text-5xl font-bold">{lesson.title}</h1>
                </div>
              </div>
            </motion.div>
          )}

          {/* Header (if no image) */}
          {!lesson.image_url && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card p-8 mb-8"
            >
              <div className={`h-3 w-24 rounded-full bg-gradient-to-r ${getCategoryColor(lesson.category_id)} mb-6`}></div>
              <h1 className="text-3xl md:text-4xl font-bold mb-4">{lesson.title}</h1>
              <p className="text-lg text-slate-600 mb-6">{lesson.description}</p>
            </motion.div>
          )}

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex flex-wrap items-center gap-4 mb-8"
          >
            <div className="flex items-center gap-2 text-slate-600">
              <Clock className="w-5 h-5" />
              <span className="font-medium">{lesson.duration} minutos</span>
            </div>
            
            <button
              onClick={toggleFavorite}
              data-testid="favorite-button"
              className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${
                isFavorite
                  ? 'bg-pink-100 text-pink-600'
                  : 'bg-slate-100 text-slate-600 hover:bg-pink-50 hover:text-pink-600'
              }`}
            >
              <Star className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
              <span className="font-medium">{isFavorite ? 'Guardado' : 'Guardar'}</span>
            </button>
            
            {!isCompleted && (
              <button
                onClick={markAsCompleted}
                data-testid="complete-button"
                className="flex items-center gap-2 glossy-button"
              >
                <Check className="w-5 h-5" />
                <span>Marcar completada</span>
              </button>
            )}

            {isCompleted && (
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-lime-100 text-lime-600">
                <Check className="w-5 h-5" />
                <span className="font-medium">Completada ✓</span>
              </div>
            )}

            <div className="relative">
              <button
                onClick={() => setShowShareMenu(!showShareMenu)}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-slate-100 hover:bg-sky-50 text-slate-600 hover:text-sky-600 transition-colors"
              >
                <Share2 className="w-5 h-5" />
                <span className="font-medium">Compartir</span>
              </button>

              {showShareMenu && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  className="absolute top-full mt-2 right-0 glass-card p-4 flex gap-3 z-10"
                >
                  <TwitterShareButton url={shareUrl} title={shareTitle}>
                    <div className="p-2 rounded-full bg-sky-100 hover:bg-sky-200 transition-colors cursor-pointer">
                      <svg className="w-5 h-5 text-sky-600" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                      </svg>
                    </div>
                  </TwitterShareButton>
                  
                  <LinkedinShareButton url={shareUrl} title={shareTitle}>
                    <div className="p-2 rounded-full bg-blue-100 hover:bg-blue-200 transition-colors cursor-pointer">
                      <svg className="w-5 h-5 text-blue-700" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                      </svg>
                    </div>
                  </LinkedinShareButton>
                  
                  <WhatsappShareButton url={shareUrl} title={shareTitle}>
                    <div className="p-2 rounded-full bg-green-100 hover:bg-green-200 transition-colors cursor-pointer">
                      <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                      </svg>
                    </div>
                  </WhatsappShareButton>
                </motion.div>
              )}
            </div>
          </motion.div>

          {/* Content sections continue in next message due to length... */}
