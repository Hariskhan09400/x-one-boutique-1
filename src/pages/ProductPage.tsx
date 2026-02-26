import { useParams, Link } from "react-router-dom";
import { products } from "../data/products";
import { useState, useEffect } from "react";
import ReviewSection from "../components/ReviewSection"; // <-- Naya component call kiya

interface ProductPageProps {
  onAddToCart: (product: any) => void;
}

const ProductPage = ({ onAddToCart }: ProductPageProps) => {
  const { id } = useParams();
  const product = products.find((p) => p.id === id);

  const relatedProducts = products
    .filter((p) => p.category === product?.category && p.id !== id)
    .slice(0, 4);

  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [showToast, setShowToast] = useState(false);

  // User info fetch kar rahe hain prop pass karne ke liye
  const user = JSON.parse(localStorage.getItem("xob_user") || "null");

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  if (!product) return <h2 className="p-6 text-center text-red-500 font-bold">Product not found</h2>;

  const nextImage = () => {
    setSelectedImage((prev) => (prev + 1) % product.images.length);
  };

  const prevImage = () => {
    setSelectedImage((prev) => (prev - 1 + product.images.length) % product.images.length);
  };

  const handleBuyNow = () => {
    const message = `Hello, I want to buy:
Product: ${product.name}
Size: ${selectedSize || "Not selected"}
Quantity: ${quantity}
Total: ₹${product.price * quantity}`;
    window.open(`https://wa.me/917208428589?text=${encodeURIComponent(message)}`, "_blank");
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#020617] transition-colors duration-500 pb-12 font-sans">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-12 text-slate-900 dark:text-white">

        {/* ================= PRODUCT SECTION ================= */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
          <div className="space-y-6">
            <div className="relative group aspect-[4/5] overflow-hidden rounded-[2.5rem] bg-slate-50 dark:bg-slate-900 shadow-2xl border border-slate-100 dark:border-white/5">
              <img
                key={selectedImage}
                src={product.images[selectedImage]}
                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                alt={product.name}
              />

              {product.images.length > 1 && (
                <>
                  <button onClick={prevImage} className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/20 dark:bg-black/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-2xl transition-all hover:bg-white/40 dark:hover:bg-black/40 active:scale-90 z-10 opacity-0 group-hover:opacity-100">
                    <span className="mb-1 mr-0.5 text-blue-600">‹</span>
                  </button>
                  <button onClick={nextImage} className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/20 dark:bg-black/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-2xl transition-all hover:bg-white/40 dark:hover:bg-black/40 active:scale-90 z-10 opacity-0 group-hover:opacity-100">
                    <span className="mb-1 ml-0.5 text-blue-600">›</span>
                  </button>
                  <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-1.5 bg-black/20 backdrop-blur-sm px-3 py-1.5 rounded-full">
                    {product.images.map((_, i) => (
                      <div key={i} className={`h-1.5 rounded-full transition-all ${selectedImage === i ? "w-6 bg-blue-500" : "w-1.5 bg-white/50"}`} />
                    ))}
                  </div>
                </>
              )}
            </div>
            
            <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
              {product.images.map((img, index) => (
                <div key={index} onClick={() => setSelectedImage(index)} className={`relative min-w-[85px] h-24 rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 border-2 ${selectedImage === index ? "border-blue-600 scale-95" : "border-transparent opacity-50 hover:opacity-100"}`}>
                  <img src={img} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col pt-4">
            <h1 className="text-5xl sm:text-7xl font-black tracking-tight mb-4 uppercase italic leading-[0.9]">
              {product.name}
            </h1>
            
            <div className="flex items-center gap-4 mb-6">
              <span className="text-[10px] font-black uppercase text-green-500 tracking-widest flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" /> Verified Stock
              </span>
            </div>

            <p className="text-slate-500 dark:text-slate-400 text-lg leading-relaxed mb-8">{product.description}</p>

            <div className="flex items-baseline gap-4 mb-10">
              <span className="text-6xl font-black text-blue-600 dark:text-blue-500 tracking-tighter">₹{product.price}</span>
              <span className="text-slate-300 line-through text-2xl font-bold opacity-50">₹{product.price + 500}</span>
            </div>

            <div className="mb-10 space-y-4">
              <h3 className="font-black text-[10px] uppercase tracking-[0.2em] text-slate-400">Choose Size</h3>
              <div className="flex flex-wrap gap-3">
                {["S", "M", "L", "XL"].map((size) => (
                  <button key={size} onClick={() => setSelectedSize(size)} className={`h-16 w-16 rounded-2xl font-black transition-all border-2 active:scale-90 ${selectedSize === size ? "bg-slate-900 border-slate-900 text-white dark:bg-blue-600 dark:border-blue-600 shadow-xl" : "border-slate-100 dark:border-white/5 text-slate-400 hover:border-blue-500"}`}>
                    {size}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-4 mb-12">
              <div className="flex items-center gap-4">
                <div className="flex items-center bg-slate-50 dark:bg-white/5 rounded-2xl p-1 border border-slate-100 dark:border-white/5">
                  <button onClick={() => setQuantity((q) => Math.max(1, q - 1))} className="w-12 h-12 flex items-center justify-center text-xl font-black">-</button>
                  <span className="w-12 text-center font-black">{quantity}</span>
                  <button onClick={() => setQuantity((q) => q + 1)} className="w-12 h-12 flex items-center justify-center text-xl font-black">+</button>
                </div>
                <button
                  onClick={() => {
                    if (!selectedSize) { alert("Please select a size"); return; }
                    onAddToCart({ ...product, selectedSize, quantity });
                    setShowToast(true); setTimeout(() => setShowToast(false), 2000);
                  }}
                  className="flex-1 bg-blue-600 text-white h-14 rounded-2xl font-black uppercase tracking-widest active:scale-95 shadow-lg shadow-blue-500/20"
                >
                  Add To Cart
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ================= REVIEWS SECTION (NEW COMPONENT) ================= */}
        <div className="mt-24 max-w-4xl mx-auto border-t border-slate-100 dark:border-white/5 pt-16">
          <h2 className="text-3xl font-black uppercase italic mb-10 text-center tracking-tighter">Customer Experience</h2>
          
          {/* Naya Component Call: Ab saara data Backend se aayega */}
          <ReviewSection productId={product.id} user={user} />
        </div>

        {/* ================= BUY NOW CARD ================= */}
        <div className="mt-16">
          <div className="relative overflow-hidden bg-slate-900 dark:bg-blue-600 rounded-[2.5rem] p-8 sm:p-12 shadow-2xl border border-white/10">
            <div className="relative flex flex-col sm:flex-row items-center justify-between gap-8">
              <div className="text-center sm:text-left">
                <h3 className="text-white text-3xl font-black uppercase tracking-tighter mb-1 italic leading-none">Ready to Buy?</h3>
                <p className="text-white/60 text-[10px] font-black uppercase tracking-[0.2em]">Ships within 24 hours</p>
              </div>
              <div className="flex flex-col sm:flex-row items-center gap-6">
                <div className="text-center sm:text-right">
                  <span className="text-white/40 text-[10px] font-black uppercase block">Grand Total</span>
                  <span className="text-white text-4xl font-black tracking-tighter">₹{product.price * quantity}</span>
                </div>
                <button onClick={handleBuyNow} className="w-full sm:w-auto bg-white text-slate-900 px-12 py-5 rounded-2xl font-black uppercase tracking-widest text-sm hover:scale-105 active:scale-95 transition-all shadow-xl">
                  Buy Now
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* RELATED PRODUCTS */}
        {relatedProducts.length > 0 && (
          <div className="mt-32 pt-16 border-t border-slate-100 dark:border-white/5">
            <h3 className="text-3xl font-black uppercase italic tracking-tighter mb-12">You Might Like</h3>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8">
              {relatedProducts.map((rp) => (
                <Link key={rp.id} to={`/product/${rp.id}`} className="group relative flex flex-col">
                  <div className="aspect-[3/4] overflow-hidden rounded-[2rem] bg-slate-100 dark:bg-slate-900 mb-4 border border-slate-100 dark:border-white/5 shadow-sm group-hover:shadow-xl transition-all duration-500">
                    <img src={rp.images[0]} alt={rp.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                  </div>
                  <h4 className="font-black text-sm uppercase tracking-tight group-hover:text-blue-600 transition-colors truncate">{rp.name}</h4>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="font-black text-blue-600">₹{rp.price}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

      </div>
      {/* TOAST Notification */}
      {showToast && (
        <div className="fixed top-8 left-1/2 -translate-x-1/2 z-[9999] animate-in zoom-in-95 duration-300">
          <div className="bg-slate-900 dark:bg-blue-600 text-white px-8 py-4 rounded-2xl font-black shadow-2xl flex items-center gap-2">
            <span className="bg-green-500 h-4 w-4 rounded-full flex items-center justify-center text-[8px]">✓</span>
            Added to Cart
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductPage;