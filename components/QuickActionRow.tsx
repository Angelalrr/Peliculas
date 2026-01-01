
import React from 'react';
import { Home, Film, Tv, Sparkles } from 'lucide-react';

interface QuickActionRowProps {
  onSelectHome: () => void;
  onSelectMovies: () => void;
  onSelectTV: () => void;
  onSelectAI: () => void;
  activeTab?: string;
}

const QuickActionRow: React.FC<QuickActionRowProps> = ({ 
  onSelectHome, 
  onSelectMovies, 
  onSelectTV, 
  onSelectAI,
  activeTab
}) => {
  const actions = [
    { 
      id: 'home', 
      label: 'Inicio', 
      icon: <Home className="w-4 h-4 md:w-5 md:h-5" />, 
      action: onSelectHome 
    },
    { 
      id: 'movies', 
      label: 'Películas', 
      icon: <Film className="w-4 h-4 md:w-5 md:h-5" />, 
      action: onSelectMovies 
    },
    { 
      id: 'tv', 
      label: 'Series', 
      icon: <Tv className="w-4 h-4 md:w-5 md:h-5" />, 
      action: onSelectTV 
    },
    { 
      id: 'ai', 
      label: 'IA Vision', 
      icon: <Sparkles className="w-4 h-4 md:w-5 md:h-5 text-red-500" />, 
      action: onSelectAI,
      isSpecial: true
    },
  ];

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[1500] w-auto pointer-events-none">
      <div className="flex items-center justify-center gap-1 md:gap-2 p-1.5 bg-black/60 backdrop-blur-3xl border border-white/10 rounded-full shadow-[0_20px_50px_rgba(0,0,0,0.5)] pointer-events-auto">
        {actions.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={item.action}
              className={`group relative flex items-center gap-2 px-4 md:px-6 py-3 rounded-full transition-all duration-500 hover:bg-white/5 active:scale-90 ${
                isActive ? 'bg-white/10' : ''
              } ${
                item.isSpecial 
                  ? 'bg-red-600/10 border border-red-600/20' 
                  : 'border border-transparent'
              }`}
            >
              <div className={`transition-transform duration-500 group-hover:scale-110 ${
                item.isSpecial ? 'text-red-500 drop-shadow-[0_0_8px_rgba(239,68,68,0.5)]' : (isActive ? 'text-white' : 'text-zinc-400 group-hover:text-white')
              }`}>
                {item.icon}
              </div>
              
              <span className={`hidden md:block text-[10px] font-black uppercase tracking-widest transition-colors duration-500 whitespace-nowrap ${
                item.isSpecial ? 'text-white' : (isActive ? 'text-white' : 'text-zinc-500 group-hover:text-white')
              }`}>
                {item.label}
              </span>

              {item.isSpecial && (
                <span className="absolute -top-1 -right-1 flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-red-600"></span>
                </span>
              )}
              
              {isActive && (
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-red-600 rounded-full shadow-[0_0_10px_rgba(229,9,20,0.8)]" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default QuickActionRow;
