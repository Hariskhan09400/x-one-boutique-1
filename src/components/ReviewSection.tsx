import React, { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { Star, Trash2, ChevronDown, ChevronUp, Send, Lock, MessageSquare } from "lucide-react";

interface Review {
  id: number;
  username: string;
  rating: number;
  comment: string;
  user_id: string;
  created_at: string;
}

// ── Play sound from user's settings (same logic as Settingspage)
function playReviewSound() {
  try {
    const CLICK_SOUNDS = [
      { id: "click1", url: "https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3" },
      { id: "click2", url: "https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3" },
      { id: "click3", url: "https://assets.mixkit.co/active_storage/sfx/2572/2572-preview.mp3" },
      { id: "click4", url: "https://assets.mixkit.co/active_storage/sfx/2569/2569-preview.mp3" },
    ];
    // Find settings key — try logged-in user first, then guest
    const userRaw = localStorage.getItem("xob_user");
    const userId  = userRaw ? JSON.parse(userRaw)?.id : null;
    const key     = userId ? `xob_settings_${userId}` : "xob_settings_guest";
    const raw     = localStorage.getItem(key);
    const s       = raw ? JSON.parse(raw) : null;
    if (!s?.soundEffects) return;
    const sound   = CLICK_SOUNDS.find(c => c.id === (s.clickSound || "click1")) || CLICK_SOUNDS[0];
    const audio   = new Audio(sound.url);
    audio.volume  = 0.45;
    audio.play().catch(() => {
      // Web Audio API fallback
      try {
        const ctx  = new (window.AudioContext || (window as any).webkitAudioContext)();
        const osc  = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.value = 880;
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.12);
      } catch {}
    });
  } catch {}
}

const ReviewSection = ({ productId }: { productId: string }) => {
  const navigate = useNavigate();

  const [reviews,       setReviews]       = useState<Review[]>([]);
  const [visibleCount,  setVisibleCount]  = useState(3);
  const [comment,       setComment]       = useState("");
  const [rating,        setRating]        = useState(5);
  const [hoverRating,   setHoverRating]   = useState(0);
  const [isSubmitting,  setIsSubmitting]  = useState(false);
  const [currentUser,   setCurrentUser]   = useState<any>(null);
  const [deleteId,      setDeleteId]      = useState<number | null>(null);
  const [focusTextarea, setFocusTextarea] = useState(false);

  const formatDateTime = (d: string) =>
    new Date(d).toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
      day: "2-digit", month: "short", year: "numeric",
      hour: "2-digit", minute: "2-digit", hour12: true,
    });

  // Auth sync
  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getSession();
      setCurrentUser(data.session?.user ?? null);
    };
    checkUser();
    const { data: listener } = supabase.auth.onAuthStateChange((_e, s) => setCurrentUser(s?.user ?? null));
    return () => listener.subscription.unsubscribe();
  }, []);

  // Load reviews
  const loadReviews = async () => {
    const { data } = await supabase
      .from("reviews").select("*")
      .eq("product_id", productId)
      .order("created_at", { ascending: false });
    setReviews(data || []);
  };
  useEffect(() => { loadReviews(); }, [productId]);

  // Post review
  const handlePost = async () => {
    if (!currentUser) { toast.error("Please login first."); navigate("/login"); return; }
    if (!comment.trim()) return;
    setIsSubmitting(true);
    const { error } = await supabase.from("reviews").insert([{
      product_id: productId,
      user_id:    currentUser.id,
      username:   currentUser.user_metadata?.username || currentUser.email?.split("@")[0],
      rating,
      comment:    comment.trim(),
    }]);
    if (error) {
      toast.error("Failed to post review.");
    } else {
      playReviewSound(); // ← user ke settings ka sound
      toast.success("Review posted! ✓");
      setComment(""); setRating(5);
      loadReviews();
    }
    setIsSubmitting(false);
  };

  // Delete review
  const confirmDelete = async () => {
    if (!deleteId) return;
    await supabase.from("reviews").delete().eq("id", deleteId).eq("user_id", currentUser.id);
    toast.success("Review deleted.");
    setDeleteId(null);
    loadReviews();
  };

  const avgRating = reviews.length
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : null;

  const ratingCounts = [5,4,3,2,1].map(star => ({
    star, count: reviews.filter(r => r.rating === star).length,
  }));

  const ratingLabel = (r: number) => {
    if (r >= 5) return "Outstanding";
    if (r >= 4) return "Excellent";
    if (r >= 3) return "Good";
    if (r >= 2) return "Fair";
    return "Poor";
  };

  return (
    <>
      <style>{`
        .xrs-wrap {
          border-radius: 20px;
          overflow: hidden;
          background: #fff;
          border: 1px solid rgba(0,0,0,.08);
          box-shadow: 0 4px 24px rgba(0,0,0,.06);
        }
        .dark .xrs-wrap {
          background: #0d1117;
          border-color: rgba(255,255,255,.05);
          box-shadow: 0 4px 32px rgba(0,0,0,.4);
        }

        /* Header */
        .xrs-header {
          padding: clamp(16px,3vw,28px) clamp(16px,4vw,28px);
          border-bottom: 1px solid rgba(0,0,0,.07);
          display: flex;
          flex-wrap: wrap;
          gap: 16px;
          align-items: flex-start;
          justify-content: space-between;
        }
        .dark .xrs-header { border-color: rgba(255,255,255,.05); }

        /* Body */
        .xrs-body {
          padding: clamp(14px,3vw,28px) clamp(14px,4vw,28px);
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        /* Form card */
        .xrs-form {
          border-radius: 16px;
          padding: clamp(14px,3vw,20px);
          border: 1.5px solid rgba(148,163,184,.2);
          transition: border-color .2s, box-shadow .2s;
        }
        .xrs-form.focused {
          border-color: rgba(37,99,235,.35);
          box-shadow: 0 0 0 3px rgba(37,99,235,.07);
        }

        /* Textarea */
        .xrs-ta {
          width: 100%;
          padding: 12px 14px;
          border-radius: 12px;
          border: 1.5px solid rgba(0,0,0,.09);
          background: #fff;
          color: #0f172a;
          font-size: 14px;
          font-family: inherit;
          resize: none;
          outline: none;
          transition: border-color .2s, box-shadow .2s;
          box-sizing: border-box;
        }
        .dark .xrs-ta {
          background: rgba(255,255,255,.03);
          border-color: rgba(255,255,255,.07);
          color: #e2e8f0;
        }
        .xrs-ta:focus {
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59,130,246,.12);
        }
        .xrs-ta::placeholder { color: #94a3b8; }
        .xrs-ta:disabled { cursor: not-allowed; opacity: .6; }

        /* Review card */
        .xrs-card {
          border-radius: 16px;
          padding: clamp(12px,2.5vw,18px);
          border: 1px solid rgba(0,0,0,.07);
          background: rgba(248,250,255,.6);
          transition: border-color .2s, box-shadow .2s;
        }
        .dark .xrs-card {
          background: rgba(255,255,255,.02);
          border-color: rgba(255,255,255,.05);
        }
        .xrs-card:hover {
          border-color: rgba(0,0,0,.12);
          box-shadow: 0 4px 16px rgba(0,0,0,.07);
        }
        .dark .xrs-card:hover {
          border-color: rgba(255,255,255,.09);
          box-shadow: 0 4px 20px rgba(0,0,0,.3);
        }

        /* Submit btn */
        .xrs-submit {
          display: flex; align-items: center; gap: 6px;
          padding: 10px 18px; border-radius: 10px;
          font-size: 12px; font-weight: 800; color: #fff;
          background: linear-gradient(135deg,#2563eb,#4f46e5);
          border: none; cursor: pointer;
          box-shadow: 0 4px 14px rgba(37,99,235,.3);
          transition: all .18s ease;
          white-space: nowrap;
        }
        .xrs-submit:hover:not(:disabled) { filter:brightness(1.1); transform:translateY(-1px); }
        .xrs-submit:active:not(:disabled) { transform:scale(.97); }
        .xrs-submit:disabled { opacity:.4; cursor:not-allowed; box-shadow:none; }

        /* Load more btn */
        .xrs-more {
          display: flex; align-items: center; gap: 6px;
          padding: 10px 20px; border-radius: 12px;
          font-size: 12px; font-weight: 700;
          border: 1px solid rgba(0,0,0,.1);
          background: rgba(0,0,0,.03);
          cursor: pointer; transition: all .18s ease;
        }
        .dark .xrs-more { border-color:rgba(255,255,255,.09); background:rgba(255,255,255,.04); color:#94a3b8; }
        .xrs-more:hover { background:rgba(0,0,0,.06); transform:translateY(-1px); }
        .dark .xrs-more:hover { background:rgba(255,255,255,.08); }

        /* Delete btn */
        .xrs-del {
          display: flex; align-items: center; gap: 4px;
          font-size: 10px; font-weight: 700;
          color: #94a3b8; background: none; border: none;
          cursor: pointer; padding: 4px 6px; border-radius: 6px;
          transition: all .15s ease;
          opacity: 0;
        }
        .xrs-card:hover .xrs-del { opacity: 1; }
        .xrs-del:hover { color: #ef4444; background: rgba(239,68,68,.08); }

        /* Star btn */
        .xrs-star-btn {
          background: none; border: none; cursor: pointer; padding: 2px;
          transition: transform .15s ease;
        }
        .xrs-star-btn:disabled { cursor: not-allowed; }

        /* Modal */
        .xrs-modal-bg {
          position: fixed; inset: 0;
          background: rgba(0,0,0,.55);
          backdrop-filter: blur(8px);
          z-index: 9999;
          display: flex; align-items: center; justify-content: center;
          padding: 16px;
        }
        .xrs-modal {
          width: 100%; max-width: 320px;
          border-radius: 20px; overflow: hidden;
          background: #fff;
          border: 1px solid rgba(0,0,0,.09);
          box-shadow: 0 24px 64px rgba(0,0,0,.2);
        }
        .dark .xrs-modal {
          background: #0d1117;
          border-color: rgba(255,255,255,.08);
        }

        /* Alert banner */
        .xrs-alert {
          display: flex; align-items: center; gap: 10px;
          padding: 10px 14px; border-radius: 12px; margin-bottom: 12px;
          background: rgba(245,158,11,.08);
          border: 1px solid rgba(245,158,11,.2);
          font-size: 12px; font-weight: 600;
          color: #92400e;
        }
        .dark .xrs-alert { color: #fbbf24; background: rgba(245,158,11,.1); border-color: rgba(245,158,11,.2); }
      `}</style>

      <div className="xrs-wrap">

        {/* ── HEADER ── */}
        <div className="xrs-header">
          <div style={{ display:"flex", alignItems:"center", gap:"10px" }}>
            <div style={{
              width:"36px", height:"36px", borderRadius:"10px", flexShrink:0,
              background:"rgba(37,99,235,.1)",
              display:"flex", alignItems:"center", justifyContent:"center",
            }}>
              <MessageSquare size={16} color="#2563eb" />
            </div>
            <div>
              <h3 style={{ margin:0, fontSize:"15px", fontWeight:900, letterSpacing:"-0.01em" }}
                className="text-slate-900 dark:text-white">
                Customer Reviews
              </h3>
              <p style={{ margin:"2px 0 0", fontSize:"11px" }} className="text-slate-400 dark:text-slate-500">
                {reviews.length} {reviews.length === 1 ? "review" : "reviews"}
              </p>
            </div>
          </div>

          {/* Rating summary */}
          {avgRating && (
            <div style={{ display:"flex", alignItems:"center", gap:"14px", flexWrap:"wrap" }}>
              <div style={{ textAlign:"center" }}>
                <p style={{ margin:0, fontSize:"36px", fontWeight:900, lineHeight:1 }}
                  className="text-slate-900 dark:text-white">
                  {avgRating}
                </p>
                <div style={{ display:"flex", gap:"2px", marginTop:"4px", justifyContent:"center" }}>
                  {[1,2,3,4,5].map(s => (
                    <Star key={s} size={11}
                      className={parseFloat(avgRating) >= s
                        ? "text-amber-400 fill-amber-400"
                        : "text-slate-200 dark:text-slate-700 fill-slate-200 dark:fill-slate-700"} />
                  ))}
                </div>
                <p style={{ margin:"3px 0 0", fontSize:"9px", fontWeight:700, letterSpacing:"0.08em", textTransform:"uppercase" }}
                  className="text-slate-400">{ratingLabel(parseFloat(avgRating))}</p>
              </div>

              <div style={{ display:"flex", flexDirection:"column", gap:"4px", minWidth:"120px" }}>
                {ratingCounts.map(({ star, count }) => (
                  <div key={star} style={{ display:"flex", alignItems:"center", gap:"6px" }}>
                    <span style={{ fontSize:"9px", fontWeight:700, width:"8px" }} className="text-slate-400">{star}</span>
                    <div style={{ flex:1, height:"5px", borderRadius:"3px", overflow:"hidden" }}
                      className="bg-slate-100 dark:bg-white/[0.06]">
                      <div style={{
                        height:"100%", borderRadius:"3px",
                        width: reviews.length ? `${(count/reviews.length)*100}%` : "0%",
                        background:"#f59e0b", transition:"width .6s ease",
                      }} />
                    </div>
                    <span style={{ fontSize:"9px", width:"12px", textAlign:"right" }}
                      className="text-slate-400">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── BODY ── */}
        <div className="xrs-body">

          {/* ── WRITE REVIEW FORM ── */}
          <div className={`xrs-form ${focusTextarea ? "focused" : ""}`}>
            {!currentUser && (
              <div className="xrs-alert">
                <Lock size={13} color="#d97706" style={{ flexShrink:0 }} />
                <span>
                  Login to write a review.{" "}
                  <button onClick={() => navigate("/login")}
                    style={{ background:"none", border:"none", cursor:"pointer", fontWeight:800, textDecoration:"underline", color:"inherit", padding:0 }}>
                    Login here
                  </button>
                </span>
              </div>
            )}

            {/* Stars */}
            <div style={{ display:"flex", alignItems:"center", gap:"10px", marginBottom:"12px", flexWrap:"wrap" }}>
              <span style={{ fontSize:"10px", fontWeight:800, textTransform:"uppercase", letterSpacing:"0.1em" }}
                className="text-slate-400">Your Rating</span>
              <div style={{ display:"flex", gap:"3px" }} onMouseLeave={() => setHoverRating(0)}>
                {[1,2,3,4,5].map(star => {
                  const active = star <= (hoverRating || rating);
                  return (
                    <button key={star} type="button"
                      className="xrs-star-btn"
                      disabled={!currentUser}
                      onClick={() => setRating(star)}
                      onMouseEnter={() => currentUser && setHoverRating(star)}
                      style={{ transform: active ? "scale(1.2)" : "scale(1)" }}>
                      <Star size={24}
                        className={active
                          ? "text-amber-400 fill-amber-400"
                          : "text-slate-300 dark:text-slate-600"} />
                    </button>
                  );
                })}
              </div>
              {(hoverRating || rating) > 0 && (
                <span style={{ fontSize:"11px", fontWeight:700, color:"#2563eb" }}>
                  {ratingLabel(hoverRating || rating)}
                </span>
              )}
            </div>

            {/* Textarea */}
            <textarea
              className="xrs-ta"
              disabled={!currentUser}
              placeholder={currentUser ? "Share your honest experience with this product..." : "Login to write a review..."}
              rows={3}
              value={comment}
              onFocus={() => setFocusTextarea(true)}
              onBlur={() => setFocusTextarea(false)}
              onChange={e => setComment(e.target.value)}
            />

            {/* Submit row */}
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginTop:"10px", flexWrap:"wrap", gap:"8px" }}>
              <span style={{ fontSize:"11px" }} className="text-slate-400">
                {comment.length > 0 && `${comment.length} chars`}
              </span>
              <button
                className="xrs-submit"
                onClick={handlePost}
                disabled={isSubmitting || !currentUser || !comment.trim()}
              >
                {isSubmitting ? (
                  <>
                    <div style={{ width:"12px", height:"12px", borderRadius:"50%", border:"2px solid rgba(255,255,255,.3)", borderTopColor:"#fff", animation:"spin .8s linear infinite" }} />
                    Posting...
                  </>
                ) : (
                  <><Send size={12} /> Post Review</>
                )}
              </button>
            </div>
          </div>

          {/* ── REVIEWS LIST ── */}
          <div style={{ display:"flex", flexDirection:"column", gap:"10px" }}>
            {reviews.length === 0 && (
              <div style={{ textAlign:"center", padding:"clamp(24px,5vw,48px) 16px" }}>
                <div style={{ width:"44px", height:"44px", borderRadius:"14px", margin:"0 auto 12px", display:"flex", alignItems:"center", justifyContent:"center" }}
                  className="bg-slate-100 dark:bg-white/[0.04]">
                  <MessageSquare size={18} className="text-slate-300 dark:text-slate-600" />
                </div>
                <p style={{ fontSize:"14px", fontWeight:600, margin:"0 0 4px" }} className="text-slate-400">No reviews yet</p>
                <p style={{ fontSize:"12px", margin:0 }} className="text-slate-300 dark:text-slate-600">Be the first to review!</p>
              </div>
            )}

            {reviews.slice(0, visibleCount).map((r, idx) => (
              <div key={r.id} className="xrs-card" style={{ animationDelay:`${idx*40}ms` }}>
                {/* Top row */}
                <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:"10px", marginBottom:"10px" }}>
                  <div style={{ display:"flex", alignItems:"center", gap:"10px", minWidth:0 }}>
                    {/* Avatar */}
                    <div style={{
                      width:"36px", height:"36px", borderRadius:"10px", flexShrink:0,
                      background:"linear-gradient(135deg,#3b82f6,#6366f1)",
                      display:"flex", alignItems:"center", justifyContent:"center",
                      fontSize:"13px", fontWeight:900, color:"#fff",
                      boxShadow:"0 4px 10px rgba(99,102,241,.3)",
                    }}>
                      {r.username.charAt(0).toUpperCase()}
                    </div>
                    <div style={{ minWidth:0 }}>
                      <p style={{ margin:0, fontSize:"13px", fontWeight:800, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}
                        className="text-slate-800 dark:text-white">
                        @{r.username}
                      </p>
                      <div style={{ display:"flex", alignItems:"center", gap:"4px", marginTop:"3px", flexWrap:"wrap" }}>
                        <div style={{ display:"flex", gap:"1px" }}>
                          {[1,2,3,4,5].map(s => (
                            <Star key={s} size={11}
                              className={s<=r.rating
                                ? "text-amber-400 fill-amber-400"
                                : "text-slate-200 dark:text-slate-700 fill-slate-200 dark:fill-slate-700"} />
                          ))}
                        </div>
                        <span style={{ fontSize:"10px", fontWeight:700 }} className="text-slate-400">
                          {ratingLabel(r.rating)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Date + delete */}
                  <div style={{ display:"flex", flexDirection:"column", alignItems:"flex-end", gap:"4px", flexShrink:0 }}>
                    <span style={{ fontSize:"10px", fontWeight:500, whiteSpace:"nowrap" }} className="text-slate-400 dark:text-slate-500">
                      {formatDateTime(r.created_at)}
                    </span>
                    {currentUser?.id === r.user_id && (
                      <button className="xrs-del" onClick={() => setDeleteId(r.id)}>
                        <Trash2 size={10} /> Delete
                      </button>
                    )}
                  </div>
                </div>

                {/* Comment */}
                <p style={{ margin:0, fontSize:"13px", lineHeight:1.65, paddingLeft:"46px" }}
                  className="text-slate-700 dark:text-slate-300">
                  {r.comment}
                </p>
              </div>
            ))}
          </div>

          {/* ── LOAD MORE ── */}
          {reviews.length > 3 && (
            <div style={{ display:"flex", justifyContent:"center" }}>
              {visibleCount < reviews.length ? (
                <button className="xrs-more text-slate-600 dark:text-slate-400"
                  onClick={() => setVisibleCount(v => v + 3)}>
                  <ChevronDown size={13} />
                  Load {Math.min(3, reviews.length - visibleCount)} more
                </button>
              ) : (
                <button className="xrs-more text-slate-600 dark:text-slate-400"
                  onClick={() => setVisibleCount(3)}>
                  <ChevronUp size={13} /> Show less
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── DELETE MODAL ── */}
      {deleteId && (
        <div className="xrs-modal-bg" onClick={() => setDeleteId(null)}>
          <div className="xrs-modal" onClick={e => e.stopPropagation()}>
            <div style={{ padding:"clamp(18px,4vw,24px)", textAlign:"center" }}>
              <div style={{ width:"44px", height:"44px", borderRadius:"14px", margin:"0 auto 14px", display:"flex", alignItems:"center", justifyContent:"center", background:"rgba(239,68,68,.1)" }}>
                <Trash2 size={18} color="#ef4444" />
              </div>
              <p style={{ margin:"0 0 6px", fontSize:"15px", fontWeight:900 }} className="text-slate-900 dark:text-white">Delete Review?</p>
              <p style={{ margin:0, fontSize:"12px", lineHeight:1.6 }} className="text-slate-500">
                This action cannot be undone.
              </p>
            </div>
            <div style={{ display:"flex", borderTop:"1px solid rgba(0,0,0,.07)" }} className="dark:border-white/[0.05]">
              <button onClick={() => setDeleteId(null)}
                style={{ flex:1, padding:"14px", fontSize:"13px", fontWeight:700, background:"none", border:"none", cursor:"pointer", borderRight:"1px solid rgba(0,0,0,.07)" }}
                className="text-slate-600 dark:text-slate-400 dark:border-white/[0.05] hover:bg-slate-50 dark:hover:bg-white/[0.03]">
                Cancel
              </button>
              <button onClick={confirmDelete}
                style={{ flex:1, padding:"14px", fontSize:"13px", fontWeight:900, background:"none", border:"none", cursor:"pointer", color:"#ef4444" }}
                className="hover:bg-red-50 dark:hover:bg-red-500/[0.07]">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </>
  );
};

export default ReviewSection;