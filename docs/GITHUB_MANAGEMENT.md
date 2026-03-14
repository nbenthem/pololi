# 📋 Guía de Gestión desde GitHub

## 🔄 Workflow de Desarrollo

### 1. Clonar y Configurar
```bash
# Clonar repositorio
git clone <tu-repo-url>
cd microskill

# Instalar dependencias backend
cd backend
pip install -r requirements.txt

# Instalar dependencias frontend
cd ../frontend
yarn install

# Seed de datos
cd ../scripts
python seed_data.py
python add_content.py
```

### 2. Crear Nueva Rama para Feature
```bash
git checkout -b feature/nueva-categoria
```

### 3. Desarrollo Local
```bash
# Terminal 1: Backend
cd backend
uvicorn server:app --reload --port 8001

# Terminal 2: Frontend
cd frontend
yarn start
```

### 4. Commit y Push
```bash
git add .
git commit -m "feat: añadir categoría de Marketing Digital"
git push origin feature/nueva-categoria
```

### 5. Crear Pull Request
En GitHub:
1. Ve a tu repositorio
2. Click en "Pull Requests" → "New Pull Request"
3. Selecciona tu branch → "Create Pull Request"
4. Describe los cambios y asigna reviewers

---

## 🚀 Deployment a Producción

### Opción 1: Deployment Automático (GitHub Actions)

Crea `.github/workflows/deploy.yml`:
```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Deploy to Emergent
        run: |
          # Tu script de deployment
          ./scripts/deploy.sh
```

### Opción 2: Deployment Manual

```bash
# 1. Pull últimos cambios en servidor
ssh usuario@tu-servidor
cd /app
git pull origin main

# 2. Instalar nuevas dependencias (si las hay)
cd backend
pip install -r requirements.txt

cd ../frontend
yarn install

# 3. Rebuild frontend
yarn build

# 4. Restart servicios
sudo supervisorctl restart backend frontend

# 5. Verificar
curl https://tu-app.com/api/categories
```

---

## 📦 Añadir Nuevas Funcionalidades

### Añadir Nueva Categoría

1. **Crear script de migración** (`scripts/add_new_category.py`):
```python
from pymongo import MongoClient
import os
from dotenv import load_dotenv

load_dotenv('../backend/.env')
client = MongoClient(os.environ['MONGO_URL'])
db = client[os.environ['DB_NAME']]

new_category = {
    "category_id": "cat_marketing",
    "name": "Marketing Digital",
    "description": "Domina estrategias de marketing online",
    "color": "#EC4899",  # Pink
    "icon": "megaphone",
    "slug": "marketing-digital"
}

db.categories.insert_one(new_category)
print(f"✓ Categoría '{new_category['name']}' añadida")
```

2. **Actualizar colores en frontend** (`src/pages/Dashboard.js`):
```javascript
const getCategoryColor = (categoryId) => {
  const colors = {
    // ... existing colors
    'cat_marketing': 'from-pink-400 to-pink-600',
  };
  return colors[categoryId];
};
```

3. **Ejecutar migración**:
```bash
python scripts/add_new_category.py
```

4. **Commit y deploy**:
```bash
git add .
git commit -m "feat: añadir categoría Marketing Digital"
git push origin main
```

### Añadir Nuevo Endpoint API

1. **Editar backend** (`backend/server.py`):
```python
@api_router.get("/lessons/popular")
async def get_popular_lessons():
    # Lógica para obtener lecciones populares
    lessons = await db.lessons.find({}, {"_id": 0}).sort("views", -1).limit(10).to_list(100)
    return lessons
```

2. **Test local**:
```bash
curl http://localhost:8001/api/lessons/popular
```

3. **Añadir en frontend** (`src/pages/Dashboard.js`):
```javascript
const fetchPopular = async () => {
  const res = await axios.get(`${API_URL}/api/lessons/popular`, {
    withCredentials: true
  });
  setPopularLessons(res.data);
};
```

4. **Commit**:
```bash
git add backend/server.py frontend/src/pages/Dashboard.js
git commit -m "feat: añadir endpoint de lecciones populares"
git push
```

---

## 🔍 Monitoreo y Debugging

### Ver Logs en Producción

```bash
# Backend logs
tail -f /var/log/supervisor/backend.err.log
tail -f /var/log/supervisor/backend.out.log

# Frontend logs
tail -f /var/log/supervisor/frontend.err.log
```

### Debugging de Base de Datos

```bash
# Conectar a MongoDB
mongosh $MONGO_URL

# Usar DB
use microskill_production

# Ver usuarios
db.users.find().limit(5)

# Ver lecciones más completadas
db.user_progress.aggregate([
  {$match: {completed: true}},
  {$group: {_id: "$lesson_id", count: {$sum: 1}}},
  {$sort: {count: -1}},
  {$limit: 10}
])

# Ver stats de categorías
db.lessons.aggregate([
  {$group: {_id: "$category_id", count: {$sum: 1}}}
])
```

### Monitoreo de Performance

```bash
# CPU y memoria
top
htop

# Disco
df -h

# Procesos
ps aux | grep python
ps aux | grep node

# Status de servicios
sudo supervisorctl status
```

---

## 🐛 Hotfixes Rápidos

### Bug Crítico en Producción

```bash
# 1. Crear branch de hotfix desde main
git checkout main
git pull
git checkout -b hotfix/critical-bug

# 2. Fix el bug
vim backend/server.py

# 3. Test local
pytest
curl http://localhost:8001/api/test

# 4. Commit y push
git add .
git commit -m "fix: resolver bug crítico en autenticación"
git push origin hotfix/critical-bug

# 5. Merge directo a main (sin PR si es urgente)
git checkout main
git merge hotfix/critical-bug
git push origin main

# 6. Deploy inmediato
ssh servidor "cd /app && git pull && sudo supervisorctl restart backend"

# 7. Verificar
curl https://tu-app.com/api/auth/me
```

---

## 📊 Backups y Recuperación

### Backup de MongoDB

```bash
# Backup completo
mongodump --uri="$MONGO_URL" --out=/backups/$(date +%Y%m%d)

# Backup de colección específica
mongodump --uri="$MONGO_URL" --collection=lessons --out=/backups/lessons_$(date +%Y%m%d)

# Restaurar backup
mongorestore --uri="$MONGO_URL" /backups/20260301/
```

### Backup de Código

```bash
# Todo está en Git, pero backup adicional:
tar -czf microskill_$(date +%Y%m%d).tar.gz /app/
```

---

## 🔐 Gestión de Secrets

### Variables de Entorno Sensibles

**NUNCA** commitear archivos `.env` a Git

```bash
# .gitignore debe incluir:
backend/.env
frontend/.env
*.env.local
```

### Usar GitHub Secrets (para CI/CD)

1. Ve a tu repo → Settings → Secrets and variables → Actions
2. Add secret:
   - `MONGO_URL`
   - `EMERGENT_LLM_KEY`
   - `PRODUCTION_SERVER_SSH_KEY`

3. Úsalos en GitHub Actions:
```yaml
- name: Deploy
  env:
    MONGO_URL: ${{ secrets.MONGO_URL }}
    EMERGENT_LLM_KEY: ${{ secrets.EMERGENT_LLM_KEY }}
```

---

## 📈 Analytics y Métricas

### Queries Útiles de MongoDB

```javascript
// Usuarios activos últimos 7 días
db.user_sessions.count({
  created_at: {$gte: new Date(Date.now() - 7*24*60*60*1000)}
})

// Lección más popular
db.user_progress.aggregate([
  {$match: {completed: true}},
  {$group: {_id: "$lesson_id", completions: {$sum: 1}}},
  {$sort: {completions: -1}},
  {$limit: 1}
])

// Tasa de conversión (registro → primera lección)
db.users.aggregate([
  {
    $lookup: {
      from: "user_progress",
      localField: "user_id",
      foreignField: "user_id",
      as: "progress"
    }
  },
  {
    $project: {
      has_progress: {$gt: [{$size: "$progress"}, 0]}
    }
  },
  {
    $group: {
      _id: null,
      total: {$sum: 1},
      with_progress: {$sum: {$cond: ["$has_progress", 1, 0]}}
    }
  },
  {
    $project: {
      conversion_rate: {$multiply: [{$divide: ["$with_progress", "$total"]}, 100]}
    }
  }
])
```

---

## 🎯 Checklist de Pre-Deploy

- [ ] Tests pasan (`pytest` backend, `yarn test` frontend)
- [ ] Linting ok (`ruff` backend, `eslint` frontend)
- [ ] Variables .env actualizadas en producción
- [ ] Migraciones de DB ejecutadas
- [ ] Backup de DB creado
- [ ] README actualizado con nuevas features
- [ ] CHANGELOG.md actualizado
- [ ] Versión bumpeada (semver)
- [ ] PR reviewed y aprobado
- [ ] Notificar al equipo del deploy

---

<div align="center">

**¿Preguntas? Abre un issue en GitHub o contacta al equipo**

[⬆ Volver al README principal](../README.md)

</div>