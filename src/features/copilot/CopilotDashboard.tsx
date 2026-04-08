import React, { useEffect, useState } from 'react';
import { Plus, Target, Briefcase, Bot, Layout, Loader2, ArrowRight } from 'lucide-react';
import { Button, Card } from '@features/shared/ui';
import { getCopilotProjects, startCopilotProject, CopilotProject } from './copilotApi';
import { runWithCredits } from '@/utils/credits';

interface CopilotDashboardProps {
  onUsage: (cost: number) => Promise<boolean>;
  userId?: string;
  onOpenProject: (id: string) => void;
}

export const CopilotDashboard: React.FC<CopilotDashboardProps> = ({ onUsage, userId, onOpenProject }) => {
  const [projects, setProjects] = useState<CopilotProject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Create Form State
  const [showCreate, setShowCreate] = useState(false);
  const [profession, setProfession] = useState('');
  const [request, setRequest] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    if (userId) {
      loadProjects();
    }
  }, [userId]);

  const loadProjects = async () => {
    if (!userId) return;
    setIsLoading(true);
    try {
      const data = await getCopilotProjects(userId);
      setProjects(data);
    } catch (e) {
      console.error("Error loading copilot projects", e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!profession.trim() || !request.trim() || !userId) return;
    
    setIsCreating(true);
    try {
      const usage = await runWithCredits(3, (cost) => onUsage(cost || 3), async () => {
         const newProject = await startCopilotProject(userId, profession, request);
         return newProject;
      });

      if (usage.ok && usage.result) {
        onOpenProject(usage.result.id);
      }
    } catch (e) {
      alert("Hubo un error inicializando el Copiloto.");
    } finally {
      setIsCreating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-8">
      <div className="mb-8 p-8 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl shadow-xl flex items-center justify-between">
        <div className="text-white">
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Bot className="w-8 h-8" />
            Copiloto IA
          </h1>
          <p className="mt-2 text-indigo-100 max-w-2xl text-lg">
            Guía paso a paso para tus proyectos. Describe lo que necesitas crear y la IA generará 
            un Roadmap estructurado y te asistirá como un Mentor Senior.
          </p>
        </div>
        {!showCreate && (
          <Button 
            onClick={() => setShowCreate(true)}
            className="bg-white text-indigo-700 hover:bg-slate-50 border-none shadow-lg whitespace-nowrap"
          >
            <Plus className="w-5 h-5 mr-2" />
            Nuevo Proyecto
          </Button>
        )}
      </div>

      {showCreate && (
        <Card className="p-8 mb-8 border-2 border-indigo-100 dark:border-indigo-900 shadow-xl animate-in fade-in slide-in-from-top-4">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Target className="w-5 h-5 text-indigo-500" /> 
              Inicializar Nuevo Roadmap
            </h2>
            <button onClick={() => setShowCreate(false)} className="text-slate-400 hover:text-slate-700">
              Cancelar
            </button>
          </div>
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                ¿Cuál es tu rol o profesión?
              </label>
              <input
                type="text"
                value={profession}
                onChange={(e) => setProfession(e.target.value)}
                placeholder="Ejemplo: Desarrollador React, Diseñador UX/UI, Editor de Video..."
                className="w-full p-4 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-900"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                ¿Qué te ha pedido el cliente? (Sé detallado)
              </label>
              <textarea
                value={request}
                onChange={(e) => setRequest(e.target.value)}
                placeholder="Ejemplo: El cliente quiere una tienda de ropa en Shopify con 50 productos, pasarela de pago en Stripe y un diseño minimalista..."
                className="w-full p-4 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-900 min-h-[120px]"
              />
            </div>
            
            <Button
              onClick={handleCreate}
              isLoading={isCreating}
              disabled={!profession || !request || isCreating}
              className="w-full h-14 text-lg bg-indigo-600 hover:bg-indigo-700"
            >
              Generar Plan de Trabajo (3 Créditos)
            </Button>
          </div>
        </Card>
      )}

      {projects.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((p) => (
            <div 
              key={p.id} 
              className="p-6 hover:shadow-lg transition-shadow cursor-pointer hover:border-indigo-300 dark:hover:border-indigo-700 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm"
              onClick={() => onOpenProject(p.id)}
            >
               <div className="flex justify-between items-start mb-4">
                  <div className="bg-indigo-50 dark:bg-indigo-900/30 p-2 rounded-lg text-indigo-600 dark:text-indigo-400">
                     <Layout className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-bold px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-500">
                    {p.profession}
                  </span>
               </div>
               
               <p className="font-medium text-slate-800 dark:text-white line-clamp-3 mb-6">
                  "{p.client_request}"
               </p>
               
               <div className="mt-auto pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-sm text-slate-500">
                  <span>{p.phases.reduce((acc, curr) => curr.is_completed ? acc + 1 : acc, 0)} / {p.phases.length} Fases</span>
                  <div className="flex items-center text-indigo-600 dark:text-indigo-400 font-bold">
                    Abrir <ArrowRight className="w-4 h-4 ml-1" />
                  </div>
               </div>
            </div>
          ))}
        </div>
      ) : (
        !showCreate && (
           <div className="text-center py-20 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
              <Briefcase className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-slate-700 dark:text-slate-300 mb-2">Sin proyectos activos</h3>
              <p className="text-slate-500 max-w-md mx-auto">
                 Comienza un nuevo proyecto para que nuestro Mentor IA diseñe el roadmap y te acompañe en cada tarea.
              </p>
           </div>
        )
      )}
    </div>
  );
};
