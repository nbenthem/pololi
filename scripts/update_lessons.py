#!/usr/bin/env python3
"""Update existing lessons with images, quizzes, and resources"""
import os
from pathlib import Path
from pymongo import MongoClient
from dotenv import load_dotenv

ROOT_DIR = Path(__file__).parent.parent / "backend"
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
db_name = os.environ['DB_NAME']

client = MongoClient(mongo_url)
db = client[db_name]

# Lesson enhancements: images, quizzes, resources, insights
enhancements = {
    "lesson_001": {
        "image_url": "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&q=80",
        "insights": [
            "El 70% de los profesionales que negocian su primer salario ganan un 7% mas que los que no lo hacen",
            "Las mujeres negocian salarios un 30% menos que los hombres - cerrar esta brecha empieza con informacion",
            "El mejor momento para negociar es cuando tienes otra oferta sobre la mesa"
        ],
        "resources": [
            {"title": "Never Split the Difference - Chris Voss", "url": "https://www.masterclass.com/articles/chris-voss-negotiation-tactics", "description": "Tacticas de negociacion de un ex-negociador del FBI"},
            {"title": "Harvard Negotiation Project", "url": "https://www.pon.harvard.edu/", "description": "Investigacion academica sobre negociacion"},
            {"title": "Glassdoor - Rangos salariales", "url": "https://www.glassdoor.com/Salaries/", "description": "Investiga salarios reales por posicion y empresa"}
        ],
        "quiz": [
            {"question": "Cual es la mejor estrategia para empezar una negociacion salarial?", "options": ["Pedir el minimo que aceptarias", "Empezar con una cifra superior a tu objetivo", "Dejar que la empresa haga la primera oferta siempre", "Amenazar con irte si no suben"], "correct_answer": 1},
            {"question": "En que debes enfocarte durante la negociacion?", "options": ["Tus necesidades personales", "Lo mal pagado que estas", "El valor que aportas a la empresa", "Los salarios de tus companeros"], "correct_answer": 2},
            {"question": "Que debes considerar ademas del salario base?", "options": ["Solo el salario importa", "Beneficios, bonos y flexibilidad", "La decoracion de la oficina", "El nombre del puesto"], "correct_answer": 1}
        ]
    },
    "lesson_002": {
        "image_url": "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=800&q=80",
        "insights": [
            "El 55% de la comunicacion es no verbal segun el estudio de Mehrabian",
            "Las microexpresiones duran solo 1/25 de segundo pero revelan emociones verdaderas",
            "El mirroring inconsciente ocurre naturalmente cuando hay conexion genuina"
        ],
        "resources": [
            {"title": "Paul Ekman - Microexpresiones", "url": "https://www.paulekman.com/", "description": "Investigador pionero en microexpresiones faciales"},
            {"title": "What Every BODY is Saying - Joe Navarro", "url": "https://www.jnforensics.com/", "description": "Ex agente del FBI experto en comportamiento no verbal"},
            {"title": "TED: Body Language - Amy Cuddy", "url": "https://www.ted.com/talks/amy_cuddy_your_body_language_may_shape_who_you_are", "description": "Como tu postura afecta tu confianza"}
        ],
        "quiz": [
            {"question": "Que indica cuando alguien orienta sus pies hacia la salida?", "options": ["Estan comodos", "Quieren irse o no estan interesados", "Es casualidad", "Tienen frio"], "correct_answer": 1},
            {"question": "Cuanto dura una microexpresion?", "options": ["5 segundos", "1 segundo", "1/25 de segundo", "10 segundos"], "correct_answer": 2},
            {"question": "Que es el mirroring?", "options": ["Mirarse al espejo", "Imitar sutilmente los gestos del otro", "Hablar igual que los demas", "Vestir igual"], "correct_answer": 1}
        ]
    },
    "lesson_003": {
        "image_url": "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&q=80",
        "insights": [
            "La computacion cuantica podria resolver en minutos problemas que tardan miles de anos",
            "El GPS de tu movil necesita correcciones de relatividad para funcionar correctamente",
            "La criptografia cuantica hara las comunicaciones practicamente invulnerables"
        ],
        "resources": [
            {"title": "Quantum Country - Andy Matuschak", "url": "https://quantum.country/", "description": "Curso interactivo de mecanica cuantica con repeticion espaciada"},
            {"title": "PBS Space Time - YouTube", "url": "https://www.youtube.com/c/pbsspacetime", "description": "Canal de fisica accesible con rigor cientifico"},
            {"title": "Feynman Lectures on Physics", "url": "https://www.feynmanlectures.caltech.edu/", "description": "Las legendarias clases de Richard Feynman, gratis online"}
        ],
        "quiz": [
            {"question": "Que es la dualidad onda-particula?", "options": ["Las particulas son solo ondas", "Las particulas se comportan como ondas Y particulas", "Las ondas no existen", "Solo aplica a la luz"], "correct_answer": 1},
            {"question": "Que dice el principio de incertidumbre?", "options": ["Todo es incierto", "No puedes conocer posicion y velocidad exactas a la vez", "Las particulas se mueven aleatoriamente", "La ciencia no puede medir nada"], "correct_answer": 1},
            {"question": "Que tecnologia actual usa mecanica cuantica?", "options": ["Motores de combustion", "Transistores de smartphones", "Ruedas de bicicleta", "Sistemas de riego"], "correct_answer": 1}
        ]
    },
    "lesson_004": {
        "image_url": "https://images.unsplash.com/photo-1573497620053-ea5300f94f21?w=800&q=80",
        "insights": [
            "Las parejas que discuten constructivamente tienen un 31% menos probabilidad de divorciarse",
            "El 69% de los conflictos en relaciones son perpetuos - la clave es gestionarlos, no resolverlos",
            "Usar yo en vez de tu reduce la defensividad un 40% segun estudios de comunicacion"
        ],
        "resources": [
            {"title": "Crucial Conversations - Patterson et al", "url": "https://www.vitalsmarts.com/crucial-conversations-book/", "description": "El libro de referencia para conversaciones dificiles"},
            {"title": "Nonviolent Communication - Marshall Rosenberg", "url": "https://www.cnvc.org/", "description": "Comunicacion no violenta: empatia y conexion"},
            {"title": "The Gottman Institute", "url": "https://www.gottman.com/", "description": "Investigacion sobre relaciones y comunicacion de parejas"}
        ],
        "quiz": [
            {"question": "Como debes comenzar una conversacion dificil?", "options": ["Con juicios sobre la otra persona", "Con hechos objetivos", "Gritando para imponer respeto", "Ignorando el problema"], "correct_answer": 1},
            {"question": "Por que es mejor usar yo en vez de tu?", "options": ["Suena mas profesional", "Evita activar la defensividad", "Es gramaticalmente correcto", "No hay diferencia"], "correct_answer": 1},
            {"question": "Cual es el objetivo de la escucha activa?", "options": ["Preparar tu contraargumento", "Demostrar superioridad", "Entender la perspectiva del otro", "Ganar tiempo"], "correct_answer": 2}
        ]
    },
    "lesson_005": {
        "image_url": "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&q=80",
        "insights": [
            "Warren Buffett empezo a invertir a los 11 anos y dice que empezo demasiado tarde",
            "100 euros al mes al 7% anual se convierten en 148.000 euros en 30 anos",
            "El 95% de los fondos de gestion activa no superan a un fondo indexado a largo plazo"
        ],
        "resources": [
            {"title": "The Little Book of Common Sense Investing - J. Bogle", "url": "https://www.bogleheads.org/", "description": "Filosofia de inversion pasiva del creador de Vanguard"},
            {"title": "Indexa Capital", "url": "https://indexacapital.com/", "description": "Robo-advisor lider en Espana para inversion indexada"},
            {"title": "Investopedia - Guia de principiantes", "url": "https://www.investopedia.com/investing-4427685", "description": "Enciclopedia completa de conceptos de inversion"}
        ],
        "quiz": [
            {"question": "Que es el dollar-cost averaging?", "options": ["Invertir todo de golpe", "Invertir cantidades fijas regularmente", "Solo comprar cuando baja", "Pedir prestado para invertir"], "correct_answer": 1},
            {"question": "Que debes priorizar antes de invertir?", "options": ["Comprar acciones de moda", "Una cuenta de emergencia de 3-6 meses", "Un coche nuevo", "Criptomonedas"], "correct_answer": 1},
            {"question": "Que porcentaje de fondos activos supera a los indexados?", "options": ["80%", "50%", "Menos del 5%", "Todos"], "correct_answer": 2}
        ]
    },
    "lesson_006": {
        "image_url": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80",
        "insights": [
            "El principio de reciprocidad es tan fuerte que funciona incluso con favores no solicitados",
            "Amazon usa escasez constantemente: solo quedan X unidades aumenta las ventas un 226%",
            "Las resenas de otros usuarios influyen en el 93% de las decisiones de compra online"
        ],
        "resources": [
            {"title": "Influence - Robert Cialdini", "url": "https://www.influenceatwork.com/", "description": "El libro clasico sobre los 6 principios de persuasion"},
            {"title": "Thinking, Fast and Slow - Daniel Kahneman", "url": "https://en.wikipedia.org/wiki/Thinking,_Fast_and_Slow", "description": "Como tomamos decisiones: sesgos cognitivos"},
            {"title": "Cialdini en TED", "url": "https://www.ted.com/speakers/robert_cialdini", "description": "Charlas de Cialdini sobre la ciencia de la persuasion"}
        ],
        "quiz": [
            {"question": "Cual es el principio de reciprocidad?", "options": ["Comprar barato vender caro", "Las personas devuelven favores recibidos", "Ser reciproco en el amor", "Dar solo si recibes"], "correct_answer": 1},
            {"question": "Por que funciona la escasez?", "options": ["A todos les gusta lo caro", "Valoramos mas lo limitado o exclusivo", "Es una tecnica de estafa", "No funciona realmente"], "correct_answer": 1},
            {"question": "Que es la prueba social?", "options": ["Un examen de sociologia", "Seguir el comportamiento de otros similares", "Demostrar que eres social", "Publicar en redes sociales"], "correct_answer": 1}
        ]
    },
    "lesson_007": {
        "image_url": "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=800&q=80",
        "insights": [
            "El 78% de los trabajadores vive al dia - la educacion financiera es urgente",
            "La inflacion del 3% reduce tu poder adquisitivo a la mitad en 24 anos",
            "Automatizar el ahorro elimina la decision diaria y aumenta el ahorro un 45%"
        ],
        "resources": [
            {"title": "Padre Rico, Padre Pobre - R. Kiyosaki", "url": "https://www.richdad.com/", "description": "Mentalidad financiera basica explicada con historias"},
            {"title": "Finanzas para Mortales - BME", "url": "https://www.finanzasparamortales.es/", "description": "Educacion financiera gratuita en espanol"},
            {"title": "Mr. Money Mustache", "url": "https://www.mrmoneymustache.com/", "description": "Blog de referencia sobre independencia financiera"}
        ],
        "quiz": [
            {"question": "Que significa pagarte a ti mismo primero?", "options": ["Gastarte todo el sueldo", "Ahorrar automaticamente antes de gastar", "Comprar lo que quieras", "Pagar tus deudas primero"], "correct_answer": 1},
            {"question": "La regla de 48 horas sirve para...", "options": ["Descansar cada 48 horas", "Esperar antes de compras impulsivas", "Invertir cada 48 horas", "Cambiar de trabajo"], "correct_answer": 1},
            {"question": "Que tipo de deuda debes evitar?", "options": ["Hipoteca de vivienda", "Prestamo educativo", "Deuda de tarjeta de credito para consumo", "Todas las deudas"], "correct_answer": 2}
        ]
    },
    "lesson_008": {
        "image_url": "https://images.unsplash.com/photo-1544027993-37dbfe43562a?w=800&q=80",
        "insights": [
            "La IE predice el 58% del exito profesional segun estudios de TalentSmart",
            "Nombrar una emocion reduce su intensidad en un 40% - efecto de etiquetado afectivo",
            "Los lideres con alta IE tienen equipos un 20% mas productivos"
        ],
        "resources": [
            {"title": "Emotional Intelligence - Daniel Goleman", "url": "https://www.danielgoleman.info/", "description": "El libro que popularizo el concepto de inteligencia emocional"},
            {"title": "Greater Good Science Center - Berkeley", "url": "https://greatergood.berkeley.edu/", "description": "Investigacion sobre bienestar emocional y social"},
            {"title": "Yale Center for Emotional Intelligence", "url": "https://www.ycei.org/", "description": "Centro de investigacion lider en IE"}
        ],
        "quiz": [
            {"question": "Que es la autoconciencia emocional?", "options": ["Ser egoista", "Identificar y nombrar tus emociones en tiempo real", "Ignorar las emociones", "Controlar a los demas"], "correct_answer": 1},
            {"question": "Cuanto dura la pausa recomendada entre estimulo y respuesta?", "options": ["1 segundo", "6 segundos", "1 minuto", "10 minutos"], "correct_answer": 1},
            {"question": "Que es el reencuadre cognitivo?", "options": ["Cambiar de trabajo", "Cambiar la interpretacion de un evento", "Enmarcar fotos", "Reorganizar el escritorio"], "correct_answer": 1}
        ]
    }
}

# Also update lessons 011-016 that don't have quizzes
enhancements.update({
    "lesson_011": {
        "image_url": "https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?w=800&q=80",
        "insights": [
            "Dormir menos de 7 horas reduce la funcion cognitiva tanto como estar legalmente borracho",
            "El sueno REM consolida el aprendizaje - dormir despues de estudiar mejora la retencion un 40%",
            "Las siestas de 20 min mejoran la productividad un 34% segun la NASA"
        ],
        "resources": [
            {"title": "Why We Sleep - Matthew Walker", "url": "https://www.sleepdiplomat.com/", "description": "La ciencia del sueno explicada por el neurocientfico lider"},
            {"title": "Sleep Foundation", "url": "https://www.sleepfoundation.org/", "description": "Guias basadas en evidencia para mejorar tu sueno"}
        ],
        "quiz": [
            {"question": "Cuantas horas minimas de sueno recomienda la ciencia?", "options": ["4-5 horas", "5-6 horas", "7-9 horas", "10-12 horas"], "correct_answer": 2},
            {"question": "Que fase del sueno consolida el aprendizaje?", "options": ["Fase 1", "Fase 2", "Sueno profundo", "Sueno REM"], "correct_answer": 3},
            {"question": "Cuanto debe durar una siesta optima?", "options": ["5 minutos", "20 minutos", "1 hora", "2 horas"], "correct_answer": 1}
        ]
    },
    "lesson_012": {
        "image_url": "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=800&q=80",
        "insights": [
            "La creatividad no es un don - es una habilidad que se entrena con practica deliberada",
            "Las mejores ideas surgen cuando alternas entre foco intenso y relajacion",
            "Las restricciones estimulan la creatividad mas que la libertad total"
        ],
        "resources": [
            {"title": "Steal Like an Artist - Austin Kleon", "url": "https://austinkleon.com/steal/", "description": "10 principios para desbloquear la creatividad"},
            {"title": "Creative Confidence - IDEO", "url": "https://www.creativeconfidence.com/", "description": "Design thinking aplicado a la creatividad personal"}
        ],
        "quiz": [
            {"question": "Cuando surgen las mejores ideas creativas?", "options": ["Solo bajo presion", "Alternando foco intenso y relajacion", "Solo por la manana", "Nunca bajo restricciones"], "correct_answer": 1},
            {"question": "Las restricciones...", "options": ["Matan la creatividad", "No afectan", "Estimulan la creatividad", "Solo sirven en arte"], "correct_answer": 2}
        ]
    },
    "lesson_013": {
        "image_url": "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800&q=80",
        "insights": [
            "No existe un unico estilo de liderazgo optimo - el mejor lider adapta su estilo",
            "Los equipos con lideres adaptables rinden un 25% mejor",
            "El 80% de los empleados deja a su jefe, no a la empresa"
        ],
        "resources": [
            {"title": "Leaders Eat Last - Simon Sinek", "url": "https://simonsinek.com/books/leaders-eat-last/", "description": "Liderazgo basado en confianza y seguridad psicologica"},
            {"title": "Harvard Business Review - Liderazgo", "url": "https://hbr.org/topic/leadership", "description": "Articulos de referencia sobre liderazgo moderno"}
        ],
        "quiz": [
            {"question": "Que dice el liderazgo situacional?", "options": ["Hay un solo estilo correcto", "El lider adapta su estilo segun la situacion", "Solo importa la autoridad", "El lider nunca cambia"], "correct_answer": 1},
            {"question": "Por que la mayoria de empleados deja su trabajo?", "options": ["Salario bajo", "Su jefe directo", "La oficina es fea", "Horarios"], "correct_answer": 1}
        ]
    },
    "lesson_014": {
        "image_url": "https://images.unsplash.com/photo-1456406644174-8ddd4cd52a06?w=800&q=80",
        "insights": [
            "Las falacias logicas son tan comunes que las usamos sin darnos cuenta a diario",
            "Reconocer sesgos cognitivos mejora la toma de decisiones un 29%",
            "El pensamiento critico es la habilidad mas demandada por empleadores en 2025"
        ],
        "resources": [
            {"title": "Your Logical Fallacy Is", "url": "https://yourlogicalfallacyis.com/", "description": "Guia visual de las falacias logicas mas comunes"},
            {"title": "Thinking, Fast and Slow", "url": "https://en.wikipedia.org/wiki/Thinking,_Fast_and_Slow", "description": "Daniel Kahneman sobre sesgos cognitivos"}
        ],
        "quiz": [
            {"question": "Que es una falacia ad hominem?", "options": ["Atacar el argumento", "Atacar a la persona en vez del argumento", "Un argumento logico", "Una tecnica de debate valida"], "correct_answer": 1},
            {"question": "El pensamiento critico consiste en...", "options": ["Criticar todo", "Evaluar evidencia y argumentos objetivamente", "Desconfiar de todos", "Solo creer en la ciencia"], "correct_answer": 1}
        ]
    },
    "lesson_015": {
        "image_url": "https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=800&q=80",
        "insights": [
            "El 85% de los empleos se consiguen a traves de networking",
            "Tener 5 contactos fuertes es mas valioso que 500 superficiales",
            "Dar antes de pedir es la regla de oro del networking efectivo"
        ],
        "resources": [
            {"title": "Never Eat Alone - Keith Ferrazzi", "url": "https://keithferrazzi.com/", "description": "El arte de construir relaciones profesionales genuinas"},
            {"title": "LinkedIn Learning - Networking", "url": "https://www.linkedin.com/learning/", "description": "Cursos sobre networking profesional"}
        ],
        "quiz": [
            {"question": "Que porcentaje de empleos se consiguen por networking?", "options": ["20%", "50%", "85%", "100%"], "correct_answer": 2},
            {"question": "Cual es la regla de oro del networking?", "options": ["Pedir favores rapido", "Dar antes de pedir", "Tener muchos contactos", "Solo hablar de trabajo"], "correct_answer": 1}
        ]
    },
    "lesson_016": {
        "image_url": "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&q=80",
        "insights": [
            "8 semanas de mindfulness reducen la ansiedad un 58% segun estudios clinicos",
            "Solo 10 minutos diarios de meditacion cambian la estructura cerebral",
            "Google, Apple y Nike tienen programas de mindfulness para empleados"
        ],
        "resources": [
            {"title": "Headspace - App de meditacion", "url": "https://www.headspace.com/", "description": "Meditaciones guiadas para principiantes"},
            {"title": "Sam Harris - Waking Up", "url": "https://www.wakingup.com/", "description": "Mindfulness sin misticismo, enfoque cientifico"}
        ],
        "quiz": [
            {"question": "Cuanto tiempo diario de meditacion basta para ver cambios?", "options": ["1 minuto", "10 minutos", "1 hora", "3 horas"], "correct_answer": 1},
            {"question": "Que empresa tiene programa de mindfulness?", "options": ["Ninguna importante", "Google, Apple, Nike", "Solo startups", "Solo hospitales"], "correct_answer": 1}
        ]
    }
})

# Apply updates
print("Updating lessons with images, quizzes, and resources...")
updated = 0
for lesson_id, data in enhancements.items():
    result = db.lessons.update_one(
        {"lesson_id": lesson_id},
        {"$set": data}
    )
    if result.modified_count > 0:
        updated += 1
        print(f"  Updated: {lesson_id}")
    elif result.matched_count > 0:
        print(f"  Already up to date: {lesson_id}")
    else:
        print(f"  Not found: {lesson_id}")

print(f"\nUpdated {updated} lessons")
print("Done!")
