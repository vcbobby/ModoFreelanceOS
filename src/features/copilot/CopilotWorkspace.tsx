import React, { useEffect, useState, useRef } from 'react';
import { ArrowLeft, Send, Sparkles, CheckCircle, Circle, Map, Bot } from 'lucide-react';
import { Button } from '@features/shared/ui';
import { getCopilotProject, chatWithMentor, updatePhaseStatus, setCurrentPhase, CopilotProject, CopilotMessage } from './copilotApi';
import ReactMarkdown from 'react-markdown';
import { runWithCredits } from '@/utils/credits';

interface CopilotWorkspaceProps {
  projectId: string;
  onBack: () => void;
  userId?: string;
  onUsage?: (cost: number) => Promise<boolean>;
}

export const CopilotWorkspace: React.FC<CopilotWorkspaceProps> = ({ projectId, onBack, userId, onUsage }) => {
  
  const [project, setProject] = useState<CopilotProject | null>(null);
  const [messages, setMessages] = useState<CopilotMessage[]>([]);
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [messageCount, setMessageCount] = useState(() => {
    if (!userId) return 0;
    const saved = localStorage.getItem(`copilot_msg_count_${userId}`);
    return saved ? parseInt(saved, 10) : 0;
  });
  
  const chatBottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (userId && projectId) {
      loadWorkspace();
    }
  }, [userId, projectId]);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isSending]);

  const loadWorkspace = async () => {
    try {
      const data = await getCopilotProject(userId!, projectId);
      setProject(data.project);
      
      const mappedMsg = data.messages.map(m => ({...m, role: m.role as 'user' | 'assistant'}));
      setMessages(mappedMsg);
      
      // Si no hay mensajes iniciales, inyectar el saludo de bienvenida de la IA
      if (mappedMsg.length === 0) {
        setMessages([{
           role: 'assistant',
           content: `¡Hola! Soy tu Mentor IA.\n\nHe diseñado el Roadmap que ves a tu izquierda para abordar el requerimiento: **"${data.project.client_request}"**.\n\nEstoy aquí para guiarte en cada paso. Si necesitas código, herramientas o tienes bloqueos, escríbeme y lo resolvemos juntos. ¿Listo para empezar con la Fase 1?`
        }]);
      }
    } catch (e) {
      alert("Error cargando el Workspace.");
      onBack();
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isSending) return;
    const msg = input.trim();
    setInput('');
    
    // Calcular el coste: cada 5 mensajes cuesta 1 crédito
    const nextCount = messageCount + 1;
    const isChargeable = nextCount % 5 === 0;
    const cost = isChargeable ? 1 : 0;

    const tempUserMsg = { role: 'user' as const, content: msg };
    setMessages(prev => [...prev, tempUserMsg]);
    setIsSending(true);
    
    try {
      const usage = await runWithCredits(
        cost,
        async (c) => onUsage ? await onUsage(c || 0) : true,
        async () => await chatWithMentor(userId!, projectId, msg)
      );

      if (!usage.ok) {
        // En caso de que se quede sin créditos
        setMessages(prev => prev.slice(0, -1)); // Quitar el mensaje optimista si no se pudo enviar
        alert("💬 Has alcanzado el límite de mensajes del Copiloto IA. Obtén un Pack de Créditos o mejora a PRO para enviar más.");
        setInput(msg); // Devolver input al usuario
        return;
      }
      
      setMessages(prev => [...prev, { role: 'assistant', content: usage.result! }]);
      
      // Persistimos el estado y local storage si fue exitoso
      setMessageCount(nextCount);
      if (userId) localStorage.setItem(`copilot_msg_count_${userId}`, nextCount.toString());

    } catch (e) {
      setMessages(prev => [...prev, { role: 'assistant', content: '❌ Error conectando con el mentor. Intenta de nuevo.'}]);
    } finally {
      setIsSending(false);
    }
  };

  const togglePhaseCompletion = async (index: number) => {
    if (!project) return;
    
    const phases = [...project.phases];
    phases[index].is_completed = !phases[index].is_completed;
    
    setProject({ ...project, phases });
    
    // Si la está marcando completada, sugiramos mover el current_phase al siguiente que no esté completado.
    if (phases[index].is_completed) {
      const nextIncomplete = phases.findIndex(p => !p.is_completed);
      if (nextIncomplete !== -1 && nextIncomplete !== project.current_phase) {
          setProject(prev => prev ? { ...prev, current_phase: nextIncomplete } : null);
          await setCurrentPhase(userId!, projectId, nextIncomplete);
      }
    }
    
    await updatePhaseStatus(userId!, projectId, index, phases[index].is_completed);
  };

  const selectPhase = async (index: number) => {
    if (!project) return;
    setProject({ ...project, current_phase: index });
    await setCurrentPhase(userId!, projectId, index);
  };

  if (isLoading || !project) {
    return <div className="p-10 flex justify-center"><Sparkles className="w-8 h-8 animate-spin text-indigo-500" /></div>;
  }

  return (
    <div className="h-auto min-h-[calc(100vh-80px)] lg:h-[calc(100vh-80px)] max-w-7xl mx-auto flex flex-col lg:flex-row gap-4 lg:gap-6 p-4 lg:py-6 lg:pb-20">
      
      {/* PANEL IZQUIERDO: ROADMAP */}
      <div className="w-full lg:w-1/3 min-h-[400px] lg:min-h-0 lg:h-full flex flex-col bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden flex-shrink-0">
        <div className="p-4 border-b border-slate-100 dark:border-slate-700 flex items-center gap-3">
          <button onClick={onBack} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg">
            <ArrowLeft className="w-5 h-5 text-slate-500" />
          </button>
          <div>
            <h2 className="font-bold flex items-center gap-2 text-slate-800 dark:text-white">
              <Map className="w-5 h-5 text-indigo-500" /> Roadmap
            </h2>
            <p className="text-xs text-slate-500 line-clamp-1">{project.profession}</p>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
          {project.phases.map((phase, idx) => {
             const isActive = project.current_phase === idx;
             const isDone = phase.is_completed;
             
             return (
               <div 
                 key={idx} 
                 className={`relative pl-6 pb-6 border-l-2 \${isDone ? 'border-green-500' : isActive ? 'border-indigo-500' : 'border-slate-200 dark:border-slate-700'}`}
               >
                  <div className={`absolute -left-[11px] top-0 bg-white dark:bg-slate-800 p-0.5 rounded-full`}>
                    {isDone ? (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    ) : isActive ? (
                      <Circle className="w-5 h-5 text-indigo-500 fill-indigo-100 dark:fill-indigo-900" />
                    ) : (
                      <Circle className="w-5 h-5 text-slate-300 dark:text-slate-600" />
                    )}
                  </div>
                  
                  <div 
                    onClick={() => selectPhase(idx)}
                    className={`cursor-pointer rounded-xl p-4 transition-all \${isActive ? 'bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800/50' : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'}`}
                  >
                    <h3 className={`font-bold text-sm mb-1 \${isDone ? 'text-green-600 dark:text-green-400' : 'text-slate-800 dark:text-white'}`}>
                      {phase.title}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
                      {phase.description}
                    </p>
                    
                    <ul className="space-y-2 mb-4">
                      {phase.tasks.map((t, tid) => (
                        <li key={tid} className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-300">
                           <div className="mt-1 w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-600 flex-shrink-0" />
                           {t}
                        </li>
                      ))}
                    </ul>
                    
                    <Button 
                      variant="ghost"
                      onClick={(e: unknown) => { 
                          if (e && typeof e === 'object' && 'stopPropagation' in e) {
                             (e as any).stopPropagation();
                          }
                          togglePhaseCompletion(idx); 
                      }}
                      className={`w-full text-xs py-2 ${isDone ? 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300' : 'bg-green-100 !text-green-700 hover:bg-green-200 dark:bg-green-900/30 dark:!text-green-400'}`}
                    >
                       {isDone ? 'Marcar como Incompleta' : 'Aprobar Fase Completada'}
                    </Button>
                  </div>
               </div>
             );
          })}
        </div>
      </div>
      
      {/* PANEL DERECHO: CHAT MENTOR */}
      <div className="flex-1 w-full min-h-[600px] lg:min-h-0 lg:h-full bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden flex flex-col relative">
        <div className="p-4 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between bg-indigo-600 text-white shadow-md z-10">
           <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm border border-white/30">
               <Bot className="w-6 h-6" />
             </div>
             <div>
               <h3 className="font-bold">Mentor IA En Vivo</h3>
               <p className="text-xs text-indigo-100 flex items-center gap-1">
                 Activo para Fase: {project.phases[project.current_phase]?.title || "Todas"}
               </p>
             </div>
           </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-slate-50 dark:bg-slate-900/50">
           {messages.map((m, i) => {
             const isUser = m.role === 'user';
             return (
             <div key={i} className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] rounded-2xl p-4 shadow-sm text-sm ${isUser ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700 rounded-tl-none'}`}>
                   {!isUser && i === 0 && <Sparkles className="w-4 h-4 text-indigo-500 mb-2" />}
                   <div className={`prose prose-sm max-w-none ${isUser ? 'text-white prose-p:text-white prose-a:text-white' : 'dark:prose-invert prose-p:leading-relaxed text-slate-800 dark:text-slate-100'}`}>
                     <ReactMarkdown>{m.content}</ReactMarkdown>
                   </div>
                </div>
             </div>
             );
           })}
           {isSending && (
              <div className="flex justify-start">
                 <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-4 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-indigo-500 animate-spin" />
                    <span className="text-xs text-slate-400">Analizando el proyecto...</span>
                 </div>
              </div>
           )}
           <div ref={chatBottomRef} />
        </div>
        
        <div className="p-4 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700">
           <div className="relative">
              <input 
                type="text" 
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSend()}
                disabled={isSending}
                placeholder="Pregunta sobre la fase actual, pide código o ejemplos..."
                className="w-full bg-slate-100 dark:bg-slate-900 border-none rounded-xl pl-4 pr-12 py-4 text-sm focus:ring-2 focus:ring-indigo-500 text-slate-800 dark:text-white placeholder:text-slate-400 disabled:opacity-50"
              />
              <button 
                onClick={handleSend}
                disabled={isSending || !input.trim()}
                className="absolute right-2 top-2 bottom-2 aspect-square flex items-center justify-center bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
              >
                 <Send className="w-4 h-4" />
              </button>
           </div>
        </div>
      </div>
      
    </div>
  );
};
