import React, { useState } from 'react';
import {
  Upload,
  Wand2,
  Linkedin,
  Instagram,
  Globe,
  Image as ImageIcon,
  Copy,
  Check,
  Briefcase, // Icono para plataformas de trabajo
  Monitor,
  PenTool,
} from 'lucide-react';
import { Button, Card, ConfirmationModal } from '@features/shared/ui';
import ReactMarkdown from 'react-markdown';
import { addDoc, collection } from 'firebase/firestore';
import { getBackendURL } from '@config/features';
import { db } from '@config/firebase';
import { getAuthHeaders } from '@/services/backend/authHeaders';
import { runWithCredits } from '@/utils/credits';

interface PortfolioToolProps {
  onUsage: (cost: number) => Promise<boolean>;
  userId?: string;
}

export const PortfolioTool: React.FC<PortfolioToolProps> = ({ onUsage, userId }) => {
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [platform, setPlatform] = useState('LinkedIn');
  const [generatedText, setGeneratedText] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  // Estado del Modal
  const [modal, setModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    isDanger: false,
    action: () => {},
    singleButton: false,
  });

  const showModal = (title: string, message: string, isDanger = false, singleButton = true) => {
    setModal({
      isOpen: true,
      title,
      message,
      isDanger,
      singleButton,
      action: () => setModal((prev) => ({ ...prev, isOpen: false })),
    });
  };

  const BACKEND_URL = getBackendURL();

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleGenerate = async () => {
    if (!image || !title || !description || !userId) return;

    setLoading(true);
    setGeneratedText('');

    try {
      const usage = await runWithCredits(3, onUsage, async () => {
        const formData = new FormData();
        formData.append('projectImage', image);
        formData.append('userId', userId);
        formData.append('title', title);
        formData.append('description', description);
        formData.append('platform', platform);

        const authHeaders = await getAuthHeaders();
        const res = await fetch(`${BACKEND_URL}/api/v1/portfolios/generate`, {
          method: 'POST',
          headers: authHeaders,
          body: formData,
        });

        if (!res.ok) throw new Error('Error de conexión con el servidor');

        const data = await res.json();
        if (!data.success) throw new Error('Error de generación');
        return {
          text: data.text as string,
          imageUrl: typeof data.image_url === 'string' ? data.image_url : undefined,
        };
      });

      if (!usage.ok || !usage.result) return;
      setGeneratedText(usage.result.text);

      if (userId) {
        try {
          await addDoc(collection(db, 'users', userId, 'history'), {
            createdAt: new Date().toISOString(),
            category: 'portfolio',
            type: 'portfolio-gen',
            clientName: title,
            platform,
            content: usage.result.text,
            imageUrl: usage.result.imageUrl,
            metadata: {
              title,
              platform,
            },
          });
        } catch (error) {
          console.warn('No se pudo guardar el portafolio en el historial.', error);
        }
      }
    } catch (error) {
      console.error(error);
      showModal(
        'Error de Generación',
        'Hubo un problema al crear tu portafolio. Verifica que el backend esté activo.',
        true
      );
    } finally {
      setLoading(false);
    }
  };

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
      .replace(/^[ \t]+|[ \t]+$/gm, '')
      .replace(/[ \t]{2,}/g, ' ')
      .trim();

  const handleCopy = () => {
    navigator.clipboard.writeText(stripMarkdown(generatedText));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Lista de plataformas disponibles
  const platforms = [
    {
      name: 'LinkedIn',
      icon: <Linkedin className="w-4 h-4" />,
      type: 'social',
    },
    {
      name: 'Instagram',
      icon: <Instagram className="w-4 h-4" />,
      type: 'social',
    },
    {
      name: 'Behance',
      icon: <Globe className="w-4 h-4" />,
      type: 'social',
    },
    {
      name: 'Workana',
      icon: <Monitor className="w-4 h-4" />,
      type: 'freelance',
    },
    {
      name: 'Upwork',
      icon: <Briefcase className="w-4 h-4" />,
      type: 'freelance',
    },
    {
      name: 'Freelancer',
      icon: <PenTool className="w-4 h-4" />,
      type: 'freelance',
    },
  ];

  return (
    <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
      <ConfirmationModal
        isOpen={modal.isOpen}
        onClose={() => setModal({ ...modal, isOpen: false })}
        onConfirm={modal.action}
        title={modal.title}
        message={modal.message}
        isDanger={modal.isDanger}
        confirmText="Entendido"
        cancelText={modal.singleButton ? '' : 'Cancelar'}
      />

      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Wand2 className="w-6 h-6 text-brand-600" />
            Generador de Portafolios
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Crea descripciones profesionales para tus perfiles.
            <span className="bg-brand-100 dark:bg-brand-900/30 text-brand-800 dark:text-brand-300 text-xs font-bold px-2 py-0.5 rounded ml-2">
              Costo: 3 Créditos
            </span>
          </p>
        </div>

        <Card className="p-6 shadow-md space-y-4">
          {/* Subir Imagen */}
          <div
            className={`border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl h-48 flex flex-col items-center justify-center relative cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors ${
              preview ? 'bg-slate-100 dark:bg-slate-900' : ''
            }`}
          >
            <input
              type="file"
              accept="image/*"
              className="absolute inset-0 opacity-0 cursor-pointer"
              onChange={handleImageChange}
            />
            {preview ? (
              <img src={preview} alt="Preview" className="h-full w-full object-contain p-2" />
            ) : (
              <>
                <Upload className="w-8 h-8 text-slate-400 mb-2" />
                <p className="text-sm font-bold text-slate-600 dark:text-slate-400">
                  Sube la imagen del proyecto
                </p>
              </>
            )}
          </div>

          {/* Inputs */}
          <div>
            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">
              Título del Proyecto
            </label>
            <input
              type="text"
              placeholder="Ej: Rediseño Web para Clínica Dental"
              className="w-full p-3 border border-slate-300 dark:border-slate-600 rounded-lg mt-1 bg-white dark:bg-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">
              ¿Qué hiciste? (Borrador rápido)
            </label>
            <textarea
              placeholder="Ej: El cliente tenía una web vieja. Usé colores azules para transmitir confianza. Aumentó sus ventas un 20%."
              className="w-full p-3 border border-slate-300 dark:border-slate-600 rounded-lg mt-1 h-24 resize-none bg-white dark:bg-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-2 block">
              Plataforma Destino
            </label>
            <div className="grid grid-cols-3 gap-2">
              {platforms.map((p) => (
                <button
                  key={p.name}
                  onClick={() => setPlatform(p.name)}
                  className={`py-2 px-1 rounded-lg text-xs font-bold border transition-all flex flex-col items-center justify-center gap-1 ${
                    platform === p.name
                      ? 'bg-brand-50 dark:bg-brand-900/30 border-brand-500 text-brand-700 dark:text-brand-300'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  {p.icon}
                  {p.name}
                </button>
              ))}
            </div>
          </div>

          <Button
            onClick={handleGenerate}
            isLoading={loading}
            disabled={!image || !title || !description}
            className="w-full"
          >
            {loading ? 'Redactando...' : 'Generar Caso de Estudio'}
          </Button>
        </Card>
      </div>

      {/* Resultado */}
      <div className="bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 min-h-[500px]">
        {!generatedText ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 text-center opacity-60">
            <ImageIcon className="w-16 h-16 mb-4" />
            <p>Selecciona una plataforma y genera tu descripción.</p>
          </div>
        ) : (
          <div className="h-full flex flex-col">
            <div className="flex justify-between items-center mb-4 border-b border-slate-200 dark:border-slate-700 pb-3">
              <div>
                <h3 className="font-bold text-slate-800 dark:text-white">Copy para {platform}</h3>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">
                  {platform === 'Workana' || platform === 'Upwork'
                    ? 'Formato optimizado para propuestas.'
                    : 'Formato optimizado para engagement.'}
                </p>
              </div>
              <button
                onClick={handleCopy}
                className="text-xs font-bold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1"
              >
                {copied ? (
                  <>
                    <Check className="w-3 h-3" /> Copiado
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" /> Copiar Texto
                  </>
                )}
              </button>
            </div>
            <div className="flex-1 overflow-y-auto custom-scrollbar prose prose-slate dark:prose-invert prose-sm max-w-none text-slate-700 dark:text-slate-300 whitespace-pre-line">
              <ReactMarkdown>{generatedText}</ReactMarkdown>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
