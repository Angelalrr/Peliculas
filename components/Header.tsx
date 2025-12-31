
import React, { useState, useEffect, useRef } from 'react';
import { Search, Settings, Menu, X, Filter } from 'lucide-react';

interface HeaderProps {
  onSearch: (query: string) => void;
  onOpenSettings: () => void;
  activeTab: 'home' | 'movies' | 'tv' | 'calendar';
  setActiveTab: (tab: 'home' | 'movies' | 'tv' | 'calendar') => void;
  isFilterOpen: boolean;
  setIsFilterOpen: (isOpen: boolean) => void;
}

const Header: React.FC<HeaderProps> = ({ onSearch, onOpenSettings, activeTab, setActiveTab, isFilterOpen, setIsFilterOpen }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 30);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onSearch(searchQuery);
    }
  };

  const navItems = [
    { id: 'home', label: 'Inicio' },
    { id: 'movies', label: 'Cine' },
    { id: 'tv', label: 'Series' },
    { id: 'calendar', label: 'Agenda' }
  ];

  return (
    <nav className={`fixed top-0 w-full z-[1000] transition-all duration-500 px-4 md:px-16 ${isScrolled ? 'py-2 md:py-3 bg-[#050505]/95 backdrop-blur-xl border-b border-white/5 shadow-2xl' : 'py-6 md:py-8 bg-transparent'}`}>
      <div className="max-w-[1920px] mx-auto flex items-center justify-between">
        <div className="flex items-center gap-6 lg:gap-16">
          <h1 
            className="text-red-600 text-2xl md:text-4xl font-black tracking-tighter cursor-pointer italic select-none shrink-0" 
            onClick={() => setActiveTab('home')}
          >
            CW
            <span className="hidden sm:inline">INEWAVE</span>
          </h1>
          
          <div className="hidden lg:flex items-center gap-10 text-[11px] font-black uppercase tracking-[0.2em] text-zinc-400">
            {navItems.map(item => (
              <button 
                key={item.id}
                onClick={() => setActiveTab(item.id as any)}
                className={`transition-all hover:text-white ${activeTab === item.id ? 'text-white border-b-2 border-red-600 pb-1' : ''}`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3 md:gap-6 flex-1 justify-end">
          <form 
            onSubmit={handleSearchSubmit} 
            className={`relative flex items-center transition-all duration-500 ${isSearchFocused || searchQuery ? 'w-full md:w-96' : 'w-10 md:w-64'}`}
          >
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Buscar..."
              className={`w-full bg-white/5 backdrop-blur-xl border border-white/10 text-white pl-10 pr-4 py-2 md:py-3 rounded-xl text-xs font-bold focus:outline-none focus:border-red-600/50 transition-all ${isSearchFocused || searchQuery ? 'opacity-100' : 'opacity-0 md:opacity-100'}`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setIsSearchFocused(false)}
            />
            <Search className={`absolute left-3 w-4 h-4 md:w-5 md:h-5 text-zinc-500`} />
          </form>

          <button 
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className={`p-2.5 rounded-xl border transition-all ${isFilterOpen ? 'bg-red-600 border-red-600 text-white' : 'bg-white/5 border-white/10 text-zinc-400'}`}
          >
            <Filter className="w-4 h-4 md:w-5 md:h-5" />
          </button>
          
          <button 
            className="lg:hidden p-2.5 text-white bg-red-600 rounded-xl" 
            onClick={() => setIsMobileMenuOpen(true)}
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <div className={`fixed inset-0 bg-[#050505] z-[1100] p-10 flex flex-col gap-8 transition-transform duration-500 ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <button onClick={() => setIsMobileMenuOpen(false)} className="self-end p-2 bg-white/5 rounded-full"><X className="w-8 h-8" /></button>
        {navItems.map((item) => (
          <button 
            key={item.id}
            className={`text-4xl font-black uppercase italic text-left tracking-tighter ${activeTab === item.id ? 'text-red-600' : 'text-zinc-600'}`}
            onClick={() => { setActiveTab(item.id as any); setIsMobileMenuOpen(false); }}
          >
            {item.label}
          </button>
        ))}
        <button onClick={onOpenSettings} className="mt-auto text-zinc-500 flex items-center gap-4 text-xl font-bold">
           <Settings className="w-6 h-6" /> Configuración
        </button>
      </div>
    </nav>
  );
};

export default Header;
