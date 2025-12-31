
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
  const overview = item.overview.length > 200 ? item.overview.substring(0, 200) + '...' : item.overview;

  return (
    <div className="relative h-[80vh] md:h-[92vh] w-full overflow-hidden">
      {/* Background with subtle zoom animation */}
      <div className="absolute inset-0 scale-105 animate-[zoomIn_20s_ease-out_infinite_alternate]">
        <img
          src={service.getBackdropUrl(item.backdrop_path, 'original')}
          alt={title}
          className="w-full h-full object-cover object-top md:object-center"
        />
      </div>

      {/* Complex Overlays for depth */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#050505] via-[#050505]/60 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/40 to-transparent" />
      
      {/* Content Container: increased pb-32 for mobile to push content up */}
      <div className="absolute inset-0 flex flex-col justify-end pb-32 md:pb-48 px-6 md:px-16 space-y-6 md:space-y-8">
        <div className="space-y-3 md:space-y-4 max-w-4xl">
          <div className="flex items-center gap-3 animate-reveal" style={{ animationDelay: '0.1s' }}>
            <div className="flex items-center gap-1 bg-red-600 px-2 py-0.5 md:px-3 md:py-1 rounded-full text-[8px] md:text-[10px] font-black uppercase tracking-widest shadow-lg shadow-red-600/40">
              <Star className="w-2.5 h-2.5 md:w-3 md:h-3 fill-current" />
              TOP 10
            </div>
            <span className="text-zinc-400 font-bold text-[10px] md:text-xs tracking-widest uppercase">
              {(item as Movie).release_date?.split('-')[0] || (item as TVShow).first_air_date?.split('-')[0]} • Ultra HD
            </span>
          </div>

          <h1 className="text-4xl md:text-8xl lg:text-9xl font-black text-white uppercase italic tracking-tighter leading-[0.9] drop-shadow-2xl animate-reveal" style={{ animationDelay: '0.2s' }}>
            {title}
          </h1>
          
          <p className="text-xs md:text-lg lg:text-xl text-zinc-300 font-medium leading-relaxed max-w-2xl drop-shadow-lg line-clamp-3 md:line-clamp-none animate-reveal" style={{ animationDelay: '0.3s' }}>
            {overview}
          </p>

          <div className="flex flex-wrap gap-3 md:gap-4 pt-4 md:pt-6 animate-reveal" style={{ animationDelay: '0.4s' }}>
            <button 
              onClick={() => onOpenDetails(item)}
              className="flex items-center gap-2 bg-white text-black px-6 md:px-10 py-3 md:py-4 rounded-xl md:rounded-2xl font-black uppercase text-xs md:text-base tracking-tighter hover:bg-red-600 hover:text-white transition-all duration-300 shadow-xl active:scale-95"
            >
              <Play className="fill-current w-4 h-4 md:w-6 md:h-6" /> 
              Ver ahora
            </button>
            <button 
              onClick={() => onOpenDetails(item)}
              className="flex items-center gap-2 bg-zinc-800/60 backdrop-blur-xl text-white px-6 md:px-10 py-3 md:py-4 rounded-xl md:rounded-2xl font-black uppercase text-xs md:text-base tracking-tighter border border-white/10 hover:bg-white/10 transition-all duration-300 active:scale-95"
            >
              <Info className="w-4 h-4 md:w-6 md:h-6" /> 
              Detalles
            </button>
          </div>
        </div>
      </div>

      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 animate-bounce opacity-40 hidden md:block">
        <ChevronDown className="w-8 h-8" />
      </div>
    </div>
  );
};

export default Hero;
