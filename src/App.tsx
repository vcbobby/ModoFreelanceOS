import React, { useCallback, useEffect, useRef } from 'react';
import { Capacitor } from '@capacitor/core';
import { useTheme } from '@context/ThemeContext';
import { useAgendaNotifications } from '@/app/hooks/useAgendaNotifications';
import { usePushNotifications } from '@/app/hooks/usePushNotifications';
import { AppView } from '@types';
import { AuthView } from '@features/auth';
import { PricingModal, ConfirmationModal, ToastProvider } from '@features/shared/ui';
import { AIAssistant, SupportWidget, UpdateChecker } from '@features/shared/widgets';
import { AppShell } from '@/app/AppShell';
import { AppRoutes } from '@/app/AppRoutes';
import { PomodoroController } from '@/app/PomodoroController';
import { useAppDispatch, useAppSelector } from '@/app/hooks/storeHooks';
import { setUser, setLoading, clearAuth } from '@/app/slices/authSlice';
import {
  setDisplayName,
  setUserState,
  updateCredits,
  setPhoneNumber,
} from '@/app/slices/userSlice';
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
const isTestEnv =
  import.meta.env.MODE === 'test' || (import.meta as { env?: { VITEST?: string } }).env?.VITEST;

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
  const { userState, displayName, phoneNumber } = useAppSelector((state) => state.user);
  const notifications = useAppSelector((state) => state.notifications.items);
  const pomodoroActive = useAppSelector((state) => state.pomodoro.isActive);

  const hookNotifications = useAgendaNotifications(authUser?.uid);
  usePushNotifications(authUser?.uid);
  const notificationsKeyRef = useRef('');
  const currentViewRef = useRef(currentView);
  const userStateRef = useRef(userState);
  const agendaAlerts = notifications.filter((n) => n.type === 'agenda').length;
  const financeAlerts = notifications.filter((n) => n.type === 'finance').length;
  const showNoEventsToast = false;

  useEffect(() => {
    currentViewRef.current = currentView;
  }, [currentView]);

  useEffect(() => {
    userStateRef.current = userState;
  }, [userState]);

  const showAlert = useCallback(
    (title: string, message: string) => {
      dispatch(setAlertModal({ isOpen: true, title, message }));
    },
    [dispatch]
  );

  const sendWakeUpPing = useCallback(async () => {
    try {
      await backendClient.ping();
    } catch (error) {
      void error;
    }
  }, []);

  const fetchUserData = useCallback(
    async (uid: string, email?: string) => {
      try {
        const result = await firebaseAdapters.users.getUserDoc(uid);
        const now = Date.now();
        const oneWeekMs = 7 * 24 * 60 * 60 * 1000;

        let finalIsSubscribed = false;
        let finalCredits = 3;
        let finalBaseCredits = 3;
        let finalPurchasedCredits = 0;
        let finalSubEnd = null;
        let finalLastReset = now;

        if (result.exists) {
          const data = result.data || {};
          dispatch(setDisplayName(data.displayName || email?.split('@')[0] || 'Usuario'));
          dispatch(setPhoneNumber(data.phoneNumber || ''));

          let isSub = data.isSubscribed || false;
          let baseCredits = data.credits !== undefined ? data.credits : 0;
          const purchasedCredits = data.purchasedCredits || 0;
          let subEnd = data.subscriptionEnd;
          let lastReset = data.lastReset || now;

          if (isSub && subEnd && now > subEnd) {
            isSub = false;
            baseCredits = 3;
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
          finalCredits = baseCredits + purchasedCredits;
          finalBaseCredits = baseCredits;
          finalPurchasedCredits = purchasedCredits;
          finalSubEnd = subEnd;
          finalLastReset = lastReset;
        } else {
          await firebaseAdapters.users.setUserDoc(uid, {
            email,
            credits: 3,
            purchasedCredits: 0,
            isSubscribed: false,
            createdAt: new Date().toISOString(),
            lastReset: now,
            signupPlatform: Capacitor.isNativePlatform() ? 'Mobile' : 'Web',
          });
          dispatch(setDisplayName(email?.split('@')[0] || 'Usuario'));
        }

        dispatch(
          setUserState({
            isSubscribed: finalIsSubscribed,
            credits: finalCredits,
            baseCredits: finalBaseCredits,
            purchasedCredits: finalPurchasedCredits,
            subscriptionEnd: finalSubEnd,
            nextReset: finalLastReset + oneWeekMs,
          })
        );
      } catch (error) {
        void error;
      } finally {
        dispatch(setLoading(false));
      }
    },
    [dispatch, showAlert]
  );

  const syncWithBackend = useCallback(
    async (uid: string) => {
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
            baseCredits: data.baseCredits !== undefined ? data.baseCredits : 0,
            purchasedCredits: data.purchasedCredits !== undefined ? data.purchasedCredits : 0,
            subscriptionEnd: data.subscriptionEnd,
            nextReset: (data.lastReset || Date.now()) + 604800000,
          })
        );
      } catch (error) {
        void error;
      }
    },
    [checkStatus, dispatch]
  );

  const activateProPlan = useCallback(
    async (uid: string) => {
      try {
        const now = new Date();
        const expirationDate = new Date();
        expirationDate.setDate(now.getDate() + 30);

        await firebaseAdapters.users.updateUserDoc(uid, {
          isSubscribed: true,
          credits: 9999,
          subscriptionEnd: expirationDate.getTime(),
        });

        const prevState = userStateRef.current;
        dispatch(
          setUserState({
            ...prevState,
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
        void error;
      }
    },
    [dispatch, showAlert]
  );

  useEffect(() => {
    if (isTestEnv) return;
    const e2eAuthFlag = import.meta.env.DEV && !isTestEnv ? localStorage.getItem('e2e_auth') : null;
    const e2eQueryFlag =
      import.meta.env.DEV &&
      !isTestEnv &&
      new URLSearchParams(window.location.search).get('e2e') === '1';
    const isE2EActive = isE2E || e2eAuthFlag !== null || e2eQueryFlag;
    if (!isE2EActive) return;

    const isLoggedIn = (e2eAuthFlag ?? 'true') !== 'false';
    if (isLoggedIn) {
      if (authUser?.uid !== 'e2e-user') {
        dispatch(
          setUser({
            uid: 'e2e-user',
            email: 'e2e@local',
            displayName: 'E2E User',
          })
        );
      }
      if (!userState.isSubscribed || userState.credits !== 9999 || !userState.subscriptionEnd) {
        dispatch(
          setUserState({
            isSubscribed: true,
            credits: 9999,
            subscriptionEnd: Date.now() + 30 * 24 * 60 * 60 * 1000,
          })
        );
      }
      if (displayName !== 'E2E User') {
        dispatch(setDisplayName('E2E User'));
      }
      if (currentView === AppView.LANDING) {
        dispatch(setCurrentView(AppView.DASHBOARD));
      }
    } else {
      if (authUser) {
        dispatch(clearAuth());
      }
      if (userState.isSubscribed || userState.credits !== 0) {
        dispatch(setUserState({ isSubscribed: false, credits: 0 }));
      }
      if (displayName) {
        dispatch(setDisplayName(''));
      }
      dispatch(setNotifications([]));
      if (currentView !== AppView.LANDING) {
        dispatch(setCurrentView(AppView.LANDING));
      }
    }
    if (loadingAuth) {
      dispatch(setLoading(false));
    }
  }, [
    authUser,
    currentView,
    dispatch,
    displayName,
    loadingAuth,
    userState.credits,
    userState.isSubscribed,
    userState.subscriptionEnd,
  ]);

  useEffect(() => {
    if (isTestEnv) {
      if (loadingAuth) dispatch(setLoading(false));
      return;
    }
    const e2eAuthFlag = import.meta.env.DEV && !isTestEnv ? localStorage.getItem('e2e_auth') : null;
    const e2eQueryFlag =
      import.meta.env.DEV &&
      !isTestEnv &&
      new URLSearchParams(window.location.search).get('e2e') === '1';
    if (isE2E || e2eAuthFlag !== null || e2eQueryFlag) {
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

        if (currentViewRef.current === AppView.LANDING) {
          dispatch(setCurrentView(AppView.DASHBOARD));
        }
      } else {
        dispatch(clearAuth());
        dispatch(setUserState({ isSubscribed: false, credits: 0 }));
        dispatch(setDisplayName(''));
        dispatch(setNotifications([]));
        if (currentViewRef.current !== AppView.LANDING) {
          dispatch(setCurrentView(AppView.LANDING));
        }
      }
    });

    return () => unsubscribe();
  }, [activateProPlan, dispatch, fetchUserData, sendWakeUpPing, syncWithBackend]);

  useEffect(() => {
    if (isTestEnv) return;
    const key = hookNotifications
      .map((item) => `${item.id}:${item.date}:${item.type}:${item.severity}`)
      .join('|');
    if (key === notificationsKeyRef.current) return;
    notificationsKeyRef.current = key;
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
      void error;
    }
  };

  const handleFeatureUsage = async (cost: number = 1): Promise<boolean> => {
    if (isE2E) return true;
    if (userState.isSubscribed) return true;
    const { baseCredits, purchasedCredits } = userState;
    const totalAvailable = baseCredits + purchasedCredits;

    if (totalAvailable >= cost && authUser) {
      let newBase = baseCredits;
      let newPurchased = purchasedCredits;

      // Deduct from base first
      if (newBase >= cost) {
        newBase -= cost;
      } else {
        const remainingCost = cost - newBase;
        newBase = 0;
        newPurchased -= remainingCost;
      }

      const totalCredits = newBase + newPurchased;

      dispatch(
        setUserState({
          ...userState,
          credits: totalCredits,
          baseCredits: newBase,
          purchasedCredits: newPurchased,
        })
      );

      firebaseAdapters.users.updateUserDoc(authUser.uid, {
        credits: newBase,
        purchasedCredits: newPurchased,
      });
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
        pomodoroBadge={pomodoroActive ? 1 : 0}
        userState={userState}
        userEmail={authUser.email}
        userDisplayName={displayName}
        adminEmails={ADMIN_EMAILS}
        handleLogout={handleLogout}
        setIsPricingOpen={(value) => dispatch(setPricingOpen(value))}
        setDisplayName={(val) => dispatch(setDisplayName(val))}
        userPhoneNumber={phoneNumber}
        setPhoneNumber={(val) => dispatch(setPhoneNumber(val))}
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
      <ToastProvider />
    </>
  );
};

export default App;
