import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Award, TrendingUp, Zap, Target } from 'lucide-react';

function GamificationModal({ isOpen, onClose, gamification }) {
  if (!isOpen || !gamification) return null;

  const { points, level, badges_details, current_streak, points_to_next_level } = gamification;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl max-h-[90vh] overflow-y-auto glass-card p-8 z-50"
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 hover:bg-slate-100 rounded-full transition-colors"
              data-testid="close-gamification-modal"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 mb-4">
                <Award className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-3xl font-bold mb-2">Tu Progreso</h2>
              <p className="text-slate-600">Estadísticas y logros de tu viaje de aprendizaje</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-4 rounded-2xl text-center">
                <Zap className="w-6 h-6 text-amber-500 mx-auto mb-2" />
                <p className="text-2xl font-bold text-amber-700">{points}</p>
                <p className="text-sm text-amber-600">Puntos</p>
              </div>
              
              <div className="bg-gradient-to-br from-sky-50 to-blue-50 p-4 rounded-2xl text-center">
                <TrendingUp className="w-6 h-6 text-sky-500 mx-auto mb-2" />
                <p className="text-2xl font-bold text-sky-700">Nivel {level}</p>
                <p className="text-sm text-sky-600">{points_to_next_level > 0 ? `${points_to_next_level} al siguiente` : 'Máximo'}</p>
              </div>
              
              <div className="bg-gradient-to-br from-rose-50 to-pink-50 p-4 rounded-2xl text-center">
                <Target className="w-6 h-6 text-rose-500 mx-auto mb-2" />
                <p className="text-2xl font-bold text-rose-700">{current_streak}</p>
                <p className="text-sm text-rose-600">Días de racha 🔥</p>
              </div>
            </div>

            {/* Badges */}
            <div>
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-500" />
                Tus Badges ({badges_details?.length || 0})
              </h3>
              
              {badges_details && badges_details.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {badges_details.map((badge) => (
                    <motion.div
                      key={badge.badge_id}
                      whileHover={{ scale: 1.05 }}
                      className="bg-gradient-to-br from-amber-50 to-yellow-50 p-4 rounded-2xl border-2 border-amber-200 text-center"
                    >
                      <div className="text-4xl mb-2">{badge.icon}</div>
                      <p className="font-semibold text-sm mb-1">{badge.name}</p>
                      <p className="text-xs text-slate-600">{badge.description}</p>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-slate-500">
                  <p>Aún no has desbloqueado badges</p>
                  <p className="text-sm mt-2">¡Completa lecciones para ganar tu primer badge!</p>
                </div>
              )}
            </div>

            {/* How to earn points */}
            <div className="mt-8 p-6 bg-gradient-to-br from-violet-50 to-purple-50 rounded-2xl">
              <h4 className="font-semibold mb-3 text-violet-900">¿Cómo ganar puntos?</h4>
              <ul className="space-y-2 text-sm text-violet-800">
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-violet-500 rounded-full"></span>
                  Completar lección: <strong>+10 puntos</strong>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-violet-500 rounded-full"></span>
                  Crear lección: <strong>+50 puntos</strong>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-violet-500 rounded-full"></span>
                  Alguien completa tu lección: <strong>+5 puntos</strong>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-violet-500 rounded-full"></span>
                  Racha diaria: <strong>+20 puntos extra</strong>
                </li>
              </ul>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export default GamificationModal;
