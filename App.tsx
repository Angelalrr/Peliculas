
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import Row from './components/Row';
import DetailsModal from './components/DetailsModal';
import ApiKeyPrompt from './components/ApiKeyPrompt';
import FilterBar from './components/FilterBar';
import CalendarView from './components/CalendarView';
import { HeroSkeleton } from './components/Skeleton';
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
  const [error, setError] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [originalQuery, setOriginalQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState<any>(null);

  const service = useMemo(() => (apiKey ? new TMDBService(apiKey) : null), [apiKey]);

  const fetchHomeData = useCallback(async () => {
    if (!service) return;
    try {
      setLoading(true);
      setError(null);
      
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
        { title: 'Global Trending', items: trending.results },
        { title: 'Popular Cinema', items: popularMovies.results },
        { title: 'Critics Choice', items: topMovies.results },
        { title: 'Binge-worthy TV', items: popularTV.results },
        { title: 'New Arrivals', items: upcoming.results },
        { title: 'TV Masterpieces', items: topTV.results },
      ]);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [service]);

  useEffect(() => {
    if (!apiKey) return;
    if (activeTab === 'home') fetchHomeData();
    // Simplified for UX demo
  }, [activeTab, apiKey, fetchHomeData]);

  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      setSearchQuery('');
      setSearchResults([]);
      return;
    }
    setOriginalQuery(query);
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
    <div className="min-h-screen bg-[#050505] text-white">
      <Header 
        onSearch={handleSearch} 
        onOpenSettings={() => {}}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isFilterOpen={isFilterOpen}
        setIsFilterOpen={setIsFilterOpen}
      />

      <main className="pb-32">
        {activeTab === 'calendar' ? (
          <CalendarView service={service!} onOpenDetails={setSelectedItem} />
        ) : searchQuery ? (
          <div className="pt-32 px-6 md:px-16 animate-fade-in">
             <h2 className="text-4xl font-black uppercase italic mb-12 flex items-center gap-4">
               <span className="text-zinc-500">Search:</span> <span className="text-red-600">"{originalQuery}"</span>
             </h2>
             <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-8">
               {searchResults.map(item => (
                 <div key={item.id} onClick={() => setSelectedItem(item)} className="aspect-[2/3] rounded-[2rem] overflow-hidden cursor-pointer hover:scale-105 transition-all duration-500 border border-white/5 bg-zinc-900 group shadow-2xl">
                    <img src={service?.getPosterUrl(item.poster_path, 'w342')} className="w-full h-full object-cover" alt="" />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-6">
                       <p className="text-xs font-black uppercase tracking-tighter text-white truncate">{item.title || item.name}</p>
                    </div>
                 </div>
               ))}
             </div>
          </div>
        ) : (
          <>
            {loading ? <HeroSkeleton /> : heroItem && service && <Hero item={heroItem} service={service} onOpenDetails={setSelectedItem} />}
            <div className={`transition-all duration-1000 ${heroItem ? '-mt-48' : 'pt-32'} relative z-10 space-y-4`}>
              {sections.map((section, idx) => (
                service && <Row key={idx} title={section.title} items={section.items} service={service} onOpenDetails={setSelectedItem} />
              ))}
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
