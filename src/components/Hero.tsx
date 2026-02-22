import { useState } from "react";

interface HeroProps {
  onCategoryClick: React.Dispatch<React.SetStateAction<string | null>>;
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
    // 🔥 Category filter set karega
    onCategoryClick(cat === "All" ? "All" : cat);

    let id = "";

    switch (cat) {
      case "All":
        id = "shop";
        break;
      case "Shirt":
        id = "shirt";
        break;
      case "Kurta":
        id = "Kurta";
        break;
      case "jubba":
        id = "jubba";
        break;
      case "Jeans":
        id = "jeans";
        break;
      case "T-Shirts":
        id = "tshirts";
        break;
      case "Denim Jackets":
        id = "denimjackets";
        break;
      case "Belts":
        id = "belts";
        break;
      case "Coats":
        id = "coats";
        break;
      default:
        return;
    }

    const section = document.getElementById(id);
    section?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section
      className="relative rounded-2xl sm:rounded-3xl overflow-hidden 
      border border-gray-200 dark:border-white/[0.10] 
      shadow-[0_26px_100px_rgba(0,0,0,0.25)] dark:shadow-[0_26px_100px_rgba(0,0,0,0.55)] 
      mb-8 glass-panel-strong transition-all duration-500
      bg-white dark:bg-transparent"
    >
      <div className="absolute inset-0 hidden dark:block bg-[radial-gradient(900px_380px_at_20%_0%,rgba(59,130,246,0.28),transparent_60%),radial-gradient(700px_360px_at_95%_10%,rgba(56,189,248,0.18),transparent_55%)]"></div>

      <div className="relative grid md:grid-cols-2 gap-4 sm:gap-6">
        <div className="p-4 sm:p-6 md:p-8 lg:p-12 flex flex-col justify-center order-2 md:order-1">

          <div className="inline-block px-3 py-1.5 sm:px-4 sm:py-2 rounded-full 
          text-blue-600 dark:text-blue-200 
          text-xs sm:text-sm font-bold mb-3 sm:mb-4 self-start 
          bg-blue-100 dark:bg-blue-500/15 
          ring-1 ring-blue-300 dark:ring-blue-400/25">
            NEW COLLECTION 2026
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl 
          font-black text-black dark:text-white 
          mb-3 sm:mb-4 leading-tight transition-all duration-500">
            Premium Men's
            <br />
            <span className="text-gradient-brand">
              Fashion Collection
            </span>
          </h1>

          <p className="text-gray-600 dark:text-gray-300 
          text-sm sm:text-base md:text-lg 
          mb-6 sm:mb-8 max-w-lg leading-relaxed transition-all duration-500">
            Welcome to X One Boutique — where your style gets the spotlight it truly deserves.
            Discover premium fashion crafted to define your personality and elevate your presence.
          </p>

          {apiMessage && (
            <p className="text-blue-500 dark:text-blue-400 
            text-xs sm:text-sm mb-4 sm:mb-6 font-semibold">
              {apiMessage}
            </p>
          )}

          <div className="flex flex-wrap gap-2 sm:gap-3">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => handleScroll(cat)}
                className="px-3 py-1.5 sm:px-4 sm:py-2 md:px-5 md:py-2.5 
                rounded-full text-xs sm:text-sm md:text-base font-semibold 
                transition-all duration-200 active:scale-95 
                bg-gray-200 text-black 
                hover:bg-gray-300 
                dark:bg-gray-800 dark:text-white 
                dark:hover:bg-gray-700"
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
        <div className="relative min-h-[250px] sm:min-h-[300px] md:min-h-[400px] order-1 md:order-2">
          <img
            src="/images/xonemainpage.png"
            alt="Fashion collection"
            className="absolute inset-0 w-full h-full object-cover object-[50%_10%] scale-[1.02]"
            loading="eager"
          />

          <div className="pointer-events-none absolute inset-0 
          bg-gradient-to-t from-black/20 dark:from-black/35 via-transparent to-transparent" />
        </div>
      </div>
    </section>
  );
}
