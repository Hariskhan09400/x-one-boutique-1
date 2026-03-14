import { useState, useEffect, useMemo, useCallback } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { products } from "../data/products";
import { useCart } from "../App";
import { useWishlist } from "../App";

/* ─────────────────────────────────────────────────────────────────────────────
   ShopPage.tsx — X One Boutique
   • Category tabs (All + every category)
   • URL param sync: /shop?cat=Jeans
   • Search bar
   • Sort: Price Low→High / High→Low / Newest
   • Mobile 2-col, Tablet 3-col, Desktop 4-col grid
   • Dark / Light mode auto
   ───────────────────────────────────────────────────────────────────────────── */

const CATEGORIES = [
  "All",
  "T-Shirts",
  "Shirts",
  "Jeans",
  "Kurta",
  "Denim Jackets",
  "Coats",
  "Belts",
  "jubba",
];

function useIsDark() {
  const [d, setD] = useState(false);
  useEffect(() => {
    const check = () =>
      setD(
        document.documentElement.classList.contains("dark") ||
          window.matchMedia("(prefers-color-scheme:dark)").matches
      );
    check();
    const obs = new MutationObserver(check);
    obs.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => obs.disconnect();
  }, []);
  return d;
}

export default function ShopPage() {
  const isDark = useIsDark();
  const [searchParams, setSearchParams] = useSearchParams();
  const { addToCart } = useCart();
  const { toggleWishlist, isWishlisted } = useWishlist();

  const urlCat = searchParams.get("cat") || "All";
  const [activeCategory, setActiveCategory] = useState(
    CATEGORIES.includes(urlCat) ? urlCat : "All"
  );
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<"default" | "low" | "high">("default");
  const [addedId, setAddedId] = useState<string | null>(null);

  // sync URL → state
  useEffect(() => {
    const c = searchParams.get("cat") || "All";
    setActiveCategory(CATEGORIES.includes(c) ? c : "All");
  }, [searchParams]);

  const handleCategory = useCallback(
    (cat: string) => {
      setActiveCategory(cat);
      setSearch("");
      if (cat === "All") setSearchParams({});
      else setSearchParams({ cat });
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
    [setSearchParams]
  );

  const handleAddToCart = useCallback(
    (product: any) => {
      addToCart(product);
      setAddedId(product.id);
      setTimeout(() => setAddedId(null), 1500);
    },
    [addToCart]
  );

  const filtered = useMemo(() => {
    let list =
      activeCategory === "All"
        ? products
        : products.filter((p) => p.category === activeCategory);

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q)
      );
    }

    if (sort === "low") list = [...list].sort((a, b) => a.price - b.price);
    else if (sort === "high")
      list = [...list].sort((a, b) => b.price - a.price);

    return list;
  }, [activeCategory, search, sort]);

  // ── Theme tokens ──────────────────────────────────────────────────────────
  const bg       = isDark ? "#06080f"                : "#f0f4ff";
  const cardBg   = isDark ? "rgba(255,255,255,.04)"  : "rgba(255,255,255,.95)";
  const cardBord = isDark ? "rgba(255,255,255,.07)"  : "rgba(15,23,42,.08)";
  const textPri  = isDark ? "#f1f5f9"                : "#0f172a";
  const textSec  = isDark ? "rgba(255,255,255,.5)"   : "rgba(15,23,42,.5)";
  const inputBg  = isDark ? "rgba(255,255,255,.06)"  : "rgba(255,255,255,.9)";
  const inputBord= isDark ? "rgba(255,255,255,.1)"   : "rgba(15,23,42,.12)";
  const pillBg   = isDark ? "rgba(255,255,255,.06)"  : "rgba(15,23,42,.06)";
  const pillBord = isDark ? "rgba(255,255,255,.1)"   : "rgba(15,23,42,.1)";

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Outfit:wght@400;500;600;700;900&display=swap');
        .xshop *, .xshop *::before, .xshop *::after { box-sizing: border-box; }
        .xshop { font-family: 'Outfit', sans-serif; }
        .xbb   { font-family: 'Bebas Neue', sans-serif; }

        /* cat scroll */
        .catbar::-webkit-scrollbar { display:none; }
        .catbar { -ms-overflow-style:none; scrollbar-width:none; }

        /* card hover */
        .pcard {
          transition: transform .22s ease, box-shadow .22s ease;
        }
        .pcard:hover {
          transform: translateY(-5px);
          box-shadow: 0 20px 48px rgba(0,0,0,.18) !important;
        }

        /* image zoom */
        .pcard img {
          transition: transform .4s ease;
        }
        .pcard:hover img {
          transform: scale(1.06);
        }

        /* wish btn */
        .wish-btn {
          transition: transform .2s ease, background .2s ease;
        }
        .wish-btn:hover { transform: scale(1.15); }

        /* cart btn */
        .cart-btn {
          transition: all .18s ease;
        }
        .cart-btn:hover {
          background: #1d4ed8 !important;
          transform: translateY(-1px);
        }
        .cart-btn:active { transform: scale(.97); }

        /* grid */
        .pgrid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 14px;
        }
        @media(min-width: 640px)  { .pgrid { grid-template-columns: repeat(3,1fr); gap:18px; } }
        @media(min-width: 1024px) { .pgrid { grid-template-columns: repeat(4,1fr); gap:22px; } }

        @keyframes added {
          0%   { transform:scale(1); }
          50%  { transform:scale(1.05); background:#16a34a; }
          100% { transform:scale(1); }
        }
        .btn-added { animation: added .4s ease; }
      `}</style>

      <div
        className="xshop"
        style={{ minHeight: "100vh", background: bg, paddingBottom: "80px" }}
      >
        {/* ── HERO STRIP ── */}
        <div
          style={{
            background:
              "linear-gradient(135deg,#1e3a8a 0%,#2563eb 60%,#4f46e5 100%)",
            padding: "48px 24px 36px",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "radial-gradient(ellipse at 50% 100%,rgba(255,255,255,.08) 0%,transparent 70%)",
            }}
          />
          <div
            style={{ maxWidth: "1280px", margin: "0 auto", position: "relative" }}
          >
            <h1
              className="xbb"
              style={{
                fontSize: "clamp(36px,7vw,72px)",
                color: "#fff",
                letterSpacing: "0.02em",
                margin: "0 0 6px",
              }}
            >
              OUR <span style={{ color: "#93c5fd" }}>COLLECTION</span>
            </h1>
            <p
              style={{
                fontSize: "14px",
                color: "rgba(255,255,255,.65)",
                margin: 0,
              }}
            >
              {filtered.length} product{filtered.length !== 1 ? "s" : ""}{" "}
              {activeCategory !== "All" ? `in ${activeCategory}` : "available"}
            </p>
          </div>
        </div>

        <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "0 16px" }}>

          {/* ── CATEGORY TABS ── */}
          <div
            className="catbar"
            style={{
              display: "flex",
              gap: "8px",
              overflowX: "auto",
              padding: "20px 0 4px",
            }}
          >
            {CATEGORIES.map((cat) => {
              const on = activeCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => handleCategory(cat)}
                  style={{
                    flexShrink: 0,
                    padding: "9px 18px",
                    borderRadius: "30px",
                    fontSize: "13px",
                    fontWeight: 700,
                    fontFamily: "inherit",
                    cursor: "pointer",
                    border: on
                      ? "1px solid #2563eb"
                      : `1px solid ${pillBord}`,
                    background: on ? "#2563eb" : pillBg,
                    color: on ? "#fff" : textSec,
                    boxShadow: on
                      ? "0 4px 16px rgba(37,99,235,.4)"
                      : "none",
                    transition: "all .2s ease",
                  }}
                >
                  {cat}
                </button>
              );
            })}
          </div>

          {/* ── SEARCH + SORT ── */}
          <div
            style={{
              display: "flex",
              gap: "10px",
              margin: "16px 0 24px",
              flexWrap: "wrap",
            }}
          >
            {/* Search */}
            <div style={{ flex: 1, minWidth: "200px", position: "relative" }}>
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke={textSec}
                strokeWidth="2.5"
                strokeLinecap="round"
                style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}
              >
                <circle cx="11" cy="11" r="8" />
                <path d="M21 21l-4.35-4.35" />
              </svg>
              <input
                type="text"
                placeholder="Search products..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{
                  width: "100%",
                  padding: "11px 16px 11px 40px",
                  borderRadius: "14px",
                  background: inputBg,
                  border: `1.5px solid ${inputBord}`,
                  color: textPri,
                  fontSize: "14px",
                  fontFamily: "inherit",
                  outline: "none",
                }}
                onFocus={(e) => (e.target.style.borderColor = "#2563eb")}
                onBlur={(e) => (e.target.style.borderColor = inputBord)}
              />
            </div>

            {/* Sort */}
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as any)}
              style={{
                padding: "11px 16px",
                borderRadius: "14px",
                background: inputBg,
                border: `1.5px solid ${inputBord}`,
                color: textPri,
                fontSize: "13px",
                fontFamily: "inherit",
                fontWeight: 600,
                outline: "none",
                cursor: "pointer",
                minWidth: "160px",
              }}
            >
              <option value="default">Sort: Default</option>
              <option value="low">Price: Low → High</option>
              <option value="high">Price: High → Low</option>
            </select>
          </div>

          {/* ── PRODUCT GRID ── */}
          {filtered.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                padding: "80px 24px",
                color: textSec,
              }}
            >
              <div
                style={{
                  fontSize: "48px",
                  marginBottom: "16px",
                }}
              >
                🔍
              </div>
              <p
                style={{
                  fontWeight: 700,
                  fontSize: "16px",
                  color: textPri,
                  marginBottom: "8px",
                }}
              >
                No products found
              </p>
              <p style={{ fontSize: "14px" }}>
                Try a different search or category
              </p>
            </div>
          ) : (
            <div className="pgrid">
              {filtered.map((product) => {
                const img =
                  product.images?.[0] || "https://placehold.co/400x500?text=No+Image";
                const wishlisted = isWishlisted(product.id);
                const isAdded = addedId === product.id;
                const hasDiscount =
                  (product as any).originalPrice &&
                  (product as any).originalPrice > product.price;
                const discount = hasDiscount
                  ? Math.round(
                      (((product as any).originalPrice - product.price) /
                        (product as any).originalPrice) *
                        100
                    )
                  : 0;

                return (
                  <div
                    key={product.id}
                    className="pcard"
                    style={{
                      borderRadius: "20px",
                      overflow: "hidden",
                      background: cardBg,
                      border: `1px solid ${cardBord}`,
                      backdropFilter: "blur(12px)",
                      boxShadow: isDark
                        ? "0 4px 20px rgba(0,0,0,.3)"
                        : "0 4px 20px rgba(0,0,0,.06)",
                    }}
                  >
                    {/* Image */}
                    <Link
                      to={`/product/${product.id}`}
                      style={{
                        display: "block",
                        position: "relative",
                        overflow: "hidden",
                        aspectRatio: "3/4",
                        background: isDark ? "#111" : "#f8fafc",
                      }}
                    >
                      <img
                        src={img}
                        alt={product.name}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            "https://placehold.co/400x500/1e3a8a/white?text=XOB";
                        }}
                        loading="lazy"
                      />

                      {/* Discount badge */}
                      {hasDiscount && (
                        <div
                          style={{
                            position: "absolute",
                            top: "10px",
                            left: "10px",
                            background: "#ef4444",
                            color: "#fff",
                            fontSize: "11px",
                            fontWeight: 800,
                            padding: "3px 8px",
                            borderRadius: "8px",
                          }}
                        >
                          -{discount}%
                        </div>
                      )}

                      {/* Category badge */}
                      <div
                        style={{
                          position: "absolute",
                          bottom: "10px",
                          left: "10px",
                          background: "rgba(37,99,235,.85)",
                          backdropFilter: "blur(8px)",
                          color: "#fff",
                          fontSize: "10px",
                          fontWeight: 700,
                          padding: "3px 8px",
                          borderRadius: "8px",
                          letterSpacing: "0.04em",
                        }}
                      >
                        {product.category}
                      </div>

                      {/* Wishlist */}
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          toggleWishlist(product.id);
                        }}
                        className="wish-btn"
                        aria-label="Wishlist"
                        style={{
                          position: "absolute",
                          top: "10px",
                          right: "10px",
                          width: "34px",
                          height: "34px",
                          borderRadius: "50%",
                          background: wishlisted
                            ? "rgba(239,68,68,.9)"
                            : "rgba(255,255,255,.85)",
                          backdropFilter: "blur(8px)",
                          border: "none",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <svg
                          width="15"
                          height="15"
                          viewBox="0 0 24 24"
                          fill={wishlisted ? "#fff" : "none"}
                          stroke={wishlisted ? "#fff" : "#0f172a"}
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                        </svg>
                      </button>
                    </Link>

                    {/* Info */}
                    <div style={{ padding: "14px 14px 16px" }}>
                      <Link
                        to={`/product/${product.id}`}
                        style={{ textDecoration: "none" }}
                      >
                        <p
                          style={{
                            fontSize: "13px",
                            fontWeight: 700,
                            color: textPri,
                            lineHeight: 1.4,
                            marginBottom: "6px",
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                          }}
                        >
                          {product.name}
                        </p>
                      </Link>

                      {/* Price row */}
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                          marginBottom: "12px",
                        }}
                      >
                        <span
                          style={{
                            fontWeight: 800,
                            fontSize: "15px",
                            color: "#2563eb",
                          }}
                        >
                          ₹{product.price.toLocaleString()}
                        </span>
                        {hasDiscount && (
                          <span
                            style={{
                              fontSize: "12px",
                              color: textSec,
                              textDecoration: "line-through",
                            }}
                          >
                            ₹{(product as any).originalPrice.toLocaleString()}
                          </span>
                        )}
                      </div>

                      {/* Add to Cart */}
                      <button
                        onClick={() => handleAddToCart(product)}
                        className={`cart-btn${isAdded ? " btn-added" : ""}`}
                        style={{
                          width: "100%",
                          padding: "10px",
                          borderRadius: "12px",
                          border: "none",
                          background: isAdded ? "#16a34a" : "#2563eb",
                          color: "#fff",
                          fontSize: "12px",
                          fontWeight: 800,
                          fontFamily: "inherit",
                          cursor: "pointer",
                          letterSpacing: "0.04em",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: "6px",
                        }}
                      >
                        {isAdded ? (
                          <>
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                            ADDED!
                          </>
                        ) : (
                          <>
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                              <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
                              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                            </svg>
                            ADD TO CART
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Result count bottom */}
          {filtered.length > 0 && (
            <p
              style={{
                textAlign: "center",
                marginTop: "40px",
                fontSize: "13px",
                color: textSec,
                fontWeight: 600,
              }}
            >
              Showing {filtered.length} of {products.length} products
            </p>
          )}
        </div>
      </div>
    </>
  );
}