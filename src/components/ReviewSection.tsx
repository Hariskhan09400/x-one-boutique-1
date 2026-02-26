import React, { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

interface Review {
  id: number;
  username: string;
  rating: number;
  comment: string;
  user_id: string;
  created_at: string;
}

const ReviewSection = ({ productId }: { productId: string }) => {
  const navigate = useNavigate();

  const [reviews, setReviews] = useState<Review[]>([]);
  const [visibleCount, setVisibleCount] = useState(3);
  const [comment, setComment] = useState("");
  const [rating, setRating] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  // ================= DATE FORMAT =================
const formatDateTime = (dateString: string) => {
  const date = new Date(dateString);

  return date.toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",   // 🔥 IMPORTANT FIX
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true
  });
};
  // ================= AUTH SYNC =================
  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getSession();
      setCurrentUser(data.session?.user ?? null);
    };

    checkUser();

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setCurrentUser(session?.user ?? null);
      }
    );

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  // ================= LOAD REVIEWS =================
  const loadReviews = async () => {
    const { data } = await supabase
      .from("reviews")
      .select("*")
      .eq("product_id", productId)
      .order("created_at", { ascending: false });

    setReviews(data || []);
  };

  useEffect(() => {
    loadReviews();
  }, [productId]);

  // ================= POST REVIEW =================
  const handlePost = async () => {
    if (!currentUser) {
      toast.error("Please login first.");
      navigate("/login");
      return;
    }

    if (!comment.trim()) return;

    setIsSubmitting(true);

    const { error } = await supabase.from("reviews").insert([
      {
        product_id: productId,
        user_id: currentUser.id,
        username:
          currentUser.user_metadata?.username ||
          currentUser.email?.split("@")[0],
        rating,
        comment: comment.trim(),
      },
    ]);

    if (error) toast.error("Failed to post review.");
    else {
      toast.success("Review posted!");
      setComment("");
      setRating(1);
      loadReviews();
    }

    setIsSubmitting(false);
  };

  // ================= DELETE REVIEW =================
  const confirmDelete = async () => {
    if (!deleteId) return;

    await supabase
      .from("reviews")
      .delete()
      .eq("id", deleteId)
      .eq("user_id", currentUser.id);

    toast.success("Review deleted.");
    setDeleteId(null);
    loadReviews();
  };

  return (
    <div className="mt-12 p-8 border-t dark:border-slate-800 border-slate-300 
    bg-white dark:bg-slate-900 rounded-3xl shadow-xl">

      <h3 className="text-2xl font-black mb-10 text-slate-900 dark:text-white uppercase italic">
        Customer Experience
      </h3>

      {/* ================= INPUT SECTION ================= */}
      <div className="mb-12 p-6 bg-slate-100 dark:bg-slate-800 rounded-2xl border dark:border-slate-700 border-slate-300">

        <div className="flex flex-col gap-6">

          <div className="flex gap-4 items-center">
            <span className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase">
              Rate Product:
            </span>

            <div className="flex gap-1">
              {[1,2,3,4,5].map((star) => (
                <button
                  key={star}
                  type="button"
                  disabled={!currentUser}
                  onClick={() => setRating(star)}
                  className={`text-2xl transition ${
                    star <= rating ? "text-yellow-400 scale-110" : "text-slate-400"
                  }`}
                >
                  ★
                </button>
              ))}
            </div>
          </div>

          <textarea
            disabled={!currentUser}
            className={`w-full p-4 rounded-xl border text-sm outline-none transition
              ${
                currentUser
                  ? "bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  : "bg-slate-200 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-500 cursor-not-allowed"
              }`}
            placeholder={
              currentUser
                ? "Share your experience..."
                : "🔒 Login first to write a review"
            }
            rows={3}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />

          <button
            onClick={handlePost}
            disabled={isSubmitting || !currentUser}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-bold text-sm self-end disabled:opacity-50 transition"
          >
            {isSubmitting ? "Posting..." : "Submit Review"}
          </button>

        </div>
      </div>

      {/* ================= REVIEWS LIST ================= */}
      <div className="space-y-6">

        {reviews.slice(0, visibleCount).map((r) => (
          <div
            key={r.id}
            className="relative p-6 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-2xl"
          >

            <div className="flex justify-between items-start">

              <div>
                <p className="font-bold text-blue-600 dark:text-blue-400 text-sm">
                  @{r.username}
                </p>

                <div className="flex text-yellow-500 text-xs">
                  {"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}
                </div>
              </div>

              <div className="flex flex-col items-end gap-2">
                <span className="text-xs text-slate-600 dark:text-slate-400">
                  {formatDateTime(r.created_at)}
                </span>

                {currentUser?.id === r.user_id && (
                  <button
                    onClick={() => setDeleteId(r.id)}
                    className="text-red-600 hover:text-red-700 font-semibold text-xs"
                  >
                    Delete
                  </button>
                )}
              </div>

            </div>

            <p className="text-slate-700 dark:text-slate-200 text-sm mt-4">
              {r.comment}
            </p>

          </div>
        ))}

        {/* LOAD MORE / SHOW LESS */}
        {reviews.length > 3 && (
          <div className="flex justify-center mt-4">
            {visibleCount < reviews.length ? (
              <button
                onClick={() => setVisibleCount(visibleCount + 3)}
                className="px-6 py-2 bg-slate-300 dark:bg-slate-700 rounded-full text-sm font-semibold hover:bg-slate-400 dark:hover:bg-slate-600 transition"
              >
                Load More
              </button>
            ) : (
              <button
                onClick={() => setVisibleCount(3)}
                className="px-6 py-2 bg-slate-300 dark:bg-slate-700 rounded-full text-sm font-semibold hover:bg-slate-400 dark:hover:bg-slate-600 transition"
              >
                Show Less
              </button>
            )}
          </div>
        )}

      </div>

      {/* ================= DELETE CONFIRM MODAL ================= */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-xl w-[320px] text-center">
            <p className="font-semibold text-slate-900 dark:text-white mb-6">
              Are you sure you want to delete this review?
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => setDeleteId(null)}
                className="px-5 py-2 rounded-lg bg-slate-300 dark:bg-slate-700 font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-5 py-2 rounded-lg bg-red-600 text-white font-semibold hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default ReviewSection;