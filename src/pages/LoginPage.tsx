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
        toast.success("Reset link sent! Check email. 📧", { id: loadingToast });
      } else {
        toast.error(result.message || "Failed to send link", { id: loadingToast });
      }
    } catch (err) {
      toast.error("Something went wrong!", { id: loadingToast });
    }
  };

  const checkIfEmailExists = async (userEmail: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles') 
        .select('email')
        .eq('email', userEmail.trim().toLowerCase());
      
      if (error) {
        console.error("DB Check Error:", error);
        return false;
      }
      return data && data.length > 0;
    } catch (err) {
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return; 
    
    setIsLoading(true);
    const loadingToast = toast.loading(isLogin ? "Authenticating..." : "Creating account...");

    try {
      if (isLogin) {
        const result = await handleLogin({ email, password });
        if (result.success) {
          toast.success("Welcome back! 🎉", { id: loadingToast });
          onLogin({ name: result.user.username, email: result.user.email });
          navigate("/");
        } else {
          toast.error("Invalid email or password.", { id: loadingToast });
        }
      } else {
        const alreadyExists = await checkIfEmailExists(email);
        
        if (alreadyExists) {
          toast.error("Bhai, ye email pehle se hai. Login karo!", { id: loadingToast });
          setIsLoading(false);
          return;
        }

        const result = await handleSignup({ username: name, email, password });
        if (result.success) {
          toast.success("Account created! Please login.", { id: loadingToast });
          setIsLogin(true);
          setName(""); 
        } else {
          toast.error(result.message || "Signup failed", { id: loadingToast });
        }
      }
    } catch (err) {
      console.error("Submit Error:", err);
      toast.error("Connection error. Try again.", { id: loadingToast });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-950 dark:to-blue-900/20 flex items-center justify-center px-4 py-12 transition-colors duration-500">
      <div className="max-w-md w-full space-y-8">
        
        <div className="text-center">
          <div className="mx-auto h-20 w-20 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-2xl flex items-center justify-center shadow-2xl mb-6">
            <UserIcon className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-3xl font-black text-slate-900 dark:text-white uppercase italic tracking-tight">
            X One Boutique
          </h2>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            {isLogin ? "Step into style! Please login." : "Join the squad and start shopping."}
          </p>
        </div>

        <div className="mt-8 bg-white dark:bg-slate-800/40 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-slate-200 dark:border-slate-700">
          <form className="space-y-5" onSubmit={handleSubmit}>
            {!isLogin && (
              <div className="relative group">
                <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Full Name"
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:text-white"
                />
              </div>
            )}

            <div className="relative group">
              <EnvelopeIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email Address"
                className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:text-white"
              />
            </div>

            <div className="relative group">
              <LockClosedIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="w-full pl-12 pr-12 py-4 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:text-white"
              />
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-500"
              >
                {showPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
              </button>
            </div>

            {isLogin && (
              <div className="flex justify-end">
                <button type="button" onClick={onForgotPasswordClick} className="text-xs font-bold text-blue-600 hover:underline">
                  Forgot Password?
                </button>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl shadow-lg transition-all active:scale-95 disabled:opacity-50"
            >
              {isLogin ? "Login" : "Create Account"}
            </button>

            <p className="text-center text-sm text-slate-600 dark:text-slate-400">
              {isLogin ? "New here? " : "Have an account? "}
              <button type="button" onClick={() => setIsLogin(!isLogin)} className="text-blue-600 font-bold hover:underline">
                {isLogin ? "Sign up" : "Login"}
              </button>
            </p>

            <div className="relative flex items-center py-2">
              <div className="flex-1 border-t border-slate-200 dark:border-slate-700"></div>
              <span className="px-3 text-xs text-slate-400 font-bold">OR</span>
              <div className="flex-1 border-t border-slate-200 dark:border-slate-700"></div>
            </div>

            {/* --- FIXED GOOGLE BUTTON WITH SVG ICON --- */}
            <button
              type="button"
              onClick={loginWithGoogle}
              className="w-full flex items-center justify-center gap-3 py-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl font-bold text-slate-700 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-800 transition-all shadow-sm active:scale-[0.98]"
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