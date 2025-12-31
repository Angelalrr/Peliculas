
import React from 'react';
import { Play, Info, Star } from 'lucide-react';
import { Movie, TVShow } from '../types';
import { TMDBService } from '../services/tmdb';

interface HeroProps {
  item: Movie | TVShow;
  service: TMDBService;
  onOpenDetails: (item: any) => void;
}

const Hero: React.FC<HeroProps> = ({ item, service, onOpenDetails }) => {
  const title = (item as Movie).title || (item as TVShow).name;
  const overview = item.overview.length > 220 ? item.overview.substring(0, 220) + '...' : item.overview;

  return (
    <div className="relative h-[85vh] w-full overflow-hidden group">
      <img
        src={service.getBackdropUrl(item.backdrop_path, 'original')}
        alt={title}
        className="w-full h-full object-cover scale-105 animate-in fade-in zoom-in duration-1000"
      />
      {/* Overlay complex gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#050505] via-[#050505]/40 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-transparent opacity-80" />
      <div className="absolute inset-0 cinematic-gradient" />
      
      <div className="absolute bottom-[20%] left-6 md:left-16 max-w-3xl space-y-6 animate-fade-in">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-red-600/20 text-red-500 px-3 py-1 rounded-full border border-red-600/30 text-[10px] font-black uppercase tracking-[0.2em]">
            <Star className="w-3 h-3 fill-current" />
            Recomendado
          </div>
          <span className="text-zinc-400 font-bold text-xs">{(item as Movie).release_date?.split('-')[0] || (item as TVShow).first_air_date?.split('-')[0]}</span>
        </div>

        <h1 className="text-5xl md:text-8xl font-black text-white uppercase italic tracking-tighter leading-[0.85] drop-shadow-2xl">
          {title}
        </h1>
        
        <p className="text-sm md:text-xl text-zinc-300 font-medium leading-relaxed drop-shadow-lg max-w-xl">
          {overview}
        </p>

        <div className="flex flex-wrap gap-4 pt-4">
          <button 
            onClick={() => onOpenDetails(item)}
            className="group flex items-center gap-3 bg-white text-black px-10 py-4 rounded-2xl font-black uppercase tracking-tighter hover:bg-red-600 hover:text-white transition-all duration-500 shadow-2xl active:scale-95">
            <Play className="fill-current w-5 h-5 transition-transform group-hover:scale-110" /> 
            <span>Reproducir</span>
          </button>
          <button 
            onClick={() => onOpenDetails(item)}
            className="flex items-center gap-3 bg-zinc-800/40 backdrop-blur-xl text-white px-10 py-4 rounded-2xl font-black uppercase tracking-tighter border border-white/10 hover:bg-zinc-700/60 transition-all duration-300 active:scale-95">
            <Info className="w-5 h-5" /> 
            <span>Detalles</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Hero;
