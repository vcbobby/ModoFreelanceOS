import React, { useEffect, useMemo, useState } from 'react';
import { collection, doc, getDoc, getDocs, limit, orderBy, query } from 'firebase/firestore';
import { Activity, BarChart3, Layers, TrendingUp } from 'lucide-react';
import { db } from '@config/firebase';
import { Card } from '@features/shared/ui';

interface AnalyticsViewProps {
  userId?: string;
}

interface HistoryItemLite {
  id: string;
  category?: string;
  type?: string;
  createdAt?: { toMillis?: () => number } | string | number;
}

interface FinanceItemLite {
  id: string;
  amount?: number | string;
  type?: 'income' | 'expense';
  status?: 'paid' | 'pending';
  date?: string;
  createdAt?: { toMillis?: () => number } | string | number;
}

interface UserProfileLite {
  credits?: number;
  isSubscribed?: boolean;
  subscriptionEnd?: number;
}

const getTimestamp = (value?: HistoryItemLite['createdAt']) => {
  if (!value) return 0;
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? 0 : date.getTime();
  }
  if (value?.toMillis) return value.toMillis();
  return 0;
};

const getFinanceTimestamp = (value?: FinanceItemLite['date'] | FinanceItemLite['createdAt']) => {
  if (!value) return 0;
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? 0 : date.getTime();
  }
  if (value?.toMillis) return value.toMillis();
  return 0;
};

const parseAmount = (value?: FinanceItemLite['amount']) => {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const normalized = value.replace(/[^0-9.-]/g, '');
    const parsed = Number(normalized);
    return Number.isNaN(parsed) ? 0 : parsed;
  }
  return 0;
};

const CATEGORY_LABELS: Record<string, string> = {
  proposal: 'Propuesta IA',
  invoice: 'Facturas',
  logo: 'Logos',
  briefing: 'Briefing',
  portfolio: 'Creador de portafolio',
  fiverr: 'Generador Fiverr',
  qr: 'Generador QR',
  analyzer: 'Analizar doc',
  optimizer: 'Optimizador de imagenes',
  notes: 'Notas',
  jobs: 'Empleos',
  website: 'Web',
  finance: 'Finanzas',
  tool: 'Herramientas',
  assistant: 'Asistente',
  academy: 'Academia IA',
  history: 'Historial',
  gig: 'Gig',
  course: 'Curso',
  cv: 'CV',
};

const TOOL_CONFIG = [
  { key: 'briefing', label: 'Briefing', credits: 2 },
  { key: 'qr', label: 'Generador QR', credits: 1 },
  { key: 'fiverr', label: 'Generador Fiverr', credits: 2 },
  { key: 'proposal', label: 'Propuesta IA', credits: 1 },
  { key: 'portfolio', label: 'Creador de portafolio', credits: 3 },
  { key: 'invoice', label: 'Facturas', credits: 3 },
  { key: 'optimizer', label: 'Optimizador de imagenes', credits: 3 },
  { key: 'analyzer', label: 'Analizar doc', credits: 2 },
  { key: 'academy', label: 'Academia IA', credits: 3 },
];

const getToolKey = (item: HistoryItemLite) => {
  if (item.category && TOOL_CONFIG.some((tool) => tool.key === item.category)) {
    return item.category;
  }
  if (item.type === 'portfolio-gen') return 'portfolio';
  if (item.type === 'fiverr-gig') return 'fiverr';
  if (item.type === 'brief-checklist') return 'briefing';
  if (item.type === 'QR Code') return 'qr';
  return undefined;
};

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ userId }) => {
  const [history, setHistory] = useState<HistoryItemLite[]>([]);
  const [finances, setFinances] = useState<FinanceItemLite[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfileLite | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    const fetchAnalytics = async () => {
      setLoading(true);
      try {
        const historyRef = collection(db, 'users', userId, 'history');
        const historyQuery = query(historyRef, orderBy('createdAt', 'desc'), limit(200));
        const snapshot = await getDocs(historyQuery);
        const items = snapshot.docs.map(
          (docSnap) =>
            ({
              id: docSnap.id,
              ...(docSnap.data() as Omit<HistoryItemLite, 'id'>),
            }) as HistoryItemLite
        );
        setHistory(items);

        const financeRef = collection(db, 'users', userId, 'finances');
        const financeQuery = query(financeRef, orderBy('createdAt', 'desc'), limit(200));
        const financeSnap = await getDocs(financeQuery);
        const financeItems = financeSnap.docs.map(
          (docSnap) =>
            ({
              id: docSnap.id,
              ...(docSnap.data() as Omit<FinanceItemLite, 'id'>),
            }) as FinanceItemLite
        );
        setFinances(financeItems);

        const profileSnap = await getDoc(doc(db, 'users', userId));
        setUserProfile(profileSnap.exists() ? (profileSnap.data() as UserProfileLite) : null);
      } finally {
        setLoading(false);
      }
    };

    void fetchAnalytics();
  }, [userId]);

  const toolStats = useMemo(() => {
    const now = Date.now();
    const last7 = now - 7 * 24 * 60 * 60 * 1000;
    const last14 = now - 14 * 24 * 60 * 60 * 1000;

    const map = TOOL_CONFIG.reduce((acc, tool) => {
      acc[tool.key] = { total: 0, last7: 0, prev7: 0 };
      return acc;
    }, {} as Record<string, { total: number; last7: number; prev7: number }>);

    history.forEach((item) => {
      const key = getToolKey(item);
      if (!key) return;
      const createdAt = getTimestamp(item.createdAt);
      map[key].total += 1;
      if (createdAt >= last7) map[key].last7 += 1;
      else if (createdAt >= last14) map[key].prev7 += 1;
    });

    return TOOL_CONFIG.map((tool) => {
      const data = map[tool.key];
      const changePct =
        data.prev7 === 0 ? (data.last7 > 0 ? 100 : 0) : Math.round(((data.last7 - data.prev7) / data.prev7) * 100);
      const trendLabel =
        changePct > 0 ? 'Mas uso' : changePct < 0 ? 'Menos uso' : 'Igual que la semana anterior';
      return {
        key: tool.key,
        label: tool.label,
        creditsPerUse: tool.credits,
        total: data.total,
        last7: data.last7,
        prev7: data.prev7,
        changePct,
        trendLabel,
        creditsUsed: data.total * tool.credits,
      };
    });
  }, [history]);

  const stats = useMemo(() => {
    const now = Date.now();
    const last30 = now - 30 * 24 * 60 * 60 * 1000;
    const total = toolStats.reduce((acc, item) => acc + item.total, 0);
    const recent7 = toolStats.reduce((acc, item) => acc + item.last7, 0);
    let recent30 = 0;

    history.forEach((item) => {
      const key = getToolKey(item);
      if (!key) return;
      const createdAt = getTimestamp(item.createdAt);
      if (createdAt >= last30) recent30 += 1;
    });
    const sortedCategories = [...toolStats]
      .filter((item) => item.total > 0)
      .sort((a, b) => b.total - a.total);
    const topCategory = sortedCategories[0]?.key || 'sin datos';
    const topCategoryLabel =
      sortedCategories[0]?.label || CATEGORY_LABELS[topCategory] || topCategory;
    return {
      total,
      recent7,
      recent30,
      topCategory,
      topCategoryLabel,
      categories: sortedCategories.map((item) => ({ name: item.key, count: item.total })),
    };
  }, [toolStats]);

  const financeStats = useMemo(() => {
    const now = Date.now();
    const last30 = now - 30 * 24 * 60 * 60 * 1000;

    let income = 0;
    let expenses = 0;
    let pendingReceivable = 0;
    let pendingPayable = 0;

    finances.forEach((item) => {
      const amount = parseAmount(item.amount);
      const status = item.status || 'paid';
      const createdAt = getFinanceTimestamp(item.date || item.createdAt);
      if (status === 'pending') {
        if (item.type === 'income') pendingReceivable += amount;
        if (item.type === 'expense') pendingPayable += amount;
        return;
      }
      if (createdAt < last30) return;
      if (item.type === 'income') income += amount;
      if (item.type === 'expense') expenses += amount;
    });

    return {
      income,
      expenses,
      net: income - expenses,
      pendingReceivable,
      pendingPayable,
    };
  }, [finances]);

  const trend = useMemo(() => {
    const days = 14;
    const now = new Date();
    const buckets = Array.from({ length: days }, (_, index) => {
      const date = new Date(now);
      date.setDate(now.getDate() - (days - 1 - index));
      return {
        label: date.toLocaleDateString(undefined, { day: '2-digit', month: 'short' }),
        start: new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime(),
        count: 0,
      };
    });

    history.forEach((item) => {
      const createdAt = getTimestamp(item.createdAt);
      const bucket = buckets.find(
        (entry) => createdAt >= entry.start && createdAt < entry.start + 24 * 60 * 60 * 1000
      );
      if (bucket) bucket.count += 1;
    });

    const max = Math.max(...buckets.map((entry) => entry.count), 1);
    return buckets.map((entry) => ({ ...entry, max }));
  }, [history]);

  const usage = useMemo(() => {
    const totalLast7 = toolStats.reduce((acc, item) => acc + item.last7, 0);
    const totalPrev7 = toolStats.reduce((acc, item) => acc + item.prev7, 0);
    let changePct = 0;
    if (totalPrev7 === 0 && totalLast7 > 0) {
      changePct = 100;
    } else if (totalPrev7 > 0) {
      changePct = Math.round(((totalLast7 - totalPrev7) / totalPrev7) * 100);
    }
    const trendLabel =
      changePct > 0 ? 'Mas uso' : changePct < 0 ? 'Menos uso' : 'Igual que la semana anterior';
    return { totalLast7, totalPrev7, changePct, trendLabel };
  }, [toolStats]);

  const creditsUsedLast14 = useMemo(() => {
    return toolStats.reduce((acc, item) => acc + (item.last7 + item.prev7) * item.creditsPerUse, 0);
  }, [toolStats]);

  return (
    <div className="max-w-6xl mx-auto pb-20 space-y-8">
      <div className="text-center">
        <div className="inline-flex items-center gap-2 bg-sky-100 text-sky-800 px-3 py-1 rounded-full text-xs font-bold">
          <BarChart3 className="w-4 h-4" /> Analitica
        </div>
        <h2 className="text-3xl font-bold text-slate-900 dark:text-white mt-3">
          Indicadores clave de tu negocio
        </h2>
        <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto mt-2">
          Visualiza tu ritmo de produccion, los servicios mas usados y tendencias recientes.
        </p>
      </div>

      {loading ? (
        <div className="text-center text-slate-500">Cargando analitica...</div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="p-5 space-y-2">
              <div className="flex items-center gap-2 text-slate-500 text-sm font-semibold">
                <Layers className="w-4 h-4" /> Total generado
              </div>
              <div className="text-3xl font-bold text-slate-900 dark:text-white">{stats.total}</div>
              <p className="text-xs text-slate-400">Usos de herramientas</p>
            </Card>
            <Card className="p-5 space-y-2">
              <div className="flex items-center gap-2 text-slate-500 text-sm font-semibold">
                <Activity className="w-4 h-4" /> Ultimos 7 dias
              </div>
              <div className="text-3xl font-bold text-slate-900 dark:text-white">
                {stats.recent7}
              </div>
              <p className="text-xs text-slate-400">Produccion reciente</p>
            </Card>
            <Card className="p-5 space-y-2">
              <div className="flex items-center gap-2 text-slate-500 text-sm font-semibold">
                <TrendingUp className="w-4 h-4" /> Ultimos 30 dias
              </div>
              <div className="text-3xl font-bold text-slate-900 dark:text-white">
                {stats.recent30}
              </div>
              <p className="text-xs text-slate-400">Actividad mensual</p>
            </Card>
            <Card className="p-5 space-y-2">
              <div className="flex items-center gap-2 text-slate-500 text-sm font-semibold">
                <BarChart3 className="w-4 h-4" /> Top categoria
              </div>
              <div className="text-2xl font-bold text-slate-900 dark:text-white capitalize">
                {stats.topCategoryLabel}
              </div>
              <p className="text-xs text-slate-400">Segmento mas usado</p>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="p-5 space-y-2">
              <div className="text-xs font-semibold text-slate-500">Ingresos (30 dias)</div>
              <div className="text-2xl font-bold text-slate-900 dark:text-white">
                ${financeStats.income.toFixed(2)}
              </div>
              <p className="text-xs text-slate-400">Entradas recientes</p>
            </Card>
            <Card className="p-5 space-y-2">
              <div className="text-xs font-semibold text-slate-500">Gastos (30 dias)</div>
              <div className="text-2xl font-bold text-slate-900 dark:text-white">
                ${financeStats.expenses.toFixed(2)}
              </div>
              <p className="text-xs text-slate-400">Salidas recientes</p>
            </Card>
            <Card className="p-5 space-y-2">
              <div className="text-xs font-semibold text-slate-500">Balance neto</div>
              <div className="text-2xl font-bold text-slate-900 dark:text-white">
                ${financeStats.net.toFixed(2)}
              </div>
              <p className="text-xs text-slate-400">Ingresos menos gastos</p>
            </Card>
            <Card className="p-5 space-y-2">
              <div className="text-xs font-semibold text-slate-500">Pendiente por cobrar</div>
              <div className="text-2xl font-bold text-slate-900 dark:text-white">
                ${financeStats.pendingReceivable.toFixed(2)}
              </div>
              <p className="text-xs text-slate-400">Ingresos pendientes (sin limite de fecha)</p>
            </Card>
            <Card className="p-5 space-y-2">
              <div className="text-xs font-semibold text-slate-500">Pendiente por pagar</div>
              <div className="text-2xl font-bold text-slate-900 dark:text-white">
                ${financeStats.pendingPayable.toFixed(2)}
              </div>
              <p className="text-xs text-slate-400">Gastos pendientes (sin limite de fecha)</p>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <Card className="p-6 lg:col-span-2">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
                Ritmo de produccion (14 dias)
              </h3>
              <div className="grid grid-cols-7 md:grid-cols-14 gap-3 items-end">
                {trend.map((entry) => (
                  <div key={entry.label} className="flex flex-col items-center gap-2">
                    <div className="w-full h-24 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-end">
                      <div
                        className="w-full bg-brand-600 rounded-lg"
                        style={{ height: `${Math.max(8, (entry.count / entry.max) * 96)}px` }}
                      />
                    </div>
                    <span className="text-[10px] text-slate-400">{entry.label}</span>
                  </div>
                ))}
              </div>
            </Card>
            <Card className="p-6 space-y-4">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Creditos usados (14 dias)
              </h3>
              <div className="text-3xl font-bold text-slate-900 dark:text-white">
                {creditsUsedLast14}
              </div>
              <p className="text-xs text-slate-400">Suma de consumos en las ultimas 2 semanas</p>
              <p className="text-xs text-slate-400">
                {userProfile?.isSubscribed
                  ? 'Plan PRO activo · Creditos ilimitados'
                  : `Creditos disponibles: ${userProfile?.credits ?? 0}`}
              </p>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <Card className="p-6 lg:col-span-2">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
                Herramientas usadas
              </h3>
              {toolStats.length === 0 ? (
                <div className="text-sm text-slate-500">Aun no hay herramientas usadas.</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {toolStats.map((tool) => (
                    <div
                      key={tool.key}
                      className="flex items-center justify-between rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 px-3 py-2"
                    >
                      <div className="flex flex-col">
                        <span className="text-sm text-slate-600 dark:text-slate-300">{tool.label}</span>
                        <span className="text-[10px] text-slate-400">
                          {tool.changePct > 0 ? '+' : ''}{tool.changePct}% · {tool.trendLabel}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-bold text-slate-900 dark:text-white">
                          {tool.total}
                        </span>
                        <div className="text-[10px] text-slate-400">{tool.creditsUsed} cred.</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
            <Card className="p-6 space-y-3">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Uso semanal</h3>
              <div>
                <p className="text-xs text-slate-400">Cambio vs semana anterior</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  {usage.changePct}%
                </p>
                <p className="text-[10px] text-slate-400">{usage.trendLabel}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Total ultimos 7 dias</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  {usage.totalLast7}
                </p>
              </div>
            </Card>
          </div>

          <Card className="p-6">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
              Distribucion por categoria
            </h3>
            {stats.categories.length === 0 ? (
              <div className="text-sm text-slate-500">Aun no hay datos suficientes.</div>
            ) : (
              <div className="space-y-3">
                {stats.categories.map((category) => {
                  const percentage = stats.total
                    ? Math.round((category.count / stats.total) * 100)
                    : 0;
                  return (
                    <div key={category.name} className="space-y-1">
                      <div className="flex items-center justify-between text-sm text-slate-600 dark:text-slate-300">
                        <span className="capitalize">
                          {CATEGORY_LABELS[category.name] || category.name}
                        </span>
                        <span>
                          {category.count} ({percentage}%)
                        </span>
                      </div>
                      <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className="h-2 bg-brand-600 rounded-full"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </>
      )}
    </div>
  );
};
