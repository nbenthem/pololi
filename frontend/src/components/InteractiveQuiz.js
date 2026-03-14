import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, Award, Trophy } from 'lucide-react';
import confetti from 'canvas-confetti';

function InteractiveQuiz({ questions, onComplete, lessonId }) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [score, setScore] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [isComplete, setIsComplete] = useState(false);

  const question = questions[currentQuestion];
  const totalQuestions = questions.length;
  const progress = ((currentQuestion + 1) / totalQuestions) * 100;

  const handleAnswer = (answerIndex) => {
    if (showFeedback) return;
    
    setSelectedAnswer(answerIndex);
    setShowFeedback(true);
    
    const isCorrect = answerIndex === question.correct_answer;
    if (isCorrect) {
      setScore(score + 1);
    }
    
    setAnswers([...answers, {
      question: question.question,
      selected: answerIndex,
      correct: question.correct_answer,
      isCorrect
    }]);
  };

  const handleNext = () => {
    if (currentQuestion < totalQuestions - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
      setShowFeedback(false);
    } else {
      // Quiz completado
      setIsComplete(true);
      const finalScore = ((score + (selectedAnswer === question.correct_answer ? 1 : 0)) / totalQuestions) * 100;
      
      // Confetti si score >= 80%
      if (finalScore >= 80) {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
      }
      
      if (onComplete) {
        onComplete(finalScore);
      }
    }
  };

  if (!questions || questions.length === 0) {
    return null;
  }

  if (isComplete) {
    const finalScore = (score / totalQuestions) * 100;
    
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-card p-8 text-center"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring" }}
          className={`inline-flex items-center justify-center w-24 h-24 rounded-full mb-6 ${
            finalScore >= 80 
              ? 'bg-gradient-to-br from-lime-400 to-green-500' 
              : finalScore >= 60 
                ? 'bg-gradient-to-br from-amber-400 to-orange-500'
                : 'bg-gradient-to-br from-slate-400 to-slate-500'
          }`}
        >
          {finalScore >= 80 ? (
            <Trophy className="w-12 h-12 text-white" />
          ) : (
            <Award className="w-12 h-12 text-white" />
          )}
        </motion.div>
        
        <h3 className="text-3xl font-bold mb-3">
          {finalScore >= 80 ? '¡Excelente!' : finalScore >= 60 ? '¡Bien hecho!' : '¡Sigue aprendiendo!'}
        </h3>
        
        <p className="text-6xl font-bold bg-gradient-to-r from-sky-500 to-lime-500 bg-clip-text text-transparent mb-4">
          {Math.round(finalScore)}%
        </p>
        
        <p className="text-slate-600 mb-6">
          Respondiste correctamente {score} de {totalQuestions} preguntas
        </p>
        
        {finalScore < 100 && (
          <button
            onClick={() => {
              setCurrentQuestion(0);
              setSelectedAnswer(null);
              setShowFeedback(false);
              setScore(0);
              setAnswers([]);
              setIsComplete(false);
            }}
            className="px-6 py-3 rounded-full bg-sky-500 hover:bg-sky-600 text-white font-medium transition-colors"
          >
            Intentar de nuevo
          </button>
        )}
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-8"
    >
      {/* Progress bar */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-slate-600">
            Pregunta {currentQuestion + 1} de {totalQuestions}
          </span>
          <span className="text-sm font-medium text-sky-600">
            {Math.round(progress)}%
          </span>
        </div>
        <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-sky-400 to-lime-400"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>

      {/* Question */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentQuestion}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
        >
          <h3 className="text-2xl font-bold mb-6">{question.question}</h3>
          
          {/* Options */}
          <div className="space-y-3 mb-6">
            {question.options.map((option, index) => {
              const isSelected = selectedAnswer === index;
              const isCorrect = index === question.correct_answer;
              const showCorrect = showFeedback && isCorrect;
              const showIncorrect = showFeedback && isSelected && !isCorrect;
              
              return (
                <motion.button
                  key={index}
                  onClick={() => handleAnswer(index)}
                  disabled={showFeedback}
                  whileHover={{ scale: showFeedback ? 1 : 1.02 }}
                  whileTap={{ scale: showFeedback ? 1 : 0.98 }}
                  className={`w-full p-4 rounded-2xl border-2 text-left transition-all ${
                    showCorrect
                      ? 'border-lime-500 bg-lime-50'
                      : showIncorrect
                        ? 'border-rose-500 bg-rose-50'
                        : isSelected
                          ? 'border-sky-500 bg-sky-50'
                          : 'border-slate-200 hover:border-sky-300 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{option}</span>
                    {showCorrect && (
                      <CheckCircle className="w-6 h-6 text-lime-500" />
                    )}
                    {showIncorrect && (
                      <XCircle className="w-6 h-6 text-rose-500" />
                    )}
                  </div>
                </motion.button>
              );
            })}
          </div>

          {/* Feedback */}
          <AnimatePresence>
            {showFeedback && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className={`p-4 rounded-xl mb-4 ${
                  selectedAnswer === question.correct_answer
                    ? 'bg-lime-50 border border-lime-200'
                    : 'bg-rose-50 border border-rose-200'
                }`}
              >
                <p className={`font-semibold mb-2 ${
                  selectedAnswer === question.correct_answer
                    ? 'text-lime-800'
                    : 'text-rose-800'
                }`}>
                  {selectedAnswer === question.correct_answer
                    ? '¡Correcto! 🎉'
                    : 'Incorrecto 😔'}
                </p>
                {question.explanation && (
                  <p className="text-sm text-slate-700">{question.explanation}</p>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Next button */}
          {showFeedback && (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              onClick={handleNext}
              className="glossy-button w-full"
            >
              {currentQuestion < totalQuestions - 1 ? 'Siguiente pregunta →' : 'Ver resultados'}
            </motion.button>
          )}
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
}

export default InteractiveQuiz;
