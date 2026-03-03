#!/usr/bin/env python3
"""Add more categories and generate AI lessons"""
import os
import sys
from pathlib import Path
from datetime import datetime, timezone
from pymongo import MongoClient
from dotenv import load_dotenv
import asyncio

ROOT_DIR = Path(__file__).parent.parent / "backend"
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
db_name = os.environ['DB_NAME']

client = MongoClient(mongo_url)
db = client[db_name]

# Add new categories
new_categories = [
    {
        "category_id": "cat_productivity",
        "name": "Productividad & Hábitos",
        "description": "Optimiza tu tiempo y construye hábitos ganadores",
        "color": "#F59E0B",
        "icon": "rocket",
        "slug": "productividad-habitos"
    },
    {
        "category_id": "cat_health",
        "name": "Salud & Bienestar",
        "description": "Cuida tu cuerpo y mente para rendir al máximo",
        "color": "#10B981",
        "icon": "heart",
        "slug": "salud-bienestar"
    },
    {
        "category_id": "cat_creativity",
        "name": "Creatividad & Innovación",
        "description": "Desbloquea tu potencial creativo y piensa diferente",
        "color": "#8B5CF6",
        "icon": "lightbulb",
        "slug": "creatividad-innovacion"
    },
    {
        "category_id": "cat_leadership",
        "name": "Relaciones & Liderazgo",
        "description": "Lidera equipos e influye positivamente en otros",
        "color": "#EF4444",
        "icon": "users",
        "slug": "relaciones-liderazgo"
    }
]

print("Adding new categories...")
for cat in new_categories:
    existing = db.categories.find_one({"category_id": cat["category_id"]})
    if not existing:
        db.categories.insert_one(cat)
        print(f"✓ Added: {cat['name']}")
    else:
        print(f"⊘ Already exists: {cat['name']}")

# Manual lessons for new categories
new_lessons = [
    {
        "lesson_id": "lesson_009",
        "title": "Método Pomodoro: Productividad científica",
        "description": "La técnica de gestión del tiempo más efectiva del mundo",
        "category_id": "cat_productivity",
        "duration": 5,
        "content": {
            "title": "Método Pomodoro: Productividad científica",
            "description": "25 minutos pueden cambiar tu forma de trabajar para siempre",
            "key_points": [
                "Trabaja en bloques de 25 minutos (un Pomodoro) sin interrupciones, seguidos de 5 minutos de descanso obligatorio",
                "Después de 4 Pomodoros, toma un descanso largo de 15-30 minutos para recuperar la concentración profunda",
                "La clave está en la monofocus: un Pomodoro = una única tarea. Si surge una interrupción, anótala y continúa",
                "Estudios muestran que el cerebro mantiene focus óptimo 25-30 minutos; después la productividad cae 40%",
                "No es solo tiempo - es ritmo circadiano mental: trabajas con tus ciclos naturales de atención, no contra ellos"
            ],
            "practical_examples": [
                "Sesión de escritura: Programa 25 min, escribe sin editar. Descanso 5 min (estiramiento). Repite 4 veces = 2h de contenido creado vs 4h sin método",
                "Estudiando: 1 Pomodoro = leer capítulo. Descanso. 1 Pomodoro = hacer resumen. Descanso. Retención aumenta 60% vs maratones de estudio"
            ],
            "conclusion": "El Pomodoro no es trabajar más - es trabajar en sintonía con tu biología. Los descansos no son pérdida de tiempo, son combustible para el siguiente sprint mental."
        },
        "created_at": datetime.now(timezone.utc).isoformat()
    },
    {
        "lesson_id": "lesson_010",
        "title": "El poder de los hábitos atómicos",
        "description": "Pequeños cambios, resultados extraordinarios",
        "category_id": "cat_productivity",
        "duration": 5,
        "content": {
            "title": "El poder de los hábitos atómicos",
            "description": "Mejora 1% cada día = 37x mejor en un año (matemática del interés compuesto)",
            "key_points": [
                "Regla del 1%: Mejorar 1% diario = 37 veces mejor en un año (1.01^365 = 37.78). Empeorar 1% = casi cero",
                "Hábitos son interés compuesto del auto-mejoramiento: el tiempo multiplica lo que alimentas (bueno o malo)",
                "Ley de las 4 etapas: hacer hábito obvio (señal visible), atractivo (vincular a placer), fácil (<2 min), satisfactorio (recompensa inmediata)",
                "Identity-based habits: No digas 'quiero correr', di 'soy corredor'. Cambio de identidad antes que comportamiento",
                "Stack de hábitos: ancla nuevo hábito a uno existente - 'Después de [hábito actual], haré [nuevo hábito]'"
            ],
            "practical_examples": [
                "Quieres leer más: coloca libro en almohada por la mañana (obvio) + lee solo 1 página antes de dormir (fácil) + marca páginas leídas en calendario (satisfactorio) = 12 libros/año",
                "Ejercicio matutino: 'Después de servir café (ancla existente), haré 5 flexiones' → identidad 'soy atleta matutino' → eventualmente workout completo"
            ],
            "conclusion": "Los hábitos son la arquitectura invisible de tu vida. No necesitas cambio radical - necesitas sistema que haga inevitable el progreso."
        },
        "created_at": datetime.now(timezone.utc).isoformat()
    },
    {
        "lesson_id": "lesson_011",
        "title": "Sueño: La ventaja competitiva olvidada",
        "description": "Cómo 8 horas te hacen más inteligente que 12h de vigilia",
        "category_id": "cat_health",
        "duration": 5,
        "content": {
            "title": "Sueño: La ventaja competitiva olvidada",
            "description": "Dormir bien no es lujo - es la herramienta de optimización más poderosa que tienes",
            "key_points": [
                "Menos de 7h de sueño = -30% capacidad cognitiva, -40% tiempo de reacción, +300% errores de juicio (equivale a estar legalmente ebrio)",
                "El sueño no es pasivo: es cuando el cerebro limpia toxinas, consolida memorias y soluciona problemas creativos (eureka matutino es real)",
                "REM vs profundo: REM para aprendizaje/creatividad, sueño profundo para recuperación física/inmune. Necesitas 4-5 ciclos completos (90 min c/u)",
                "Luz azul (pantallas) suprime melatonina 2h. La evolución no diseñó tu cerebro para ver 'soles' artificiales a medianoche",
                "Temperatura: cuerpo necesita bajar 1-2°C para dormir. Ducha caliente → vasodilatación → enfriamiento rápido = sueño profundo más rápido"
            ],
            "practical_examples": [
                "Optimización nocturna: Última pantalla 90min antes de dormir + habitación 18-19°C + ruido blanco/oscuridad total = caes dormido en <10min vs 40min promedio",
                "Power nap científico: 20min exactos entre 13-15h (ritmo circadiano natural). Café antes de dormir (cafeína tarda 20min) = despiertas súper alerta"
            ],
            "conclusion": "Dormir bien no es para débiles - todos los CEOs top, atletas de elite y Nobel duermen 8h+. Es el multiplicador secreto de rendimiento."
        },
        "created_at": datetime.now(timezone.utc).isoformat()
    },
    {
        "lesson_id": "lesson_012",
        "title": "Técnicas de creatividad bajo demanda",
        "description": "Genera ideas brillantes cuando las necesitas, no cuando te visitan",
        "category_id": "cat_creativity",
        "duration": 5,
        "content": {
            "title": "Técnicas de creatividad bajo demanda",
            "description": "La creatividad no es magia - es un proceso sistemático que puedes activar",
            "key_points": [
                "SCAMPER: Sustituir, Combinar, Adaptar, Modificar, Proponer otros usos, Eliminar, Reordenar. Framework para forzar perspectivas nuevas",
                "Pensamiento lateral de Bono: '¿Y si...?' extremos. Airbnb surgió de '¿Y si tu casa fuera un hotel?' - pregunta absurda → negocio $100B",
                "Restricciones generan creatividad: Twitter limitó a 140 caracteres y creó un lenguaje nuevo. Menos opciones = más originalidad (paradoja de elección)",
                "Sesiones de idea sin filtro: 10 min generando ideas sin juzgar (cantidad > calidad) + 10 min refinando las 3 mejores. Juicio prematuro mata creatividad",
                "Cross-pollination: combina ideas de campos distintos. Netflix = renta de DVDs (Blockbuster) + algoritmos (Amazon) + streaming (YouTube)"
            ],
            "practical_examples": [
                "Necesitas nombre para producto: SCAMPER → ¿Qué pasa si elimino vocales? Tumblr, Flickr. ¿Combino 2 palabras? Facebook, YouTube, LinkedIn",
                "Problema: nadie lee tus emails. Técnica absurda: '¿Y si fuera 1 emoji?' → asunto minimalista + mensaje 3 líneas max = 300% más respuestas"
            ],
            "conclusion": "La inspiración es amateur - los profesionales usan sistemas. Creatividad = conectar puntos que otros no ven, y puedes entrenar esa habilidad."
        },
        "created_at": datetime.now(timezone.utc).isoformat()
    },
    {
        "lesson_id": "lesson_013",
        "title": "Liderazgo situacional: No hay un estilo para todos",
        "description": "Adapta tu liderazgo según la persona y el momento",
        "category_id": "cat_leadership",
        "duration": 5,
        "content": {
            "title": "Liderazgo situacional: No hay un estilo para todos",
            "description": "Los mejores líderes no tienen un solo estilo - tienen 4 y saben cuándo usar cada uno",
            "key_points": [
                "4 niveles de madurez del empleado: D1 (novato entusiasta), D2 (aprendiz desilusionado), D3 (capaz inseguro), D4 (experto autónomo)",
                "D1 necesita Directing (órdenes claras, mucha supervisión): 'Haz X, luego Y'. D2 necesita Coaching (explica el porqué, apoyo emocional)",
                "D3 necesita Supporting (participación, confianza): 'Tú decides, yo apoyo'. D4 necesita Delegating (autonomía total): 'Tú tienes esto'",
                "Error común: tratar D1 como D4 (delegar sin training) = fracaso. Tratar D4 como D1 (micro-management) = renuncia del talento",
                "El nivel no es permanente: alguien D4 en marketing puede ser D2 en ventas. Evalúa por tarea/proyecto, no por persona globalmente"
            ],
            "practical_examples": [
                "Nuevo empleado (D1) en proyecto: 'Esta semana aprende el sistema CRM. Aquí está el checklist. Revisamos juntos cada día 15min'. No delegues ni esperes iniciativa",
                "Empleado senior frustrado (D3): 'Veo que dominas esto. ¿Cómo crees que deberíamos abordar el proyecto? Confío en tu criterio'. Das autonomía con red de seguridad"
            ],
            "conclusion": "Liderazgo efectivo = flexibilidad. No eres 'líder autoritario' o 'líder democrático' - eres adaptable según lo que tu equipo necesita en cada momento."
        },
        "created_at": datetime.now(timezone.utc).isoformat()
    },
    {
        "lesson_id": "lesson_014",
        "title": "Pensamiento crítico: Detecta falacias",
        "description": "No creas todo lo que piensas - cuestiona tus propias conclusiones",
        "category_id": "cat_psychology",
        "duration": 5,
        "content": {
            "title": "Pensamiento crítico: Detecta falacias",
            "description": "Las falacias lógicas arruinan decisiones diarias - aprende a identificarlas",
            "key_points": [
                "Ad Hominem: atacar persona en vez de argumento. 'Su propuesta es mala porque es joven' - edad es irrelevante para calidad de idea",
                "Falacia del hombre de paja: distorsionar argumento ajeno para atacar versión débil. 'Propones reducir presupuesto militar, ¿quieres dejarnos indefensos?'",
                "Post hoc ergo propter hoc: confundir correlación con causalidad. 'Comí ajo y no me enfermé = ajo cura gripe' (ignora 99 variables)",
                "Falsa dicotomía: reducir opciones a 2 cuando hay más. 'O trabajas 80h/semana o no eres ambicioso' - existe el punto medio productivo",
                "Llamada a autoridad: 'X famoso lo dice = verdad'. Newton era genio en física, terrible en alquimia. Experiencia no es transferible a todo"
            ],
            "practical_examples": [
                "Reunión: 'Plan A falló, probemos Plan B'. Pensamiento crítico: '¿Por qué solo 2 opciones? ¿Qué tal Plan C = combinar lo mejor de ambos?'",
                "Noticia: 'Crimen aumentó tras elección del alcalde'. Crítico: ¿Correlación o causalidad? ¿Qué otros factores cambiaron? ¿Tendencia previa? No asumas relación directa"
            ],
            "conclusion": "Pensamiento crítico no es ser negativo - es ser riguroso. Cuestiona todo (especialmente tus propias creencias) antes de tomar decisiones importantes."
        },
        "created_at": datetime.now(timezone.utc).isoformat()
    },
    {
        "lesson_id": "lesson_015",
        "title": "Networking efectivo: Calidad sobre cantidad",
        "description": "200 contactos superficiales < 20 relaciones reales",
        "category_id": "cat_leadership",
        "duration": 5,
        "content": {
            "title": "Networking efectivo: Calidad sobre cantidad",
            "description": "El mejor networker no es quien tiene más tarjetas - es quien construye relaciones auténticas",
            "key_points": [
                "Regla 80/20: 80% dar valor, 20% pedir. No networks para 'conseguir algo' - networks para aportar. La reciprocidad viene sola",
                "Follow-up en 24-48h es crucial: envía email con 'me interesó cuando mencionaste X' + enlace útil relacionado. 90% no hace esto = tú destacas",
                "Weak ties theory: tus mejores oportunidades vienen de conocidos casuales (no amigos íntimos). Conexiones débiles te dan acceso a redes nuevas",
                "Haz introducciones valiosas: conecta 2 personas que se beneficiarían mutuamente. Convertirte en 'conector' multiplica tu valor exponencialmente",
                "Networking no es solo eventos - es conversaciones intencionales diarias. Café con alguien interesante > conferencia de 500 personas"
            ],
            "practical_examples": [
                "Post-evento: 'Hola Ana, me gustó tu punto sobre IA en marketing. Vi este artículo de MIT que expande tu idea [link]. ¿Café próxima semana?' - específico + valor + llamado a acción",
                "Introducciones: 'Juan, conoce a María. Juan busca freelancer diseño UX, María es la mejor que conozco. María, Juan tiene startup fintech fascinante'. Ambos ganan, tú eres el puente"
            ],
            "conclusion": "Networking auténtico = construir relaciones antes de necesitarlas. Cuando pides ayuda a alguien con quien cultivaste conexión real, la respuesta es casi siempre 'sí'."
        },
        "created_at": datetime.now(timezone.utc).isoformat()
    },
    {
        "lesson_id": "lesson_016",
        "title": "Mindfulness: Atención plena sin pseudociencia",
        "description": "Los beneficios científicos de la meditación sin el misticismo",
        "category_id": "cat_health",
        "duration": 5,
        "content": {
            "title": "Mindfulness: Atención plena sin pseudociencia",
            "description": "Neurociencia prueba que 10 minutos diarios cambian tu cerebro literalmente",
            "key_points": [
                "Mindfulness = observar pensamientos sin juzgarlos ni engancharte. No es 'mente en blanco' - es notar cuando divaga y volver al presente",
                "Estudios Harvard: 8 semanas de práctica → +corteza prefrontal (toma de decisiones), -amígdala (ansiedad). Cambios medibles en resonancia magnética",
                "No necesitas sesiones de 1h: 10 min diarios = beneficios equivalentes. Consistencia > duración. Es como gym - mejor 10 min diario que 2h esporádicas",
                "Técnica básica: foco en respiración. Mente divaga (normal) → notas 'pensando' → vuelves a respiración sin frustración. Repetir = entrenar atención",
                "Aplicación práctica: mindfulness eating, walking, listening. No es solo sentarte con incienso - es estar presente en cualquier actividad"
            ],
            "practical_examples": [
                "Mañana: 5 min sentado, ojos cerrados, cuenta 10 respiraciones. Pierde cuenta en 3 (normal) → empieza de nuevo sin juzgarte. Esto ES la práctica, no fallar",
                "Reunión estresante: notas tensión mandíbula → respiras profundo 3 veces consciente → tu reacción cambia de automática (gritar) a elegida (escuchar). Espacio entre estímulo y respuesta"
            ],
            "conclusion": "Mindfulness no es religión ni escape - es entrenamiento de atención como el gimnasio entrena músculo. En mundo de distracciones infinitas, atención sostenida es superpoder."
        },
        "created_at": datetime.now(timezone.utc).isoformat()
    }
]

print("\nAdding manual lessons...")
for lesson in new_lessons:
    existing = db.lessons.find_one({"lesson_id": lesson["lesson_id"]})
    if not existing:
        db.lessons.insert_one(lesson)
        print(f"✓ Added: {lesson['title']}")
    else:
        print(f"⊘ Already exists: {lesson['title']}")

total_categories = db.categories.count_documents({})
total_lessons = db.lessons.count_documents({})

print(f"\n✅ Update complete!")
print(f"Total categories: {total_categories}")
print(f"Total lessons: {total_lessons}")
