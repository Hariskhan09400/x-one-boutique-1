// src/components/ProductCard.tsx
// ══════════════════════════════════════════════════════════════════
//  X ONE BOUTIQUE — Product Card v3.0
//  ✅ SINGLE toast only (image + name + status) — no duplicate
//  ✅ Image swipe on mobile (touch left/right changes photo)
//  ✅ Wishlist heart — single clean toast
//  ✅ Size picker popup → Add to Cart → single clean toast
//  ✅ Dark / Light mode
//  ✅ Mobile + Desktop friendly
// ══════════════════════════════════════════════════════════════════

import React, { useState, useCallback, useRef } from "react";
import { Link } from "react-router-dom";
import { Product } from "../types";
import { useWishlist } from "../App";
import toast from "react-hot-toast";

interface ProductCardProps {
  product:      Product;
  onAddToCart:  (product: Product, size?: string) => void;
  onOpenModal?: (product: Product) => void;
}

const SIZES = ["S", "M", "L", "XL", "XXL"];

// ── Single toast — image + name + line2 (NO duplicate, dismiss old first)
function showCardToast(
  img: string,
  name: string,
  line2: string,
  line2Color: string,
  toastId: string
) {
  toast.dismiss(toastId);
  toast.custom(
    () => (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "11px",
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
            width: "40px",
            height: "40px",
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
    { duration: 2000, position: "bottom-center", id: toastId }
  );
}

// ─────────────────────────────────────────────────────────────────────
export function ProductCard({ product, onAddToCart }: ProductCardProps) {
  const { toggleWishlist, isWishlisted } = useWishlist();
  const wishlisted = isWishlisted(product.id);

  // images array
  const images = product.images?.length
    ? product.images
    : [(product as any).image].filter(Boolean);

  const [imgIdx,    setImgIdx]    = useState(0);
  const [showSizes, setShowSizes] = useState(false);
  const [adding,    setAdding]    = useState(false);
  const [imgFade,   setImgFade]   = useState(true);

  const touchX = useRef(0);
  const touchY = useRef(0);

  const discount =
    product.originalPrice && product.originalPrice > product.price
      ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
      : 0;

  // ── Change image with fade
  function changeImg(idx: number) {
    if (idx === imgIdx) return;
    setImgFade(false);
    setTimeout(() => {
      setImgIdx(idx);
      setImgFade(true);
    }, 120);
  }

  // ── Touch swipe (mobile image change)
  const onTouchStart = (e: React.TouchEvent) => {
    touchX.current = e.touches[0].clientX;
    touchY.current = e.touches[0].clientY;
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    const dx = e.changedTouches[0].clientX - touchX.current;
    const dy = e.changedTouches[0].clientY - touchY.current;
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 36) {
      e.preventDefault();
      if (dx < 0) changeImg((imgIdx + 1) % images.length);
      else        changeImg((imgIdx - 1 + images.length) % images.length);
    }
  };

  // ── Add to cart — SINGLE TOAST only
  const handleAdd = useCallback(
    (size: string, e: React.MouseEvent) => {
      e.stopPropagation();
      e.preventDefault();
      onAddToCart(product, size);
      setAdding(true);
      setShowSizes(false);
      setTimeout(() => setAdding(false), 1600);
      // ONE toast — dismiss any previous with same id
      showCardToast(
        images[0],
        product.name,
        `✓ Added to cart · Size ${size}`,
        "#16a34a",
        `cart-${product.id}`
      );
    },
    [product, onAddToCart, images]
  );

  // ── Wishlist — SINGLE TOAST only
  const handleWishlist = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      e.preventDefault();
      const willBe = !wishlisted;
      toggleWishlist(product.id);
      // ONE toast — dismiss any previous with same id
      showCardToast(
        images[0],
        product.name,
        willBe ? "❤️ Added to wishlist" : "✕ Removed from wishlist",
        willBe ? "#e11d48" : "#6b7280",
        `wish-${product.id}`
      );
    },
    [product, wishlisted, toggleWishlist, images]
  );

  // ── Cart btn click → show size picker
  const handleCartClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setShowSizes((s) => !s);
  }, []);

  return (
    <>
      <style>{`
        .xpc3-card {
          position: relative;
          border-radius: 16px;
          overflow: hidden;
          background: #fff;
          border: 1px solid rgba(0,0,0,.08);
          box-shadow: 0 2px 10px rgba(0,0,0,.06);
          transition: box-shadow .25s ease, transform .25s ease;
        }
        .dark .xpc3-card {
          background: #0d1120;
          border-color: rgba(255,255,255,.07);
          box-shadow: none;
        }
        .xpc3-card:hover {
          box-shadow: 0 12px 32px rgba(0,0,0,.13);
          transform: translateY(-3px);
        }
        .xpc3-img {
          width: 100%; height: 100%; object-fit: cover;
          transition: transform .5s ease, opacity .14s ease;
        }
        .xpc3-card:hover .xpc3-img { transform: scale(1.06); }

        .xpc3-heart { transition: transform .22s cubic-bezier(.34,1.56,.64,1); }
        .xpc3-heart:hover { transform: scale(1.22) !important; }
        .xpc3-heart:active { transform: scale(.86) !important; }

        .xpc3-sz {
          transition: all .18s cubic-bezier(.34,1.56,.64,1);
          border: 1.5px solid rgba(0,0,0,.12);
          background: transparent;
          cursor: pointer;
          font-weight: 800;
          font-size: 11px;
          border-radius: 8px;
          padding: 7px 0;
        }
        .dark .xpc3-sz { border-color: rgba(255,255,255,.14); color: #cbd5e1; }
        .xpc3-sz:hover { border-color:#2563eb !important; color:#2563eb !important; transform:scale(1.08); }
        .xpc3-sz:active { transform:scale(.94); }

        .xpc3-btn { transition:all .18s ease; cursor:pointer; }
        .xpc3-btn:hover { filter:brightness(1.1); transform:translateY(-1px); }
        .xpc3-btn:active { transform:scale(.96); }

        @keyframes xpc3-sizein {
          from { opacity:0; transform:translateY(10px) scale(.96); }
          to   { opacity:1; transform:translateY(0) scale(1); }
        }
        .xpc3-sizepop { animation: xpc3-sizein .2s cubic-bezier(.34,1.56,.64,1) both; }

        @keyframes xpc3-fade { from{opacity:0} to{opacity:1} }
        .xpc3-imgfade { animation: xpc3-fade .18s ease; }
      `}</style>

      <div className="xpc3-card">
        {/* ── IMAGE AREA ── */}
        <Link to={`/product/${product.id}`} style={{ display:"block", textDecoration:"none", userSelect:"none" }}>
          <div
            onTouchStart={onTouchStart}
            onTouchEnd={onTouchEnd}
            style={{ position:"relative", aspectRatio:"3/4", overflow:"hidden", background:"#eef1f8" }}
          >
            {/* Main image */}
            <img
              src={images[imgIdx] || images[0]}
              alt={product.name}
              className={`xpc3-img ${imgFade ? "xpc3-imgfade" : ""}`}
              draggable={false}
              style={{ opacity: imgFade ? 1 : 0 }}
            />

            {/* Bottom gradient */}
            <div style={{
              position:"absolute", bottom:0, left:0, right:0, height:"38%",
              background:"linear-gradient(to top,rgba(0,0,0,.36) 0%,transparent 100%)",
              pointerEvents:"none",
            }} />

            {/* Badges */}
            <div style={{ position:"absolute", top:"10px", left:"10px", display:"flex", flexDirection:"column", gap:"5px", zIndex:2 }}>
              {discount > 0 && (
                <span style={{ background:"#e11d48", color:"#fff", fontSize:"9px", fontWeight:800, padding:"3px 9px", borderRadius:"100px", letterSpacing:"0.04em" }}>
                  -{discount}%
                </span>
              )}
              <span style={{ background:"rgba(0,0,0,.62)", backdropFilter:"blur(6px)", color:"#fff", fontSize:"8px", fontWeight:700, padding:"3px 9px", borderRadius:"100px", letterSpacing:"0.07em", textTransform:"uppercase" }}>
                {product.category}
              </span>
            </div>

            {/* Wishlist heart */}
            <button
              className="xpc3-heart"
              onClick={handleWishlist}
              style={{
                position:"absolute", top:"10px", right:"10px", zIndex:2,
                width:"32px", height:"32px", borderRadius:"50%",
                background: wishlisted ? "rgba(225,29,72,.9)" : "rgba(255,255,255,.88)",
                backdropFilter:"blur(6px)",
                border:"none", display:"flex", alignItems:"center", justifyContent:"center",
                boxShadow:"0 2px 8px rgba(0,0,0,.15)",
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24"
                fill={wishlisted ? "#fff" : "none"}
                stroke={wishlisted ? "#fff" : "#666"}
                strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
              </svg>
            </button>

            {/* Image dots */}
            {images.length > 1 && (
              <div style={{
                position:"absolute", bottom:"9px", left:"50%", transform:"translateX(-50%)", zIndex:2,
                display:"flex", gap:"4px",
                background:"rgba(0,0,0,.22)", backdropFilter:"blur(4px)",
                padding:"4px 8px", borderRadius:"20px",
              }}>
                {images.map((_: any, i: number) => (
                  <div
                    key={i}
                    onClick={(e) => { e.preventDefault(); changeImg(i); }}
                    style={{
                      height:"4px",
                      width: imgIdx===i ? "14px" : "4px",
                      borderRadius:"4px",
                      background: imgIdx===i ? "#fff" : "rgba(255,255,255,.36)",
                      transition:"all .2s ease",
                      cursor:"pointer",
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        </Link>

        {/* ── INFO ── */}
        <div style={{ padding:"11px 13px 13px" }}>
          <Link to={`/product/${product.id}`} style={{ textDecoration:"none" }}>
            <h3 style={{
              margin:"0 0 4px",
              fontSize:"12px", fontWeight:800,
              textTransform:"uppercase", letterSpacing:"0.03em", lineHeight:1.3,
              overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap",
            }} className="text-slate-900 dark:text-slate-100">
              {product.name}
            </h3>
          </Link>

          <p style={{ margin:"0 0 9px", fontSize:"11px", lineHeight:1.55 }}
            className="text-slate-500 dark:text-slate-400 line-clamp-2">
            {product.description}
          </p>

          {/* Price + Cart row */}
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:"8px" }}>
            <div>
              {product.originalPrice && product.originalPrice > product.price && (
                <p style={{ margin:"0 0 1px", fontSize:"10px", fontWeight:600, textDecoration:"line-through" }}
                  className="text-slate-400">
                  ₹{product.originalPrice.toLocaleString("en-IN")}
                </p>
              )}
              <p style={{ margin:0, fontSize:"18px", fontWeight:900, color:"#2563eb", lineHeight:1.1, fontFamily:"'Barlow Condensed','Montserrat',sans-serif" }}>
                ₹{product.price.toLocaleString("en-IN")}
              </p>
            </div>

            <button
              className="xpc3-btn"
              onClick={handleCartClick}
              style={{
                display:"flex", alignItems:"center", gap:"5px",
                padding:"8px 13px", borderRadius:"10px",
                background: adding
                  ? "linear-gradient(135deg,#16a34a,#15803d)"
                  : "linear-gradient(135deg,#2563eb,#4f46e5)",
                color:"#fff", border:"none",
                fontSize:"11px", fontWeight:800,
                letterSpacing:"0.04em", textTransform:"uppercase",
                boxShadow: adding ? "0 4px 14px rgba(22,163,74,.35)" : "0 4px 14px rgba(37,99,235,.32)",
                whiteSpace:"nowrap",
              }}
            >
              {adding ? (
                <>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                  Added!
                </>
              ) : (
                <>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
                    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
                  </svg>
                  Add
                </>
              )}
            </button>
          </div>
        </div>

        {/* ── SIZE PICKER POPUP ── */}
        {showSizes && !adding && (
          <div
            className="xpc3-sizepop"
            style={{
              position:"absolute", bottom:0, left:0, right:0, zIndex:10,
              padding:"13px 13px 15px",
              borderTop:"1px solid rgba(0,0,0,.08)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Background blur overlay */}
            <div style={{
              position:"absolute", inset:0,
              background:"rgba(255,255,255,.97)",
              backdropFilter:"blur(20px)",
              zIndex:-1,
              borderRadius:"0 0 16px 16px",
            }} className="dark:!bg-[rgba(13,17,32,.97)]" />

            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"10px" }}>
              <span style={{ fontSize:"10px", fontWeight:800, letterSpacing:"0.1em", textTransform:"uppercase" }}
                className="text-slate-500 dark:text-slate-400">
                Select Size
              </span>
              <button
                onClick={(e) => { e.stopPropagation(); setShowSizes(false); }}
                style={{ background:"none", border:"none", cursor:"pointer", fontSize:"15px", lineHeight:1, padding:"2px 4px" }}
                className="text-slate-400"
              >
                ✕
              </button>
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(5,1fr)", gap:"6px" }}>
              {SIZES.map((sz) => (
                <button
                  key={sz}
                  className="xpc3-sz text-slate-700 dark:text-slate-300"
                  onClick={(e) => handleAdd(sz, e)}
                >
                  {sz}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default ProductCard;