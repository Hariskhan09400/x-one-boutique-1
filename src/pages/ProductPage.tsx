// src/pages/ProductPage.tsx
// ══════════════════════════════════════════════════════════════════════
//  X ONE BOUTIQUE — Premium Product Page v3.0
//  ✅ Single toast only (image + name + status)
//  ✅ No WhatsApp button
//  ✅ Image swipe (mobile touch) + keyboard nav + thumbnails
//  ✅ Wishlist working (useWishlist hook)
//  ✅ ReviewSection stable (untouched props)
//  ✅ Dark / Light mode fully supported
//  ✅ Mobile + Desktop responsive
//  ✅ Size selector with shake error (no toast on error)
//  ✅ Quantity selector
//  ✅ Related products with wishlist
//  ✅ Trust badges, delivery info
// ══════════════════════════════════════════════════════════════════════

import { useParams, Link, useNavigate } from "react-router-dom";
import { useAllProducts } from "../App";
import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import ReviewSection from "../components/ReviewSection";
import { useWishlist } from "../App";
import toast from "react-hot-toast";

interface ProductPageProps {
  onAddToCart: (product: any, size?: string) => void;
}

const SIZES = ["XS", "S", "M", "L", "XL", "XXL"];
const SWIPE_THRESHOLD = 42;

// ─── Single toast helper — no duplicate, image + name + status ───
function showToast(
  img: string,
  name: string,
  line2: string,
  line2Color: string,
  id: string
) {
  toast.dismiss(id);
  toast.custom(
    () => (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          padding: "11px 15px",
          background: "#fff",
          borderRadius: "14px",
          boxShadow: "0 8px 32px rgba(0,0,0,.16)",
          border: "1px solid rgba(0,0,0,.07)",
          minWidth: "210px",
          maxWidth: "280px",
          fontFamily: "'DM Sans','Montserrat',sans-serif",
        }}
      >
        <div
          style={{
            width: "42px",
            height: "42px",
            borderRadius: "9px",
            overflow: "hidden",
            flexShrink: 0,
            background: "#f1f4f8",
          }}
        >
          <img
            src={img}
            alt=""
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p
            style={{
              margin: 0,
              fontSize: "13px",
              fontWeight: 800,
              color: "#0f172a",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {name}
          </p>
          <p
            style={{
              margin: "2px 0 0",
              fontSize: "11px",
              fontWeight: 700,
              color: line2Color,
            }}
          >
            {line2}
          </p>
        </div>
      </div>
    ),
    { duration: 2000, position: "bottom-center", id }
  );
}

// ─────────────────────────────────────────────────────────────────────
export default function ProductPage({ onAddToCart }: ProductPageProps) {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toggleWishlist, isWishlisted } = useWishlist();

  const { allProducts: products } = useAllProducts();
  const product = useMemo(() => products.find((p) => p.id === id), [id, products]);
  const wishlisted = product ? isWishlisted(product.id) : false;

  const images = useMemo(() => {
    if (!product) return [];
    if (product.images?.length) return product.images;
    const img = (product as any).image;
    return img ? [img] : [];
  }, [product]);

  const related = useMemo(
    () =>
      products
        .filter((p) => p.category === product?.category && p.id !== id)
        .slice(0, 4),
    [product, id, products]
  );

  const [imgIdx,       setImgIdx]       = useState(0);
  const [selectedSize, setSelectedSize] = useState("");
  const [quantity,     setQuantity]     = useState(1);
  const [sizeShake,    setSizeShake]    = useState(false);
  const [imgFade,      setImgFade]      = useState(true);
  const [isDark,       setIsDark]       = useState(false);
  const [zoomed,       setZoomed]       = useState(false);
  const [zoomPos,      setZoomPos]      = useState({ x: 50, y: 50 });

  const touchX  = useRef(0);
  const touchY  = useRef(0);
  const imgRef  = useRef<HTMLDivElement>(null);
  const user    = useMemo(() => JSON.parse(localStorage.getItem("xob_user") || "null"), []);

  // Dark mode observer
  useEffect(() => {
    const check = () =>
      setIsDark(document.documentElement.classList.contains("dark"));
    check();
    const obs = new MutationObserver(check);
    obs.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => obs.disconnect();
  }, []);

  // Reset on product change
  useEffect(() => {
    setImgIdx(0);
    setSelectedSize("");
    setQuantity(1);
    setSizeShake(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [id]);

  // Keyboard navigation
  useEffect(() => {
    const fn = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft")
        changeImg((imgIdx - 1 + images.length) % images.length);
      if (e.key === "ArrowRight")
        changeImg((imgIdx + 1) % images.length);
    };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [imgIdx, images.length]);

  if (!product) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: isDark ? "#06080f" : "#fafafa",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <p style={{ fontSize: "52px" }}>😕</p>
          <h2
            style={{
              fontSize: "20px",
              fontWeight: 800,
              color: "#ef4444",
              margin: "12px 0 16px",
            }}
          >
            Product not found
          </h2>
          <button
            onClick={() => navigate(-1)}
            style={{
              padding: "12px 28px",
              borderRadius: "12px",
              background: "#2563eb",
              color: "#fff",
              fontWeight: 700,
              border: "none",
              cursor: "pointer",
              fontSize: "14px",
            }}
          >
            ← Go Back
          </button>
        </div>
      </div>
    );
  }

  const price     = product.price;
  const origPrice = (product as any).originalPrice || 0;
  const discount  = origPrice > price
    ? Math.round(((origPrice - price) / origPrice) * 100)
    : 0;
  const coverImg  = images[imgIdx] || images[0] || "";

  // ── Image change with fade
  function changeImg(idx: number) {
    if (idx === imgIdx) return;
    setImgFade(false);
    setTimeout(() => {
      setImgIdx(idx);
      setImgFade(true);
    }, 140);
  }

  // ── Touch swipe
  const onTouchStart = (e: React.TouchEvent) => {
    touchX.current = e.touches[0].clientX;
    touchY.current = e.touches[0].clientY;
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    const dx = e.changedTouches[0].clientX - touchX.current;
    const dy = e.changedTouches[0].clientY - touchY.current;
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > SWIPE_THRESHOLD) {
      if (dx < 0) changeImg((imgIdx + 1) % images.length);
      else        changeImg((imgIdx - 1 + images.length) % images.length);
    }
  };

  // ── Zoom on desktop
  const onMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!imgRef.current) return;
    const r = imgRef.current.getBoundingClientRect();
    setZoomPos({
      x: ((e.clientX - r.left) / r.width) * 100,
      y: ((e.clientY - r.top) / r.height) * 100,
    });
  };

  // ── ADD TO CART — single toast
  const handleAddToCart = useCallback(() => {
    if (!selectedSize) {
      setSizeShake(true);
      setTimeout(() => setSizeShake(false), 500);
      return; // no toast on size error
    }
    onAddToCart({ ...product, selectedSize }, selectedSize);
    showToast(
      images[0],
      product.name,
      `✓ Added to cart · Size ${selectedSize}`,
      "#16a34a",
      "cart-toast"
    );
  }, [selectedSize, product, onAddToCart, images]);

  // ── WISHLIST — single toast
  const handleWishlist = useCallback(() => {
    const willBeWishlisted = !wishlisted;
    toggleWishlist(product.id);
    showToast(
      images[0],
      product.name,
      willBeWishlisted ? "❤️ Added to wishlist" : "✕ Removed from wishlist",
      willBeWishlisted ? "#e11d48" : "#6b7280",
      "wish-toast"
    );
  }, [product, wishlisted, toggleWishlist, images]);

  // ── Theme tokens
  const bg      = isDark ? "#06080f"  : "#f8f9fc";
  const card    = isDark ? "#0d1120"  : "#ffffff";
  const card2   = isDark ? "#111826"  : "#f3f5fb";
  const border  = isDark ? "rgba(255,255,255,.07)" : "rgba(0,0,0,.08)";
  const tPri    = isDark ? "#f0f4ff"  : "#0b1120";
  const tSec    = isDark ? "rgba(240,244,255,.48)" : "rgba(11,17,32,.48)";
  const tTer    = isDark ? "rgba(240,244,255,.24)" : "rgba(11,17,32,.26)";
  const acc     = "#2563eb";
  const accBg   = isDark ? "rgba(37,99,235,.14)" : "rgba(37,99,235,.08)";
  const accBdr  = "rgba(37,99,235,.28)";

  // ─────────────────────────────────────────────────────────────────
  return (
    <div
      style={{
        minHeight: "100vh",
        background: bg,
        fontFamily: "'DM Sans','Montserrat',sans-serif",
        transition: "background .3s",
        paddingBottom: "100px",
        overflowX: "hidden",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:ital,wght@0,700;0,900;1,700;1,900&family=DM+Sans:wght@400;500;600;700;800&display=swap');

        .xpp3 * { box-sizing: border-box; }
        .xpp3-hl { font-family: 'Barlow Condensed', sans-serif !important; }

        /* Scrollbar hide */
        .xpp3-ns::-webkit-scrollbar { display: none; }
        .xpp3-ns { -ms-overflow-style:none; scrollbar-width:none; }

        /* Transitions */
        .xpp3-thumb {
          transition: border-color .18s, opacity .18s, transform .18s;
        }
        .xpp3-thumb:hover { opacity:1 !important; transform:scale(1.05); }

        .xpp3-size {
          transition: all .18s cubic-bezier(.34,1.56,.64,1);
          cursor: pointer;
        }
        .xpp3-size:hover { border-color:#2563eb !important; color:#2563eb !important; transform:scale(1.06); }
        .xpp3-size:active { transform:scale(.94); }

        .xpp3-btn { transition: all .18s ease; cursor:pointer; }
        .xpp3-btn:hover { filter:brightness(1.08); transform:translateY(-1px); }
        .xpp3-btn:active { transform:scale(.97) !important; filter:brightness(.92); }

        .xpp3-heart { transition: transform .22s cubic-bezier(.34,1.56,.64,1); cursor:pointer; }
        .xpp3-heart:hover { transform:scale(1.22) !important; }
        .xpp3-heart:active { transform:scale(.88) !important; }

        .xpp3-rel { transition: box-shadow .25s, transform .25s; }
        .xpp3-rel:hover { transform:translateY(-4px); box-shadow:0 14px 36px rgba(0,0,0,.14) !important; }
        .xpp3-rel:hover img { transform:scale(1.07) !important; }

        /* Shake animation */
        @keyframes xpp3-shake {
          0%,100%{ transform:translateX(0); }
          20%{ transform:translateX(-7px); }
          40%{ transform:translateX(7px); }
          60%{ transform:translateX(-4px); }
          80%{ transform:translateX(4px); }
        }
        .xpp3-shake { animation: xpp3-shake .42s ease; }

        /* Fade for image */
        @keyframes xpp3-imgfade {
          from{ opacity:0; }
          to  { opacity:1; }
        }
        .xpp3-imgfade { animation: xpp3-imgfade .22s ease; }

        /* Stagger reveal */
        @keyframes xpp3-up {
          from{ opacity:0; transform:translateY(18px); }
          to  { opacity:1; transform:translateY(0); }
        }
        .xpp3-a0 { animation: xpp3-up .4s .04s both; }
        .xpp3-a1 { animation: xpp3-up .4s .10s both; }
        .xpp3-a2 { animation: xpp3-up .4s .16s both; }
        .xpp3-a3 { animation: xpp3-up .4s .22s both; }
        .xpp3-a4 { animation: xpp3-up .4s .28s both; }
        .xpp3-a5 { animation: xpp3-up .4s .34s both; }

        /* Responsive grid */
        .xpp3-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 28px;
        }
        @media(min-width:768px) {
          .xpp3-grid { grid-template-columns:52% 1fr; gap:40px; align-items:start; }
        }
        @media(min-width:1100px) {
          .xpp3-grid { grid-template-columns:56% 1fr; gap:60px; }
        }

        /* Hide desktop thumbnails on mobile */
        @media(max-width:767px) { .xpp3-thumb-col { display:none !important; } }

        /* Image container must not overflow */
        .xpp3-imgwrap {
          position: relative;
          width: 100%;
          overflow: hidden;
          border-radius: 20px;
          background: #eef1f8;
          isolation: isolate;
          contain: layout paint;
        }
        .xpp3-imgwrap::before {
          content: "";
          display: block;
          padding-bottom: 125%; /* 4:5 ratio */
        }
        .xpp3-imgwrap img {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .xpp3-rel-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }
        @media(min-width:640px) {
          .xpp3-rel-grid { grid-template-columns:repeat(4,1fr); gap:20px; }
        }

        /* Mobile sticky bar */
        @media(max-width:767px) {
          .xpp3-sticky { display:flex !important; }
          .xpp3-desk-cta { display:none !important; }
        }
        @media(min-width:768px) {
          .xpp3-sticky { display:none !important; }
          .xpp3-desk-cta { display:flex !important; }
        }

        /* Trust badge row wrap */
        .xpp3-trust { display:flex; flex-wrap:wrap; gap:8px; }
      `}</style>

      <div
        className="xpp3"
        style={{ maxWidth: "1260px", margin: "0 auto", padding: "0 clamp(14px,4vw,32px)" }}
      >
        {/* ── Breadcrumb ── */}
        <nav style={{ display:"flex", gap:"6px", alignItems:"center", padding:"18px 0 24px", fontSize:"11px", fontWeight:600, color:tTer, flexWrap:"wrap" }}>
          <Link to="/" style={{ color:tTer, textDecoration:"none" }}>Home</Link>
          <span>/</span>
          <Link to="/shop" style={{ color:tTer, textDecoration:"none" }}>Shop</Link>
          <span>/</span>
          <span style={{ color:tSec }}>{product.category}</span>
          <span>/</span>
          <span style={{ color:tPri, fontWeight:700, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", maxWidth:"180px" }}>
            {product.name}
          </span>
        </nav>

        {/* ══════════════════════════════════════════════════════════
            MAIN GRID
        ══════════════════════════════════════════════════════════ */}
        <div className="xpp3-grid">

          {/* ━━━━━━━━━━━━━━━━
              LEFT — IMAGES
          ━━━━━━━━━━━━━━━━ */}
          <div style={{ minWidth:0 }}>
            <div style={{ display:"flex", gap:"10px", alignItems:"flex-start" }}>

              {/* Thumbnail column — desktop only */}
              {images.length > 1 && (
                <div
                  className="xpp3-ns xpp3-thumb-col"
                  style={{
                    display:"flex", flexDirection:"column", gap:"8px",
                    flexShrink:0, width:"64px",
                  }}
                >
                  {images.map((img: string, i: number) => (
                    <div
                      key={i}
                      className="xpp3-thumb"
                      onClick={() => changeImg(i)}
                      style={{
                        width:"60px", height:"74px", borderRadius:"10px",
                        overflow:"hidden", flexShrink:0, cursor:"pointer",
                        border:`2.5px solid ${imgIdx===i ? acc : border}`,
                        opacity: imgIdx===i ? 1 : 0.48,
                      }}
                    >
                      <img src={img} alt="" style={{ width:"100%", height:"100%", objectFit:"cover" }} />
                    </div>
                  ))}
                </div>
              )}

              {/* Main image */}
              <div style={{ flex:1, minWidth:0 }}>
                <div
                  ref={imgRef}
                  className="xpp3-imgwrap"
                  onTouchStart={onTouchStart}
                  onTouchEnd={onTouchEnd}
                  onMouseMove={onMouseMove}
                  onMouseEnter={() => setZoomed(true)}
                  onMouseLeave={() => setZoomed(false)}
                  style={{
                    cursor: zoomed ? "zoom-in" : "default",
                    userSelect:"none",
                    background: isDark ? "#111826" : "#eef1f8",
                  }}
                >
                  {/* Image */}
                  <img
                    key={imgIdx}
                    src={coverImg}
                    alt={product.name}
                    className={imgFade ? "xpp3-imgfade" : ""}
                    style={{
                      position:"absolute", inset:0,
                      width:"100%", height:"100%", objectFit:"cover",
                      transformOrigin:`${zoomPos.x}% ${zoomPos.y}%`,
                      transform: zoomed ? "scale(1.35)" : "scale(1)",
                      transition: zoomed ? "transform .08s linear" : "transform .35s ease",
                    }}
                  />

                  {/* Badges */}
                  <div style={{ position:"absolute", top:"12px", left:"12px", display:"flex", flexDirection:"column", gap:"6px", zIndex:2 }}>
                    {discount > 0 && (
                      <span style={{ background:"#e11d48", color:"#fff", fontSize:"10px", fontWeight:800, padding:"4px 10px", borderRadius:"100px", letterSpacing:"0.04em" }}>
                        -{discount}%
                      </span>
                    )}
                    <span style={{ background:"rgba(0,0,0,.62)", backdropFilter:"blur(6px)", color:"#fff", fontSize:"9px", fontWeight:700, padding:"3px 10px", borderRadius:"100px", letterSpacing:"0.08em", textTransform:"uppercase" }}>
                      {product.category}
                    </span>
                  </div>

                  {/* Wishlist on image */}
                  <button
                    className="xpp3-heart"
                    onClick={handleWishlist}
                    style={{
                      position:"absolute", top:"12px", right:"12px", zIndex:2,
                      width:"38px", height:"38px", borderRadius:"50%",
                      background: wishlisted ? "rgba(225,29,72,.92)" : "rgba(255,255,255,.9)",
                      backdropFilter:"blur(8px)",
                      border:"none", display:"flex", alignItems:"center", justifyContent:"center",
                      boxShadow:"0 2px 12px rgba(0,0,0,.18)",
                    }}
                  >
                    <HeartSVG filled={wishlisted} color={wishlisted ? "#fff" : "#666"} size={16} />
                  </button>

                  {/* Arrow buttons */}
                  {images.length > 1 && (
                    <>
                      <button
                        className="xpp3-btn"
                        onClick={() => changeImg((imgIdx - 1 + images.length) % images.length)}
                        style={{
                          position:"absolute", left:"10px", top:"50%", transform:"translateY(-50%)", zIndex:2,
                          width:"34px", height:"34px", borderRadius:"50%",
                          background:"rgba(255,255,255,.88)", border:"none",
                          display:"flex", alignItems:"center", justifyContent:"center",
                          fontSize:"18px", fontWeight:700, color:"#333",
                          boxShadow:"0 2px 8px rgba(0,0,0,.14)",
                        }}
                      >
                        ‹
                      </button>
                      <button
                        className="xpp3-btn"
                        onClick={() => changeImg((imgIdx + 1) % images.length)}
                        style={{
                          position:"absolute", right:"10px", top:"50%", transform:"translateY(-50%)", zIndex:2,
                          width:"34px", height:"34px", borderRadius:"50%",
                          background:"rgba(255,255,255,.88)", border:"none",
                          display:"flex", alignItems:"center", justifyContent:"center",
                          fontSize:"18px", fontWeight:700, color:"#333",
                          boxShadow:"0 2px 8px rgba(0,0,0,.14)",
                        }}
                      >
                        ›
                      </button>
                    </>
                  )}

                  {/* Dot indicators */}
                  {images.length > 1 && (
                    <div style={{
                      position:"absolute", bottom:"12px", left:"50%", transform:"translateX(-50%)", zIndex:2,
                      display:"flex", gap:"5px",
                      background:"rgba(0,0,0,.22)", backdropFilter:"blur(6px)",
                      padding:"5px 10px", borderRadius:"20px",
                    }}>
                      {images.map((_: any, i: number) => (
                        <div
                          key={i}
                          onClick={() => changeImg(i)}
                          style={{
                            height:"5px",
                            width: imgIdx===i ? "18px" : "5px",
                            borderRadius:"5px",
                            background: imgIdx===i ? "#fff" : "rgba(255,255,255,.38)",
                            transition:"all .22s ease",
                            cursor:"pointer",
                          }}
                        />
                      ))}
                    </div>
                  )}
                </div>

                {/* Mobile thumbnail strip */}
                {images.length > 1 && (
                  <div className="xpp3-ns" style={{ display:"flex", gap:"8px", marginTop:"10px", overflowX:"auto", paddingBottom:"4px" }}>
                    {images.map((img: string, i: number) => (
                      <div
                        key={i}
                        className="xpp3-thumb"
                        onClick={() => changeImg(i)}
                        style={{
                          width:"54px", height:"64px", borderRadius:"9px", overflow:"hidden",
                          flexShrink:0, cursor:"pointer",
                          border:`2px solid ${imgIdx===i ? acc : "transparent"}`,
                          opacity: imgIdx===i ? 1 : 0.46,
                        }}
                      >
                        <img src={img} alt="" style={{ width:"100%", height:"100%", objectFit:"cover" }} />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ━━━━━━━━━━━━━━━━
              RIGHT — DETAILS
          ━━━━━━━━━━━━━━━━ */}
          <div>
            {/* Stock badge */}
            <div className="xpp3-a0" style={{ display:"flex", alignItems:"center", gap:"8px", marginBottom:"12px" }}>
              <span style={{ width:"7px", height:"7px", borderRadius:"50%", background:"#16a34a", display:"inline-block", boxShadow:"0 0 6px #16a34a" }} />
              <span style={{ fontSize:"11px", fontWeight:700, color:"#16a34a", textTransform:"uppercase", letterSpacing:"0.1em" }}>In Stock</span>
              <span style={{ color:tTer, fontSize:"10px" }}>·</span>
              <span style={{ fontSize:"11px", color:tTer, fontWeight:600 }}>Ships in 24 hrs</span>
            </div>

            {/* Product name */}
            <h1
              className="xpp3-a1 xpp3-hl"
              style={{
                fontSize:"clamp(30px,5.5vw,52px)", fontWeight:900,
                color:tPri, lineHeight:.92, textTransform:"uppercase",
                letterSpacing:"-0.01em", marginBottom:"14px", fontStyle:"italic",
              }}
            >
              {product.name}
            </h1>

            {/* Star rating */}
            <div className="xpp3-a1" style={{ display:"flex", alignItems:"center", gap:"8px", marginBottom:"16px" }}>
              <div style={{ display:"flex", gap:"2px" }}>
                {[1,2,3,4,5].map((s) => (
                  <svg key={s} width="13" height="13" viewBox="0 0 24 24"
                    fill={s<=4 ? "#f59e0b" : "none"}
                    stroke="#f59e0b" strokeWidth="2">
                    <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/>
                  </svg>
                ))}
              </div>
              <span style={{ fontSize:"12px", fontWeight:700, color:tSec }}>4.8</span>
              <span style={{ fontSize:"11px", color:tTer }}>(124 reviews)</span>
              <span style={{ color:tTer }}>·</span>
              <button
                onClick={() => document.getElementById("xpp3-reviews")?.scrollIntoView({ behavior:"smooth" })}
                style={{ background:"none", border:"none", cursor:"pointer", fontSize:"11px", fontWeight:700, color:acc, textDecoration:"underline", textUnderlineOffset:"3px" }}
              >
                Read reviews
              </button>
            </div>

            {/* Price */}
            <div className="xpp3-a2" style={{ display:"flex", alignItems:"baseline", gap:"12px", marginBottom:"20px", flexWrap:"wrap" }}>
              <span
                className="xpp3-hl"
                style={{ fontSize:"clamp(28px,5vw,44px)", fontWeight:900, color:acc, letterSpacing:"-0.02em" }}
              >
                ₹{price.toLocaleString("en-IN")}
              </span>
              {origPrice > price && (
                <span style={{ fontSize:"18px", fontWeight:600, color:tTer, textDecoration:"line-through" }}>
                  ₹{origPrice.toLocaleString("en-IN")}
                </span>
              )}
              {discount > 0 && (
                <span style={{ fontSize:"11px", fontWeight:800, color:"#16a34a", background:"rgba(22,163,74,.1)", padding:"4px 10px", borderRadius:"8px", letterSpacing:"0.04em" }}>
                  {discount}% OFF
                </span>
              )}
            </div>

            {/* Description */}
            <p className="xpp3-a2" style={{ fontSize:"14px", lineHeight:1.78, color:tSec, marginBottom:"24px", maxWidth:"400px" }}>
              {product.description}
            </p>

            <div style={{ height:"1px", background:border, marginBottom:"24px" }} />

            {/* ── Size Selector ── */}
            <div className={`xpp3-a3 ${sizeShake ? "xpp3-shake" : ""}`} style={{ marginBottom:"22px" }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"12px" }}>
                <span style={{ fontSize:"11px", fontWeight:800, color:tTer, textTransform:"uppercase", letterSpacing:"0.12em" }}>
                  Size{selectedSize ? <> — <span style={{ color:acc }}>{selectedSize}</span></> : ""}
                </span>
                <button style={{ background:"none", border:"none", cursor:"pointer", fontSize:"11px", fontWeight:700, color:acc, textDecoration:"underline", textUnderlineOffset:"3px" }}>
                  Size Guide
                </button>
              </div>
              <div style={{ display:"flex", flexWrap:"wrap", gap:"8px" }}>
                {SIZES.map((sz) => {
                  const sel = selectedSize === sz;
                  return (
                    <button
                      key={sz}
                      className="xpp3-size"
                      onClick={() => setSelectedSize(sz)}
                      style={{
                        width:"50px", height:"50px", borderRadius:"12px",
                        fontWeight:800, fontSize:"13px",
                        border:`2px solid ${sel ? acc : border}`,
                        background: sel ? acc : "transparent",
                        color: sel ? "#fff" : tSec,
                        boxShadow: sel ? `0 4px 16px ${acc}44` : "none",
                      }}
                    >
                      {sz}
                    </button>
                  );
                })}
              </div>
              {sizeShake && (
                <p style={{ fontSize:"11px", color:"#ef4444", fontWeight:700, marginTop:"8px" }}>
                  ⚠ Please select a size
                </p>
              )}
            </div>

            {/* ── Quantity ── */}
            <div className="xpp3-a3" style={{ display:"flex", alignItems:"center", gap:"14px", marginBottom:"24px", flexWrap:"wrap" }}>
              <span style={{ fontSize:"11px", fontWeight:800, color:tTer, textTransform:"uppercase", letterSpacing:"0.12em" }}>
                Qty
              </span>
              <div style={{ display:"flex", alignItems:"center", borderRadius:"12px", border:`1.5px solid ${border}`, overflow:"hidden" }}>
                {[
                  { label:"−", fn: () => setQuantity(q => Math.max(1, q-1)) },
                  { label:"+", fn: () => setQuantity(q => q+1) },
                ].map((b, bi) => (
                  <>
                    {bi === 1 && (
                      <span style={{ minWidth:"42px", textAlign:"center", fontSize:"16px", fontWeight:900, color:tPri }}>
                        {quantity}
                      </span>
                    )}
                    <button
                      key={b.label}
                      className="xpp3-btn"
                      onClick={b.fn}
                      style={{
                        width:"44px", height:"44px", background:"none", border:"none",
                        fontSize:"20px", fontWeight:700, color:tPri,
                      }}
                    >
                      {b.label}
                    </button>
                  </>
                ))}
              </div>
              <span style={{ fontSize:"13px", color:tSec }}>
                Total: <strong style={{ color:tPri, fontWeight:900 }}>₹{(price*quantity).toLocaleString("en-IN")}</strong>
              </span>
            </div>

            {/* ── Desktop CTAs ── */}
            <div className="xpp3-desk-cta xpp3-a4" style={{ flexDirection:"column", gap:"10px", marginBottom:"22px" }}>
              <button
                className="xpp3-btn"
                onClick={handleAddToCart}
                style={{
                  width:"100%", padding:"16px", borderRadius:"14px",
                  background:`linear-gradient(135deg,${acc},#4f46e5)`,
                  color:"#fff", fontWeight:800, fontSize:"14px",
                  border:"none", letterSpacing:"0.06em", textTransform:"uppercase",
                  boxShadow:`0 8px 28px ${acc}44`,
                  display:"flex", alignItems:"center", justifyContent:"center", gap:"8px",
                }}
              >
                <CartSVG size={16} /> Add to Cart
              </button>

              <button
                className="xpp3-heart"
                onClick={handleWishlist}
                style={{
                  width:"100%", padding:"14px", borderRadius:"14px",
                  border:`2px solid ${wishlisted ? "#e11d48" : border}`,
                  background: wishlisted ? "rgba(225,29,72,.08)" : "transparent",
                  color: wishlisted ? "#e11d48" : tSec,
                  fontWeight:800, fontSize:"13px",
                  display:"flex", alignItems:"center", justifyContent:"center", gap:"8px",
                  letterSpacing:"0.04em", textTransform:"uppercase",
                }}
              >
                <HeartSVG filled={wishlisted} color={wishlisted ? "#e11d48" : tSec} size={16} />
                {wishlisted ? "Wishlisted" : "Add to Wishlist"}
              </button>
            </div>

            {/* ── Trust badges ── */}
            <div className="xpp3-trust xpp3-a5">
              {[
                { icon:"🚚", label:"Free Shipping" },
                { icon:"↩️", label:"Easy Returns" },
                { icon:"🔒", label:"Secure Pay" },
                { icon:"📦", label:"COD Available" },
              ].map((b) => (
                <div
                  key={b.label}
                  style={{
                    display:"flex", alignItems:"center", gap:"6px",
                    padding:"7px 13px", borderRadius:"100px",
                    background: isDark ? "rgba(255,255,255,.04)" : "rgba(0,0,0,.04)",
                    border:`1px solid ${border}`,
                    fontSize:"11px", fontWeight:600, color:tSec,
                  }}
                >
                  <span style={{ fontSize:"14px" }}>{b.icon}</span> {b.label}
                </div>
              ))}
            </div>

            {/* ── Delivery info ── */}
            <div className="xpp3-a5" style={{ marginTop:"20px", padding:"14px 16px", borderRadius:"14px", background:card2, border:`1px solid ${border}`, display:"flex", gap:"12px" }}>
              <span style={{ fontSize:"22px" }}>📍</span>
              <div>
                <p style={{ margin:"0 0 3px", fontSize:"13px", fontWeight:700, color:tPri }}>Delivery in 3-5 business days</p>
                <p style={{ margin:0, fontSize:"11px", color:tSec }}>Free delivery on all orders · Easy 7-day returns</p>
              </div>
            </div>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════════
            PRODUCT DETAILS TABS
        ══════════════════════════════════════════════════════════ */}
        <div style={{ marginTop:"clamp(40px,6vw,72px)", borderTop:`1px solid ${border}`, paddingTop:"clamp(28px,4vw,52px)" }}>
          <div style={{
            display:"grid",
            gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))",
            gap:"14px",
          }}>
            {[
              { icon:"👕", title:"Material", val:"100% Premium Cotton" },
              { icon:"🧵", title:"Fit",      val:"Regular / Relaxed Fit" },
              { icon:"🌊", title:"Care",     val:"Machine washable 30°C" },
              { icon:"🏷️", title:"Origin",   val:"Made in India" },
            ].map((d) => (
              <div
                key={d.title}
                style={{
                  padding:"16px 18px", borderRadius:"16px",
                  background:card, border:`1px solid ${border}`,
                  display:"flex", alignItems:"flex-start", gap:"12px",
                }}
              >
                <span style={{ fontSize:"22px", marginTop:"1px" }}>{d.icon}</span>
                <div>
                  <p style={{ margin:"0 0 4px", fontSize:"10px", fontWeight:800, color:tTer, textTransform:"uppercase", letterSpacing:"0.1em" }}>
                    {d.title}
                  </p>
                  <p style={{ margin:0, fontSize:"13px", fontWeight:600, color:tPri }}>
                    {d.val}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════════
            REVIEWS — stable, untouched props
        ══════════════════════════════════════════════════════════ */}
        <div
          id="xpp3-reviews"
          style={{
            marginTop:"clamp(40px,6vw,72px)",
            borderTop:`1px solid ${border}`,
            paddingTop:"clamp(28px,4vw,52px)",
          }}
        >
          <h2
            className="xpp3-hl"
            style={{
              fontSize:"clamp(22px,3.5vw,32px)", fontWeight:900,
              textTransform:"uppercase", fontStyle:"italic",
              color:tPri, marginBottom:"28px", letterSpacing:"-0.01em",
            }}
          >
            Customer Reviews
          </h2>
          {/* ReviewSection — props exactly as original, untouched */}
          <ReviewSection productId={product.id} user={user} />
        </div>

        {/* ══════════════════════════════════════════════════════════
            RELATED PRODUCTS
        ══════════════════════════════════════════════════════════ */}
        {related.length > 0 && (
          <div style={{
            marginTop:"clamp(40px,6vw,72px)",
            borderTop:`1px solid ${border}`,
            paddingTop:"clamp(28px,4vw,52px)",
          }}>
            <h3
              className="xpp3-hl"
              style={{
                fontSize:"clamp(20px,3vw,28px)", fontWeight:900,
                textTransform:"uppercase", fontStyle:"italic",
                color:tPri, marginBottom:"clamp(14px,3vw,24px)", letterSpacing:"-0.01em",
              }}
            >
              You Might Like
            </h3>
            <div className="xpp3-rel-grid">
              {related.map((rp) => {
                const rpImages = rp.images?.length ? rp.images : [(rp as any).image].filter(Boolean);
                const rpWish   = isWishlisted(rp.id);
                return (
                  <div
                    key={rp.id}
                    className="xpp3-rel"
                    style={{
                      borderRadius:"16px", overflow:"hidden",
                      background:card, border:`1px solid ${border}`,
                      boxShadow:"0 2px 8px rgba(0,0,0,.05)",
                      position:"relative",
                    }}
                  >
                    <Link to={`/product/${rp.id}`} style={{ textDecoration:"none", display:"block" }}>
                      <div style={{ aspectRatio:"3/4", overflow:"hidden", background: isDark?"#111826":"#eef1f8" }}>
                        <img
                          src={rpImages[0]}
                          alt={rp.name}
                          style={{ width:"100%", height:"100%", objectFit:"cover", transition:"transform .5s ease" }}
                        />
                      </div>
                      <div style={{ padding:"11px 13px 14px" }}>
                        <h4 style={{ margin:"0 0 4px", fontSize:"12px", fontWeight:800, color:tPri, textTransform:"uppercase", letterSpacing:"0.03em", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                          {rp.name}
                        </h4>
                        <div style={{ display:"flex", alignItems:"center", gap:"8px" }}>
                          <span className="xpp3-hl" style={{ fontSize:"15px", fontWeight:900, color:acc }}>
                            ₹{rp.price.toLocaleString("en-IN")}
                          </span>
                          {(rp as any).originalPrice && (
                            <span style={{ fontSize:"11px", color:tTer, textDecoration:"line-through" }}>
                              ₹{(rp as any).originalPrice}
                            </span>
                          )}
                        </div>
                      </div>
                    </Link>
                    {/* Wishlist on related */}
                    <button
                      className="xpp3-heart"
                      onClick={(e) => {
                        e.preventDefault();
                        const willBe = !rpWish;
                        toggleWishlist(rp.id);
                        showToast(
                          rpImages[0],
                          rp.name,
                          willBe ? "❤️ Added to wishlist" : "✕ Removed from wishlist",
                          willBe ? "#e11d48" : "#6b7280",
                          "rel-wish-toast"
                        );
                      }}
                      style={{
                        position:"absolute", top:"10px", right:"10px",
                        width:"32px", height:"32px", borderRadius:"50%",
                        background: rpWish ? "rgba(225,29,72,.9)" : "rgba(255,255,255,.9)",
                        border:"none", cursor:"pointer",
                        display:"flex", alignItems:"center", justifyContent:"center",
                        boxShadow:"0 2px 8px rgba(0,0,0,.14)",
                      }}
                    >
                      <HeartSVG filled={rpWish} color={rpWish?"#fff":"#888"} size={13} />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* ══════════════════════════════════════════════════════════
          MOBILE STICKY BAR
      ══════════════════════════════════════════════════════════ */}
      <div
        className="xpp3-sticky"
        style={{
          position:"fixed", bottom:0, left:0, right:0, zIndex:200,
          padding:"10px 14px",
          background: isDark ? "rgba(6,8,15,.96)" : "rgba(248,249,252,.96)",
          backdropFilter:"blur(16px)",
          borderTop:`1px solid ${border}`,
          gap:"8px", alignItems:"center",
          boxShadow:"0 -4px 24px rgba(0,0,0,.1)",
        }}
      >
        {/* Wishlist */}
        <button
          className="xpp3-heart"
          onClick={handleWishlist}
          style={{
            width:"48px", height:"48px", borderRadius:"12px", flexShrink:0,
            border:`2px solid ${wishlisted ? "#e11d48" : border}`,
            background: wishlisted ? "rgba(225,29,72,.08)" : "transparent",
            display:"flex", alignItems:"center", justifyContent:"center",
          }}
        >
          <HeartSVG filled={wishlisted} color={wishlisted?"#e11d48":tSec} size={19} />
        </button>

        {/* Add to cart */}
        <button
          className="xpp3-btn"
          onClick={handleAddToCart}
          style={{
            flex:1, height:"48px", borderRadius:"12px",
            background:`linear-gradient(135deg,${acc},#4f46e5)`,
            color:"#fff", fontWeight:800, fontSize:"13px",
            border:"none", letterSpacing:"0.06em", textTransform:"uppercase",
            boxShadow:`0 4px 16px ${acc}44`,
            display:"flex", alignItems:"center", justifyContent:"center", gap:"6px",
          }}
        >
          <CartSVG size={15} /> Add to Cart
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────
//  SVG ICONS
// ─────────────────────────────────────────────────────────────────────
function HeartSVG({ filled, color = "#888", size = 18 }: { filled:boolean; color?:string; size?:number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24"
      fill={filled ? color : "none"}
      stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
    </svg>
  );
}

function CartSVG({ size = 18 }: { size?:number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
    </svg>
  );
}