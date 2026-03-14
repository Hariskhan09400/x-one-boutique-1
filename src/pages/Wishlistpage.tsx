import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { products } from "../data/products";
import { useWishlist } from "../App";
import { useCart } from "../App";
import { Heart, ShoppingCart, Trash2, ArrowLeft } from "lucide-react";

function useIsDark() {
  const [d, setD] = useState(false);
  useEffect(() => {
    const check = () => setD(document.documentElement.classList.contains("dark") || window.matchMedia("(prefers-color-scheme:dark)").matches);
    check();
    const obs = new MutationObserver(check);
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => obs.disconnect();
  }, []);
  return d;
}

export default function WishlistPage() {
  const isDark = useIsDark();
  const { wishlist, toggleWishlist } = useWishlist();
  const { addToCart } = useCart();
  const [addedId, setAddedId] = useState<string | null>(null);

  const wishlistProducts = products.filter(p => wishlist.includes(p.id));

  const handleAddToCart = (product: any) => {
    addToCart(product);
    setAddedId(product.id);
    setTimeout(() => setAddedId(null), 1500);
  };

  const bg      = isDark ? "#06080f"                : "#f0f4ff";
  const cardBg  = isDark ? "rgba(255,255,255,.04)"  : "rgba(255,255,255,.95)";
  const cardBord= isDark ? "rgba(255,255,255,.07)"  : "rgba(15,23,42,.08)";
  const textPri = isDark ? "#f1f5f9"                : "#0f172a";
  const textSec = isDark ? "rgba(255,255,255,.5)"   : "rgba(15,23,42,.5)";

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Outfit:wght@400;600;700;900&display=swap');
        .wcard { transition: transform .22s ease, box-shadow .22s ease; }
        .wcard:hover { transform: translateY(-4px); box-shadow: 0 20px 48px rgba(0,0,0,.15) !important; }
        .wcard img { transition: transform .4s ease; }
        .wcard:hover img { transform: scale(1.05); }

        .pgrid {
          display: grid;
          grid-template-columns: repeat(2,1fr);
          gap: 14px;
        }
        @media(min-width:640px)  { .pgrid { grid-template-columns: repeat(3,1fr); gap:18px; } }
        @media(min-width:1024px) { .pgrid { grid-template-columns: repeat(4,1fr); gap:22px; } }
      `}</style>

      <div style={{ minHeight: "100vh", background: bg, fontFamily: "'Outfit',sans-serif", paddingBottom: "80px" }}>

        {/* Hero strip */}
        <div style={{ background: "linear-gradient(135deg,#7f1d1d 0%,#ef4444 60%,#f97316 100%)", padding: "48px 24px 36px", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 50% 100%,rgba(255,255,255,.08) 0%,transparent 70%)" }} />
          <div style={{ maxWidth: "1280px", margin: "0 auto", position: "relative" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px" }}>
              <Link to="/shop" style={{ display: "flex", alignItems: "center", gap: "6px", color: "rgba(255,255,255,.7)", fontSize: "13px", fontWeight: 600, textDecoration: "none" }}>
                <ArrowLeft size={14} /> Back to Shop
              </Link>
            </div>
            <h1 style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: "clamp(36px,7vw,72px)", color: "#fff", letterSpacing: "0.02em", margin: "0 0 6px", display: "flex", alignItems: "center", gap: "16px" }}>
              MY <span style={{ color: "#fca5a5" }}>WISHLIST</span>
              <Heart size={40} fill="#fca5a5" color="#fca5a5" />
            </h1>
            <p style={{ fontSize: "14px", color: "rgba(255,255,255,.65)", margin: 0 }}>
              {wishlistProducts.length} saved item{wishlistProducts.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>

        <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "32px 16px 0" }}>

          {/* Empty state */}
          {wishlistProducts.length === 0 ? (
            <div style={{ textAlign: "center", padding: "80px 24px" }}>
              <div style={{ width: "80px", height: "80px", borderRadius: "24px", background: isDark ? "rgba(239,68,68,.1)" : "rgba(239,68,68,.08)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
                <Heart size={36} color="#ef4444" />
              </div>
              <p style={{ fontWeight: 800, fontSize: "18px", color: textPri, marginBottom: "8px" }}>Your wishlist is empty</p>
              <p style={{ fontSize: "14px", color: textSec, marginBottom: "24px" }}>Save items you love and come back to them anytime!</p>
              <Link to="/shop" style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "13px 28px", borderRadius: "14px", background: "linear-gradient(135deg,#2563eb,#4f46e5)", color: "#fff", fontWeight: 700, fontSize: "14px", textDecoration: "none", boxShadow: "0 8px 24px rgba(37,99,235,.4)" }}>
                <ShoppingCart size={16} /> Browse Products
              </Link>
            </div>
          ) : (
            <>
              {/* Clear all */}
              <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "20px" }}>
                <button
                  onClick={() => wishlist.forEach(id => toggleWishlist(id))}
                  style={{ display: "flex", alignItems: "center", gap: "6px", padding: "8px 16px", borderRadius: "10px", background: "rgba(239,68,68,.08)", border: "1px solid rgba(239,68,68,.2)", color: "#ef4444", fontSize: "12px", fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}
                >
                  <Trash2 size={13} /> Clear All
                </button>
              </div>

              <div className="pgrid">
                {wishlistProducts.map(product => {
                  const img = product.images?.[0] || "https://placehold.co/400x500?text=No+Image";
                  const isAdded = addedId === product.id;
                  const hasDiscount = (product as any).originalPrice && (product as any).originalPrice > product.price;
                  const discount = hasDiscount ? Math.round((((product as any).originalPrice - product.price) / (product as any).originalPrice) * 100) : 0;

                  return (
                    <div key={product.id} className="wcard" style={{ borderRadius: "20px", overflow: "hidden", background: cardBg, border: `1px solid ${cardBord}`, backdropFilter: "blur(12px)", boxShadow: isDark ? "0 4px 20px rgba(0,0,0,.3)" : "0 4px 20px rgba(0,0,0,.06)" }}>
                      {/* Image */}
                      <Link to={`/product/${product.id}`} style={{ display: "block", position: "relative", overflow: "hidden", aspectRatio: "3/4", background: isDark ? "#111" : "#f8fafc" }}>
                        <img src={img} alt={product.name} style={{ width: "100%", height: "100%", objectFit: "cover" }}
                          onError={e => { (e.target as HTMLImageElement).src = "https://placehold.co/400x500/1e3a8a/white?text=XOB"; }}
                          loading="lazy" />

                        {hasDiscount && (
                          <div style={{ position: "absolute", top: "10px", left: "10px", background: "#ef4444", color: "#fff", fontSize: "11px", fontWeight: 800, padding: "3px 8px", borderRadius: "8px" }}>
                            -{discount}%
                          </div>
                        )}

                        {/* Remove from wishlist */}
                        <button
                          onClick={e => { e.preventDefault(); toggleWishlist(product.id); }}
                          aria-label="Remove from wishlist"
                          style={{ position: "absolute", top: "10px", right: "10px", width: "34px", height: "34px", borderRadius: "50%", background: "rgba(239,68,68,.9)", backdropFilter: "blur(8px)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "transform .2s", }}
                          onMouseEnter={e => (e.currentTarget.style.transform = "scale(1.15)")}
                          onMouseLeave={e => (e.currentTarget.style.transform = "scale(1)")}
                        >
                          <Heart size={15} fill="#fff" color="#fff" />
                        </button>
                      </Link>

                      {/* Info */}
                      <div style={{ padding: "14px 14px 16px" }}>
                        <Link to={`/product/${product.id}`} style={{ textDecoration: "none" }}>
                          <p style={{ fontSize: "13px", fontWeight: 700, color: textPri, lineHeight: 1.4, marginBottom: "6px", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                            {product.name}
                          </p>
                        </Link>

                        <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "12px" }}>
                          <span style={{ fontWeight: 800, fontSize: "15px", color: "#2563eb" }}>₹{product.price.toLocaleString()}</span>
                          {hasDiscount && (
                            <span style={{ fontSize: "12px", color: textSec, textDecoration: "line-through" }}>
                              ₹{(product as any).originalPrice.toLocaleString()}
                            </span>
                          )}
                        </div>

                        {/* Add to cart */}
                        <button
                          onClick={() => handleAddToCart(product)}
                          style={{
                            width: "100%", padding: "10px", borderRadius: "12px", border: "none",
                            background: isAdded ? "#16a34a" : "#2563eb",
                            color: "#fff", fontSize: "12px", fontWeight: 800, fontFamily: "inherit",
                            cursor: "pointer", letterSpacing: "0.04em",
                            display: "flex", alignItems: "center", justifyContent: "center", gap: "6px",
                            transition: "background .2s",
                          }}
                        >
                          {isAdded ? (
                            <><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg> ADDED!</>
                          ) : (
                            <><ShoppingCart size={13} /> ADD TO CART</>
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Continue shopping */}
              <div style={{ textAlign: "center", marginTop: "40px" }}>
                <Link to="/shop" style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "13px 28px", borderRadius: "14px", background: "linear-gradient(135deg,#2563eb,#4f46e5)", color: "#fff", fontWeight: 700, fontSize: "14px", textDecoration: "none", boxShadow: "0 8px 24px rgba(37,99,235,.4)" }}>
                  <ShoppingCart size={16} /> Continue Shopping
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}