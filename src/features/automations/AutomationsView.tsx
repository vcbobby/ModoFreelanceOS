import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
} from 'firebase/firestore';
import { Plus, Trash2, Workflow } from 'lucide-react';
import { db } from '@config/firebase';
import { Button, Card, ConfirmationModal } from '@features/shared/ui';
import { getBackendURL } from '@config/features';
import { getAuthHeaders } from '@/services/backend/authHeaders';

interface AutomationsViewProps {
  userId?: string;
}

interface AutomationRule {
  id: string;
  name: string;
  trigger: string;
  action: string;
  actionType?: string;
  target?: string;
  message?: string;
  schedule: string;
  enabled: boolean;
  createdAt?: { toMillis?: () => number } | string;
  lastRunAt?: { toMillis?: () => number } | string;
  lastRunStatus?: string;
  lastRunJobId?: string;
  lastRunError?: string;
  retryAttempts?: number;
  retryBaseDelay?: number;
  retryJitter?: number;
}

const actionTypes = [
  { value: 'notify', label: 'Notificacion interna' },
  { value: 'email', label: 'Correo' },
  { value: 'whatsapp', label: 'WhatsApp' },
  { value: 'task', label: 'Crear tarea' },
];

const templates = [
  {
    label: 'Recordatorio de cobros',
    name: 'Recordatorio de cobros',
    trigger: 'Cada lunes',
    action: 'Enviar recordatorio a clientes con facturas pendientes',
    actionType: 'email',
    target: 'Clientes con pendientes',
    message: 'Hola, recuerda ponerte al dia con la factura pendiente.',
    schedule: 'Semanal',
  },
  {
    label: 'Seguimiento de propuestas',
    name: 'Seguimiento de propuestas',
    trigger: '3 dias despues de enviar propuesta',
    action: 'Enviar mensaje de seguimiento',
    actionType: 'whatsapp',
    target: 'Prospectos activos',
    message: 'Hola, queria confirmar si pudiste revisar mi propuesta.',
    schedule: 'Unica vez',
  },
  {
    label: 'Reporte semanal',
    name: 'Reporte semanal',
    trigger: 'Cada viernes',
    action: 'Generar resumen semanal',
    actionType: 'notify',
    target: 'Panel principal',
    message: 'Resumen semanal listo para revisar.',
    schedule: 'Semanal',
  },
];

const formatRunAt = (value?: AutomationRule['lastRunAt']) => {
  if (!value) return 'Nunca';
  if (typeof value === 'string') {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? 'Nunca' : date.toLocaleDateString();
  }
  if (value?.toMillis) return new Date(value.toMillis()).toLocaleDateString();
  return 'Nunca';
};

const formatStatus = (status?: string) => {
  const normalized = status || 'never';
  const labelMap: Record<string, string> = {
    never: 'Sin ejecutar',
    queued: 'En cola',
    started: 'En proceso',
    finished: 'Completada',
    ok: 'Completada',
    failed: 'Fallida',
    error: 'Error',
    timeout: 'Timeout',
    deferred: 'Diferida',
    canceled: 'Cancelada',
    stopped: 'Detenida',
  };
  const colorMap: Record<string, string> = {
    never: 'bg-slate-100 text-slate-500',
    queued: 'bg-amber-100 text-amber-700',
    started: 'bg-blue-100 text-blue-700',
    finished: 'bg-emerald-100 text-emerald-700',
    ok: 'bg-emerald-100 text-emerald-700',
    failed: 'bg-red-100 text-red-700',
    error: 'bg-red-100 text-red-700',
    timeout: 'bg-orange-100 text-orange-700',
    deferred: 'bg-slate-100 text-slate-500',
    canceled: 'bg-slate-100 text-slate-500',
    stopped: 'bg-slate-100 text-slate-500',
  };
  return {
    label: labelMap[normalized] || normalized,
    color: colorMap[normalized] || 'bg-slate-100 text-slate-500',
  };
};

export const AutomationsView: React.FC<AutomationsViewProps> = ({ userId }) => {
  const BACKEND_URL = getBackendURL();
  const [rules, setRules] = useState<AutomationRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [trigger, setTrigger] = useState('');
  const [action, setAction] = useState('');
  const [actionType, setActionType] = useState('notify');
  const [target, setTarget] = useState('');
  const [message, setMessage] = useState('');
  const [schedule, setSchedule] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [runningId, setRunningId] = useState<string | null>(null);
  const pollingJobsRef = useRef<Map<string, number>>(new Map());
  const [selectedRule, setSelectedRule] = useState<AutomationRule | null>(null);
  const [jobSummary, setJobSummary] = useState<{
    status?: string;
    result?: { success?: boolean; status?: string; error?: string };
  } | null>(null);
  const [jobLoading, setJobLoading] = useState(false);
  const [copyToast, setCopyToast] = useState<string | null>(null);
  const [retrySettings, setRetrySettings] = useState({
    attempts: 3,
    baseDelay: 1,
    jitter: 0.5,
  });
  const [retryLastSaved, setRetryLastSaved] = useState<string | null>(null);
  const [overrideSettings, setOverrideSettings] = useState({
    enabled: false,
    attempts: 3,
    baseDelay: 1,
    jitter: 0.5,
  });
  const overrideValidation = useMemo(() => {
    if (!overrideSettings.enabled) {
      return { attempts: '', baseDelay: '', jitter: '', hasErrors: false };
    }

    const attemptsError =
      overrideSettings.attempts < 1 || overrideSettings.attempts > 10
        ? 'Usa un valor entre 1 y 10.'
        : '';
    const baseDelayError = overrideSettings.baseDelay < 0.1 ? 'Minimo 0.1s.' : '';
    const jitterError = overrideSettings.jitter < 0 ? 'Minimo 0s.' : '';
    return {
      attempts: attemptsError,
      baseDelay: baseDelayError,
      jitter: jitterError,
      hasErrors: Boolean(attemptsError || baseDelayError || jitterError),
    };
  }, [overrideSettings]);
  const [modal, setModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  const copyToClipboard = async (value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopyToast('Copiado al portapapeles');
      setTimeout(() => setCopyToast(null), 2000);
    } catch (error) {
      void error;
    }
  };

  const fetchRetryDefaults = async () => {
    const authHeaders = await getAuthHeaders();
    const res = await fetch(`${BACKEND_URL}/api/v1/automations/defaults`, {
      headers: authHeaders,
    });
    if (!res.ok) {
      throw new Error('No se pudieron cargar los defaults');
    }
    const data = (await res.json()) as {
      defaults?: { attempts?: number; baseDelay?: number; jitter?: number };
    };
    return data.defaults || { attempts: 3, baseDelay: 1, jitter: 0.5 };
  };

  const loadRetrySettings = async () => {
    if (!userId) return;
    try {
      const docRef = doc(db, 'users', userId, 'automation_settings', 'retry');
      const snap = await getDoc(docRef);
      if (!snap.exists()) {
        const defaults = await fetchRetryDefaults();
        setRetrySettings({
          attempts: Number(defaults.attempts ?? 3),
          baseDelay: Number(defaults.baseDelay ?? 1),
          jitter: Number(defaults.jitter ?? 0.5),
        });
        await setDoc(
          docRef,
          {
            attempts: Number(defaults.attempts ?? 3),
            baseDelay: Number(defaults.baseDelay ?? 1),
            jitter: Number(defaults.jitter ?? 0.5),
            updatedAt: serverTimestamp(),
          },
          { merge: true }
        );
        setRetryLastSaved(new Date().toLocaleString());
        return;
      }
      const parsed = snap.data() as {
        attempts?: number;
        baseDelay?: number;
        jitter?: number;
        updatedAt?: { toMillis?: () => number };
      };
      setRetrySettings({
        attempts: Number(parsed.attempts ?? 3),
        baseDelay: Number(parsed.baseDelay ?? 1),
        jitter: Number(parsed.jitter ?? 0.5),
      });
      if (parsed.updatedAt?.toMillis) {
        setRetryLastSaved(new Date(parsed.updatedAt.toMillis()).toLocaleString());
      }
    } catch (error) {
      void error;
    }
  };

  const saveRetrySettings = async () => {
    if (!userId) return;
    await setDoc(
      doc(db, 'users', userId, 'automation_settings', 'retry'),
      {
        attempts: retrySettings.attempts,
        baseDelay: retrySettings.baseDelay,
        jitter: retrySettings.jitter,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
    setRetryLastSaved(new Date().toLocaleString());
    setCopyToast('Configuracion guardada');
    setTimeout(() => setCopyToast(null), 2000);
  };

  useEffect(() => {
    if (!userId) return;
    void loadRetrySettings();
    const baseRef = collection(db, 'users', userId, 'automations');
    const q = query(baseRef, orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const nextRules = snapshot.docs.map(
          (docSnap) =>
            ({
              id: docSnap.id,
              ...(docSnap.data() as Omit<AutomationRule, 'id'>),
            }) as AutomationRule
        );
        setRules(nextRules);
        setLoading(false);
      },
      () => setLoading(false)
    );

    return () => unsubscribe();
  }, [userId]);

  const activeCount = useMemo(() => rules.filter((rule) => rule.enabled).length, [rules]);

  const handleTemplateSelect = (value: string) => {
    const template = templates.find((item) => item.label === value);
    if (!template) return;
    setName(template.name);
    setTrigger(template.trigger);
    setAction(template.action);
    setActionType(template.actionType || 'notify');
    setTarget(template.target || '');
    setMessage(template.message || '');
    setSchedule(template.schedule);
  };

  const handleCreate = async () => {
    if (!userId || !name.trim() || !trigger.trim() || !action.trim()) return;
    setIsSaving(true);
    try {
      await addDoc(collection(db, 'users', userId, 'automations'), {
        name: name.trim(),
        trigger: trigger.trim(),
        action: action.trim(),
        actionType,
        target: target.trim() || null,
        message: message.trim() || null,
        schedule: schedule.trim() || 'Manual',
        enabled: true,
        createdAt: serverTimestamp(),
        lastRunStatus: 'never',
      });
      setName('');
      setTrigger('');
      setAction('');
      setActionType('notify');
      setTarget('');
      setMessage('');
      setSchedule('');
    } finally {
      setIsSaving(false);
    }
  };

  const toggleRule = async (rule: AutomationRule) => {
    if (!userId) return;
    await updateDoc(doc(db, 'users', userId, 'automations', rule.id), {
      enabled: !rule.enabled,
    });
  };

  const pollJobStatus = async (ruleId: string, jobId: string) => {
    if (!userId) return;
    const maxAttempts = 20;
    const intervalMs = 3000;
    const attempts = pollingJobsRef.current.get(jobId) ?? 0;

    if (attempts >= maxAttempts) {
      pollingJobsRef.current.delete(jobId);
      await updateDoc(doc(db, 'users', userId, 'automations', ruleId), {
        lastRunStatus: 'timeout',
      });
      return;
    }

    try {
      const authHeaders = await getAuthHeaders();
      const res = await fetch(`${BACKEND_URL}/api/v1/automations/jobs/${jobId}`, {
        headers: authHeaders,
      });

      if (!res.ok) {
        throw new Error('Error consultando estado');
      }

      const data = (await res.json()) as {
        job?: {
          status?: string;
          result?: { success?: boolean; status?: string; error?: string };
        };
      };
      const status = data.job?.status || 'unknown';
      const resultStatus = data.job?.result?.status;
      const success = data.job?.result?.success;
      const resultError = data.job?.result?.error;

      if (['finished', 'failed', 'canceled', 'stopped', 'deferred'].includes(status)) {
        pollingJobsRef.current.delete(jobId);
        const finalStatus =
          status === 'finished' ? resultStatus || (success === false ? 'error' : 'ok') : status;
        await updateDoc(doc(db, 'users', userId, 'automations', ruleId), {
          lastRunStatus: finalStatus,
          lastRunError: resultError || null,
        });
        return;
      }

      pollingJobsRef.current.set(jobId, attempts + 1);
      setTimeout(() => {
        void pollJobStatus(ruleId, jobId);
      }, intervalMs);
    } catch (error) {
      pollingJobsRef.current.delete(jobId);
      await updateDoc(doc(db, 'users', userId, 'automations', ruleId), {
        lastRunStatus: 'error',
        lastRunError: 'Error consultando el estado del job.',
      });
      void error;
    }
  };

  const fetchJobSummary = async (jobId: string) => {
    if (!userId) return;
    setJobLoading(true);
    try {
      const authHeaders = await getAuthHeaders();
      const res = await fetch(`${BACKEND_URL}/api/v1/automations/jobs/${jobId}`, {
        headers: authHeaders,
      });
      if (!res.ok) {
        throw new Error('Error consultando job');
      }
      const data = (await res.json()) as { job?: { status?: string; result?: unknown } };
      setJobSummary({
        status: data.job?.status,
        result: data.job?.result as {
          success?: boolean;
          status?: string;
          error?: string;
        },
      });
    } catch (error) {
      setJobSummary({ status: 'error', result: { success: false, error: 'No disponible' } });
      void error;
    } finally {
      setJobLoading(false);
    }
  };

  const runRuleNow = async (rule: AutomationRule) => {
    if (!userId) return;
    setRunningId(rule.id);
    try {
      const authHeaders = await getAuthHeaders();
      const res = await fetch(`${BACKEND_URL}/api/v1/automations/run`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders,
        },
        body: JSON.stringify({
          userId,
          automationId: rule.id,
          name: rule.name,
          trigger: rule.trigger,
          action: rule.action,
          actionType: rule.actionType || 'notify',
          target: rule.target || '',
          message: rule.message || '',
          schedule: rule.schedule,
          retryAttempts: rule.retryAttempts ?? retrySettings.attempts,
          retryBaseDelay: rule.retryBaseDelay ?? retrySettings.baseDelay,
          retryJitter: rule.retryJitter ?? retrySettings.jitter,
        }),
      });

      if (!res.ok) {
        let errMsg = 'Error en el servidor';
        try {
          const errData = await res.json();
          errMsg = errData.detail || JSON.stringify(errData);
        } catch (parseErr) {
          void parseErr;
        }
        throw new Error(errMsg);
      }

      const data = (await res.json()) as { job_id?: string; status?: string };

      await updateDoc(doc(db, 'users', userId, 'automations', rule.id), {
        lastRunAt: serverTimestamp(),
        lastRunStatus: data.status || 'queued',
        lastRunJobId: data.job_id || null,
        lastRunError: null,
      });

      if (data.job_id) {
        pollingJobsRef.current.set(data.job_id, 0);
        void pollJobStatus(rule.id, data.job_id);
      }
    } catch (error) {
      await updateDoc(doc(db, 'users', userId, 'automations', rule.id), {
        lastRunAt: serverTimestamp(),
        lastRunStatus: 'error',
        lastRunError: 'No se pudo ejecutar la automatizacion.',
      });
      void error;
    } finally {
      setRunningId(null);
    }
  };

  useEffect(() => {
    if (!userId) return;
    rules.forEach((rule) => {
      const jobId = rule.lastRunJobId;
      if (!jobId) return;
      if (!['queued', 'started'].includes(rule.lastRunStatus || '')) return;
      if (pollingJobsRef.current.has(jobId)) return;
      pollingJobsRef.current.set(jobId, 0);
      void pollJobStatus(rule.id, jobId);
    });
  }, [rules, userId]);

  useEffect(() => {
    if (!selectedRule?.lastRunJobId) {
      setJobSummary(null);
      return;
    }
    void fetchJobSummary(selectedRule.lastRunJobId);
  }, [selectedRule?.lastRunJobId]);

  useEffect(() => {
    if (!selectedRule) return;
    const enabled =
      selectedRule.retryAttempts != null ||
      selectedRule.retryBaseDelay != null ||
      selectedRule.retryJitter != null;
    setOverrideSettings({
      enabled,
      attempts: selectedRule.retryAttempts ?? retrySettings.attempts,
      baseDelay: selectedRule.retryBaseDelay ?? retrySettings.baseDelay,
      jitter: selectedRule.retryJitter ?? retrySettings.jitter,
    });
  }, [selectedRule, retrySettings]);

  const saveOverrideSettings = async () => {
    if (!userId || !selectedRule) return;
    if (overrideSettings.enabled && overrideValidation.hasErrors) return;
    await updateDoc(doc(db, 'users', userId, 'automations', selectedRule.id), {
      retryAttempts: overrideSettings.enabled ? overrideSettings.attempts : null,
      retryBaseDelay: overrideSettings.enabled ? overrideSettings.baseDelay : null,
      retryJitter: overrideSettings.enabled ? overrideSettings.jitter : null,
    });
    setCopyToast('Override guardado');
    setTimeout(() => setCopyToast(null), 2000);
  };

  const confirmDelete = (id: string) => {
    setModal({
      isOpen: true,
      title: 'Eliminar automatizacion',
      message: 'Esta accion eliminara la regla de tu lista.',
      onConfirm: async () => {
        if (!userId) return;
        await deleteDoc(doc(db, 'users', userId, 'automations', id));
        setModal((prev) => ({ ...prev, isOpen: false }));
      },
    });
  };

  return (
    <div className="max-w-6xl mx-auto pb-20 space-y-8">
      <div className="text-center">
        <div className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full text-xs font-bold">
          <Workflow className="w-4 h-4" /> Automatizaciones
        </div>
        <h2 className="text-3xl font-bold text-slate-900 dark:text-white mt-3">
          Automatiza tareas repetitivas
        </h2>
        <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto mt-2">
          Crea reglas simples para que ModoFreelanceOS haga seguimiento, recordatorios y reportes
          por ti.
        </p>
      </div>

      <Card className="p-6 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Tu stack de reglas</h3>
            <p className="text-sm text-slate-500">
              {activeCount} activas de {rules.length} creadas
            </p>
          </div>
          <select
            onChange={(event) => handleTemplateSelect(event.target.value)}
            className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
            defaultValue=""
          >
            <option value="" disabled>
              Plantillas rapidas
            </option>
            {templates.map((item) => (
              <option key={item.label} value={item.label}>
                {item.label}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
            placeholder="Nombre de la automatizacion"
          />
          <select
            value={actionType}
            onChange={(event) => setActionType(event.target.value)}
            className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
          >
            {actionTypes.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
          <input
            value={trigger}
            onChange={(event) => setTrigger(event.target.value)}
            className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
            placeholder="Disparador (ej: cada lunes)"
          />
          <input
            value={target}
            onChange={(event) => setTarget(event.target.value)}
            className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
            placeholder="Objetivo o audiencia (opcional)"
          />
          <input
            value={action}
            onChange={(event) => setAction(event.target.value)}
            className="md:col-span-2 w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
            placeholder="Accion (ej: enviar recordatorio)"
          />
          <textarea
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            className="md:col-span-2 w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white min-h-[96px]"
            placeholder="Mensaje o plantilla (opcional)"
          />
          <div className="md:col-span-2 flex flex-col md:flex-row gap-3">
            <input
              value={schedule}
              onChange={(event) => setSchedule(event.target.value)}
              className="flex-1 px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
              placeholder="Frecuencia o ventana (opcional)"
            />
            <Button
              onClick={handleCreate}
              disabled={isSaving || !name.trim() || !trigger.trim() || !action.trim()}
              className="px-5"
            >
              Guardar regla
            </Button>
          </div>
        </div>
      </Card>

      <Card className="p-6 space-y-4">
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            Configuracion de reintentos
          </h3>
          <p className="text-sm text-slate-500">
            Estos valores se enviaran al backend en cada ejecucion manual.
          </p>
          {retryLastSaved && (
            <p className="text-xs text-slate-400 mt-1">Ultimo guardado: {retryLastSaved}</p>
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-xs font-bold uppercase text-slate-500">Intentos</label>
            <input
              type="number"
              min={1}
              max={10}
              value={retrySettings.attempts}
              onChange={(event) =>
                setRetrySettings((prev) => ({
                  ...prev,
                  attempts: Number(event.target.value),
                }))
              }
              className="w-full mt-1 p-3 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
            />
          </div>
          <div>
            <label className="text-xs font-bold uppercase text-slate-500">Delay base (s)</label>
            <input
              type="number"
              min={0.1}
              step={0.1}
              value={retrySettings.baseDelay}
              onChange={(event) =>
                setRetrySettings((prev) => ({
                  ...prev,
                  baseDelay: Number(event.target.value),
                }))
              }
              className="w-full mt-1 p-3 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
            />
          </div>
          <div>
            <label className="text-xs font-bold uppercase text-slate-500">Jitter (s)</label>
            <input
              type="number"
              min={0}
              step={0.1}
              value={retrySettings.jitter}
              onChange={(event) =>
                setRetrySettings((prev) => ({
                  ...prev,
                  jitter: Number(event.target.value),
                }))
              }
              className="w-full mt-1 p-3 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
            />
          </div>
        </div>
        <div className="flex justify-end">
          <Button onClick={saveRetrySettings} className="px-6">
            Guardar ajustes
          </Button>
        </div>
      </Card>

      {loading ? (
        <div className="text-center text-slate-500">Cargando automatizaciones...</div>
      ) : rules.length === 0 ? (
        <Card className="p-8 text-center text-slate-500">
          Aun no tienes reglas activas. Crea tu primera automatizacion arriba.
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {rules.map((rule) => {
            const statusDisplay = formatStatus(rule.lastRunStatus);
            const overrideActive =
              rule.retryAttempts != null || rule.retryBaseDelay != null || rule.retryJitter != null;
            return (
              <Card key={rule.id} className="p-5 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h4 className="text-lg font-bold text-slate-900 dark:text-white">
                      {rule.name}
                    </h4>
                    <p className="text-sm text-slate-500">Trigger: {rule.trigger}</p>
                    <p className="text-xs text-slate-400 mt-1">
                      Tipo: {rule.actionType || 'notify'} · Objetivo: {rule.target || 'General'}
                    </p>
                  </div>
                  <button
                    onClick={() => confirmDelete(rule.id)}
                    className="text-slate-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-300">Accion: {rule.action}</p>
                {rule.message && <p className="text-xs text-slate-500">Mensaje: {rule.message}</p>}
                <div className="flex flex-col gap-2 text-xs text-slate-400">
                  <div className="flex items-center justify-between">
                    <span>Frecuencia: {rule.schedule}</span>
                    <span>Ultima ejecucion: {formatRunAt(rule.lastRunAt)}</span>
                  </div>
                  {rule.lastRunJobId && (
                    <div className="flex items-center justify-between">
                      <span>Job: {rule.lastRunJobId}</span>
                    </div>
                  )}
                  {rule.lastRunError && (
                    <div className="text-xs text-red-500">Error: {rule.lastRunError}</div>
                  )}
                  <div className="flex items-center justify-between">
                    <span
                      className={`px-2 py-1 rounded-full font-semibold text-[10px] uppercase ${statusDisplay.color}`}
                    >
                      {statusDisplay.label}
                    </span>
                    <span className="text-[10px] text-slate-500">
                      Reintentos: {overrideActive ? 'Personalizado' : 'Global'}
                    </span>
                    <button
                      onClick={() => setSelectedRule(rule)}
                      className="px-3 py-1 rounded-full font-semibold bg-slate-100 text-slate-600"
                    >
                      Detalles
                    </button>
                    <button
                      onClick={() => toggleRule(rule)}
                      className={`px-3 py-1 rounded-full font-semibold transition-colors ${
                        rule.enabled
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {rule.enabled ? 'Activa' : 'Pausada'}
                    </button>
                    <button
                      onClick={() => runRuleNow(rule)}
                      disabled={!rule.enabled || runningId === rule.id}
                      className="px-3 py-1 rounded-full font-semibold bg-slate-900 text-white disabled:opacity-50"
                    >
                      {runningId === rule.id ? 'Ejecutando...' : 'Ejecutar ahora'}
                    </button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <ConfirmationModal
        isOpen={modal.isOpen}
        onClose={() => setModal((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={modal.onConfirm}
        title={modal.title}
        message={modal.message}
        confirmText="Eliminar"
        cancelText="Cancelar"
        isDanger={true}
      />

      {selectedRule && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setSelectedRule(null)}></div>
          <Card className="relative w-full max-w-lg p-6 space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Detalle de ejecucion
                </h3>
                <p className="text-sm text-slate-500">{selectedRule.name}</p>
              </div>
              <button
                onClick={() => setSelectedRule(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                Cerrar
              </button>
            </div>

            <div className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
              <div>
                <span className="font-semibold">Job ID:</span> {selectedRule.lastRunJobId || 'N/A'}
              </div>
              {selectedRule.lastRunJobId && (
                <button
                  onClick={() => copyToClipboard(selectedRule.lastRunJobId || '')}
                  className="text-xs text-brand-600 hover:text-brand-700"
                >
                  Copiar Job ID
                </button>
              )}
              {selectedRule.lastRunJobId && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">Estado del job:</span>
                    <button
                      onClick={() => fetchJobSummary(selectedRule.lastRunJobId || '')}
                      className="text-xs text-brand-600 hover:text-brand-700"
                    >
                      {jobLoading ? 'Actualizando...' : 'Actualizar'}
                    </button>
                  </div>
                  <div className="text-xs text-slate-500">{jobSummary?.status || 'Sin datos'}</div>
                  {jobSummary?.result && (
                    <div className="flex items-center gap-2 text-xs">
                      <span
                        className={`px-2 py-0.5 rounded-full font-semibold uppercase ${
                          jobSummary.result.success === false
                            ? 'bg-red-100 text-red-700'
                            : 'bg-emerald-100 text-emerald-700'
                        }`}
                      >
                        {jobSummary.result.success === false ? 'Fallido' : 'Exitoso'}
                      </span>
                      {jobSummary.result.status && (
                        <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">
                          {jobSummary.result.status}
                        </span>
                      )}
                    </div>
                  )}
                  {jobSummary?.result?.error && (
                    <div className="text-xs text-red-500">{jobSummary.result.error}</div>
                  )}
                </div>
              )}
              <div>
                <span className="font-semibold">Estado:</span>{' '}
                {formatStatus(selectedRule.lastRunStatus).label}
              </div>
              <div>
                <span className="font-semibold">Ultima ejecucion:</span>{' '}
                {formatRunAt(selectedRule.lastRunAt)}
              </div>
              {selectedRule.lastRunError && (
                <div className="text-red-500">
                  <span className="font-semibold">Error:</span> {selectedRule.lastRunError}
                </div>
              )}
            </div>

            <div className="border-t border-slate-200 dark:border-slate-700 pt-4 space-y-2 text-sm">
              <div>
                <span className="font-semibold">Tipo:</span> {selectedRule.actionType || 'notify'}
              </div>
              <div>
                <span className="font-semibold">Objetivo:</span> {selectedRule.target || 'General'}
              </div>
              <div>
                <span className="font-semibold">Accion:</span> {selectedRule.action}
              </div>
              {selectedRule.message && (
                <div>
                  <span className="font-semibold">Mensaje:</span> {selectedRule.message}
                </div>
              )}
              <div>
                <span className="font-semibold">Frecuencia:</span> {selectedRule.schedule}
              </div>
              <div>
                <span className="font-semibold">Trigger:</span> {selectedRule.trigger}
              </div>
              <div className="border-t border-slate-200 dark:border-slate-700 pt-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-semibold">Override de reintentos</span>
                  <label className="flex items-center gap-2 text-xs text-slate-500">
                    <input
                      type="checkbox"
                      checked={overrideSettings.enabled}
                      onChange={(event) =>
                        setOverrideSettings((prev) => ({
                          ...prev,
                          enabled: event.target.checked,
                        }))
                      }
                    />
                    Activar
                  </label>
                </div>
                {!overrideSettings.enabled && (
                  <div
                    className="text-xs text-slate-400"
                    title={`Defaults globales: ${retrySettings.attempts} intentos, ${retrySettings.baseDelay}s base, ${retrySettings.jitter}s jitter.`}
                  >
                    Usando defaults globales
                  </div>
                )}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <input
                      type="number"
                      min={1}
                      max={10}
                      disabled={!overrideSettings.enabled}
                      value={overrideSettings.attempts}
                      onChange={(event) =>
                        setOverrideSettings((prev) => ({
                          ...prev,
                          attempts: Number(event.target.value),
                        }))
                      }
                      className="w-full p-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white disabled:opacity-50"
                      placeholder="Intentos"
                    />
                    {overrideValidation.attempts && (
                      <p className="text-[11px] text-red-500">{overrideValidation.attempts}</p>
                    )}
                  </div>
                  <div className="space-y-1">
                    <input
                      type="number"
                      min={0.1}
                      step={0.1}
                      disabled={!overrideSettings.enabled}
                      value={overrideSettings.baseDelay}
                      onChange={(event) =>
                        setOverrideSettings((prev) => ({
                          ...prev,
                          baseDelay: Number(event.target.value),
                        }))
                      }
                      className="w-full p-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white disabled:opacity-50"
                      placeholder="Base"
                    />
                    {overrideValidation.baseDelay && (
                      <p className="text-[11px] text-red-500">{overrideValidation.baseDelay}</p>
                    )}
                  </div>
                  <div className="space-y-1">
                    <input
                      type="number"
                      min={0}
                      step={0.1}
                      disabled={!overrideSettings.enabled}
                      value={overrideSettings.jitter}
                      onChange={(event) =>
                        setOverrideSettings((prev) => ({
                          ...prev,
                          jitter: Number(event.target.value),
                        }))
                      }
                      className="w-full p-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white disabled:opacity-50"
                      placeholder="Jitter"
                    />
                    {overrideValidation.jitter && (
                      <p className="text-[11px] text-red-500">{overrideValidation.jitter}</p>
                    )}
                  </div>
                </div>
                <div className="flex justify-end">
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() =>
                        setOverrideSettings({
                          enabled: false,
                          attempts: retrySettings.attempts,
                          baseDelay: retrySettings.baseDelay,
                          jitter: retrySettings.jitter,
                        })
                      }
                      className="px-3 py-2 text-xs font-semibold rounded-full bg-slate-100 text-slate-600"
                    >
                      Restablecer global
                    </button>
                    <Button
                      onClick={saveOverrideSettings}
                      className="px-4"
                      disabled={overrideValidation.hasErrors}
                    >
                      Guardar override
                    </Button>
                  </div>
                </div>
              </div>
              {['failed', 'error'].includes(selectedRule.lastRunStatus || '') && (
                <button
                  onClick={() => runRuleNow(selectedRule)}
                  disabled={runningId === selectedRule.id}
                  className="text-xs text-brand-600 hover:text-brand-700 disabled:opacity-50"
                >
                  {runningId === selectedRule.id ? 'Reintentando...' : 'Reintentar ejecucion'}
                </button>
              )}
              <button
                onClick={() =>
                  copyToClipboard(
                    JSON.stringify(
                      {
                        id: selectedRule.id,
                        name: selectedRule.name,
                        actionType: selectedRule.actionType,
                        target: selectedRule.target,
                        message: selectedRule.message,
                        action: selectedRule.action,
                        schedule: selectedRule.schedule,
                        trigger: selectedRule.trigger,
                        lastRunStatus: selectedRule.lastRunStatus,
                        lastRunJobId: selectedRule.lastRunJobId,
                        lastRunError: selectedRule.lastRunError,
                      },
                      null,
                      2
                    )
                  )
                }
                className="text-xs text-brand-600 hover:text-brand-700"
              >
                Copiar payload
              </button>
            </div>
          </Card>
        </div>
      )}

      {copyToast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[90] bg-slate-900 text-white text-xs px-4 py-2 rounded-full shadow-lg">
          {copyToast}
        </div>
      )}
    </div>
  );
};
