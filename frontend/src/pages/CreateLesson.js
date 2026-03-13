import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'sonner';
import {
  PenLine, ChevronRight, ChevronLeft, Plus, Trash2,
  BookOpen, Sparkles, Image, Brain, ExternalLink, Eye, Send
} from 'lucide-react';
import NavBar from '../components/NavBar';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const STEPS = ['Basico', 'Contenido', 'Quiz', 'Recursos', 'Revisar'];

function CreateLesson({ user }) {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [categories, setCategories] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    title: '',
    description: '',
    category_id: '',
    key_points: ['', '', ''],
    practical_examples: [''],
    conclusion: '',
    insights: [''],
    quiz_questions: [{ question: '', options: ['', '', '', ''], correct_answer: 0 }],
    resources: [{ title: '', url: '', description: '' }],
    image_url: ''
  });

  useEffect(() => {
    axios.get(`${API_URL}/api/categories`, { withCredentials: true })
      .then(res => setCategories(res.data))
      .catch(() => toast.error('Error cargando categorias'));
  }, []);

  const updateField = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  const updateArrayItem = (field, index, value) => {
    const arr = [...form[field]];
    arr[index] = value;
    updateField(field, arr);
  };

  const addArrayItem = (field, template) => {
    updateField(field, [...form[field], template]);
  };

  const removeArrayItem = (field, index) => {
    if (form[field].length <= 1) return;
    updateField(field, form[field].filter((_, i) => i !== index));
  };

  const updateQuizQuestion = (qIndex, field, value) => {
    const questions = [...form.quiz_questions];
    questions[qIndex] = { ...questions[qIndex], [field]: value };
    updateField('quiz_questions', questions);
  };

  const updateQuizOption = (qIndex, oIndex, value) => {
    const questions = [...form.quiz_questions];
    const options = [...questions[qIndex].options];
    options[oIndex] = value;
    questions[qIndex] = { ...questions[qIndex], options };
    updateField('quiz_questions', questions);
  };

  const canProceed = () => {
    switch (step) {
      case 0: return form.title.trim() && form.description.trim() && form.category_id;
      case 1: return form.key_points.filter(k => k.trim()).length >= 2 && form.conclusion.trim();
      case 2: return form.quiz_questions.every(q => q.question.trim() && q.options.filter(o => o.trim()).length >= 2);
      case 3: return true;
      default: return true;
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const payload = {
        title: form.title,
        description: form.description,
        category_id: form.category_id,
        key_points: form.key_points.filter(k => k.trim()),
        practical_examples: form.practical_examples.filter(e => e.trim()),
        conclusion: form.conclusion,
        insights: form.insights.filter(i => i.trim()),
        quiz_questions: form.quiz_questions.filter(q => q.question.trim()).map(q => ({
          question: q.question,
          options: q.options.filter(o => o.trim()),
          correct_answer: q.correct_answer
        })),
        resources: form.resources.filter(r => r.title.trim() && r.url.trim()),
        image_url: form.image_url || null
      };

      await axios.post(`${API_URL}/api/lessons/create`, payload, { withCredentials: true });
      toast.success('Leccion creada! +50 puntos');
      navigate('/explore');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Error al crear leccion');
    } finally {
      setSubmitting(false);
    }
  };

  const getCategoryName = (id) => categories.find(c => c.category_id === id)?.name || '';

  return (
    <div className="min-h-screen pb-20">
      <NavBar user={user} />

      <div className="container mx-auto px-4 sm:px-6 pt-24 max-w-3xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl sm:text-4xl font-bold mb-2 flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-gradient-to-br from-violet-400 to-purple-500">
              <PenLine className="w-6 h-6 text-white" />
            </div>
            Crear leccion
          </h1>
          <p className="text-slate-600 mb-8 text-sm sm:text-base">Comparte tu conocimiento con la comunidad</p>
        </motion.div>

        {/* Step Indicator */}
        <div className="flex items-center gap-1 mb-8 overflow-x-auto pb-2">
          {STEPS.map((s, i) => (
            <React.Fragment key={s}>
              <button
                onClick={() => i <= step && setStep(i)}
                data-testid={`step-indicator-${i}`}
                className={`px-3 py-1.5 rounded-full text-xs sm:text-sm font-medium whitespace-nowrap transition-all ${
                  i === step ? 'bg-gradient-to-r from-violet-400 to-purple-500 text-white' :
                  i < step ? 'bg-violet-100 text-violet-700' : 'bg-slate-100 text-slate-400'
                }`}
              >
                {s}
              </button>
              {i < STEPS.length - 1 && <ChevronRight className="w-4 h-4 text-slate-300 flex-shrink-0" />}
            </React.Fragment>
          ))}
        </div>

        {/* Step Content */}
        <AnimatePresence mode="wait">
          <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            {step === 0 && (
              <div className="glass-card p-6 sm:p-8 space-y-5">
                <h2 className="text-lg font-bold">Informacion basica</h2>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Titulo</label>
                  <input
                    type="text"
                    value={form.title}
                    onChange={e => updateField('title', e.target.value)}
                    placeholder="Ej: Como negociar tu salario"
                    data-testid="lesson-title-input"
                    className="glass-input w-full"
                    maxLength={100}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Descripcion breve</label>
                  <textarea
                    value={form.description}
                    onChange={e => updateField('description', e.target.value)}
                    placeholder="Describe en 1-2 lineas de que trata tu leccion"
                    data-testid="lesson-desc-input"
                    className="glass-input w-full h-20 resize-none"
                    maxLength={200}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Categoria</label>
                  <div className="grid grid-cols-2 gap-2">
                    {categories.map(cat => (
                      <button
                        key={cat.category_id}
                        onClick={() => updateField('category_id', cat.category_id)}
                        data-testid={`cat-select-${cat.slug}`}
                        className={`p-3 rounded-xl border text-left text-sm transition-all ${
                          form.category_id === cat.category_id
                            ? 'border-violet-400 bg-violet-50 text-violet-700'
                            : 'border-slate-200 bg-white/50 text-slate-600 hover:border-violet-300'
                        }`}
                      >
                        {cat.name}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">URL de imagen (opcional)</label>
                  <input
                    type="url"
                    value={form.image_url}
                    onChange={e => updateField('image_url', e.target.value)}
                    placeholder="https://..."
                    data-testid="lesson-image-input"
                    className="glass-input w-full"
                  />
                </div>
              </div>
            )}

            {step === 1 && (
              <div className="glass-card p-6 sm:p-8 space-y-5">
                <h2 className="text-lg font-bold">Contenido de la leccion</h2>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Puntos clave (min. 2)</label>
                  {form.key_points.map((point, i) => (
                    <div key={i} className="flex gap-2 mb-2">
                      <span className="flex-shrink-0 w-7 h-9 flex items-center justify-center text-sm font-bold text-violet-500">{i + 1}</span>
                      <input
                        type="text"
                        value={point}
                        onChange={e => updateArrayItem('key_points', i, e.target.value)}
                        placeholder={`Punto clave ${i + 1}`}
                        data-testid={`key-point-${i}`}
                        className="glass-input flex-1"
                      />
                      {form.key_points.length > 2 && (
                        <button onClick={() => removeArrayItem('key_points', i)} className="text-red-400 hover:text-red-600 p-1">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                  {form.key_points.length < 7 && (
                    <button onClick={() => addArrayItem('key_points', '')} className="text-sm text-violet-600 hover:text-violet-700 font-medium flex items-center gap-1 mt-1">
                      <Plus className="w-4 h-4" /> Agregar punto
                    </button>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Ejemplos practicos</label>
                  {form.practical_examples.map((ex, i) => (
                    <div key={i} className="flex gap-2 mb-2">
                      <textarea
                        value={ex}
                        onChange={e => updateArrayItem('practical_examples', i, e.target.value)}
                        placeholder={`Ejemplo ${i + 1}`}
                        data-testid={`example-${i}`}
                        className="glass-input flex-1 h-16 resize-none"
                      />
                      {form.practical_examples.length > 1 && (
                        <button onClick={() => removeArrayItem('practical_examples', i)} className="text-red-400 hover:text-red-600 p-1">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                  <button onClick={() => addArrayItem('practical_examples', '')} className="text-sm text-violet-600 hover:text-violet-700 font-medium flex items-center gap-1 mt-1">
                    <Plus className="w-4 h-4" /> Agregar ejemplo
                  </button>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Conclusion</label>
                  <textarea
                    value={form.conclusion}
                    onChange={e => updateField('conclusion', e.target.value)}
                    placeholder="Resume el aprendizaje principal"
                    data-testid="conclusion-input"
                    className="glass-input w-full h-20 resize-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Datos curiosos / Insights</label>
                  {form.insights.map((ins, i) => (
                    <div key={i} className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={ins}
                        onChange={e => updateArrayItem('insights', i, e.target.value)}
                        placeholder={`Dato curioso ${i + 1}`}
                        data-testid={`insight-${i}`}
                        className="glass-input flex-1"
                      />
                      {form.insights.length > 1 && (
                        <button onClick={() => removeArrayItem('insights', i)} className="text-red-400 hover:text-red-600 p-1">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                  <button onClick={() => addArrayItem('insights', '')} className="text-sm text-violet-600 hover:text-violet-700 font-medium flex items-center gap-1 mt-1">
                    <Plus className="w-4 h-4" /> Agregar dato
                  </button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="glass-card p-6 sm:p-8 space-y-6">
                <h2 className="text-lg font-bold">Quiz interactivo</h2>
                <p className="text-sm text-slate-500">Crea preguntas para evaluar el aprendizaje</p>
                {form.quiz_questions.map((q, qi) => (
                  <div key={qi} className="p-4 rounded-2xl border border-slate-200 bg-white/50 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-violet-600">Pregunta {qi + 1}</span>
                      {form.quiz_questions.length > 1 && (
                        <button onClick={() => removeArrayItem('quiz_questions', qi)} className="text-red-400 hover:text-red-600">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                    <input
                      type="text"
                      value={q.question}
                      onChange={e => updateQuizQuestion(qi, 'question', e.target.value)}
                      placeholder="Escribe la pregunta"
                      data-testid={`quiz-question-${qi}`}
                      className="glass-input w-full"
                    />
                    <div className="space-y-2">
                      {q.options.map((opt, oi) => (
                        <div key={oi} className="flex items-center gap-2">
                          <button
                            onClick={() => updateQuizQuestion(qi, 'correct_answer', oi)}
                            data-testid={`quiz-correct-${qi}-${oi}`}
                            className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                              q.correct_answer === oi ? 'border-lime-500 bg-lime-500 text-white' : 'border-slate-300'
                            }`}
                          >
                            {q.correct_answer === oi && <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>}
                          </button>
                          <input
                            type="text"
                            value={opt}
                            onChange={e => updateQuizOption(qi, oi, e.target.value)}
                            placeholder={`Opcion ${oi + 1}`}
                            data-testid={`quiz-option-${qi}-${oi}`}
                            className="glass-input flex-1"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
                {form.quiz_questions.length < 5 && (
                  <button
                    onClick={() => addArrayItem('quiz_questions', { question: '', options: ['', '', '', ''], correct_answer: 0 })}
                    className="text-sm text-violet-600 hover:text-violet-700 font-medium flex items-center gap-1"
                  >
                    <Plus className="w-4 h-4" /> Agregar pregunta
                  </button>
                )}
              </div>
            )}

            {step === 3 && (
              <div className="glass-card p-6 sm:p-8 space-y-5">
                <h2 className="text-lg font-bold">Recursos externos (opcional)</h2>
                <p className="text-sm text-slate-500">Anade links para que los usuarios profundicen</p>
                {form.resources.map((r, i) => (
                  <div key={i} className="p-4 rounded-2xl border border-slate-200 bg-white/50 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-blue-600">Recurso {i + 1}</span>
                      {form.resources.length > 1 && (
                        <button onClick={() => removeArrayItem('resources', i)} className="text-red-400 hover:text-red-600">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                    <input
                      type="text"
                      value={r.title}
                      onChange={e => { const arr = [...form.resources]; arr[i] = { ...arr[i], title: e.target.value }; updateField('resources', arr); }}
                      placeholder="Titulo del recurso"
                      data-testid={`resource-title-${i}`}
                      className="glass-input w-full"
                    />
                    <input
                      type="url"
                      value={r.url}
                      onChange={e => { const arr = [...form.resources]; arr[i] = { ...arr[i], url: e.target.value }; updateField('resources', arr); }}
                      placeholder="https://..."
                      data-testid={`resource-url-${i}`}
                      className="glass-input w-full"
                    />
                    <input
                      type="text"
                      value={r.description}
                      onChange={e => { const arr = [...form.resources]; arr[i] = { ...arr[i], description: e.target.value }; updateField('resources', arr); }}
                      placeholder="Breve descripcion"
                      data-testid={`resource-desc-${i}`}
                      className="glass-input w-full"
                    />
                  </div>
                ))}
                {form.resources.length < 5 && (
                  <button
                    onClick={() => addArrayItem('resources', { title: '', url: '', description: '' })}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
                  >
                    <Plus className="w-4 h-4" /> Agregar recurso
                  </button>
                )}
              </div>
            )}

            {step === 4 && (
              <div className="glass-card p-6 sm:p-8 space-y-5">
                <h2 className="text-lg font-bold flex items-center gap-2">
                  <Eye className="w-5 h-5" /> Vista previa
                </h2>
                <div className="space-y-4">
                  <div>
                    <span className="text-xs font-medium text-slate-400 uppercase">Titulo</span>
                    <p className="text-lg font-bold">{form.title}</p>
                  </div>
                  <div>
                    <span className="text-xs font-medium text-slate-400 uppercase">Descripcion</span>
                    <p className="text-sm text-slate-600">{form.description}</p>
                  </div>
                  <div>
                    <span className="text-xs font-medium text-slate-400 uppercase">Categoria</span>
                    <p className="text-sm font-medium text-violet-600">{getCategoryName(form.category_id)}</p>
                  </div>
                  <div>
                    <span className="text-xs font-medium text-slate-400 uppercase">Puntos clave ({form.key_points.filter(k => k.trim()).length})</span>
                    <ul className="list-disc list-inside text-sm text-slate-600 mt-1">
                      {form.key_points.filter(k => k.trim()).map((k, i) => <li key={i}>{k}</li>)}
                    </ul>
                  </div>
                  <div>
                    <span className="text-xs font-medium text-slate-400 uppercase">Preguntas quiz ({form.quiz_questions.filter(q => q.question.trim()).length})</span>
                  </div>
                  <div>
                    <span className="text-xs font-medium text-slate-400 uppercase">Recursos ({form.resources.filter(r => r.title.trim()).length})</span>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-6">
          <button
            onClick={() => step > 0 && setStep(step - 1)}
            disabled={step === 0}
            className={`flex items-center gap-1.5 px-5 py-2.5 rounded-full text-sm font-medium transition-all ${
              step === 0 ? 'opacity-40 cursor-not-allowed text-slate-400' : 'bg-white/60 border border-slate-200 text-slate-600 hover:border-slate-300'
            }`}
          >
            <ChevronLeft className="w-4 h-4" /> Anterior
          </button>

          {step < STEPS.length - 1 ? (
            <button
              onClick={() => canProceed() && setStep(step + 1)}
              disabled={!canProceed()}
              data-testid="next-step-btn"
              className={`flex items-center gap-1.5 px-5 py-2.5 rounded-full text-sm font-medium transition-all ${
                canProceed() ? 'glossy-button' : 'opacity-40 cursor-not-allowed bg-slate-200 text-slate-400'
              }`}
            >
              Siguiente <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={submitting}
              data-testid="submit-lesson-btn"
              className="flex items-center gap-1.5 px-6 py-2.5 rounded-full text-sm font-medium bg-gradient-to-r from-violet-500 to-purple-600 text-white shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
            >
              {submitting ? 'Publicando...' : <><Send className="w-4 h-4" /> Publicar leccion</>}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default CreateLesson;
