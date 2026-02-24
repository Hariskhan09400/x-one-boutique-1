import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';
// File path ko check kar lena bhai, 'lib' folder ke andar 'supabase.ts' honi chahiye
import { supabase } from '../lib/supabase'; 

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // --- LOGIC START: Check if user exists in your data ---
      // Hum 'users' table (ya jo bhi aapka profile table hai) se email check kar rahe hain
      const { data, error: userError } = await supabase
        .from('profiles') // AGAR TABLE NAAM ALAG HAI TOH YAHAN CHANGE KAREIN (e.g., 'users')
        .select('email')
        .eq('email', email)
        .maybeSingle();

      if (userError) {
        alert("Database connection error: " + userError.message);
        setLoading(false);
        return;
      }

      if (!data) {
        alert("Bhai, ye email hamare record mein nahi hai. Pehle register karo!");
        setLoading(false);
        return;
      }
      // --- LOGIC END ---

      // Agar user mil gaya, tabhi reset link bhejenge
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        alert("Error: " + error.message);
      } else {
        setMessage("Bhai, reset link bhej diya hai! Spam folder check karna mat bhoolna. 📧");
      }
    } catch (err) {
      alert("Kuch gadbad ho gayi, firse try karo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-md w-full bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-xl text-center">
        {!message ? (
          <>
            <button onClick={() => navigate('/login')} className="flex items-center gap-2 text-slate-400 hover:text-blue-600 mb-6 transition-colors">
              <ArrowLeft size={18} /> Back to Login
            </button>
            <h2 className="text-3xl font-black dark:text-white mb-2 italic text-left">FORGOT PASSWORD?</h2>
            <p className="text-slate-500 mb-8 font-medium text-left">Email daalo, link mil jayegi.</p>
            <form onSubmit={handleReset} className="space-y-4 text-left">
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input 
                  type="email" placeholder="Enter your email" 
                  className="w-full pl-12 pr-4 py-4 rounded-xl bg-slate-100 dark:bg-slate-800 outline-none focus:ring-2 ring-blue-600 transition-all dark:text-white"
                  value={email} onChange={(e) => setEmail(e.target.value)} required
                />
              </div>
              <button disabled={loading} className="w-full py-4 bg-blue-600 text-white rounded-xl font-black uppercase tracking-widest hover:bg-blue-700 active:scale-95 transition-all disabled:opacity-50">
                {loading ? "SENDING..." : "SEND RESET LINK"}
              </button>
            </form>
          </>
        ) : (
          <div className="space-y-6">
            <div className="flex justify-center"><CheckCircle2 size={64} className="text-green-500" /></div>
            <h2 className="text-2xl font-black dark:text-white uppercase italic">Check Your Email</h2>
            <p className="text-slate-500">{message}</p>
            <button onClick={() => navigate('/login')} className="w-full py-4 bg-slate-800 text-white rounded-xl font-bold">BACK TO LOGIN</button>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default ForgotPassword;