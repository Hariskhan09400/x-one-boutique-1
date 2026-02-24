import { useState } from "react";
import { LockClosedIcon, EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";
import { useNavigate } from "react-router-dom";
import toast from 'react-hot-toast';
import { handleUpdatePassword } from "../utils/auth";

export default function UpdatePassword() {
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters long.");
      return;
    }

    setIsLoading(true);
    const loadingToast = toast.loading("Updating password...");

    try {
      const result = await handleUpdatePassword(newPassword);
      if (result.success) {
        toast.success("Password updated successfully! Please login.", { id: loadingToast });
        navigate("/login"); // Password update hone ke baad login pe bhej do
      } else {
        toast.error(result.message || "Failed to update password", { id: loadingToast });
      }
    } catch (err) {
      toast.error("Something went wrong!", { id: loadingToast });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:from-slate-950 dark:to-blue-900/20 flex items-center justify-center px-4">
      <div className="max-w-md w-full space-y-8 bg-white dark:bg-slate-800/40 p-8 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-700">
        <div className="text-center">
          <h2 className="text-3xl font-black text-slate-900 dark:text-white">Set New Password</h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">Enter your new secure password below.</p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="relative group">
            <LockClosedIcon className="absolute left-4 top-[24px] h-5 w-5 text-slate-400 z-10" />
            <input
              type={showPassword ? "text" : "password"}
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter new password"
              className="w-full pl-12 pr-12 py-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl outline-none focus:border-blue-500 dark:text-white"
            />
            <button
              type="button"
              className="absolute right-4 top-[24px] -translate-y-1/2 text-slate-400"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
            </button>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl transition-all disabled:opacity-50"
          >
            Update Password
          </button>
        </form>
      </div>
    </div>
  );
}