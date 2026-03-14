import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { ShoppingCart, User, Menu, X, LogOut, Home, ShoppingBag, Info, Phone, ChevronRight, Heart, UserCircle } from "lucide-react";
import { useWishlist } from "../App";

interface NavbarProps {
  user: any;
  onLogout: () => void;
  cartItemCount: number;
  onCartOpen: () => void;
  onShopClick: () => void;
  onAboutClick: () => void;
  themeElement: React.ReactNode;
}

const NAV_LINKS = [
  { label: "Home",    to: "/",        icon: Home },
  { label: "Shop",    to: "/shop",    icon: ShoppingBag },
  { label: "About",   to: "/about",   icon: Info },
  { label: "Contact", to: "/contact", icon: Phone },
];

const Navbar = ({
  user, onLogout, cartItemCount, onCartOpen, themeElement,
}: NavbarProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled,   setScrolled]   = useState(false);
  const navigate  = useNavigate();
  const location  = useLocation();
  const { wishlistCount } = useWishlist();

  // close menu on route change
  useEffect(() => { setIsMenuOpen(false); }, [location.pathname]);

  // scroll shadow
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  const isActive = (to: string) =>
    to === "/" ? location.pathname === "/" : location.pathname.startsWith(to);

  return (
    <>
      <style>{`
        .xnav-link {
          position: relative;
          transition: color .18s ease;
        }
        .xnav-link::after {
          content: '';
          position: absolute;
          bottom: -2px; left: 0;
          width: 0; height: 2px;
          background: #2563eb;
          border-radius: 2px;
          transition: width .25s ease;
        }
        .xnav-link:hover::after,
        .xnav-link.active::after { width: 100%; }
        .xnav-link:hover { color: #2563eb !important; }
        .xnav-link.active { color: #2563eb !important; }

        @keyframes mobileIn {
          from { opacity:0; transform:translateY(-12px); }
          to   { opacity:1; transform:translateY(0); }
        }
        .mobile-menu { animation: mobileIn .22s ease both; }
      `}</style>

      <header
        className="sticky top-0 z-[100] w-full transition-all duration-300"
        style={{
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          background: scrolled
            ? "rgba(255,255,255,.95)"
            : "rgba(255,255,255,.88)",
          borderBottom: "1px solid rgba(37,99,235,.1)",
          boxShadow: scrolled ? "0 4px 24px rgba(0,0,0,.07)" : "none",
        }}
      >
        <style>{`
          .dark header {
            background: ${scrolled ? "rgba(2,6,23,.97)" : "rgba(2,6,23,.92)"} !important;
            border-bottom-color: rgba(37,99,235,.15) !important;
          }
        `}</style>

        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">

          {/* ── LOGO ── */}
          <Link to="/" className="flex items-center gap-3 group flex-shrink-0">
            <div
              className="text-white px-3.5 py-2 rounded-xl font-black text-lg shadow-lg transition-transform group-hover:scale-105"
              style={{ background: "linear-gradient(135deg,#2563eb,#4f46e5)", boxShadow: "0 4px 16px rgba(37,99,235,.4)" }}
            >
              XOB
            </div>
            <div className="flex flex-col">
              <h1 className="text-lg sm:text-xl font-black tracking-tight text-slate-900 dark:text-white leading-none">
                X ONE <span className="text-blue-600">BOUTIQUE</span>
              </h1>
              <p className="text-[9px] text-blue-400 font-bold uppercase tracking-[0.2em]">
                Premium Collection
              </p>
            </div>
          </Link>

          {/* ── DESKTOP NAV ── */}
          <nav className="hidden lg:flex items-center gap-8">
            {NAV_LINKS.map(({ label, to }) => (
              <Link
                key={to}
                to={to}
                className={`xnav-link text-sm font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 ${isActive(to) ? "active" : ""}`}
              >
                {label}
              </Link>
            ))}
            <div className="flex items-center border-l border-slate-200 dark:border-slate-700 pl-6">
              {themeElement}
            </div>
          </nav>

          {/* ── RIGHT ACTIONS ── */}
          <div className="flex items-center gap-2.5">
            {/* Cart */}
            <button
              onClick={onCartOpen}
              aria-label="Open cart"
              className="relative p-2.5 rounded-full transition-all"
              style={{ background: "rgba(37,99,235,.08)", color: "#2563eb" }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.background = "#2563eb";
                (e.currentTarget as HTMLElement).style.color = "#fff";
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.background = "rgba(37,99,235,.08)";
                (e.currentTarget as HTMLElement).style.color = "#2563eb";
              }}
            >
              <ShoppingCart size={20} strokeWidth={2.5} />
              {cartItemCount > 0 && (
                <span
                  className="absolute -top-1 -right-1 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full border-2 border-white dark:border-[#020617]"
                  style={{ background: "#2563eb", minWidth: "18px", textAlign: "center" }}
                >
                  {cartItemCount > 99 ? "99+" : cartItemCount}
                </span>
              )}
            </button>

            {/* Wishlist */}
            <Link
              to="/wishlist"
              aria-label="Wishlist"
              className="relative p-2.5 rounded-full transition-all"
              style={{ background: "rgba(239,68,68,.08)", color: "#ef4444" }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.background = "#ef4444";
                (e.currentTarget as HTMLElement).style.color = "#fff";
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.background = "rgba(239,68,68,.08)";
                (e.currentTarget as HTMLElement).style.color = "#ef4444";
              }}
            >
              <Heart size={20} strokeWidth={2.5} />
              {wishlistCount > 0 && (
                <span
                  className="absolute -top-1 -right-1 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full border-2 border-white dark:border-[#020617]"
                  style={{ background: "#ef4444", minWidth: "18px", textAlign: "center" }}
                >
                  {wishlistCount > 99 ? "99+" : wishlistCount}
                </span>
              )}
            </Link>

            {/* User — desktop */}
            {user ? (
              <div className="hidden sm:flex items-center gap-2">
                {/* Profile pill */}
                <Link
                  to="/profile"
                  className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-full border border-blue-100 dark:border-blue-900/30 bg-slate-50 dark:bg-white/5 hover:border-blue-400 dark:hover:border-blue-500 transition-all group"
                  style={{ textDecoration: "none" }}
                >
                  {/* Avatar */}
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center text-white font-black text-xs flex-shrink-0 group-hover:scale-110 transition-transform"
                    style={{ background: "linear-gradient(135deg,#2563eb,#4f46e5)" }}
                  >
                    {user.name?.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex flex-col leading-none">
                    <span className="text-[9px] text-blue-500 font-black uppercase">
                      {user.role === "admin" ? "Admin" : "My Profile"}
                    </span>
                    <span className="text-sm font-bold text-slate-900 dark:text-white max-w-[90px] truncate">
                      {user.name}
                    </span>
                  </div>
                </Link>
                {/* Logout button separate */}
                <button
                  onClick={onLogout}
                  aria-label="Logout"
                  className="p-2 rounded-full text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all"
                  title="Logout"
                >
                  <LogOut size={16} />
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="hidden sm:flex items-center gap-2 text-white px-5 py-2.5 rounded-full font-bold text-xs uppercase tracking-widest transition-all hover:opacity-90 active:scale-95"
                style={{ background: "linear-gradient(135deg,#2563eb,#4f46e5)", boxShadow: "0 4px 14px rgba(37,99,235,.4)" }}
              >
                <User size={15} /> Sign In
              </Link>
            )}

            {/* Hamburger */}
            <button
              onClick={() => setIsMenuOpen(p => !p)}
              className="lg:hidden p-2 rounded-xl transition-colors"
              style={{ background: "rgba(37,99,235,.08)", color: "#2563eb" }}
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* ── MOBILE MENU ── */}
        {isMenuOpen && (
          <div
            className="mobile-menu lg:hidden absolute top-full left-0 w-full shadow-2xl"
            style={{
              background: "rgba(255,255,255,.98)",
              backdropFilter: "blur(24px)",
              borderBottom: "1px solid rgba(37,99,235,.1)",
              zIndex: 99,
            }}
          >
            <style>{`.dark .mobile-menu { background: rgba(2,6,23,.98) !important; }`}</style>

            <div style={{ padding: "16px 20px 20px" }}>
              {/* Nav links */}
              <div style={{ display: "flex", flexDirection: "column", gap: "4px", marginBottom: "16px" }}>
                {NAV_LINKS.map(({ label, to, icon: Icon }) => {
                  const active = isActive(to);
                  return (
                    <Link
                      key={to}
                      to={to}
                      onClick={() => setIsMenuOpen(false)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "13px 16px",
                        borderRadius: "14px",
                        textDecoration: "none",
                        background: active ? "rgba(37,99,235,.08)" : "transparent",
                        borderLeft: active ? "3px solid #2563eb" : "3px solid transparent",
                        transition: "all .18s ease",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <Icon size={18} color={active ? "#2563eb" : "#64748b"} />
                        <span
                          style={{
                            fontSize: "15px",
                            fontWeight: 700,
                            color: active ? "#2563eb" : undefined,
                          }}
                          className={active ? "" : "text-slate-700 dark:text-slate-200"}
                        >
                          {label}
                        </span>
                      </div>
                      <ChevronRight size={16} color="#94a3b8" />
                    </Link>
                  );
                })}
              </div>


              {/* Wishlist mobile */}
              <Link
                to="/wishlist"
                onClick={() => setIsMenuOpen(false)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "13px 16px",
                  borderRadius: "14px",
                  textDecoration: "none",
                  background: "transparent",
                  borderLeft: "3px solid transparent",
                  transition: "all .18s ease",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <Heart size={18} color="#ef4444" />
                  <span className="text-slate-700 dark:text-slate-200" style={{ fontSize: "15px", fontWeight: 700 }}>
                    Wishlist
                  </span>
                  {wishlistCount > 0 && (
                    <span style={{ background: "#ef4444", color: "#fff", fontSize: "10px", fontWeight: 800, padding: "2px 7px", borderRadius: "20px" }}>
                      {wishlistCount}
                    </span>
                  )}
                </div>
                <ChevronRight size={16} color="#94a3b8" />
              </Link>

              {/* Divider */}
              <div style={{ height: "1px", background: "rgba(15,23,42,.07)", margin: "4px 0 14px" }} />

              {/* Theme toggle row */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "12px 16px",
                  borderRadius: "14px",
                  background: "rgba(37,99,235,.05)",
                  marginBottom: "12px",
                }}
              >
                <span style={{ fontSize: "12px", fontWeight: 800, color: "#2563eb", textTransform: "uppercase", letterSpacing: "0.1em" }}>
                  Appearance
                </span>
                {themeElement}
              </div>

              {/* User section */}
              {user ? (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "14px 16px",
                    borderRadius: "14px",
                    border: "1px solid rgba(37,99,235,.12)",
                  }}
                  className="bg-slate-50 dark:bg-white/5"
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <div
                      style={{
                        width: "36px", height: "36px", borderRadius: "12px",
                        background: "linear-gradient(135deg,#2563eb,#4f46e5)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        color: "#fff", fontWeight: 900, fontSize: "14px",
                      }}
                    >
                      {user.name?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p style={{ fontSize: "10px", color: "#3b82f6", fontWeight: 800, textTransform: "uppercase" }}>
                        {user.role === "admin" ? "Admin" : "My Account"}
                      </p>
                      <p className="text-slate-900 dark:text-white" style={{ fontSize: "14px", fontWeight: 700 }}>
                        {user.name}
                      </p>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: "8px" }}>
                    <Link
                      to="/profile"
                      onClick={() => setIsMenuOpen(false)}
                      style={{
                        padding: "8px 12px", borderRadius: "10px",
                        background: "rgba(37,99,235,.1)", color: "#2563eb",
                        fontSize: "11px", fontWeight: 700, textDecoration: "none",
                      }}
                    >
                      Profile
                    </Link>
                    <button
                      onClick={() => { onLogout(); setIsMenuOpen(false); }}
                      style={{
                        padding: "8px 12px", borderRadius: "10px",
                        background: "rgba(239,68,68,.1)", color: "#ef4444",
                        fontSize: "11px", fontWeight: 700, border: "none", cursor: "pointer",
                        fontFamily: "inherit",
                      }}
                    >
                      Logout
                    </button>
                  </div>
                </div>
              ) : (
                <Link
                  to="/login"
                  onClick={() => setIsMenuOpen(false)}
                  style={{
                    display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
                    width: "100%", padding: "15px",
                    borderRadius: "14px",
                    background: "linear-gradient(135deg,#2563eb,#4f46e5)",
                    color: "#fff", fontWeight: 800, fontSize: "14px",
                    textDecoration: "none", letterSpacing: "0.06em",
                    boxShadow: "0 6px 20px rgba(37,99,235,.4)",
                  }}
                >
                  <User size={16} /> SIGN IN
                </Link>
              )}
            </div>
          </div>
        )}
      </header>
    </>
  );
};

export default Navbar;