import { useState } from "react";
import { EyeIcon, EyeSlashIcon, UserIcon, EnvelopeIcon, LockClosedIcon } from "@heroicons/react/24/outline";
import { useNavigate, Link } from "react-router-dom"; // Link import kiya
// IMPORT THE NEW UTILS WE CREATED
import { handleLogin, handleSignup } from "../utils/auth"; 

interface LoginPageProps {
  onLogin: (userData: { name: string; email: string }) => void;
}

export default function LoginPage({ onLogin }: LoginPageProps) {
  const [isLogin, setIsLogin] = useState(true); 
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState(""); // This is 'username' for the backend
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      if (isLogin) {
        // --- REAL LOGIN CALL ---
        const result = await handleLogin({ email, password });
        if (result.success) {
          onLogin({ name: result.user.username, email: result.user.email });
          navigate("/");
        } else {
          setError(result.message || "Invalid credentials");
        }
      } else {
        // --- REAL SIGNUP CALL ---
        const result = await handleSignup({ username: name, email, password });
        if (result.success) {
          alert("Registration Successful! Please Login.");
          setIsLogin(true);
        } else {
          setError(result.message || "Signup failed");
        }
      }
    } catch (err) {
      setError("Server connection failed. Is your backend running?");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-950 dark:to-blue-900/20 flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        
        {/* --- HEADER --- */}
        <div className="text-center">
          <div className="mx-auto h-20 w-20 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-2xl flex items-center justify-center shadow-2xl mb-6 transform hover:rotate-12 transition-transform duration-300">
            <UserIcon className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight mb-2">
            X One Boutique
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            {isLogin ? "Welcome back! Please login." : "Create an account to start shopping."}
          </p>
        </div>

        {/* --- FORM CARD --- */}
        <form className="mt-8 space-y-6 bg-white/70 dark:bg-slate-800/40 backdrop-blur-2xl rounded-3xl p-8 shadow-2xl border border-white/40 dark:border-slate-700/50" onSubmit={handleSubmit}>
          
          {error && (
            <div className="bg-red-100 dark:bg-red-900/30 border border-red-200 text-red-600 dark:text-red-400 px-4 py-3 rounded-xl text-sm animate-pulse text-center">
              {error}
            </div>
          )}

          <div className="space-y-4">
            {/* FULL NAME FIELD (Only for Sign Up) */}
            {!isLogin && (
              <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">Full Name</label>
                <div className="relative">
                  <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all dark:text-white"
                    placeholder="John Doe"
                  />
                </div>
              </div>
            )}

            {/* EMAIL FIELD */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">Email Address</label>
              <div className="relative">
                <EnvelopeIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all dark:text-white"
                  placeholder="name@company.com"
                />
              </div>
            </div>

            {/* PASSWORD FIELD */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">Password</label>
              <div className="relative">
                <LockClosedIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-12 py-4 bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all dark:text-white"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-blue-500 transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                </button>
              </div>
            </div>
          </div>

          {/* UPGRADE: FORGOT PASSWORD LINK POSITIONED CORRECTLY */}
          {isLogin && (
            <div className="flex justify-end -mt-2">
              <Link 
                to="/forgot-password" 
                className="text-xs font-bold text-blue-500 hover:text-blue-600 transition-colors"
              >
                Forgot Password?
              </Link>
            </div>
          )}

          {/* --- SUBMIT BUTTON --- */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-4 px-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white text-lg font-bold rounded-2xl shadow-lg shadow-blue-500/30 transform transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
          >
            {isLoading && <span className="animate-spin border-2 border-white border-t-transparent rounded-full h-5 w-5"></span>}
            {isLogin ? "Login" : "Create Account"}
          </button>

          {/* --- ALTERNATIVE ACTIONS --- */}
          <div className="text-center space-y-4">
            
            <div className="flex items-center gap-3">
              <div className="flex-1 border-t border-slate-200 dark:border-slate-700"></div>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">OR</span>
              <div className="flex-1 border-t border-slate-200 dark:border-slate-700"></div>
            </div>

            <p className="text-sm text-slate-500">
              {isLogin ? "Don't have an account?" : "Already have an account?"}{' '}
              <button
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                className="font-bold text-blue-600 hover:text-blue-700 underline-offset-4 hover:underline"
              >
                {isLogin ? "Sign up" : "Login"}
              </button>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}