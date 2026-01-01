
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

  const clearSearch = () => {
    setSearchQuery('');
    onSearch('');
    if (searchInputRef.current) searchInputRef.current.focus();
  };

  const navItems = [
    { id: 'home', label: 'Inicio' },
    { id: 'movies', label: 'Cine' },
    { id: 'tv', label: 'Series' },
    { id: 'calendar', label: 'Agenda' }
  ];

  return (
    <nav className={`fixed top-0 w-full z-[1000] transition-all duration-500 px-4 md:px-16 ${
      isScrolled 
        ? 'py-2 md:py-3 bg-[#050505]/98 backdrop-blur-3xl border-b border-white/5 shadow-2xl' 
        : 'pt-10 pb-4 md:py-8 bg-transparent'
    }`}>
      <div className="max-w-[1920px] mx-auto flex items-center justify-between gap-4">
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

        <div className="flex items-center gap-2 md:gap-6 flex-1 justify-end">
          <div className="flex items-center gap-1.5 md:gap-4 bg-black/90 md:bg-black/20 p-1.5 md:p-1 rounded-2xl border border-white/10 backdrop-blur-3xl shadow-[0_20px_50px_rgba(0,0,0,0.8)]">
            <form 
              onSubmit={handleSearchSubmit} 
              className={`relative flex items-center transition-all duration-500 ${isSearchFocused || searchQuery ? 'w-full md:w-96' : 'w-10 md:w-64'}`}
            >
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Buscar..."
                className={`w-full bg-white/5 border border-white/10 text-white pl-8 md:pl-10 pr-10 py-2 md:py-3 rounded-xl text-[10px] md:text-xs font-bold focus:outline-none focus:border-red-600/50 transition-all ${isSearchFocused || searchQuery ? 'opacity-100' : 'opacity-0 md:opacity-100'}`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setIsSearchFocused(false)}
              />
              <Search className={`absolute left-2.5 w-3.5 h-3.5 md:w-5 md:h-5 text-zinc-500`} />
              
              {searchQuery && (
                <button 
                  type="button"
                  onClick={clearSearch}
                  className="absolute right-2.5 p-1 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <X className="w-3.5 h-3.5 md:w-4 md:h-4 text-zinc-400" />
                </button>
              )}
            </form>

            <button 
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className={`p-2 md:p-2.5 rounded-xl border transition-all ${isFilterOpen ? 'bg-red-600 border-red-600 text-white' : 'bg-white/5 border-white/10 text-zinc-400 hover:border-white/20'}`}
              title={isFilterOpen ? "Cerrar filtros" : "Abrir filtros"}
            >
              {isFilterOpen ? (
                <X className="w-3.5 h-3.5 md:w-5 md:h-5 animate-in fade-in rotate-90 duration-300" />
              ) : (
                <Filter className="w-3.5 h-3.5 md:w-5 md:h-5 animate-in fade-in duration-300" />
              )}
            </button>
            
            <button 
              className="lg:hidden p-2 md:p-2.5 text-white bg-red-600 rounded-xl" 
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu className="w-4 h-4 md:w-5 md:h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <div className={`fixed inset-0 bg-[#050505] z-[1100] p-10 flex flex-col gap-8 transition-all duration-500 ${isMobileMenuOpen ? 'translate-x-0 opacity-100 visible' : 'translate-x-full opacity-0 invisible pointer-events-none'}`}>
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
