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
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 text-slate-900 dark:text-white">

        {/* ================= PRODUCT SECTION ================= */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-start">

          {/* LEFT: Image Gallery - Mobile Friendly Scroll */}
          <div className="space-y-4 lg:sticky lg:top-6">
            <div className="aspect-[4/5] sm:aspect-square overflow-hidden rounded-3xl bg-slate-100 dark:bg-slate-900 shadow-xl border border-slate-200 dark:border-slate-800">
              <img
                src={product.images[selectedImage]}
                className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                alt={product.name}
              />
            </div>
            <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
              {product.images.map((img, index) => (
                <img
                  key={index}
                  src={img}
                  onClick={() => setSelectedImage(index)}
                  className={`w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-xl cursor-pointer transition-all flex-shrink-0 border-2 ${
                    selectedImage === index ? "border-blue-500 scale-95" : "border-transparent opacity-60 hover:opacity-100"
                  }`}
                />
              ))}
            </div>
          </div>

          {/* RIGHT: Product Info */}
          <div className="flex flex-col pt-2">
            {/* Desktop: text-5xl, Mobile: text-3xl */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black mb-3 tracking-tight leading-tight">
              {product.name}
            </h1>

            <div className="flex items-center gap-3 mb-6">
              {averageRating && (
                <div className="flex items-center bg-yellow-400/10 px-3 py-1 rounded-full">
                  <span className="text-yellow-500 font-bold mr-1">★ {averageRating}</span>
                  <span className="text-slate-500 dark:text-slate-400 text-xs">({reviews.length})</span>
                </div>
              )}
              <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-blue-500 bg-blue-500/10 px-3 py-1 rounded-full">In Stock</span>
            </div>

            <p className="text-slate-600 dark:text-slate-400 text-base lg:text-lg leading-relaxed mb-8">
              {product.description}
            </p>

            <div className="mb-8">
              <span className="text-4xl lg:text-5xl font-black text-blue-600 dark:text-blue-400">₹{product.price}</span>
              <span className="ml-3 text-slate-400 line-through text-xl font-medium opacity-50">₹{product.price + 500}</span>
            </div>

            {/* SIZE SELECTOR */}
            <div className="mb-8 space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-xs uppercase tracking-wider text-slate-500">Select Size</h3>
                <button className="text-xs text-blue-500 font-bold underline">Size Guide</button>
              </div>
              <div className="flex flex-wrap gap-3">
                {["S", "M", "L", "XL"].map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`h-12 w-12 sm:h-14 sm:w-14 flex items-center justify-center rounded-2xl font-black transition-all border-2 active:scale-90 ${
                      selectedSize === size
                        ? "bg-blue-600 border-blue-600 text-white shadow-lg"
                        : "border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-blue-400"
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* QUANTITY */}
            <div className="mb-8 space-y-4">
              <h3 className="font-bold text-xs uppercase tracking-wider text-slate-500">Quantity</h3>
              <div className="flex items-center bg-slate-100 dark:bg-slate-900 w-fit rounded-2xl p-1 border border-slate-200 dark:border-slate-800">
                <button onClick={() => setQuantity((q) => Math.max(1, q - 1))} className="w-12 h-12 flex items-center justify-center text-2xl font-bold">-</button>
                <span className="w-12 text-center text-xl font-black">{quantity}</span>
                <button onClick={() => setQuantity((q) => q + 1)} className="w-12 h-12 flex items-center justify-center text-2xl font-bold">+</button>
              </div>
            </div>

            {/* ACTION BUTTONS */}
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <button
                onClick={() => {
                  if (!selectedSize) { alert("Please select a size"); return; }
                  onAddToCart({ ...product, selectedSize, quantity });
                  setShowToast(true);
                  setTimeout(() => setShowToast(false), 2000);
                }}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white h-16 lg:h-20 rounded-2xl font-black text-lg lg:text-xl shadow-xl active:scale-95"
              >
                Add to Cart
              </button>
              <button
                onClick={handleBuyNow}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white h-16 lg:h-20 rounded-2xl font-black text-lg lg:text-xl shadow-xl active:scale-95"
              >
                Buy Now
              </button>
            </div>

            {/* TRUST BADGES */}
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800">
                <span className="text-xl lg:text-2xl">🚚</span>
                <span className="text-[10px] sm:text-sm font-bold text-slate-600">Fast Delivery</span>
              </div>
              <div className="flex items-center gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800">
                <span className="text-xl lg:text-2xl">🔄</span>
                <span className="text-[10px] sm:text-sm font-bold text-slate-600">7 Days Return</span>
              </div>
            </div>
          </div>
        </div>

        {/* ================= REVIEW SECTION ================= */}
        <div className="mt-24 max-w-4xl">
          <h2 className="text-3xl sm:text-4xl font-black mb-10">Customer Reviews</h2>

          <div className="bg-slate-50 dark:bg-slate-900 p-6 sm:p-10 rounded-[2.5rem] mb-12 border border-slate-200 dark:border-slate-800">
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Your Name"
                value={reviewName}
                onChange={(e) => setReviewName(e.target.value)}
                className="w-full p-4 rounded-xl bg-white dark:bg-slate-800 border-2 border-transparent focus:border-blue-500 outline-none dark:text-white"
              />
              <textarea
                placeholder="Share your experience..."
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                rows={4}
                className="w-full p-4 rounded-xl bg-white dark:bg-slate-800 border-2 border-transparent focus:border-blue-500 outline-none dark:text-white"
              />
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button key={star} onClick={() => setReviewRating(star)} className={`text-3xl ${star <= reviewRating ? "text-yellow-400" : "text-slate-300 dark:text-slate-700"}`}>★</button>
                  ))}
                </div>
                <button onClick={handleSubmitReview} className="w-full sm:w-auto bg-slate-900 dark:bg-blue-600 text-white px-10 py-4 rounded-xl font-black active:scale-95">Post Review</button>
              </div>

              {/* ADMIN LOGIN - FIXED FOR MOBILE */}
              <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-800">
                {!adminMode ? (
                  <div className="flex flex-wrap sm:flex-nowrap gap-2 max-w-md">
                    <input
                      type="password"
                      placeholder="Admin"
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                      className="flex-1 min-w-[120px] p-3 rounded-xl bg-slate-200 dark:bg-slate-800 text-sm outline-none"
                    />
                    <button
                      onClick={() => {
                        if (adminPassword === "xob123") { setAdminMode(true); setAdminPassword(""); } 
                        else { alert("Wrong password"); }
                      }}
                      className="whitespace-nowrap bg-slate-800 dark:bg-slate-700 text-white px-5 py-3 rounded-xl text-xs font-bold"
                    >
                      Verify Access
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between bg-green-500/10 p-4 rounded-xl">
                    <span className="text-green-500 text-xs font-black uppercase">Admin Active</span>
                    <button onClick={() => setAdminMode(false)} className="bg-red-500 text-white px-4 py-2 rounded-lg text-xs font-bold">Logout</button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* List View Reviews */}
          <div className="space-y-6">
            {reviews.map((review) => (
              <div key={review.id} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm relative group">
                <div className="flex justify-between mb-4">
                  <h3 className="font-black text-lg">{review.name}</h3>
                  <div className="text-yellow-400">{"★".repeat(review.rating)}</div>
                </div>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{review.text}</p>
                {(review.ownerId === currentUserId || adminMode) && (
                  <button onClick={() => handleDeleteReview(review.id)} className="mt-4 text-red-500 text-[10px] font-black uppercase sm:opacity-0 group-hover:opacity-100 transition-opacity">Remove</button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* TOAST */}
      {showToast && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[9999] w-[90%] sm:w-auto">
          <div className="bg-green-500 text-white px-8 py-4 rounded-2xl font-black shadow-2xl text-center animate-bounce">
            ✅ Added to Cart!
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductPage;