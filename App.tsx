
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import Row from './components/Row';
import DetailsModal from './components/DetailsModal';
import ApiKeyPrompt from './components/ApiKeyPrompt';
import FilterBar from './components/FilterBar';
import CalendarView from './components/CalendarView';
import { HeroSkeleton, CardSkeleton } from './components/Skeleton';
import { TMDBService } from './services/tmdb';
import { Movie, TVShow } from './types';

const DEFAULT_TMDB_KEY = 'f2a126cbc8534aef0b72f0bbad4e437c';

const App: React.FC = () => {
  const [apiKey, setApiKey] = useState<string | null>(() => {
    const saved = localStorage.getItem('tmdb_api_key');
    return saved || DEFAULT_TMDB_KEY;
  });
  
  const [activeTab, setActiveTab] = useState<'home' | 'movies' | 'tv' | 'calendar'>('home');
  const [heroItem, setHeroItem] = useState<Movie | TVShow | null>(null);
  const [sections, setSections] = useState<{title: string, items: any[]}[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const service = useMemo(() => (apiKey ? new TMDBService(apiKey) : null), [apiKey]);

  const fetchHomeData = useCallback(async () => {
    if (!service) return;
    try {
      setLoading(true);
      const [trending, popularMovies, topMovies, upcoming, popularTV, topTV] = await Promise.all([
        service.getTrending('all', 'day'),
        service.getMovies('popular'),
        service.getMovies('top_rated'),
        service.getMovies('upcoming'),
        service.getTVShows('popular'),
        service.getTVShows('top_rated'),
      ]);

      const validHeroItems = trending.results.filter(i => i.backdrop_path && i.overview);
      setHeroItem(validHeroItems[Math.floor(Math.random() * validHeroItems.length)]);

      setSections([
        { title: 'Tendencias Globales', items: trending.results },
        { title: 'Cine más Popular', items: popularMovies.results },
        { title: 'Favoritos de la Crítica', items: topMovies.results },
        { title: 'Series Imprescindibles', items: popularTV.results },
        { title: 'Próximamente en Pantalla', items: upcoming.results },
        { title: 'Obras Maestras TV', items: topTV.results },
      ]);
    } catch (err: any) {
      console.error(err);
    } finally {
      setTimeout(() => setLoading(false), 800);
    }
  }, [service]);

  useEffect(() => {
    if (!apiKey) return;
    if (activeTab === 'home') fetchHomeData();
  }, [activeTab, apiKey, fetchHomeData]);

  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      setSearchQuery('');
      setSearchResults([]);
      return;
    }
    setSearchQuery(query);
    if (!service) return;
    try {
      const results = await service.search(query);
      setSearchResults(results.results);
    } catch (err) {
      console.error(err);
    }
  };

  if (!apiKey) return <ApiKeyPrompt onKeySubmit={setApiKey} />;

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-red-600 selection:text-white">
      <Header 
        onSearch={handleSearch} 
        onOpenSettings={() => setApiKey(null)}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isFilterOpen={isFilterOpen}
        setIsFilterOpen={setIsFilterOpen}
      />

      <FilterBar 
        isOpen={isFilterOpen} 
        onClose={() => setIsFilterOpen(false)} 
        service={service!} 
        onApplyFilters={(f) => console.log(f)} 
      />

      <main className="relative pb-24">
        {activeTab === 'calendar' ? (
          <div className="pt-24 md:pt-32"><CalendarView service={service!} onOpenDetails={setSelectedItem} /></div>
        ) : searchQuery ? (
          <div className="pt-32 md:pt-40 px-6 md:px-16 animate-reveal">
             <div className="flex items-center gap-4 mb-10 md:mb-16">
               <h2 className="text-3xl md:text-6xl font-black uppercase italic tracking-tighter">
                 Resultados <span className="text-zinc-500">para</span> <span className="text-red-600">"{searchQuery}"</span>
               </h2>
             </div>
             <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-8">
               {searchResults.map((item, idx) => {
                 // Corregimos la lógica de selección de imagen para asegurar que perfiles de actores funcionen
                 const imagePath = item.poster_path || item.profile_path || item.backdrop_path;
                 return (
                   <div 
                    key={item.id} 
                    onClick={() => setSelectedItem(item)} 
                    className="group relative aspect-[2/3] rounded-[1.5rem] md:rounded-[2.5rem] overflow-hidden cursor-pointer transition-all duration-700 hover:scale-105 border border-white/5 bg-zinc-900 shadow-2xl animate-reveal"
                    style={{ animationDelay: `${idx * 50}ms` }}
                  >
                      <img 
                        src={service?.getPosterUrl(imagePath, 'w500')} 
                        className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" 
                        alt={item.title || item.name} 
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 flex flex-col justify-end p-4">
                         <p className="text-[10px] md:text-xs font-black uppercase tracking-tighter text-white truncate">{item.title || item.name}</p>
                         <p className="text-[8px] text-zinc-400 font-bold uppercase tracking-widest">{item.media_type === 'person' ? 'Actor' : (item.media_type || 'Contenido')}</p>
                      </div>
                   </div>
                 );
               })}
             </div>
          </div>
        ) : (
          <>
            {loading ? <HeroSkeleton /> : heroItem && service && (
              <Hero item={heroItem} service={service} onOpenDetails={setSelectedItem} />
            )}
            
            <div className={`transition-all duration-1000 ${heroItem && !loading ? '-mt-20 md:-mt-24' : 'pt-24 md:pt-32'} relative z-10 space-y-8 md:space-y-12`}>
              {loading ? (
                <div className="px-6 md:px-16 space-y-12 md:space-y-20">
                  <div className="space-y-6"><div className="h-6 w-48 md:h-8 md:w-64 bg-zinc-900 rounded-full animate-pulse"></div><div className="flex gap-4 md:gap-6 overflow-hidden"><CardSkeleton/><CardSkeleton/><CardSkeleton/></div></div>
                </div>
              ) : (
                sections.map((section, idx) => (
                  <div key={idx} className="animate-reveal" style={{ animationDelay: `${idx * 150}ms` }}>
                    <Row title={section.title} items={section.items} service={service!} onOpenDetails={setSelectedItem} />
                  </div>
                ))
              )}
            </div>
          </>
        )}
      </main>

      {selectedItem && service && (
        <DetailsModal 
          item={selectedItem} 
          service={service} 
          onClose={() => setSelectedItem(null)} 
          onOpenDetails={setSelectedItem}
        />
      )}
    </div>
  );
};

export default App;
