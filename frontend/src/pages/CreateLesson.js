import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'sonner';
import {
  PenLine, ChevronRight, ChevronLeft, Plus, Trash2,
  BookOpen, Sparkles, Brain, ExternalLink, Eye, Send, Check
} from 'lucide-react';
import NavBar from '../components/NavBar';
import { useSettings } from '../contexts/SettingsContext';

const API_URL = process.env.REACT_APP_BACKEND_URL;

function CreateLesson({ user }) {
  const navigate = useNavigate();
  const { t } = useSettings();
  const [step, setStep] = useState(0);
  const [categories, setCategories] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  const STEPS = [
    { key: 'basic', label: t('create_step_basic'), icon: <BookOpen className="w-3.5 h-3.5" /> },
    { key: 'content', label: t('create_step_content'), icon: <Sparkles className="w-3.5 h-3.5" /> },
    { key: 'quiz', label: t('create_step_quiz'), icon: <Brain className="w-3.5 h-3.5" /> },
    { key: 'resources', label: t('create_step_resources'), icon: <ExternalLink className="w-3.5 h-3.5" /> },
    { key: 'review', label: t('create_step_review'), icon: <Eye className="w-3.5 h-3.5" /> },
  ];

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
      .catch(() => toast.error('Error'));
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

  const getStepStatus = (i) => {
    switch (i) {
      case 0: return form.title.trim() && form.description.trim() && form.category_id ? 'done' : 'empty';
      case 1: return form.key_points.filter(k => k.trim()).length >= 2 && form.conclusion.trim() ? 'done' : 'empty';
      case 2: return form.quiz_questions.some(q => q.question.trim()) ? 'done' : 'empty';
      case 3: return form.resources.some(r => r.title.trim() && r.url.trim()) ? 'done' : 'empty';
      default: return 'empty';
    }
  };

  const handleSubmit = async () => {
    if (!form.title.trim() || !form.description.trim() || !form.category_id) {
      toast.error('Completa la informacion basica primero');
      setStep(0);
      return;
    }
    if (form.key_points.filter(k => k.trim()).length < 2 || !form.conclusion.trim()) {
      toast.error('Necesitas al menos 2 puntos clave y una conclusion');
      setStep(1);
      return;
    }

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
      toast.success(t('create_success'));
      navigate('/explore');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Error');
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
            {t('create_title')}
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mb-8 text-sm sm:text-base">{t('create_subtitle')}</p>
        </motion.div>

        {/* Step Indicator - ALL buttons clickable */}
        <div className="flex items-center gap-1 mb-8 overflow-x-auto pb-2">
          {STEPS.map((s, i) => {
            const status = getStepStatus(i);
            return (
              <React.Fragment key={s.key}>
                <button
                  onClick={() => setStep(i)}
                  data-testid={`step-indicator-${i}`}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs sm:text-sm font-medium whitespace-nowrap transition-all ${
                    i === step
                      ? 'bg-gradient-to-r from-violet-400 to-purple-500 text-white shadow-lg shadow-violet-500/20'
                      : status === 'done'
                        ? 'bg-lime-100 dark:bg-lime-500/15 text-lime-700 dark:text-lime-400 border border-lime-300 dark:border-lime-500/30'
                        : 'bg-white/60 dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:border-violet-300 hover:bg-violet-50 dark:hover:bg-violet-500/10'
                  }`}
                >
                  {status === 'done' && i !== step && <Check className="w-3 h-3" />}
                  {s.icon}
                  <span className="hidden sm:inline">{s.label}</span>
                </button>
                {i < STEPS.length - 1 && <ChevronRight className="w-4 h-4 text-slate-300 dark:text-slate-600 flex-shrink-0" />}
              </React.Fragment>
            );
          })}
        </div>

        {/* Step Content */}
        <AnimatePresence mode="wait">
          <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            {step === 0 && (
              <div className="glass-card p-6 sm:p-8 space-y-5">
                <h2 className="text-lg font-bold">{t('create_basic_info')}</h2>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">{t('create_lesson_title')}</label>
                  <input type="text" value={form.title} onChange={e => updateField('title', e.target.value)} placeholder={t('create_title_placeholder')} data-testid="lesson-title-input" className="glass-input w-full" maxLength={100} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">{t('create_description')}</label>
                  <textarea value={form.description} onChange={e => updateField('description', e.target.value)} placeholder={t('create_desc_placeholder')} data-testid="lesson-desc-input" className="glass-input w-full h-20 resize-none" maxLength={200} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">{t('create_category')}</label>
                  <div className="grid grid-cols-2 gap-2">
                    {categories.map(cat => (
                      <button key={cat.category_id} onClick={() => updateField('category_id', cat.category_id)} data-testid={`cat-select-${cat.category_id}`}
                        className={`p-3 rounded-xl border text-left text-sm transition-all ${
                          form.category_id === cat.category_id
                            ? 'border-violet-400 bg-violet-50 dark:bg-violet-500/15 text-violet-700 dark:text-violet-300'
                            : 'border-slate-200 dark:border-white/10 bg-white/50 dark:bg-white/[0.03] text-slate-600 dark:text-slate-300 hover:border-violet-300'
                        }`}
                      >{cat.name}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">{t('create_image_url')}</label>
                  <input type="url" value={form.image_url} onChange={e => updateField('image_url', e.target.value)} placeholder="https://..." data-testid="lesson-image-input" className="glass-input w-full" />
                  {form.image_url && (
                    <div className="mt-3 h-32 rounded-xl overflow-hidden">
                      <img src={form.image_url} alt="Preview" className="w-full h-full object-cover" onError={e => e.target.style.display='none'} />
                    </div>
                  )}
                </div>
              </div>
            )}

            {step === 1 && (
              <div className="glass-card p-6 sm:p-8 space-y-5">
                <h2 className="text-lg font-bold">{t('create_content_title')}</h2>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{t('create_key_points')}</label>
                  {form.key_points.map((point, i) => (
                    <div key={i} className="flex gap-2 mb-2">
                      <span className="flex-shrink-0 w-7 h-9 flex items-center justify-center text-sm font-bold text-violet-500">{i + 1}</span>
                      <input type="text" value={point} onChange={e => updateArrayItem('key_points', i, e.target.value)} placeholder={`${t('create_key_point_placeholder')} ${i + 1}`} data-testid={`key-point-${i}`} className="glass-input flex-1" />
                      {form.key_points.length > 2 && (
                        <button onClick={() => removeArrayItem('key_points', i)} className="text-red-400 hover:text-red-600 p-1"><Trash2 className="w-4 h-4" /></button>
                      )}
                    </div>
                  ))}
                  {form.key_points.length < 7 && (
                    <button onClick={() => addArrayItem('key_points', '')} className="text-sm text-violet-600 dark:text-violet-400 hover:text-violet-700 font-medium flex items-center gap-1 mt-1">
                      <Plus className="w-4 h-4" /> {t('create_add_point')}
                    </button>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{t('create_examples')}</label>
                  {form.practical_examples.map((ex, i) => (
                    <div key={i} className="flex gap-2 mb-2">
                      <textarea value={ex} onChange={e => updateArrayItem('practical_examples', i, e.target.value)} placeholder={`${t('create_example_placeholder')} ${i + 1}`} data-testid={`example-${i}`} className="glass-input flex-1 h-16 resize-none" />
                      {form.practical_examples.length > 1 && (
                        <button onClick={() => removeArrayItem('practical_examples', i)} className="text-red-400 hover:text-red-600 p-1"><Trash2 className="w-4 h-4" /></button>
                      )}
                    </div>
                  ))}
                  <button onClick={() => addArrayItem('practical_examples', '')} className="text-sm text-violet-600 dark:text-violet-400 hover:text-violet-700 font-medium flex items-center gap-1 mt-1">
                    <Plus className="w-4 h-4" /> {t('create_add_example')}
                  </button>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">{t('create_conclusion')}</label>
                  <textarea value={form.conclusion} onChange={e => updateField('conclusion', e.target.value)} placeholder={t('create_conclusion_placeholder')} data-testid="conclusion-input" className="glass-input w-full h-20 resize-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{t('create_insights')}</label>
                  {form.insights.map((ins, i) => (
                    <div key={i} className="flex gap-2 mb-2">
                      <input type="text" value={ins} onChange={e => updateArrayItem('insights', i, e.target.value)} placeholder={`${t('create_insight_placeholder')} ${i + 1}`} data-testid={`insight-${i}`} className="glass-input flex-1" />
                      {form.insights.length > 1 && (
                        <button onClick={() => removeArrayItem('insights', i)} className="text-red-400 hover:text-red-600 p-1"><Trash2 className="w-4 h-4" /></button>
                      )}
                    </div>
                  ))}
                  <button onClick={() => addArrayItem('insights', '')} className="text-sm text-violet-600 dark:text-violet-400 hover:text-violet-700 font-medium flex items-center gap-1 mt-1">
                    <Plus className="w-4 h-4" /> {t('create_add_insight')}
                  </button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="glass-card p-6 sm:p-8 space-y-6">
                <h2 className="text-lg font-bold">{t('create_quiz_title')}</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">{t('create_quiz_subtitle')}</p>
                {form.quiz_questions.map((q, qi) => (
                  <div key={qi} className="p-4 rounded-2xl border border-slate-200 dark:border-white/10 bg-white/50 dark:bg-white/[0.03] space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-violet-600 dark:text-violet-400">{t('create_question')} {qi + 1}</span>
                      {form.quiz_questions.length > 1 && (
                        <button onClick={() => removeArrayItem('quiz_questions', qi)} className="text-red-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                      )}
                    </div>
                    <input type="text" value={q.question} onChange={e => updateQuizQuestion(qi, 'question', e.target.value)} placeholder={t('create_question_placeholder')} data-testid={`quiz-question-${qi}`} className="glass-input w-full" />
                    <div className="space-y-2">
                      {q.options.map((opt, oi) => (
                        <div key={oi} className="flex items-center gap-2">
                          <button onClick={() => updateQuizQuestion(qi, 'correct_answer', oi)} data-testid={`quiz-correct-${qi}-${oi}`}
                            className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                              q.correct_answer === oi ? 'border-lime-500 bg-lime-500 text-white' : 'border-slate-300 dark:border-slate-600'
                            }`}
                          >
                            {q.correct_answer === oi && <Check className="w-3 h-3" />}
                          </button>
                          <input type="text" value={opt} onChange={e => updateQuizOption(qi, oi, e.target.value)} placeholder={`${t('create_option_placeholder')} ${oi + 1}`} data-testid={`quiz-option-${qi}-${oi}`} className="glass-input flex-1" />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
                {form.quiz_questions.length < 5 && (
                  <button onClick={() => addArrayItem('quiz_questions', { question: '', options: ['', '', '', ''], correct_answer: 0 })} className="text-sm text-violet-600 dark:text-violet-400 hover:text-violet-700 font-medium flex items-center gap-1">
                    <Plus className="w-4 h-4" /> {t('create_add_question')}
                  </button>
                )}
              </div>
            )}

            {step === 3 && (
              <div className="glass-card p-6 sm:p-8 space-y-5">
                <h2 className="text-lg font-bold">{t('create_resources_title')}</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">{t('create_resources_subtitle')}</p>
                {form.resources.map((r, i) => (
                  <div key={i} className="p-4 rounded-2xl border border-slate-200 dark:border-white/10 bg-white/50 dark:bg-white/[0.03] space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-blue-600 dark:text-blue-400">{t('create_resource')} {i + 1}</span>
                      {form.resources.length > 1 && (
                        <button onClick={() => removeArrayItem('resources', i)} className="text-red-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                      )}
                    </div>
                    <input type="text" value={r.title} onChange={e => { const arr = [...form.resources]; arr[i] = { ...arr[i], title: e.target.value }; updateField('resources', arr); }} placeholder={t('create_resource_title_placeholder')} data-testid={`resource-title-${i}`} className="glass-input w-full" />
                    <input type="url" value={r.url} onChange={e => { const arr = [...form.resources]; arr[i] = { ...arr[i], url: e.target.value }; updateField('resources', arr); }} placeholder="https://..." data-testid={`resource-url-${i}`} className="glass-input w-full" />
                    <input type="text" value={r.description} onChange={e => { const arr = [...form.resources]; arr[i] = { ...arr[i], description: e.target.value }; updateField('resources', arr); }} placeholder={t('create_resource_desc_placeholder')} data-testid={`resource-desc-${i}`} className="glass-input w-full" />
                  </div>
                ))}
                {form.resources.length < 5 && (
                  <button onClick={() => addArrayItem('resources', { title: '', url: '', description: '' })} className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 font-medium flex items-center gap-1">
                    <Plus className="w-4 h-4" /> {t('create_add_resource')}
                  </button>
                )}
              </div>
            )}

            {step === 4 && (
              <div className="glass-card p-6 sm:p-8 space-y-6">
                <h2 className="text-lg font-bold flex items-center gap-2">
                  <Eye className="w-5 h-5 text-violet-500" /> {t('create_preview')}
                </h2>

                {/* Image preview */}
                {form.image_url && (
                  <div className="h-40 rounded-2xl overflow-hidden">
                    <img src={form.image_url} alt="" className="w-full h-full object-cover" onError={e => e.target.style.display='none'} />
                  </div>
                )}

                {/* Title + Description */}
                <div className="space-y-1">
                  <p className="text-xl sm:text-2xl font-bold">{form.title || '—'}</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">{form.description || '—'}</p>
                  <span className="inline-block px-3 py-1 rounded-full bg-violet-100 dark:bg-violet-500/15 text-violet-700 dark:text-violet-300 text-xs font-medium mt-1">
                    {getCategoryName(form.category_id) || '—'}
                  </span>
                </div>

                {/* Key Points */}
                {form.key_points.filter(k => k.trim()).length > 0 && (
                  <div>
                    <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase mb-2 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" /> {t('lesson_key_points')} ({form.key_points.filter(k => k.trim()).length})
                    </h3>
                    <div className="space-y-2">
                      {form.key_points.filter(k => k.trim()).map((k, i) => (
                        <div key={i} className="flex gap-3 items-start">
                          <span className="w-6 h-6 rounded-lg bg-violet-100 dark:bg-violet-500/15 text-violet-700 dark:text-violet-300 text-xs font-bold flex items-center justify-center flex-shrink-0">{i + 1}</span>
                          <p className="text-sm text-slate-700 dark:text-slate-300">{k}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Examples */}
                {form.practical_examples.filter(e => e.trim()).length > 0 && (
                  <div>
                    <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase mb-2 flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5" /> {t('lesson_examples')} ({form.practical_examples.filter(e => e.trim()).length})
                    </h3>
                    {form.practical_examples.filter(e => e.trim()).map((e, i) => (
                      <div key={i} className="p-3 rounded-xl bg-sky-50 dark:bg-sky-500/10 border border-sky-200 dark:border-sky-500/20 mb-2">
                        <p className="text-sm text-slate-700 dark:text-slate-300 italic">"{e}"</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Conclusion */}
                {form.conclusion.trim() && (
                  <div className="p-4 rounded-xl bg-lime-50 dark:bg-lime-500/10 border border-lime-200 dark:border-lime-500/20">
                    <h3 className="text-sm font-bold text-lime-700 dark:text-lime-400 mb-1">{t('lesson_conclusion')}</h3>
                    <p className="text-sm text-slate-700 dark:text-slate-300">{form.conclusion}</p>
                  </div>
                )}

                {/* Insights */}
                {form.insights.filter(i => i.trim()).length > 0 && (
                  <div>
                    <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase mb-2">{t('lesson_fun_facts')} ({form.insights.filter(i => i.trim()).length})</h3>
                    {form.insights.filter(i => i.trim()).map((ins, i) => (
                      <div key={i} className="flex gap-2 items-start p-2 rounded-lg bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 mb-2">
                        <span className="text-amber-500 text-sm font-bold">!</span>
                        <p className="text-sm text-slate-700 dark:text-slate-300">{ins}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Quiz Preview */}
                {form.quiz_questions.filter(q => q.question.trim()).length > 0 && (
                  <div>
                    <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase mb-2 flex items-center gap-1.5">
                      <Brain className="w-3.5 h-3.5" /> Quiz ({form.quiz_questions.filter(q => q.question.trim()).length} {form.quiz_questions.filter(q => q.question.trim()).length === 1 ? 'pregunta' : 'preguntas'})
                    </h3>
                    {form.quiz_questions.filter(q => q.question.trim()).map((q, qi) => (
                      <div key={qi} className="p-3 rounded-xl border border-slate-200 dark:border-white/10 bg-white/50 dark:bg-white/[0.03] mb-2">
                        <p className="text-sm font-medium mb-2">{qi + 1}. {q.question}</p>
                        <div className="space-y-1 pl-3">
                          {q.options.filter(o => o.trim()).map((o, oi) => (
                            <div key={oi} className={`text-xs flex items-center gap-1.5 ${q.correct_answer === oi ? 'text-lime-600 dark:text-lime-400 font-semibold' : 'text-slate-500 dark:text-slate-400'}`}>
                              {q.correct_answer === oi ? <Check className="w-3 h-3" /> : <span className="w-3 h-3 inline-block" />}
                              {o}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Resources Preview */}
                {form.resources.filter(r => r.title.trim()).length > 0 && (
                  <div>
                    <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase mb-2 flex items-center gap-1.5">
                      <ExternalLink className="w-3.5 h-3.5" /> {t('lesson_resources')} ({form.resources.filter(r => r.title.trim()).length})
                    </h3>
                    {form.resources.filter(r => r.title.trim()).map((r, i) => (
                      <div key={i} className="flex items-start gap-2 p-2 rounded-lg border border-blue-200 dark:border-blue-500/20 bg-blue-50 dark:bg-blue-500/10 mb-2">
                        <ExternalLink className="w-3.5 h-3.5 text-blue-500 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-medium text-blue-700 dark:text-blue-300">{r.title}</p>
                          {r.description && <p className="text-xs text-slate-500 dark:text-slate-400">{r.description}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-6">
          <button
            onClick={() => step > 0 && setStep(step - 1)}
            disabled={step === 0}
            data-testid="prev-step-btn"
            className={`flex items-center gap-1.5 px-5 py-2.5 rounded-full text-sm font-medium transition-all ${
              step === 0 ? 'opacity-40 cursor-not-allowed text-slate-400' : 'bg-white/60 dark:bg-white/[0.06] border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:border-slate-300'
            }`}
          >
            <ChevronLeft className="w-4 h-4" /> {t('create_prev')}
          </button>

          {step < STEPS.length - 1 ? (
            <button
              onClick={() => setStep(step + 1)}
              data-testid="next-step-btn"
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-full text-sm font-medium glossy-button"
            >
              {t('create_next')} <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={submitting}
              data-testid="submit-lesson-btn"
              className="flex items-center gap-1.5 px-6 py-2.5 rounded-full text-sm font-medium bg-gradient-to-r from-violet-500 to-purple-600 text-white shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
            >
              {submitting ? t('create_publishing') : <><Send className="w-4 h-4" /> {t('create_publish')}</>}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default CreateLesson;
