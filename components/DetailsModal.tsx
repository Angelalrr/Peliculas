
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
  }, [item.id, mediaType, service]);

  if (!item) return null;

  const CloseButton = () => (
    <button 
      onClick={onClose}
      className="fixed top-6 right-6 z-[3100] bg-red-600 text-white p-3.5 rounded-full hover:bg-red-700 transition-all shadow-[0_10px_30px_rgba(229,9,20,0.5)] active:scale-90 border border-white/20"
      title="Cerrar detalles"
    >
      <X className="w-6 h-6 stroke-[3px]" />
    </button>
  );

  if (mediaType === 'person') {
    return (
      <div className="fixed inset-0 z-[3000] flex items-center justify-center bg-black/95 backdrop-blur-3xl p-0 md:p-12 overflow-hidden animate-in fade-in duration-300">
        <CloseButton />
        <div 
          ref={modalRef}
          className="relative w-full max-w-6xl h-full md:h-auto md:max-h-[90vh] bg-[#0a0a0a] md:rounded-[3rem] overflow-y-auto overflow-x-hidden shadow-2xl border border-white/5 no-scrollbar"
        >
          {loading ? (
            <div className="h-96 flex flex-col items-center justify-center gap-4">
              <div className="w-10 h-10 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-zinc-500 font-black uppercase tracking-widest text-[10px]">Cargando perfil...</p>
            </div>
          ) : personDetails ? (
            <div className="animate-in fade-in duration-700">
              <div className="flex flex-col md:flex-row gap-0">
                <div className="w-full md:w-1/3 aspect-[2/3] md:aspect-auto">
                  <img 
                    src={service.getPosterUrl(personDetails.profile_path, 'original')} 
                    alt={personDetails.name}
                    className="w-full h-full object-cover md:rounded-l-[3rem]"
                  />
                </div>
                <div className="w-full md:w-2/3 p-10 md:p-20 space-y-8">
                  <div>
                    <h1 className="text-4xl md:text-7xl font-[1000] uppercase italic tracking-tighter leading-none">{personDetails.name}</h1>
                    <p className="text-red-600 font-black text-xs uppercase tracking-[0.3em] mt-4">{personDetails.known_for_department}</p>
                  </div>
                  <div className="text-zinc-400 text-base md:text-xl leading-relaxed font-medium">
                    {personDetails.biography || "Sin biografía disponible."}
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    );
  }

  const videos = details?.videos?.results || [];
  const trailer = videos.find(v => v.site === 'YouTube' && (v.type === 'Trailer' || v.type === 'Teaser'));
  
  // Lógica mejorada para encontrar proveedores: intenta España, luego US, luego el primero disponible
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
    <div className="fixed inset-0 z-[3000] flex items-center justify-center bg-black/98 md:bg-black/95 backdrop-blur-3xl p-0 md:p-6 overflow-hidden animate-in fade-in zoom-in duration-300">
      <CloseButton />
      <div 
        ref={modalRef}
        className="relative w-full max-w-6xl h-full md:max-h-[96vh] bg-[#050505] md:rounded-[4rem] overflow-y-auto overflow-x-hidden shadow-[0_0_150px_rgba(0,0,0,1)] border border-white/5 no-scrollbar"
      >
        {loading ? (
          <div className="h-[70vh] flex flex-col items-center justify-center gap-6">
             <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin shadow-red-600/20"></div>
             <p className="text-zinc-600 font-black uppercase tracking-[0.4em] text-[10px]">Iniciando Proyección...</p>
          </div>
        ) : (
          <div className="animate-in fade-in duration-700 pb-24">
            {/* Play/Backdrop Area */}
            <div className="relative aspect-video w-full bg-zinc-900 overflow-hidden shadow-2xl">
               {showPlayer && trailer ? (
                 <YouTubeEmbed videoId={trailer.key} className="absolute inset-0 z-20" />
               ) : (
                 <div className="w-full h-full relative group cursor-pointer" onClick={() => trailer && setShowPlayer(true)}>
                    <img src={service.getBackdropUrl(item.backdrop_path, 'original')} className="w-full h-full object-cover transition-transform duration-[2.5s] group-hover:scale-110" alt="" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/20 to-transparent flex items-center justify-center">
                      {trailer && (
                        <div className="bg-white text-black p-6 rounded-full shadow-[0_0_50px_rgba(255,255,255,0.4)] scale-100 group-hover:scale-125 transition-all duration-700 ease-out">
                          <Play className="w-12 h-12 fill-current translate-x-1" />
                        </div>
                      )}
                    </div>
                 </div>
               )}
            </div>

            <div className="px-8 md:px-24 py-12 space-y-20">
              <div className="space-y-12">
                {/* Metadata Badges */}
                <div className="flex flex-wrap items-center gap-4 text-[10px] md:text-[11px] font-black uppercase tracking-[0.2em]">
                   <div className="flex items-center gap-2 bg-green-500/10 text-green-500 px-5 py-2 rounded-full border border-green-500/20 shadow-lg shadow-green-500/5">
                     <Star className="w-3.5 h-3.5 fill-current" />
                     <span>{Math.round(item.vote_average * 10)}% POPULARIDAD</span>
                   </div>
                   <span className="bg-zinc-800/60 px-5 py-2 rounded-full text-zinc-300 border border-white/5">{item.release_date?.split('-')[0] || item.first_air_date?.split('-')[0]}</span>
                   {details?.runtime && <span className="bg-zinc-800/60 px-5 py-2 rounded-full text-zinc-300 border border-white/5">{details.runtime} MIN</span>}
                   <span className="bg-zinc-800/60 px-5 py-2 rounded-full text-zinc-200 border border-white/10 tracking-[0.25em] font-black">ULTRA HD 4K</span>
                </div>
                  
                <h1 className="text-5xl md:text-8xl lg:text-9xl font-[1000] uppercase italic tracking-tighter leading-[0.85] text-white drop-shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
                  {item.title || item.name}
                </h1>

                {/* Main Action Buttons */}
                <div className="flex flex-wrap gap-6 pt-4">
                  <button 
                    onClick={() => trailer && setShowPlayer(true)}
                    className="flex items-center gap-4 bg-white text-black px-12 py-5 rounded-[1.5rem] font-black uppercase text-xs tracking-widest hover:bg-zinc-200 transition-all active:scale-95 shadow-[0_20px_60px_rgba(255,255,255,0.15)] group"
                  >
                    <Play className="w-5 h-5 fill-current group-hover:scale-110 transition-transform" /> VER TRÁILER
                  </button>
                  <button 
                    onClick={() => setIsAdded(!isAdded)}
                    className={`flex items-center gap-4 px-12 py-5 rounded-[1.5rem] font-black uppercase text-xs tracking-widest transition-all active:scale-95 border ${
                      isAdded 
                        ? 'bg-red-600 border-red-600 text-white shadow-[0_20px_50px_rgba(229,9,20,0.3)]' 
                        : 'bg-zinc-900/50 border-white/10 text-zinc-200 hover:bg-zinc-800 hover:border-white/20'
                    }`}
                  >
                    {isAdded ? <Check className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                    {isAdded ? 'EN MI LISTA' : 'AGREGAR A MI LISTA'}
                  </button>
                </div>
                  
                <p className="text-zinc-400 text-lg md:text-2xl font-medium leading-[1.6] max-w-5xl">
                  {item.overview || "Sin descripción disponible para este título."}
                </p>

                {/* Genres */}
                <div className="flex flex-wrap gap-4">
                  {details?.genres.map(genre => (
                    <span key={genre.id} className="text-[10px] md:text-[11px] font-black uppercase tracking-[0.3em] text-zinc-400 border border-zinc-800/50 px-8 py-3.5 rounded-full hover:bg-white hover:text-black hover:border-white transition-all cursor-default bg-zinc-900/30">
                      {genre.name}
                    </span>
                  ))}
                </div>
              </div>

              {/* Streaming Section (Now always visible if data exists) */}
              {providers.length > 0 && (
                <div className="space-y-12 pt-16 border-t border-white/5 animate-reveal">
                   <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                      <h3 className="text-xs font-black uppercase tracking-[0.6em] text-zinc-600">Disponibilidad en Streaming</h3>
                      <div className="flex items-center gap-2 bg-zinc-900/80 px-4 py-2 rounded-xl border border-white/5">
                        <Info className="w-3.5 h-3.5 text-red-600" />
                        <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Contenido Directo</span>
                      </div>
                   </div>
                   <div className="flex flex-wrap justify-center md:justify-start gap-12">
                      {providers.map(p => (
                        <div key={p.provider_id} className="group flex flex-col items-center gap-5">
                          <div className="relative p-1.5 bg-zinc-900 rounded-[2.2rem] border border-white/5 group-hover:border-red-600/40 group-hover:bg-red-600/5 transition-all duration-500 shadow-2xl">
                            <img src={`https://image.tmdb.org/t/p/original${p.logo_path}`} className="w-16 h-16 md:w-28 md:h-28 rounded-[1.8rem] transition-transform group-hover:scale-105" alt={p.provider_name} />
                          </div>
                          <p className="text-[10px] font-black uppercase tracking-[0.1em] text-zinc-500 group-hover:text-white transition-colors text-center">{p.provider_name}</p>
                        </div>
                      ))}
                   </div>
                </div>
              )}

              {/* Cast Section */}
              {cast.length > 0 && (
                <div className="space-y-12 pt-16 border-t border-white/5 animate-reveal">
                  <div className="flex items-center justify-between">
                    <h3 className="text-3xl md:text-5xl font-[1000] uppercase italic tracking-tighter text-white">Reparto Principal</h3>
                    <div className="bg-zinc-900/80 px-6 py-2.5 rounded-full text-[11px] font-black uppercase tracking-[0.2em] text-zinc-500 border border-white/5">
                      {cast.length} ACTORES
                    </div>
                  </div>
                  <div className="flex gap-12 overflow-x-auto no-scrollbar pb-10">
                    {cast.map(person => (
                      <div 
                        key={person.id} 
                        className="flex-none w-36 md:w-56 group cursor-pointer text-center"
                        onClick={() => onOpenDetails({ ...person, media_type: 'person' })}
                      >
                        <div className="aspect-square rounded-full overflow-hidden mb-8 border-[6px] border-zinc-900 group-hover:border-red-600/50 transition-all duration-700 shadow-3xl scale-95 group-hover:scale-100">
                          <img 
                            src={service.getPosterUrl(person.profile_path, 'w342')} 
                            className="w-full h-full object-cover transition-all duration-1000 grayscale group-hover:grayscale-0 group-hover:rotate-3"
                            alt={person.name}
                          />
                        </div>
                        <h5 className="text-sm md:text-base font-[1000] uppercase tracking-tighter text-white mb-2 leading-tight group-hover:text-red-500 transition-colors">{person.name}</h5>
                        <p className="text-[10px] md:text-[11px] font-bold text-zinc-500 uppercase tracking-tighter italic">{person.character}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Similar Content */}
              {recommendations.length > 0 && (
                <div className="space-y-12 pt-16 border-t border-white/5 animate-reveal">
                  <h3 className="text-3xl md:text-5xl font-[1000] uppercase italic tracking-tighter text-white">También te puede gustar</h3>
                  <div className="flex gap-8 overflow-x-auto no-scrollbar pb-12">
                    {recommendations.map(rec => (
                      <div 
                        key={rec.id} 
                        className="flex-none w-52 md:w-80 aspect-[2/3] group relative cursor-pointer"
                        onClick={() => onOpenDetails(rec)}
                      >
                        <div className="w-full h-full rounded-[3.5rem] overflow-hidden border border-white/5 group-hover:border-red-600/30 transition-all duration-1000 shadow-3xl">
                          <img 
                            src={service.getPosterUrl(rec.poster_path, 'w500')} 
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[1.5s]"
                            alt={rec.title || rec.name}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-700 flex flex-col justify-end p-10">
                            <p className="text-sm md:text-lg font-black uppercase tracking-tighter text-white leading-tight mb-4">{rec.title || rec.name}</p>
                            <div className="flex items-center gap-3">
                               <div className="flex items-center gap-1.5 bg-yellow-500/10 px-3 py-1 rounded-full border border-yellow-500/20">
                                 <Star className="w-3.5 h-3.5 text-yellow-500 fill-current" />
                                 <span className="text-yellow-500 font-black text-xs">{rec.vote_average.toFixed(1)}</span>
                               </div>
                            </div>
                          </div>
                        </div>
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
