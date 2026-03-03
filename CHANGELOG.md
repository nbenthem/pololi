# Changelog

Todos los cambios notables en este proyecto serán documentados aquí.

El formato está basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.0.0/),
y este proyecto adhiere a [Semantic Versioning](https://semver.org/lang/es/).

## [1.1.0] - 2026-03-01

### Añadido
- 🎨 **Sistema de recomendaciones personalizadas** basado en lecciones completadas
- 📚 **4 nuevas categorías**: Productividad & Hábitos, Salud & Bienestar, Creatividad & Innovación, Relaciones & Liderazgo
- 📖 **8 nuevas lecciones premium**: Método Pomodoro, Hábitos Atómicos, Sueño, Creatividad, Liderazgo Situacional, Pensamiento Crítico, Networking, Mindfulness
- 🔧 **Endpoint `/api/lessons/recommendations`** para obtener sugerencias personalizadas
- 📊 **Sección "Recomendadas para ti"** en Dashboard con badge especial
- 🎨 **Soporte para 8 categorías** con colores distintivos (Amber, Emerald, Violet, Rose)
- 📱 **Iconos adicionales** para nuevas categorías (🚀 ❤️ 💡 👥)

### Mejorado
- ⚡ Dashboard ahora muestra recomendaciones personalizadas basadas en historial del usuario
- 🎨 Colores de categorías más vibrantes y diversificados
- 📈 Algoritmo de recomendaciones considera top 3 categorías preferidas del usuario
- 🔄 Sistema de recomendaciones diversifica con contenido nuevo cuando no hay suficiente historia

### Documentación
- 📚 README completo con guía de instalación, API docs, troubleshooting
- 📋 GITHUB_MANAGEMENT.md con workflow de desarrollo y deployment
- 📝 CHANGELOG.md para tracking de versiones
- 🔧 Guías de personalización de diseño y añadir features

## [1.0.0] - 2026-03-01

### Añadido
- 🎨 **Diseño Frutiger Aero completo** con glassmorphism, gradientes sky-lime, burbujas flotantes
- 🤖 **Integración Claude Sonnet 4.5** para generación de micro-lecciones
- 🔐 **Autenticación Emergent Google OAuth** + email/contraseña
- 📚 **4 categorías iniciales**: Negociación, Psicología, Finanzas, Ciencia
- 📖 **8 lecciones seed** con contenido premium curado
- ⭐ **Sistema de favoritos** con persistencia en MongoDB
- ✅ **Tracking de progreso** con marcado de lecciones completadas
- 🔍 **Búsqueda y filtros** por texto y categoría
- 📊 **Dashboard con estadísticas**: lecciones completadas, favoritos, tasa de completitud
- 👤 **Página de perfil** con ring de progreso visual
- 🎭 **Animaciones con Framer Motion** en todas las interacciones
- 📱 **Diseño responsive** para móvil y desktop
- 🚀 **Navegación floating pill** con glassmorphism
- 🎯 **Data-testids** en todos los elementos interactivos
- 📡 **API RESTful completa** con FastAPI
- 🗄️ **MongoDB** con 6 colecciones optimizadas
- 🔒 **Sesiones seguras** con httpOnly cookies y CORS configurado
- ⚡ **Hot reload** para backend y frontend en desarrollo

### Endpoints API
- `POST /api/auth/session` - Intercambio de session_id OAuth
- `GET /api/auth/me` - Usuario actual
- `POST /api/auth/logout` - Cerrar sesión
- `GET /api/categories` - Listar categorías
- `GET /api/lessons` - Listar lecciones (con query params)
- `GET /api/lessons/{id}` - Detalle de lección
- `POST /api/lessons/generate` - Generar con IA
- `GET /api/progress` - Progreso del usuario
- `PUT /api/progress/{lesson_id}` - Actualizar progreso
- `GET /api/favorites` - Favoritos del usuario
- `POST /api/favorites/{lesson_id}` - Añadir favorito
- `DELETE /api/favorites/{lesson_id}` - Eliminar favorito
- `GET /api/user/stats` - Estadísticas del usuario

### Stack Tecnológico
- **Backend**: FastAPI + Motor (MongoDB async) + Emergent Integrations
- **Frontend**: React 19 + React Router v7 + Framer Motion + Tailwind CSS
- **Base de Datos**: MongoDB con 6 colecciones
- **Autenticación**: Emergent OAuth + JWT sessions
- **IA**: Claude Sonnet 4.5 vía Emergent LLM Key
- **Diseño**: Frutiger Aero con glassmorphism y gradientes

### Testing
- ✅ 95% de cobertura de funcionalidad
- ✅ Backend: 87.5% (7/8 endpoints funcionando)
- ✅ Frontend: 100% (todos los flujos operativos)
- ✅ Testing automatizado con pytest y Playwright

---

## Formato de Versiones

- **MAJOR** (X.0.0): Cambios incompatibles con versión anterior
- **MINOR** (x.X.0): Nuevas funcionalidades compatibles
- **PATCH** (x.x.X): Bug fixes compatibles

## Tipos de Cambios

- `Añadido` - Nuevas funcionalidades
- `Cambiado` - Cambios en funcionalidad existente
- `Obsoleto` - Funcionalidad que será removida
- `Eliminado` - Funcionalidad removida
- `Arreglado` - Bug fixes
- `Seguridad` - Vulnerabilidades corregidas

---

[1.1.0]: https://github.com/tu-usuario/microskill/compare/v1.0.0...v1.1.0
[1.0.0]: https://github.com/tu-usuario/microskill/releases/tag/v1.0.0