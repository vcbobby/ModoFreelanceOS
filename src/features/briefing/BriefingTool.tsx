import React, { useState } from 'react';
import { ArrowRight, ArrowLeft, Check, Briefcase, User, AlignLeft, Download } from 'lucide-react';
import { Button, Card, ConfirmationModal } from '@features/shared/ui';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '@config/firebase';
import { downloadFile, loadHtml2Pdf } from '@features/shared/utils';
import { getBackendURL } from '@config/features';
import { getAuthHeaders } from '@/services/backend/authHeaders';
import { runWithCredits } from '@/utils/credits';

interface BriefingToolProps {
  onUsage: (cost: number) => Promise<boolean>;
  userId?: string;
}

export const BriefingTool: React.FC<BriefingToolProps> = ({ onUsage, userId }) => {
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [isFinished, setIsFinished] = useState(false);

  const [modal, setModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    isDanger: false,
    action: () => {},
    singleButton: false,
  });

  const showModal = (
    title: string,
    message: string,
    isDanger = false,
    singleButton = true,
    action = () => {}
  ) => {
    setModal({
      isOpen: true,
      title,
      message,
      isDanger,
      singleButton,
      action,
    });
  };

  const [formData, setFormData] = useState({
    clientName: '',
    projectType: 'Diseño Gráfico',
    budget: '',
    deadline: '',
    goals: '',
    audience: '',
    style: '',
    agreedTasks: '',
  });

  const BACKEND_URL = getBackendURL();

  const buildChecklistContent = (tasks: string[]) =>
    tasks.length > 0
      ? tasks.map((task) => `☐ ${task}`).join('\n')
      : '☐ Revisar requerimientos del proyecto';

  const updateForm = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleDownloadPDF = async () => {
    const element = document.getElementById('brief-document-full-size'); // Usamos el ID del documento invisible
    const opt = {
      margin: 0,
      filename: `brief-${formData.clientName.replace(/\s+/g, '-').toLowerCase()}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: {
        scale: 2,
        useCORS: true,
        scrollY: 0,
        windowWidth: 1200, // Asegura renderizado completo para A4
      },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
    };

    const html2pdf = await loadHtml2Pdf();
    const pdfDataUri = await html2pdf().set(opt).from(element).outputPdf('datauristring');

    // USAR LA UTILIDAD UNIVERSAL
    await downloadFile(pdfDataUri, opt.filename);
  };

  const handleProcess = async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const fullDetails = `
                Objetivo: ${formData.goals}. 
                Audiencia: ${formData.audience}. 
                Estilo: ${formData.style}. 
                Presupuesto: ${formData.budget}. 
                Fecha límite: ${formData.deadline}.
                PUNTOS ACORDADOS / TAREAS ESPECÍFICAS: ${formData.agreedTasks}
            `;

      const usage = await runWithCredits(2, onUsage, async () => {
        const authHeaders = await getAuthHeaders();
        const response = await fetch(`${BACKEND_URL}/api/v1/briefings/checklist`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...authHeaders,
          },
          body: JSON.stringify({
            userId,
            project_type: formData.projectType,
            client_info: `Cliente: ${formData.clientName}. Presupuesto: ${formData.budget || 'A definir'}. Fecha limite: ${formData.deadline || 'A definir'}.`,
            requirements: fullDetails.trim(),
          }),
        });

        if (!response.ok) {
          const err = await response.json();
          throw new Error(err.detail || 'Error en el servidor');
        }
        const data = await response.json();
        if (!data?.success || !Array.isArray(data?.tasks)) {
          throw new Error('Respuesta invalida del servidor');
        }
        return data.tasks as string[];
      });

      if (!usage.ok || !usage.result) return;

      if (userId) {
        const checklist = buildChecklistContent(usage.result);
        try {
          await addDoc(collection(db, 'users', userId, 'notes'), {
            title: `Checklist - ${formData.clientName || 'Cliente'}`,
            content: checklist,
            color: 'bg-blue-100',
            isPinned: true,
            isPrivate: false,
            order: 0,
            createdAt: serverTimestamp(),
          });
        } catch (error) {
          console.warn('No se pudo guardar la nota del checklist.', error);
        }

        try {
          await addDoc(collection(db, 'users', userId, 'history'), {
            createdAt: new Date().toISOString(),
            category: 'briefing',
            type: 'brief-checklist',
            clientName: formData.clientName || 'Cliente',
            platform: formData.projectType,
            content: `Checklist generado con ${usage.result.length} tareas.`,
            metadata: {
              projectType: formData.projectType,
            },
          });
        } catch (error) {
          console.warn('No se pudo guardar el briefing en el historial.', error);
        }
      }

      setIsFinished(true);
    } catch (error: unknown) {
      void error;
      showModal(
        'Error de Generación',
        `No se pudo crear el checklist. Detalle: ${error instanceof Error ? error.message : 'Error en el servidor'}`,
        true,
        true
      );
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => setStep((s) => s + 1);
  const prevStep = () => setStep((s) => s - 1);

  // --- SUB-COMPONENTE: EL DOCUMENTO A4 INVISIBLE (Solo para impresión) ---
  const A4Document = () => (
    <div
      id="brief-document-full-size"
      className="bg-white text-slate-900 w-[210mm] min-h-[297mm] p-[20mm] shadow-2xl"
      style={{ fontFamily: 'Inter, sans-serif' }}
    >
      <div className="border-b-2 border-slate-900 pb-6 mb-8 flex justify-between items-start">
        <div>
          <h1 className="text-4xl font-extrabold uppercase tracking-tight mb-2">Briefing</h1>
          <p className="text-sm text-slate-500 font-medium">Documento de Requerimientos</p>
        </div>
        <div className="text-right">
          <p className="font-bold text-lg">{formData.clientName}</p>
          <p className="text-sm text-slate-500">{new Date().toLocaleDateString()}</p>
        </div>
      </div>
      <div className="space-y-10">
        <section>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 border-b border-slate-100 pb-1">
            Detalles Generales
          </h3>
          <div className="grid grid-cols-2 gap-y-6 gap-x-8">
            <div>
              <span className="block text-xs font-bold text-slate-500 mb-1">Tipo de Proyecto</span>
              <p className="text-base font-medium">{formData.projectType}</p>
            </div>
            <div>
              <span className="block text-xs font-bold text-slate-500 mb-1">Fecha Límite</span>
              <p className="text-base font-medium">{formData.deadline || 'A definir'}</p>
            </div>
            <div>
              <span className="block text-xs font-bold text-slate-500 mb-1">
                Presupuesto Estimado
              </span>
              <p className="text-base font-medium">{formData.budget || 'A definir'}</p>
            </div>
          </div>
        </section>
        <section>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 border-b border-slate-100 pb-1">
            Objetivos & Alcance
          </h3>
          <div className="bg-slate-50 p-6 rounded-lg border border-slate-100">
            <p className="text-sm leading-relaxed whitespace-pre-wrap">
              {formData.goals || 'Sin objetivos definidos.'}
            </p>
          </div>
          {/* NUEVO: PUNTOS ACORDADOS */}
          {formData.agreedTasks && (
            <div className="mb-4">
              <h4 className="text-xs font-bold text-slate-500 mb-2">
                Puntos Acordados / Entregables
              </h4>
              <div className="bg-white border border-slate-200 p-4 rounded-lg">
                <p className="text-sm whitespace-pre-wrap leading-relaxed">
                  {formData.agreedTasks}
                </p>
              </div>
            </div>
          )}
        </section>
        <section className="grid grid-cols-2 gap-8">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 border-b border-slate-100 pb-1">
              Público Objetivo
            </h3>
            <p className="text-sm leading-relaxed">{formData.audience || 'No especificado.'}</p>
          </div>
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 border-b border-slate-100 pb-1">
              Estilo Visual
            </h3>
            <p className="text-sm leading-relaxed">{formData.style || 'No especificado.'}</p>
          </div>
        </section>
      </div>
      <div className="mt-24 pt-8 border-t border-slate-200 flex justify-between items-center text-xs text-slate-400">
        <p>Generado con ModoFreelanceOS</p>
        <p>Página 1 de 1</p>
      </div>
    </div>
  );
  // --- FIN DEL DOCUMENTO A4 INVISIBLE ---

  if (isFinished) {
    return (
      <div className="max-w-5xl mx-auto pt-8 pb-20">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
            <Check className="w-8 h-8 text-green-600 dark:text-green-400" />
          </div>
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
            ¡Proyecto Iniciado!
          </h2>
          <p className="text-slate-600 dark:text-slate-300">
            Nota creada. Abajo tienes una vista previa del documento.
          </p>
        </div>

        <div className="flex justify-center gap-4 mb-8">
          <Button
            onClick={handleDownloadPDF}
            className="shadow-lg shadow-brand-200 dark:shadow-none"
          >
            <Download className="w-4 h-4 mr-2" /> Descargar PDF Oficial
          </Button>
          <Button variant="outline" onClick={() => window.location.reload()}>
            Salir
          </Button>
        </div>

        {/* VISTA PREVIA RESPONSIVE (Escala al 100% del ancho del móvil/contenedor) */}
        <Card id="brief-summary" className="p-6 md:p-8 dark:bg-slate-900 shadow-xl">
          <div className="text-slate-900 dark:text-slate-200">
            <h1 className="text-xl md:text-2xl font-bold mb-4 uppercase tracking-widest text-brand-600 dark:text-brand-400">
              Brief de Proyecto
            </h1>
            <div className="space-y-4 text-sm">
              {/* Diseño de 1 columna en móvil, 2 en desktop */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-b border-slate-200 dark:border-slate-700 pb-4">
                <div>
                  <span className="block font-bold text-xs uppercase text-slate-400">Cliente</span>
                  <p className="font-medium text-slate-700 dark:text-slate-300">
                    {formData.clientName}
                  </p>
                </div>
                <div>
                  <span className="block font-bold text-xs uppercase text-slate-400">Tipo</span>
                  <p className="font-medium text-slate-700 dark:text-slate-300">
                    {formData.projectType}
                  </p>
                </div>
                <div>
                  <span className="block font-bold text-xs uppercase text-slate-400">
                    Presupuesto
                  </span>
                  <p className="font-medium text-slate-700 dark:text-slate-300">
                    {formData.budget || 'A definir'}
                  </p>
                </div>
                <div>
                  <span className="block font-bold text-xs uppercase text-slate-400">
                    Fecha Límite
                  </span>
                  <p className="font-medium text-slate-700 dark:text-slate-300">
                    {formData.deadline || 'No definida'}
                  </p>
                </div>
              </div>
              <div className="space-y-3 pt-3">
                <h3 className="font-bold text-slate-800 dark:text-white mb-1">Objetivos:</h3>
                <p className="text-slate-600 dark:text-slate-400">{formData.goals}</p>
                <h3 className="font-bold text-slate-800 dark:text-white mb-1">Público Objetivo:</h3>
                <p className="text-slate-600 dark:text-slate-400">{formData.audience}</p>
                <h3 className="font-bold text-slate-800 dark:text-white mb-1">Estilo Clave:</h3>
                <p className="text-slate-600 dark:text-slate-400">{formData.style}</p>
              </div>
            </div>
            <div className="mt-8 pt-4 border-t border-slate-200 dark:border-slate-700 text-center text-xs text-slate-400">
              Generado por ModoFreelanceOS
            </div>
          </div>
        </Card>

        {/* Contenedor del documento A4 (INVISIBLE EN LA APP) */}
        <div className="fixed top-0 left-0 -z-50 opacity-0 pointer-events-none">
          <A4Document />
        </div>
      </div>
    );
  }

  // --- WIZARD (Pasos de formulario, sin cambios grandes) ---
  return (
    <div className="max-w-3xl mx-auto">
      <ConfirmationModal
        isOpen={modal.isOpen}
        onClose={() => setModal({ ...modal, isOpen: false })}
        onConfirm={() => {
          modal.action();
          setModal({ ...modal, isOpen: false });
        }}
        title={modal.title}
        message={modal.message}
        isDanger={modal.isDanger}
        confirmText="Entendido"
        cancelText={modal.singleButton ? '' : 'Cancelar'}
      />

      <div className="mb-8 text-center">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Briefing Inteligente</h2>
        <p className="text-slate-500 dark:text-slate-400">
          Define el proyecto y deja que la IA organice tu trabajo.
        </p>
      </div>

      <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full mb-8">
        <div
          className="bg-brand-600 h-2 rounded-full transition-all duration-300"
          style={{ width: `${((step + 1) / 4) * 100}%` }}
        />
      </div>

      <Card className="p-8 shadow-lg min-h-[400px] flex flex-col relative dark:bg-slate-800 dark:border-slate-700">
        {/* PASO 1 */}
        {step === 0 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <h3 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
              <User className="w-5 h-5 text-brand-500" /> Datos del Cliente
            </h3>
            <div>
              <label className="text-sm font-bold text-slate-600 dark:text-slate-400">
                Nombre del Cliente / Empresa
              </label>
              <input
                className="w-full p-3 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 dark:text-white rounded-lg mt-1 outline-none focus:ring-2 focus:ring-brand-500"
                value={formData.clientName}
                onChange={(e) => updateForm('clientName', e.target.value)}
                placeholder="Ej: Pizza Planet"
                autoFocus
              />
            </div>
            <div>
              <label className="text-sm font-bold text-slate-600 dark:text-slate-400">
                Tipo de Proyecto
              </label>
              <select
                className="w-full p-3 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 dark:text-white rounded-lg mt-1 outline-none"
                value={formData.projectType}
                onChange={(e) => updateForm('projectType', e.target.value)}
              >
                <option>Diseño Gráfico (Logo/Branding)</option>
                <option>Desarrollo Web</option>
                <option>Marketing / Redes Sociales</option>
                <option>Redacción / Traducción</option>
                <option>Edición de Video</option>
                <option>Otro</option>
              </select>
            </div>
          </div>
        )}

        {/* PASO 2 */}
        {step === 1 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <h3 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-brand-500" /> Alcance y Presupuesto
            </h3>
            <div>
              <label className="text-sm font-bold text-slate-600 dark:text-slate-400">
                Presupuesto Estimado
              </label>
              <input
                className="w-full p-3 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 dark:text-white rounded-lg mt-1 outline-none"
                value={formData.budget}
                onChange={(e) => updateForm('budget', e.target.value)}
                placeholder="Ej: $500 - $1000 USD"
              />
            </div>
            <div>
              <label className="text-sm font-bold text-slate-600 dark:text-slate-400">
                Fecha de Entrega (Deadline)
              </label>
              <input
                type="date"
                className="w-full p-3 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 dark:text-white rounded-lg mt-1 outline-none"
                value={formData.deadline}
                onChange={(e) => updateForm('deadline', e.target.value)}
              />
            </div>
          </div>
        )}

        {/* PASO 3 */}
        {step === 2 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <h3 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
              <AlignLeft className="w-5 h-5 text-brand-500" /> Detalles Creativos
            </h3>
            <div>
              <label className="text-sm font-bold text-slate-600 dark:text-slate-400">
                ¿Cuál es el objetivo principal?
              </label>
              <textarea
                className="w-full p-3 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 dark:text-white rounded-lg mt-1 h-20 resize-none outline-none"
                value={formData.goals}
                onChange={(e) => updateForm('goals', e.target.value)}
                placeholder="Ej: Aumentar ventas, renovar imagen..."
              />
            </div>
            <div>
              <label className="text-sm font-bold text-slate-600 dark:text-slate-400">
                ¿A quién va dirigido? (Audiencia)
              </label>
              <input
                className="w-full p-3 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 dark:text-white rounded-lg mt-1 outline-none"
                value={formData.audience}
                onChange={(e) => updateForm('audience', e.target.value)}
                placeholder="Ej: Jóvenes de 18-25 años..."
              />
            </div>
            <div>
              <label className="text-sm font-bold text-slate-600 dark:text-slate-400">
                Puntos Acordados / Tareas Específicas
              </label>
              <textarea
                className="w-full p-3 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 dark:text-white rounded-lg mt-1 h-32 resize-none outline-none focus:ring-2 focus:ring-brand-500"
                value={formData.agreedTasks}
                onChange={(e) => updateForm('agreedTasks', e.target.value)}
                placeholder="Ej: - Entregar 3 bocetos iniciales&#10;- Incluir versión blanco y negro&#10;- Formato final en SVG y PNG"
              />
              <p className="text-[10px] text-slate-400 mt-1">
                La IA usará esto para crear tu checklist.
              </p>
            </div>
            <div>
              <label className="text-sm font-bold text-slate-600 dark:text-slate-400">
                Estilo Visual / Tono
              </label>
              <input
                className="w-full p-3 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 dark:text-white rounded-lg mt-1 outline-none"
                value={formData.style}
                onChange={(e) => updateForm('style', e.target.value)}
                placeholder="Ej: Minimalista, Corporativo, Divertido..."
              />
            </div>
          </div>
        )}

        {/* PASO 4 */}
        {step === 3 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300 text-center">
            <h3 className="text-2xl font-bold text-slate-800 dark:text-white mb-4">¿Todo listo?</h3>
            <p className="text-slate-600 dark:text-slate-300 mb-8">
              Al confirmar, generaremos el PDF del brief y la IA creará automáticamente las tareas
              en tu tablero.
            </p>
            <div className="bg-brand-50 dark:bg-brand-900/20 p-4 rounded-xl text-left border border-brand-100 dark:border-brand-800">
              <p className="font-bold text-brand-900 dark:text-brand-100 text-sm mb-2">Resumen:</p>
              <ul className="text-sm text-brand-800 dark:text-brand-200 list-disc list-inside space-y-1">
                <li>
                  <strong>Cliente:</strong> {formData.clientName}
                </li>
                <li>
                  <strong>Proyecto:</strong> {formData.projectType}
                </li>
                <li>
                  <strong>Objetivo:</strong> {formData.goals}
                </li>
              </ul>
            </div>
          </div>
        )}

        {/* NAVEGACIÓN */}
        <div className="mt-auto pt-8 flex justify-between border-t border-slate-100 dark:border-slate-700">
          <Button variant="ghost" onClick={prevStep} disabled={step === 0 || loading}>
            <ArrowLeft className="w-4 h-4 mr-2" /> Atrás
          </Button>

          {step < 3 ? (
            <Button onClick={nextStep} disabled={!formData.clientName}>
              Siguiente <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button
              onClick={handleProcess}
              isLoading={loading}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              {loading ? 'Generando Checklist...' : 'Finalizar y Crear Tareas'}
            </Button>
          )}
        </div>
      </Card>
      {/* Contenedor del documento A4 (INVISIBLE EN LA APP) */}
      {isFinished && (
        <div className="fixed top-0 left-0 -z-50 opacity-0 pointer-events-none">
          <A4Document />
        </div>
      )}
    </div>
  );
};
