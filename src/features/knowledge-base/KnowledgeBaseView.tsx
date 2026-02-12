import React, { useEffect, useMemo, useState } from 'react';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
} from 'firebase/firestore';
import { BookOpen, Link as LinkIcon, Plus, Search, Tag, Trash2 } from 'lucide-react';
import { db } from '@config/firebase';
import { Button, Card, ConfirmationModal } from '@features/shared/ui';
import { ingestAssistantDocuments } from '@features/shared/services';

interface KnowledgeBaseViewProps {
  userId?: string;
}

interface KnowledgeItem {
  id: string;
  title: string;
  summary: string;
  tags: string[];
  source?: string;
  createdAt?: { toMillis?: () => number } | string;
  updatedAt?: { toMillis?: () => number } | string;
}

const parseTags = (raw: string) =>
  raw
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean);

const formatDate = (value?: KnowledgeItem['updatedAt']) => {
  if (!value) return 'Sin fecha';
  if (typeof value === 'string') {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? 'Sin fecha' : date.toLocaleDateString();
  }
  if (value?.toMillis) {
    return new Date(value.toMillis()).toLocaleDateString();
  }
  return 'Sin fecha';
};

export const KnowledgeBaseView: React.FC<KnowledgeBaseViewProps> = ({ userId }) => {
  const [items, setItems] = useState<KnowledgeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [tags, setTags] = useState('');
  const [source, setSource] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState('');
  const [modal, setModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  useEffect(() => {
    if (!userId) return;
    const baseRef = collection(db, 'users', userId, 'knowledge_base');
    const q = query(baseRef, orderBy('updatedAt', 'desc'));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const nextItems = snapshot.docs.map(
          (docSnap) =>
            ({
              id: docSnap.id,
              ...(docSnap.data() as Omit<KnowledgeItem, 'id'>),
            }) as KnowledgeItem
        );
        setItems(nextItems);
        setLoading(false);
      },
      () => {
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [userId]);

  const filteredItems = useMemo(() => {
    if (!search.trim()) return items;
    const queryText = search.toLowerCase();
    return items.filter((item) => {
      const haystack = `${item.title} ${item.summary} ${item.tags?.join(' ')}`.toLowerCase();
      return haystack.includes(queryText);
    });
  }, [items, search]);

  const handleAdd = async () => {
    if (!userId) return;
    if (!title.trim() || !summary.trim()) return;

    setIsSaving(true);
    try {
      await addDoc(collection(db, 'users', userId, 'knowledge_base'), {
        title: title.trim(),
        summary: summary.trim(),
        tags: parseTags(tags),
        source: source.trim() || null,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      setTitle('');
      setSummary('');
      setTags('');
      setSource('');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSyncAssistant = async () => {
    if (!userId || items.length === 0) return;
    setIsSyncing(true);
    setSyncMessage('');
    try {
      const documents = items.map((item) => ({
        id: `kb-${item.id}`,
        text: `${item.title}\n${item.summary}\n${item.tags?.length ? `Tags: ${item.tags.join(', ')}` : ''}`.trim(),
        source: 'knowledge_base',
      }));
      const stored = await ingestAssistantDocuments(userId, documents, 'knowledge_base');
      setSyncMessage(`Listo. Sincronizadas ${stored} entradas con Freency.`);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'No se pudo sincronizar.';
      setSyncMessage(message);
    } finally {
      setIsSyncing(false);
    }
  };

  const confirmDelete = (id: string) => {
    setModal({
      isOpen: true,
      title: 'Eliminar item',
      message: 'Esta accion eliminara el item de tu base de conocimiento.',
      onConfirm: async () => {
        if (!userId) return;
        await deleteDoc(doc(db, 'users', userId, 'knowledge_base', id));
        setModal((prev) => ({ ...prev, isOpen: false }));
      },
    });
  };

  return (
    <div className="max-w-6xl mx-auto pb-20 space-y-8">
      <div className="text-center">
        <div className="inline-flex items-center gap-2 bg-brand-100 text-brand-800 px-3 py-1 rounded-full text-xs font-bold">
          <BookOpen className="w-4 h-4" /> Base de Conocimiento
        </div>
        <h2 className="text-3xl font-bold text-slate-900 dark:text-white mt-3">
          Organiza lo que tu negocio sabe
        </h2>
        <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto mt-2">
          Guarda aprendizajes, procesos y referencias clave para que tu IA y tu equipo trabajen con
          contexto real.
        </p>
      </div>

      <Card className="p-6 shadow-md space-y-4">
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
          <BookOpen className="w-4 h-4" /> Como usarlo
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-slate-600 dark:text-slate-300">
          <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-4">
            Guarda procesos, respuestas frecuentes y aprendizajes de clientes.
          </div>
          <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-4">
            Usa tags para conectar con propuestas, briefings y finanzas.
          </div>
          <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-4">
            Sincroniza con Freency para que responda con tu contexto real.
          </div>
        </div>
        <div className="flex flex-col md:flex-row items-start md:items-center gap-3">
          <Button onClick={handleSyncAssistant} disabled={isSyncing || items.length === 0}>
            {isSyncing ? 'Sincronizando...' : 'Sincronizar con Freency'}
          </Button>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            El asistente usara esta informacion para responder mejor en toda la app.
          </span>
        </div>
        {syncMessage && <p className="text-xs text-slate-500 dark:text-slate-400">{syncMessage}</p>}
      </Card>

      <Card className="p-6 shadow-md space-y-4">
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
          <Plus className="w-4 h-4" /> Nuevo conocimiento
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
            placeholder="Titulo o concepto principal"
          />
          <input
            value={source}
            onChange={(event) => setSource(event.target.value)}
            className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
            placeholder="Fuente o link (opcional)"
          />
          <textarea
            value={summary}
            onChange={(event) => setSummary(event.target.value)}
            className="md:col-span-2 w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white min-h-[110px]"
            placeholder="Resume el aprendizaje o proceso en pocas lineas"
          />
          <div className="md:col-span-2 flex flex-col md:flex-row gap-3">
            <div className="flex-1 flex items-center gap-2 px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
              <Tag className="w-4 h-4 text-slate-400" />
              <input
                value={tags}
                onChange={(event) => setTags(event.target.value)}
                className="w-full bg-transparent outline-none"
                placeholder="Tags separados por coma"
              />
            </div>
            <Button
              onClick={handleAdd}
              disabled={isSaving || !title.trim() || !summary.trim()}
              className="px-5"
            >
              Guardar
            </Button>
          </div>
        </div>
      </Card>

      <div className="flex items-center gap-2 px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
        <Search className="w-4 h-4 text-slate-400" />
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          className="w-full bg-transparent outline-none"
          placeholder="Busca por titulo, resumen o tag"
        />
      </div>

      {loading ? (
        <div className="text-center text-slate-500">Cargando conocimiento...</div>
      ) : filteredItems.length === 0 ? (
        <Card className="p-8 text-center text-slate-500">
          Aun no hay conocimiento guardado. Agrega tu primer insight arriba.
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredItems.map((item) => (
            <Card key={item.id} className="p-5 shadow-sm space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">{item.title}</h3>
                  <p className="text-xs text-slate-400">
                    Actualizado: {formatDate(item.updatedAt)}
                  </p>
                </div>
                <button
                  onClick={() => confirmDelete(item.id)}
                  className="text-slate-400 hover:text-red-500 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                {item.summary}
              </p>
              {item.source && (
                <div className="flex items-center gap-2 text-xs text-brand-600">
                  <LinkIcon className="w-3 h-3" />
                  <a href={item.source} target="_blank" rel="noreferrer" className="underline">
                    {item.source}
                  </a>
                </div>
              )}
              {item.tags?.length ? (
                <div className="flex flex-wrap gap-2">
                  {item.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-[10px] font-semibold uppercase tracking-wide bg-slate-100 dark:bg-slate-800 text-slate-500 px-2 py-1 rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              ) : null}
            </Card>
          ))}
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
    </div>
  );
};
