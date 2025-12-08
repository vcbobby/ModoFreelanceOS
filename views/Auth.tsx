import React, { useState } from 'react'
import { auth, db } from '../firebase'
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signInWithPopup,
    GoogleAuthProvider,
    sendPasswordResetEmail,
} from 'firebase/auth'
import { doc, setDoc, getDoc } from 'firebase/firestore'
import {
    User,
    Mail,
    Lock,
    ArrowRight,
    Loader2,
    Chrome,
    KeyRound,
} from 'lucide-react'

interface AuthProps {
    onLoginSuccess: () => void
    onBack: () => void
}

export const AuthView = ({ onLoginSuccess, onBack }: AuthProps) => {
    const [viewState, setViewState] = useState<'login' | 'register' | 'forgot'>(
        'login'
    )
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [successMsg, setSuccessMsg] = useState('')
    const [loading, setLoading] = useState(false)

    const handleUserInDb = async (user: any) => {
        const docRef = doc(db, 'users', user.uid)
        const docSnap = await getDoc(docRef)
        if (!docSnap.exists()) {
            await setDoc(docRef, {
                email: user.email,
                credits: 3,
                isSubscribed: false,
                createdAt: new Date().toISOString(),
                lastReset: Date.now(),
            })
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setSuccessMsg('')
        setLoading(true)
        try {
            if (viewState === 'register') {
                const userCredential = await createUserWithEmailAndPassword(
                    auth,
                    email,
                    password
                )
                await handleUserInDb(userCredential.user)
                onLoginSuccess()
            } else if (viewState === 'login') {
                await signInWithEmailAndPassword(auth, email, password)
                onLoginSuccess()
            } else if (viewState === 'forgot') {
                await sendPasswordResetEmail(auth, email)
                setSuccessMsg(
                    '¡Listo! Revisa tu correo para restablecer la contraseña.'
                )
                setLoading(false)
                return
            }
        } catch (err: any) {
            console.error(err)
            if (err.code === 'auth/email-already-in-use')
                setError('Este correo ya está registrado.')
            else if (err.code === 'auth/wrong-password')
                setError('Contraseña incorrecta.')
            else if (err.code === 'auth/user-not-found')
                setError('No existe cuenta con este correo.')
            else if (err.code === 'auth/invalid-credential')
                setError('Credenciales inválidas.')
            else setError('Ocurrió un error. Intenta nuevamente.')
        } finally {
            if (viewState !== 'forgot') setLoading(false)
        }
    }

    const handleGoogleLogin = async () => {
        setError('')
        setLoading(true)
        try {
            const provider = new GoogleAuthProvider()
            const result = await signInWithPopup(auth, provider)
            await handleUserInDb(result.user)
            onLoginSuccess()
        } catch (err: any) {
            console.error(err)
            setError('Error al iniciar sesión con Google.')
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 p-4 font-sans relative">
            <button
                onClick={onBack}
                className="absolute top-6 left-6 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 flex items-center gap-2 text-sm font-medium transition-colors"
            >
                ← Volver al inicio
            </button>

            <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-xl w-full max-w-md border border-slate-100 dark:border-slate-700">
                <div className="text-center mb-8">
                    <div className="bg-brand-50 dark:bg-brand-900/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 border border-brand-100 dark:border-brand-800">
                        {viewState === 'forgot' ? (
                            <KeyRound className="w-8 h-8 text-brand-600 dark:text-brand-400" />
                        ) : (
                            <User className="w-8 h-8 text-brand-600 dark:text-brand-400" />
                        )}
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                        {viewState === 'register' && 'Crear Cuenta Gratis'}
                        {viewState === 'login' && 'Bienvenido de nuevo'}
                        {viewState === 'forgot' && 'Recuperar Contraseña'}
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400 text-sm mt-2">
                        {viewState === 'forgot'
                            ? 'Ingresa tu email y te enviaremos un enlace.'
                            : 'Gestiona tu vida freelance con IA.'}
                    </p>
                </div>

                {error && (
                    <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-lg mb-6 text-sm text-center border border-red-100 dark:border-red-800 font-medium">
                        {error}
                    </div>
                )}

                {successMsg && (
                    <div className="bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 p-3 rounded-lg mb-6 text-sm text-center border border-green-100 dark:border-green-800 font-medium">
                        {successMsg}
                    </div>
                )}

                {viewState !== 'forgot' && (
                    <div className="mb-6">
                        <button
                            type="button"
                            onClick={handleGoogleLogin}
                            disabled={loading}
                            className="w-full py-2.5 border border-slate-300 dark:border-slate-600 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors flex items-center justify-center gap-3 text-slate-700 dark:text-slate-200 font-medium bg-white dark:bg-slate-800"
                        >
                            <Chrome className="w-5 h-5 text-slate-900 dark:text-white" />
                            Continuar con Google
                        </button>
                        <div className="relative my-6">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t border-slate-200 dark:border-slate-700"></span>
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-white dark:bg-slate-800 px-2 text-slate-400">
                                    O usa tu correo
                                </span>
                            </div>
                        </div>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase mb-1 ml-1">
                            Email
                        </label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-3 text-slate-400 w-5 h-5" />
                            <input
                                type="email"
                                required
                                className="w-full pl-10 p-3 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none transition-all bg-white dark:bg-slate-900 dark:text-white"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="hola@freelancer.com"
                            />
                        </div>
                    </div>

                    {viewState !== 'forgot' && (
                        <div>
                            <div className="flex justify-between items-center mb-1">
                                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase ml-1">
                                    Contraseña
                                </label>
                                {viewState === 'login' && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setViewState('forgot')
                                            setError('')
                                        }}
                                        className="text-xs text-brand-600 dark:text-brand-400 hover:underline"
                                    >
                                        ¿Olvidaste la contraseña?
                                    </button>
                                )}
                            </div>
                            <div className="relative">
                                <Lock className="absolute left-3 top-3 text-slate-400 w-5 h-5" />
                                <input
                                    type="password"
                                    required
                                    className="w-full pl-10 p-3 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none transition-all bg-white dark:bg-slate-900 dark:text-white"
                                    value={password}
                                    onChange={(e) =>
                                        setPassword(e.target.value)
                                    }
                                    placeholder="••••••••"
                                    minLength={6}
                                />
                            </div>
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl transition-all disabled:opacity-70 flex items-center justify-center gap-2 shadow-lg shadow-brand-200 dark:shadow-none"
                    >
                        {loading ? (
                            <Loader2 className="animate-spin w-5 h-5" />
                        ) : (
                            <>
                                {viewState === 'register' &&
                                    'Registrarse Gratis'}
                                {viewState === 'login' && 'Entrar al Dashboard'}
                                {viewState === 'forgot' &&
                                    'Enviar enlace de recuperación'}
                                {!loading && viewState !== 'forgot' && (
                                    <ArrowRight className="w-5 h-5" />
                                )}
                            </>
                        )}
                    </button>
                </form>

                <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-700 text-center space-y-2">
                    {viewState === 'forgot' ? (
                        <button
                            onClick={() => {
                                setViewState('login')
                                setError('')
                                setSuccessMsg('')
                            }}
                            className="text-slate-500 hover:text-brand-600 dark:hover:text-brand-400 font-medium text-sm"
                        >
                            Volver a Iniciar Sesión
                        </button>
                    ) : (
                        <button
                            onClick={() => {
                                setViewState(
                                    viewState === 'login' ? 'register' : 'login'
                                )
                                setError('')
                            }}
                            className="text-slate-500 dark:text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 font-medium text-sm transition-colors"
                        >
                            {viewState === 'login'
                                ? '¿Nuevo por aquí? Crea una cuenta gratis'
                                : '¿Ya tienes cuenta? Inicia sesión aquí'}
                        </button>
                    )}
                </div>
            </div>
        </div>
    )
}
