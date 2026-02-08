import React, { useLayoutEffect, useRef } from 'react';
import {
  LayoutDashboard,
  PenTool,
  Menu,
  X,
  LogOut,
  User as UserIcon,
  History,
  Palette,
  FileText,
  StickyNote,
  Bell,
  QrCode,
  Zap,
  FileSearch,
  DollarSign,
  Moon,
  Sun,
  Briefcase,
  ClipboardList,
  Globe,
  Timer,
  FileUser,
  GraduationCap,
  Radar,
  ShieldAlert,
  Monitor,
} from 'lucide-react';
import { AppView, UserState } from '@types';
import { NotificationModal } from '@features/shared/ui';

interface AppShellProps {
  currentView: AppView;
  setCurrentView: (view: AppView) => void;
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (value: boolean) => void;
  toggleTheme: () => void;
  theme: 'light' | 'dark';
  notifications: any[];
  isNotifOpen: boolean;
  setIsNotifOpen: (value: boolean) => void;
  handleNotificationNavigation: (route: string) => void;
  showNoEventsToast: boolean;
  handleBellClick: () => void;
  agendaAlerts: number;
  financeAlerts: number;
  userState: UserState;
  userEmail?: string | null;
  userDisplayName?: string;
  adminEmails: string[];
  handleLogout: () => void;
  setIsPricingOpen: (value: boolean) => void;
  children: React.ReactNode;
}

const NavItem = ({ icon, label, active, onClick, badge }: any) => (
  <button
    onClick={(event) => {
      event.preventDefault();
      onClick();
    }}
    className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-colors group ${
      active
        ? 'bg-brand-600 text-white shadow-md'
        : 'hover:bg-slate-800 text-slate-400 hover:text-white'
    }`}
  >
    <div className="flex items-center space-x-3">
      {React.cloneElement(icon, { size: 20 })}
      <span className="font-medium">{label}</span>
    </div>
    {badge > 0 && (
      <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full animate-pulse shadow-sm">
        {badge}
      </span>
    )}
  </button>
);

export const AppShell: React.FC<AppShellProps> = ({
  currentView,
  setCurrentView,
  isMobileMenuOpen,
  setIsMobileMenuOpen,
  toggleTheme,
  theme,
  notifications,
  isNotifOpen,
  setIsNotifOpen,
  handleNotificationNavigation,
  showNoEventsToast,
  handleBellClick,
  agendaAlerts,
  financeAlerts,
  userState,
  userEmail,
  userDisplayName,
  adminEmails,
  handleLogout,
  setIsPricingOpen,
  children,
}) => {
  const sidebarRef = useRef<HTMLElement>(null);
  const sidebarScrollPosition = useRef(0);

  useLayoutEffect(() => {
    if (sidebarRef.current) {
      sidebarRef.current.scrollTop = sidebarScrollPosition.current;
    }
  }, [currentView]);

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-100 transition-colors duration-300">
      <div className="md:hidden fixed top-0 w-full bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 z-50 px-4 py-3 flex justify-between items-center gap-4 transition-colors">
        <span
          onClick={() => {
            setCurrentView(AppView.DASHBOARD);
            setIsMobileMenuOpen(false);
          }}
          className="text-slate-900 dark:text-white font-bold text-xl tracking-tight cursor-pointer"
        >
          ModoFreelance<span className="text-brand-600">OS</span>
        </span>
        <div className="flex items-center gap-4 relative">
          {showNoEventsToast && (
            <div className="absolute top-10 right-0 w-48 bg-slate-800 dark:bg-slate-700 text-white text-xs p-2 rounded-lg shadow-xl z-50 text-center animate-in fade-in slide-in-from-top-2">
              <span className="block font-bold">Todo tranquilo 😎</span>
              No hay eventos próximos.
              <div className="absolute -top-1 right-8 w-2 h-2 bg-slate-800 dark:bg-slate-700 rotate-45"></div>
            </div>
          )}
          <button
            onClick={toggleTheme}
            className="text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 p-1 rounded-full transition-colors"
          >
            {theme === 'dark' ? <Sun className="w-6 h-6" /> : <Moon className="w-6 h-6" />}
          </button>
          <div className="relative">
            <button
              onClick={handleBellClick}
              className="text-slate-600 dark:text-slate-300 relative hover:bg-slate-100 dark:hover:bg-slate-800 p-1 rounded-full transition-colors"
            >
              <Bell className="w-6 h-6" />
              {notifications.length > 0 && (
                <span className="absolute top-0 right-0 flex h-3 w-3 items-center justify-center rounded-full bg-red-500 text-[8px] text-white animate-bounce ring-2 ring-white dark:ring-slate-900">
                  {notifications.length}
                </span>
              )}
            </button>
            <NotificationModal
              isOpen={isNotifOpen}
              onClose={() => setIsNotifOpen(false)}
              notifications={notifications}
              onNavigate={handleNotificationNavigation}
            />
          </div>
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="text-slate-900 dark:text-white"
          >
            {isMobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
      <aside
        className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-slate-300 transform transition-transform duration-200 ease-in-out md:translate-x-0 md:static
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
        flex flex-col h-screen border-r border-slate-800
      `}
      >
        <div className="p-6 shrink-0">
          <h1
            className="text-2xl font-bold text-white tracking-tight cursor-pointer"
            onClick={() => {
              setCurrentView(AppView.DASHBOARD);
              setIsMobileMenuOpen(false);
            }}
          >
            ModoFreelance<span className="text-brand-500">OS</span>
          </h1>
        </div>

        <nav
          ref={sidebarRef}
          onScroll={(event) => {
            sidebarScrollPosition.current = event.currentTarget.scrollTop;
          }}
          className="flex-1 px-4 space-y-2 overflow-y-auto custom-scrollbar min-h-0"
        >
          <NavItem
            icon={<LayoutDashboard />}
            label="Inicio"
            active={currentView === AppView.DASHBOARD}
            onClick={() => {
              setCurrentView(AppView.DASHBOARD);
              setIsMobileMenuOpen(false);
            }}
          />
          <NavItem
            icon={<Monitor />}
            label="Web Builder"
            active={currentView === AppView.WEBSITE_BUILDER}
            onClick={() => {
              setCurrentView(AppView.WEBSITE_BUILDER);
              setIsMobileMenuOpen(false);
            }}
          />
          <NavItem
            icon={<PenTool />}
            label="Propuestas IA"
            active={currentView === AppView.PROPOSALS}
            onClick={() => {
              setCurrentView(AppView.PROPOSALS);
              setIsMobileMenuOpen(false);
            }}
          />
          <NavItem
            icon={<Globe />}
            label="Generador Fiverr"
            active={currentView === AppView.FIVERR}
            onClick={() => {
              setCurrentView(AppView.FIVERR);
              setIsMobileMenuOpen(false);
            }}
          />
          <NavItem
            icon={<StickyNote />}
            label="Agenda & Notas"
            active={currentView === AppView.NOTES}
            badge={agendaAlerts}
            onClick={() => {
              setCurrentView(AppView.NOTES);
              setIsMobileMenuOpen(false);
            }}
          />
          <NavItem
            icon={<Timer />}
            label="Pomodoro Focus"
            active={currentView === AppView.POMODORO}
            onClick={() => {
              setCurrentView(AppView.POMODORO);
              setIsMobileMenuOpen(false);
            }}
          />
          <NavItem
            icon={<DollarSign />}
            label="Finanzas"
            active={currentView === AppView.FINANCES}
            badge={financeAlerts}
            onClick={() => {
              if (userState.isSubscribed) {
                setCurrentView(AppView.FINANCES);
                setIsMobileMenuOpen(false);
              } else {
                setIsPricingOpen(true);
              }
            }}
          />
          <NavItem
            icon={<Radar />}
            label="Buscar Trabajo"
            active={currentView === AppView.JOBS}
            onClick={() => {
              setCurrentView(AppView.JOBS);
              setIsMobileMenuOpen(false);
            }}
          />
          <NavItem
            icon={<GraduationCap />}
            label="Academia Freelance"
            active={currentView === AppView.ACADEMY}
            onClick={() => {
              setCurrentView(AppView.ACADEMY);
              setIsMobileMenuOpen(false);
            }}
          />
          <NavItem
            icon={<Briefcase />}
            label="Creador Portafolio"
            active={currentView === AppView.PORTFOLIO}
            onClick={() => {
              setCurrentView(AppView.PORTFOLIO);
              setIsMobileMenuOpen(false);
            }}
          />
          <NavItem
            icon={<FileUser />}
            label="Constructor CV"
            active={currentView === AppView.CV_BUILDER}
            onClick={() => {
              setCurrentView(AppView.CV_BUILDER);
              setIsMobileMenuOpen(false);
            }}
          />
          <NavItem
            icon={<ClipboardList />}
            label="Briefing & Tareas"
            active={currentView === AppView.BRIEFING}
            onClick={() => {
              setCurrentView(AppView.BRIEFING);
              setIsMobileMenuOpen(false);
            }}
          />
          <NavItem
            icon={<Palette />}
            label="Generador Logos"
            active={currentView === AppView.LOGOS}
            onClick={() => {
              setCurrentView(AppView.LOGOS);
              setIsMobileMenuOpen(false);
            }}
          />
          <NavItem
            icon={<FileText />}
            label="Facturación"
            active={currentView === AppView.INVOICES}
            onClick={() => {
              setCurrentView(AppView.INVOICES);
              setIsMobileMenuOpen(false);
            }}
          />
          <NavItem
            icon={<QrCode />}
            label="Generador QR"
            active={currentView === AppView.QR}
            onClick={() => {
              setCurrentView(AppView.QR);
              setIsMobileMenuOpen(false);
            }}
          />
          <NavItem
            icon={<Zap />}
            label="Optimizar Img"
            active={currentView === AppView.OPTIMIZER}
            onClick={() => {
              setCurrentView(AppView.OPTIMIZER);
              setIsMobileMenuOpen(false);
            }}
          />
          <NavItem
            icon={<FileSearch />}
            label="Analizar Doc"
            active={currentView === AppView.ANALYZER}
            onClick={() => {
              setCurrentView(AppView.ANALYZER);
              setIsMobileMenuOpen(false);
            }}
          />
          <NavItem
            icon={<History />}
            label="Historial"
            active={currentView === AppView.HISTORY}
            onClick={() => {
              setCurrentView(AppView.HISTORY);
              setIsMobileMenuOpen(false);
            }}
          />
          {userEmail && adminEmails.includes(userEmail) && (
            <>
              <div className="my-2 border-t border-slate-700/50 mx-4"></div>
              <NavItem
                icon={<ShieldAlert className="text-red-500" />}
                label="Super Admin"
                active={currentView === AppView.ADMIN}
                onClick={() => {
                  setCurrentView(AppView.ADMIN);
                  setIsMobileMenuOpen(false);
                }}
              />
            </>
          )}
        </nav>

        <div className="p-4 bg-slate-900 shrink-0 border-t border-slate-800">
          <div className="bg-slate-800 p-3 rounded-xl mb-3">
            <div className="flex items-center gap-2 mb-2 text-white">
              <UserIcon className="w-4 h-4" />
              <span className="text-xs truncate max-w-[120px] font-medium">
                {userDisplayName || userEmail?.split('@')[0]}
              </span>
            </div>

            <div className="flex justify-between items-center bg-slate-900 p-2 rounded-lg">
              <span className="text-[10px] font-bold text-white uppercase">
                {userState.isSubscribed ? 'PLAN PRO' : 'FREE'}
              </span>
              {!userState.isSubscribed && (
                <span className="text-[10px] text-brand-400 font-bold">
                  {userState.credits} créd.
                </span>
              )}
            </div>

            <button
              onClick={() => setIsPricingOpen(true)}
              className={`w-full mt-2 py-1.5 text-[10px] font-bold rounded-lg transition-colors uppercase tracking-wide ${
                userState.isSubscribed
                  ? 'bg-slate-700 hover:bg-slate-600 text-slate-300 border border-slate-600'
                  : 'bg-brand-600 hover:bg-brand-500 text-white shadow-lg shadow-brand-900/20'
              }`}
            >
              {userState.isSubscribed ? 'Gestionar Plan' : 'Ser PRO ($10)'}
            </button>
          </div>

          <div className="flex items-center gap-2 mt-2">
            <button
              onClick={handleLogout}
              className="flex-1 flex items-center justify-center py-2 text-sm text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4 mr-2" />
              <span className="truncate">Cerrar Sesión</span>
            </button>

            <button
              onClick={toggleTheme}
              className="p-2 text-slate-400 hover:text-yellow-400 hover:bg-slate-800 rounded-lg transition-colors"
              title={theme === 'dark' ? 'Modo Claro' : 'Modo Oscuro'}
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </aside>

      <main className="flex-1 h-full overflow-y-auto overflow-x-hidden pt-16 md:pt-0 relative scroll-smooth overscroll-none">
        <div className="max-w-6xl mx-auto p-4 md:p-8 lg:p-12 pb-24">{children}</div>
      </main>
    </div>
  );
};
