# 🧪 Guía de Prueba del Flujo Completo

## 1️⃣ Probar Autenticación con Google OAuth

### Flujo Completo de Usuario

1. **Visita la landing page**: https://quick-mastery-2.preview.emergentagent.com

2. **Haz clic en "Comenzar ahora"** o "Empieza gratis con Google"
   - Serás redirigido a `auth.emergentagent.com`
   
3. **Inicia sesión con tu cuenta de Google**
   - Selecciona tu cuenta de Google
   - Autoriza la aplicación
   
4. **Serás redirigido al Dashboard**
   - Deberías ver tu nombre en el saludo
   - Estadísticas iniciales (0 completadas, 0 favoritos)
   - 8 categorías con colores vibrantes
   - Sección de lecciones recientes

### Verificar Sesión

```bash
# En tu navegador, abre DevTools (F12)
# Ve a Application > Cookies > tu-dominio.com
# Deberías ver: session_token (httpOnly, Secure, SameSite=None)
```

---

## 2️⃣ Probar Sistema de Recomendaciones

### Sin historial (usuario nuevo)

1. **Dashboard recién logeado**
   - NO deberías ver sección "Recomendadas para ti"
   - Esto es correcto - no hay historial todavía

### Completar lecciones para activar recomendaciones

1. **Navega a "Explorar"** desde el menú superior
2. **Abre cualquier lección** (ej: "Cómo negociar tu salario")
3. **Marca como completada** (botón verde en la parte superior)
4. **Repite con 2-3 lecciones más** de diferentes categorías
5. **Vuelve al Dashboard**
   - ✨ Ahora deberías ver **"Recomendadas para ti"**
   - Con badge morado "✨ Para ti"
   - Basadas en las categorías de tus lecciones completadas

---

## 3️⃣ Probar Favoritos

1. **Abre una lección** que te interese
2. **Haz clic en el botón ⭐ "Guardar"**
   - Debería cambiar a "En favoritos" con fondo rosa
3. **Ve a tu Perfil** (icono de usuario en navbar)
4. **Sección "Tus favoritos"**
   - Deberías ver la lección que guardaste
   - Haz clic para volver a leerla

---

## 4️⃣ Probar Búsqueda y Filtros

### Búsqueda por texto

1. **Ve a "Explorar"**
2. **Escribe en la barra de búsqueda**: "finanzas"
   - Deberías ver lecciones relacionadas con dinero/inversión
3. **Prueba con**: "negociar"
   - Debería mostrar lección de negociación salarial

### Filtros por categoría

1. **Haz clic en filtro "Psicología"** (rosa)
   - Solo lecciones de psicología y comunicación
2. **Haz clic en "Todas"**
   - Vuelve a mostrar las 16 lecciones

---

## 5️⃣ Probar Seguimiento de Progreso

1. **Completa 5 lecciones** diferentes
2. **Ve a tu Perfil**
   - **Ring de progreso** debería mostrar ~31% (5/16)
   - **Stat card** "Completadas": 5
   - **Stat card** "Progreso": 31%
3. **Sección "Lecciones completadas"**
   - Deberías ver las 5 con checkmark verde

---

## 6️⃣ Probar Generación de Lecciones con IA

⚠️ **Requiere autenticación** y puede tardar >10 segundos

### Usando curl

```bash
# 1. Primero, obtén tu session_token de las cookies del navegador
# DevTools > Application > Cookies > session_token

# 2. Genera una nueva lección
curl -X POST "https://quick-mastery-2.preview.emergentagent.com/api/lessons/generate" \
  -H "Content-Type: application/json" \
  -H "Cookie: session_token=TU_SESSION_TOKEN" \
  -d '{
    "topic": "Cómo superar el síndrome del impostor",
    "category_id": "cat_psychology"
  }'

# Respuesta: Nueva lección generada con Claude Sonnet 4.5
# Con título, descripción, puntos clave, ejemplos y conclusión
```

### Verificar la nueva lección

```bash
# Listar todas las lecciones (debería haber 17 ahora)
curl -s "https://quick-mastery-2.preview.emergentagent.com/api/lessons" | python3 -c "import sys,json; print(f'Total: {len(json.load(sys.stdin))} lecciones')"

# En el navegador: ve a Explorar > debería aparecer la nueva lección
```

---

## 7️⃣ Probar Navegación y UX

### Navbar floating

1. **Observa la navegación superior**
   - Debería flotar con efecto glassmorphism
   - Efecto blur en el fondo
   - Borde blanco sutil

2. **Haz clic en cada sección**:
   - **Inicio**: Dashboard con stats
   - **Explorar**: Búsqueda y filtros
   - **Perfil**: Progreso y favoritos
   - **Salir**: Cierra sesión y vuelve a landing

### Animaciones

- **Hover en cards**: Deben levantarse (-5px)
- **Hover en botones**: Cambio de sombra
- **Burbujas de fondo**: Animación float infinita
- **Transiciones**: Suaves (300ms) en todo

---

## 8️⃣ Verificar Diseño Frutiger Aero

### Checklist Visual

- [x] **Fondo**: Degradado cielo (sky-100) a blanco
- [x] **Cards**: Glassmorphism (blur + transparencia)
- [x] **Botones**: Pill shape + gradiente + sombra
- [x] **Categorías**: 8 colores distintivos
  - Sky Blue (Negociación)
  - Pink (Psicología)
  - Lime (Finanzas)
  - Purple (Ciencia)
  - Amber (Productividad)
  - Emerald (Salud)
  - Violet (Creatividad)
  - Rose (Liderazgo)
- [x] **Tipografía**: Outfit (headings) + Plus Jakarta Sans (body)
- [x] **Iconos**: Emojis coloridos (no lucide para categorías)
- [x] **Burbujas decorativas**: 3 círculos blur animados

---

## 9️⃣ Testing de Performance

### Tiempos de carga

```bash
# Landing page
curl -w "@-" -o /dev/null -s "https://quick-mastery-2.preview.emergentagent.com" <<'EOF'
    time_namelookup:  %{time_namelookup}s\n
    time_connect:  %{time_connect}s\n
    time_starttransfer:  %{time_starttransfer}s\n
    time_total:  %{time_total}s\n
EOF

# API response time
time curl -s "https://quick-mastery-2.preview.emergentagent.com/api/lessons" > /dev/null
```

**Benchmarks esperados**:
- Landing: < 2s
- API calls: < 500ms
- IA generation: 10-30s (Claude es lento pero genera calidad)

---

## 🔟 Probar en Diferentes Dispositivos

### Móvil (responsive)

1. **DevTools > Toggle device toolbar** (Ctrl+Shift+M)
2. **Selecciona "iPhone 12 Pro"**
3. **Verifica**:
   - Cards se apilan en 1 columna
   - Navbar se mantiene funcional
   - Botones son táctiles (min 44x44px)
   - Texto legible sin zoom

### Tablet

1. **Selecciona "iPad Pro"**
2. **Debería mostrar 2 columnas** de cards
3. **Categorías en 2 filas** de 4

---

## ✅ Checklist Final

Antes de considerar todo funcional:

- [ ] Login con Google funciona
- [ ] Dashboard muestra stats correctas
- [ ] 8 categorías visibles con colores únicos
- [ ] 16 lecciones seed cargadas
- [ ] Búsqueda filtra correctamente
- [ ] Filtros por categoría funcionan
- [ ] Favoritos se guardan y persisten
- [ ] Progreso se actualiza en tiempo real
- [ ] Recomendaciones aparecen después de completar lecciones
- [ ] Perfil muestra ring de progreso visual
- [ ] Generación IA crea lecciones válidas
- [ ] Logout cierra sesión correctamente
- [ ] Diseño Frutiger Aero se ve perfecto
- [ ] Animaciones son fluidas
- [ ] Responsive funciona en móvil

---

## 🐛 Troubleshooting Durante Testing

### "No se encontraron lecciones"

```bash
# Verificar que datos seed existan
mongosh --eval "use('test_database'); db.lessons.count()"
# Debería ser 16

# Si es 0, ejecutar seed
python /app/scripts/seed_data.py
python /app/scripts/add_content.py
```

### Sesión no persiste después de login

```bash
# Verificar CORS en backend/.env
grep CORS_ORIGINS /app/backend/.env
# Debe ser "*" o incluir tu dominio

# Verificar cookies en navegador
# Application > Cookies > session_token debe existir
```

### Recomendaciones no aparecen

```python
# Verificar que endpoint funciona
curl -H "Cookie: session_token=TU_TOKEN" \
  https://quick-mastery-2.preview.emergentagent.com/api/lessons/recommendations

# Completar al menos 1 lección para activar recomendaciones
```

### Categorías sin color

```javascript
// Frontend > DevTools > Console
// Verificar que getCategoryColor tiene las 8 categorías
// Dashboard.js, Explore.js, LessonDetail.js, Profile.js
```

---

<div align="center">

**¿Todo funciona? ¡Felicidades! 🎉**

Tu app de micro-aprendizaje está lista para usuarios reales

[← Volver a README](../README.md) | [Ver documentación de GitHub](./GITHUB_MANAGEMENT.md)

</div>
