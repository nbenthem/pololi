#!/usr/bin/env python3
"""Seed initial categories and lessons into MongoDB"""
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

# Clear existing data
print("Clearing existing categories and lessons...")
db.categories.delete_many({})
db.lessons.delete_many({})

# Seed categories
categories = [
    {
        "category_id": "cat_negotiation",
        "name": "Negociación",
        "description": "Domina el arte de negociar en cualquier situación",
        "color": "#0EA5E9",
        "icon": "handshake",
        "slug": "negociacion"
    },
    {
        "category_id": "cat_psychology",
        "name": "Psicología & Comunicación",
        "description": "Entiende el comportamiento humano y comunica efectivamente",
        "color": "#F472B6",
        "icon": "brain",
        "slug": "psicologia-comunicacion"
    },
    {
        "category_id": "cat_finance",
        "name": "Finanzas Personales",
        "description": "Aprende a gestionar y multiplicar tu dinero",
        "color": "#84CC16",
        "icon": "dollar-sign",
        "slug": "finanzas-personales"
    },
    {
        "category_id": "cat_science",
        "name": "Ciencia & Tecnología",
        "description": "Conceptos científicos explicados de forma simple",
        "color": "#A78BFA",
        "icon": "atom",
        "slug": "ciencia-tecnologia"
    }
]

print(f"Inserting {len(categories)} categories...")
db.categories.insert_many(categories)
print("✓ Categories inserted")

# Seed lessons
lessons = [
    {
        "lesson_id": "lesson_001",
        "title": "Cómo negociar tu salario en 5 pasos",
        "description": "Estrategias probadas para conseguir el salario que mereces",
        "category_id": "cat_negotiation",
        "duration": 5,
        "content": {
            "title": "Cómo negociar tu salario en 5 pasos",
            "description": "Aprende las técnicas esenciales para negociar con confianza y obtener mejores resultados",
            "key_points": [
                "Investiga el rango salarial del mercado para tu posición antes de la negociación",
                "Prepara tu 'número ancla' - comienza con una cifra ligeramente superior a tu objetivo real",
                "Enfócate en el valor que aportas, no en tus necesidades personales",
                "Practica tu argumentación con anticipación y mantén la calma durante la conversación",
                "Considera el paquete completo: beneficios, bonos, flexibilidad, no solo el salario base"
            ],
            "practical_examples": [
                "En vez de decir 'necesito más dinero', di: 'Basado en mi experiencia de 5 años y los logros que he conseguido, como aumentar las ventas un 30%, el rango de mercado para esta posición está entre €45,000-55,000. Me gustaría discutir un salario de €52,000'",
                "Si la empresa no puede subir el salario, negocia otros beneficios: 'Entiendo las limitaciones presupuestarias. ¿Podríamos discutir 2 días de teletrabajo adicionales o un bono por desempeño del 10%?'"
            ],
            "conclusion": "La negociación salarial exitosa se basa en preparación, confianza y enfoque en el valor mutuo. Con estas estrategias, aumentarás significativamente tus probabilidades de éxito."
        },
        "created_at": datetime.now(timezone.utc).isoformat()
    },
    {
        "lesson_id": "lesson_002",
        "title": "Leer lenguaje corporal: Guía práctica",
        "description": "Descifra las señales no verbales en conversaciones cotidianas",
        "category_id": "cat_psychology",
        "duration": 5,
        "content": {
            "title": "Leer lenguaje corporal: Guía práctica",
            "description": "Las señales corporales revelan más que las palabras. Aprende a interpretarlas correctamente",
            "key_points": [
                "Los brazos cruzados no siempre indican cierre - pueden significar comodidad o frío. Busca clusters de señales",
                "El contacto visual prolongado (3-5 segundos) indica interés; evitarlo constantemente sugiere incomodidad o deshonestidad",
                "La orientación del cuerpo revela interés real: si los pies apuntan hacia ti, hay engagement; si apuntan a la salida, quieren irse",
                "Las microexpresiones (1/25 de segundo) en el rostro son involuntarias y revelan emociones reales antes de ser suprimidas",
                "La sincronización de gestos (mirroring) indica rapport - cuando alguien imita sutilmente tus posturas, hay conexión"
            ],
            "practical_examples": [
                "En una entrevista, el reclutador se inclina hacia adelante, mantiene contacto visual y asiente mientras hablas: señales positivas de interés. Si revisa el teléfono y su cuerpo está girado, la entrevista no va bien",
                "Durante una cita, tu acompañante toca su cara frecuentemente, juega con el pelo y sonríe con los ojos (patas de gallo): señales de atracción genuina"
            ],
            "conclusion": "El lenguaje corporal es un sistema de comunicación completo. Observa patrones, no gestos aislados, y siempre considera el contexto cultural y personal."
        },
        "created_at": datetime.now(timezone.utc).isoformat()
    },
    {
        "lesson_id": "lesson_003",
        "title": "Mecánica Cuántica: Conceptos Esenciales",
        "description": "Entiende los fundamentos del mundo subatómico sin ecuaciones complejas",
        "category_id": "cat_science",
        "duration": 5,
        "content": {
            "title": "Mecánica Cuántica: Conceptos Esenciales",
            "description": "Los principios fundamentales que gobiernan el universo a escala microscópica",
            "key_points": [
                "Dualidad onda-partícula: Los electrones y fotones se comportan como ondas Y partículas simultáneamente, dependiendo de cómo los observes",
                "Principio de incertidumbre: No puedes conocer con precisión la posición y velocidad de una partícula al mismo tiempo - es fundamental, no una limitación tecnológica",
                "Superposición: Una partícula existe en múltiples estados simultáneamente hasta que la mides (el famoso gato de Schrödinger)",
                "Entrelazamiento cuántico: Dos partículas pueden estar conectadas instantáneamente sin importar la distancia - Einstein lo llamó 'acción fantasmal a distancia'",
                "El observador afecta lo observado: El acto de medir cambia el sistema cuántico - la realidad no existe independientemente de la observación a escala cuántica"
            ],
            "practical_examples": [
                "Tu smartphone usa mecánica cuántica: los transistores en el chip son tan pequeños que los electrones 'tunean' (atraviesan barreras) usando efectos cuánticos",
                "Los imanes de tu nevera funcionan gracias al spin cuántico de electrones - una propiedad sin equivalente clásico que hace que los átomos se alineen"
            ],
            "conclusion": "La mecánica cuántica desafía nuestra intuición pero describe perfectamente el mundo microscópico. Es la teoría más precisa de la física y la base de tecnologías modernas."
        },
        "created_at": datetime.now(timezone.utc).isoformat()
    },
    {
        "lesson_id": "lesson_004",
        "title": "Estructurar conversaciones difíciles",
        "description": "Framework para abordar conflictos y temas sensibles con éxito",
        "category_id": "cat_psychology",
        "duration": 5,
        "content": {
            "title": "Estructurar conversaciones difíciles",
            "description": "Un método paso a paso para navegar diálogos complicados sin perder la relación",
            "key_points": [
                "Prepara tu objetivo: Define qué quieres lograr (resolución, comprensión, cambio) y qué estás dispuesto a ceder",
                "Comienza con hechos, no juicios: 'He notado que llegas tarde 3 días esta semana' vs 'Eres irresponsable'",
                "Usa 'yo' en vez de 'tú': 'Me siento frustrado cuando...' en lugar de 'Tú siempre...' - evita la defensividad",
                "Escucha activamente para entender, no para responder: Parafrasea lo que escuchas antes de contraargumentar",
                "Busca soluciones colaborativas: '¿Cómo podemos resolver esto juntos?' en vez de imponer tu solución"
            ],
            "practical_examples": [
                "Conversación con tu jefe sobre sobrecarga: 'He completado X, Y, Z esta semana (hechos). Me preocupa mantener la calidad con el nuevo proyecto W (yo). ¿Podríamos priorizar o redistribuir tareas? (colaboración)'",
                "Con tu pareja sobre dinero: 'Veo que gastamos €500 más este mes (hecho). Me siento ansioso por nuestros ahorros (yo). Entiendo que tú valoras X. ¿Cómo podemos balancear ambos objetivos? (empatía + colaboración)'"
            ],
            "conclusion": "Las conversaciones difíciles se vuelven manejables con estructura. La clave está en separar hechos de emociones, mantener la empatía y co-crear soluciones."
        },
        "created_at": datetime.now(timezone.utc).isoformat()
    },
    {
        "lesson_id": "lesson_005",
        "title": "Empezar a invertir con poco dinero",
        "description": "Primeros pasos para construir riqueza desde cualquier presupuesto",
        "category_id": "cat_finance",
        "duration": 5,
        "content": {
            "title": "Empezar a invertir con poco dinero",
            "description": "No necesitas ser rico para invertir. Estos principios funcionan desde €50/mes",
            "key_points": [
                "Regla del 50/30/20: Destina 20% de ingresos a ahorro/inversión, 50% necesidades, 30% deseos - ajusta según tu situación",
                "Fondos indexados de bajo coste son tu mejor amigo: Diversificación instantánea, comisiones mínimas (0.1-0.3%), mejor que el 95% de inversores activos",
                "Dollar-cost averaging: Invierte cantidades pequeñas regularmente (€50-100/mes) sin importar el precio - elimina el timing del mercado",
                "Prioriza cuenta de emergencia primero: 3-6 meses de gastos en cuenta líquida antes de invertir agresivamente",
                "El interés compuesto es magia: €100/mes al 7% anual = €148,000 en 30 años (inviertes €36,000)"
            ],
            "practical_examples": [
                "Con €100/mes: Abre cuenta en broker online (Indexa, MyInvestor, Interactive Brokers), compra ETF MSCI World o S&P 500 automáticamente cada mes. Olvídate 10+ años",
                "Micro-inversión: Apps como Myinvestor o Trade Republic permiten comprar fracciones de acciones desde €1. Compra €10 de un ETF global cada semana"
            ],
            "conclusion": "La mejor inversión es la que haces hoy, no importa cuán pequeña. Consistencia y tiempo en el mercado superan al timing. Empieza ahora."
        },
        "created_at": datetime.now(timezone.utc).isoformat()
    },
    {
        "lesson_id": "lesson_006",
        "title": "Técnicas de persuasión efectiva",
        "description": "Principios psicológicos para influir ética y efectivamente",
        "category_id": "cat_psychology",
        "duration": 5,
        "content": {
            "title": "Técnicas de persuasión efectiva",
            "description": "6 principios científicos de influencia basados en Robert Cialdini",
            "key_points": [
                "Reciprocidad: Las personas se sienten obligadas a devolver favores. Da primero, sin expectativas evidentes",
                "Escasez: Valoramos más lo que es limitado o exclusivo. 'Solo quedan 3 plazas' funciona porque es real",
                "Autoridad: Confiamos en expertos. Demuestra credenciales o experiencia relevante al inicio",
                "Consistencia: Queremos ser coherentes con compromisos previos. Empieza con pequeños 'sí' antes del grande",
                "Prueba social: Seguimos el comportamiento de otros similares. '10,000 profesionales ya lo usan' es poderoso"
            ],
            "practical_examples": [
                "Vendiendo tu idea en trabajo: Primero ayuda al director con su proyecto (reciprocidad), luego presenta tu propuesta mostrando datos de equipos similares que tuvieron éxito (prueba social) y menciona el respaldo del CEO (autoridad)",
                "Convenciendo a alguien de hacer ejercicio: Empieza con 'caminemos 10 minutos hoy' (pequeño compromiso). Una vez aceptan, es más fácil que accedan a rutinas mayores (consistencia)"
            ],
            "conclusion": "La persuasión ética no es manipulación - es comunicar de forma que resuene con cómo funciona naturalmente la mente humana. Úsala con responsabilidad."
        },
        "created_at": datetime.now(timezone.utc).isoformat()
    },
    {
        "lesson_id": "lesson_007",
        "title": "Finanzas personales 101: Lo esencial",
        "description": "Fundamentos que todos deberían aprender pero nadie enseña",
        "category_id": "cat_finance",
        "duration": 5,
        "content": {
            "title": "Finanzas personales 101: Lo esencial",
            "description": "Las reglas de oro para la salud financiera personal",
            "key_points": [
                "Paga primero a ti mismo: Automáticamente transfiere 10-20% del salario a ahorro/inversión al cobrar - lo que queda es para gastar",
                "Evita deuda de consumo como la peste: Tarjetas de crédito al 20% TAE destruyen riqueza. Solo endeúdate para activos que aprecian (educación, vivienda)",
                "Construye múltiples fuentes de ingreso: Un solo salario es riesgo concentrado. Freelancing, inversiones, side-project diversifican",
                "La inflación es un impuesto silencioso: Dinero en cuenta corriente pierde 3-5% poder adquisitivo anual. Invierte para superarla",
                "Gasta en experiencias, no en cosas: Estudios muestran que experiencias generan más felicidad duradera que posesiones materiales"
            ],
            "practical_examples": [
                "Estrategia anti-impulso: Regla de 48 horas - espera 2 días antes de compras >€50. El 80% de impulsos desaparecen",
                "Cálculo real de coche: Un coche de €20,000 cuesta realmente €35,000 en 5 años (seguro, gasolina, mantenimiento, depreciación). ¿Necesitas eso o prefieres €35k invertidos?"
            ],
            "conclusion": "Las finanzas personales son 80% comportamiento, 20% conocimiento. Automatiza buenos hábitos y deja que el tiempo haga su magia."
        },
        "created_at": datetime.now(timezone.utc).isoformat()
    },
    {
        "lesson_id": "lesson_008",
        "title": "Inteligencia emocional práctica",
        "description": "Habilidades emocionales que predicen más éxito que el IQ",
        "category_id": "cat_psychology",
        "duration": 5,
        "content": {
            "title": "Inteligencia emocional práctica",
            "description": "Las 4 competencias de IE que transformarán tus relaciones y carrera",
            "key_points": [
                "Autoconciencia: Identifica y nombra tus emociones en tiempo real. 'Estoy sintiendo frustración por X' reduce su intensidad 40%",
                "Autorregulación: Pausa de 6 segundos entre estímulo y respuesta. Respiraciones profundas activan sistema parasimpático (calma)",
                "Empatía: Escucha el subtexto emocional, no solo las palabras. 'Parece que esto te preocupa realmente' abre comunicación real",
                "Habilidades sociales: Las emociones son contagiosas. Tu estado emocional afecta al equipo - gestiona tu energía conscientemente",
                "Reencuadre cognitivo: Cambiar interpretación de eventos reduce estrés. 'Es un desafío' vs 'Es una amenaza' cambia tu fisiología"
            ],
            "practical_examples": [
                "En reunión tensa: Notas tu mandíbula apretada (autoconciencia). Respiras hondo 3 veces (autorregulación). Dices: 'Veo que ambos valoramos el proyecto, ¿cómo encontramos el punto medio?' (empatía + social)",
                "Feedback difícil de recibir: En vez de ponerte defensivo, di: 'Necesito un momento para procesarlo. Gracias por la honestidad. ¿Podemos hablar soluciones mañana?' (autorregulación + social)"
            ],
            "conclusion": "La IE no es 'ser blando' - es tener control inteligente sobre tus respuestas emocionales para mejores resultados. Se puede entrenar como un músculo."
        },
        "created_at": datetime.now(timezone.utc).isoformat()
    }
]

print(f"Inserting {len(lessons)} lessons...")
db.lessons.insert_many(lessons)
print("✓ Lessons inserted")

print(f"\n✅ Database seeded successfully!")
print(f"Categories: {len(categories)}")
print(f"Lessons: {len(lessons)}")
