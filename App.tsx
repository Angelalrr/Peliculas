
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import Row from './components/Row';
import DetailsModal from './components/DetailsModal';
import ApiKeyPrompt from './components/ApiKeyPrompt';
import FilterBar from './components/FilterBar';
import CalendarView from './components/CalendarView';
import AIChatbot from './components/AIChatbot';
import QuickActionRow from './components/QuickActionRow';
import Top10Podium from './components/Top10Podium';
import { HeroSkeleton, CardSkeleton } from './components/Skeleton';
import { TMDBService } from './services/tmdb';
import { Movie, TVShow } from './types';
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
  const [top10Movies, setTop10Movies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isAISearching, setIsAISearching] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);

  const service = useMemo(() => (apiKey ? new TMDBService(apiKey) : null), [apiKey]);

  const currentVisualContext = useMemo(() => {
    const heroTitle = heroItem ? ((heroItem as Movie).title || (heroItem as TVShow).name) : 'Ninguno';
    const sectionTitles = sections.map(s => s.items.slice(0, 4).map(i => i.title || i.name)).flat();
    const searchTitles = searchResults.slice(0, 6).map(i => i.title || i.name);
    
    return {
      hero: heroTitle,
      visibleTitles: [...sectionTitles, ...searchTitles].filter(Boolean).slice(0, 20),
      activeTab: activeTab === 'home' ? 'Inicio' : activeTab === 'movies' ? 'Cine' : activeTab === 'tv' ? 'Series' : 'Agenda'
    };
  }, [heroItem, sections, searchResults, activeTab]);

  const fetchHomeData = useCallback(async () => {
    if (!service) return;
    try {
      setLoading(true);
      const [trending, popularMovies, topMovies, upcoming, popularTV] = await Promise.all([
        service.getTrending('all', 'day'),
        service.getMovies('popular'),
        service.getMovies('top_rated'),
        service.getMovies('upcoming'),
        service.getTVShows('popular'),
      ]);

      const validHeroItems = trending.results.filter(i => i.backdrop_path && i.overview);
      setHeroItem(validHeroItems[Math.floor(Math.random() * validHeroItems.length)]);
      
      const trendingMovies = await service.getTrending('movie', 'day');
      setTop10Movies(trendingMovies.results.slice(0, 10));

      setSections([
        { title: 'Cine más Popular', items: popularMovies.results },
        { title: 'Favoritos de la Crítica', items: topMovies.results },
        { title: 'Series Imprescindibles', items: popularTV.results },
        { title: 'Próximamente en Pantalla', items: upcoming.results },
      ]);
    } catch (err: any) {
      console.error(err);
    } finally {
      setTimeout(() => setLoading(false), 800);
    }
  }, [service]);

  const fetchMoviesData = useCallback(async () => {
    if (!service) return;
    try {
      setLoading(true);
      const [trending, popular, top, upcoming, nowPlaying] = await Promise.all([
        service.getTrending('movie', 'day'),
        service.getMovies('popular'),
        service.getMovies('top_rated'),
        service.getMovies('upcoming'),
        service.getMovies('now_playing'),
      ]);
      const validHero = trending.results.filter(i => i.backdrop_path && i.overview);
      setHeroItem(validHero[0] || trending.results[0]);
      setSections([
        { title: 'Películas en Tendencia', items: trending.results },
        { title: 'Los Grandes Éxitos', items: popular.results },
        { title: 'Aclamadas por la Crítica', items: top.results },
        { title: 'Próximos Estrenos', items: upcoming.results },
        { title: 'Actualmente en Cines', items: nowPlaying.results },
      ]);
    } finally { setLoading(false); }
  }, [service]);

  const fetchTVData = useCallback(async () => {
    if (!service) return;
    try {
      setLoading(true);
      const [trending, popular, top, onAir, today] = await Promise.all([
        service.getTrending('tv', 'day'),
        service.getTVShows('popular'),
        service.getTVShows('top_rated'),
        service.getTVShows('on_the_air'),
        service.getTVShows('airing_today'),
      ]);
      const validHero = trending.results.filter(i => i.backdrop_path && i.overview);
      setHeroItem(validHero[0] || trending.results[0]);
      setSections([
        { title: 'Series que son Tendencia', items: trending.results },
        { title: 'Lo más Visto en TV', items: popular.results },
        { title: 'Series de Culto', items: top.results },
        { title: 'Nuevos Episodios esta Semana', items: onAir.results },
        { title: 'Estrenos de Hoy', items: today.results },
      ]);
    } finally { setLoading(false); }
  }, [service]);

  useEffect(() => {
    if (!apiKey) return;
    if (activeTab === 'home') fetchHomeData();
    else if (activeTab === 'movies') fetchMoviesData();
    else if (activeTab === 'tv') fetchTVData();
    
    setSearchQuery('');
    setSearchResults([]);
  }, [activeTab, apiKey, fetchHomeData, fetchMoviesData, fetchTVData]);

  const handleSearch = async (query: string) => {
    if (!query.trim()) { setSearchQuery(''); setSearchResults([]); return; }
    setSearchQuery(query);
    if (!service) return;

    try {
      if (query.length > 12) {
        setIsAISearching(true);
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const response = await ai.models.generateContent({
          model: 'gemini-3-flash-preview',
          contents: `El usuario busca películas/series con esta descripción: "${query}". Genera una lista de los 6 títulos más exactos. Devuelve un array JSON de strings.`,
          config: { responseMimeType: "application/json" }
        });
        
        const titles: string[] = JSON.parse(response.text || "[]");
        let combinedResults: any[] = [];
        for (const title of titles) {
          const res = await service.search(title);
          if (res.results.length > 0) combinedResults.push(res.results[0]);
        }
        setSearchResults(combinedResults);
        setIsAISearching(false);
      } else {
        const results = await service.search(query);
        setSearchResults(results.results);
      }
    } catch (err) {
      const results = await service.search(query);
      setSearchResults(results.results);
      setIsAISearching(false);
    }
  };

  const handleOpenDetails = (item: any) => {
    setSelectedItem(item);
  };

  if (!apiKey) return <ApiKeyPrompt onKeySubmit={setApiKey} />;

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-red-600 selection:text-white flex flex-col">
      <Header 
        onSearch={handleSearch} 
        onOpenSettings={() => setApiKey(null)}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isFilterOpen={isFilterOpen}
        setIsFilterOpen={setIsFilterOpen}
      />

      <FilterBar isOpen={isFilterOpen} onClose={() => setIsFilterOpen(false)} service={service!} onApplyFilters={(f) => {
        setSearchQuery('Filtrado');
        setIsFilterOpen(false);
        service.discover(f.type, f).then(res => setSearchResults(res.results));
      }} />

      <QuickActionRow 
        activeTab={activeTab}
        onSelectHome={() => setActiveTab('home')}
        onSelectMovies={() => setActiveTab('movies')}
        onSelectTV={() => setActiveTab('tv')}
        onSelectAI={() => setIsChatOpen(true)}
      />

      <main className="relative pb-40 flex-1">
        {activeTab === 'calendar' ? (
          <div className="pt-32 animate-reveal"><CalendarView service={service!} onOpenDetails={handleOpenDetails} /></div>
        ) : searchQuery ? (
          <div className="pt-40 px-6 md:px-16 animate-reveal">
             <div className="flex flex-col md:flex-row md:items-center gap-4 mb-16">
               <h2 className="text-4xl md:text-7xl font-black uppercase italic tracking-tighter">
                 {isAISearching ? 'Analizando con ' : 'Viendo '}
                 <span className="text-red-600">"{searchQuery}"</span>
               </h2>
               {isAISearching && <div className="w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>}
               <button onClick={() => {setSearchQuery(''); setSearchResults([]);}} className="text-zinc-500 hover:text-white text-xs font-black uppercase tracking-widest border border-white/10 px-4 py-2 rounded-full">Limpiar resultados</button>
             </div>
             
             <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6 md:gap-10">
               {searchResults.map((item, idx) => (
                 <div key={`${item.id}-${idx}`} onClick={() => handleOpenDetails(item)} className="group relative aspect-[2/3] rounded-[2rem] overflow-hidden cursor-pointer transition-all duration-700 md:hover:scale-105 border border-white/5 bg-zinc-900 shadow-2xl animate-reveal active:scale-95" style={{ animationDelay: `${idx * 50}ms` }}>
                    <img src={service?.getPosterUrl(item.poster_path, 'w500')} className="w-full h-full object-cover transition-transform duration-1000 md:group-hover:scale-110" alt="" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-0 md:group-hover:opacity-100 transition-all p-4 flex flex-col justify-end pointer-events-none">
                       <p className="text-[10px] font-black uppercase tracking-tighter text-white">{item.title || item.name}</p>
                    </div>
                 </div>
               ))}
             </div>
          </div>
        ) : (
          <>
            {loading ? <HeroSkeleton /> : heroItem && service && <Hero item={heroItem} service={service} onOpenDetails={handleOpenDetails} />}
            <div className={`transition-all duration-1000 ${heroItem && !loading ? '-mt-24' : 'pt-32'} relative z-10`}>
              {loading ? (
                <div className="px-6 md:px-16 space-y-20"><div className="h-8 w-64 bg-zinc-900 rounded-full animate-pulse"></div><div className="flex gap-6 overflow-hidden"><CardSkeleton/><CardSkeleton/><CardSkeleton/></div></div>
              ) : (
                <div className="space-y-16 md:space-y-24">
                  {activeTab === 'home' && top10Movies.length > 0 && (
                    <Top10Podium items={top10Movies} service={service!} onOpenDetails={handleOpenDetails} />
                  )}

                  {sections.map((section, idx) => (
                    <div key={idx} className="animate-reveal" style={{ animationDelay: `${idx * 150}ms` }}>
                      <Row title={section.title} items={section.items} service={service!} onOpenDetails={handleOpenDetails} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </main>

      <AIChatbot 
        onOpenDetails={handleOpenDetails} 
        service={service!} 
        visibleContext={currentVisualContext}
        forceOpen={isChatOpen}
        onCloseChat={() => setIsChatOpen(false)}
      />

      {/* Modal renderizado al final del DOM para máxima prioridad de capa en móviles */}
      {selectedItem && service && (
        <DetailsModal 
          item={selectedItem} 
          service={service} 
          onClose={() => setSelectedItem(null)} 
          onOpenDetails={handleOpenDetails} 
        />
      )}
    </div>
  );
};

export default App;
