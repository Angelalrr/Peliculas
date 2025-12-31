
import React from 'react';
import { Play, Info, Star, ChevronDown } from 'lucide-react';
import { Movie, TVShow } from '../types';
import { TMDBService } from '../services/tmdb';

interface HeroProps {
  item: Movie | TVShow;
  service: TMDBService;
  onOpenDetails: (item: any) => void;
}

const Hero: React.FC<HeroProps> = ({ item, service, onOpenDetails }) => {
  const title = (item as Movie).title || (item as TVShow).name;
  const overview = item.overview.length > 250 ? item.overview.substring(0, 250) + '...' : item.overview;

  return (
    <div className="relative h-[92vh] w-full overflow-hidden">
      {/* Background with subtle zoom animation */}
      <div className="absolute inset-0 scale-105 animate-[zoomIn_20s_ease-out_infinite_alternate]">
        <img
          src={service.getBackdropUrl(item.backdrop_path, 'original')}
          alt={title}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Complex Overlays for depth */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#050505] via-[#050505]/40 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-transparent" />
      <div className="absolute inset-0 bg-[#050505]/20 backdrop-brightness-75" />
      
      {/* Content Container with increased bottom padding to avoid overlap with rows */}
      <div className="absolute inset-0 flex flex-col justify-end pb-56 md:pb-72 px-6 md:px-16 space-y-8">
        <div className="space-y-4 max-w-4xl">
          <div className="flex items-center gap-4 animate-reveal" style={{ animationDelay: '0.1s' }}>
            <div className="flex items-center gap-1.5 bg-red-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg shadow-red-600/40">
              <Star className="w-3 h-3 fill-current" />
              TOP 10 HOY
            </div>
            <span className="text-zinc-400 font-bold text-xs tracking-widest uppercase">
              {(item as Movie).release_date?.split('-')[0] || (item as TVShow).first_air_date?.split('-')[0]} • Ultra HD • 5.1
            </span>
          </div>

          <h1 className="text-6xl md:text-9xl font-black text-white uppercase italic tracking-tighter leading-[0.8] drop-shadow-[0_10px_30px_rgba(0,0,0,0.5)] animate-reveal" style={{ animationDelay: '0.2s' }}>
            {title}
          </h1>
          
          <p className="text-sm md:text-xl text-zinc-300 font-medium leading-relaxed max-w-2xl drop-shadow-lg animate-reveal" style={{ animationDelay: '0.3s' }}>
            {overview}
          </p>

          <div className="flex flex-wrap gap-4 pt-6 animate-reveal" style={{ animationDelay: '0.4s' }}>
            <button 
              onClick={() => onOpenDetails(item)}
              className="group flex items-center gap-3 bg-white text-black px-12 py-5 rounded-2xl font-black uppercase tracking-tighter hover:bg-red-600 hover:text-white transition-all duration-500 shadow-[0_20px_40px_rgba(0,0,0,0.4)] hover:shadow-[0_20px_40px_rgba(229,9,20,0.3)] active:scale-95"
            >
              <Play className="fill-current w-6 h-6 transition-transform group-hover:scale-110" /> 
              Reproducir
            </button>
            <button 
              onClick={() => onOpenDetails(item)}
              className="flex items-center gap-3 bg-zinc-800/40 backdrop-blur-2xl text-white px-10 py-5 rounded-2xl font-black uppercase tracking-tighter border border-white/10 hover:bg-white/10 transition-all duration-300 active:scale-95"
            >
              <Info className="w-6 h-6" /> 
              Más información
            </button>
          </div>
        </div>
      </div>

      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce opacity-40">
        <ChevronDown className="w-8 h-8" />
      </div>
    </div>
  );
};

export default Hero;
