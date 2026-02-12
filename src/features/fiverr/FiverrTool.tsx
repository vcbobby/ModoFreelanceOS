import React, { useMemo, useState } from 'react';
import { addDoc, collection } from 'firebase/firestore';
import { Check, Copy, Globe } from 'lucide-react';
import { Button, Card, ConfirmationModal } from '@features/shared/ui';
import ReactMarkdown from 'react-markdown';
import { getBackendURL } from '@config/features';
import { db } from '@config/firebase';
import { getAuthHeaders } from '@/services/backend/authHeaders';
import { runWithCredits } from '@/utils/credits';

interface FiverrToolProps {
  onUsage: (cost: number) => Promise<boolean>;
  userId?: string;
}

interface FiverrPackage {
  name: string;
  desc: string;
  price: string;
  delivery: string;
}

interface FiverrResult {
  title: string;
  tags: string[];
  description: string;
  packages: Record<string, FiverrPackage>;
}

const normalizeText = (text: string) =>
  text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();

const detectEnglish = (text: string) => {
  const words = normalizeText(text).split(/\s+/).filter(Boolean);
  const englishTokens = new Set([
    'i',
    'will',
    'your',
    'website',
    'design',
    'wordpress',
    'responsive',
    'virtual',
    'assistant',
    'native',
    'french',
    'english',
    'for',
    'with',
    'create',
    'develop',
    'build',
  ]);
  const spanishTokens = new Set([
    'tu',
    'sitio',
    'web',
    'disenare',
    'ser',
    'sere',
    'asistente',
    'virtual',
    'responsivo',
    'tema',
    'con',
    'para',
    'frances',
    'ingles',
    'creare',
    'hare',
  ]);

  let en = 0;
  let es = 0;
  words.forEach((word) => {
    if (englishTokens.has(word)) en += 1;
    if (spanishTokens.has(word)) es += 1;
  });

  return en > es;
};

const formatGigTitle = (text: string, stripMarkdown: (value: string) => string) => {
  const base = stripMarkdown(text).replace(/\s+/g, ' ').trim();
  if (!base) return 'Gig en Fiverr';

  const isEnglish = detectEnglish(base);
  let title = base;

  if (isEnglish) {
    if (!/^i will\b/i.test(title)) {
      title = `I will ${title}`;
    }
  } else {
    const normalized = normalizeText(title);
    const hasVerb =
      /(disenare|ser[e]?|creare|hare|desarrollare|construire|editare|optimizare)/i.test(normalized);
    if (!hasVerb) {
      if (normalized.includes('asistente')) {
        title = `Sere tu ${title.replace(/^tu\s+/i, '')}`;
      } else if (normalized.includes('sitio web') || normalized.includes('web')) {
        title = `Disenare tu ${title.replace(/^tu\s+/i, '')}`;
      } else {
        title = `Hare ${title}`;
      }
    }
  }

  title = title.charAt(0).toUpperCase() + title.slice(1);
  if (title.length > 80) {
    title = title.slice(0, 80).trim();
  }
  return title.length < 5 ? `${title}....`.slice(0, 5) : title;
};

export const FiverrTool: React.FC<FiverrToolProps> = ({ onUsage, userId }) => {
  const [skills, setSkills] = useState('');
  const [service, setService] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<FiverrResult | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [modal, setModal] = useState({
    isOpen: false,
    title: '',
    message: '',
  });
  const BACKEND_URL = getBackendURL();
  const trimmedService = service.trim();
  const skillsList = useMemo(
    () =>
      skills
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean),
    [skills]
  );
  const canGenerate = trimmedService.length >= 50 && skillsList.length > 0;

  const stripMarkdown = (text: string) =>
    text
      .replace(/```[\s\S]*?```/g, '')
      .replace(/`([^`]+)`/g, '$1')
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .replace(/__(.*?)__/g, '$1')
      .replace(/\*(.*?)\*/g, '$1')
      .replace(/_(.*?)_/g, '$1')
      .replace(/^\s{0,3}#{1,6}\s+/gm, '')
      .replace(/^\s{0,3}[-*_]{3,}\s*$/gm, '')
      .replace(/^\s{0,3}[-+*]\s+/gm, '')
      .replace(/^\s{0,3}\d+\.\s+/gm, '')
      .replace(/\[(.*?)\]\((.*?)\)/g, '$1')
      .replace(/[ \t]{2,}/g, ' ')
      .trim();

  const handleCopy = (text: string, key: string, normalizeMarkdown = false) => {
    const output = normalizeMarkdown ? stripMarkdown(text) : text;
    navigator.clipboard.writeText(output);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1500);
  };

  const formatApiError = (errData: unknown) => {
    if (!errData || typeof errData !== 'object') return 'Error en el servidor.';
    const data = errData as { detail?: unknown };
    if (!Array.isArray(data.detail)) return JSON.stringify(errData);

    const fieldLabels: Record<string, string> = {
      gigTitle: 'Titulo del gig',
      category: 'Categoria',
      skills: 'Habilidades',
      description: 'Descripcion',
    };

    const normalizeMessage = (msg: string) =>
      msg.replace(
        'ensure this value has at least 50 characters',
        'Debe tener al menos 50 caracteres'
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

  const handleGenerate = async () => {
    if (!canGenerate) return;
    if (trimmedService.length < 50) {
      setModal({
        isOpen: true,
        title: 'Descripcion muy corta',
        message: 'La descripcion debe tener al menos 50 caracteres.',
      });
      return;
    }
    setLoading(true);
    try {
      const usage = await runWithCredits(2, onUsage, async () => {
        const authHeaders = await getAuthHeaders();
        const gigTitle = formatGigTitle(trimmedService, stripMarkdown);

        const res = await fetch(`${BACKEND_URL}/api/v1/fiverr/generate`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...authHeaders,
          },
          body: JSON.stringify({
            userId: userId || 'anon',
            gigTitle,
            category: 'General',
            skills: skillsList,
            description: trimmedService,
          }),
        });
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
          }
          throw new Error(errMsg);
        }
        const data = await res.json();
        if (!data.success) throw new Error('Error generando Gig');
        if (userId) {
          try {
            await addDoc(collection(db, 'users', userId, 'history'), {
              createdAt: new Date().toISOString(),
              category: 'fiverr',
              type: 'fiverr-gig',
              clientName: data.gigTitle || gigTitle,
              platform: 'Fiverr',
              content: data.description,
              metadata: {
                tags: data.tags,
                packages: data.packages,
                skills: skillsList,
                category: 'General',
              },
            });
          } catch (error) {
            console.warn('No se pudo guardar el gig en el historial.', error);
          }
        }
        return {
          title: data.gigTitle,
          tags: data.tags,
          description: data.description,
          packages: data.packages,
        } as FiverrResult;
      });
      if (!usage.ok || !usage.result) return;
      setResult(usage.result);
    } catch (e) {
      const message = e instanceof Error ? e.message : 'No se pudo generar el Gig.';
      setModal({
        isOpen: true,
        title: 'Error',
        message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <ConfirmationModal
        isOpen={modal.isOpen}
        onClose={() => setModal({ ...modal, isOpen: false })}
        onConfirm={() => setModal({ ...modal, isOpen: false })}
        title={modal.title}
        message={modal.message}
        confirmText="Ok"
        cancelText=""
      />

      <div className="mb-8 text-center">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center justify-center gap-2">
          <Globe className="w-6 h-6 text-green-500" /> Generador de Gigs Fiverr
        </h2>
        <p className="text-slate-600 dark:text-slate-400">
          Optimiza tu perfil para vender más. Costo: 2 Créditos.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <Card className="p-6 h-fit">
          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">
                Tus Habilidades
              </label>
              <input
                className="w-full p-3 border rounded-lg bg-white dark:bg-slate-900 dark:border-slate-700 dark:text-white"
                placeholder="Ej: Photoshop, Illustrator, Branding"
                value={skills}
                onChange={(e) => setSkills(e.target.value)}
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">
                Servicio a Ofrecer
              </label>
              <textarea
                className="w-full p-3 border rounded-lg h-32 resize-none bg-white dark:bg-slate-900 dark:border-slate-700 dark:text-white"
                placeholder="Ej: Diseño de logotipos minimalistas para startups tecnológicas."
                value={service}
                onChange={(e) => setService(e.target.value)}
              />
            </div>
            <Button
              onClick={handleGenerate}
              isLoading={loading}
              disabled={!canGenerate}
              className="w-full bg-green-600 hover:bg-green-700 text-white"
            >
              Generar Gig
            </Button>
          </div>
        </Card>

        {result && (
          <div className="space-y-6">
            <Card className="p-6 bg-white dark:bg-slate-800">
              <h3 className="font-bold text-lg mb-2 text-slate-900 dark:text-white">
                Título & SEO
              </h3>
              <div className="flex items-center gap-2 mb-2">
                <p className="text-xl font-bold text-green-600">{result.title}</p>
                <button
                  onClick={() => handleCopy(result.title, 'title', true)}
                  className="ml-auto p-1.5 rounded-md text-slate-500 hover:text-slate-800 dark:text-slate-300 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700"
                  title="Copiar titulo"
                >
                  {copiedKey === 'title' ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>
              <div className="flex flex-wrap gap-2 mb-4">
                {result.tags.map((tag: string, i: number) => (
                  <span
                    key={i}
                    className="bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-2 py-1 rounded text-xs"
                  >
                    #{tag}
                  </span>
                ))}
                <button
                  onClick={() =>
                    handleCopy(result.tags.map((tag) => `#${tag}`).join(' '), 'tags', true)
                  }
                  className="ml-auto inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs text-slate-500 hover:text-slate-800 dark:text-slate-300 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700"
                  title="Copiar hashtags"
                >
                  {copiedKey === 'tags' ? (
                    <Check className="w-3.5 h-3.5" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                  Copiar
                </button>
              </div>
              <h4 className="font-bold text-sm mb-1 text-slate-700 dark:text-slate-300">
                Descripción
              </h4>
              <div className="flex justify-end mb-2">
                <button
                  onClick={() => handleCopy(result.description, 'description', true)}
                  className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs text-slate-500 hover:text-slate-800 dark:text-slate-300 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700"
                  title="Copiar descripcion"
                >
                  {copiedKey === 'description' ? (
                    <Check className="w-3.5 h-3.5" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                  Copiar
                </button>
              </div>
              <div className="text-sm text-slate-600 dark:text-slate-400 whitespace-pre-wrap">
                <ReactMarkdown>{result.description}</ReactMarkdown>
              </div>
            </Card>

            <Card className="p-6 bg-white dark:bg-slate-800 overflow-x-auto">
              <h3 className="font-bold text-lg mb-4 text-slate-900 dark:text-white">Paquetes</h3>
              <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
                {Object.entries(result.packages).map(([key, pkg]) => (
                  <div
                    key={key}
                    className={`border rounded-xl p-4 flex flex-col ${
                      key === 'standard'
                        ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/10'
                        : 'border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    <div className="uppercase text-xs font-extrabold text-slate-400 mb-2 tracking-wider">
                      {key}
                    </div>
                    <div className="font-bold text-slate-900 dark:text-white mb-2 text-lg">
                      {pkg.name}
                    </div>
                    <div className="text-sm text-slate-600 dark:text-slate-300 mb-4 flex-1">
                      {pkg.desc}
                    </div>

                    <div className="mt-auto pt-4 border-t border-slate-200 dark:border-slate-700/50 flex justify-between items-center">
                      <span className="text-green-600 font-bold text-xl">{pkg.price}</span>
                      <span className="text-xs font-medium bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded text-slate-600 dark:text-slate-300">
                        {pkg.delivery}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};
