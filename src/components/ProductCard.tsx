import React, { useState } from "react";
import { Product } from "../types";
import { ShoppingCart, X, CheckCircle2 } from "lucide-react";
import { Link } from "react-router-dom";

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
  onOpenModal: (product: Product) => void; 
}

// Destructure mein onOpenModal bhi add kiya taaki error na aaye
export function ProductCard({ product, onAddToCart, onOpenModal }: ProductCardProps) {
  const [open, setOpen] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  // ADD TO CART WITH POPUP LOGIC
  const handleAddWithFeedback = (e: React.MouseEvent) => {
    e.stopPropagation();
    onAddToCart(product);
    
    setIsAdding(true);
    setShowPopup(true);

    setTimeout(() => {
      setShowPopup(false);
      setIsAdding(false);
    }, 2000);
  };

  const discount =
    product.originalPrice &&
    Math.round(
      ((product.originalPrice - product.price) /
        product.originalPrice) *
        100
    );

  return (
    <>
      {/* ADDED NOTIFICATION POPUP */}
      <div className={`fixed top-24 left-1/2 -translate-x-1/2 z-[110] transition-all duration-500 transform ${showPopup ? 'translate-y-0 opacity-100' : '-translate-y-10 opacity-0 pointer-events-none'}`}>
        <div className="bg-blue-600 text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-blue-400/30 backdrop-blur-md">
          <CheckCircle2 size={20} className="text-cyan-300" />
          <span className="font-bold text-sm tracking-wide">Added to Cart!</span>
        </div>
      </div>

      <div
        className="group rounded-3xl overflow-hidden relative
        transition-all duration-700 ease-out
        bg-gradient-to-b from-slate-900/95 to-black/98
        border border-white/[0.06]
        shadow-[0_20px_60px_rgba(0,0,0,0.4)]
        hover:shadow-[0_30px_90px_rgba(212,175,55,0.12)]
        hover:border-white/[0.12]
        hover:-translate-y-3
        hover:scale-[1.02]"
      >
        {/* IMAGE SECTION */}
        <div className="relative w-full overflow-hidden aspect-[3/4]">
          <div className="flex overflow-x-auto snap-x snap-mandatory scroll-smooth no-scrollbar h-full">
            {product.images?.map((img, index) => (
              <Link key={index} to={`/product/${product.id}`} className="w-full flex-shrink-0 h-full">
                <img
                  src={img}
                  alt={product.name}
                  className="w-full h-full object-cover snap-start cursor-pointer
                  transition-transform duration-700 ease-out
                  group-hover:scale-110"
                />
              </Link>
            ))}
          </div>

          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent
            opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

          <div className="absolute top-4 left-4 px-4 py-2
            bg-black/40 backdrop-blur-xl rounded-full
            text-[10px] font-black tracking-[0.15em] text-white/90 uppercase
            border border-white/10">
            {product.category}
          </div>

          {discount && (
            <div className="absolute top-4 right-4 px-4 py-2
              bg-gradient-to-r from-amber-600 to-amber-500
              text-white text-xs font-black rounded-full
              shadow-[0_8px_32px_rgba(245,158,11,0.3)]
              animate-pulse">
              {discount}% OFF
            </div>
          )}
        </div>

        {/* CONTENT */}
        <div className="p-6 space-y-4">
          <h3 className="font-bold text-xl text-white tracking-tight
            transition-colors duration-300 group-hover:text-amber-400">
            {product.name}
          </h3>
          <p className="text-sm text-gray-400 line-clamp-2 leading-relaxed">
            {product.description}
          </p>

          {/* PRICE + BUTTON */}
          <div className="flex items-end justify-between pt-2">
            <div className="flex flex-col gap-1">
              {product.originalPrice && (
                <span className="text-sm text-gray-500 line-through">₹{product.originalPrice}</span>
              )}
              <span className="text-3xl font-black bg-gradient-to-r from-amber-400 to-amber-200
                bg-clip-text text-transparent">
                ₹{product.price}
              </span>
            </div>

            <button
              onClick={handleAddWithFeedback}
              disabled={isAdding}
              className={`relative flex items-center gap-2 px-6 py-3.5 rounded-2xl
                font-bold text-sm tracking-wide uppercase
                transition-all duration-500
                overflow-hidden group/btn
                ${isAdding
                  ? "bg-gradient-to-r from-emerald-600 to-emerald-500 text-white scale-105 shadow-[0_12px_40px_rgba(16,185,129,0.4)]"
                  : "bg-gradient-to-r from-slate-100 to-white text-slate-900 hover:scale-105 shadow-[0_12px_40px_rgba(255,255,255,0.15)] hover:shadow-[0_16px_60px_rgba(255,255,255,0.25)]"
              }`}
            >
              <span className="absolute inset-0 bg-gradient-to-r from-amber-500/0 via-amber-500/30 to-amber-500/0
                translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-1000" />
              {isAdding ? (
                <>
                  <CheckCircle2 size={18} className="relative z-10" />
                  <span className="relative z-10">Added</span>
                </>
              ) : (
                <>
                  <ShoppingCart size={18} className="relative z-10" />
                  <span className="relative z-10">Add</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* FULL SCREEN MODAL (Video check removed) */}
      {open && (
        <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center">
          <button onClick={() => setOpen(false)} className="absolute top-6 right-6 text-white hover:text-red-400">
            <X size={32} />
          </button>
          <div className="w-full max-w-4xl overflow-hidden">
            <div className="flex overflow-x-auto snap-x snap-mandatory scroll-smooth no-scrollbar">
              {product.images?.map((img, index) => (
                <img key={index} src={img} alt={product.name} className="w-full max-h-[85vh] object-contain snap-start flex-shrink-0" />
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}