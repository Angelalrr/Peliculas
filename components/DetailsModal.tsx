
import React, { useEffect, useState, useRef } from 'react';
import { X, Play, Plus, ThumbsUp, Calendar, Clock, ExternalLink, Info, Star, Users, User, MapPin, Award, Heart, RotateCcw, ChevronDown } from 'lucide-react';
import { TMDBService } from '../services/tmdb';
import { ContentDetails, PersonDetails, Movie, TVShow } from '../types';
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
  const [isMiniPlayer, setIsMiniPlayer] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  const mediaType = item.media_type || ((item.title || item.release_date) ? 'movie' : (item.name && item.first_air_date ? 'tv' : (item.name && !item.first_air_date ? 'person' : 'movie')));

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        setShowPlayer(false);
        setIsMiniPlayer(false);
        
        if (mediaType === 'person') {
          const data = await service.getPersonDetails(item.id);
          setPersonDetails(data);
        } else {
          const data = await service.getDetails(mediaType as 'movie' | 'tv', item.id);
          setDetails(data);
        }
      } catch (err: any) {
        console.error("Error fetching data:", err);
        setError("Error de conexión.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [item.id, mediaType, service]);

  useEffect(() => {
    const handleScroll = () => {
      if (!modalRef.current || !showPlayer) return;
      const scrollPos = modalRef.current.scrollTop;
      setIsMiniPlayer(scrollPos > 400);
    };

    const currentModal = modalRef.current;
    if (currentModal) {
      currentModal.addEventListener('scroll', handleScroll);
    }
    return () => currentModal?.removeEventListener('scroll', handleScroll);
  }, [showPlayer]);

  if (!item) return null;

  if (mediaType === 'person') {
    const filmography = personDetails?.combined_credits?.cast
      .filter(i => i.poster_path)
      .sort((a, b) => (b.popularity || 0) - (a.popularity || 0))
      .slice(0, 18) || [];

    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-xl p-0 md:p-6 lg:p-12 overflow-hidden">
        <div 
          ref={modalRef}
          className="relative w-full max-w-6xl h-full md:h-auto md:max-h-[90vh] bg-[#141414] md:rounded-3xl overflow-y-auto overflow-x-hidden shadow-2xl animate-in fade-in zoom-in duration-300"
        >
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 z-[210] bg-black/60 backdrop-blur-md text-white p-3 rounded-full hover:bg-red-600 transition-all border border-white/10 active:scale-90"
          >
            <X className="w-5 h-5" />
          </button>

          {loading ? (
            <div className="h-96 flex flex-col items-center justify-center gap-4">
              <div className="w-8 h-8 border-3 border-red-600 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-zinc-500 font-black uppercase tracking-widest text-[10px]">Cargando perfil...</p>
            </div>
          ) : personDetails ? (
            <div className="animate-in fade-in duration-700">
              <div className="flex flex-col md:flex-row gap-0 md:gap-8">
                <div className="w-full md:w-1/3 aspect-[2/3] md:aspect-auto">
                  <img 
                    src={service.getPosterUrl(personDetails.profile_path, 'original')} 
                    alt={personDetails.name}
                    className="w-full h-full object-cover md:rounded-l-3xl"
                  />
                </div>
                <div className="w-full md:w-2/3 p-6 md:p-12 space-y-6 md:space-y-10">
                  <div>
                    <h1 className="text-3xl md:text-6xl font-black uppercase italic tracking-tighter">{personDetails.name}</h1>
                    <p className="text-red-600 font-bold text-xs uppercase tracking-widest mt-2">{personDetails.known_for_department}</p>
                  </div>
                  <div className="text-zinc-400 text-sm md:text-base leading-relaxed line-clamp-[8] md:line-clamp-none">
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
  const cast = details?.credits?.cast.slice(0, 10);
  const providers = details?.['watch/providers']?.results?.['ES']?.flatrate || [];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/98 md:bg-black/90 backdrop-blur-2xl p-0 md:p-8 lg:p-12 overflow-hidden">
      <div 
        ref={modalRef}
        className="relative w-full max-w-6xl h-full md:h-auto md:max-h-[90vh] bg-[#0a0a0a] md:rounded-[3rem] overflow-y-auto overflow-x-hidden shadow-2xl animate-in fade-in zoom-in duration-300"
      >
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 z-[210] bg-black/80 text-white p-3 rounded-full hover:bg-red-600 transition-all border border-white/10"
        >
          <X className="w-5 h-5" />
        </button>

        {loading ? (
          <div className="h-96 flex flex-col items-center justify-center">
             <div className="w-8 h-8 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="animate-in fade-in duration-700">
            <div className="relative aspect-video w-full bg-zinc-900 overflow-hidden">
               {showPlayer && trailer ? (
                 <YouTubeEmbed videoId={trailer.key} className="absolute inset-0 z-20" />
               ) : (
                 <div className="w-full h-full relative cursor-pointer group" onClick={() => trailer && setShowPlayer(true)}>
                    <img src={service.getBackdropUrl(item.backdrop_path, 'original')} className="w-full h-full object-cover" alt="" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent flex items-center justify-center">
                      {trailer && (
                        <div className="bg-red-600 p-4 md:p-6 rounded-full shadow-2xl scale-90 group-hover:scale-100 transition-transform">
                          <Play className="w-8 h-8 md:w-12 md:h-12 text-white fill-current" />
                        </div>
                      )}
                    </div>
                 </div>
               )}
            </div>

            <div className="p-6 md:p-12 space-y-8">
              <div className="space-y-4">
                <div className="flex flex-wrap items-center gap-3 text-[10px] md:text-xs font-black uppercase tracking-widest text-zinc-500">
                   <span className="text-green-500">{Math.round(item.vote_average * 10)}% Coincidencia</span>
                   <span>{item.release_date?.split('-')[0] || item.first_air_date?.split('-')[0]}</span>
                   {details?.runtime && <span>{details.runtime} min</span>}
                   <span className="border border-zinc-700 px-2 rounded">4K</span>
                </div>
                <h1 className="text-3xl md:text-6xl font-black uppercase italic tracking-tighter leading-none">{item.title || item.name}</h1>
                <p className="text-zinc-300 text-sm md:text-xl font-medium leading-relaxed max-w-4xl">{item.overview}</p>
              </div>

              {providers.length > 0 && (
                <div className="space-y-4 pt-6 border-t border-zinc-800">
                   <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500">Disponible en</h3>
                   <div className="flex flex-wrap gap-4">
                      {providers.map(p => (
                        <img key={p.provider_id} src={`https://image.tmdb.org/t/p/original${p.logo_path}`} className="w-10 h-10 md:w-12 md:h-12 rounded-xl" alt={p.provider_name} title={p.provider_name} />
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
