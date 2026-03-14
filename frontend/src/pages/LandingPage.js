import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, Zap, TrendingUp, Brain } from 'lucide-react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_BACKEND_URL;

function LandingPage() {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        await axios.get(`${API_URL}/api/auth/me`, { withCredentials: true });
        setIsAuthenticated(true);
      } catch (error) {
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, []);

  const handleLogin = () => {
    navigate('/auth');
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">
      <div className="animate-pulse text-sky-500 text-xl">Cargando...</div>
    </div>;
  }

  if (isAuthenticated) {
    window.location.href = '/dashboard';
    return null;
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Background image with overlay */}
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-20"
          style={{
            backgroundImage: 'url(https://images.unsplash.com/photo-1755790140495-0798122fb7b6?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NTYxODl8MHwxfHNlYXJjaHwxfHxmcnV0aWdlciUyMGFlcm8lMjBhZXN0aGV0aWMlMjBnbG9zc3klMjBidWJibGVzJTIwYmx1ZSUyMHNreSUyMGdyZWVuJTIwZ3Jhc3N8ZW58MHx8fHwxNzcyMzY2NjIzfDA&ixlib=rb-4.1.0&q=85)'
          }}
        />
        
        <div className="relative container mx-auto px-6 pt-32 pb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-4xl mx-auto"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="inline-block mb-6"
            >
              <div className="bg-gradient-to-r from-sky-400 to-lime-400 p-4 rounded-full">
                <Sparkles className="w-12 h-12 text-white" />
              </div>
            </motion.div>
            
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 bg-gradient-to-r from-sky-600 via-sky-500 to-lime-500 bg-clip-text text-transparent">
              Aprende habilidades geniales en 5 minutos
            </h1>
            
            <p className="text-lg md:text-xl text-slate-600 mb-8 leading-relaxed max-w-2xl mx-auto">
              Micro-lecciones brillantes sobre negociación, psicología, finanzas, ciencia y más. 
              Contenido de expertos, explicado de forma clara y práctica.
            </p>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleLogin}
              data-testid="hero-login-btn"
              className="glossy-button text-lg"
            >
              Comenzar ahora →
            </motion.button>
          </motion.div>
        </div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-6 py-20">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="grid md:grid-cols-3 gap-8"
        >
          <FeatureCard
            icon={<Zap className="w-8 h-8" />}
            color="from-sky-400 to-sky-600"
            title="5 minutos es todo"
            description="Lecciones cortas pero poderosas. Aprende en tu café de la mañana."
          />
          <FeatureCard
            icon={<Brain className="w-8 h-8" />}
            color="from-pink-400 to-pink-600"
            title="Contenido de genios"
            description="Conocimiento curado de expertos. Información práctica y brillante."
          />
          <FeatureCard
            icon={<TrendingUp className="w-8 h-8" />}
            color="from-lime-400 to-lime-600"
            title="Progreso visible"
            description="Sigue tu aprendizaje y ve cómo creces cada día."
          />
        </motion.div>
      </div>

      {/* Categories Preview */}
      <div className="container mx-auto px-6 py-20">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          className="text-4xl md:text-5xl font-bold text-center mb-12"
        >
          Explora temas que te interesan
        </motion.h2>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <CategoryPreview
            name="Negociación"
            color="bg-gradient-to-br from-sky-400 to-sky-600"
            icon="🤝"
          />
          <CategoryPreview
            name="Psicología"
            color="bg-gradient-to-br from-pink-400 to-pink-600"
            icon="🧠"
          />
          <CategoryPreview
            name="Finanzas"
            color="bg-gradient-to-br from-lime-400 to-lime-600"
            icon="💰"
          />
          <CategoryPreview
            name="Ciencia"
            color="bg-gradient-to-br from-purple-400 to-purple-600"
            icon="⚛️"
          />
        </div>
      </div>

      {/* CTA Section */}
      <div className="container mx-auto px-6 py-20">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="glass-card p-12 text-center max-w-3xl mx-auto"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            ¿Listo para ser más inteligente?
          </h2>
          <p className="text-lg text-slate-600 mb-8">
            Únete a miles de personas que aprenden algo nuevo cada día
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleLogin}
            data-testid="cta-login-btn"
            className="glossy-button text-lg"
          >
            Empieza gratis con Google
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
}

function FeatureCard({ icon, color, title, description }) {
  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="glass-card p-8 hover:-translate-y-1 transition-all duration-300"
    >
      <div className={`inline-flex p-3 rounded-2xl bg-gradient-to-br ${color} mb-4`}>
        <div className="text-white">{icon}</div>
      </div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-slate-600 leading-relaxed">{description}</p>
    </motion.div>
  );
}

function CategoryPreview({ name, color, icon }) {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      className={`${color} p-8 rounded-3xl shadow-lg text-white text-center cursor-pointer transition-transform`}
    >
      <div className="text-5xl mb-3">{icon}</div>
      <h3 className="text-xl font-semibold">{name}</h3>
    </motion.div>
  );
}

export default LandingPage;
