import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { ShoppingCart, User, Menu, X, LogOut } from 'lucide-react';

interface NavbarProps {
  user: { name: string } | null;
  onLogout: () => void;
  cartItemCount: number;
  onCartOpen: () => void;
  onShopClick?: () => void;
  onAboutClick?: () => void;
  themeElement?: React.ReactNode; 
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
    <header className="sticky top-0 z-[100] w-full backdrop-blur-xl bg-[#020617]/90 border-b border-white/10 shadow-2xl">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        
        {/* LOGO SECTION */}
        <Link to="/" className="flex items-center gap-3">
          <div className="bg-gradient-to-br from-blue-500 to-cyan-400 text-white px-4 py-2 rounded-2xl font-black text-lg shadow-lg">
            XOB
          </div>
          <div className="flex flex-col">
            <h1 className="text-xl sm:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300 leading-tight">
              X ONE BOUTIQUE
            </h1>
            <p className="text-[10px] text-blue-300/60 tracking-[0.2em] font-bold uppercase">Redefining Fashion</p>
          </div>
        </Link>

        {/* DESKTOP MENU - No borders, just clean links */}
        <nav className="hidden lg:flex items-center gap-10 text-slate-200 font-bold text-sm uppercase tracking-widest">
          <button onClick={() => handleNavClick(onShopClick)} className="hover:text-blue-400 transition">Shop</button>
          <button onClick={() => handleNavClick(onAboutClick)} className="hover:text-blue-400 transition">About</button>
          <button onClick={() => handleNavClick(undefined, "contact")} className="hover:text-blue-400 transition">Contact</button>
          
          {/* THEME TOGGLE (Normal Link Look) */}
          <div className="hover:text-blue-400 transition cursor-pointer">
            {themeElement}
          </div>
        </nav>

        {/* RIGHT ACTIONS */}
        <div className="flex items-center gap-3">
          <button onClick={onCartOpen} className="relative p-3 bg-blue-600/20 rounded-full text-blue-400 hover:bg-blue-600 hover:text-white transition-all">
            <ShoppingCart size={24} />
            {cartItemCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full border-2 border-[#020617]">
                {cartItemCount}
              </span>
            )}
          </button>

          {user ? (
            <div className="hidden sm:flex items-center gap-4 bg-white/5 px-4 py-2 rounded-xl border border-white/10">
              <div className="flex flex-col items-end leading-tight">
                <span className="text-[10px] text-blue-400 font-bold uppercase tracking-tighter">Welcome</span>
                <span className="text-sm text-white font-black truncate max-w-[100px]">{user.name}</span>
              </div>
              <button onClick={onLogout} className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all">
                <LogOut size={20} />
              </button>
            </div>
          ) : (
            <Link to="/login" className="hidden sm:flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-2.5 rounded-xl font-bold hover:scale-105 transition shadow-lg">
              <User size={20} /> Sign In
            </Link>
          )}

          <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="lg:hidden p-2 text-blue-400 bg-blue-400/10 rounded-lg">
            {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </div>

      {/* MOBILE DROPDOWN MENU */}
      {isMenuOpen && (
        <div className="lg:hidden absolute top-full left-0 w-full bg-[#020617] border-b border-white/10 p-6 flex flex-col gap-6 shadow-2xl animate-in slide-in-from-top duration-300">
          <button onClick={() => handleNavClick(onShopClick)} className="text-xl font-bold text-slate-200 text-left border-l-4 border-blue-500 pl-4">Shop Collection</button>
          <button onClick={() => handleNavClick(onAboutClick)} className="text-xl font-bold text-slate-200 text-left border-l-4 border-transparent pl-4">About Brand</button>
          <button onClick={() => handleNavClick(undefined, "contact")} className="text-xl font-bold text-slate-200 text-left border-l-4 border-transparent pl-4">Contact Us</button>
          
          {/* MOBILE THEME TOGGLE (Clean look) */}
          <div className="text-xl font-bold text-slate-200 text-left border-l-4 border-transparent pl-4">
             {themeElement}
          </div>

          {user ? (
            <div className="flex items-center justify-between bg-white/5 p-4 rounded-xl border border-white/10">
              <div>
                <p className="text-[10px] text-blue-400 font-bold uppercase">Logged in as</p>
                <p className="text-lg font-bold text-white">{user.name}</p>
              </div>
              <button onClick={() => { onLogout(); setIsMenuOpen(false); }} className="flex items-center gap-2 bg-red-500/10 text-red-500 px-4 py-2 rounded-lg font-bold">
                Logout <LogOut size={18} />
              </button>
            </div>
          ) : (
            <Link to="/login" onClick={() => setIsMenuOpen(false)} className="w-full text-center bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 rounded-xl font-bold text-lg shadow-xl">
               👤 Sign In / Register
            </Link>
          )}
        </div>
      )}
    </header>
  );
};

export default Navbar;