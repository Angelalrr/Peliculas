
import React from 'react';
import { Star, Crown, Trophy, Medal } from 'lucide-react';
import { TMDBService } from '../services/tmdb';
import { Movie } from '../types';

interface Top10PodiumProps {
  items: Movie[];
  service: TMDBService;
  onOpenDetails: (item: any) => void;
}

const Top10Podium: React.FC<Top10PodiumProps> = ({ items, service, onOpenDetails }) => {
  if (!items || items.length === 0) return null;

  // Solo tomamos los 3 primeros y los ordenamos para el diseño visual (2º, 1º, 3º)
  const podium = [items[1], items[0], items[2]].filter(Boolean);

  const getRankConfig = (movie: Movie) => {
    const originalIndex = items.findIndex(i => i.id === movie.id);
    if (originalIndex === 0) return { 
      label: '1º', 
      color: 'text-yellow-400', 
      bg: 'bg-yellow-400/20', 
      glow: 'shadow-[0_0_50px_rgba(250,204,21,0.3)]',
      icon: <Crown className="w-6 h-6 text-yellow-400 fill-current" />,
      height: 'h-[420px] md:h-[550px]',
      scale: 'scale-110 z-30'
    };
    if (originalIndex === 1) return { 
      label: '2º', 
      color: 'text-zinc-300', 
      bg: 'bg-zinc-300/20', 
      glow: 'shadow-[0_0_40px_rgba(212,212,216,0.2)]',
      icon: <Trophy className="w-5 h-5 text-zinc-300 fill-current" />,
      height: 'h-[360px] md:h-[480px]',
      scale: 'scale-100 z-20'
    };
    return { 
      label: '3º', 
      color: 'text-amber-700', 
      bg: 'bg-amber-700/20', 
      glow: 'shadow-[0_0_40px_rgba(180,83,9,0.2)]',
      icon: <Medal className="w-5 h-5 text-amber-700 fill-current" />,
      height: 'h-[320px] md:h-[440px]',
      scale: 'scale-95 z-10'
    };
  };

  return (
    <div className="relative py-12 md:py-24 space-y-16 md:space-y-24 overflow-hidden">
      {/* Background Decorative Element */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150%] h-[500px] bg-red-600/5 blur-[120px] rounded-full pointer-events-none -z-10" />

      {/* Header */}
      <div className="px-6 md:px-16 text-center space-y-4">
        <div className="inline-flex items-center gap-2 bg-red-600/10 border border-red-600/20 px-4 py-1.5 rounded-full mb-2">
          <Crown className="w-4 h-4 text-red-600" />
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-red-500">Exclusivo Hoy</span>
        </div>
        <h2 className="text-4xl md:text-7xl font-[1000] italic uppercase tracking-tighter text-white leading-none">
          El <span className="text-red-600">Top 3</span> Absoluto
        </h2>
        <p className="text-[10px] md:text-xs font-black text-zinc-500 uppercase tracking-[0.5em]">
          Los tres títulos más vistos del planeta
        </p>
      </div>

      {/* The Podium Stage */}
      <div className="flex items-end justify-center gap-2 md:gap-8 px-4 max-w-7xl mx-auto">
        {podium.map((item) => {
          const config = getRankConfig(item);
          return (
            <div 
              key={item.id} 
              onClick={() => onOpenDetails(item)}
              className={`relative flex-1 group cursor-pointer transition-all duration-700 hover:-translate-y-4 ${config.scale}`}
            >
              {/* Poster Card */}
              <div className={`relative ${config.height} rounded-[2rem] md:rounded-[3rem] overflow-hidden border border-white/10 ${config.glow}`}>
                <img 
                  src={service.getPosterUrl(item.poster_path, 'w780')} 
                  className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" 
                  alt={item.title}
                />
                
                {/* Info Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent p-6 md:p-10 flex flex-col justify-end">
                   <div className="space-y-2 md:space-y-4">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 md:p-3 rounded-2xl ${config.bg} backdrop-blur-xl border border-white/10`}>
                          {config.icon}
                        </div>
                        <span className={`text-2xl md:text-5xl font-black italic ${config.color}`}>{config.label}</span>
                      </div>
                      <h3 className="text-lg md:text-3xl font-black uppercase italic tracking-tighter text-white leading-none line-clamp-2">
                        {item.title}
                      </h3>
                      <div className="flex items-center gap-2 text-yellow-500">
                        <Star className="w-3 h-3 md:w-4 md:h-4 fill-current" />
                        <span className="text-xs md:text-lg font-black">{item.vote_average.toFixed(1)}</span>
                      </div>
                   </div>
                </div>

                {/* Rank Floating Badge */}
                <div className={`absolute top-6 left-6 md:top-10 md:left-10 w-10 h-10 md:w-16 md:h-16 rounded-full flex items-center justify-center font-black text-xl md:text-3xl italic border-2 border-white/20 backdrop-blur-2xl ${config.bg} ${config.color}`}>
                   {items.findIndex(i => i.id === item.id) + 1}
                </div>
              </div>

              {/* Podium Base Platform (Visual element only) */}
              <div className="mt-4 md:mt-8 h-2 md:h-4 w-full bg-white/5 rounded-full blur-sm group-hover:bg-red-600/20 transition-all" />
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Top10Podium;
