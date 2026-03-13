import { useState } from "react";
import { useAuth } from "../App";
import { supabase } from "../lib/supabase";
import toast from "react-hot-toast";
import { User, Mail, Lock, Save, Loader2 } from "lucide-react";

const ProfilePage = () => {
  const { user } = useAuth();
  const [name, setName] = useState(user?.name || "");
  const [isSaving, setIsSaving] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const handleSaveName = async () => {
    if (!name.trim()) return toast.error("Name cannot be empty");
    setIsSaving(true);
    try {
      const { error } = await supabase.auth.updateUser({
        data: { name },
      });
      if (error) throw error;
      // Update localStorage
      const saved = localStorage.getItem("xob_user");
      if (saved) {
        const parsed = JSON.parse(saved);
        localStorage.setItem("xob_user", JSON.stringify({ ...parsed, name }));
      }
      toast.success("Name updated successfully! ✅");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (!newPassword) return toast.error("Enter new password");
    if (newPassword.length < 6) return toast.error("Password must be at least 6 characters");
    if (newPassword !== confirmPassword) return toast.error("Passwords do not match ❌");

    setIsChangingPassword(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      toast.success("Password changed successfully! 🔐");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsChangingPassword(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-black uppercase italic dark:text-white mb-8">
        My Profile
      </h1>

      {/* Avatar */}
      <div className="flex items-center gap-4 mb-10 p-6 bg-slate-50 dark:bg-slate-800/50 rounded-2xl">
        <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center">
          <span className="text-white font-black text-2xl uppercase">
            {user?.name?.charAt(0) || "U"}
          </span>
        </div>
        <div>
          <p className="font-black text-lg dark:text-white">{user?.name}</p>
          <p className="text-slate-400 text-sm">{user?.email}</p>
        </div>
      </div>

      {/* Update Name */}
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 mb-6">
        <h2 className="font-black uppercase text-sm text-slate-400 mb-4 flex items-center gap-2">
          <User size={16} /> Personal Info
        </h2>
        <div className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-400 uppercase mb-1 block">
              Full Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-4 rounded-xl bg-slate-100 dark:bg-slate-800 outline-none focus:ring-2 focus:ring-blue-600 dark:text-white"
              placeholder="Your full name"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-400 uppercase mb-1 block">
              Email
            </label>
            <input
              type="email"
              value={user?.email || ""}
              disabled
              className="w-full p-4 rounded-xl bg-slate-100 dark:bg-slate-800 outline-none text-slate-400 cursor-not-allowed"
            />
          </div>
          <button
            onClick={handleSaveName}
            disabled={isSaving}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-black text-sm hover:bg-blue-700 transition-all active:scale-95 disabled:opacity-50"
          >
            {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            SAVE CHANGES
          </button>
        </div>
      </div>

      {/* Change Password */}
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6">
        <h2 className="font-black uppercase text-sm text-slate-400 mb-4 flex items-center gap-2">
          <Lock size={16} /> Change Password
        </h2>
        <div className="space-y-4">
          <input
            type="password"
            placeholder="New Password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full p-4 rounded-xl bg-slate-100 dark:bg-slate-800 outline-none focus:ring-2 focus:ring-blue-600 dark:text-white"
          />
          <input
            type="password"
            placeholder="Confirm New Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full p-4 rounded-xl bg-slate-100 dark:bg-slate-800 outline-none focus:ring-2 focus:ring-blue-600 dark:text-white"
          />
          <button
            onClick={handleChangePassword}
            disabled={isChangingPassword}
            className="flex items-center gap-2 px-6 py-3 bg-slate-900 dark:bg-white dark:text-slate-900 text-white rounded-xl font-black text-sm hover:opacity-90 transition-all active:scale-95 disabled:opacity-50"
          >
            {isChangingPassword ? <Loader2 size={16} className="animate-spin" /> : <Lock size={16} />}
            UPDATE PASSWORD
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
