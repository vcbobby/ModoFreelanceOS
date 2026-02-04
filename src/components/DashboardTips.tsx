import React, { useEffect, useState } from 'react'
import { freelanceTips } from '../data/tips'
import { Sparkles, RefreshCw } from 'lucide-react'

export const DashboardTips = () => {
    const [randomTips, setRandomTips] = useState<typeof freelanceTips>([])

    const shuffleTips = () => {
        const shuffled = [...freelanceTips].sort(() => 0.5 - Math.random())
        setRandomTips(shuffled.slice(0, 4))
    }

    useEffect(() => {
        shuffleTips()
    }, [])

    return (
        <div className="mt-12">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-yellow-500" />
                    Tips del Día
                </h3>
                <button
                    onClick={shuffleTips}
                    className="text-sm text-slate-500 dark:text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 flex items-center gap-1 transition-colors"
                >
                    <RefreshCw className="w-4 h-4" /> Nuevos tips
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {randomTips.map((tip, index) => {
                    const Icon = tip.icon
                    return (
                        <div
                            key={index}
                            className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow flex gap-4 items-start"
                        >
                            <div
                                className={`p-3 rounded-lg ${tip.bg} shrink-0`}
                            >
                                <Icon className={`w-6 h-6 ${tip.color}`} />
                            </div>
                            <div>
                                <span
                                    className={`text-xs font-bold uppercase tracking-wider ${tip.color} opacity-80`}
                                >
                                    {tip.category}
                                </span>
                                <p className="text-slate-700 dark:text-slate-300 text-sm mt-1 leading-relaxed font-medium">
                                    "{tip.text}"
                                </p>
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
