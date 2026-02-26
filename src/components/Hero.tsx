import { useState, useEffect, useRef } from "react";

interface HeroProps {
  onCategoryClick: (category: string | null) => void;
}

export function Hero({ onCategoryClick }: HeroProps) {
  const [currentImage, setCurrentImage] = useState(0);
  const [activeCategory, setActiveCategory] = useState("All");
  const [menuOpen, setMenuOpen] = useState(false);
  const [showArrows, setShowArrows] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  const heroImages = [
    "https://images.unsplash.com/photo-1520975916090-3105956dac38",
    "https://images.unsplash.com/photo-1490578474895-699cd4e2cf59",
    "https://images.unsplash.com/photo-1503341504253-dff4815485f1",
    "https://images.unsplash.com/photo-1483985988355-763728e1935b"
  ];

  const heroContent = [
    {
      title1: "Elevate Your",
      title2: "Style Game",
      desc: "Premium craftsmanship. Precision stitching. High-grade breathable fabrics designed exclusively for modern men."
    },
    {
      title1: "Engineered For",
      title2: "Confidence",
      desc: "Each X One Boutique piece is tailored to enhance your presence and move effortlessly with your lifestyle."
    },
    {
      title1: "Luxury In",
      title2: "Every Thread",
      desc: "Superior fabric blends. Clean silhouettes. Long-lasting comfort that defines refined fashion."
    },
    {
      title1: "Built For The",
      title2: "Modern Man",
      desc: "Minimal design. Maximum impact. A statement before you even speak."
    }
  ];

  const categories = [
    "All","Jeans","Shirt","T-Shirts",
    "Denim Jackets","Belts","Coats","Kurta","jubba"
  ];

  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setCurrentImage(prev => (prev === heroImages.length - 1 ? 0 : prev + 1));
    }, 4000);
    return () => clearInterval(interval);
  }, [isPaused]);

  const nextImage = () => setCurrentImage(prev => (prev === heroImages.length - 1 ? 0 : prev + 1));
  const prevImage = () => setCurrentImage(prev => (prev === 0 ? heroImages.length - 1 : prev - 1));

  const handleScroll = (cat: string) => {
    setActiveCategory(cat);
    onCategoryClick(cat === "All" ? "All" : cat);
    const id = cat.toLowerCase().replace(" ", "");
    const section = document.getElementById(id);
    section?.scrollIntoView({ behavior: "smooth" });
    setMenuOpen(false);
  };

  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const id = entry.target.id;
            const match = categories.find(c => c.toLowerCase().replace(" ", "") === id);
            if (match) setActiveCategory(match);
          }
        });
      },
      { threshold: 0.6 }
    );
    categories.forEach(cat => {
      const el = document.getElementById(cat.toLowerCase().replace(" ", ""));
      if (el) observerRef.current?.observe(el);
    });
    return () => observerRef.current?.disconnect();
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const menu = document.getElementById("sideMenu");
      if (menuOpen && menu && !menu.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpen]);

  return (
    <section
      onMouseDown={() => setIsPaused(true)}
      onMouseUp={() => setIsPaused(false)}
      onTouchStart={() => setIsPaused(true)}
      onTouchEnd={() => setIsPaused(false)}
      onMouseEnter={() => setShowArrows(true)}
      onMouseLeave={() => { setShowArrows(false); setIsPaused(false); }}
      className="relative rounded-[2rem] overflow-hidden mb-16 min-h-[85vh] md:min-h-screen shadow-[0_40px_120px_-20px_rgba(0,0,0,0.6)] cursor-pointer select-none"
    >
      {/* IMAGE SLIDER */}
      <div className="absolute inset-0 pointer-events-none">
        {heroImages.map((img, i) => (
          <img
            key={i}
            src={`${img}?auto=format&fit=crop&w=1400&q=80`}
            className={`absolute inset-0 w-full h-full object-cover transition-all duration-1000 ${
              i === currentImage ? "opacity-100 scale-105" : "opacity-0"
            }`}
          />
        ))}
        <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/40 to-transparent" />
      </div>

      {/* NEW ADJUSTED CONTENT AREA (Button + Text) */}
      <div className="relative z-20 flex flex-col justify-center h-full min-h-[85vh] md:min-h-screen px-8 md:px-20">
        
        {/* 🔥 MENU BUTTON (Positioned exactly where your red arrow was) */}
        <button
          onClick={(e) => { e.stopPropagation(); setMenuOpen(true); }}
          className="group w-14 h-14 flex items-center justify-center mb-8
          bg-white/10 backdrop-blur-3xl border border-white/20 
          text-white rounded-full shadow-2xl hover:bg-white/20 transition-all duration-500 hover:scale-110"
        >
          <div className="flex flex-col gap-1.5 items-start">
            <span className="w-6 h-0.5 bg-white group-hover:w-4 transition-all" />
            <span className="w-4 h-0.5 bg-white group-hover:w-6 transition-all" />
            <span className="w-5 h-0.5 bg-white transition-all" />
          </div>
        </button>

        {/* HERO TEXT */}
        <div className="max-w-2xl pointer-events-none">
          <h1 className="text-5xl md:text-8xl font-black text-white leading-tight tracking-tighter">
            {heroContent[currentImage].title1} <br />
            <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent">
              {heroContent[currentImage].title2}
            </span>
          </h1>
          <p className="mt-8 text-gray-300 text-base md:text-xl max-w-md leading-relaxed opacity-80">
            {heroContent[currentImage].desc}
          </p>
          {isPaused && (
            <div className="mt-6 flex items-center gap-3">
              <span className="w-2 h-2 bg-blue-500 rounded-full animate-ping" />
              <span className="text-[10px] uppercase tracking-[0.3em] text-white/50 font-bold">Paused View</span>
            </div>
          )}
        </div>
      </div>

      {/* ARROWS (Desktop only) */}
      <button onClick={(e) => { e.stopPropagation(); prevImage(); }} className={`absolute left-6 top-1/2 -translate-y-1/2 z-30 p-4 rounded-full text-white bg-white/10 backdrop-blur-xl border border-white/20 transition-all duration-500 hidden md:block ${showArrows ? "opacity-100" : "opacity-0"}`}>‹</button>
      <button onClick={(e) => { e.stopPropagation(); nextImage(); }} className={`absolute right-6 top-1/2 -translate-y-1/2 z-30 p-4 rounded-full text-white bg-white/10 backdrop-blur-xl border border-white/20 transition-all duration-500 hidden md:block ${showArrows ? "opacity-100" : "opacity-0"}`}>›</button>

      {/* 🔥 ZARA STYLE SIDE MENU ANIMATION */}
      <div
        id="sideMenu"
        className={`fixed top-0 left-0 h-screen w-full md:w-[400px] bg-white text-black z-[100] transform transition-transform duration-[700ms] cubic-bezier(0.77, 0, 0.175, 1) ${menuOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="p-10 h-full flex flex-col">
          <button onClick={() => setMenuOpen(false)} className="self-end text-3xl font-light hover:rotate-90 transition-transform duration-300">✕</button>
          
          <div className="mt-20 space-y-6">
            <p className="text-xs tracking-widest text-gray-400 uppercase mb-8">Categories</p>
            {categories.map((cat, index) => (
              <button
                key={cat}
                onClick={() => handleScroll(cat)}
                style={{ transitionDelay: `${index * 50}ms` }}
                className={`block w-full text-left text-3xl md:text-4xl font-bold tracking-tighter uppercase transition-all duration-500 ${menuOpen ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"} ${activeCategory === cat ? "text-blue-600" : "text-black hover:pl-4"}`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="mt-auto border-t border-black/10 pt-10">
            <p className="text-sm font-medium">X ONE BOUTIQUE</p>
            <p className="text-xs text-gray-500">Redefining Modern Fashion</p>
          </div>
        </div>
      </div>

      {/* CATEGORY BAR */}
      <div onMouseDown={(e) => e.stopPropagation()} className="absolute bottom-12 left-1/2 -translate-x-1/2 z-40 w-[95%] md:w-auto">
        <div ref={scrollRef} className="flex gap-4 p-2 rounded-full bg-black/20 backdrop-blur-3xl border border-white/10 no-scrollbar overflow-x-auto">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => handleScroll(cat)}
              className={`px-6 py-2.5 text-xs md:text-sm font-bold whitespace-nowrap rounded-full transition-all ${activeCategory === cat ? "bg-white text-black shadow-xl" : "text-white hover:bg-white/10"}`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}