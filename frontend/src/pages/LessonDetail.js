import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'sonner';
import { ArrowLeft, Clock, Star, Check, Sparkles, BookOpen } from 'lucide-react';
import NavBar from '../components/NavBar';

const API_URL = process.env.REACT_APP_BACKEND_URL;

function LessonDetail({ user }) {
  const { lessonId } = useParams();
  const navigate = useNavigate();
  const [lesson, setLesson] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLessonData();
  }, [lessonId]);

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

  const toggleCompleted = async () => {
    try {
      await axios.put(
        `${API_URL}/api/progress/${lessonId}`,
        { completed: !isCompleted },
        { withCredentials: true }
      );
      setIsCompleted(!isCompleted);
      toast.success(isCompleted ? 'Marcado como no completado' : '¡Lección completada! 🎉');
    } catch (error) {
      toast.error('Error al actualizar progreso');
    }
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

  return (
    <div className="min-h-screen pb-20">
      <NavBar user={user} />
      
      <div className="container mx-auto px-6 pt-24">
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
          {/* Header Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-8 mb-8"
          >
            <div className={`h-3 w-24 rounded-full bg-gradient-to-r ${getCategoryColor(lesson.category_id)} mb-6`}></div>
            
            <h1 className="text-3xl md:text-4xl font-bold mb-4">{lesson.title}</h1>
            <p className="text-lg text-slate-600 mb-6">{lesson.description}</p>
            
            <div className="flex flex-wrap items-center gap-4">
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
                <span className="font-medium">{isFavorite ? 'En favoritos' : 'Guardar'}</span>
              </button>
              
              <button
                onClick={toggleCompleted}
                data-testid="complete-button"
                className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${
                  isCompleted
                    ? 'bg-lime-100 text-lime-600'
                    : 'glossy-button'
                }`}
              >
                <Check className="w-5 h-5" />
                <span className="font-medium">{isCompleted ? 'Completada' : 'Marcar como completada'}</span>
              </button>
            </div>
          </motion.div>

          {/* Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-card p-8 space-y-8"
          >
            {/* Key Points */}
            {lesson.content.key_points && (
              <div>
                <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                  <Sparkles className="w-6 h-6 text-sky-500" />
                  Puntos clave
                </h2>
                <div className="space-y-4">
                  {lesson.content.key_points.map((point, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.05 * index }}
                      className="flex gap-4"
                    >
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-sky-400 to-sky-600 text-white flex items-center justify-center font-bold">
                        {index + 1}
                      </div>
                      <p className="text-slate-700 leading-relaxed flex-1">{point}</p>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* Practical Examples */}
            {lesson.content.practical_examples && lesson.content.practical_examples.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                  <BookOpen className="w-6 h-6 text-lime-500" />
                  Ejemplos prácticos
                </h2>
                <div className="space-y-4">
                  {lesson.content.practical_examples.map((example, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 + 0.1 * index }}
                      className="bg-lime-50/50 border border-lime-200 rounded-2xl p-6"
                    >
                      <p className="text-slate-700 leading-relaxed italic">“{example}”</p>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* Conclusion */}
            {lesson.content.conclusion && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-gradient-to-br from-sky-50 to-lime-50 border border-sky-200 rounded-2xl p-6"
              >
                <h3 className="text-xl font-bold mb-3 text-sky-900">Conclusión</h3>
                <p className="text-slate-700 leading-relaxed">{lesson.content.conclusion}</p>
              </motion.div>
            )}
          </motion.div>

          {/* Complete CTA */}
          {!isCompleted && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mt-8 text-center"
            >
              <button
                onClick={toggleCompleted}
                data-testid="complete-cta-button"
                className="glossy-button text-lg"
              >
                ¡Marcar como completada! 🎉
              </button>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}

export default LessonDetail;