import React, { useCallback, useEffect, useState } from 'react';
import { ExternalLink, Search, Globe, Calendar, Building, Radar } from 'lucide-react';
import { Button, Card } from '@features/shared/ui';
import { getBackendURL } from '@config/features';
import { getAuthHeaders } from '@/services/backend/authHeaders';

interface JobsViewProps {
  onUsage: (cost: number) => Promise<boolean>;
  userId?: string;
}

interface JobResult {
  title: string;
  company: string;
  source?: string;
  date_str?: string;
  summary?: string;
  link?: string;
}

export const JobsView: React.FC<JobsViewProps> = () => {
  const [jobs, setJobs] = useState<JobResult[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [totalFound, setTotalFound] = useState(0);

  // Debounce para no buscar en cada tecla
  const [debouncedSearch, setDebouncedSearch] = useState('');

  const BACKEND_URL = getBackendURL();

  // Efecto para el debounce de búsqueda
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1); // Resetear a página 1 al buscar
      setDebouncedSearch(searchTerm);
    }, 800); // Espera 800ms después de dejar de escribir
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Efecto principal de carga
  const fetchJobs = useCallback(
    async (pageNum: number, search: string, isNewSearch: boolean) => {
      setLoading(true);
      try {
        // Obtener el userId del usuario autenticado si está disponible
        const user = window?.firebase?.auth?.currentUser;
        let userId = user?.uid || '';
        if (!userId && typeof localStorage !== 'undefined') {
          userId = localStorage.getItem('userId') || '';
        }
        const authHeaders = await getAuthHeaders();
        const headers = {
          ...authHeaders,
          'Content-Type': 'application/json',
        };
        const body = JSON.stringify({
          userId,
          search,
          page: pageNum,
        });
        const res = await fetch(`${BACKEND_URL}/api/v1/jobs/search`, {
          method: 'POST',
          headers,
          body,
        });
        const data = await res.json();

        if (data.success && data.data && Array.isArray(data.data.jobs)) {
          if (isNewSearch) {
            setJobs(data.data.jobs);
          } else {
            setJobs((prev) => [...prev, ...data.data.jobs]);
          }
          setHasMore(data.data.has_more ?? false);
          setTotalFound(data.data.total_found ?? 0);
        }
      } catch (error) {
        void error;
        setHasMore(false);
      } finally {
        setLoading(false);
      }
    },
    [BACKEND_URL]
  );

  useEffect(() => {
    fetchJobs(page, debouncedSearch, page === 1);
  }, [debouncedSearch, fetchJobs, page]);

  return (
    <div className="max-w-5xl mx-auto pb-20">
      <div className="mb-8 text-center">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center justify-center gap-2">
          <Radar className="w-6 h-6 text-brand-600" /> Cazador de Oportunidades
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mt-2">
          Buscador global de trabajo remoto. Encuentra tu próxima vacante en segundos.
        </p>
      </div>

      {/* BARRA DE BÚSQUEDA */}
      <div className="sticky top-4 z-20 mb-8 px-2">
        <div className="relative max-w-2xl mx-auto shadow-xl rounded-full bg-white dark:bg-slate-800 flex items-center overflow-hidden border border-slate-200 dark:border-slate-700 focus-within:ring-2 focus-within:ring-brand-500 transition-all">
          <div className="pl-4 flex items-center pointer-events-none text-slate-400">
            <Search className="h-5 w-5" />
          </div>

          <input
            type="text"
            className="w-full py-4 px-3 bg-transparent text-slate-900 dark:text-white placeholder-slate-400 outline-none border-none text-base font-medium truncate"
            placeholder="Busca: 'Asistente', 'Diseñador', 'Python'..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          {loading && (
            <div className="pr-4 flex items-center">
              <div className="animate-spin h-5 w-5 border-2 border-brand-500 border-t-transparent rounded-full"></div>
            </div>
          )}
        </div>
        {totalFound > 0 && (
          <p className="text-center text-xs text-slate-500 dark:text-slate-400 mt-2 font-medium">
            🔍 Se encontraron {totalFound} vacantes globales.
          </p>
        )}
      </div>

      {/* LISTA DE TRABAJOS */}
      <div className="space-y-4">
        {jobs.map((job, i) => (
          <Card
            key={i}
            className="p-5 hover:border-brand-300 dark:hover:border-brand-700 transition-all hover:shadow-md group bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
          >
            <div className="flex flex-col md:flex-row justify-between items-start gap-4">
              <div className="flex-1">
                <h3 className="font-bold text-lg text-slate-800 dark:text-white group-hover:text-brand-600 transition-colors leading-tight">
                  {job.title}
                </h3>

                <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-slate-500 dark:text-slate-400 mt-2 mb-3">
                  <span className="flex items-center gap-1 font-semibold uppercase tracking-wide">
                    <Building className="w-3 h-3" /> {job.company}
                  </span>
                  <span className="flex items-center gap-1">
                    <Globe className="w-3 h-3" /> {job.source}
                  </span>
                  <span className="flex items-center gap-1 bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded text-slate-700 dark:text-slate-300">
                    <Calendar className="w-3 h-3" /> {job.date_str}
                  </span>
                </div>

                <div
                  className="text-sm text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed"
                  dangerouslySetInnerHTML={{
                    __html: job.summary ?? '',
                  }}
                />
              </div>

              <div className="shrink-0 w-full md:w-auto">
                <Button
                  onClick={() => job.link && window.open(job.link, '_blank')}
                  className="w-full md:w-auto h-10 text-sm shadow-sm"
                >
                  Aplicar <ExternalLink className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          </Card>
        ))}

        {jobs.length === 0 && !loading && (
          <div className="text-center py-20 text-slate-400">
            <p>No se encontraron ofertas con ese término.</p>
            <p className="text-sm">
              Intenta con &quot;Remote&quot;, &quot;Developer&quot; o &quot;Marketing&quot;.
            </p>
          </div>
        )}
      </div>

      {/* BOTÓN CARGAR MÁS */}
      {hasMore && jobs.length > 0 && (
        <div className="mt-8 text-center">
          <Button
            variant="outline"
            onClick={() => setPage((p) => p + 1)}
            isLoading={loading}
            className="w-full md:w-64"
          >
            Cargar más ofertas
          </Button>
        </div>
      )}
    </div>
  );
};
