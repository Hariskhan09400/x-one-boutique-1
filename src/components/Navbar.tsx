import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { ShoppingCart, User, Menu, X, LogOut } from 'lucide-react';

interface NavbarProps {
  user: any;
  onLogout: () => void;
  cartItemCount: number;
  onCartOpen: () => void;
  onShopClick: () => void;
  onAboutClick: () => void;
  themeElement: React.ReactNode;
}

const Navbar = ({ user, onLogout, cartItemCount, onCartOpen, onShopClick, onAboutClick, themeElement }: NavbarProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleNavClick = (callback?: () => void, targetId?: string) => {
    setIsMenuOpen(false); 
    if (location.pathname !== "/") {
      navigate("/");
      setTimeout(() => {
        if (callback) callback();
        else if (targetId) document.getElementById(targetId)?.scrollIntoView({ behavior: 'smooth' });
      }, 300);
    } else {
      if (callback) callback();
      else if (targetId) document.getElementById(targetId)?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="sticky top-0 z-[100] w-full backdrop-blur-md bg-white/90 dark:bg-[#020617]/95 border-b border-blue-50 dark:border-blue-900/30 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 py-3 sm:py-4 flex items-center justify-between">
        
        {/* ================= LOGO SECTION (ROYAL BLUE UPGRADE) ================= */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="bg-blue-600 text-white px-4 py-2 rounded-xl font-black text-xl shadow-lg shadow-blue-200 dark:shadow-none transition-transform group-hover:scale-105 group-hover:bg-blue-700">
            XOB
          </div>
          <div className="flex flex-col">
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white leading-tight">
              X ONE <span className="text-blue-600">BOUTIQUE</span>
            </h1>
            <p className="text-[10px] text-blue-400 font-bold uppercase tracking-[0.2em]">Premium Collection</p>
          </div>
        </Link>

        {/* ================= DESKTOP MENU (CLEAN BLUE) ================= */}
        <nav className="hidden lg:flex items-center gap-10 text-slate-600 dark:text-slate-300 font-bold text-sm uppercase tracking-wider">
          <button onClick={() => handleNavClick(onShopClick)} className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors relative group">
            Shop
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-600 transition-all group-hover:w-full"></span>
          </button>
          <button onClick={() => handleNavClick(onAboutClick)} className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors relative group">
            About
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-600 transition-all group-hover:w-full"></span>
          </button>
          <button onClick={() => handleNavClick(undefined, "contact")} className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors relative group">
            Contact
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-600 transition-all group-hover:w-full"></span>
          </button>
          
          <div className="flex items-center border-l border-slate-200 dark:border-slate-700 pl-6 ml-2">
            {themeElement}
          </div>
        </nav>

        {/* ================= RIGHT ACTIONS ================= */}
        <div className="flex items-center gap-3">
          <button onClick={onCartOpen} className="relative p-2.5 bg-blue-50 dark:bg-blue-900/20 rounded-full text-blue-600 dark:text-blue-400 hover:bg-blue-600 hover:text-white transition-all">
            <ShoppingCart size={22} strokeWidth={2.5} />
            {cartItemCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full border-2 border-white dark:border-[#020617]">
                {cartItemCount}
              </span>
            )}
          </button>

          {user ? (
            <div className="hidden sm:flex items-center gap-4 bg-slate-50 dark:bg-white/5 px-4 py-1.5 rounded-full border border-blue-100 dark:border-blue-900/30">
              <div className="flex flex-col items-end leading-tight">
                <span className="text-[9px] text-blue-500 font-black uppercase">User</span>
                <span className="text-sm text-slate-900 dark:text-white font-bold truncate max-w-[100px]">{user.name}</span>
              </div>
              <button onClick={onLogout} className="p-1.5 text-slate-400 hover:text-red-500 transition-all">
                <LogOut size={18} />
              </button>
            </div>
          ) : (
            <Link to="/login" className="hidden sm:flex items-center gap-2 bg-blue-600 text-white px-6 py-2.5 rounded-full font-bold text-xs uppercase tracking-widest hover:bg-blue-700 transition-all shadow-md shadow-blue-200 dark:shadow-none">
              <User size={18} /> Sign In
            </Link>
          )}

          <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="lg:hidden p-2 text-blue-600 bg-blue-50 dark:bg-blue-900/20 rounded-lg transition-colors">
            {isMenuOpen ? <X size={26} /> : <Menu size={26} />}
          </button>
        </div>
      </div>

      {/* ================= MOBILE DROPDOWN (CLEAN BLUE) ================= */}
      {isMenuOpen && (
        <div className="lg:hidden absolute top-full left-0 w-full bg-white dark:bg-[#020617] border-b border-blue-50 dark:border-blue-900/30 p-6 flex flex-col gap-5 shadow-xl animate-in slide-in-from-top duration-300">
          <button onClick={() => handleNavClick(onShopClick)} className="text-lg font-bold text-slate-800 dark:text-slate-200 text-left border-l-4 border-blue-600 pl-4">Shop Collection</button>
          <button onClick={() => handleNavClick(onAboutClick)} className="text-lg font-bold text-slate-800 dark:text-slate-200 text-left border-l-4 border-transparent pl-4">About XOB</button>
          <button onClick={() => handleNavClick(undefined, "contact")} className="text-lg font-bold text-slate-800 dark:text-slate-200 text-left border-l-4 border-transparent pl-4">Contact</button>
          
          <div className="flex items-center justify-between p-4 bg-blue-50/50 dark:bg-blue-900/10 rounded-xl">
             <span className="text-xs font-bold uppercase text-blue-600">Appearance</span>
             {themeElement}
          </div>

          {user ? (
            <div className="flex items-center justify-between bg-slate-50 dark:bg-white/5 p-4 rounded-xl border border-blue-100 dark:border-blue-900/30">
              <div>
                <p className="text-[10px] text-blue-500 font-black uppercase">Account</p>
                <p className="text-lg font-bold text-slate-900 dark:text-white">{user.name}</p>
              </div>
              <button onClick={() => { onLogout(); setIsMenuOpen(false); }} className="bg-red-50 text-red-500 px-4 py-2 rounded-lg font-bold text-xs uppercase tracking-tighter">
                Logout
              </button>
            </div>
          ) : (
            <Link to="/login" onClick={() => setIsMenuOpen(false)} className="w-full text-center bg-blue-600 text-white py-4 rounded-xl font-bold text-sm uppercase tracking-widest shadow-lg shadow-blue-100 dark:shadow-none">
                Sign In
            </Link>
          )}
        </div>
      )}
    </header>
  );
};

export default Navbar;