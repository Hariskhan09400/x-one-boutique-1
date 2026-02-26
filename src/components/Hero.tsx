import { useState, useEffect, useRef } from "react";

interface HeroProps {
  onCategoryClick: (category: string | null) => void;
}

export function Hero({ onCategoryClick }: HeroProps) {
  const [currentImage, setCurrentImage] = useState(0);
  const [activeCategory, setActiveCategory] = useState("All");
  const [menuOpen, setMenuOpen] = useState(false);
  const [showArrows, setShowArrows] = useState(false);
  const [isPaused, setIsPaused] = useState(false); // 🔥 New State to handle pause
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

  /* AUTO IMAGE SLIDER WITH PAUSE LOGIC */
  useEffect(() => {
    if (isPaused) return; // 🔥 Agar pause hai toh interval start nahi hoga

    const interval = setInterval(() => {
      setCurrentImage(prev =>
        prev === heroImages.length - 1 ? 0 : prev + 1
      );
    }, 4000);
    return () => clearInterval(interval);
  }, [isPaused]); // 🔥 Re-run when isPaused changes

  const nextImage = () => {
    setCurrentImage(prev =>
      prev === heroImages.length - 1 ? 0 : prev + 1
    );
  };

  const prevImage = () => {
    setCurrentImage(prev =>
      prev === 0 ? heroImages.length - 1 : prev - 1
    );
  };

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
            const match = categories.find(
              c => c.toLowerCase().replace(" ", "") === id
            );
            if (match) setActiveCategory(match);
          }
        });
      },
      { threshold: 0.6 }
    );

    categories.forEach(cat => {
      const id = cat.toLowerCase().replace(" ", "");
      const el = document.getElementById(id);
      if (el) observerRef.current?.observe(el);
    });

    return () => observerRef.current?.disconnect();
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const menu = document.getElementById("sideMenu");
      if (menuOpen && menu && !menu.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpen]);

  const scrollLeft = () => {
    scrollRef.current?.scrollBy({ left: -150, behavior: "smooth" });
  };

  const scrollRight = () => {
    scrollRef.current?.scrollBy({ left: 150, behavior: "smooth" });
  };

  return (
    <section
      // 🔥 Mouse and Touch events to handle pause/resume
      onMouseDown={() => setIsPaused(true)}
      onMouseUp={() => setIsPaused(false)}
      onTouchStart={() => setIsPaused(true)}
      onTouchEnd={() => setIsPaused(false)}
      onMouseEnter={() => setShowArrows(true)}
      onMouseLeave={() => {
        setShowArrows(false);
        setIsPaused(false); // Security: resume if mouse leaves while holding
      }}
      
      className="relative rounded-[2rem] overflow-hidden mb-16 min-h-[75vh] md:min-h-screen shadow-[0_40px_120px_-20px_rgba(0,0,0,0.6)] cursor-pointer select-none"
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
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-indigo-900/70" />
      </div>

      {/* ARROWS */}
      <button
        onClick={(e) => { e.stopPropagation(); prevImage(); }}
        className={`absolute left-6 top-1/2 -translate-y-1/2 z-30 p-4 rounded-full text-white 
        bg-white/10 backdrop-blur-xl border border-white/20
        transition-all duration-500 ${
          showArrows ? "opacity-100" : "opacity-0 pointer-events-none"
        } hover:scale-110`}
      >
        ‹
      </button>

      <button
        onClick={(e) => { e.stopPropagation(); nextImage(); }}
        className={`absolute right-6 top-1/2 -translate-y-1/2 z-30 p-4 rounded-full text-white 
        bg-white/10 backdrop-blur-xl border border-white/20
        transition-all duration-500 ${
          showArrows ? "opacity-100" : "opacity-0 pointer-events-none"
        } hover:scale-110`}
      >
        ›
      </button>

      {/* HERO TEXT */}
      <div className="relative z-20 p-8 md:p-20 max-w-2xl transition-all duration-700 pointer-events-none">
        <h1 className="text-4xl md:text-7xl font-black text-white leading-tight">
          {heroContent[currentImage].title1} <br />
          <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent">
            {heroContent[currentImage].title2}
          </span>
        </h1>
        <p className="mt-6 text-gray-300 text-sm md:text-lg max-w-md leading-relaxed">
          {heroContent[currentImage].desc}
        </p>
        {isPaused && (
          <span className="inline-block mt-4 text-[10px] uppercase tracking-widest text-white/40 animate-pulse">
            ⏸ Paused to read
          </span>
        )}
      </div>

      {/* MENU BUTTON */}
      <button
        onClick={(e) => { e.stopPropagation(); setMenuOpen(!menuOpen); }}
        className="absolute left-4 top-[32%] sm:top-1/2 sm:-translate-y-1/2 z-50 
        bg-white/10 backdrop-blur-2xl border border-white/20 
        text-white px-5 py-3 rounded-full shadow-xl 
        hover:scale-110 transition-all duration-300"
      >
        ☰
      </button>

      {/* SIDE MENU */}
      <div
        id="sideMenu"
        onMouseDown={(e) => e.stopPropagation()} // Prevent side menu from triggering pause
        className={`fixed top-0 left-0 h-full w-64 
        bg-gradient-to-b from-black via-slate-900 to-black
        backdrop-blur-2xl border-r border-white/10 
        z-50 transform transition-transform duration-500 ease-out 
        ${menuOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="p-6 space-y-4 mt-20">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => handleScroll(cat)}
              className={`block w-full text-left px-4 py-3 rounded-xl transition-all duration-300 
              ${activeCategory === cat 
                ? "bg-blue-600 text-white" 
                : "text-gray-300 hover:bg-blue-600/20"}`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* GLASS CATEGORY BAR */}
      <div 
        onMouseDown={(e) => e.stopPropagation()} // Don't pause when clicking categories
        className="absolute bottom-12 left-1/2 -translate-x-1/2 z-40 w-[95%] md:w-auto flex items-center justify-center"
      >
        <button onClick={scrollLeft} className="md:hidden mr-2 text-white bg-white/10 backdrop-blur-xl p-2 rounded-full">
          ‹
        </button>
        <div
          ref={scrollRef}
          className="flex gap-3 md:gap-5 overflow-x-auto scroll-smooth px-4 py-2 md:px-8 md:py-4 
          rounded-full bg-white/10 backdrop-blur-2xl border border-white/20 
          shadow-2xl shadow-blue-500/20 no-scrollbar"
        >
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => handleScroll(cat)}
              className={`px-4 py-1.5 md:px-5 md:py-2 text-xs md:text-sm font-bold whitespace-nowrap rounded-full transition-all duration-300
              ${activeCategory === cat 
                ? "bg-blue-600 text-white shadow-lg shadow-blue-500/40" 
                : "text-white hover:bg-blue-500/40"}`}
            >
              {cat}
            </button>
          ))}
        </div>
        <button onClick={scrollRight} className="md:hidden ml-2 text-white bg-white/10 backdrop-blur-xl p-2 rounded-full">
          ›
        </button>
      </div>

    </section>
  );
}