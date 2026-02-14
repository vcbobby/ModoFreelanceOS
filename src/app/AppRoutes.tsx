import React, { Suspense, useEffect } from 'react';
import { Check, CheckCircle, Monitor, Pause, PenLine, Play, Zap } from 'lucide-react';
import { AppView, UserState } from '@types';
import { useAppDispatch, useAppSelector } from '@/app/hooks/storeHooks';
import { toggleTimer } from '@/app/slices/pomodoroSlice';
import { DashboardTips } from '@features/shared/dashboard';
import { loadHtml2Pdf } from '@features/shared/utils/html2pdf';
import { preloadPdfJs } from '@features/shared/utils/pdfUtils';
import { CreditPackageCard, CREDIT_PACKAGES } from '@features/shared/ui';

const ProposalTool = React.lazy(() => import('@features/proposals'));
const FinanceView = React.lazy(() => import('@features/finance'));
const HistoryView = React.lazy(() => import('@features/history'));
const InvoiceTool = React.lazy(() => import('@features/invoices'));
const NotesView = React.lazy(() => import('@features/notes'));
const QRTool = React.lazy(() => import('@features/qr'));
const OptimizerTool = React.lazy(() => import('@features/optimizer'));
const AnalyzerTool = React.lazy(() => import('@features/analyzer'));
const PortfolioTool = React.lazy(() => import('@features/portfolio'));
const BriefingTool = React.lazy(() => import('@features/briefing'));
const FiverrTool = React.lazy(() => import('@features/fiverr'));
const PomodoroTool = React.lazy(() => import('@features/pomodoro'));
const CVBuilder = React.lazy(() => import('@features/cv-builder'));
const JobsView = React.lazy(() => import('@features/jobs'));
const AcademyView = React.lazy(() => import('@features/academy'));
const AdminDashboard = React.lazy(() => import('@features/admin'));
const WebsiteBuilder = React.lazy(() => import('@features/website-builder'));
const AnalyticsView = React.lazy(() => import('@features/analytics'));
const DashboardPinnedNotes = React.lazy(async () => {
  const mod = await import('@features/shared/dashboard');
  return { default: mod.DashboardPinnedNotes };
});
const DashboardUpcomingEvents = React.lazy(async () => {
  const mod = await import('@features/shared/dashboard');
  return { default: mod.DashboardUpcomingEvents };
});

const LoadingFallback = () => (
  <div className="flex items-center justify-center h-[50vh] text-slate-500 dark:text-slate-400">
    Cargando...
  </div>
);

const DashboardSectionFallback = () => (
  <div className="flex items-center justify-center py-8 text-slate-400">Cargando seccion...</div>
);

const DashboardPomodoroWidget = ({ onGoToPomodoro }: { onGoToPomodoro: () => void }) => {
  const dispatch = useAppDispatch();
  const { isActive, timeLeft, mode } = useAppSelector((state) => state.pomodoro);

  const totalTime = mode === 'work' ? 1500 : mode === 'short' ? 300 : 900;
  if (timeLeft === totalTime && !isActive) return null;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="mb-6 bg-slate-900 dark:bg-slate-800 text-white p-4 rounded-xl shadow-lg flex items-center justify-between border-l-4 border-brand-500 animate-in slide-in-from-top-2">
      <div className="flex items-center gap-3">
        <div
          className={`w-3 h-3 rounded-full animate-pulse ${
            mode === 'work' ? 'bg-red-500' : 'bg-green-500'
          }`}
        ></div>
        <div>
          <p className="text-xs font-bold uppercase opacity-70">
            {mode === 'work' ? 'Focus Mode' : 'Descanso'}
          </p>
          <p className="text-2xl font-mono font-bold tracking-widest">{formatTime(timeLeft)}</p>
        </div>
      </div>
      <div className="flex gap-2">
        <button
          onClick={() => dispatch(toggleTimer())}
          className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors"
        >
          {isActive ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
        </button>
        <button
          onClick={onGoToPomodoro}
          className="px-3 py-2 bg-brand-600 rounded-lg text-xs font-bold hover:bg-brand-500"
        >
          Ver
        </button>
      </div>
    </div>
  );
};

interface AppRoutesProps {
  currentView: AppView;
  userId?: string;
  userState: UserState;
  handleFeatureUsage: (cost?: number) => Promise<boolean>;
  setCurrentView: (view: AppView) => void;
  setAutoOpenAgenda: (value: boolean) => void;
  autoOpenAgenda: boolean;
  setIsPricingOpen: (value: boolean) => void;
  showSuccessMsg: boolean;
  displayName: string;
  isEditingName: boolean;
  setIsEditingName: (value: boolean) => void;
  setDisplayName: (value: string) => void;
  handleSaveName: () => void;
}

export const AppRoutes: React.FC<AppRoutesProps> = ({
  currentView,
  userId,
  userState,
  handleFeatureUsage,
  setCurrentView,
  setAutoOpenAgenda,
  autoOpenAgenda,
  setIsPricingOpen,
  showSuccessMsg,
  displayName,
  isEditingName,
  setIsEditingName,
  setDisplayName,
  handleSaveName,
}) => {
  useEffect(() => {
    const prefetchViews = new Set([
      AppView.CV_BUILDER,
      AppView.INVOICES,
      AppView.BRIEFING,
      AppView.WEBSITE_BUILDER,
      AppView.HISTORY,
    ]);

    if (prefetchViews.has(currentView)) {
      void loadHtml2Pdf();
      void preloadPdfJs();
    }
  }, [currentView]);

  const renderContent = () => {
    switch (currentView) {
      case AppView.PROPOSALS:
        return <ProposalTool onUsage={handleFeatureUsage} userId={userId} />;
      case AppView.INVOICES:
        return <InvoiceTool onUsage={handleFeatureUsage} userId={userId} />;
      case AppView.HISTORY:
        return <HistoryView userId={userId} />;
      case AppView.NOTES:
        return <NotesView userId={userId} autoOpenAgenda={autoOpenAgenda} />;
      case AppView.QR:
        return <QRTool onUsage={handleFeatureUsage} userId={userId} />;
      case AppView.OPTIMIZER:
        return <OptimizerTool onUsage={handleFeatureUsage} userId={userId} />;
      case AppView.ANALYZER:
        return <AnalyzerTool onUsage={handleFeatureUsage} userId={userId} />;
      case AppView.FINANCES:
        return <FinanceView userId={userId} />;
      case AppView.ANALYTICS:
        return <AnalyticsView userId={userId} />;
      case AppView.PORTFOLIO:
        return <PortfolioTool onUsage={handleFeatureUsage} userId={userId} />;
      case AppView.BRIEFING:
        return <BriefingTool onUsage={handleFeatureUsage} userId={userId} />;
      case AppView.FIVERR:
        return <FiverrTool onUsage={handleFeatureUsage} userId={userId} />;
      case AppView.POMODORO:
        return <PomodoroTool />;
      case AppView.CV_BUILDER:
        return <CVBuilder onUsage={handleFeatureUsage} userId={userId} />;
      case AppView.JOBS:
        return <JobsView onUsage={handleFeatureUsage} userId={userId} />;
      case AppView.ACADEMY:
        return <AcademyView onUsage={handleFeatureUsage} userId={userId} />;
      case AppView.ADMIN:
        return <AdminDashboard userId={userId} />;
      case AppView.WEBSITE_BUILDER:
        if (!userState.isSubscribed) {
          return (
            <div className="flex flex-col items-center justify-center h-[50vh] text-center p-6">
              <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-full mb-4">
                <Monitor className="w-12 h-12 text-slate-400" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">
                Función Exclusiva PRO
              </h3>
              <p className="text-slate-500 dark:text-slate-400 mb-6 max-w-md">
                El Constructor de Portafolios Web te permite tener tu propia página web profesional.
                Actualiza tu plan para acceder.
              </p>
              <button
                onClick={() => setIsPricingOpen(true)}
                className="bg-brand-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-brand-700 transition-colors"
              >
                Desbloquear Ahora
              </button>
            </div>
          );
        }
        return <WebsiteBuilder onUsage={handleFeatureUsage} userId={userId} />;
      default:
        return (
          <div className="max-w-4xl mx-auto py-8">
            {showSuccessMsg && (
              <div className="mb-6 bg-green-500 text-white p-4 rounded-xl shadow-lg flex items-center justify-center gap-2 animate-bounce">
                <CheckCircle className="w-6 h-6" />
                <span className="font-bold">¡Pago recibido! Tu cuenta ahora es PRO.</span>
              </div>
            )}

            <div className="text-center mb-8">
              <div className="flex items-center justify-center gap-2 mb-2">
                <h2 className="text-3xl font-bold text-slate-800 dark:text-white">Hola,</h2>
                {isEditingName ? (
                  <div className="flex items-center gap-2">
                    <input
                      autoFocus
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="text-3xl font-bold text-slate-800 dark:text-white border-b-2 border-brand-500 outline-none w-40 bg-transparent"
                    />
                    <button
                      onClick={handleSaveName}
                      className="bg-brand-100 p-1 rounded-full text-brand-700 hover:bg-brand-200"
                    >
                      <Check className="w-5 h-5" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 group">
                    <span className="text-3xl font-bold text-slate-800 dark:text-white">
                      {displayName} 👋
                    </span>
                    <button
                      onClick={() => setIsEditingName(true)}
                      className="opacity-100 md:opacity-70 md:group-hover:opacity-100 text-slate-400 hover:text-brand-600 transition-opacity"
                    >
                      <PenLine className="w-5 h-5" />
                    </button>
                  </div>
                )}
              </div>
              <p className="text-slate-500 dark:text-slate-400">Bienvenido a tu Dashboard.</p>
            </div>

            <div className="flex justify-center gap-4 mb-10">
              <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm w-full md:w-64 flex flex-col items-center">
                <div className="text-3xl font-bold text-brand-600 dark:text-brand-400">
                  {userState.isSubscribed ? '∞' : userState.credits}
                </div>
                <div className="text-sm text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wide mt-1">
                  {userState.isSubscribed ? 'Créditos Ilimitados' : 'Créditos Disponibles'}
                </div>
                <div className="w-full border-t border-slate-100 dark:border-slate-700 pt-3 text-center">
                  {userState.isSubscribed ? (
                    <p className="text-xs text-brand-600 dark:text-brand-400 font-medium">
                      Tu plan vence el: <br />
                      <span className="font-bold text-slate-700 dark:text-slate-300 text-sm">
                        {userState.subscriptionEnd
                          ? new Date(userState.subscriptionEnd).toLocaleDateString()
                          : '30 Días desde activación'}
                      </span>
                    </p>
                  ) : (
                    <p className="text-xs text-slate-400 dark:text-slate-500">
                      Se renuevan el: <br />
                      <span className="font-bold text-slate-600 dark:text-slate-300 text-sm">
                        {userState.nextReset
                          ? new Date(userState.nextReset).toLocaleDateString()
                          : 'Próximamente'}
                      </span>
                    </p>
                  )}
                </div>
              </div>
            </div>
            {!userState.isSubscribed && (
              <div className="mb-10">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                    <Zap className="w-5 h-5 text-brand-500 fill-current" />
                    Paquetes de Créditos
                  </h3>
                  <span className="text-xs font-bold text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-900/20 px-2 py-1 rounded-lg uppercase">
                    Oferta de Lanzamiento 🚀
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {CREDIT_PACKAGES.map((pkg) => (
                    <CreditPackageCard
                      key={pkg.credits}
                      credits={pkg.credits}
                      price={pkg.price}
                      oldPrice={pkg.oldPrice}
                      buyUrl={pkg.buyUrl}
                      highlighted={pkg.highlighted}
                    />
                  ))}
                </div>
              </div>
            )}
            <DashboardPomodoroWidget onGoToPomodoro={() => setCurrentView(AppView.POMODORO)} />
            {userId && (
              <Suspense fallback={<DashboardSectionFallback />}>
                <DashboardUpcomingEvents
                  userId={userId}
                  onGoToAgenda={() => {
                    setAutoOpenAgenda(true);
                    setCurrentView(AppView.NOTES);
                    setTimeout(() => setAutoOpenAgenda(false), 2000);
                  }}
                />
              </Suspense>
            )}
            {userId && (
              <Suspense fallback={<DashboardSectionFallback />}>
                <DashboardPinnedNotes
                  userId={userId}
                  onGoToNotes={() => setCurrentView(AppView.NOTES)}
                />
              </Suspense>
            )}
            <DashboardTips />
          </div>
        );
    }
  };

  return <Suspense fallback={<LoadingFallback />}>{renderContent()}</Suspense>;
};
