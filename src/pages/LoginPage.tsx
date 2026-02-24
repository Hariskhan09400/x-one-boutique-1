import { useState } from "react";
import { EyeIcon, EyeSlashIcon, UserIcon, EnvelopeIcon, LockClosedIcon } from "@heroicons/react/24/outline";
import { useNavigate } from "react-router-dom";
import toast from 'react-hot-toast'; 
import { handleLogin, handleSignup, handleForgotPassword } from "../utils/auth"; 
import { supabase } from "../lib/supabase"; 

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
  const navigate = useNavigate();

  const loginWithGoogle = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
        },
      });
      if (error) throw error;
    } catch (err: any) {
      toast.error(err.message || "Google Login failed!");
    }
  };

  const onForgotPasswordClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error("Please enter your email address first!");
      return;
    }

    const loadingToast = toast.loading("Sending reset link...");
    try {
      const result = await handleForgotPassword(email);
      if (result.success) {
        toast.success("Reset link sent! Please check your email inbox. 📧", { id: loadingToast });
      } else {
        toast.error(result.message || "Failed to send link", { id: loadingToast });
      }
    } catch (err) {
      toast.error("Something went wrong!", { id: loadingToast });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const loadingToast = toast.loading(isLogin ? "Checking credentials..." : "Creating account...");

    try {
      if (isLogin) {
        const result = await handleLogin({ email, password });
        if (result.success) {
          toast.success("Login successfully! 🎉", { id: loadingToast });
          onLogin({ name: result.user.username, email: result.user.email });
          navigate("/");
        } else {
          toast.error("The login information you entered is incorrect.", { 
            id: loadingToast,
            duration: 4000 
          });
        }
      } else {
        const result = await handleSignup({ username: name, email, password });
        if (result.success) {
          toast.success("Registration Successful! Please Login.", { id: loadingToast });
          setIsLogin(true);
        } else {
          toast.error(result.message || "Signup failed", { id: loadingToast });
        }
      }
    } catch (err) {
      toast.error("Server connection failed. Is your backend running?", { id: loadingToast });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-950 dark:to-blue-900/20 flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8 transition-colors duration-500">
      <div className="max-w-md w-full space-y-8">
        
        {/* --- HEADER --- */}
        <div className="text-center">
          <div className="mx-auto h-20 w-20 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-2xl flex items-center justify-center shadow-2xl mb-6 transform hover:rotate-12 transition-transform duration-300">
            <UserIcon className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight mb-2 uppercase italic">
            X One Boutique
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">
            {isLogin ? "Step into style! Please login." : "Join the squad and start shopping."}
          </p>
        </div>

        {/* --- FORM CARD --- */}
        <div className="mt-8 bg-white dark:bg-slate-800/40 backdrop-blur-2xl rounded-3xl p-8 shadow-2xl border border-slate-200/60 dark:border-slate-700/50">
          
          <form className="space-y-5" onSubmit={handleSubmit}>
            {!isLogin && (
              <div className="relative group animate-in fade-in slide-in-from-top-2 duration-300">
                <UserIcon className="absolute left-4 top-[24px] h-5 w-5 text-slate-400 z-10 transition-colors group-focus-within:text-blue-500" />
                <input
                  type="text"
                  required
                  id="fullname"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder=" "
                  className="peer w-full pl-12 pr-4 pt-6 pb-2 bg-slate-50/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all dark:text-white placeholder-transparent text-slate-900"
                />
                <label htmlFor="fullname" className="absolute left-12 top-4 text-slate-500 dark:text-slate-400 text-sm transition-all duration-200 cursor-text peer-placeholder-shown:text-base peer-placeholder-shown:top-[1.1rem] peer-focus:top-1.5 peer-focus:text-xs peer-focus:text-blue-500 peer-[:not(:placeholder-shown)]:top-1.5 peer-[:not(:placeholder-shown)]:text-xs">
                  Full Name
                </label>
              </div>
            )}

            <div className="relative group">
              <EnvelopeIcon className="absolute left-4 top-[24px] h-5 w-5 text-slate-400 z-10 transition-colors group-focus-within:text-blue-500" />
              <input
                type="email"
                required
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder=" "
                className="peer w-full pl-12 pr-4 pt-6 pb-2 bg-slate-50/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all dark:text-white placeholder-transparent text-slate-900"
              />
              <label htmlFor="email" className="absolute left-12 top-4 text-slate-500 dark:text-slate-400 text-sm transition-all duration-200 cursor-text peer-placeholder-shown:text-base peer-placeholder-shown:top-[1.1rem] peer-focus:top-1.5 peer-focus:text-xs peer-focus:text-blue-500 peer-[:not(:placeholder-shown)]:top-1.5 peer-[:not(:placeholder-shown)]:text-xs">
                Email Address
              </label>
            </div>

            <div className="relative group">
              <LockClosedIcon className="absolute left-4 top-[24px] h-5 w-5 text-slate-400 z-10 transition-colors group-focus-within:text-blue-500" />
              <input
                type={showPassword ? "text" : "password"}
                required
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder=" "
                className="peer w-full pl-12 pr-12 pt-6 pb-2 bg-slate-50/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all dark:text-white placeholder-transparent text-slate-900"
              />
              <label htmlFor="password" className="absolute left-12 top-4 text-slate-500 dark:text-slate-400 text-sm transition-all duration-200 cursor-text peer-placeholder-shown:text-base peer-placeholder-shown:top-[1.1rem] peer-focus:top-1.5 peer-focus:text-xs peer-focus:text-blue-500 peer-[:not(:placeholder-shown)]:top-1.5 peer-[:not(:placeholder-shown)]:text-xs">
                Password
              </label>
              <button type="button" className="absolute right-4 top-[28px] -translate-y-1/2 p-1 text-slate-400 hover:text-blue-500 transition-colors z-20" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
              </button>
            </div>

            {isLogin && (
              <div className="flex justify-end -mt-2">
                <button 
                  type="button"
                  onClick={onForgotPasswordClick}
                  className="text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors bg-transparent border-none cursor-pointer"
                >
                  Forgot Password?
                </button>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 px-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white text-lg font-bold rounded-2xl shadow-lg shadow-blue-500/30 transform transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
            >
              {isLogin ? "Login" : "Create Account"}
            </button>

            <div className="text-center pt-2">
              <p className="text-sm text-slate-600 dark:text-slate-500">
                {isLogin ? "Don't have an account? " : "Already have an account? "}
                <button
                  type="button"
                  onClick={() => setIsLogin(!isLogin)}
                  className="font-bold text-blue-600 hover:text-blue-700 underline-offset-4 hover:underline"
                >
                  {isLogin ? "Sign up" : "Login"}
                </button>
              </p>
            </div>

            {/* --- DIVIDER --- */}
            <div className="relative my-4 flex items-center gap-3">
              <div className="flex-1 border-t border-slate-200 dark:border-slate-700"></div>
              <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">OR</span>
              <div className="flex-1 border-t border-slate-200 dark:border-slate-700"></div>
            </div>

            {/* --- GOOGLE BUTTON (NOW AT THE BOTTOM) --- */}
            <button
              type="button"
              onClick={loginWithGoogle}
              className="w-full flex items-center justify-center gap-3 py-4 px-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl font-bold text-slate-700 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-800 transition-all active:scale-[0.98] shadow-sm"
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