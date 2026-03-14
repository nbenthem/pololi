#!/usr/bin/env python3
"""Update existing lessons and add new ones with images, insights, and quizzes"""
import os
import sys
from pathlib import Path
from datetime import datetime, timezone
from pymongo import MongoClient
from dotenv import load_dotenv

ROOT_DIR = Path(__file__).parent.parent / "backend"
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
db_name = os.environ['DB_NAME']

client = MongoClient(mongo_url)
db = client[db_name]

# Update existing lessons with images, insights, and quizzes
print("Updating existing lessons...")

updates = {
    "lesson_001": {
        "image_url": "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800",
        "insights": [
            "La negociación no es ganar-perder, es encontrar valor mutuo",
            "El silencio es una herramienta poderosa - quien habla primero después de una oferta, generalmente pierde",
            "Siempre ten una BATNA (Best Alternative To Negotiated Agreement) - tu plan B te da poder"
        ],
        "quiz": [
            {
                "question": "¿Qué significa 'anclar' en negociación?",
                "options": [
                    "Empezar con una cifra que establece el rango de la negociación",
                    "Mantenerse firme en tu posición inicial",
                    "Terminar la negociación rápidamente",
                    "Evitar hablar de dinero directamente"
                ],
                "correct_answer": 0
            },
            {
                "question": "¿Cuándo deberías revelar tu salario actual?",
                "options": [
                    "Al inicio de la primera entrevista",
                    "Solo si te lo preguntan directamente",
                    "Nunca - enfócate en el valor del mercado",
                    "Después de recibir la oferta"
                ],
                "correct_answer": 2
            },
            {
                "question": "Si no pueden subir el salario, ¿qué deberías negociar?",
                "options": [
                    "Nada, aceptar la oferta",
                    "Beneficios, flexibilidad, bonos, días de vacaciones",
                    "Solo pedir más tiempo para pensar",
                    "Amenazar con rechazar la oferta"
                ],
                "correct_answer": 1
            }
        ]
    },
    "lesson_002": {
        "image_url": "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800",
        "insights": [
            "El 93% de la comunicación es no verbal (55% lenguaje corporal, 38% tono de voz)",
            "Las microexpresiones revelan emociones reales en 1/25 de segundo - muy difíciles de falsificar",
            "La dirección de los pies indica el verdadero interés - si apuntan hacia la salida, quieren irse"
        ],
        "quiz": [
            {
                "question": "¿Qué significa cuando alguien cruza los brazos?",
                "options": [
                    "Siempre están cerrados a la conversación",
                    "Puede ser defensa, comodidad o frío - necesitas más contexto",
                    "Están de acuerdo contigo",
                    "Están mintiendo"
                ],
                "correct_answer": 1
            },
            {
                "question": "¿Qué indican las microexpresiones?",
                "options": [
                    "Solo aparecen en personas nerviosas",
                    "Son fáciles de controlar conscientemente",
                    "Revelan emociones genuinas involuntariamente",
                    "No tienen significado real"
                ],
                "correct_answer": 2
            }
        ]
    },
    "lesson_003": {
        "image_url": "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800",
        "insights": [
            "La mecánica cuántica es probabilística - las partículas existen en estados de probabilidad hasta ser observadas",
            "El entrelazamiento cuántico es real y verificado experimentalmente - Einstein se equivocó en esto",
            "La mayoría de tecnología moderna (chips, lasers, MRI) no existiría sin entender física cuántica"
        ],
        "quiz": [
            {
                "question": "¿Qué es la dualidad onda-partícula?",
                "options": [
                    "Las partículas son ondas disfrazadas",
                    "Electrones y fotones se comportan como ondas Y partículas",
                    "Es solo una teoría sin pruebas",
                    "Solo aplica a la luz, no a la materia"
                ],
                "correct_answer": 1
            },
            {
                "question": "¿Qué significa superposición cuántica?",
                "options": [
                    "Una partícula puede estar en dos lugares a la vez",
                    "Las partículas se superponen físicamente",
                    "Una partícula existe en múltiples estados hasta ser medida",
                    "Es un efecto solo matemático sin realidad física"
                ],
                "correct_answer": 2
            }
        ]
    },
    "lesson_009": {
        "image_url": "https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=800",
        "insights": [
            "El Pomodoro funciona porque alinea con tu ritmo ultradiano de ~90 minutos de alta/baja energía",
            "Los descansos activos (caminar) son más restauradores que pasivos (scroll en redes)",
            "Productividad no es hacer más - es hacer lo importante con máxima energía mental"
        ],
        "quiz": [
            {
                "question": "¿Cuánto dura un Pomodoro estándar?",
                "options": ["15 minutos", "25 minutos", "30 minutos", "45 minutos"],
                "correct_answer": 1
            },
            {
                "question": "¿Qué haces si te interrumpen durante un Pomodoro?",
                "options": [
                    "Detienes el timer y atiendes la interrupción",
                    "Anotas la interrupción y continúas enfocado",
                    "Reinicias el Pomodoro desde cero",
                    "Abandonas la técnica por ese día"
                ],
                "correct_answer": 1
            }
        ]
    },
    "lesson_010": {
        "image_url": "https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=800",
        "insights": [
            "Los hábitos se forman en promedio en 66 días, no 21 - la persistencia es clave",
            "El ambiente diseña el comportamiento - rodéate de señales que faciliten el hábito deseado",
            "Falla forward: un día perdido no arruina el hábito - vuelve inmediatamente"
        ],
        "quiz": [
            {
                "question": "¿Qué significa 'habit stacking'?",
                "options": [
                    "Hacer múltiples hábitos simultáneamente",
                    "Anclar un nuevo hábito a uno existente",
                    "Apilar hábitos sin orden específico",
                    "Eliminar hábitos malos gradualmente"
                ],
                "correct_answer": 1
            },
            {
                "question": "Según la regla del 1%, mejorar 1% diario por un año te hace:",
                "options": ["2x mejor", "10x mejor", "37x mejor", "100x mejor"],
                "correct_answer": 2
            }
        ]
    }
}

for lesson_id, update_data in updates.items():
    result = db.lessons.update_one(
        {"lesson_id": lesson_id},
        {"$set": update_data}
    )
    if result.modified_count > 0:
        print(f"✓ Updated {lesson_id}")

print(f"\n✓ {len(updates)} lessons updated with images, insights, and quizzes")

# Add 10 new complete lessons
new_lessons = [
    {
        "lesson_id": "lesson_017",
        "title": "Deep Work: Concentración profunda en era de distracción",
        "description": "Técnicas para alcanzar estados de flow y máxima productividad",
        "category_id": "cat_productivity",
        "duration": 5,
        "image_url": "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=800",
        "content": {
            "title": "Deep Work: Concentración profunda",
            "description": "Cómo lograr 4 horas de trabajo profundo equivale a 8 horas de trabajo superficial",
            "key_points": [
                "Deep Work = actividad cognitiva en estado de concentración sin distracciones que empuja capacidades al límite",
                "El cerebro tarda 23 minutos en recuperar concentración después de una interrupción (estudio UC Irvine)",
                "Estrategia bimodal: bloques largos (4h+) de trabajo profundo vs trabajo superficial (emails, reuniones)",
                "Rituales importan: mismo lugar, misma hora, mismas señales = cerebro entra en modo productivo automáticamente",
                "Métrica real: minutos en concentración profunda, no horas en oficina. Calidad > cantidad"
            ],
            "practical_examples": [
                "Bill Gates hace 'Think Weeks' - 7 días aislado solo leyendo y pensando estratégicamente. Resultado: decisiones que definieron Microsoft",
                "Escritor Cal Newport: 3 sesiones de 90 min de deep work al día. Escribe libros académicos + bestsellers + mantiene vida personal equilibrada"
            ],
            "conclusion": "En economía moderna, habilidad de hacer deep work es cada vez más rara y valiosa. Quien domina concentración profunda domina su campo."
        },
        "insights": [
            "Los CEOs top protegen su calendario agresivamente - tiempo ininterrumpido es su activo más valioso",
            "Multitasking es mito - el cerebro solo cambia rápido entre tareas, perdiendo eficiencia cada vez",
            "Las mejores ideas emergen en deep work, no en meetings - soledad cognitiva es caldo de cultivo de insights"
        ],
        "quiz": [
            {
                "question": "¿Cuánto tiempo tarda el cerebro en recuperar concentración plena después de una interrupción?",
                "options": ["5 minutos", "10 minutos", "23 minutos", "1 hora"],
                "correct_answer": 2
            },
            {
                "question": "¿Qué es mejor para deep work?",
                "options": [
                    "Varias sesiones cortas de 30 minutos",
                    "Bloques largos e ininterrumpidos de 90+ minutos",
                    "Trabajar con música de fondo",
                    "Multitasking entre proyectos"
                ],
                "correct_answer": 1
            },
            {
                "question": "¿Por qué los rituales ayudan en deep work?",
                "options": [
                    "Por superstición",
                    "Entrenan al cerebro a entrar en modo productivo con señales específicas",
                    "Solo funcionan para ciertas personas",
                    "No hay evidencia de su efectividad"
                ],
                "correct_answer": 1
            }
        ],
        "author_id": None,
        "created_at": datetime.now(timezone.utc).isoformat()
    },
    {
        "lesson_id": "lesson_018",
        "title": "Nutrición para máxima energía mental",
        "description": "Qué comer para mantener foco y energía todo el día",
        "category_id": "cat_health",
        "duration": 5,
        "image_url": "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=800",
        "content": {
            "title": "Nutrición para máxima energía mental",
            "description": "Tu cerebro es 2% de peso corporal pero consume 20% de energía - alim mentálo correctamente",
            "key_points": [
                "Glucosa estable > picos de azúcar: carbohidratos complejos (avena, quinoa) liberan energía gradual vs azúcares simples que causan crash",
                "Omega-3 (salmón, nueces, semillas) = combustible de neuronas. Estudios muestran mejora en memoria y prevención de declive cognitivo",
                "Ayuno intermitente (16/8): cetosis leve aumenta BDNF (factor neurotrófico) - cerebro produce más neuronas y conexiones",
                "Hidratación crítica: 2% deshidratación = -20% función cognitiva. Sed ya es señal de déficit",
                "Evita almuerzo pesado: digestión roba sangre del cerebro. Comidas ligeras = mantener energía mental post-comida"
            ],
            "practical_examples": [
                "Desayuno ganador: huevos + aguacate + avena. Proteína + grasas + carbos complejos = energía estable 4-5h. Evita cereales azucarados que causan crash a media mañana",
                "Snack pre-examen: puñado de nueces + chocolate negro 70%+. Omega-3 + flavonoides aumentan flujo sanguíneo cerebral = mejor rendimiento"
            ],
            "conclusion": "Alimentación no es solo calorías - es información que programa tu biología. Optimiza tu combustible mental para optimizar tu vida."
        },
        "insights": [
            "El café mejora foco pero con cafeína inteligente: espera 90-120 min después de despertar (cortisol natural alto)",
            "Comidas procesadas causan inflamación sistémica - incluyendo cerebral. Afecta memoria y mood",
            "El intestino es tu segundo cerebro - 90% de serotonina se produce ahí. Probióticos mejoran salud mental"
        ],
        "quiz": [
            {
                "question": "¿Por qué carbohidratos complejos son mejores que azúcares simples?",
                "options": [
                    "Tienen menos calorías",
                    "Liberan energía gradual y estable",
                    "Saben mejor",
                    "Son más baratos"
                ],
                "correct_answer": 1
            },
            {
                "question": "¿Qué nivel de deshidratación afecta función cognitiva?",
                "options": ["1%", "2%", "5%", "10%"],
                "correct_answer": 1
            },
            {
                "question": "¿Qué son Omega-3 para el cerebro?",
                "options": [
                    "Un suplemento opcional",
                    "Solo importantes para niños",
                    "Combustible esencial de neuronas",
                    "Un mito nutricional"
                ],
                "correct_answer": 2
            }
        ],
        "author_id": None,
        "created_at": datetime.now(timezone.utc).isoformat()
    },
    {
        "lesson_id": "lesson_019",
        "title": "Storytelling: El arte de contar historias que venden",
        "description": "Por qué historias venden más que datos y cómo usarlas",
        "category_id": "cat_creativity",
        "duration": 5,
        "image_url": "https://images.unsplash.com/photo-1516414447565-b14be0adf13e?w=800",
        "content": {
            "title": "Storytelling: El arte de contar historias que venden",
            "description": "Datos informan, historias transforman - neuromarketing demuestra que narrativas activan más áreas cerebrales",
            "key_points": [
                "Estructura Hero's Journey funciona siempre: personaje ordinario + problema + mentor + desafío + transformación. Es la plantilla de todo éxito de Hollywood",
                "Emociones > hechos para persuasión. Caridad que dice '1 millón sufren hambre' recauda menos que 'Esta es María, 7 años, sin comida hoy'",
                "Detalles sensoriales crean inmersión: no digas 'estaba nervioso', di 'sus manos sudaban frías mientras el reloj marcaba 3:57am'",
                "Conflicto es oxígeno de historias: sin tensión, no hay engagement. Tu marca debe tener villano (problema del cliente)",
                "Vuln erabilidad genera conexión: historias de fracaso antes del éxito son más poderosas que éxito directo. Audiencia se relaciona con lucha"
            ],
            "practical_examples": [
                "Apple no vende computadoras - vende 'Think Different'. Sus anuncios son historias de rebeldes que cambiaron el mundo. Producto es secundario",
                "Pitch de startup: '95% freelancers luchan cobrando clientes (problema). Conocí a Laura, diseñadora, perdió $5K en pagos. Creamos X para que nunca más pase (solución)' - historia > 'Somos plataforma B2B SaaS...'"
            ],
            "conclusion": "En mundo saturado de información, historias cortan el ruido. No vendas producto - vende transformación. No compartas datos - comparte viaje emocional."
        },
        "insights": [
            "El cerebro recuerda historias 22x más que hechos aislados (estudio Stanford)",
            "Oxitocina (hormona de conexión) se libera cuando escuchamos narrativas emocionales auténticas",
            "Las mejores marcas son las que hacen al cliente el héroe, no ellas mismas"
        ],
        "quiz": [
            {
                "question": "¿Qué estructura narrativa es universal en storytelling?",
                "options": [
                    "Problema-Solución simple",
                    "Hero's Journey",
                    "Lista de características",
                    "Comparación con competencia"
                ],
                "correct_answer": 1
            },
            {
                "question": "¿Por qué detalles sensoriales importan?",
                "options": [
                    "Hacen la historia más larga",
                    "Suenan profesionales",
                    "Crean inmersión y activan áreas cerebrales sensoriales",
                    "Solo para escritores creativos"
                ],
                "correct_answer": 2
            },
            {
                "question": "¿Qué genera más conexión con audiencia?",
                "options": [
                    "Solo mostrar éxitos",
                    "Compartir vulnerabilidad y luchas reales",
                    "Usar lenguaje técnico",
                    "Evitar emociones"
                ],
                "correct_answer": 1
            }
        ],
        "author_id": None,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
]

print("\nAdding new lessons...")
for lesson in new_lessons:
    existing = db.lessons.find_one({"lesson_id": lesson["lesson_id"]})
    if not existing:
        db.lessons.insert_one(lesson)
        print(f"✓ Added: {lesson['title']}")
    else:
        print(f"⊘ Already exists: {lesson['title']}")

total_lessons = db.lessons.count_documents({})
print(f"\n✅ Database now has {total_lessons} lessons with enhanced content!")
