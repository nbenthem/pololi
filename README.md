# 🚀 MicroSkill - Aprende habilidades geniales en 5 minutos

<div align="center">

![MicroSkill](https://images.unsplash.com/photo-1755790140495-0798122fb7b6?w=800&h=200&fit=crop)

**Plataforma de micro-aprendizaje con contenido generado por IA y diseño Frutiger Aero**

[Demo en vivo](https://quick-mastery-2.preview.emergentagent.com) | [Características](#características) | [Instalación](#instalación) | [Uso](#uso)

</div>

---

## ✨ Características

### 🎨 Diseño Frutiger Aero Premium
- **Glassmorphism cards** con efectos de vidrio y transparencias
- **Gradientes vibrantes** (Sky Blue, Lime Green, Pink, Purple, Amber, Rose)
- **Animaciones fluidas** con Framer Motion
- **Tipografía moderna**: Outfit para headings, Plus Jakarta Sans para body
- **Burbujas flotantes decorativas** y efectos visuales dinámicos

### 🤖 Generación de Contenido con IA
- **Claude Sonnet 4.5** para crear micro-lecciones de calidad excepcional
- Contenido estructurado: puntos clave, ejemplos prácticos, conclusiones
- Endpoint `/api/lessons/generate` para crear lecciones bajo demanda

### 🔐 Autenticación Completa
- **Google OAuth** (gestionado por Emergent) - login social sin configuración
- **Email/Contraseña** con sesiones seguras (httpOnly cookies)
- Tokens de sesión con expiración de 7 días
- MongoDB para persistencia de usuarios y sesiones

### 📚 8 Categorías Temáticas
1. **Negociación** 🤝 - Domina el arte de negociar
2. **Psicología & Comunicación** 🧠 - Entiende el comportamiento humano
3. **Finanzas Personales** 💰 - Gestiona y multiplica tu dinero
4. **Ciencia & Tecnología** ⚛️ - Conceptos complejos explicados simple
5. **Productividad & Hábitos** 🚀 - Optimiza tu tiempo y rutinas
6. **Salud & Bienestar** ❤️ - Cuida cuerpo y mente
7. **Creatividad & Innovación** 💡 - Desbloquea tu potencial creativo
8. **Relaciones & Liderazgo** 👥 - Lidera e influye positivamente

### 🎯 Funcionalidades Core
- ⭐ **Sistema de favoritos** - Guarda lecciones para después
- ✅ **Seguimiento de progreso** - Marca lecciones completadas
- 🔍 **Búsqueda y filtros** - Encuentra contenido relevante rápido
- 📊 **Estadísticas personales** - Visualiza tu aprendizaje
- 🎨 **Recomendaciones personalizadas** - Basadas en tu historial
- 📱 **Diseño responsive** - Funciona perfecto en móvil y desktop

---

## 🏗️ Stack Tecnológico

### Backend
- **FastAPI** - Framework moderno de Python
- **Motor** - Driver async de MongoDB
- **Emergent Integrations** - Claude Sonnet 4.5 para generación de contenido
- **Pydantic** - Validación de datos y modelos

### Frontend
- **React 19** - UI Library
- **React Router v7** - Navegación SPA
- **Framer Motion** - Animaciones fluidas
- **Tailwind CSS** - Utility-first CSS
- **Axios** - Cliente HTTP
- **Lucide React** - Iconos modernos
- **Sonner** - Notificaciones toast elegantes

### Base de Datos
- **MongoDB** - Base de datos NoSQL
- Colecciones: users, user_sessions, categories, lessons, user_progress, user_favorites

---

## 📦 Instalación

### Prerequisitos
- Python 3.11+
- Node.js 18+ y Yarn
- MongoDB (local o Atlas)
- Cuenta de Emergent para EMERGENT_LLM_KEY (opcional, para generación IA)

### 1. Clonar el repositorio
```bash
git clone <tu-repo-url>
cd microskill
```

### 2. Configurar Backend
```bash
cd backend

# Crear entorno virtual
python -m venv venv
source venv/bin/activate  # En Windows: venv\\Scripts\\activate

# Instalar dependencias
pip install -r requirements.txt

# Configurar variables de entorno
cp .env.example .env
# Edita .env con tus credenciales:
# MONGO_URL="mongodb://localhost:27017"
# DB_NAME="microskill_db"
# EMERGENT_LLM_KEY=tu_clave_emergent
# CORS_ORIGINS="http://localhost:3000"
```

### 3. Configurar Frontend
```bash
cd ../frontend

# Instalar dependencias
yarn install

# Configurar variables de entorno
cp .env.example .env
# Edita .env:
# REACT_APP_BACKEND_URL=http://localhost:8001
```

### 4. Seed de Base de Datos
```bash
cd ../scripts
python seed_data.py
python add_content.py
```

Esto crea:
- 8 categorías
- 16 lecciones seed con contenido premium

### 5. Ejecutar en Desarrollo

**Terminal 1 - Backend:**
```bash
cd backend
uvicorn server:app --reload --host 0.0.0.0 --port 8001
```

**Terminal 2 - Frontend:**
```bash
cd frontend
yarn start
```

Abre http://localhost:3000 🎉

---

## 🚀 Deployment

### Producción con Emergent Platform
La aplicación está optimizada para deployment en Emergent:

1. **Backend en FastAPI** con hot reload
2. **Frontend en React** con craco
3. **MongoDB** ya configurado
4. **Variables de entorno** listas para producción

### Variables de Entorno - Producción

**Backend (.env):**
```env
MONGO_URL=<tu_mongo_atlas_url>
DB_NAME=microskill_production
EMERGENT_LLM_KEY=<tu_clave>
CORS_ORIGINS=https://tu-dominio.com
```

**Frontend (.env):**
```env
REACT_APP_BACKEND_URL=https://tu-dominio.com
WDS_SOCKET_PORT=443
ENABLE_HEALTH_CHECK=false
```

### Supervisor (ya configurado en Emergent)
Los servicios se reinician automáticamente:
```bash
sudo supervisorctl restart backend frontend
```

---

## 📖 Uso de la Aplicación

### Como Usuario

1. **Landing Page**: Visita la app y haz clic en "Comenzar ahora"
2. **Autenticación**: Login con Google o crea cuenta con email
3. **Dashboard**: 
   - Ve tus estadísticas (lecciones completadas, favoritos, progreso)
   - Explora categorías con colores distintivos
   - Ve recomendaciones personalizadas basadas en tu historial
4. **Explorar**: 
   - Busca lecciones por palabra clave
   - Filtra por categoría específica
   - Todas las lecciones son de 5 minutos
5. **Lección Individual**:
   - Lee puntos clave, ejemplos prácticos y conclusión
   - Marca como favorita ⭐
   - Marca como completada ✅
6. **Perfil**:
   - Ve tu progreso total en ring visual
   - Accede a tus favoritos
   - Revisa lecciones completadas

### Como Administrador

#### Generar Lecciones con IA
```bash
curl -X POST "https://tu-app.com/api/lessons/generate" \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer <SESSION_TOKEN>" \\
  -d '{
    "topic": "Cómo gestionar el estrés laboral",
    "category_id": "cat_health"
  }'
```

Response: Nueva lección generada con Claude Sonnet 4.5

#### Añadir Categorías Manualmente
```python
# En MongoDB o script Python
db.categories.insert_one({
    "category_id": "cat_custom",
    "name": "Tu Categoría",
    "description": "Descripción atractiva",
    "color": "#3B82F6",  # Código hex del color
    "icon": "star",      # Nombre del icono
    "slug": "tu-categoria"
})
```

#### Ver Estadísticas de Usuarios
```bash
# Usuarios registrados
mongosh --eval "use('microskill_db'); db.users.count()"

# Lecciones completadas total
mongosh --eval "use('microskill_db'); db.user_progress.count({completed: true})"

# Top categoría
mongosh --eval "use('microskill_db'); db.user_progress.aggregate([...])"
```

---

## 🔧 API Endpoints

### Autenticación
- `POST /api/auth/session` - Exchange session_id por user data (Google OAuth)
- `GET /api/auth/me` - Obtener usuario actual
- `POST /api/auth/logout` - Cerrar sesión

### Categorías
- `GET /api/categories` - Listar todas las categorías

### Lecciones
- `GET /api/lessons` - Listar lecciones (query params: ?category_id=X&search=Y)
- `GET /api/lessons/{lesson_id}` - Obtener lección específica
- `POST /api/lessons/generate` - Generar lección con IA (requiere auth)
- `GET /api/lessons/recommendations` - Obtener recomendaciones personalizadas

### Progreso
- `GET /api/progress` - Obtener progreso del usuario
- `PUT /api/progress/{lesson_id}` - Actualizar progreso (marcar completada)

### Favoritos
- `GET /api/favorites` - Obtener favoritos del usuario
- `POST /api/favorites/{lesson_id}` - Añadir a favoritos
- `DELETE /api/favorites/{lesson_id}` - Eliminar de favoritos

### Estadísticas
- `GET /api/user/stats` - Obtener estadísticas del usuario

---

## 🎨 Personalización del Diseño

### Cambiar Colores de Categorías
Edita en frontend: `src/pages/Dashboard.js` (y otros archivos)
```javascript
const getCategoryColor = (categoryId) => {
  const colors = {
    'cat_custom': 'from-indigo-400 to-indigo-600',  // Tu color
    // ...
  };
  return colors[categoryId];
};
```

### Añadir Nuevos Iconos
```javascript
function getCategoryIcon(iconName) {
  const icons = {
    'custom': '🎯',  // Tu emoji
    // ...
  };
  return icons[iconName];
}
```

### Modificar Fuentes
Edita `frontend/src/index.css`:
```css
@import url('https://fonts.googleapis.com/css2?family=TuFuente:wght@400;700&display=swap');
```

---

## 🧪 Testing

### Backend Tests
```bash
cd backend
pytest backend_test.py -v
```

### Frontend Tests (E2E con Playwright)
```bash
cd frontend
yarn test
```

### API Testing con curl
```bash
# Test categorías
curl https://tu-app.com/api/categories

# Test lecciones
curl https://tu-app.com/api/lessons
```

---

## 🐛 Troubleshooting

### Backend no inicia
```bash
# Ver logs
tail -f /var/log/supervisor/backend.err.log

# Revisar puerto
lsof -i :8001

# Reinstalar dependencias
pip install -r requirements.txt --force-reinstall
```

### Frontend no compila
```bash
# Limpiar caché
rm -rf node_modules yarn.lock
yarn install

# Revisar variables .env
cat .env
```

### MongoDB connection error
```bash
# Verificar que MongoDB esté corriendo
sudo systemctl status mongod

# Test conexión
mongosh $MONGO_URL
```

### Sesiones no persisten
- Verificar cookies en navegador (deben ser httpOnly, secure, sameSite=none)
- Revisar CORS_ORIGINS en backend .env
- Comprobar que REACT_APP_BACKEND_URL esté correcto

---

## 📄 Licencia

MIT License - ve [LICENSE](LICENSE) para detalles

---

## 🤝 Contribuir

¡Contribuciones son bienvenidas! 

1. Fork el proyecto
2. Crea tu feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push al branch (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

---

## 🙋 Soporte

¿Problemas? Abre un [issue](tu-repo/issues) o contacta al equipo.

---

## 🌟 Roadmap

- [ ] App móvil nativa (React Native)
- [ ] Gamificación (badges, streaks, leaderboards)
- [ ] Modo offline con PWA
- [ ] Generación de lecciones multilingüe
- [ ] Integración con Notion/Obsidian
- [ ] Quizzes al final de cada lección
- [ ] Certificados de completitud
- [ ] Comunidad y comentarios

---

<div align="center">

**Hecho con ❤️ usando Claude Sonnet 4.5 y diseño Frutiger Aero**

[⬆ Volver arriba](#-microskill---aprende-habilidades-geniales-en-5-minutos)

</div>
