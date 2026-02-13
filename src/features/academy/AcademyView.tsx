import React, { useEffect, useState } from 'react';
import { GraduationCap, ChevronDown, ChevronRight, Trash2 } from 'lucide-react';
import { Button, Card, ConfirmationModal } from '@features/shared/ui';
import ReactMarkdown from 'react-markdown';
import { doc, getDoc, setDoc, deleteDoc } from 'firebase/firestore';
import { db } from '@config/firebase';
import { getBackendURL } from '@config/features';
import { getAuthHeaders } from '@/services/backend/authHeaders';
import { runWithCredits } from '@/utils/credits';

interface AcademyViewProps {
  onUsage: (cost: number) => Promise<boolean>;
  userId?: string;
}

interface CourseModule {
  title: string;
  content: string;
}

interface Course {
  title: string;
  description: string;
  modules: CourseModule[];
}

interface GenerateCourseResponse {
  success: boolean;
  course: Course;
}

export const AcademyView: React.FC<AcademyViewProps> = ({ onUsage, userId }) => {
  const [topic, setTopic] = useState('');
  const [level, setLevel] = useState('Principiante');
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(false);
  const [expandedModule, setExpandedModule] = useState<number | null>(0);

  const [modal, setModal] = useState({
    isOpen: false,
    title: '',
    message: '',
  });
  const BACKEND_URL = getBackendURL();

  useEffect(() => {
    // Si no hay userId, no hacemos nada
    if (!userId) return;

    const loadSavedCourse = async () => {
      try {
        // Referencia directa al curso activo "current"
        const docRef = doc(db, 'users', userId, 'academy', 'current');
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setCourse(docSnap.data() as Course);
        }
      } catch (error) {
        void error;
      }
    };

    loadSavedCourse();
  }, [userId]); // Solo se ejecuta cuando cambia el userId (al login)

  const handleGenerate = async () => {
    if (!topic || !level || !userId) {
      setModal({
        isOpen: true,
        title: 'Campos requeridos',
        message: 'Por favor completa el tema, nivel y asegúrate de estar logueado.',
      });
      return;
    }

    setLoading(true);
    setCourse(null);

    try {
      // Borra el curso anterior antes de guardar el nuevo
      if (userId) {
        try {
          await deleteDoc(doc(db, 'users', userId, 'academy', 'current'));
        } catch (e) {
          setModal({
            isOpen: true,
            title: 'Error al borrar curso',
            message:
              'No se pudo borrar el curso anterior en Firestore. Revisa tus permisos o conexión.',
          });
        }
      }
      const usage = await runWithCredits(3, onUsage, async () => {
        const payload = {
          topic,
          level,
          userId: userId || '',
        };
        const authHeaders = await getAuthHeaders();
        const res = await fetch(`${BACKEND_URL}/api/v1/academy/generate-course`, {
          method: 'POST',
          headers: {
            ...authHeaders,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });
        let data: any = null;
        let rawText = '';
        try {
          rawText = await res.text();
          data = JSON.parse(rawText);
          console.log('Curso generado:', data);
        } catch (jsonErr) {
          if (!res.ok) {
            throw new Error(rawText || 'Respuesta inválida del servidor');
          }
          throw new Error('Respuesta inválida del servidor');
        }
        if (!res.ok) {
          throw new Error(data?.message || rawText || 'Error desconocido del backend');
        }
        if (!data.success) {
          throw new Error(data?.message || 'La IA no devolvió un resultado exitoso');
        }
        return data.course || data.data;
      });

      if (!usage.ok || !usage.result) return;
      const newCourse = usage.result;
      setCourse(newCourse);

      if (userId) {
        try {
          await setDoc(doc(db, 'users', userId, 'academy', 'current'), newCourse);
          console.log('Nuevo curso guardado correctamente en Firestore');
        } catch (saveError) {
          console.error('Error al guardar el nuevo curso:', saveError);
          setModal({
            isOpen: true,
            title: 'Error al guardar curso',
            message:
              'No se pudo guardar el nuevo curso en Firestore. Revisa tus permisos o conexión.',
          });
        }
      }
    } catch (e: any) {
      setModal({
        isOpen: true,
        title: 'Error de Generación',
        message:
          e?.message ||
          'La IA tardó demasiado o hubo un error de conexión. Por favor intenta un tema más sencillo.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleNewTopic = async () => {
    setCourse(null);
    setTopic('');
    setExpandedModule(0);
    if (userId) {
      try {
        await deleteDoc(doc(db, 'users', userId, 'academy', 'current'));
      } catch (e) {
        void e;
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto pb-20">
      <ConfirmationModal
        isOpen={modal.isOpen}
        onClose={() => setModal({ ...modal, isOpen: false })}
        onConfirm={() => setModal({ ...modal, isOpen: false })}
        title={modal.title}
        message={modal.message}
      />

      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center justify-center gap-2">
          <GraduationCap className="w-6 h-6 text-brand-600" /> Academia IA
        </h2>
        <p className="text-slate-600 dark:text-slate-400">
          Aprende cualquier habilidad técnica freelance en segundos.
          <span className="bg-brand-100 dark:bg-brand-900/30 text-brand-800 dark:text-brand-300 text-xs font-bold px-2 py-0.5 rounded ml-2">
            Costo: 3 Créditos
          </span>
        </p>
      </div>

      {!course ? (
        <Card className="p-8 max-w-lg mx-auto shadow-lg bg-white dark:bg-slate-800">
          <div className="space-y-4">
            <div>
              <label className="text-sm font-bold text-slate-700 dark:text-slate-300">
                ¿Qué quieres aprender hoy?
              </label>
              <input
                className="w-full p-3 border rounded-lg mt-1 dark:bg-slate-900 dark:border-slate-700 dark:text-white"
                placeholder="Ej: SEO para e-commerce, React, Diseño de Logos..."
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-bold text-slate-700 dark:text-slate-300">
                Nivel Actual
              </label>
              <select
                className="w-full p-3 border rounded-lg mt-1 dark:bg-slate-900 dark:border-slate-700 dark:text-white"
                value={level}
                onChange={(e) => setLevel(e.target.value)}
              >
                <option>Principiante</option>
                <option>Intermedio</option>
                <option>Avanzado</option>
              </select>
            </div>
            <Button
              onClick={handleGenerate}
              isLoading={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700"
            >
              {loading ? 'Diseñando Plan de Estudios...' : 'Generar Curso Personalizado'}
            </Button>
          </div>
        </Card>
      ) : (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* Layout Móvil Corregido */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white leading-tight">
                {course.title}
              </h1>
              <p className="text-slate-500 dark:text-slate-400 mt-2">{course.description}</p>
            </div>
            <Button
              variant="outline"
              onClick={handleNewTopic}
              className="shrink-0 w-full md:w-auto"
            >
              <Trash2 className="w-4 h-4 mr-2" /> Nuevo Tema
            </Button>
          </div>

          <div className="space-y-4">
            {course.modules.map((mod, i) => (
              <div
                key={i}
                className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden bg-white dark:bg-slate-800 shadow-sm transition-all"
              >
                <button
                  onClick={() => setExpandedModule(expandedModule === i ? null : i)}
                  className="w-full flex justify-between items-center p-5 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors text-left"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shrink-0 ${
                        expandedModule === i
                          ? 'bg-indigo-600 text-white'
                          : 'bg-slate-100 dark:bg-slate-700 text-slate-500'
                      }`}
                    >
                      {i + 1}
                    </div>
                    <span className="font-bold text-lg text-slate-800 dark:text-white">
                      {mod.title}
                    </span>
                  </div>
                  {expandedModule === i ? (
                    <ChevronDown className="w-5 h-5 text-slate-400" />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-slate-400" />
                  )}
                </button>

                {expandedModule === i && (
                  <div className="p-6 border-t border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-900">
                    <div className="prose prose-slate dark:prose-invert max-w-none mb-8 text-sm leading-relaxed">
                      <strong>Descripción del módulo:</strong>
                      <p>{mod.description}</p>
                      {mod.classes && mod.classes.length > 0 && (
                        <div className="mt-4">
                          <strong>Clases:</strong>
                          {mod.classes.map((clase, idx) => (
                            <div key={idx} className="mb-4">
                              <h3 className="text-base font-semibold text-indigo-700 dark:text-indigo-300 mb-1">
                                {clase.title}
                              </h3>
                              <ReactMarkdown
                                components={{
                                  code({ node: _node, className, children, ...props }) {
                                    void className;
                                    return (
                                      <span className="block bg-slate-900 text-slate-50 p-4 rounded-lg my-4 overflow-x-auto border border-slate-700 shadow-sm font-mono text-xs">
                                        <code className={className} {...props}>
                                          {children}
                                        </code>
                                      </span>
                                    );
                                  },
                                  ul: ({ node: _node, ...props }) => (
                                    <ul className="list-disc pl-5 space-y-1 mb-4" {...props} />
                                  ),
                                  li: ({ node: _node, ...props }) => (
                                    <li className="pl-1" {...props} />
                                  ),
                                  strong: ({ node: _node, ...props }) => (
                                    <strong
                                      className="font-bold text-slate-900 dark:text-white"
                                      {...props}
                                    />
                                  ),
                                }}
                              >
                                {Array.isArray(clase.content)
                                  ? clase.content.join('\n')
                                  : clase.content}
                              </ReactMarkdown>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
