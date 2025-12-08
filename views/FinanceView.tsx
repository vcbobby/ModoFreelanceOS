import React, { useState, useEffect } from 'react'
import {
    collection,
    addDoc,
    deleteDoc,
    doc,
    query,
    orderBy,
    onSnapshot,
    updateDoc,
} from 'firebase/firestore'
import { db } from '../firebase'
import {
    DollarSign,
    TrendingUp,
    TrendingDown,
    Wallet,
    Plus,
    Trash2,
    BrainCircuit,
    CheckCircle,
    Clock,
    Eye,
    EyeOff,
} from 'lucide-react'
import { Button, Card } from '../components/ui'
import { analyzeFinancialHealth } from '../services/geminiService'
import ReactMarkdown from 'react-markdown'

interface FinanceViewProps {
    userId?: string
}

export const FinanceView: React.FC<FinanceViewProps> = ({ userId }) => {
    const [transactions, setTransactions] = useState<any[]>([])
    const [privacyMode, setPrivacyMode] = useState(true)
    const [amount, setAmount] = useState('')
    const [description, setDescription] = useState('')
    const [type, setType] = useState<'income' | 'expense'>('expense')
    const getLocalDate = () => new Date().toLocaleDateString('en-CA')
    const [date, setDate] = useState(getLocalDate())
    const [isRecurring, setIsRecurring] = useState(false)
    const [status, setStatus] = useState<'paid' | 'pending'>('paid')
    const [aiAnalysis, setAiAnalysis] = useState('')
    const [analyzing, setAnalyzing] = useState(false)
    const [filterPeriod, setFilterPeriod] = useState<'month' | 'year' | 'all'>(
        'month'
    )
    const [activeTab, setActiveTab] = useState<'cashflow' | 'pending'>(
        'cashflow'
    )

    useEffect(() => {
        if (!userId) return
        const q = query(
            collection(db, 'users', userId, 'finances'),
            orderBy('date', 'desc')
        )
        const unsubscribe = onSnapshot(q, (snapshot) => {
            setTransactions(
                snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
            )
        })
        return () => unsubscribe()
    }, [userId])

    const now = new Date()
    const currentMonth = now.getMonth()
    const currentYear = now.getFullYear()

    const realTransactions = transactions.filter((t) => {
        if (t.status === 'pending') return false
        if (filterPeriod === 'all') return true
        const [tYear, tMonth] = t.date.split('-').map(Number)
        if (filterPeriod === 'year') return tYear === currentYear
        return tMonth - 1 === currentMonth && tYear === currentYear
    })

    const totalIncome = realTransactions
        .filter((t) => t.type === 'income')
        .reduce((acc, t) => acc + t.amount, 0)
    const totalExpense = realTransactions
        .filter((t) => t.type === 'expense')
        .reduce((acc, t) => acc + t.amount, 0)
    const balance = totalIncome - totalExpense

    const pendingTransactions = transactions.filter(
        (t) => t.status === 'pending'
    )
    const pendingIncome = pendingTransactions
        .filter((t) => t.type === 'income')
        .reduce((acc, t) => acc + t.amount, 0)
    const pendingExpense = pendingTransactions
        .filter((t) => t.type === 'expense')
        .reduce((acc, t) => acc + t.amount, 0)

    const formatMoney = (val: number) => {
        if (privacyMode) return '****'
        return `$${val.toFixed(2)}`
    }

    let healthColor =
        'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-500 text-emerald-700 dark:text-emerald-400'
    let healthText = 'Saludable 🟢'
    if (balance < 0) {
        healthColor =
            'bg-red-50 dark:bg-red-900/20 border-red-500 text-red-700 dark:text-red-400'
        healthText = 'En Riesgo 🔴'
    } else if (balance > 0 && balance < totalIncome * 0.2) {
        healthColor =
            'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-500 text-yellow-700 dark:text-yellow-400'
        healthText = 'Precaución 🟡'
    }

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!amount || !description || !userId) return
        await addDoc(collection(db, 'users', userId, 'finances'), {
            amount: parseFloat(amount),
            description,
            type,
            date,
            isRecurring,
            status,
            createdAt: new Date().toISOString(),
        })
        setAmount('')
        setDescription('')
        setIsRecurring(false)
        setStatus('paid')
        setDate(getLocalDate())
    }

    const handleMarkAsPaid = async (t: any) => {
        if (userId)
            await updateDoc(doc(db, 'users', userId, 'finances', t.id), {
                status: 'paid',
            })
    }
    const handleDelete = async (id: string) => {
        if (userId) await deleteDoc(doc(db, 'users', userId, 'finances', id))
    }

    const handleAIAnalysis = async () => {
        setAnalyzing(true)
        try {
            const result = await analyzeFinancialHealth(
                [...realTransactions, ...pendingTransactions],
                { income: totalIncome, expense: totalExpense, balance },
                { toCollect: pendingIncome, toPay: pendingExpense }
            )
            setAiAnalysis(result)
        } catch (error) {
            alert('Error al analizar.')
        } finally {
            setAnalyzing(false)
        }
    }

    const getDaysDiff = (targetDate: string) => {
        const diff = new Date(targetDate).getTime() - new Date().getTime()
        return Math.ceil(diff / (1000 * 3600 * 24))
    }

    return (
        <div className="max-w-6xl mx-auto min-h-screen pb-20">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl text-emerald-700 dark:text-emerald-400">
                        <DollarSign className="w-8 h-8" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            Finanzas
                            <button
                                onClick={() => setPrivacyMode(!privacyMode)}
                                className="ml-2 p-1.5 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 transition-colors"
                                title={
                                    privacyMode
                                        ? 'Mostrar montos'
                                        : 'Ocultar montos'
                                }
                            >
                                {privacyMode ? (
                                    <EyeOff className="w-4 h-4" />
                                ) : (
                                    <Eye className="w-4 h-4" />
                                )}
                            </button>
                        </h2>
                        <p className="text-slate-500 dark:text-slate-400 text-sm">
                            {privacyMode
                                ? 'Montos ocultos por seguridad.'
                                : 'Control de flujo de caja inteligente.'}
                        </p>
                    </div>
                </div>

                <div className="flex bg-white dark:bg-slate-800 p-1 rounded-lg border border-slate-200 dark:border-slate-700">
                    <button
                        onClick={() => setFilterPeriod('month')}
                        className={`px-4 py-1.5 text-xs font-bold rounded-md transition-colors ${
                            filterPeriod === 'month'
                                ? 'bg-slate-900 text-white dark:bg-slate-700'
                                : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'
                        }`}
                    >
                        Mes
                    </button>
                    <button
                        onClick={() => setFilterPeriod('year')}
                        className={`px-4 py-1.5 text-xs font-bold rounded-md transition-colors ${
                            filterPeriod === 'year'
                                ? 'bg-slate-900 text-white dark:bg-slate-700'
                                : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'
                        }`}
                    >
                        Año
                    </button>
                    <button
                        onClick={() => setFilterPeriod('all')}
                        className={`px-4 py-1.5 text-xs font-bold rounded-md transition-colors ${
                            filterPeriod === 'all'
                                ? 'bg-slate-900 text-white dark:bg-slate-700'
                                : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'
                        }`}
                    >
                        Histórico
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <Card className="p-5 border-l-4 border-l-green-500">
                    <div className="flex justify-between">
                        <div>
                            <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase">
                                Ingresos Reales
                            </p>
                            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
                                {formatMoney(totalIncome)}
                            </h3>
                        </div>
                        <TrendingUp className="text-green-500 w-6 h-6" />
                    </div>
                </Card>

                <Card className="p-5 border-l-4 border-l-red-500">
                    <div className="flex justify-between">
                        <div>
                            <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase">
                                Gastos Reales
                            </p>
                            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
                                {formatMoney(totalExpense)}
                            </h3>
                        </div>
                        <TrendingDown className="text-red-500 w-6 h-6" />
                    </div>
                </Card>

                <Card className={`p-5 border-l-4 ${healthColor}`}>
                    <div className="flex justify-between">
                        <div>
                            <p className="text-xs font-bold opacity-70 uppercase dark:text-white/70">
                                Caja Disponible
                            </p>
                            <h3 className="text-2xl font-bold dark:text-white">
                                {formatMoney(balance)}
                            </h3>
                        </div>
                        <Wallet className="w-6 h-6 opacity-80 dark:text-white" />
                    </div>
                    <div className="mt-2 text-xs font-bold uppercase tracking-wide">
                        {healthText}
                    </div>
                </Card>
            </div>

            {(pendingIncome > 0 || pendingExpense > 0) && (
                <div className="grid grid-cols-2 gap-4 mb-8 bg-slate-50 dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center justify-between px-4 border-r border-slate-200 dark:border-slate-700">
                        <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">
                            Por Cobrar
                        </span>
                        <span className="text-lg font-bold text-orange-600">
                            {formatMoney(pendingIncome)}
                        </span>
                    </div>
                    <div className="flex items-center justify-between px-4">
                        <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">
                            Por Pagar
                        </span>
                        <span className="text-lg font-bold text-red-600">
                            {formatMoney(pendingExpense)}
                        </span>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="space-y-6">
                    <Card className="p-6 shadow-sm sticky top-6">
                        <h3 className="font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                            Registrar Movimiento
                        </h3>
                        <form onSubmit={handleAdd} className="space-y-3">
                            <div className="flex gap-2 bg-slate-50 dark:bg-slate-900 p-1 rounded-lg">
                                <button
                                    type="button"
                                    onClick={() => setType('income')}
                                    className={`flex-1 py-2 text-sm font-bold rounded-md transition-all ${
                                        type === 'income'
                                            ? 'bg-white dark:bg-slate-800 text-green-600 shadow-sm'
                                            : 'text-slate-400 dark:text-slate-500'
                                    }`}
                                >
                                    Ingreso
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setType('expense')}
                                    className={`flex-1 py-2 text-sm font-bold rounded-md transition-all ${
                                        type === 'expense'
                                            ? 'bg-white dark:bg-slate-800 text-red-600 shadow-sm'
                                            : 'text-slate-400 dark:text-slate-500'
                                    }`}
                                >
                                    Gasto
                                </button>
                            </div>
                            <div className="flex items-center gap-2 mb-2 p-2 border border-slate-100 dark:border-slate-700 rounded-lg">
                                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">
                                    ¿Ya ocurrió?
                                </span>
                                <div className="flex gap-3">
                                    <label className="flex items-center gap-1 text-sm cursor-pointer dark:text-slate-300">
                                        <input
                                            type="radio"
                                            name="status"
                                            checked={status === 'paid'}
                                            onChange={() => setStatus('paid')}
                                            className="accent-brand-600"
                                        />
                                        <span>Sí, pagado</span>
                                    </label>
                                    <label className="flex items-center gap-1 text-sm cursor-pointer dark:text-slate-300">
                                        <input
                                            type="radio"
                                            name="status"
                                            checked={status === 'pending'}
                                            onChange={() =>
                                                setStatus('pending')
                                            }
                                            className="accent-orange-500"
                                        />
                                        <span className="text-orange-600 font-medium">
                                            No, es futuro
                                        </span>
                                    </label>
                                </div>
                            </div>
                            <input
                                type="number"
                                step="0.01"
                                required
                                placeholder="0.00"
                                className="w-full p-3 border dark:border-slate-600 dark:bg-slate-900 dark:text-white rounded-lg text-lg font-bold"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                            />
                            <input
                                type="text"
                                required
                                placeholder={
                                    type === 'income'
                                        ? 'Cliente / Proyecto'
                                        : 'Servicio / Compra'
                                }
                                className="w-full p-3 border dark:border-slate-600 dark:bg-slate-900 dark:text-white rounded-lg text-sm"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                            />
                            <div>
                                <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                                    {status === 'pending'
                                        ? 'Fecha de Vencimiento / Cobro'
                                        : 'Fecha'}
                                </label>
                                <input
                                    type="date"
                                    required
                                    className="w-full p-3 border dark:border-slate-600 dark:bg-slate-900 dark:text-white rounded-lg text-sm"
                                    value={date}
                                    onChange={(e) => setDate(e.target.value)}
                                />
                            </div>
                            {type === 'expense' && (
                                <div
                                    className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 cursor-pointer p-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded"
                                    onClick={() => setIsRecurring(!isRecurring)}
                                >
                                    <div
                                        className={`w-4 h-4 border rounded flex items-center justify-center ${
                                            isRecurring
                                                ? 'bg-slate-800 border-slate-800 text-white dark:bg-slate-700 dark:border-slate-600'
                                                : 'border-slate-300 dark:border-slate-600'
                                        }`}
                                    >
                                        {isRecurring && (
                                            <CheckCircle className="w-3 h-3" />
                                        )}
                                    </div>
                                    <span>Es un gasto fijo mensual</span>
                                </div>
                            )}
                            <Button
                                className={`w-full ${
                                    type === 'income'
                                        ? 'bg-green-600 hover:bg-green-700'
                                        : 'bg-red-600 hover:bg-red-700'
                                }`}
                            >
                                <Plus className="w-4 h-4 mr-2" />{' '}
                                {status === 'pending'
                                    ? 'Agendar Pendiente'
                                    : 'Registrar'}
                            </Button>
                        </form>
                        <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-700">
                            <Button
                                onClick={handleAIAnalysis}
                                isLoading={analyzing}
                                className="w-full bg-indigo-600 hover:bg-indigo-700"
                                variant="default"
                            >
                                <BrainCircuit className="w-4 h-4 mr-2" />{' '}
                                Analizar con IA
                            </Button>
                        </div>
                    </Card>
                </div>

                <div className="lg:col-span-2 space-y-6">
                    {aiAnalysis && (
                        <div className="bg-white dark:bg-slate-800 rounded-xl border border-indigo-200 dark:border-indigo-900 shadow-sm p-6 animate-in fade-in relative">
                            <button
                                onClick={() => setAiAnalysis('')}
                                className="absolute top-4 right-4 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                            >
                                Cerrar
                            </button>
                            <div className="prose prose-sm prose-indigo dark:prose-invert max-w-none text-slate-700 dark:text-slate-300">
                                <ReactMarkdown>{aiAnalysis}</ReactMarkdown>
                            </div>
                        </div>
                    )}
                    <div className="flex border-b border-slate-200 dark:border-slate-700">
                        <button
                            onClick={() => setActiveTab('cashflow')}
                            className={`px-6 py-3 text-sm font-bold border-b-2 transition-colors ${
                                activeTab === 'cashflow'
                                    ? 'border-slate-900 text-slate-900 dark:border-white dark:text-white'
                                    : 'border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                            }`}
                        >
                            Historial Real ({realTransactions.length})
                        </button>
                        <button
                            onClick={() => setActiveTab('pending')}
                            className={`px-6 py-3 text-sm font-bold border-b-2 transition-colors ${
                                activeTab === 'pending'
                                    ? 'border-orange-500 text-orange-600'
                                    : 'border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                            }`}
                        >
                            Pendientes ({pendingTransactions.length})
                        </button>
                    </div>
                    {activeTab === 'pending' && (
                        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
                            {pendingTransactions.length === 0 ? (
                                <div className="p-8 text-center text-slate-400 text-sm">
                                    Nada pendiente.
                                </div>
                            ) : (
                                <div className="divide-y divide-slate-100 dark:divide-slate-700">
                                    {pendingTransactions.map((t) => {
                                        const daysLeft = getDaysDiff(t.date)
                                        const isLate = daysLeft < 0
                                        return (
                                            <div
                                                key={t.id}
                                                className={`p-4 flex flex-col sm:flex-row sm:items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors gap-4 ${
                                                    isLate
                                                        ? 'bg-red-50/50 dark:bg-red-900/10'
                                                        : ''
                                                }`}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div
                                                        className={`p-2 rounded-lg ${
                                                            t.type === 'income'
                                                                ? 'bg-orange-100 text-orange-600 dark:bg-orange-900/30'
                                                                : 'bg-red-100 text-red-600 dark:bg-red-900/30'
                                                        }`}
                                                    >
                                                        <Clock className="w-5 h-5" />
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-slate-800 dark:text-white text-sm">
                                                            {t.description}
                                                        </p>
                                                        <div className="flex items-center gap-2 text-xs">
                                                            <span
                                                                className={`font-bold ${
                                                                    isLate
                                                                        ? 'text-red-600 dark:text-red-400'
                                                                        : 'text-slate-500 dark:text-slate-400'
                                                                }`}
                                                            >
                                                                {isLate
                                                                    ? `Venció hace ${Math.abs(
                                                                          daysLeft
                                                                      )} días`
                                                                    : daysLeft ===
                                                                      0
                                                                    ? 'Vence HOY'
                                                                    : `Faltan ${daysLeft} días`}
                                                            </span>
                                                            <span className="text-slate-400">
                                                                ({t.date})
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3 self-end sm:self-auto">
                                                    <span className="font-bold text-slate-700 dark:text-slate-300">
                                                        {formatMoney(t.amount)}
                                                    </span>
                                                    <button
                                                        onClick={() =>
                                                            handleMarkAsPaid(t)
                                                        }
                                                        className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold text-white transition-colors ${
                                                            t.type === 'income'
                                                                ? 'bg-green-600 hover:bg-green-700'
                                                                : 'bg-slate-700 hover:bg-slate-800 dark:bg-slate-600 dark:hover:bg-slate-500'
                                                        }`}
                                                    >
                                                        <CheckCircle className="w-3 h-3" />{' '}
                                                        {t.type === 'income'
                                                            ? 'Cobrado'
                                                            : 'Pagado'}
                                                    </button>
                                                    <button
                                                        onClick={() =>
                                                            handleDelete(t.id)
                                                        }
                                                        className="text-slate-300 hover:text-red-500"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            )}
                        </div>
                    )}
                    {activeTab === 'cashflow' && (
                        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
                            {realTransactions.length === 0 ? (
                                <div className="p-8 text-center text-slate-400 text-sm">
                                    Sin movimientos.
                                </div>
                            ) : (
                                <div className="divide-y divide-slate-100 dark:divide-slate-700">
                                    {realTransactions.map((t) => (
                                        <div
                                            key={t.id}
                                            className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors group"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div
                                                    className={`p-2 rounded-full ${
                                                        t.type === 'income'
                                                            ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400'
                                                            : 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'
                                                    }`}
                                                >
                                                    {t.type === 'income' ? (
                                                        <TrendingUp className="w-4 h-4" />
                                                    ) : (
                                                        <TrendingDown className="w-4 h-4" />
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-slate-800 dark:text-white text-sm">
                                                        {t.description}
                                                    </p>
                                                    <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                                                        <span>{t.date}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <span
                                                    className={`font-bold ${
                                                        t.type === 'income'
                                                            ? 'text-green-600 dark:text-green-400'
                                                            : 'text-red-600 dark:text-red-400'
                                                    }`}
                                                >
                                                    {t.type === 'income'
                                                        ? '+'
                                                        : '-'}
                                                    {formatMoney(t.amount)}
                                                </span>
                                                <button
                                                    onClick={() =>
                                                        handleDelete(t.id)
                                                    }
                                                    className="text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
