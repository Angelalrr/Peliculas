
import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Sparkles, User, Bot, Camera, Star, Loader2, AlertCircle } from 'lucide-react';
import { GoogleGenAI, Type } from "@google/genai";
import { TMDBService } from '../services/tmdb';

interface AIChatbotProps {
  onOpenDetails: (item: any) => void;
  service: TMDBService;
  visibleContext?: {
    hero: string;
    visibleTitles: string[];
    activeTab: string;
  };
  forceOpen?: boolean;
  onCloseChat?: () => void;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
  recommendations?: any[];
  isVision?: boolean;
  error?: boolean;
}

const AIChatbot: React.FC<AIChatbotProps> = ({ onOpenDetails, service, visibleContext, forceOpen, onCloseChat }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: '¡Hola! Soy CineWave AI. Estoy viendo tu pantalla ahora mismo. ¿Quieres que hablemos sobre la película destacada o prefieres buscar algo nuevo?' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (forceOpen) setIsOpen(true);
  }, [forceOpen]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const captureScreen = async (): Promise<string | null> => {
    try {
      setIsCapturing(true);
      const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
      const video = document.createElement('video');
      video.srcObject = stream;
      
      return new Promise((resolve) => {
        video.onloadedmetadata = async () => {
          await video.play();
          const canvas = document.createElement('canvas');
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(video, 0, 0);
          const base64 = canvas.toDataURL('image/jpeg', 0.8).split(',')[1];
          stream.getTracks().forEach(track => track.stop());
          setIsCapturing(false);
          resolve(base64);
        };
      });
    } catch (err) {
      setIsCapturing(false);
      return null;
    }
  };

  const processAIResponse = async (jsonText: string) => {
    try {
      const jsonMatch = jsonText.match(/\{[\s\S]*\}/);
      const data = JSON.parse(jsonMatch ? jsonMatch[0] : jsonText || "{}");
      let recs: any[] = [];

      if (data.movieTitles && data.movieTitles.length > 0) {
        for (const title of data.movieTitles) {
          const searchRes = await service.search(title);
          if (searchRes.results?.length > 0) recs.push(searchRes.results[0]);
        }
      }

      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: data.text || 'Aquí tienes mi análisis visual.',
        recommendations: recs.length > 0 ? recs : undefined 
      }]);
    } catch (e) {
      setMessages(prev => [...prev, { role: 'assistant', content: 'He tenido un problema analizando los datos visuales.', error: true }]);
    }
  };

  const handleVisionAnalysis = async () => {
    setMessages(prev => [...prev, { role: 'user', content: '¿Qué ves en mi pantalla?', isVision: true }]);
    setIsTyping(true);

    const base64Image = await captureScreen();
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    try {
      if (base64Image) {
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash-image',
          contents: {
            parts: [
              { inlineData: { data: base64Image, mimeType: 'image/jpeg' } },
              { text: "Describe con detalle cinematográfico lo que ves en esta interfaz. Identifica películas y sugiere contenido similar. Responde SIEMPRE con este formato JSON: { \"text\": \"descripción\", \"movieTitles\": [\"sugerencia1\", \"sugerencia2\"] }" }
            ]
          }
        });
        await processAIResponse(response.text || '');
      } else {
        throw new Error("No capture");
      }
    } catch (error) {
      const prompt = `Analiza mi pantalla actual. Estoy en la sección "${visibleContext?.activeTab}". La película destacada es "${visibleContext?.hero}". También veo: ${visibleContext?.visibleTitles.join(', ')}. Actúa como si estuvieras viéndolo realmente.`;
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              text: { type: Type.STRING },
              movieTitles: { type: Type.ARRAY, items: { type: Type.STRING } }
            },
            required: ["text", "movieTitles"]
          }
        }
      });
      await processAIResponse(response.text || '');
    } finally {
      setIsTyping(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isTyping) return;

    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setIsTyping(true);

    const currentVisualContextData = `
      ESTADO VISUAL DE LA APP (TÚ LO VES AHORA):
      - Pestaña: ${visibleContext?.activeTab}
      - Hero: ${visibleContext?.hero}
      - Películas visibles: ${visibleContext?.visibleTitles.join(', ')}
    `;

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `${currentVisualContextData}\n\nUsuario dice: ${userMsg}`,
        config: {
          systemInstruction: "Eres CineWave AI, un experto en cine con visión total de la aplicación. NUNCA digas que no puedes ver la pantalla. Usa los datos visuales inyectados en el prompt para describir la interfaz como si la estuvieras viendo físicamente. Si el usuario te pregunta 'qué ves', descríbele el Hero y los títulos de las filas. Responde siempre en JSON.",
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              text: { type: Type.STRING },
              movieTitles: { type: Type.ARRAY, items: { type: Type.STRING } }
            },
            required: ["text"]
          }
        },
      });
      await processAIResponse(response.text || '');
    } catch (error) {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Fallo en la visión remota.', error: true }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="fixed bottom-24 right-6 md:bottom-32 z-[2000] flex flex-col items-end pointer-events-none">
      <button
        onClick={() => { setIsOpen(!isOpen); if (isOpen && onCloseChat) onCloseChat(); }}
        className={`p-4 rounded-2xl shadow-[0_0_30px_rgba(229,9,20,0.3)] transition-all duration-500 group flex items-center gap-3 pointer-events-auto ${
          isOpen ? 'bg-zinc-800 rotate-90 scale-90' : 'bg-red-600 hover:bg-red-700 hover:scale-110'
        }`}
      >
        {isOpen ? <X className="w-6 h-6 text-white" /> : <Sparkles className="w-6 h-6 text-white animate-pulse" />}
      </button>

      <div className={`mt-4 w-[90vw] md:w-[420px] h-[600px] bg-black/95 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden transition-all duration-500 origin-bottom-right pointer-events-auto ${
        isOpen ? 'scale-100 opacity-100 translate-y-0 visible' : 'scale-0 opacity-0 translate-y-10 invisible pointer-events-none'
      }`}>
        <div className="p-6 border-b border-white/5 bg-red-600/5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-red-600 p-2 rounded-xl"><Bot className="w-4 h-4 text-white" /></div>
            <div>
              <h4 className="font-black uppercase italic tracking-tighter text-xs">CineWave Vision Pro</h4>
              <div className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span><span className="text-[8px] font-black text-zinc-500 uppercase">Live Vision</span></div>
            </div>
          </div>
          <button onClick={handleVisionAnalysis} disabled={isCapturing || isTyping} className="p-2.5 bg-white/5 hover:bg-red-600 rounded-xl transition-all"><Camera className="w-4 h-4 text-zinc-400" /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8 no-scrollbar">
          {isCapturing && <div className="absolute inset-0 z-50 pointer-events-none bg-red-600/10"><div className="w-full h-1 bg-red-600 shadow-[0_0_15px_red] absolute animate-[scan_2s_linear_infinite]"></div></div>}
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex flex-col gap-3 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
              <div className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'bg-zinc-800' : 'bg-red-600'}`}>
                  {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>
                <div className={`max-w-[85%] p-4 rounded-2xl text-[11px] font-bold ${msg.role === 'user' ? 'bg-zinc-800 text-white' : 'bg-white/5 text-zinc-300'}`}>
                  {msg.content}
                </div>
              </div>
              {msg.recommendations && (
                <div className="grid grid-cols-1 gap-3 w-full pl-11">
                  {msg.recommendations.map((rec, rIdx) => (
                    <div key={rIdx} className="bg-zinc-900/50 p-2 rounded-2xl flex gap-3 border border-white/5 hover:border-red-600/30 transition-all cursor-pointer" onClick={() => onOpenDetails(rec)}>
                      <img src={service.getPosterUrl(rec.poster_path, 'w342')} className="w-16 h-24 object-cover rounded-xl" />
                      <div className="flex flex-col justify-center py-1">
                        <h5 className="font-black uppercase italic text-[10px] tracking-tight truncate w-40">{rec.title || rec.name}</h5>
                        <div className="flex items-center gap-1 text-yellow-500 mt-1"><Star className="w-3 h-3 fill-current" /><span className="text-[10px] font-black">{rec.vote_average?.toFixed(1)}</span></div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
          {isTyping && <div className="flex gap-2 animate-pulse pl-2"><div className="w-1.5 h-1.5 bg-red-600 rounded-full animate-bounce"></div><div className="w-1.5 h-1.5 bg-red-600 rounded-full animate-bounce [animation-delay:0.2s]"></div></div>}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSendMessage} className="p-6 bg-zinc-950 border-t border-white/5">
          <div className="relative flex items-center gap-2">
            <input type="text" placeholder="¿Qué ves en mi pantalla?" className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs font-bold focus:outline-none focus:border-red-600 transition-all" value={input} onChange={(e) => setInput(e.target.value)} />
            <button type="submit" disabled={!input.trim() || isTyping} className="p-3 bg-red-600 rounded-xl hover:bg-red-700 transition-all"><Send className="w-4 h-4" /></button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AIChatbot;
