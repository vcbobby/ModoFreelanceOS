import React, { useState, useEffect } from 'react';
import { User, Mail, MapPin, Trash2, Download, FileText, Camera, Plus } from 'lucide-react';
import { Button, Card, ConfirmationModal } from '@features/shared/ui';
import { doc, getDoc, setDoc, addDoc, collection } from 'firebase/firestore';
import { db } from '@config/firebase';
import { downloadFile, loadHtml2Pdf } from '@features/shared/utils';

interface CVBuilderProps {
  onUsage: (cost: number) => Promise<boolean>;
  userId?: string;
}

export const CVBuilder: React.FC<CVBuilderProps> = ({ onUsage, userId }) => {
  const isE2E = import.meta.env.VITE_E2E === 'true';
  const [cvData, setCvData] = useState({
    fullName: '',
    title: '',
    email: '',
    phone: '',
    address: '',
    summary: '',
    photo: '',
    experience: [{ id: 1, role: '', company: '', dates: '', desc: '' }],
    education: [{ id: 1, degree: '', school: '', dates: '' }],
    skills: '',
  });

  const [saving, setSaving] = useState(false);
  const [modal, setModal] = useState({
    isOpen: false,
    title: '',
    message: '',
  });

  const getE2eKey = (id?: string) => `e2e_cv_${id || 'anon'}`;
  const loadE2eCv = () => {
    if (!userId) return null;
    try {
      const raw = localStorage.getItem(getE2eKey(userId));
      return raw ? (JSON.parse(raw) as typeof cvData) : null;
    } catch (error) {
      console.error('Error leyendo CV E2E', error);
      return null;
    }
  };
  const saveE2eCv = (nextData: typeof cvData) => {
    if (!userId) return;
    localStorage.setItem(getE2eKey(userId), JSON.stringify(nextData));
  };

  useEffect(() => {
    if (!userId) return;
    if (isE2E) {
      const cached = loadE2eCv();
      if (cached) setCvData(cached);
      return;
    }
    const loadCV = async () => {
      try {
        const docRef = doc(db, 'users', userId, 'cv_data', 'main');
        const snap = await getDoc(docRef);
        if (snap.exists()) setCvData(snap.data() as any);
      } catch (e) {
        console.error(e);
      }
    };
    loadCV();
  }, [userId]);

  const saveCV = async () => {
    if (!userId) return;
    setSaving(true);
    try {
      if (isE2E) {
        saveE2eCv(cvData);
      } else {
        await setDoc(doc(db, 'users', userId, 'cv_data', 'main'), cvData);
      }
    } catch (e) {
      console.error(e);
    }
    setSaving(false);
  };

  const updateField = (field: string, value: any) =>
    setCvData((prev) => ({ ...prev, [field]: value }));

  const addExp = () =>
    setCvData((prev) => ({
      ...prev,
      experience: [
        ...prev.experience,
        { id: Date.now(), role: '', company: '', dates: '', desc: '' },
      ],
    }));
  const removeExp = (id: number) =>
    setCvData((prev) => ({
      ...prev,
      experience: prev.experience.filter((e) => e.id !== id),
    }));
  const updateExp = (id: number, field: string, value: string) =>
    setCvData((prev) => ({
      ...prev,
      experience: prev.experience.map((e) => (e.id === id ? { ...e, [field]: value } : e)),
    }));

  const addEdu = () =>
    setCvData((prev) => ({
      ...prev,
      education: [...prev.education, { id: Date.now(), degree: '', school: '', dates: '' }],
    }));
  const removeEdu = (id: number) =>
    setCvData((prev) => ({
      ...prev,
      education: prev.education.filter((e) => e.id !== id),
    }));
  const updateEdu = (id: number, field: string, value: string) =>
    setCvData((prev) => ({
      ...prev,
      education: prev.education.map((e) => (e.id === id ? { ...e, [field]: value } : e)),
    }));

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => updateField('photo', reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleDownloadCV = async () => {
    await saveCV();
    const element = document.getElementById('cv-preview');

    const opt = {
      // TRUCO: Solo margen Arriba y Abajo en el PDF (10mm).
      // Izquierda y Derecha (0) se manejan con Padding CSS interno para evitar cortes.
      margin: [10, 0, 10, 0],
      filename: `CV-${cvData.fullName.replace(/\s+/g, '-')}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: {
        scale: 2, // Buena calidad
        useCORS: true,
        letterRendering: true,
        scrollY: 0,
      },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      pagebreak: { mode: ['avoid-all', 'css', 'legacy'] },
    };

    try {
      const html2pdf = await loadHtml2Pdf();
      const pdfDataUri = await html2pdf().set(opt).from(element).outputPdf('datauristring');
      await downloadFile(pdfDataUri, opt.filename);

      if (userId && !isE2E) {
        // ... (tu código de historial sigue igual)
        addDoc(collection(db, 'users', userId, 'history'), {
          createdAt: new Date().toISOString(),
          category: 'proposal',
          type: 'cv',
          clientName: 'Mi Curriculum',
          content: 'CV Generado y Descargado',
        });
      }
    } catch (e) {
      setModal({
        isOpen: true,
        title: 'Error',
        message: 'No se pudo generar el PDF.',
      });
    }
  };

  return (
    <div className="max-w-7xl mx-auto pb-20">
      <ConfirmationModal
        isOpen={modal.isOpen}
        onClose={() => setModal({ ...modal, isOpen: false })}
        onConfirm={() => setModal({ ...modal, isOpen: false })}
        title={modal.title}
        message={modal.message}
      />

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <FileText className="w-6 h-6 text-brand-600" /> Constructor CV
        </h2>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* COLUMNA IZQUIERDA: EDITOR */}
        <div className="space-y-6">
          {/* ... (Tus cards de inputs siguen igual, no cambiaron) ... */}
          <Card className="p-6 bg-white dark:bg-slate-800">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold dark:text-white">Datos Personales</h3>
              <label className="cursor-pointer bg-slate-100 dark:bg-slate-700 p-2 rounded-full hover:bg-slate-200 transition-colors">
                <Camera className="w-4 h-4 text-slate-600 dark:text-slate-300" />
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handlePhotoUpload}
                />
              </label>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <input
                className="p-2 border rounded dark:bg-slate-900 dark:border-slate-700 dark:text-white"
                placeholder="Nombre Completo"
                value={cvData.fullName}
                onChange={(e) => updateField('fullName', e.target.value)}
              />
              <input
                className="p-2 border rounded dark:bg-slate-900 dark:border-slate-700 dark:text-white"
                placeholder="Título Profesional"
                value={cvData.title}
                onChange={(e) => updateField('title', e.target.value)}
              />
              <input
                className="p-2 border rounded dark:bg-slate-900 dark:border-slate-700 dark:text-white"
                placeholder="Email"
                value={cvData.email}
                onChange={(e) => updateField('email', e.target.value)}
              />
              <input
                className="p-2 border rounded dark:bg-slate-900 dark:border-slate-700 dark:text-white"
                placeholder="Teléfono"
                value={cvData.phone}
                onChange={(e) => updateField('phone', e.target.value)}
              />
              <input
                className="p-2 border rounded col-span-2 dark:bg-slate-900 dark:border-slate-700 dark:text-white"
                placeholder="Dirección / Ciudad"
                value={cvData.address}
                onChange={(e) => updateField('address', e.target.value)}
              />
              <textarea
                className="p-2 border rounded col-span-2 h-24 dark:bg-slate-900 dark:border-slate-700 dark:text-white"
                placeholder="Perfil Profesional (Resumen)"
                value={cvData.summary}
                onChange={(e) => updateField('summary', e.target.value)}
              />
            </div>
          </Card>

          <Card className="p-6 bg-white dark:bg-slate-800">
            <div className="flex justify-between mb-4">
              <h3 className="font-bold dark:text-white">Experiencia</h3>
              <button
                onClick={addExp}
                className="text-xs bg-brand-100 text-brand-700 px-2 py-1 rounded hover:bg-brand-200"
              >
                + Agregar
              </button>
            </div>
            {cvData.experience.map((exp) => (
              <div
                key={exp.id}
                className="mb-4 border-b pb-4 last:border-0 dark:border-slate-700 relative group"
              >
                <button
                  onClick={() => removeExp(exp.id)}
                  className="absolute top-0 right-0 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <div className="grid grid-cols-2 gap-2 mb-2">
                  <input
                    className="p-2 border rounded text-sm dark:bg-slate-900 dark:border-slate-700 dark:text-white"
                    placeholder="Cargo"
                    value={exp.role}
                    onChange={(e) => updateExp(exp.id, 'role', e.target.value)}
                  />
                  <input
                    className="p-2 border rounded text-sm dark:bg-slate-900 dark:border-slate-700 dark:text-white"
                    placeholder="Empresa"
                    value={exp.company}
                    onChange={(e) => updateExp(exp.id, 'company', e.target.value)}
                  />
                </div>
                <input
                  className="w-full p-2 border rounded text-sm mb-2 dark:bg-slate-900 dark:border-slate-700 dark:text-white"
                  placeholder="Fechas"
                  value={exp.dates}
                  onChange={(e) => updateExp(exp.id, 'dates', e.target.value)}
                />
                <textarea
                  className="w-full p-2 border rounded text-sm h-20 dark:bg-slate-900 dark:border-slate-700 dark:text-white"
                  placeholder="Descripción..."
                  value={exp.desc}
                  onChange={(e) => updateExp(exp.id, 'desc', e.target.value)}
                />
              </div>
            ))}
          </Card>

          <Card className="p-6 bg-white dark:bg-slate-800">
            <div className="flex justify-between mb-4">
              <h3 className="font-bold dark:text-white">Educación</h3>
              <button
                onClick={addEdu}
                className="text-xs bg-brand-100 text-brand-700 px-2 py-1 rounded hover:bg-brand-200"
              >
                + Agregar
              </button>
            </div>
            {cvData.education.map((edu) => (
              <div
                key={edu.id}
                className="mb-4 border-b pb-4 last:border-0 dark:border-slate-700 relative group"
              >
                <button
                  onClick={() => removeEdu(edu.id)}
                  className="absolute top-0 right-0 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <div className="grid grid-cols-2 gap-2 mb-2">
                  <input
                    className="p-2 border rounded text-sm dark:bg-slate-900 dark:border-slate-700 dark:text-white"
                    placeholder="Título"
                    value={edu.degree}
                    onChange={(e) => updateEdu(edu.id, 'degree', e.target.value)}
                  />
                  <input
                    className="p-2 border rounded text-sm dark:bg-slate-900 dark:border-slate-700 dark:text-white"
                    placeholder="Institución"
                    value={edu.school}
                    onChange={(e) => updateEdu(edu.id, 'school', e.target.value)}
                  />
                </div>
                <input
                  className="w-full p-2 border rounded text-sm dark:bg-slate-900 dark:border-slate-700 dark:text-white"
                  placeholder="Fechas"
                  value={edu.dates}
                  onChange={(e) => updateEdu(edu.id, 'dates', e.target.value)}
                />
              </div>
            ))}
          </Card>

          <Card className="p-6 bg-white dark:bg-slate-800">
            <h3 className="font-bold mb-4 dark:text-white">Habilidades</h3>
            <textarea
              className="w-full p-3 border rounded h-24 dark:bg-slate-900 dark:border-slate-700 dark:text-white"
              placeholder="Habilidades..."
              value={cvData.skills}
              onChange={(e) => updateField('skills', e.target.value)}
            />
          </Card>

          <div className="flex gap-4">
            <Button onClick={saveCV} variant="secondary" className="flex-1" isLoading={saving}>
              Guardar Cambios
            </Button>
            <Button onClick={handleDownloadCV} className="flex-1">
              <Download className="w-4 h-4 mr-2" /> Descargar PDF
            </Button>
          </div>
        </div>

        {/* VISTA PREVIA (DERECHA) - ARREGLADA */}
        <div className="relative bg-slate-200 dark:bg-slate-900 rounded-xl border border-slate-300 dark:border-slate-700 overflow-hidden flex flex-col h-[550px] md:h-[850px] shadow-inner">
          <div className="bg-slate-300 dark:bg-slate-800 p-2 text-center text-xs font-bold text-slate-500 uppercase tracking-widest border-b border-slate-300 dark:border-slate-700 z-10 relative">
            Vista Previa (A4)
          </div>

          <div
            className="flex-1 overflow-auto bg-slate-100 dark:bg-slate-950/50 p-4 md:p-8
                        scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-600 scrollbar-track-transparent scrollbar-thumb-rounded-full"
          >
            <div className="min-w-fit mx-auto">
              {/* ESCALA RESPONSIVA */}
              <div className="origin-top transform-gpu transition-transform duration-300 scale-[0.45] sm:scale-[0.55] md:scale-[0.65] lg:scale-[0.7] xl:scale-[0.8]">
                {/* 1. WRAPPER VISUAL (Solo se ve en pantalla) */}
                {/* Aquí ponemos la sombra y el borde gris para que se vea bonito en la web */}
                <div className="shadow-2xl border border-slate-300 bg-white">
                  {/* 2. CONTENIDO IMPRIMIBLE (Esto es lo que lee html2pdf) */}
                  {/* Sin bordes, sin sombras, tamaño exacto */}
                  <div
                    id="cv-preview"
                    className="bg-white text-slate-800 box-border"
                    style={{
                      width: '210mm',
                      minHeight: '297mm',
                      // Padding lateral de 15mm sirve de margen izquierdo/derecho seguro
                      // Padding vertical se suma al margen del PDF para dar aire
                      padding: '15mm 20mm',
                      fontFamily: 'Inter, sans-serif',
                      fontSize: '11pt',
                      lineHeight: '1.5',
                      // IMPORTANTE: Sin borde aquí para que no salga en el PDF
                    }}
                  >
                    {/* Header */}
                    <div className="border-b-2 border-slate-800 pb-6 mb-8 flex gap-8 items-center page-break-inside-avoid">
                      {cvData.photo && (
                        <img
                          src={cvData.photo}
                          alt="Profile"
                          className="w-32 h-32 rounded-full object-cover border-4 border-slate-100 shadow-sm shrink-0"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <h1 className="text-3xl font-extrabold uppercase tracking-tight text-slate-900 leading-tight mb-1">
                          {cvData.fullName || 'Tu Nombre'}
                        </h1>
                        <p className="text-xl text-brand-700 font-medium mb-3">
                          {cvData.title || 'Título Profesional'}
                        </p>
                        <div className="flex flex-wrap gap-y-2 gap-x-4 text-sm text-slate-600">
                          {cvData.email && (
                            <span className="flex items-center gap-1.5">
                              <Mail className="w-4 h-4 text-brand-600" /> {cvData.email}
                            </span>
                          )}
                          {cvData.phone && (
                            <span className="flex items-center gap-1.5">Tel: {cvData.phone}</span>
                          )}
                          {cvData.address && (
                            <span className="flex items-center gap-1.5">
                              <MapPin className="w-4 h-4 text-brand-600" /> {cvData.address}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Contenido */}
                    {cvData.summary && (
                      <div className="mb-8 page-break-inside-avoid">
                        <h3 className="font-bold uppercase text-slate-900 border-b-2 border-slate-100 mb-3 pb-1 text-sm tracking-widest">
                          Perfil
                        </h3>
                        <p className="text-justify text-sm text-slate-700">{cvData.summary}</p>
                      </div>
                    )}

                    <div className="mb-8">
                      <h3 className="font-bold uppercase text-slate-900 border-b-2 border-slate-100 mb-4 pb-1 text-sm tracking-widest page-break-after-avoid">
                        Experiencia Profesional
                      </h3>
                      {cvData.experience.map((exp) => (
                        <div key={exp.id} className="mb-6 last:mb-0 page-break-inside-avoid">
                          <div className="flex justify-between items-baseline mb-1">
                            <h4 className="font-bold text-base text-slate-900">{exp.role}</h4>
                            <span className="text-xs text-slate-500 font-medium italic shrink-0 ml-4 bg-slate-100 px-2 py-0.5 rounded">
                              {exp.dates}
                            </span>
                          </div>
                          <p className="text-brand-700 font-semibold text-sm mb-2">{exp.company}</p>
                          <p className="text-sm text-slate-600 whitespace-pre-wrap text-justify">
                            {exp.desc}
                          </p>
                        </div>
                      ))}
                    </div>

                    {cvData.education.length > 0 && cvData.education[0].degree && (
                      <div className="mb-8 page-break-inside-avoid">
                        <h3 className="font-bold uppercase text-slate-900 border-b-2 border-slate-100 mb-4 pb-1 text-sm tracking-widest">
                          Formación
                        </h3>
                        {cvData.education.map((edu) => (
                          <div key={edu.id} className="mb-3 page-break-inside-avoid">
                            <div className="flex justify-between items-baseline">
                              <h4 className="font-bold text-sm text-slate-900">{edu.degree}</h4>
                              <span className="text-xs text-slate-500 italic shrink-0 ml-4">
                                {edu.dates}
                              </span>
                            </div>
                            <p className="text-slate-600 text-sm">{edu.school}</p>
                          </div>
                        ))}
                      </div>
                    )}

                    {cvData.skills && (
                      <div className="page-break-inside-avoid">
                        <h3 className="font-bold uppercase text-slate-900 border-b-2 border-slate-100 mb-3 pb-1 text-sm tracking-widest">
                          Habilidades
                        </h3>
                        <p className="text-sm text-slate-700 leading-relaxed">{cvData.skills}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
