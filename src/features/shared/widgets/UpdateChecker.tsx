import React, { useEffect, useState } from 'react';
import { Capacitor } from '@capacitor/core';
import { Download, AlertTriangle } from 'lucide-react';
import packageJson from '../../../../package.json';

// URL donde está alojado el version.json (debe coincidir con tu dominio de producción)
const VERSION_CHECK_URL = 'https://app.modofreelanceos.com/version.json';

// Cuántos ms esperar tras iniciar la app antes de hacer el check
const CHECK_DELAY_MS = 3000;

// Cuántos reintentos si la red falla
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 5000;

interface VersionData {
  version: string;
  critical: boolean;
  apkUrl: string;
  exeUrl: string;
  message: string;
}

/** Compara semver: devuelve true si `remote` es mayor que `local` */
function isNewerVersion(local: string, remote: string): boolean {
  try {
    const parse = (v: string) => v.replace(/^v/, '').split('.').map(Number);
    const [lMaj, lMin, lPat] = parse(local);
    const [rMaj, rMin, rPat] = parse(remote);
    if (rMaj !== lMaj) return rMaj > lMaj;
    if (rMin !== lMin) return rMin > lMin;
    return rPat > lPat;
  } catch {
    // Si el parseo falla, recurrimos a comparación de strings
    return local.trim() !== remote.trim();
  }
}

async function fetchVersionWithRetry(retries: number): Promise<VersionData> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const res = await fetch(`${VERSION_CHECK_URL}?t=${Date.now()}`, {
        cache: 'no-store',
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return (await res.json()) as VersionData;
    } catch (err) {
      if (attempt === retries) throw err;
      await new Promise((r) => setTimeout(r, RETRY_DELAY_MS));
    }
  }
  throw new Error('Max retries reached');
}

export const UpdateChecker = () => {
  const [updateAvailable, setUpdateAvailable] = useState<VersionData | null>(null);

  const isAndroid = Capacitor.getPlatform() === 'android';
  // Electron puede reportarse en el user-agent de más de una forma
  const isElectron =
    navigator.userAgent.toLowerCase().includes('electron') ||
    // @ts-expect-error — propiedad inyectada por Electron
    typeof window.__ELECTRON__ !== 'undefined';

  useEffect(() => {
    // Solo actuar en plataformas instaladas (Android APK o Windows Electron)
    if (!isAndroid && !isElectron) return;

    const currentVersion = packageJson.version;

    const run = async () => {
      try {
        const data = await fetchVersionWithRetry(MAX_RETRIES);

        if (isNewerVersion(currentVersion, data.version)) {
          // Para updates no críticos, verificar si el usuario ya lo descartó previamente
          if (!data.critical) {
            const dismissed = localStorage.getItem('update_dismissed');
            if (dismissed === data.version) {
              return; // Ya lo descartó en esta sesión, no molestar de nuevo
            }
          }
          setUpdateAvailable(data);
        }
      } catch {
        // Fallo silencioso — no interrumpir la experiencia del usuario
      }
    };

    const timer = setTimeout(run, CHECK_DELAY_MS);
    return () => clearTimeout(timer);
  }, [isAndroid, isElectron]);

  const handleDownload = () => {
    if (!updateAvailable) return;
    const url = isElectron ? updateAvailable.exeUrl : updateAvailable.apkUrl;
    if (url) {
      window.open(url, '_system');
    } else {
      alert('Error: URL de descarga no encontrada.');
    }
  };

  const handleDismiss = () => {
    if (updateAvailable) {
      localStorage.setItem('update_dismissed', updateAvailable.version);
    }
    setUpdateAvailable(null);
  };

  if (!updateAvailable) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200 dark:border-slate-700">
        <div className="bg-brand-600 p-4 flex items-center gap-3">
          <div className="bg-white/20 p-2 rounded-full">
            <Download className="w-6 h-6 text-white animate-bounce" />
          </div>
          <div>
            <h3 className="text-white font-bold text-lg">
              Nueva Versión {updateAvailable.version}
            </h3>
            <p className="text-brand-100 text-xs">
              {updateAvailable.critical
                ? '⚠️ Actualización requerida'
                : '¡Actualización disponible!'}
            </p>
          </div>
        </div>

        <div className="p-6">
          <div className="mb-4">
            <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" /> Novedades:
            </h4>
            <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed bg-slate-50 dark:bg-slate-800 p-3 rounded-lg border border-slate-100 dark:border-slate-700">
              {updateAvailable.message}
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <button
              onClick={handleDownload}
              className="w-full py-3 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-bold shadow-lg shadow-brand-500/30 transition-all active:scale-95 flex justify-center items-center gap-2"
            >
              <Download className="w-5 h-5" />
              Descargar e Instalar
            </button>

            {/* Solo mostrar "Actualizar más tarde" si NO es crítico */}
            {!updateAvailable.critical && (
              <button
                onClick={handleDismiss}
                className="w-full py-3 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 font-medium text-sm transition-colors"
              >
                Actualizar más tarde
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
