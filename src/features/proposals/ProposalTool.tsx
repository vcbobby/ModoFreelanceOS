import React, { useState, useEffect } from 'react';
import {
  Copy,
  RefreshCw,
  Wand2,
  Briefcase,
  User,
  CheckCircle2,
  Globe,
  Hash,
  Trash2,
} from 'lucide-react';
import { Button, Card, ConfirmationModal } from '@features/shared/ui';
import { collection, doc, getDoc, setDoc, writeBatch } from 'firebase/firestore';
import { db } from '@config/firebase';
import ReactMarkdown from 'react-markdown';
import { getBackendURL } from '@config/features';
import { getAuthHeaders } from '@/services/backend/authHeaders';
import { runWithCredits } from '@/utils/credits';

interface Proposal {
  type: string;
  title: string;
  content: string;
}

interface ProposalToolProps {
  onUsage: (cost?: number) => Promise<boolean>;
  userId?: string;
}

export const ProposalTool: React.FC<ProposalToolProps> = ({ onUsage, userId }) => {
  const isE2E = import.meta.env.VITE_E2E === 'true';
  // Estados del formulario
  const [jobDescription, setJobDescription] = useState('');
  const [userProfile, setUserProfile] = useState('');
  const [platform, setPlatform] = useState('Workana');
  const [clientName, setClientName] = useState('');

  // Estados de UI
  const [isGenerating, setIsGenerating] = useState(false);
  const [proposals, setProposals] = useState<Proposal[] | null>(null);
  const [activeTab, setActiveTab] = useState<number>(0);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  // Estados de Modales (Separados para mayor estabilidad en Windows/Android)
  const [showResetModal, setShowResetModal] = useState(false);
  const [errorModal, setErrorModal] = useState({ isOpen: false, message: '' });

  const BACKEND_URL = getBackendURL();

  const getE2eKey = (id?: string) => `e2e_profile_${id || 'anon'}`;

  const formatApiError = (errData: unknown) => {
    if (!errData || typeof errData !== 'object') return 'Error en el servidor.';
    const data = errData as { detail?: unknown };
    if (!Array.isArray(data.detail)) return JSON.stringify(errData);

    const fieldLabels: Record<string, string> = {
      jobDescription: 'Descripcion del trabajo',
      userProfile: 'Tu experiencia',
      platform: 'Plataforma',
      clientName: 'Cliente',
    };

    const normalizeMessage = (msg: string) =>
      msg.replace(
        'ensure this value has at least 10 characters',
        'Debe tener al menos 10 caracteres'
      );

    const lines = data.detail
      .map((item) => {
        if (!item || typeof item !== 'object') return null;
        const entry = item as { loc?: Array<string | number>; msg?: string };
        const field = entry.loc?.[1];
        const label = typeof field === 'string' ? fieldLabels[field] || field : 'Campo';
        const msg = entry.msg ? normalizeMessage(entry.msg) : 'Valor invalido';
        return `- ${label}: ${msg}`;
      })
      .filter(Boolean);

    return lines.length ? lines.join('\n') : 'Solicitud invalida.';
  };

  // --- CARGAR PERFIL ---
  useEffect(() => {
    const loadProfile = async () => {
      if (!userId) return;
      if (isE2E) {
        const cached = localStorage.getItem(getE2eKey(userId));
        if (cached) setUserProfile(cached);
        return;
      }
      try {
        const docRef = doc(db, 'users', userId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.savedProfile) {
            setUserProfile(data.savedProfile);
          } else if (data.profile) {
            setUserProfile(data.profile);
          }
        }
      } catch (e) {
        void e;
      }
    };
    loadProfile();
  }, [isE2E, userId]);

  // --- GUARDAR PERFIL ---
  const saveProfile = async () => {
    if (!userId) return;
    if (isE2E) {
      localStorage.setItem(getE2eKey(userId), userProfile);
      return;
    }
    try {
      const docRef = doc(db, 'users', userId);
      await setDoc(docRef, { savedProfile: userProfile }, { merge: true });
    } catch (e) {
      void e;
    }
  };

  // --- FUNCIÓN DE LIMPIEZA TOTAL ---
  const handleConfirmReset = () => {
    setJobDescription('');
    setClientName('');
    setProposals(null); // <--- IMPORTANTE: Limpiamos también los resultados
    setActiveTab(0);
    setShowResetModal(false);
  };

  // --- GENERAR PROPUESTAS ---
  const handleGenerate = async () => {
    const trimmedJob = jobDescription.trim();
    const trimmedProfile = userProfile.trim();
    if (!trimmedJob || !trimmedProfile) return;
    if (trimmedJob.length < 10 || trimmedProfile.length < 10) {
      setErrorModal({
        isOpen: true,
        message: 'La descripcion del trabajo y tu experiencia deben tener al menos 10 caracteres.',
      });
      return;
    }

    setIsGenerating(true);
    setProposals(null);

    try {
      const usage = await runWithCredits(1, onUsage, async () => {
        if (isE2E) {
          return [
            {
              type: 'Formal',
              title: 'Propuesta Formal (E2E)',
              content: 'Hola, esta es una propuesta de prueba.',
            },
            {
              type: 'Corto',
              title: 'Propuesta Corta (E2E)',
              content: 'Hola, propuesta corta de prueba.',
            },
          ];
        }
        const authHeaders = await getAuthHeaders();
        let res: Response;
        try {
          res = await fetch(`${BACKEND_URL}/api/v1/proposals/generate`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              ...authHeaders,
            },
            body: JSON.stringify({
              userId: userId || 'anon',
              jobDescription: trimmedJob,
              userProfile: trimmedProfile,
              platform,
              clientName,
            }),
          });
        } catch (networkErr: unknown) {
          void networkErr;
          throw new Error(
            `No se pudo conectar al servidor (${BACKEND_URL}). Revisa que esté en ejecución y las reglas CORS.`
          );
        }

        if (!res.ok) {
          let errMsg = 'Error en el servidor';
          try {
            const errData = await res.json();
            if (errData?.detail) {
              errMsg = Array.isArray(errData.detail) ? formatApiError(errData) : errData.detail;
            } else {
              errMsg = JSON.stringify(errData);
            }
          } catch (error) {
            void error;
            // response no JSON
          }
          throw new Error(errMsg);
        }

        const data = await res.json();

        if (!data.success || !data.proposals) {
          throw new Error('La IA no devolvió propuestas válidas.');
        }

        return data.proposals as Proposal[];
      });

      if (!usage.ok || !usage.result) return;
      const newProposals = usage.result;
      setProposals(newProposals);
      setActiveTab(0);

      if (userId && !isE2E) {
        try {
          const batch = writeBatch(db);
          const historyRef = collection(db, 'users', userId, 'history');
          const now = new Date().toISOString();
          newProposals.forEach((proposal) => {
            const docRef = doc(historyRef);
            batch.set(docRef, {
              createdAt: now,
              category: 'proposal',
              type: proposal.type,
              clientName: clientName || 'Cliente',
              platform,
              content: proposal.content,
              metadata: {
                title: proposal.title,
                platform,
              },
            });
          });
          await batch.commit();
        } catch (error) {
          console.warn('No se pudieron guardar las propuestas en el historial.', error);
        }
      }
    } catch (e: unknown) {
      void e;
      setErrorModal({
        isOpen: true,
        message: `No se pudo generar la propuesta. ${
          e instanceof Error ? e.message : 'Error desconocido'
        }`,
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = (text: string, index: number) => {
    const cleanText = text
      .replace(/\*\*/g, '')
      .replace(/(\*|_)(.*?)\1/g, '$2')
      .replace(/^#+\s/gm, '')
      .trim();

    navigator.clipboard.writeText(cleanText);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  // Lógica para habilitar el botón de limpiar:
  // Si hay texto escrito O si hay propuestas visibles, se puede limpiar.
  const canClear = (!!jobDescription || !!clientName || !!proposals) && !isGenerating;

  return (
    <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 h-full items-start pb-20">
      {/* --- MODAL DE LIMPIEZA --- */}
      <ConfirmationModal
        isOpen={showResetModal}
        onClose={() => setShowResetModal(false)}
        onConfirm={handleConfirmReset}
        title="¿Nueva Propuesta?"
        message="Esto borrará la descripción del trabajo, el cliente y las propuestas generadas para empezar de cero."
        confirmText="Sí, limpiar todo"
        cancelText="Cancelar"
        isDanger={true}
      />

      {/* --- MODAL DE ERROR --- */}
      <ConfirmationModal
        isOpen={errorModal.isOpen}
        onClose={() => setErrorModal({ ...errorModal, isOpen: false })}
        onConfirm={() => setErrorModal({ ...errorModal, isOpen: false })}
        title="Ocurrió un error"
        message={errorModal.message}
        confirmText="Entendido"
        isDanger={false}
      />

      {/* COLUMNA IZQUIERDA: INPUTS */}
      <div className="flex flex-col gap-6 lg:sticky lg:top-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Wand2 className="w-6 h-6 text-brand-600" /> Generador de Propuestas
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mt-1 text-sm">
            Crea propuestas persuasivas optimizadas para cada plataforma.
          </p>
        </div>

        <Card className="p-6 flex-1 flex flex-col gap-4 shadow-xl border-t-4 border-t-brand-500 bg-white dark:bg-slate-800 border-x-0 border-b-0">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400 flex items-center gap-2">
                <Globe className="w-3 h-3" /> Plataforma
              </label>
              <select
                className="w-full p-3 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none text-sm bg-slate-50 dark:bg-slate-900 dark:text-white font-medium transition-all"
                value={platform}
                onChange={(e) => setPlatform(e.target.value)}
              >
                <option value="Workana">Workana</option>
                <option value="Upwork">Upwork</option>
                <option value="LinkedIn">LinkedIn</option>
                <option value="Freelancer">Freelancer</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400 flex items-center gap-2">
                <Hash className="w-3 h-3" /> Cliente
              </label>
              <input
                type="text"
                className="w-full p-3 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none text-sm bg-slate-50 dark:bg-slate-900 dark:text-white transition-all"
                placeholder="Nombre o Empresa"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400 flex items-center gap-2">
              <Briefcase className="w-3 h-3" /> Lo que pide el cliente
            </label>
            <textarea
              className="w-full h-32 p-3 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none resize-none text-sm bg-slate-50 dark:bg-slate-900 dark:text-white transition-all placeholder:text-slate-400"
              placeholder="Pega aquí la descripción del proyecto..."
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
            />
          </div>

          <div className="space-y-2 flex-1">
            <label className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400 flex items-center gap-2">
              <User className="w-3 h-3" /> Tu Experiencia (Se guarda auto.)
            </label>
            <textarea
              className="w-full h-24 p-3 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none resize-none text-sm bg-slate-50 dark:bg-slate-900 dark:text-white transition-all placeholder:text-slate-400"
              placeholder="Resumen de tus habilidades..."
              value={userProfile}
              onChange={(e) => setUserProfile(e.target.value)}
              onBlur={saveProfile}
            />
          </div>

          <div className="flex gap-3 mt-2">
            <button
              onClick={() => setShowResetModal(true)}
              disabled={!canClear}
              className="px-4 py-3 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 hover:border-red-200 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Limpiar todo para un nuevo trabajo"
            >
              <Trash2 className="w-5 h-5" />
            </button>

            <Button
              onClick={handleGenerate}
              isLoading={isGenerating}
              disabled={jobDescription.trim().length < 10 || userProfile.trim().length < 10}
              className="flex-1 bg-brand-600 hover:bg-brand-700 text-white h-auto py-3 font-bold shadow-lg shadow-brand-500/20"
            >
              {isGenerating ? 'Analizando...' : 'Generar Propuestas'}
            </Button>
          </div>
        </Card>
      </div>

      {/* COLUMNA DERECHA: RESULTADOS */}
      <div className="bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 flex flex-col min-h-[500px] lg:h-[calc(100vh-140px)] lg:sticky lg:top-6">
        {!proposals ? (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 text-center p-8">
            <div
              className={`w-20 h-20 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center mb-6 shadow-sm ${
                isGenerating ? 'animate-pulse' : ''
              }`}
            >
              <RefreshCw
                className={`w-10 h-10 ${
                  isGenerating
                    ? 'animate-spin text-brand-500'
                    : 'text-slate-300 dark:text-slate-600'
                }`}
              />
            </div>
            {isGenerating ? (
              <div>
                <p className="font-bold text-slate-700 dark:text-slate-200 text-lg mb-2">
                  Creando la estrategia perfecta...
                </p>
                <p className="text-sm text-slate-500">
                  Analizando keywords y estructura persuasiva.
                </p>
              </div>
            ) : (
              <div>
                <p className="font-medium mb-1">Tu lienzo está vacío</p>
                <p className="text-sm opacity-70">
                  Completa los datos a la izquierda para comenzar.
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col h-full animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex p-1 bg-slate-200 dark:bg-slate-800 rounded-xl mb-4 shrink-0">
              {proposals.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveTab(idx)}
                  className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all ${
                    activeTab === idx
                      ? 'bg-white dark:bg-slate-700 text-brand-600 dark:text-white shadow-sm ring-1 ring-black/5 dark:ring-white/10'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                  }`}
                >
                  {p.type}
                </button>
              ))}
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 -mr-2">
              <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl p-6 shadow-sm">
                <h3 className="font-bold text-xl text-slate-900 dark:text-white mb-6 pb-4 border-b border-slate-100 dark:border-slate-700">
                  {proposals[activeTab].title}
                </h3>

                <div className="prose prose-slate dark:prose-invert prose-sm max-w-none text-slate-600 dark:text-slate-300 leading-relaxed">
                  <ReactMarkdown
                    components={{
                      p: ({ node: _node, ...props }) => <p className="mb-4 last:mb-0" {...props} />,
                      ul: ({ node: _node, ...props }) => (
                        <ul
                          className="list-disc pl-4 mb-4 space-y-2 bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl"
                          {...props}
                        />
                      ),
                      li: ({ node: _node, ...props }) => <li className="pl-1" {...props} />,
                      strong: ({ node: _node, ...props }) => (
                        <strong className="font-bold text-slate-900 dark:text-white" {...props} />
                      ),
                    }}
                  >
                    {proposals[activeTab].content}
                  </ReactMarkdown>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-end shrink-0">
              <Button
                variant="outline"
                onClick={() => copyToClipboard(proposals[activeTab].content, activeTab)}
                className="w-full sm:w-auto"
              >
                {copiedIndex === activeTab ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 mr-2 text-green-600" />
                    ¡Copiado!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 mr-2" />
                    Copiar Texto
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
