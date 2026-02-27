import { useState, useEffect } from "react";
import { EyeIcon, EyeSlashIcon, UserIcon, EnvelopeIcon, LockClosedIcon, CheckCircleIcon, SparklesIcon } from "@heroicons/react/24/outline";
import { useNavigate } from "react-router-dom";
import toast from 'react-hot-toast'; 
import { handleLogin, handleSignup, handleForgotPassword } from "../utils/auth"; 
import { supabase } from "../lib/supabase"; 
import confetti from 'canvas-confetti'; 

interface LoginPageProps {
  onLogin: (userData: { name: string; email: string }) => void;
}

export default function LoginPage({ onLogin }: LoginPageProps) {
  const [isLogin, setIsLogin] = useState(true); 
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState(""); 
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isShaking, setIsShaking] = useState(false);
  
  const [rememberMe, setRememberMe] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);

  const navigate = useNavigate();
  const AUTH_TOAST_ID = "auth-action-toast";

  useEffect(() => {
    const savedEmail = localStorage.getItem("rememberedEmail");
    if (savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    }
  }, []);

  const triggerBawalSuccess = () => {
    if (rememberMe) {
      localStorage.setItem("rememberedEmail", email);
    } else {
      localStorage.removeItem("rememberedEmail");
    }

    setShowSuccessPopup(true);
    if ("vibrate" in navigator) navigator.vibrate([100, 50, 100]); 
    setIsShaking(true);
    setTimeout(() => setIsShaking(false), 500);

    const scalar = 2;
    confetti({
      shapes: [confetti.shapeFromText({ text: '💎', scalar }), confetti.shapeFromText({ text: '✨', scalar })],
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#2563eb', '#3b82f6', '#ffffff']
    });

    setTimeout(() => setShowSuccessPopup(false), 3000);
  };

  const loginWithGoogle = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: window.location.origin },
      });
      if (error) throw error;
    } catch (err: any) {
      toast.error(err.message || "Google Login failed!", { id: AUTH_TOAST_ID });
    }
  };

  const onForgotPasswordClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error("Enter email first!", { id: AUTH_TOAST_ID });
      return;
    }
    toast.loading("Sending link...", { id: AUTH_TOAST_ID });
    try {
      const result = await handleForgotPassword(email);
      if (result.success) {
        toast.success("Link sent! 📧", { id: AUTH_TOAST_ID });
      } else {
        toast.error(result.message || "Failed", { id: AUTH_TOAST_ID });
      }
    } catch (err) {
      toast.error("Error occurred", { id: AUTH_TOAST_ID });
    }
  };

  const checkIfEmailExists = async (userEmail: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles') 
        .select('email')
        .eq('email', userEmail.trim().toLowerCase());
      if (error) return false;
      return data && data.length > 0;
    } catch (err) {
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return; 

    setIsLoading(true);
    toast.loading(isLogin ? "Creating your style with X One Boutique..." : "Joining the elite...", { id: AUTH_TOAST_ID });

    try {
      if (isLogin) {
        const result = await handleLogin({ email, password });
        if (result.success) {
          triggerBawalSuccess(); 
          setTimeout(() => {
            onLogin({ name: result.user.username, email: result.user.email });
            navigate("/");
          }, 2000);
        } else {
          if ("vibrate" in navigator) navigator.vibrate(50);
          toast.error("Invalid Credentials", { id: AUTH_TOAST_ID });
        }
      } else {
        const alreadyExists = await checkIfEmailExists(email);
        if (alreadyExists) {
          toast.error("Email taken", { id: AUTH_TOAST_ID });
          setIsLoading(false);
          return;
        }
        const result = await handleSignup({ username: name, email, password });
        if (result.success) {
          triggerBawalSuccess();
          toast.success("Welcome aboard!", { id: AUTH_TOAST_ID });
          setIsLogin(true);
          setName(""); 
        } else {
          toast.error(result.message || "Failed", { id: AUTH_TOAST_ID });
        }
      }
    } catch (err) {
      toast.error("Connection Error", { id: AUTH_TOAST_ID });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden transition-colors duration-500 bg-slate-50 dark:bg-[#0a0f1e]">
      
      {/* --- ADAPTIVE BACKGROUND --- */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-500/10 dark:bg-blue-600/20 rounded-full blur-[100px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] bg-indigo-500/10 dark:bg-indigo-600/20 rounded-full blur-[100px]" />
      </div>

      {/* --- SUCCESS POPUP --- */}
      {showSuccessPopup && (
        <div className="fixed top-8 left-1/2 -translate-x-1/2 z-[100] w-[90%] max-w-[380px] animate-slide-down">
          <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-2xl border border-blue-200 dark:border-blue-900/50 p-5 rounded-3xl shadow-2xl flex items-center gap-4">
            <div className="bg-blue-600 rounded-2xl p-2.5 text-white shadow-lg shadow-blue-500/30">
              <CheckCircleIcon className="w-7 h-7" />
            </div>
            <div>
              <h4 className="text-slate-900 dark:text-white font-black text-lg leading-tight">Login Successful</h4>
              <p className="text-blue-600 dark:text-blue-400 font-bold text-sm">Welcome Back 👋</p>
            </div>
          </div>
        </div>
      )}

      {/* --- DYNAMIC STYLES --- */}
      <style>{`
        @keyframes slide-down {
          0% { transform: translate(-50%, -100px); opacity: 0; }
          100% { transform: translate(-50%, 0); opacity: 1; }
        }
        .animate-slide-down { animation: slide-down 0.5s cubic-bezier(0.19, 1, 0.22, 1) forwards; }
        .glass-container {
          background: rgba(255, 255, 255, 0.6);
          border: 1px solid rgba(255, 255, 255, 0.7);
        }
        .dark .glass-container {
          background: rgba(15, 23, 42, 0.6);
          border: 1px solid rgba(51, 65, 85, 0.5);
        }
      `}</style>

      {/* --- LOGIN CARD --- */}
      <div className={`relative z-10 w-full max-w-[420px] px-4 transition-transform duration-300 ${isShaking ? 'animate-bounce' : ''}`}>
        <div className="glass-container backdrop-blur-3xl rounded-[2.5rem] p-8 md:p-10 shadow-2xl dark:shadow-blue-900/10">
          
          <div className="text-center mb-8">
            <div className="inline-flex p-3 bg-blue-600 rounded-2xl shadow-xl shadow-blue-500/20 mb-4">
              <SparklesIcon className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight leading-tight mb-1">
              X One Boutique
            </h2>
            <p className="text-slate-500 dark:text-slate-400 font-medium text-sm">
              {isLogin ? "Your journey to style begins here" : "Sign up for exclusive access"}
            </p>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            
            {!isLogin && (
              <div className="relative group">
                <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                <input
                  type="text" required value={name} onChange={(e) => setName(e.target.value)}
                  placeholder="Full Name"
                  className="w-full pl-12 pr-4 py-4 bg-white/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all dark:text-white placeholder:text-slate-400"
                />
              </div>
            )}

            <div className="relative group">
              <EnvelopeIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
              <input
                type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="Email Address"
                className="w-full pl-12 pr-4 py-4 bg-white/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all dark:text-white placeholder:text-slate-400"
              />
            </div>

            <div className="relative group">
              <LockClosedIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
              <input
                type={showPassword ? "text" : "password"} required value={password} onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="w-full pl-12 pr-12 py-4 bg-white/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all dark:text-white placeholder:text-slate-400"
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-500">
                {showPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
              </button>
            </div>

            {/* REMEMBER ME UPGRADED */}
            <div className="flex items-center justify-between px-1">
              <button 
                type="button" 
                onClick={() => setRememberMe(!rememberMe)}
                className="flex items-center gap-2.5 cursor-pointer group outline-none"
              >
                <div className={`w-10 h-5 rounded-full relative transition-colors duration-300 ${rememberMe ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-700'}`}>
                  <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all duration-300 ${rememberMe ? 'left-6' : 'left-1'}`} />
                </div>
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">Remember Me</span>
              </button>
              {isLogin && (
                <button type="button" onClick={onForgotPasswordClick} className="text-xs font-black text-blue-600 dark:text-blue-400 hover:underline">
                  ForgotPassword?
                </button>
              )}
            </div>

            {/* ACTION BUTTONS */}
            <div className="space-y-3 pt-2">
              <button
                type="submit" disabled={isLoading}
                className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-black uppercase tracking-widest rounded-2xl shadow-lg shadow-blue-500/20 transition-all active:scale-[0.97] disabled:opacity-70 flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : (isLogin ? "Login" : "Get Started")}
              </button>

              <button
                type="button" onClick={() => setIsLogin(!isLogin)}
                className="w-full py-4 bg-transparent border-2 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all active:scale-[0.97]"
              >
                {isLogin ? "Create New Account" : "Back to Login"}
              </button>
            </div>

            <div className="relative flex items-center py-2">
              <div className="flex-1 border-t border-slate-200 dark:border-slate-800"></div>
              <span className="px-4 text-[10px] text-slate-400 dark:text-slate-500 font-black tracking-widest">OR CONNECT</span>
              <div className="flex-1 border-t border-slate-200 dark:border-slate-800"></div>
            </div>

            <button
              type="button" onClick={loginWithGoogle}
              className="w-full flex items-center justify-center gap-3 py-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all shadow-sm active:scale-[0.97]"
            >
              <svg className="w-5 h-5" viewBox="0 0 48 48">
                <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z" />
                <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z" />
                <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z" />
                <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z" />
              </svg>
              Continue with Google
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}