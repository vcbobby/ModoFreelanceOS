import React from 'react';
import { Play, Pause, RotateCcw, Coffee, Brain } from 'lucide-react';
import { Card } from '@features/shared/ui';
import { useAppDispatch, useAppSelector } from '@/app/hooks/storeHooks';
import { resetTimer, switchMode, toggleTimer } from '@/app/slices/pomodoroSlice';

export const PomodoroTool = () => {
  const dispatch = useAppDispatch();
  const { timeLeft, isActive, mode } = useAppSelector((state) => state.pomodoro);

  const tips = {
    work: [
      '¡Enfócate en una sola cosa!',
      'Aleja el celular.',
      'Si te distraes, anótalo y sigue.',
      'Estás construyendo tu futuro.',
    ],
    short: ['Estira las piernas.', 'Mira por la ventana.', 'Toma agua.', 'Respira profundo.'],
    long: ['Camina un poco.', 'No mires pantallas.', 'Come algo sano.', 'Medita.'],
  };
  // Tip aleatorio simple basado en el tiempo para no complicar estado
  const currentTip = tips[mode][timeLeft % tips[mode].length];

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const totalTime = mode === 'work' ? 1500 : mode === 'short' ? 300 : 900;
  const progress = 100 - (timeLeft / totalTime) * 100;

  return (
    <div className="max-w-xl mx-auto text-center">
      <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 flex items-center justify-center gap-2">
        <Brain className="w-6 h-6 text-brand-600" /> Pomodoro Focus
      </h2>

      <Card className="p-8 relative overflow-hidden border-2 border-slate-100 dark:border-slate-700">
        <div className="relative w-64 h-64 mx-auto mb-8 flex items-center justify-center rounded-full border-8 border-slate-100 dark:border-slate-700">
          <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="46"
              fill="transparent"
              stroke={mode === 'work' ? '#16a34a' : '#3b82f6'}
              strokeWidth="8"
              strokeDasharray="289"
              strokeDashoffset={289 - (289 * progress) / 100}
              strokeLinecap="round"
              className="transition-all duration-1000 ease-linear"
            />
          </svg>
          <div className="text-6xl font-mono font-bold text-slate-800 dark:text-white z-10">
            {formatTime(timeLeft)}
          </div>
        </div>

        <div className="flex justify-center gap-4 mb-8">
          <button
            onClick={() => dispatch(switchMode('work'))}
            className={`px-4 py-1 rounded-full text-sm font-bold transition-colors ${
              mode === 'work'
                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                : 'text-slate-400'
            }`}
          >
            Trabajo
          </button>
          <button
            onClick={() => dispatch(switchMode('short'))}
            className={`px-4 py-1 rounded-full text-sm font-bold transition-colors ${
              mode === 'short'
                ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                : 'text-slate-400'
            }`}
          >
            Corto
          </button>
          <button
            onClick={() => dispatch(switchMode('long'))}
            className={`px-4 py-1 rounded-full text-sm font-bold transition-colors ${
              mode === 'long'
                ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300'
                : 'text-slate-400'
            }`}
          >
            Largo
          </button>
        </div>

        <div className="flex justify-center gap-4">
          <button
            onClick={() => dispatch(toggleTimer())}
            className="p-4 bg-brand-600 hover:bg-brand-700 text-white rounded-full shadow-lg transition-transform active:scale-95"
          >
            {isActive ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8 ml-1" />}
          </button>
          <button
            onClick={() => dispatch(resetTimer())}
            className="p-4 bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-full hover:bg-slate-300 dark:hover:bg-slate-600 transition-transform active:scale-95"
          >
            <RotateCcw className="w-8 h-8" />
          </button>
        </div>

        <div className="mt-8 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-800">
          <p className="text-sm font-medium text-slate-600 dark:text-slate-300 flex items-center justify-center gap-2">
            {mode === 'work' ? <Brain className="w-4 h-4" /> : <Coffee className="w-4 h-4" />}
            {currentTip}
          </p>
        </div>
      </Card>
    </div>
  );
};
