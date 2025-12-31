
import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight, Play, Star } from 'lucide-react';
import { TMDBService } from '../services/tmdb';

interface RowProps {
  title: string;
  items: any[];
  service: TMDBService;
  onOpenDetails: (item: any) => void;
}

const Row: React.FC<RowProps> = ({ title, items, service, onOpenDetails }) => {
  const rowRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (rowRef.current) {
      const { scrollLeft, clientWidth } = rowRef.current;
      const scrollTo = direction === 'left' ? scrollLeft - clientWidth * 0.8 : scrollLeft + clientWidth * 0.8;
      rowRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }
  };

  if (!items || items.length === 0) return null;

  return (
    <div className="group relative space-y-6 mb-16 px-6 md:px-16 animate-fade-in">
      <div className="flex items-center justify-between">
        <h2 className="text-xl md:text-3xl font-black italic uppercase tracking-tighter text-white flex items-center gap-4">
          <div className="w-2 h-8 bg-red-600 rounded-full shadow-[0_0_15px_rgba(229,9,20,0.6)]"></div>
          {title}
        </h2>
        <div className="hidden group-hover:flex items-center gap-2">
           <button onClick={() => scroll('left')} className="p-2 rounded-full border border-white/10 hover:bg-white hover:text-black transition-all">
             <ChevronLeft className="w-5 h-5" />
           </button>
           <button onClick={() => scroll('right')} className="p-2 rounded-full border border-white/10 hover:bg-white hover:text-black transition-all">
             <ChevronRight className="w-5 h-5" />
           </button>
        </div>
      </div>
      
      <div className="relative">
        <div
          ref={rowRef}
          className="flex gap-6 overflow-x-auto no-scrollbar scroll-smooth py-6 -my-6 px-1"
        >
          {items.map((item) => (
            <div
              key={item.id}
              onClick={() => onOpenDetails(item)}
              className="flex-none w-40 md:w-64 aspect-[2/3] relative cursor-pointer group/card overflow-hidden rounded-[2rem] transition-all duration-500 hover:scale-[1.03] hover:z-50 border border-white/5 bg-zinc-900 shadow-2xl"
            >
              <img
                src={service.getPosterUrl(item.poster_path, 'w500')}
                alt={item.title || item.name}
                className="w-full h-full object-cover transition-transform group-hover/card:scale-110 duration-1000"
                loading="lazy"
              />
              
              {/* Refined Info Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-0 group-hover/card:opacity-100 transition-all duration-500 flex flex-col justify-end p-6">
                <div className="translate-y-8 group-hover/card:translate-y-0 transition-transform duration-500">
                  <p className="font-black uppercase italic text-lg tracking-tighter text-white drop-shadow-2xl leading-[0.9] mb-3">
                    {item.title || item.name}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-black text-white/70 uppercase tracking-widest bg-white/10 backdrop-blur-md px-3 py-1 rounded-full border border-white/10">
                      {item.media_type === 'tv' || (!item.title && item.name) ? 'Season' : 'Movie'}
                    </span>
                    <div className="flex items-center gap-1.5 bg-red-600/80 px-2 py-1 rounded-lg">
                      <Star className="w-3 h-3 text-white fill-current" />
                      <span className="text-white font-black text-[10px]">
                        {item.vote_average ? item.vote_average.toFixed(1) : 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Center Play Icon */}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/card:opacity-100 transition-opacity pointer-events-none">
                <div className="bg-white/20 backdrop-blur-2xl p-4 rounded-full border border-white/20 scale-50 group-hover/card:scale-100 transition-transform duration-700">
                   <Play className="w-8 h-8 text-white fill-current translate-x-0.5" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Row;
