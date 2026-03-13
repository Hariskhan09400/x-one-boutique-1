import React, { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { Star, Trash2, ChevronDown, ChevronUp, Send, Lock, MessageSquare, TrendingUp } from "lucide-react";

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

  const [reviews, setReviews]             = useState<Review[]>([]);
  const [visibleCount, setVisibleCount]   = useState(3);
  const [comment, setComment]             = useState("");
  const [rating, setRating]               = useState(1);
  const [hoverRating, setHoverRating]     = useState(0);
  const [isSubmitting, setIsSubmitting]   = useState(false);
  const [currentUser, setCurrentUser]     = useState<any>(null);
  const [deleteId, setDeleteId]           = useState<number | null>(null);
  const [focusTextarea, setFocusTextarea] = useState(false);

  // ================= DATE FORMAT =================
  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
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
      (_event, session) => { setCurrentUser(session?.user ?? null); }
    );
    return () => { listener.subscription.unsubscribe(); };
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

  useEffect(() => { loadReviews(); }, [productId]);

  // ================= POST REVIEW =================
  const handlePost = async () => {
    if (!currentUser) {
      toast.error("Please login first.");
      navigate("/login");
      return;
    }
    if (!comment.trim()) return;
    setIsSubmitting(true);
    const { error } = await supabase.from("reviews").insert([{
      product_id: productId,
      user_id: currentUser.id,
      username: currentUser.user_metadata?.username || currentUser.email?.split("@")[0],
      rating,
      comment: comment.trim(),
    }]);
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
    await supabase.from("reviews").delete().eq("id", deleteId).eq("user_id", currentUser.id);
    toast.success("Review deleted.");
    setDeleteId(null);
    loadReviews();
  };

  // ── Derived stats ──
  const avgRating = reviews.length
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : null;

  const ratingCounts = [5, 4, 3, 2, 1].map(star => ({
    star,
    count: reviews.filter(r => r.rating === star).length,
  }));

  const ratingLabel = (r: number) => {
    if (r >= 5) return "Outstanding";
    if (r >= 4) return "Excellent";
    if (r >= 3) return "Good";
    if (r >= 2) return "Fair";
    return "Poor";
  };

  // ──────────────────────────────────────────────────────────────────────────
  return (
    <div className="mt-12 rounded-3xl overflow-hidden
      bg-white dark:bg-[#0d1117]
      border border-slate-200/80 dark:border-white/[0.05]
      shadow-[0_4px_30px_rgba(0,0,0,0.06)] dark:shadow-[0_4px_40px_rgba(0,0,0,0.4)]">

      {/* ── HEADER ── */}
      <div className="px-8 pt-8 pb-6 border-b border-slate-100 dark:border-white/[0.05]">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center">
              <MessageSquare size={17} className="text-blue-500" />
            </div>
            <div>
              <h3 className="text-lg font-black tracking-tight text-slate-900 dark:text-white">
                Customer Reviews
              </h3>
              <p className="text-xs text-slate-400 dark:text-slate-500 font-medium mt-0.5">
                {reviews.length} {reviews.length === 1 ? "review" : "reviews"} for this product
              </p>
            </div>
          </div>

          {/* Summary stat */}
          {avgRating && (
            <div className="flex items-center gap-4">
              {/* Big rating */}
              <div className="flex flex-col items-center">
                <span className="text-4xl font-black text-slate-900 dark:text-white leading-none">
                  {avgRating}
                </span>
                <div className="flex gap-0.5 mt-1">
                  {[1,2,3,4,5].map(s => (
                    <Star
                      key={s}
                      size={12}
                      className={parseFloat(avgRating) >= s
                        ? "text-amber-400 fill-amber-400"
                        : "text-slate-200 dark:text-slate-700 fill-slate-200 dark:fill-slate-700"}
                    />
                  ))}
                </div>
                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 mt-1 uppercase tracking-wider">
                  {ratingLabel(parseFloat(avgRating))}
                </span>
              </div>

              {/* Bar chart */}
              <div className="space-y-1.5 min-w-[140px]">
                {ratingCounts.map(({ star, count }) => (
                  <div key={star} className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 w-2">{star}</span>
                    <div className="flex-1 h-1.5 rounded-full bg-slate-100 dark:bg-white/[0.06] overflow-hidden">
                      <div
                        className="h-full rounded-full bg-amber-400 transition-all duration-700"
                        style={{ width: reviews.length ? `${(count / reviews.length) * 100}%` : "0%" }}
                      />
                    </div>
                    <span className="text-[10px] text-slate-400 dark:text-slate-600 w-3 text-right">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="px-6 md:px-8 py-8 space-y-8">

        {/* ── WRITE REVIEW FORM ── */}
        <div
          className="rounded-2xl overflow-hidden transition-all duration-300"
          style={{
            background: focusTextarea
              ? "linear-gradient(135deg, rgba(59,130,246,0.04), rgba(99,102,241,0.03))"
              : undefined,
          }}
        >
          <div
            className="p-5 rounded-2xl border transition-all duration-300"
            style={{
              background: "transparent",
              borderColor: focusTextarea
                ? "rgba(59,130,246,0.3)"
                : "rgba(148,163,184,0.2)",
              boxShadow: focusTextarea
                ? "0 0 0 3px rgba(59,130,246,0.07), 0 4px 20px rgba(0,0,0,0.04)"
                : "none",
            }}
          >
            {/* Not logged in banner */}
            {!currentUser && (
              <div className="flex items-center gap-3 px-4 py-3 rounded-xl mb-4
                bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20">
                <Lock size={14} className="text-amber-500 shrink-0" />
                <p className="text-xs font-semibold text-amber-700 dark:text-amber-400">
                  You must be logged in to write a review.{" "}
                  <button onClick={() => navigate("/login")}
                    className="underline underline-offset-2 hover:text-amber-600 transition-colors">
                    Login here
                  </button>
                </p>
              </div>
            )}

            {/* Star selector */}
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <span className="text-[11px] font-black uppercase tracking-[0.12em] text-slate-400 dark:text-slate-500">
                Your Rating
              </span>
              <div className="flex gap-1" onMouseLeave={() => setHoverRating(0)}>
                {[1,2,3,4,5].map(star => {
                  const active = star <= (hoverRating || rating);
                  return (
                    <button
                      key={star}
                      type="button"
                      disabled={!currentUser}
                      onClick={() => setRating(star)}
                      onMouseEnter={() => currentUser && setHoverRating(star)}
                      aria-label={`Rate ${star} star${star > 1 ? "s" : ""}`}
                      className="transition-all duration-150 disabled:cursor-not-allowed"
                      style={{ transform: active ? "scale(1.2)" : "scale(1)" }}
                    >
                      <Star
                        size={22}
                        className={active
                          ? "text-amber-400 fill-amber-400 drop-shadow-[0_0_6px_rgba(251,191,36,0.6)]"
                          : "text-slate-300 dark:text-slate-600"}
                      />
                    </button>
                  );
                })}
              </div>
              {(hoverRating || rating) > 0 && (
                <span className="text-[11px] font-bold text-blue-500 ml-1">
                  {ratingLabel(hoverRating || rating)}
                </span>
              )}
            </div>

            {/* Textarea */}
            <textarea
              disabled={!currentUser}
              className="w-full px-4 py-3 rounded-xl border text-sm outline-none resize-none transition-all duration-200
                bg-white dark:bg-white/[0.03]
                text-slate-800 dark:text-slate-200
                placeholder:text-slate-400 dark:placeholder:text-slate-600
                border-slate-200 dark:border-white/[0.06]
                focus:border-blue-400 dark:focus:border-blue-500
                focus:ring-2 focus:ring-blue-500/15
                disabled:bg-slate-50 dark:disabled:bg-white/[0.02] disabled:cursor-not-allowed"
              placeholder={currentUser ? "Share your honest experience with this product..." : "Login to write a review..."}
              rows={3}
              value={comment}
              onFocus={() => setFocusTextarea(true)}
              onBlur={() => setFocusTextarea(false)}
              onChange={e => setComment(e.target.value)}
            />

            {/* Submit row */}
            <div className="flex items-center justify-between mt-3">
              <span className="text-[11px] text-slate-400 dark:text-slate-600 font-medium">
                {comment.length > 0 && `${comment.length} characters`}
              </span>
              <button
                onClick={handlePost}
                disabled={isSubmitting || !currentUser || !comment.trim()}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl
                  text-xs font-black text-white
                  bg-gradient-to-r from-blue-600 to-blue-500
                  hover:from-blue-700 hover:to-blue-600
                  shadow-md shadow-blue-500/20 hover:shadow-lg hover:shadow-blue-500/30
                  disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none
                  transition-all duration-200 hover:scale-105 active:scale-95"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-3 h-3 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                    Posting...
                  </>
                ) : (
                  <>
                    <Send size={13} />
                    Post Review
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* ── REVIEWS LIST ── */}
        <div className="space-y-4">
          {reviews.length === 0 && (
            <div className="text-center py-12">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-white/[0.04] flex items-center justify-center mx-auto mb-3">
                <MessageSquare size={20} className="text-slate-300 dark:text-slate-600" />
              </div>
              <p className="text-sm font-semibold text-slate-400 dark:text-slate-600">No reviews yet</p>
              <p className="text-xs text-slate-300 dark:text-slate-700 mt-1">Be the first to review this product!</p>
            </div>
          )}

          {reviews.slice(0, visibleCount).map((r, idx) => (
            <div
              key={r.id}
              className="group relative p-5 rounded-2xl border
                bg-slate-50/50 dark:bg-white/[0.02]
                border-slate-200/70 dark:border-white/[0.05]
                hover:border-slate-300 dark:hover:border-white/[0.09]
                hover:shadow-md dark:hover:shadow-[0_4px_20px_rgba(0,0,0,0.3)]
                transition-all duration-300"
              style={{ animationDelay: `${idx * 50}ms` }}
            >
              {/* Top row */}
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-3">
                  {/* Avatar */}
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600
                    flex items-center justify-center text-white text-xs font-black shrink-0 shadow-md shadow-blue-500/20">
                    {r.username.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-black text-slate-800 dark:text-white leading-none">
                      @{r.username}
                    </p>
                    <div className="flex gap-0.5 mt-1">
                      {[1,2,3,4,5].map(s => (
                        <Star
                          key={s}
                          size={11}
                          className={s <= r.rating
                            ? "text-amber-400 fill-amber-400"
                            : "text-slate-200 dark:text-slate-700 fill-slate-200 dark:fill-slate-700"}
                        />
                      ))}
                      <span className="text-[10px] font-bold text-slate-400 ml-1">
                        {ratingLabel(r.rating)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right side: date + delete */}
                <div className="flex flex-col items-end gap-1.5 shrink-0">
                  <span className="text-[10px] font-medium text-slate-400 dark:text-slate-600 tabular-nums">
                    {formatDateTime(r.created_at)}
                  </span>
                  {currentUser?.id === r.user_id && (
                    <button
                      onClick={() => setDeleteId(r.id)}
                      aria-label="Delete review"
                      className="flex items-center gap-1 text-[10px] font-bold text-slate-400 dark:text-slate-600
                        hover:text-red-500 dark:hover:text-red-400
                        opacity-0 group-hover:opacity-100
                        transition-all duration-200"
                    >
                      <Trash2 size={11} />
                      Delete
                    </button>
                  )}
                </div>
              </div>

              {/* Comment */}
              <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed pl-12">
                {r.comment}
              </p>
            </div>
          ))}
        </div>

        {/* ── LOAD MORE / SHOW LESS ── */}
        {reviews.length > 3 && (
          <div className="flex justify-center pt-2">
            {visibleCount < reviews.length ? (
              <button
                onClick={() => setVisibleCount(visibleCount + 3)}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl
                  text-xs font-bold text-slate-600 dark:text-slate-400
                  bg-slate-100 dark:bg-white/[0.04]
                  border border-slate-200 dark:border-white/[0.06]
                  hover:bg-slate-200 dark:hover:bg-white/[0.08]
                  hover:text-slate-800 dark:hover:text-slate-200
                  transition-all duration-200 hover:scale-105 active:scale-95"
              >
                <ChevronDown size={14} />
                Load {Math.min(3, reviews.length - visibleCount)} more reviews
              </button>
            ) : (
              <button
                onClick={() => setVisibleCount(3)}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl
                  text-xs font-bold text-slate-600 dark:text-slate-400
                  bg-slate-100 dark:bg-white/[0.04]
                  border border-slate-200 dark:border-white/[0.06]
                  hover:bg-slate-200 dark:hover:bg-white/[0.08]
                  hover:text-slate-800 dark:hover:text-slate-200
                  transition-all duration-200 hover:scale-105 active:scale-95"
              >
                <ChevronUp size={14} />
                Show less
              </button>
            )}
          </div>
        )}
      </div>

      {/* ── DELETE CONFIRM MODAL ── */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-md z-50 flex items-center justify-center p-4"
          onClick={() => setDeleteId(null)}>
          <div
            className="w-full max-w-[340px] rounded-2xl overflow-hidden
              bg-white dark:bg-[#0d1117]
              border border-slate-200 dark:border-white/[0.08]
              shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            {/* Modal top */}
            <div className="p-6 text-center">
              <div className="w-12 h-12 rounded-2xl bg-red-50 dark:bg-red-500/10 flex items-center justify-center mx-auto mb-4">
                <Trash2 size={20} className="text-red-500" />
              </div>
              <p className="font-black text-slate-900 dark:text-white text-base mb-1">
                Delete Review?
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-500 leading-relaxed">
                This action cannot be undone. Your review will be permanently removed.
              </p>
            </div>
            {/* Actions */}
            <div className="flex border-t border-slate-100 dark:border-white/[0.05]">
              <button
                onClick={() => setDeleteId(null)}
                className="flex-1 py-3.5 text-sm font-bold text-slate-600 dark:text-slate-400
                  hover:bg-slate-50 dark:hover:bg-white/[0.03] transition-colors"
              >
                Cancel
              </button>
              <div className="w-[1px] bg-slate-100 dark:bg-white/[0.05]" />
              <button
                onClick={confirmDelete}
                className="flex-1 py-3.5 text-sm font-black text-red-500 dark:text-red-400
                  hover:bg-red-50 dark:hover:bg-red-500/[0.07] transition-colors"
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