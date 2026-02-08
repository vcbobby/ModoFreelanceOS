import React, { useState, useEffect } from 'react'
import {
    Users,
    ShieldAlert,
    Search,
    Gift,
    CheckCircle,
    TrendingUp,
    DollarSign,
    Bell,
    Filter,
    XCircle,
    UserPlus,
    Smartphone,
    Monitor,
    Globe,
    BarChart,
    Trash2,
} from 'lucide-react'
import { Card, Button, ConfirmationModal } from '@features/shared/ui'

interface AdminDashboardProps {
    userId: string
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ userId }) => {
    const [data, setData] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [usersLoading, setUsersLoading] = useState(false)
    const [users, setUsers] = useState<any[]>([])
    const [hasMoreUsers, setHasMoreUsers] = useState(false)
    const [nextCursor, setNextCursor] = useState<string | null>(null)
    const [pageIndex, setPageIndex] = useState(0)
    const [searchTerm, setSearchTerm] = useState('')
    const [filterType, setFilterType] = useState<'all' | 'pro' | 'free'>('all')

    const [modalConfig, setModalConfig] = useState({
        isOpen: false,
        title: '',
        message: '',
        action: () => {},
        isDanger: false,
    })
    const openInfoModal = (title: string, message: string) => {
        setModalConfig({
            isOpen: true,
            title,
            message,
            isDanger: false,
            action: () =>
                setModalConfig((prev) => ({ ...prev, isOpen: false })),
        })
    }

    const openErrorModal = (title: string, message: string) => {
        setModalConfig({
            isOpen: true,
            title,
            message,
            isDanger: true,
            action: () =>
                setModalConfig((prev) => ({ ...prev, isOpen: false })),
        })
    }

    const BACKEND_URL = import.meta.env.PROD
        ? 'https://backend-freelanceos.onrender.com'
        : 'http://localhost:8000'
    const USERS_PAGE_SIZE = 50

    // --- CARGA DE DATOS ---
    const loadData = async ({ reset = true }: { reset?: boolean } = {}) => {
        if (reset) {
            setLoading(true)
            setPageIndex(0)
            setNextCursor(null)
            setUsers([])
        }
        setUsersLoading(true)
        try {
            const formData = new FormData()
            formData.append('adminId', userId)
            formData.append('limit', USERS_PAGE_SIZE.toString())

            if (!reset) {
                if (nextCursor) {
                    formData.append('cursor', nextCursor)
                } else {
                    formData.append('page', (pageIndex + 1).toString())
                }
            }
            const res = await fetch(`${BACKEND_URL}/api/admin/dashboard-data`, {
                method: 'POST',
                body: formData,
            })
            if (res.status === 403) {
                openErrorModal(
                    'Acceso denegado',
                    'No tienes permisos para acceder al panel de administración.'
                )
                return
            }
            const json = await res.json()
            if (json.success) {
                if (reset) {
                    setData(json)
                } else {
                    setData((prev: any) => ({ ...prev, ...json }))
                }

                const incomingUsers = Array.isArray(json.users) ? json.users : []
                const mergedUsers = reset
                    ? incomingUsers
                    : [...users, ...incomingUsers]
                const seenIds = new Set<string>()
                const uniqueUsers = mergedUsers.filter((user: any) => {
                    if (!user?.id) return true
                    if (seenIds.has(user.id)) return false
                    seenIds.add(user.id)
                    return true
                })
                const previousCount = reset ? 0 : users.length
                const updatedCount = uniqueUsers.length
                const appendedCount = updatedCount - previousCount
                setUsers(uniqueUsers)

                const totalUsers = json?.stats?.total_users ?? data?.stats?.total_users ?? 0
                const serverHasMore =
                    typeof json.hasMore === 'boolean' ? json.hasMore : null

                if (typeof json.nextCursor === 'string') {
                    setNextCursor(json.nextCursor)
                } else if (reset) {
                    setNextCursor(null)
                }

                if (!reset && appendedCount === 0) {
                    setHasMoreUsers(false)
                } else if (serverHasMore !== null) {
                    setHasMoreUsers(serverHasMore)
                } else if (json.nextCursor) {
                    setHasMoreUsers(true)
                } else if (totalUsers) {
                    setHasMoreUsers(updatedCount < totalUsers)
                } else {
                    setHasMoreUsers(incomingUsers.length === USERS_PAGE_SIZE)
                }

                if (!reset) {
                    setPageIndex((prev) => prev + 1)
                }
            }
        } catch (e) {
            console.error(e)
        } finally {
            setLoading(false)
            setUsersLoading(false)
        }
    }

    useEffect(() => {
        loadData({ reset: true })
    }, [])

    // --- ACCIONES DE SUSCRIPCIÓN ---
    const handleSubscriptionAction = (
        type: 'grant' | 'revoke',
        targetId: string,
        email: string
    ) => {
        const isGrant = type === 'grant'
        setModalConfig({
            isOpen: true,
            title: isGrant ? '¿Regalar Suscripción?' : '¿Revocar Suscripción?',
            message: isGrant
                ? `Darás 30 días PRO a ${email}.`
                : `Estás a punto de quitarle el PRO a ${email}. Volverá a ser FREE.`,
            isDanger: !isGrant,
            action: () => executeSubAction(type, targetId),
        })
    }

    const executeSubAction = async (
        type: 'grant' | 'revoke',
        targetId: string
    ) => {
        try {
            const endpoint =
                type === 'grant' ? 'grant-subscription' : 'revoke-subscription'
            const formData = new FormData()
            formData.append('adminId', userId)
            formData.append('targetUserId', targetId)
            if (type === 'grant') formData.append('days', '30')

            const res = await fetch(`${BACKEND_URL}/api/admin/${endpoint}`, {
                method: 'POST',
                body: formData,
            })
            const json = await res.json()

            if (json.success) {
                setModalConfig({
                    isOpen: true,
                    title: 'Éxito',
                    message: json.message,
                    action: () =>
                        setModalConfig((prev) => ({ ...prev, isOpen: false })),
                    isDanger: false,
                })
                loadData()
            }
        } catch (e) {
            openErrorModal('Error', 'Falló la operación. Intenta nuevamente.')
        }
    }

    // --- HELPER PARA ICONOS DE PLATAFORMA ---
    const getPlatformIcon = (plat: string) => {
        if (!plat) return <Globe className="w-4 h-4 text-slate-300" />
        if (plat.includes('Android'))
            return <Smartphone className="w-4 h-4 text-green-500" />
        if (plat.includes('Windows'))
            return <Monitor className="w-4 h-4 text-blue-500" />
        return <Globe className="w-4 h-4 text-slate-400" />
    }
    // Función para borrar usuario
    const handleDeleteUser = (targetId: string, email: string) => {
        setModalConfig({
            isOpen: true,
            title: '¿ELIMINAR USUARIO?',
            message: `Vas a borrar permanentemente a ${email}. Esta acción es irreversible.`,
            isDanger: true,
            action: async () => {
                try {
                    const formData = new FormData()
                    formData.append('adminId', userId)
                    formData.append('targetUserId', targetId)

                    const res = await fetch(
                        `${BACKEND_URL}/api/admin/delete-user`,
                        { method: 'POST', body: formData }
                    )

                    if (!res.ok) throw new Error()

                    openInfoModal(
                        'Usuario eliminado',
                        'El usuario fue eliminado correctamente.'
                    )
                    loadData()
                } catch (e) {
                    openErrorModal('Error', 'No se pudo eliminar el usuario.')
                }
            },
        })
    }

    const filteredUsers = users.filter((u: any) => {
        const email = (u.email || '').toLowerCase()
        const name = (u.name || '').toLowerCase()
        const matchesSearch =
            email.includes(searchTerm.toLowerCase()) ||
            name.includes(searchTerm.toLowerCase())
        const matchesType =
            filterType === 'all'
                ? true
                : filterType === 'pro'
                ? u.isPro
                : !u.isPro
        return matchesSearch && matchesType
    })

    const totalUsers = data?.stats?.total_users ?? users.length

    const handleLoadMoreUsers = () => {
        if (usersLoading || !hasMoreUsers) return
        loadData({ reset: false })
    }

    const estimatedMRR = data ? data.stats.active_pro * 10 : 0

    if (loading)
        return (
            <div className="p-10 text-center text-slate-500">
                Cargando panel de control...
            </div>
        )

    return (
        <div className="max-w-7xl mx-auto pb-20 px-4 md:px-0">
            <ConfirmationModal
                isOpen={modalConfig.isOpen}
                onClose={() =>
                    setModalConfig({ ...modalConfig, isOpen: false })
                }
                onConfirm={() => modalConfig.action()}
                title={modalConfig.title}
                message={modalConfig.message}
                confirmText={
                    modalConfig.title.includes('Éxito') ? 'Cerrar' : 'Confirmar'
                }
                cancelText={
                    modalConfig.title.includes('Éxito') ? '' : 'Cancelar'
                }
                isDanger={modalConfig.isDanger}
            />

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <h2 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <ShieldAlert className="w-8 h-8 text-brand-600" /> Admin
                    Dashboard
                </h2>
                <Button variant="outline" onClick={() => loadData({ reset: true })}>
                    Actualizar Datos
                </Button>
            </div>

            {/* 1. SECCIÓN DE MÉTRICAS (KPIs) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
                <Card className="p-5 bg-white dark:bg-slate-800 border-l-4 border-blue-500 shadow-sm flex justify-between items-center">
                    <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                            Usuarios
                        </p>
                        <h3 className="text-3xl font-bold text-slate-800 dark:text-white mt-1">
                            {data?.stats.total_users}
                        </h3>
                    </div>
                    <Users className="w-8 h-8 text-blue-500 opacity-50" />
                </Card>
                <Card className="p-5 bg-white dark:bg-slate-800 border-l-4 border-green-500 shadow-sm flex justify-between items-center">
                    <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                            Clientes PRO
                        </p>
                        <h3 className="text-3xl font-bold text-green-600">
                            {data?.stats.active_pro}
                        </h3>
                        <p className="text-[10px] text-slate-400 mt-1">
                            {data?.stats.total_users > 0
                                ? (
                                      (data?.stats.active_pro /
                                          data?.stats.total_users) *
                                      100
                                  ).toFixed(1)
                                : 0}
                            % Conv.
                        </p>
                    </div>
                    <CheckCircle className="w-6 h-6 text-green-500 opacity-50" />
                </Card>
                <Card className="p-5 bg-white dark:bg-slate-800 border-l-4 border-brand-500 shadow-sm flex justify-between items-center">
                    <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                            MRR Estimado
                        </p>
                        <h3 className="text-3xl font-bold text-brand-600 dark:text-brand-400">
                            ${estimatedMRR}
                        </h3>
                    </div>
                    <DollarSign className="w-6 h-6 text-brand-500 opacity-50" />
                </Card>
            </div>

            {/* 2. NUEVA SECCIÓN: ANALÍTICAS DE USO */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {/* Dispositivos */}
                <Card className="p-5 bg-white dark:bg-slate-800">
                    <h3 className="font-bold text-slate-700 dark:text-white mb-4 flex items-center gap-2">
                        <Smartphone className="w-5 h-5 text-brand-600" />{' '}
                        Dispositivos de Registro
                    </h3>
                    <div className="space-y-3">
                        {data?.stats &&
                            Object.entries(data.stats.platforms).map(
                                ([plat, count]: any) =>
                                    count > 0 && (
                                        <div
                                            key={plat}
                                            className="flex justify-between items-center text-sm"
                                        >
                                            <span className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                                                {getPlatformIcon(plat)}{' '}
                                                {plat === 'Unknown'
                                                    ? 'Web (Antiguo)'
                                                    : plat}
                                            </span>
                                            <span className="font-bold text-slate-800 dark:text-white">
                                                {count}
                                            </span>
                                        </div>
                                    )
                            )}
                    </div>
                </Card>

                {/* Top Herramientas */}
                <Card className="p-5 bg-white dark:bg-slate-800">
                    <h3 className="font-bold text-slate-700 dark:text-white mb-4 flex items-center gap-2">
                        <BarChart className="w-5 h-5 text-brand-600" /> Top
                        Herramientas
                    </h3>
                    <div className="space-y-3">
                        {data?.tool_usage
                            ?.slice(0, 5)
                            .map(([tool, count]: any, i: number) => (
                                <div
                                    key={i}
                                    className="flex items-center gap-3 text-sm"
                                >
                                    <div className="w-6 text-slate-400 font-bold">
                                        #{i + 1}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex justify-between mb-1">
                                            <span className="text-slate-700 dark:text-slate-300">
                                                {tool}
                                            </span>
                                            <span className="text-xs font-bold">
                                                {count} usos
                                            </span>
                                        </div>
                                        <div className="w-full bg-slate-100 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                                            <div
                                                className="bg-brand-500 h-full rounded-full"
                                                style={{
                                                    width: `${
                                                        (count /
                                                            data
                                                                .tool_usage[0][1]) *
                                                        100
                                                    }%`,
                                                }}
                                            ></div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        {(!data?.tool_usage ||
                            data.tool_usage.length === 0) && (
                            <p className="text-xs text-slate-400">
                                Aún no hay datos de uso.
                            </p>
                        )}
                    </div>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* 3. COLUMNA IZQUIERDA: LISTA DE USUARIOS (3/4 ancho) */}
                <div className="lg:col-span-3">
                    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
                        <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex flex-col md:flex-row justify-between items-center gap-4 bg-slate-50 dark:bg-slate-900/50">
                            <div className="flex bg-slate-200 dark:bg-slate-700 p-1 rounded-lg w-full md:w-auto">
                                <button
                                    onClick={() => setFilterType('all')}
                                    className={`flex-1 md:flex-none px-3 py-1 text-xs font-bold rounded-md transition-colors ${
                                        filterType === 'all'
                                            ? 'bg-white dark:bg-slate-800 shadow text-slate-900 dark:text-white'
                                            : 'text-slate-500'
                                    }`}
                                >
                                    Todos
                                </button>
                                <button
                                    onClick={() => setFilterType('pro')}
                                    className={`flex-1 md:flex-none px-3 py-1 text-xs font-bold rounded-md transition-colors ${
                                        filterType === 'pro'
                                            ? 'bg-white dark:bg-slate-800 shadow text-green-600'
                                            : 'text-slate-500'
                                    }`}
                                >
                                    PRO
                                </button>
                                <button
                                    onClick={() => setFilterType('free')}
                                    className={`flex-1 md:flex-none px-3 py-1 text-xs font-bold rounded-md transition-colors ${
                                        filterType === 'free'
                                            ? 'bg-white dark:bg-slate-800 shadow text-slate-600'
                                            : 'text-slate-500'
                                    }`}
                                >
                                    Free
                                </button>
                            </div>

                            <div className="flex items-center gap-2 bg-white dark:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 w-full md:w-64">
                                <Search className="w-4 h-4 text-slate-400" />
                                <input
                                    className="bg-transparent outline-none text-sm text-slate-700 dark:text-slate-200 w-full"
                                    placeholder="Buscar usuario..."
                                    value={searchTerm}
                                    onChange={(e) =>
                                        setSearchTerm(e.target.value)
                                    }
                                />
                            </div>
                        </div>

                        {/* TABLA ESCRITORIO */}
                        <div className="hidden md:block overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-slate-50 dark:bg-slate-900 text-slate-500 dark:text-slate-400 font-bold uppercase text-xs">
                                    <tr>
                                        <th className="p-4">Usuario</th>
                                        <th className="p-4">Origen</th>{' '}
                                        {/* NUEVA COLUMNA */}
                                        <th className="p-4">Plan</th>
                                        <th className="p-4 text-center">
                                            Créditos
                                        </th>
                                        <th className="p-4 text-right">
                                            Acciones
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                                    {filteredUsers.map((u: any) => (
                                        <tr
                                            key={u.id}
                                            className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors"
                                        >
                                            <td className="p-4">
                                                <p className="font-bold text-slate-800 dark:text-white">
                                                    {u.name}
                                                </p>
                                                <p className="text-xs text-slate-500">
                                                    {u.email}
                                                </p>
                                                <p className="text-[10px] text-slate-400 mt-0.5">
                                                    {new Date(
                                                        u.joined
                                                    ).toLocaleDateString()}
                                                </p>
                                            </td>
                                            <td className="p-4">
                                                <div
                                                    className="flex items-center gap-2"
                                                    title={u.platform}
                                                >
                                                    {getPlatformIcon(
                                                        u.platform
                                                    )}
                                                    <span className="text-xs text-slate-500">
                                                        {u.platform ===
                                                        'Unknown'
                                                            ? '-'
                                                            : u.platform}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                {u.isPro ? (
                                                    <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-bold">
                                                        PRO
                                                    </span>
                                                ) : (
                                                    <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded text-xs font-bold">
                                                        FREE
                                                    </span>
                                                )}
                                            </td>
                                            <td className="p-4 text-center font-mono text-slate-600 dark:text-slate-300">
                                                {u.credits}
                                            </td>
                                            <td className="p-4 text-right">
                                                {!u.isPro ? (
                                                    <button
                                                        onClick={() =>
                                                            handleSubscriptionAction(
                                                                'grant',
                                                                u.id,
                                                                u.email
                                                            )
                                                        }
                                                        className="text-xs bg-indigo-100 text-indigo-700 px-3 py-1.5 rounded hover:bg-indigo-200 font-bold ml-auto flex items-center gap-1"
                                                    >
                                                        <Gift className="w-3 h-3" />{' '}
                                                        Dar PRO
                                                    </button>
                                                ) : (
                                                    <button
                                                        onClick={() =>
                                                            handleSubscriptionAction(
                                                                'revoke',
                                                                u.id,
                                                                u.email
                                                            )
                                                        }
                                                        className="text-xs bg-red-100 text-red-600 px-3 py-1.5 rounded hover:bg-red-200 font-bold ml-auto flex items-center gap-1"
                                                    >
                                                        <XCircle className="w-3 h-3" />{' '}
                                                        Quitar
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() =>
                                                        handleDeleteUser(
                                                            u.id,
                                                            u.email
                                                        )
                                                    }
                                                    className="p-2 text-slate-300 hover:text-red-600 transition-colors ml-2"
                                                    title="Eliminar Usuario"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* TARJETAS MÓVIL */}
                        <div className="md:hidden p-4 space-y-4">
                            {filteredUsers.map((u: any) => (
                                <div
                                    key={u.id}
                                    className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-4 shadow-sm"
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <p className="font-bold text-slate-900 dark:text-white">
                                                {u.name}
                                            </p>
                                            <p className="text-xs text-slate-500 break-all">
                                                {u.email}
                                            </p>
                                            <div className="flex items-center gap-1 mt-1 text-xs text-slate-400">
                                                {getPlatformIcon(u.platform)}{' '}
                                                {u.platform}
                                            </div>
                                        </div>
                                        {u.isPro ? (
                                            <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-bold">
                                                PRO
                                            </span>
                                        ) : (
                                            <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded text-xs font-bold">
                                                FREE
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex justify-between items-center mt-4 border-t border-slate-100 dark:border-slate-700 pt-3">
                                        <span className="text-xs text-slate-400">
                                            Créditos: {u.credits}
                                        </span>
                                        {!u.isPro ? (
                                            <button
                                                onClick={() =>
                                                    handleSubscriptionAction(
                                                        'grant',
                                                        u.id,
                                                        u.email
                                                    )
                                                }
                                                className="text-xs bg-indigo-100 text-indigo-700 px-3 py-1.5 rounded font-bold flex items-center gap-1"
                                            >
                                                <Gift className="w-3 h-3" /> Dar
                                                PRO
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() =>
                                                    handleSubscriptionAction(
                                                        'revoke',
                                                        u.id,
                                                        u.email
                                                    )
                                                }
                                                className="text-xs bg-red-100 text-red-600 px-3 py-1.5 rounded font-bold flex items-center gap-1"
                                            >
                                                <XCircle className="w-3 h-3" />{' '}
                                                Quitar
                                            </button>
                                        )}
                                        <button
                                            onClick={() =>
                                                handleDeleteUser(u.id, u.email)
                                            }
                                            className="p-2 text-slate-300 hover:text-red-600 transition-colors ml-2"
                                            title="Eliminar Usuario"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 px-4 py-3 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/40">
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                Mostrando {users.length} de {totalUsers} usuarios
                            </p>
                            <Button
                                variant="outline"
                                onClick={handleLoadMoreUsers}
                                disabled={!hasMoreUsers || usersLoading}
                            >
                                {usersLoading
                                    ? 'Cargando...'
                                    : hasMoreUsers
                                    ? 'Cargar mas'
                                    : 'No hay mas'}
                            </Button>
                        </div>
                    </div>
                </div>

                {/* 4. COLUMNA DERECHA: NOTIFICACIONES (1/4 ancho) */}
                <div className="lg:col-span-1 space-y-4">
                    <div className="flex items-center gap-2 mb-2">
                        <Bell className="w-5 h-5 text-brand-600" />
                        <h3 className="font-bold text-slate-700 dark:text-white">
                            Notificaciones
                        </h3>
                    </div>

                    <div className="bg-slate-100 dark:bg-slate-900 p-4 rounded-xl h-[600px] overflow-y-auto custom-scrollbar space-y-3 border border-slate-200 dark:border-slate-700">
                        {data?.notifications.length === 0 && (
                            <p className="text-xs text-slate-400 text-center mt-10">
                                Sin novedades.
                            </p>
                        )}

                        {data?.notifications.map((notif: any, i: number) => (
                            <div
                                key={i}
                                className="bg-white dark:bg-slate-800 p-3 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700"
                            >
                                <div className="flex items-center gap-2 mb-1">
                                    {notif.type === 'sale' ? (
                                        <div className="p-1 bg-green-100 text-green-600 rounded-full shrink-0">
                                            <DollarSign className="w-3 h-3" />
                                        </div>
                                    ) : notif.type === 'signup' ? (
                                        <div className="p-1 bg-blue-100 text-blue-600 rounded-full shrink-0">
                                            <UserPlus className="w-3 h-3" />
                                        </div>
                                    ) : (
                                        <div className="p-1 bg-slate-100 text-slate-600 rounded-full shrink-0">
                                            <ShieldAlert className="w-3 h-3" />
                                        </div>
                                    )}
                                    <span className="text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400 tracking-wider">
                                        {notif.type}
                                    </span>
                                    <span className="text-[10px] text-slate-400 ml-auto whitespace-nowrap">
                                        {new Date(
                                            notif.date
                                        ).toLocaleTimeString([], {
                                            hour: '2-digit',
                                            minute: '2-digit',
                                        })}
                                    </span>
                                </div>
                                <h4 className="text-sm font-bold text-slate-800 dark:text-white leading-tight mb-1">
                                    {notif.title}
                                </h4>
                                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed break-words whitespace-normal">
                                    {notif.message}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}


