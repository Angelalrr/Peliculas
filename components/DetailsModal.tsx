
import React, { useEffect, useState, useRef, useMemo } from 'react';
import { X, Play, Plus, Star, Check, Info } from 'lucide-react';
import { TMDBService } from '../services/tmdb';
import { ContentDetails, PersonDetails } from '../types';
import YouTubeEmbed from './YouTubeEmbed';

interface DetailsModalProps {
  item: any;
  service: TMDBService;
  onClose: () => void;
  onOpenDetails: (item: any) => void;
}

const DetailsModal: React.FC<DetailsModalProps> = ({ item, service, onClose, onOpenDetails }) => {
  const [details, setDetails] = useState<ContentDetails | null>(null);
  const [personDetails, setPersonDetails] = useState<PersonDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showPlayer, setShowPlayer] = useState(false);
  const [isAdded, setIsAdded] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  const mediaType = useMemo(() => {
    if (item.media_type) return item.media_type;
    if (item.title || item.release_date) return 'movie';
    if (item.name && (item.first_air_date || item.episode_run_time)) return 'tv';
    if (item.name && !item.first_air_date) return 'person';
    return 'movie';
  }, [item]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        setShowPlayer(false);
        
        if (mediaType === 'person') {
          const data = await service.getPersonDetails(item.id);
          setPersonDetails(data);
        } else {
          const data = await service.getDetails(mediaType as 'movie' | 'tv', item.id);
          setDetails(data);
        }
      } catch (err: any) {
        console.error("Error fetching data:", err);
        setError("Error al cargar la información. Intenta de nuevo.");
      } finally {
        setLoading(false);
      }
    };

    if (item?.id) fetchData();
    // Bloquear scroll del body al abrir
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [item.id, mediaType, service]);

  if (!item) return null;

  // Extraer información relevante
  const videos = details?.videos?.results || [];
  const trailer = videos.find(v => v.site === 'YouTube' && (v.type === 'Trailer' || v.type === 'Teaser'));
  
  const allProvidersData = details?.['watch/providers']?.results;
  const watchData = allProvidersData?.['ES'] || allProvidersData?.['US'] || (allProvidersData ? Object.values(allProvidersData)[0] : null);
  
  const providers = Array.from(new Map([
    ...(watchData?.flatrate || []),
    ...(watchData?.rent || []),
    ...(watchData?.buy || [])
  ].map(p => [p.provider_id, p])).values());

  const cast = details?.credits?.cast?.slice(0, 10) || [];
  const recommendations = details?.recommendations?.results?.slice(0, 10) || [];

  return (
    <div className="fixed inset-0 z-[5000] flex items-center justify-center bg-black p-0 md:p-6 overflow-hidden animate-in fade-in duration-300">
      
      {/* Botón de Cerrar Universal */}
      <button 
        onClick={(e) => { e.stopPropagation(); onClose(); }}
        className="fixed top-4 right-4 z-[5100] bg-red-600 text-white p-3 rounded-full hover:bg-red-700 transition-all shadow-xl active:scale-90 border border-white/20"
      >
        <X className="w-6 h-6 stroke-[3px]" />
      </button>

      <div 
        ref={modalRef}
        className="relative w-full h-full bg-[#050505] md:rounded-[4rem] md:max-w-6xl md:max-h-[94vh] overflow-y-auto overflow-x-hidden shadow-[0_0_150px_rgba(0,0,0,1)] no-scrollbar"
      >
        {loading ? (
          <div className="h-full flex flex-col items-center justify-center gap-6">
             <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
             <p className="text-zinc-600 font-black uppercase tracking-[0.4em] text-[10px]">Cargando experiencia...</p>
          </div>
        ) : mediaType === 'person' ? (
          /* VISTA DE PERSONA */
          <div className="animate-in fade-in duration-700">
            {personDetails && (
              <div className="flex flex-col md:flex-row gap-0">
                <div className="w-full md:w-1/3 aspect-[2/3] md:aspect-auto">
                  <img 
                    src={service.getPosterUrl(personDetails.profile_path, 'original')} 
                    alt={personDetails.name}
                    className="w-full h-full object-cover md:rounded-l-[3rem]"
                  />
                </div>
                <div className="w-full md:w-2/3 p-6 md:p-20 space-y-8">
                  <div>
                    <h1 className="text-3xl md:text-7xl font-[1000] uppercase italic tracking-tighter leading-none">{personDetails.name}</h1>
                    <p className="text-red-600 font-black text-xs uppercase tracking-[0.3em] mt-4">{personDetails.known_for_department}</p>
                  </div>
                  <div className="text-zinc-400 text-sm md:text-xl leading-relaxed font-medium">
                    {personDetails.biography || "Biografía no disponible."}
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* VISTA DE PELÍCULA / SERIE */
          <div className="animate-in fade-in duration-700 pb-24">
            <div className="relative aspect-video w-full bg-zinc-900 overflow-hidden shadow-2xl">
               {showPlayer && trailer ? (
                 <YouTubeEmbed videoId={trailer.key} className="absolute inset-0 z-20" />
               ) : (
                 <div className="w-full h-full relative group cursor-pointer" onClick={() => trailer && setShowPlayer(true)}>
                    <img src={service.getBackdropUrl(item.backdrop_path, 'original')} className="w-full h-full object-cover transition-transform duration-[2.5s] md:group-hover:scale-110" alt="" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/20 to-transparent flex items-center justify-center">
                      {trailer && (
                        <div className="bg-white text-black p-4 md:p-6 rounded-full shadow-2xl scale-100 active:scale-90 transition-all duration-300">
                          <Play className="w-8 h-8 md:w-12 md:h-12 fill-current translate-x-1" />
                        </div>
                      )}
                    </div>
                 </div>
               )}
            </div>

            <div className="px-6 md:px-24 py-8 md:py-12 space-y-12 md:space-y-20">
              <div className="space-y-8">
                <div className="flex flex-wrap items-center gap-3 text-[9px] md:text-[11px] font-black uppercase tracking-[0.2em]">
                   <div className="flex items-center gap-2 bg-green-500/10 text-green-500 px-4 py-1.5 rounded-full border border-green-500/20">
                     <Star className="w-3 h-3 fill-current" />
                     <span>{Math.round(item.vote_average * 10)}%</span>
                   </div>
                   <span className="bg-zinc-800/60 px-4 py-1.5 rounded-full text-zinc-300">{item.release_date?.split('-')[0] || item.first_air_date?.split('-')[0]}</span>
                   {details?.runtime && <span className="bg-zinc-800/60 px-4 py-1.5 rounded-full text-zinc-300">{details.runtime} MIN</span>}
                </div>
                  
                <h1 className="text-4xl md:text-8xl lg:text-9xl font-[1000] uppercase italic tracking-tighter leading-[0.9] text-white">
                  {item.title || item.name}
                </h1>

                <div className="flex flex-wrap gap-4 pt-2">
                  <button 
                    disabled={!trailer}
                    onClick={() => setShowPlayer(true)}
                    className={`flex items-center gap-3 px-8 py-4 rounded-2xl font-black uppercase text-xs tracking-widest transition-all active:scale-95 shadow-lg group ${trailer ? 'bg-white text-black hover:bg-zinc-200' : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'}`}
                  >
                    <Play className="w-4 h-4 fill-current" /> TRÁILER
                  </button>
                  <button 
                    onClick={() => setIsAdded(!isAdded)}
                    className={`flex items-center gap-3 px-8 py-4 rounded-2xl font-black uppercase text-xs tracking-widest transition-all active:scale-95 border ${
                      isAdded 
                        ? 'bg-red-600 border-red-600 text-white shadow-lg' 
                        : 'bg-zinc-900/50 border-white/10 text-zinc-200 hover:bg-zinc-800'
                    }`}
                  >
                    {isAdded ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                    {isAdded ? 'LISTO' : 'MI LISTA'}
                  </button>
                </div>
                  
                <p className="text-zinc-400 text-base md:text-2xl font-medium leading-[1.6] max-w-5xl">
                  {item.overview || "Descripción no disponible."}
                </p>

                <div className="flex flex-wrap gap-2">
                  {details?.genres.map(genre => (
                    <span key={genre.id} className="text-[9px] md:text-[11px] font-black uppercase tracking-[0.2em] text-zinc-500 border border-zinc-800 px-4 py-2 rounded-full bg-zinc-900/30">
                      {genre.name}
                    </span>
                  ))}
                </div>
              </div>

              {providers.length > 0 && (
                <div className="space-y-8 pt-10 border-t border-white/5">
                   <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-600">Streaming</h3>
                   <div className="flex flex-wrap gap-6">
                      {providers.map(p => (
                        <div key={p.provider_id} className="group flex flex-col items-center gap-3">
                          <img src={`https://image.tmdb.org/t/p/original${p.logo_path}`} className="w-12 h-12 md:w-20 md:h-20 rounded-2xl shadow-xl" alt={p.provider_name} />
                          <p className="text-[8px] font-black uppercase tracking-[0.1em] text-zinc-600 text-center">{p.provider_name}</p>
                        </div>
                      ))}
                   </div>
                </div>
              )}

              {cast.length > 0 && (
                <div className="space-y-8 pt-10 border-t border-white/5">
                  <h3 className="text-2xl md:text-5xl font-[1000] uppercase italic tracking-tighter text-white">Reparto</h3>
                  <div className="flex gap-6 overflow-x-auto no-scrollbar pb-6">
                    {cast.map(person => (
                      <div 
                        key={person.id} 
                        className="flex-none w-28 md:w-48 group cursor-pointer text-center"
                        onClick={() => onOpenDetails({ ...person, media_type: 'person' })}
                      >
                        <div className="aspect-square rounded-full overflow-hidden mb-4 border-4 border-zinc-900 shadow-xl group-active:scale-95 transition-transform">
                          <img 
                            src={service.getPosterUrl(person.profile_path, 'w342')} 
                            className="w-full h-full object-cover"
                            alt={person.name}
                          />
                        </div>
                        <h5 className="text-[10px] md:text-sm font-black uppercase tracking-tighter text-white mb-1 leading-tight">{person.name}</h5>
                        <p className="text-[8px] md:text-[10px] font-bold text-zinc-600 uppercase italic truncate">{person.character}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DetailsModal;
