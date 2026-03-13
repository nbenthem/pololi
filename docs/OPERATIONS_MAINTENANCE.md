# 🔧 Guía de Manejo y Mantenimiento - MicroSkill

## Tabla de Contenidos

1. [Gestión de Base de Datos](#gestión-de-base-de-datos)
2. [Monitoreo y Salud del Sistema](#monitoreo-y-salud-del-sistema)
3. [Backups y Recuperación](#backups-y-recuperación)
4. [Gestión de Usuarios](#gestión-de-usuarios)
5. [Moderación de Contenido](#moderación-de-contenido)
6. [Performance y Optimización](#performance-y-optimización)
7. [Logs y Debugging](#logs-y-debugging)
8. [Actualizaciones y Deployments](#actualizaciones-y-deployments)
9. [Seguridad](#seguridad)
10. [Métricas y Analytics](#métricas-y-analytics)
11. [Troubleshooting Común](#troubleshooting-común)
12. [Escalabilidad](#escalabilidad)

---

## 1. Gestión de Base de Datos

### 📊 Colecciones de MongoDB

```bash
# Conectar a MongoDB
mongosh $MONGO_URL

# Usar la base de datos
use test_database

# Ver todas las colecciones
show collections
```

**Colecciones principales:**
- `users` - Usuarios registrados
- `user_sessions` - Sesiones activas
- `categories` - Categorías de lecciones
- `lessons` - Contenido de lecciones
- `user_progress` - Progreso de lecciones
- `user_favorites` - Favoritos de usuarios
- `user_gamification` - Puntos, niveles, badges

### 🔍 Consultas Útiles

```javascript
// Contar usuarios registrados
db.users.count()

// Ver usuarios más activos
db.user_progress.aggregate([
  {$match: {completed: true}},
  {$group: {_id: "$user_id", count: {$sum: 1}}},
  {$sort: {count: -1}},
  {$limit: 10}
])

// Lecciones más populares
db.user_progress.aggregate([
  {$match: {completed: true}},
  {$group: {_id: "$lesson_id", completions: {$sum: 1}}},
  {$sort: {completions: -1}},
  {$limit: 10},
  {$lookup: {
    from: "lessons",
    localField: "_id",
    foreignField: "lesson_id",
    as: "lesson_info"
  }}
])

// Usuarios inactivos (sin actividad en 30 días)
db.user_gamification.find({
  last_activity_date: {
    $lt: new Date(Date.now() - 30*24*60*60*1000).toISOString()
  }
})

// Sesiones expiradas (limpiar)
db.user_sessions.deleteMany({
  expires_at: {$lt: new Date().toISOString()}
})
```

### 🧹 Limpieza de Datos

```bash
# Script de limpieza semanal
cat > /app/scripts/weekly_cleanup.py << 'EOF'
from pymongo import MongoClient
from datetime import datetime, timezone, timedelta
import os
from dotenv import load_dotenv

load_dotenv('/app/backend/.env')
client = MongoClient(os.environ['MONGO_URL'])
db = client[os.environ['DB_NAME']]

# Eliminar sesiones expiradas
expired = db.user_sessions.delete_many({
    "expires_at": {"$lt": datetime.now(timezone.utc).isoformat()}
})
print(f"✓ Sesiones expiradas eliminadas: {expired.deleted_count}")

# Actualizar rachas rotas (usuarios sin actividad >1 día)
yesterday = (datetime.now(timezone.utc) - timedelta(days=2)).date().isoformat()
broken_streaks = db.user_gamification.update_many(
    {
        "current_streak": {"$gt": 0},
        "last_activity_date": {"$lt": yesterday}
    },
    {"$set": {"current_streak": 0}}
)
print(f"✓ Rachas rotas actualizadas: {broken_streaks.modified_count}")

print("\n✅ Limpieza completada")
EOF

python /app/scripts/weekly_cleanup.py
```

### 📈 Índices para Performance

```javascript
// Crear índices en MongoDB
use test_database

// Índices para búsquedas frecuentes
db.users.createIndex({"email": 1}, {unique: true})
db.user_sessions.createIndex({"session_token": 1}, {unique: true})
db.user_sessions.createIndex({"expires_at": 1})
db.lessons.createIndex({"category_id": 1})
db.lessons.createIndex({"author_id": 1})
db.user_progress.createIndex({"user_id": 1, "lesson_id": 1}, {unique: true})
db.user_favorites.createIndex({"user_id": 1, "lesson_id": 1}, {unique: true})
db.user_gamification.createIndex({"user_id": 1}, {unique: true})
db.user_gamification.createIndex({"points": -1})  // Para leaderboard

// Verificar índices
db.lessons.getIndexes()
```

---

## 2. Monitoreo y Salud del Sistema

### 🔍 Verificar Estado de Servicios

```bash
# Estado de todos los servicios
sudo supervisorctl status

# Backend
sudo supervisorctl status backend
tail -f /var/log/supervisor/backend.out.log

# Frontend
sudo supervisorctl status frontend
tail -f /var/log/supervisor/frontend.out.log

# Reiniciar si es necesario
sudo supervisorctl restart backend
sudo supervisorctl restart frontend
```

### 📊 Métricas del Sistema

```bash
# Uso de CPU y memoria
htop

# Uso de disco
df -h
du -sh /app/*

# Procesos de Python (backend)
ps aux | grep python

# Procesos de Node (frontend)
ps aux | grep node

# Conexiones activas
netstat -an | grep :8001  # Backend
netstat -an | grep :3000  # Frontend

# MongoDB stats
mongosh --eval "db.stats()" $MONGO_URL
```

### ⚠️ Alertas Automáticas

```bash
# Script de monitoreo
cat > /app/scripts/health_check.sh << 'EOF'
#!/bin/bash

API_URL="https://quickskill-preview.preview.emergentagent.com"

# Check backend
BACKEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" $API_URL/api/categories)
if [ "$BACKEND_STATUS" != "200" ]; then
    echo "⚠️ ALERT: Backend no responde (HTTP $BACKEND_STATUS)"
    sudo supervisorctl restart backend
fi

# Check MongoDB
MONGO_STATUS=$(mongosh --quiet --eval "db.adminCommand('ping').ok" $MONGO_URL 2>&1)
if [ "$MONGO_STATUS" != "1" ]; then
    echo "⚠️ ALERT: MongoDB no responde"
fi

# Check disk space
DISK_USAGE=$(df -h / | awk 'NR==2 {print $5}' | sed 's/%//')
if [ "$DISK_USAGE" -gt 80 ]; then
    echo "⚠️ ALERT: Disco al ${DISK_USAGE}%"
fi

echo "✓ Health check completado"
EOF

chmod +x /app/scripts/health_check.sh

# Ejecutar cada 5 minutos (agregar a crontab)
# */5 * * * * /app/scripts/health_check.sh >> /var/log/health_check.log 2>&1
```

---

## 3. Backups y Recuperación

### 💾 Backup de MongoDB

```bash
# Backup completo diario
cat > /app/scripts/backup_db.sh << 'EOF'
#!/bin/bash

BACKUP_DIR="/app/backups"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_PATH="$BACKUP_DIR/mongodb_$DATE"

mkdir -p $BACKUP_DIR

# Backup de MongoDB
mongodump --uri="$MONGO_URL" --out="$BACKUP_PATH"

# Comprimir
tar -czf "$BACKUP_PATH.tar.gz" -C $BACKUP_DIR "mongodb_$DATE"
rm -rf "$BACKUP_PATH"

# Eliminar backups antiguos (> 7 días)
find $BACKUP_DIR -name "mongodb_*.tar.gz" -mtime +7 -delete

echo "✓ Backup completado: $BACKUP_PATH.tar.gz"
EOF

chmod +x /app/scripts/backup_db.sh

# Ejecutar diariamente a las 2 AM
# 0 2 * * * /app/scripts/backup_db.sh >> /var/log/backup.log 2>&1
```

### 🔄 Restaurar desde Backup

```bash
# Listar backups disponibles
ls -lh /app/backups/

# Restaurar backup específico
BACKUP_FILE="/app/backups/mongodb_20260301_020000.tar.gz"

# Descomprimir
tar -xzf $BACKUP_FILE -C /tmp/

# Restaurar a MongoDB
mongorestore --uri="$MONGO_URL" --drop /tmp/mongodb_20260301_020000/

echo "✓ Restauración completada"
```

### 📦 Backup de Código

```bash
# Backup de código y configuración
tar -czf /app/backups/code_$(date +%Y%m%d).tar.gz \
  /app/backend \
  /app/frontend \
  /app/scripts \
  --exclude='node_modules' \
  --exclude='__pycache__' \
  --exclude='.git'
```

---

## 4. Gestión de Usuarios

### 👥 Administración de Usuarios

```javascript
// Buscar usuario por email
db.users.findOne({email: "user@example.com"})

// Listar usuarios recientes (últimos 10)
db.users.find().sort({created_at: -1}).limit(10)

// Usuarios con más progreso
db.user_gamification.find().sort({points: -1}).limit(20)

// Desactivar usuario (eliminar sesiones)
db.user_sessions.deleteMany({user_id: "user_id_aqui"})

// Eliminar usuario completamente (CUIDADO)
var user_id = "user_id_aqui"
db.users.deleteOne({user_id: user_id})
db.user_sessions.deleteMany({user_id: user_id})
db.user_progress.deleteMany({user_id: user_id})
db.user_favorites.deleteMany({user_id: user_id})
db.user_gamification.deleteOne({user_id: user_id})
```

### 🔓 Resetear Contraseña de Usuario

```javascript
// Como usamos OAuth, no hay contraseñas
// Para usuarios con email/password (futuro):
// 1. Generar token de reset
// 2. Enviar email con link
// 3. Actualizar contraseña con hash bcrypt
```

### 🎖️ Otorgar Badge Manualmente

```javascript
// Dar badge a usuario específico
db.user_gamification.updateOne(
  {user_id: "user_id_aqui"},
  {$addToSet: {badges: "badge_id_aqui"}}
)

// Dar puntos adicionales
db.user_gamification.updateOne(
  {user_id: "user_id_aqui"},
  {$inc: {points: 100}}  // +100 puntos
)
```

---

## 5. Moderación de Contenido

### 📝 Revisar Lecciones Creadas por Usuarios

```javascript
// Listar lecciones de usuarios (no plataforma)
db.lessons.find({author_id: {$ne: null}}).sort({created_at: -1})

// Ver detalle de lección específica
db.lessons.findOne({lesson_id: "lesson_id_aqui"})

// Aprobar lección (marcar como verificada)
db.lessons.updateOne(
  {lesson_id: "lesson_id_aqui"},
  {$set: {verified: true, verified_at: new Date()}}
)

// Rechazar/eliminar lección
db.lessons.deleteOne({lesson_id: "lesson_id_aqui"})

// También eliminar progreso asociado
db.user_progress.deleteMany({lesson_id: "lesson_id_aqui"})
db.user_favorites.deleteMany({lesson_id: "lesson_id_aqui"})
```

### 🚫 Sistema de Reportes (Futuro)

```javascript
// Colección para reportes de contenido inapropiado
db.createCollection("content_reports")

// Estructura sugerida:
// {
//   report_id: string,
//   lesson_id: string,
//   reported_by: user_id,
//   reason: string,
//   status: "pending" | "reviewed" | "resolved",
//   created_at: date
// }
```

---

## 6. Performance y Optimización

### ⚡ Optimización de Consultas

```javascript
// Usar explain() para analizar queries lentas
db.lessons.find({category_id: "cat_productivity"}).explain("executionStats")

// Si scan > 1000 docs, crear índice
db.lessons.createIndex({category_id: 1})

// Verificar queries lentas en MongoDB
db.currentOp({
  "active": true,
  "secs_running": {"$gt": 5}
})
```

### 🚀 Caché y CDN

```bash
# Configurar caché de imágenes (Nginx futuro)
# /etc/nginx/sites-available/microskill
location ~* \.(jpg|jpeg|png|gif|ico|css|js)$ {
    expires 30d;
    add_header Cache-Control "public, immutable";
}

# Comprimir respuestas
gzip on;
gzip_types text/plain text/css application/json application/javascript;
```

### 📉 Reducir Latencia de API

```python
# Backend: Implementar paginación en lecciones
@api_router.get("/lessons")
async def get_lessons(
    skip: int = 0, 
    limit: int = 20,  # Máximo 20 por página
    category_id: Optional[str] = None
):
    query = {}
    if category_id:
        query["category_id"] = category_id
    
    lessons = await db.lessons.find(query, {"_id": 0})\
        .sort("created_at", -1)\
        .skip(skip)\
        .limit(limit)\
        .to_list(limit)
    
    total = await db.lessons.count_documents(query)
    
    return {
        "lessons": lessons,
        "total": total,
        "skip": skip,
        "limit": limit
    }
```

---

## 7. Logs y Debugging

### 📋 Ubicación de Logs

```bash
# Backend logs
/var/log/supervisor/backend.out.log  # Output normal
/var/log/supervisor/backend.err.log  # Errores

# Frontend logs
/var/log/supervisor/frontend.out.log
/var/log/supervisor/frontend.err.log

# Supervisor logs
/var/log/supervisor/supervisord.log

# MongoDB logs (si instalado local)
/var/log/mongodb/mongod.log
```

### 🔍 Analizar Logs

```bash
# Ver últimos errores del backend
tail -100 /var/log/supervisor/backend.err.log | grep -i error

# Buscar usuario específico en logs
grep "user_id_aqui" /var/log/supervisor/backend.out.log

# Errores de las últimas 24h
find /var/log/supervisor -name "*.err.log" -mtime -1 -exec tail -50 {} \;

# Monitorear en tiempo real
tail -f /var/log/supervisor/backend.err.log
```

### 🐛 Debugging de API

```bash
# Habilitar logging detallado en FastAPI
# backend/server.py
import logging
logging.basicConfig(level=logging.DEBUG)

# Logs de todas las requests
uvicorn server:app --log-level debug

# Test endpoint específico con verboso
curl -v https://quickskill-preview.preview.emergentagent.com/api/lessons
```

---

## 8. Actualizaciones y Deployments

### 🚀 Proceso de Deployment

```bash
# 1. Backup antes de actualizar
/app/scripts/backup_db.sh

# 2. Pull últimos cambios (si usas Git)
cd /app
git pull origin main

# 3. Actualizar dependencias backend
cd /app/backend
pip install -r requirements.txt

# 4. Actualizar dependencias frontend
cd /app/frontend
yarn install

# 5. Ejecutar migraciones si las hay
python /app/scripts/migrate_db.py

# 6. Reiniciar servicios
sudo supervisorctl restart backend frontend

# 7. Verificar que funciona
curl https://quickskill-preview.preview.emergentagent.com/api/categories
```

### 🔄 Rollback

```bash
# Si algo sale mal, volver a versión anterior

# Git rollback
git revert HEAD
git push origin main

# Restaurar backup de DB
mongorestore --uri="$MONGO_URL" --drop /app/backups/mongodb_YYYYMMDD/

# Reiniciar servicios
sudo supervisorctl restart backend frontend
```

### 📦 Migraciones de Base de Datos

```python
# Ejemplo: scripts/migrate_add_field.py
from pymongo import MongoClient
import os

client = MongoClient(os.environ['MONGO_URL'])
db = client[os.environ['DB_NAME']]

# Añadir campo 'verified' a todas las lecciones
result = db.lessons.update_many(
    {},
    {"$set": {"verified": True}}
)

print(f"✓ {result.modified_count} lecciones actualizadas")
```

---

## 9. Seguridad

### 🔐 Variables de Entorno

```bash
# NUNCA commitear .env a Git
# Verificar .gitignore
cat /app/.gitignore | grep .env

# Rotar secrets periódicamente
# 1. Generar nuevo EMERGENT_LLM_KEY
# 2. Actualizar en backend/.env
# 3. Reiniciar backend
```

### 🛡️ Validación de Entrada

```python
# Backend: Validar inputs de usuarios
from pydantic import BaseModel, validator

class CreateLessonRequest(BaseModel):
    title: str
    description: str
    
    @validator('title')
    def title_length(cls, v):
        if len(v) < 10 or len(v) > 100:
            raise ValueError('Título debe tener 10-100 caracteres')
        return v
```

### 🚫 Rate Limiting

```python
# Implementar rate limiting (futuro)
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter

@app.route("/api/lessons/create")
@limiter.limit("10/hour")  # Máximo 10 lecciones por hora
async def create_lesson(...):
    ...
```

---

## 10. Métricas y Analytics

### 📊 KPIs Principales

```javascript
// Usuarios activos diarios (DAU)
var today = new Date()
today.setHours(0,0,0,0)

db.user_gamification.count({
  last_activity_date: {$gte: today.toISOString()}
})

// Usuarios activos mensuales (MAU)
var lastMonth = new Date()
lastMonth.setMonth(lastMonth.getMonth() - 1)

db.user_gamification.count({
  last_activity_date: {$gte: lastMonth.toISOString()}
})

// Tasa de retención (día 7)
// Usuarios que volvieron después de 7 días de registro
db.users.aggregate([
  {$match: {created_at: {$gte: new Date(Date.now() - 14*24*60*60*1000).toISOString()}}},
  {$lookup: {
    from: "user_gamification",
    localField: "user_id",
    foreignField: "user_id",
    as: "activity"
  }},
  {$match: {"activity.lessons_completed": {$gte: 1}}}
])

// Lecciones completadas por día
db.user_progress.aggregate([
  {$match: {completed: true}},
  {$group: {
    _id: {$substr: ["$completed_at", 0, 10]},
    count: {$sum: 1}
  }},
  {$sort: {_id: -1}},
  {$limit: 30}
])
```

### 📈 Dashboard de Métricas

```bash
# Script para generar reporte diario
cat > /app/scripts/daily_report.py << 'EOF'
from pymongo import MongoClient
from datetime import datetime, timezone, timedelta
import os

client = MongoClient(os.environ['MONGO_URL'])
db = client[os.environ['DB_NAME']]

print("📊 REPORTE DIARIO - MicroSkill")
print("="*50)

# Total usuarios
total_users = db.users.count_documents({})
print(f"\n👥 Usuarios totales: {total_users}")

# Usuarios activos hoy
today = datetime.now(timezone.utc).date().isoformat()
active_today = db.user_gamification.count_documents({
    "last_activity_date": today
})
print(f"✅ Activos hoy: {active_today}")

# Lecciones completadas hoy
completed_today = db.user_progress.count_documents({
    "completed_at": {"$gte": today}
})
print(f"📚 Lecciones completadas hoy: {completed_today}")

# Nuevas lecciones creadas por usuarios
user_lessons = db.lessons.count_documents({
    "author_id": {"$ne": None}
})
print(f"✍️ Lecciones de usuarios: {user_lessons}")

# Top 5 usuarios por puntos
top_users = list(db.user_gamification.find(
    {}, {"_id": 0, "user_id": 1, "points": 1}
).sort("points", -1).limit(5))
print(f"\n🏆 Top 5 usuarios:")
for i, user in enumerate(top_users, 1):
    print(f"  {i}. {user['user_id']}: {user['points']} pts")

print("\n" + "="*50)
EOF

python /app/scripts/daily_report.py
```

---

## 11. Troubleshooting Común

### ❌ Backend no inicia

```bash
# Verificar logs
tail -50 /var/log/supervisor/backend.err.log

# Errores comunes:
# 1. Módulo no encontrado
pip install -r /app/backend/requirements.txt

# 2. Puerto ocupado
lsof -i :8001
kill -9 <PID>

# 3. MongoDB no conecta
mongosh $MONGO_URL  # Verificar conexión

# 4. Variable de entorno faltante
cat /app/backend/.env
```

### ❌ Frontend no compila

```bash
# Ver error
tail -50 /var/log/supervisor/frontend.err.log

# Limpiar caché
cd /app/frontend
rm -rf node_modules yarn.lock
yarn install

# Verificar versión de Node
node --version  # Debe ser 18+

# Verificar variables .env
cat /app/frontend/.env
```

### ❌ Sesiones no persisten

```bash
# Verificar cookies
# En navegador: F12 > Application > Cookies
# Debe estar: session_token con httpOnly=true, secure=true

# Verificar CORS
grep CORS_ORIGINS /app/backend/.env

# Verificar que backend acepta cookies
curl -v https://quickskill-preview.preview.emergentagent.com/api/auth/me \
  -H "Cookie: session_token=TEST"
```

### ❌ MongoDB lento

```javascript
// Ver operaciones lentas
db.currentOp({"secs_running": {$gte: 3}})

// Matar operación lenta
db.killOp(<opid>)

// Analizar tamaño de colecciones
db.stats()

// Reconstruir índices
db.lessons.reIndex()
```

---

## 12. Escalabilidad

### 📈 Cuando Escalar

**Señales de que necesitas escalar:**
- CPU > 80% constantemente
- Memoria > 85%
- Tiempo de respuesta API > 500ms
- MongoDB > 100 queries/segundo
- Usuarios concurrentes > 1000

### 🚀 Estrategias de Escalabilidad

**1. Escalado Vertical (más recursos):**
```bash
# Aumentar recursos en el servidor
# CPU: 2 → 4 cores
# RAM: 4GB → 8GB
# Disco: 50GB → 100GB
```

**2. Escalado Horizontal (más servidores):**
```bash
# Load balancer (Nginx)
upstream backend {
    server backend1.example.com:8001;
    server backend2.example.com:8001;
}

# MongoDB replica set
mongosh
rs.initiate()
rs.add("mongodb2.example.com:27017")
rs.add("mongodb3.example.com:27017")
```

**3. CDN para Assets:**
```bash
# Usar Cloudflare/AWS CloudFront
# - Imágenes de lecciones
# - JavaScript/CSS bundles
# - Assets estáticos
```

**4. Caché con Redis:**
```python
# Cachear lecciones populares
import redis
cache = redis.Redis(host='localhost', port=6379)

@api_router.get("/lessons/{lesson_id}")
async def get_lesson(lesson_id: str):
    # Check cache first
    cached = cache.get(f"lesson:{lesson_id}")
    if cached:
        return json.loads(cached)
    
    # If not in cache, fetch from DB
    lesson = await db.lessons.find_one({"lesson_id": lesson_id})
    
    # Store in cache (expire in 1 hour)
    cache.setex(f"lesson:{lesson_id}", 3600, json.dumps(lesson))
    
    return lesson
```

---

## 📅 Checklist de Mantenimiento

### Diario
- [ ] Verificar logs de errores
- [ ] Revisar métricas de usuarios activos
- [ ] Verificar estado de servicios (supervisor status)

### Semanal
- [ ] Backup completo de MongoDB
- [ ] Limpiar sesiones expiradas
- [ ] Revisar lecciones creadas por usuarios
- [ ] Actualizar rachas rotas
- [ ] Revisar uso de disco

### Mensual
- [ ] Actualizar dependencias (pip, yarn)
- [ ] Revisar y optimizar queries lentas
- [ ] Analizar KPIs y tendencias
- [ ] Rotar logs antiguos
- [ ] Revisar y actualizar documentación

### Trimestral
- [ ] Auditoría de seguridad
- [ ] Revisar y optimizar índices de MongoDB
- [ ] Plan de escalabilidad
- [ ] Backup completo offsite
- [ ] Actualizar stack tecnológico (si necesario)

---

## 🆘 Contactos de Emergencia

**Documentación Técnica:**
- README: `/app/README.md`
- Admin Guide: `/app/docs/ADMIN_USER_GUIDE.md`
- GitHub Management: `/app/docs/GITHUB_MANAGEMENT.md`
- Testing Guide: `/app/docs/TESTING_GUIDE.md`

**Scripts Útiles:**
- Backup DB: `/app/scripts/backup_db.sh`
- Health Check: `/app/scripts/health_check.sh`
- Cleanup: `/app/scripts/weekly_cleanup.py`
- Daily Report: `/app/scripts/daily_report.py`

**Comandos Rápidos:**
```bash
# Restart todo
sudo supervisorctl restart all

# Ver status
sudo supervisorctl status

# Logs en tiempo real
tail -f /var/log/supervisor/*.log

# Backup urgente
/app/scripts/backup_db.sh

# Health check
/app/scripts/health_check.sh
```

---

<div align="center">

**MicroSkill Operations Guide v1.0**

[← Volver al README](../README.md)

</div>
