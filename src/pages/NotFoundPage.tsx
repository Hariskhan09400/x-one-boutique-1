import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Home, ArrowLeft } from "lucide-react";

const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-slate-950 px-4">
      <div className="text-center max-w-md">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        >
          {/* Giant 404 */}
          <div className="relative mb-6">
            <h1 className="text-[10rem] font-black text-slate-100 dark:text-slate-800 leading-none select-none">
              404
            </h1>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <p className="text-xl font-black uppercase italic text-slate-900 dark:text-white">
                  Page Not Found
                </p>
              </div>
            </div>
          </div>

          <p className="text-slate-400 font-medium mb-2">
            The page you're looking for doesn't exist.
          </p>
          <p className="text-slate-300 dark:text-slate-600 text-sm mb-10">
            It may have been moved or deleted.
          </p>

          <div className="flex gap-3 justify-center">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 px-6 py-3 border-2 border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 rounded-2xl font-black text-sm hover:border-slate-400 transition-all active:scale-95"
            >
              <ArrowLeft size={16} />
              GO BACK
            </button>
            <button
              onClick={() => navigate("/")}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-2xl font-black text-sm hover:bg-blue-700 transition-all active:scale-95"
            >
              <Home size={16} />
              HOME
            </button>
          </div>

          {/* Boutique branding */}
          <p className="mt-12 text-xs font-black uppercase italic text-slate-200 dark:text-slate-800 tracking-widest">
            X ONE BOUTIQUE
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default NotFoundPage;
