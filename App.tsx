
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
import { Movie, TVShow, TMDBResponse } from './types';
import { Search, Loader2, Sparkles, CheckCircle2, History, Filter, AlertCircle } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";

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
  const [correctedQuery, setCorrectedQuery] = useState<string | null>(null);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [showKeyResetConfirm, setShowKeyResetConfirm] = useState(false);
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
        { title: 'Tendencias hoy', items: trending.results },
        { title: 'Películas Populares', items: popularMovies.results },
        { title: 'Lo más valorado', items: topMovies.results },
        { title: 'Series de TV Populares', items: popularTV.results },
        { title: 'Próximos lanzamientos', items: upcoming.results },
        { title: 'Joyas de la televisión', items: topTV.results },
      ]);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [service]);

  const fetchMoviesData = useCallback(async () => {
    if (!service) return;
    try {
      setLoading(true);
      const [popular, top, upcoming, now] = await Promise.all([
        service.getMovies('popular'),
        service.getMovies('top_rated'),
        service.getMovies('upcoming'),
        service.getMovies('now_playing'),
      ]);
      setHeroItem(popular.results[0]);
      setSections([
        { title: 'En cartelera', items: now.results },
        { title: 'Populares', items: popular.results },
        { title: 'Mejor valoradas', items: top.results },
        { title: 'Próximamente', items: upcoming.results },
      ]);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [service]);

  const fetchTVData = useCallback(async () => {
    if (!service) return;
    try {
      setLoading(true);
      const [popular, top, onAir, today] = await Promise.all([
        service.getTVShows('popular'),
        service.getTVShows('top_rated'),
        service.getTVShows('on_the_air'),
        service.getTVShows('airing_today'),
      ]);
      setHeroItem(popular.results[0]);
      setSections([
        { title: 'Series populares', items: popular.results },
        { title: 'Aclamadas por la crítica', items: top.results },
        { title: 'Nuevos episodios', items: onAir.results },
        { title: 'Hoy en televisión', items: today.results },
      ]);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [service]);

  useEffect(() => {
    if (!apiKey) return;
    if (searchQuery || activeFilters) return; 
    if (activeTab === 'calendar') return;

    if (activeTab === 'home') fetchHomeData();
    else if (activeTab === 'movies') fetchMoviesData();
    else if (activeTab === 'tv') fetchTVData();
  }, [activeTab, apiKey, fetchHomeData, fetchMoviesData, fetchTVData, searchQuery, activeFilters]);

  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      setSearchQuery('');
      setSearchResults([]);
      setActiveFilters(null);
      return;
    }

    setOriginalQuery(query);
    setSearchQuery(query);
    setActiveFilters(null);
    setSearching(true);

    if (!service) return;
    
    try {
      const results = await service.search(query);
      setSearchResults(results.results.filter(i => i.poster_path || i.profile_path || i.backdrop_path));
    } catch (err) {
      setError("Error durante la búsqueda.");
    } finally {
      setSearching(false);
    }
  };

  const openDetails = (item: any) => setSelectedItem(item);
  const closeDetails = () => setSelectedItem(null);

  if (!apiKey) return <ApiKeyPrompt onKeySubmit={setApiKey} />;

  return (
    <div className="min-h-screen bg-[#141414] text-white">
      <Header 
        onSearch={handleSearch} 
        onOpenSettings={() => setShowKeyResetConfirm(true)}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isFilterOpen={isFilterOpen}
        setIsFilterOpen={setIsFilterOpen}
      />

      <div className="pt-[72px]">
        {service && isFilterOpen && (
          <FilterBar 
            service={service} 
            isOpen={isFilterOpen} 
            onClose={() => setIsFilterOpen(false)}
            onApplyFilters={(filters) => {
              setActiveFilters(filters);
              setActiveTab('home');
            }}
          />
        )}
      </div>

      <main className="pb-20">
        {activeTab === 'calendar' ? (
          <CalendarView service={service!} onOpenDetails={openDetails} />
        ) : searchQuery ? (
          <div className="pt-12 px-4 md:px-12">
             <h2 className="text-3xl font-black uppercase italic italic mb-8">Resultados para <span className="text-red-600">"{originalQuery}"</span></h2>
             <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
               {searchResults.map(item => (
                 <div key={item.id} onClick={() => openDetails(item)} className="aspect-[2/3] rounded-xl overflow-hidden cursor-pointer hover:scale-105 transition-all relative group bg-zinc-900">
                    <img src={service?.getPosterUrl(item.poster_path, 'w342')} className="w-full h-full object-cover" alt="" />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4">
                       <p className="text-[10px] font-black uppercase tracking-tighter text-white truncate">{item.title || item.name}</p>
                    </div>
                 </div>
               ))}
             </div>
          </div>
        ) : (
          <>
            {loading ? <HeroSkeleton /> : heroItem && service && <Hero item={heroItem} service={service} onOpenDetails={openDetails} />}
            <div className={`transition-all duration-700 ${heroItem ? '-mt-32' : 'pt-24'} relative z-10`}>
              {sections.map((section, idx) => (
                service && <Row key={idx} title={section.title} items={section.items} service={service} onOpenDetails={openDetails} />
              ))}
            </div>
          </>
        )}
      </main>

      {selectedItem && service && (
        <DetailsModal 
          item={selectedItem} 
          service={service} 
          onClose={closeDetails} 
          onOpenDetails={openDetails}
        />
      )}
    </div>
  );
};

export default App;
