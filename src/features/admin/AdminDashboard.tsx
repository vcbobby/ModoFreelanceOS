import React, { useCallback, useEffect, useState } from 'react';
import {
  Users,
  ShieldAlert,
  Search,
  Gift,
  CheckCircle,
  DollarSign,
  Bell,
  XCircle,
  UserPlus,
  Smartphone,
  Monitor,
  Globe,
  BarChart,
  Trash2,
  RefreshCw,
  Download,
  TrendingUp,
} from 'lucide-react';
import { Card, Button, ConfirmationModal } from '@features/shared/ui';
import { getBackendURL } from '@config/features';
import { getAuthHeaders } from '@/services/backend/authHeaders';

interface AdminDashboardProps {
  userId: string;
}

interface AdminStats {
  total_users: number;
  active_pro: number;
  platforms: Record<string, number>;
}

type AdminToolUsageEntry = [string, number];

interface AdminNotification {
  type: string;
  date: string;
  title: string;
  message: string;
}

interface AdminUser {
  id: string;
  name?: string;
  email?: string;
  joined?: number | string;
  platform?: string;
  isPro?: boolean;
  credits?: number;
}

interface AdminDashboardData {
  stats: AdminStats;
  tool_usage: AdminToolUsageEntry[];
  notifications: AdminNotification[];
}

interface AdminDashboardResponse {
  success: boolean;
  stats?: AdminStats;
  tool_usage?: AdminToolUsageEntry[];
  notifications?: AdminNotification[];
  users?: AdminUser[];
  hasMore?: boolean;
  nextCursor?: string;
  message?: string;
  updatedAt?: number;
}

interface ModalConfig {
  isOpen: boolean;
  title: string;
  message: string;
  action: () => void;
  isDanger: boolean;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ userId }) => {
  const BACKEND_URL = getBackendURL();
  const USERS_PAGE_SIZE = 50;

  // Estados
  const [data, setData] = useState<AdminDashboardData>({
    stats: { total_users: 0, active_pro: 0, platforms: {} },
    tool_usage: [],
    notifications: [],
  });
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [hasMoreUsers, setHasMoreUsers] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'pro' | 'free'>('all');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [modalConfig, setModalConfig] = useState<ModalConfig>({
    isOpen: false,
    title: '',
    message: '',
    action: () => {},
    isDanger: false,
  });

  // Función para formatear fecha en zona horaria de Venezuela (VET = UTC-4)
  const formatVenezuelaDate = (dateStr: string | Date) => {
    try {
      const date = new Date(dateStr);

      const options: Intl.DateTimeFormatOptions = {
        timeZone: 'America/Caracas',
        year: 'numeric',
        month: 'short',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      };

      return new Intl.DateTimeFormat('es-VE', options).format(date);
    } catch (e) {
      return dateStr.toString();
    }
  };

  const formatVenezuelaTime = (dateStr: string | Date) => {
    try {
      const date = new Date(dateStr);

      const options: Intl.DateTimeFormatOptions = {
        timeZone: 'America/Caracas',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      };

      return new Intl.DateTimeFormat('es-VE', options).format(date);
    } catch (e) {
      return dateStr.toString();
    }
  };

  // Funciones de modal
  const openInfoModal = useCallback((title: string, message: string) => {
    setModalConfig({
      isOpen: true,
      title,
      message,
      isDanger: false,
      action: () => setModalConfig((prev) => ({ ...prev, isOpen: false })),
    });
  }, []);

  const openErrorModal = useCallback((title: string, message: string) => {
    setModalConfig({
      isOpen: true,
      title,
      message,
      isDanger: true,
      action: () => setModalConfig((prev) => ({ ...prev, isOpen: false })),
    });
  }, []);

  // Función principal de carga de datos - CORREGIDA
  const loadData = useCallback(
    async (
      options: {
        reset?: boolean;
        cursor?: string | null;
        includeMeta?: boolean;
        search?: string;
        filter?: 'all' | 'pro' | 'free';
        forceRefresh?: boolean;
      } = {}
    ) => {
      const {
        reset = false,
        cursor = null,
        includeMeta = true,
        search = '',
        filter = 'all',
        forceRefresh = false,
      } = options;

      try {
        setUsersLoading(true);
        if (reset || forceRefresh) {
          setLoading(true);
        }

        // Si se pide refresh forzado, primero regenerar el cache
        if (forceRefresh) {
          const refreshUrl = `${BACKEND_URL}/api/v1/admin/dashboard/refresh`;
          const authHeaders = await getAuthHeaders();

          await fetch(refreshUrl, {
            method: 'POST',
            headers: {
              ...authHeaders,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ adminId: userId }),
          });
        }

        const url = `${BACKEND_URL}/api/v1/admin/dashboard/simple`;
        const authHeaders = await getAuthHeaders();

        const body = {
          adminId: userId,
          cursor: cursor || null,
          limit: USERS_PAGE_SIZE,
          includeMeta: includeMeta,
          search: search || undefined,
          filter: filter !== 'all' ? filter : undefined,
        };

        const res = await fetch(url, {
          method: 'POST',
          headers: {
            ...authHeaders,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(body),
        });

        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }

        const json: AdminDashboardResponse = await res.json();

        if (json.success) {
          // Actualizar datos del dashboard solo si se incluyen
          if (includeMeta && json.stats) {
            setData({
              stats: json.stats,
              tool_usage: json.tool_usage || [],
              notifications: json.notifications || [],
            });
          }

          // CORREGIDO: Actualizar usuarios sin duplicados
          if (reset) {
            setUsers(json.users || []);
          } else {
            // Evitar duplicados usando un Set de IDs
            setUsers((prevUsers) => {
              const existingIds = new Set(prevUsers.map((u) => u.id));
              const newUsers = (json.users || []).filter((u) => !existingIds.has(u.id));
              return [...prevUsers, ...newUsers];
            });
          }

          setHasMoreUsers(json.hasMore || false);
          setNextCursor(json.nextCursor || null);
          setErrorMessage(null);
          setLastUpdate(new Date());

          if (forceRefresh) {
            openInfoModal(
              '✅ Datos actualizados',
              'El cache se regeneró y los datos están actualizados.'
            );
          }
        } else {
          setErrorMessage(json.message || 'Error al cargar los datos');
          openErrorModal('Error', json.message || 'Error al cargar los datos');
        }
      } catch (error) {
        console.error('Error loading dashboard:', error);
        setErrorMessage('Error de red al cargar el dashboard');
        openErrorModal('Error', 'Error de red al cargar el dashboard');
      } finally {
        setLoading(false);
        setUsersLoading(false);
      }
    },
    [BACKEND_URL, userId, USERS_PAGE_SIZE, openErrorModal, openInfoModal]
  );

  // Carga inicial - SOLO UNA VEZ al montar el componente
  useEffect(() => {
    loadData({ reset: true, includeMeta: true, filter: 'all' });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Búsqueda con debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      // CORREGIDO: Reset users cuando busca
      setUsers([]);
      setNextCursor(null);
      loadData({ reset: true, includeMeta: false, search: searchTerm, filter: filterType });
    }, 400);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm]);

  // Cambio de filtro - CORREGIDO
  const handleFilterChange = useCallback(
    (newFilter: 'all' | 'pro' | 'free') => {
      setFilterType(newFilter);
      setUsers([]); // Limpiar usuarios
      setNextCursor(null); // Resetear cursor
      loadData({ reset: true, includeMeta: false, search: searchTerm, filter: newFilter });
    },
    [searchTerm, loadData]
  );

  // Cargar más usuarios
  const handleLoadMoreUsers = useCallback(() => {
    if (usersLoading || !hasMoreUsers || !nextCursor) return;
    loadData({
      reset: false,
      cursor: nextCursor,
      includeMeta: false,
      search: searchTerm,
      filter: filterType,
    });
  }, [usersLoading, hasMoreUsers, nextCursor, searchTerm, filterType, loadData]);

  // Actualizar datos (UNIFICADO)
  const handleRefreshData = useCallback(() => {
    setUsers([]);
    setNextCursor(null);
    loadData({
      reset: true,
      includeMeta: true,
      search: searchTerm,
      filter: filterType,
      forceRefresh: true,
    });
  }, [searchTerm, filterType, loadData]);

  // Exportar a CSV
  const handleExportCSV = useCallback(() => {
    try {
      const headers = ['Nombre', 'Email', 'Plan', 'Créditos', 'Plataforma', 'Fecha de Registro'];
      const rows = users.map((u) => [
        u.name || '',
        u.email || '',
        u.isPro ? 'PRO' : 'FREE',
        u.credits?.toString() || '0',
        u.platform || '',
        u.joined ? new Date(u.joined).toLocaleDateString('es-VE') : '',
      ]);

      const csvContent = [
        headers.join(','),
        ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);

      link.setAttribute('href', url);
      link.setAttribute('download', `usuarios_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      openInfoModal('✅ Exportado', 'Los datos se exportaron correctamente a CSV.');
    } catch (error) {
      console.error('Error exporting CSV:', error);
      openErrorModal('Error', 'No se pudo exportar los datos.');
    }
  }, [users, openInfoModal, openErrorModal]);

  // Manejo de suscripciones
  const handleSubscriptionAction = useCallback(
    (type: 'grant' | 'revoke', targetId: string, email: string) => {
      const isGrant = type === 'grant';
      setModalConfig({
        isOpen: true,
        title: isGrant ? '¿Regalar Suscripcion?' : '¿Revocar Suscripcion?',
        message: isGrant
          ? `Daras 30 dias PRO a ${email}.`
          : `Estas a punto de quitarle el PRO a ${email}. Volvera a ser FREE.`,
        isDanger: !isGrant,
        action: () => executeSubAction(type, targetId),
      });
    },
    []
  );

  const executeSubAction = useCallback(
    async (type: 'grant' | 'revoke', targetId: string) => {
      try {
        const endpoint = type === 'grant' ? 'grant-subscription' : 'revoke-subscription';
        const formData = new FormData();
        formData.append('adminId', userId);
        formData.append('targetUserId', targetId);
        if (type === 'grant') formData.append('days', '30');

        const authHeaders = await getAuthHeaders();
        const res = await fetch(`${BACKEND_URL}/api/admin/${endpoint}`, {
          method: 'POST',
          headers: authHeaders,
          body: formData,
        });
        const json = await res.json();

        if (json.success) {
          openInfoModal('Exito', json.message);
          // Recargar datos
          setUsers([]);
          setNextCursor(null);
          loadData({ reset: true, includeMeta: true, search: searchTerm, filter: filterType });
        } else {
          openErrorModal('Error', json.message || 'Error al ejecutar la acción');
        }
      } catch (error) {
        console.error('Error executing subscription action:', error);
        openErrorModal('Error', 'Fallo la operacion. Intenta nuevamente.');
      }
    },
    [BACKEND_URL, userId, searchTerm, filterType, loadData, openInfoModal, openErrorModal]
  );

  // Eliminar usuario
  const handleDeleteUser = useCallback(
    (targetId: string, email: string) => {
      setModalConfig({
        isOpen: true,
        title: '¿ELIMINAR USUARIO?',
        message: `Vas a borrar permanentemente a ${email}. Esta accion es irreversible.`,
        isDanger: true,
        action: async () => {
          try {
            const formData = new FormData();
            formData.append('adminId', userId);
            formData.append('targetUserId', targetId);

            const authHeaders = await getAuthHeaders();
            const res = await fetch(`${BACKEND_URL}/api/admin/delete-user`, {
              method: 'POST',
              headers: authHeaders,
              body: formData,
            });

            if (!res.ok) throw new Error();

            openInfoModal('Usuario eliminado', 'El usuario fue eliminado correctamente.');
            // Recargar datos
            setUsers([]);
            setNextCursor(null);
            loadData({ reset: true, includeMeta: true, search: searchTerm, filter: filterType });
          } catch (error) {
            console.error('Error deleting user:', error);
            openErrorModal('Error', 'No se pudo eliminar el usuario.');
          }
        },
      });
    },
    [BACKEND_URL, userId, searchTerm, filterType, loadData, openInfoModal, openErrorModal]
  );

  // Funciones auxiliares
  const getPlatformIcon = (plat: string) => {
    if (!plat) return <Globe className="w-4 h-4 text-slate-300" />;
    if (plat.includes('Android')) return <Smartphone className="w-4 h-4 text-green-500" />;
    if (plat.includes('Windows')) return <Monitor className="w-4 h-4 text-blue-500" />;
    if (plat.includes('iOS')) return <Smartphone className="w-4 h-4 text-slate-500" />;
    return <Globe className="w-4 h-4 text-slate-400" />;
  };

  // Ordenamiento de usuarios
  const sortedUsers = [...users].sort((a, b) => {
    const aJoined = typeof a.joined === 'string' ? new Date(a.joined).getTime() : a.joined || 0;
    const bJoined = typeof b.joined === 'string' ? new Date(b.joined).getTime() : b.joined || 0;
    return bJoined - aJoined;
  });

  const totalUsers = data.stats.total_users;
  const estimatedMRR = data.stats.active_pro * 10;
  const conversionRate = totalUsers ? ((data.stats.active_pro / totalUsers) * 100).toFixed(1) : '0';

  return (
    <div className="max-w-7xl mx-auto pb-20 px-4 md:px-0">
      <ConfirmationModal
        isOpen={modalConfig.isOpen}
        onClose={() => setModalConfig({ ...modalConfig, isOpen: false })}
        onConfirm={() => modalConfig.action()}
        title={modalConfig.title}
        message={modalConfig.message}
        confirmText={
          modalConfig.title.includes('Exito') || modalConfig.title.includes('✅')
            ? 'Cerrar'
            : 'Confirmar'
        }
        cancelText={
          modalConfig.title.includes('Exito') || modalConfig.title.includes('✅') ? '' : 'Cancelar'
        }
        isDanger={modalConfig.isDanger}
      />

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <ShieldAlert className="w-8 h-8 text-brand-600" /> Super Admin
          </h2>
          {lastUpdate && (
            <p className="text-xs text-slate-500 mt-1">
              Última actualización: {formatVenezuelaDate(lastUpdate)}
            </p>
          )}
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button
            variant="outline"
            onClick={handleExportCSV}
            disabled={users.length === 0}
            className="flex items-center gap-2"
          >
            <Download className="w-4 h-4" /> Exportar CSV
          </Button>
          <Button
            variant="primary"
            onClick={handleRefreshData}
            disabled={loading}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Actualizando...' : 'Actualizar'}
          </Button>
        </div>
      </div>

      {errorMessage && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
          {errorMessage}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        <Card className="p-5 bg-white dark:bg-slate-800 border-l-4 border-blue-500 shadow-sm">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                Usuarios Totales
              </p>
              <h3 className="text-3xl font-bold text-slate-800 dark:text-white">{totalUsers}</h3>
            </div>
            <Users className="w-8 h-8 text-blue-500 opacity-50" />
          </div>
        </Card>

        <Card className="p-5 bg-white dark:bg-slate-800 border-l-4 border-green-500 shadow-sm">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                Clientes PRO
              </p>
              <h3 className="text-3xl font-bold text-green-600">{data.stats.active_pro}</h3>
              <div className="flex items-center gap-2 mt-1">
                <TrendingUp className="w-3 h-3 text-green-500" />
                <p className="text-xs text-slate-500">{conversionRate}% conversión</p>
              </div>
            </div>
            <CheckCircle className="w-8 h-8 text-green-500 opacity-50" />
          </div>
        </Card>

        <Card className="p-5 bg-white dark:bg-slate-800 border-l-4 border-brand-500 shadow-sm">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                MRR Estimado
              </p>
              <h3 className="text-3xl font-bold text-brand-600 dark:text-brand-400">
                ${estimatedMRR}
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                ~${(estimatedMRR * 12).toLocaleString()} ARR
              </p>
            </div>
            <DollarSign className="w-8 h-8 text-brand-500 opacity-50" />
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card className="p-5 bg-white dark:bg-slate-800">
          <h3 className="font-bold text-slate-700 dark:text-white mb-4 flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-brand-600" /> Dispositivos de Registro
          </h3>
          <div className="space-y-3">
            {Object.entries(data.stats.platforms)
              .sort(([, a], [, b]) => b - a)
              .map(
                ([plat, count]) =>
                  count > 0 && (
                    <div key={plat} className="flex justify-between items-center text-sm">
                      <span className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                        {getPlatformIcon(plat)} {plat === 'Unknown' ? 'Web (Antiguo)' : plat}
                      </span>
                      <div className="flex items-center gap-3">
                        <div className="w-32 bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                          <div
                            className="bg-brand-500 h-2 rounded-full"
                            style={{ width: `${(count / totalUsers) * 100}%` }}
                          />
                        </div>
                        <span className="font-bold text-slate-800 dark:text-white w-8 text-right">
                          {count}
                        </span>
                      </div>
                    </div>
                  )
              )}
          </div>
        </Card>

        <Card className="p-5 bg-white dark:bg-slate-800">
          <h3 className="font-bold text-slate-700 dark:text-white mb-4 flex items-center gap-2">
            <BarChart className="w-5 h-5 text-brand-600" /> Top Herramientas
          </h3>
          <div className="space-y-3">
            {data.tool_usage.slice(0, 5).map(([tool, count], i) => (
              <div key={i} className="flex items-center gap-3 text-sm">
                <div className="w-6 text-slate-400 font-bold">#{i + 1}</div>
                <span className="flex-1 text-slate-700 dark:text-slate-200 truncate">{tool}</span>
                <span className="font-bold text-brand-600 dark:text-brand-400">{count}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="flex items-center gap-2 mb-3">
            <Users className="w-5 h-5 text-brand-600" />
            <h3 className="font-bold text-slate-700 dark:text-white">Usuarios Registrados</h3>
            <span className="text-xs text-slate-500 ml-auto">
              Mostrando {sortedUsers.length} usuarios
            </span>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-200 dark:border-slate-700 space-y-3">
              <div className="flex flex-col md:flex-row gap-3">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Buscar por email o nombre..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
                <div className="flex gap-2">
                  {(['all', 'pro', 'free'] as const).map((type) => (
                    <button
                      key={type}
                      onClick={() => handleFilterChange(type)}
                      disabled={usersLoading}
                      className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                        filterType === type
                          ? 'bg-brand-600 text-white shadow-md'
                          : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                      } ${usersLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      {type === 'all' ? 'Todos' : type === 'pro' ? 'PRO' : 'FREE'}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Tabla para desktop */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    <th className="p-4 text-left text-xs font-bold text-slate-600 dark:text-slate-400 uppercase">
                      Usuario
                    </th>
                    <th className="p-4 text-left text-xs font-bold text-slate-600 dark:text-slate-400 uppercase">
                      Origen
                    </th>
                    <th className="p-4 text-center text-xs font-bold text-slate-600 dark:text-slate-400 uppercase">
                      Plan
                    </th>
                    <th className="p-4 text-center text-xs font-bold text-slate-600 dark:text-slate-400 uppercase">
                      Créditos
                    </th>
                    <th className="p-4 text-right text-xs font-bold text-slate-600 dark:text-slate-400 uppercase">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                  {sortedUsers.map((u) => (
                    <tr
                      key={u.id}
                      className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors"
                    >
                      <td className="p-4">
                        <p className="font-bold text-slate-800 dark:text-white text-sm">{u.name}</p>
                        <p className="text-xs text-slate-500 truncate max-w-xs">{u.email}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">
                          {u.joined ? new Date(u.joined).toLocaleDateString('es-VE') : '-'}
                        </p>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          {getPlatformIcon(u.platform || '')}
                          <span className="text-xs text-slate-500 truncate max-w-[100px]">
                            {u.platform === 'Unknown' ? 'Web' : u.platform || '-'}
                          </span>
                        </div>
                      </td>
                      <td className="p-4 text-center">
                        {u.isPro ? (
                          <span className="inline-block bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-bold">
                            PRO
                          </span>
                        ) : (
                          <span className="inline-block bg-slate-100 text-slate-600 px-2 py-1 rounded text-xs font-bold">
                            FREE
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-center font-mono text-sm text-slate-600 dark:text-slate-300">
                        {u.credits ?? 0}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-end gap-1">
                          {!u.isPro ? (
                            <button
                              onClick={() => handleSubscriptionAction('grant', u.id, u.email || '')}
                              className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1.5 rounded hover:bg-indigo-200 font-bold flex items-center gap-1"
                              title="Dar PRO"
                            >
                              <Gift className="w-3 h-3" /> PRO
                            </button>
                          ) : (
                            <button
                              onClick={() =>
                                handleSubscriptionAction('revoke', u.id, u.email || '')
                              }
                              className="text-xs bg-red-100 text-red-600 px-2 py-1.5 rounded hover:bg-red-200 font-bold flex items-center gap-1"
                              title="Quitar PRO"
                            >
                              <XCircle className="w-3 h-3" /> Quitar
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteUser(u.id, u.email || '')}
                            className="p-1.5 text-slate-400 hover:text-red-600 transition-colors"
                            title="Eliminar Usuario"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Cards para móvil/tablet */}
            <div className="lg:hidden p-4 space-y-4">
              {sortedUsers.map((u) => (
                <div
                  key={u.id}
                  className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-4"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-slate-900 dark:text-white truncate">{u.name}</p>
                      <p className="text-xs text-slate-500 break-all">{u.email}</p>
                      <div className="flex items-center gap-2 mt-2 text-xs text-slate-400">
                        {getPlatformIcon(u.platform || '')}
                        <span>{u.platform === 'Unknown' ? 'Web' : u.platform || '-'}</span>
                        <span className="mx-1">•</span>
                        <span>
                          {u.joined ? new Date(u.joined).toLocaleDateString('es-VE') : '-'}
                        </span>
                      </div>
                    </div>
                    {u.isPro ? (
                      <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-bold ml-2">
                        PRO
                      </span>
                    ) : (
                      <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded text-xs font-bold ml-2">
                        FREE
                      </span>
                    )}
                  </div>
                  <div className="flex justify-between items-center pt-3 border-t border-slate-200 dark:border-slate-700">
                    <span className="text-xs text-slate-500">
                      Créditos: <span className="font-mono font-bold">{u.credits ?? 0}</span>
                    </span>
                    <div className="flex items-center gap-2">
                      {!u.isPro ? (
                        <button
                          onClick={() => handleSubscriptionAction('grant', u.id, u.email || '')}
                          className="text-xs bg-indigo-100 text-indigo-700 px-3 py-1.5 rounded font-bold flex items-center gap-1"
                        >
                          <Gift className="w-3 h-3" /> Dar PRO
                        </button>
                      ) : (
                        <button
                          onClick={() => handleSubscriptionAction('revoke', u.id, u.email || '')}
                          className="text-xs bg-red-100 text-red-600 px-3 py-1.5 rounded font-bold flex items-center gap-1"
                        >
                          <XCircle className="w-3 h-3" /> Quitar
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteUser(u.id, u.email || '')}
                        className="p-2 text-slate-400 hover:text-red-600 transition-colors"
                        title="Eliminar Usuario"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-4 py-3 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/40">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {hasMoreUsers
                  ? `${sortedUsers.length} de muchos más usuarios`
                  : `Total: ${sortedUsers.length} usuarios`}
              </p>
              <Button
                variant="outline"
                onClick={handleLoadMoreUsers}
                disabled={!hasMoreUsers || usersLoading}
                className="w-full sm:w-auto"
              >
                {usersLoading ? 'Cargando...' : hasMoreUsers ? 'Cargar más usuarios' : 'No hay más'}
              </Button>
            </div>
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="flex items-center gap-2 mb-3">
            <Bell className="w-5 h-5 text-brand-600" />
            <h3 className="font-bold text-slate-700 dark:text-white">Notificaciones</h3>
          </div>

          <div className="bg-slate-100 dark:bg-slate-900 p-4 rounded-xl h-[600px] overflow-y-auto space-y-3 border border-slate-200 dark:border-slate-700">
            {data.notifications.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full">
                <Bell className="w-12 h-12 text-slate-300 mb-2" />
                <p className="text-xs text-slate-400 text-center">Sin notificaciones recientes</p>
              </div>
            )}

            {data.notifications.map((notif, i) => (
              <div
                key={i}
                className="bg-white dark:bg-slate-800 p-3 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start gap-2 mb-2">
                  {notif.type === 'sale' ? (
                    <div className="p-1.5 bg-green-100 text-green-600 rounded-full shrink-0">
                      <DollarSign className="w-3.5 h-3.5" />
                    </div>
                  ) : notif.type === 'signup' ? (
                    <div className="p-1.5 bg-blue-100 text-blue-600 rounded-full shrink-0">
                      <UserPlus className="w-3.5 h-3.5" />
                    </div>
                  ) : (
                    <div className="p-1.5 bg-slate-100 text-slate-600 rounded-full shrink-0">
                      <ShieldAlert className="w-3.5 h-3.5" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400 tracking-wider">
                        {notif.type}
                      </span>
                      <span className="text-[10px] text-slate-400 whitespace-nowrap">
                        {formatVenezuelaTime(notif.date)}
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-slate-800 dark:text-white leading-tight mb-1">
                      {notif.title}
                    </h4>
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed break-words">
                      {notif.message}
                    </p>
                    <p className="text-[10px] text-slate-400 mt-1">
                      {formatVenezuelaDate(notif.date)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
