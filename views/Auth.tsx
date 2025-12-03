import React, { useState } from 'react'
import { auth, db } from '../firebase'
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signInWithPopup, // <--- Nuevo
    GoogleAuthProvider, // <--- Nuevo
    sendPasswordResetEmail, // <--- Nuevo
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

    // Función auxiliar para crear/verificar usuario en DB tras Login social
    const handleUserInDb = async (user: any) => {
        const docRef = doc(db, 'users', user.uid)
        const docSnap = await getDoc(docRef)

        if (!docSnap.exists()) {
            // Si es nuevo (ej: primera vez con Google), le damos los créditos gratis
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
                setLoading(false) // Detenemos loading aquí porque no redirigimos
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
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4 font-sans relative">
            <button
                onClick={onBack}
                className="absolute top-6 left-6 text-slate-500 hover:text-slate-800 flex items-center gap-2 text-sm font-medium transition-colors"
            >
                ← Volver al inicio
            </button>

            <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-slate-100">
                <div className="text-center mb-8">
                    <div className="bg-brand-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 border border-brand-100">
                        {viewState === 'forgot' ? (
                            <KeyRound className="w-8 h-8 text-brand-600" />
                        ) : (
                            <User className="w-8 h-8 text-brand-600" />
                        )}
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
                        {viewState === 'register' && 'Crear Cuenta Gratis'}
                        {viewState === 'login' && 'Bienvenido de nuevo'}
                        {viewState === 'forgot' && 'Recuperar Contraseña'}
                    </h2>
                    <p className="text-slate-500 text-sm mt-2">
                        {viewState === 'forgot'
                            ? 'Ingresa tu email y te enviaremos un enlace.'
                            : 'Gestiona tu vida freelance con IA.'}
                    </p>
                </div>

                {error && (
                    <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-6 text-sm text-center border border-red-100 font-medium">
                        {error}
                    </div>
                )}

                {successMsg && (
                    <div className="bg-green-50 text-green-700 p-3 rounded-lg mb-6 text-sm text-center border border-green-100 font-medium">
                        {successMsg}
                    </div>
                )}

                {/* LOGIN CON GOOGLE */}
                {viewState !== 'forgot' && (
                    <div className="mb-6">
                        <button
                            type="button"
                            onClick={handleGoogleLogin}
                            disabled={loading}
                            className="w-full py-2.5 border border-slate-300 rounded-xl hover:bg-slate-50 transition-colors flex items-center justify-center gap-3 text-slate-700 font-medium"
                        >
                            <Chrome className="w-5 h-5 text-slate-900" />
                            Continuar con Google
                        </button>
                        <div className="relative my-6">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t border-slate-200"></span>
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-white px-2 text-slate-400">
                                    O usa tu correo
                                </span>
                            </div>
                        </div>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-600 uppercase mb-1 ml-1">
                            Email
                        </label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-3 text-slate-400 w-5 h-5" />
                            <input
                                type="email"
                                required
                                className="w-full pl-10 p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="hola@freelancer.com"
                            />
                        </div>
                    </div>

                    {viewState !== 'forgot' && (
                        <div>
                            <div className="flex justify-between items-center mb-1">
                                <label className="block text-xs font-bold text-slate-600 uppercase ml-1">
                                    Contraseña
                                </label>
                                {viewState === 'login' && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setViewState('forgot')
                                            setError('')
                                        }}
                                        className="text-xs text-brand-600 hover:underline"
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
                                    className="w-full pl-10 p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none transition-all"
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
                        className="w-full py-3 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl transition-all disabled:opacity-70 flex items-center justify-center gap-2 shadow-lg shadow-brand-200"
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

                <div className="mt-8 pt-6 border-t border-slate-100 text-center space-y-2">
                    {viewState === 'forgot' ? (
                        <button
                            onClick={() => {
                                setViewState('login')
                                setError('')
                                setSuccessMsg('')
                            }}
                            className="text-slate-500 hover:text-brand-600 font-medium text-sm"
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
                            className="text-slate-500 hover:text-brand-600 font-medium text-sm transition-colors"
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
