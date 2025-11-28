import React, { useState } from 'react'
import { auth, db } from '../firebase' // Importamos la conexión
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
} from 'firebase/auth'
import { doc, setDoc } from 'firebase/firestore'
import { User, Mail, Lock, ArrowRight, Loader2 } from 'lucide-react'

interface AuthProps {
    onLoginSuccess: () => void
    onBack: () => void
}

export const AuthView = ({ onLoginSuccess, onBack }: AuthProps) => {
    const [isRegistering, setIsRegistering] = useState(false)
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setLoading(true)

        try {
            if (isRegistering) {
                // REGISTRO DE USUARIO NUEVO
                const userCredential = await createUserWithEmailAndPassword(
                    auth,
                    email,
                    password
                )
                const user = userCredential.user

                // Guardamos sus créditos iniciales en la Base de Datos
                await setDoc(doc(db, 'users', user.uid), {
                    email: user.email,
                    credits: 3, // Le regalamos 3 créditos al empezar
                    isSubscribed: false,
                    createdAt: new Date().toISOString(),
                })
            } else {
                // INICIO DE SESIÓN
                await signInWithEmailAndPassword(auth, email, password)
            }
            onLoginSuccess()
        } catch (err: any) {
            console.error(err)
            // Mensajes de error amigables
            if (err.code === 'auth/email-already-in-use')
                setError('Este correo ya está registrado.')
            else if (err.code === 'auth/wrong-password')
                setError('Contraseña incorrecta.')
            else if (err.code === 'auth/user-not-found')
                setError('No existe cuenta con este correo.')
            else setError('Ocurrió un error. Intenta nuevamente.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4 font-sans">
            <button
                onClick={onBack}
                className="absolute top-6 left-6 text-slate-500 hover:text-slate-800 flex items-center gap-2 text-sm font-medium transition-colors"
            >
                ← Volver al inicio
            </button>
            <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-slate-100">
                <div className="text-center mb-8">
                    <div className="bg-brand-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 border border-brand-100">
                        <User className="w-8 h-8 text-brand-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
                        {isRegistering
                            ? 'Crear Cuenta Gratis'
                            : 'Bienvenido de nuevo'}
                    </h2>
                    <p className="text-slate-500 text-sm mt-2">
                        Gestiona tu vida freelance con Inteligencia Artificial.
                    </p>
                </div>

                {error && (
                    <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-6 text-sm text-center border border-red-100 font-medium">
                        {error}
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
                                className="w-full pl-10 p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="hola@freelancer.com"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-600 uppercase mb-1 ml-1">
                            Contraseña
                        </label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-3 text-slate-400 w-5 h-5" />
                            <input
                                type="password"
                                required
                                className="w-full pl-10 p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                minLength={6}
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-brand-200"
                    >
                        {loading ? (
                            <Loader2 className="animate-spin w-5 h-5" />
                        ) : (
                            <>
                                {isRegistering
                                    ? 'Registrarse y Empezar'
                                    : 'Entrar al Dashboard'}
                                {!loading && <ArrowRight className="w-5 h-5" />}
                            </>
                        )}
                    </button>
                </form>

                <div className="mt-8 pt-6 border-t border-slate-100 text-center">
                    <button
                        onClick={() => {
                            setIsRegistering(!isRegistering)
                            setError('')
                        }}
                        className="text-slate-500 hover:text-brand-600 font-medium text-sm transition-colors"
                    >
                        {isRegistering
                            ? '¿Ya tienes cuenta? Inicia sesión aquí'
                            : '¿Nuevo por aquí? Crea una cuenta gratis'}
                    </button>
                </div>
            </div>
        </div>
    )
}
