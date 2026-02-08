import React, { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '@config/firebase';
import { Calendar, Clock, AlertCircle } from 'lucide-react';

interface DashboardUpcomingEventsProps {
  userId: string;
  onGoToAgenda: () => void;
}

export const DashboardUpcomingEvents: React.FC<DashboardUpcomingEventsProps> = ({
  userId,
  onGoToAgenda,
}) => {
  const [events, setEvents] = useState<any[]>([]);

  useEffect(() => {
    if (!userId) return;
    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    const tomorrow = new Date(now);
    tomorrow.setDate(now.getDate() + 2);

    const yesterdayStr = yesterday.toISOString().split('T')[0];
    const tomorrowStr = tomorrow.toISOString().split('T')[0];

    const q = query(
      collection(db, 'users', userId, 'agenda'),
      where('date', '>=', yesterdayStr),
      where('date', '<', tomorrowStr),
      orderBy('date', 'asc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setEvents(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });

    return () => unsubscribe();
  }, [userId]);

  if (events.length === 0) return null;

  return (
    <div className="mb-6">
      <h3 className="text-lg font-bold text-slate-700 dark:text-white flex items-center gap-2 mb-3">
        <Calendar className="w-5 h-5 text-brand-600" /> Próximos eventos
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {events.map((ev) => {
          const isToday = ev.date === new Date().toLocaleDateString('en-CA');
          return (
            <div
              key={ev.id}
              onClick={onGoToAgenda}
              className={`p-4 rounded-xl border flex items-center justify-between cursor-pointer transition-all hover:scale-[1.02] ${
                isToday
                  ? 'bg-white dark:bg-slate-800 border-brand-200 dark:border-brand-900 shadow-md shadow-brand-50 dark:shadow-none'
                  : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700'
              }`}
            >
              <div>
                <div className="flex items-center gap-2 mb-1">
                  {isToday && (
                    <span className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> HOY
                    </span>
                  )}
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase">
                    {ev.date}
                  </span>
                </div>
                <h4 className="font-bold text-slate-800 dark:text-white">{ev.title}</h4>
              </div>
              {ev.time && (
                <div className="text-right">
                  <div className="bg-slate-100 dark:bg-slate-700 p-2 rounded-lg text-slate-600 dark:text-slate-300 font-mono text-sm font-bold flex items-center gap-1">
                    <Clock className="w-4 h-4" /> {ev.time}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
