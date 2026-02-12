import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  X,
  Send,
  Sparkles,
  Maximize2,
  Minimize2,
  Trash2,
  AlertTriangle,
  MessageSquare,
  Loader2,
  RefreshCw,
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import {
  collection,
  query,
  where,
  getDocs,
  orderBy,
  limit,
  addDoc,
  serverTimestamp,
  doc,
  getDoc,
} from 'firebase/firestore';
import { db } from '@config/firebase';
import { chatWithAssistant, ingestAssistantDocuments } from '@features/shared/services';
import { getBackendURL } from '@config/features';
import { getAuthHeaders } from '@/services/backend/authHeaders';
import { runWithCredits } from '@/utils/credits';

// --- CONSTANTES ---
const BACKEND_URL = getBackendURL();

const FREENCY_AVATAR =
  'https://api.dicebear.com/9.x/bottts-neutral/svg?seed=Freency&backgroundColor=6366f1&eyes=bulging&mouth=smile01';

const INGEST_TTL_MS = 6 * 60 * 60 * 1000;

const SUGGESTED_QUESTIONS = [
  '¿Cómo van mis finanzas?',
  'Busca trabajos remotos de React',
  'Enséñame sobre Marketing Digital (Curso)',
];

// --- MODAL DE BORRADO (Sin cambios) ---
interface DeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const DeleteConfirmationModal: React.FC<DeleteModalProps> = ({ isOpen, onClose, onConfirm }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 font-sans">
      <div
        className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      ></div>
      <div className="relative w-full max-w-sm bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="bg-slate-900 p-3 flex justify-between items-center text-white">
          <span className="text-xs font-bold uppercase tracking-wide flex items-center gap-2">
            <AlertTriangle className="w-3 h-3 text-orange-400" />
            Confirmar Acción
          </span>
          <button onClick={onClose} className="hover:text-red-400 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-6 text-center">
          <div className="w-12 h-12 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Trash2 className="w-6 h-6 text-red-500" />
          </div>
          <h3 className="text-slate-800 dark:text-white font-bold mb-2">¿Borrar historial?</h3>
          <div className="flex gap-3 justify-center mt-4">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-sm bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
            >
              Cancelar
            </button>
            <button
              onClick={() => {
                onConfirm();
                onClose();
              }}
              className="px-4 py-2 rounded-lg text-sm bg-red-600 text-white hover:bg-red-700"
            >
              Sí, borrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

interface AIAssistantProps {
  userId?: string;
  onUsage: (cost: number) => Promise<boolean>;
}

export const AIAssistant: React.FC<AIAssistantProps> = ({ userId, onUsage }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isReindexing, setIsReindexing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [messages, setMessages] = useState<{ role: 'user' | 'model'; text: string }[]>(() => {
    const saved = localStorage.getItem(`chat_history_${userId}`);
    return saved ? JSON.parse(saved) : [];
  });

  const [contextData, setContextData] = useState({
    finances: '',
    agenda: '',
    notes: '',
    history: '',
    portfolio: '', // NUEVO: Datos del sitio web
    knowledgeBase: '',
    currentTime: '',
    currentDate: '',
  });

  useEffect(() => {
    if (userId) localStorage.setItem(`chat_history_${userId}`, JSON.stringify(messages));
  }, [messages, userId]);

  const confirmClearHistory = () => {
    setMessages([]);
    localStorage.removeItem(`chat_history_${userId}`);
  };

  const buildIngestDocuments = useCallback(
    (data: typeof contextData) =>
      [
        { id: 'context-finances', text: data.finances, source: 'finances' },
        { id: 'context-agenda', text: data.agenda, source: 'agenda' },
        { id: 'context-notes', text: data.notes, source: 'notes' },
        { id: 'context-history', text: data.history, source: 'history' },
        { id: 'context-portfolio', text: data.portfolio, source: 'portfolio' },
        { id: 'context-knowledge', text: data.knowledgeBase, source: 'knowledge_base' },
      ].filter((doc) => doc.text && doc.text.trim().length > 0),
    []
  );

  // --- CARGA DE CONTEXTO EXPANDIDA ---
  const loadContext = useCallback(async () => {
    if (!userId) return;
    try {
      // 1. Finanzas
      const fQ = query(
        collection(db, 'users', userId, 'finances'),
        orderBy('date', 'desc'),
        limit(30)
      );
      const fSnap = await getDocs(fQ);
      const transactions = fSnap.docs.map((d) => d.data());
      const balance = transactions.reduce(
        (acc, t) => (t.type === 'income' ? acc + t.amount : acc - t.amount),
        0
      );
      const financeContext = `Balance actual aproximado: $${balance.toFixed(
        2
      )} based on last 30 tx.`;

      // 2. Agenda & Notas
      const today = new Date().toISOString().split('T')[0];
      const aQ = query(
        collection(db, 'users', userId, 'agenda'),
        where('date', '>=', today),
        orderBy('date', 'asc'),
        limit(5)
      );
      const aSnap = await getDocs(aQ);
      const agendaList = aSnap.docs
        .map((d) => `${d.data().date} ${d.data().time}: ${d.data().title}`)
        .join('\n');

      const nQ = query(
        collection(db, 'users', userId, 'notes'),
        where('isPinned', '==', true),
        limit(5)
      );
      const nSnap = await getDocs(nQ);
      const notesList = nSnap.docs.map((d) => `Nota: ${d.data().title}`).join('\n');

      // 3. Historial (Expandido)
      const hQ = query(
        collection(db, 'users', userId, 'history'),
        orderBy('createdAt', 'desc'),
        limit(15)
      );
      const hSnap = await getDocs(hQ);
      const historyList = hSnap.docs
        .map((d) => {
          const item = d.data();
          return `[${item.category?.toUpperCase()}] ${item.clientName || item.title}`;
        })
        .join('\n');

      // 4. Base de conocimiento
      const kbQ = query(
        collection(db, 'users', userId, 'knowledge_base'),
        orderBy('updatedAt', 'desc'),
        limit(10)
      );
      const kbSnap = await getDocs(kbQ);
      const knowledgeBaseList = kbSnap.docs
        .map((d) => {
          const item = d.data();
          const tags = Array.isArray(item.tags) ? item.tags.join(', ') : '';
          return `- ${item.title}: ${item.summary}${tags ? ` (tags: ${tags})` : ''}`;
        })
        .join('\n');

      // 5. NUEVO: Leer Portafolio / Configuración Web
      let portfolioContext = 'No tiene sitio web configurado.';
      try {
        const webDoc = await getDoc(doc(db, 'users', userId, 'portfolio', 'site_config'));
        if (webDoc.exists()) {
          const web = webDoc.data();
          const services = (web.services || []) as Array<{ title?: string }>;
          portfolioContext = `
WEB DEL USUARIO:
- Título: ${web.heroTitle}
- Sobre mí: ${web.aboutText}
- Servicios: ${services.map((service) => service.title).join(', ')}
                    `.trim();
        }
      } catch (error) {
        void error;
      }

      const ingestKey = `assistant_ingest_${userId}`;
      const lastIngest = Number(localStorage.getItem(ingestKey) || 0);
      const shouldIngest = !lastIngest || Date.now() - lastIngest > INGEST_TTL_MS;
      if (shouldIngest) {
        const documents = buildIngestDocuments({
          finances: financeContext,
          agenda: agendaList,
          notes: notesList,
          history: historyList,
          portfolio: portfolioContext,
          knowledgeBase: knowledgeBaseList,
          currentTime: '',
          currentDate: '',
        });
        if (documents.length > 0) {
          try {
            await ingestAssistantDocuments(userId, documents, 'context');
            localStorage.setItem(ingestKey, `${Date.now()}`);
          } catch (error) {
            void error;
          }
        }
      }

      setContextData({
        finances: financeContext,
        agenda: agendaList,
        notes: notesList,
        history: historyList,
        portfolio: portfolioContext,
        knowledgeBase: knowledgeBaseList,
        currentTime: new Date().toLocaleTimeString(),
        currentDate: new Date().toLocaleDateString('en-CA'),
      });
    } catch (error) {
      void error;
    }
  }, [buildIngestDocuments, userId]);

  const handleReindex = useCallback(async () => {
    if (!userId || isReindexing) return;
    setIsReindexing(true);
    try {
      const documents = buildIngestDocuments(contextData);
      if (documents.length > 0) {
        await ingestAssistantDocuments(userId, documents, 'manual');
        localStorage.setItem(`assistant_ingest_${userId}`, `${Date.now()}`);
      }
    } catch (error) {
      void error;
    } finally {
      setIsReindexing(false);
    }
  }, [buildIngestDocuments, contextData, isReindexing, userId]);

  useEffect(() => {
    if (isOpen && userId) loadContext();
  }, [isOpen, loadContext, userId]);

  // --- EJECUTOR DE ACCIONES (EL CEREBRO NUEVO) ---
  const executeAIAction = async (jsonString: string) => {
    if (!userId) return 'Error: No user ID';

    try {
      const cleanJson = jsonString
        .replace(/```json/g, '')
        .replace(/```/g, '')
        .trim();
      const action = JSON.parse(cleanJson);
      // 1. AGENDAR EVENTO
      if (action.action === 'create_event') {
        await addDoc(collection(db, 'users', userId, 'agenda'), {
          title: action.title,
          date: action.date,
          time: action.time || '',
          desc: action.desc || 'IA Generated',
          createdAt: new Date().toISOString(),
        });
        return `✅ **Evento Agendado:** ${action.title} para el ${action.date}.`;
      }

      // 2. CREAR NOTA
      if (action.action === 'create_note') {
        await addDoc(collection(db, 'users', userId, 'notes'), {
          title: action.title || 'Nota IA',
          content: action.content,
          color: 'bg-yellow-100',
          isPinned: false,
          isPrivate: false,
          createdAt: serverTimestamp(),
          order: 0,
        });
        return `✅ **Nota Guardada:** "${action.title}".`;
      }

      // 3. BUSCAR TRABAJOS (Conecta con Job Hunter)
      if (action.action === 'search_jobs') {
        const formData = new FormData();
        formData.append('search', action.query || '');
        formData.append('page', '1');
        formData.append('userId', userId);

        const authHeaders = await getAuthHeaders();
        const res = await fetch(`${BACKEND_URL}/api/v1/jobs/search`, {
          method: 'POST',
          headers: authHeaders,
          body: formData,
        });
        const data = await res.json();

        if (data.success && data.jobs.length > 0) {
          const jobsText = (
            data.jobs as Array<{
              title: string;
              link: string;
              company: string;
              date_str: string;
            }>
          )
            .slice(0, 3)
            .map((j) => `- **[${j.title}](${j.link})** en ${j.company} (${j.date_str})`)
            .join('\n');
          return `🔎 **Empleos Encontrados:**\n${jobsText}\n\n*Puedes ver más en la sección "Buscar Trabajo".*`;
        }
        return 'No encontré empleos recientes con esa búsqueda.';
      }

      // 5. CREAR CURSO (Conecta con Academy)
      if (action.action === 'create_course') {
        try {
          const usage = await runWithCredits(3, onUsage, async () => {
            const formData = new FormData();
            formData.append('topic', action.topic);
            formData.append('level', action.level || 'Principiante');
            formData.append('userId', userId);

            const authHeaders = await getAuthHeaders();
            const res = await fetch(`${BACKEND_URL}/api/generate-course`, {
              method: 'POST',
              headers: authHeaders,
              body: formData,
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
          });

          if (!usage.ok) {
            return '❌ No tienes suficientes créditos para crear un curso (Costo: 3).';
          }
        } catch (error) {
          void error;
          return '⚠️ No se pudo crear el curso. Intenta de nuevo.';
        }

        return `🎓 **Creando Curso:** Estoy diseñando el plan de estudios para "${action.topic}". Aparecerá en la sección "Academia" y en tu Historial en breve.`;
      }

      return 'Acción no reconocida, pero he tomado nota.';
    } catch (error) {
      void error;
      return 'Hubo un error técnico al intentar ejecutar esa acción.';
    }
  };

  const handleSend = async (overrideText?: string) => {
    const textToSend = overrideText || input;
    if (!textToSend.trim()) return;

    try {
      const usage = await runWithCredits(1, onUsage, async () => {
        if (!userId) {
          throw new Error('Falta userId para el asistente.');
        }

        setInput('');
        setMessages((prev) => [...prev, { role: 'user', text: textToSend }]);
        setLoading(true);

        return chatWithAssistant(userId, textToSend, messages, contextData);
      });

      if (!usage.ok || !usage.result) return;
      const rawReply = usage.result;

      // Detectar si la respuesta es un JSON de acción
      if (rawReply.trim().startsWith('{') || rawReply.trim().startsWith('```json')) {
        const actionResult = await executeAIAction(rawReply);
        setMessages((prev) => [...prev, { role: 'model', text: actionResult }]);
        loadContext(); // Recargar contexto por si cambió algo
      } else {
        setMessages((prev) => [...prev, { role: 'model', text: rawReply }]);
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Error de conexión con el cerebro IA.';
      setMessages((prev) => [
        ...prev,
        {
          role: 'model',
          text: `⚠️ ${message}`,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  return (
    <>
      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={confirmClearHistory}
      />

      <div className="fixed bottom-6 right-6 z-[60] flex flex-col items-end pointer-events-none font-sans">
        <div
          className={`bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 mb-3 overflow-hidden transition-all duration-300 origin-bottom-right flex flex-col ${
            isOpen
              ? `opacity-100 scale-100 pointer-events-auto ${
                  isExpanded
                    ? 'fixed inset-0 z-[70] w-full h-full md:inset-auto md:right-6 md:bottom-6 md:w-[600px] md:h-[600px] rounded-none md:rounded-2xl'
                    : 'w-[calc(100vw-3rem)] sm:w-96 h-[500px] max-h-[70vh]'
                }`
              : 'opacity-0 scale-95 h-0 w-0 pointer-events-none'
          }`}
        >
          {/* HEADER MODIFICADO */}
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-4 flex justify-between items-center text-white shrink-0">
            <div className="flex items-center gap-3">
              {/* Avatar con borde brillante */}
              <div className="relative">
                <img
                  src={FREENCY_AVATAR}
                  alt="Freency"
                  className="w-10 h-10 rounded-full bg-white/10 border-2 border-white/20 p-0.5 shadow-lg"
                />
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-400 border-2 border-indigo-600 rounded-full"></span>
              </div>

              <div>
                <h3 className="font-bold text-base tracking-wide">Freency</h3>
                <p className="text-[10px] text-indigo-100 flex items-center gap-1 opacity-90">
                  <Sparkles className="w-2 h-2 text-yellow-300" /> Tu Copiloto IA
                </p>
              </div>
            </div>

            {/* Botones de control (Minimizar, Cerrar, etc) se mantienen igual */}
            <div className="flex items-center gap-1">
              <button
                onClick={handleReindex}
                disabled={isReindexing}
                className="hover:bg-white/10 p-1.5 rounded transition-colors text-indigo-100 hover:text-white disabled:opacity-50"
                title="Reindexar memoria"
              >
                {isReindexing ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <RefreshCw className="w-4 h-4" />
                )}
              </button>
              <button
                onClick={() => setShowDeleteModal(true)}
                className="hover:bg-white/10 p-1.5 rounded transition-colors text-indigo-100 hover:text-white"
                title="Borrar chat"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="hidden md:block hover:bg-white/10 p-1.5 rounded transition-colors"
              >
                {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="hover:bg-white/10 p-1.5 rounded transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* CHAT AREA */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 dark:bg-slate-900 custom-scrollbar">
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center min-h-full text-center p-4 animate-in fade-in zoom-in duration-300">
                {/* Círculo con efecto de respiración */}
                <div
                  className="relative mb-4 group cursor-pointer"
                  onClick={() => handleSend('Hola Freency')}
                >
                  <div className="absolute inset-0 bg-indigo-500/20 rounded-full blur-xl animate-pulse group-hover:bg-indigo-500/30 transition-all"></div>
                  <img
                    src={FREENCY_AVATAR}
                    alt="Freency"
                    className="w-20 h-20 relative z-10 drop-shadow-xl transform group-hover:scale-110 transition-transform duration-300"
                  />
                </div>

                <h3 className="text-slate-800 dark:text-white font-bold text-lg mb-1">
                  ¡Hola! Soy Freency 🤖
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-6 max-w-[240px] leading-relaxed">
                  Estoy conectada a tus finanzas, agenda y herramientas. ¿Qué creamos hoy?
                </p>
                <div className="grid gap-2 w-full">
                  {SUGGESTED_QUESTIONS.map((q, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSend(q)}
                      className="text-xs text-left bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 text-slate-600 dark:text-slate-300 hover:text-indigo-700 dark:hover:text-indigo-400 p-3 rounded-xl transition-all shadow-sm flex items-center gap-2 group"
                    >
                      <MessageSquare className="w-3 h-3 opacity-50 group-hover:opacity-100 text-indigo-500" />
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {messages.map((m, i) => (
              <div
                key={i}
                className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] p-3 rounded-2xl text-sm leading-relaxed shadow-sm ${
                    m.role === 'user'
                      ? 'bg-indigo-600 text-white rounded-tr-none'
                      : 'bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 rounded-tl-none'
                  }`}
                >
                  <ReactMarkdown
                    components={{
                      a: ({ node: _node, ...props }) => (
                        <a
                          {...props}
                          className="text-indigo-400 underline font-bold"
                          target="_blank"
                          rel="noopener noreferrer"
                        />
                      ),
                    }}
                  >
                    {m.text}
                  </ReactMarkdown>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 p-3 rounded-2xl rounded-tl-none shadow-sm">
                  <Loader2 className="w-4 h-4 text-indigo-500 animate-spin" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* INPUT */}
          <div className="p-3 bg-white dark:bg-slate-800 border-t border-slate-100 dark:border-slate-700 flex gap-2">
            <input
              type="text"
              className="flex-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all placeholder:text-slate-400 text-slate-800 dark:text-white"
              placeholder="Ej: 'Busca trabajo de diseño' o 'Resume mis notas'..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            />
            <button
              onClick={() => handleSend()}
              disabled={loading || !input.trim()}
              className="bg-indigo-600 text-white p-3 rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition-colors shadow-sm active:scale-95 transform"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* BOTÓN FLOTANTE */}
        {/* BOTÓN FLOTANTE */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`pointer-events-auto shadow-2xl transition-all duration-300 group hover:shadow-indigo-500/40 hover:-translate-y-1 relative ${
            isOpen ? 'rotate-90 scale-0 opacity-0' : 'scale-100 opacity-100'
          }`}
        >
          {/* Contenedor de la imagen redonda */}
          <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-white dark:border-slate-700 bg-indigo-600">
            <img src={FREENCY_AVATAR} alt="Chat" className="w-full h-full object-cover" />
          </div>

          {/* Indicador de estado (punto verde) */}
          <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full"></span>
        </button>
        {isOpen && (
          <button
            onClick={() => setIsOpen(false)}
            className="pointer-events-auto p-4 rounded-full shadow-xl bg-slate-800 dark:bg-slate-700 text-white hover:bg-slate-900 dark:hover:bg-slate-600 transition-all duration-300 animate-in zoom-in spin-in-90"
          >
            <X className="w-7 h-7" />
          </button>
        )}
      </div>
    </>
  );
};
