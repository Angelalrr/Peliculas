
import React, { useState, useEffect, useRef } from 'react';
import { Search, Settings, Menu, X, Filter, ChevronDown } from 'lucide-react';

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
      setIsScrolled(window.scrollY > 50);
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
    { id: 'movies', label: 'Películas' },
    { id: 'tv', label: 'Series' },
    { id: 'calendar', label: 'Estrenos' }
  ];

  return (
    <nav className={`fixed top-0 w-full z-[1000] transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] px-6 md:px-16 ${isScrolled ? 'py-3 bg-[#050505]/80 backdrop-blur-2xl border-b border-white/5 shadow-2xl' : 'py-8 bg-transparent'}`}>
      <div className="max-w-[1920px] mx-auto flex items-center justify-between">
        <div className="flex items-center gap-16">
          <h1 
            className="text-red-600 text-3xl md:text-4xl font-black tracking-tighter cursor-pointer hover:scale-105 transition-transform italic select-none" 
            onClick={() => setActiveTab('home')}
          >
            CINEWAVE
          </h1>
          
          <div className="hidden lg:flex items-center gap-10 text-[11px] font-black uppercase tracking-[0.2em] text-zinc-400">
            {navItems.map(item => (
              <button 
                key={item.id}
                onClick={() => setActiveTab(item.id as any)}
                className={`group relative py-2 transition-all hover:text-white ${activeTab === item.id ? 'text-white' : ''}`}
              >
                {item.label}
                <span className={`absolute -bottom-1 left-0 h-[2px] bg-red-600 transition-all duration-500 ${activeTab === item.id ? 'w-full' : 'w-0 group-hover:w-1/2'}`} />
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-6">
          {/* Enhanced Search Input */}
          <form 
            onSubmit={handleSearchSubmit} 
            className={`relative flex items-center transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${isSearchFocused || searchQuery ? 'w-48 md:w-96' : 'w-10 md:w-64'}`}
          >
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Películas, directores..."
              className={`w-full bg-white/5 backdrop-blur-xl border border-white/10 text-white pl-12 pr-4 py-3 rounded-2xl text-xs font-bold focus:outline-none focus:border-red-600/50 focus:bg-white/10 transition-all placeholder:text-zinc-600 ${isSearchFocused || searchQuery ? 'opacity-100' : 'opacity-0 md:opacity-100'}`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setIsSearchFocused(false)}
            />
            <Search className={`absolute left-4 w-5 h-5 transition-colors ${isSearchFocused ? 'text-red-600' : 'text-zinc-500'}`} />
          </form>

          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className={`p-3 rounded-2xl border transition-all duration-500 ${isFilterOpen ? 'bg-red-600 border-red-600 text-white rotate-90 shadow-lg shadow-red-600/40' : 'bg-white/5 border-white/10 text-zinc-400 hover:text-white hover:bg-white/10'}`}
            >
              <Filter className="w-5 h-5" />
            </button>

            <button 
              onClick={onOpenSettings} 
              className="hidden md:flex p-3 text-zinc-400 hover:text-white transition-all bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10"
            >
              <Settings className="w-5 h-5" />
            </button>
          </div>
          
          <button 
            className="lg:hidden p-3 text-white bg-red-600 rounded-2xl shadow-lg shadow-red-600/30" 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu with Staggered Fade */}
      <div className={`fixed inset-0 top-0 left-0 w-full h-screen bg-[#050505] z-[999] p-12 flex flex-col justify-center gap-8 transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <button onClick={() => setIsMobileMenuOpen(false)} className="absolute top-10 right-10 p-4 bg-white/5 rounded-full"><X className="w-8 h-8" /></button>
        {navItems.map((item, idx) => (
          <button 
            key={item.id}
            className={`text-5xl font-black uppercase italic text-left tracking-tighter transition-all duration-700 delay-[${idx * 100}ms] ${activeTab === item.id ? 'text-red-600 translate-x-4' : 'text-zinc-800 hover:text-white'}`}
            onClick={() => { setActiveTab(item.id as any); setIsMobileMenuOpen(false); }}
          >
            {item.label}
          </button>
        ))}
      </div>
    </nav>
  );
};

export default Header;
