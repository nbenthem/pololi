# 🔑 Guía de Usuario Admin para Testing

## Usuario Administrador Creado

**Email:** admin@microskill.com  
**User ID:** admin_user_123  
**Session Token:** `admin_session_permanent_token`

### Gamificación Pre-configurada

- **Puntos:** 250
- **Nivel:** 3
- **Badges:** 3 desbloqueados
  - 👶 Primer Paso (completa 1 lección)
  - 📚 Aprendiz (completa 10 lecciones)
  - ✍️ Creador (crea 1 lección)
- **Racha Actual:** 5 días 🔥
- **Lecciones Completadas:** 12
- **Lecciones Creadas:** 2
- **Favoritos:** 2 lecciones guardadas

---

## 🚀 Método 1: Login Automático con Cookie (Recomendado)

### Opción A: Usando DevTools del Navegador

1. **Abre la app:** https://quickskill-preview.preview.emergentagent.com

2. **Abre DevTools (F12)** y ve a la pestaña **Console**

3. **Pega este código** para crear la cookie de sesión:

```javascript
document.cookie = "session_token=admin_session_permanent_token; path=/; domain=.preview.emergentagent.com; secure; samesite=none; max-age=31536000";
console.log("✓ Session cookie creada!");
```

4. **Recarga la página** (F5) - deberías estar logeado como Admin

5. **Verifica** que estás logeado:
   - Deberías ver "¡Hola, Admin Usuario! ✨" en el dashboard
   - Navbar muestra tu nombre

---

### Opción B: Usando Extensión de Navegador (EditThisCookie)

1. **Instala extensión:** [EditThisCookie](https://chrome.google.com/webstore/detail/editthiscookie/fngmhnnpilhplaeedifhccceomclgfbg) (Chrome)

2. **Ve a:** https://quickskill-preview.preview.emergentagent.com

3. **Abre EditThisCookie** (icono en barra de herramientas)

4. **Añade nueva cookie:**
   - Name: `session_token`
   - Value: `admin_session_permanent_token`
   - Domain: `.preview.emergentagent.com`
   - Path: `/`
   - Secure: ✓ (checked)
   - HttpOnly: ✓ (checked)
   - SameSite: `None`

5. **Guarda y recarga** la página

---

## 🧪 Método 2: API Testing con curl

### Ver datos de gamificación

```bash
API_URL="https://quickskill-preview.preview.emergentagent.com"

# Tu gamificación
curl -X GET "$API_URL/api/gamification/me" \
  -H "Cookie: session_token=admin_session_permanent_token" \
  | python3 -m json.tool

# Leaderboard
curl -X GET "$API_URL/api/gamification/leaderboard" \
  -H "Cookie: session_token=admin_session_permanent_token" \
  | python3 -m json.tool

# Todos los badges disponibles
curl -X GET "$API_URL/api/gamification/badges" \
  | python3 -m json.tool
```

### Completar una lección (ganar puntos)

```bash
# Marca lesson_019 como completada
curl -X PUT "$API_URL/api/progress/lesson_019" \
  -H "Content-Type: application/json" \
  -H "Cookie: session_token=admin_session_permanent_token" \
  -d '{"completed": true}'

# Verifica tus nuevos puntos
curl -X GET "$API_URL/api/gamification/me" \
  -H "Cookie: session_token=admin_session_permanent_token" \
  | grep points
```

### Crear una lección (ganar 50 puntos)

```bash
curl -X POST "$API_URL/api/lessons/create" \
  -H "Content-Type: application/json" \
  -H "Cookie: session_token=admin_session_permanent_token" \
  -d '{
    "title": "Mi Lección de Prueba",
    "description": "Una lección creada por el admin para testing",
    "category_id": "cat_productivity",
    "key_points": [
      "Punto clave 1",
      "Punto clave 2",
      "Punto clave 3"
    ],
    "practical_examples": [
      "Ejemplo práctico 1",
      "Ejemplo práctico 2"
    ],
    "conclusion": "Conclusión de la lección",
    "insights": [
      "Insight interesante 1",
      "Insight interesante 2"
    ],
    "quiz_questions": [
      {
        "question": "¿Pregunta de prueba?",
        "options": ["Opción A", "Opción B", "Opción C", "Opción D"],
        "correct_answer": 1
      }
    ],
    "image_url": "https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=800"
  }'
```

---

## 🎮 Probar Sistema de Gamificación

### 1. Verificar Estado Inicial

Una vez logeado como admin:

1. **Ve a tu Perfil** (icono de usuario en navbar)
2. **Deberías ver:**
   - Ring de progreso: ~63% (12/19 lecciones)
   - Stat cards: 12 completadas, 2 favoritos
   - 3 badges visibles

### 2. Completar Lecciones para Ganar Puntos

1. **Ve a "Explorar"**
2. **Abre cualquier lección NO completada** (ej: lesson_011, lesson_012)
3. **Haz clic en "Marcar como completada"**
4. **Deberías ver notificación:** "+10 puntos ganados"
5. **Verifica en Perfil** que tus puntos aumentaron

### 3. Probar Racha Diaria

- Si completas una lección el día siguiente, ganarás **+20 puntos extra** por mantener racha
- La racha se rompe si pasas >1 día sin actividad

### 4. Desbloquear Nuevo Badge

Para desbloquear "Erudito" (25 lecciones):
- Necesitas completar 13 lecciones más
- Cada lección = +10 puntos
- Al llegar a 25, badge se otorga automáticamente

### 5. Ver Leaderboard

```bash
# Ver top 10 usuarios
curl "$API_URL/api/gamification/leaderboard" \
  -H "Cookie: session_token=admin_session_permanent_token"
```

Deberías ver tu posición en el ranking global.

---

## 📊 Sistema de Puntos Completo

| Acción | Puntos | Notas |
|--------|--------|-------|
| Completar lección | +10 | Primera vez solamente |
| Crear lección | +50 | Lección propia |
| Tu lección completada por otro | +5 | Por cada usuario |
| Racha diaria | +20 | Bonus si completas algo cada día |
| Quiz perfecto | +5 | Responder todo correcto (futuro) |

---

## 🏆 Badges Disponibles

| Badge | Condición | Icono |
|-------|-----------|-------|
| Primer Paso | Completa 1 lección | 👶 |
| Aprendiz | Completa 10 lecciones | 📚 |
| Erudito | Completa 25 lecciones | 🎓 |
| Creador | Crea 1 lección | ✍️ |
| Mentor | 5 usuarios completaron tus lecciones | 👨‍🏫 |
| Constante | 7 días de racha | 🔥 |
| Imparable | 30 días de racha | 🔥🔥 |
| Experto | Alcanza nivel 5 | ⭐ |
| Maestro | Alcanza nivel 10 | 🏆 |

---

## 🔧 Niveles y Experiencia

| Nivel | Puntos Requeridos |
|-------|-------------------|
| 1 | 0 |
| 2 | 100 |
| 3 | 250 ← **Admin está aquí** |
| 4 | 500 |
| 5 | 1,000 |
| 6 | 2,000 |
| 7 | 3,500 |
| 8 | 5,000 |
| 9 | 7,500 |
| 10 | 10,000 |

**Admin actual:** Nivel 3 con 250 puntos  
**Siguiente nivel:** Necesita 250 puntos más (total 500)

---

## 🐛 Troubleshooting

### Cookie no persiste

Si la cookie se borra al recargar:

```javascript
// Usa este código más explícito
fetch('https://quickskill-preview.preview.emergentagent.com/api/auth/me', {
  credentials: 'include',
  headers: {
    'Cookie': 'session_token=admin_session_permanent_token'
  }
}).then(r => r.json()).then(console.log);
```

### No aparece como logeado

1. Verifica que la cookie existe:
```javascript
console.log(document.cookie);
// Debería incluir: session_token=admin_session_permanent_token
```

2. Verifica sesión en backend:
```bash
mongosh --eval "
  use('test_database');
  db.user_sessions.findOne({session_token: 'admin_session_permanent_token'})
"
```

### Recrear usuario admin

```bash
python /app/scripts/create_admin_user.py
```

---

## 📝 Siguiente Paso: Testing Frontend

Una vez logeado como admin, puedes probar:

1. ✅ Dashboard con recomendaciones
2. ✅ Explorar y filtrar lecciones
3. ✅ Ver detalle de lección con imagen
4. ⚠️ **Ver insights** (pendiente implementar en frontend)
5. ⚠️ **Hacer quiz** (pendiente implementar en frontend)
6. ⚠️ **Ver modal de gamificación** (pendiente integrar)
7. ⚠️ **Crear lección desde UI** (pendiente implementar)
8. ⚠️ **Ver leaderboard** (pendiente implementar)

---

<div align="center">

**El backend de gamificación está 100% funcional**  
**Frontend necesita componentes de UI para visualizarlo**

[← Volver al README](../README.md)

</div>
