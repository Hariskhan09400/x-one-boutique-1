import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase'; 
import toast from 'react-hot-toast';

interface Review {
  id: number;
  username: string;
  rating: number;
  comment: string;
  user_id: string; 
  created_at: string;
}

const ReviewSection = ({ productId }: { productId: string }) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [comment, setComment] = useState("");
  const [rating, setRating] = useState(1); // Default 1 star kar diya hai
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUser(user);
    };
    fetchUser();
  }, []);

  const loadReviews = async () => {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .eq('product_id', productId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setReviews(data || []);
    } catch (err) {
      console.error("Reviews load error:", err);
    }
  };

  useEffect(() => { loadReviews(); }, [productId]);

  const handlePost = async () => {
    if (!comment.trim()) return;
    if (!currentUser) {
      toast.error("Bhai pehle Login toh kar lo! ❌");
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase.from('reviews').insert([{
        product_id: productId,
        user_id: currentUser.id,
        username: currentUser.user_metadata?.username || currentUser.email?.split('@')[0],
        rating: rating,
        comment: comment.trim()
      }]);
      if (error) throw error;
      toast.success("Review post ho gaya! 🔥");
      setComment(""); setRating(1); loadReviews(); // Reset to 1 star
    } catch (err: any) {
      toast.error("Review post nahi hua!");
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDelete = async (id: number) => {
    try {
      const { error } = await supabase.from('reviews').delete().eq('id', id);
      if (error) throw error;
      toast.success("Review uda diya gaya! 👋");
      loadReviews();
    } catch (err) {
      toast.error("Delete nahi ho paya!");
    } finally {
      setDeleteId(null);
    }
  };

  return (
    <div className="mt-10 p-6 border-t border-slate-800 bg-black/40 rounded-[2rem] shadow-2xl">
      <h3 className="text-2xl font-black mb-8 text-white uppercase italic tracking-tighter flex items-center gap-3">
        <span className="w-2 h-8 bg-blue-600 rounded-full"></span>
        Customer Experience
      </h3>

      {/* Input Section */}
      <div className="mb-10 p-6 bg-slate-900/50 rounded-3xl border border-slate-800">
        <div className="flex flex-col gap-5">
          <div className="flex gap-4 items-center">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Rate Product:</span>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button 
                  key={star} 
                  type="button" 
                  onClick={() => setRating(star)} 
                  className={`text-2xl transition-all ${star <= rating ? "text-yellow-400" : "text-slate-700 hover:text-slate-500"}`}
                >
                  ★
                </button>
              ))}
            </div>
          </div>
          <textarea
            className="w-full p-5 rounded-2xl bg-slate-950 border border-slate-800 outline-none text-white text-sm focus:border-blue-500 transition-all"
            placeholder="Share your experience..."
            rows={3} value={comment} onChange={(e) => setComment(e.target.value)}
          />
          <button type="button" onClick={handlePost} disabled={isSubmitting} className="bg-blue-600 hover:bg-blue-700 text-white px-10 py-4 rounded-2xl font-black text-xs uppercase self-end">
            {isSubmitting ? "Posting..." : "Submit Review"}
          </button>
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-6">
        {reviews.map((r) => (
          <div key={r.id} className="relative p-6 bg-slate-900/30 border border-slate-800/50 rounded-[1.5rem] group overflow-hidden">
            
            {/* Rectangle Confirmation Overlay (Full Width) */}
            {deleteId === r.id && (
              <div className="absolute inset-0 z-20 flex items-center justify-center bg-slate-950/90 backdrop-blur-sm animate-in fade-in duration-200">
                <div className="flex flex-col md:flex-row items-center gap-6 p-4 w-full justify-center">
                  <span className="text-white text-sm font-black uppercase italic tracking-widest">Are you sure you want to delete this review?</span>
                  <div className="flex gap-4">
                    <button 
                      onClick={() => setDeleteId(null)} 
                      className="px-8 py-2 bg-slate-800 hover:bg-slate-700 text-white text-[10px] font-black rounded-full uppercase transition-all"
                    >
                      No
                    </button>
                    <button 
                      onClick={() => confirmDelete(r.id)} 
                      className="px-8 py-2 bg-red-600 hover:bg-red-700 text-white text-[10px] font-black rounded-full uppercase shadow-lg shadow-red-600/20 transition-all"
                    >
                      Yes
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-between items-start">
              <div className="flex flex-col gap-1">
                <p className="font-black text-xs text-blue-500 uppercase">@{r.username}</p>
                <div className="flex text-yellow-500 text-[10px]">{"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}</div>
              </div>
              {currentUser?.id === r.user_id && (
                <button 
                  onClick={() => setDeleteId(r.id)} 
                  className="text-red-500/50 hover:text-red-500 text-[10px] font-black uppercase opacity-0 group-hover:opacity-100 transition-all border border-red-500/20 px-3 py-1 rounded-md"
                >
                  Delete
                </button>
              )}
            </div>
            <p className="text-slate-300 text-sm mt-3 leading-relaxed font-medium">{r.comment}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReviewSection;