import { useParams, Link } from "react-router-dom";
import { products } from "../data/products";
import { useState, useEffect } from "react";

interface ProductPageProps {
  onAddToCart: (product: any) => void;
}

const ProductPage = ({ onAddToCart }: ProductPageProps) => {
  const { id } = useParams();
  const product = products.find((p) => p.id === id);

  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [showToast, setShowToast] = useState(false);

  const [reviews, setReviews] = useState<any[]>([]);
  const [reviewName, setReviewName] = useState("");
  const [reviewText, setReviewText] = useState("");
  const [reviewRating, setReviewRating] = useState(5);

  const [adminMode, setAdminMode] = useState(false);
  const [adminPassword, setAdminPassword] = useState("");

  const getUserId = () => {
    let userId = localStorage.getItem("xob_user_id");
    if (!userId) {
      userId = crypto.randomUUID();
      localStorage.setItem("xob_user_id", userId);
    }
    return userId;
  };

  const currentUserId = getUserId();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem(`reviews_${id}`);
    if (saved) setReviews(JSON.parse(saved));
  }, [id]);

  if (!product) return <h2 className="p-6 text-center text-red-500 font-bold">Product not found</h2>;

  const handleBuyNow = () => {
    const message = `Hello, I want to buy:
Product: ${product.name}
Size: ${selectedSize || "Not selected"}
Quantity: ${quantity}
Total: ₹${product.price * quantity}`;

    window.open(
      `https://wa.me/917208428589?text=${encodeURIComponent(message)}`,
      "_blank"
    );
  };

  const handleSubmitReview = () => {
    if (!reviewName || !reviewText) return;
    const newReview = {
      id: Date.now(),
      name: reviewName,
      text: reviewText,
      rating: reviewRating,
      date: new Date().toLocaleDateString(),
      ownerId: currentUserId
    };
    const updated = [newReview, ...reviews];
    setReviews(updated);
    localStorage.setItem(`reviews_${id}`, JSON.stringify(updated));
    setReviewName("");
    setReviewText("");
    setReviewRating(5);
  };

  const handleDeleteReview = (reviewId: number) => {
    const updated = reviews.filter((r) => r.id !== reviewId);
    setReviews(updated);
    localStorage.setItem(`reviews_${id}`, JSON.stringify(updated));
  };

  const averageRating =
    reviews.length > 0
      ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
      : null;

  return (
    <div className="min-h-screen bg-white dark:bg-[#020617] transition-colors duration-300">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"> text-slate-900 dark:text-white"

        {/* ================= PRODUCT SECTION ================= */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-start">

          {/* LEFT: Image Gallery - FIXED: Mobile pe sticky hata diya, lg (desktop) pe rakha hai */}
          <div className="space-y-6 lg:sticky lg:top-10">
            <div className="aspect-[4/5] sm:aspect-square overflow-hidden rounded-[2.5rem] bg-slate-100 dark:bg-slate-900 shadow-2xl border border-slate-200 dark:border-slate-800">
              <img
                src={product.images[selectedImage]}
                className="w-full h-full object-cover transition-transform duration-700 hover:scale-110"
                alt={product.name}
              />
            </div>
            
            {/* Thumbnails - Mobile Friendly Scroll */}
            <div className="flex gap-4 overflow-x-auto py-2 no-scrollbar snap-x">
              {product.images.map((img, index) => (
                <img
                  key={index}
                  src={img}
                  onClick={() => setSelectedImage(index)}
                  className={`w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-2xl cursor-pointer transition-all flex-shrink-0 border-2 snap-center ${
                    selectedImage === index 
                    ? "border-blue-500 scale-105 shadow-lg shadow-blue-500/20" 
                    : "border-transparent opacity-50 hover:opacity-100"
                  }`}
                />
              ))}
            </div>
          </div>

          {/* RIGHT: Product Info */}
          <div className="flex flex-col pt-2">
            <h1 className="text-4xl sm:text-6xl font-black mb-4 tracking-tighter bg-gradient-to-r from-slate-900 to-slate-500 dark:from-white dark:to-slate-400 bg-clip-text text-transparent">
              {product.name}
            </h1>

            <div className="flex items-center gap-3 mb-8">
              {averageRating && (
                <div className="flex items-center bg-yellow-400/10 px-4 py-1.5 rounded-full border border-yellow-400/20">
                  <span className="text-yellow-500 font-bold mr-1">★ {averageRating}</span>
                  <span className="text-slate-500 dark:text-slate-400 text-xs font-bold">({reviews.length} Reviews)</span>
                </div>
              )}
              <span className="text-xs font-black uppercase tracking-[0.2em] text-blue-500 bg-blue-500/10 px-4 py-1.5 rounded-full border border-blue-500/20">
                Premium Collection
              </span>
            </div>

            <p className="text-slate-600 dark:text-slate-400 text-lg leading-relaxed mb-10 max-w-xl">
              {product.description}
            </p>

            <div className="mb-10 flex items-baseline gap-4">
              <span className="text-5xl font-black text-blue-600 dark:text-blue-400">₹{product.price}</span>
              <span className="text-slate-400 line-through text-2xl font-medium opacity-50">₹{product.price + 500}</span>
            </div>

            {/* SIZE SELECTOR */}
            <div className="mb-10 space-y-5">
              <div className="flex justify-between items-center">
                <h3 className="font-black text-xs uppercase tracking-widest text-slate-400">Select Your Size</h3>
                <button className="text-xs text-blue-500 font-bold hover:underline">Size Guide</button>
              </div>
              <div className="flex flex-wrap gap-4">
                {["S", "M", "L", "XL"].map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`h-14 w-14 sm:h-16 sm:w-16 flex items-center justify-center rounded-[1.25rem] font-black transition-all border-2 active:scale-90 ${
                      selectedSize === size
                        ? "bg-blue-600 border-blue-600 text-white shadow-xl shadow-blue-600/30"
                        : "border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-blue-500"
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* QUANTITY */}
            <div className="mb-10 space-y-4">
              <h3 className="font-black text-xs uppercase tracking-widest text-slate-400">Quantity</h3>
              <div className="flex items-center bg-slate-100 dark:bg-slate-900/50 w-fit rounded-[1.25rem] p-1.5 border border-slate-200 dark:border-slate-800 shadow-inner">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="w-12 h-12 flex items-center justify-center text-2xl font-bold hover:text-blue-500 transition-colors"
                >-</button>
                <span className="w-14 text-center text-xl font-black">{quantity}</span>
                <button
                  onClick={() => setQuantity((q) => q + 1)}
                  className="w-12 h-12 flex items-center justify-center text-2xl font-bold hover:text-blue-500 transition-colors"
                >+</button>
              </div>
            </div>

            {/* ACTION BUTTONS */}
            <div className="flex flex-col sm:flex-row gap-5 mb-10">
              <button
                onClick={() => {
                  if (!selectedSize) { alert("Please select a size"); return; }
                  onAddToCart({ ...product, selectedSize, quantity });
                  setShowToast(true);
                  setTimeout(() => setShowToast(false), 2000);
                }}
                className="flex-[1.5] bg-blue-600 hover:bg-blue-700 text-white h-20 rounded-[1.5rem] font-black text-xl transition-all active:scale-95 shadow-2xl shadow-blue-600/30 flex items-center justify-center gap-3"
              >
                <span>🛒</span> Add to Cart
              </button>
              <button
                onClick={handleBuyNow}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white h-20 rounded-[1.5rem] font-black text-xl transition-all active:scale-95 shadow-2xl shadow-emerald-600/30 flex items-center justify-center gap-3"
              >
                <span>💬</span> Buy Now
              </button>
            </div>

            {/* TRUST BADGES */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-4 p-5 rounded-3xl bg-slate-50 dark:bg-slate-900/30 border border-slate-100 dark:border-white/5">
                <div className="text-3xl">🚀</div>
                <div>
                    <p className="text-xs font-black uppercase text-slate-400">Shipping</p>
                    <p className="text-sm font-bold">Fast Delivery</p>
                </div>
              </div>
              <div className="flex items-center gap-4 p-5 rounded-3xl bg-slate-50 dark:bg-slate-900/30 border border-slate-100 dark:border-white/5">
                <div className="text-3xl">🛡️</div>
                <div>
                    <p className="text-xs font-black uppercase text-slate-400">Warranty</p>
                    <p className="text-sm font-bold">7 Days Return</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ================= REVIEW SECTION ================= */}
        <div className="mt-32 max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-black mb-4 tracking-tighter italic">Voice of Customers</h2>
            <p className="text-slate-500 font-bold uppercase tracking-widest text-sm">{reviews.length} Authentic Feedbacks</p>
          </div>

          {/* Submit Review Card */}
          <div className="bg-slate-50 dark:bg-slate-900/50 p-6 sm:p-10 rounded-[3rem] mb-16 border border-slate-200 dark:border-white/5 shadow-xl backdrop-blur-sm">
            <h3 className="text-2xl font-black mb-8">Share Your Thoughts</h3>
            <div className="space-y-6">
              <input
                type="text"
                placeholder="Full Name"
                value={reviewName}
                onChange={(e) => setReviewName(e.target.value)}
                className="w-full p-5 rounded-2xl bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 focus:border-blue-500 outline-none transition-all dark:text-white font-bold"
              />
              <textarea
                placeholder="What did you love about this product?"
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                rows={4}
                className="w-full p-5 rounded-2xl bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 focus:border-blue-500 outline-none transition-all dark:text-white font-bold"
              />
              <div className="flex items-center justify-between py-2 px-4 bg-white dark:bg-slate-800 rounded-2xl border-2 border-slate-100 dark:border-slate-700">
                <span className="text-sm font-black text-slate-400 uppercase tracking-widest">Rate Us</span>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setReviewRating(star)}
                      className={`text-3xl transition-all hover:scale-125 ${
                        star <= reviewRating ? "text-yellow-400 drop-shadow-sm" : "text-slate-200 dark:text-slate-700"
                      }`}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>
              <button
                onClick={handleSubmitReview}
                className="w-full bg-slate-900 dark:bg-blue-600 text-white py-5 rounded-2xl font-black text-lg hover:shadow-2xl transition-all active:scale-95"
              >
                Post Review
              </button>
            </div>

            {/* ADMIN LOGIN - Integrated nicely */}
            <div className="mt-12 pt-8 border-t border-slate-200 dark:border-white/5">
              {!adminMode ? (
                <div className="flex gap-3 max-w-sm mx-auto">
                  <input
                    type="password"
                    placeholder="Admin Key"
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    className="flex-1 p-3 rounded-xl bg-slate-200 dark:bg-slate-800 text-sm outline-none font-bold"
                  />
                  <button
                    onClick={() => {
                      if (adminPassword === "xob123") {
                        setAdminMode(true);
                        setAdminPassword("");
                      } else { alert("Access Denied"); }
                    }}
                    className="bg-slate-800 dark:bg-slate-700 text-white px-6 py-3 rounded-xl text-xs font-black uppercase"
                  >
                    Verify
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-between bg-green-500/10 p-4 rounded-2xl border border-green-500/20 max-w-sm mx-auto">
                  <span className="text-green-500 text-xs font-black uppercase tracking-widest">Admin Active</span>
                  <button
                    onClick={() => setAdminMode(false)}
                    className="text-red-500 text-xs font-black hover:underline"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Display Reviews */}
          <div className="space-y-8">
            {reviews.length === 0 ? (
              <div className="text-center py-20 border-4 border-dotted border-slate-100 dark:border-slate-800 rounded-[3rem] text-slate-400 font-bold">
                No stories yet. Be the first to share!
              </div>
            ) : (
              reviews.map((review) => (
                <div key={review.id} className="group bg-white dark:bg-slate-900/30 p-8 rounded-[2.5rem] border border-slate-100 dark:border-white/5 hover:border-blue-500/30 transition-all relative">
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center font-black text-blue-500">
                            {review.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h3 className="font-black text-xl">{review.name}</h3>
                          <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em]">{review.date}</p>
                        </div>
                    </div>
                    <div className="flex text-yellow-400 bg-yellow-400/10 px-3 py-1 rounded-full border border-yellow-400/20 text-sm">
                      {"★".repeat(review.rating)}
                    </div>
                  </div>
                  <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-lg italic">"{review.text}"</p>
                  
                  {(review.ownerId === currentUserId || adminMode) && (
                    <button
                      onClick={() => handleDeleteReview(review.id)}
                      className="mt-6 text-red-500 text-[10px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all hover:underline"
                    >
                      Delete Feedback
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* TOAST NOTIFICATION */}
      {showToast && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[9999] w-[90%] sm:w-auto px-6">
          <div className="bg-slate-900 dark:bg-white dark:text-slate-900 text-white px-8 py-5 rounded-[2rem] font-black shadow-[0_20px_50px_rgba(0,0,0,0.3)] animate-bounce flex items-center justify-center gap-4">
            <span className="bg-green-500 w-8 h-8 rounded-full flex items-center justify-center text-sm">✓</span>
            Item added to your collection!
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductPage;