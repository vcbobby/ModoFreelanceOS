import React from 'react';
import { ArrowRight, CheckCircle, Zap, FileText, Shield } from 'lucide-react';
import { Button } from '../components/ui';

export const Landing: React.FC<{ onStart: () => void }> = ({ onStart }) => {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Hero */}
      <section className="flex-1 flex flex-col items-center justify-center text-center px-4 py-20 bg-gradient-to-b from-slate-50 to-white">
        <div className="inline-block p-2 bg-brand-100 text-brand-700 rounded-full text-xs font-bold tracking-wide mb-6">
          PARA FREELANCERS LATINOS 🚀
        </div>
        <h1 className="text-5xl md:text-6xl font-extrabold text-slate-900 mb-6 tracking-tight max-w-4xl">
          Deja de perder horas escribiendo propuestas que <span className="text-brand-600">nadie lee</span>.
        </h1>
        <p className="text-xl text-slate-600 mb-10 max-w-2xl leading-relaxed">
          ModoFreelanceOS usa Inteligencia Artificial para escribir propuestas ganadoras adaptadas a Upwork, Workana, LinkedIn y Freelancer.
        </p>
        <div className="flex gap-4 flex-col sm:flex-row">
          <Button onClick={onStart} className="text-lg px-8 py-4 h-auto shadow-xl shadow-brand-500/20">
            Empezar Gratis
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
        <p className="mt-4 text-sm text-slate-400">Sin tarjeta de crédito para la demo.</p>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-4 bg-slate-50">
        <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-10">
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 mb-6">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-3">Propuestas con IA</h3>
            <p className="text-slate-600">
              Genera 3 opciones (Formal, Corta, Valor) adaptadas a tu perfil. Soporta reglas específicas de Workana (formato Markdown) y límites de caracteres de Freelancer.
            </p>
          </div>
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
            <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center text-orange-600 mb-6">
              <Shield className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-3">Contratos Seguros</h3>
            <p className="text-slate-600">
              Accede a plantillas de contratos simples y efectivas para proteger tu trabajo con clientes de EE.UU. y Europa.
            </p>
          </div>
        </div>
      </section>

      {/* Pricing Teaser */}
      <section className="py-20 px-4 text-center">
        <h2 className="text-3xl font-bold text-slate-900 mb-4">¿Por qué pagar $10/mes?</h2>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto mb-8">
          Si nuestra herramienta te ayuda a ganar <strong>un solo proyecto</strong> de $500, la suscripción se paga sola por 4 años. Es ridículamente barato.
        </p>
        <ul className="inline-flex flex-col items-start space-y-3 bg-white p-8 rounded-2xl border border-slate-200 shadow-lg">
          <li className="flex items-center text-slate-700"><CheckCircle className="w-5 h-5 text-brand-500 mr-3"/> Ahorra 10+ horas al mes en redacción</li>
          <li className="flex items-center text-slate-700"><CheckCircle className="w-5 h-5 text-brand-500 mr-3"/> Formato perfecto para cada plataforma</li>
          <li className="flex items-center text-slate-700"><CheckCircle className="w-5 h-5 text-brand-500 mr-3"/> Mejora tu tasa de conversión</li>
        </ul>
      </section>
    </div>
  );
};