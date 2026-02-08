import React, { useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
import { useTheme } from '@context/ThemeContext';
import { useAgendaNotifications } from '@/app/hooks/useAgendaNotifications';
import { AppView } from '@types';
import { AuthView } from '@features/auth';
import { PricingModal, ConfirmationModal } from '@features/shared/ui';
import { AIAssistant, SupportWidget, UpdateChecker } from '@features/shared/widgets';
import { AppShell } from '@/app/AppShell';
import { AppRoutes } from '@/app/AppRoutes';
import { PomodoroController } from '@/app/PomodoroController';
import { useAppDispatch, useAppSelector } from '@/app/hooks/storeHooks';
import { setUser, setLoading, clearAuth } from '@/app/slices/authSlice';
import { setDisplayName, setUserState, updateCredits } from '@/app/slices/userSlice';
import {
  closeAlertModal,
  setAlertModal,
  setAutoOpenAgenda,
  setCurrentView,
  setIsEditingName,
  setMobileMenuOpen,
  setNotifOpen,
  setPricingOpen,
  setShowSuccessMsg,
} from '@/app/slices/uiSlice';
import { setNotifications } from '@/app/slices/notificationsSlice';
import { firebaseAdapters } from '@/services/firebase/firebaseAdapter';
import { backendClient } from '@/services/backend/backendClient';
import { useCheckStatusMutation } from '@/services/backend/backendApi';

const GUMROAD_LINK = 'https://modofreelanceos.gumroad.com/l/pro-subs';
const WORDPRESS_URL = 'http://modofreelanceos.com/';
const ADMIN_EMAILS = ['castillovictor2461@gmail.com'];
const isE2E = import.meta.env.VITE_E2E === 'true';

const App = () => {
  const dispatch = useAppDispatch();
  const { theme, toggleTheme } = useTheme();
  const [checkStatus] = useCheckStatusMutation();

  const {
    currentView,
    isPricingOpen,
    isMobileMenuOpen,
    autoOpenAgenda,
    isNotifOpen,
    alertModal,
    showSuccessMsg,
    isEditingName,
  } = useAppSelector((state) => state.ui);
  const { user: authUser, loading: loadingAuth } = useAppSelector((state) => state.auth);
  const { userState, displayName } = useAppSelector((state) => state.user);
  const notifications = useAppSelector((state) => state.notifications.items);

  const hookNotifications = useAgendaNotifications(authUser?.uid);
  const agendaAlerts = notifications.filter((n) => n.type === 'agenda').length;
  const financeAlerts = notifications.filter((n) => n.type === 'finance').length;
  const showNoEventsToast = false;

  const showAlert = (title: string, message: string) => {
    dispatch(setAlertModal({ isOpen: true, title, message }));
  };

  const sendWakeUpPing = async () => {
    try {
      await backendClient.ping();
    } catch (error) {
      console.log('Ping complete or timed out (normal behavior).');
    }
  };

  useEffect(() => {
    if (isE2E) {
      const isLoggedIn = localStorage.getItem('e2e_auth') !== 'false';
      if (isLoggedIn) {
        dispatch(
          setUser({
            uid: 'e2e-user',
            email: 'e2e@local',
            displayName: 'E2E User',
          })
        );
        dispatch(
          setUserState({
            isSubscribed: true,
            credits: 9999,
            subscriptionEnd: Date.now() + 30 * 24 * 60 * 60 * 1000,
          })
        );
        dispatch(setDisplayName('E2E User'));
        if (currentView === AppView.LANDING) {
          dispatch(setCurrentView(AppView.DASHBOARD));
        }
      } else {
        dispatch(clearAuth());
        dispatch(setUserState({ isSubscribed: false, credits: 0 }));
        dispatch(setDisplayName(''));
        dispatch(setNotifications([]));
        dispatch(setCurrentView(AppView.LANDING));
      }
      dispatch(setLoading(false));
      return;
    }

    const unsubscribe = firebaseAdapters.auth.onAuthStateChanged(async (currentUser) => {
      if (currentUser) {
        dispatch(
          setUser({
            uid: currentUser.uid,
            email: currentUser.email,
            displayName: currentUser.displayName,
          })
        );
        dispatch(setLoading(false));
        fetchUserData(currentUser.uid, currentUser.email || undefined);
        sendWakeUpPing();
        syncWithBackend(currentUser.uid);

        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('payment_success') === 'true') {
          activateProPlan(currentUser.uid);
        }

        if (currentView === AppView.LANDING) {
          dispatch(setCurrentView(AppView.DASHBOARD));
        }
      } else {
        dispatch(clearAuth());
        dispatch(setUserState({ isSubscribed: false, credits: 0 }));
        dispatch(setDisplayName(''));
        dispatch(setNotifications([]));
      }
    });

    return () => unsubscribe();
  }, [currentView, dispatch]);

  useEffect(() => {
    dispatch(setNotifications(hookNotifications));
  }, [dispatch, hookNotifications]);

  const handleBellClick = () => {
    dispatch(setNotifOpen(!isNotifOpen));
  };

  const handleNotificationNavigation = (route: string) => {
    if (route === 'NOTES') {
      dispatch(setAutoOpenAgenda(true));
      dispatch(setCurrentView(AppView.NOTES));
      setTimeout(() => dispatch(setAutoOpenAgenda(false)), 2000);
    } else if (route === 'FINANCES') {
      if (userState.isSubscribed) {
        dispatch(setCurrentView(AppView.FINANCES));
      } else {
        dispatch(setPricingOpen(true));
      }
    }
    dispatch(setMobileMenuOpen(false));
  };

  const handleSaveName = async () => {
    if (!authUser || !displayName.trim()) return;
    try {
      await firebaseAdapters.users.updateUserDoc(authUser.uid, {
        displayName: displayName,
      });
      dispatch(setIsEditingName(false));
    } catch (error) {
      console.error('Error guardando nombre', error);
    }
  };

  const fetchUserData = async (uid: string, email?: string) => {
    try {
      const result = await firebaseAdapters.users.getUserDoc(uid);
      const now = Date.now();
      const oneWeekMs = 7 * 24 * 60 * 60 * 1000;

      let finalIsSubscribed = false;
      let finalCredits = 3;
      let finalSubEnd = null;
      let finalLastReset = now;

      if (result.exists) {
        const data = result.data || {};
        dispatch(
          setDisplayName(data.displayName || email?.split('@')[0] || 'Usuario')
        );

        let isSub = data.isSubscribed || false;
        let credits = data.credits !== undefined ? data.credits : 0;
        let subEnd = data.subscriptionEnd;
        let lastReset = data.lastReset || now;

        if (isSub && subEnd && now > subEnd) {
          isSub = false;
          credits = 3;
          lastReset = now;
          subEnd = null;
          firebaseAdapters.users.updateUserDoc(uid, {
            isSubscribed: false,
            credits: 3,
            lastReset: now,
            subscriptionEnd: null,
          });
          showAlert('Plan Vencido', 'Tu plan PRO ha finalizado.');
        }

        finalIsSubscribed = isSub;
        finalCredits = credits;
        finalSubEnd = subEnd;
        finalLastReset = lastReset;
      } else {
        await firebaseAdapters.users.setUserDoc(uid, {
          email,
          credits: 3,
          isSubscribed: false,
          createdAt: new Date().toISOString(),
          lastReset: now,
          signupPlatform: Capacitor.isNativePlatform() ? 'Mobile' : 'Web',
        });
        dispatch(setDisplayName(email?.split('@')[0] || 'Usuario'));
      }

      dispatch(setUserState({
        isSubscribed: finalIsSubscribed,
        credits: finalCredits,
        subscriptionEnd: finalSubEnd,
        nextReset: finalLastReset + oneWeekMs,
      }));
    } catch (error) {
      console.error('Error fetchUserData:', error);
    } finally {
      dispatch(setLoading(false));
    }
  };

  const syncWithBackend = async (uid: string) => {
    if (isE2E) return;
    try {
      let currentPlatform = 'Web Browser';
      if (Capacitor.isNativePlatform()) currentPlatform = 'Android App';
      else if (navigator.userAgent.toLowerCase().includes(' electron/'))
        currentPlatform = 'Windows App';
      const result = await checkStatus({ platform: currentPlatform, userId: uid }).unwrap();
      const data = result.data;
      dispatch(
        setUserState({
          isSubscribed: data.isSubscribed || false,
          credits: data.credits !== undefined ? data.credits : 0,
          subscriptionEnd: data.subscriptionEnd,
          nextReset: (data.lastReset || Date.now()) + 604800000,
        })
      );
    } catch (error) {
      console.log('Backend todavía despertando o error de red (no crítico).');
    }
  };

  const activateProPlan = async (uid: string) => {
    try {
      const now = new Date();
      const expirationDate = new Date();
      expirationDate.setDate(now.getDate() + 30);

      await firebaseAdapters.users.updateUserDoc(uid, {
        isSubscribed: true,
        credits: 9999,
        subscriptionEnd: expirationDate.getTime(),
      });

      dispatch(
        setUserState({
          ...userState,
          isSubscribed: true,
          credits: 9999,
          subscriptionEnd: expirationDate.getTime(),
        })
      );
      window.history.replaceState({}, document.title, window.location.pathname);
      showAlert(
        '¡Pago Exitoso!',
        `Suscripción PRO activa. Tu plan es válido hasta el ${expirationDate.toLocaleDateString()}. ¡Disfruta!`
      );
      dispatch(setShowSuccessMsg(true));
      setTimeout(() => dispatch(setShowSuccessMsg(false)), 5000);
    } catch (error) {
      console.error('Error activando plan:', error);
    }
  };

  const handleFeatureUsage = async (cost: number = 1): Promise<boolean> => {
    if (isE2E) return true;
    if (userState.isSubscribed) return true;
    if (userState.credits >= cost && authUser) {
      const newCredits = userState.credits - cost;
      dispatch(updateCredits(newCredits));
      firebaseAdapters.users.updateUserDoc(authUser.uid, { credits: newCredits });
      return true;
    } else {
      dispatch(setPricingOpen(true));
      return false;
    }
  };

  const handleLogout = async () => {
    if (isE2E) {
      localStorage.setItem('e2e_auth', 'false');
      dispatch(clearAuth());
    } else {
      await firebaseAdapters.auth.signOut();
    }
    dispatch(setCurrentView(AppView.LANDING));
    dispatch(setMobileMenuOpen(false));
  };

  const handleSubscribe = () => {
    if (!authUser) return;
    window.location.href = GUMROAD_LINK;
  };

  if (loadingAuth) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 text-slate-500 dark:text-slate-400">
        Cargando ModoFreelanceOS...
      </div>
    );
  }

  if (!authUser) {
    return (
      <AuthView
        onLoginSuccess={() => dispatch(setCurrentView(AppView.DASHBOARD))}
        onBack={() => (window.location.href = WORDPRESS_URL)}
      />
    );
  }

  return (
    <>
      <UpdateChecker />
      <PomodoroController />
      <AppShell
        currentView={currentView}
        setCurrentView={(view) => dispatch(setCurrentView(view))}
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={(value) => dispatch(setMobileMenuOpen(value))}
        toggleTheme={toggleTheme}
        theme={theme}
        notifications={notifications}
        isNotifOpen={isNotifOpen}
        setIsNotifOpen={(value) => dispatch(setNotifOpen(value))}
        handleNotificationNavigation={handleNotificationNavigation}
        showNoEventsToast={showNoEventsToast}
        handleBellClick={handleBellClick}
        agendaAlerts={agendaAlerts}
        financeAlerts={financeAlerts}
        userState={userState}
        userEmail={authUser.email}
        userDisplayName={displayName}
        adminEmails={ADMIN_EMAILS}
        handleLogout={handleLogout}
        setIsPricingOpen={(value) => dispatch(setPricingOpen(value))}
      >
        <AppRoutes
          currentView={currentView}
          userId={authUser.uid}
          userState={userState}
          handleFeatureUsage={handleFeatureUsage}
          setCurrentView={(view) => dispatch(setCurrentView(view))}
          setAutoOpenAgenda={(value) => dispatch(setAutoOpenAgenda(value))}
          autoOpenAgenda={autoOpenAgenda}
          setIsPricingOpen={(value) => dispatch(setPricingOpen(value))}
          showSuccessMsg={showSuccessMsg}
          displayName={displayName}
          isEditingName={isEditingName}
          setIsEditingName={(value) => dispatch(setIsEditingName(value))}
          setDisplayName={(value) => dispatch(setDisplayName(value))}
          handleSaveName={handleSaveName}
        />
      </AppShell>
      <SupportWidget />
      <AIAssistant userId={authUser.uid} onUsage={handleFeatureUsage} />
      <PricingModal
        isOpen={isPricingOpen}
        onClose={() => dispatch(setPricingOpen(false))}
        onSubscribe={handleSubscribe}
        isPro={userState.isSubscribed}
      />
      <ConfirmationModal
        isOpen={alertModal.isOpen}
        onClose={() => dispatch(closeAlertModal())}
        onConfirm={() => dispatch(closeAlertModal())}
        title={alertModal.title}
        message={alertModal.message}
        confirmText="Entendido"
        cancelText=""
      />
    </>
  );
};

export default App;
