import React, { useCallback, useEffect, useState } from 'react';
import {
  collection,
  query,
  orderBy,
  getDocs,
  deleteDoc,
  doc,
  writeBatch,
  limit,
  startAfter,
  QueryDocumentSnapshot,
  DocumentData,
} from 'firebase/firestore';
import { db } from '@config/firebase';
import { HistoryItem } from '@types';
import {
  Calendar,
  User,
  Trash2,
  ChevronDown,
  ChevronUp,
  Copy,
  CheckCircle2,
  Search,
  ChevronLeft,
  ChevronRight,
  Image as ImageIcon,
  Download,
  FileText,
  QrCode,
  Eraser, // <--- Nuevo icono importado
  Globe,
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { ConfirmationModal } from '@features/shared/ui';
import { downloadFile, loadHtml2Pdf } from '@features/shared/utils';

interface HistoryViewProps {
  userId?: string;
}

export const HistoryView: React.FC<HistoryViewProps> = ({ userId }) => {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [timeFilter, setTimeFilter] = useState<'all' | '7d' | '30d' | '90d'>('all');
  const [lastDoc, setLastDoc] = useState<QueryDocumentSnapshot<DocumentData> | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const fetchPageSize = 25;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalConfig, setModalConfig] = useState({
    title: '',
    message: '',
    action: () => {},
    isDanger: false,
  });

  const fetchHistoryPage = useCallback(
    async (
      options: {
        append?: boolean;
        cursor?: QueryDocumentSnapshot<DocumentData> | null;
      } = {}
    ) => {
      if (!userId) return;
      const shouldAppend = options.append ?? false;
      if (shouldAppend) {
        setIsLoadingMore(true);
      } else {
        setLoading(true);
      }
      try {
        const historyRef = collection(db, 'users', userId, 'history');
        const baseQuery = query(historyRef, orderBy('createdAt', 'desc'), limit(fetchPageSize));
        const pageQuery =
          shouldAppend && options.cursor
            ? query(
                historyRef,
                orderBy('createdAt', 'desc'),
                startAfter(options.cursor),
                limit(fetchPageSize)
              )
            : baseQuery;

        const querySnapshot = await getDocs(pageQuery);
        const loadedHistory: HistoryItem[] = querySnapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...docSnap.data(),
        })) as HistoryItem[];

        const newLastDoc = querySnapshot.docs[querySnapshot.docs.length - 1] || null;
        setLastDoc(newLastDoc);
        setHasMore(querySnapshot.docs.length === fetchPageSize);
        setHistory((prev) => (shouldAppend ? [...prev, ...loadedHistory] : loadedHistory));
      } catch (error) {
        console.error('Error cargando historial', error);
      } finally {
        setLoading(false);
        setIsLoadingMore(false);
      }
    },
    [fetchPageSize, userId]
  );

  useEffect(() => {
    setLastDoc(null);
    setHasMore(true);
    fetchHistoryPage({ append: false });
  }, [fetchHistoryPage, userId]);

  const handleDelete = (id: string) => {
    if (!userId) return;
    confirmAction(
      '¿Borrar propuesta?',
      'Esta acción eliminará este elemento de tu historial permanentemente.',
      async () => {
        await deleteDoc(doc(db, 'users', userId, 'history', id));
        setHistory((prev) => prev.filter((item) => item.id !== id));
      },
      true
    );
  };
  const confirmAction = (title: string, message: string, action: () => void, isDanger = false) => {
    setModalConfig({ title, message, action, isDanger });
    setIsModalOpen(true);
  };
  const handleClearAll = () => {
    if (!userId || history.length === 0) return;
    confirmAction(
      '¿Vaciar todo el historial?',
      'Estás a punto de borrar TODAS las propuestas y logos guardados. Esta acción no se puede deshacer.',
      async () => {
        setLoading(true);
        try {
          const batch = writeBatch(db);
          history.forEach((item) => {
            const docRef = doc(db, 'users', userId, 'history', item.id);
            batch.delete(docRef);
          });
          await batch.commit();
          setHistory([]);
        } catch (error) {
          console.error(error);
        } finally {
          setLoading(false);
        }
      },
      true
    );
  };

  const availableCategories = Array.from(
    new Set(history.map((item) => item.category).filter(Boolean))
  ) as string[];

  const categoryLabels: Record<string, string> = {
    briefing: 'Briefing',
    proposal: 'Propuestas',
    portfolio: 'Portafolio',
    fiverr: 'Fiverr',
    logo: 'Logos',
    invoice: 'Facturas',
    cv: 'CV',
    analyzer: 'Analizador',
    optimizer: 'Optimizador',
    website: 'Web',
    jobs: 'Empleos',
    notes: 'Notas',
    finance: 'Finanzas',
    tool: 'Herramientas',
    qr: 'QR',
    assistant: 'Asistente',
    history: 'Historial',
    gig: 'Gig',
    course: 'Curso',
    academy: 'Academia',
  };

  const filteredHistory = history.filter((item) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      item.clientName?.toLowerCase().includes(term) ||
      item.content?.toLowerCase().includes(term) ||
      item.type?.toLowerCase().includes(term);
    const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
    if (!matchesSearch || !matchesCategory) return false;
    if (timeFilter === 'all') return true;
    const days = timeFilter === '7d' ? 7 : timeFilter === '30d' ? 30 : 90;
    const createdAt = new Date(item.createdAt).getTime();
    if (Number.isNaN(createdAt)) return false;
    return createdAt >= Date.now() - days * 24 * 60 * 60 * 1000;
  });

  if (loading)
    return <div className="p-8 text-center text-slate-500 dark:text-slate-400">Cargando...</div>;

  return (
    <div className="max-w-4xl mx-auto min-h-screen pb-20">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span className="text-brand-600">📜</span> Historial
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Tus últimas 100 generaciones guardadas.
          </p>
        </div>

        <div className="flex gap-2 w-full md:w-auto">
          {history.length > 0 && (
            <button
              onClick={handleClearAll}
              className="px-3 py-2 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-900/10 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/20 transition-colors flex items-center gap-2 text-sm font-medium"
              title="Vaciar Historial"
            >
              <Trash2 className="w-4 h-4" />
              <span className="hidden md:inline">Vaciar</span>
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-3 text-slate-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Buscar por cliente, contenido o tipo..."
            className="w-full pl-10 p-3 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full p-3 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 shadow-sm"
          >
            <option value="all">Todas las categorias</option>
            {availableCategories.map((category) => (
              <option key={category} value={category}>
                {categoryLabels[category] || category}
              </option>
            ))}
          </select>
        </div>
        <div>
          <select
            value={timeFilter}
            onChange={(e) => setTimeFilter(e.target.value as typeof timeFilter)}
            className="w-full p-3 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 shadow-sm"
          >
            <option value="all">Todo el tiempo</option>
            <option value="7d">Ultimos 7 dias</option>
            <option value="30d">Ultimos 30 dias</option>
            <option value="90d">Ultimos 90 dias</option>
          </select>
        </div>
      </div>

      {filteredHistory.length === 0 && (
        <div className="text-center py-20 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
          <div className="w-16 h-16 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto text-slate-300 dark:text-slate-500 mb-4">
            <Search className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300">
            No se encontraron resultados
          </h3>
          <p className="text-slate-500 dark:text-slate-400">
            Intenta con otra búsqueda o genera una nueva propuesta.
          </p>
        </div>
      )}

      <div className="space-y-4">
        {filteredHistory.map((item) => {
          // Si es cualquier tipo de imagen (Logo, QR, Fondo, Portafolio)
          if (
            item.category === 'logo' ||
            item.type === 'background-removal' ||
            item.type === 'portfolio-gen' ||
            item.type === 'fiverr-gig' || // Fiverr tiene estructura compleja, mejor ver resumen
            item.type === 'cover-letter' // Cover Letter es texto largo
          )
            return (
              <LogoHistoryCard key={item.id} item={item} onDelete={() => handleDelete(item.id)} />
            );
          // Si es factura
          if (item.category === 'invoice')
            return (
              <InvoiceHistoryCard
                key={item.id}
                item={item}
                onDelete={() => handleDelete(item.id)}
              />
            );
          if (item.type === 'cv') {
            // El CV no guardó el PDF, solo el registro de que se hizo.
            // Usamos HistoryCard simple para mostrar que se hizo.
            return <HistoryCard key={item.id} item={item} onDelete={() => handleDelete(item.id)} />;
          }
          // Si es texto (briefing checklist, propuestas, etc)
          return <HistoryCard key={item.id} item={item} onDelete={() => handleDelete(item.id)} />;
        })}
      </div>

      {hasMore && (
        <div className="flex justify-center mt-6">
          <button
            onClick={() => fetchHistoryPage({ append: true, cursor: lastDoc })}
            disabled={isLoadingMore}
            className="px-4 py-2 text-sm font-bold text-brand-600 dark:text-brand-400 border border-brand-200 dark:border-brand-800 rounded-lg hover:bg-brand-50 dark:hover:bg-brand-900/20 transition-colors"
          >
            {isLoadingMore ? 'Cargando...' : 'Cargar mas'}
          </button>
        </div>
      )}
      <ConfirmationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={modalConfig.action}
        title={modalConfig.title}
        message={modalConfig.message}
        isDanger={modalConfig.isDanger}
        confirmText={modalConfig.isDanger ? 'Sí, borrar' : 'Confirmar'}
      />
    </div>
  );
};

const HistoryCard = ({ item, onDelete }: { item: HistoryItem; onDelete: () => void }) => {
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    const cleanText = item.content.replace(/\*\*/g, '').replace(/^#+\s/gm, '');
    navigator.clipboard.writeText(cleanText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const dateStr =
    new Date(item.createdAt).toLocaleDateString() +
    ' ' +
    new Date(item.createdAt).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });

  return (
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden">
      <div className="p-4 bg-slate-50 dark:bg-slate-700/50 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
        <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
          <span
            className={`text-xs font-bold px-2 py-1 rounded-md uppercase w-fit ${
              item.type === 'Formal'
                ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                : item.type === 'Corto'
                  ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300'
                  : item.type === 'brief-checklist'
                    ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300'
                    : 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300'
            }`}
          >
            {item.type === 'brief-checklist' ? 'BRIEF + TAREAS' : item.type}
          </span>
          <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
            <Calendar className="w-3 h-3" /> {dateStr}
          </div>
          <div className="flex items-center gap-1 text-xs font-bold text-slate-700 dark:text-slate-300">
            <User className="w-3 h-3" /> {item.clientName || 'Cliente'}
          </div>
        </div>

        <button
          onClick={onDelete}
          className="text-slate-400 hover:text-red-500 transition-colors p-1"
          title="Borrar"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      <div className="p-5">
        <div
          className={`prose prose-sm dark:prose-invert max-w-none text-slate-600 dark:text-slate-300 ${
            !expanded ? 'line-clamp-3' : ''
          }`}
        >
          {expanded ? (
            <ReactMarkdown
              components={{
                p: ({ node: _node, ...props }) => (
                  <p className="mb-2 whitespace-pre-wrap" {...props} />
                ),
                ul: ({ node: _node, ...props }) => <ul className="list-disc pl-4" {...props} />,
              }}
            >
              {item.content}
            </ReactMarkdown>
          ) : (
            <span className="opacity-70">{item.content.substring(0, 150)}...</span>
          )}
        </div>

        <div className="mt-4 flex justify-between items-center border-t border-slate-100 dark:border-slate-700 pt-3">
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-sm font-bold text-brand-600 dark:text-brand-400 hover:text-brand-800 dark:hover:text-brand-300 flex items-center gap-1"
          >
            {expanded ? (
              <>
                Menos detalles <ChevronUp className="w-4 h-4" />
              </>
            ) : (
              <>
                Ver completa <ChevronDown className="w-4 h-4" />
              </>
            )}
          </button>

          {expanded && (
            <button
              onClick={handleCopy}
              className="text-sm text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white flex items-center gap-1"
            >
              {copied ? (
                <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
              {copied ? 'Copiado' : 'Copiar'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// --- TARJETA DE IMAGEN UNIFICADA (LOGO / QR / IMAGEN / PORTAFOLIO) ---
const LogoHistoryCard = ({ item, onDelete }: { item: HistoryItem; onDelete: () => void }) => {
  const [showImage, setShowImage] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  // DETECCIÓN DE TIPO
  const isQR = item.platform === 'QR Generator' || item.type === 'QR Code';
  const isPortfolio = item.type === 'portfolio-gen';
  const isBgRemoval = item.type === 'background-removal';
  // NUEVOS TIPOS
  const isCoverLetter = item.type === 'cover-letter';
  const isFiverr = item.type === 'fiverr-gig';

  // Configuración dinámica
  let badgeLabel = 'LOGO';
  let BadgeIcon = ImageIcon;
  // Colores por defecto (Morado para Logo)
  let badgeColor = 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300';

  if (isQR) {
    badgeLabel = 'QR';
    BadgeIcon = QrCode;
    badgeColor = 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300';
  } else if (isPortfolio) {
    badgeLabel = 'PORTAFOLIO';
    BadgeIcon = FileText;
    badgeColor = 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300';
  } else if (isBgRemoval) {
    // AQUI ESTÁ EL CAMBIO PARA IMAGEN SIN FONDO
    badgeLabel = 'IMAGEN';
    BadgeIcon = Eraser;
    badgeColor = 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300';
  } else if (isCoverLetter) {
    badgeLabel = 'CARTA';
    BadgeIcon = FileText;
    badgeColor = 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300';
  } else if (isFiverr) {
    badgeLabel = 'GIG FIVERR';
    BadgeIcon = Globe;
    badgeColor = 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300';
  }

  const dateStr =
    new Date(item.createdAt).toLocaleDateString() +
    ' ' +
    new Date(item.createdAt).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });

  const handleCopyDescription = () => {
    const textToCopy = `Tipo: ${badgeLabel}\nNombre: ${item.clientName}\nContenido: ${item.content}`;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(textToCopy).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    } else {
      alert('Texto copiado.');
    }
  };

  const handleReDownload = async () => {
    if (!item.imageUrl) return;
    setIsDownloading(true);
    try {
      const response = await fetch(item.imageUrl);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;

      // Prefijo dinámico para el archivo
      let prefix = 'logo';
      if (isQR) prefix = 'qr';
      if (isPortfolio) prefix = 'caso-estudio';
      if (isBgRemoval) prefix = 'sin-fondo';
      const filename = `${prefix}-${Date.now()}.png`;

      await downloadFile(item.imageUrl, filename);
    } catch (error: unknown) {
      console.error(error);
      setErrorMsg(error instanceof Error ? error.message : 'Error desconocido');
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden">
      <ConfirmationModal
        isOpen={!!errorMsg}
        onClose={() => setErrorMsg('')}
        onConfirm={() => setErrorMsg('')}
        title="Error de Descarga"
        message={errorMsg}
        confirmText="Ok"
        cancelText=""
        isDanger={true}
      />
      {/* ENCABEZADO */}
      <div className="p-4 bg-slate-50 dark:bg-slate-700/50 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
        <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
          {/* ETIQUETA DINÁMICA */}
          <span
            className={`text-xs font-bold px-2 py-1 rounded-md uppercase flex items-center gap-1 w-fit ${badgeColor}`}
          >
            <BadgeIcon className="w-3 h-3" />
            {badgeLabel}
          </span>

          <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
            <Calendar className="w-3 h-3" /> {dateStr}
          </div>
          <span className="text-sm font-bold text-slate-800 dark:text-white">
            {item.clientName}
          </span>
        </div>
        <button
          onClick={onDelete}
          className="text-slate-400 hover:text-red-500 transition-colors p-1"
          title="Borrar del historial"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* CUERPO */}
      <div className="p-5 flex flex-col sm:flex-row gap-6 items-start">
        {/* IMAGEN */}
        <div className="w-full sm:w-40 shrink-0">
          <div
            className="aspect-square bg-slate-100 dark:bg-slate-900 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 flex items-center justify-center relative group cursor-pointer"
            onClick={() => setShowImage(!showImage)}
          >
            {item.imageUrl ? (
              <img
                src={item.imageUrl}
                alt="Visualización"
                className={`w-full h-full object-contain ${isQR ? 'p-2' : 'p-0'}`}
                loading="lazy"
              />
            ) : (
              <ImageIcon className="w-10 h-10 text-slate-300 dark:text-slate-600" />
            )}

            {!showImage && (
              <div className="absolute inset-0 bg-black/0 hover:bg-black/10 transition-colors flex items-center justify-center"></div>
            )}
          </div>

          <button
            onClick={handleReDownload}
            disabled={isDownloading}
            className="mt-2 w-full py-1.5 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-md flex items-center justify-center gap-1 transition-colors"
          >
            {isDownloading ? (
              <span className="animate-pulse">Bajando...</span>
            ) : (
              <>
                <Download className="w-3 h-3" /> Descargar
              </>
            )}
          </button>
        </div>

        {/* DATOS */}
        <div className="flex-1 w-full">
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                {isPortfolio ? 'Plataforma' : 'Tipo'}
              </span>
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                {isPortfolio ? item.platform : item.type}
              </p>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                Nombre / Título
              </span>
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                {item.clientName}
              </p>
            </div>
          </div>

          <div className="mb-4">
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              {isQR ? 'Contenido del QR' : isPortfolio ? 'Copy Generado' : 'Prompt / Detalles'}
            </span>
            <div
              className={`text-sm text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-900 p-3 rounded-lg border border-slate-100 dark:border-slate-700 italic ${
                !showImage ? 'line-clamp-3' : ''
              } break-all whitespace-pre-wrap`}
            >
              {isQR ? (
                item.content.replace('Enlace: ', '')
              ) : item.type === 'fiverr-gig' && item.gigData ? (
                // Si es Fiverr, mostramos un resumen bonito
                <div>
                  <strong>Título:</strong> {item.gigData.title}
                  <br />
                  <strong>Categoría:</strong> {item.gigData.category}
                </div>
              ) : isPortfolio ? (
                item.content
              ) : (
                `"${item.content}"`
              )}
            </div>
          </div>

          <div className="flex flex-wrap gap-3 pt-2 border-t border-slate-100 dark:border-slate-700">
            <button
              onClick={() => setShowImage(!showImage)}
              className="text-sm font-bold text-brand-600 dark:text-brand-400 hover:text-brand-800 dark:hover:text-brand-300 flex items-center gap-1"
            >
              {showImage ? (
                <>
                  Ver menos <ChevronUp className="w-4 h-4" />
                </>
              ) : (
                <>
                  Ver detalles <ChevronDown className="w-4 h-4" />
                </>
              )}
            </button>

            <button
              onClick={handleCopyDescription}
              className="text-sm text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white flex items-center gap-1 ml-auto"
            >
              {copied ? (
                <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
              {copied ? 'Copiado' : 'Copiar texto'}
            </button>
          </div>

          {showImage && item.imageUrl && (
            <div className="mt-4 p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 flex justify-center">
              <img
                src={item.imageUrl}
                alt="Full Size"
                className="max-h-96 object-contain shadow-sm rounded-lg bg-white"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const InvoiceHistoryCard = ({ item, onDelete }: { item: HistoryItem; onDelete: () => void }) => {
  // ... Copia el InvoiceHistoryCard del mensaje anterior
  // (Ya tenía Dark Mode, no necesita cambios, solo asegúrate de incluirlo al final del archivo)
  // Para ahorrar espacio, es el mismo que te di antes.
  const [isDownloading, setIsDownloading] = useState(false);
  const dateStr = new Date(item.createdAt).toLocaleDateString();
  const [errorMsg, setErrorMsg] = useState('');

  const handleRedownload = async () => {
    setIsDownloading(true);
    const data = item.invoiceData;
    if (!data) return;
    const template = data.template || 'classic';
    const fontFamily =
      template === 'minimal'
        ? 'Georgia, serif'
        : template === 'bold'
          ? 'Arial Black, Arial, sans-serif'
          : 'Helvetica, sans-serif';
    const borderColor = template === 'minimal' ? '#e2e8f0' : '#eee';
    const titleColor = template === 'bold' ? '#0f172a' : '#444';
    const accentColor = template === 'bold' ? '#0f172a' : '#16a34a';
    const tableHeaderBg = template === 'minimal' ? '#f8fafc' : '#f8f8f8';
    const tableHeaderBorder = template === 'bold' ? '#0f172a' : '#ddd';
    // (Lógica de HTML2PDF para facturas igual que antes)
    const containerStyle = `padding: 40px; font-family: ${fontFamily}; color: #333; max-width: 800px; margin: 0 auto;`;
    const headerStyle = `display: flex; justify-content: space-between; margin-bottom: 40px; border-bottom: 1px solid ${borderColor}; padding-bottom: 20px;`;
    const titleStyle = `font-size: 32px; font-weight: bold; color: ${titleColor}; text-transform: uppercase;`;
    const labelStyle =
      'font-size: 10px; font-weight: bold; text-transform: uppercase; color: #888; margin-bottom: 4px;';
    const tableHeaderStyle = `text-align: left; padding: 10px; background-color: ${tableHeaderBg}; font-weight: bold; font-size: 12px; border-bottom: 2px solid ${tableHeaderBorder};`;
    const cellStyle = 'padding: 10px; border-bottom: 1px solid #eee; font-size: 13px;';
    const content = document.createElement('div');
    content.innerHTML = `
            <div style="${containerStyle}">
                <div style="${headerStyle}">
                    <div style="width: 50%;">
                        ${
                          data.logo
                            ? `<img src="${data.logo}" style="height: 60px; object-fit: contain; margin-bottom: 10px;" />`
                            : `<h1 style="color: ${accentColor}; margin:0;">FACTURA</h1>`
                        }
                        <div style="font-size: 14px; line-height: 1.5;">
                            <strong>${data.sender.name || 'Emisor'}</strong><br/>
                            ${data.sender.idDoc ? `${data.sender.idDoc}<br/>` : ''}
                            ${data.sender.phone ? `${data.sender.phone}<br/>` : ''}
                            ${data.sender.email}<br/>
                            <span style="white-space: pre-line;">${data.sender.address}</span>
                        </div>
                    </div>
                    <div style="width: 40%; text-align: right;">
                        <div style="${titleStyle}">INVOICE</div>
                        <div style="margin-top: 15px;">
                            <div style="${labelStyle}">NÚMERO</div>
                            <div style="font-size: 16px; font-weight: bold;">#${
                              data.invoiceNumber
                            }</div>
                        </div>
                        <div style="margin-top: 10px;">
                            <div style="${labelStyle}">FECHA</div>
                            <div style="font-size: 16px;">${data.date}</div>
                        </div>
                    </div>
                </div>
                <div style="margin-bottom: 40px;">
                    <div style="${labelStyle}">FACTURAR A:</div>
                    <div style="font-size: 18px; font-weight: bold; margin-bottom: 5px;">${
                      data.client.name
                    }</div>
                    <div style="font-size: 14px; color: #555; line-height: 1.4;">
                        ${data.client.idDoc ? `${data.client.idDoc}<br/>` : ''}
                        ${data.client.phone ? `${data.client.phone}<br/>` : ''}
                        ${data.client.email}<br/>
                        <span style="white-space: pre-line;">${data.client.address}</span>
                    </div>
                </div>
                <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
                    <thead>
                        <tr>
                            <th style="${tableHeaderStyle}">DESCRIPCIÓN</th>
                            <th style="${tableHeaderStyle} text-align: right;">CANT.</th>
                            <th style="${tableHeaderStyle} text-align: right;">PRECIO</th>
                            <th style="${tableHeaderStyle} text-align: right;">TOTAL</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${data.items
                          .map(
                            (i: { desc: string; qty: number; price: number }) => `
                            <tr>
                                <td style="${cellStyle}">${i.desc}</td>
                                <td style="${cellStyle} text-align: right;">${i.qty}</td>
                                <td style="${cellStyle} text-align: right;">${
                                  data.currency
                                }${Number(i.price).toFixed(2)}</td>
                                <td style="${cellStyle} text-align: right; font-weight: bold;">${
                                  data.currency
                                }${(i.qty * i.price).toFixed(2)}</td>
                            </tr>
                        `
                          )
                          .join('')}
                    </tbody>
                </table>
                <div style="display: flex; justify-content: flex-end;">
                    <div style="width: 250px;">
                        <div style="display: flex; justify-content: space-between; padding: 5px 0; border-bottom: 1px solid #eee;">
                            <span>Subtotal:</span>
                            <span>${data.currency}${data.items
                              .reduce(
                                (acc: number, item: { qty: number; price: number }) =>
                                  acc + item.qty * item.price,
                                0
                              )
                              .toFixed(2)}</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; padding: 5px 0; border-bottom: 1px solid #eee;">
                            <span>Impuestos (${data.taxRate}%):</span>
                            <span>${data.currency}${(
                              (data.items.reduce(
                                (acc: number, item: { qty: number; price: number }) =>
                                  acc + item.qty * item.price,
                                0
                              ) *
                                data.taxRate) /
                              100
                            ).toFixed(2)}</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; padding: 10px 0; font-size: 20px; font-weight: bold; color: #000; border-top: 2px solid #333; margin-top: 5px;">
                            <span>TOTAL:</span>
                            <span>${data.currency}${data.total.toFixed(2)}</span>
                        </div>
                    </div>
                </div>
                <div style="margin-top: 50px; padding-top: 20px; border-top: 1px solid #ddd;">
                    <div style="${labelStyle}">NOTAS / TÉRMINOS</div>
                    <p style="font-size: 13px; color: #666; white-space: pre-line;">${
                      data.notes
                    }</p>
                </div>
            </div>
        `;
    const opt = {
      margin: 10,
      filename: `copia-factura-${data.invoiceNumber}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
    };
    try {
      // --- CORRECCIÓN: Generar string y usar downloadFile ---
      const html2pdf = await loadHtml2Pdf();
      const pdfDataUri = await html2pdf().set(opt).from(content).outputPdf('datauristring');

      await downloadFile(pdfDataUri, opt.filename);
    } catch (error: unknown) {
      console.error(error);
      setErrorMsg(error instanceof Error ? error.message : 'Error desconocido');
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden">
      <ConfirmationModal
        isOpen={!!errorMsg}
        onClose={() => setErrorMsg('')}
        onConfirm={() => setErrorMsg('')}
        title="Error de Descarga"
        message={errorMsg}
        confirmText="Ok"
        cancelText=""
        isDanger={true}
      />
      <div className="p-4 bg-slate-50 dark:bg-slate-700/50 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <span className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs font-bold px-2 py-1 rounded-md uppercase flex items-center gap-1">
            <FileText className="w-3 h-3" /> FACTURA
          </span>
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">{dateStr}</span>
          <span className="text-sm font-bold text-slate-800 dark:text-white">
            {item.clientName}
          </span>
        </div>
        <button
          onClick={onDelete}
          className="text-slate-400 hover:text-red-500 transition-colors p-1"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
      <div className="p-5">
        <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">{item.content}</p>
        <div className="flex gap-3">
          <button
            onClick={handleRedownload}
            disabled={isDownloading}
            className="text-sm font-bold text-brand-600 dark:text-brand-400 hover:text-brand-800 dark:hover:text-brand-300 flex items-center gap-2 border border-brand-200 dark:border-brand-800 px-3 py-1.5 rounded-lg hover:bg-brand-50 dark:hover:bg-brand-900/20 transition-colors"
          >
            {isDownloading ? (
              <span className="animate-pulse">Generando...</span>
            ) : (
              <>
                <Download className="w-4 h-4" /> Descargar Copia PDF
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
