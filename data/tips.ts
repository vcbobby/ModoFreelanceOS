// src/data/tips.ts
import {
    Coffee,
    DollarSign,
    Brain,
    Sun,
    Clock,
    Shield,
    Eye,
} from 'lucide-react'

export const freelanceTips = [
    {
        category: 'Salud Visual',
        text: 'Usa la regla 20-20-20: Cada 20 minutos, mira algo a 20 pies (6 metros) de distancia durante 20 segundos.',
        icon: Eye,
        color: 'text-blue-600',
        bg: 'bg-blue-50',
    },
    {
        category: 'Cobros',
        text: 'Nunca empieces un proyecto grande sin un anticipo del 50%. Es tu seguridad y filtro de clientes serios.',
        icon: DollarSign,
        color: 'text-green-600',
        bg: 'bg-green-50',
    },
    {
        category: 'Productividad',
        text: 'Si una tarea toma menos de 2 minutos, hazla ya. No la anotes, solo hazla y libera tu mente.',
        icon: Clock,
        color: 'text-orange-600',
        bg: 'bg-orange-50',
    },
    {
        category: 'Salud Mental',
        text: "El 'Síndrome del Impostor' es normal. Recuerda que te contratan por resolver problemas, no por saberlo todo.",
        icon: Brain,
        color: 'text-purple-600',
        bg: 'bg-purple-50',
    },
    {
        category: 'Rutina',
        text: "Cámbiate de ropa aunque trabajes en casa. Ponerse 'ropa de trabajo' ayuda a tu cerebro a entrar en modo productivo.",
        icon: Sun,
        color: 'text-yellow-600',
        bg: 'bg-yellow-50',
    },
    {
        category: 'Descanso',
        text: 'Programa tus descansos. Trabajar 4 horas seguidas sin parar reduce tu calidad cognitiva. Prueba la técnica Pomodoro.',
        icon: Coffee,
        color: 'text-red-600',
        bg: 'bg-red-50',
    },
    {
        category: 'Contratos',
        text: 'Siempre, SIEMPRE firma un contrato. Un email es mejor que nada, pero un contrato firmado es tu mejor defensa.',
        icon: Shield,
        color: 'text-slate-600',
        bg: 'bg-slate-50',
    },
    {
        category: 'Negociación',
        text: 'No bajes tus precios para ganar un cliente. Si el presupuesto es bajo, reduce el alcance del trabajo, no tu tarifa.',
        icon: DollarSign,
        color: 'text-emerald-600',
        bg: 'bg-emerald-50',
    },
    {
        category: 'Postura',
        text: 'Tu monitor debe estar a la altura de tus ojos. Si miras hacia abajo, estás añadiendo 20kg de presión a tu cuello.',
        icon: Eye,
        color: 'text-indigo-600',
        bg: 'bg-indigo-50',
    },
]
