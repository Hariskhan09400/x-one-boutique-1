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

  // 🔥 REVIEW STATES
  const [reviews, setReviews] = useState<any[]>([]);
  const [reviewName, setReviewName] = useState("");
  const [reviewText, setReviewText] = useState("");
  const [reviewRating, setReviewRating] = useState(5);

  // 🔐 ADMIN
  const [adminMode, setAdminMode] = useState(false);
  const [adminPassword, setAdminPassword] = useState("");

  // 🔐 UNIQUE USER ID (Owner System)
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

  // Load reviews per product
  useEffect(() => {
    const saved = localStorage.getItem(`reviews_${id}`);
    if (saved) setReviews(JSON.parse(saved));
  }, [id]);

  if (!product) return <h2 className="p-6 text-white">Product not found</h2>;

  const related = products.filter(
    (p) => p.category === product.category && p.id !== product.id
  );

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

  // 🔥 Submit Review
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

  // 🔥 Delete Review
  const handleDeleteReview = (reviewId: number) => {
    const updated = reviews.filter((r) => r.id !== reviewId);
    setReviews(updated);
    localStorage.setItem(`reviews_${id}`, JSON.stringify(updated));
  };

  const averageRating =
    reviews.length > 0
      ? (
          reviews.reduce((acc, r) => acc + r.rating, 0) /
          reviews.length
        ).toFixed(1)
      : null;

  return (
    <div className="max-w-7xl mx-auto p-6 text-white">

      {/* ================= PRODUCT SECTION ================= */}
      <div className="grid md:grid-cols-2 gap-12">

        {/* LEFT */}
        <div>
          <img
            src={product.images[selectedImage]}
            className="w-full rounded-2xl shadow-2xl"
          />
          <div className="flex gap-3 mt-4">
            {product.images.map((img, index) => (
              <img
                key={index}
                src={img}
                onClick={() => setSelectedImage(index)}
                className={`w-20 h-20 object-cover rounded-lg cursor-pointer border ${
                  selectedImage === index
                    ? "border-blue-500"
                    : "border-gray-700"
                }`}
              />
            ))}
          </div>
        </div>

        {/* RIGHT */}
        <div>
          <h1 className="text-4xl font-bold mb-2">{product.name}</h1>

          {averageRating && (
            <div className="flex items-center gap-2 mb-2">
              <span className="text-yellow-400">
                {"⭐".repeat(Math.round(Number(averageRating)))}
              </span>
              <span className="text-gray-400 text-sm">
                {averageRating} ({reviews.length} reviews)
              </span>
            </div>
          )}

          <p className="text-gray-400 mb-4">{product.description}</p>

          <h2 className="text-3xl font-bold text-red-500 mb-6">
            ₹{product.price}
          </h2>

          {/* SIZE */}
          <div className="mb-6">
            <h3 className="mb-2 font-semibold">Select Size</h3>
            <div className="flex gap-3">
              {["S","M","L","XL"].map((size) => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={`px-4 py-2 border rounded-lg ${
                    selectedSize === size
                      ? "bg-blue-600 border-blue-600"
                      : "border-gray-600"
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* QUANTITY */}
          <div className="mb-6">
            <h3 className="mb-2 font-semibold">Quantity</h3>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="px-4 py-2 bg-gray-700 rounded"
              >-</button>
              <span className="text-xl font-bold">{quantity}</span>
              <button
                onClick={() => setQuantity((q) => q + 1)}
                className="px-4 py-2 bg-gray-700 rounded"
              >+</button>
            </div>
          </div>

          {/* BUTTONS */}
          <div className="flex gap-4 mb-6">
            <button
              onClick={() => {
                if (!selectedSize) {
                  alert("Please select a size");
                  return;
                }
                onAddToCart({
                  ...product,
                  selectedSize,
                  quantity
                });
                setShowToast(true);
                setTimeout(() => setShowToast(false), 2000);
              }}
              className="bg-blue-600 px-6 py-3 rounded-xl font-bold"
            >
              Add to Cart
            </button>

            <button
              onClick={handleBuyNow}
              className="bg-green-600 px-6 py-3 rounded-xl font-bold"
            >
              Buy Now
            </button>
          </div>

          <div className="bg-gray-900 p-4 rounded-xl mb-4">
            🚚 Estimated Delivery: 3-5 Working Days
          </div>

          <div className="bg-gray-900 p-4 rounded-xl">
            🔄 7 Days Easy Return Available
          </div>
        </div>
      </div>

      {/* ================= REVIEW SECTION ================= */}
      <div className="mt-20">
        <h2 className="text-3xl font-bold mb-6">Customer Reviews</h2>

        {/* Submit */}
        <div className="bg-gray-900 p-6 rounded-xl mb-10">
          <input
            type="text"
            placeholder="Your Name"
            value={reviewName}
            onChange={(e) => setReviewName(e.target.value)}
            className="w-full mb-3 p-2 rounded bg-gray-800 text-white"
          />

          <textarea
            placeholder="Write your review..."
            value={reviewText}
            onChange={(e) => setReviewText(e.target.value)}
            className="w-full mb-3 p-2 rounded bg-gray-800 text-white"
          />

          <div className="flex gap-2 mb-3">
            {[1,2,3,4,5].map((star) => (
              <span
                key={star}
                onClick={() => setReviewRating(star)}
                className={`cursor-pointer text-2xl ${
                  star <= reviewRating ? "text-yellow-400" : "text-gray-600"
                }`}
              >⭐</span>
            ))}
          </div>

          <button
            onClick={handleSubmitReview}
            className="bg-blue-600 px-6 py-2 rounded-xl font-bold"
          >
            Submit Review
          </button>

          {/* 🔐 ADMIN LOGIN */}
          <div className="mt-6">
            {!adminMode ? (
              <div className="flex gap-2">
                <input
                  type="password"
                  placeholder="Admin Password"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  className="p-2 rounded bg-gray-800 text-white"
                />
                <button
                  onClick={() => {
                    if (adminPassword === "xob123") {
                      setAdminMode(true);
                      setAdminPassword("");
                    } else {
                      alert("Wrong password");
                    }
                  }}
                  className="bg-purple-600 px-4 rounded"
                >
                  Admin Login
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <span className="text-green-400 text-sm font-semibold">
                  Admin Mode Active
                </span>
                <button
                  onClick={() => setAdminMode(false)}
                  className="bg-red-600 px-4 py-1 rounded"
                >
                  Exit Admin
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Display Reviews */}
        <div className="space-y-6">
          {reviews.length === 0 ? (
            <p className="text-gray-400">No reviews yet.</p>
          ) : (
            reviews.map((review) => (
              <div key={review.id} className="bg-gray-900 p-4 rounded-xl relative">
                <div className="flex justify-between mb-2">
                  <h3 className="font-bold">{review.name}</h3>
                  <span className="text-yellow-400">
                    {"⭐".repeat(review.rating)}
                  </span>
                </div>

                <p className="text-gray-400">{review.text}</p>
                <p className="text-xs text-gray-500 mt-2">{review.date}</p>

                {(review.ownerId === currentUserId || adminMode) && (
                  <button
                    onClick={() => handleDeleteReview(review.id)}
                    className="absolute top-3 right-3 text-red-400 text-sm"
                  >
                    Delete
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      </div>

    </div>
  );
};

export default ProductPage;