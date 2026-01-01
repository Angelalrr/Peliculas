
import React, { useRef, useState } from 'react';
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
  const [showControls, setShowControls] = useState(false);

  const scroll = (direction: 'left' | 'right') => {
    if (rowRef.current) {
      const { scrollLeft, clientWidth } = rowRef.current;
      const scrollTo = direction === 'left' ? scrollLeft - clientWidth * 0.8 : scrollLeft + clientWidth * 0.8;
      rowRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }
  };

  if (!items || items.length === 0) return null;

  return (
    <div 
      className="group/row relative space-y-6 mb-20 px-6 md:px-16 animate-reveal"
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
    >
      <div className="flex items-center justify-between">
        <h2 className="text-2xl md:text-3xl font-black italic uppercase tracking-tighter text-white flex items-center gap-4">
          <span className="w-1.5 h-8 bg-red-600 rounded-full shadow-[0_0_20px_rgba(229,9,20,0.8)]"></span>
          {title}
        </h2>
        <div className={`hidden lg:flex items-center gap-3 transition-opacity duration-500 ${showControls ? 'opacity-100' : 'opacity-0'}`}>
           <button onClick={() => scroll('left')} className="p-3 rounded-xl glass-premium hover:bg-white hover:text-black transition-all">
             <ChevronLeft className="w-5 h-5" />
           </button>
           <button onClick={() => scroll('right')} className="p-3 rounded-xl glass-premium hover:bg-white hover:text-black transition-all">
             <ChevronRight className="w-5 h-5" />
           </button>
        </div>
      </div>
      
      <div className="relative row-mask">
        <div
          ref={rowRef}
          className="flex gap-6 overflow-x-auto no-scrollbar py-8 px-2 scroll-smooth"
        >
          {items.map((item, idx) => (
            <div
              key={`${item.id}-${idx}`}
              onClick={() => onOpenDetails(item)}
              className="flex-none w-44 md:w-72 aspect-[2/3] relative cursor-pointer group/card rounded-[2.5rem] transition-all duration-500 md:hover:scale-[1.05] md:hover:-translate-y-4 md:hover:z-50 border border-white/5 bg-zinc-900 shadow-2xl active:scale-95 touch-manipulation select-none"
            >
              <img
                src={service.getPosterUrl(item.poster_path, 'w500')}
                alt={item.title || item.name}
                className="w-full h-full object-cover transition-transform duration-1000 md:group-hover/card:scale-110 rounded-[2.5rem] pointer-events-none"
                loading="lazy"
              />
              
              <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/20 to-transparent opacity-0 md:group-hover/card:opacity-100 transition-all duration-500 rounded-[2.5rem] flex flex-col justify-end p-8 pointer-events-none">
                <div className="space-y-4 translate-y-8 md:group-hover/card:translate-y-0 transition-transform duration-700">
                  <div className="flex items-center justify-between">
                    <div className="bg-red-600 p-2 rounded-full shadow-lg">
                      <Play className="w-4 h-4 fill-current text-white" />
                    </div>
                    <div className="flex items-center gap-1.5 bg-zinc-900/80 backdrop-blur-md px-3 py-1 rounded-full border border-white/10">
                      <Star className="w-3 h-3 text-yellow-500 fill-current" />
                      <span className="text-white font-black text-[10px]">
                        {item.vote_average ? item.vote_average.toFixed(1) : '8.5'}
                      </span>
                    </div>
                  </div>
                  
                  <p className="font-black uppercase italic text-xl tracking-tighter text-white drop-shadow-2xl leading-[0.85]">
                    {item.title || item.name}
                  </p>
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
