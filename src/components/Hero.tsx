import { useState } from "react";

interface HeroProps {
  onCategoryClick: (category: string | null) => void; // Fix the type here
}

export function Hero({ onCategoryClick }: HeroProps) {
  const [apiMessage] = useState("");

  const categories = [
    "All",
    "Jeans",
    "Shirt",
    "T-Shirts",
    "Denim Jackets",
    "Belts",
    "Coats",
    "Kurta",
    "jubba",
  ];

  const handleScroll = (cat: string) => {
    onCategoryClick(cat === "All" ? "All" : cat);
    let id = "";
    switch (cat) {
      case "All": id = "shop"; break;
      case "Shirt": id = "shirt"; break;
      case "Kurta": id = "Kurta"; break;
      case "jubba": id = "jubba"; break;
      case "Jeans": id = "jeans"; break;
      case "T-Shirts": id = "tshirts"; break;
      case "Denim Jackets": id = "denimjackets"; break;
      case "Belts": id = "belts"; break;
      case "Coats": id = "coats"; break;
      default: return;
    }
    const section = document.getElementById(id);
    section?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section
      className="relative rounded-[2rem] sm:rounded-[3.5rem] overflow-hidden 
      border border-gray-200/50 dark:border-white/[0.08] 
      shadow-[0_40px_100px_-20px_rgba(0,0,0,0.15)] dark:shadow-[0_50px_120px_-30px_rgba(0,0,0,0.6)] 
      mb-12 transition-all duration-700 group
      bg-white/60 dark:bg-slate-950/40 backdrop-blur-xl"
    >
      {/* --- ADVANCED BACKGROUND ELEMENTS --- */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Dynamic Glows */}
        <div className="absolute -top-[20%] -left-[10%] w-[60%] h-[60%] bg-blue-500/15 blur-[120px] animate-pulse"></div>
        <div className="absolute -bottom-[20%] -right-[10%] w-[50%] h-[50%] bg-cyan-400/10 blur-[100px]"></div>
        {/* Subtle Grid Pattern */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] brightness-100"></div>
      </div>

      <div className="relative grid md:grid-cols-2 gap-0">
        
        {/* --- LEFT CONTENT AREA --- */}
        <div className="p-8 sm:p-12 md:p-16 lg:p-20 flex flex-col justify-center order-2 md:order-1 z-10">
          
          {/* Status Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl 
          text-blue-600 dark:text-blue-300 
          text-xs sm:text-sm font-black mb-6 self-start 
          bg-blue-50/80 dark:bg-blue-500/10 
          border border-blue-200/50 dark:border-blue-400/20 shadow-sm backdrop-blur-md uppercase tracking-wider">
            <span className="flex h-2 w-2 rounded-full bg-blue-500 animate-pulse"></span>
            NEW COLLECTION 2026
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl 
          font-black text-slate-900 dark:text-white 
          mb-6 leading-[1.1] transition-all duration-500 tracking-tight">
            Premium Men's
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-400 animate-gradient-x italic">
              Fashion Collection
            </span>
          </h1>

          <p className="text-slate-600 dark:text-slate-300 
          text-base sm:text-lg md:text-xl
          mb-10 max-w-lg leading-relaxed transition-all duration-500 font-medium opacity-90">
            Welcome to X One Boutique — where your style gets the spotlight it truly deserves.
            Discover premium fashion crafted to define your personality and elevate your presence.
          </p>

          {apiMessage && (
            <p className="text-blue-600 dark:text-blue-400 text-sm mb-6 font-bold flex items-center gap-2">
              <span className="w-4 h-[1px] bg-blue-500"></span> {apiMessage}
            </p>
          )}

          {/* Luxury Filter Pills */}
          <div className="flex flex-wrap gap-2.5 sm:gap-3">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => handleScroll(cat)}
                className="px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold 
                transition-all duration-300 active:scale-90 uppercase tracking-widest
                bg-white/80 dark:bg-slate-800/80 text-slate-800 dark:text-slate-200
                border border-slate-200 dark:border-white/10
                hover:bg-blue-600 hover:text-white dark:hover:bg-blue-500 dark:hover:text-white
                hover:shadow-[0_15px_30px_-10px_rgba(37,99,235,0.4)] hover:-translate-y-1 backdrop-blur-md"
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* --- RIGHT IMAGE AREA (Editorial Style) --- */}
        <div className="relative min-h-[350px] sm:min-h-[450px] md:min-h-[600px] order-1 md:order-2 overflow-hidden group-hover:scale-[1.02] transition-transform duration-1000">
          <img
            src="/images/xonemainpage.png"
            alt="Fashion collection"
            className="absolute inset-0 w-full h-full object-cover object-[50%_15%] transition-transform duration-[2000ms] group-hover:scale-110"
            loading="eager"
          />

          {/* Sophisticated Overlays */}
          <div className="absolute inset-0 bg-gradient-to-r from-white dark:from-slate-950 via-transparent to-transparent hidden md:block w-1/4" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-60" />
          
          {/* Floating Element for visual interest */}
          <div className="absolute bottom-8 right-8 p-4 backdrop-blur-2xl bg-white/5 border border-white/10 rounded-2xl hidden lg:block animate-bounce-slow">
            <div className="text-white/80 text-[10px] font-black tracking-[0.3em] uppercase">X-One Quality</div>
          </div>
        </div>
      </div>
    </section>
  );
}