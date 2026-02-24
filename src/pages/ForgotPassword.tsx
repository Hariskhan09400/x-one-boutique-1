import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';
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
      // 1. Sabse pehle hum check karenge ki user register hai ya nahi
      // Humein 'auth' schema se data check karne ke liye is method ka use karna chahiye
      const { data: signInData, error: signInError } = await supabase.auth.signInWithOtp({
        email: email,
        options: {
          shouldCreateUser: false, // Yeh sabse important hai, agar user nahi hoga toh error dega
        },
      });

      // Agar user nahi mila, toh Supabase error dega: "Signups not allowed for this helper" ya "User not found"
      if (signInError) {
        // Specific check for user not existing
        if (signInError.message.toLowerCase().includes("not allowed") || signInError.message.toLowerCase().includes("not found")) {
          alert("Bhai, ye email hamare record mein nahi hai. Pehle register karo!");
          setLoading(false);
          return;
        }
      }

      // 2. Agar user mil gaya, toh password reset link bhejenge
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (resetError) {
        alert("Error: " + resetError.message);
      } else {
        setMessage("Bhai, reset link bhej diya hai! Spam folder check karna mat bhoolna. 📧");
      }
    } catch (err) {
      alert("Kuch technical issue hai, baad mein try karein.");
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
                {loading ? "CHECKING & SENDING..." : "SEND RESET LINK"}
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