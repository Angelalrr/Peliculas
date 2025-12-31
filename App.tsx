
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
      setTimeout(() => setLoading(false), 800); // Artificial delay for smoother transition
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

      <main className="relative pb-40">
        {activeTab === 'calendar' ? (
          <div className="pt-32"><CalendarView service={service!} onOpenDetails={setSelectedItem} /></div>
        ) : searchQuery ? (
          <div className="pt-40 px-6 md:px-16 animate-reveal">
             <div className="flex items-center gap-4 mb-16">
               <h2 className="text-4xl md:text-6xl font-black uppercase italic tracking-tighter">
                 Resultados <span className="text-zinc-500">para</span> <span className="text-red-600">"{searchQuery}"</span>
               </h2>
             </div>
             <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-8">
               {searchResults.map((item, idx) => (
                 <div 
                  key={item.id} 
                  onClick={() => setSelectedItem(item)} 
                  className="group relative aspect-[2/3] rounded-[2.5rem] overflow-hidden cursor-pointer transition-all duration-700 hover:scale-105 hover:-translate-y-2 border border-white/5 bg-zinc-900 shadow-2xl animate-reveal"
                  style={{ animationDelay: `${idx * 50}ms` }}
                >
                    <img src={service?.getPosterUrl(item.poster_path, 'w342')} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" alt="" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 flex flex-col justify-end p-6">
                       <p className="text-xs font-black uppercase tracking-tighter text-white truncate">{item.title || item.name}</p>
                    </div>
                 </div>
               ))}
             </div>
          </div>
        ) : (
          <>
            {loading ? <HeroSkeleton /> : heroItem && service && (
              <Hero item={heroItem} service={service} onOpenDetails={setSelectedItem} />
            )}
            
            {/* Adjusted negative margin to prevent content overlap with hero buttons */}
            <div className={`transition-all duration-1000 ${heroItem && !loading ? '-mt-24 md:-mt-44' : 'pt-32'} relative z-10 space-y-12`}>
              {loading ? (
                <div className="px-6 md:px-16 space-y-20">
                  <div className="space-y-6"><div className="h-8 w-64 bg-zinc-900 rounded-full animate-pulse"></div><div className="flex gap-6 overflow-hidden"><CardSkeleton/><CardSkeleton/><CardSkeleton/><CardSkeleton/><CardSkeleton/></div></div>
                  <div className="space-y-6"><div className="h-8 w-64 bg-zinc-900 rounded-full animate-pulse"></div><div className="flex gap-6 overflow-hidden"><CardSkeleton/><CardSkeleton/><CardSkeleton/><CardSkeleton/><CardSkeleton/></div></div>
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
