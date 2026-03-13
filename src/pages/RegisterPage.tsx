import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "../lib/supabase";
import toast from "react-hot-toast";
import { Eye, EyeOff, Loader2, UserPlus } from "lucide-react";

const RegisterPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    const { name, email, password, confirmPassword } = formData;

    if (!name.trim()) return toast.error("Please enter your name");
    if (!email) return toast.error("Please enter your email");
    if (password.length < 6) return toast.error("Password must be at least 6 characters");
    if (password !== confirmPassword) return toast.error("Passwords do not match ❌");

    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { name } },
      });

      if (error) throw error;

      toast.success("Account created! Please check your email to verify. 📧");
      navigate("/login");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const updateField = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black uppercase italic text-slate-900 dark:text-white tracking-tight">
            X ONE BOUTIQUE
          </h1>
          <p className="text-slate-400 text-sm mt-1 font-medium">
            Create your account
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-100 dark:border-slate-800 p-8">
          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="text-xs font-black text-slate-400 uppercase mb-1.5 block">
                Full Name
              </label>
              <input
                type="text"
                placeholder="Your full name"
                value={formData.name}
                onChange={updateField("name")}
                className="w-full p-4 rounded-xl bg-slate-100 dark:bg-slate-800 outline-none focus:ring-2 focus:ring-blue-600 dark:text-white"
                required
              />
            </div>

            <div>
              <label className="text-xs font-black text-slate-400 uppercase mb-1.5 block">
                Email
              </label>
              <input
                type="email"
                placeholder="your@email.com"
                value={formData.email}
                onChange={updateField("email")}
                className="w-full p-4 rounded-xl bg-slate-100 dark:bg-slate-800 outline-none focus:ring-2 focus:ring-blue-600 dark:text-white"
                required
              />
            </div>

            <div>
              <label className="text-xs font-black text-slate-400 uppercase mb-1.5 block">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Min. 6 characters"
                  value={formData.password}
                  onChange={updateField("password")}
                  className="w-full p-4 rounded-xl bg-slate-100 dark:bg-slate-800 outline-none focus:ring-2 focus:ring-blue-600 dark:text-white pr-12"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div>
              <label className="text-xs font-black text-slate-400 uppercase mb-1.5 block">
                Confirm Password
              </label>
              <input
                type="password"
                placeholder="Re-enter password"
                value={formData.confirmPassword}
                onChange={updateField("confirmPassword")}
                className="w-full p-4 rounded-xl bg-slate-100 dark:bg-slate-800 outline-none focus:ring-2 focus:ring-blue-600 dark:text-white"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-wide hover:bg-blue-700 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
            >
              {isLoading ? (
                <Loader2 size={20} className="animate-spin" />
              ) : (
                <>
                  <UserPlus size={18} /> CREATE ACCOUNT
                </>
              )}
            </button>
          </form>

          <p className="text-center text-sm text-slate-400 mt-6">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-blue-600 font-black hover:underline"
            >
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
