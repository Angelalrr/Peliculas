
import React, { useState, useEffect } from 'react';
import { TMDBService } from '../services/tmdb';
import { Movie, TVShow } from '../types';
import { Calendar as CalendarIcon, Bell, ChevronRight, Play } from 'lucide-react';

interface CalendarViewProps {
  service: TMDBService;
  onOpenDetails: (item: any) => void;
}

const CalendarView: React.FC<CalendarViewProps> = ({ service, onOpenDetails }) => {
  const [upcoming, setUpcoming] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUpcoming = async () => {
      try {
        const movies = await service.getMovies('upcoming');
        const sorted = movies.results
          .filter(m => m.release_date)
          .sort((a, b) => new Date(a.release_date).getTime() - new Date(b.release_date).getTime());
        setUpcoming(sorted);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchUpcoming();
  }, [service]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-40 gap-4">
        <div className="w-10 h-10 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-zinc-500 font-black uppercase tracking-widest text-xs">Consultando Agenda...</p>
      </div>
    );
  }

  const groupByMonth = (items: any[]) => {
    const groups: { [key: string]: any[] } = {};
    items.forEach(item => {
      const date = new Date(item.release_date);
      const month = date.toLocaleString('es-ES', { month: 'long', year: 'numeric' });
      if (!groups[month]) groups[month] = [];
      groups[month].push(item);
    });
    return groups;
  };

  const grouped = groupByMonth(upcoming);

  return (
    <div className="max-w-6xl mx-auto px-6 py-12 space-y-16 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="space-y-4">
        <div className="flex items-center gap-3 text-red-600 font-black text-xs uppercase tracking-[0.3em]">
          <CalendarIcon className="w-4 h-4" /> Agenda CineWave
        </div>
        <h2 className="text-4xl md:text-6xl font-black uppercase italic tracking-tighter">Próximos Estrenos</h2>
        <p className="text-zinc-500 font-medium max-w-xl">No te pierdas nada. Aquí tienes los lanzamientos más esperados para los próximos meses.</p>
      </div>

      <div className="space-y-20">
        {Object.entries(grouped).map(([month, items]) => (
          <div key={month} className="space-y-8">
            <h3 className="text-xl font-black uppercase italic tracking-tight text-white border-l-4 border-red-600 pl-4 sticky top-24 bg-black/80 backdrop-blur-md py-2 z-10">
              {month}
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {items.map((item) => {
                const date = new Date(item.release_date);
                const day = date.getDate();
                const dayName = date.toLocaleString('es-ES', { weekday: 'short' });

                return (
                  <div 
                    key={item.id}
                    onClick={() => onOpenDetails(item)}
                    className="group flex gap-4 bg-zinc-900/40 p-4 rounded-3xl border border-white/5 hover:border-red-600/30 transition-all cursor-pointer hover:bg-zinc-900/80"
                  >
                    <div className="flex-none w-16 h-16 bg-zinc-800 rounded-2xl flex flex-col items-center justify-center border border-white/5 group-hover:bg-red-600 transition-colors">
                      <span className="text-[10px] font-black uppercase tracking-tighter text-zinc-500 group-hover:text-red-100">{dayName}</span>
                      <span className="text-2xl font-black italic tracking-tighter leading-none group-hover:text-white">{day}</span>
                    </div>

                    <div className="flex-grow min-w-0 space-y-1">
                      <h4 className="font-black uppercase italic text-sm tracking-tighter truncate group-hover:text-red-500 transition-colors">
                        {item.title}
                      </h4>
                      <p className="text-[10px] text-zinc-500 font-bold uppercase truncate">
                        {item.genre_ids ? 'Cinematografía' : 'Producción Original'}
                      </p>
                      <div className="flex items-center gap-3 pt-1">
                        <button className="text-[9px] font-black uppercase tracking-widest text-zinc-400 flex items-center gap-1 hover:text-white transition-colors">
                          <Bell className="w-3 h-3" /> Recordatorio
                        </button>
                      </div>
                    </div>

                    <div className="flex-none self-center">
                      <ChevronRight className="w-5 h-5 text-zinc-700 group-hover:text-white transition-all group-hover:translate-x-1" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CalendarView;
