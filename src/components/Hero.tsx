/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║  Hero.tsx  —  X One Boutique                                     ║
 * ║  Design Direction: Full-Bleed Editorial Fashion                  ║
 * ║  Aesthetic: Balenciaga × CR Fashion Book × Celine               ║
 * ║                                                                  ║
 * ║  NEW vs all previous versions:                                   ║
 * ║  • Full-viewport immersive photo (no split layout)               ║
 * ║  • Oversized Anton headline — bleeds into the photo              ║
 * ║  • Photo cross-dissolve + Ken Burns slow pan per slide           ║
 * ║  • Two-layer RAF parallax: photo and text move separately        ║
 * ║  • Right-edge vertical ticker (01/04 counter)                    ║
 * ║  • Unified bottom toolbar: pills + progress bars + arrows        ║
 * ║  • Glassmorphism info card replaces badge — bottom right         ║
 * ║  • DM Serif Display editorial italic for sub-headline            ║
 * ║  • Per-slide accent color controls glow, pills, progress, CTA   ║
 * ║  • All original carousel / category / CTA logic preserved        ║
 * ╚══════════════════════════════════════════════════════════════════╝
 */

import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
  memo,
} from "react";

// ─────────────────────────────────────────────────────────────
//  Types
// ─────────────────────────────────────────────────────────────
interface HeroProps {
  onCategoryClick: (category: string | null) => void;
}

interface SlideData {
  id: number;
  tag: string;
  season: string;
  editorialLine: string;
  headline: [string, string];
  sub: string;
  cta: string;
  ctaCategory: string;
  secondary: string;
  secondaryCategory: string | null;
  image: string;
  badge: string;
  badgeSub: string;
  accentH: number;
  accentS: number;
  accentL: number;
}

interface CategoryItem {
  label: string;
  value: string | null;
}

// ─────────────────────────────────────────────────────────────
//  Slide data
// ─────────────────────────────────────────────────────────────
const INTERVAL_MS     = 6000;
const MAGNETIC_RADIUS = 88;
const PARALLAX_LERP   = 0.062;

const SLIDES: SlideData[] = [
  {
    id: 1,
    tag: "New Drop",
    season: "SS 2025",
    editorialLine: "Worn by the Bold.",
    headline: ["DENIM", "JACKET"],
    sub: "Next-generation outerwear engineered for comfort and individuality.",
    cta: "Shop Denim Jackets",
    ctaCategory: "Denim Jackets",
    secondary: "Explore All",
    secondaryCategory: null,
    image: "https://images.unsplash.com/photo-1551537482-f2075a1d41f2?w=1600&q=90&fit=crop",
    badge: "This Month's Drop",
    badgeSub: "Limited stock · Free shipping",
    accentH: 210, accentS: 88, accentL: 62,
  },
  {
    id: 2,
    tag: "Best Seller",
    season: "Signature Series",
    editorialLine: "Precision, Tailored.",
    headline: ["PREMIUM", "SHIRTS"],
    sub: "High-grade breathable fabrics with precision stitching. For the modern man.",
    cta: "Shop Shirts",
    ctaCategory: "Shirt",
    secondary: "Shop T-Shirts",
    secondaryCategory: "T-Shirts",
    image: "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=1600&q=90&fit=crop",
    badge: "500+ Styles",
    badgeSub: "Free shipping above ₹999",
    accentH: 32, accentS: 90, accentL: 58,
  },
  {
    id: 3,
    tag: "Festive Edit",
    season: "Exclusive 2025",
    editorialLine: "Tradition Reimagined.",
    headline: ["KURTA", "COLLECTION"],
    sub: "Curated festive wear blending heritage craft with contemporary edge.",
    cta: "Shop Kurta",
    ctaCategory: "Kurta",
    secondary: "Shop Coats",
    secondaryCategory: "Coats",
    image: "https://images.unsplash.com/photo-1594938298603-c8148c4b4afc?w=1600&q=90&fit=crop",
    badge: "Festive Special",
    badgeSub: "New drops weekly · COD available",
    accentH: 348, accentS: 80, accentL: 62,
  },
  {
    id: 4,
    tag: "Trending",
    season: "All-Time Favourites",
    editorialLine: "Built to Last.",
    headline: ["JEANS &", "DENIM"],
    sub: "4 lakh+ orders. Every pair a statement. Starting from ₹399.",
    cta: "Shop Jeans",
    ctaCategory: "Jeans",
    secondary: "Shop All",
    secondaryCategory: null,
    image: "https://images.unsplash.com/photo-1542272604-787c3835535d?w=1600&q=90&fit=crop",
    badge: "4L+ Orders",
    badgeSub: "From ₹399 · 7-day easy returns",
    accentH: 158, accentS: 72, accentL: 52,
  },
];

const CATEGORIES: CategoryItem[] = [
  { label: "All",          value: null },
  { label: "Shirts",       value: "Shirt" },
  { label: "T-Shirts",     value: "T-Shirts" },
  { label: "Jeans",        value: "Jeans" },
  { label: "Kurta",        value: "Kurta" },
  { label: "Denim Jacket", value: "Denim Jackets" },
  { label: "Coats",        value: "Coats" },
  { label: "Belts",        value: "Belts" },
];

// ─────────────────────────────────────────────────────────────
//  Utilities
// ─────────────────────────────────────────────────────────────
const mod  = (n: number, m: number) => ((n % m) + m) % m;
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const hsl  = (h: number, s: number, l: number, a = 1) =>
  a < 1 ? `hsla(${h},${s}%,${l}%,${a})` : `hsl(${h},${s}%,${l}%)`;

function scrollToProducts() {
  const el =
    document.getElementById("products") ||
    document.getElementById("shop") ||
    document.getElementById("product-grid") ||
    (document.querySelector("[data-products]") as HTMLElement | null);
  if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  else window.scrollTo({ top: window.innerHeight * 0.95, behavior: "smooth" });
}

// ─────────────────────────────────────────────────────────────
//  MagneticBtn — cursor-proximity attraction via RAF
// ─────────────────────────────────────────────────────────────
interface MagBtnProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  style?: React.CSSProperties;
  strength?: number;
  ariaLabel?: string;
}

const MagneticBtn = memo(function MagneticBtn({
  children, onClick, className = "", style = {}, strength = 0.34, ariaLabel,
}: MagBtnProps) {
  const ref   = useRef<HTMLButtonElement>(null);
  const rafId = useRef<number>(0);
  const cur   = useRef({ x: 0, y: 0 });
  const dest  = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onMove = (e: MouseEvent) => {
      const r  = el.getBoundingClientRect();
      const cx = r.left + r.width  / 2;
      const cy = r.top  + r.height / 2;
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;
      dest.current = Math.hypot(dx, dy) < MAGNETIC_RADIUS
        ? { x: dx * strength, y: dy * strength }
        : { x: 0, y: 0 };
    };
    const tick = () => {
      cur.current.x = lerp(cur.current.x, dest.current.x, 0.13);
      cur.current.y = lerp(cur.current.y, dest.current.y, 0.13);
      el.style.transform = `translate(${cur.current.x.toFixed(2)}px,${cur.current.y.toFixed(2)}px)`;
      rafId.current = requestAnimationFrame(tick);
    };
    window.addEventListener("mousemove", onMove);
    el.addEventListener("mouseleave", () => { dest.current = { x: 0, y: 0 }; });
    rafId.current = requestAnimationFrame(tick);
    return () => { window.removeEventListener("mousemove", onMove); cancelAnimationFrame(rafId.current); };
  }, [strength]);

  return (
    <button ref={ref} onClick={onClick} aria-label={ariaLabel}
      className={`xmag ${className}`} style={{ ...style, willChange: "transform" }}>
      {children}
    </button>
  );
});

// ─────────────────────────────────────────────────────────────
//  ProgressLine — horizontal thin progress bars
// ─────────────────────────────────────────────────────────────
const ProgressLine = memo(({
  count, current, progress, onGo, H, S, L,
}: {
  count: number; current: number; progress: number;
  onGo: (i: number) => void; H: number; S: number; L: number;
}) => (
  <div style={{ display: "flex", gap: "5px", alignItems: "center", flex: "1 1 0", maxWidth: "180px" }}>
    {Array.from({ length: count }, (_, i) => (
      <button
        key={i}
        onClick={() => onGo(i)}
        aria-label={`Go to slide ${i + 1}`}
        style={{
          flex: 1, height: "2px", borderRadius: "2px",
          border: "none", cursor: "pointer", padding: 0,
          background: i < current
            ? hsl(H, S, L, .65)
            : i === current
              ? "rgba(255,255,255,.22)"
              : "rgba(255,255,255,.12)",
          position: "relative", overflow: "hidden",
          transition: "background .3s",
        }}
      >
        {i === current && (
          <div style={{
            position: "absolute", inset: 0, left: 0,
            width: `${progress}%`,
            background: hsl(H, S, L),
            transition: "width 50ms linear",
          }} />
        )}
      </button>
    ))}
  </div>
));

// ─────────────────────────────────────────────────────────────
//  HERO — Main Component
// ─────────────────────────────────────────────────────────────
export function Hero({ onCategoryClick }: HeroProps) {

  const [current,        setCurrent]        = useState(0);
  const [prevIdx,        setPrevIdx]        = useState<number | null>(null);
  const [animating,      setAnimating]      = useState(false);
  const [paused,         setPaused]         = useState(false);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [progress,       setProgress]       = useState(0);
  const [imgLoaded,      setImgLoaded]      = useState<Record<number, boolean>>({});

  const rootRef  = useRef<HTMLDivElement>(null);
  const spotRef  = useRef<HTMLDivElement>(null);
  const bgRef    = useRef<HTMLDivElement>(null);
  const textRef  = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const progRef  = useRef<ReturnType<typeof setInterval> | null>(null);
  const touchX   = useRef(0);
  const touchY   = useRef(0);
  const rafId    = useRef<number>(0);
  const mTarget  = useRef({ x: .5, y: .5, rx: 0, ry: 0 });
  const mLerped  = useRef({ x: .5, y: .5, rx: 0, ry: 0 });

  const slides = useMemo(() => SLIDES, []);

  // Preload all images
  useEffect(() => {
    slides.forEach((s, i) => {
      const img = new Image();
      img.src = s.image;
      img.onload = () => setImgLoaded(p => ({ ...p, [i]: true }));
    });
  }, [slides]);

  // Pause on tab hidden
  useEffect(() => {
    const fn = () => setPaused(document.hidden);
    document.addEventListener("visibilitychange", fn);
    return () => document.removeEventListener("visibilitychange", fn);
  }, []);

  // Mouse tracking
  useEffect(() => {
    const fn = (e: MouseEvent) => {
      const r = rootRef.current?.getBoundingClientRect();
      if (!r) return;
      mTarget.current = {
        x: (e.clientX - r.left) / r.width,
        y: (e.clientY - r.top)  / r.height,
        rx: e.clientX - r.left,
        ry: e.clientY - r.top,
      };
    };
    window.addEventListener("mousemove", fn);
    return () => window.removeEventListener("mousemove", fn);
  }, []);

  // RAF parallax — lerp mouse, apply to bg and text separately
  useEffect(() => {
    const tick = () => {
      const ml = mLerped.current;
      const mt = mTarget.current;
      ml.x  = lerp(ml.x,  mt.x,  PARALLAX_LERP);
      ml.y  = lerp(ml.y,  mt.y,  PARALLAX_LERP);
      ml.rx = lerp(ml.rx, mt.rx, PARALLAX_LERP);
      ml.ry = lerp(ml.ry, mt.ry, PARALLAX_LERP);
      const ox = (ml.x - .5) * 2;
      const oy = (ml.y - .5) * 2;
      if (bgRef.current)
        bgRef.current.style.transform = `scale(1.07) translate(${ox * -11}px,${oy * -7}px)`;
      if (textRef.current)
        textRef.current.style.transform = `translate(${ox * 6}px,${oy * 4}px)`;
      if (spotRef.current) {
        spotRef.current.style.left = `${ml.rx}px`;
        spotRef.current.style.top  = `${ml.ry}px`;
      }
      rafId.current = requestAnimationFrame(tick);
    };
    rafId.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId.current);
  }, []);

  // Keyboard nav
  useEffect(() => {
    const fn = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") nextSlide();
      if (e.key === "ArrowLeft")  prevSlide();
    };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current, animating]);

  // Slide transition
  const goTo = useCallback((idx: number) => {
    if (animating) return;
    setPrevIdx(current);
    setCurrent(idx);
    setAnimating(true);
    setProgress(0);
    setTimeout(() => { setPrevIdx(null); setAnimating(false); }, 850);
  }, [animating, current]);

  const nextSlide = useCallback(() => goTo(mod(current + 1, slides.length)), [goTo, current, slides.length]);
  const prevSlide = useCallback(() => goTo(mod(current - 1, slides.length)), [goTo, current, slides.length]);

  // Timer
  const startTimer = useCallback(() => {
    clearInterval(timerRef.current!);
    clearInterval(progRef.current!);
    setProgress(0);
    timerRef.current = setInterval(nextSlide, INTERVAL_MS);
    let p = 0;
    progRef.current = setInterval(() => {
      p += 100 / (INTERVAL_MS / 50);
      setProgress(Math.min(p, 100));
    }, 50);
  }, [nextSlide]);

  useEffect(() => {
    if (!paused) startTimer();
    else { clearInterval(timerRef.current!); clearInterval(progRef.current!); }
    return () => { clearInterval(timerRef.current!); clearInterval(progRef.current!); };
  }, [paused, startTimer]);

  // Swipe (original logic preserved)
  const onTouchStart = (e: React.TouchEvent) => {
    touchX.current = e.touches[0].clientX;
    touchY.current = e.touches[0].clientY;
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    const dx = e.changedTouches[0].clientX - touchX.current;
    const dy = e.changedTouches[0].clientY - touchY.current;
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 40)
      dx < 0 ? nextSlide() : prevSlide();
  };

  // CTA (original logic preserved)
  const handleShop = useCallback((category: string | null) => {
    setActiveCategory(category);
    onCategoryClick(category);
    scrollToProducts();
  }, [onCategoryClick]);

  const slide  = slides[current];
  const H = slide.accentH;
  const S = slide.accentS;
  const L = slide.accentL;
  const accent = hsl(H, S, L);

  // ───────────────────────────────────────────────────────────
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,300;0,400;0,500;0,600;0,700;0,900;1,300&family=Anton&family=DM+Serif+Display:ital@0;1&display=swap');

        .xh *,.xh *::before,.xh *::after{box-sizing:border-box;margin:0;padding:0;}
        .xh  {font-family:'Montserrat',sans-serif;}
        .xant{font-family:'Anton',sans-serif;}
        .xdm {font-family:'DM Serif Display',serif;}

        /* Photo dissolve */
        @keyframes xPIn {
          from{opacity:0;filter:brightness(.55) blur(16px);}
          to  {opacity:1;filter:brightness(1)   blur(0);}
        }
        @keyframes xPOut{
          from{opacity:1;filter:brightness(1)   blur(0);}
          to  {opacity:0;filter:brightness(.65) blur(10px);}
        }

        /* Text reveal */
        @keyframes xLUp{
          from{opacity:0;transform:translateY(28px) skewY(.8deg);filter:blur(5px);}
          to  {opacity:1;transform:translateY(0)    skewY(0);    filter:blur(0);}
        }
        @keyframes xFadeIn{
          from{opacity:0;transform:translateY(12px);}
          to  {opacity:1;transform:translateY(0);}
        }
        @keyframes xChip{
          from{opacity:0;transform:scale(.88) translateX(-10px);}
          to  {opacity:1;transform:scale(1)   translateX(0);}
        }
        @keyframes xBtnPop{
          from{opacity:0;transform:translateY(14px) scale(.94);}
          to  {opacity:1;transform:translateY(0)    scale(1);}
        }
        @keyframes xCardIn{
          from{opacity:0;transform:scale(.88) translateY(14px);filter:blur(5px);}
          to  {opacity:1;transform:scale(1)   translateY(0);   filter:blur(0);}
        }

        /* Shimmer */
        @keyframes xShim{
          0%  {background-position:-260% 0;}
          100%{background-position: 260% 0;}
        }

        /* Pulse */
        @keyframes xPulse{
          0%,100%{opacity:1;transform:scale(1);}
          50%    {opacity:.22;transform:scale(2.2);}
        }

        /* Ambient breathe */
        @keyframes xBr{
          0%,100%{opacity:.4;}
          50%    {opacity:.82;}
        }

        /* Film grain */
        @keyframes xGr{
          0%,100%{transform:translate(0,0);}
          20%    {transform:translate(-1.1%,.9%);}
          40%    {transform:translate(.9%,-1.2%);}
          60%    {transform:translate(-1.3%,.7%);}
          80%    {transform:translate(.8%,-1%);}
        }

        /* Counter tick */
        @keyframes xCnt{
          from{opacity:0;transform:translateY(8px);}
          to  {opacity:1;transform:translateY(0);}
        }

        /* ── Animation classes ── */
        .xpin  {animation:xPIn  .92s cubic-bezier(.16,1,.3,1) both;}
        .xpout {animation:xPOut .78s cubic-bezier(.16,1,.3,1) both;}
        .xl0{animation:xLUp  .7s .03s both cubic-bezier(.22,1,.36,1);}
        .xl1{animation:xLUp  .7s .12s both cubic-bezier(.22,1,.36,1);}
        .xl2{animation:xLUp  .7s .20s both cubic-bezier(.22,1,.36,1);}
        .xl3{animation:xLUp  .7s .28s both cubic-bezier(.22,1,.36,1);}
        .xl4{animation:xLUp  .7s .36s both cubic-bezier(.22,1,.36,1);}
        .xl5{animation:xFadeIn .6s .44s both;}
        .xl6{animation:xFadeIn .6s .52s both;}
        .xchip{animation:xChip  .5s .02s both cubic-bezier(.34,1.56,.64,1);}
        .xb0  {animation:xBtnPop .55s .42s both cubic-bezier(.34,1.56,.64,1);}
        .xb1  {animation:xBtnPop .55s .50s both cubic-bezier(.34,1.56,.64,1);}
        .xcrd  {animation:xCardIn .6s .64s both cubic-bezier(.34,1.56,.64,1);}
        .xshim {background-size:260% 100%;animation:xShim 3s infinite linear;}

        /* Magnetic */
        .xmag{cursor:pointer;border:none;outline:none;display:inline-flex;align-items:center;justify-content:center;will-change:transform;transition:box-shadow .2s ease,filter .16s ease;}
        .xmag:active{filter:brightness(.8);}

        /* Cursor spotlight */
        .xspot{pointer-events:none;position:absolute;width:520px;height:520px;margin:-260px 0 0 -260px;border-radius:50%;background:radial-gradient(ellipse,rgba(255,255,255,.045) 0%,transparent 62%);mix-blend-mode:screen;will-change:left,top;z-index:8;}

        /* Film grain */
        .xgrain{pointer-events:none;position:absolute;inset:-55%;width:210%;height:210%;opacity:.027;animation:xGr .13s steps(1) infinite;background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.88' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");background-size:150px 150px;}

        /* Category scroll */
        .xcat::-webkit-scrollbar{display:none;}
        .xcat{-ms-overflow-style:none;scrollbar-width:none;}

        /* Pill hover */
        .xpill{transition:background .22s,border-color .22s,color .22s,box-shadow .22s,transform .18s cubic-bezier(.34,1.56,.64,1);}
        .xpill:hover{transform:translateY(-2px) scale(1.04);}
        .xpill:active{transform:scale(.96);}

        /* Arrow hover */
        .xarr{transition:background .2s,border-color .2s,transform .18s cubic-bezier(.34,1.56,.64,1);}
        .xarr:hover{transform:scale(1.1);}
        .xarr:active{transform:scale(.92);}

        /* Headline */
        .xhl{font-family:'Anton',sans-serif;text-transform:uppercase;line-height:.87;letter-spacing:-.022em;color:#fff;}

        /* Counter tick */
        .xcnt{animation:xCnt .5s .08s both;}

        /* Mobile */
        @media(max-width:767px){
          .xspot,.xtick,.xcrd{display:none!important;}
          .xhl{font-size:clamp(56px,16vw,98px)!important;}
          .xhtext{padding:0 20px clamp(128px,20vh,168px)!important;}
          .xtbar {padding:0 16px 20px!important;}
          .xcatwrap{padding:0 16px 8px!important;}
          .xmhide{display:none!important;}
          .xmshow{display:flex!important;}
        }
        @media(min-width:768px){.xmshow{display:none!important;}}
      `}</style>

      {/* ═══════════════════════════════════════════════════
          ROOT
      ═══════════════════════════════════════════════════ */}
      <div
        ref={rootRef}
        role="region"
        aria-label="Featured collection carousel"
        className="xh relative w-full overflow-hidden"
        style={{
          height: "100svh",
          minHeight: "620px",
          maxHeight: "980px",
          background: "#04050a",
         borderRadius: "40px",
        }}
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        {/* Cursor spotlight */}
        <div ref={spotRef} className="xspot" style={{ left: "50%", top: "50%" }} />

        {/* Film grain */}
        <div className="xgrain" style={{ zIndex: 60, mixBlendMode: "overlay" }} />

        {/* ── Exiting photo ── */}
        {prevIdx !== null && (
          <div key={`prev-${prevIdx}`} className="xpout absolute inset-0" style={{ zIndex: 1 }}>
            <img src={slides[prevIdx].image} alt="" aria-hidden="true"
              style={{ position:"absolute",inset:0,width:"100%",height:"100%",objectFit:"cover",objectPosition:"center 20%" }} />
          </div>
        )}

        {/* ── Active photo + Ken Burns parallax ── */}
        <div
          ref={bgRef}
          key={`bg-${current}`}
          className="xpin absolute inset-0"
          style={{ zIndex: 2, willChange: "transform", transformOrigin: "center center" }}
        >
          <img
            src={slide.image}
            alt={slide.headline.join(" ")}
            style={{
              position: "absolute", inset: 0,
              width: "100%", height: "100%",
              objectFit: "cover", objectPosition: "center 20%",
              opacity: imgLoaded[current] ? 1 : 0,
              transition: "opacity .4s",
            }}
            loading="eager"
            onLoad={() => setImgLoaded(p => ({ ...p, [current]: true }))}
          />
        </div>

        {/* ── Atmosphere layers ── */}
        <div style={{ position:"absolute",inset:0,zIndex:3,pointerEvents:"none" }}>
          {/* Left fog */}
          <div style={{ position:"absolute",inset:0,background:"linear-gradient(110deg,rgba(3,4,10,.86) 0%,rgba(3,4,10,.6) 32%,rgba(3,4,10,.16) 60%,transparent 82%)" }} />
          {/* Bottom scrim */}
          <div style={{ position:"absolute",inset:0,background:"linear-gradient(to top,rgba(3,4,10,.96) 0%,rgba(3,4,10,.52) 26%,transparent 52%)" }} />
          {/* Top scrim */}
          <div style={{ position:"absolute",top:0,left:0,right:0,height:"28%",background:"linear-gradient(to bottom,rgba(3,4,10,.5) 0%,transparent 100%)" }} />
          {/* Vignette */}
          <div style={{ position:"absolute",inset:0,background:"radial-gradient(ellipse at 50% 50%,transparent 34%,rgba(0,0,0,.46) 100%)" }} />
          {/* Accent glow — bottom right, shifts with slide */}
          <div style={{
            position:"absolute",width:"58vw",height:"58vh",bottom:"-12%",right:"4%",
            background:`radial-gradient(ellipse,${hsl(H,S,L,.17)} 0%,transparent 68%)`,
            filter:"blur(82px)",animation:"xBr 7s ease-in-out infinite",transition:"background 1.3s ease",
          }} />
          {/* Secondary glow — top left */}
          <div style={{
            position:"absolute",width:"36vw",height:"42vh",top:"-6%",left:"-4%",
            background:`radial-gradient(ellipse,${hsl(H,S-8,L+6,.08)} 0%,transparent 70%)`,
            filter:"blur(72px)",animation:"xBr 9s 2s ease-in-out infinite",transition:"background 1.3s ease",
          }} />
        </div>

        {/* ══════════════════════════════════════════════════
            TEXT OVERLAY (moves with parallax via ref)
        ══════════════════════════════════════════════════ */}
        <div
          ref={textRef}
          style={{ position:"absolute",inset:0,zIndex:5,display:"flex",flexDirection:"column",justifyContent:"flex-end",willChange:"transform" }}
        >
          {/* ── TOP BAR ── */}
          <div style={{
            position:"absolute",top:0,left:0,right:0,
            display:"flex",alignItems:"center",justifyContent:"space-between",
            padding:"clamp(20px,3.5vw,44px) clamp(20px,4vw,60px)",zIndex:10,
          }}>
            <div key={`chip-${current}`} className="xchip" style={{ display:"flex",alignItems:"center",gap:"8px" }}>
              <div style={{
                width:"5px",height:"5px",borderRadius:"50%",
                background:accent,boxShadow:`0 0 8px ${accent}`,
                animation:"xPulse 2s ease-in-out infinite",flexShrink:0,
              }} />
              <span style={{ fontSize:"10.5px",fontWeight:600,letterSpacing:"0.16em",textTransform:"uppercase",color:hsl(H,S,L+8,.9) }}>
                {slide.tag}
              </span>
              <span style={{ fontSize:"10px",letterSpacing:"0.12em",textTransform:"uppercase",color:"rgba(255,255,255,.3)",fontWeight:400 }}>
                / {slide.season}
              </span>
            </div>
            {/* Brand watermark — desktop */}
            <div className="xmhide xant" style={{ fontSize:"11.5px",letterSpacing:"0.2em",color:"rgba(255,255,255,.38)",textTransform:"uppercase" }}>
              X ONE
            </div>
          </div>

          {/* ── MAIN HEADLINE BLOCK ── */}
          <div
            className="xhtext"
            style={{ padding:"0 clamp(20px,4vw,60px) clamp(140px,20vh,204px)", maxWidth:"clamp(320px,62vw,820px)" }}
          >
            {/* Editorial italic sub-headline */}
            <p key={`ed-${current}`} className="xl0 xdm" style={{ fontSize:"clamp(15px,1.8vw,22px)",color:hsl(H,S,L+8,.82),fontStyle:"italic",fontWeight:400,letterSpacing:"0.02em",marginBottom:"10px",lineHeight:1.35 }}>
              {slide.editorialLine}
            </p>

            {/* Oversized headline */}
            <h1 key={`h-${current}`}>
              <span className="xl1 xhl block" style={{ fontSize:"clamp(72px,12.5vw,178px)" }}>
                {slide.headline[0]}
              </span>
              <span className="xl2 xhl block" style={{
                fontSize:"clamp(72px,12.5vw,178px)",
                backgroundImage:`linear-gradient(135deg,${hsl(H,S,L+10)} 0%,${hsl(H+20,S-4,L+2)} 55%,${hsl(H+6,S+4,L-10)} 100%)`,
                WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundClip:"text",
              }}>
                {slide.headline[1]}
              </span>
            </h1>

            {/* Accent rule */}
            <div key={`rule-${current}`} className="xl2"
              style={{ width:"44px",height:"2px",margin:"18px 0 16px",borderRadius:"2px",background:`linear-gradient(90deg,${accent},transparent)` }} />

            {/* Body copy */}
            <p key={`sub-${current}`} className="xl3"
              style={{ fontSize:"clamp(12.5px,1.25vw,14px)",color:"rgba(255,255,255,.4)",maxWidth:"375px",lineHeight:1.82,fontWeight:400 }}>
              {slide.sub}
            </p>

            {/* CTAs */}
            <div key={`cta-${current}`} style={{ display:"flex",flexWrap:"wrap",gap:"12px",marginTop:"28px",alignItems:"center" }}>
              {/* Primary */}
              <MagneticBtn
                onClick={() => handleShop(slide.ctaCategory)}
                className="xb0 xshim"
                style={{
                  padding:"14px 28px",borderRadius:"12px",
                  fontSize:"12.5px",fontWeight:700,letterSpacing:"0.07em",textTransform:"uppercase",
                  background:`linear-gradient(90deg,${hsl(H,S,L-4)} 0%,${hsl(H+22,S,L+4)} 50%,${hsl(H,S,L-4)} 100%)`,
                  color:"#fff",
                  boxShadow:`0 10px 44px ${hsl(H,S,L,.46)},inset 0 1px 0 rgba(255,255,255,.18)`,
                  overflow:"hidden",gap:"8px",
                }}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
                </svg>
                {slide.cta}
              </MagneticBtn>

              {/* Secondary */}
              <MagneticBtn
                onClick={() => handleShop(slide.secondaryCategory)}
                className="xb1"
                style={{
                  padding:"14px 22px",borderRadius:"12px",
                  fontSize:"12.5px",fontWeight:600,letterSpacing:"0.06em",textTransform:"uppercase",
                  background:"rgba(255,255,255,.07)",backdropFilter:"blur(20px)",
                  border:"1px solid rgba(255,255,255,.15)",color:"rgba(255,255,255,.76)",gap:"7px",
                }}
              >
                {slide.secondary}
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </MagneticBtn>
            </div>

            {/* Trust signals */}
            <div key={`trust-${current}`} className="xl6" style={{ display:"flex",alignItems:"center",gap:"16px",marginTop:"18px" }}>
              {["Free Shipping","Easy Returns","COD Available"].map(t => (
                <div key={t} style={{ display:"flex",alignItems:"center",gap:"5px" }}>
                  <div style={{ width:"3px",height:"3px",borderRadius:"50%",background:hsl(H,S,L+8,.65) }} />
                  <span style={{ fontSize:"9.5px",color:"rgba(255,255,255,.3)",fontWeight:500,letterSpacing:"0.08em",textTransform:"uppercase" }}>
                    {t}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* ── INFO CARD — bottom right, desktop ── */}
          <div
            key={`card-${current}`}
            className="xcrd"
            style={{
              position:"absolute",bottom:"clamp(90px,12vh,134px)",right:"clamp(28px,4vw,66px)",
              width:"204px",padding:"17px 20px 15px",borderRadius:"20px",
              background:"rgba(7,9,20,.9)",backdropFilter:"blur(28px) saturate(1.9)",
              border:"1px solid rgba(255,255,255,.1)",
              boxShadow:"0 24px 68px rgba(0,0,0,.54),inset 0 1px 0 rgba(255,255,255,.08)",
              zIndex:12,
            }}
          >
            <div style={{ position:"absolute",top:0,left:"18px",right:"18px",height:"1.5px",borderRadius:"0 0 2px 2px",background:`linear-gradient(90deg,${accent},transparent)` }} />
            <p className="xant" style={{ fontSize:"13px",color:"#fff",letterSpacing:"0.08em",lineHeight:1.2,marginBottom:"6px" }}>
              {slide.badge.toUpperCase()}
            </p>
            <p style={{ fontSize:"10.5px",color:"rgba(255,255,255,.38)",lineHeight:1.65,marginBottom:"12px" }}>
              {slide.badgeSub}
            </p>
            <MagneticBtn onClick={() => handleShop(slide.ctaCategory)} strength={0.22}
              style={{ background:"none",gap:"5px",color:hsl(H,S,L+8),fontSize:"11px",fontWeight:700,letterSpacing:"0.07em",textTransform:"uppercase" }}>
              Shop Now
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </MagneticBtn>
          </div>
        </div>

        {/* ── RIGHT VERTICAL TICKER (desktop) ── */}
        <div className="xtick" style={{
          position:"absolute",right:"clamp(18px,2.5vw,32px)",top:"50%",transform:"translateY(-50%)",
          zIndex:20,display:"flex",flexDirection:"column",alignItems:"center",gap:"10px",
        }}>
          {slides.map((_, i) => (
            <button key={i} onClick={() => goTo(i)} aria-label={`Slide ${i + 1}`}
              className="xmag"
              style={{
                width:"2px",height:i===current?"38px":"10px",borderRadius:"2px",
                background:i===current?accent:"rgba(255,255,255,.2)",
                transition:"height .4s cubic-bezier(.22,1,.36,1),background .3s",
                border:"none",cursor:"pointer",padding:0,
              }}
            />
          ))}
          <div style={{ marginTop:"8px",display:"flex",flexDirection:"column",alignItems:"center",gap:"2px" }}>
            <span key={`cnt-${current}`} className="xcnt" style={{ fontSize:"9.5px",fontWeight:700,color:"rgba(255,255,255,.82)",letterSpacing:"0.08em",fontVariantNumeric:"tabular-nums",fontFamily:"'Montserrat',sans-serif" }}>
              {String(current + 1).padStart(2, "0")}
            </span>
            <div style={{ width:"1px",height:"12px",background:"rgba(255,255,255,.2)" }} />
            <span style={{ fontSize:"9.5px",fontWeight:400,color:"rgba(255,255,255,.26)",letterSpacing:"0.08em",fontVariantNumeric:"tabular-nums",fontFamily:"'Montserrat',sans-serif" }}>
              {String(slides.length).padStart(2, "0")}
            </span>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════
            BOTTOM TOOLBAR
        ══════════════════════════════════════════════════ */}
        <div style={{ position:"absolute",bottom:0,left:0,right:0,zIndex:25 }}>
          <div style={{ background:"linear-gradient(to top,rgba(3,4,10,.97) 0%,rgba(3,4,10,.7) 40%,transparent 100%)",paddingTop:"60px" }}>

            {/* Category pills */}
            <div className="xcat xcatwrap flex items-center gap-2 overflow-x-auto" style={{ padding:"0 clamp(16px,4vw,60px) 10px" }}>
              {CATEGORIES.map(cat => {
                const on = activeCategory === cat.value;
                return (
                  <button key={cat.label} onClick={() => handleShop(cat.value)}
                    aria-pressed={on}
                    className="xmag xpill shrink-0"
                    style={{
                      padding:"7px 15px",borderRadius:"100px",
                      fontSize:"11px",fontWeight:on?700:500,letterSpacing:"0.05em",textTransform:"uppercase",
                      background:on?accent:"rgba(255,255,255,.07)",
                      border:`1px solid ${on?accent:"rgba(255,255,255,.1)"}`,
                      color:on?"#fff":"rgba(255,255,255,.42)",
                      boxShadow:on?`0 4px 24px ${hsl(H,S,L,.48)}`:"none",
                      backdropFilter:"blur(16px)",
                    }}
                  >
                    {cat.label}
                  </button>
                );
              })}
            </div>

            {/* Progress + counter + arrows */}
            <div className="xtbar flex items-center gap-4" style={{ padding:"6px clamp(16px,4vw,60px) 24px" }}>
              <ProgressLine count={slides.length} current={current} progress={progress} onGo={goTo} H={H} S={S} L={L} />

              {/* Counter — mobile */}
              <span className="xmshow" style={{ fontSize:"10px",fontWeight:700,color:"rgba(255,255,255,.32)",letterSpacing:"0.1em",fontVariantNumeric:"tabular-nums",whiteSpace:"nowrap",flexShrink:0 }}>
                {String(current + 1).padStart(2, "0")} / {String(slides.length).padStart(2, "0")}
              </span>

              <div style={{ flex:1 }} />

              {paused && (
                <span style={{ fontSize:"9px",fontWeight:600,letterSpacing:"0.12em",textTransform:"uppercase",color:"rgba(255,255,255,.24)",flexShrink:0 }}>
                  Paused
                </span>
              )}

              {/* Arrow buttons */}
              <div style={{ display:"flex",gap:"8px",flexShrink:0 }}>
                {([
                  { fn: prevSlide, label: "Previous slide", d: "M15 18l-6-6 6-6" },
                  { fn: nextSlide, label: "Next slide",     d: "M9 18l6-6-6-6" },
                ] as const).map(({ fn, label, d }) => (
                  <MagneticBtn key={label} onClick={fn} ariaLabel={label} strength={0.22}
                    className="xarr"
                    style={{ width:"36px",height:"36px",borderRadius:"10px",background:"rgba(255,255,255,.06)",border:"1px solid rgba(255,255,255,.1)",backdropFilter:"blur(14px)",cursor:"pointer" }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,.75)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d={d} />
                    </svg>
                  </MagneticBtn>
                ))}
              </div>
            </div>
          </div>
        </div>

      </div>
    </>
  );
}

export default Hero;