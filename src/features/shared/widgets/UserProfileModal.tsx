import React, { useState, useEffect } from 'react';
import { BaseModal } from '@features/shared/ui/BaseModal';
import { User, Lock, CreditCard, Save, Smartphone, Mail, ShieldCheck, Zap } from 'lucide-react';
import { CREDIT_PACKAGES } from '@features/shared/ui';
import { UserState } from '@types';
import { updatePassword, updateProfile } from 'firebase/auth';
import { firebaseAdapters } from '@/services/firebase/firebaseAdapter';
import { auth } from '@/config/firebase'; // Direct auth import for updatePassword/Profile

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  userState: UserState;
  displayName: string;
  email?: string | null;
  onUpdateName: (newName: string) => Promise<void>;
  onSubscribe: () => void;
  userPhoneNumber?: string;
  onUpdatePhone?: (phone: string) => void;
}

type Tab = 'profile' | 'security' | 'subscription';

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  onClose,
  userState,
  displayName,
  email,
  onUpdateName,
  onSubscribe,
  userPhoneNumber,
  onUpdatePhone,
}) => {
  const [activeTab, setActiveTab] = useState<Tab>('profile');
  const [name, setName] = useState(displayName);
  const [phone, setPhone] = useState(userPhoneNumber || '');
  const [loading, setLoading] = useState(false);

  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Security Form
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Sync local state when modal opens or props change
  useEffect(() => {
    if (isOpen) {
      setName(displayName);
      setPhone(userPhoneNumber || '');
      setMsg(null);
    }
  }, [isOpen, displayName, userPhoneNumber]);

  const handleSaveProfile = async () => {
    setLoading(true);
    setMsg(null);
    try {
      if (auth.currentUser) {
        await updateProfile(auth.currentUser, { displayName: name });
        await onUpdateName(name);

        // Update data in Firestore
        await firebaseAdapters.users.updateUserDoc(auth.currentUser.uid, {
          displayName: name,
          phoneNumber: phone,
        });

        if (onUpdatePhone && phone !== userPhoneNumber) {
          onUpdatePhone(phone);
        }

        setMsg({ type: 'success', text: 'Perfil actualizado correctamente.' });
      }
    } catch (error: any) {
      setMsg({ type: 'error', text: error.message || 'Error al actualizar perfil.' });
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      setMsg({ type: 'error', text: 'Las contraseñas no coinciden.' });
      return;
    }
    if (newPassword.length < 6) {
      setMsg({ type: 'error', text: 'La contraseña debe tener al menos 6 caracteres.' });
      return;
    }
    setLoading(true);
    setMsg(null);
    try {
      if (auth.currentUser) {
        await updatePassword(auth.currentUser, newPassword);
        setMsg({ type: 'success', text: 'Contraseña actualizada exitosamente.' });
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (error: any) {
      if (error.code === 'auth/requires-recent-login') {
        setMsg({
          type: 'error',
          text: 'Por seguridad, debes cerrar sesión y volver a entrar antes de cambiar tu contraseña.',
        });
      } else {
        setMsg({ type: 'error', text: error.message || 'Error al actualizar contraseña.' });
      }
    } finally {
      setLoading(false);
    }
  };

  const TabButton = ({ id, label, icon: Icon }: { id: Tab; label: string; icon: any }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`flex-1 py-3 px-4 flex items-center justify-center gap-2 text-sm font-medium transition-colors border-b-2 ${
        activeTab === id
          ? 'border-brand-600 text-brand-600 bg-brand-50/50 dark:bg-brand-900/10'
          : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800'
      }`}
    >
      <Icon className="w-4 h-4" />
      {label}
    </button>
  );

  return (
    <BaseModal isOpen={isOpen} onClose={onClose} title="Configuración de Cuenta">
      <div className="flex flex-col gap-6 min-h-[400px]">
        {/* TABS - Scrollable on mobile */}
        <div className="flex border-b border-slate-200 dark:border-slate-700 overflow-x-auto thin-scrollbar">
          <TabButton id="profile" label="Perfil" icon={User} />
          <TabButton id="security" label="Seguridad" icon={ShieldCheck} />
          <TabButton id="subscription" label="Suscripción" icon={CreditCard} />
        </div>

        {/* ALERTS */}
        {msg && (
          <div
            className={`p-3 rounded-lg text-sm text-center ${
              msg.type === 'success'
                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
            }`}
          >
            {msg.text}
          </div>
        )}

        {/* CONTENT */}
        <div className="flex-1 overflow-y-auto max-h-[60vh] sm:max-h-none p-1 thin-scrollbar">
          {activeTab === 'profile' && (
            <div className="space-y-4 animate-in fade-in duration-300">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Correo Electrónico
                </label>
                <div className="flex items-center gap-2 px-3 py-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-500 dark:text-slate-400 cursor-not-allowed">
                  <Mail className="w-4 h-4" />
                  <span className="text-sm">{email}</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Nombre Completo
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition-all dark:text-white"
                  />
                </div>
              </div>

              {/* Phone placeholder logic */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Teléfono (Opcional)
                </label>
                <div className="relative">
                  <Smartphone className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+54 9 11..."
                    className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition-all dark:text-white"
                  />
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Usado para notificaciones de seguridad.
                </p>
              </div>

              <div className="pt-4">
                <button
                  onClick={handleSaveProfile}
                  disabled={loading}
                  className="w-full bg-brand-600 hover:bg-brand-700 text-white font-medium py-2 rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                >
                  {loading ? (
                    'Guardando...'
                  ) : (
                    <>
                      <Save className="w-4 h-4" /> Guardar Cambios
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-4 animate-in fade-in duration-300">
              <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg flex gap-3 text-sm text-yellow-700 dark:text-yellow-300">
                <Lock className="w-5 h-5 shrink-0" />
                <p>
                  Si cambias tu contraseña, es posible que debas iniciar sesión nuevamente en todos
                  tus dispositivos.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Nueva Contraseña
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none dark:text-white"
                  placeholder="••••••••"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Confirmar Contraseña
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none dark:text-white"
                  placeholder="••••••••"
                />
              </div>

              <div className="pt-4">
                <button
                  onClick={handleChangePassword}
                  disabled={loading || !newPassword}
                  className="w-full bg-slate-800 hover:bg-slate-900 text-white font-medium py-2 rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                >
                  {loading ? (
                    'Actualizando...'
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4" /> Actualizar Contraseña
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {activeTab === 'subscription' && (
            <div className="space-y-6 animate-in fade-in duration-300 text-center">
              <div className="bg-slate-50 dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700">
                <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Estado del Plan
                </h4>
                {userState.isSubscribed ? (
                  <>
                    <div className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-brand-600 to-purple-600 mb-1">
                      PRO MEMBER
                    </div>
                    <div className="text-sm text-green-600 font-medium flex justify-center items-center gap-1">
                      <ShieldCheck className="w-4 h-4" /> Activo
                    </div>
                  </>
                ) : (
                  <>
                    <div className="text-3xl font-black text-slate-700 dark:text-white mb-1">
                      PLAN GRATUITO
                    </div>
                    <div className="text-sm text-slate-500">Funciones Limitadas</div>
                  </>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-xl border border-slate-100 dark:border-slate-700">
                  <div className="text-xs text-slate-500 mb-1">CREDICTOS IA</div>
                  <div className="text-xl font-bold text-slate-800 dark:text-white">
                    {userState.credits}{' '}
                    <span className="text-xs font-normal text-slate-400">
                      / {userState.isSubscribed ? 'mes' : 'semana'}
                    </span>
                  </div>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-xl border border-slate-100 dark:border-slate-700">
                  <div className="text-xs text-slate-500 mb-1">RENOVACIÓN</div>
                  <div className="text-xl font-bold text-slate-800 dark:text-white">
                    {userState.isSubscribed
                      ? userState.subscriptionEnd
                        ? new Date(userState.subscriptionEnd).toLocaleDateString()
                        : 'N/A'
                      : userState.nextReset
                        ? new Date(userState.nextReset).toLocaleDateString()
                        : 'Pronto'}
                  </div>
                </div>
              </div>

              {!userState.isSubscribed ? (
                <button
                  onClick={() => {
                    onClose();
                    onSubscribe();
                  }}
                  className="w-full bg-gradient-to-r from-brand-600 to-purple-600 hover:from-brand-700 hover:to-purple-700 text-white font-bold py-3 rounded-xl shadow-lg shadow-brand-500/30 transition-all transform hover:scale-[1.02]"
                >
                  MEJORAR A PRO HOY ($10)
                </button>
              ) : (
                <button
                  onClick={() => {
                    onClose();
                    onSubscribe(); // Reuse subscribe logic which redirects to Gumroad portal usually
                  }}
                  className="w-full bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 hover:border-brand-500 text-slate-700 dark:text-white font-bold py-3 rounded-xl transition-all"
                >
                  Gestionar Suscripción
                </button>
              )}

              {!userState.isSubscribed && (
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-center justify-center gap-2 mb-4 text-slate-400">
                    <Zap className="w-4 h-4 fill-current text-brand-500" />
                    <span className="text-xs font-bold uppercase tracking-wider">
                      O compra solo créditos
                    </span>
                  </div>
                  <div className="grid grid-cols-1 gap-3">
                    {CREDIT_PACKAGES.map((pkg) => (
                      <div
                        key={pkg.credits}
                        className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-brand-100 dark:bg-brand-900/30 flex items-center justify-center text-brand-600">
                            <Zap className="w-4 h-4 fill-current" />
                          </div>
                          <div className="text-left">
                            <div className="text-sm font-bold text-slate-800 dark:text-white">
                              {pkg.credits} Créditos
                            </div>
                            <div className="text-[10px] text-slate-500 line-through">
                              {pkg.oldPrice}
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => window.open(pkg.buyUrl, '_blank')}
                          className="px-4 py-1.5 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-lg transition-colors"
                        >
                          {pkg.price}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </BaseModal>
  );
};
