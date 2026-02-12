import React, { useEffect, useState } from 'react';
import { Capacitor } from '@capacitor/core';
import { Download, AlertTriangle } from 'lucide-react';
import packageJson from '../../../../package.json';

// URL EXACTA DE TU WEB DONDE ESTÁ EL JSON
const APP_DOMAIN = 'https://app.modofreelanceos.com';

interface VersionData {
  version: string;
  critical: boolean;
  apkUrl: string;
  exeUrl: string;
  message: string;
}

export const UpdateChecker = () => {
  const [updateAvailable, setUpdateAvailable] = useState<VersionData | null>(null);

  const isAndroid = Capacitor.getPlatform() === 'android';
  const isElectron = navigator.userAgent.toLowerCase().includes(' electron/');

  useEffect(() => {
    // --- MODO PRUEBA ---
    // Si quieres probar en el navegador que el modal funciona, COMENTA las siguientes 3 líneas:
    if (!isAndroid && !isElectron) {
      return;
    }
    // -------------------

    const checkVersion = async () => {
      try {
        // Petición a Internet (Tu dominio real)
        const res = await fetch(`${APP_DOMAIN}/version.json?t=${Date.now()}`);

        if (!res.ok) throw new Error('No se pudo conectar al servidor de actualizaciones');

        const data: VersionData = await res.json();
        const currentVersion = packageJson.version;

        if (currentVersion !== data.version) {
          setUpdateAvailable(data);
        }
      } catch (error) {
        void error;
      }
    };

    checkVersion();
  }, [isAndroid, isElectron]);

  const handleDownload = () => {
    if (!updateAvailable) return;

    // Seleccionar URL según dispositivo
    // Si estás probando en web, usará la de Android por defecto
    const url = isElectron ? updateAvailable.exeUrl : updateAvailable.apkUrl;

    if (url) {
      // Abre el navegador del sistema (Chrome/Edge) para descargar
      window.open(url, '_system');
    } else {
      alert('Error: URL de descarga no encontrada');
    }
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
            <p className="text-brand-100 text-xs">¡Actualización disponible!</p>
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

            {!updateAvailable.critical && (
              <button
                onClick={() => setUpdateAvailable(null)}
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
